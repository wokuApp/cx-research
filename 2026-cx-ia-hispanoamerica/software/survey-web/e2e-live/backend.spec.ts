import {test,expect} from '@playwright/test';
const status={phase:'pilot',paused:false,completed:0,pilotLimit:50,pilotQuestions:true,reason:null};
test('successful verification offers all sharing actions without leaking its route or token',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.route('**/api/survey/verify',route=>route.fulfill({json:{verified:true}}));
 const token='c'.repeat(43);await page.goto(`/verify#token=${token}`);
 await page.getByRole('button',{name:'Verificar mi correo',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Correo verificado',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Copiar enlace',exact:true}).click({timeout:3000});
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('http://127.0.0.1:5181/');
 const whatsapp=await page.getByRole('link',{name:'Compartir por WhatsApp'}).getAttribute('href');
 expect(decodeURIComponent(whatsapp!)).not.toContain('/verify');expect(whatsapp).not.toContain(token);
 const linkedin=new URL((await page.getByRole('link',{name:'Compartir en LinkedIn',exact:true}).getAttribute('href'))!);
 const draft=linkedin.searchParams.get('text')!;
 expect(draft).toContain('http://127.0.0.1:5181/');expect(draft).not.toContain('/verify');expect(draft).not.toContain(token);
});
test('resend disables repeated clicks and explains that the previous link was replaced',async({page})=>{
 await page.route('**/api/survey/status',route=>route.fulfill({json:status}));
 await page.route('**/api/survey/email-status',route=>route.fulfill({json:{state:'answered_pending',simulated:false}}));
 let release!:()=>void;const ready=new Promise<void>(resolve=>{release=resolve;});let requests=0;
 await page.route('**/api/survey/resend-verification',async route=>{requests++;await ready;await route.fulfill({json:{state:'answered_pending',simulated:false}});});
 await page.goto('/');await page.getByLabel('Tu correo electrónico',{exact:true}).fill('pending@example.com');
 await page.getByRole('button',{name:'Comenzar encuesta',exact:true}).click();
 await page.getByRole('button',{name:'Reenviar verificación',exact:true}).click();
 await expect(page.getByRole('button',{name:'Solicitando enlace',exact:true})).toBeDisabled();release();
 await expect(page.getByRole('status')).toContainText('Los enlaces anteriores ya no son válidos');await expect(page.getByRole('status')).toContainText('spam o correo no deseado');expect(requests).toBe(1);
});
test('real mode hides review tools and reports server acceptance accurately',async({page})=>{
  await page.route('**/api/survey/status',route=>route.fulfill({json:status}));
  await page.route('**/api/survey/email-status',route=>route.fulfill({json:{state:'available',simulated:false}}));
  await page.route('**/api/survey/responses',async route=>{
    const body=route.request().postDataJSON();expect(body.emailVerified).toBe(false);
    await route.fulfill({json:{accepted:true,submissionId:body.submissionId,emailVerified:false,verificationEmail:'queued',status}});
  });
  await page.addInitScript(()=>localStorage.setItem('woku:cx-survey:live:draft:v06',JSON.stringify({version:'0.6',email:'person@example.com',consent:true,locale:'es',step:'review',answers:{Q01:'Outside',Q02:'OT'}})));
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Simular el backend'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Revisar preguntas'})).toHaveCount(0);
  await page.getByRole('button',{name:'Enviar encuesta'}).click();
  await expect(page.getByRole('heading',{name:'Tu respuesta quedó guardada'})).toBeVisible();
  await expect(page.getByText('Te enviaremos un correo para verificar tu dirección. Revisa tu bandeja de entrada y las carpetas de spam o correo no deseado. Tu respuesta se conserva aunque no la verifiques.')).toBeVisible();
  await expect(page.getByText('Vista previa · Sin envíos')).toHaveCount(0);
});
test('verification waits for confirmation, removes the token from the URL and works while paused',async({page})=>{
  let calls=0;
  await page.route('**/api/survey/verify',async route=>{calls++;expect(route.request().method()).toBe('POST');expect(route.request().postDataJSON()).toEqual({token:'a'.repeat(43)});await route.fulfill({json:{verified:true}});});
  await page.goto(`/verify#token=${'a'.repeat(43)}`);
  await expect(page.getByRole('heading',{name:'Verifica tu correo'})).toBeVisible();
  expect(calls).toBe(0);expect(new URL(page.url()).hash).toBe('');
  await page.getByRole('button',{name:'Verificar mi correo'}).click();
  await expect(page.getByRole('heading',{name:'Correo verificado'})).toBeVisible();expect(calls).toBe(1);
});
test('expired verification retains the response and gives a recovery path',async({page})=>{
  await page.route('**/api/survey/verify',route=>route.fulfill({status:400,json:{code:'invalid_token',message:'El enlace no es válido o venció.'}}));
  await page.goto(`/verify#token=${'b'.repeat(43)}`);
  await page.getByRole('button',{name:'Verificar mi correo'}).click();
  await expect(page.getByText('Tu respuesta sigue guardada. Puedes solicitar otro enlace con el correo que usaste al participar.')).toBeVisible();
  await expect(page.getByRole('button',{name:'Solicitar otro enlace'})).toBeVisible();
});
test('pending duplicates get real resend feedback without simulated claims',async({page})=>{
  await page.route('**/api/survey/status',route=>route.fulfill({json:status}));
  await page.route('**/api/survey/email-status',route=>route.fulfill({json:{state:'answered_pending',simulated:false}}));
  await page.route('**/api/survey/resend-verification',route=>route.fulfill({status:429,json:{code:'rate_limited',message:'Espera unos minutos antes de volver a intentar.'}}));
  await page.goto('/');await page.getByLabel('Tu correo electrónico').fill('person@example.com');
  await page.getByRole('button',{name:'Comenzar encuesta'}).click();
  await expect(page.getByRole('heading',{name:'Tu respuesta ya está guardada'})).toBeVisible();
  await expect(page.getByText(/Vista previa: el envío/)).toHaveCount(0);
  await page.getByRole('button',{name:'Reenviar verificación'}).click();
  await expect(page.getByText('Espera unos minutos antes de volver a intentar.')).toBeVisible();
});
