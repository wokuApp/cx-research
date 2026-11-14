import {Select} from './ui/Select';
import {Textarea} from './ui/Textarea';
import {useSurveyStore} from '../store/surveyStore';
import {getOptions,definition} from '../lib/survey';
const agentQuestion=definition('Q16');
export const AGENT_DEFINITION=agentQuestion.definicion_agente;
export const CLOSURE_DEFINITION=agentQuestion.definicion_cierre;
const prompts:Record<string,string>=agentQuestion.guias_es??{};
export function AgentCaseQuestion(){
 const {answers,locale,setAnswer}=useSurveyStore();const stage=typeof answers.Q16==='string'?answers.Q16:'';
 return <div className="space-y-5">
  <div className="space-y-2 text-sm leading-6 text-neutral-600"><p>{AGENT_DEFINITION}</p><p>{CLOSURE_DEFINITION}</p><p className="font-medium text-indigo-800">{agentQuestion.instruccion}</p></div>
  <div className="space-y-2"><p className="text-sm font-medium text-neutral-900">Etapa del caso</p><Select ariaLabel="Etapa del caso" placeholder="Selecciona la etapa" value={stage||null} onValueChange={value=>setAnswer('Q16',value)} options={getOptions('Q16',locale)} className="w-full" popupClassName="max-w-[calc(100vw-2rem)]"/></div>
  {prompts[stage]&&<div className="space-y-3" data-clarity-mask="True">
   <p className="text-sm leading-6 text-neutral-600">{prompts[stage]}</p>
   <Textarea label="Describe el caso de agentes de IA" aria-label="Describe el caso de agentes de IA" helper="Opcional. Evita nombres de clientes, datos personales e información confidencial." rows={5} maxLength={1500} showCounter value={typeof answers.Q16D==='string'?answers.Q16D:''} onChange={event=>setAnswer('Q16D',event.target.value)}/>
  </div>}
 </div>;
}
