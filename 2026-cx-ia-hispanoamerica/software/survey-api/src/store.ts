import type {Pool,PoolClient} from 'pg';
import {randomUUID} from 'node:crypto';
import {acceptedSubmissionSchema,canonicalEmail,screenOutAt} from '@woku-research/contracts';
import type {Receipt,SurveyStatus,EmailStatus} from '@woku-research/contracts/api';
import {Privacy,fingerprint,newToken,tokenDigest} from './privacy';
import {DomainError} from './errors';
import type {Route} from './http';

const STUDY='ia-cx-2026';
interface State {phase:'pilot'|'main';manual_paused:boolean;completed:number;pilot_completed:number;instrument_version:string;}
interface Contact {id:string;verified_at:Date|null;last_mail_at:Date|null;}
export interface MailJob {id:string;lease:string;email:string;token:string;}
const stateStatus=(s:State):SurveyStatus=>({phase:s.phase,paused:s.manual_paused||(s.phase==='pilot'&&s.pilot_completed>=50),completed:s.completed,pilotLimit:50,pilotQuestions:s.phase==='pilot',reason:s.manual_paused?'manual':s.phase==='pilot'&&s.pilot_completed>=50?'pilot_limit':null});
const emailState=(row:Contact|undefined):EmailStatus=>({state:row?row.verified_at?'answered_verified':'answered_pending':'available',simulated:false});
export class ResearchStore {
  constructor(private readonly pool:Pool,private readonly privacy:Privacy) {}
  private async transaction<T>(action:(client:PoolClient)=>Promise<T>):Promise<T> {
    const client=await this.pool.connect();
    try {await client.query('BEGIN');const result=await action(client);await client.query('COMMIT');return result;}
    catch(error) {await client.query('ROLLBACK');throw error;}
    finally {client.release();}
  }
  private async state(client:Pool|PoolClient,lock=false):Promise<State> {
    const result=await client.query<State>(`SELECT * FROM research.study_state WHERE id=$1${lock?' FOR UPDATE':''}`,[STUDY]);
    if(!result.rowCount) throw new DomainError('unavailable',503);return result.rows[0];
  }
  async status():Promise<SurveyStatus> {return stateStatus(await this.state(this.pool));}
  private async queueVerification(client:PoolClient,contactId:string):Promise<void> {
    const token=newToken();const digest=tokenDigest(token);const id=randomUUID();
    await client.query("INSERT INTO research.verification_tokens(digest,contact_id,expires_at) VALUES($1,$2,now()+interval '24 hours')",[digest,contactId]);
    await client.query('INSERT INTO research.mail_outbox(id,contact_id,token_digest,token_ciphertext) VALUES($1,$2,$3,$4)',[id,contactId,digest,this.privacy.seal(token,`mail:${id}`)]);
    await client.query('UPDATE research.contacts SET last_mail_at=now() WHERE id=$1',[contactId]);
  }
  async submit(input:unknown):Promise<Receipt> {
    const parsed=acceptedSubmissionSchema.safeParse(input);if(!parsed.success)throw new DomainError('invalid_payload',400);
    const p={...parsed.data,email:canonicalEmail(parsed.data.email)};
    const digest=fingerprint(p);
    return this.transaction(async client=>{
      const state=await this.state(client,true);
      const existing=await client.query('SELECT r.payload_digest,c.verified_at FROM research.responses r JOIN research.contacts c ON c.id=r.contact_id WHERE r.id=$1',[p.submissionId]);
      const receipt=(verified=false):Receipt=>({accepted:true,submissionId:p.submissionId,emailVerified:verified,verificationEmail:'queued',status:stateStatus(state)});
      if(existing.rowCount) {if(existing.rows[0].payload_digest!==digest)throw new DomainError('idempotency_conflict');return receipt(!!existing.rows[0].verified_at);}
      if(stateStatus(state).paused)throw new DomainError('paused');
      if(p.version!==state.instrument_version)throw new DomainError('instrument_changed');
      if(p.pilot!==(state.phase==='pilot'))throw new DomainError('pilot_changed');
      const emailKey=this.privacy.emailKey(p.email);
      const duplicate=await client.query('SELECT id FROM research.contacts WHERE study_id=$1 AND email_key=$2',[STUDY,emailKey]);
      if(duplicate.rowCount)throw new DomainError('duplicate');
      const contactId=randomUUID();
      await client.query('INSERT INTO research.contacts(id,study_id,email_key,email_ciphertext) VALUES($1,$2,$3,$4)',[contactId,STUDY,emailKey,this.privacy.seal(p.email,`contact:${contactId}`)]);
      const eligible=!screenOutAt(p.answers);
      await client.query('INSERT INTO research.responses(id,study_id,contact_id,payload_digest,instrument_version,locale,phase,consent,eligible,client_submitted_at,answers) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[p.submissionId,STUDY,contactId,digest,p.version,p.locale,state.phase,true,eligible,p.submittedAt,JSON.stringify(p.answers)]);
      await this.queueVerification(client,contactId);
      if(eligible) {
        const updated=await client.query<State>("UPDATE research.study_state SET completed=completed+1,pilot_completed=pilot_completed+CASE WHEN phase='pilot' THEN 1 ELSE 0 END,updated_at=now() WHERE id=$1 RETURNING *",[STUDY]);
        Object.assign(state,updated.rows[0]);
      }
      return receipt();
    });
  }
  async emailStatus(email:string):Promise<EmailStatus> {
    const key=this.privacy.emailKey(email);
    if(!await this.consumeLimit(`lookup:${key}`,60,3600))throw new DomainError('rate_limited',429);
    const row=await this.pool.query<Contact>('SELECT id,verified_at FROM research.contacts WHERE study_id=$1 AND email_key=$2',[STUDY,key]);
    return emailState(row.rows[0]);
  }
  async resend(email:string):Promise<EmailStatus> {
    const key=this.privacy.emailKey(email);
    return this.transaction(async client=>{
      await this.state(client,true);
      const result=await client.query<Contact>('SELECT id,verified_at,last_mail_at FROM research.contacts WHERE study_id=$1 AND email_key=$2 FOR UPDATE',[STUDY,key]);
      const contact=result.rows[0];if(!contact||contact.verified_at)return emailState(contact);
      // Count accepted replacements only. Old cooldown failures must not lock out participants.
      if(!await this.consumeLimit(`resend-accepted:${key}`,10,86400,client))throw new DomainError('resend_limit',429);
      await client.query('UPDATE research.verification_tokens SET used_at=now() WHERE contact_id=$1 AND used_at IS NULL',[contact.id]);
      await client.query("UPDATE research.mail_outbox SET state='cancelled',token_ciphertext=NULL,completed_at=now() WHERE contact_id=$1 AND state IN ('pending','processing')",[contact.id]);
      await this.queueVerification(client,contact.id);return emailState(contact);
    });
  }
  async verify(token:string):Promise<{verified:true}> {
    if(!/^[A-Za-z0-9_-]{43}$/.test(token))throw new DomainError('invalid_token',400);
    return this.transaction(async client=>{
      // Consistent ordering prevents concurrent tokens for one contact deadlocking.
      await this.state(client,true);
      const result=await client.query("SELECT contact_id FROM research.verification_tokens WHERE digest=$1 AND used_at IS NULL AND expires_at>now() FOR UPDATE",[tokenDigest(token)]);
      if(!result.rowCount)throw new DomainError('invalid_token',400);
      const id=result.rows[0].contact_id;
      await client.query('UPDATE research.contacts SET verified_at=COALESCE(verified_at,now()) WHERE id=$1',[id]);
      await client.query('UPDATE research.verification_tokens SET used_at=now() WHERE contact_id=$1 AND used_at IS NULL',[id]);
      await client.query("UPDATE research.mail_outbox SET state='cancelled',token_ciphertext=NULL,completed_at=now() WHERE contact_id=$1 AND state IN ('pending','processing')",[id]);
      return {verified:true};
    });
  }
  async claimMail(limit:number):Promise<MailJob[]> {
    if(!Number.isInteger(limit)||limit<1||limit>10)throw new Error('Invalid mail batch size');
    return this.transaction(async client=>{
      await client.query("UPDATE research.mail_outbox o SET state='failed',token_ciphertext=NULL,completed_at=now() FROM research.verification_tokens t WHERE o.token_digest=t.digest AND o.state IN ('pending','processing') AND (t.expires_at<=now() OR (o.attempts>=5 AND o.lease_until<=now()))");
      const due=await client.query("SELECT o.id,o.contact_id,o.token_ciphertext,c.email_ciphertext FROM research.mail_outbox o JOIN research.contacts c ON c.id=o.contact_id JOIN research.verification_tokens t ON t.digest=o.token_digest WHERE ((o.state='pending' AND o.available_at<=now()) OR (o.state='processing' AND o.lease_until<=now())) AND o.attempts<5 AND c.verified_at IS NULL AND t.used_at IS NULL AND t.expires_at>now() ORDER BY o.created_at LIMIT $1 FOR UPDATE OF o SKIP LOCKED",[limit]);
      const jobs:MailJob[]=[];
      for(const row of due.rows) {
        const lease=randomUUID();
        await client.query("UPDATE research.mail_outbox SET state='processing',lease_id=$2,lease_until=now()+interval '3 minutes',attempts=attempts+1 WHERE id=$1",[row.id,lease]);
        jobs.push({id:row.id,lease,email:this.privacy.open(row.email_ciphertext,`contact:${row.contact_id}`),token:this.privacy.open(row.token_ciphertext,`mail:${row.id}`)});
      }
      return jobs;
    });
  }
  async completeMail(id:string,lease:string,message:string):Promise<void> {
    await this.pool.query("UPDATE research.mail_outbox SET state='sent',token_ciphertext=NULL,message_id=$3,completed_at=now(),lease_until=NULL WHERE id=$1 AND lease_id=$2 AND state='processing'",[id,lease,message]);
  }
  async mailIsCurrent(id:string,lease:string):Promise<boolean> {
    const result=await this.pool.query("SELECT 1 FROM research.mail_outbox o JOIN research.verification_tokens t ON t.digest=o.token_digest JOIN research.contacts c ON c.id=o.contact_id WHERE o.id=$1 AND o.lease_id=$2 AND o.state='processing' AND t.used_at IS NULL AND t.expires_at>now() AND c.verified_at IS NULL",[id,lease]);
    return !!result.rowCount;
  }
  async failMail(id:string,lease:string):Promise<void> {
    await this.pool.query("UPDATE research.mail_outbox SET state=CASE WHEN attempts>=5 THEN 'failed' ELSE 'pending' END,token_ciphertext=CASE WHEN attempts>=5 THEN NULL ELSE token_ciphertext END,available_at=now()+make_interval(secs=>LEAST(3600,60*power(2,attempts)::integer)),lease_until=NULL WHERE id=$1 AND lease_id=$2 AND state='processing'",[id,lease]);
  }
  async maintenance():Promise<void> {
    await this.pool.query('DELETE FROM research.rate_limits WHERE expires_at<now()');
  }
  private async consumeLimit(key:string,limit:number,seconds:number,client:Pool|PoolClient=this.pool):Promise<boolean> {
    const result=await client.query("INSERT INTO research.rate_limits(key,hits,expires_at) VALUES($1,1,now()+make_interval(secs=>$3)) ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN research.rate_limits.expires_at<=now() THEN 1 ELSE research.rate_limits.hits+1 END,expires_at=CASE WHEN research.rate_limits.expires_at<=now() THEN now()+make_interval(secs=>$3) ELSE research.rate_limits.expires_at END WHERE research.rate_limits.expires_at<=now() OR research.rate_limits.hits<$2 RETURNING hits",[key,limit,seconds]);
    return !!result.rowCount;
  }
  async limit(ip:string,route:Route):Promise<boolean> {
    const day=new Date().toISOString().slice(0,10);const key=this.privacy.originKey(ip,day);
    const thresholds:Record<Route,number>={status:180,'email-status':30,responses:10,'resend-verification':10,verify:30};
    return this.consumeLimit(`origin:${route}:${key}`,thresholds[route],300);
  }
}
