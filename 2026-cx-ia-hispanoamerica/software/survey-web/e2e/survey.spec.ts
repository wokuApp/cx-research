import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const reviewDir = path.resolve('../.impeccable/review');
const next = async (page:Page):Promise<void> => { await page.getByRole('button',{name:'Continuar',exact:true}).click(); };
const choose = async (page:Page,name:string|RegExp):Promise<void> => {await page.getByRole('radio',{name,exact:typeof name==='string'}).click();await next(page);};
const review = async(page:Page):Promise<void>=>{
 if((await page.getByRole('heading',{level:1}).innerText()).includes('Qué planean'))await next(page);
 if((await page.getByRole('heading',{level:1}).innerText()).includes('En qué etapa está la empresa con agentes')){await page.getByRole('combobox',{name:'Etapa del caso'}).click();await page.getByRole('option',{name:'Sin implementación ni planes',exact:true}).click();}
 await page.getByRole('button',{name:'Revisar respuestas',exact:true}).click();
};
const fillProfile = async (page:Page):Promise<void> => {
 await page.getByLabel('Tu correo electrónico',{exact:true}).fill('researcher@gmail.com');
 await page.getByRole('button',{name:'Comenzar encuesta',exact:true}).click();
 await page.getByRole('checkbox',{name:/He leído/}).check();await next(page);
 await page.getByRole('textbox',{name:/Cómo se llama/}).fill('Example survey company');await next(page);
 await page.getByRole('combobox',{name:'Busca un país o elige Multinacional'}).fill('Chile');await page.getByRole('option',{name:'Chile',exact:true}).click();await next(page);
 await choose(page,'1–9');
 await page.getByRole('combobox',{name:'Busca una actividad'}).fill('Comercio');await page.getByRole('option',{name:'Comercio',exact:true}).click();await next(page);
 await choose(page,'Propietario/a o dirección general');await choose(page,'Sí');
 await expect(page.getByRole('heading',{level:1})).toHaveText('IA aplicada a la experiencia del cliente');await next(page);
};
test.beforeEach(async({page})=>{await page.addInitScript(()=>{if(!localStorage.getItem('woku:cx-survey:mock-api:v1'))localStorage.setItem('woku:cx-survey:mock-api:v1',JSON.stringify({phase:'main',manualPaused:false,completed:0,failStatus:false,emailScenario:'stored',records:[]}));});await page.goto('/');});
test('desktop non-user path validates and stores unverified, with stable card and full-bleed progress',async({page})=>{
 await page.setViewportSize({width:1440,height:950});await page.reload();await page.evaluate(()=>document.fonts.ready);
 const errors:string[]=[];page.on('pageerror',(e)=>errors.push(e.message));
 const box=await page.getByTestId('survey-card').boundingBox();const bar=await page.getByTestId('viewport-progress').boundingBox();
 expect(bar?.x).toBe(0);expect(bar?.y).toBe(0);expect(bar?.width).toBe(1440);
 await mkdir(reviewDir,{recursive:true});await page.screenshot({path:path.join(reviewDir,'desktop.png'),fullPage:true,animations:'disabled'});
 await page.getByRole('button',{name:'Comenzar encuesta',exact:true}).click();await expect(page.getByRole('alert')).toContainText('correo válido');
 await fillProfile(page);await choose(page,'No usamos IA en experiencia del cliente ni lo estamos considerando');
 await page.getByRole('checkbox',{name:'En ninguna',exact:true}).check();await next(page);
 await expect(page.getByRole('heading',{level:1})).toContainText('dificulta');
 const later=await page.getByTestId('survey-card').boundingBox();expect(later?.height).toBe(box?.height);expect(later?.width).toBe(box?.width);expect(later?.y).toBe(box?.y);
 await page.getByRole('checkbox',{name:'Costo o presupuesto',exact:true}).check();await next(page);
 await page.getByRole('radio',{name:'No está previsto utilizarla',exact:true}).click();await review(page);
 await page.getByRole('button',{name:'Enviar encuesta',exact:true}).click();await expect(page.getByRole('heading',{level:1})).toContainText('quedó guardada');
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('woku:cx-survey:preview:response:v06')!));
 expect(data.email).toBe('researcher@gmail.com');expect(data.emailVerified).toBe(false);expect(data.answers.Q08).toEqual(['NONE']);expect(data.answers.Q10).toBeUndefined();expect(errors).toEqual([]);
});
test('mobile user path, keyboard-ready controls, multi limits and branch cleanup',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.reload();await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:path.join(reviewDir,'mobile.png'),fullPage:true,animations:'disabled'});
 const first=await page.getByTestId('survey-card').boundingBox();
 await fillProfile(page);await choose(page,'La usamos habitualmente en actividades puntuales');
 await page.getByRole('checkbox',{name:/Analizar opiniones/}).check();await page.getByRole('checkbox',{name:/Atender clientes/}).check();
 const control=await page.getByRole('checkbox',{name:/Atender clientes/}).boundingBox(); expect(control?.width).toBeLessThanOrEqual(24);
 await page.locator('.survey-scroll').evaluate((el)=>{el.scrollTop=0;});
 await page.screenshot({path:path.join(reviewDir,'mobile-question.png'),fullPage:true,animations:'disabled'});
 const middle=await page.getByTestId('survey-card').boundingBox();expect(middle?.height).toBe(first?.height);expect(middle?.y).toBe(first?.y);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await next(page);await choose(page,/Atender clientes/);await choose(page,'Accede automáticamente a un sistema o fuente interna');
 await page.getByRole('checkbox',{name:'Flujos y automatizaciones potenciados con IA',exact:true}).check();await page.getByRole('checkbox',{name:'Revisión o autorización humana (human in the loop)',exact:true}).check();await next(page);await choose(page,'Mejoró');
 await page.getByRole('checkbox',{name:'Indicadores internos de operación',exact:true}).check();await next(page);
 for(const label of ['Costo o presupuesto','Falta de tiempo','Falta de conocimientos']) await page.getByRole('checkbox',{name:label,exact:true}).check();
 await page.getByRole('checkbox',{name:'Datos insuficientes o poco organizados',exact:true}).click();await expect(page.getByRole('alert')).toContainText('hasta tres');await next(page);
 await page.getByRole('radio',{name:'Ampliar su uso',exact:true}).click();await review(page);
 await page.getByRole('button',{name:/Cambiar: ¿En qué tareas de experiencia/}).click();await page.getByRole('checkbox',{name:'En ninguna',exact:true}).check();await next(page);await next(page);await review(page);await page.getByRole('button',{name:'Enviar encuesta',exact:true}).click();
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('woku:cx-survey:preview:response:v06')!));expect(data.answers.Q09).toBeUndefined();expect(data.answers.Q13).toBeUndefined();
});
test('review index exposes every question in Spanish only',async({page})=>{
 await page.getByRole('button',{name:'Revisar preguntas',exact:true}).click();await page.getByRole('button',{name:/09 ¿En cuál de estas actividades/}).click();
 await expect(page.getByRole('heading',{level:1})).toContainText('En cuál de estas actividades');await expect(page.getByRole('radio')).toHaveCount(8);
 await expect(page.getByRole('combobox',{name:'Idioma',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Probar recorrido',exact:true}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('IA en la experiencia del cliente');
});
test('320px viewport and reload preserve email draft without page overflow',async({page})=>{
 await page.setViewportSize({width:320,height:640});await page.reload();await page.getByLabel('Tu correo electrónico',{exact:true}).fill('mobile@example.com');await page.reload();
 await expect(page.getByLabel('Tu correo electrónico',{exact:true})).toHaveValue('mobile@example.com');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 const bar=await page.getByTestId('viewport-progress').boundingBox();expect(bar?.width).toBe(320);expect(bar?.y).toBe(0);
 await expect(page.getByRole('button',{name:'Comenzar encuesta',exact:true})).toBeInViewport();
});
test('storage failure cannot claim a saved response',async({page})=>{
 await fillProfile(page);await choose(page,'No usamos IA en experiencia del cliente ni lo estamos considerando');await page.getByRole('checkbox',{name:'En ninguna',exact:true}).check();await next(page);
 await page.getByRole('checkbox',{name:'Ninguno',exact:true}).check();await next(page);await page.getByRole('radio',{name:'Todavía no hay una decisión',exact:true}).click();await review(page);
 await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key:string,value:string):void{if(key.includes(':response:'))throw new Error('Blocked storage');original.call(this,key,value);};});
 await page.getByRole('button',{name:'Enviar encuesta',exact:true}).click();await expect(page.getByRole('alert')).toContainText('No pudimos guardar');await expect(page.getByRole('heading',{level:1})).toHaveText('Revisa antes de enviar');
});

