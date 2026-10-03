import {conceptModel,laneLabels} from './concept-model-v2.js';
import {dictionary} from './dictionary-v2.js';
import {loadPayrollFacts} from './computo-cloud-v2.js';
import {aggregateFacts,accumulatedFacts,payrollWindows,percentage,euros,estimateVariable,estimateProportional} from './economics-v2.js';
const root=document.querySelector('main');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
let catalogue=dictionary.map(conceptModel),query='',filter='all',selected=null,personal={},generation=0;
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid'}).format(new Date());
const windows=payrollWindows(today);
const number=n=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:4}).format(n);
function personalPanel(c){
 if(c.lane!=='normal')return `<section class="personal-v2"><h2>En tu caso</h2><p>${c.lane==='extra'?'Paga extra: cálculo separado del mes vencido y de la previsión ordinaria. Faltan la base vigente aplicable y las condiciones de devengo.':'Ajuste o atraso: requiere periodo de origen, regla y magnitud específica. No se calcula a partir del mes actual ni se suma automáticamente a los variables.'}</p><strong>Pendiente / No disponible</strong></section>`;
 const periods=c.metric?[windows.closed,windows.ongoing]:[{activityPeriod:windows.ongoing.activityPeriod,label:'Componente fijo del mes actual'}];
 return `<section class="personal-v2"><h2>En tu caso</h2>${periods.map(w=>{
  const loaded=personal[w.activityPeriod],f=loaded?.facts;
  const selectedFacts=w.through?accumulatedFacts(f,w.through):f;
  const total=c.metric?aggregateFacts(selectedFacts,c.metric):null;
  const estimate=c.metric?estimateVariable(selectedFacts,c.metric,c.rule):estimateProportional(loaded?.profile,c.rule,w.activityPeriod);
  const dates=selectedFacts?.days.filter(d=>d.metrics[c.metric]?.state==='known'&&d.metrics[c.metric].value>0)||[];
  return `<article><h3>${esc(w.label)} · ${w.activityPeriod}</h3><p>${w.through?'Acumulado hasta '+esc(w.through):c.metric?'Mes terminado → liquidación a mes vencido de '+w.liquidationPeriod:'Estimación del componente mensual íntegro, antes de ajustes personales.'}${c.metric?' El cierre del calendario no certifica que todos los hechos estén completos.':''}</p><p>${loaded?.reason?esc(loaded.reason):!loaded?'Consultando Cómputo…':`Contrato: ${percentage(loaded.profile?.percent??null)} · ${esc(loaded.profile?.turn||'')}`}</p>${loaded?.syncedAt?`<p class="meta">Última sincronización: ${esc(loaded.syncedAt)}</p>`:''}${total?`<strong>${total.value===null?'Unidades pendientes':number(total.value)+' '+esc(total.unit)}</strong><p>${total.missing===null?'Fechas pendientes de recibir de Cómputo':`${total.pending} fechas pendientes · ${total.missing} fechas sin datos`}.</p>`:''}${estimate.expected!==null?`<p><strong>${euros(estimate.expected)}</strong> · ${c.metric?(estimate.state==='partial'?'Subtotal conocido, no total definitivo':'Previsión económica'):'Componente íntegro, no importe neto a cobrar'}</p><p class="formula-v2">${c.metric?`${number(total.value)} ${esc(total.unit)} × ${euros(c.rule.rate)}/${c.rule.unit}`:`${euros(c.rule.base)} × ${percentage(loaded.profile.percent)}`}</p><p class="meta">${esc(c.rule.source)}. ${c.metric?'':'Los descuentos y ajustes no resueltos no se consideran cero.'}</p>`:'<p class="meta">Resultado económico pendiente: faltan hechos completos o una regla, tarifa y ámbito acreditados. No se aplica automáticamente un precio histórico individual.</p>'}${dates.length?`<details><summary>Fechas que originan las unidades conocidas</summary><ul>${dates.map(d=>`<li>${d.date}: ${number(d.metrics[c.metric].value)} ${esc(d.metrics[c.metric].unit)}</li>`).join('')}</ul></details>`:''}</article>`;
 }).join('')}</section>`;
}
function render(){
 const c=catalogue.find(c=>c.id===selected);
 root.innerHTML=c?`<button id="back" class="link">← Conceptes</button><article class="fiche"><p class="eyebrow">${esc(laneLabels[c.lane])} · ${esc(c.kind)}</p><h1>${esc(c.name)}</h1><p class="lead">${esc(c.description)}</p><section><h2>Cómo se calcula</h2><p class="formula-v2">${esc(c.formula)}</p>${c.note?`<p>${esc(c.note)}</p>`:''}</section><section><h2>Dónde aparece</h2><p>${c.types.map(t=>t==='nomina'?'Nómina normal':'Paga extra').join(' · ')}</p></section>${c.examples?.length?`<details><summary>Ejemplos documentales · no son tus datos actuales</summary>${c.examples.map(e=>`<article class="example-v2"><h3>${esc(e.receipt)} · ${e.period}</h3><p>${esc(e.name)}</p><strong>${e.price!==null&&e.quantity!==null?`${euros(e.price)} × ${new Intl.NumberFormat('es-ES').format(e.quantity)}${c.kind==='Proporcional documentado'?' %':''} → `:''}${euros(e.amount)}</strong><p>Importe impreso${e.deduction?' en descuentos':''} · página ${e.page}. Las diferencias de céntimos no tienen una causa acreditada; no es una tarifa general.</p></article>`).join('')}</details>`:''}${personalPanel(c)}<details><summary>Detalles y límites</summary><p>${esc(c.limits)}</p><p>Catálogo investigado con 107 recibos históricos; las reglas no demostradas siguen pendientes. Nòmina no carga ni analiza nóminas del usuario.</p></details></article>`:`<section class="hero"><img src="./assets/nomina-192.png" width="96" height="96" alt=""><div><h1>Nòmina</h1><p>Entén els conceptes<br>de la teva nòmina</p></div></section><label class="search-label">Cerca un concepte<input id="search" type="search" value="${esc(query)}" placeholder="Salario Base, nocturnidad, Hora Nona…"></label><nav aria-label="Tipo de recibo">${[['all','Todos'],['normal','Nómina ordinaria'],['extra','Pagas extra'],['adjustment','Ajustes y atrasos']].map(([v,t])=>`<button data-filter="${v}" aria-pressed="${filter===v}">${t}</button>`).join('')}</nav><p class="meta">Nombres tal como aparecen en TMB. Mes vencido, previsión en curso, pagas extra y atrasos se tratan por separado.</p><div class="dictionary-list">${catalogue.filter(c=>(filter==='all'||c.lane===filter)&&norm(c.name+' '+c.description).includes(norm(query))).map(c=>`<button data-concept="${c.id}"><span><strong>${esc(c.name)}</strong><small>${esc(c.kind)}</small></span><span aria-hidden="true">›</span></button>`).join('')||'<p>No hay coincidencias.</p>'}</div>`;
 root.querySelector('#back')?.addEventListener('click',()=>{selected=null;render();});
 root.querySelectorAll('[data-concept]').forEach(b=>b.onclick=()=>{selected=b.dataset.concept;render();window.scrollTo(0,0);});
 root.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render();});
 root.querySelector('#search')?.addEventListener('input',e=>{query=e.target.value;const pos=e.target.selectionStart;render();const input=root.querySelector('#search');input.focus();input.setSelectionRange(pos,pos);});
}
async function refresh(){const id=++generation;personal={};render();for(const w of [windows.closed,windows.ongoing]){const result=await loadPayrollFacts(w.activityPeriod);if(id!==generation)return;personal[w.activityPeriod]=result;render();}}
document.querySelector('[data-section="home"]')?.addEventListener('click',()=>{selected=null;query='';filter='all';render();});
window.addEventListener('storage',()=>refresh());
window.addEventListener('focus',()=>refresh());
render();refresh();
// Local development only: curated examples, never PDF ingestion or public build data.
if(['127.0.0.1','localhost'].includes(location.hostname))fetch('/documentary-examples').then(r=>r.ok?r.json():null).then(data=>{if(Array.isArray(data)){catalogue=dictionary.map(c=>conceptModel({...c,examples:data.find(e=>e.id===c.id)?.examples}));render();}}).catch(()=>{});

if('serviceWorker' in navigator && !['127.0.0.1','localhost'].includes(location.hostname)) navigator.serviceWorker.register('./sw.js').catch(()=>{});
