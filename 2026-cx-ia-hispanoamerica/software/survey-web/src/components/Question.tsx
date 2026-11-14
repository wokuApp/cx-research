import type { ReactNode } from 'react';
import { Checkbox } from './ui/Checkbox';
import { Radio, RadioGroup } from './ui/Radio';
import { TextField } from './ui/TextField';
import {Textarea} from './ui/Textarea';
import { SearchableChoiceList } from './SearchableChoiceList';
import { Button } from './ui/Button';
import { useSurveyStore } from '../store/surveyStore';
import { getOptions, isMulti, isQuestion, toggleOption, answerLabel, type Option } from '../lib/survey';
import { UI } from '../data/ui';
import {API_UI} from '../data/apiUi';
import { cn } from '../lib/utils';
import {AgentCaseQuestion} from './AgentCaseQuestion';
export const Question = (): ReactNode => {
  const { step, answers, locale, inspection, error, setAnswer, setError } = useSurveyStore();
  if (!isQuestion(step)) return null;
  const t = UI[locale];
  const answer = answers[step];
  const options = getOptions(step, locale, answers, inspection);
  if(step==='Q16')return <AgentCaseQuestion/>;
  const onSelect = (value: string): void => setAnswer(step,value);
  const onToggle = (value: string): void => {
    const next = toggleOption(Array.isArray(answer) ? answer : [],value);
    if(step === 'Q14' && next.length > 3) {setError(t.limitError);return;}
    setAnswer(step,next);
  };
  const renderCheckbox = (option:Option): ReactNode => <Checkbox key={option.value} label={option.label} checked={Array.isArray(answer) && answer.includes(option.value)} onCheckedChange={() => onToggle(option.value)} className={cn('choice-row', Array.isArray(answer) && answer.includes(option.value) && 'choice-selected')}/>;
  if(step==='P02')return <div className="space-y-3"><p className="text-sm leading-6 text-neutral-600">{API_UI[locale].pilotComment}</p><Textarea aria-labelledby="step-title" maxLength={500} rows={5} value={typeof answer==='string'?answer:''} onChange={event=>setAnswer(step,event.target.value)} className="w-full"/></div>;
  if (step === 'Q01') return <div className="space-y-4">
    <TextField aria-labelledby="step-title" aria-describedby={error ? 'step-error' : undefined} autoComplete="organization" placeholder={t.companyPlaceholder} value={answer === 'PREF' ? '' : typeof answer === 'string' ? answer : ''} onChange={(e) => setAnswer(step,e.target.value)} maxLength={120} error={!!error}/>
    <Checkbox label={t.prefer} checked={answer === 'PREF'} onCheckedChange={(checked) => setAnswer(step,checked ? 'PREF' : '')}/>
  </div>;
  if(step === 'Q02' || step === 'Q04') return <div className="flex min-h-0 flex-1 flex-col gap-3">
    {step==='Q02'&&<><p className="text-sm leading-6 text-neutral-600">{t.countryHelp}</p>{answers.Q03&&<p className="text-xs leading-5 text-neutral-500">{t.scopeChange}</p>}</>}
    <SearchableChoiceList questionId={step}/>
  </div>;
  const detail = ['Q10','Q11','Q12','Q13'].includes(step);
  const techGroups=[{title:t.techGroup,codes:['CHAT','FLOW','AGENT','VOICE','COPILOT','PREDICT']},{title:t.deliveryGroup,codes:['INTERNAL','PROVIDER']},{title:t.humanGroup,codes:['HITL','AUTO']},{title:t.otherGroup,codes:['OTHER','DK']}];
  return <div className={step==='Q02C'?'flex min-h-0 flex-1 flex-col gap-3':'space-y-4'}>
    {step==='P01'&&<p className="text-sm leading-6 text-neutral-600">{API_UI[locale].pilotHelp}</p>}
    {step==='Q02C'&&<p className="text-sm leading-6 text-neutral-600">{t.coverageHelp}</p>}
    {step==='Q03'&&<p className="text-sm leading-6 text-neutral-600">{answers.Q02==='LATAM'?t.headcountRegional:t.headcountNational}</p>}
    {step==='Q12'&&<p className="text-sm leading-6 text-neutral-600">{t.perceptionHelp}</p>}
    {step==='Q15'&&<p className="text-sm leading-6 text-neutral-600">{t.planHelp}</p>}
    {detail && answers.Q09 && <p className="text-sm leading-6 text-neutral-600"><span className="font-medium text-neutral-900">{answerLabel('Q09',answers.Q09,locale,answers)}</span></p>}
    {step!=='Q02C'&&<p className="text-sm leading-6 text-neutral-500" id="choice-help">{step==='Q11'?t.techHelp:isMulti(step) ? step === 'Q14' ? t.chooseThree : t.chooseMulti : t.choose}</p>}
    {isMulti(step) ? <div role="group" aria-labelledby="step-title" aria-describedby={step==='Q02C'?undefined:'choice-help'} className={cn('space-y-1',step==='Q02C'&&'coverage-list min-h-0 flex-1 overflow-y-auto overscroll-contain')}>
      {step==='Q11' ? techGroups.map(group=><div key={group.title} className="mb-5"><h2 className="mb-2 text-sm font-semibold text-neutral-800">{group.title}</h2>{options.filter(o=>group.codes.includes(o.value)).map(renderCheckbox)}</div>) : options.map(renderCheckbox)}
    </div> : <RadioGroup aria-labelledby="step-title" aria-describedby="choice-help" value={typeof answer === 'string' ? answer : ''} onValueChange={(value) => typeof value === 'string' && onSelect(value)} className="gap-1">
      {options.map((option) => <Radio key={option.value} value={option.value} label={option.label} className={cn('choice-row', answer === option.value && 'choice-selected')}/>)}
    </RadioGroup>}
    {step === 'Q08' && ['3','5'].includes(String(answers.Q07)) && Array.isArray(answer) && answer.includes('NONE') && <p className="text-sm leading-6 text-amber-800">{t.inconsistent}<Button variant="tertiary" onClick={() => useSurveyStore.getState().setStep('Q07')}>{t.back}</Button></p>}
  </div>;
};
