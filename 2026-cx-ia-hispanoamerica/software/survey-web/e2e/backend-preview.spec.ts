import {test,expect,type Page} from '@playwright/test';
import path from 'node:path';
const dbKey='woku:cx-survey:mock-api:v1';
const draftKey='woku:cx-survey:preview:draft:v06';
const responseKey='woku:cx-survey:preview:response:v06';
const core={Q01:'Pilot example',Q02:'CL',Q03:'1',Q04:'1',Q05:'1',Q06:'1',Q07:'0',Q08:['NONE'],Q14:['NONE'],Q15:'5',Q16:'NONE'};
const seed=async(page:Page,options:{completed?:number;paused?:boolean;fail?:boolean;emailScenario?:string;draftStep?:string;feedback?:boolean}={}):Promise<void>=>{
 await page.addInitScript(({dbKey,draftKey,core,options})=>{
  if(!localStorage.getItem(dbKey))localStorage.setItem(dbKey,JSON.stringify({phase:'pilot',manualPaused:options.paused??false,completed:options.completed??0,failStatus:options.fail??false,emailScenario:options.emailScenario??'stored',records:[]}));
  if(options.draftStep&&!localStorage.getItem(draftKey))localStorage.setItem(draftKey,JSON.stringify({version:'0.6',email:'pilot@example.com',consent:true,locale:'es',answers:{...core,...(options.feedback?{P01:'4',P02:'Todo claro.'}:{})},step:options.draftStep}));
 },{dbKey,draftKey,core,options});
 await page.goto('/');
};
test('pilot adds exactly two steps, accepts number 50, offers sharing and blocks next opening',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await seed(page,{completed:49,draftStep:'P01'});
 await expect(page.getByRole('heading',{level:1})).toHaveText('¿Qué tan claras te resultaron las preguntas?');
 await expect(page.getByTestId('viewport-progress')).toContainText('Paso 15 de 17');
 await page.screenshot({path:path.resolve('../.impeccable/review/v04-pilot.png'),fullPage:true,animations:'disabled'});
 await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Selecciona');
 await page.getByRole('radio',{name:'Claras',exact:true}).check();await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await expect(page.getByRole('heading',{level:1})).toHaveText('¿Qué pregunta cambiarías o qué opción te faltó?');
 await expect(page.getByTestId('viewport-progress')).toContainText('Paso 16 de 17');
 await page.getByRole('textbox',{name:/Qué pregunta cambiarías/}).fill('Los ejemplos de atención al cliente ayudaron.');
 await page.getByRole('button',{name:'Revisar respuestas',exact:true}).click();await page.getByRole('button',{name:'Enviar encuesta',exact:true}).click();
 await expect(page.getByRole('heading',{level:1})).toContainText('quedó guardada');
 const result=await page.evaluate(({dbKey,responseKey})=>({db:JSON.parse(localStorage.getItem(dbKey)!),saved:JSON.parse(localStorage.getItem(responseKey)!)}),{dbKey,responseKey});
 expect(result.db.completed).toBe(50);expect(result.saved.pilot).toBe(true);expect(result.saved.emailVerified).toBe(false);expect(result.saved.answers.P01).toBe('4');
 const linkedin=page.getByRole('link',{name:'Compartir en LinkedIn'});const whatsapp=page.getByRole('link',{name:'Compartir por WhatsApp'});
 await expect(linkedin).toHaveAttribute('target','_blank');expect(await linkedin.getAttribute('href')).toContain('linkedin.com/feed/?shareActive=true&text=');
 expect(decodeURIComponent((await whatsapp.getAttribute('href'))!)).toContain('IA en la experiencia del cliente');expect((await whatsapp.getAttribute('href'))!).not.toContain('pilot%40');
 await page.getByRole('button',{name:'Copiar enlace',exact:true}).click();await expect(page.getByRole('status')).toContainText('Enlace copiado');
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('http://127.0.0.1:5180/');
 await page.screenshot({path:path.resolve('../.impeccable/review/v04-success.png'),fullPage:true,animations:'disabled'});
 const nextPage=await context.newPage();await nextPage.goto('/');await expect(nextPage.getByRole('heading',{level:1})).toHaveText('La encuesta está en pausa');await expect(nextPage.getByLabel('Tu correo electrónico',{exact:true})).toHaveCount(0);
 await nextPage.screenshot({path:path.resolve('../.impeccable/review/v04-paused.png'),fullPage:true,animations:'disabled'});
});
for(const scenario of ['verified','pending'])test(`already answered email: ${scenario}`,async({page})=>{
 await seed(page,{emailScenario:scenario});await page.getByLabel('Tu correo electrónico',{exact:true}).fill('existing@gmail.com');await page.getByRole('button',{name:'Comenzar encuesta',exact:true}).click();
 await expect(page.getByRole('heading',{level:1})).toHaveText(scenario==='verified'?'Este correo ya respondió la encuesta':'Tu respuesta ya está guardada');
 await expect(page.getByRole('checkbox',{name:/He leído/})).toHaveCount(0);
 if(scenario==='pending'){
  await expect(page.getByText('Te enviamos un correo para verificar tu dirección.',{exact:false})).toBeVisible();await expect(page.getByText(/el envío de correo está simulado/)).toBeVisible();
  await page.getByRole('button',{name:'Reenviar verificación',exact:true}).click();await expect(page.getByRole('status')).toContainText('Reenvío simulado');
 }
 await page.getByRole('button',{name:'Usar otro correo',exact:true}).click();await expect(page.getByLabel('Tu correo electrónico',{exact:true})).toHaveValue('');
});
test('status error fails closed and mock controls can reopen',async({page})=>{
 await seed(page,{fail:true});await expect(page.getByRole('heading',{level:1})).toHaveText('No pudimos comprobar la disponibilidad');await expect(page.getByLabel('Tu correo electrónico',{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Simular el backend',exact:true}).click();await page.getByRole('button',{name:'Encuesta principal abierta',exact:true}).click();
 await expect(page.getByLabel('Tu correo electrónico',{exact:true})).toBeVisible();await expect(page.getByTestId('viewport-progress')).toContainText('Paso 1 de 21');
});
test('pause after opening is checked again at submission, preserving outbox',async({page})=>{
 await seed(page,{completed:49,draftStep:'review',feedback:true});await expect(page.getByRole('heading',{level:1})).toHaveText('Revisa antes de enviar');
 await page.evaluate(dbKey=>{const db=JSON.parse(localStorage.getItem(dbKey)!);db.completed=50;localStorage.setItem(dbKey,JSON.stringify(db));},dbKey);
 await page.getByRole('button',{name:'Enviar encuesta',exact:true}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('La encuesta está en pausa');
 await expect(page.getByText('La recepción se pausó antes de registrar tu envío.',{exact:false})).toBeVisible();
 const result=await page.evaluate(({dbKey,responseKey})=>({db:JSON.parse(localStorage.getItem(dbKey)!),saved:JSON.parse(localStorage.getItem(responseKey)!)}),{dbKey,responseKey});
 expect(result.db.completed).toBe(50);expect(result.db.records).toHaveLength(0);expect(result.saved.answers.P01).toBe('4');
});

test('Spanish social metadata is present without JavaScript and supplied logos and JPEG load',async({page,request})=>{
 const html=await (await request.get('/')).text();expect(html.indexOf('charset="UTF-8"')).toBeLessThan(1024);expect(html).toContain('property="og:image:type" content="image/jpeg"');expect(html).toContain('Hispanoamérica');expect(html).toContain('summary_large_image');
 const image=await request.get('/og/ia-experiencia-cliente.jpg');expect(image.headers()['content-type']).toContain('image/jpeg');const bytes=await image.body();expect(bytes[0]).toBe(255);expect(bytes[1]).toBe(216);
 expect((await request.get('/favicon.ico')).ok()).toBe(true);expect((await request.get('/social/linkedin.svg')).ok()).toBe(true);expect((await request.get('/social/whatsapp.svg')).ok()).toBe(true);
 await seed(page,{draftStep:'review',feedback:true});await page.getByRole('button',{name:'Enviar encuesta',exact:true}).click();await expect(page.getByRole('heading',{level:1})).toContainText('quedó guardada');
 await expect(page.getByRole('link',{name:'Compartir en LinkedIn'}).locator('img')).toHaveAttribute('src','/social/linkedin.svg');await expect(page.getByRole('link',{name:'Compartir por WhatsApp'}).locator('img')).toHaveAttribute('src','/social/whatsapp.svg');
 await expect(page.getByRole('combobox',{name:'Idioma',exact:true})).toHaveCount(0);
 await page.setViewportSize({width:390,height:844});await page.locator('.survey-scroll').evaluate(el=>{el.scrollTop=0;});await page.screenshot({path:path.resolve('../.impeccable/review/v05-mobile-share.png'),fullPage:true,animations:'disabled'});
});
