// ---------- Ouro, Loja do Ouro, Desafio Forja 30 e Hall da Fama (tools/ouro.*) ----------
// Ouro é pontuação de jogo FECHADA: não se compra, não se transfere, não vira dinheiro e não entra em sorteio.
// Tudo no aparelho. Só ADICIONA: prog.ouro (inteiro >= 0), prog.ouroX = {t0, d:{dia:ganho}, got:{chave:dia}, buy:{id:dia}, h:[{d,v,w}]}
// e prog.f30 = {s, d:{dia:"f"|"r"|"c"|"dor"}, lv0, lvb, win, walk, res:[...], hall:[...]}. Nenhum campo antigo muda.
// Ganhos (spec da EVA, 26/11): dia com as principais feitas +10, semana sem quebrar a sequência +50, chefão +30; teto 200 por dia.
// Desafio Forja 30 (regras do ARES, 27/11): 20 de 30 dias; dia = treino do Forja (ou Dia ruim) com 10 min de timer, ou caminhada de 20 min;
// 1 dia por data; força conta até 4x por semana; 2 folgas por semana não quebram a sequência; "Senti dor, parei" conta o dia.
// Quem cumpre ganha (sem ranking, sem sorteio). Bônus para quem sobe 1 nível na escada do Forja no mês (a pessoa contra ela mesma).
const OR_CAP=200,OR_G={dia:10,sem:50,tb:30,f30:100,f30lv:50};
const OR_LAW="Ouro não vale dinheiro e não pode ser sacado.";
const OR_LAW2="Não se compra, não se transfere entre jogadores, não vira Pix e não entra em sorteio.";
const OR_SHOP=[// k: f = moldura, b = fundo do cartão, t = título, s = escudo
 {id:"o_f_gelo",k:"f",n:"Lâmina de Gelo",p:80,r:1,c:["#7af3ff","#e6fbff"]},
 {id:"o_f_fenix",k:"f",n:"Asa de Brasa",p:150,r:2,c:["#ff7a1f","#ffe08a"]},
 {id:"o_f_vazio",k:"f",n:"Vazio Estelar",p:300,r:3,c:["#1b1440","#b388ff"]},
 {id:"o_b_cofre",k:"b",n:"Cofre Dourado",p:120,bg:"radial-gradient(120% 80% at 50% 0%,rgba(242,193,78,.30),transparent 60%),repeating-linear-gradient(45deg,rgba(255,224,138,.06) 0 3px,transparent 3px 16px)"},
 {id:"o_b_mare",k:"b",n:"Maré Neon",p:200,bg:"linear-gradient(160deg,rgba(0,212,255,.22),transparent 45%),radial-gradient(90% 70% at 100% 100%,rgba(61,220,151,.26),transparent 65%)"},
 {id:"o_t_tes",k:"t",n:"Tesoureiro do Sistema",p:100,r:2},
 {id:"o_t_cor",k:"t",n:"Coração de Ouro",p:250,r:3},
 {id:"o_esc",k:"s",n:"Escudo de sequência",p:150}];
const F30_LEN=30,F30_GOAL=20,F30_MINMS=10*60000,F30_WALKMS=20*60000,F30_STR=4,F30_OFF=2;
function orEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function orBtn(cl,x,fn,id){const b=orEl("button",cl,x);b.type="button";if(id)b.id=id;b.addEventListener("click",fn);return b;}
const orObj=v=>v&&typeof v==="object"&&!Array.isArray(v)?v:{};
function orMotion(){return !matchMedia("(prefers-reduced-motion: reduce)").matches;}
function orBal(){const n=Math.floor(+prog.ouro);return n>0?n:0;}
function orX(){let x=prog.ouroX;if(!x||typeof x!=="object"||Array.isArray(x))x=prog.ouroX={};
  x.d=orObj(x.d);x.got=orObj(x.got);x.buy=orObj(x.buy);if(!Array.isArray(x.h))x.h=[];if(!/^\d{4}-\d{2}-\d{2}$/.test(x.t0||""))x.t0=todayKey();return x;}
function orReady(){const hid=id=>{const e=$(id);return !e||e.hidden;};return !!(cfg&&!cfg.blank&&cfg.quests&&cfg.quests.length)&&hid("quick")&&hid("onb")&&!document.body.classList.contains("onboarding");}
function orBack(n){const d=new Date();d.setDate(d.getDate()-n);return dkey(d);}
function orAdd(k,n){const [y,m,d]=k.split("-").map(Number);const x=new Date(y,m-1,d);x.setDate(x.getDate()+n);return dkey(x);}
function orDiff(a,b){const p=k=>{const [y,m,d]=k.split("-").map(Number);return Date.UTC(y,m-1,d);};return Math.round((p(b)-p(a))/864e5);}
// dá Ouro uma vez por chave, respeitando o teto do dia. Sem espaço hoje: a chave fica livre e tenta de novo amanhã.
function orGive(key,v,why){const x=orX();if(x.got[key])return 0;const tk=todayKey();const today=+x.d[tk]||0;const g=Math.max(0,Math.min(Math.floor(v),OR_CAP-today));
  if(!g)return 0;x.got[key]=tk;x.d[tk]=today+g;prog.ouro=orBal()+g;x.h.unshift({d:tk,v:g,w:String(why||"").slice(0,40)});x.h=x.h.slice(0,30);
  const old=orBack(45);for(const k in x.d)if(k<old)delete x.d[k];for(const k in x.got)if(/^dia:/.test(k)&&k.slice(4)<old)delete x.got[k];
  save();orFx(g,why);return g;}
