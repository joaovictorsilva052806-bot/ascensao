const C="ascensao-u-v26";const FILES=["./","index.html","manifest.webmanifest","../icon-192.png","../icon-512.png","../icon-180.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==location.origin)return;
  // rede primeiro, mas sem travar: se a rede demorar 3,5 s, abre do cache (internet fraca)
  const fromCache=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==="navigate"?caches.match("./",{ignoreSearch:true}):undefined));
  const net=fetch(e.request).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));}return r;});
  e.respondWith(new Promise(res=>{let done=false;const t=setTimeout(()=>fromCache().then(r=>{if(r&&!done){done=true;res(r);}}),3500);
    net.then(r=>{if(!done){done=true;clearTimeout(t);res(r);}}).catch(()=>fromCache().then(r=>{if(!done){done=true;clearTimeout(t);res(r||Response.error());}}));}));});
