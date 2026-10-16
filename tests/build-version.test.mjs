import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile,readdir} from 'node:fs/promises';
test('a deployment versions the entry, stylesheet and every transitive rule import together',async()=>{
 const root=new URL('../',import.meta.url);
 execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root,stdio:'pipe'});
 const html=await readFile(new URL('dist/index.html',root),'utf8');
 const fingerprint=/app-v3\.js\?v=([a-f0-9]{12})/.exec(html)?.[1];assert.ok(fingerprint);
 assert.ok(html.includes(`style.css?v=${fingerprint}`));assert.ok(html.includes(`Versió ${fingerprint.slice(0,8)}`));
 let imports=0;
 for(const name of await readdir(new URL('dist/src/',root))){
  if(!name.endsWith('.js'))continue;
  const code=await readFile(new URL(`dist/src/${name}`,root),'utf8');
  for(const match of code.matchAll(/from\s*['"]\.\/([^'"]+)['"]/g)){
   imports++;assert.ok(match[1].endsWith(`?v=${fingerprint}`),`${name}: unversioned dependency ${match[1]}`);
   await readFile(new URL(`dist/src/${match[1].split('?')[0]}`,root));
  }
 }
 assert.ok(imports>10);
 const worker=await readFile(new URL('dist/sw.js',root),'utf8');assert.ok(worker.includes(`?v=${fingerprint}`));assert.ok(!worker.includes('__VERSION__'));
});
