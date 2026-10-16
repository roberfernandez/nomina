// Personal received amounts are imported on the device, never bundled with the app.
export const PREMIUMS=['penositat','festiu-oficial','festiu-treballat','horari-partit','suplencies','nocturnitat'];
const PREFIX='nomina-premium-history-v1-';
const validPeriod=p=>typeof p==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(p);
const cents=n=>Math.round(n*100);
export function referenceMonths(period){
 if(!validPeriod(period))throw Error('Període incorrecte');
 const [y,m]=period.split('-').map(Number);
 return Array.from({length:12},(_,i)=>new Date(Date.UTC(y,m-13+i,1)).toISOString().slice(0,7));
}
export function parsePremiumHistory(raw){
 const x=typeof raw==='string'?JSON.parse(raw):raw;
 if(x?.schema!=='nomina-premium-history-v1'||!Array.isArray(x.months)||x.months.length>240)throw Error('Historial incompatible');
 const seen=new Set();
 return {schema:x.schema,months:x.months.map(m=>{
  if(!validPeriod(m.period)||seen.has(m.period)||m.complete!==true||typeof m.source!=='string'||!m.source.trim())throw Error('Mes incomplet o duplicat');
  seen.add(m.period);const amounts={};
  for(const id of PREMIUMS){const n=m.amounts?.[id];if(typeof n!=='number'||!Number.isFinite(n)||Math.abs(n)>1000000)throw Error('Import de primes incorrecte');amounts[id]=cents(n)/100;}
  let extraNightAdjustments=null;
  if(m.extraNightAdjustments!==undefined&&m.extraNightAdjustments!==null){
   extraNightAdjustments={};
   for(const quarter of ['03','06','09','12']){const n=m.extraNightAdjustments[quarter];if(typeof n!=='number'||!Number.isFinite(n)||Math.abs(n)>1000000)throw Error('Regularització de paga incorrecta');extraNightAdjustments[quarter]=cents(n)/100;}
  }
  return {period:m.period,complete:true,source:m.source.slice(0,160),amounts,extraNightAdjustments};
 })};
}
export function readPremiumHistory(storage,owner){try{return owner?parsePremiumHistory(storage.getItem(PREFIX+owner)||'null'):null;}catch{return null;}}
export function receivedNightAverage(period,received){
 const periods=referenceMonths(period),months=new Map((received?.months||[]).map(m=>[m.period,m]));
 const missing=periods.filter(p=>!months.has(p));
 if(missing.length)return {expected:null,label:'Pendent de calcular',message:`Falten imports percebuts de Nocturnidad Variable: ${missing.join(', ')}.`};
 const rows=periods.map(p=>({period:p,amount:months.get(p).amounts.nocturnitat,source:months.get(p).source,adjustment:months.get(p).extraNightAdjustments?.[period.slice(5)]??null}));
 const total=rows.reduce((s,r)=>s+cents(r.amount),0)/100;
 if(total<0)return {expected:null,label:'Pendent de calcular',message:'Saldo negatiu de nocturnitat: cal revisar les regularitzacions.'};
 const factor=period.endsWith('-12')?1.3333:1,quarter=period.slice(5);
 const completeLedger=periods.every(p=>months.get(p).extraNightAdjustments!==null&&months.get(p).extraNightAdjustments!==undefined);
 const adjustments=completeLedger?periods.reduce((s,p)=>s+cents(months.get(p).extraNightAdjustments[quarter]||0),0)/100:null;
 // Separate accounting families. This reconciliation is a longitudinally observed
 // criterion, not a personal correction constant or a rule certified by I-102.
 const expected=Math.round((total/12*factor-(adjustments??0)+Number.EPSILON)*100)/100;
 const fmt=n=>new Intl.NumberFormat('ca-ES',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
 return {expected,label:'Estimació',rows,adjustments,calculation:`${fmt(total)} € / 12${factor===1?'':' × 1,3333'}${completeLedger?` − ${fmt(adjustments)} € de regularitzacions de la mateixa paga`:''} = ${fmt(expected)} €`,
  warning:completeLedger?'Criteri provisional de conciliació dels endarreriments, contrastat en rebuts de diversos anys. Pendent de validar l’aplicació general amb TMB i altres perfils.':'Previsió de la mitjana percebuda sense conciliació completa: falta el detall de regularitzacions de les pagues.',
  message:`I-102: mitjana monetària de Nocturnidad Variable. Rebuts ${periods[0]}–${periods[11]}, incloses les regularitzacions identificades amb aquest concepte en el mes d’abonament. ${completeLedger?'Es concilien per separat les regularitzacions de Turno Noche PE del mateix trimestre que s’han abonat dins d’aquest interval. Aquesta conciliació deriva del contrast longitudinal, no del text explícit d’I-102.':''} No s’utilitza l’import de la paga que es comprova, ni s’aplica de nou el percentatge contractual o de meritació.${factor===1?'':' Desembre: factor 1,3333 observat en rebuts, pendent de documentació completa.'}`};
}
export function savePremiumHistory(storage,owner,raw){
 if(!owner)throw Error('Identifica’t abans d’importar l’historial');
 const next=parsePremiumHistory(raw),previous=readPremiumHistory(storage,owner);
 const merged=new Map((previous?.months||[]).map(m=>[m.period,m]));for(const m of next.months)merged.set(m.period,m);
 const result=parsePremiumHistory({schema:next.schema,months:[...merged.values()].sort((a,b)=>a.period.localeCompare(b.period))});
 storage.setItem(PREFIX+owner,JSON.stringify(result));return result;
}
export function vacationHistoryBasis(period,history,received){
 const periods=referenceMonths(period),months=new Map((received?.months||[]).map(m=>[m.period,m]));
 const facts=new Map(history.map(h=>h?.facts||h).filter(f=>f?.period).map(f=>[f.period,f]));
 const missingReceipts=periods.filter(p=>!months.has(p));
 const missingCalendars=[],pendingCalendars=[];let calendarDays=0;
 const rows=periods.map(p=>{
  const f=facts.get(p),count=new Date(Date.UTC(+p.slice(0,4),+p.slice(5),0)).getUTCDate();
  const ds=new Map((f?.days||[]).map(d=>[d.date,d]));let marked=0,unresolved=0;
  for(let i=1;i<=count;i++){const d=ds.get(`${p}-${String(i).padStart(2,'0')}`);if(!d){unresolved++;continue;}if(typeof d.activity?.calendarWorkingDay!=='boolean')unresolved++;else if(d.activity.calendarWorkingDay)marked++;}
  if(!f||ds.size<count)missingCalendars.push(p);else if(unresolved)pendingCalendars.push(p);
  calendarDays+=marked;
  const receipt=months.get(p),total=receipt?PREMIUMS.reduce((s,id)=>s+cents(receipt.amounts[id]),0)/100:null;
  return {period:p,calendarDays:unresolved?null:marked,total,source:receipt?.source||null};
 });
 const diagnostic={rows,missingReceipts,missingCalendars,pendingCalendars,from:periods[0],to:periods[11]};
 if(missingReceipts.length||missingCalendars.length||pendingCalendars.length||!calendarDays)return {...diagnostic,basis:null};
 const total=rows.reduce((s,r)=>s+cents(r.total),0)/100;
 if(total<0)return {...diagnostic,basis:null,reason:'Saldo negatiu de primes: cal revisar les regularitzacions.'};
 return {...diagnostic,basis:{total,calendarDays,confirmed:true,automatic:true,source:`Rebuts ${periods[0]}–${periods[11]} i calendari original de Còmput`,method:'original-calendar-month-window'}};
}
