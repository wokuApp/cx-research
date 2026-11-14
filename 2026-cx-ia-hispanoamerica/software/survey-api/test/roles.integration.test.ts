import pg from 'pg';
import {beforeAll,afterAll,describe,it,expect} from 'vitest';
import {migrate} from '../src/migrate';
import {provisionRoles} from '../src/roles';
import {ResearchStore} from '../src/store';
import {Privacy} from '../src/privacy';
import {randomBytes,randomUUID} from 'node:crypto';
const url=process.env.TEST_DATABASE_URL;
if(!url||new URL(url).hostname!=='127.0.0.1'||new URL(url).pathname!=='/research_test')throw new Error('Isolated test DB required');
const admin=new pg.Pool({connectionString:url});
function connect(username:string,password:string):pg.Pool {const u=new URL(url!);u.username=username;u.password=password;return new pg.Pool({connectionString:u.href});}
const api=connect('research_api','api-local-test');const worker=connect('research_mail','mail-local-test');
beforeAll(async()=>{await migrate(admin);await admin.query('TRUNCATE research.mail_outbox,research.verification_tokens,research.responses,research.contacts,research.rate_limits CASCADE');await provisionRoles(admin,{api:'api-local-test',mail:'mail-local-test'});});
afterAll(async()=>{await Promise.all([api.end(),worker.end(),admin.end()]);});
describe('least-privilege database roles',()=>{
  it('does not let either runtime alter tables, grant roles or access administration',async()=>{
    for(const pool of [api,worker]) {
      await expect(pool.query('CREATE TABLE research.forbidden(id int)')).rejects.toMatchObject({code:'42501'});
      await expect(pool.query('SELECT * FROM research.admin_events')).rejects.toMatchObject({code:'42501'});
      await expect(pool.query('CREATE ROLE forbidden_role')).rejects.toMatchObject({code:'42501'});
      await expect(pool.query('DELETE FROM research.responses')).rejects.toMatchObject({code:'42501'});
    }
  });
  it('allows the API to submit, lookup and verify, but forbids administrative pause',async()=>{
    await admin.query("UPDATE research.study_state SET manual_paused=false,phase='pilot',completed=0,pilot_completed=0");
    const privacy=new Privacy(randomBytes(32),randomBytes(32));const store=new ResearchStore(api,privacy);
    const email=`roles-${randomUUID()}@example.com`;
    await store.submit({version:'0.6',email,consent:true,locale:'es',pilot:true,submissionId:randomUUID(),submittedAt:new Date().toISOString(),emailVerified:false,answers:{Q01:'Outside',Q02:'OT'}});
    expect((await store.emailStatus(email)).state).toBe('answered_pending');
    await expect(api.query('UPDATE research.study_state SET manual_paused=false')).rejects.toMatchObject({code:'42501'});
    const workerStore=new ResearchStore(worker,privacy);const jobs=await workerStore.claimMail(10);
    const job=jobs.find(j=>j.email===email)!;expect(job).toBeDefined();
    await workerStore.completeMail(job.id,job.lease,'test');
    await store.resend(email);
    await expect(store.verify(job.token)).rejects.toMatchObject({code:'invalid_token'});
    const [replacement]=await workerStore.claimMail(1);
    expect(await workerStore.mailIsCurrent(replacement.id,replacement.lease)).toBe(true);
    expect(await store.verify(replacement.token)).toEqual({verified:true});
  });
  it('keeps answer access away from the mail worker',async()=>{
    await expect(worker.query('SELECT answers FROM research.responses')).rejects.toMatchObject({code:'42501'});
    await expect(worker.query('UPDATE research.contacts SET verified_at=now()')).rejects.toMatchObject({code:'42501'});
  });
});
