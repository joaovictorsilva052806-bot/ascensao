// ---------- Aba Amigos: todo mundo joga junto (liga da semana, turma, novidades, parabéns e cutucar) ----------
// Cada um faz as suas tarefas; aqui todo mundo vê nível, classe, sequência e XP da semana dos amigos.
// Só usa o que já é público por opção (ranking 14+: apelido, XP da semana, nível, sequência, avatar). Até 13 anos: aba some.
// Canal novo: K|de|para|p (parabéns) ou c (cutucar)|data, no mesmo formulário. Só ADICIONA prog.turma = {snap,feed,sent,seen,view}.
function tmSt(){const t=prog.turma&&typeof prog.turma==="object"?prog.turma:(prog.turma={});t.snap=t.snap||{};t.feed=t.feed||[];t.sent=t.sent||{};t.seen=t.seen||{};t.view=t.view||"turma";return t;}
function tmEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
const tmN=v=>String(v||"").trim().toLowerCase();
function tmClsName(id){try{const all=(typeof CLS_REAL!=="undefined"?CLS_REAL:[]).concat(typeof CLS_FANT!=="undefined"?CLS_FANT:[]);const c=all.find(x=>x[0]===id);return c?c[1]:"";}catch(e){return "";}}
function tmCls(av){const o=typeof avParse==="function"?avParse(av):null;return o&&o.cls!=="x"?tmClsName(o.cls):"";}
function tmKid(){try{return ageNow()==="kid";}catch(e){return false;}}
function tmOn(){return !!(prog.rank&&prog.rank.on);}
// --- aba na barra de baixo ---
(function(){const bar=$("tabbar");if(!bar||bar.querySelector('[data-go="amigos"]'))return;const b=document.createElement("button");b.type="button";b.dataset.go="amigos";
  b.innerHTML='<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 13.8c3 .1 5.5 2 5.5 5"/></svg>Amigos';
  const mais=bar.querySelector('[data-go="mais"]');bar.insertBefore(b,mais||null);
  b.addEventListener("click",()=>{goTab("amigos");try{loadRank();}catch(e){}try{sqiLoad();}catch(e){}tmUI();});
  try{if(sessionStorage.getItem("asc-tab")==="amigos")setTimeout(()=>goTab("amigos"),0);}catch(e){}})();
// o 🏆 do topo e o atalho do guia agora levam para Amigos
document.addEventListener("click",e=>{const p=e.target.closest&&e.target.closest("#lgPill");if(!p)return;e.stopImmediatePropagation();goTab("amigos");tmUI();},true);
// --- painéis do ranking, esquadrão e amigos moram na aba nova ---
function tmPlace(){const wrap=document.querySelector(".wrap");if(!wrap)return;let p=$("tmPanel");
  if(!p){p=tmEl("section","panel tm");p.id="tmPanel";p.dataset.tab="amigos";const rp=$("rankPanel");(rp&&rp.parentNode===wrap)?wrap.insertBefore(p,rp):wrap.append(p);}
  let at=p;for(const id of ["frPanel","rankPanel","sqPanel"]){const x=$(id);if(!x)continue;x.dataset.tab="amigos";if(id!=="rankPanel")x.classList.toggle("tmoff",!tmOn());if(at.nextElementSibling!==x)at.after(x);at=x;}
  const b=document.querySelector('#tabbar [data-go="amigos"]');if(b)b.hidden=tmKid();if(tmKid()&&document.body.dataset.tab==="amigos")goTab("hoje");return p;}
// --- quem está na turma ---
function tmMe(){let sq=0;try{sq=streakDays()||0;}catch(e){}let av="";try{av=avCode();}catch(e){}return {n:rankName()||"Você",xp:weekXP(),lv:levelOf(totalXP()),seq:sq,av,me:true};}
function tmFriends(){try{return frSt().l.map(n=>frRow(n));}catch(e){return [];}}
function tmAll(){return (rankRows||[]).map(r=>{const p=(typeof sqPub!=="undefined"&&sqPub[tmN(r.n)])||{};return {n:r.n,xp:r.xp,lv:r.lv,seq:p.seq||0,av:p.av||""};});}
function tmBoard(view){const me=tmMe();const L=view==="geral"?tmAll().filter(r=>tmN(r.n)!==tmN(me.n)):tmFriends();
  return [me,...L].sort((a,b)=>(b.xp||0)-(a.xp||0)||(b.lv||0)-(a.lv||0));}
