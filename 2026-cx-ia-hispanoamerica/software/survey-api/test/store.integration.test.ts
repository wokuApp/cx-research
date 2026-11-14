import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import pg from 'pg';
import {randomBytes, randomUUID} from 'node:crypto';
import {ResearchStore} from '../src/store';
import {Privacy} from '../src/privacy';
import {migrate} from '../src/migrate';
import type {Submission} from '@woku-research/contracts';
const url=process.env.TEST_DATABASE_URL;
if(!url || new URL(url).hostname!=='127.0.0.1' || new URL(url).pathname!=='/research_test') throw new Error('Tests require the isolated local research_test database');
const pool=new pg.Pool({connectionString:url,max:16});
const privacy=new Privacy(randomBytes(32),randomBytes(32));
const store=new ResearchStore(pool,privacy);
const payload=(overrides:Partial<Submission>={}):Submission=>({
  version:'0.6',email:`test-${randomUUID()}@example.com`,consent:true,locale:'es',pilot:true,
  submissionId:randomUUID(),submittedAt:'2026-11-14T00:00:00.000Z',emailVerified:false,
  answers:{Q01:'Example company',Q02:'CL',Q03:'1',Q04:'1',Q05:'1',Q06:'1',Q07:'0',Q08:['NONE'],Q14:['1'],Q15:'5',Q16:'NONE',P01:'5',P02:''},...overrides,
});
beforeAll(()=>migrate(pool));
beforeEach(async()=>{
  await pool.query('TRUNCATE research.mail_outbox, research.verification_tokens, research.responses, research.contacts, research.rate_limits, research.admin_events RESTART IDENTITY CASCADE');
  await pool.query("UPDATE research.study_state SET phase='pilot', manual_paused=false, completed=0, pilot_completed=0");
});
afterAll(()=>pool.end());
describe('PostgreSQL transactions and privacy',()=>{
  it('preserves legacy receipts but rejects new submissions from the old instrument',async()=>{
    const old={...payload(),version:'0.5'};delete old.answers.Q16;
    await pool.query("UPDATE research.study_state SET instrument_version='0.5'");
    const receipt=await store.submit(old);expect(receipt.accepted).toBe(true);
    await pool.query("UPDATE research.study_state SET instrument_version='0.6'");
    expect((await store.submit(old)).submissionId).toBe(old.submissionId);
    await expect(store.submit({...old,email:'another@example.com',submissionId:randomUUID()})).rejects.toMatchObject({code:'instrument_changed'});
    expect((await pool.query('SELECT instrument_version FROM research.responses')).rows[0].instrument_version).toBe('0.5');
  });
  it('preserves an unverified response and queues verification atomically',async()=>{
    const p=payload(); const receipt=await store.submit(p);
    expect(receipt.accepted).toBe(true); expect(receipt.emailVerified).toBe(false); expect(receipt.status.completed).toBe(1);
    const contacts=await pool.query('SELECT * FROM research.contacts');
    const responses=await pool.query('SELECT * FROM research.responses');
    expect(JSON.stringify([contacts.rows,responses.rows])).not.toContain(p.email);
    expect(responses.rows[0].answers).toEqual(p.answers);
    expect((await pool.query('SELECT count(*) FROM research.mail_outbox')).rows[0].count).toBe('1');
  });
  it('rolls back the entire submission if outbox insertion fails',async()=>{
    await pool.query("ALTER TABLE research.mail_outbox ADD CONSTRAINT test_reject CHECK (false) NOT VALID");
    try {await expect(store.submit(payload())).rejects.toThrow();}
    finally {await pool.query('ALTER TABLE research.mail_outbox DROP CONSTRAINT test_reject');}
    expect((await pool.query('SELECT count(*) FROM research.responses')).rows[0].count).toBe('0');
    expect((await store.status()).completed).toBe(0);
  });
  it('accepts exactly the 50th response under real concurrent transactions',async()=>{
    await pool.query('UPDATE research.study_state SET completed=49, pilot_completed=49');
    const results=await Promise.allSettled(Array.from({length:12},()=>store.submit(payload())));
    expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    for(const r of results) if(r.status==='rejected') expect(r.reason.code).toBe('paused');
    expect(await store.status()).toMatchObject({completed:50,paused:true,reason:'pilot_limit'});
    expect((await pool.query('SELECT count(*) FROM research.responses')).rows[0].count).toBe('1');
  });
  it('retries the same submission once, even after pause, and detects changed content',async()=>{
    const p=payload(); const results=await Promise.all(Array.from({length:6},()=>store.submit(p)));
    expect(results.every(r=>r.submissionId===p.submissionId)).toBe(true);
    expect((await store.status()).completed).toBe(1);
    await pool.query('UPDATE research.study_state SET manual_paused=true');
    expect((await store.submit({...p,answers:Object.fromEntries(Object.entries(p.answers).reverse())})).accepted).toBe(true);
    await expect(store.submit({...p,answers:{...p.answers,Q01:'Changed'}})).rejects.toMatchObject({code:'idempotency_conflict'});
  });
  it('normalizes emails and admits only one response for a concurrent duplicate',async()=>{
    const p=payload({email:' Person@Example.COM '});
    const r=await Promise.allSettled([store.submit(p),store.submit(payload({email:'person@example.com'}))]);
    expect(r.filter(x=>x.status==='fulfilled')).toHaveLength(1);
    expect(await store.emailStatus('PERSON@example.com')).toEqual({state:'answered_pending',simulated:false});
  });
  it('keeps screened-out responses without counting them or forcing pilot answers',async()=>{
    const p=payload({answers:{Q01:'Outside scope',Q02:'OT'}});
    expect((await store.submit(p)).status.completed).toBe(0);
    expect((await pool.query('SELECT eligible FROM research.responses')).rows[0].eligible).toBe(false);
  });
  it('rejects invalid or forged fields and a stale pilot phase',async()=>{
    await expect(store.submit({...payload(),emailVerified:true} as unknown as Submission)).rejects.toMatchObject({code:'invalid_payload'});
    await expect(store.submit({...payload(),answers:{Q01:'Incomplete'}})).rejects.toMatchObject({code:'invalid_payload'});
    await pool.query("UPDATE research.study_state SET phase='main'");
    await expect(store.submit(payload())).rejects.toMatchObject({code:'pilot_changed'});
    const p=payload({pilot:false}); delete p.answers.P01; delete p.answers.P02;
    expect((await store.submit(p)).status.phase).toBe('main');
  });
  it('verifies once, expires tokens, preserves responses and never changes the counter',async()=>{
    const p=payload(); await store.submit(p); const [job]=await store.claimMail(1);
    const persisted=JSON.stringify((await pool.query('SELECT * FROM research.verification_tokens')).rows);
    expect(persisted).not.toContain(job.token);
    expect(await store.verify(job.token)).toEqual({verified:true});
    expect(await store.emailStatus(p.email)).toMatchObject({state:'answered_verified'});
    await expect(store.verify(job.token)).rejects.toMatchObject({code:'invalid_token'});
    expect((await store.status()).completed).toBe(1);
    const second=payload(); await store.submit(second); const [expired]=await store.claimMail(1);
    await pool.query("UPDATE research.verification_tokens SET expires_at=now()-interval '1 minute'");
    await expect(store.verify(expired.token)).rejects.toMatchObject({code:'invalid_token'});
    expect((await pool.query('SELECT count(*) FROM research.responses')).rows[0].count).toBe('2');
  });
  it('resends immediately, revokes the previous token and preserves the answer during pause',async()=>{
    const p=payload();await store.submit(p);const [original]=await store.claimMail(1);
    await store.completeMail(original.id,original.lease,'first-message');
    await pool.query('UPDATE research.study_state SET manual_paused=true');
    expect(await store.resend(p.email)).toMatchObject({state:'answered_pending',simulated:false});
    await expect(store.verify(original.token)).rejects.toMatchObject({code:'invalid_token'});
    const [replacement]=await store.claimMail(1);expect(replacement.token).not.toBe(original.token);
    expect(await store.verify(replacement.token)).toEqual({verified:true});
    expect((await store.status()).completed).toBe(1);
    expect((await pool.query('SELECT count(*) FROM research.responses')).rows[0].count).toBe('1');
  });
  it('cancels queued or leased emails and only the latest concurrent resend stays active',async()=>{
    const p=payload();await store.submit(p);const [original]=await store.claimMail(1);
    const attempts=await Promise.all(Array.from({length:6},()=>store.resend(p.email)));
    expect(attempts.every(r=>r.state==='answered_pending')).toBe(true);
    expect(await store.mailIsCurrent(original.id,original.lease)).toBe(false);
    const queued=await pool.query("SELECT count(*) FROM research.mail_outbox WHERE state='pending'");expect(queued.rows[0].count).toBe('1');
    expect((await pool.query('SELECT count(*) FROM research.verification_tokens WHERE used_at IS NULL')).rows[0].count).toBe('1');
    const [replacement]=await store.claimMail(1);expect(await store.mailIsCurrent(replacement.id,replacement.lease)).toBe(true);
    await store.completeMail(original.id,original.lease,'too-late');
    expect((await pool.query('SELECT state FROM research.mail_outbox WHERE id=$1',[original.id])).rows[0].state).toBe('cancelled');
    await expect(store.verify(original.token)).rejects.toMatchObject({code:'invalid_token'});
    expect(await store.verify(replacement.token)).toEqual({verified:true});
  });
  it('rolls back revocation and quota if replacement cannot be queued',async()=>{
    const p=payload();await store.submit(p);const [original]=await store.claimMail(1);await store.completeMail(original.id,original.lease,'first');
    await pool.query("ALTER TABLE research.mail_outbox ADD CONSTRAINT test_resend_reject CHECK (false) NOT VALID");
    try{await expect(store.resend(p.email)).rejects.toThrow();}finally{await pool.query('ALTER TABLE research.mail_outbox DROP CONSTRAINT test_resend_reject');}
    expect((await pool.query("SELECT count(*) FROM research.rate_limits WHERE key LIKE 'resend-accepted:%'")).rows[0].count).toBe('0');
    expect(await store.verify(original.token)).toEqual({verified:true});
  });
  it('does not inherit previously rejected cooldown attempts and limits accepted replacements only',async()=>{
    const p=payload();await store.submit(p);
    await pool.query("INSERT INTO research.rate_limits(key,hits,expires_at) VALUES($1,5,now()+interval '24 hours')",[`resend:${privacy.emailKey(p.email)}`]);
    for(let i=0;i<10;i++)expect((await store.resend(p.email)).state).toBe('answered_pending');
    await expect(store.resend(p.email)).rejects.toMatchObject({code:'resend_limit'});
    const [latest]=await store.claimMail(1);expect(await store.verify(latest.token)).toEqual({verified:true});
    expect((await store.status()).completed).toBe(1);
  });
  it('uses leases to prevent concurrent sending and recovers expired workers',async()=>{
    await store.submit(payload()); const [a,b]=await Promise.all([store.claimMail(1),store.claimMail(1)]);
    expect(a.length+b.length).toBe(1); const job=[...a,...b][0];
    await pool.query("UPDATE research.mail_outbox SET lease_until=now()-interval '1 second'");
    const [retry]=await store.claimMail(1); expect(retry.id).toBe(job.id); expect(retry.lease).not.toBe(job.lease);
    await store.completeMail(job.id,job.lease,'late');
    expect((await pool.query('SELECT state FROM research.mail_outbox')).rows[0].state).toBe('processing');
    await store.completeMail(retry.id,retry.lease,'ok');
    expect((await pool.query('SELECT state, token_ciphertext FROM research.mail_outbox')).rows[0]).toMatchObject({state:'sent',token_ciphertext:null});
  });
  it('limits public requests atomically without storing clear IPs',async()=>{
    const results=await Promise.all(Array.from({length:15},()=>store.limit('192.0.2.1','responses')));
    expect(results.filter(Boolean)).toHaveLength(10);
    expect(JSON.stringify((await pool.query('SELECT * FROM research.rate_limits')).rows)).not.toContain('192.0.2.1');
  });
  it('starts paused on a new study and keeps migrations repeatable',async()=>{
    await pool.query('DELETE FROM research.study_state'); await migrate(pool);
    expect(await store.status()).toMatchObject({paused:true,reason:'manual'});
    expect((await pool.query('SELECT count(*) FROM research.schema_migrations')).rows[0].count).toBe('1');
  });
});
