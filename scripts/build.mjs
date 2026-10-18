import {mkdir,copyFile,cp,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
await mkdir('dist',{recursive:true});
await copyFile('index.html','dist/index.html');
const runtime=['text-search.js','app-v3.js','month-model-v3.js','entitlement-rules.js','vacation-history.js','resolved-rules-v3.js','personal-profile.js','profile-sync.js','dictionary-v2.js','economics-v2.js','computo-cloud-v2.js','style.css'];
await mkdir('dist/src',{recursive:true});
for(const name of await readdir('dist/src'))if(!runtime.includes(name))await rm(`dist/src/${name}`,{force:true});
for(const name of runtime)await copyFile(`src/${name}`,`dist/src/${name}`);
await cp('public','dist',{recursive:true});
await copyFile('assets/tmb-agent-192.png','dist/assets/tmb-agent-192.png');
const hash=createHash('sha256');
for(const dir of ['src','public/assets'])for(const name of (await readdir(dir)).sort())hash.update(await readFile(`${dir}/${name}`));
hash.update(await readFile('index.html'));
hash.update(await readFile('public/sw.js'));
hash.update(await readFile('scripts/build.mjs'));
const fingerprint=hash.digest('hex').slice(0,12);
// Version the entire module graph: a new footer must never run old cached rules.
for(const name of runtime.filter(name=>name.endsWith('.js'))){
 const source=await readFile(`src/${name}`,'utf8');
 await writeFile(`dist/src/${name}`,source.replace(/(from\s*['"])(\.\/[^'"]+\.js)(['"])/g,`$1$2?v=${fingerprint}$3`));
}
await writeFile('dist/sw.js',(await readFile('public/sw.js','utf8')).replaceAll('__VERSION__',fingerprint));
await writeFile('dist/index.html',(await readFile('index.html','utf8')).replace('Versió de desenvolupament',`Versió ${fingerprint.slice(0,8)}`).replace('./src/app-v3.js',`./src/app-v3.js?v=${fingerprint}`).replace('./src/style.css?v=nomina-v3',`./src/style.css?v=${fingerprint}`));
let commit='local';try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
await writeFile('dist/version.json',JSON.stringify({commit,version:fingerprint.slice(0,8)}));
await writeFile('dist/.nojekyll','');
console.log('Export estàtic complet: dist/ (sense dades personals ni dependències).');
