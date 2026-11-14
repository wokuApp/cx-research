import type {Context} from 'aws-lambda';
import {z} from 'zod';
import {databasePool,required,secret} from './runtime';
import {migrate} from './migrate';
import {provisionRoles} from './roles';
import {changeStudyState,changeInstrumentVersion} from './admin-actions';
import {DomainError} from './errors';
import {resetProductionTrial} from './reset-trial';
const migrateCommand=z.strictObject({action:z.literal('migrate')});
const statusCommand=z.strictObject({action:z.literal('status')});
// No API Gateway route or function URL. The operator needs explicit IAM InvokeFunction permission.
export const handler=async(input:unknown,context:Context):Promise<unknown>=>{
  const pool=await databasePool(required('DB_SECRET_ARN'));
  try {
    if(input&&typeof input==='object'&&'action' in input&&input.action==='set-instrument-version')return await changeInstrumentVersion(pool,input,context.awsRequestId);
    if(input&&typeof input==='object'&&'action' in input&&input.action==='reset-production-trial') {
      if(process.env.TRIAL_RESET_ENABLED!=='true')throw new DomainError('reset_disabled',403);
      return await resetProductionTrial(pool,input,context.awsRequestId);
    }
    if(migrateCommand.safeParse(input).success) {
      await migrate(pool);
      const [api,mail]=await Promise.all([secret(required('API_SECRET_ARN')),secret(required('MAIL_SECRET_ARN'))]);
      const password=z.object({password:z.string().min(12)});
      await provisionRoles(pool,{api:password.parse(api).password,mail:password.parse(mail).password});
      return {migrated:true};
    }
    if(statusCommand.safeParse(input).success) {
      const [state,mail]=await Promise.all([pool.query('SELECT phase,manual_paused,completed,pilot_completed,instrument_version FROM research.study_state'),pool.query('SELECT state,count(*)::int AS count FROM research.mail_outbox GROUP BY state')]);
      return {study:state.rows,mail:mail.rows};
    }
    return await changeStudyState(pool,input,context.awsRequestId);
  }catch(error){
    if(error instanceof DomainError)return {error:error.code};
    console.error(JSON.stringify({event:'administration_failed',requestId:context.awsRequestId}));
    throw new Error('Administration failed; inspect configuration and migration checksums.');
  }finally{await pool.end();}
};
