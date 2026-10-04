import test from 'node:test';
import assert from 'node:assert/strict';
import {createProfileSync,CLOUD_KEY,markProfileDirty} from '../src/profile-sync.js';
import {readPersonal,savePersonal} from '../src/personal-profile.js';
const today=()=> '2026-10-04';
const profile={version:1,joined:'2001-01-01',children:[{birth:'2020-01-01'}]};
function device(owner='a'){
 const m=new Map([['sb-hhenkvendzengggrgook-auth-token',JSON.stringify({user:{id:owner},access_token:owner,expires_at:9999999999})]]);
 return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};
}
function backend(){
 const rows=new Map();let writes=0,approved=true,offline=false;
 const request=async(url,opts={})=>{
  if(offline)throw Error('offline');
  const user=opts.headers.Authorization.slice(7),u=new URL(url),reply=x=>({ok:true,json:async()=>x});
  if(u.pathname==='/auth/v1/user')return reply({id:user});
  if(u.pathname.endsWith('solicitudes_acceso'))return reply([{estado:approved?'aprobado':'pendiente'}]);
  const body=opts.body?JSON.parse(opts.body):null;
  assert.equal(u.searchParams.get('storage_key')||'eq.'+body?.storage_key,'eq.'+CLOUD_KEY);
  assert.equal(u.searchParams.get('user_id')||'eq.'+body?.user_id,'eq.'+user);
  const remote=rows.get(user);
  if(!opts.method)return reply(remote?[{payload:remote}]:[]);
  writes++;
  if(opts.method==='POST'&&remote)return {ok:false,json:async()=>({})};
  if(opts.method==='PATCH'&&u.searchParams.get('payload->>revision')!=='eq.'+remote?.revision)return reply([]);
  rows.set(user,body.payload);return reply([{payload:body.payload}]);
 };
 return {request,rows,get writes(){return writes;},set offline(v){offline=v;},set approved(v){approved=v;}};
}
test('legacy mobile profile migrates, empty Windows downloads it without writing',async()=>{
 const b=backend(),mobile=device(),windows=device();savePersonal(mobile,'a',profile,today());
 assert.equal((await createProfileSync(mobile,b.request,today)()).state,'synced');
 assert.equal((await createProfileSync(windows,b.request,today)()).state,'synced');
 assert.deepEqual(readPersonal(windows,'a',today()),profile);assert.equal(b.writes,1);
});
test('empty new device does not create an empty remote profile',async()=>{
 const b=backend();assert.equal((await createProfileSync(device(),b.request,today)()).state,'empty');assert.equal(b.writes,0);
});
test('offline edit stays local and retries; saved deletion of children propagates',async()=>{
 const b=backend(),s=device(),sync=createProfileSync(s,b.request,today);savePersonal(s,'a',profile,today());await sync();
 markProfileDirty(s,'a');savePersonal(s,'a',{...profile,children:[]},today());b.offline=true;
 assert.equal((await sync()).state,'pending');assert.equal(readPersonal(s,'a',today()).children.length,0);
 b.offline=false;assert.equal((await sync()).state,'synced');assert.equal(b.rows.get('a').profile.children.length,0);
});
test('different first migration preserves both copies until explicit choice',async()=>{
 const b=backend(),a=device(),d=device();savePersonal(a,'a',profile,today());await createProfileSync(a,b.request,today)();
 const other={...profile,joined:'2000-01-01'};savePersonal(d,'a',other,today());const sync=createProfileSync(d,b.request,today);
 assert.equal((await sync()).state,'conflict');assert.deepEqual(readPersonal(d,'a',today()),other);assert.deepEqual(b.rows.get('a').profile,profile);
 assert.equal((await sync('remote')).state,'synced');assert.deepEqual(readPersonal(d,'a',today()),profile);
 assert.ok(d.getItem('nomina-profile-backup-v1-a'));
});
test('stale edits conflict instead of overwriting newer device',async()=>{
 const b=backend(),a=device(),d=device(),sa=createProfileSync(a,b.request,today),sd=createProfileSync(d,b.request,today);
 savePersonal(a,'a',profile,today());await sa();await sd();
 markProfileDirty(a,'a');savePersonal(a,'a',{...profile,children:[]},today());await sa();
 markProfileDirty(d,'a');savePersonal(d,'a',{...profile,joined:'1999-01-01'},today());assert.equal((await sd()).state,'conflict');
 assert.equal(b.rows.get('a').profile.children.length,0);
 assert.equal((await sd('local')).state,'synced');assert.equal(b.rows.get('a').profile.joined,'1999-01-01');
});
test('no session or approval never accesses cloud profile',async()=>{
 const b=backend(),s=device();savePersonal(s,'a',profile,today());b.approved=false;
 assert.equal((await createProfileSync(s,b.request,today)()).state,'pending');assert.equal(b.writes,0);
 s.removeItem('sb-hhenkvendzengggrgook-auth-token');assert.equal((await createProfileSync(s,()=>{throw Error('not called')},today)()).state,'pending');
});
test('accounts remain isolated and switching account mid-request cancels application',async()=>{
 const b=backend(),a=device(),d=device('b');savePersonal(a,'a',profile,today());await createProfileSync(a,b.request,today)();
 assert.equal((await createProfileSync(d,b.request,today)()).state,'empty');assert.equal(readPersonal(d,'b',today()),null);
 const request=async(...args)=>{const r=await b.request(...args);a.setItem('sb-hhenkvendzengggrgook-auth-token',d.getItem('sb-hhenkvendzengggrgook-auth-token'));return r;};
 assert.equal((await createProfileSync(a,request,today)()).state,'pending');assert.equal(readPersonal(a,'b',today()),null);
});
