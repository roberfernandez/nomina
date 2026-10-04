import {createProfileSync,markProfileDirty} from './profile-sync.js';
import {profileOwner,readPersonal,savePersonal} from './personal-profile.js';
import {loadPayrollFacts} from './computo-cloud-v2.js';
import {euros,percentage} from './economics-v2.js';
import {monthNames,periodLabel,shiftPeriod,periodContext,visibleFacts,metrics,unitsFor,fixedConcepts,variableConcepts,extraConcepts,normalizedDictionary,calculate,isPeriod} from './month-model-v3.js';

const root=document.querySelector('main');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>n===null||n===undefined?'Pendent':new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(n);
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid'}).format(new Date());
const dictionary=normalizedDictionary();
let year=2026,query='',generation=0,cache=new Map(),profileEditing=false,profileSyncState={message:'Comprovant sincronització del perfil…'};
const syncProfile=createProfileSync(localStorage,fetch,today);
async function syncPersonal(choice){profileSyncState=await syncProfile(choice);if(route()==='profile'&&profileEditing){const el=root.querySelector('#profile-message');if(el)el.textContent=profileSyncState.message;return;}render();}
const href=route=>`#${route}`;
function route(){return decodeURIComponent(location.hash.slice(1));}
function ensure(period){
 if(cache.has(period))return;
 cache.set(period,{loading:true});const g=generation;
 loadPayrollFacts(period).then(data=>{if(g!==generation)return;cache.set(period,data);render();});
}
function availability(data){return data?.loading?'Consultant Cómputo…':data?.reason?esc(data.reason):data?.profile?`Contracte ${percentage(data.profile.percent)} · ${esc(data.profile.turn||'')} ${esc(data.profile.subturn||'')}`:'Fets pendents de Cómputo';}
function dates(facts,metric){
 const ds=facts?.days.filter(d=>d.metrics[metric]?.state==='known'&&d.metrics[metric].value>0)||[];
 return ds.length?`<details><summary>Dates que originen les unitats</summary><ul>${ds.map(d=>`<li>${d.date}: ${number(d.metrics[metric].value/(metric==='nightPayableMinutes'?60:1))} ${metric==='nightPayableMinutes'?'h':esc(d.metrics[metric].unit)}</li>`).join('')}</ul></details>`:'';
}
function labourText(l){
 if(!l||l.value===null)return 'Pendent / No disponible';
 return `${number(l.value)} ${l.unit==='day'?'dies':esc(l.unit)}${l.state==='complete'?'':' · subtotal conegut'}`;
}
function personal(){try{return readPersonal(localStorage,profileOwner(localStorage),today());}catch{return null;}}
function card(c,data,facts,period){
 const result=calculate(c,{profile:data?.profile,facts,period,personal:personal()});
 if(result.hidden)return '';
 const label=result.label||(result.expected===null?(result.rule?'Regla coneguda':'Pendent'):result.state==='partial'?'Estimació':'Calculat');
 const amount=result.expected===null?label:euros(result.expected);
 const r=result.rule;
 const formula=r?.formula==='proportional'?`${euros(r.base)} × ${percentage(data?.profile?.percent??null)}`:r?.rate!==undefined?`${r.formula==='tariff-only'?'Tarifa '+period.slice(0,4)+': ':r.formula==='family'?'Tarifa per fill: ':result.labour?.value===null?'Unitats no disponibles × ':number(result.labour?.value)+' '+(r.unit==='h'?'h':'unitats')+' × '}${euros(r.rate)}/${r.unit==='h'?'h':'unitat'}`:result.message||'Regla o dades encara no disponibles';
 return `<article class="pay-card"><div class="pay-card-head"><h3>${esc(c.name)}</h3><strong class="amount ${result.expected===null?'pending':''}">${amount}</strong></div><span class="badge">${label}</span><p>${esc(c.note)}</p>${result.labour?`<p><b>Fets de Cómputo:</b> ${labourText(result.labour)}</p>${result.labour.missing===null?'':`<p class="meta">${result.labour.pending} dates pendents · ${result.labour.missing} dates sense dades.</p>`}`:''}<p class="calculation">${formula}</p>${result.message&&formula!==result.message?`<p>${esc(result.message)}</p>`:''}${r?`<p class="meta">${esc(r.source)}. ${result.state==='component'?'Component abans d’ajustos; no és el net a cobrar.':result.state==='partial'?'Subtotal; el total definitiu continua pendent.':'Previsió, no certificació de pagament.'}</p>`:''}${c.metric?dates(facts,c.metric):''}</article>`;
}
function personalPage(){
 const p=personal()||{joined:'',children:[]};
 return `<h1>Perfil</h1><p>Només les dades que Nòmina necessita. El percentatge i les unitats laborals continuen arribant de Cómputo.</p><form id="personal-form"><label>Data d’incorporació a l’empresa<input type="date" name="joined" value="${esc(p.joined||'')}" max="${today()}"></label><h2>Fills</h2><p>Només data de naixement, sense noms. Desa sense files si no tens fills.</p><div id="children">${p.children.map(c=>childInput(c.birth)).join('')}</div><button type="button" id="add-child" class="secondary">+ Afegir fill</button><div class="actions"><button type="submit">Desar perfil</button></div><p id="profile-message" role="status">${esc(profileSyncState.message)}</p>${profileSyncState.state==='conflict'?'<div class="actions"><button type="button" id="cloud-profile">Utilitzar perfil del compte</button><button type="button" id="local-profile" class="secondary">Conservar aquest perfil</button></div>':''}</form><p class="meta">Sincronitzat amb el teu compte de TMB Agent. Les dades locals anteriors es pugen en obrir aquesta versió; sense connexió es conserven i es tornen a intentar sincronitzar. Eliminar una fila i desar elimina aquella data del perfil.</p>`;
}
function childInput(birth=''){return `<div class="fields"><label>Data de naixement<input type="date" name="birth" required max="${today()}" value="${esc(birth)}"></label><button type="button" class="secondary remove-child">Eliminar fill</button></div>`;}
function variables(period,previous=false){return variableConcepts.filter(c=>!c.historical&&(!c.annual||period.endsWith('-01'))&&(!previous||c.timing!=='same'));}

