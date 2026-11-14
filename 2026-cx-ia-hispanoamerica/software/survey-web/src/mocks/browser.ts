import {http,HttpResponse} from 'msw';
import {setupWorker} from 'msw/browser';
import {emailSchema,submissionSchema} from '../lib/survey';
import {decideSubmission,getMockStatus,lookupEmail} from './model';
import {readDatabase,writeDatabase} from './database';
const failure=(code:string,message:string,status=400)=>HttpResponse.json({code,message},{status});
const handlers=[
 http.get('*/api/survey/status',()=>{try{const db=readDatabase();if(db.failStatus)return failure('unavailable','Status endpoint unavailable',503);return HttpResponse.json(getMockStatus(db));}catch{return failure('mock_storage_error','Cannot read simulated state',503);}}),
 http.post('*/api/survey/email-status',async({request})=>{try{const body=await request.json() as {email?:unknown};const parsed=emailSchema.safeParse(body.email);if(!parsed.success)return failure('invalid_email','Invalid email');return HttpResponse.json(lookupEmail(readDatabase(),parsed.data));}catch{return failure('invalid_request','Invalid request');}}),
 http.post('*/api/survey/resend-verification',async({request})=>{try{const body=await request.json() as {email?:unknown};const parsed=emailSchema.safeParse(body.email);if(!parsed.success)return failure('invalid_email','Invalid email');return HttpResponse.json(lookupEmail(readDatabase(),parsed.data));}catch{return failure('invalid_request','Invalid request');}}),
 http.post('*/api/survey/responses',async({request})=>{
  try{
   const parsed=submissionSchema.safeParse(await request.json());if(!parsed.success)return failure('invalid_payload','Incomplete or invalid response');
   const result=decideSubmission(readDatabase(),parsed.data);
   if(result.kind==='paused')return failure('paused','Reception is paused',409);
   if(result.kind==='duplicate')return failure('duplicate','Email already answered',409);
   if(result.kind==='pilot_changed')return failure('pilot_changed','Study phase changed; refresh status',409);
   if(result.kind==='invalid')return failure('invalid_payload','Invalid response');
   // No asynchronous gap between the quota decision and write in this local mock.
   writeDatabase(result.database);
   return HttpResponse.json({accepted:true,submissionId:parsed.data.submissionId,emailVerified:false,verificationEmail:'simulated',status:getMockStatus(result.database)});
  }catch{return failure('mock_storage_error','Could not store the simulated response',503);}
 }),
];
export const worker=setupWorker(...handlers);
