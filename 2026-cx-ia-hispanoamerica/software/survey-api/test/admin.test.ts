import {describe,it,expect,vi} from 'vitest';
import {changeStudyState,changeInstrumentVersion} from '../src/admin-actions';
function setup(state={phase:'pilot',manual_paused:true,pilot_completed:50}) {
  const client={query:vi.fn().mockImplementation(async(sql:string)=>({rows:sql.includes('SELECT')?[state]:[],rowCount:1})),release:vi.fn()};
  return {client,pool:{connect:async()=>client}};
}
describe('operator controls',()=>{
  it('changes the instrument only while paused and never resets observations',async()=>{
    const {pool,client}=setup({phase:'pilot',manual_paused:true,pilot_completed:3});
    await changeInstrumentVersion(pool as never,{action:'set-instrument-version',version:'0.6',reason:'Added conditional agent case question'},'version-request');
    expect(client.query.mock.calls.some(([sql])=>sql.includes('instrument_version=$1'))).toBe(true);
    expect(client.query.mock.calls.some(([sql])=>/SET.*completed\s*=/.test(sql))).toBe(false);
    const open=setup({phase:'pilot',manual_paused:false,pilot_completed:3});
    await expect(changeInstrumentVersion(open.pool as never,{action:'set-instrument-version',version:'0.6',reason:'Added conditional agent case question'},'version-request')).rejects.toMatchObject({code:'pause_required'});
  });
  it('refuses reopening a completed pilot',async()=>{
    const {pool}=setup();await expect(changeStudyState(pool as never,{action:'set-state',phase:'pilot',paused:false,reason:'Reviewed the pilot answers'},'request-1')).rejects.toMatchObject({code:'pilot_complete'});
  });
  it('rejects arbitrary counters, unknown fields and missing reasons',async()=>{
    const {pool,client}=setup();await expect(changeStudyState(pool as never,{action:'set-state',phase:'main',paused:false,completed:0},'request-1')).rejects.toThrow();
    expect(client.query).not.toHaveBeenCalled();
  });
  it('transitions explicitly to main without resetting counters and records an audit event',async()=>{
    const {pool,client}=setup();await changeStudyState(pool as never,{action:'set-state',phase:'main',paused:false,reason:'Pilot questionnaire reviewed'},'request-1');
    const calls=client.query.mock.calls;
    expect(calls.some(([sql])=>sql.includes('admin_events'))).toBe(true);
    expect(calls.some(([sql])=>/SET.*completed\s*=/.test(sql))).toBe(false);
    expect(calls.at(-1)?.[0]).toBe('COMMIT');
  });
  it('does not mix the main study back into the pilot',async()=>{
    const {pool}=setup({phase:'main',manual_paused:false,pilot_completed:50});
    await expect(changeStudyState(pool as never,{action:'set-state',phase:'pilot',paused:true,reason:'Trying to reset the phase'},'request-1')).rejects.toMatchObject({code:'invalid_transition'});
  });
});
