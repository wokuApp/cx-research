import { create } from 'zustand';
import { restoreDraft, emptyDraft, emailSchema, getSteps, submissionSchema, updateAnswer, type Answer, type Draft, type Locale, type QuestionId, type StepId, type Submission } from '../lib/survey';
import {fetchSurveyStatus,fetchEmailStatus,submitSurvey,resendVerification,SurveyApiError} from '../api/surveyApi';
import type {SurveyStatus,EmailStatus} from '../api/contracts';
import {API_UI} from '../data/apiUi';
import {IS_MOCK,STORAGE_SCOPE} from '../lib/runtime';
export const DRAFT_KEY = `woku:cx-survey:${STORAGE_SCOPE}:draft:v06`;
export const RESPONSE_KEY = `woku:cx-survey:${STORAGE_SCOPE}:response:v06`;
const readDraft = (): Draft => {
 try { const raw = localStorage.getItem(DRAFT_KEY) ?? localStorage.getItem(`woku:cx-survey:${STORAGE_SCOPE}:draft:v05`) ?? (IS_MOCK?(localStorage.getItem('woku:cx-survey:preview:draft:v04') ?? localStorage.getItem('woku:cx-survey:preview:draft:v03') ?? localStorage.getItem('woku:cx-survey:preview:draft:v02')):null); if (!raw) return emptyDraft; const data=restoreDraft(JSON.parse(raw)); if (!data) return emptyDraft; return { ...data, step: getSteps(data.answers,false,true).includes(data.step) ? data.step : 'email' }; } catch { return emptyDraft; }
};
let accessRequest=0;
let emailRequest=0;
interface SurveyState extends Draft {
 inspection:boolean;error:string;storageWarning:boolean;submitted:Submission|null;pendingSubmission:Submission|null;
 status:SurveyStatus|null;gate:'loading'|'ready'|'error';checkingEmail:boolean;sending:boolean;duplicate:EmailStatus['state']|null;verificationMessage:string;resending:boolean;
 setEmail:(value:string)=>void;setConsent:(value:boolean)=>void;setLocale:(locale:Locale)=>void;setAnswer:(id:QuestionId,value:Answer)=>void;setStep:(step:StepId)=>void;setError:(error:string)=>void;
 inspect:(step:StepId)=>void;tryFlow:()=>void;reset:()=>void;save:()=>Promise<boolean>;loadStatus:(initial?:boolean)=>Promise<void>;checkEmail:()=>Promise<boolean>;changeEmail:()=>void;resend:()=>Promise<void>;
}
export const useSurveyStore=create<SurveyState>((set,get)=>({
 ...readDraft(),inspection:false,error:'',storageWarning:false,submitted:null,pendingSubmission:null,status:null,gate:'loading',checkingEmail:false,sending:false,duplicate:null,verificationMessage:'',resending:false,
 setEmail:(email)=>{emailRequest++;set({email,error:'',duplicate:null,verificationMessage:'',checkingEmail:false,pendingSubmission:null});},
 setConsent:(consent)=>set({consent,error:'',pendingSubmission:null}),setLocale:(locale)=>set({locale,error:''}),
 setAnswer:(id,value)=>set(state=>({answers:updateAnswer(state.answers,id,value),error:'',pendingSubmission:null})),setStep:(step)=>set({step,error:''}),setError:(error)=>set({error}),
 inspect:(step)=>set({step,inspection:true,error:'',submitted:null,duplicate:null}),
 tryFlow:()=>{const answers={...get().answers};if(!get().status?.pilotQuestions){delete answers.P01;delete answers.P02;}set({step:'email',inspection:false,error:'',submitted:null,duplicate:null,answers:answers.Q08?updateAnswer(answers,'Q08',answers.Q08):answers});},
 reset:()=>{set({...emptyDraft,locale:get().locale,inspection:false,error:'',submitted:null,pendingSubmission:null,duplicate:null,verificationMessage:''});},
 changeEmail:()=>{emailRequest++;set({...emptyDraft,locale:get().locale,inspection:false,error:'',submitted:null,pendingSubmission:null,duplicate:null,checkingEmail:false,verificationMessage:''});},
 loadStatus:async(initial=false)=>{
  const seq=++accessRequest;if(initial||!get().status)set({gate:'loading'});
  try{
   const status=await fetchSurveyStatus();if(seq!==accessRequest)return;
   let duplicate=get().duplicate;
   if(initial&&!status.paused&&get().step!=='email'&&emailSchema.safeParse(get().email).success){duplicate=(await fetchEmailStatus(get().email)).state;if(duplicate==='available')duplicate=null;}
   if(seq!==accessRequest)return;
   const answers={...get().answers};if(!status.pilotQuestions){delete answers.P01;delete answers.P02;}
   const step=getSteps(answers,get().inspection,status.pilotQuestions).includes(get().step)?get().step:'review';
   set({status,gate:'ready',duplicate,answers,step});
  }catch{if(seq===accessRequest)set({gate:'error'});}
 },
 checkEmail:async()=>{
  if(get().checkingEmail)return false;
  const result=emailSchema.safeParse(get().email);if(!result.success)return false;
  const seq=++emailRequest;set({checkingEmail:true,error:'',verificationMessage:''});
  try{
   const status=await fetchSurveyStatus();if(seq!==emailRequest)return false;set({status,gate:'ready'});if(status.paused)return false;
   const response=await fetchEmailStatus(result.data);if(seq!==emailRequest)return false;
   if(response.state!=='available'){set({duplicate:response.state});return false;}
   set({email:result.data,duplicate:null,step:'study'});return true;
  }catch{if(seq===emailRequest)set({error:API_UI[get().locale].requestError});return false;}
  finally{if(seq===emailRequest)set({checkingEmail:false});}
 },
 resend:async()=>{
  if(get().resending)return;const email=get().email;set({resending:true,verificationMessage:''});
  try{
   const response=await resendVerification(email);if(get().email!==email)return;
   set({verificationMessage:response.simulated?API_UI[get().locale].resent:response.state==='answered_verified'?'Tu correo ya está verificado.':'Solicitamos un nuevo correo de verificación. Los enlaces anteriores ya no son válidos. Revisa tu bandeja de entrada y las carpetas de spam o correo no deseado en unos minutos.',...(response.state==='answered_verified'?{duplicate:'answered_verified' as const}:{})});
  }catch(error){if(get().email===email)set({verificationMessage:error instanceof SurveyApiError?error.message:API_UI[get().locale].requestError});}
  finally{set({resending:false});}
 },
 save:async()=>{
  const state=get();if(state.sending||!state.status||state.status.paused)return false;
  const t=API_UI[state.locale];
  const result=submissionSchema.safeParse({version:'0.6',email:state.email,consent:state.consent,locale:state.locale,answers:state.answers,pilot:state.status.pilotQuestions,submissionId:state.pendingSubmission?.submissionId??crypto.randomUUID(),submittedAt:state.pendingSubmission?.submittedAt??new Date().toISOString(),emailVerified:false});
  if(!result.success){const id=result.error.issues[0]?.path[1];set({error:state.locale==='es'?'Revisa esta respuesta antes de continuar.':'Revise esta resposta antes de continuar.',step:typeof id==='string'&&getSteps(state.answers,false,state.status.pilotQuestions).includes(id as StepId)?id as StepId:state.email?'study':'email'});return false;}
  try{localStorage.setItem(RESPONSE_KEY,JSON.stringify(result.data));localStorage.setItem(`woku:cx-survey:${STORAGE_SCOPE}:outbox:${result.data.submissionId}`,JSON.stringify(result.data));}
  catch{set({error:state.locale==='es'?'No pudimos guardar en este navegador. Tus respuestas siguen aquí; habilita el almacenamiento y vuelve a intentar.':'Não foi possível salvar neste navegador. Suas respostas continuam aqui; habilite o armazenamento e tente novamente.'});return false;}
  set({pendingSubmission:result.data,sending:true,error:''});
  try{const receipt=await submitSurvey(result.data);set({submitted:result.data,status:receipt.status,gate:'ready',pendingSubmission:null,error:''});return true;}
  catch(error){
   if(error instanceof SurveyApiError&&error.code==='paused'){await get().loadStatus();set({error:t.pausedAfterSave});}
   else if(error instanceof SurveyApiError&&error.code==='duplicate'){const email=await fetchEmailStatus(state.email).catch(()=>({state:'answered_pending' as const,simulated:true}));set({duplicate:email.state,step:'email',error:''});}
   else if(error instanceof SurveyApiError&&error.code==='pilot_changed'){await get().loadStatus();set({error:t.phaseChanged});}
   else if(error instanceof SurveyApiError&&error.code==='instrument_changed')set({error:error.message});
   else set({error:error instanceof SurveyApiError&&error.code==='rate_limited'?error.message:t.sendError});return false;
  }finally{set({sending:false});}
 },
}));
useSurveyStore.subscribe(state=>{
 const draft:Draft={version:'0.6',email:state.email,consent:state.consent,locale:state.locale,answers:state.answers,step:state.step};
 try{localStorage.setItem(DRAFT_KEY,JSON.stringify(draft));if(state.storageWarning)useSurveyStore.setState({storageWarning:false});}
 catch{if(!state.storageWarning)useSurveyStore.setState({storageWarning:true});}
});
export const selectLocale=(state:SurveyState):Locale=>state.locale;
export const selectStep=(state:SurveyState):StepId=>state.step;
export const selectAnswers=(state:SurveyState):Draft['answers']=>state.answers;
