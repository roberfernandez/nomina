import {readVacationBasis,saveVacationBasis} from './entitlement-rules.js';
import {createProfileSync,markProfileDirty} from './profile-sync.js';
import {profileOwner,readPersonal,savePersonal} from './personal-profile.js';
import {loadPayrollFacts} from './computo-cloud-v2.js';
import {euros,percentage} from './economics-v2.js';
import {monthNames,extraPaymentMonths,extraReferencePeriod,periodLabel,shiftPeriod,periodContext,visibleFacts,metrics,unitsFor,fixedConcepts,variableConcepts,extraConcepts,normalizedDictionary,calculate,isPeriod,ruleFor} from './month-model-v3.js';

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
function card(c,data,facts,period,history=[]){
 const result=calculate(c,{profile:data?.profile,facts,period,personal:personal(),history:history.length?history:[...cache.values()],vacationBasis:readVacationBasis(localStorage,profileOwner(localStorage),facts?.period||period)});
 if(result.hidden)return '';
 const rawLabel=result.label||(result.expected===null?'Pendent de calcular':result.state==='partial'?'Estimació':'Calculat');
 const label=rawLabel==='Regla coneguda'?'Pendent de calcular':rawLabel;
 const amount=result.expected===null?label:euros(result.expected);
 const r=result.rule;
 const formula=result.calculation|| (r?.formula==='proportional'?`${euros(r.base)} × ${percentage(data?.profile?.percent??null)}`:r?.rate!==undefined?`${r.formula==='tariff-only'?'Tarifa '+period.slice(0,4)+': ':r.formula==='family'?'Tarifa per fill: ':result.labour?.value===null?'Unitats no disponibles × ':number(result.labour?.value)+' '+(r.unit==='h'?'h':'unitats')+' × '}${euros(r.rate)}/${r.unit==='h'?'h':'unitat'}`:result.message||'Regla o dades encara no disponibles');
 const counted=result.labour?.value!==null&&result.labour?.value!==undefined?`<p><b>${result.labour.unit==='day'?'Dies computats':'Temps computat'}:</b> ${labourText(result.labour)}</p>`:'';
 const pendingMessage=result.expected===null&&result.message?`<p class="notice">${esc(result.message)}</p>`:'';
 const caveat=c.id==='conveni'?'<p class="meta">Estimació: els permisos, retards i absències poden modificar aquest import. El recompte encara no incorpora tots aquests ajustos.</p>':'';
 return `<article class="pay-card"><div class="pay-card-head"><h3>${esc(c.name)}</h3><strong class="amount ${result.expected===null?'pending':''}">${amount}</strong></div><span class="badge">${c.id==='conveni'&&result.expected!==null?'Estimació':label}</span><p class="concept-purpose">${esc(c.note)}</p>${counted}${result.expected!==null?`<p class="calculation">${formula}</p>`:''}${caveat}${pendingMessage}<details class="calculation-details"><summary>Detall del càlcul i fonts</summary>${result.labour?`<p>${result.labour.missing===null?'Dades del període pendents.':`${result.labour.pending} dates pendents · ${result.labour.missing} dates sense dades.`}</p>`:''}${result.message&&result.expected!==null?`<p>${esc(result.message)}</p>`:''}${r?`<p class="meta">${esc(r.source)}. ${result.state==='component'?'Import abans d’ajustos; no és el net a cobrar.':result.state==='partial'?'Subtotal; el total definitiu continua pendent.':'Previsió, no certificació de pagament.'}</p>`:''}${result.dates?.length?`<p>Dates de dret: ${result.dates.map(esc).join(', ')}</p>`:''}${c.metric?dates(facts,c.metric):''}</details></article>`;
}
function personalPage(){
 const p=personal()||{joined:'',children:[]};
 return `<h1>Perfil</h1><p>Només les dades que Nòmina necessita. El percentatge i les unitats laborals continuen arribant de Cómputo.</p><form id="personal-form"><label>Data d’incorporació a l’empresa<input type="date" name="joined" value="${esc(p.joined||'')}" max="${today()}"></label><h2>Fills</h2><p>Només data de naixement, sense noms. Desa sense files si no tens fills.</p><div id="children">${p.children.map(c=>childInput(c.birth)).join('')}</div><button type="button" id="add-child" class="secondary">+ Afegir fill</button><div class="actions"><button type="submit">Desar perfil</button></div><p id="profile-message" role="status">${esc(profileSyncState.message)}</p>${profileSyncState.state==='conflict'?'<div class="actions"><button type="button" id="cloud-profile">Utilitzar perfil del compte</button><button type="button" id="local-profile" class="secondary">Conservar aquest perfil</button></div>':''}</form><p class="meta">Sincronitzat amb el teu compte de TMB Agent. Les dades locals anteriors es pugen en obrir aquesta versió; sense connexió es conserven i es tornen a intentar sincronitzar. Eliminar una fila i desar elimina aquella data del perfil.</p>`;
}
function childInput(birth=''){return `<div class="fields"><label>Data de naixement<input type="date" name="birth" required max="${today()}" value="${esc(birth)}"></label><button type="button" class="secondary remove-child">Eliminar fill</button></div>`;}
function variables(period,previous=false){return variableConcepts.filter(c=>!c.historical&&(!c.annual||period.endsWith('-01'))&&(!previous||c.timing!=='same'));}

