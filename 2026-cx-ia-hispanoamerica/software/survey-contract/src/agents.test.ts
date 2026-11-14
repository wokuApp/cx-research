import {describe,it,expect} from 'vitest';
import {getSteps,submissionSchema,stepSchema,updateAnswer,restoreDraft,type Answers} from './survey';
const profile:Answers={Q01:'Example',Q02:'CL',Q03:'1',Q04:'1',Q05:'1',Q06:'1',Q07:'0',Q08:['NONE'],Q14:['NONE'],Q15:'5'};
const payload=(answers:object)=>({version:'0.6',email:'test@example.com',consent:true,locale:'es',pilot:false,submissionId:'123e4567-e89b-42d3-a456-426614174000',submittedAt:'2026-11-14T00:00:00.000Z',emailVerified:false,answers});
describe('agent implementation and conditional narrative',()=>{
 it('adds exactly one step for all eligible respondents, including non-users',()=>{
  const steps=getSteps(profile);expect(steps).toContain('Q16');expect(steps).not.toContain('Q16D');
  expect(steps.indexOf('Q16')).toBe(steps.indexOf('Q15')+1);
  expect(getSteps({Q01:'Outside',Q02:'OT'})).not.toContain('Q16');
 });
 it('distinguishes experience, implementation and future intention without requiring a narrative',()=>{
  for(const stage of ['1','2','3','NONE','DK'])expect(submissionSchema.safeParse(payload({...profile,Q16:stage})).success).toBe(true);
  expect(submissionSchema.safeParse(payload(profile)).success).toBe(false);
 });
 it('accepts a bounded optional narrative only for the three relevant stages',()=>{
  for(const stage of ['1','2','3'])expect(submissionSchema.safeParse(payload({...profile,Q16:stage,Q16D:'Caso de soporte y derivación humana.'})).success).toBe(true);
  for(const stage of ['NONE','DK'])expect(submissionSchema.safeParse(payload({...profile,Q16:stage,Q16D:'Hidden answer'})).success).toBe(false);
  expect(stepSchema('Q16D',profile).safeParse('x'.repeat(1501)).success).toBe(false);
 });
 it('clears the narrative when its stage changes',()=>{
  expect(updateAnswer({...profile,Q16:'1',Q16D:'Previous outcome'},'Q16','3').Q16D).toBeUndefined();
 });
 it('preserves old drafts and asks the new step rather than inventing its answer',()=>{
  const draft=restoreDraft({version:'0.5',email:'test@example.com',consent:true,locale:'es',answers:profile,step:'review'});
  expect(draft?.version).toBe('0.6');expect(draft?.answers.Q01).toBe('Example');expect(draft?.answers.Q16).toBeUndefined();expect(draft?.step).toBe('Q16');
 });
});
