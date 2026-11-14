import {afterAll,beforeAll,beforeEach,describe,it,expect} from 'vitest';
import pg from 'pg';
import {randomUUID,randomBytes} from 'node:crypto';
import {migrate} from '../src/migrate';
import {resetProductionTrial} from '../src/reset-trial';
import {ResearchStore} from '../src/store';
import {Privacy} from '../src/privacy';
const url=process.env.TEST_DATABASE_URL;
if(!url||new URL(url).hostname!=='127.0.0.1'||new URL(url).pathname!=='/research_test')throw new Error('Isolated test DB required');
const pool=new pg.Pool({connectionString:url});
const store=new ResearchStore(pool,new Privacy(randomBytes(32),randomBytes(32)));
const command={action:'reset-production-trial',confirmStudy:'ia-cx-2026',expectedResponses:1,reason:'Initial production test completed'};
beforeAll(()=>migrate(pool));
beforeEach(async()=>{
 await pool.query('TRUNCATE research.mail_outbox,research.verification_tokens,research.responses,research.contacts,research.rate_limits,research.admin_events CASCADE');
 await pool.query("UPDATE research.study_state SET phase='pilot',manual_paused=false,completed=0,pilot_completed=0");
 await store.submit({version:'0.6',email:`trial-${randomUUID()}@example.com`,consent:true,locale:'es',pilot:true,submissionId:randomUUID(),submittedAt:new Date().toISOString(),emailVerified:false,answers:{Q01:'Trial company',Q02:'CL',Q03:'1',Q04:'1',Q05:'1',Q06:'1',Q07:'0',Q08:['NONE'],Q14:['NONE'],Q15:'5',Q16:'NONE',P01:'5',P02:''}});
});
afterAll(()=>pool.end());
describe('explicit production trial reset',()=>{
 it('cannot reset while reception is open',async()=>{
  await expect(resetProductionTrial(pool,command,'request')).rejects.toMatchObject({code:'pause_required'});
  expect((await store.status()).completed).toBe(1);
 });
 it('requires the study confirmation and exact reviewed response count',async()=>{
  await pool.query('UPDATE research.study_state SET manual_paused=true');
  await expect(resetProductionTrial(pool,{...command,confirmStudy:'woku-prod'},'request')).rejects.toMatchObject({code:'invalid_payload'});
  await expect(resetProductionTrial(pool,{...command,expectedResponses:0},'request')).rejects.toMatchObject({code:'count_changed'});
  expect((await pool.query('SELECT count(*) FROM research.responses')).rows[0].count).toBe('1');
 });
 it('cannot reset with a mail worker holding a live lease',async()=>{
  await store.claimMail(1);await pool.query('UPDATE research.study_state SET manual_paused=true');
  await expect(resetProductionTrial(pool,command,'request')).rejects.toMatchObject({code:'mail_in_flight'});
 });
 it('clears only survey records, preserves schema/audit and returns to a paused pilot',async()=>{
  await pool.query('UPDATE research.study_state SET manual_paused=true');
  await pool.query("INSERT INTO research.admin_events(action,reason,request_id) VALUES('previous','Previous operator action','previous')");
  const result=await resetProductionTrial(pool,command,'reset-request');
  expect(result).toMatchObject({reset:true,removedResponses:1});
  expect(await store.status()).toMatchObject({phase:'pilot',completed:0,paused:true});
  for(const table of ['responses','contacts','verification_tokens','mail_outbox','rate_limits'])expect((await pool.query(`SELECT count(*) FROM research.${table}`)).rows[0].count).toBe('0');
  expect((await pool.query('SELECT count(*) FROM research.schema_migrations')).rows[0].count).toBe('1');
  expect((await pool.query('SELECT count(*) FROM research.admin_events')).rows[0].count).toBe('2');
 });
});
