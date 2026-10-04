// Local-only, namespaced by the existing account. Not an authorization check.
export const PROFILE_PREFIX='nomina-personal-v1-';
export const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export function profileOwner(storage){try{const id=JSON.parse(storage.getItem('sb-hhenkvendzengggrgook-auth-token')||'null')?.user?.id;return typeof id==='string'&&id?id:null;}catch{return null;}}
export function cleanPersonal(raw,today){
 if(!raw||!Array.isArray(raw.children))throw Error('Perfil no vàlid');
 const joined=raw.joined||null;
 if(joined&&(!validDate(joined)||joined>today))throw Error('Data d’incorporació no vàlida');
 const children=raw.children.map(c=>{const birth=c.birth;if(!validDate(birth)||birth>today)throw Error('Data de naixement no vàlida');return {birth};});
 return {version:1,joined,children};
}
export function readPersonal(storage,owner,today){try{if(!owner)return null;const x=JSON.parse(storage.getItem(PROFILE_PREFIX+owner)||'null');return x?.version===1?cleanPersonal(x,today):null;}catch{return null;}}
export function savePersonal(storage,owner,raw,today){if(!owner)throw Error('Identifica’t a TMB Agent per desar el perfil');const p=cleanPersonal(raw,today);storage.setItem(PROFILE_PREFIX+owner,JSON.stringify(p));return p;}
