// ---------- Revisão noturna (26/11): atritos do usuário novo ----------
// 1) Madrugada (0h-5h): as principais têm cadeado e o passo 1 do guia ("Toque em ▶") tocava no ▶ trancado (nada acontecia).
//    Agora abre a 1ª missão liberada (mesmo extra); se nenhuma estiver liberada, explica a hora e abre um desafio relâmpago.
// 2) A mensagem do [SISTEMA] com tudo trancado aponta o que dá para fazer agora.
// Não grava nada novo: só usa o que já existe (gdGo, sysLine, desafios relâmpago).
function ntLockHour(){let h=null;for(const c of document.querySelectorAll("#quests .quest.qtlock[data-q]")){try{const q=questById(c.dataset.q);const l=q&&typeof qtLocked==="function"?qtLocked(q):null;if(l!=null&&(h==null||l<h))h=l;}catch(e){}}return h;}
// 1ª missão liberada (principal ou extra)
function ntFreeMs(){return document.querySelector("#quests .quest.next .msgo:not(:disabled)")||[...document.querySelectorAll("#quests .msgo")].find(b=>!b.disabled)||null;}
if(typeof gdGo==="function"){const _gd=gdGo;gdGo=function(k){try{
  // sem PRÓXIMA liberada, o original tocava no ▶ trancado (nada acontecia): vai para a 1ª liberada, mesmo extra
  const nx=document.querySelector("#quests .quest.next .msgo:not(:disabled)"),fr=ntFreeMs();
  if(k==="q"&&!nx&&fr){fr.scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});setTimeout(()=>{try{fr.click();}catch(e){}},350);return;}
  if(k==="q"&&!fr&&document.querySelector("#quests .msgo")){
  const h=ntLockHour();const z=document.querySelector(".zapc:not(.done)");
  toast((h!=null?"🔒 Suas missões liberam às "+h+"h. ":"🔒 Suas missões ainda estão trancadas. ")+(z?"Agora: 1 desafio relâmpago ⚡ +10 XP.":""));
  if(z){z.scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});setTimeout(()=>{try{z.click();}catch(e){}},450);}
  return;}}catch(e){}return _gd.apply(this,arguments);};}
// embrulha depois de todos os módulos (qtidy também embrulha sysLine)
setTimeout(()=>{if(typeof sysLine!=="function")return;const _sl=sysLine;sysLine=function(){const t=_sl.apply(this,arguments);
  try{if(/libera às \d+h/.test(t)&&!ntFreeMs()&&document.querySelector(".zapc:not(.done)"))return t+" Agora vale 1 desafio relâmpago ⚡ (+10 XP).";}catch(e){}return t;};
  try{render();}catch(e){}},0);