function summary(facts){
 return `<div class="facts-grid">${metrics.filter(([key])=>!['plusFestiuDays','specialRetributiveDays'].includes(key)).map(([key,label,unit])=>{const v=unitsFor(facts,key);return `<article><span>${label}</span><strong>${number(v.value)}${v.value===null?'':' '+unit}</strong><small>${v.state==='complete'?'Unitats disponibles':v.missing===null?'Sense export disponible':`${v.pending} pendents · ${v.missing} absents`}</small></article>`;}).join('')}${['official-holiday','worked-holiday-e','special-day'].map(id=>{const c=variableConcepts.find(c=>c.id===id),r=calculate(c,{facts,profile:facts?.profile,period:facts?.period||route(),history:[...cache.values()]});return `<article><span>${esc(c.name)}</span><strong>${r.labour?.value===undefined?'Pendent':number(r.labour.value)+' dies'}</strong><small>${r.labour?'Unitats estimades segons condicions':esc(r.message||'Falten dades')}</small></article>`;}).join('')}</div>`;
}
function nav(){return `<nav class="v3-nav" aria-label="Navegació principal"><a href="#">Mesos</a><a href="#extras">Pagues extra</a><a href="#dictionary">Diccionari</a><a href="#profile">Perfil</a></nav>`;}
function home(){return `<section class="hero"><img src="./assets/nomina-192.png" width="96" height="96" alt=""><div><p class="eyebrow">Nòmina V3</p><h1>La nòmina, mes a mes</h1><p>Fets de Cómputo i previsió econòmica</p></div></section><label class="year-picker">Any<select id="year">${Array.from({length:8},(_,i)=>2020+i).map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></label><div class="months-grid">${monthNames.map((name,i)=>{const p=`${year}-${String(i+1).padStart(2,'0')}`;return `<a class="month-card" href="${href(p)}"><strong>${name}</strong><span>${year}</span><small>${periodContext(p,today()).state}</small></a>`;}).join('')}</div><p class="meta">Obre un mes per veure els seus fets laborals. Cada variable indica el seu període: nocturnitat, conveni i festiu E al mateix mes; Hora Nona conserva el mes vençut. Els fixos pertanyen al mes de nòmina. Extres i endarreriments van separats.</p>`;}
function month(period){
 ensure(period);const previous=shiftPeriod(period,-1);ensure(previous);
 const data=cache.get(period),prior=cache.get(previous),ctx=periodContext(period,today());
 const facts=visibleFacts(data?.facts,period,today()),priorFacts=visibleFacts(prior?.facts,previous,today());
 return `<a class="link" href="#">← Mesos de ${year}</a><p class="eyebrow">${ctx.state}</p><h1>${periodLabel(period)}</h1><section><h2>Resum de Cómputo · ${periodLabel(period)}</h2><p>${availability(data)}</p>${period===today().slice(0,7)?`<p>Acumulat fins al ${today()}. No inclou dies futurs del mes.</p>`:''}${summary(facts)}<p class="meta">Els imports són una previsió. Revisa les condicions de cada complement i els avisos de dades pendents.</p>${data?.syncedAt?`<p class="meta">Última sincronització: ${esc(data.syncedAt)}</p>`:''}</section><section><h2>Fixos / contractuals · nòmina ${periodLabel(period)}</h2><div class="pay-grid">${fixedConcepts.map(c=>card(c,data,facts,period)).join('')}</div></section><section class="variables-section"><p class="period-flow">Treball ${periodLabel(period)} · liquidació segons concepte</p><h2>Variables del mes treballat</h2><p>Cada fitxa explica què remunera el complement i les condicions que poden modificar-ne l’import. Consulta el detall per veure les dates i les fonts.</p><div class="pay-grid">${variables(period).map(c=>card(c,data,facts,c.timing==='same'?period:ctx.liquidation)).join('')}</div>${vacationBasisForm(period)}</section><details class="receipt-section"><summary>Variables a mes vençut de la nòmina ${periodLabel(period)}: treball ${periodLabel(previous)}</summary><p>${availability(prior)}</p><div class="pay-grid">${variables(period,true).map(c=>card(c,prior,priorFacts,period)).join('')}</div></details><section><h2>Pagues extra i endarreriments</h2><p>No formen part del total ordinari. No s’afegeixen ajustos sense període d’origen i regla acreditats.</p><a class="button secondary" href="#extras">Veure pagues extra</a><p><strong>Endarreriments: Pendent</strong> · No es pressuposa zero.</p></section>`;
}
function vacationBasisForm(period){
 const b=readVacationBasis(localStorage,profileOwner(localStorage),period)||{};
 return `<details><summary>Completar base de Primes en Vacances</summary><p>Còmput aporta els dies de vacances. I-98 requereix imports percebuts de penositat, festiu oficial (abans especial), festiu treballat, horari partit, suplències i nocturnitat variable. Aquesta base es desa només en aquest dispositiu i compte; no és una tarifa oficial.</p><form id="vacation-basis-form" data-period="${period}"><label>Suma de les sis primes dels 12 mesos anteriors al canvi de vacances (€)<input name="total" type="number" min="0" step="0.01" required value="${esc(b.total??'')}"></label><label>Dies del calendari laboral del mateix interval<input name="calendarDays" type="number" min="1" step="1" required value="${esc(b.calendarDays??'')}"></label><label>Interval exacte i font dels imports<input name="source" maxlength="400" required value="${esc(b.source||'')}" placeholder="Dates inicial/final i rebuts o certificat"></label><label><input name="confirmed" type="checkbox" required ${b.confirmed?'checked':''}>Confirmo imports, divisor i que aquesta mitjana és aplicable a tots els dies/blocs de vacances d’aquest període.</label><button>Desar base i calcular</button><p id="vacation-basis-message" role="status"></p></form></details>`;
}
function extras(){return `<h1>Pagues extra · ${year}</h1><p>Les quatre pagues extraordinàries nominals són <b>març, juny, setembre i desembre/Nadal</b>. Alguns PDF es generen o s’encapçalen el mes següent; això no canvia el nom del concepte PE.</p><div class="months-grid">${extraPaymentMonths.map(m=>`<a class="month-card" href="#extra/${year}-${String(m).padStart(2,'0')}"><strong>${monthNames[m-1]}</strong><span>${year}</span></a>`).join('')}</div><section><h2>Què vol dir «16,33 pagues»?</h2><p>És una equivalència anual acreditada per a <b>Salari Base i Antigüedad</b>: 12 mensualitats + 3 extres ordinàries + la paga de desembre amb factor 1,3333. No és un multiplicador de tota la nòmina.</p><p class="meta">Prima Fija i Plus Especial tenen quatre abonaments extra sense el terç addicional de Nadal. La Gratificació Vacances de gener és una percepció anual separada.</p></section><section><h2>Pagament anual separat</h2><article class="pay-card"><div class="pay-card-head"><h3>Gratificació Vacances · Gener</h3></div><p>No forma part de les 16,33 pagues ni és una cinquena paga extra. Es mostra dins de la nòmina ordinària de gener.</p><a class="button secondary" href="#${year}-01">Veure gener ${year}</a></article></section><a class="link" href="#">← Canviar any / Mesos</a>`;}
function extra(paymentPeriod){
 const referencePeriod=extraReferencePeriod(paymentPeriod);
 ensure(referencePeriod);
 const priorPeriods=Array.from({length:12},(_,i)=>shiftPeriod(referencePeriod,-(i+1)));
 priorPeriods.forEach(ensure);
 const data=cache.get(referencePeriod),history=priorPeriods.map(p=>cache.get(p)).filter(Boolean);
 return `<a class="link" href="#extras">← Pagues extra</a><h1>Paga extra · ${periodLabel(paymentPeriod)}</h1><p>${availability(data)}</p><p>Període nominal de la paga. El PDF pot generar-se o mostrar un encapçalament del mes següent sense canviar el concepte PE. Turno Noche usa la mitjana monetària dels 12 mesos anteriors quan l’historial és complet.</p><div class="pay-grid">${extraConcepts.map(c=>card(c,data,null,referencePeriod,history)).join('')}</div>`;
}
const normalize=s=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
function economicConcept(c){
 return [...fixedConcepts,...variableConcepts,...extraConcepts].find(x=>x.id===c.id||x.name===c.name)||null;
}
function rulePrice(rule,concept){
 if(rule?.formula==='family'&&typeof rule.rate==='number')return `${euros(rule.rate)}/fill/mes`;
 if(typeof rule?.rate==='number'){
  const unit=rule.unit==='h'?'h':rule.unit==='day'?'dia':'unitat';
  return `${euros(rule.rate)}/${unit}`;
 }
 if(typeof rule?.base==='number'){
  if(rule.formula==='proportional')return `Base ${euros(rule.base)} × % contractual`;
  if(rule.formula==='seniority')return `Base de càlcul ${euros(rule.base)} · 5 % per quadrienni · 2,5 % bienni inicial`;
  if(rule.formula==='annual')return `Base anual ${euros(rule.base)}`;
  return `Base ${euros(rule.base)}`;
 }
 return null;
}
function seniorityDictionaryPricing(){
 const periods=[
  {label:'Gener–març 2026',base:1459.67},
  {label:'Abril–desembre 2026',base:1485.15},
 ];
 const current=today().slice(0,7),profile=cache.get(current)?.profile,percent=typeof profile?.percent==='number'?profile.percent:null;
 const money=n=>euros(Math.round((n+Number.EPSILON)*100)/100);
 return `<h2>Quant val l’antiguitat?</h2>${periods.map(({label,base})=>{
   const bien=Math.round((base*.025+Number.EPSILON)*100)/100;
   const quad=Math.round((base*.05+Number.EPSILON)*100)/100;
   const ownBien=percent?bien*percent/100:null,ownQuad=percent?quad*percent/100:null;
   return `<div class="calculation"><strong>${esc(label)}</strong>
     <p><b>Primer bienni · en complir 2 anys:</b> ${money(bien)}/mes al 100 %${percent?` · Amb el teu contracte (${esc(percentage(percent))}): <b>${euros(ownBien)}/mes</b>`:''}</p>
     <p><b>Primer quadrienni · en complir 4 anys:</b> ${money(quad)}/mes al 100 %${percent?` · Amb el teu contracte (${esc(percentage(percent))}): <b>${euros(ownQuad)}/mes</b>`:''}</p>
     <p class="meta">El bienni inicial no se suma al primer quadrienni: en arribar als 4 anys és substituït pel primer quadrienni. Cada nou quadrienni afegeix un altre ${money(quad)}/mes al 100 %.</p>
     <p class="meta">Fórmula: bienni inicial = 2,5 % del salari base; cada quadrienni = 5 % del salari base.</p>
   </div>`;
 }).join('')}<p class="meta">L’efecte retributiu s’aplica segons la regla d’antiguitat documentada a l’app. L’import personal depèn del percentatge contractual vigent.</p><p><strong>Exemple:</strong> amb 4 quadriennis, a raó d’un 5 % per quadrienni, l’antiguitat equival al 20 % del salari base. El bienni inicial del 2,5 % no s’hi suma perquè queda substituït pel primer quadrienni.</p>`;
}

