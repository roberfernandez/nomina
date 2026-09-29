const CACHE='nomina-__VERSION__';
const FILES=['./','index.html','src/app.js','src/catalogue.js','src/data.js','src/engine.js','src/presentation.js','src/style.css','manifest.webmanifest','assets/nomina-192.png','assets/nomina-512.png','assets/nomina-180.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(p=>new URL(p,self.registration.scope).href)))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nomina-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Cache only this app's static allowlist. Never cache other miniapps, APIs or
// private data, and never clear another application's cache.
self.addEventListener('fetch',event=>{
  const allowed=new Set(FILES.map(p=>new URL(p,self.registration.scope).href));
  if(event.request.method!=='GET'||!allowed.has(event.request.url))return;
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(r=>r||Response.error())));
});
