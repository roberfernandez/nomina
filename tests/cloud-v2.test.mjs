import test from 'node:test';
import assert from 'node:assert/strict';
import {loadPayrollFacts} from '../src/computo-cloud-v2.js';
const session={access_token:'synthetic',expires_at:9999999999};
const storage={getItem:()=>JSON.stringify(session)};
const response=x=>({ok:true,json:async()=>x});
test('cloud reads only the own versioned payroll export after Auth and approval',async()=>{
 const urls=[];const request=async url=>{urls.push(url);return urls.length===1?response({id:'real-user'}):urls.length===2?response([{estado:'aprobado'}]):response([{payload:{schema:'metro-payroll-facts-v1',year:2026,profile:{percent:75},months:{}}}]);};
 const r=await loadPayrollFacts('2026-09',storage,request);assert.equal(r.profile.percent,75);assert.equal(r.facts,null);assert.match(urls[2],/user_id=eq.real-user/);assert.match(urls[2],/metro-payroll-facts-v1-2026/);assert.ok(!urls.join().includes('metro-year-'));
});
test('no session, no approval or network failure yields no personal facts',async()=>{
 assert.equal((await loadPayrollFacts('2026-09',{getItem:()=>null},()=>{throw Error('must not fetch')})).facts,null);
 let calls=0;const r=await loadPayrollFacts('2026-09',storage,async()=>++calls===1?response({id:'x'}):response([{estado:'pendiente'}]));assert.equal(calls,2);assert.equal(r.facts,null);
 assert.equal((await loadPayrollFacts('2026-09',storage,async()=>{throw Error('offline')})).facts,null);
});
test('deleted export never falls back to another browser user local facts',async()=>{
 let calls=0;const r=await loadPayrollFacts('2026-09',storage,async()=>++calls===1?response({id:'x'}):calls===2?response([{estado:'aprobado'}]):response([{payload:{__deleted:true}}]));assert.equal(r.facts,null);
});
