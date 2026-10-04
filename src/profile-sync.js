import {PROFILE_PREFIX,profileOwner,readPersonal,savePersonal,cleanPersonal} from './personal-profile.js';
const URL='https://hhenkvendzengggrgook.supabase.co';
const KEY='sb_publishable_QSPDTmh3fd0FH-VvAjH5KQ_Rfvzr2x_';
const SESSION='sb-hhenkvendzengggrgook-auth-token';
export const CLOUD_KEY='nomina-personal-profile-v1';
const META='nomina-profile-sync-v1-';
const readMeta=(s,u)=>JSON.parse(s.getItem(META+u)||'null');
export function markProfileDirty(storage,owner){const m=readMeta(storage,owner);storage.setItem(META+owner,JSON.stringify({base:m?.base??null,dirty:true}));}
export function createProfileSync(storage,request,today){
 let queue=Promise.resolve();
 async function run(choice){
  try{
   const owner=profileOwner(storage),session=JSON.parse(storage.getItem(SESSION)||'null');
   if(!owner||!session?.access_token||session.expires_at*1000<=Date.now())return {state:'pending',message:'Identifica’t a TMB Agent per sincronitzar el perfil.'};
   const snapshot=storage.getItem(PROFILE_PREFIX+owner),local=readPersonal(storage,owner,today()),meta=readMeta(storage,owner);
   const current=()=>{if(profileOwner(storage)!==owner||JSON.parse(storage.getItem(SESSION)||'null')?.access_token!==session.access_token||storage.getItem(PROFILE_PREFIX+owner)!==snapshot)throw Error('changed');};
   const headers={apikey:KEY,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'};
   async function call(path,options={}){current();const r=await request(URL+path,{cache:'no-store',signal:AbortSignal.timeout(15000),...options,headers:{...headers,...options.headers}});current();if(!r.ok)throw Error('network');return r.json();}
   const user=await call('/auth/v1/user');if(user.id!==owner)throw Error('identity');
   const states=await call('/rest/v1/solicitudes_acceso?'+new URLSearchParams({select:'estado',user_id:`eq.${owner}`}));
   if(!Array.isArray(states)||!states.some(s=>s.estado==='aprobado'))return {state:'pending',message:'Cal autorització aprovada per sincronitzar.'};
   const filter={user_id:`eq.${owner}`,storage_key:`eq.${CLOUD_KEY}`};
   const rows=await call('/rest/v1/computo_sync?'+new URLSearchParams({...filter,select:'payload'}));
   if(!Array.isArray(rows)||rows.length>1)throw Error('invalid');
   const remote=rows[0]?.payload;
   if(remote&&(remote.schema!==CLOUD_KEY||typeof remote.revision!=='string'||remote.profile?.version!==1))throw Error('invalid');
   const cloud=remote?cleanPersonal(remote.profile,today()):null;
   const same=local&&cloud&&JSON.stringify(local)===JSON.stringify(cloud);
   const conflict=cloud&&local&&!same&&(!meta||meta.dirty)&&meta?.base!==remote.revision;
   if(conflict&&!choice)return {state:'conflict',message:'Hi ha un perfil diferent al compte. Cap còpia s’ha sobreescrit.'};
   if(choice==='remote'||same||(cloud&&(!local||(meta&&!meta.dirty)))){
    if(!cloud)throw Error('missing');
    if(local&&!same)storage.setItem('nomina-profile-backup-v1-'+owner,JSON.stringify(local));
    savePersonal(storage,owner,cloud,today());storage.setItem(META+owner,JSON.stringify({base:remote.revision,dirty:false}));
    return {state:'synced',message:'Perfil sincronitzat amb el teu compte.'};
   }
   if(!local)return {state:'empty',message:'Encara no hi ha perfil. Obre Nòmina al mòbil per pujar les dades que ja hi tens.'};
   const revision=crypto.randomUUID(),payload={schema:CLOUD_KEY,revision,profile:local};
   // INSERT never upserts: simultaneous first migrations cannot overwrite each other.
   // PATCH is conditional on the revision just read, preventing stale-device overwrites.
   const result=await call('/rest/v1/computo_sync?'+new URLSearchParams(remote?{...filter,'payload->>revision':`eq.${remote.revision}`}:{select:'payload'}),{
    method:remote?'PATCH':'POST',headers:{Prefer:'return=representation'},
    body:JSON.stringify(remote?{payload,updated_at:new Date().toISOString()}:{user_id:owner,storage_key:CLOUD_KEY,payload,updated_at:new Date().toISOString()})
   });
   if(!Array.isArray(result)||result.length!==1)return {state:'conflict',message:'El perfil del compte ha canviat. Torna a sincronitzar abans de decidir.'};
   storage.setItem(META+owner,JSON.stringify({base:revision,dirty:false}));
   return {state:'synced',message:'Perfil sincronitzat amb el teu compte.'};
  }catch{return {state:'pending',message:'Perfil conservat al dispositiu. Sincronització pendent: revisa la connexió o torna a identificar-te.'};}
 }
 return choice=>{const job=queue.then(()=>run(choice));queue=job.catch(()=>{});return job;};
}
