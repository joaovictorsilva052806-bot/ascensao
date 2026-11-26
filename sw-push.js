// sw-push.js — aviso diário com o app fechado (Web Push). Ligado pelo sw.js com importScripts (raiz: "sw-push.js"; /comecar/: "../sw-push.js").
// O toque no aviso já é tratado pelo "notificationclick" do sw.js (abre ou traz o app para frente).
// O texto vem do robô (tools/push-send.mjs); sem texto, usa o padrão. Nada de dado pessoal no aviso.
self.addEventListener("push",e=>{let d={};try{d=e.data?e.data.json():{};}catch(x){}
  const t=String(d.t||"⚔️ Ascension").slice(0,60),b=String(d.b||"O Sistema te chama: sua missão de hoje está esperando.").slice(0,140);
  const base=self.registration.scope;
  e.waitUntil(self.registration.showNotification(t,{body:b,tag:"asc-diario",renotify:false,icon:new URL("icon-192.png",base.replace(/comecar\/$/,"")).href,badge:new URL("icon-192.png",base.replace(/comecar\/$/,"")).href,data:{u:base}}));});
// o navegador trocou a inscrição (raro): avisa o app na próxima abertura para inscrever de novo
self.addEventListener("pushsubscriptionchange",e=>{e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>cs.forEach(c=>c.postMessage({pw:"renew"}))));});
