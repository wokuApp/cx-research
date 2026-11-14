import type {ResearchStore} from './store';
export interface VerificationMail {to:string;url:string;}
export async function runMailBatch(store:Pick<ResearchStore,'claimMail'|'mailIsCurrent'|'completeMail'|'failMail'|'maintenance'>,send:(mail:VerificationMail)=>Promise<string>,origin:string):Promise<{sent:number;failed:number}> {
  const base=new URL(origin);
  if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash||base.pathname!=='/')throw new Error('Invalid verification origin');
  await store.maintenance();
  const jobs=await store.claimMail(5);let sent=0;let failed=0;
  for(const job of jobs) {
    try {
      if(!await store.mailIsCurrent(job.id,job.lease))continue;
      const url=new URL('/verify',base);url.hash=`token=${job.token}`;
      const messageId=await send({to:job.email,url:url.href});
      await store.completeMail(job.id,job.lease,messageId);sent++;
    }catch{await store.failMail(job.id,job.lease);failed++;}
  }
  return {sent,failed};
}
