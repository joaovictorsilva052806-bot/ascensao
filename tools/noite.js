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
let ntPend=null,ntTgAt=0;
function ntAttach(){const t=$("toast");if(!t||!ntPend||Date.now()>ntPend.until||t.querySelector(".ntundo"))return;const {q,kind}=ntPend;
  // linha própria com o nome da tarefa: junto de "Check-in feito" o "Desfazer" parecia desfazer o check-in
  const row=document.createElement("span");row.className="ntrow";row.textContent="✓ "+(((typeof qtShort==="function"&&qtShort(q))||q.title)+"").slice(0,32);
  const u=document.createElement("button");u.type="button";u.className="link ntundo";u.textContent="Desfazer";row.append(" ",u);
  u.addEventListener("click",()=>{ntPend=null;const on=(prog.log[todayKey()]||[]).find(e=>e.q===q.id&&e.kind===kind);if(on)toggle(q,kind);const c=$("muChip");if(c)c.remove();toast("Desfeito.");});
  t.append(row);clearTimeout(toast._t);toast._t=setTimeout(ntTick,Math.max(1500,ntPend.until-Date.now()));}
// Janela do Sistema aberta (atributo, nível, baú) cobre o aviso: o "Desfazer" não some atrás dela.
// Os 5 s recomeçam quando a última janela fecha (antes: a 1ª missão do dia 1 abria "Intelecto nível 2" e o Desfazer expirava escondido).
function ntCovered(){return [...document.querySelectorAll(".sysmodal,#levelup,.avmk")].some(m=>!m.hidden&&m.getClientRects().length);}
function ntTick(){const t=$("toast");if(!t||t.hidden||!ntPend||!t.querySelector(".ntundo"))return;
  if(ntCovered()){ntPend.until=Date.now()+5000;toast._t=setTimeout(ntTick,400);return;}
  const left=ntPend.until-Date.now();if(left>50){toast._t=setTimeout(ntTick,left);return;}t.hidden=true;}
function ntUndo(q,kind){ntPend={q,kind,until:Date.now()+5000};setTimeout(()=>{try{const t=$("toast");if(!t)return;
  if(t.hidden||!t.textContent.trim())toast("Feito!");else ntAttach();}catch(e){}},120);}
// outro aviso no meio dos 5 s (conquista, baú, check-in) não some com o "Desfazer"
setTimeout(()=>{if(typeof toast!=="function")return;const _to=toast;toast=function(){const r=_to.apply(this,arguments);try{ntAttach();}catch(e){}return r;};},0);
setTimeout(()=>{if(typeof toggle!=="function")return;const _t=toggle;toggle=function(q,kind){let had=true;try{had=(prog.log[todayKey()]||[]).some(e=>e.q===q.id);}catch(e){}
  const r=_t.apply(this,arguments);ntTgAt=Date.now();try{const now=(prog.log[todayKey()]||[]).find(e=>e.q===q.id);if(!had&&now)ntUndo(q,now.kind);}catch(e){}return r;};},0);
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
// 6) Galeria de classes: abria sozinha logo depois de "Criar meu jogo", 1 janela entre a pessoa e a 1ª missão.
//    No dia em que o jogo foi criado, ela espera a 1ª tarefa feita (abre no render seguinte, depois da vitória).
//    Trocar de classe pela pílula (openCls.force) continua abrindo na hora. Nada novo é salvo.
let ntClsT=0;
setTimeout(()=>{if(typeof openCls!=="function")return;const _oc=openCls;openCls=function(){try{
  if(!openCls.force&&!(rpgState().cls)&&cfg&&cfg.startDate===todayKey()){if(!ntReal(todayKey()))return;
    // logo depois da 1ª tarefa vêm os avisos da vitória (marco, conquista): a galeria espera eles fecharem, uma janela por vez
    const busy=(typeof sysQ!=="undefined"&&sysQ.length)||[...document.querySelectorAll(".sysmodal,.levelup")].some(m=>m.id!=="secZen"&&m.getClientRects().length)||Date.now()-ntTgAt<2500;
    if(busy){clearTimeout(ntClsT);ntClsT=setTimeout(()=>{try{openCls();}catch(e){}},1500);return;}}}catch(e){}
  return _oc.apply(this,arguments);};},0); // o original lê openCls.force pelo nome, que agora aponta para este embrulho

// Barra de abas (revisão horária 28/11 13h23): os rótulos (HOJE, FOCO, PROGRESSO...) estavam em 8px para TODO jogador.
// A regra "6 abas" contava o botão escondido de Lendárias como 6ª aba. Agora o rótulo usa o maior tamanho que cabe
// na aba (8 a 11,5px), medido depois do layout: muda com a largura da tela, a fonte carregada e as abas visíveis (Amigos, Lendárias, Criador).
let ntTbRaf=0;
function ntTabFit(){const bar=document.getElementById("tabbar");if(!bar)return;
  const bs=[...bar.querySelectorAll("button")].filter(b=>!b.hidden&&b.getClientRects().length);if(!bs.length)return;
  // só leitura: mede no tamanho atual e converte para 10px/.04em (largura = fs*(base + letras*espaçamento)); escreve 1x, só se mudar
  let r=0;for(const b of bs){const cs=getComputedStyle(b),fs=parseFloat(cs.fontSize)||10,ls=parseFloat(cs.letterSpacing)||0;let tw=0,nc=0;
    for(const n of b.childNodes)if(n.nodeType===3&&n.textContent.trim()){const g=document.createRange();g.selectNodeContents(n);tw+=g.getBoundingClientRect().width;nc+=n.textContent.length;}
    const aw=b.clientWidth-4;if(aw>0&&tw)r=Math.max(r,((tw-nc*ls)*10/fs+nc*.4)/aw);}
  if(!r)return;const v=Math.floor(Math.min(11.5,Math.max(8,10/r))*4)/4,px=v+"px",sp=v<=8.5?"0":".04em";
  if(bar.style.getPropertyValue("--tbfs")!==px)bar.style.setProperty("--tbfs",px);if(bar.style.getPropertyValue("--tbls")!==sp)bar.style.setProperty("--tbls",sp);}
// mede depois do layout do quadro (ResizeObserver), sem forçar recálculo no meio dos render() da abertura (#214)
const ntTbRO=typeof ResizeObserver==="function"?new ResizeObserver(()=>{try{ntTabFit();}catch(e){}}):null;
function ntTabFitSoon(){const bar=document.getElementById("tabbar");if(!bar)return;
  if(ntTbRO){ntTbRO.unobserve(bar);ntTbRO.observe(bar);return;}
  if(ntTbRaf)return;ntTbRaf=requestAnimationFrame(()=>{ntTbRaf=0;try{ntTabFit();}catch(e){}});}
(function(){try{const bar=document.getElementById("tabbar");if(!bar)return;
  new MutationObserver(ntTabFitSoon).observe(bar,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});
  new MutationObserver(ntTabFitSoon).observe(document.body,{attributes:true,attributeFilter:["class"]});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(ntTabFitSoon);ntTabFitSoon();}catch(e){}})();
