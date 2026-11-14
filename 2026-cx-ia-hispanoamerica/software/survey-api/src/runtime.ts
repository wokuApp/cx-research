import {SecretsManagerClient,GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {hkdfSync} from 'node:crypto';
import {z} from 'zod';
import {Privacy} from './privacy';
import {ResearchStore} from './store';

export const required=(name:string):string=>{const value=process.env[name];if(!value)throw new Error(`Missing configuration: ${name}`);return value;};
const secrets=new SecretsManagerClient({maxAttempts:2});
export async function secret(arn:string):Promise<unknown> {
  const result=await secrets.send(new GetSecretValueCommand({SecretId:arn}));
  if(!result.SecretString)throw new Error('Missing secret value');return JSON.parse(result.SecretString);
}
const credentialsSchema=z.object({username:z.string().regex(/^[a-z_]+$/),password:z.string().min(12)});
export async function databasePool(arn:string):Promise<pg.Pool> {
  const credentials=credentialsSchema.parse(await secret(arn));
  return new pg.Pool({host:required('DB_HOST'),port:5432,database:'research',user:credentials.username,password:credentials.password,
    max:1,idleTimeoutMillis:30000,connectionTimeoutMillis:4000,query_timeout:7000,statement_timeout:6000,
    ssl:{rejectUnauthorized:true,ca:readFileSync(new URL('./ca/us-east-1-bundle.pem',import.meta.url),'utf8')},
  });
}
let cached:Promise<ResearchStore>|undefined;
export function runtimeStore():Promise<ResearchStore> {
  if(!cached)cached=(async()=>{
    const [pool,material]=await Promise.all([databasePool(required('DB_SECRET_ARN')),secret(required('PRIVACY_SECRET_ARN'))]);
    const root=z.object({key:z.string().min(64)}).parse(material).key;
    const derive=(purpose:string)=>Buffer.from(hkdfSync('sha256',Buffer.from(root),Buffer.from('woku-research-v1'),Buffer.from(purpose),32));
    const store=new ResearchStore(pool,new Privacy(derive('encryption'),derive('lookup')));
    pool.on('error',()=>{console.error(JSON.stringify({event:'database_pool_error'}));});return store;
  })().catch(error=>{cached=undefined;throw error;});
  return cached;
}
