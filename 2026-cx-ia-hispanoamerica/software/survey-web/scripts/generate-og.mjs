import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const logoSource=await fs.readFile(path.join(root,'src/components/WokuLogo.tsx'),'utf8');
const logoPath=logoSource.match(/\bd="([^"]+)"/s)?.[1];
if(!logoPath)throw new Error('Original woku logo path missing');
const font=await fs.readFile(path.join(root,'node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2'));
const fieldStyles=await fs.readFile(path.join(root,'src/components/PixelGradientField.module.css'),'utf8');
const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face{font-family:Montserrat;src:url(data:font/woff2;base64,${font.toString('base64')}) format('woff2');font-weight:100 900;font-display:block}
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:Montserrat,sans-serif;background:linear-gradient(135deg,#d1fae5,#e0e7ff,#c7d2fe);color:#171717}
${fieldStyles}
.panel{position:absolute;left:64px;top:54px;width:1072px;height:486px;border-radius:20px;background:white;box-shadow:0 20px 60px -20px rgba(35,28,94,.25);padding:58px 64px}
h1{font-size:65px;line-height:1.15;letter-spacing:-.025em;font-weight:750;margin:0;max-width:900px}
.subtitle{font-size:27px;line-height:1.5;color:#525252;margin:30px 0 0}
.invite{font-size:23px;line-height:1.5;color:#432dd7;font-weight:600;margin:29px 0 0}
.brand{position:absolute;right:16px;bottom:14px;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.88);padding:6px 8px;border-radius:6px;min-height:32px;color:#525252;font-size:10px;line-height:14px}.brand span{margin-top:6px}.brand svg{height:14px;width:auto}
</style></head><body><div class="field" aria-hidden="true"><div class="glows"><div class="glow glowA"></div><div class="glow glowB"></div><div class="glow glowC"></div><div class="glow glowD"></div></div></div><main class="panel"><h1>IA en la experiencia<br>del cliente</h1><p class="subtitle">Un estudio empresarial en Hispanoamérica.</p><p class="invite">Tu experiencia también cuenta.</p></main><div class="brand"><span>Powered by</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 44" fill="none" aria-label="woku"><path fill="#5149E7" d="${logoPath}"/></svg></div></body></html>`;
await fs.mkdir(path.join(root,'public/og'),{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1,reducedMotion:'reduce'});
 await page.setContent(html);await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:path.join(root,'public/og/ia-experiencia-cliente.jpg'),type:'jpeg',quality:94});
}finally{await browser.close();}
console.log('Generated public/og/ia-experiencia-cliente.jpg (1200 × 630, JPEG) from code.');
