import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dictionary} from '../src/dictionary-v2.js';
import {shiftPeriod,extraPaymentMonths,extraReferencePeriod,periodContext,visibleFacts,unitsFor,fixedConcepts,variableConcepts,extraConcepts,normalizedDictionary,calculate,ruleFor} from '../src/month-model-v3.js';
const known=(value,unit)=>({state:'known',value,unit});
const facts=()=>({schema:'computo-economic-facts-v1',producer:'computo-aac',version:'1',period:'2026-02',profile:{percent:50,turn:'T1'},days:Array.from({length:28},(_,i)=>({date:`2026-02-${String(i+1).padStart(2,'0')}`,metrics:{horaNonaHours:known(.25,'h'),nightPayableMinutes:known(60,'min'),plusFestiuDays:known(1,'day')}}))});
test('V3 keeps work and liquidation distinct across years',()=>{
 assert.equal(shiftPeriod('2026-01',-1),'2025-12');assert.equal(shiftPeriod('2026-12',1),'2027-01');
 assert.deepEqual(periodContext('2026-09','2026-10-04'),{work:'2026-09',liquidation:'2026-10',previousWork:'2026-08',state:'Mes finalitzat'});
});
test('V3 keeps complete Còmput forecasts in current, future and closed months',()=>{
 const f=facts();
 for(const today of ['2026-01-03','2026-02-03','2026-03-03']){
  const visible=visibleFacts(f,'2026-02',today);
  assert.equal(visible,f);
  assert.equal(unitsFor(visible,'horaNonaHours').value,7);
  assert.equal(unitsFor(visible,'nightPayableMinutes').value,28);
  assert.equal(unitsFor(visible,'plusFestiuDays').value,28);
 }
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
 for(const id of ['official-holiday','worked-holiday','special-day'])assert.equal(calculate(variableConcepts.find(c=>c.id===id),{facts:facts(),period:'2026-03'}).expected,null);
 assert.equal(unitsFor(facts(),'plusFestiuDays').value,28);
 assert.equal(calculate(variableConcepts.find(c=>c.id==='worked-holiday-e'),{facts:facts(),period:'2026-03'}).labour,null);
});
test('V3 extras normalize every original label exactly once',()=>{
 const list=normalizedDictionary();assert.equal(list.length,69);
 assert.deepEqual(list.flatMap(c=>c.aliases).sort(),dictionary.map(c=>c.name).sort());
 assert.equal(extraConcepts.length,5);assert.ok(extraConcepts.every(c=>!/(Marzo|Junio|Septiembre|Diciembre)/.test(c.id+c.name)));
 assert.deepEqual(extraPaymentMonths,[3,6,9,12]);
 assert.equal(extraReferencePeriod('2026-06'),'2026-06');
 assert.equal(extraReferencePeriod('2026-03'),'2026-03');
 assert.equal(ruleFor(extraConcepts[0],'2026-06').base,1485.15);
 const decemberSalary=ruleFor(extraConcepts[0],'2026-12');assert.equal(decemberSalary.base,1485.15*1.3333);
 const decemberSeniority=ruleFor(extraConcepts.find(c=>c.id==='extra-seniority'),'2026-12');assert.equal(decemberSeniority.factor,1.3333);
});
test('V3 unknown seniority, extra night and personal adjustments stay pending',()=>{
 for(const c of [fixedConcepts.find(c=>c.id==='seniority'),extraConcepts.find(c=>c.id==='extra-night')])assert.equal(calculate(c,{profile:{percent:100},period:'2026-06'}).expected,null);
});
test('V3 shipped UI is month first; received premiums are imported separately from labour facts',async()=>{
 const app=await readFile(new URL('../src/app-v3.js',import.meta.url),'utf8');
 assert.match(app,/months-grid/);assert.match(app,/loadPayrollFacts/);assert.match(app,/Endarreriments: Pendent/);assert.match(app,/extraPaymentMonths/);assert.match(app,/extraReferencePeriod/);assert.match(app,/16,33 pagues/);assert.match(app,/Gratificació Vacances · Gener/);
 assert.doesNotMatch(app,/metro-year-|calcDay\(|documentary-examples|observed/);
 assert.doesNotMatch(app,/Acumulat fins al|No inclou dies futurs/);
 assert.match(app,/Previsió del mes complet segons Còmput/);
 assert.match(app,/premium-history-file/);assert.match(app,/savePremiumHistory/);
 assert.match(await readFile(new URL('../index.html',import.meta.url),'utf8'),/app-v3\.js/);
});

test('Nòmina uses Còmput daily-rounded payable hours without reconverting raw minutes',()=>{
 const f=facts();f.nightHoursMethod='daily-rounded-2';
 for(const d of f.days){d.metrics.nightPayableMinutes=known(170,'min');d.metrics.nightPayableHours=known(2.83,'h');}
 assert.equal(unitsFor(f,'nightPayableMinutes').value,79.24);
 const r=calculate(variableConcepts.find(c=>c.id==='night'),{period:'2026-04',facts:f});
 assert.equal(r.expected.toFixed(2),'225.04');
});

test('97 raw hours remain 96.97 payable hours after the producer daily rounding',()=>{
 const minutes=[...Array(13).fill(170),...Array(4).fill(484),...Array(3).fill(510),144,...Array(9).fill(0)];
 const f={schema:'computo-economic-facts-v1',producer:'computo-aac',version:'1',period:'2026-04',nightHoursMethod:'daily-rounded-2',days:minutes.map((m,i)=>({date:`2026-04-${String(i+1).padStart(2,'0')}`,metrics:{nightPayableMinutes:known(m,'min'),nightPayableHours:known(Number((m/60).toFixed(2)),'h')}}))};
 assert.equal(minutes.reduce((a,b)=>a+b,0)/60,97);
 assert.equal(unitsFor(f,'nightPayableMinutes').value,96.97);
 assert.equal(calculate(variableConcepts.find(c=>c.id==='night'),{period:'2026-04',facts:f}).expected.toFixed(2),'275.39');
});
