import { describe, expect, it } from 'vitest';
import { emailSchema, submissionSchema, stepSchema, getSteps, updateAnswer, type Answers, restoreDraft } from './survey';
const profile: Answers = { Q01: 'Example company', Q02: 'CL', Q03: '1', Q04: '1', Q05: '1', Q06: '1', Q07: '0', Q08: ['NONE'], Q14: ['1'], Q15: '5', Q16:'NONE' };
const submission = (answers: Answers): unknown => ({ version: '0.6', email: 'person@gmail.com', consent: true, pilot:false, locale: 'es', submissionId: '123e4567-e89b-42d3-a456-426614174000', submittedAt: '2026-11-13T22:00:00.000Z', emailVerified: false, answers });
describe('survey validation and branching', () => {
 it('uses the maximum possible route until the national scope is known',()=>{expect(getSteps({})).toContain('Q02C');expect(getSteps({...profile,Q02:'CL'})).not.toContain('Q02C');});
 it('limits new responses to Spanish-speaking scope and Spanish locale',()=>{
  expect(stepSchema('Q02',{}).safeParse('BR').success).toBe(false);expect(stepSchema('Q02',{}).safeParse('HT').success).toBe(false);
  expect(submissionSchema.safeParse({...submission(profile) as object,locale:'pt'}).success).toBe(false);
 });
 it('preserves a legacy draft while requesting a new geographic scope',()=>{
  const migrated=restoreDraft({version:'0.4',email:'old@example.com',consent:true,locale:'pt',answers:{...profile,Q02:'BR'},step:'Q03'});
  expect(migrated?.email).toBe('old@example.com');expect(migrated?.locale).toBe('es');expect(migrated?.answers.Q02).toBeUndefined();expect(migrated?.answers.Q03).toBeUndefined();
 });
 it('migrates an old draft without reinterpreting old supervision answers as technologies',()=>{
  const draft=restoreDraft({version:'0.2',email:'demo@gmail.com',consent:true,locale:'es',answers:{...profile,Q11:'1'},step:'Q11'});
  expect(draft?.version).toBe('0.6');expect(draft?.email).toBe('demo@gmail.com');expect(draft?.answers.Q11).toBeUndefined();
 });
 it('rejects regional coverage on a national submission',()=>{
  expect(submissionSchema.safeParse(submission({...profile,Q02C:['CL','AR']})).success).toBe(false);
 });
 it('requires coverage for regional responses and rejects one-country coverage', () => {
  expect(getSteps({...profile,Q02:'LATAM'})).toContain('Q02C');
  expect(getSteps(profile)).not.toContain('Q02C');
  expect(stepSchema('Q02C',{Q02:'LATAM'}).safeParse(['CL']).success).toBe(false);
  expect(stepSchema('Q02C',{Q02:'LATAM'}).safeParse(['CL','AR']).success).toBe(true);
  expect(stepSchema('Q02C',{Q02:'LATAM'}).safeParse(['DK']).success).toBe(true);
  expect(submissionSchema.safeParse(submission({...profile,Q02:'LATAM',Q02C:['CL','AR']})).success).toBe(true);
 });
 it('clears scope-dependent answers when national scope becomes regional', () => {
  const result=updateAnswer(profile,'Q02','LATAM');expect(result.Q01).toBe(profile.Q01);expect(result.Q03).toBeUndefined();expect(result.Q08).toBeUndefined();
 });
 it('validates the technology checklist independently of adoption stage',()=>{
  expect(stepSchema('Q07',{}).safeParse('5').success).toBe(true);
  expect(stepSchema('Q11',{}).safeParse(['FLOW','AGENT','VOICE','INTERNAL','HITL']).success).toBe(true);
  expect(stepSchema('Q11',{}).safeParse('1').success).toBe(false);
  expect(stepSchema('Q11',{}).safeParse(['DK','AGENT']).success).toBe(false);
 });
 it('accepts personal emails and rejects malformed input', () => { expect(emailSchema.safeParse(' person@gmail.com ').success).toBe(true); expect(emailSchema.safeParse('not-email').success).toBe(false); });
 it('accepts a full non-user submission without inventing details', () => { expect(submissionSchema.safeParse(submission(profile)).success).toBe(true); });
 it('rejects missing required fields and unknown option codes', () => { expect(submissionSchema.safeParse(submission({ ...profile, Q02: 'XX' })).success).toBe(false); const copy = { ...profile }; delete copy.Q14; expect(submissionSchema.safeParse(submission(copy)).success).toBe(false); });
 it('rejects forged verification and extra payload keys', () => { expect(submissionSchema.safeParse({ ...(submission(profile) as object), emailVerified: true }).success).toBe(false); expect(submissionSchema.safeParse({ ...(submission(profile) as object), admin: true }).success).toBe(false); });
 it('rejects mixed exclusive options, duplicate options, and >3 barriers', () => { expect(stepSchema('Q08', {}).safeParse(['T1', 'NONE']).success).toBe(false); expect(stepSchema('Q08', {}).safeParse(['T1', 'T1']).success).toBe(false); expect(stepSchema('Q14', {}).safeParse(['1','2','3','4']).success).toBe(false); });
 it('skips application detail for non-users and auto-selects one main use', () => { expect(getSteps(profile)).not.toContain('Q10'); const a = updateAnswer(profile, 'Q08', ['T1']); expect(a.Q09).toBe('T1'); expect(getSteps(a)).not.toContain('Q09'); expect(getSteps(a)).toContain('Q10'); });
 it('clears dependent stale answers when usage or main application changes', () => { const a = updateAnswer({ ...profile, Q08: ['T1'], Q09: 'T1', Q10:'3', Q11:['CHAT','PROVIDER','HITL'], Q12:'1', Q13:['2'] }, 'Q08', ['NONE']); expect(a.Q09).toBeUndefined(); expect(a.Q13).toBeUndefined(); });
 it('requires main use to belong to selected recent uses', () => { expect(stepSchema('Q09', { Q08: ['T1','T2'] }).safeParse('T3').success).toBe(false); });
 it('rejects stale hidden answers on final submission', () => { expect(submissionSchema.safeParse(submission({ ...profile, Q10:'3' })).success).toBe(false); });
 it('accepts a complete user response with one derived main application', () => { const answers = {...profile,Q07:'3',Q08:['T1'],Q09:'T1',Q10:'2',Q11:['CHAT','PROVIDER','HITL'],Q12:'1',Q13:['2']}; expect(submissionSchema.safeParse(submission(answers)).success).toBe(true); });
 it('accepts an explicitly screened out response without forcing unrelated questions', () => { expect(submissionSchema.safeParse(submission({Q01:'Example',Q02:'OT'})).success).toBe(true); });
 it('requires all detail fields for users', () => { expect(submissionSchema.safeParse(submission({ ...profile, Q08:['T1'], Q09:'T1' })).success).toBe(false); });
 it('keeps all questions inspectable in review mode', () => { expect(getSteps(profile, true)).toContain('Q09'); expect(getSteps(profile, true)).toContain('Q13'); });
});