function orSpend(id,cost,why){const x=orX();if(orBal()<cost)return false;prog.ouro=orBal()-cost;if(OR_SHOP.some(it=>it.id===id))x.buy[id]=todayKey();x.h.unshift({d:todayKey(),v:-cost,w:String(why||"").slice(0,40)});x.h=x.h.slice(0,30);save();return true;}
// moedinha que sobe da pílula (sem movimento com reduce-motion: só o texto)
function orFx(g,why){orPill();const p=$("ouroPill");try{haptic([10,30,10]);}catch(e){}
  let f=$("orFx");if(!f){f=orEl("div","orfx");f.id="orFx";f.setAttribute("role","status");f.setAttribute("aria-live","polite");document.body.append(f);}
  f.textContent="+"+g+" 🪙 Ouro"+(why?" · "+why:"");f.classList.remove("on");void f.offsetWidth;f.classList.add("on");clearTimeout(orFx._t);orFx._t=setTimeout(()=>f.classList.remove("on"),2600);
  if(p&&orMotion()){p.classList.remove("bump");void p.offsetWidth;p.classList.add("bump");}}
// ---------- ganhos: lidos do histórico, cada um com chave única (marcar e desmarcar não rende Ouro de novo) ----------
function orWeekOk(ws){for(let i=0;i<7;i++){const k=orAdd(ws,i);if(k>todayKey())return false;if(!(typeof stAct==="function"?stAct(k):(prog.log[k]||[]).length)&&!isRest(k))return false;}return true;}
let orBusy=false;
function orScan(){if(orBusy||!orReady())return;orBusy=true;try{const x=orX(),tk=todayKey();
  try{if(allMainsDone(new Date()))orGive("dia:"+tk,OR_G.dia,"Dia completo");}catch(e){}
  // semana sem quebrar a sequência: a que acabou (ou a de hoje, se é domingo e o dia já está ativo)
  const wsNow=weekStart(tk),wsPrev=weekStart(orBack(7));
  for(const ws of [wsPrev,wsNow]){if(x.got["sem:"+ws]||orAdd(ws,6)<x.t0)continue;if(ws===wsNow&&orAdd(ws,6)!==tk)continue;if(orWeekOk(ws))orGive("sem:"+ws,OR_G.sem,"Semana sem quebrar");}
  // chefão derrotado (XP "ach:tb:<semana>" do tools/boss.js)
  for(let i=0;i<14;i++){const k=orBack(i);if(k<x.t0)break;for(const e of (prog.log[k]||[])){const m=/^ach:tb:(\d{4}-\d{2}-\d{2})$/.exec(String(e.q));if(m)orGive("tb:"+m[1],OR_G.tb,"Chefão derrotado");}}
  f30Scan();}finally{orBusy=false;}}
// ---------- itens da loja: entram nas listas que já existem só quando são seus (o baú nunca sorteia item da loja) ----------
function orOwn(id){return !!orX().buy[id];}
function orHook(){const x=orX();
  for(const it of OR_SHOP){if(!x.buy[it.id])continue;
    if(it.k==="f"&&typeof BX_FR!=="undefined"&&!BX_FR.some(f=>f[0]===it.id))BX_FR.push([it.id,it.n,it.r,it.c[0],it.c[1]]);
    if(it.k==="t"&&typeof BX_TT!=="undefined"&&!BX_TT.some(t=>t[0]===it.id))BX_TT.push([it.id,it.n,it.r]);
    if(it.k==="b"&&typeof HR_BG!=="undefined"&&!HR_BG.some(b=>b[0]===it.id))HR_BG.push([it.id,it.n,1,it.bg]);}
  // títulos do desafio: raridade certa na coleção (só para quem já tem)
  if(typeof BX_TT!=="undefined"){let own=[];try{own=bxSt().titles.map(t=>t.id);}catch(e){}for(const [id,n] of [["o_t_f30","Forjado em 30"],["o_t_acima","Acima de Ontem"]])if(!BX_TT.some(t=>t[0]===id)&&(own.includes(id)||(id==="o_t_f30"&&f30St().win)||(id==="o_t_acima"&&f30St().lvb)))BX_TT.push([id,n,3]);}}
function orInUse(it){try{if(it.k==="f")return bxSt().frame===it.id;if(it.k==="t")return bxSt().title===it.id;if(it.k==="b")return hrSt().bg===it.id;}catch(e){}return false;}
function orUse(it){try{if(it.k==="f"){const c=bxSt();c.frame=c.frame===it.id?"":it.id;save();bxApplyFrame();bxColUI();toast(c.frame?"Moldura em uso: "+it.n:"Moldura removida.");}
  else if(it.k==="t"){const on=bxSt().title===it.id;bxEquipTitle(on?"":it.id);toast(on?"Título removido.":"Título em uso: "+it.n);}
  else if(it.k==="b"){const h=hrSt();h.bg=h.bg===it.id?"grade":it.id;save();toast(h.bg===it.id?"Fundo do cartão: "+it.n:"Fundo padrão.");}}catch(e){}try{render();}catch(e){}}
function orShieldN(){try{return shieldSt().n;}catch(e){return 0;}}
function orShieldMax(){return typeof ST_MAX==="number"?ST_MAX:2;}
let orArm="";
function orBuy(it){if(orArm!==it.id){orArm=it.id;orShop();return;}orArm="";
  if(it.k==="s"){if(orShieldN()>=orShieldMax()){toast("Você já guarda o máximo de escudos.");orShop();return;}if(!orSpend(it.id,it.p,it.n)){orShop();return;}
    const s=shieldSt();s.n++;save();toast("🛡️ Escudo guardado. Agora: "+s.n+".");try{render();}catch(e){}orShop();return;}
  if(orOwn(it.id)){orShop();return;}if(!orSpend(it.id,it.p,it.n)){toast("Falta Ouro para esse item.");orShop();return;}
  orHook();if(it.k==="t"){try{bxGiveTitle(it.id,it.n,"loja");}catch(e){}}else if(it.k==="f"){try{const c=bxSt();if(!c.frames.includes(it.id))c.frames.push(it.id);save();}catch(e){}}
  try{haptic([15,40,15]);}catch(e){}try{if(typeof sparks==="function")sparks(true);}catch(e){}
  orUse(it);orShop();}
