import {validDate} from './personal-profile.js';
export const FAMILY_POLICY=Object.freeze({reviewable:true,schoolEnd:'June of school year containing sixteenth birthday',monthAssessment:'month-end',paidMonths:[1,2,3,4,5,6,9,10,11,12]});
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
export const lastDay=p=>`${p}-${new Date(Date.UTC(+p.slice(0,4),+p.slice(5),0)).getUTCDate()}`;
function anniversary(birth,years){const y=+birth.slice(0,4)+years,m=+birth.slice(5,7),day=Math.min(+birth.slice(8),new Date(Date.UTC(y,m,0)).getUTCDate());return `${y}-${birth.slice(5,7)}-${String(day).padStart(2,'0')}`;}
export function seniorityAt(joined,date){
 if(!validDate(joined)||!validDate(date))return null;
 let years=+date.slice(0,4)-+joined.slice(0,4);if(anniversary(joined,years)>date)years--;
 return {quarters:Math.max(0,Math.floor(years/4)),initialBiennium:years>=2&&years<4};
}
export function payableSeniority(joined,period){
 // I-05: month after anniversary, except entry on the first of the month.
 const date=joined?.endsWith('-01')?period+'-01':new Date(Date.UTC(+period.slice(0,4),+period.slice(5)-1,0)).toISOString().slice(0,10);
 return seniorityAt(joined,date);
}
export function familyUnits(personal,period){
 if(!personal)return null;
 const date=lastDay(period),paid=FAMILY_POLICY.paidMonths.includes(+period.slice(5));let school=0,nursery=0,transition=false;
 for(const {birth} of personal.children){
  if(birth>date)continue;
  const third=anniversary(birth,3),sixteenth=anniversary(birth,16),endYear=+sixteenth.slice(0,4)+(+sixteenth.slice(5,7)>=9?1:0);
  if(third.startsWith(period)||birth.startsWith(period))transition=true;
  if(date<third)nursery++;else if(date<=`${endYear}-06-30`)school++;
 }
 return {school:paid?school:0,nursery:paid?nursery:0,transition,paid};
}
export function additionalRule(id,period){
 const year=+period.slice(0,4),m=+period.slice(5);
 if(id==='official-holiday'&&[2025,2026].includes(year))return {rate:year===2025?72.88:77.23,formula:'tariff-only',unit:'day',source:'Taula / contrast documental del període',message:'Unitats encara no derivables automàticament.'};
 if(year!==2026)return null;
 const common={source:'Contrast documental 2026',formula:'units',unit:'day'};
 if(id==='night')return {...common,rate:m<=3?2.79:2.84,unit:'h',estimated:true,message:'Import estimat amb tarifa impresa; la precisió interna de TMB pot produir diferències de cèntims.'};
 if(id==='conveni')return {...common,rate:3.81};
 if(id==='worked-holiday-e')return {...common,rate:60,estimated:true,message:'Mètrica candidata: diumenges treballats. Anomalies de gener i març no resoltes. I-38 no acredita el significat de la E.'};
 if(id==='special-day')return {...common,rate:202.39,formula:'tariff-only',message:'Cal determinar quins dies especials generen el dret econòmic; no s’aplica el comptador automàticament.'};
 if(id==='seniority')return {formula:'seniority',base:m<=3?1459.67:1485.15,source:'I-05 · 5 % del salari base per quadrienni; bienni inicial al 2,5 %.'};
 if(id==='vacation-bonus')return {formula:'annual',base:1476.28,source:'I-30 · Gratificació vacances anual, abonament habitual al gener i regularització per permanència/jornada.'};
 if(id==='vacation-premiums')return {formula:'vacation-average',source:'Primas en Vacaciones · mitjana individual dels 12 mesos anteriors',message:'Dies de vacances × mitjana diària de primes dels 12 mesos anteriors. Mitjana diària pendent d’historial econòmic; dies de vacances encara no disponibles a l’export actual. Sense aplicar de nou el percentatge.'};
 if(id==='school'||id==='nursery')return {...common,formula:'family',rate:id==='school'?28.17:96.58,source:'I-10 / I-10_1 · 10 mensualitats, setembre–juny',message:'Estimació segons dates de naixement. Regla provisional revisable: tall al final del curs dels 16 anys; valoració a final de mes, sense doble ajuda. Guarderia abans dels 3 anys segons el criteri provisional acordat.'};
 return null;
}
export function annualVacation({personal,profile,history=[],period}){
 if(!personal?.joined)return {expected:null,message:'Falta la data d’incorporació. Base anual 1.476,28 €; cal permanència i historial de jornada.'};
 const y=+period.slice(0,4),start=`${y}-01-01`,end=`${y}-12-31`,from=personal.joined>start?personal.joined:start;
 if(from>end)return {expected:0,message:'Incorporació posterior a aquest exercici.'};
 const count=(Date.parse(end)-Date.parse(start))/86400000+1,days=(Date.parse(end)-Date.parse(from))/86400000+1;
 // Only explicit daily profiles prove historical percentages; a snapshot month profile does not.
 const daily=new Map();for(const f of history)for(const d of f?.days||[])if(d.date>=from&&d.date<=end&&d.profile?.percent>0&&d.profile.percent<=100)daily.set(d.date,d.profile.percent);
 if(daily.size===days)return {expected:1476.28*[...daily.values()].reduce((s,p)=>s+p/100,0)/count,message:'Prorrateig diari de l’exercici amb historial explícit de jornada. Subjecte a regularització i continuïtat contractual.'};
 const percent=profile?.percent;
 return {expected:percent>0&&percent<=100?1476.28*percent/100*days/count:null,message:`Escenari estimat de permanència ${from}–${end}, no liquidació definitiva. Falta historial complet de percentatges/continuïtat: s’utilitza el percentatge actual només com a hipòtesi constant. Base anual × percentatge × ${days}/${count}.`};
}
export function personalCalculation(id,rule,{personal,profile,period,history}){
 if(rule.formula==='seniority'){
  const s=payableSeniority(personal?.joined,period),actual=seniorityAt(personal?.joined,lastDay(period));
  return {expected:s&&profile?.percent>0&&profile.percent<=100?(round(rule.base*.05)*s.quarters+(s.initialBiennium?round(rule.base*.025):0))*profile.percent/100:null,label:'Calculat',message:s?`${actual.quarters} quadriennis complerts al final del mes; ${s.quarters} abonables${s.initialBiennium?' + bienni inicial':''}. I-05: efecte el mes següent, excepte incorporació el dia 1. Base × 5 % per quadrienni (arrodonit a cèntims) × percentatge contractual. Component íntegre abans d’ajustos.`:'Introdueix la data d’incorporació a Perfil; el percentatge arriba de Cómputo.'};
 }
 if(rule.formula==='family'){
  const u=familyUnits(personal,period),n=u?.[id==='school'?'school':'nursery'];
  return {expected:n===undefined?null:n*rule.rate,label:'Estimació',hidden:n===0,message:u?`${n} fills elegibles × ${rule.rate.toFixed(2)} €; sense percentatge contractual. ${u.transition?'Mes de transició d’edat: criteri de final de mes revisable. ':''}${rule.message}`:'Desa les dates de naixement a Perfil, o desa sense fills si no en tens.'};
 }
 if(rule.formula==='annual')return {...annualVacation({personal,profile,period,history}),label:'Estimació'};
 return null;
}