// --- novidades: compara com a última vez que viu cada amigo ---
function tmFeedAdd(k,n,t){const s=tmSt();const id=k+":"+tmN(n)+":"+todayKey();if(s.feed.some(f=>f.id===id))return;s.feed.unshift({id,k,n,t,d:todayKey()});s.feed=s.feed.slice(0,20);}
function tmDiff(){const s=tmSt();let ch=false;const MS=[3,7,14,30,60,100,365];
  for(const r of tmFriends()){if(r.lv==null)continue;const k=tmN(r.n);const o=s.snap[k];
    if(o){if(r.lv>o.lv){tmFeedAdd("lv",r.n,"⬆️ "+r.n+" subiu para o nível "+r.lv);ch=true;}
      const m=MS.filter(x=>r.seq>=x&&o.seq<x).pop();if(m){tmFeedAdd("seq",r.n,"🔥 "+r.n+" chegou a "+m+" dias seguidos");ch=true;}}
    if(!o||o.lv!==r.lv||o.seq!==r.seq){s.snap[k]={lv:r.lv,seq:r.seq};ch=true;}}
  if(ch)save();}
// --- parabéns e cutucar ---
const TM_K={p:["🎉","parabéns","te deu parabéns!"],c:["👉","cutucar","te cutucou: bora fazer 1 tarefa hoje?"]};
function tmSend(n,k){const me=rankName();if(!me||!n)return;const s=tmSt();const key=k+":"+tmN(n)+":"+todayKey();if(s.sent[key]){toast("Já mandou hoje. Amanhã tem mais.");return;}
  sqiPost(["K",me,n,k,sqiDk()]);s.sent[key]=1;for(const x in s.sent)if(!x.endsWith(todayKey()))delete s.sent[x];save();try{haptic([12,30,12]);}catch(e){}
  toast(k==="p"?"🎉 Parabéns enviado para "+n+".":"👉 Cutucada enviada. "+n+" vê no app dele.");tmUI();}
function tmInbox(){const me=rankName();if(!me||typeof sqInvRows==="undefined")return;const s=tmSt();let ch=false;
  const td=todayKey();if(!s.inN||s.inN.d!==td)s.inN={d:td,n:0};
  for(const r of sqInvRows){if(r.k!=="K"||tmN(r.b)!==tmN(me)||!r.a||!TM_K[r.s]||!sqiFresh(r.d))continue;if(!frHas(r.a)||s.inN.n>=5)continue;const key="k:"+tmN(r.a)+":"+r.s+":"+r.d;if(s.seen[key])continue;
    s.seen[key]=1;s.inN.n++;ch=true;const t=TM_K[r.s];tmFeedAdd("in"+r.s,r.a,t[0]+" "+r.a+" "+t[2]);toast(t[0]+" "+r.a+" "+t[2]);}
  if(ch){save();tmUI();}}
// --- contagem até a semana fechar (segunda 0h) ---
function tmLeft(){const d=new Date();const nx=new Date(d);nx.setHours(24,0,0,0);while(nx.getDay()!==1)nx.setDate(nx.getDate()+1);const h=Math.max(0,Math.round((nx-d)/36e5));
  return h>=24?Math.floor(h/24)+"d "+(h%24)+"h":h+"h";}
