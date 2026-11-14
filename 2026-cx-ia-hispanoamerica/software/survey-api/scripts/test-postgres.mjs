import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
const name=`research-tdd-${randomUUID().slice(0,8)}`;
const image=process.env.RESEARCH_TEST_POSTGRES_IMAGE || 'postgres:18-alpine@sha256:1018733457011bf88d81db98cf43aac6d5150afc18787dbe204771fedf80ff95';
const run=(args,options={})=>spawnSync('docker',args,{encoding:'utf8',...options});
let started=false;
try {
  const start=run(['run','--rm','--detach','--name',name,'-e','POSTGRES_USER=research_test','-e','POSTGRES_PASSWORD=local-test-only','-e','POSTGRES_DB=research_test','-p','127.0.0.1::5432',image]);
  if(start.status!==0) throw new Error(start.stderr); started=true;
  for(let i=0;i<40;i++) {
    if(run(['exec',name,'pg_isready','-U','research_test','-d','research_test']).status===0) break;
    if(i===39) throw new Error('Test PostgreSQL did not start');
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  const port=run(['port',name,'5432/tcp']).stdout.trim().split(':').at(-1);
  const result=spawnSync('npx',['vitest','run','test/store.integration.test.ts','test/roles.integration.test.ts','test/boundaries.integration.test.ts','test/reset.integration.test.ts'],{
    stdio:'inherit',env:{...process.env,TEST_DATABASE_URL:`postgresql://research_test:local-test-only@127.0.0.1:${port}/research_test`},
  }); process.exitCode=result.status??1;
} finally { if(started) run(['stop','--time','1',name]); }
