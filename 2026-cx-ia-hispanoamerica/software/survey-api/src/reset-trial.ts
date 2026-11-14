import type {Pool} from 'pg';
import {z} from 'zod';
import {DomainError} from './errors';
const command=z.strictObject({action:z.literal('reset-production-trial'),confirmStudy:z.literal('ia-cx-2026'),expectedResponses:z.number().int().min(0).max(10000),reason:z.string().trim().min(10).max(300)});
export async function resetProductionTrial(pool:Pool,input:unknown,requestId:string):Promise<{reset:true;removedResponses:number}> {
 const parsed=command.safeParse(input);if(!parsed.success)throw new DomainError('invalid_payload',400);
 const client=await pool.connect();
 try {
  await client.query('BEGIN');
  const state=await client.query("SELECT phase,manual_paused FROM research.study_state WHERE id='ia-cx-2026' FOR UPDATE");
  if(!state.rowCount)throw new DomainError('study_missing');
  if(!state.rows[0].manual_paused)throw new DomainError('pause_required');
  if(state.rows[0].phase!=='pilot')throw new DomainError('not_trial_phase');
  // Prevent a new worker lease between the safety check and deletion.
  await client.query('LOCK TABLE research.mail_outbox,research.verification_tokens,research.responses,research.contacts,research.rate_limits IN ACCESS EXCLUSIVE MODE');
  const count=Number((await client.query("SELECT count(*) FROM research.responses WHERE study_id='ia-cx-2026'")).rows[0].count);
  if(count!==parsed.data.expectedResponses)throw new DomainError('count_changed');
  const active=await client.query("SELECT 1 FROM research.mail_outbox WHERE state='processing' AND lease_until>now() LIMIT 1");
  if(active.rowCount)throw new DomainError('mail_in_flight');
  await client.query("DELETE FROM research.mail_outbox WHERE contact_id IN (SELECT id FROM research.contacts WHERE study_id='ia-cx-2026')");
  await client.query("DELETE FROM research.verification_tokens WHERE contact_id IN (SELECT id FROM research.contacts WHERE study_id='ia-cx-2026')");
  await client.query("DELETE FROM research.responses WHERE study_id='ia-cx-2026'");
  await client.query("DELETE FROM research.contacts WHERE study_id='ia-cx-2026'");
  await client.query('DELETE FROM research.rate_limits');
  await client.query("UPDATE research.study_state SET completed=0,pilot_completed=0,phase='pilot',manual_paused=true,updated_at=now() WHERE id='ia-cx-2026'");
  await client.query('INSERT INTO research.admin_events(action,reason,request_id) VALUES($1,$2,$3)',[`reset-production-trial:${count}`,parsed.data.reason,requestId]);
  await client.query('COMMIT');return {reset:true,removedResponses:count};
 }catch(error){await client.query('ROLLBACK');throw error;}
 finally{client.release();}
}