// ---------- Loja (janela do Sistema) ----------
let orPrev=null;
function orClose(){const m=$("orModal");if(m)m.remove();orArm="";document.removeEventListener("keydown",orKey);try{if(orPrev&&orPrev.isConnected)orPrev.focus();}catch(e){}orPrev=null;try{render();}catch(e){}}
function orKey(e){if(e.key==="Escape")orClose();}
function orOpen(){if($("orModal"))return orShop();orPrev=document.activeElement;orArm="";
  const m=orEl("div","sysmodal ormodal");m.id="orModal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-labelledby","orTitle");
  m.addEventListener("click",e=>{if(e.target===m)orClose();});document.body.append(m);document.addEventListener("keydown",orKey);orShop();
  setTimeout(()=>{const b=$("orClose");if(b)try{b.focus({preventScroll:true});}catch(e){}},40);}
function orShop(){const m=$("orModal");if(!m)return;const keep=document.activeElement&&m.contains(document.activeElement)?document.activeElement.dataset.or||document.activeElement.id:"";
  m.textContent="";orHook();const c=orEl("div","card orcard");const bal=orBal();
  c.append(orEl("div","tag","[ SISTEMA ] LOJA DO OURO"));const h=orEl("h3","orbal","🪙 "+bal+" de Ouro");h.id="orTitle";c.append(h);
  const today=+orX().d[todayKey()]||0;c.append(orEl("div","sm muted","Hoje: +"+today+" de "+OR_CAP+" possíveis."));
  const how=orEl("details","orhow");how.append(orEl("summary",null,"Como ganhar Ouro"));const ul=orEl("ul","sm");
  for(const t of ["Dia com as tarefas principais feitas: +"+OR_G.dia,"Semana sem quebrar a sequência: +"+OR_G.sem,"Chefão derrotado: +"+OR_G.tb,"Desafio Forja 30 cumprido: +"+OR_G.f30+" e título","Subir 1 nível no Forja durante o desafio: +"+OR_G.f30lv,"Seu Ouro também paga as recompensas da vida real do Baú (Progresso)"])ul.append(orEl("li",null,t));
  how.append(ul);c.append(how);
  const groups=[["f","Molduras"],["b","Fundos do cartão"],["t","Títulos raros"],["s","Proteção"]];
  for(const [k,nm] of groups){c.append(orEl("h4","orh",nm));const g=orEl("div","orgrid");
    for(const it of OR_SHOP.filter(x=>x.k===k)){const own=it.k!=="s"&&orOwn(it.id),use=own&&orInUse(it),arm=orArm===it.id;
      const full=it.k==="s"&&orShieldN()>=orShieldMax(),poor=!own&&bal<it.p;
      const b=orEl("button","oritem"+(own?" own":"")+(use?" eq":"")+(arm?" arm":"")+(poor||full?" poor":""));b.type="button";b.dataset.or=it.id;
      const pv=orEl("span","orpv");if(it.k==="f"){pv.classList.add("fr");pv.style.setProperty("--bxf1",it.c[0]);pv.style.setProperty("--bxf2",it.c[1]);try{pv.innerHTML=avMine(40);}catch(e){pv.textContent="◎";}}
      else if(it.k==="b"){pv.classList.add("bg");pv.style.backgroundImage=it.bg;}else pv.textContent=it.k==="t"?"«»":"🛡️";
      const lab=it.k==="s"?(full?"Máximo ("+orShieldN()+")":arm?"Confirmar · "+it.p+" 🪙":it.p+" 🪙 · você tem "+orShieldN()):own?(use?"Em uso":"Usar"):arm?"Confirmar · "+it.p+" 🪙":it.p+" 🪙";
      b.append(pv,orEl("b","orn",it.k==="t"?"« "+it.n+" »":it.n),orEl("span","orp",lab));
      b.setAttribute("aria-label",(it.k==="t"?"Título ":"")+it.n+". "+lab+(poor&&!arm?". Falta "+(it.p-bal)+" de Ouro":""));
      if(full)b.disabled=true;
      b.addEventListener("click",()=>{if(own){orUse(it);orShop();return;}if(poor){toast("Faltam "+(it.p-bal)+" de Ouro para "+it.n+".");return;}orBuy(it);});g.append(b);}
    c.append(g);}
  const hist=orX().h.slice(0,5);if(hist.length){const d=orEl("details","orhow");d.append(orEl("summary",null,"Extrato"));const ol=orEl("ul","sm orext");
    for(const e of hist){const [,mo,da]=e.d.split("-");ol.append(orEl("li",e.v<0?"neg":"",da+"/"+mo+" · "+(e.v>0?"+":"")+e.v+" · "+e.w));}d.append(ol);c.append(d);}
  c.append(orEl("p","sm orlaw",OR_LAW+" "+OR_LAW2));
  c.append(orBtn("go","Fechar",orClose,"orClose"));m.append(c);
  if(keep){const k=m.querySelector('[data-or="'+keep+'"]')||document.getElementById(keep);if(k)try{k.focus({preventScroll:true});}catch(e){}}}
// pílula 🪙 ao lado do escudo (só aparece depois do 1º Ouro ou com a loja já aberta uma vez)
function orPill(){const st=$("streak");if(!st)return;let p=$("ouroPill");
  if(!p){p=orBtn("pill ouro","",orOpen,"ouroPill");const after=$("shieldPill")||st;after.after(p);}
  const n=orBal();const show=orReady()&&(n>0||orX().h.length>0);p.hidden=!show;p.textContent="🪙 "+n;p.setAttribute("aria-label",n+" de Ouro. Abrir a loja");}
