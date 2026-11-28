// ---------- Modo Sistema: o Sistema escolhe UMA missão, você só aceita e começa por 2 minutos ----------
// Para quem trava para começar (TDAH, procrastinação): menos escolha, começo minúsculo, sem culpa.
// 1) Uma missão por vez em tela cheia: ACEITAR / Trocar / Adiar. A lista continua lá atrás ("Ver todas").
// 2) Começo de 2 minutos: abre no mínimo; cumpriu, o Sistema oferece continuar com bônus (+5 XP ao terminar a completa).
// 3) Bateria do dia (usa o check-in que já existe, prog.energy): baixa = só principais no mínimo; cheia = libera extras.
// 4) Recuperação: perdeu ontem (sem escudo, sem descanso)? Um mínimo hoje salva a sequência (1 vez a cada 7 dias).
// Grava só prog.sm (novo). XP novo: "sm:<id>" (+3, começou sem ter mínimo), "smb:<id>" (+5, terminou depois do mínimo),
// "rec:<dia>" (+10, recuperação). Teto: 3 "sm:" e 3 "smb:" por dia.
const SM_START=3,SM_BONUS=5,SM_REC=10,SM_CAP=3,SM_SECS=120,SM_GAP=3*3600*1000;
function smSt(){prog.sm=prog.sm||{};const s=prog.sm;s.snz=s.snz||{};s.cont=s.cont||{};s.rec=s.rec||{};return s;}
function smEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function smTk(){return todayKey();}
function smDay(n){const d=new Date();d.setDate(d.getDate()+n);return dkey(d);}
function smAct(k){return (prog.log[k]||[]).some(e=>!/^(ach|checkin|tip|dun|adm):/.test(String(e.q)));}
function smBuzz(p){try{const ua=navigator.userActivation;if(!ua||ua.hasBeenActive)haptic(p);}catch(e){}}
function smEnergy(){return ((prog.energy||{})[smTk()])||"";}
function smDone(q){return (prog.log[smTk()]||[]).find(e=>e.q===q.id);}
function smLocked(q){try{return typeof qtLocked==="function"?qtLocked(q):null;}catch(e){return null;}}
function smName(q){try{return (typeof qtShort==="function"&&qtShort(q))||q.title;}catch(e){return q.title;}}
function smCount(pre){return (prog.log[smTk()]||[]).filter(e=>String(e.q).startsWith(pre)).length;}
// ---- recuperação: ontem ficou vazio, anteontem tinha sequência, e não usou nos últimos 7 dias ----
function smRecNeeded(){if(!cfg||cfg.blank)return false;const y=smDay(-1),b=smDay(-2),s=smSt();
  if(smAct(y)||isRest(y)||!smAct(b))return false;if(cfg.startDate&&cfg.startDate>y)return false;
  for(const k in s.rec){if((new Date(smTk())-new Date(k))/864e5<7)return false;}return true;}
function smRecDone(){return !!smSt().rec[smTk()];}
function smRecClaim(){if(!smRecNeeded()||smRecDone())return false;const y=smDay(-1);prog.rest=prog.rest||{};prog.rest[y]="rec";smSt().rec[smTk()]=y;
  addXP({q:"rec:"+smTk(),kind:"full",xp:SM_REC,stat:"foco"},"🔥 Sequência salva. +"+SM_REC+" XP de recuperação.");return true;}
// ---- quem é a próxima ----
function smCands(){const now=Date.now(),s=smSt(),e=smEnergy();
  let L=todaysQuests().filter(q=>!smDone(q)&&smLocked(q)==null&&!((s.snz[q.id]||0)>now)&&!/^(s_fech|q_fech)$/.test(q.id));
  if(e==="baixa"){const m=L.filter(q=>q.main);if(m.length)L=m;}
  const cur=slotNow(),wk=slotWakeHour()&&L.some(q=>!slotHeavy(q));
  const w=q=>(wk&&slotHeavy(q)?100000:0)+slotRank(q,cur)*1000+(q.main?0:q.once?1:2)*100+(e==="baixa"?(q.xp||0):0);
  return L.map((q,i)=>[q,i]).sort((a,b)=>w(a[0])-w(b[0])||a[1]-b[1]).map(x=>x[0]);}
