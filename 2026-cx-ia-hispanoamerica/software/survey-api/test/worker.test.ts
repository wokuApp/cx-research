import {describe,expect,it,vi} from 'vitest';
import {runMailBatch} from '../src/mail';
const job={id:'job-1',lease:'lease-1',email:'person@example.com',token:'a'.repeat(43)};
function setup() {
  const store={claimMail:vi.fn().mockResolvedValue([job]),mailIsCurrent:vi.fn().mockResolvedValue(true),completeMail:vi.fn().mockResolvedValue(undefined),failMail:vi.fn().mockResolvedValue(undefined),maintenance:vi.fn().mockResolvedValue(undefined)};
  const send=vi.fn().mockResolvedValue('message-1');return {store,send};
}
describe('transactional mail dispatcher',()=>{
  it('skips a message superseded after it was claimed',async()=>{
    const {store,send}=setup();store.mailIsCurrent.mockResolvedValue(false);
    expect(await runMailBatch(store,send,'https://research.woku.app')).toEqual({sent:0,failed:0});
    expect(send).not.toHaveBeenCalled();expect(store.completeMail).not.toHaveBeenCalled();
  });
  it('sends only after claiming persisted work and uses a fixed HTTPS origin',async()=>{
    const {store,send}=setup();expect(await runMailBatch(store,send,'https://research.woku.app')).toEqual({sent:1,failed:0});
    expect(send).toHaveBeenCalledWith(expect.objectContaining({to:job.email,url:`https://research.woku.app/verify#token=${job.token}`}));
    expect(store.completeMail).toHaveBeenCalledWith(job.id,job.lease,'message-1');
  });
  it('retries a failed send without reporting success or deleting responses',async()=>{
    const {store,send}=setup();send.mockRejectedValue(new Error('SES down'));
    expect(await runMailBatch(store,send,'https://research.woku.app')).toEqual({sent:0,failed:1});
    expect(store.failMail).toHaveBeenCalledWith(job.id,job.lease);expect(store.completeMail).not.toHaveBeenCalled();
  });
  it('does not accept unsafe links or an injected redirect origin',async()=>{
    const {store,send}=setup();await expect(runMailBatch(store,send,'http://attacker.example')).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  });
});
