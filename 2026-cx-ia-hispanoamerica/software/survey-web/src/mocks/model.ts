import {z} from 'zod';
import {canonicalEmail,screenOutAt,submissionSchema,type Submission} from '../lib/survey';
import type {SurveyStatus,EmailStatus} from '../api/contracts';
const legacyPayloadSchema=z.object({version:z.enum(['0.2','0.3','0.4','0.5']),email:z.string(),submissionId:z.string(),submittedAt:z.string(),emailVerified:z.boolean(),consent:z.boolean(),locale:z.string(),pilot:z.boolean().optional(),answers:z.record(z.string(),z.union([z.string(),z.array(z.string())]))});
const recordSchema=z.object({email:z.string(),submissionId:z.string(),verified:z.boolean(),counted:z.boolean(),payload:z.union([submissionSchema,legacyPayloadSchema])});
export const databaseSchema=z.strictObject({phase:z.enum(['pilot','main']),manualPaused:z.boolean(),completed:z.number().int().min(0).max(100000),failStatus:z.boolean(),emailScenario:z.enum(['stored','verified','pending']),records:z.array(recordSchema).max(1000)});
export type MockDatabase=z.infer<typeof databaseSchema>;
export const initialDatabase:MockDatabase={phase:'pilot',manualPaused:false,completed:0,failStatus:false,emailScenario:'stored',records:[]};
export const getMockStatus=(db:MockDatabase):SurveyStatus=>({phase:db.phase,paused:db.manualPaused||(db.phase==='pilot'&&db.completed>=50),completed:db.completed,pilotLimit:50,pilotQuestions:db.phase==='pilot',reason:db.manualPaused?'manual':db.phase==='pilot'&&db.completed>=50?'pilot_limit':null});
export const lookupEmail=(db:MockDatabase,email:string):EmailStatus=>{
 if(db.emailScenario!=='stored')return {state:db.emailScenario==='verified'?'answered_verified':'answered_pending',simulated:true};
 const row=db.records.find(r=>r.email===canonicalEmail(email));return {state:row?row.verified?'answered_verified':'answered_pending':'available',simulated:true};
};
export const decideSubmission=(database:MockDatabase,payload:Submission):{kind:'accepted'|'paused'|'duplicate'|'pilot_changed'|'invalid';database:MockDatabase}=>{
 const same=database.records.find(r=>r.submissionId===payload.submissionId);
 if(same)return {kind:JSON.stringify(same.payload)===JSON.stringify(payload)?'accepted':'duplicate',database};
 if(getMockStatus(database).paused)return {kind:'paused',database};
 if(lookupEmail(database,payload.email).state!=='available')return {kind:'duplicate',database};
 if(payload.pilot!==(database.phase==='pilot'))return {kind:'pilot_changed',database};
 if(!submissionSchema.safeParse(payload).success)return {kind:'invalid',database};
 const counted=!screenOutAt(payload.answers);
 return {kind:'accepted',database:{...database,completed:database.completed+(counted?1:0),records:[...database.records,{email:canonicalEmail(payload.email),submissionId:payload.submissionId,verified:false,counted,payload}]}};
};
