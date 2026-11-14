import { z } from 'zod';
import {statusSchema,emailStatusSchema,receiptSchema,apiErrorSchema,type SurveyStatus,type EmailStatus,type Receipt} from './contracts';
import {emailSchema,submissionSchema,type Submission} from '../lib/survey';
export class SurveyApiError extends Error { constructor(public code:string,message:string){super(message);} }
const request = async <T>(path:string,schema:z.ZodType<T>,body?:unknown):Promise<T>=>{
 const response=await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/survey/${path}`,{method:body===undefined?'GET':'POST',headers:body===undefined?undefined:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(10000)});
 const data:unknown=await response.json();
 if(!response.ok){const error=apiErrorSchema.safeParse(data);throw new SurveyApiError(error.success?error.data.code:'request_failed',error.success?error.data.message:'Request failed');}
 const parsed=schema.safeParse(data);if(!parsed.success)throw new SurveyApiError('invalid_response','Invalid API response');return parsed.data;
};
export const fetchSurveyStatus=():Promise<SurveyStatus>=>request('status',statusSchema);
export const fetchEmailStatus=(email:string):Promise<EmailStatus>=>request('email-status',emailStatusSchema,{email:emailSchema.parse(email)});
export const submitSurvey=(payload:Submission):Promise<Receipt>=>request('responses',receiptSchema,submissionSchema.parse(payload));
export const resendVerification=(email:string):Promise<EmailStatus>=>request('resend-verification',emailStatusSchema,{email:emailSchema.parse(email)});
export const verifyEmail=(token:string):Promise<{verified:true}>=>request('verify',z.strictObject({verified:z.literal(true)}),{token});
