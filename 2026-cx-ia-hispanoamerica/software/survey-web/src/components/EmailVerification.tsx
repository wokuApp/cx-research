import {useState,type ReactNode} from 'react';
import {z} from 'zod';
import {Button} from './ui/Button';
import {TextField} from './ui/TextField';
import {PixelGradientField} from './PixelGradientField';
import WokuLogo from './WokuLogo';
import {Progress} from './ui/Progress';
import {verifyEmail,resendVerification,SurveyApiError} from '../api/surveyApi';
import {emailSchema} from '../lib/survey';
import {ShareActions} from './ShareActions';

export const EmailVerification=({token}:{token:string}):ReactNode=>{
 const valid=z.string().regex(/^[A-Za-z0-9_-]{43}$/).safeParse(token).success;
 const [state,setState]=useState<'ready'|'sending'|'done'|'invalid'>(valid?'ready':'invalid');
 const [message,setMessage]=useState('');const [email,setEmail]=useState('');const [resending,setResending]=useState(false);
 const confirm=async():Promise<void>=>{
  if(state!=='ready')return;setState('sending');setMessage('');
  try{await verifyEmail(token);setState('done');}
  catch(error){if(error instanceof SurveyApiError&&['invalid_token','invalid_payload'].includes(error.code))setState('invalid');else{setState('ready');setMessage(error instanceof SurveyApiError?error.message:'No pudimos verificar el correo. Vuelve a intentar.');}}
 };
 const resend=async():Promise<void>=>{
  const parsed=emailSchema.safeParse(email);if(!parsed.success){setMessage('Escribe el correo que usaste para responder.');return;}
  if(resending)return;setResending(true);setMessage('');
  try{const response=await resendVerification(parsed.data);setMessage(response.state==='answered_verified'?'Tu correo ya está verificado.':response.state==='available'?'No encontramos una respuesta con ese correo. Revisa la dirección.':'Solicitamos un nuevo correo de verificación. Los enlaces anteriores ya no son válidos. Revisa tu bandeja de entrada y las carpetas de spam o correo no deseado en unos minutos.');}
  catch(error){setMessage(error instanceof SurveyApiError?error.message:'No pudimos solicitar el enlace. Vuelve a intentar.');}
  finally{setResending(false);}
 };
 const title=state==='done'?'Correo verificado':state==='invalid'?'Este enlace no está disponible':'Verifica tu correo';
 return <div className="survey-page relative isolate min-h-dvh bg-linear-to-br from-emerald-100 via-indigo-100 to-indigo-200 text-neutral-900">
  <PixelGradientField/>
  <div className="viewport-progress fixed inset-x-0 top-0 z-30 w-full bg-white"><Progress value={state==='done'?1:0} max={1} label="Verificación del correo" className="progress-full-bleed"/><p className="progress-scope text-center text-xs font-semibold text-indigo-800">IA en la experiencia del cliente</p><div className="progress-details flex items-center justify-center text-xs text-neutral-600">Verificación del correo</div></div>
  <div className="survey-header"/>
  <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-4 sm:px-8"><section className="survey-card mx-auto flex flex-col overflow-hidden rounded-2xl bg-white">
   <div className="survey-scroll min-h-0 flex-1 overflow-y-auto"><h1 className="step-title font-bold tracking-tight" aria-live="polite">{title}</h1>
    <p className="mt-6 text-base leading-7 text-neutral-600">{state==='done'?'Gracias. Tu respuesta ahora figura con el correo verificado. Te enviaremos los resultados al finalizar el estudio.':state==='invalid'?'Tu respuesta sigue guardada. Puedes solicitar otro enlace con el correo que usaste al participar.':'Tu respuesta ya está guardada. Confirma que esta dirección de correo te pertenece para completar la verificación.'}</p>
    {state==='done'&&<div className="mt-6"><ShareActions/></div>}
    {state==='invalid'&&<div className="mt-6"><TextField label="Correo con el que respondiste" type="email" autoComplete="email" maxLength={254} value={email} onChange={event=>setEmail(event.target.value)}/></div>}
    {message&&<p className="mt-6 text-sm leading-6 text-indigo-800" role="status">{message}</p>}
   </div>
   <footer className="survey-card-footer flex justify-end">
    {state==='done'?<Button onClick={()=>window.location.assign('/')}>Volver al estudio</Button>:state==='invalid'?<Button disabled={resending} onClick={()=>void resend()}>{resending?'Solicitando enlace':'Solicitar otro enlace'}</Button>:<Button disabled={state==='sending'} onClick={()=>void confirm()}>{state==='sending'?'Verificando correo':'Verificar mi correo'}</Button>}
   </footer>
  </section></main>
  <a href="https://woku.app" target="_blank" rel="noopener noreferrer" aria-label="Abrir woku en otra pestaña" className="powered-by-woku"><span className="mt-1.5">Powered by</span><WokuLogo className="h-3.5 w-auto" aria-hidden="true"/></a>
 </div>;
};