test('regional country choice is first, visible lists use only their available height, and modal dismisses',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Revisar preguntas',exact:true}).click();
 const dialog=page.getByRole('dialog');const title=dialog.getByRole('heading');const close=dialog.getByRole('button',{name:'Cerrar modal'});
 const tb=await title.boundingBox();const cb=await close.boundingBox();expect(cb!.x).toBeGreaterThan(tb!.x);expect(Math.abs(cb!.y-tb!.y)).toBeLessThan(12);
 await page.mouse.click(5,100);await expect(dialog).not.toBeVisible();
 await page.getByRole('button',{name:'Revisar preguntas',exact:true}).click();await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
 await page.getByRole('button',{name:'Revisar preguntas',exact:true}).click();await page.getByRole('button',{name:/02 ¿Sobre qué operación/}).click();
 await expect(page.getByRole('option').first()).toHaveText('Multinacional en Hispanoamérica');
 const assertSingleScroll = async ():Promise<void>=>{
  await expect.poll(()=>page.locator('.survey-scroll > div').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  const list=page.getByRole('listbox');const lb=await list.boundingBox();const fb=await page.locator('.survey-card-footer').boundingBox();
  expect(lb!.height).toBeGreaterThan(44);expect(lb!.y+lb!.height).toBeLessThanOrEqual(fb!.y+1);
  const outer=await page.locator('.survey-scroll').evaluate(el=>({scroll:el.scrollHeight,client:el.clientHeight,overflow:getComputedStyle(el).overflowY}));
  expect(outer.overflow).toBe('hidden');expect(outer.scroll).toBeLessThanOrEqual(outer.client+1);
  expect(await list.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
 };
 await assertSingleScroll();
 await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:path.join(reviewDir,'v03-mobile-country.png'),fullPage:true,animations:'disabled'});
 await page.getByRole('option',{name:'Multinacional en Hispanoamérica',exact:true}).click();await next(page);
 await expect(page.getByRole('heading',{level:1})).toHaveText('¿Qué países abarca tu respuesta?');
 await page.getByRole('checkbox',{name:'Chile',exact:true}).check();await page.getByRole('checkbox',{name:'Argentina',exact:true}).check();await next(page);
 await expect(page.getByRole('heading',{level:1})).toHaveText('¿Cuántas personas trabajan en la empresa?');await expect(page.getByText('Considera el total de personas de las operaciones que abarca tu respuesta.')).toBeVisible();
 // Return to participant flow, then inspect sector via the review tool.
 await page.getByRole('button',{name:'Probar recorrido',exact:true}).click();await page.getByRole('button',{name:'Revisar preguntas',exact:true}).click();await page.getByRole('button',{name:/04 ¿A qué sector/}).click();
 await expect(page.getByRole('option',{name:'Comercio',exact:true})).toBeVisible();await assertSingleScroll();
 await page.setViewportSize({width:320,height:640});await assertSingleScroll();
 const branding=page.getByRole('link',{name:'Abrir woku en otra pestaña'});await expect(branding).toHaveAttribute('href','https://woku.app');await expect(branding).toHaveAttribute('target','_blank');await expect(branding).toBeInViewport();
});

