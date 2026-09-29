import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {concepts} from '../src/catalogue.js';
import {categories,visibleConcepts,datedRates} from '../src/presentation.js';

test('all eight concepts belong to one real category, without empty promises',()=>{
  const ids=categories.flatMap(c=>c.ids);
  assert.deepEqual(ids.toSorted(),concepts.map(c=>c.id).toSorted());
  assert.equal(new Set(ids).size,8);
});
test('generic search needs no period or personal profile',()=>{
  assert.equal(visibleConcepts(concepts,'nocturnidad','')[0].id,'night');
  assert.equal(visibleConcepts(concepts,'I-53','')[0].id,'nona');
  assert.equal(visibleConcepts(concepts,'POLIVALENCIA','fixed')[0].id,'polivalencia');
  assert.equal(visibleConcepts(concepts,'IRPF','').length,0);
});
test('generic tariffs keep historical dates and sources without selected month',()=>{
  const rates=datedRates(concepts.find(c=>c.id==='festiu'));
  assert.deepEqual(rates.map(r=>r.year),[2026,2025,2024,2023]);
  assert.ok(rates.every(r=>r.source));
});
test('PWA URLs resolve within /nomina/ and supplied icons exist',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../public/manifest.webmanifest',import.meta.url),'utf8'));
  for(const p of [manifest.start_url,manifest.scope,...manifest.icons.map(i=>i.src)])assert.ok(new URL(p,'https://roberfernandez.github.io/nomina/').pathname.startsWith('/nomina/'));
  for(const icon of manifest.icons){const bytes=await readFile(new URL('../public/'+icon.src,import.meta.url));assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16),Number(icon.sizes.split('x')[0]));}
});
test('service worker does not intercept personal APIs or other apps',async()=>{
  const handlers={};vm.runInNewContext(await readFile(new URL('../public/sw.js',import.meta.url),'utf8'),{URL,Set,self:{registration:{scope:'https://roberfernandez.github.io/nomina/'},addEventListener:(k,v)=>handlers[k]=v}});
  for(const url of ['https://roberfernandez.github.io/computo-aac/','https://example.supabase.co/rest/v1/private','https://roberfernandez.github.io/nomina/private.json'])handlers.fetch({request:{method:'GET',url},respondWith:()=>assert.fail('Intercepted private/foreign data')});
});
test('service worker cleanup is limited to its own versioned caches',async()=>{
  const handlers={},removed=[];let complete;
  vm.runInNewContext(await readFile(new URL('../public/sw.js',import.meta.url),'utf8'),{URL,Set,caches:{keys:async()=>['nomina-old','nomina-__VERSION__','tmb-agent-abc','computo-aac'],delete:async k=>removed.push(k)},self:{clients:{claim:async()=>{}},registration:{scope:'https://roberfernandez.github.io/nomina/'},addEventListener:(k,v)=>handlers[k]=v}});
  handlers.activate({waitUntil:p=>complete=p});await complete;assert.deepEqual(removed,['nomina-old']);
});
