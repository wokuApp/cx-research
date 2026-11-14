import { Autocomplete } from '@base-ui/react/autocomplete';
import { Check, Search } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { getOptions, type QuestionId } from '../lib/survey';
import { useSurveyStore } from '../store/surveyStore';
import { filterOptions } from './ui/SearchableSelect/filterOptions';
import { cn } from '../lib/utils';
import { UI } from '../data/ui';
/** Inline version of admin's searchable picker: same Base UI behavior, always-visible list. */
export const SearchableChoiceList = ({ questionId }: { questionId: QuestionId }): ReactNode => {
  const { answers, locale, setAnswer }=useSurveyStore();
  const [query,setQuery]=useState('');
  useEffect(()=>setQuery(''),[questionId]);
  const options=getOptions(questionId,locale);
  const filtered=filterOptions(options,query);
  const value=answers[questionId];
  const t=UI[locale];
  return <div className="inline-choice-picker flex min-h-0 flex-1 flex-col"><Autocomplete.Root inline mode="none" items={filtered} value={query} onValueChange={setQuery}>
    <div className="relative flex shrink-0 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-3 focus-within:ring-2 focus-within:ring-indigo-700">
      <Search className="size-4 shrink-0 text-neutral-500" aria-hidden="true"/>
      <Autocomplete.Input aria-label={questionId==='Q02'?t.countryPlaceholder:t.sectorPlaceholder} placeholder={questionId==='Q02'?t.countryPlaceholder:t.sectorPlaceholder} className="min-w-0 w-full bg-transparent text-base text-neutral-900 outline-none"/>
    </div>
    <Autocomplete.List aria-label={questionId==='Q02' ? (locale==='es'?'Operaciones disponibles':'Operações disponíveis') : (locale==='es'?'Sectores disponibles':'Setores disponíveis')} className="choice-list mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-lg border border-neutral-200 p-1">
      {filtered.length===0 ? <p className="px-3 py-4 text-sm text-neutral-600">{t.empty}</p> : filtered.map((option)=><Autocomplete.Item key={option.value} value={option} onClick={()=>setAnswer(questionId,option.value)} className={cn('flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm leading-5 text-neutral-900 outline-none data-highlighted:bg-neutral-100',value===option.value&&'bg-indigo-50 font-medium text-indigo-800')}>
        <span>{option.label}</span>{value===option.value&&<Check className="size-4 shrink-0" aria-hidden="true"/>}
      </Autocomplete.Item>)}
    </Autocomplete.List>
  </Autocomplete.Root></div>;
};
