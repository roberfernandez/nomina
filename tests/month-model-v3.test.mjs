import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dictionary} from '../src/dictionary-v2.js';
import {shiftPeriod,periodContext,visibleFacts,unitsFor,fixedConcepts,variableConcepts,extraConcepts,normalizedDictionary,calculate,ruleFor} from '../src/month-model-v3.js';
const known=(value,unit)=>({state:'known',value,unit});
const facts=()=>({schema:'computo-economic-facts-v1',producer:'computo-aac',version:'1',period:'2026-02',profile:{percent:50,turn:'T1'},days:Array.from({length:28},(_,i)=>({date:`2026-02-${String(i+1).padStart(2,'0')}`,metrics:{horaNonaHours:known(.25,'h'),nightPayableMinutes:known(60,'min'),plusFestiuDays:known(1,'day')}}))});
test('V3 keeps work and liquidation distinct across years',()=>{
 assert.equal(shiftPeriod('2026-01',-1),'2025-12');assert.equal(shiftPeriod('2026-12',1),'2027-01');
 assert.deepEqual(periodContext('2026-09','2026-10-04'),{work:'2026-09',liquidation:'2026-10',previousWork:'2026-08',state:'Mes finalitzat'});
});
test('V3 ongoing month stops today; closed facts are unchanged',()=>{
 const f=facts();assert.equal(unitsFor(visibleFacts(f,'2026-02','2026-02-03'),'horaNonaHours').value,.75);
 assert.equal(unitsFor(visibleFacts(f,'2026-02','2026-03-03'),'horaNonaHours').value,7);
 assert.equal(f.days.length,28);assert.throws(()=>visibleFacts(f,'2026-03','2026-03-03'));
});
test('V3 absence stays pending, known zero stays zero',()=>{
 const c=variableConcepts.find(c=>c.id==='nona');
 assert.equal(calculate(c,{period:'2026-03',facts:null}).expected,null);
 const f=facts();for(const d of f.days)d.metrics.horaNonaHours=known(0,'h');
 assert.equal(calculate(c,{period:'2026-03',facts:f}).expected,0);
});
test('V3 uses Hora Nona without percentage, reclassification or confirmation',()=>{
 const r=calculate(variableConcepts.find(c=>c.id==='nona'),{profile:{percent:25},period:'2026-03',facts:facts()});
 assert.equal(r.expected,7*10.35);assert.equal(r.state,'complete');
 assert.equal(unitsFor(facts(),'nightPayableMinutes').value,28);
});
test('V3 fixed components support all percentages and tariff periods',()=>{
 const salary=fixedConcepts.find(c=>c.id==='salary');
 for(const percent of [75,78.14,78.91,85,85.81,100])assert.equal(calculate(salary,{profile:{percent},period:'2026-04'}).expected,1485.15*percent/100);
 assert.equal(ruleFor(salary,'2026-03').base,1459.67);
 assert.equal(calculate(salary,{profile:{percent:100},period:'2027-01'}).expected,null);
 assert.equal(calculate(salary,{profile:{},period:'2026-04'}).expected,null);
});
test('V3 festive concepts remain distinct and economically pending',()=>{
 for(const id of ['official-holiday','worked-holiday-e','worked-holiday','special-day','conveni','night'])assert.equal(calculate(variableConcepts.find(c=>c.id===id),{facts:facts(),period:'2026-03'}).expected,null);
 assert.equal(unitsFor(facts(),'plusFestiuDays').value,28);
 assert.equal(calculate(variableConcepts.find(c=>c.id==='worked-holiday-e'),{facts:facts(),period:'2026-03'}).labour.value,null);
});
test('V3 extras normalize every original label exactly once',()=>{
 const list=normalizedDictionary();assert.equal(list.length,69);
 assert.deepEqual(list.flatMap(c=>c.aliases).sort(),dictionary.map(c=>c.name).sort());
 assert.equal(extraConcepts.length,5);assert.ok(extraConcepts.every(c=>!/(Marzo|Junio|Septiembre|Diciembre)/.test(c.id+c.name)));
 assert.equal(ruleFor(extraConcepts[0],'2026-12'),null);assert.equal(ruleFor(extraConcepts[0],'2026-06').base,1485.15);
});
test('V3 unknown seniority, extra night and personal adjustments stay pending',()=>{
 for(const c of [fixedConcepts.find(c=>c.id==='seniority'),extraConcepts.find(c=>c.id==='extra-night')])assert.equal(calculate(c,{profile:{percent:100},period:'2026-06'}).expected,null);
});
test('V3 shipped UI is month first and never imports payrolls or original calendars',async()=>{
 const app=await readFile(new URL('../src/app-v3.js',import.meta.url),'utf8');
 assert.match(app,/months-grid/);assert.match(app,/loadPayrollFacts/);assert.match(app,/Endarreriments: Pendent/);
 assert.doesNotMatch(app,/metro-year-|calcDay\(|documentary-examples|type="file"|observed/);
 assert.match(await readFile(new URL('../index.html',import.meta.url),'utf8'),/app-v3\.js/);
});
