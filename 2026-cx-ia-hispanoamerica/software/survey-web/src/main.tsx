import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {SurveyAccess} from './components/SurveyAccess';
import {EmailVerification} from './components/EmailVerification';
import {IS_MOCK} from './lib/runtime';
import {PreparationPage} from './components/PreparationPage';
import {ManuscriptLink} from './components/ManuscriptLink';
import {ManuscriptPage} from './components/ManuscriptPage';
import {installClarity} from './lib/clarity';
import './styles/index.css';
const root=createRoot(document.getElementById('root')!);
const manuscriptPage=location.pathname==='/'&&new URLSearchParams(location.search).get('documento')==='manuscrito';
const verificationPage=window.location.pathname.replace(/\/$/,'')==='/verify';
const verificationToken=verificationPage?new URLSearchParams(window.location.hash.slice(1)).get('token')??'':'';
// Capture a verification token before removing it; analytics must never receive it.
window.history.replaceState(null,'',window.location.pathname+(manuscriptPage?'?documento=manuscrito':''));
root.render(<div className="flex min-h-dvh items-center justify-center bg-indigo-50 p-6 text-indigo-900" role="status">Preparando encuesta...</div>);
const start=async():Promise<void>=>{
 if(IS_MOCK){const {worker}=await import('./mocks/browser');await worker.start({onUnhandledRequest:'bypass',quiet:true});}
 else if('serviceWorker' in navigator){
  const registrations=await navigator.serviceWorker.getRegistrations();
  for(const registration of registrations){if(registration.active?.scriptURL.endsWith('/mockServiceWorker.js'))await registration.unregister();}
  if(navigator.serviceWorker.controller?.scriptURL.endsWith('/mockServiceWorker.js')){if(verificationToken)window.location.hash=`token=${verificationToken}`;window.location.reload();return;}
 }
 if(import.meta.env.PROD&&!IS_MOCK)installClarity();
 root.render(<StrictMode>{manuscriptPage?<ManuscriptPage/>:<><ManuscriptLink/>{import.meta.env.VITE_SURVEY_PREPARING==='true'?<PreparationPage/>:verificationPage?<EmailVerification token={verificationToken}/>:<SurveyAccess/>}</>}</StrictMode>);
};
void start().catch(()=>root.render(<div className="mx-auto max-w-xl p-8 text-neutral-900"><h1 className="text-xl font-bold">No pudimos preparar la encuesta</h1><p className="mt-3">Recarga la página para volver a intentar.</p><button className="mt-5 rounded-lg bg-indigo-700 px-4 py-3 text-white" onClick={()=>location.reload()}>Reintentar</button></div>));
