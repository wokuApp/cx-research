import {ArrowLeft,Download,ExternalLink} from 'lucide-react';
const PDF='/manuscrito/ia-cx-hispanoamerica-v2.pdf';
export function ManuscriptPage(){return <main className="flex h-dvh min-h-0 flex-col bg-neutral-100 text-neutral-900">
 <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
  <div><h1 className="text-lg font-bold">Manuscrito del estudio</h1><p className="mt-1 text-sm text-neutral-600">Diego Orrego y Paula Riquelme · woku</p></div>
  <nav className="flex flex-wrap gap-4 text-sm font-medium text-indigo-800" aria-label="Acciones del manuscrito">
   <a className="inline-flex min-h-10 items-center gap-2" href="/"><ArrowLeft className="size-4" aria-hidden="true"/>Volver al cuestionario</a>
   <a className="inline-flex min-h-10 items-center gap-2" href={PDF} download="manuscrito-ia-cx-hispanoamerica.pdf"><Download className="size-4" aria-hidden="true"/>Descargar PDF</a>
   <a className="inline-flex min-h-10 items-center gap-2" href={PDF} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" aria-hidden="true"/>Abrir PDF en otra pestaña</a>
  </nav>
 </header>
 <iframe className="min-h-0 w-full flex-1 border-0" title="Manuscrito en PDF" src={`${PDF}#view=FitH`}/>
 </main>;}