// painel na aba Progresso (recolhido pelas telas enxutas)
function orPanel(){let p=$("orPanel");const anchor=$("bxCol")||document.querySelector('.wrap>section[data-tab="prog"]');if(!anchor)return;
  if(!p){p=orEl("section","panel orpanel");p.id="orPanel";p.dataset.tab="prog";anchor.before(p);}
  if(!orReady()){p.hidden=true;return;}p.hidden=false;
  (typeof bxHead==="function"?bxHead:(p,t,m)=>{p.textContent="";const hd=orEl("div","qhead");hd.append(orEl("h2",null,t),orEl("span","sm mono",m));p.append(hd);})(p,"🪙 Ouro e Loja",orBal()+" de Ouro");
  p.append(orEl("div","sm muted","Dia completo +"+OR_G.dia+" · semana sem quebrar +"+OR_G.sem+" · chefão +"+OR_G.tb+". Teto de "+OR_CAP+" por dia."));
  p.append(orBtn("go","Abrir a loja",orOpen,"orOpenP"));p.append(orEl("div","sm muted orlaw",OR_LAW));}
// ---------- Desafio Forja 30 ----------
function f30St(){let f=prog.f30;if(!f||typeof f!=="object"||Array.isArray(f))f=prog.f30={};f.d=orObj(f.d);if(!Array.isArray(f.res))f.res=[];if(!Array.isArray(f.hall))f.hall=[];return f;}
function f30Kid(){try{return typeof muKid==="function"&&muKid();}catch(e){return false;}}
function f30Teen(){try{const a=ageNow();return a==="teen"||(!a&&typeof AGE_UNK_MINOR!=="undefined"&&AGE_UNK_MINOR);}catch(e){return false;}}
function f30Ok(){return !f30Kid()&&typeof fjS==="function";}
function f30End(f){return f.s?orAdd(f.s,F30_LEN-1):"";}
function f30On(){const f=f30St();return !!f.s&&!f.win&&todayKey()<=f30End(f)&&todayKey()>=f.s;}
function f30Days(f){const e=f30End(f);return Object.keys(f.d).filter(k=>k>=f.s&&k<=e);}
function f30Count(f){return f30Days(f).length;}
function f30Idx(f){return Math.min(F30_LEN,orDiff(f.s,todayKey())+1);}
function f30Str(f,k){const ws=weekStart(k);return f30Days(f).filter(x=>weekStart(x)===ws&&(f.d[x]==="f"||f.d[x]==="r")).length;}
function f30LvSum(){try{const f=fjS();let n=0;for(const k in f.lv)n+=+f.lv[k]||0;return n;}catch(e){return 0;}}
// sequência do desafio: até 2 folgas por semana não quebram; hoje ainda em aberto não conta como folga
function f30Run(f){if(!f.s)return {n:0,off:0};let n=0;const miss={};let k=todayKey();if(k>f30End(f))k=f30End(f);
  for(;k>=f.s;k=orAdd(k,-1)){if(f.d[k]){n++;continue;}if(k===todayKey())continue;const ws=weekStart(k);miss[ws]=(miss[ws]||0)+1;if(miss[ws]>F30_OFF)break;}
  return {n,off:Math.min(F30_OFF,miss[weekStart(todayKey())]||0)};}
// marca o dia; devolve "ok", "dup" (já contou hoje), "cap" (força já contou 4x na semana) ou "" (sem desafio)
function f30Mark(type){const f=f30St();const tk=todayKey();if(!f30On())return "";if(f.d[tk])return "dup";
  if((type==="f"||type==="r")&&f30Str(f,tk)>=F30_STR)return "cap";f.d[tk]=type;save();setTimeout(()=>{f30Scan();try{render();}catch(e){}},0);return "ok";}
function f30Start(){const f=f30St();if(f30On())return;f.s=todayKey();f.d={};f.lv0=f30LvSum();f.lvb=0;f.win="";f.walk=null;save();try{render();}catch(e){}
  sysPop("DESAFIO FORJA 30","Desafio aceito 🏆","Meta: "+F30_GOAL+" dias de "+F30_LEN+". Vale treino do Forja (ou Dia ruim) com 10 min de timer, ou caminhada de 20 min. 2 folgas por semana não quebram nada. Todo mundo que cumprir ganha.",null,"Bora");}
function f30Quit(){const f=f30St();if(!f.s)return;f.res.push({s:f.s,e:todayKey(),n:f30Count(f),w:0,q:1});f.res=f.res.slice(-12);f.s="";f.d={};f.walk=null;save();try{render();}catch(e){}toast("Desafio encerrado. Seu XP e seu Forja continuam. Pode recomeçar quando quiser.");}
function f30Scan(){const f=f30St();if(!f.s)return;const tk=todayKey();
  // subiu 1 nível na escada durante o desafio: bônus uma vez
  // vale só subida de verdade no Forja (entrada forja:lv:* desde o início do desafio); o « Sim » do ajuste rápido não conta
  const up=typeof fjNivelSubiu==="function"?fjNivelSubiu(f.s):f30LvSum()>(+f.lv0||0);
  if(!f.win&&tk<=f30End(f)&&!f.lvb&&up){f.lvb=1;save();orHook();try{bxGiveTitle("o_t_acima","Acima de Ontem","desafio");}catch(e){}orGive("f30lv:"+f.s,OR_G.f30lv,"Subiu de nível no Forja");}
  if(!f.win&&f30Count(f)>=F30_GOAL){f.win=tk;const n=f30Count(f);f.res.push({s:f.s,e:tk,n,w:1});f.res=f.res.slice(-12);f.hall.unshift({s:f.s,e:tk,n});f.hall=f.hall.slice(0,12);save();orHook();
    try{bxGiveTitle("o_t_f30","Forjado em 30","desafio");}catch(e){}orGive("f30:"+f.s,OR_G.f30,"Desafio Forja 30");
    sysPop("DESAFIO FORJA 30","Cumprido: "+n+" dias 🏆","Você ganhou o título raro « Forjado em 30 » e +"+OR_G.f30+" de Ouro. Seu nome entrou no Hall da Fama deste aparelho"+(hlCan()?"; dá para mostrar para os amigos em Progresso.":"."),null,"Fechou");return;}
  if(!f.win&&tk>f30End(f)){const n=f30Count(f);f.res.push({s:f.s,e:f30End(f),n,w:0});f.res=f.res.slice(-12);f.s="";f.d={};f.walk=null;save();
    sysPop("DESAFIO FORJA 30","Fim dos 30 dias: "+n+" de "+F30_GOAL,"Não fechou desta vez, e tudo bem: cada dia de treino ficou no seu corpo e no seu Forja. Recomece quando quiser, do zero e sem dívida.",null,"Entendi");}}
