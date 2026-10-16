import {calculateEntitlement} from './entitlement-rules.js';
import {additionalRule,personalCalculation} from './resolved-rules-v3.js';
import {dictionary} from './dictionary-v2.js';
import {aggregateFacts,accumulatedFacts} from './economics-v2.js';

export const monthNames=['Gener','Febrer','Març','Abril','Maig','Juny','Juliol','Agost','Setembre','Octubre','Novembre','Desembre'];
export const extraPaymentMonths=[3,6,9,12];
export const isPeriod=p=>typeof p==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(p);
export function shiftPeriod(period,delta){
 if(!isPeriod(period)||!Number.isInteger(delta))throw Error('Període no vàlid');
 const d=new Date(Date.UTC(+period.slice(0,4),+period.slice(5)-1+delta,1));
 return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;
}
export function extraReferencePeriod(paymentPeriod){
 if(!isPeriod(paymentPeriod))throw Error('Període no vàlid');
 return paymentPeriod;
}
export const periodLabel=p=>`${monthNames[+p.slice(5)-1]} ${p.slice(0,4)}`;
export function periodContext(period,today){
 if(!isPeriod(period)||!/^\d{4}-\d{2}-\d{2}$/.test(today))throw Error('Data no vàlida');
 return {work:period,liquidation:shiftPeriod(period,1),previousWork:shiftPeriod(period,-1),state:period<today.slice(0,7)?'Mes finalitzat':period===today.slice(0,7)?'Previsió en curs':'Previsió futura'};
}
export function visibleFacts(facts,period,today){
 if(!facts)return null;
 if(facts.period!==period)throw Error('Fets d’un altre període');
 return period===today.slice(0,7)?accumulatedFacts(facts,today):facts;
}
export const metrics=[
 ['ordinaryHours','Hores ordinàries','h'],['nightPayableMinutes','Nocturnitat abonable','h'],
 ['horaNonaHours','Hora Nona','h'],['plusConveniDays','Plus Convenio · comptador','dies'],
 ['plusFestiuDays','Plus Festiu · comptador','dies'],['specialRetributiveDays','Dies especials treballats','dies']
];
export function unitsFor(facts,metric){
 const dailyHours=metric==='nightPayableMinutes'&&facts?.nightHoursMethod==='daily-rounded-2';
 const r=aggregateFacts(facts,dailyHours?'nightPayableHours':metric);
 return {...r,value:r.value===null?null:metric==='nightPayableMinutes'&&!dailyHours?r.value/60:r.value,unit:metric==='nightPayableMinutes'?'h':r.unit};
}
const fixedData=[
 ['salary','Salario Base','Retribució mensual corresponent a la teva categoria professional i jornada contractual. Les altes, baixes i absències poden modificar l’import del mes.'],
 ['seniority','Antigüedad','Complement pels anys de servei a l’empresa. Es genera per quadriennis, amb un bienni inicial quan correspon; l’import depèn de l’antiguitat reconeguda i de la jornada.'],
 ['fixed-premium','Prima Fija','Prima fixa de la retribució mensual, diferenciada dels complements que es generen per hores, dies o serveis concrets. L’import depèn de la jornada i dels ajustos del període.'],
 ['special-fixed','Plus Especial','Complement fix mensual de la retribució. No exigeix treballar una data especial: és diferent del Plus día Especial, que es genera per serveis en dates i franges concretes.'],
 ['aac','Cto. Atención Cliente','Complement mensual associat a la categoria d’Agent d’Atenció al Client. L’import depèn de la jornada i pot variar per altes, absències o altres ajustos del mes.'],
 ['polyvalence','Pr.Polivalencia AAC','Prima mensual de polivalència del personal AAC, diferenciada del complement d’atenció al client. L’import depèn de la jornada i de les condicions aplicables.']
];
export const fixedConcepts=fixedData.map(([id,name,note])=>({id,name,note,kind:'fixed'}));
export const variableConcepts=[
 {id:'night',name:'Nocturnidad Variable',timing:'same',metric:'nightPayableMinutes',note:'Compensa el treball nocturn quan no es percep nocturnitat fixa. La franja de referència és de 22 a 6 h; les hores abonables depenen del torn, la durada nocturna i les condicions aplicables.'},
 {id:'nona',name:'Prima Hora Nona',metric:'horaNonaHours',note:'Compensa el temps treballat entre la vuitena i la novena hora en les jornades elegibles d’explotació adscrites a còmput. Es liquida per fraccions de 15 minuts, segons les condicions de divendres, dissabte, diumenge o festiu.'},
 {id:'conveni',name:'Plus Convenio',timing:'same',metric:'plusConveniDays',note:'Complement vinculat a la presència i la puntualitat. Es genera pels dies treballats i també durant descansos compensatoris, recuperacions de jornada (RJ) i vacances. Determinats retards o permisos poden reduir-lo a la meitat o fer perdre el plus del dia.'},
 {id:'official-holiday',name:'Plus Festivo Oficial',metric:null,note:'Compensa treballar en un festiu laboral oficial. Exigeix un mínim de 4 hores a jornada completa o 2 a temps parcial, exclou el descans setmanal propi i té condicions de compatibilitat amb el Plus día Especial.'},
 {id:'worked-holiday-e',name:'P.Festivo Trabajado E',timing:'same',metric:'plusFestiuDays',note:'Compensa treballar en diumenge, amb mínims de 4 hores a jornada completa o 2 a temps parcial i exclusió del descans setmanal propi. La variant E del rebut es mostra a tarifa íntegra estimada; es manté diferenciada de la variant proporcional.'},
 {id:'worked-holiday',historical:true,name:'Plus Festivo Trabajado',metric:'workedHolidayDays',note:'Compensa treballar en diumenge sota les condicions de jornada, durada mínima i descans propi. Aquesta denominació del rebut es conserva separada de P.Festivo Trabajado E, perquè poden tenir un tractament econòmic diferent.'},
 {id:'special-day',name:'Plus día Especial',metric:null,note:'Compensa el servei efectiu en jornada ordinària dins la franja de 23 h de la vigília a 18 h del dia especial. Inclou les dates reconegudes pel conveni en cada any; les compatibilitats amb altres plusos depenen de quan comença la jornada.'},
 {id:'vacation-bonus',timing:'same',annual:true,name:'Gratificación Vacaciones',metric:null,note:'Abonament anual de vacances que habitualment es percep al gener, separat de les quatre pagues extraordinàries. L’import personal depèn de la permanència, la jornada i les regularitzacions que corresponguin.'},
 {id:'vacation-premiums',timing:'same',name:'Primas en Vacaciones',metric:null,note:'Manté durant les vacances la mitjana diària de determinades primes percebudes els 12 mesos anteriors: penositat, festiu oficial, festiu treballat, horari partit, suplències i nocturnitat variable. Es multiplica pels dies de vacances, inclosos els de l’any anterior quan es gaudeixen ara.'},
 {id:'nursery',timing:'same',name:'Ayuda Guardería',metric:null,note:'Ajuda per fills menors de 3 anys que compleixin els requisits. La referència documental preveu deu mensualitats, de setembre a juny, i un import per fill; els mesos de canvi d’edat requereixen revisar el cas.'},
 {id:'school',timing:'same',name:'Ayuda Escolar',metric:null,note:'Ajuda per fills que compleixin els requisits d’escolaritat i edat. La referència documental preveu deu mensualitats, de setembre a juny, i un import per fill; el límit d’edat i els mesos de transició s’han de contrastar.'}
].map(c=>({...c,kind:'variable'}));
export const extraConcepts=[
 ['extra-salary','Salario Base'],['extra-seniority','Antigüedad'],['extra-fixed-premium','Prima Fija'],['extra-special-fixed','Plus Especial'],['extra-night','Turno Noche']
].map(([id,name])=>({id,name:`${name} · Paga Extra`,family:name,kind:'extra',note:name==='Turno Noche'?'Component de la paga extraordinària que remunera la mitjana de nocturnitat variable dels 12 mesos anteriors. Les regularitzacions poden afectar l’import final.':name==='Antigüedad'?'Part de la paga extraordinària corresponent a l’antiguitat reconeguda. Depèn dels trams abonables, la jornada i les condicions de la paga.':`Part de ${name} inclosa a la paga extraordinària. L’import depèn de la base de la paga, la jornada i la meritació del període.`}));
export function normalizedDictionary(){
 const groups=extraConcepts.map(c=>({...c,description:c.note,formula:c.id==='extra-night'?'Mitjana monetària dels 12 mesos anteriors de Nocturnidad Variable; desembre aplica el factor específic de la paga.':c.id==='extra-seniority'?'Març, juny i setembre: quadriennis/bienni reconeguts × valor del tram × percentatge aplicable. Desembre: mateixa base d’antiguitat × factor 1,3333.':'Base acreditada × percentatge contractual',aliases:[],kind:'extra'}));
 const normal=[];
 for(const c of dictionary){
  const group=groups.find(g=>c.name.startsWith(g.family+' PE '));
  if(group)group.aliases.push(c.name);
  else { const guide=[...fixedConcepts,...variableConcepts].find(item=>item.name===c.name); normal.push({...c,description:guide?.note||c.description,id:`dictionary-${c.id}`,aliases:[c.name]}); }
 }
 return [...normal,...groups];
}
function payableSeniorityForExtra(joined,period){
 if(!joined||!/^\d{4}-\d{2}-\d{2}$/.test(joined))return null;
 const y=+period.slice(0,4),m=+period.slice(5);
 const effectDate=joined.endsWith('-01')
  ? `${period}-01`
  : new Date(Date.UTC(y,m-1,0)).toISOString().slice(0,10);
 let years=+effectDate.slice(0,4)-+joined.slice(0,4);
 const anniversary=`${+joined.slice(0,4)+years}-${joined.slice(5)}`;
 if(anniversary>effectDate)years--;
 return {quarters:Math.max(0,Math.floor(years/4)),initialBiennium:years>=2&&years<4};
}
function definitiveNightRate(period){
 if(!isPeriod(period))return null;
 const y=+period.slice(0,4),m=+period.slice(5);
 if(y===2025)return m<=5?2.46:2.56;
 if(y===2026)return 2.84;
 return null;
}
function extraNightAverage(history,period){
 const months=Array.from({length:12},(_,i)=>shiftPeriod(period,-(i+1)));
 const rows=[];
 for(const p of months){
  const item=history.find(h=>h?.facts?.period===p||h?.period===p);
  const facts=item?.facts||item;
  const rate=definitiveNightRate(p);
  const units=rate===null?null:unitsFor(facts,'nightPayableMinutes');
  if(rate===null||!units||units.value===null||units.state!=='complete')return {expected:null,message:'Calen els 12 mesos anteriors complets de Nocturnidad Variable i una tarifa definitiva coneguda per a cada període.'};
  rows.push({period:p,hours:units.value,rate,amount:units.value*rate});
 }
 const base=rows.reduce((s,r)=>s+r.amount,0)/12;
 const december=period.endsWith('-12');
 const expected=base*(december?1.3333:1);
 return {expected,label:'Estimació',message:`Mitjana monetària de 12 mesos: ${rows.reduce((s,r)=>s+r.amount,0).toFixed(2)} € / 12${december?' × 1,3333 (factor observat a la paga de desembre; fórmula completa encara pendent de fitxa original)':''}. Es recalculen els mesos amb la tarifa definitiva coneguda i no s’aplica de nou el percentatge contractual. Pot haver-hi diferències de cèntims per regularitzacions o primes de vacances.`};
}
export function ruleFor(concept,period){
 if(!isPeriod(period))return null;
 const revised=additionalRule(concept.id,period);if(revised)return revised;
 if(!isPeriod(period)||period.slice(0,4)!=='2026')return null;
 const month=+period.slice(5), id=concept.id;
 const base=id==='salary'?(month<=3?1459.67:1485.15):id==='fixed-premium'?167.03:id==='special-fixed'?287.51:id==='aac'?133.10:id==='polyvalence'?75.14:
 id==='extra-salary'?({3:1459.67,6:1485.15,9:1485.15,12:1485.15*1.3333}[month]??null):
 id==='extra-fixed-premium'&&[3,6,9,12].includes(month)?167.03:id==='extra-special-fixed'&&[3,6,9,12].includes(month)?287.51:null;
 if(base!==null)return {base,formula:'proportional',source:['aac','polyvalence'].includes(id)?'CGT · Complements 2026 i fitxa interna':'Bases explícites de les pagues extra i contrast longitudinal ordinari 2026',limit:'Component íntegre abans d’ajustos; no és el net a cobrar.'};
 if(id==='nona')return {rate:10.35,formula:'units',source:'CGT · Complements 2026; contrast dels rebuts ordinaris',unit:'h'};
 if(id==='extra-seniority'&&[3,6,9,12].includes(month))return {formula:'extra-seniority',base:month===3?1459.67:1485.15,quarterRate:month===3?72.99:74.26,bienniumRate:month===3?36.49:37.13,factor:month===12?1.3333:1,source:'I-70 + contrast longitudinal de pagues extra 2020–2026',message:month===12?'Desembre: antiguitat reconeguda × valor del tram × factor 1,3333 × percentatge aplicable. El factor està acreditat per rebuts i documentació; no s’estén a altres conceptes sense prova.':'Març, juny i setembre: tram d’antiguitat reconegut × valor del tram × percentatge aplicable de la paga.'};
 if(id==='extra-night'&&[3,6,9,12].includes(month))return {formula:'night-average-12m',source:'I-102 · mitjana monetària de Nocturnidad Variable dels 12 mesos anteriors; contrast longitudinal de pagues extra 2024–2026',estimated:true,message:'No s’aplica de nou el percentatge contractual. Les revisions conegudes de tarifa es recalculen sobre el període d’origen; poden quedar diferències de cèntims per regularitzacions o primes de vacances.'};
 return null;
}
export function calculate(concept,{profile,facts,period,personal=null,history=[],vacationBasis=null}){
 if(['official-holiday','special-day','vacation-premiums','worked-holiday-e'].includes(concept.id)){
  const own=calculateEntitlement(concept.id,{facts,profile,period,history,vacationBasis});
  return {...own,rule:{source:concept.id==='vacation-premiums'?'I-98 · Primes en vacances':concept.id==='worked-holiday-e'?'I-38 · Festivo Trabajado E · variant íntegra estimada':'I-78 · Conveni FMB, arts. 9–12'}};
 }
 const rule=ruleFor(concept,period),labour=concept.metric?unitsFor(facts,concept.metric):null;
 const percent=profile?.percent;
 if(rule){const own=personalCalculation(concept.id,rule,{personal,profile,period,history});if(own)return {...own,rule,labour:null,state:own.expected===null?'pending':'component',label:own.expected===null?'Regla coneguda':own.label};
 if(rule.formula==='night-average-12m'){const avg=extraNightAverage(history,period);return {...avg,rule,labour:null,state:avg.expected===null?'pending':'component'};}
 if(rule.formula==='extra-seniority'){
  const s=personalCalculation('seniority',{formula:'seniority',base:rule.base},{personal,profile,period,history});
  if(!s||s.expected===null)return {expected:null,state:'pending',label:'Regla coneguda',rule,labour:null,message:'Cal la data d’incorporació i el percentatge aplicable de la paga.'};
  const senior=payableSeniorityForExtra(personal?.joined,period);
  if(!senior)return {expected:null,state:'pending',label:'Regla coneguda',rule,labour:null,message:'Cal la data d’incorporació.'};
  const ordinaryBase=senior.quarters*rule.quarterRate+(senior.initialBiennium?rule.bienniumRate:0);
  const baseAmount=ordinaryBase*(rule.factor||1);
  const p=profile?.percent;
  const factorText=rule.factor&&rule.factor!==1?` × ${rule.factor.toFixed(4)} = ${baseAmount.toFixed(2)} €`:'';
  return {expected:typeof p==='number'&&p>0&&p<=100?baseAmount*p/100:null,state:typeof p==='number'&&p>0&&p<=100?'component':'pending',label:'Estimació',rule,labour:null,message:`${senior.quarters} quadriennis${senior.initialBiennium?' + bienni inicial':''} × tram documentat = ${ordinaryBase.toFixed(2)} €${factorText} al 100 %. Després s’aplica el percentatge disponible de Cómputo com a previsió; el percentatge efectiu de meritació de la paga pot diferir.`};
 }
 if(['tariff-only','vacation-average'].includes(rule.formula))return {expected:null,state:'pending',label:'Regla coneguda',rule,labour:null,message:rule.message};}
 if(!rule)return {expected:null,state:'pending',rule:null,labour};
 if(rule.formula==='proportional')return {expected:typeof percent==='number'&&Number.isFinite(percent)&&percent>0&&percent<=100?rule.base*percent/100:null,state:typeof percent==='number'&&percent>0&&percent<=100?'component':'pending',rule,labour:null};
 return {expected:labour?.value===null||labour?.value===undefined?null:labour.value*rule.rate,state:labour?.state||'pending',label:labour?.value===null?'Regla coneguda':rule.estimated||labour?.state!=='complete'?'Estimació':'Calculat',message:rule.message,rule,labour};
}
