import {build} from 'esbuild';
import {mkdir,cp,readFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const ca=await readFile('src/ca/us-east-1-bundle.pem');
if(createHash('sha256').update(ca).digest('hex')!=='b1711d12bae51838581281e23b6cb97b1074016873b4dafc80ed14002462dd77')throw new Error('RDS CA changed; verify its source and update the pinned checksum intentionally.');
await rm('dist/runtime',{recursive:true,force:true});await mkdir('dist/runtime',{recursive:true});
await build({entryPoints:{api:'src/api.ts',worker:'src/worker.ts',admin:'src/admin.ts'},bundle:true,platform:'node',target:'node24',format:'esm',outdir:'dist/runtime',outExtension:{'.js':'.mjs'},sourcemap:true,minify:false,banner:{js:"import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"}});
await cp('src/ca','dist/runtime/ca',{recursive:true});await cp('src/migrations','dist/runtime/migrations',{recursive:true});
