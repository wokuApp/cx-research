import {afterEach,describe,it,expect,vi} from 'vitest';
import {installClarity} from './clarity';
afterEach(()=>vi.unstubAllGlobals());
describe('Clarity bootstrap',()=>{
 it('loads the provided project once without inventing consent or participant identifiers',()=>{
  const appended:Record<string,unknown>[]=[];
  vi.stubGlobal('window',{});vi.stubGlobal('document',{getElementById:()=>appended[0],createElement:()=>({}),head:{appendChild:(el:Record<string,unknown>)=>appended.push(el)}});
  installClarity();installClarity();expect(appended).toHaveLength(1);expect(appended[0].src).toBe('https://www.clarity.ms/tag/zdmf64alc5');expect(appended[0].async).toBe(true);
  expect((window as unknown as {clarity:{q?:unknown[]}}).clarity.q??[]).toEqual([]);
 });
});
