import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Download, Mail } from 'lucide-react';
import { Button } from './components/ui/Button';
import { TextField } from './components/ui/TextField';
import { Checkbox } from './components/ui/Checkbox';
import { Progress } from './components/ui/Progress';
import { Dialog } from './components/ui/Dialog';
import WokuLogo from './components/WokuLogo';
import { PixelGradientField } from './components/PixelGradientField';
import { Question } from './components/Question';
import { ReviewIndex } from './components/ReviewIndex';
import { useSurveyStore } from './store/surveyStore';
import { answerLabel, emailSchema, getSteps, isMulti, isQuestion, questionTitle, screenOutAt, stepSchema, type StepId } from './lib/survey';
import { UI } from './data/ui';
import {API_UI} from './data/apiUi';
import {MockControls} from './components/MockControls';
import {ShareActions} from './components/ShareActions';
import {IS_MOCK} from './lib/runtime';

const App = (): ReactNode => {
  const state = useSurveyStore();
  const {email,consent,answers,locale,step,error,inspection,submitted,setEmail,setConsent,setStep,setError,save} = state;
  const t=IS_MOCK?UI[locale]:{...UI[locale],reviewIntro:'Puedes volver a cualquier respuesta. Al enviar, se guardará tu participación en el estudio.',successTitle:'Tu respuesta quedó guardada',successIntro:'Gracias por participar en el estudio de IA en la experiencia del cliente.',successNote:'Te enviaremos un correo para verificar tu dirección. Revisa tu bandeja de entrada y las carpetas de spam o correo no deseado. Tu respuesta se conserva aunque no la verifiques.',restartTitle:'¿Empezar una nueva respuesta?',screened:'Tus respuestas indican que esta participación no cumple el perfil del estudio. Puedes revisarlas o enviarlas; quedarán identificadas por separado.',preview:'Estudio de IA en la experiencia del cliente',local:'Tu avance se guarda en este navegador. Al enviar se registra tu respuesta en el estudio.'}; const api=API_UI[locale]; const reduceMotion=useReducedMotion();
  const [resetOpen,setResetOpen]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  const scroll=useRef<HTMLDivElement>(null);
  const initial=useRef(true);
  const steps=getSteps(answers,inspection,state.status?.pilotQuestions??false);
  const index=Math.max(steps.indexOf(step),0);
  const remaining=steps.length-index-1;
  const listStep=['Q02','Q02C','Q04'].includes(step)&&!submitted;
  const uncertain=!answers.Q08 && !inspection && !screenOutAt(answers);
  useEffect(() => {document.documentElement.lang='es';},[locale]);
  useEffect(() => { if(scroll.current) scroll.current.scrollTop=0; if(initial.current){initial.current=false;return;} heading.current?.focus({preventScroll:true}); },[step,submitted]);
  const section = step.startsWith('P')?api.pilotSection:step==='email'?t.startSection:step==='study'?t.studySection:step==='ai-info'||step==='Q07'||step==='Q08'?t.adoptionSection:step==='review'?t.closeSection:isQuestion(step)&&(step==='Q02C'||Number(step.slice(1))<=6)?t.profileSection:step==='Q16'?'Agentes de IA y cierre de ciclo':step==='Q14'||step==='Q15'?t.barriersSection:t.detailSection;
  const title = state.duplicate ? state.duplicate==='answered_verified'?api.alreadyVerified:api.alreadyPending : submitted ? t.successTitle : isQuestion(step) ? questionTitle(step,locale) : step==='email'?t.introTitle:step==='study'?t.studyTitle:step==='ai-info'?t.aiTitle:t.reviewTitle;
  const move = (event: FormEvent): void => {
    event.preventDefault();
    if (inspection) { if(step==='review'){state.tryFlow();return;} setStep(steps[index+1] ?? 'review');return; }
    if(step==='email' && !emailSchema.safeParse(email).success){setError(t.emailError);return;}
    if(step==='email'){void state.checkEmail();return;}
    if(step==='study' && !consent){setError(t.consentError);return;}
    if(isQuestion(step)) {
      const checked=stepSchema(step,answers).safeParse(answers[step]);
      if(!checked.success){setError(step==='Q01'?t.saveError:step==='Q14'&&Array.isArray(answers[step])&&answers[step].length>3?t.limitError:step==='Q02C'?t.coverageError:isMulti(step)?t.multiError:t.selectError);return;}
    }
    if(step==='review'){void save();return;}
    setStep(steps[index+1] ?? 'review');
  };
  const download = (): void => {
    if(!submitted)return;
    const url=URL.createObjectURL(new Blob([JSON.stringify(submitted,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download=IS_MOCK?'respuestas-ia-cx-prueba.json':'respuestas-ia-cx.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const changeStep = (next: StepId): void => setStep(next);
  return <div className={`survey-page ${IS_MOCK?'survey-preview':''} relative isolate min-h-dvh bg-linear-to-br from-emerald-100 via-indigo-100 to-indigo-200 text-neutral-900`}>
    <PixelGradientField/>
    <div className="viewport-progress fixed inset-x-0 top-0 z-30 w-full bg-white" data-testid="viewport-progress">
      <Progress value={submitted?steps.length:index+1} max={steps.length} label={locale==='es'?'Avance del cuestionario':'Progresso do questionário'} className="progress-full-bleed"/>
      <p className="progress-scope text-center text-xs font-semibold text-indigo-800">{t.scope}</p>
      <div className="progress-details flex items-center justify-between gap-3 text-xs sm:text-sm">
        <span className="truncate font-medium text-neutral-700">{submitted?t.done:section}</span>
        <div className="flex shrink-0 items-center gap-2 tabular-nums text-neutral-600" aria-live="polite" aria-atomic="true"><span className="font-medium text-indigo-800">{submitted ? t.done : `${t.step} ${index+1} ${t.of} ${steps.length}`}</span>{!submitted&&<><span aria-hidden="true">·</span><span>{uncertain?`${t.upto} `:''}{remaining} {t.remaining}</span></>}</div>
      </div>
    </div>
    <header className="survey-header relative z-10 mx-auto flex w-full max-w-5xl items-center justify-end gap-3 px-4 sm:px-8">
      <div className="flex items-center gap-1 sm:gap-2">{IS_MOCK&&<MockControls/>}
        {IS_MOCK&&(inspection ? <Button variant="tertiary" onClick={state.tryFlow} className="text-xs sm:text-sm">{t.testFlow}</Button> : <ReviewIndex/>)}
      </div>
    </header>
    <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-4 sm:px-8">
      <form onSubmit={move} noValidate className="survey-card relative mx-auto flex flex-col overflow-hidden rounded-2xl bg-white" data-testid="survey-card">
        <div className={`survey-scroll min-h-0 flex-1 overscroll-contain ${listStep?'flex flex-col overflow-hidden':'overflow-y-auto'}`} ref={scroll}>
          <motion.div key={state.duplicate??(submitted?'submitted':step)} initial={reduceMotion?false:{opacity:.8,y:7}} animate={{opacity:1,y:0}} transition={{duration:reduceMotion?0:.2,ease:[.22,1,.36,1]}} className={`min-w-0 ${listStep?'flex min-h-0 flex-1 flex-col':''}`}>
            <h1 id="step-title" ref={heading} tabIndex={-1} className="step-title shrink-0 text-balance font-bold tracking-tight text-neutral-900 outline-none">{title}</h1>
            {state.duplicate ? <div className="mt-6 space-y-5"><p className="text-base leading-7 text-neutral-600">{state.duplicate==='answered_verified'?api.alreadyVerifiedBody:IS_MOCK?api.alreadyPendingBody:'Solicitamos un correo para verificar tu dirección. Revisa tu bandeja de entrada y las carpetas de spam o correo no deseado en unos minutos.'}</p><p className="break-all text-sm font-medium">{email}</p>{IS_MOCK&&state.duplicate==='answered_pending'&&<p className="text-sm leading-6 text-neutral-500">{api.simulatedEmail}</p>}{state.verificationMessage&&<p role="status" className="text-sm leading-6 text-indigo-800">{state.verificationMessage}</p>}<ShareActions/></div> : submitted ? <div className="mt-6 space-y-6">
              <p className="text-base leading-7 text-neutral-600">{t.successIntro}</p>
              <ShareActions/>
              <div className="flex items-start gap-3 py-2"><Mail className="mt-0.5 size-5 shrink-0 text-indigo-700" aria-hidden="true"/><div className="min-w-0"><p className="break-all text-sm font-medium">{submitted.email}</p><p className="mt-1 text-sm text-neutral-500">{t.unverified}</p></div></div>
              <p className="text-sm leading-6 text-neutral-600">{t.successNote}</p>
              <Button variant="tertiary" disabled={state.resending} onClick={()=>void state.resend()}>{state.resending?api.resending:api.resend}</Button>
              {state.verificationMessage&&<p role="status" className="text-sm leading-6 text-indigo-800">{state.verificationMessage}</p>}
            </div> : <>
              {step==='email'&&<div className="mt-5 space-y-6 sm:space-y-8">
                <p className="max-w-xl text-base leading-7 text-neutral-600">{t.intro}</p>
                <p className="text-sm font-medium text-indigo-800">{answers.Q02==='LATAM'?t.time.replace('16','17'):t.time}</p>{state.status?.pilotQuestions&&<p className="text-sm leading-6 text-neutral-500">{api.pilotTime}</p>}
                <TextField label={t.emailLabel} id="email" type="email" autoComplete="email" inputMode="email" placeholder="nombre@empresa.com" value={email} onChange={(e)=>setEmail(e.target.value)} maxLength={254} aria-invalid={!!error} aria-describedby={error?'step-error':'email-purpose'} error={!!error}/>
                <div className="space-y-2" id="email-purpose"><p className="text-sm font-medium text-neutral-700">{t.emailHint}</p><p className="max-w-xl text-sm leading-6 text-neutral-500">{t.emailUse}</p></div>
              </div>}
              {step==='study'&&<div className="mt-5 space-y-6">
                <p className="text-base leading-7 text-neutral-600">{t.studyIntro}</p>
                <ul className="space-y-4">{t.studyBullets.map((line)=><li key={line} className="flex gap-3 text-sm leading-6"><Check className="mt-1 size-4 shrink-0 text-indigo-700" aria-hidden="true"/>{line}</li>)}</ul>
                <p className="text-sm leading-6 text-neutral-500">{t.studyFoot}</p>
                <Checkbox label={t.agree} checked={consent} onCheckedChange={(checked)=>setConsent(checked===true)} className="consent-control rounded-lg bg-neutral-50 p-4"/>
              </div>}
              {step==='ai-info'&&<div className="mt-6 space-y-6"><p className="text-base leading-7 text-neutral-600">{t.aiIntro}</p><p className="text-base leading-7 text-neutral-600">{t.aiMore}</p><p className="border-t border-neutral-200 pt-6 text-sm leading-6 text-indigo-800">{t.aiFoot}</p></div>}
              {isQuestion(step)&&<div className={listStep?'mt-4 flex min-h-0 flex-1 flex-col':'mt-6'}><Question/></div>}
              {step==='review'&&<div className="mt-5 space-y-6">
                <p className="text-sm leading-6 text-neutral-600">{inspection?t.invalidPreview:t.reviewIntro}</p>
                {screenOutAt(answers)&&!inspection&&<p className="text-sm leading-6 text-amber-800">{t.screened}</p>}
                <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4"><div className="min-w-0"><span className="text-xs text-neutral-500">{t.email}</span><p className="break-all text-sm">{email||t.noAnswer}</p></div><Button variant="tertiary" onClick={()=>changeStep('email')}>{t.change}</Button></div>
                {getSteps(answers,inspection,state.status?.pilotQuestions??false).filter(isQuestion).map((id)=><div key={id} className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-4"><div className="min-w-0"><p className="text-xs leading-5 text-neutral-500">{questionTitle(id,locale)}</p><p className="mt-1 text-sm leading-6 text-neutral-900">{answerLabel(id,answers[id],locale,answers)}</p></div><Button variant="tertiary" onClick={()=>changeStep(id)} aria-label={`${t.change}: ${questionTitle(id,locale)}`} className="shrink-0">{t.change}</Button></div>)}
              </div>}
            </>}
          </motion.div>
        </div>
        <footer className="survey-card-footer shrink-0 bg-white">
          <div id="step-error" role="alert" aria-live="polite" className="error-slot text-sm leading-5 text-red-700">{error}</div>
          {state.duplicate ? <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="tertiary" onClick={state.changeEmail}>{api.anotherEmail}</Button>{state.duplicate==='answered_pending'&&<Button disabled={state.resending} onClick={()=>void state.resend()}>{state.resending?api.resending:api.resend}</Button>}</div> : submitted ? <div className="flex items-center justify-between gap-3"><Button variant="tertiary" onClick={()=>setResetOpen(true)} className="min-h-11">{t.restart}</Button><Button onClick={download} className="min-h-11"><Download className="size-4" aria-hidden="true"/>{t.download}</Button></div> : <div className="flex items-center justify-between gap-3">
            {index>0?<Button variant="tertiary" onClick={()=>setStep(steps[index-1])} className="min-h-11"><ArrowLeft className="size-4" aria-hidden="true"/>{t.back}</Button>:<span/>}
            <Button type="submit" disabled={state.checkingEmail||state.sending} className="min-h-11">{state.checkingEmail?api.checkingEmail:state.sending?api.submitting:inspection&&step==='review'?t.testFlow:step==='email'?t.start:step==='review'?t.send:steps[index+1]==='review'?t.review:t.next}<ArrowRight className="size-4" aria-hidden="true"/></Button>
          </div>}
        </footer>
      </form>
      <div className="preview-footnote mx-auto max-w-3xl px-2 text-center text-xs leading-5 text-indigo-900">
        <p title={t.local}>{state.storageWarning?t.storageWarning:inspection?t.inspection:t.preview}</p>
      </div>
    </main>
    <a href="https://woku.app" target="_blank" rel="noopener noreferrer" aria-label={t.opensNew} className="powered-by-woku"><span className="mt-1.5">Powered by</span><WokuLogo className="h-3.5 w-auto" aria-hidden="true"/></a>
    <Dialog open={resetOpen} onOpenChange={setResetOpen}><Dialog.Content className="max-w-md h-auto"><Dialog.Header><Dialog.TitleRow><Dialog.Title>{t.restartTitle}</Dialog.Title><Dialog.Close ariaLabel={t.cancel}/></Dialog.TitleRow></Dialog.Header><Dialog.Body><p className="text-sm leading-6 text-neutral-600">{t.restartBody}</p></Dialog.Body><Dialog.Footer><Button variant="secondary" onClick={()=>setResetOpen(false)}>{t.cancel}</Button><Button onClick={()=>{state.reset();setResetOpen(false);}}>{t.restart}</Button></Dialog.Footer></Dialog.Content></Dialog>
  </div>;
};
export default App;