// ---------- caminhada de 20 min (timer simples, continua contando com o app fechado) ----------
let f30Tk=null,f30Prev=null;
function f30Walk(){const f=f30St();if(!f30On())return;if(!f.walk||f.walk.d!==todayKey()){f.walk={d:todayKey(),t0:Date.now()};save();}
  let m=$("f30Walk");if(!m){m=orEl("div","sysmodal f30walk");m.id="f30Walk";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-labelledby","f30WT");document.body.append(m);}
  f30Prev=document.activeElement;f30WalkUI();clearInterval(f30Tk);f30Tk=setInterval(f30WalkUI,1000);setTimeout(()=>{const b=m.querySelector(".go");if(b)try{b.focus({preventScroll:true});}catch(e){}},40);}
function f30WalkClose(){clearInterval(f30Tk);f30Tk=null;const m=$("f30Walk");if(m)m.remove();try{if(f30Prev&&f30Prev.isConnected)f30Prev.focus();}catch(e){}try{render();}catch(e){}}
function f30WalkUI(){const m=$("f30Walk");const f=f30St();if(!m||!f.walk){clearInterval(f30Tk);return;}const el=Date.now()-f.walk.t0,ok=el>=F30_WALKMS;
  const keep=document.activeElement&&m.contains(document.activeElement)?document.activeElement.id:"";m.textContent="";
  const c=orEl("div","card");c.append(orEl("div","tag","[ SISTEMA ] DESAFIO FORJA 30"));const h=orEl("h3",null,"🚶 Caminhada de 20 min");h.id="f30WT";c.append(h);
  const t=orEl("div","f30clock",fmt(Math.min(el,F30_WALKMS))+" / 20:00");t.setAttribute("aria-live","off");c.append(t);
  const bar=orEl("div","f30bar");const i=orEl("i");i.style.width=Math.min(100,Math.round(100*el/F30_WALKMS))+"%";bar.append(i);c.append(bar);
  c.append(orEl("div","sm muted",ok?"20 min! Pode registrar.":"Pode fechar esta janela: o tempo continua contando. Ritmo de conversa, sem pressa."));
  const row=orEl("div","row");const go=orBtn("go",ok?"✓ Terminei a caminhada":"Faltam "+fmt(F30_WALKMS-el),()=>{if(!ok)return;f.walk=null;const r=f30Mark("c");f30WalkClose();f30Said(r,"Caminhada");},"f30WGo");go.disabled=!ok;
  row.append(go,orBtn("ghost","Fechar",f30WalkClose,"f30WMin"));c.append(row);
  c.append(orBtn("link f30dor","🤕 Senti dor, parei",()=>{f.walk=null;save();f30WalkClose();f30Dor();},"f30WDor"));m.append(c);
  if(keep){const k=document.getElementById(keep);if(k&&!k.disabled)try{k.focus({preventScroll:true});}catch(e){}}}
function f30Said(r,what){if(r==="ok"){const f=f30St();toast("🏆 Dia "+f30Count(f)+" de "+F30_GOAL+" no Desafio Forja 30 ("+what+").");}else if(r==="dup")toast("Hoje já contou no Desafio. Amanhã tem mais.");
  else if(r==="cap")toast("A força já contou "+F30_STR+"x nesta semana. Hoje, caminhada de 20 min vale o dia.");}
function f30Dor(pre){const r=pre||f30Mark("dor");const safe=typeof FJ_SAFE==="string"?FJ_SAFE:"Se a dor não passar, procure atendimento.";
  sysPop("PAROU NA HORA CERTA",r==="ok"?"Dia contado no Desafio ✓":"Parar foi a escolha certa","Dor é sinal para parar, não para insistir. "+safe,null,"Entendi");}
// "Senti dor, parei" também dentro do treino do Forja
if(typeof fjRunV==="function"){const _rv=fjRunV;fjRunV=function(c,f){_rv.apply(this,arguments);if(!f30On()||c.querySelector("#fjDor"))return; // a Forja já tem o « Senti dor, parei » (#166): um botão só
  c.append(fjBtn("link f30dor","🤕 Senti dor, parei",()=>{const cu=prog.forja&&prog.forja.cur;const any=cu&&Object.values(cu.sets||{}).some(a=>a&&a.length);
    const r=f30Mark("dor");if(any){fjFinish();fjClose();}else{if(prog.forja)prog.forja.cur=null;save();fjClose();}f30Dor(r||"x");},"f30Dor"));};}
// treino do Forja terminado: conta se o timer passou de 10 min
let f30Last="";
if(typeof fjFinish==="function"){const _ff=fjFinish;fjFinish=function(){const cu=prog.forja&&prog.forja.cur;const ms=cu?Date.now()-(+cu.t0||Date.now()):0,ruim=cu&&cu.ruim;
  const any=cu&&FJ_TR[cu.tipo]&&FJ_TR[cu.tipo].some(m=>(cu.sets[m]||[]).length);f30Last="";
  if(cu&&cu.dor&&f30On())f30Last=f30St().d[todayKey()]?"dup":(f30Mark("dor")==="ok"?"dor":"");else if(any&&f30On()){
    if(f30St().d[todayKey()])f30Last="dup";else if(ms<F30_MINMS)f30Last="short:"+Math.ceil((F30_MINMS-ms)/60000);else f30Last=f30Mark(ruim?"r":"f");}
  _ff.apply(this,arguments);};}
// caminhada da Forja (#166): no Desafio vale com 20 min; "Senti dor, parei" na caminhada conta o dia
let f30WArm=0;
if(typeof fjWalkEnd==="function"){const _we=fjWalkEnd;fjWalkEnd=function(dor){const w=prog.forja&&prog.forja.walk;const ms=w?Date.now()-(+w.t0||Date.now()):0;
  const ends=w&&(dor||ms>=FJ_WALK_MIN*60000);f30Last="";
  if(ends&&f30On()){if(f30St().d[todayKey()])f30Last="dup";else if(dor)f30Last=f30Mark("dor")==="ok"?"dor":"";
    else if(ms<F30_WALKMS){const left=Math.ceil((F30_WALKMS-ms)/60000);
      if(!(f30WArm&&Date.now()-f30WArm<6000)){f30WArm=Date.now();toast("No Desafio, a caminhada vale com 20 min. Faltam "+left+" min. Toque de novo para encerrar assim mesmo.");return;}
      f30Last="walk:"+left;}
    else f30Last=f30Mark("c");}
  f30WArm=0;
  return _we.apply(this,arguments);};}
if(typeof fjDoneV==="function"){const _dv=fjDoneV;fjDoneV=function(c,f){_dv.apply(this,arguments);if(!f30Last)return;const F=f30St();let t="";
  if(f30Last==="ok"||f30Last==="dor")t="🏆 Desafio Forja 30: dia "+f30Count(F)+" de "+F30_GOAL+" ✓";else if(f30Last.startsWith("walk:"))t="🏆 No Desafio, a caminhada vale com 20 min. Faltaram "+f30Last.slice(5)+" min.";else if(f30Last==="cap")t="🏆 A força já contou "+F30_STR+"x nesta semana. Hoje, caminhada de 20 min vale o dia.";
  else if(f30Last.startsWith("short:"))t="🏆 No Desafio, o dia vale com 10 min de treino. Faltaram "+f30Last.slice(6)+" min: dá para completar com a caminhada de 20 min.";
  if(t){const l=orEl("div","sm f30line",t);const cl=c.querySelector("#fjClose");cl?cl.before(l):c.append(l);}};}
function f30Box(p,full){const f=f30St();const box=orEl("div","f30box");box.id=full?"f30BoxP":"f30Box";
  if(!f30On()){if(!full&&(f.res||[]).length&&!(f.win&&orDiff(f.win,todayKey())<=2))return;
    if(f.win&&!full){const n=f30Count(f);box.append(orEl("div","sm f30ok","🏆 Desafio Forja 30 cumprido ("+n+" dias). « Forjado em 30 » é seu."));const r=orEl("div","row");r.append(orBtn("link","Novo desafio",()=>{f.win="";f.s="";save();f30Start();},"f30Again"));box.append(r);p.append(box);return;}
    box.append(orEl("div","sm","🏆 Desafio Forja 30: "+F30_GOAL+" dias de treino em "+F30_LEN+". Quem cumpre ganha título raro e +"+OR_G.f30+" de Ouro."));
    if(full){const ul=orEl("ul","sm muted f30rules");for(const t of ["Vale: treino do Forja no seu nível ou Dia ruim, com 10 min de timer, ou caminhada de 20 min.","1 dia por data. A força conta até "+F30_STR+"x por semana.","2 folgas por semana não quebram a sequência.","Sentiu dor? Toque em « Senti dor, parei »: o dia conta.","Subiu 1 nível na escada do Forja no mês: +"+OR_G.f30lv+" de Ouro."])ul.append(orEl("li",null,t));box.append(ul);}
    if(f30Teen())box.append(orEl("div","sm muted f30teen","14 a 17 anos: só peso do corpo, mochila leve ou elástico. Nada de máximo de repetições. O app nunca pede foto do corpo."));
    box.append(orBtn(full?"go":"ghost","Entrar no desafio",f30Start,full?"f30JoinP":"f30Join"));p.append(box);return;}
  const n=f30Count(f),i=f30Idx(f),run=f30Run(f),tk=todayKey(),done=!!f.d[tk];
  const top=orEl("div","f30top");top.append(orEl("b",null,"🏆 Desafio Forja 30"),orEl("span","sm mono",n+"/"+F30_GOAL+" · dia "+i+" de "+F30_LEN));box.append(top);
  const bar=orEl("div","f30bar");bar.setAttribute("role","progressbar");bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax",String(F30_GOAL));bar.setAttribute("aria-valuenow",String(n));bar.setAttribute("aria-label",n+" de "+F30_GOAL+" dias cumpridos");
  const fi=orEl("i");fi.style.width=Math.round(100*Math.min(n,F30_GOAL)/F30_GOAL)+"%";bar.append(fi);box.append(bar);
  const left=F30_GOAL-n,rest=F30_LEN-i+(done?0:1);
  box.append(orEl("div","sm muted",(done?"Hoje contou ✓ · ":"")+"Sequência: "+run.n+(run.n===1?" dia":" dias")+" · folgas na semana: "+run.off+" de "+F30_OFF+(left>rest?" · a meta não cabe mais nos dias que faltam, mas cada treino ainda vale":"")));
  if(!done){const row=orEl("div","row f30row");const fjw=typeof fjWalk==="function";if(f.walk&&f.walk.d===tk)row.append(orBtn("ghost","🚶 Caminhada em andamento",f30Walk,full?"f30WalkP":"f30WalkC"));else if(!fjw||full||!$("fjWalk"))row.append(orBtn("ghost","🚶 Caminhada 20 min",fjw?()=>fjWalk():f30Walk,full?"f30WalkP":"f30WalkC"));
    if(f30Str(f,tk)>=F30_STR)box.append(orEl("div","sm muted","A força já contou "+F30_STR+"x nesta semana: hoje vale a caminhada."));box.append(row);}
  if(full){const r=orEl("div","row");r.append(orBtn("link","Sair do desafio",()=>{const b=$("f30Quit");if(b&&!b.dataset.arm){b.dataset.arm=1;b.textContent="Toque de novo para sair (seu XP continua)";setTimeout(()=>{if(b.isConnected){delete b.dataset.arm;b.textContent="Sair do desafio";}},4000);return;}f30Quit();},"f30Quit"));box.append(r);}
  p.append(box);}
if(typeof fjCard==="function"){const _fc=fjCard;fjCard=function(){_fc.apply(this,arguments);const p=$("fjCard");if(!p||p.hidden||!f30Ok())return;const old=$("f30Box");if(old)old.remove();
  const f=fjS();if(!f30On()&&!f30St().win&&!f.ses.length)return; // antes do 1º treino, o card fica só com o treino
  f30Box(p,false);};}
if(typeof fjPanel==="function"){const _fp=fjPanel;fjPanel=function(){_fp.apply(this,arguments);const b=$("fjBody");if(!b||!f30Ok())return;const old=$("f30WrapP");if(old)old.remove();
  const h=orEl("div","f30wrap");h.id="f30WrapP"; // id próprio: o quadro de dentro já é #f30BoxP (id único na página)
  f30Box(h,true);const first=b.querySelector(".fjmov");first?first.before(h):b.append(h);};}
// ---------- Hall da Fama: o do aparelho sempre; o da turma (só amigos, regras do Mural) quando o servidor tiver as ações hall/hlist ----------
function hlCan(){try{return typeof muPhotoOn==="function"&&muPhotoOn();}catch(e){return false;}}
let hlRows=null,hlAt=0,hlBusy=false,hlOff=false;
async function hlLoad(){if(!hlCan()||hlOff||hlBusy||!muSt().ok||Date.now()-hlAt<60000)return;hlBusy=true;hlAt=Date.now();
  try{const j=await muApi("hlist");hlRows=Array.isArray(j.hall)?j.hall.slice(0,30):[];}catch(e){if(/acao/.test(String(e.message||"")))hlOff=true;}hlBusy=false;hlUI();}
async function hlPost(h){if(!muSt().ok)return muConsent(()=>hlPost(h));try{await muApi("hall",{c:"f30",s:h.s,k:h.n});h.pub=1;save();toast("🏆 No Hall da guilda. Só seus amigos veem.");hlAt=0;hlLoad();}
  catch(e){const er=String(e.message||"");if(/acao/.test(er)){hlOff=true;toast("O Hall da guilda ainda não está ligado no servidor. O seu continua aqui.");}else toast(/amigo/.test(er)?"Adicione um amigo antes.":"Não deu agora. Tente de novo.");}hlUI();}
function hlUI(){let p=$("hlPanel");const anchor=$("orPanel")||$("bxCol")||document.querySelector('.wrap>section[data-tab="prog"]');if(!anchor)return;
  if(!p){p=orEl("section","panel hlpanel");p.id="hlPanel";p.dataset.tab="prog";anchor.after(p);}const f=f30St();
  if(!orReady()||(!f.hall.length&&!(hlRows&&hlRows.length))){p.hidden=true;return;}p.hidden=false;
  (typeof bxHead==="function"?bxHead:(p,t,m)=>{p.textContent="";const hd=orEl("div","qhead");hd.append(orEl("h2",null,t),orEl("span","sm mono",m));p.append(hd);})(p,"🏛️ Hall da Fama",f.hall.length+(f.hall.length===1?" desafio":" desafios"));
  p.append(orEl("div","sm muted","Quem cumpre o Desafio Forja 30 entra. Sem ranking: cada um contra si mesmo."));
  const ul=orEl("ul","hllist");for(const h of f.hall){const [,m1,d1]=h.s.split("-"),[,m2,d2]=h.e.split("-");const li=orEl("li",null);li.append(orEl("b",null,"🏆 Você · "+h.n+" dias"),orEl("span","sm muted",d1+"/"+m1+" a "+d2+"/"+m2));
    if(hlCan()&&!hlOff&&!h.pub)li.append(orBtn("link","Mostrar para os amigos",()=>hlPost(h)));else if(h.pub)li.append(orEl("span","sm muted","amigos veem"));ul.append(li);}
  p.append(ul);
  if(hlRows&&hlRows.length){p.append(orEl("h4","orh","Da guilda (só amigos)"));const tl=orEl("ul","hllist");const me=String((typeof rankName==="function"&&rankName())||"").toLowerCase();
    for(const r of hlRows){const a=String(r.a||"").slice(0,16);if(a.toLowerCase()===me)continue;const li=orEl("li",null);li.append(orEl("b",null,"🏆 "+a),orEl("span","sm muted",muAgo(r.d)));tl.append(li);}
    if(tl.children.length)p.append(tl);}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest('#tabbar [data-go="prog"]');if(b)setTimeout(()=>{try{hlLoad();}catch(x){}},0);},true);
