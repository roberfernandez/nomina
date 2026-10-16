import test from 'node:test';
import assert from 'node:assert/strict';
import {PREMIUMS,referenceMonths,parsePremiumHistory,readPremiumHistory,savePremiumHistory,vacationHistoryBasis,receivedNightAverage} from '../src/vacation-history.js';
import {calculateEntitlement} from '../src/entitlement-rules.js';
import {parseComputoFacts} from '../src/economics-v2.js';
import {extraConcepts,calculate} from '../src/month-model-v3.js';
const periods=referenceMonths('2026-08');
function fixtures(){
 const received={schema:'nomina-premium-history-v1',months:periods.map(period=>({period,source:`${period} · rebut complet`,complete:true,amounts:Object.fromEntries(PREMIUMS.map(id=>[id,id==='nocturnitat'?100:0]))}))};
 const history=periods.map(period=>({period,days:Array.from({length:new Date(Date.UTC(+period.slice(0,4),+period.slice(5),0)).getUTCDate()},(_,i)=>({date:`${period}-${String(i+1).padStart(2,'0')}`,activity:{calendarWorkingDay:i<20}}))}));
 return {received,history};
}
test('rolling twelve months cross years and never include the receipt under review',()=>{
 assert.deepEqual([periods[0],periods.at(-1)],['2025-08','2026-07']);
 assert.deepEqual([referenceMonths('2026-03')[0],referenceMonths('2026-03').at(-1)],['2025-03','2026-02']);
 assert.throws(()=>referenceMonths('2026-13'));
});
test('automatic amount uses all six received premiums and complete original calendar; no repeated contract percentage',()=>{
 const {received,history}=fixtures();received.months[0].amounts['festiu-oficial']=120;
 const b=vacationHistoryBasis('2026-08',history,parsePremiumHistory(received));
 assert.equal(b.basis.total,1320);assert.equal(b.basis.calendarDays,240);
 const facts={period:'2026-08',days:Array.from({length:31},(_,i)=>({date:`2026-08-${String(i+1).padStart(2,'0')}`,activity:{vacation:i<21}}))};
 const r=calculateEntitlement('vacation-premiums',{facts,period:facts.period,profile:{percent:50},vacationBasis:b.basis});
 assert.equal(r.expected,115.5);assert.equal(r.labour.value,21);assert.match(r.message,/provisional/);
});
test('a missing receipt, calendar day or original status blocks automatic basis rather than treating it as zero',()=>{
 const {received,history}=fixtures();
 assert.equal(vacationHistoryBasis('2026-08',history,{...received,months:received.months.slice(1)}).basis,null);
 history[0].days.pop();assert.deepEqual(vacationHistoryBasis('2026-08',history,received).missingCalendars,['2025-08']);
 const x=fixtures();x.history[0].days[0].activity.calendarWorkingDay=null;
 assert.deepEqual(vacationHistoryBasis('2026-08',x.history,x.received).pendingCalendars,['2025-08']);
});
test('received history is account scoped, merges months atomically, keeps explicit zeros and signed adjustments',()=>{
 const m=new Map(),s={getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)},x=fixtures().received;
 x.months[0].amounts.suplencies=-0.12;savePremiumHistory(s,'a',x);
 assert.equal(readPremiumHistory(s,'b'),null);assert.equal(readPremiumHistory(s,'a').months[0].amounts.suplencies,-0.12);
 const bad=structuredClone(x);delete bad.months[0].amounts.nocturnitat;
 assert.throws(()=>savePremiumHistory(s,'a',bad));assert.equal(readPremiumHistory(s,'a').months.length,12);
 assert.throws(()=>parsePremiumHistory({...x,months:[x.months[0],x.months[0]]}));
});
test('calendar original survives parsing; older exports stay unresolved',()=>{
 const raw={schema:'computo-economic-facts-v1',producer:'computo-aac',version:'1',period:'2026-08',days:[{date:'2026-08-01',activity:{version:1,vacation:true,calendarWorkingDay:true}}]};
 assert.equal(parseComputoFacts(raw).days[0].activity.calendarWorkingDay,true);
 delete raw.days[0].activity.calendarWorkingDay;assert.equal(parseComputoFacts(raw).days[0].activity.calendarWorkingDay,null);
});
test('extra night can use received amounts without calendar hours or a second attendance percentage',()=>{
 const c=extraConcepts.find(c=>c.id==='extra-night');
 const received=fixtures().received;
 received.months=referenceMonths('2026-03').map(period=>({...received.months[0],period,amounts:{...received.months[0].amounts,nocturnitat:200}}));
 for(const percent of [85.48,85.81,100]){
  const r=calculate(c,{period:'2026-03',profile:{percent},history:[],receivedHistory:received});
  assert.equal(r.expected,200);assert.equal(r.rows.length,12);assert.match(r.warning,/regularitzacions/);
 }
 received.months.pop();assert.equal(calculate(c,{period:'2026-03',receivedHistory:received}).expected,null);
});
test('extra reconciliation selects the matching quarter inside the reference window, without a personal constant',()=>{
 for(const period of ['2026-03','2026-06','2026-09','2026-12']){
  const quarter=period.slice(5),months=referenceMonths(period).map(p=>({period:p,complete:true,source:'Rebut complet',amounts:Object.fromEntries(PREMIUMS.map(id=>[id,id==='nocturnitat'?120:0])),extraNightAdjustments:{'03':0,'06':0,'09':0,'12':0}}));
  months[4].extraNightAdjustments[quarter]=2.37;
  months[5].extraNightAdjustments[quarter]=1.14;
  months[4].extraNightAdjustments[quarter==='03'?'06':'03']=19.5;
  months.push({...months[0],period,extraNightAdjustments:{'03':99,'06':99,'09':99,'12':99}});
  const r=receivedNightAverage(period,parsePremiumHistory({schema:'nomina-premium-history-v1',months}));
  assert.equal(r.adjustments,3.51);assert.equal(r.expected,period.endsWith('-12')?156.49:116.49);
 }
});
