// V2 boundary: labour facts come from Cómputo, never from payroll PDFs.
export const units = Object.freeze({ordinaryHours:'h',nightPayableMinutes:'min',horaNonaHours:'h',workedHolidayDays:'day',specialRetributiveDays:'day',plusFestiuDays:'day',plusConveniDays:'day'});
const finite = x => typeof x === 'number' && Number.isFinite(x);
const periodOK = x => typeof x === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(x);
const dateOK = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && Number.isFinite(Date.parse(x)) && new Date(x+'T12:00:00Z').toISOString().slice(0,10) === x;
const label = x => typeof x === 'string' ? x.slice(0,160) : null;
export function profileFromComputo(raw) {
  // Effective percentage is resolved only by Cómputo.
  const p = raw?.percent;
  const n = p === null || p === undefined || p === '' ? null : Number(p);
  return {percent:finite(n)&&n>0&&n<=100?n:null,turn:label(raw?.turn),subturn:label(raw?.subturn),summerPercentage:finite(raw?.summerPercentage)?raw.summerPercentage:null};
}
export function parseComputoFacts(raw) {
  const x=typeof raw==='string'?JSON.parse(raw):raw;
  if(x?.schema!=='computo-economic-facts-v1'||x?.producer!=='computo-aac'||!periodOK(x.period)||!Array.isArray(x.days)||x.days.length>31||x.version!=='1')throw Error('Hechos de Cómputo incompatibles');
  const dates=new Set();
  const days=x.days.map(d=>{
    if(!dateOK(d.date)||!d.date.startsWith(x.period+'-')||dates.has(d.date))throw Error('Fecha inválida o duplicada');
    dates.add(d.date);
    const metrics={};
    for(const [key,unit] of Object.entries(units)){
      const m=d.metrics?.[key];
      if(m?.state==='known'){
        if(m.unit!==unit||!finite(m.value)||m.value<0)throw Error('Unidad o valor incompatible');
        metrics[key]={state:'known',value:m.value,unit};
      }else metrics[key]={state:'pending',value:null,unit,reason:label(m?.reason)||'Resultado no disponible en Cómputo'};
    }
    return {date:d.date,schedule:label(d.schedule),profile:profileFromComputo(d.profile||x.profile),metrics};
  });
  return {schema:x.schema,producer:x.producer,version:label(x.version),period:x.period,profile:profileFromComputo(x.profile),days};
}
export function readAvailableComputo(storage,period) {
  if(!periodOK(period))throw Error('Periodo inválido');
  try {
    const raw=storage.getItem(`metro-payroll-facts-v1-${period.slice(0,4)}`);
    const year=raw?JSON.parse(raw):null;
    if(year && (year.schema!=='metro-payroll-facts-v1'||year.year!==Number(period.slice(0,4))))throw Error();
    const month=year?.months?.[Number(period.slice(5))];
    if(month){const facts=parseComputoFacts(month);if(facts.period!==period)throw Error();return {profile:facts.profile,facts,state:'available'};}
    return {profile:profileFromComputo(year?.profile),facts:null,state:'pending',reason:'No hay hechos resueltos de Cómputo para este periodo.'};
  }catch{return {profile:profileFromComputo(null),facts:null,state:'pending',reason:'No se han podido leer los hechos de Cómputo. No se ha alterado su almacenamiento.'};}
}
export function aggregateFacts(facts,metric) {
  if(!units[metric])throw Error('Magnitud desconocida');
  if(!facts)return {value:null,unit:units[metric],known:0,pending:0,missing:null,state:'pending'};
  const checked=parseComputoFacts(facts);
  const daysInMonth=new Date(Date.UTC(+checked.period.slice(0,4),+checked.period.slice(5),0)).getUTCDate();
  let value=0,known=0,pending=0;
  for(const d of checked.days.filter(d=>!facts.through||d.date<=facts.through)){const m=d.metrics[metric];if(m.state==='known'){known++;value+=m.value;}else pending++;}
  const through=facts.through;
  if(through&&(!dateOK(through)||!through.startsWith(checked.period+'-')))throw Error('Fecha fuera del periodo');
  const missing=(through?Number(through.slice(-2)):daysInMonth)-checked.days.filter(d=>!through||d.date<=through).length;
  return {value:known?value:null,unit:units[metric],known,pending,missing,state:!known?'pending':pending||missing?'partial':'complete'};
}
export function estimateVariable(facts,metric,rule) {
  const labour=aggregateFacts(facts,metric);
  const valid=rule?.status==='documented'&&rule.metric===metric&&finite(rule.rate)&&rule.rate>=0&&typeof rule.source==='string'&&rule.source.trim()&&periodOK(rule.from)&&periodOK(rule.to)&&facts&&facts.period>=rule.from&&facts.period<=rule.to&&rule.scopeConfirmed===true;
  const divisor=units[metric]==='min'&&rule?.unit==='h'?60:rule?.unit===units[metric]?1:null;
  const expected=valid&&divisor&&labour.value!==null?labour.value/divisor*rule.rate:null;
  return {labour,economicRule:rule||null,expected,state:expected===null?'pending':labour.state};
}
export function estimateProportional(profile,rule,period) {
  const percent=profileFromComputo(profile).percent;
  const valid=rule?.status==='documented'&&rule.formula==='base-times-contract'&&finite(rule.base)&&rule.base>=0&&rule.scopeConfirmed===true&&typeof rule.source==='string'&&rule.source.trim()&&periodOK(period)&&periodOK(rule.from)&&periodOK(rule.to)&&period>=rule.from&&period<=rule.to;
  const expected=valid&&percent!==null?rule.base*percent/100:null;
  return {economicRule:rule||null,percent,expected,state:expected===null?'pending':'complete'};
}
export const euros = n => n===null?'Pendiente':new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',useGrouping:'always'}).format(n);
export const percentage = n => n===null?'Pendiente':new Intl.NumberFormat('es-ES',{maximumFractionDigits:4}).format(n)+' %';

// Explicit activity windows. Calendar closure does not imply complete facts.
export function payrollWindows(today) {
  if(!dateOK(today))throw Error('Fecha inválida');
  const current=today.slice(0,7), y=+current.slice(0,4), m=+current.slice(5);
  const previous=`${m===1?y-1:y}-${String(m===1?12:m-1).padStart(2,'0')}`;
  return {closed:{activityPeriod:previous,liquidationPeriod:current,label:'Mes vencido'},ongoing:{activityPeriod:current,through:today,label:'Previsión en curso'}};
}
export function accumulatedFacts(facts,through) {
  if(!facts)return null;
  if(!dateOK(through)||!through.startsWith(facts.period+'-'))throw Error('Fecha fuera del periodo');
  return {...parseComputoFacts(facts),days:facts.days.filter(d=>d.date<=through),through};
}
