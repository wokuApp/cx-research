import type {Pool} from 'pg';
import {z} from 'zod';
import {DomainError} from './errors';
const command=z.strictObject({action:z.literal('set-state'),phase:z.enum(['pilot','main']),paused:z.boolean(),reason:z.string().trim().min(10).max(300)});
const versionCommand=z.strictObject({action:z.literal('set-instrument-version'),version:z.literal('0.6'),reason:z.string().trim().min(10).max(300)});
export async function changeInstrumentVersion(pool:Pool,input:unknown,request:string):Promise<{updated:true;version:'0.6'}>{
 const parsed=versionCommand.safeParse(input);if(!parsed.success)throw new DomainError('invalid_payload',400);
 const client=await pool.connect();try{
  await client.query('BEGIN');const state=await client.query("SELECT manual_paused FROM research.study_state WHERE id='ia-cx-2026' FOR UPDATE");
  if(!state.rowCount)throw new DomainError('unavailable',503);
  if(!state.rows[0].manual_paused)throw new DomainError('pause_required');
  await client.query("UPDATE research.study_state SET instrument_version=$1,updated_at=now() WHERE id='ia-cx-2026'",[parsed.data.version]);
  await client.query('INSERT INTO research.admin_events(action,reason,request_id) VALUES($1,$2,$3)',[`set-instrument-version:${parsed.data.version}`,parsed.data.reason,request]);
  await client.query('COMMIT');return {updated:true,version:parsed.data.version};
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
export async function changeStudyState(pool:Pool,input:unknown,request:string):Promise<{updated:true}> {
  const parsed=command.safeParse(input);if(!parsed.success)throw new DomainError('invalid_payload',400);
  const p=parsed.data;const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const result=await client.query("SELECT phase,pilot_completed FROM research.study_state WHERE id='ia-cx-2026' FOR UPDATE");
    if(!result.rowCount)throw new DomainError('unavailable',503);
    const current=result.rows[0];
    if(current.phase==='main'&&p.phase==='pilot')throw new DomainError('invalid_transition');
    if(p.phase==='pilot'&&!p.paused&&current.pilot_completed>=50)throw new DomainError('pilot_complete');
    await client.query("UPDATE research.study_state SET phase=$1,manual_paused=$2,updated_at=now() WHERE id='ia-cx-2026'",[p.phase,p.paused]);
    await client.query('INSERT INTO research.admin_events(action,reason,request_id) VALUES($1,$2,$3)',[`set-state:${p.phase}:${p.paused?'paused':'open'}`,p.reason,request]);
    await client.query('COMMIT');return {updated:true};
  }catch(error){await client.query('ROLLBACK');throw error;}
  finally{client.release();}
}