test('extended CX adoption and technology options are available and exclusive unknown is enforced',async({page})=>{
 await page.getByRole('button',{name:'Revisar preguntas',exact:true}).click();await page.getByRole('button',{name:/07 ¿Cómo usa la empresa/}).click();
 await expect(page.getByRole('radio',{name:'Su uso está extendido a varias áreas o procesos de experiencia del cliente',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Probar recorrido',exact:true}).click();await page.getByRole('button',{name:'Revisar preguntas',exact:true}).click();await page.getByRole('button',{name:/11 ¿Qué soluciones usan/}).click();
 for(const label of ['Flujos y automatizaciones potenciados con IA','Agentes de voz con IA','Desarrollos internos de la empresa','Soluciones de proveedores externos','Revisión o autorización humana (human in the loop)']) await expect(page.getByRole('checkbox',{name:label,exact:true})).toBeAttached();
 await page.getByRole('checkbox',{name:'Flujos y automatizaciones potenciados con IA',exact:true}).check();await page.getByRole('checkbox',{name:'No sabe',exact:true}).check();
 await expect(page.getByRole('checkbox',{name:'Flujos y automatizaciones potenciados con IA',exact:true})).not.toBeChecked();
 await page.locator('.survey-scroll').evaluate(el=>{el.scrollTop=0;});await page.screenshot({path:path.join(reviewDir,'v03-desktop-technologies.png'),fullPage:true,animations:'disabled'});
});
