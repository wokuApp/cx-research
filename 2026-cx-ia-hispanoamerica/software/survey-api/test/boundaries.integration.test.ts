import {afterAll,beforeAll,describe,it,expect} from 'vitest';
import pg from 'pg';
import {randomBytes,randomUUID} from 'node:crypto';
import {migrate} from '../src/migrate';
import {Privacy} from '../src/privacy';
import {ResearchStore} from '../src/store';
import {createHandler} from '../src/http';
const url=process.env.TEST_DATABASE_URL;
if(!url||new URL(url).hostname!=='127.0.0.1'||new URL(url).pathname!=='/research_test')throw new Error('Isolated test DB required');
const pool=new pg.Pool({connectionString:url});
const store=new ResearchStore(pool,new Privacy(randomBytes(32),randomBytes(32)));
const handle=createHandler(store,{allowedOrigin:'https://research.woku.app',log:()=>{}});
const event=(path:string,body:unknown)=>({path:`/api/survey/${path}`,httpMethod:'POST',headers:{origin:'https://research.woku.app','content-type':'application/json'},body:JSON.stringify(body),isBase64Encoded:false,requestContext:{identity:{sourceIp:'192.0.2.8'},requestId:'integration'}});
beforeAll(async()=>{
  await migrate(pool);
  await pool.query('TRUNCATE research.mail_outbox,research.verification_tokens,research.responses,research.contacts,research.rate_limits CASCADE');
  await pool.query("UPDATE research.study_state SET manual_paused=false,phase='pilot',completed=0,pilot_completed=0");
});
afterAll(()=>pool.end());
describe('real HTTP adapter and PostgreSQL together',()=>{
  it('saves through the public adapter and verifies without trusting the client',async()=>{
    const submissionId=randomUUID();const email=`transport-${randomUUID()}@example.com`;
    const response=await handle(event('responses',{version:'0.6',email,consent:true,locale:'es',pilot:true,submissionId,submittedAt:new Date().toISOString(),emailVerified:false,answers:{Q01:"Example'); DROP TABLE research.responses; --",Q02:'OT'}}));
    expect(response.statusCode).toBe(200);expect(JSON.parse(response.body)).toMatchObject({accepted:true,emailVerified:false,submissionId});
    const [job]=await store.claimMail(1);
    expect((await handle(event('verify',{token:job.token}))).statusCode).toBe(200);
    expect(JSON.parse((await handle(event('email-status',{email}))).body).state).toBe('answered_verified');
    expect((await pool.query('SELECT count(*) FROM research.responses')).rows[0].count).toBe('1');
  });
});