function summary(facts){
 return `<div class="facts-grid">${metrics.map(([key,label,unit])=>{const v=unitsFor(facts,key);return `<article><span>${label}</span><strong>${number(v.value)}${v.value===null?'':' '+unit}</strong><small>${v.state==='complete'?'Unitats disponibles':v.missing===null?'Sense export disponible':`${v.pending} pendents · ${v.missing} absents`}</small></article>`;}).join('')}</div>`;
}
function nav(){return `<nav class="v3-nav" aria-label="Navegació principal"><a href="#">Mesos</a><a href="#extras">Pagues extra</a><a href="#dictionary">Diccionari</a><a href="#profile">Perfil</a></nav>`;}
function home(){return `<section class="hero"><img src="./assets/nomina-192.png" width="96" height="96" alt=""><div><p class="eyebrow">Nòmina V3</p><h1>La nòmina, mes a mes</h1><p>Fets de Cómputo i previsió econòmica</p></div></section><label class="year-picker">Any<select id="year">${Array.from({length:8},(_,i)=>2020+i).map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></label><div class="months-grid">${monthNames.map((name,i)=>{const p=`${year}-${String(i+1).padStart(2,'0')}`;return `<a class="month-card" href="${href(p)}"><strong>${name}</strong><span>${year}</span><small>${periodContext(p,today()).state}</small></a>`;}).join('')}</div><p class="meta">Obre un mes per veure els seus fets laborals. Cada variable indica el seu període: nocturnitat, conveni i festiu E al mateix mes; Hora Nona conserva el mes vençut. Els fixos pertanyen al mes de nòmina. Extres i endarreriments van separats.</p>`;}
function month(period){
 ensure(period);const previous=shiftPeriod(period,-1);ensure(previous);
 const data=cache.get(period),prior=cache.get(previous),ctx=periodContext(period,today());
 const facts=visibleFacts(data?.facts,period,today()),priorFacts=visibleFacts(prior?.facts,previous,today());
 return `<a class="link" href="#">← Mesos de ${year}</a><p class="eyebrow">${ctx.state}</p><h1>${periodLabel(period)}</h1><section><h2>Resum de Cómputo · ${periodLabel(period)}</h2><p>${availability(data)}</p>${period===today().slice(0,7)?`<p>Acumulat fins al ${today()}. No inclou dies futurs del mes.</p>`:''}${summary(facts)}<p class="meta">Mes finalitzat no vol dir dades completes. No cal marcar Previsto/Confirmado. Els comptadors no acrediten automàticament el dret a cada plus.</p>${data?.syncedAt?`<p class="meta">Última sincronització: ${esc(data.syncedAt)}</p>`:''}</section><section><h2>Fixos / contractuals · nòmina ${periodLabel(period)}</h2><div class="pay-grid">${fixedConcepts.map(c=>card(c,data,facts,period)).join('')}</div></section><section class="variables-section"><p class="period-flow">Treball ${periodLabel(period)} · liquidació segons concepte</p><h2>Variables del mes treballat</h2><p>Nocturnitat, Convenio i Festivo E: mateix mes. Hora Nona: nòmina del mes següent. Les anomalies històriques no alteren els fets de Cómputo.</p><div class="pay-grid">${variables(period).map(c=>card(c,data,facts,c.timing==='same'?period:ctx.liquidation)).join('')}</div></section><details class="receipt-section"><summary>Variables a mes vençut de la nòmina ${periodLabel(period)}: treball ${periodLabel(previous)}</summary><p>${availability(prior)}</p><div class="pay-grid">${variables(period,true).map(c=>card(c,prior,priorFacts,period)).join('')}</div></details><section><h2>Pagues extra i endarreriments</h2><p>No formen part del total ordinari. No s’afegeixen ajustos sense període d’origen i regla acreditats.</p><a class="button secondary" href="#extras">Veure pagues extra</a><p><strong>Endarreriments: Pendent</strong> · No es pressuposa zero.</p></section>`;
}
function extras(){return `<h1>Pagues extra · ${year}</h1><p>El concepte és únic; el trimestre és el context de la paga. El mes imprès en alguns rebuts històrics no coincideix amb el nom de la paga.</p><div class="months-grid">${[3,6,9,12].map(m=>`<a class="month-card" href="#extra/${year}-${String(m).padStart(2,'0')}"><strong>${monthNames[m-1]}</strong><span>${year}</span></a>`).join('')}</div><a class="link" href="#">← Canviar any / Mesos</a>`;}
function extra(period){ensure(period);const data=cache.get(period);return `<a class="link" href="#extras">← Pagues extra</a><h1>Paga extra · ${periodLabel(period)}</h1><p>${availability(data)}</p><p>Previsió del component íntegre amb el percentatge de Cómputo. Els ajustos de meritació no resolts continuen pendents; no s’importa cap rebut.</p><div class="pay-grid">${extraConcepts.map(c=>card(c,data,null,period)).join('')}</div>`;}
const normalize=s=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
function dict(){return `<h1>Diccionari</h1><p>84 denominacions documentals agrupades. Les variants trimestrals de les pagues extra comparteixen concepte.</p><label>Cerca un concepte<input id="search" type="search" value="${esc(query)}" placeholder="Salario Base, nocturnidad…"></label><div class="dictionary-list">${dictionary.filter(c=>normalize(c.name+' '+c.aliases.join(' ')).includes(normalize(query))).map(c=>`<a class="dictionary-link" href="#concept/${c.id}"><strong>${esc(c.name)}</strong><span>›</span></a>`).join('')||'<p>Cap coincidència.</p>'}</div>`;}
function concept(id){const c=dictionary.find(c=>c.id===id);if(!c)return dict();return `<a class="link" href="#dictionary">← Diccionari</a><h1>${esc(c.name)}</h1><article class="pay-card"><p>${esc(c.description)}</p><h2>Fórmula / criteri</h2><p>${esc(c.formula)}</p><p>${esc(c.limits||c.note)}</p>${c.aliases.length>1?`<details><summary>Denominacions originals segons la paga</summary><ul>${c.aliases.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></details>`:''}<p class="meta">Fonts històriques de desenvolupament. Cap import d’aquests documents s’utilitza com a dada personal actual.</p></article>`;}
function render(){
 const r=route();let body;
 if(isPeriod(r)){year=+r.slice(0,4);body=month(r);}
 else if(r.startsWith('extra/')&&isPeriod(r.slice(6))){year=+r.slice(6,10);body=extra(r.slice(6));}
 else body=r==='profile'?personalPage():r==='extras'?extras():r==='dictionary'?dict():r.startsWith('concept/')?concept(r.slice(8)):home();
 root.innerHTML=nav()+body;
 root.querySelector('#personal-form')?.addEventListener('input',()=>{profileEditing=true;});
 root.querySelector('#cloud-profile')?.addEventListener('click',()=>{profileEditing=false;syncPersonal('remote');});
 root.querySelector('#local-profile')?.addEventListener('click',()=>{profileEditing=false;syncPersonal('local');});
 root.querySelector('#add-child')?.addEventListener('click',()=>{profileEditing=true;root.querySelector('#children').insertAdjacentHTML('beforeend',childInput());});
 root.querySelector('#children')?.addEventListener('click',e=>{if(e.target.matches('.remove-child')){profileEditing=true;e.target.closest('.fields').remove();}});
 const formOwner=profileOwner(localStorage);
 root.querySelector('#personal-form')?.addEventListener('submit',e=>{e.preventDefault();try{if(profileOwner(localStorage)!==formOwner)throw Error('El compte ha canviat; torna a obrir Perfil');markProfileDirty(localStorage,formOwner);savePersonal(localStorage,profileOwner(localStorage),{joined:e.target.elements.joined.value,children:[...e.target.querySelectorAll('[name=birth]')].map(i=>({birth:i.value}))},today());profileEditing=false;root.querySelector('#profile-message').textContent='Desat localment. Sincronitzant…';syncPersonal();}catch(error){root.querySelector('#profile-message').textContent=error.message;}});
 root.querySelector('#year')?.addEventListener('change',e=>{year=+e.target.value;render();});
 root.querySelector('#search')?.addEventListener('input',e=>{query=e.target.value;const pos=e.target.selectionStart;render();const el=root.querySelector('#search');el.focus();el.setSelectionRange(pos,pos);});
}
window.addEventListener('hashchange',()=>{profileEditing=false;render();window.scrollTo(0,0);});
function refresh(){generation++;cache=new Map();if(route()!=='profile')render();}
window.addEventListener('focus',()=>{refresh();if(!profileEditing)syncPersonal();});
window.addEventListener('online',()=>{if(!profileEditing)syncPersonal();});
window.addEventListener('storage',()=>{generation++;cache=new Map();profileEditing=false;render();syncPersonal();});
document.querySelector('[data-section="home"]')?.addEventListener('click',()=>{location.hash='';render();});
render();syncPersonal();
if('serviceWorker' in navigator&&!['127.0.0.1','localhost'].includes(location.hostname))navigator.serviceWorker.register('./sw.js').catch(()=>{});