let smIdx=0,smQ=null,smIv=null,smEnd=0;
function smPick(){const L=smCands();if(!L.length)return null;smIdx=smIdx%L.length;return L[smIdx];}
// ---- tela ----
function smSheet(){let m=$("smSheet");if(!m){m=smEl("div","smsheet");m.id="smSheet";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Missão do Sistema");document.body.append(m);}return m;}
// foco: ao fechar, volta para quem abriu (ou para a barra do Sistema), em vez de cair no <body>
let smPrev=null;
function smClose(){clearInterval(smIv);const m=$("smSheet");const was=m&&!m.hidden;if(m)m.hidden=true;document.body.classList.remove("insm");smBar();
  if(!was)return;const p=smPrev;smPrev=null;const ae=document.activeElement;if(ae&&ae!==document.body&&ae.isConnected&&!(m&&m.contains(ae)))return;
  const t=p&&p.isConnected&&p.getClientRects().length?p:$("smBar");if(t)try{t.focus({preventScroll:true});}catch(e){}}
function smShell(tag){const m=smSheet();if(m.hidden){const a=document.activeElement;smPrev=a&&a!==document.body&&!m.contains(a)?a:null;}m.hidden=false;document.body.classList.add("insm");setTimeout(smGuardOn,0);m.textContent="";const c=smEl("div","smcard");c.append(smEl("div","smtag","[ SISTEMA ] "+tag));m.append(c);
  const x=smEl("button","smx","✕");x.type="button";x.setAttribute("aria-label","Fechar e ver a lista");x.onclick=smClose;m.append(x);return c;}
function smOpen(){smShow();}
function smShow(){clearInterval(smIv);const s=smSt();
  const q=smPick();smQ=q;const e=smEnergy();
  if(smRecNeeded()&&!smRecDone()&&q){const c=smShell("MISSÃO DE RECUPERAÇÃO");c.append(smEl("h3","smh","Ontem passou em branco. Ainda dá para salvar."),
      smEl("p","sm","Faça só o mínimo de uma missão hoje e sua sequência de ontem é salva. +"+SM_REC+" XP."),smEl("p","sm muted","Vale 1 vez a cada 7 dias."));
    const go=smEl("button","go smgo","Bora: salvar minha sequência");go.type="button";go.onclick=()=>{s.recArm=smTk();save();smMission(q,true);};c.append(go);
    const no=smEl("button","link","Agora não");no.type="button";no.onclick=()=>{s.recArm="";save();smMission(q);};c.append(no);go.focus();return;}
  if(!q){const c=smShell("MISSÕES");const left=todaysQuests().filter(x=>!smDone(x));
    c.append(smEl("h3","smh",left.length?"Nada liberado agora.":"Tudo feito hoje."),smEl("p","sm",left.length?"As que faltam liberam mais tarde ou estão adiadas. Descanse sem culpa.":"O Sistema reconhece. Amanhã tem mais."));
    const ok=smEl("button","go smgo","Ver a lista");ok.type="button";ok.onclick=smClose;c.append(ok);ok.focus();return;}
  smMission(q);}
function smMission(q,rec){const c=smShell(rec?"MISSÃO DE RECUPERAÇÃO":q.main?"MISSÃO PRINCIPAL":"MISSÃO");const e=smEnergy();
  c.append(smEl("h3","smh",smName(q)));
  const min=q.minTitle?q.minTitle:"só os primeiros 2 minutos";
  const st=smEl("div","smstart");st.append(smEl("div","smlbl","COMECE POR AQUI · 2 MIN"),smEl("div","smmin",min));c.append(st);
  // bateria do dia dentro do cartão (1 tela a menos): enquanto não responder, vale "média"
  if(!e&&!rec&&document.querySelector("#energy button")){const r=smEl("div","smen");r.setAttribute("role","group");r.setAttribute("aria-label","Bateria de hoje");r.append(smEl("span","smenl","Bateria hoje?"));
    for(const [k,l] of [["baixa","🪫 Baixa"],["media","🔋 Média"],["alta","⚡ Cheia"]]){const b=smEl("button","ghost",l);b.type="button";b.dataset.e=k;
      b.onclick=()=>{const eb=document.querySelector('#energy button[data-e="'+k+'"]');if(eb)eb.click();else{prog.energy=prog.energy||{};prog.energy[smTk()]=k;save();}smIdx=0;setTimeout(smShow,60);};r.append(b);}c.append(r);}
  c.append(smEl("p","sm muted",(e==="baixa"?"Bateria baixa: hoje o mínimo já vale o dia inteiro. ":e==="alta"?"Bateria cheia: terminou o mínimo, vá até o fim e ganhe bônus. ":"")+(q.minTitle?"Mínimo feito: +"+Math.ceil(q.xp/2)+" XP. Completa: +"+q.xp+" XP.":"Começou: +"+SM_START+" XP. Completa: +"+q.xp+" XP.")));
  const go=smEl("button","go smgo","ACEITAR");go.type="button";go.onclick=()=>smTimer(q,rec);c.append(go);
  const r=smEl("div","smrow");const n=smCands().length;
  const tr=smEl("button","ghost","↻ Trocar");tr.type="button";tr.disabled=n<2;tr.onclick=()=>{smIdx++;smMission(smPick()||q,rec);};
  const ad=smEl("button","ghost","⏰ Adiar 1h");ad.type="button";ad.onclick=()=>{smSt().snz[q.id]=Date.now()+3600e3;save();toast("Adiada por 1 hora. Sem culpa.");smIdx=0;const nx=smPick();if(nx)smMission(nx,rec);else smShow();};
  r.append(tr,ad);c.append(r);const all=smEl("button","link","Ver todas as tarefas");all.type="button";all.onclick=smClose;c.append(all);go.focus();}
function smFmt(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
function smTimer(q,rec){const c=smShell("2 MINUTOS");smEnd=Date.now()+SM_SECS*1000;smBuzz(20);
  c.append(smEl("h3","smh",q.minTitle||smName(q)));const t=smEl("div","smclock",smFmt(SM_SECS));t.setAttribute("role","timer");t.setAttribute("aria-live","off");c.append(t);
  const tip=smEl("p","sm muted","Só começa. Se parar em 2 minutos, já valeu.");c.append(tip);
  const ok=smEl("button","go smgo",q.minTitle?"Fiz o mínimo ✓":"Comecei ✓");ok.type="button";ok.onclick=()=>smMinDone(q,rec);c.append(ok);
  const bk=smEl("button","link","Voltar");bk.type="button";bk.onclick=()=>smMission(q,rec);c.append(bk);
  smIv=setInterval(()=>{const left=(smEnd-Date.now())/1000;t.textContent=smFmt(left);if(left<=0){clearInterval(smIv);t.classList.add("end");tip.textContent="Tempo! Começou? Isso é o mais difícil.";smBuzz([30,60,30]);}},250);}
// recompensa primeiro: se a marcação gerou aviso (nível, atributo, conquista), o Sistema sai da frente e volta quando ele fechar
function smBusyRw(){return (typeof sysQ!=="undefined"&&sysQ.length)||[...document.querySelectorAll(".sysmodal:not([hidden]),.levelup:not([hidden])")].some(e=>e.getClientRects().length);}
function smAfter(fn,n){n=n||0;if(n===0){clearInterval(smIv);}if(smBusyRw()&&n<400){if(n===0){const m=$("smSheet");if(m)m.hidden=true;document.body.classList.remove("insm");}setTimeout(()=>smAfter(fn,n+1),300);return;}fn();}
// só um diálogo ativo: com outro aria-modal visível por cima (prêmio, check-in, aviso), o Sistema fica inerte até ele fechar
let smGuardIv=0;
function smGuard(){const m=$("smSheet");if(!m||m.hidden||!document.body.classList.contains("insm")){if(m){m.inert=false;m.removeAttribute("aria-hidden");}clearInterval(smGuardIv);smGuardIv=0;return;}
  const other=[...document.querySelectorAll('[aria-modal="true"]:not([hidden]),.sysmodal:not([hidden]),.levelup:not([hidden])')].some(e=>e!==m&&!m.contains(e)&&e.getClientRects().length);
  if(other!==!!m.inert){m.inert=other;if(other)m.setAttribute("aria-hidden","true");else{m.removeAttribute("aria-hidden");const g=m.querySelector(".smgo");if(g)try{g.focus();}catch(e){}}}}
function smGuardOn(){if(!smGuardIv)smGuardIv=setInterval(smGuard,250);smGuard();}
function smMinDone(q,rec){clearInterval(smIv);const s=smSt(),tk=smTk();
  if(q.minTitle){if(!smDone(q))toggle(q,"min");}
  else if(!(prog.log[tk]||[]).some(e=>e.q==="sm:"+q.id)&&smCount("sm:")<SM_CAP)addXP({q:"sm:"+q.id,kind:"full",xp:SM_START,stat:q.stat||"foco"},"Começou. +"+SM_START+" XP");
  const mc=$("muChip");if(mc)mc.remove();
  if(rec||s.recArm===tk){s.recArm="";smRecClaim();}
  setTimeout(()=>smAfter(()=>smEmb(q,s,tk)),400);}
function smEmb(q,s,tk){
  const c=smShell("MÍNIMO CUMPRIDO");c.append(smEl("h3","smh","Embalou?"),smEl("p","sm","Vá até o fim de \""+smName(q)+"\" e ganhe +"+SM_BONUS+" XP de bônus."+(smEnergy()==="baixa"?" Ou pare aqui: hoje o mínimo basta.":"")));
  const go=smEl("button","go smgo","Continuar até o fim");go.type="button";go.onclick=()=>{(s.cont[tk]=s.cont[tk]||[]).includes(q.id)||s.cont[tk].push(q.id);save();smClose();if(typeof msOpen==="function"){const f=typeof msFind==="function"?msFind(q.id):q;if(f)msOpen(f);}else toast("Quando terminar, toque em Feito na tarefa.");};
  const fu=smEl("button","ghost","Já fiz tudo ✓");fu.type="button";fu.onclick=()=>{(s.cont[tk]=s.cont[tk]||[]).includes(q.id)||s.cont[tk].push(q.id);save();toggle(q,"full");const mc=$("muChip");if(mc)mc.remove();smIdx=0;setTimeout(()=>smAfter(smShow),400);};
  const st=smEl("button","link","Parar aqui, sem culpa");st.type="button";st.onclick=()=>{smIdx=0;smShow();};
  c.append(go,fu,st);go.focus();}
// terminou a completa depois do mínimo do Sistema: bônus
{const _tg=toggle;toggle=function(q,kind){const r=_tg.apply(this,arguments);try{const tk=smTk(),s=smSt(),e=q&&smDone(q);
  if(e&&e.kind!=="min"&&(s.cont[tk]||[]).includes(q.id)&&!(prog.log[tk]||[]).some(x=>x.q==="smb:"+q.id)&&smCount("smb:")<SM_CAP)addXP({q:"smb:"+q.id,kind:"full",xp:SM_BONUS,stat:q.stat||"foco"},"⚡ Missão completa depois do mínimo. +"+SM_BONUS+" XP");
  if(q&&!e&&(prog.log[tk]||[]).some(x=>x.q==="smb:"+q.id)){prog.log[tk]=(prog.log[tk]||[]).filter(x=>x.q!=="smb:"+q.id);save();render();}
  // recuperação armada: o 1º mínimo/feito do dia salva a sequência
  if(e&&s.recArm===tk&&!smRecDone()){s.recArm="";smRecClaim();}}catch(err){}return r;};}
// ---- barra fixa em Hoje: a próxima missão sempre a 1 toque ----
function smBar(){const qs=$("quests");if(!qs||!cfg||cfg.blank)return;const sec=qs.closest("section");if(!sec)return;let b=$("smBar");
  if(!b){b=smEl("button","smbar");b.id="smBar";b.type="button";b.onclick=()=>{smIdx=0;smShow();};sec.parentNode.insertBefore(b,sec);}
  const q=smPick();b.textContent="";b.append(smEl("span","smbt","[ SISTEMA ]"));
  if(smRecNeeded()&&!smRecDone())b.append(smEl("span","smbn","🔥 Salve sua sequência: 1 mínimo hoje"));
  else b.append(smEl("span","smbn",q?"Próxima: "+smName(q):"Nada liberado agora"));
  b.append(smEl("span","smbg",q?"ACEITAR ›":"›"));}
{const _r=render;render=function(){_r.apply(this,arguments);try{smBar();}catch(e){}};}
// ---- abre sozinho ao abrir o app (no máx. a cada 3 h, nunca por cima de outra tela) ----
// em navegador automatizado (testes) não abre sozinho, para não cobrir a tela dos outros testes; o teste do Sistema liga com asc-sm-qa
function smAutoOk(){try{return !navigator.webdriver||localStorage.getItem("asc-sm-qa")==="1";}catch(e){return true;}}
function smAuto(n){n=n||0;try{if(!cfg||cfg.blank||smSt().off||!smAutoOk())return;let last=0;try{last=+localStorage.getItem("asc-sm-last")||0;}catch(e){}if(Date.now()-last<SM_GAP)return;
  const busy=($("onb")&&!$("onb").hidden)||[...document.querySelectorAll(".sysmodal:not([hidden]),#clsModal:not([hidden]),.levelup:not([hidden])")].some(e=>e.getClientRects().length)||(typeof sysQ!=="undefined"&&sysQ.length)||($("msSheet")&&!$("msSheet").hidden)||($("zapSheet")&&!$("zapSheet").hidden)||document.body.classList.contains("inmission");
  if(busy){if(n<80)setTimeout(()=>smAuto(n+1),1500);return;}
  if(!smCands().length&&smEnergy())return;try{localStorage.setItem("asc-sm-last",String(Date.now()));}catch(e){}smIdx=0;smShow();}catch(e){}}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("smSheet")&&!$("smSheet").hidden)smClose();});