function dictionaryPricing(c){
 const concept=economicConcept(c);
 if(c.name==='Antigüedad')return seniorityDictionaryPricing();
 if(c.id==='extra-salary')return `<h2>Com es calcula?</h2><div class="calculation"><strong>Equivalència anual 16,33 · només Salari Base</strong><p>12 mensualitats ordinàries + 3 pagues extra ordinàries + desembre amb factor <b>1,3333</b>.</p><p>Aquest 0,33 addicional està integrat a la paga de desembre; no crea una cinquena paga al gener.</p><p class="meta">El factor 1,3333 és el que reprodueix les tarifes documentades; no se substitueix automàticament per 4/3 exacte.</p></div>`;
 if(c.id==='extra-night')return `<h2>Com es calcula?</h2><div class="calculation"><strong>Mitjana monetària dels 12 mesos anteriors</strong><p>Se sumen els imports definitius de <b>Nocturnidad Variable</b> dels 12 mesos anteriors i es divideixen entre 12.</p><p>No s’aplica de nou el percentatge contractual: els imports mensuals ja són personals.</p><p>Les revisions salarials conegudes es recalculen sobre el mes d’origen. A la paga de desembre, el contrast longitudinal mostra un factor específic d’1,3333 sobre la mitjana.</p><p class="meta">La previsió pot diferir alguns cèntims del rebut final per regularitzacions, imputacions de vacances o precisió interna de TMB. La regla base prové d’I-102 i el comportament de desembre queda identificat per contrast de pagues extra.</p></div>`;
 if(c.name==='Gratificación Vacaciones')return `<h2>Pagament anual</h2><div class="calculation"><strong>Gener · percepció separada</strong><p>La Gratificació Vacances és un abonament anual independent. No forma part de les «16,33 pagues» i no és el mateix que Primas en Vacaciones.</p><p class="meta">Els rebuts 2020–2026 confirmen la seva presència anual a gener; l’origen històric exacte del concepte continua pendent de documentació original.</p></div>`;
 if(c.id==='extra-seniority')return `<h2>Com es calcula?</h2><div class="calculation"><strong>Març, juny i setembre</strong><p>Es pren l’antiguitat reconeguda en la data d’efecte, es multiplica pel valor documentat de cada tram i després pel percentatge aplicable de la paga.</p><p><b>2026:</b> març · quadrienni 72,99 € / bienni 36,49 €; juny i setembre · quadrienni 74,26 € / bienni 37,13 €.</p><p>Exemple juny 2026: 6 quadriennis × 74,26 € = 445,56 € al 100 %. Amb 85,81 %: 382,34 €. A desembre, la base d’antiguitat s’amplia amb el factor 1,3333.</p><p class="meta">El percentatge de Cómputo s’utilitza com a previsió; el percentatge efectiu de meritació d’una paga concreta pot diferir. El factor 1,3333 de desembre està acreditat per a l’antiguitat; la meritació individual i els ajustos continuen tractant-se com a previsió.</p></div>`;
 if(!concept)return '<h2>Tarifa / base documentada</h2><p class="meta">No hi ha una tarifa o base universal acreditada per a aquest concepte.</p>';
 const rows=[];
 const displayMonths=concept.kind==='extra'?extraPaymentMonths:Array.from({length:12},(_,i)=>i+1);
 for(const month of displayMonths){
  const paymentPeriod=`2026-${String(month).padStart(2,'0')}`,period=concept.kind==='extra'?extraReferencePeriod(paymentPeriod):paymentPeriod,rule=ruleFor(concept,period),price=rulePrice(rule,concept);
  if(!rule||!price)continue;
  const key=JSON.stringify({price,source:rule.source,message:rule.message||'',estimated:!!rule.estimated,formula:rule.formula});
  let row=rows.find(x=>x.key===key);
  if(!row){row={key,price,source:rule.source,message:rule.message||'',estimated:!!rule.estimated,formula:rule.formula,months:[]};rows.push(row);}
  row.months.push(month);
 }
 if(!rows.length)return '<h2>Tarifa / base documentada</h2><p class="meta">No hi ha una tarifa o base universal acreditada per a aquest concepte.</p>';
 const monthsLabel=(months,row)=>{
  if(row.formula==='family')return '2026 · 10 mensualitats · setembre–juny';
  if(months.length===12)return '2026 · tot l’any';
  const consecutive=months.every((m,i)=>i===0||m===months[i-1]+1);
  if(consecutive&&months.length>1)return `2026 · ${monthNames[months[0]-1]}–${monthNames[months.at(-1)-1]}`;
  return `2026 · ${months.map(m=>monthNames[m-1]).join(', ')}`;
 };
 const missingExtra=concept.kind==='extra'&&rows.reduce((s,r)=>s+r.months.length,0)<4
   ? '<p class="meta">Les bases de paga extra que encara no estan acreditades per a 2026 es mantenen pendents; no s’extrapola cap import.</p>'
   : '';
 return `<h2>Tarifa / base documentada</h2>${rows.map(row=>`<div class="calculation"><strong>${esc(row.price)}</strong><br><small>${esc(monthsLabel(row.months,row))}</small>${row.estimated?'<p class="meta"><strong>Tarifa de referència:</strong> el càlcul econòmic continua sent una estimació.</p>':''}${row.source?`<p class="meta">${esc(row.source)}</p>`:''}${row.message?`<p class="meta">${esc(row.message)}</p>`:''}</div>`).join('')}${missingExtra}<p class="meta">Són tarifes o bases documentades de 2026. No són l’import net personal: el càlcul final pot dependre d’unitats, percentatge contractual, meritació, absències o altres ajustos.</p>`;
}
function dict(){return `<h1>Diccionari</h1><p>84 denominacions documentals agrupades. Les variants trimestrals de les pagues extra comparteixen concepte. Quan hi ha una tarifa o base documentada, es mostra dins de la fitxa del concepte.</p><label>Cerca un concepte<input id="search" type="search" value="${esc(query)}" placeholder="Salario Base, nocturnidad…"></label><div class="dictionary-list">${dictionary.filter(c=>normalize(c.name+' '+c.aliases.join(' ')).includes(normalize(query))).map(c=>`<a class="dictionary-link" href="#concept/${c.id}"><strong>${esc(c.name)}</strong><span>›</span></a>`).join('')||'<p>Cap coincidència.</p>'}</div>`;}
function concept(id){const c=dictionary.find(c=>c.id===id);if(!c)return dict();if(c.name==='Antigüedad')ensure(today().slice(0,7));return `<a class="link" href="#dictionary">← Diccionari</a><h1>${esc(c.name)}</h1><article class="pay-card"><p>${esc(c.description)}</p>${dictionaryPricing(c)}<h2>Fórmula / criteri</h2><p>${esc(c.formula)}</p><p>${esc(c.limits||c.note)}</p>${c.aliases.length>1?`<details><summary>Denominacions originals segons la paga</summary><ul>${c.aliases.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></details>`:''}<p class="meta">Fonts històriques de desenvolupament. Les tarifes/base mostrades són regles documentades de l’app; no s’utilitzen com a dada personal sense aplicar el criteri corresponent.</p></article>`;}
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
 root.querySelector('#vacation-basis-form')?.addEventListener('submit',e=>{e.preventDefault();try{if(profileOwner(localStorage)!==formOwner)throw Error('El compte ha canviat');const f=e.target;saveVacationBasis(localStorage,formOwner,f.dataset.period,{total:f.elements.total.value,calendarDays:f.elements.calendarDays.value,source:f.elements.source.value,confirmed:f.elements.confirmed.checked});render();}catch(error){root.querySelector('#vacation-basis-message').textContent=error.message;}});
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
