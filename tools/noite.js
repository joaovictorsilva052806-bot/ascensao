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
// 3) Botão Voltar do Android (e gesto de voltar) com a missão ou o desafio relâmpago aberto: antes fechava o app inteiro
//    (só havia 1 página no histórico). Agora o 1º Voltar só fecha a folha, como em diálogo de app nativo.
//    Abrir a folha empilha 1 estado; fechar pelo botão desempilha. Nada é salvo.
let ntIn=false,ntSkip=false;
new MutationObserver(()=>{const on=document.body.classList.contains("inmission");if(on===ntIn)return;ntIn=on;
  try{if(on)history.pushState({ntSheet:1},"");else if(history.state&&history.state.ntSheet){ntSkip=true;history.back();}}catch(e){}}).observe(document.body,{attributes:true,attributeFilter:["class"]});
addEventListener("popstate",()=>{if(ntSkip){ntSkip=false;return;}if(!document.body.classList.contains("inmission"))return;ntIn=false;
  try{if($("msSheet")&&!$("msSheet").hidden)msClose();else if($("zapSheet")&&!$("zapSheet").hidden)zapClose();else document.body.classList.remove("inmission");}catch(e){}});
// 4) Marcou sem querer? "Desfazer" no aviso por 5 s depois de concluir uma tarefa (antes: abrir "Concluídas" e achar o botão).
//    Desfazer = o mesmo que desmarcar pela lista (toggle de novo). Nada novo é salvo.
let ntPend=null;
function ntAttach(){const t=$("toast");if(!t||!ntPend||Date.now()>ntPend.until||t.querySelector(".ntundo"))return;const {q,kind}=ntPend;
  // linha própria com o nome da tarefa: junto de "Check-in feito" o "Desfazer" parecia desfazer o check-in
  const row=document.createElement("span");row.className="ntrow";row.textContent="✓ "+(((typeof qtShort==="function"&&qtShort(q))||q.title)+"").slice(0,32);
  const u=document.createElement("button");u.type="button";u.className="link ntundo";u.textContent="Desfazer";row.append(" ",u);
  u.addEventListener("click",()=>{ntPend=null;const on=(prog.log[todayKey()]||[]).find(e=>e.q===q.id&&e.kind===kind);if(on)toggle(q,kind);const c=$("muChip");if(c)c.remove();toast("Desfeito.");});
  t.append(row);clearTimeout(toast._t);toast._t=setTimeout(()=>{t.hidden=true;},Math.max(1500,ntPend.until-Date.now()));}
function ntUndo(q,kind){ntPend={q,kind,until:Date.now()+5000};setTimeout(()=>{try{const t=$("toast");if(!t)return;
  if(t.hidden||!t.textContent.trim())toast("Feito!");else ntAttach();}catch(e){}},120);}
// outro aviso no meio dos 5 s (conquista, baú, check-in) não some com o "Desfazer"
setTimeout(()=>{if(typeof toast!=="function")return;const _to=toast;toast=function(){const r=_to.apply(this,arguments);try{ntAttach();}catch(e){}return r;};},0);
setTimeout(()=>{if(typeof toggle!=="function")return;const _t=toggle;toggle=function(q,kind){let had=true;try{had=(prog.log[todayKey()]||[]).some(e=>e.q===q.id);}catch(e){}
  const r=_t.apply(this,arguments);try{const now=(prog.log[todayKey()]||[]).find(e=>e.q===q.id);if(!had&&now)ntUndo(q,now.kind);}catch(e){}return r;};},0);
// 5) Volta depois de faltar um dia: antes a 1ª tela não tinha nenhuma tarefa (ranking, avatar, chefe, desafios) e a primeira
//    ficava a ~2 telas de rolagem, com "Dívida" logo acima. Agora, no topo da aba Hoje, 1 cartão sem cobrança e 1 toque que
//    abre a 1ª missão liberada (o mínimo dela já vale). Some quando a 1ª tarefa do dia é feita. Nada é salvo ("Agora não"
//    vale só até fechar o app).
const NT_NOT=/^(ach|checkin|tip|dun|boss|sq|adm|hook|volta|rec|smb):/;
let ntVoltaOff=false;
function ntReal(k){return ((prog&&prog.log&&prog.log[k])||[]).some(e=>!NT_NOT.test(String(e.q)));}
function ntMissed(){if(!prog||!prog.log||!cfg||cfg.blank)return false;const tk=todayKey();if(ntReal(tk))return false;
  const y=new Date();y.setHours(12,0,0,0);y.setDate(y.getDate()-1);const yk=dkey(y);if(ntReal(yk)||(prog.rest||{})[yk])return false;
  return Object.keys(prog.log).some(k=>k<yk&&ntReal(k));}
function ntVolta(){let c=$("ntVolta");const show=!ntVoltaOff&&ntMissed()&&!document.body.classList.contains("onboarding")&&!($("onb")&&!$("onb").hidden);
  // o presente de volta dos primeiros dias (hook) já faz esse papel: não repete
  const hk=$("hkPanel");if(!show||(hk&&!hk.hidden&&hk.dataset.mode==="gift")){if(c)c.hidden=true;return;}
  const b=ntFreeMs();const card=b&&b.closest(".quest[data-q]");let q=null;try{q=card&&questById(card.dataset.q);}catch(e){}
  const first=document.querySelector('section[data-tab="hoje"]');if(!first)return;
  if(!c){c=document.createElement("section");c.id="ntVolta";c.className="panel ntvolta";c.dataset.tab="hoje";c.dataset.sf="1";c.setAttribute("aria-live","polite");}
  if(c.nextElementSibling!==first&&c!==first)first.before(c);
  c.hidden=false;c.textContent="";const h=document.createElement("h2");h.textContent="👋 Que bom te ver de volta";
  const p=document.createElement("p");p.className="sm";p.textContent="Sem cobrança: ontem passou. Recomeçar leva 1 minuto"+(q?": "+(q.minTitle||q.title)+".":".");
  const row=document.createElement("div");row.className="row";const go=document.createElement("button");go.type="button";go.className="go";
  go.textContent=b?"▶ Começar agora":"Ver as tarefas de hoje";
  go.addEventListener("click",()=>{const bb=ntFreeMs();const tgt=bb||$("quests");if(!tgt)return;
    tgt.scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});if(bb)setTimeout(()=>{try{bb.click();}catch(e){}},300);});
  const no=document.createElement("button");no.type="button";no.className="link";no.textContent="Agora não";no.addEventListener("click",()=>{ntVoltaOff=true;c.hidden=true;});
  row.append(go,no);c.append(h,p,row);}
setTimeout(()=>{const _r=render;render=function(){const x=_r.apply(this,arguments);try{ntVolta();}catch(e){}return x;};try{ntVolta();}catch(e){}},0);
