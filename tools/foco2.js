// ---------- Foco com mais utilidade: missão do Sistema, mais tempos, barra de progresso na sala, estacionamento de distrações,
// reflexão no fim do bloco e mapa de calor de 4 semanas ----------
// Grava só prog.fz = {min:{dia:minutos}, park:[{t,d}], ref:{dia:n}}. XP novo: "fr:<hora>" (+3, reflexão, até 4 por dia).
const FZ_REF=3,FZ_REFCAP=4,FZ_PARK=30;
function fzSt(){prog.fz=prog.fz||{};const s=prog.fz;s.min=s.min||{};s.park=s.park||[];s.ref=s.ref||{};return s;}
function fzEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
// minutos de foco por dia: o que o app registrou + blocos antigos (foco:<ts> com 15 XP = 25 min, 6 XP = 10 min)
function fzMinutes(k){const s=fzSt();if(s.min[k]!=null)return s.min[k];let m=0;for(const e of (prog.log[k]||[]))if(String(e.q).startsWith("foco:"))m+=(e.xp>=15?25:10);return m;}
// ---- 1) foco ligado à missão do Sistema + mais tempos ----
function fzTarget(){try{if(typeof smPick==="function"){const q=smPick();if(q)return q;}}catch(e){}
  const d=prog.log[todayKey()]||[];return todaysQuests().find(q=>q.main&&!d.some(e=>e.q===q.id))||null;}
function fzUI(){const p=$("focusPanel");if(!p)return;const on=!!(prog.focus&&prog.focus.end);let t=$("fzTop"),w=$("fzBox");
  // topo da aba: focar na missão (e, logo abaixo, foco em dupla); embaixo dos botões de começar: outros tempos
  if(!t){t=fzEl("div","fzbox fztop");t.id="fzTop";const h=p.querySelector(".qhead");if(h)h.after(t);else p.prepend(t);}
  if(!w){w=fzEl("div","fzbox");w.id="fzBox";const note=$("focusNote");p.insertBefore(w,note);}
  t.hidden=on;w.hidden=on;if(on)return;t.textContent="";w.textContent="";
  const q=fzTarget();{const sel=$("focusQuest");if(q&&sel&&!sel.value){try{fillFocusSelect();}catch(e){}if([...sel.options].some(o=>o.value===q.id))sel.value=q.id;}}
  if(q){const b=fzEl("button","go fzmis");b.type="button";b.append(fzEl("span","fzk","[ SISTEMA ] FOCAR NA MISSÃO"),fzEl("span","fzt",(typeof qtShort==="function"&&qtShort(q))||q.title));
    b.onclick=()=>{const sel=$("focusQuest");if(sel){fillFocusSelect();sel.value=q.id;}startFocus(25);};t.append(b);}
  const r=fzEl("div","fzdur");r.append(fzEl("span","sm muted","Outro tempo:"));
  for(const m of [15,50]){const b=fzEl("button","ghost",m+" min");b.type="button";b.onclick=()=>startFocus(m);r.append(b);}w.append(r);}
// ---- 2) sala de foco: barra de progresso e anotar distração sem sair ----
function fzRoom(){const fr=$("froom");if(!fr)return;let bar=$("fzBar");
  if(!bar){bar=fzEl("div","fzbar");bar.id="fzBar";bar.setAttribute("aria-hidden","true");bar.append(fzEl("i"));const t=$("froomT");t.after(bar);
    const pk=fzEl("button","ghost fzpk","💭 Anotar distração");pk.type="button";pk.id="fzPk";pk.onclick=()=>fzParkOpen(true);
    const row=fr.querySelector(".froom-row");if(row)row.after(pk);else fr.querySelector(".froom-in").append(pk);
    const f=fzEl("form","fzpf");f.id="fzPf";f.hidden=true;const i=fzEl("input");i.id="fzPi";i.maxLength=120;i.autocomplete="off";i.placeholder="Ex.: responder o Lucas, pesquisar tênis";i.setAttribute("aria-label","Distração para depois");
    const ok=fzEl("button","go","Guardar");ok.type="submit";f.append(i,ok);f.onsubmit=ev=>{ev.preventDefault();fzPark(i.value);i.value="";fzParkOpen(false);};pk.after(f);}
  const f=prog.focus;if(!(f&&f.end))return;const tot=(f.min||25)*60000,pc=Math.max(0,Math.min(100,100-(f.end-Date.now())/tot*100));bar.firstChild.style.width=pc+"%";}