// ---------- ligações ----------
{const _rp=renderPills;renderPills=function(){_rp.apply(this,arguments);try{orPill();}catch(e){}};}
{const _r=render;render=function(){_r.apply(this,arguments);try{orHook();orPill();orPanel();hlUI();}catch(e){}clearTimeout(orScan._t);orScan._t=setTimeout(()=>{try{orScan();}catch(e){}},400);};}
setTimeout(()=>{try{orHook();orPill();orPanel();hlUI();orScan();}catch(e){}},0);
// ---------- Uma moeda só: as moedas do Baú de recompensas viram Ouro (27/11) ----------
// Antes: 10 XP = 1 moeda no Baú (prêmios da vida real) e Ouro na Loja. Duas moedas confundem; agora tudo é Ouro.
// Migração 1 vez por aparelho: BACKUP do progresso em "<prefixo>-prog-preouro" ANTES; sem backup, não migra.
// Só ADICIONA: o saldo de moedas (XP/10 menos o gasto) entra em prog.ouro e fica registrado em prog.ouroX.mig = {d, c}.
// Nada é apagado: prog.rpg.spent e as recompensas continuam iguais. Caminho de volta: orUnmerge() (Mais > Ajustes) tira
// o que entrou e volta o Baú para moedas; o backup também fica no aparelho.
const OR_BK="asc-u-prog-preouro";
function orMerged(){const m=orX().mig;return !!(m&&typeof m==="object"&&!m.off);}
function orMerge(){if(!orReady())return;const x=orX();if(x.mig)return;let c=0;try{c=Math.max(0,coinsEarned()-rpgState().spent);}catch(e){return;}
  try{localStorage.setItem(OR_BK,JSON.stringify(prog));if(!localStorage.getItem(OR_BK))return;}catch(e){return;}
  x.mig={d:todayKey(),c};if(c>0){prog.ouro=orBal()+c;x.h.unshift({d:todayKey(),v:c,w:"Moedas do Baú viraram Ouro"});x.h=x.h.slice(0,30);}save();orChest();orPill();
  // como a tela de Novidades (tools/versao.js): não abre em navegador automatizado, para não travar os testes da qa/
  // perfil novo (criado hoje ou ontem) nunca viu moedas: migra calado (QA 60 s, 28/11: "Suas 1 moedas…" no 1º minuto)
  let novo=false;try{const sd=cfg&&cfg.startDate;novo=!sd||(new Date(todayKey()+"T12:00")-new Date(sd+"T12:00"))/864e5<=1;}catch(e){}
  if(c>0&&!novo&&!navigator.webdriver)sysPop("UMA MOEDA SÓ",(c===1?"Sua moeda virou":"Suas "+c+" moedas viraram")+" 🪙 "+c+" de Ouro","Agora o Baú e a Loja usam o mesmo saldo. Nada se perdeu.",null,"Entendi");}
