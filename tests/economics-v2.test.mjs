import test from 'node:test';
import assert from 'node:assert/strict';
import {profileFromComputo,parseComputoFacts,readAvailableComputo,aggregateFacts,estimateVariable,estimateProportional,euros,percentage,payrollWindows,accumulatedFacts} from '../src/economics-v2.js';
const facts=(metrics={})=>({schema:'computo-economic-facts-v1',producer:'computo-aac',version:'1',period:'2026-02',profile:{turn:'T8',percent:50},days:Array.from({length:28},(_,i)=>({date:`2026-02-${String(i+1).padStart(2,'0')}`,metrics}))});
const known=(value,unit)=>({state:'known',value,unit});
const rule=(metric,unit)=>({status:'documented',metric,unit,rate:2,source:'Synthetic test only',from:'2026-01',to:'2026-12',scopeConfirmed:true});
test('V2 preserves all percentages and explicit percentages on any turn',()=>{
  for(const turn of ['T1','T2','T4','T5','T8'])for(const percent of [25,50,75,85.81,100])assert.equal(profileFromComputo({turn,percent}).percent,percent);
  assert.equal(profileFromComputo({turn:'T8',percent:75,subturn:'T8.4'}).subturn,'T8.4');
  assert.equal(profileFromComputo({turn:'T8'}).percent,null);
  assert.equal(profileFromComputo(null).percent,null);
});
test('V2 reads existing profile without requesting re-entry or writing storage',()=>{
  const s={getItem:k=>k==='metro-payroll-facts-v1-2026'?JSON.stringify({schema:'metro-payroll-facts-v1',year:2026,profile:{turn:'T8',percent:75},months:{}}):null};
  const r=readAvailableComputo(s,'2026-02');assert.equal(r.profile.percent,75);assert.equal(r.facts,null);assert.equal(r.state,'pending');
});
test('V2 never obtains units from observed payroll or schedule',()=>{
  const f=facts();f.days[0].schedule='18:46–02:50';
  const r=estimateVariable(f,'nightPayableMinutes',rule('nightPayableMinutes','h'),{amount:1000});
  assert.equal(r.expected,null);assert.equal(r.labour.value,null);assert.ok(!("observed" in r));
});
test('V2 uses Cómputo Hora Nona directly, without recalculation or cap',()=>{
  const f=facts({horaNonaHours:known(0,'h')});f.days[0].metrics={horaNonaHours:known(1.25,'h')};
  const r=estimateVariable(f,'horaNonaHours',rule('horaNonaHours','h'));assert.equal(r.expected,2.5);assert.equal(r.state,'complete');
});
test('V2 converts minutes once and never reapplies contract percentage',()=>{
  const f=facts({nightPayableMinutes:known(0,'min')});f.days[0].metrics={nightPayableMinutes:known(480,'min')};
  assert.equal(estimateVariable(f,'nightPayableMinutes',rule('nightPayableMinutes','h')).expected,16);
});
test('V2 separates festive, special and Plus Festiu units',()=>{
  const f=facts({workedHolidayDays:known(0,'day'),specialRetributiveDays:known(0,'day'),plusFestiuDays:known(0,'day')});
  f.days[0].metrics={workedHolidayDays:known(2,'day'),specialRetributiveDays:known(1,'day'),plusFestiuDays:known(3,'day')};
  for(const [m,n] of [['workedHolidayDays',2],['specialRetributiveDays',1],['plusFestiuDays',3]])assert.equal(aggregateFacts(f,m).value,n);
});
test('V2 preserves partial results independently of calendar closure',()=>{
  const f=facts({ordinaryHours:known(0,'h')});f.days.pop();f.days[0].metrics={ordinaryHours:known(8,'h')};f.days[1].metrics={};
  const r=estimateVariable(f,'ordinaryHours',rule('ordinaryHours','h'),{amount:20});assert.equal(r.expected,16);assert.equal(r.state,'partial');assert.equal(r.labour.missing,1);assert.equal(r.labour.pending,1);assert.ok(!("observed" in r));
});
test('V2 rejects duplicate dates, incompatible units and alien producers',()=>{
  let f=facts();f.days.push(f.days[0]);assert.throws(()=>parseComputoFacts(f));
  f=facts({nightPayableMinutes:known(8,'h')});assert.throws(()=>parseComputoFacts(f));
  f=facts();f.producer='pdf';assert.throws(()=>parseComputoFacts(f));
});
test('V2 rejects stale tariffs, unconfirmed scope, and speculative formulas',()=>{
  const f=facts({ordinaryHours:known(1,'h')}),r=rule('ordinaryHours','h');
  for(const patch of [{to:'2025-12'},{scopeConfirmed:false},{status:'hypothesis'},{unit:'day'}])assert.equal(estimateVariable(f,'ordinaryHours',{...r,...patch}).expected,null);
});
test('V2 proportional rule requires evidence and applies any supplied percentage',()=>{
  const r={status:'documented',formula:'base-times-contract',base:1000,source:'Synthetic',from:'2026-01',to:'2026-12',scopeConfirmed:true};
  for(const percent of [25,50,75,85.81,100])assert.equal(estimateProportional({percent},r,'2026-02').expected,1000*percent/100);
  assert.equal(estimateProportional({},r,'2026-02').expected,null);
  assert.equal(estimateProportional({percent:75},{...r,formula:'unknown'},'2026-02').expected,null);
});
test('V2 Spanish display and privacy allowlist',()=>{
  assert.match(euros(1485.15),/1\.485,15/);assert.equal(percentage(85.81),'85,81 %');
  const f=facts();f.name='Not to preserve';f.days[0].notes='Private';
  assert.ok(!JSON.stringify(parseComputoFacts(f)).includes('Private'));assert.ok(!JSON.stringify(parseComputoFacts(f)).includes('Not to preserve'));
});

test('closed activity and ongoing forecast never share units; January crosses year',()=>{
  assert.equal(payrollWindows('2026-01-03').closed.activityPeriod,'2025-12');
  assert.equal(payrollWindows('2026-10-03').closed.activityPeriod,'2026-09');
  const f=facts({horaNonaHours:known(1,'h')});
  const current=accumulatedFacts(f,'2026-02-03');
  assert.equal(aggregateFacts(current,'horaNonaHours').value,3);
  assert.equal(aggregateFacts(current,'horaNonaHours').missing,0);
  assert.equal(aggregateFacts(f,'horaNonaHours').value,28);
});
