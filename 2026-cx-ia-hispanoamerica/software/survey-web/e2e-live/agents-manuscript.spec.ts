import {test,expect} from '@playwright/test';
const status={phase:'pilot',paused:false,completed:3,pilotLimit:50,pilotQuestions:true,reason:null};
test('agent case is one step with three stages and optional conditional detail',async({page})=>{
 await page.route('**/api/survey/status',r=>r.fulfill({json:status}));
 await page.route('**/api/survey/email-status',r=>r.fulfill({json:{state:'available',simulated:false}}));
 await page.addInitScript(()=>localStorage.setItem('woku:cx-survey:live:draft:v06',JSON.stringify({version:'0.6',email:'test@example.com',consent:true,locale:'es',step:'Q16',answers:{Q01:'Example',Q02:'CL',Q03:'1',Q04:'1',Q05:'1',Q06:'1',Q07:'0',Q08:['NONE'],Q14:['NONE'],Q15:'5',Q16:'NONE'}})));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:/En qué etapa está la empresa con agentes/})).toBeVisible();
 await expect(page.getByRole('textbox',{name:'Describe el caso de agentes de IA'})).toHaveCount(0);
 await page.getByRole('combobox',{name:'Etapa del caso'}).click();await page.getByRole('option',{name:'Ya implementó',exact:true}).click();
 await page.getByRole('textbox',{name:'Describe el caso de agentes de IA'}).fill('Resuelve solicitudes y confirma el resultado; deriva excepciones.');
 await page.getByRole('combobox',{name:'Etapa del caso'}).click();await page.getByRole('option',{name:'Considera o planea implementar',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Describe el caso de agentes de IA'})).toHaveValue('');
 await expect(page.getByText(/Distingue una idea de un plan decidido/)).toBeVisible();
 await page.getByRole('combobox',{name:'Etapa del caso'}).click();await page.getByRole('option',{name:'Sin implementación ni planes',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Describe el caso de agentes de IA'})).toHaveCount(0);
 await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await expect(page.getByRole('heading',{name:'¿Qué tan claras te resultaron las preguntas?'})).toBeVisible();
});
test('manuscript has an internal query-param viewer and a separate download',async({page})=>{
 await page.route('**/api/survey/status',r=>r.fulfill({json:status}));await page.goto('/');
 const link=page.getByRole('link',{name:'Leer manuscrito',exact:true});await expect(link).toBeVisible();
 expect(await link.getAttribute('href')).toBe('/?documento=manuscrito');
 const progress=await page.getByTestId('viewport-progress').boundingBox();const box=await link.boundingBox();expect(box!.y).toBeGreaterThanOrEqual(progress!.y+progress!.height);expect(box!.y-(progress!.y+progress!.height)).toBeLessThan(12);
 await page.goto('/?documento=manuscrito');await expect(page.getByRole('heading',{name:'Manuscrito del estudio'})).toBeVisible();
 await expect(page.locator('iframe[title="Manuscrito en PDF"]')).toHaveAttribute('src',/\/manuscrito\/.*\.pdf/);
 await expect(page.getByRole('link',{name:'Descargar PDF',exact:true})).toHaveAttribute('download',/\.pdf$/);
 await expect(page.getByText('Diego Orrego y Paula Riquelme · woku',{exact:true})).toBeVisible();
});
