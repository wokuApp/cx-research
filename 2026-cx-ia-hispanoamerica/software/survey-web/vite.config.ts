import {defineConfig} from 'vitest/config';
import {loadEnv,type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {rm} from 'node:fs/promises';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'VITE_');
 const canonical=new URL(env.VITE_SURVEY_PUBLIC_URL||'http://127.0.0.1:5180/');canonical.hash='';
 const local=['127.0.0.1','localhost'].includes(canonical.hostname);
 if(!local&&(env.VITE_USE_MOCK_API!=='false'||canonical.protocol!=='https:'))throw new Error('A public survey requires HTTPS and VITE_USE_MOCK_API=false.');
 if(!local&&env.VITE_SURVEY_PREPARING!=='true'&&(!env.VITE_API_BASE_URL||!env.VITE_API_BASE_URL.startsWith('https://')))throw new Error('Set an HTTPS VITE_API_BASE_URL before building the public survey.');
 const liveAssets:Plugin={name:'remove-mock-worker-from-live-build',closeBundle:async()=>{if(env.VITE_USE_MOCK_API==='false')await rm('dist/mockServiceWorker.js',{force:true});}};
 const image=new URL('/og/ia-experiencia-cliente.jpg',canonical).href;
 const title='IA y experiencia del cliente en Hispanoamérica | woku';
 const description='Participa en el estudio sobre IA en la experiencia del cliente en Hispanoamérica. Tu empresa puede aportar, utilice o no inteligencia artificial.';
 const socialMetadata:Plugin={name:'survey-social-metadata',transformIndexHtml:()=>[
  {tag:'title',children:title},
  {tag:'meta',attrs:{name:'description',content:description}},
  {tag:'link',attrs:{rel:'canonical',href:canonical.href}},
  {tag:'meta',attrs:{name:'robots',content:local||env.VITE_SURVEY_PREPARING==='true'||env.VITE_SURVEY_NOINDEX==='true'?'noindex,nofollow':'index,follow'}},
  ...Object.entries({'og:type':'website','og:site_name':'woku','og:locale':'es_ES','og:title':'IA en la experiencia del cliente','og:description':description,'og:url':canonical.href,'og:image':image,'og:image:type':'image/jpeg','og:image:width':'1200','og:image:height':'630','og:image:alt':'IA en la experiencia del cliente. Un estudio empresarial en Hispanoamérica. Powered by woku.'}).map(([property,content])=>({tag:'meta',attrs:{property,content}})),
  ...Object.entries({'twitter:card':'summary_large_image','twitter:title':'IA en la experiencia del cliente','twitter:description':description,'twitter:image':image,'twitter:image:alt':'Estudio empresarial sobre IA en la experiencia del cliente en Hispanoamérica.'}).map(([name,content])=>({tag:'meta',attrs:{name,content}})),
 ].map(tag=>({...tag,injectTo:'head' as const}))};
 return {resolve:{alias:{'@':new URL('./src',import.meta.url).pathname}},plugins:[react(),tailwindcss(),socialMetadata,liveAssets],test:{include:['src/**/*.test.ts'],environment:'node'}};
});
