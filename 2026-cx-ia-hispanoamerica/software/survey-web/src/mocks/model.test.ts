import {describe,it,expect} from 'vitest';
import {getMockStatus,decideSubmission,initialDatabase} from './model';
import type {Submission} from '../lib/survey';
const response=(email:string,id='123e4567-e89b-42d3-a456-426614174000'):Submission=>({version:'0.6',email,consent:true,locale:'es',submissionId:id,submittedAt:'2026-11-14T00:00:00.000Z',emailVerified:false,pilot:true,answers:{Q01:'Example',Q02:'CL',Q03:'1',Q04:'1',Q05:'1',Q06:'1',Q07:'0',Q08:['NONE'],Q14:['NONE'],Q15:'5',Q16:'NONE',P01:'4',P02:''}});
describe('mock reception contract',()=>{
 it('opens with the pilot and pauses exactly after accepting response 50',()=>{
  const db={...initialDatabase,completed:49};const result=decideSubmission(db,response('last@example.com'));
  expect(result.kind).toBe('accepted');expect(result.database.completed).toBe(50);expect(getMockStatus(result.database).paused).toBe(true);
  const blocked=decideSubmission(result.database,response('next@example.com','223e4567-e89b-42d3-a456-426614174000'));expect(blocked.kind).toBe('paused');expect(blocked.database.completed).toBe(50);
 });
 it('counts unverified responses and never waits for email confirmation',()=>{
  expect(decideSubmission(initialDatabase,response('personal@gmail.com')).database.completed).toBe(1);
 });
 it('does not count duplicate normalized emails or retry IDs twice',()=>{
  const first=decideSubmission(initialDatabase,response('person@example.com'));
  expect(decideSubmission(first.database,response('PERSON@example.com','223e4567-e89b-42d3-a456-426614174000')).kind).toBe('duplicate');
  const retry=decideSubmission(first.database,response('person@example.com'));expect(retry.kind).toBe('accepted');expect(retry.database.completed).toBe(1);
 });
 it('rejects missing pilot feedback and does not accept late submissions while manually paused',()=>{
  expect(decideSubmission({...initialDatabase,manualPaused:true},response('test@example.com')).kind).toBe('paused');
  expect(decideSubmission(initialDatabase,{...response('test@example.com'),pilot:false}).kind).toBe('pilot_changed');
 });
 it('requires both pilot steps in routing and valid clarity feedback in the payload',()=>{
  const payload=response('test@example.com');delete payload.answers.P01;expect(decideSubmission(initialDatabase,payload).kind).toBe('invalid');
 });
 it('opens the main wave without pilot questions and ignores pilot cap',()=>{
  const db={...initialDatabase,phase:'main' as const,completed:50};expect(getMockStatus(db).paused).toBe(false);expect(getMockStatus(db).pilotQuestions).toBe(false);
  const r=response('main@example.com');const {P01:_p1,P02:_p2,...answers}=r.answers;void _p1;void _p2;
  expect(decideSubmission(db,{...r,pilot:false,answers}).kind).toBe('accepted');
 });
});