function tmAv(code,sz){try{return frAv(code,sz);}catch(e){return "";}}
// --- tela ---
function tmUI(){const p=tmPlace();if(!p)return;if(tmKid()||!cfg||cfg.blank){p.hidden=true;return;}p.hidden=false;
  if(p.contains(document.activeElement)&&document.activeElement.tagName==="INPUT")return;p.textContent="";const s=tmSt();
  let tier="";try{tier=lgName(lgSt().t);}catch(e){}
  const hd=tmEl("div","tmhd");hd.append(tmEl("h2",null,"👥 Turma"),tmEl("span","tmclock","⏳ fecha em "+tmLeft()));p.append(hd);
  if(!tmOn()){const c=tmEl("div","tmjoin");c.append(tmEl("b",null,"Entre na turma"),tmEl("p","sm muted","Cada um faz as suas tarefas. Aqui vocês veem o nível, a sequência e o XP uns dos outros, sobem de liga juntos e mandam parabéns. Só aparece o seu apelido."));
    const b=tmEl("button","go","Entrar no ranking");b.type="button";b.addEventListener("click",()=>{const j=$("rkJoin");if(j&&!j.hidden){j.click();setTimeout(tmUI,600);}else{const r=$("rankPanel");if(r)r.scrollIntoView({block:"start",behavior:"smooth"});}});c.append(b);p.append(c);return;}
  // liga + seletor
  const lg=tmEl("div","tmlg");lg.append(tmEl("b",null,tier||"Liga"),tmEl("span","sm muted","Os 3 primeiros da semana sobem. Ninguém cai."));p.append(lg);
  const fr=tmFriends();const seg=tmEl("div","tmseg");for(const [k,l] of [["turma","Meus amigos"+(fr.length?" ("+fr.length+")":"")],["geral","Todos"]]){const b=tmEl("button",s.view===k?"on":"",l);b.type="button";b.addEventListener("click",()=>{s.view=k;save();tmUI();});seg.append(b);}p.append(seg);
  const L=tmBoard(s.view);
  if(s.view==="turma"&&!fr.length){const e=tmEl("div","tmempty");e.append(tmEl("p",null,"Sua turma ainda está vazia. Chame alguém para jogar com você."));
    const b=tmEl("button","go","+ Adicionar amigo");b.type="button";b.addEventListener("click",()=>{try{frAdd=true;frUI();}catch(e){}const f=$("frPanel");if(f)f.scrollIntoView({block:"start",behavior:"smooth"});});e.append(b);p.append(e);}
  if(!rankRows){p.append(tmEl("div","sm muted","Carregando a turma…"));}
  const ol=tmEl("ol","tmlist");L.slice(0,30).forEach((r,i)=>{const li=tmEl("li",(r.me?"me ":"")+(i<3&&L.length>=2?"up":""));
    li.append(tmEl("span","tmpos",i<3?["🥇","🥈","🥉"][i]:String(i+1)));const av=tmEl("span","tmav");av.innerHTML=tmAv(r.av,44);li.append(av);
    const tx=tmEl("div","tmtx");const cls=tmCls(r.av);tx.append(tmEl("b",null,r.n+(r.me?" (você)":"")),tmEl("span","tmmeta",(r.lv?"Nv "+r.lv:"")+(cls?" · "+cls:"")+(r.seq?" · 🔥 "+r.seq:"")));li.append(tx);
    li.append(tmEl("span","tmxp",(r.xp||0)+" XP"));
    if(!r.me){const fz=fr.some(f=>tmN(f.n)===tmN(r.n));const act=tmEl("div","tmact");
      if(fz){for(const k of ["p","c"]){const t=TM_K[k];const done=s.sent[k+":"+tmN(r.n)+":"+todayKey()];const b=tmEl("button","tmbtn"+(done?" done":""),t[0]);b.type="button";b.title=(k==="p"?"Dar parabéns para ":"Cutucar ")+r.n;b.setAttribute("aria-label",b.title);b.addEventListener("click",ev=>{ev.stopPropagation();tmSend(r.n,k);});act.append(b);}
        li.classList.add("tap");li.addEventListener("click",()=>{try{frCompare(r.n);}catch(e){}});}
      else if(!frSt().pend[r.n]){const b=tmEl("button","tmbtn add","+");b.type="button";b.title="Pedir amizade para "+r.n;b.setAttribute("aria-label",b.title);b.addEventListener("click",ev=>{ev.stopPropagation();frRequest(r.n);tmUI();});act.append(b);}
      else act.append(tmEl("span","sm muted","pedido enviado"));
      li.append(act);}
    ol.append(li);if(i===2&&L.length>3)ol.append(tmEl("li","tmzone","▲ zona de subida"));});p.append(ol);
  if(fr.length)p.append(tmEl("div","sm muted tmhint","Toque num amigo para ver o card dele. 🎉 dá parabéns, 👉 cutuca (1 de cada por dia)."));
  // novidades
  const F=s.feed.slice(0,6);if(F.length){const fd=tmEl("div","tmfeed");fd.append(tmEl("h3",null,"Novidades da turma"));
    for(const f of F){const r=tmEl("div","tmfi");r.append(tmEl("span",null,f.t));
      if((f.k==="lv"||f.k==="seq")&&!s.sent["p:"+tmN(f.n)+":"+todayKey()]){const b=tmEl("button","tmbtn","🎉");b.type="button";b.setAttribute("aria-label","Dar parabéns para "+f.n);b.addEventListener("click",()=>tmSend(f.n,"p"));r.append(b);}
      fd.append(r);}p.append(fd);}}
{const _rr=renderRankUI;renderRankUI=function(){_rr();try{tmDiff();tmUI();}catch(e){}};}
{const _ck=sqiCheck;sqiCheck=function(){_ck.apply(this,arguments);try{tmInbox();}catch(e){}};}
{const _r=render;render=function(){_r.apply(this,arguments);try{tmPlace();}catch(e){}};}
setTimeout(()=>{try{tmUI();}catch(e){}},0);
