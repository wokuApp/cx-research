import { z } from 'zod';
import source from './instrument-v05.json';
export type Locale = 'es';
export const QUESTION_IDS = ['Q01','Q02','Q02C','Q03','Q04','Q05','Q06','Q07','Q08','Q09','Q10','Q11','Q12','Q13','Q14','Q15','P01','P02'] as const;
export type QuestionId = typeof QUESTION_IDS[number];
export type Answer = string | string[];
export type Answers = Partial<Record<QuestionId, Answer>>;
export type StepId = 'email' | 'study' | 'ai-info' | QuestionId | 'review';
export type Option = { value: string; label: string };
export const questionIdSchema = z.enum(QUESTION_IDS);
export const emailSchema = z.string().trim().max(254).pipe(z.email());
export const isQuestion = (id: string): id is QuestionId => questionIdSchema.safeParse(id).success;
const definitions = new Map(source.map((q) => [q.id, q]));
export const definition = (id: QuestionId) => definitions.get(id)!;
export const questionTitle = (id: QuestionId, _locale: Locale): string => definition(id).pregunta_es;
const parseOptions = (value: string): Option[] => value.split(' | ').map((part) => { const [code, ...label] = part.split('='); return { value: code, label: label.join('=') }; }).filter((option) => option.label);
export const hasRecentUse = (answers: Answers): boolean => Array.isArray(answers.Q08) && answers.Q08.some((value) => /^T[1-8]$/.test(value));
export const getOptions = (id: QuestionId, locale: Locale, answers: Answers = {}, inspection = false): Option[] => {
  if (id === 'Q09') { const options = getOptions('Q08', locale).filter((o) => /^T[1-8]$/.test(o.value)); return inspection ? options : options.filter((o) => answers.Q08?.includes(o.value)); }
  const q = definition(id); return parseOptions(q.opciones_es);
};
export const isMulti = (id: QuestionId): boolean => ['Q02C','Q08','Q11','Q13','Q14'].includes(id);
export const screenOutAt = (answers: Answers): QuestionId | null => {
  if (answers.Q02 === 'OT') return 'Q02';
  if (answers.Q03 === '0') return 'Q03';
  if (answers.Q06 === '0' || answers.Q06 === '99') return 'Q06';
  return null;
};
export const getSteps = (answers: Answers, inspection = false, pilot = false): StepId[] => {
  const steps: StepId[] = ['email', 'study'];
  for (const id of QUESTION_IDS) {
    if ((id==='P01'||id==='P02')&&!pilot&&!inspection) continue;
    if (id === 'Q02C' && !inspection && answers.Q02 !== undefined && answers.Q02 !== 'LATAM') continue;
    if (id === 'Q07') steps.push('ai-info');
    if (!inspection && ['Q09','Q10','Q11','Q12','Q13'].includes(id)) {
      if (answers.Q08 && !hasRecentUse(answers)) continue;
      if (id === 'Q09' && Array.isArray(answers.Q08) && answers.Q08.length === 1 && hasRecentUse(answers)) continue;
    }
    steps.push(id);
    if (!inspection && screenOutAt(answers) === id) break;
  }
  return [...steps, 'review'];
};
export const stepSchema = (id: QuestionId, answers: Answers): z.ZodType<Answer> => {
  if (id === 'P02') return z.string().trim().max(500).optional().transform(value=>value ?? '');
  if (id === 'Q01') return z.string().trim().min(1).max(120);
  const allowed = getOptions(id, 'es', answers).map((option) => option.value);
  const item = z.string().refine((value) => allowed.includes(value), 'Selecciona una opción válida.');
  if (!isMulti(id)) return item;
  if(id==='Q02C') return z.array(item).min(1).max(20).refine(values=>new Set(values).size===values.length).refine(values=>values.includes('DK') ? values.length===1 : values.length>=2,'Selecciona dos o más países, o indica que no puedes precisarlos.');
  return z.array(item).min(1).max(id === 'Q14' ? 3 : allowed.length).refine((values) => new Set(values).size === values.length, 'No repitas opciones.').refine((values) => !values.some((v) => ['NONE','DK'].includes(v)) || values.length === 1, 'Esta opción debe seleccionarse sola.');
};
export const updateAnswer = (answers: Answers, id: QuestionId, value: Answer): Answers => {
  const next: Answers = { ...answers, [id]: value };
  if ((id==='Q02' || id==='Q02C') && JSON.stringify(value)!==JSON.stringify(answers[id])) {
    for(const key of QUESTION_IDS.slice(QUESTION_IDS.indexOf('Q03'))) delete next[key];
    if(id==='Q02') delete next.Q02C;
  }
  if (id === 'Q08') {
    const options = Array.isArray(value) ? value.filter((v) => /^T[1-8]$/.test(v)) : [];
    const main = options.length === 1 ? options[0] : typeof next.Q09 === 'string' && options.includes(next.Q09) ? next.Q09 : undefined;
    if (main !== answers.Q09 || options.length === 0) { for (const field of ['Q10','Q11','Q12','Q13'] as const) delete next[field]; }
    if (main) next.Q09 = main; else delete next.Q09;
  }
  if (id === 'Q09' && value !== answers.Q09) for (const field of ['Q10','Q11','Q12','Q13'] as const) delete next[field];
  // A changed eligibility answer cannot leave a hidden, previously completed tail in the payload.
  const stop = screenOutAt(next);
  if (stop) for (const key of QUESTION_IDS.slice(QUESTION_IDS.indexOf(stop) + 1)) delete next[key];
  return next;
};
export const toggleOption = (selected: string[], value: string): string[] => {
  if (selected.includes(value)) return selected.filter((item) => item !== value);
  if (['NONE','DK'].includes(value)) return [value];
  return [...selected.filter((item) => !['NONE','DK'].includes(item)), value];
};
export const answersSchema = z.partialRecord(questionIdSchema, z.union([z.string().max(500), z.array(z.string().max(8)).max(21)]));
export const submissionSchema = z.strictObject({
  version: z.literal('0.5'), email: emailSchema, consent: z.literal(true), locale: z.literal('es'),
  pilot:z.boolean(), submissionId: z.uuid(), submittedAt: z.iso.datetime(), emailVerified: z.literal(false), answers: answersSchema,
}).superRefine((payload, ctx) => {
  const required = getSteps(payload.answers,false,payload.pilot).filter(isQuestion);
  if (hasRecentUse(payload.answers) && !required.includes('Q09') && !screenOutAt(payload.answers)) required.push('Q09');
  for (const id of required) {
    const result = stepSchema(id, payload.answers).safeParse(payload.answers[id]);
    if (!result.success) ctx.addIssue({ code: 'custom', path: ['answers', id], message: result.error.issues[0]?.message ?? 'Respuesta inválida.' });
  }
  for (const id of Object.keys(payload.answers)) if (!required.includes(id as QuestionId)) ctx.addIssue({ code: 'custom', path: ['answers', id], message: 'Respuesta fuera de este recorrido.' });
});
export type Submission = z.infer<typeof submissionSchema>;
export const draftSchema = z.strictObject({ version: z.literal('0.5'), email: z.string().max(254), consent: z.boolean(), locale: z.literal('es'), answers: answersSchema, step: z.enum(['email','study','ai-info',...QUESTION_IDS,'review']) });
export type Draft = z.infer<typeof draftSchema>;
export const emptyDraft: Draft = { version:'0.5', email:'', consent:false, locale:'es', answers:{}, step:'email' };
export const answerLabel = (id: QuestionId, answer: Answer | undefined, locale: Locale, answers: Answers): string => {
  if(id==='P02'&&!answer)return locale==='es'?'Sin comentarios':'Sem comentários';
  if (!answer) return locale === 'es' ? 'Sin responder' : 'Sem resposta';
  if (id === 'P02') return String(answer);
  if (id === 'Q01') return answer === 'PREF' ? (locale === 'es' ? 'Prefiero no indicarlo' : 'Prefiro não informar') : String(answer);
  return (Array.isArray(answer) ? answer : [answer]).map((value) => getOptions(id, locale, answers, true).find((o) => o.value === value)?.label ?? value).join(' · ');
};

/** Retain the original legacy record; only clear fields whose meaning changed. */
export const restoreDraft = (value: unknown): Draft | null => {
 const current=draftSchema.safeParse(value);if(current.success)return current.data;
 const legacy=draftSchema.extend({version:z.enum(['0.2','0.3','0.4']),locale:z.enum(['es','pt'])}).safeParse(value);
 if(!legacy.success)return null;
 const answers={...legacy.data.answers};
 if(legacy.data.version==='0.2'){delete answers.Q11;if(answers.Q05==='0')delete answers.Q05;}
 if(answers.Q02==='BR'||answers.Q02==='HT'){
  delete answers.Q02;for(const key of QUESTION_IDS.slice(QUESTION_IDS.indexOf('Q02C')))delete answers[key];
 }else if(Array.isArray(answers.Q02C)&&answers.Q02C.some(code=>code==='BR'||code==='HT')){
  delete answers.Q02C;for(const key of QUESTION_IDS.slice(QUESTION_IDS.indexOf('Q03')))delete answers[key];
 }
 return {...legacy.data,version:'0.5',locale:'es',answers};
};
export const canonicalEmail = (value:string):string => value.trim().toLowerCase();
