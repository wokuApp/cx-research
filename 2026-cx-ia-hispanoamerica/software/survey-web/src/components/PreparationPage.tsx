import {PixelGradientField} from './PixelGradientField';
import WokuLogo from './WokuLogo';
import {Progress} from './ui/Progress';

export function PreparationPage() {
 return <div className="survey-page relative isolate min-h-dvh bg-linear-to-br from-emerald-100 via-indigo-100 to-indigo-200 text-neutral-900">
  <PixelGradientField/>
  <div className="viewport-progress fixed inset-x-0 top-0 z-30 w-full bg-white"><Progress value={0} max={1} label="Preparación del estudio" className="progress-full-bleed"/><p className="progress-scope text-center text-xs font-semibold text-indigo-800">IA en la experiencia del cliente</p><div className="progress-details flex items-center justify-center text-xs text-neutral-600">Hispanoamérica</div></div>
  <div className="survey-header"/>
  <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-4 sm:px-8"><section className="survey-card mx-auto flex flex-col overflow-hidden rounded-2xl bg-white">
   <div className="survey-scroll min-h-0 flex-1 overflow-y-auto"><h1 className="step-title font-bold tracking-tight">Estamos preparando el estudio</h1><p className="mt-6 text-base leading-7 text-neutral-600">La encuesta sobre IA en la experiencia del cliente aún no recibe respuestas. Estamos terminando las comprobaciones antes de abrirla.</p><p className="mt-6 text-sm leading-6 text-neutral-500">Gracias por tu interés. Vuelve a consultar más adelante.</p></div>
  </section></main>
  <a href="https://woku.app" target="_blank" rel="noopener noreferrer" aria-label="Abrir woku en otra pestaña" className="powered-by-woku"><span className="mt-1.5">Powered by</span><WokuLogo className="h-3.5 w-auto" aria-hidden="true"/></a>
 </div>;
}