function orUnmerge(){const x=orX();const m=x.mig;if(!m||m.off)return;const back=Math.min(orBal(),+m.c||0);prog.ouro=orBal()-back;m.off=todayKey();
  if(back){x.h.unshift({d:todayKey(),v:-back,w:"Ouro voltou a ser moedas"});x.h=x.h.slice(0,30);}save();try{render();}catch(e){}toast("Baú de volta às moedas. O Ouro ganho em tarefas continua.");}
// Baú de recompensas com Ouro (mesma lista, mesmos preços)
function orChest(){if(!orMerged())return;const r=rpgState();const k=$("coins"),cl=$("chestList");if(!k||!cl)return;const bal=orBal();
  k.textContent="🪙 "+bal+" de Ouro";const tip=k.closest("section")&&k.closest("section").querySelector("p.sm.muted");
  if(tip)tip.textContent="Seu Ouro também compra recompensas que você mesmo escolhe. Recompensa planejada não é culpa, é combustível.";
  const ci=$("chestC");if(ci){ci.placeholder="Ouro";ci.setAttribute("aria-label","Preço em Ouro");}
  cl.textContent="";r.rew.forEach((w,i)=>{const row=orEl("div","chest");row.append(orEl("span",null,w.t),orEl("b","mono",w.c+" 🪙"));
    const bt=orBtn(bal>=w.c?"go":"ghost","Resgatar",()=>{if(!orSpend("rew:"+todayKey()+":"+i,w.c,w.t)){toast("Faltam "+(w.c-orBal())+" de Ouro. Bora numa tarefa.");return;}
      try{render();}catch(e){}sysPop("RECOMPENSA","Aproveite: "+w.t,"Você ganhou isso. Curta sem culpa e volte com energia.");});
    const del=orBtn("link","✕",()=>{rpgState().rew.splice(i,1);save();try{render();}catch(e){}});del.setAttribute("aria-label","Remover recompensa");row.append(bt,del);cl.append(row);});}
