import {describe,it,expect,vi} from 'vitest';
import {readResponseAudit} from '../src/response-audit';
describe('restricted response inspection',()=>{
 it('rejects unbounded requests and unknown arguments before querying',async()=>{
  const pool={connect:vi.fn()};
  for(const input of [{action:'response-audit',limit:0},{action:'response-audit',limit:21},{action:'response-audit',limit:1,sql:'SELECT *'}]){
   await expect(readResponseAudit(pool as never,input)).rejects.toMatchObject({code:'invalid_payload'});
  }
  expect(pool.connect).not.toHaveBeenCalled();
 });
});