function fzParkOpen(o){const f=$("fzPf");if(!f)return;f.hidden=!o;$("fzPk").hidden=o;if(o)setTimeout(()=>$("fzPi").focus(),30);}
// ---- 3) estacionamento de distrações ----
function fzPark(t){t=String(t||"").trim().slice(0,120);if(!t)return;const s=fzSt();s.park.unshift({t,d:todayKey()});s.park=s.park.slice(0,FZ_PARK);save();fzParkUI();toast("Guardado. Volte para a missão: depois você vê.");}
function fzParkUI(){const p=$("focusPanel");if(!p)return;let w=$("fzPark");
  if(!w){w=fzEl("section","panel fzpark");w.id="fzPark";w.dataset.tab="foco";w.dataset.sf="1";($("fzHeat")||p).after(w);
    const h=fzEl("div","qhead");h.append(fzEl("h2",null,"💭 Estacionamento"),fzEl("span","sm muted","pensou? anota e volta"));w.append(h);
    const f=fzEl("form","add");const i=fzEl("input");i.id="fzIn";i.maxLength=120;i.autocomplete="off";i.placeholder="Algo que apareceu na cabeça";i.setAttribute("aria-label","Anotar distração");
    const b=fzEl("button","go","Anotar");b.type="submit";f.append(i,b);f.onsubmit=ev=>{ev.preventDefault();fzPark(i.value);i.value="";};w.append(f);
    const ul=fzEl("ul","fzpl");ul.id="fzPl";w.append(ul);}
  const ul=$("fzPl");ul.textContent="";const s=fzSt();
  if(!s.park.length){ul.append(fzEl("li","sm muted","Vazio. Durante o foco, toque em 💭 na sala para guardar o que distrair."));return;}
  s.park.forEach((it,ix)=>{const li=fzEl("li");li.append(fzEl("span","fzpt",it.t));
    const tq=fzEl("button","ghost","+ Tarefa");tq.type="button";tq.title="Virar tarefa de hoje (10 XP)";tq.onclick=()=>{const tk=todayKey();prog.extra[tk]=(prog.extra[tk]||[]).concat([{id:"x"+Date.now(),title:it.t,xp:10,stat:"foco"}]);s.park.splice(ix,1);save();render();toast("Virou tarefa extra de hoje.");};
    const rm=fzEl("button","ghost","✓");rm.type="button";rm.setAttribute("aria-label","Resolvido: tirar da lista");rm.onclick=()=>{s.park.splice(ix,1);save();fzParkUI();};
    li.append(tq,rm);ul.append(li);});}
