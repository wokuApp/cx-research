import {useState,type ReactNode} from 'react';
import {Copy} from 'lucide-react';
import {Button} from './ui/Button';
import {useSurveyStore} from '../store/surveyStore';
import {API_UI} from '../data/apiUi';
import {UI} from '../data/ui';
export const getShareUrls=(url:string,message:string,linkedinText=`${message}\n\n${url}`):{linkedin:string;whatsapp:string}=>({linkedin:`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(linkedinText)}`,whatsapp:`https://wa.me/?text=${encodeURIComponent(`${message}\n\n${url}`)}`});
export const ShareActions=():ReactNode=>{
 const locale=useSurveyStore(s=>s.locale);const t=API_UI[locale];const ui=UI[locale];const [notice,setNotice]=useState('');
 const publicUrl=import.meta.env.VITE_SURVEY_PUBLIC_URL||new URL('/',location.href).href;
 const urls=getShareUrls(publicUrl,t.shareMessage,`${t.linkedinMessage}\n\n${publicUrl}`);
 const copy=async():Promise<void>=>{try{await navigator.clipboard.writeText(publicUrl);setNotice(ui.shared);}catch{setNotice(ui.copyError);}};
 const linkClass='inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-indigo-700';
 return <section className="space-y-3" aria-labelledby="share-title"><h2 id="share-title" className="text-base font-semibold">{t.shareTitle}</h2><div className="flex flex-wrap gap-2">
  <a href={urls.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}><img src="/social/linkedin.svg" className="size-5 object-contain" alt=""/>{t.linkedin}</a>
  <a href={urls.whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}><img src="/social/whatsapp.svg" className="size-5 object-contain" alt=""/>{t.whatsapp}</a>
  <Button variant="secondary" onClick={()=>void copy()} className="min-h-11"><Copy className="size-4" aria-hidden="true"/>{t.copy}</Button>
 </div>{notice&&<p role="status" className="text-sm leading-6 text-neutral-600">{notice}</p>}</section>;
};
