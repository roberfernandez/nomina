import {readAvailableComputo} from './economics-v2.js';
const SESSION='sb-hhenkvendzengggrgook-auth-token';
const URL='https://hhenkvendzengggrgook.supabase.co';
const KEY='sb_publishable_QSPDTmh3fd0FH-VvAjH5KQ_Rfvzr2x_';
// Read only. Never downloads calendars/profiles, uploads data or caches personal facts.
export async function loadPayrollFacts(period,storage=localStorage,request=fetch){
  const pending=reason=>({state:'pending',facts:null,profile:null,reason});
  try{
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))throw Error();
    const session=JSON.parse(storage.getItem(SESSION)||'null');
    if(!session?.access_token||!Number.isFinite(session.expires_at)||session.expires_at*1000<=Date.now())return pending('Identifícate en TMB Agent para consultar tus hechos de Cómputo.');
    const options={headers:{apikey:KEY,Authorization:`Bearer ${session.access_token}`},cache:'no-store',signal:AbortSignal.timeout(15000)};
    const userResponse=await request(`${URL}/auth/v1/user`,options);
    if(!userResponse.ok)throw Error();
    const user=await userResponse.json();if(typeof user.id!=='string')throw Error();
    const access=await request(`${URL}/rest/v1/solicitudes_acceso?${new URLSearchParams({select:'estado',user_id:`eq.${user.id}`})}`,options);
    if(!access.ok)throw Error();
    const states=await access.json();
    if(!Array.isArray(states)||!states.some(r=>r.estado==='aprobado'))return pending('Acceso personal pendiente de autorización.');
    const key=`metro-payroll-facts-v1-${period.slice(0,4)}`;
    const response=await request(`${URL}/rest/v1/computo_sync?${new URLSearchParams({select:'payload,updated_at',user_id:`eq.${user.id}`,storage_key:`eq.${key}`})}`,options);
    if(!response.ok)throw Error();
    const rows=await response.json();if(!Array.isArray(rows)||rows.length>1)throw Error();
    const latest=JSON.parse(storage.getItem(SESSION)||'null');
    if(latest?.access_token!==session.access_token)throw Error();
    if(!rows.length||rows[0].payload?.__deleted)return pending('Abre Cómputo y sincroniza el calendario para disponer de hechos resueltos.');
    const result=readAvailableComputo({getItem:k=>k===key?JSON.stringify(rows[0].payload):null},period);
    return {...result,syncedAt:rows[0].updated_at};
  }catch{return pending('Hechos no disponibles: no se ha podido validar la sesión o consultar la sincronización.');}
}