// ---- 4) reflexão no fim do bloco: 10 s, alimenta o atributo escolhido ----
// o relatório entra por último: espera a fila de avisos (atributo, tempo cumprido, marco) esvaziar e ficar 2 checagens seguidas sem nada na tela
function fzBusy(){return (typeof sysQ!=="undefined"&&sysQ.length)||[...document.querySelectorAll(".sysmodal:not([hidden]),.levelup:not([hidden]),#clsModal:not([hidden])")].some(e=>e.getClientRects().length);}
function fzAfter(fn,n,ok){n=n||0;ok=ok||0;if(fzBusy()){ok=0;}else ok++;if(ok>=2||n>=400){fn();return;}setTimeout(()=>fzAfter(fn,n+1,ok),300);}
function fzRefClose(){const m=$("fzRef");if(m&&!m.hidden){m.hidden=true;document.body.classList.remove("infz");}}
document.addEventListener("keydown",e=>{if(e.key==="Escape")fzRefClose();});
function fzReflect(f){const s=fzSt(),tk=todayKey();let m=$("fzRef");if(!m){m=fzEl("div","smsheet fzref");m.id="fzRef";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Como foi o foco");document.body.append(m);}
  m.textContent="";m.hidden=false;document.body.classList.add("infz");const c=fzEl("div","smcard");m.append(c);let rate="",stat=(f&&f.q&&(todaysQuests().find(x=>x.id===f.q)||{}).stat)||"mente";
  c.append(fzEl("div","smtag","[ SISTEMA ] RELATÓRIO DO BLOCO"),fzEl("h3","smh",(f.min||25)+" min de foco. Como foi?"));
  const rr=fzEl("div","fzrate");for(const [k,l] of [["1","😵 Disperso"],["2","🙂 Ok"],["3","🔥 Fluxo"]]){const b=fzEl("button","ghost",l);b.type="button";b.onclick=()=>{rate=k;for(const x of rr.children)x.classList.toggle("on",x===b);go.disabled=false;};rr.append(b);}c.append(rr);
  c.append(fzEl("div","sm muted","Qual atributo você treinou?"));const sr=fzEl("div","fzstat");
  for(const k of Object.keys(STATS)){const b=fzEl("button","ghost"+(k===stat?" on":""),STATS[k]);b.type="button";b.onclick=()=>{stat=k;for(const x of sr.children)x.classList.toggle("on",x===b);};sr.append(b);}c.append(sr);
  const can=(s.ref[tk]||0)<FZ_REFCAP;const go=fzEl("button","go smgo",can?"Registrar (+"+FZ_REF+" XP)":"Registrar");go.type="button";go.disabled=true;
  go.onclick=()=>{fzRefClose();s.ref[tk]=(s.ref[tk]||0)+1;(s.rates=s.rates||{})[tk]=((s.rates[tk]||"")+rate).slice(-12);
    if(can)addXP({q:"fr:"+Date.now(),kind:"full",xp:FZ_REF,stat},"Relatório registrado. +"+FZ_REF+" XP em "+STATS[stat]+".");else{save();render();}
    if(rate==="1")setTimeout(()=>toast("Dica: no próximo, anote as distrações no 💭 em vez de abrir o app."),2800);};
  const sk=fzEl("button","link","Pular");sk.type="button";sk.onclick=fzRefClose;c.append(go,sk);setTimeout(()=>{try{rr.firstChild.focus();}catch(e){}},60);}
// ---- 5) mapa de calor: 4 semanas, seg a dom ----
function fzHeat(){const p=$("focusPanel");if(!p)return;let w=$("fzHeat");
  if(!w){w=fzEl("section","panel fzheat");w.id="fzHeat";w.dataset.tab="foco";w.dataset.sf="1";p.after(w);}
  w.textContent="";const h=fzEl("div","qhead");h.append(fzEl("h2",null,"🔥 Mapa de foco"));w.append(h);
  const d=new Date();const dow=(d.getDay()+6)%7;d.setDate(d.getDate()-dow-21);let week=0,best=0,cur=0;const tk=todayKey();
  const g=fzEl("div","fzgrid");g.setAttribute("role","img");for(const l of ["S","T","Q","Q","S","S","D"])g.append(fzEl("span","fzdl",l));
  const ws=new Date();ws.setDate(ws.getDate()-dow);const wsk=dkey(ws);let lab=[];
  for(let i=0;i<28;i++){const k=dkey(d),m=fzMinutes(k),fut=k>tk;const c=fzEl("i","fzc l"+(fut?"x":m>=75?4:m>=50?3:m>=25?2:m>0?1:0));c.title=k+": "+m+" min";if(k===tk)c.classList.add("tdy");g.append(c);
    if(!fut){if(k>=wsk)week+=m;if(m>0){cur++;best=Math.max(best,cur);}else if(k!==tk)cur=0;}d.setDate(d.getDate()+1);}
  g.setAttribute("aria-label","Minutos de foco nas últimas 4 semanas. Esta semana: "+week+" min.");w.append(g);
  const lg=fzEl("div","fzleg sm muted");lg.append(document.createTextNode("menos "));for(let i=0;i<5;i++)lg.append(fzEl("i","fzc l"+i));lg.append(document.createTextNode(" mais"));w.append(lg);
  const h2=Math.floor(week/60),mm=week%60;w.append(fzEl("div","sm","Esta semana: "+(h2?h2+" h ":"")+mm+" min · melhor sequência de dias com foco: "+best));}
// ---- ligações ----
{const _ff=finishFocus;finishFocus=function(){const f=prog.focus?Object.assign({},prog.focus):null;const tk0=todayKey(),m0=fzMinutes(tk0);const r=_ff.apply(this,arguments);
  try{if(f){const s=fzSt(),tk=todayKey();s.min[tk]=(tk===tk0?m0:fzMinutes(tk))+(f.min||25);save();fzAll();setTimeout(()=>fzAfter(()=>fzReflect(f)),900);}}catch(e){}return r;};}
{const _fu=focusUI;focusUI=function(){const r=_fu.apply(this,arguments);try{fzUI();fzRoom();}catch(e){}return r;};}
function fzAll(){try{fzUI();fzRoom();fzHeat();fzParkUI();}catch(e){}}
{const _r=render;render=function(){_r.apply(this,arguments);if(!(prog.focus&&prog.focus.end))fzAll();};}
setTimeout(fzAll,0);
