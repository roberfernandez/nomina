import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateEntitlement as calc,saveVacationBasis,readVacationBasis} from '../src/entitlement-rules.js';
import {parseComputoFacts} from '../src/economics-v2.js';
const act={version:1,status:'FEST',working:false,ordinary:false,weeklyRest:true,scheduleResolved:true,vacation:false};
function month(period){return {schema:'computo-economic-facts-v1',producer:'computo-aac',version:'1',period,profile:{percent:85.81},days:Array.from({length:new Date(Date.UTC(+period.slice(0,4),+period.slice(5),0)).getUTCDate()},(_,i)=>({date:`${period}-${String(i+1).padStart(2,'0')}`,schedule:'—',activity:{...act},metrics:{}}))};}
function work(f,day,schedule){Object.assign(f.days[day-1],{schedule,activity:{...act,status:'AGCG',working:true,ordinary:true,weeklyRest:false}});}
function context(f,history=[]){return {facts:f,profile:f.profile,period:f.period,history};}
test('January: evening holidays outside special window, eve crossing gives one special event',()=>{
 const jan=month('2026-01'),dec=month('2025-12');work(jan,1,'18:46–00:50');work(jan,5,'18:46–02:50');work(jan,6,'18:46–00:50');
 const special=calc('special-day',context(jan,[dec]));assert.equal(special.expected,202.39);assert.deepEqual(special.dates,['2026-01-06']);
 const official=calc('official-holiday',context(jan,[dec]));assert.equal(official.expected,154.46);assert.deepEqual(official.dates,['2026-01-01','2026-01-06']);
});
test('holiday uses the contract percentage, minimum hours and own weekly rest',()=>{
 const f=month('2026-12');work(f,8,'10:00–11:59');assert.equal(calc('official-holiday',context(f)).expected,0);
 work(f,8,'10:00–12:00');assert.equal(calc('official-holiday',context(f)).expected,77.23);
 f.profile.percent=50;assert.equal(calc('official-holiday',context(f)).expected,45);
 f.days[7].activity.weeklyRest=true;assert.equal(calc('official-holiday',context(f)).expected,0);
});
test('daytime special excludes official, eve and day deduplicate, September starts in 2026',()=>{
 const f=month('2026-06');work(f,23,'20:00–02:00');work(f,24,'10:00–14:00');assert.equal(calc('special-day',context(f)).expected,202.39);assert.equal(calc('official-holiday',context(f)).expected,0);
 const old=month('2025-09');work(old,24,'10:00–14:00');assert.equal(calc('special-day',context(old)).expected,0);
 const current=month('2026-09');work(current,24,'10:00–14:00');assert.equal(calc('special-day',context(current)).expected,202.39);
});
test('night boundary includes previous month and never silently uses missing data as zero',()=>{
 const jan=month('2026-01'),dec=month('2025-12');work(dec,31,'22:00–04:00');jan.days[0].activity.weeklyRest=false;
 assert.equal(calc('special-day',context(jan)).expected,null);
 assert.equal(calc('special-day',context(jan,[dec])).expected,202.39);
 assert.equal(calc('official-holiday',context(jan,[dec])).expected,77.23);
 jan.days[0].activity=null;assert.equal(calc('special-day',context(jan,[dec])).expected,null);
});
test('vacation has zero only with resolved absence, needs personal monetary basis, never prorates twice',()=>{
 const f=month('2026-08');assert.equal(calc('vacation-premiums',context(f)).expected,0);
 f.days[2].activity={...act,status:'VACACIONES',weeklyRest:false,vacation:true};
 assert.equal(calc('vacation-premiums',context(f)).expected,null);
 const r=calc('vacation-premiums',{...context(f),vacationBasis:{total:2400,calendarDays:200,source:'Rebuts dels 12 mesos previs; calendari laboral',confirmed:true}});
 assert.equal(r.expected,12);assert.deepEqual(r.dates,['2026-08-03']);
});
test('parser preserves only validated activity facts and monetary basis is isolated by account',()=>{
 const f=month('2026-08');assert.equal(parseComputoFacts(f).days[0].activity.vacation,false);
 const m=new Map(),storage={getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)};
 saveVacationBasis(storage,'a',f.period,{total:2400,calendarDays:200,source:'Font',confirmed:true});assert.equal(readVacationBasis(storage,'b',f.period),null);
 assert.throws(()=>saveVacationBasis(storage,'a',f.period,{total:1,calendarDays:0,source:'Font',confirmed:true}));
});
