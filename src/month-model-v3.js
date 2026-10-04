import {dictionary} from './dictionary-v2.js';
import {aggregateFacts,accumulatedFacts} from './economics-v2.js';

export const monthNames=['Gener','Febrer','Març','Abril','Maig','Juny','Juliol','Agost','Setembre','Octubre','Novembre','Desembre'];
export const isPeriod=p=>typeof p==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(p);
export function shiftPeriod(period,delta){
 if(!isPeriod(period)||!Number.isInteger(delta))throw Error('Període no vàlid');
 const d=new Date(Date.UTC(+period.slice(0,4),+period.slice(5)-1+delta,1));
 return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;
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
 const r=aggregateFacts(facts,metric);
 return {...r,value:r.value===null?null:metric==='nightPayableMinutes'?r.value/60:r.value,unit:metric==='nightPayableMinutes'?'h':r.unit};
}
const fixedData=[
 ['salary','Salario Base','Base mensual de categoria; component íntegre abans de descomptes i regularitzacions.'],
 ['seniority','Antigüedad','Cal la base individual per antiguitat. El percentatge contractual no informa els triennis.'],
 ['fixed-premium','Prima Fija','Component proporcional independent de les primes variables.'],
 ['special-fixed','Plus Especial','Complement fix: no és el Plus día Especial.'],
 ['aac','Cto. Atención Cliente','Component mensual AAC íntegre; ajustos per absències o altes parcials pendents.'],
 ['polyvalence','Pr.Polivalencia AAC','Prima AAC independent del complement d’atenció al client.']
];
export const fixedConcepts=fixedData.map(([id,name,note])=>({id,name,note,kind:'fixed'}));
export const variableConcepts=[
 {id:'night',name:'Nocturnidad Variable',metric:'nightPayableMinutes',note:'Minuts abonables resolts per Cómputo. La precisió de la tarifa impresa no acredita un import exacte.'},
 {id:'nona',name:'Prima Hora Nona',metric:'horaNonaHours',note:'Unitats resoltes per Cómputo × tarifa. Les diferències històriques de període no modifiquen aquestes unitats.'},
 {id:'conveni',name:'Plus Convenio',metric:'plusConveniDays',note:'El comptador no resol puntualitat, reduccions ni equivalències diàries de tots els contractes. Càlcul econòmic pendent.'},
 {id:'official-holiday',name:'Plus Festivo Oficial',metric:null,note:'Concepte diferent del diumenge treballat i del Dia Especial. El seu nombre d’unitats no existeix encara en l’export.'},
 {id:'worked-holiday-e',name:'P.Festivo Trabajado E',metric:'workedHolidayDays',note:'La sèrie a mes vençut no acredita equivalència estable amb Plus Festiu. No s’inventa el significat de la lletra E.'},
 {id:'worked-holiday',name:'Plus Festivo Trabajado',metric:'workedHolidayDays',note:'Es conserva separat de la variant E. Sense una equivalència acreditada no se sumen ni s’intercanvien.'},
 {id:'special-day',name:'Plus día Especial',metric:'specialRetributiveDays',note:'Les dates especials treballades són un fet laboral. La seva equivalència amb el plus retribuït, franges i compatibilitats continua pendent.'},
 {id:'vacation-bonus',name:'Gratificación Vacaciones',metric:null,note:'No és Primas en Vacaciones. No es generalitza l’import d’un rebut individual.'},
 {id:'vacation-premiums',name:'Primas en Vacaciones',metric:null,note:'Requereix mitjana individual acreditada i unitats específiques. No es dedueix dels PDF de l’usuari.'},
 {id:'school',name:'Ayuda Escolar',metric:null,note:'Depèn de requisits personals no disponibles a Cómputo. Hi ha regularitzacions documentals; no es pressuposa el dret.'}
].map(c=>({...c,kind:'variable'}));
export const extraConcepts=[
 ['extra-salary','Salario Base'],['extra-seniority','Antigüedad'],['extra-fixed-premium','Prima Fija'],['extra-special-fixed','Plus Especial'],['extra-night','Turno Noche']
].map(([id,name])=>({id,name:`${name} · Paga Extra`,family:name,kind:'extra',note:name==='Turno Noche'?'Sense base ni unitats acreditades. No equival a Nocturnidad Variable.':'Fórmula documental: base de la paga × percentatge contractual. Component íntegre; ajustos de meritació pendents.'}));
export function normalizedDictionary(){
 const groups=extraConcepts.map(c=>({...c,description:c.note,formula:c.id==='extra-night'||c.id==='extra-seniority'?'Base individual o regla pendent':'Base acreditada × percentatge contractual',aliases:[],kind:'extra'}));
 const normal=[];
 for(const c of dictionary){
  const group=groups.find(g=>c.name.startsWith(g.family+' PE '));
  if(group)group.aliases.push(c.name);
  else normal.push({...c,id:`dictionary-${c.id}`,aliases:[c.name]});
 }
 return [...normal,...groups];
}
export function ruleFor(concept,period){
 if(!isPeriod(period)||period.slice(0,4)!=='2026')return null;
 const month=+period.slice(5), id=concept.id;
 const base=id==='salary'?(month<=3?1459.67:1485.15):id==='fixed-premium'?167.03:id==='special-fixed'?287.51:id==='aac'?133.10:id==='polyvalence'?75.14:
 id==='extra-salary'?({3:1459.67,6:1485.15,9:1485.15}[month]??null):
 id==='extra-fixed-premium'&&[3,6,9].includes(month)?167.03:id==='extra-special-fixed'&&[3,6,9].includes(month)?287.51:null;
 if(base!==null)return {base,formula:'proportional',source:['aac','polyvalence'].includes(id)?'CGT · Complements 2026 i fitxa interna':'Bases explícites de les pagues extra i contrast longitudinal ordinari 2026',limit:'Component íntegre abans d’ajustos; no és el net a cobrar.'};
 if(id==='nona')return {rate:10.35,formula:'units',source:'CGT · Complements 2026; contrast dels rebuts ordinaris',unit:'h'};
 return null;
}
export function calculate(concept,{profile,facts,period}){
 const rule=ruleFor(concept,period),labour=concept.metric?unitsFor(facts,concept.metric):null;
 const percent=profile?.percent;
 if(!rule)return {expected:null,state:'pending',rule:null,labour};
 if(rule.formula==='proportional')return {expected:typeof percent==='number'&&Number.isFinite(percent)&&percent>0&&percent<=100?rule.base*percent/100:null,state:typeof percent==='number'&&percent>0&&percent<=100?'component':'pending',rule,labour:null};
 return {expected:labour?.value===null||labour?.value===undefined?null:labour.value*rule.rate,state:labour?.state||'pending',rule,labour};
}
