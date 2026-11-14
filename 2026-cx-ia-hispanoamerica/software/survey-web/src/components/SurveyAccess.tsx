import {useEffect,type ReactNode} from 'react';
import App from '../App';
import {useSurveyStore} from '../store/surveyStore';
import {API_UI} from '../data/apiUi';
import {UI} from '../data/ui';
import {PixelGradientField} from './PixelGradientField';
import WokuLogo from './WokuLogo';
import {MockControls} from './MockControls';
import {Button} from './ui/Button';
import {Progress} from './ui/Progress';
import {IS_MOCK} from '../lib/runtime';
export const SurveyAccess=():ReactNode=>{
 const {gate,status,submitted,loadStatus,locale,error,pendingSubmission}=useSurveyStore();const t=API_UI[locale];const ui=UI[locale];
 useEffect(()=>{void loadStatus(true);const timer=setInterval(()=>void loadStatus(),15000);const refresh=():void=>{void loadStatus();};window.addEventListener('focus',refresh);return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);};},[loadStatus]);
 if(submitted||(gate==='ready'&&status&&!status.paused))return <App/>;
 const loading=gate==='loading';const failed=gate==='error';
 return <div className={`survey-page ${IS_MOCK?'survey-preview':''} relative isolate min-h-dvh bg-linear-to-br from-emerald-100 via-indigo-100 to-indigo-200 text-neutral-900`}>
  <PixelGradientField/>
  <div className="viewport-progress fixed inset-x-0 top-0 z-30 w-full bg-white"><Progress value={0} max={1} label={ui.scope} className="progress-full-bleed"/><p className="progress-scope text-center text-xs font-semibold text-indigo-800">{ui.scope}</p><div className="progress-details flex items-center justify-center text-xs text-neutral-600">{loading?t.checking:failed?t.unavailable:t.paused}</div></div>
  <header className="survey-header relative z-10 mx-auto flex w-full max-w-5xl items-center justify-end gap-2 px-4 sm:px-8">{IS_MOCK&&<MockControls/>}</header>
  <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-4 sm:px-8"><section className="survey-card mx-auto flex flex-col overflow-hidden rounded-2xl bg-white" data-testid="access-card">
   <div className="survey-scroll min-h-0 flex-1 overflow-y-auto"><h1 className="step-title font-bold tracking-tight" role={loading?'status':undefined}>{loading?t.checking:failed?t.unavailable:t.paused}</h1><p className="mt-6 text-base leading-7 text-neutral-600">{loading?t.checkingBody:failed?t.unavailableBody:status?.reason==='pilot_limit'?t.pilotPausedBody:t.pausedBody}</p>{!loading&&pendingSubmission&&<p className="mt-6 text-sm leading-6 text-indigo-800">{error||t.pendingSaved}</p>}</div>
   <footer className="survey-card-footer flex justify-end"><Button disabled={loading} onClick={()=>void loadStatus()}>{t.retry}</Button></footer>
  </section></main>
  <div className="preview-footnote text-indigo-900">{IS_MOCK?ui.preview:'Estudio de IA en la experiencia del cliente'}</div><a href="https://woku.app" target="_blank" rel="noopener noreferrer" aria-label={ui.opensNew} className="powered-by-woku"><span className="mt-1.5">Powered by</span><WokuLogo className="h-3.5 w-auto" aria-hidden="true"/></a>
 </div>;
};
