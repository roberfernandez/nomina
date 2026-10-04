import test from 'node:test';
import assert from 'node:assert/strict';
import {seniorityAt,payableSeniority,familyUnits,annualVacation,FAMILY_POLICY} from '../src/resolved-rules-v3.js';
import {savePersonal,readPersonal,cleanPersonal} from '../src/personal-profile.js';
import {calculate,fixedConcepts,variableConcepts,ruleFor} from '../src/month-model-v3.js';
const c=id=>[...fixedConcepts,...variableConcepts].find(c=>c.id===id);
const personal=(joined='2002-03-27',births=[])=>({joined,children:births.map(birth=>({birth}))});
const facts=(metric,value,unit,period='2026-04')=>({schema:'computo-economic-facts-v1',producer:'computo-aac',version:'1',period,days:[{date:period+'-01',metrics:{[metric]:{state:'known',value,unit}}}]});
test('I-05 anniversary and payable month are separate; initial biennium',()=>{
 assert.equal(seniorityAt('2002-03-27','2026-03-26').quarters,5);
 assert.equal(seniorityAt('2002-03-27','2026-03-27').quarters,6);
 assert.equal(payableSeniority('2002-03-27','2026-03').quarters,5);
 assert.equal(payableSeniority('2002-03-27','2026-04').quarters,6);
 assert.equal(payableSeniority('2002-03-01','2026-03').quarters,6);
 assert.equal(seniorityAt('2024-01-01','2026-01-01').initialBiennium,true);
 assert.equal(seniorityAt('2028-01-01','2026-01-01').quarters,0);
});
test('seniority is derived, never a universal personal amount',()=>{
 const r=calculate(c('seniority'),{period:'2026-04',profile:{percent:85.81},personal:personal()});
 assert.equal(r.expected.toFixed(2),'382.34');
 assert.equal(calculate(c('seniority'),{period:'2026-04',profile:{percent:50},personal:personal('2022-01-01')}).expected,74.26*.5);
 assert.equal(calculate(c('seniority'),{period:'2026-04',profile:{percent:50}}).expected,null);
});
test('night tariff uses same activity period; hours are not prorated twice',()=>{
 for(const [period,rate] of [['2026-03',2.79],['2026-04',2.84]]){
  const r=calculate(c('night'),{period,profile:{percent:50},facts:facts('nightPayableMinutes',120,'min',period)});
  assert.equal(r.expected,2*rate);assert.equal(r.label,'Estimació');
 }
 assert.equal(c('night').timing,'same');assert.equal(ruleFor(c('night'),'2027-01'),null);
});
test('Convenio and candidate festive E use original units only',()=>{
 assert.equal(calculate(c('conveni'),{period:'2026-04',facts:facts('plusConveniDays',25,'day')}).expected,95.25);
 const r=calculate(c('worked-holiday-e'),{period:'2026-04',facts:facts('plusFestiuDays',2,'day')});assert.equal(r.expected,120);assert.equal(r.label,'Estimació');
 assert.equal(c('worked-holiday').historical,true);
 assert.equal(calculate(c('conveni'),{period:'2026-04'}).expected,null);
});
test('known tariffs do not invent official/special-day entitlement',()=>{
 assert.equal(ruleFor(c('official-holiday'),'2025-01').rate,72.88);
 assert.equal(ruleFor(c('official-holiday'),'2026-01').rate,77.23);
 const r=calculate(c('special-day'),{period:'2026-01',facts:facts('specialRetributiveDays',2,'day','2026-01')});
 assert.equal(r.expected,null);assert.equal(r.labour,null);assert.equal(r.rule.rate,202.39);assert.equal(r.label,'Regla coneguda');
});
test('family counts zero, two and three without contract percentage; ten payments',()=>{
 const p=personal(null,['2018-01-01','2017-01-01','2015-01-01']);
 assert.equal(familyUnits(p,'2026-01').school,3);
 assert.equal(calculate(c('school'),{period:'2026-01',profile:{percent:25},personal:p}).expected,84.51);
 assert.equal(calculate(c('school'),{period:'2026-01',personal:personal(null,p.children.slice(0,2).map(c=>c.birth))}).expected,56.34);
 assert.equal(familyUnits(p,'2026-07').school,0);assert.equal(familyUnits(p,'2026-08').school,0);
 assert.equal(calculate(c('school'),{period:'2026-01',personal:personal()}).hidden,true);
 assert.equal(calculate(c('school'),{period:'2026-01'}).expected,null);
});
test('nursery to school has no double count; course-end rule is revisable',()=>{
 const p=personal(null,['2023-03-27']);
 assert.equal(familyUnits(p,'2026-02').nursery,1);
 assert.equal(familyUnits(p,'2026-03').nursery,0);assert.equal(familyUnits(p,'2026-03').school,1);
 assert.equal(calculate(c('nursery'),{period:'2026-02',personal:p}).expected,96.58);
 assert.equal(familyUnits(personal(null,['2010-03-27']),'2026-06').school,1);
 assert.equal(familyUnits(personal(null,['2010-03-27']),'2026-09').school,0);
 assert.equal(familyUnits(personal(null,['2010-10-27']),'2027-06').school,1);
 assert.equal(FAMILY_POLICY.reviewable,true);
});
test('annual vacation labels constant-percent hypothesis and prorates employment',()=>{
 const full=annualVacation({period:'2026-01',personal:personal(),profile:{percent:85.81}});
 assert.equal(full.expected.toFixed(2),'1266.80');assert.match(full.message,/hipòtesi/);
 const partial=annualVacation({period:'2026-01',personal:personal('2026-07-01'),profile:{percent:100}});
 assert.equal(partial.expected,1476.28*184/365);
 assert.equal(annualVacation({period:'2026-01',profile:{percent:100}}).expected,null);
 const days=Array.from({length:365},(_,i)=>({date:new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10),profile:{percent:i<181?50:100}}));
 const history=annualVacation({period:'2026-01',personal:personal(),profile:{percent:25},history:[{days}]});
 assert.equal(history.expected,1476.28*(181*.5+184)/365);assert.doesNotMatch(history.message,/hipòtesi/);
});
test('vacation average remains known rule, not invented vacation days or double proration',()=>{
 const r=calculate(c('vacation-premiums'),{period:'2026-08',profile:{percent:50}});
 assert.equal(r.expected,null);assert.equal(r.label,'Regla coneguda');assert.match(r.message,/12 mesos/);
});
test('profile stores dates only, isolates accounts and rejects invalid inputs',()=>{
 const m=new Map(),storage={getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)};
 savePersonal(storage,'a',{joined:'2000-01-01',name:'discard',children:[{birth:'2018-01-01',name:'discard'}]},'2026-10-04');
 assert.equal(readPersonal(storage,'b','2026-10-04'),null);
 assert.deepEqual(readPersonal(storage,'a','2026-10-04'),{version:1,joined:'2000-01-01',children:[{birth:'2018-01-01'}]});
 assert.throws(()=>savePersonal(storage,null,personal(),'2026-10-04'));
 assert.throws(()=>cleanPersonal(personal(null,['2026-02-30']),'2026-10-04'));
 assert.throws(()=>cleanPersonal(personal('2027-01-01'),'2026-10-04'));
});
