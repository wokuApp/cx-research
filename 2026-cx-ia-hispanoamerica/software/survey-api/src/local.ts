import {createServer} from 'node:http';
import {randomUUID,hkdfSync} from 'node:crypto';
import pg from 'pg';
import {migrate} from './migrate';
import {Privacy} from './privacy';
import {ResearchStore} from './store';
import {createHandler} from './http';
import {changeStudyState} from './admin-actions';

// Deliberately refuses cloud addresses and databases that could be production.
const url=new URL(process.env.TEST_DATABASE_URL??'postgresql://research_test:local-test-only@127.0.0.1:55432/research_test');
if(url.hostname!=='127.0.0.1'||url.pathname!=='/research_test')throw new Error('The local adapter only accepts 127.0.0.1/research_test');
const pool=new pg.Pool({connectionString:url.href,max:5});
await migrate(pool);
if(process.env.OPEN_LOCAL_PILOT==='true')await changeStudyState(pool,{action:'set-state',phase:'pilot',paused:false,reason:'Local development data only'},'local-start');
const derive=(purpose:string)=>Buffer.from(hkdfSync('sha256',Buffer.from('local-development-only-not-for-real-data'),Buffer.from('research-local'),Buffer.from(purpose),32));
const handle=createHandler(new ResearchStore(pool,new Privacy(derive('encryption'),derive('lookup'))),{allowedOrigin:'http://127.0.0.1:5182',log:entry=>console.log(JSON.stringify(entry))});
const server=createServer(async(req,res)=>{
  let body='';let bytes=0;
  for await(const chunk of req){bytes+=chunk.length;if(bytes>32768){res.writeHead(413);res.end();return;}body+=chunk;}
  try {
    const result=await handle({path:new URL(req.url??'/','http://127.0.0.1').pathname,httpMethod:req.method??'GET',headers:Object.fromEntries(Object.entries(req.headers).map(([k,v])=>[k,Array.isArray(v)?v.join(','):v])),body:body||null,isBase64Encoded:false,requestContext:{identity:{sourceIp:req.socket.remoteAddress??'127.0.0.1'},requestId:randomUUID()}});
    res.writeHead(result.statusCode,result.headers);res.end(result.body);
  }catch{res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({code:'unavailable',message:'No disponible.'}));}
});
server.listen(5130,'127.0.0.1',()=>console.log('Local research API: http://127.0.0.1:5130; no SES sender is running.'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.close(()=>{void pool.end().then(()=>process.exit(0));});});