// botão de volta em Mais > Ajustes (só para quem já migrou)
function orUndoUI(){const w=$("wipe");if(!w)return;let b=$("orUnmerge");const m=orX().mig;
  if(!m||m.off||!(+m.c>0)){if(b)b.hidden=true;return;}
  if(!b){const row=orEl("div","row");b=orBtn("link","Voltar o Baú para moedas",()=>{if(!b.dataset.arm){b.dataset.arm=1;b.textContent="Toque de novo: tira "+Math.min(orBal(),+m.c)+" de Ouro e volta as moedas";setTimeout(()=>{if(b.isConnected){delete b.dataset.arm;b.textContent="Voltar o Baú para moedas";}},5000);return;}orUnmerge();},"orUnmerge");row.append(b);(w.closest(".row")||w).after(row);}
  b.hidden=false;}
if(typeof renderRPG==="function"){const _rr=renderRPG;renderRPG=function(){_rr.apply(this,arguments);try{orChest();}catch(e){}};}
{const _r=render;render=function(){_r.apply(this,arguments);try{orUndoUI();}catch(e){}clearTimeout(orMerge._t);orMerge._t=setTimeout(()=>{try{orMerge();}catch(e){}},600);};}
setTimeout(()=>{try{orMerge();orChest();orUndoUI();}catch(e){}},50);
