const C="ascensao-v112";const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
try{importScripts("sw-push.js");}catch(e){} // aviso diário com o app fechado (Web Push)
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!=="asc-fonts").map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET")return;
  // fontes do Google: cache primeiro e atualiza por trás (carrega instantâneo e funciona offline)
  if(u.host==="fonts.googleapis.com"||u.host==="fonts.gstatic.com"){e.respondWith(caches.open("asc-fonts").then(c=>c.match(e.request).then(hit=>{const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==="opaque"))c.put(e.request,r.clone());return r;}).catch(()=>hit);return hit||net;})));return;}
  if(u.origin!==location.origin)return;
  // rede primeiro, mas sem travar: se a rede não responder em 3,5 s, abre do cache (internet fraca)
  const fromCache=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==="navigate"?caches.match("./",{ignoreSearch:true}):undefined));
  const net=fetch(e.request).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));}return r;});
  e.respondWith(new Promise(res=>{let done=false;const t=setTimeout(()=>fromCache().then(r=>{if(r&&!done){done=true;res(r);}}),3500);
    net.then(r=>{if(!done){done=true;clearTimeout(t);res(r);}}).catch(()=>fromCache().then(r=>{if(!done){done=true;clearTimeout(t);res(r||Response.error());}}));}));});
// toque no aviso local (ranking do dia / desafio da noite): abre ou traz o app para frente
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{for(const c of cs)if("focus" in c)return c.focus();return self.clients.openWindow("./");}));});
