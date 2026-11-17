import type {Pool,PoolClient} from 'pg';
import {z} from 'zod';
import {screenOutAt,type Answers} from '@woku-research/contracts';
import {DomainError} from './errors';
const STUDY='ia-cx-2026';
const command=z.strictObject({action:z.literal('response-audit'),limit:z.number().int().min(1).max(20).default(5)});
export interface ResponseCounts {received:number;eligible:number;ineligible:number;verified:number;unverified:number;}
export async function readResponseCounts(db:Pool|PoolClient):Promise<ResponseCounts>{
 const result=await db.query<ResponseCounts>(`SELECT count(*)::int AS received,
 count(*) FILTER(WHERE r.eligible)::int AS eligible,
 count(*) FILTER(WHERE NOT r.eligible)::int AS ineligible,
 count(*) FILTER(WHERE c.verified_at IS NOT NULL)::int AS verified,
 count(*) FILTER(WHERE c.verified_at IS NULL)::int AS unverified
 FROM research.responses r JOIN research.contacts c ON c.id=r.contact_id WHERE r.study_id=$1`,[STUDY]);
 return result.rows[0];
}
// IAM-only inspection. Return encrypted contact data; never access the privacy key here.
// This must not be exposed through HTTP or logged as a payload.
export async function readResponseAudit(pool:Pool,input:unknown){
 const parsed=command.safeParse(input);if(!parsed.success)throw new DomainError('invalid_payload',400);
 const client=await pool.connect();try{
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const totals=await readResponseCounts(client);
  const result=await client.query(`SELECT c.id AS "contactId",c.email_ciphertext AS "emailCiphertext",c.verified_at AS "verifiedAt",
  r.received_at AS "receivedAt",r.eligible,r.instrument_version AS "instrumentVersion",
  jsonb_strip_nulls(jsonb_build_object('Q02',r.answers->'Q02','Q03',r.answers->'Q03','Q06',r.answers->'Q06')) AS "eligibilityAnswers"
  FROM research.responses r JOIN research.contacts c ON c.id=r.contact_id
  WHERE r.study_id=$1 ORDER BY r.received_at DESC,r.id DESC LIMIT $2`,[STUDY,parsed.data.limit]);
  const responses=result.rows.map(row=>({...row,excludedAt:screenOutAt(row.eligibilityAnswers as Answers)}));
  await client.query('COMMIT');return {totals,responses};
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
