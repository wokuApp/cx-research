import {test,expect} from '@playwright/test';
for(const width of [1280,320])test(`preparation at ${width}px cannot collect responses`,async({page})=>{
 await page.setViewportSize({width,height:800});let calls=0;
 await page.route('**/api/survey/**',async route=>{calls++;await route.fulfill({json:{phase:'pilot',paused:false,completed:0,pilotLimit:50,pilotQuestions:true,reason:null}});});
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Estamos preparando el estudio'})).toBeVisible();
 await expect(page.getByRole('textbox')).toHaveCount(0);
 expect(calls).toBe(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
