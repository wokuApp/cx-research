import {test,expect,type Page,type BrowserContext} from '@playwright/test';
const status={phase:'pilot',paused:false,completed:0,pilotLimit:50,pilotQuestions:true,reason:null};
async function assertDirectShare(page:Page,context:BrowserContext){
 const share=page.getByRole('link',{name:'Compartir en LinkedIn',exact:true});
 await expect(share).toBeVisible();await expect(share).toHaveAttribute('target','_blank');
 const composer=new URL((await share.getAttribute('href'))!);const text=composer.searchParams.get('text')!;
 expect(composer.origin).toBe('https://www.linkedin.com');expect(composer.pathname).toBe('/feed/');expect(composer.searchParams.get('shareActive')).toBe('true');
 expect(text).toContain('La investigación avanza cuando compartimos nuestra experiencia.');
 expect(text).toContain('IA en la experiencia del cliente en Hispanoamérica');expect(text).toContain('aunque tu empresa aún no use IA');
 expect(text).toContain('\n\n');expect(text).toContain('http://127.0.0.1:5181/');
 expect(text).not.toMatch(/private@example|Private company|—|\p{Extended_Pictographic}/u);
 // Intercept the destination: never access an account or publish on LinkedIn in tests.
 await context.route('https://www.linkedin.com/**',route=>route.fulfill({contentType:'text/html',body:'<title>Composer test</title>'}));
 const popupPromise=page.waitForEvent('popup');await share.click();const popup=await popupPromise;
 await popup.waitForURL(composer.href);await popup.close();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Copiar mensaje',exact:true})).toHaveCount(0);
 await expect(page.getByRole('textbox',{name:'Mensaje para LinkedIn'})).toHaveCount(0);
}
test('a returning verified participant goes straight to LinkedIn in one click',async({page,context})=>{
 await page.route('**/api/survey/status',route=>route.fulfill({json:status}));
 await page.route('**/api/survey/email-status',route=>route.fulfill({json:{state:'answered_verified',simulated:false}}));
 let submissions=0;page.on('request',request=>{if(request.url().endsWith('/api/survey/responses'))submissions++;});
 await page.goto('/');await page.getByLabel('Tu correo electrónico',{exact:true}).fill('private@example.com');await page.getByRole('button',{name:'Comenzar encuesta',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Este correo ya respondió la encuesta'})).toBeVisible();
 await assertDirectShare(page,context);expect(submissions).toBe(0);
});
test('completion opens the prefilled composer directly on mobile without clipboard access',async({page,context})=>{
 await page.setViewportSize({width:320,height:740});
 await page.route('**/api/survey/status',route=>route.fulfill({json:status}));
 await page.route('**/api/survey/email-status',route=>route.fulfill({json:{state:'available',simulated:false}}));
 await page.route('**/api/survey/responses',route=>route.fulfill({json:{accepted:true,submissionId:route.request().postDataJSON().submissionId,emailVerified:false,verificationEmail:'queued',status}}));
 await page.addInitScript(()=>localStorage.setItem('woku:cx-survey:live:draft:v06',JSON.stringify({version:'0.6',email:'private@example.com',consent:true,locale:'es',step:'review',answers:{Q01:'Private company',Q02:'OT'}})));
 await page.goto('/');await page.getByRole('button',{name:'Enviar encuesta',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Tu respuesta quedó guardada',exact:true})).toBeVisible();
 await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async()=>{throw new DOMException('Denied','NotAllowedError');}}));
 await assertDirectShare(page,context);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
