import { useState, type ReactNode } from 'react';
import { List, ArrowRight } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { getSteps, isQuestion, questionTitle } from '../lib/survey';
import { useSurveyStore } from '../store/surveyStore';
import { UI } from '../data/ui';
export const ReviewIndex = (): ReactNode => {
  const [open,setOpen] = useState(false);
  const {locale,answers,inspect,status} = useSurveyStore(); const t=UI[locale];
  return <Dialog open={open} onOpenChange={setOpen}>
    <Button variant="tertiary" aria-label={t.index} onClick={() => setOpen(true)} className="min-h-11 text-indigo-800"><List className="size-4" aria-hidden="true"/><span className="hidden sm:inline">{t.index}</span></Button>
    <Dialog.Content className="max-w-xl h-auto">
      <Dialog.Header><Dialog.TitleRow><Dialog.Title>{t.indexTitle}</Dialog.Title><Dialog.Close ariaLabel={locale==='es'?'Cerrar modal':'Fechar modal'}/></Dialog.TitleRow></Dialog.Header>
      <Dialog.Description className="px-5 text-sm leading-6">{t.indexBody}</Dialog.Description>
      <Dialog.Body className="max-h-[65dvh] p-3">
        <div className="flex flex-col gap-1">{getSteps(answers,true,status?.pilotQuestions??false).map((id) => <button key={id} type="button" className="flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-700" onClick={() => {inspect(id);setOpen(false);}}>
          <span className="w-7 shrink-0 font-medium tabular-nums text-indigo-700">{isQuestion(id) ? id==='Q02C'?'02b':id.startsWith('P')?id:id.slice(1) : 'Info'}</span><span className="flex-1">{isQuestion(id) ? questionTitle(id,locale) : id==='email' ? t.emailLabel : id==='study' ? t.studyTitle : id==='ai-info' ? t.aiTitle : t.reviewTitle}</span><ArrowRight className="size-4 shrink-0 text-neutral-400" aria-hidden="true"/>
        </button>)}</div>
      </Dialog.Body>
    </Dialog.Content>
  </Dialog>;
};