document.addEventListener("visibilitychange",()=>{if(!document.hidden)setTimeout(smAuto,1200);});
setTimeout(()=>{try{smBar();}catch(e){}smAuto();},1800);
// ---- uma só "próxima" na tela (28/11): a linha do [SISTEMA] no cartão e o selo PRÓXIMA da lista seguem a mesma escolha da barra ----
// Antes eram 3 regras (só principais na ordem da lista, 1ª liberada da lista, e a do Sistema com hora/energia/adiadas): às 23h o cartão
// dizia "Bloco de estudo" e a barra "Deitar até 23h". Não grava nada; sem escolha do Sistema, fica tudo como era.
function smNext(){try{return cfg&&!cfg.blank?smPick():null;}catch(e){return null;}}
function smMark(){const q=smNext();if(!q)return;const c=document.querySelector('#quests .quest[data-q="'+q.id+'"]:not(.qtlock):not(.done):not(.min)');if(!c||c.classList.contains("next"))return;
  for(const o of document.querySelectorAll("#quests .quest.next")){o.classList.remove("next");const l=o.querySelector(".nextlbl");if(l)l.remove();}
  c.classList.add("next");const l=smEl("div","nextlbl","PRÓXIMA");c.prepend(l);}
{const _r=render;render=function(){_r.apply(this,arguments);try{smMark();}catch(e){}};}
setTimeout(()=>{try{smMark();}catch(e){}if(typeof sysLine!=="function")return;const _sl=sysLine;sysLine=function(){const t=_sl.apply(this,arguments);try{const q=smNext();if(!q)return t;const nm=smName(q);
  if(/Próxima missão(?: libera às \d+h)?: /.test(t))return t.replace(/Próxima missão(?: libera às \d+h)?: .*$/,"Próxima missão: "+nm+".");
  if(/Sugestão: /.test(t))return t.replace(/Sugestão: .*$/,"Sugestão: "+(q.minTitle?nm+" (mínimo: "+q.minTitle+")":nm)+". O mínimo já vale.");}catch(e){}return t;};},0);
