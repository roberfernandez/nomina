import {mkdir,copyFile,cp,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
await mkdir('dist',{recursive:true});
await copyFile('index.html','dist/index.html');
await cp('src','dist/src',{recursive:true});
await cp('public','dist',{recursive:true});
const hash=createHash('sha256');
for(const dir of ['src','public/assets'])for(const name of (await readdir(dir)).sort())hash.update(await readFile(`${dir}/${name}`));
hash.update(await readFile('index.html'));
await writeFile('dist/sw.js',(await readFile('public/sw.js','utf8')).replaceAll('__VERSION__',hash.digest('hex').slice(0,12)));
let commit='local';try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
await writeFile('dist/version.json',JSON.stringify({commit}));
await writeFile('dist/.nojekyll','');
console.log('Export estàtic complet: dist/ (sense dades personals ni dependències).');
