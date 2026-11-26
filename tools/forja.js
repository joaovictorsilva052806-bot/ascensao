// ---------- Forja: treino em casa, sem equipamento, que evolui sozinho (tools/forja.*) ----------
// Escada de 5 níveis por movimento + dupla progressão (8 a 12 repetições; core 20 a 45 s), mínimo viável de 10 min
// e quests opcionais dos 4 pilares (Alimentação, Rotina, Exercício, Sono). Nada sai do aparelho.
// Só ADICIONA dados: prog.forja = {lv, last, ses, ok, dias, pil, pt, cur}. Nenhum campo antigo muda.
// XP: "forja:<AAAA-MM-DD>" (1 treino com XP por dia), "forja:lv:<mov>:<n>" (subida, uma vez por nível),
// "forja:sem:<segunda>" (3 treinos na semana). Base: Schoenfeld 2017, Kikuchi & Nakazato 2017, Refalo 2023, OMS 2020.
const FJ_MOV={
  push:{n:"Empurrar",m:"peito",L:["Flexão na parede","Flexão na mesa/bancada","Flexão de joelhos","Flexão completa","Flexão com pés elevados"],t:"Consegue 8 flexões de joelho?"},
  pull:{n:"Puxar",m:"costas",L:["Remada com toalha na porta, corpo quase em pé","Remada com toalha, corpo mais inclinado","Remada embaixo de mesa firme, joelhos dobrados","Remada embaixo da mesa, pernas esticadas","Remada embaixo da mesa, descida em 3 s"],t:"Consegue 8 remadas embaixo de uma mesa firme, joelhos dobrados?"},
  omb:{n:"Ombro",m:"ombro",L:["Elevação dos braços em Y, deitado de bruços","Flexão pike com as mãos numa cadeira","Flexão pike no chão","Flexão pike com os pés numa cadeira","Pike com pés elevados, descida em 3 s"],t:"Consegue 8 flexões pike no chão?"},
  perna:{n:"Perna",m:"perna",L:["Agachamento até a cadeira","Agachamento livre","Agachamento com descida em 3 s","Afundo alternado","Agachamento búlgaro (pé de trás na cadeira)"],t:"Consegue 8 agachamentos descendo em 3 s?"},
  ponte:{n:"Perna (ponte)",m:"glúteo e posterior",L:["Ponte de glúteo com os dois pés","Ponte com pausa de 2 s no alto","Ponte com um pé","Ponte com um pé e pausa de 2 s","Stiff unilateral sem peso"],t:"Consegue 8 pontes com um pé só?"},
  core:{n:"Core",m:"abdômen",L:["Prancha de joelhos","Prancha","Prancha com toque no ombro","Prancha lateral","Hollow (canoa)"],t:"Aguenta 20 s de prancha com toque no ombro?",s:1}};
const FJ_TR={A:["push","pull","omb","perna","core"],B:["pull","push","omb","ponte","core"]};
const FJ_SETS=3,FJ_LO=8,FJ_HI=12,FJ_SLO=20,FJ_SHI=45,FJ_SSTEP=5,FJ_REST=90,FJ_REST_CORE=60;
const FJ_XP={full:40,ruim:20,lv:30,sem:25};
const FJ_DN=["seg","ter","qua","qui","sex","sáb","dom"];
const FJ_SAFE="Pare na hora se sentir dor ou aperto no peito, coração disparado ou batendo irregular, tontura, falta de ar fora do normal ou visão turva. Sente, beba água e procure atendimento se não passar. Tem algum problema de saúde ou usa remédio contínuo? Converse com um profissional de saúde antes de começar. Este app não substitui orientação médica.";
const FJ_RIR="Pare quando ainda daria para fazer mais 2 ou 3. Nada de série até a falha.";
let fjPrev=null,fjView=null,fjTick=null,fjOffers=[],fjRes=null,fjSetup={},fjWant=false,fjUp="";
function fjEl(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function fjBtn(cls,txt,fn,id){const b=fjEl("button",cls,txt);b.type="button";if(id)b.id=id;b.addEventListener("click",fn);return b;}
// Lê prog.forja com valores padrão sem estragar dado antigo (perfil sem prog.forja continua valendo).
function fjS(){let f=prog.forja;if(!f||typeof f!=="object"||Array.isArray(f))f=prog.forja={};
  if(!f.lv||typeof f.lv!=="object")f.lv={};for(const k in FJ_MOV){const v=Math.floor(+f.lv[k]);f.lv[k]=v>=1&&v<=5?v:1;}
  if(!f.last||typeof f.last!=="object")f.last={};if(!Array.isArray(f.ses))f.ses=[];
  if(!Array.isArray(f.dias)||!f.dias.length)f.dias=[0,2,4];
  if(f.cur&&(typeof f.cur!=="object"||f.cur.d!==todayKey()||!FJ_TR[f.cur.tipo]))f.cur=null; // treino de outro dia não volta
  return f;}
const fjDow=()=>(new Date().getDay()+6)%7;
const fjSec=m=>!!FJ_MOV[m].s;
function fjNext(f){const l=f.ses[f.ses.length-1];return l&&l.tipo==="A"?"B":"A";}
function fjTodayE(){return (prog.log[todayKey()]||[]).find(e=>e.q==="forja:"+todayKey());}
function fjNextDay(f){for(let i=1;i<=7;i++){const d=(fjDow()+i)%7;if(f.dias.includes(d))return FJ_DN[d];}return "";}
// alvo da série j: última vez +1 repetição (core +5 s), até o topo da faixa
function fjTarget(f,m,j){const L=f.last[m];const p=Array.isArray(L)?+L[j]||+L[L.length-1]||0:0;
  if(fjSec(m))return p?Math.min(FJ_SHI,Math.max(FJ_SLO,p+FJ_SSTEP)):FJ_SLO;return p?Math.min(FJ_HI,Math.max(FJ_LO,p+1)):FJ_LO;}
const fjTop=m=>fjSec(m)?FJ_SHI:FJ_HI;
const fjUnit=m=>fjSec(m)?"s":"reps";
function fjNSets(c){return c.ruim?1:FJ_SETS;}
function fjMotion(){return !matchMedia("(prefers-reduced-motion: reduce)").matches;}
// ---------- folha do treino ----------
function fjOpen(ruim){const f=fjS();let m=$("fjSheet");
  if(!m){m=fjEl("div","fjsheet");m.id="fjSheet";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Treino do Forja");document.body.append(m);}
  fjPrev=document.activeElement;m.hidden=false;document.body.classList.add("inforja","inmission");
  if(f.cur)fjView="run";
  else if(!f.ok){fjView="safe";fjWant=!!ruim;}
  else if(!f.pt&&!f.ses.length){fjView="setup";fjWant=!!ruim;}
  else{fjStart(!!ruim);return;}
  fjRender();}
function fjClose(){const m=$("fjSheet");const was=m&&!m.hidden;if(m)m.hidden=true;document.body.classList.remove("inforja","inmission");if(was&&fjPrev&&fjPrev.isConnected)try{fjPrev.focus();}catch(e){}clearInterval(fjTick);fjTick=null;fjView=null;fjUI();}
function fjStart(ruim){const f=fjS();fjWant=false;
  f.cur={d:todayKey(),tipo:fjNext(f),ruim:ruim?1:0,i:0,sets:{},t0:Date.now(),rest:0,v:null};save();fjView="run";fjRender();fjUI();}
function fjRender(){const m=$("fjSheet");if(!m||m.hidden)return;m.textContent="";const f=fjS();
  const c=fjEl("div","fjcard");const top=fjEl("div","fjtop");
  top.append(fjEl("span","fjtag","[ SISTEMA ] FORJA"+(f.cur?" · TREINO "+f.cur.tipo+(f.cur.ruim?" · DIA RUIM":""):"")),fjBtn("link","Minimizar ⌄",fjClose,"fjMin"));c.append(top);
  if(fjView==="safe")fjSafeV(c,f);else if(fjView==="setup")fjSetupV(c,f);else if(fjView==="done")fjDoneV(c,f);else if(f.cur)fjRunV(c,f);else{fjClose();return;}
  const ft=fjEl("details","fjstop");ft.append(fjEl("summary",null,"⚠ Quando parar"),fjEl("p","sm",FJ_SAFE));if(fjView!=="safe")c.append(ft);
  m.append(c);if(fjView==="run")fjRestUI();
  // foco no botão principal (leitor de tela e teclado), sem roubar o foco de quem está no − / +
  const ae=document.activeElement;if(!ae||!m.contains(ae)||!ae.isConnected){const g=m.querySelector(".fjbig")||m.querySelector("button");if(g)try{g.focus({preventScroll:true});}catch(e){}}}
function fjSafeV(c,f){c.append(fjEl("h3",null,"Antes do 1º treino"));
  const q=fjEl("blockquote","fjsafe");const b=fjEl("b",null,"Pare na hora");q.append(b,document.createTextNode(FJ_SAFE.replace(/^Pare na hora/,"")));c.append(q);
  c.append(fjEl("div","sm muted","Este aviso fica sempre no rodapé do treino, em \"Quando parar\"."));
  c.append(fjBtn("go fjbig","Li e entendi",()=>{f.ok=true;save();if(!f.pt&&!f.ses.length){fjView="setup";fjRender();}else fjStart(fjWant);},"fjOk"));}
// 1ª abertura: teste de nível de 1 toque por movimento (opcional) + quests dos 4 pilares (opcional)
function fjSetupV(c,f){c.append(fjEl("h3",null,"Ajuste rápido (opcional)"));
  c.append(fjEl("div","sm muted","Todo mundo começa no nível 1. Se já treina, toque em Sim e o app pula para o nível 3 daquele movimento."));
  const box=fjEl("div","fjpt");
  for(const k of ["push","pull","omb","perna","ponte","core"]){const r=fjEl("div","fjptr");r.append(fjEl("span","sm",FJ_MOV[k].t));
    const y=fjBtn(fjSetup[k]?"go":"ghost",fjSetup[k]?"Sim ✓":"Sim",()=>{fjSetup[k]=!fjSetup[k];fjRender();});y.dataset.pt=k;y.setAttribute("aria-pressed",fjSetup[k]?"true":"false");r.append(y);box.append(r);}
  c.append(box);
  const pq=fjEl("div","fjpil");pq.append(fjEl("div","sm","Quer as quests dos 4 pilares em Hoje? Proteína nas refeições, treino no horário e tela fora antes de dormir. Dá para tirar depois em Mais."));
  const row=fjEl("div","row");
  row.append(fjBtn(fjSetup._pil===true?"go":"ghost",fjSetup._pil===true?"Quero ✓":"Quero",()=>{fjSetup._pil=true;fjRender();},"fjPilYes"),
    fjBtn(fjSetup._pil===false?"go":"ghost",fjSetup._pil===false?"Agora não ✓":"Agora não",()=>{fjSetup._pil=false;fjRender();},"fjPilNo"));
  pq.append(row);c.append(pq);
  c.append(fjBtn("go fjbig","Começar treino",()=>{for(const k in FJ_MOV)if(fjSetup[k]&&f.lv[k]<3)f.lv[k]=3;f.pt=1;
    if(fjSetup._pil===true)fjPil(true,1);else f.pil=false;fjSetup={};fjStart(fjWant);},"fjGo"));}
function fjRunV(c,f){const cu=f.cur,ex=FJ_TR[cu.tipo],m=ex[cu.i],M=FJ_MOV[m],lv=f.lv[m],n=fjNSets(cu),done=cu.sets[m]||[];
  c.append(fjEl("div","fjstep","Exercício "+(cu.i+1)+" de "+ex.length+" · "+M.n+" ("+M.m+")"));
  const h=fjEl("h3",null,M.L[lv-1]);h.id="fjEx";c.append(h);
  c.append(fjEl("div","sm muted","Nível "+lv+" de 5 · "+n+(n>1?" séries":" série")+" · faixa "+(fjSec(m)?FJ_SLO+" a "+FJ_SHI+" s":FJ_LO+" a "+FJ_HI+" repetições")));
  c.append(fjEl("div","sm fjrir",FJ_RIR));
  const sl=fjEl("div","fjsets");for(let j=0;j<n;j++){const d=done[j];sl.append(fjEl("span","fjset"+(d!=null?" ok":j===done.length?" cur":""),"S"+(j+1)+": "+(d!=null?d+(fjSec(m)?" s":"")+" ✓":"alvo "+fjTarget(f,m,j)+(fjSec(m)?" s":""))));}c.append(sl);
  if(cu.v==null)cu.v=fjTarget(f,m,done.length);
  const ctr=fjEl("div","fjctr");const step=fjSec(m)?FJ_SSTEP:1;
  const mi=fjBtn("ghost fjpm","−",()=>{cu.v=Math.max(0,cu.v-step);fjRender();},"fjMinus");mi.setAttribute("aria-label","Menos");
  const val=fjEl("div","fjval");val.id="fjVal";val.textContent=cu.v;val.setAttribute("aria-live","polite");
  const pl=fjBtn("ghost fjpm","+",()=>{cu.v=Math.min(fjSec(m)?120:50,cu.v+step);fjRender();},"fjPlus");pl.setAttribute("aria-label","Mais");
  ctr.append(mi,val,fjEl("span","sm muted",fjUnit(m)),pl);c.append(ctr);
  c.append(fjBtn("go fjbig","✓ Série "+(done.length+1)+": "+cu.v+" "+fjUnit(m),()=>fjLog(),"fjSet"));
  const rs=fjEl("div","fjrest");rs.id="fjRest";c.append(rs);
  const nav=fjEl("div","row fjnav");
  if(cu.i<ex.length-1)nav.append(fjBtn("link","Pular exercício",()=>{cu.i++;cu.v=null;save();fjRender();},"fjSkip"));
  if(Object.values(cu.sets).some(a=>a&&a.length))nav.append(fjBtn("link","Terminar agora",()=>fjFinish(),"fjEnd"));
  c.append(nav);}
function fjLog(){const f=fjS(),cu=f.cur;if(!cu)return;const ex=FJ_TR[cu.tipo],m=ex[cu.i],n=fjNSets(cu);
  const a=cu.sets[m]=(cu.sets[m]||[]);a.push(Math.max(0,Math.round(+cu.v||0)));cu.v=null;try{haptic(12);}catch(e){}
  if(a.length>=n){if(cu.i>=ex.length-1){save();fjFinish();return;}cu.i++;}
  cu.rest=Date.now()+(fjSec(m)?FJ_REST_CORE:FJ_REST)*1000;save();fjRender();}
// descanso automático: conta sozinho; dá para registrar a próxima série a qualquer hora
function fjRestUI(){const el=$("fjRest");const cu=prog.forja&&prog.forja.cur;if(!el||!cu)return;const left=(cu.rest||0)-Date.now();
  if(left>0){el.textContent="Descanso "+fmt(left)+" · respira e bebe água";el.className="fjrest on";if(!fjTick)fjTick=setInterval(fjRestUI,1000);}
  else{if(cu.rest){cu.rest=0;try{haptic([20,60,20]);}catch(e){}}el.textContent="";el.className="fjrest";clearInterval(fjTick);fjTick=null;}}
function fjFinish(){const f=fjS(),cu=f.cur;if(!cu)return;const tk=todayKey();const ex=FJ_TR[cu.tipo];
  const any=ex.some(m=>(cu.sets[m]||[]).length);if(!any){f.cur=null;save();fjClose();return;}
  const full=!cu.ruim&&ex.every(m=>(cu.sets[m]||[]).length>=FJ_SETS);
  fjOffers=[];
  for(const m of ex){const a=cu.sets[m]||[];if(!a.length)continue;f.last[m]=a.slice(0,FJ_SETS);
    if(!cu.ruim&&a.length>=FJ_SETS&&a.every(v=>v>=fjTop(m))&&f.lv[m]<5)fjOffers.push(m);}
  f.ses.push({d:tk,tipo:cu.tipo,min:Math.max(1,Math.round((Date.now()-cu.t0)/60000)),r:full?0:1});if(f.ses.length>400)f.ses=f.ses.slice(-400);
  f.cur=null;clearInterval(fjTick);fjTick=null;
  // a quest de treino do perfil fica marcada (sem XP dobrado: o XP do treino vem do Forja)
  const L=prog.log[tk]=prog.log[tk]||[];const iso=new Date().toISOString();
  if(todaysQuests().some(q=>q.id==="s_treino")&&!L.some(e=>e.q==="s_treino"))L.push({q:"s_treino",kind:full?"full":"min",xp:0,stat:"corpo",bonus:0,t:iso});
  const key="forja:"+tk,xp=full?FJ_XP.full:FJ_XP.ruim,had=L.find(e=>e.q===key);
  fjRes={tipo:cu.tipo,full,xp:0,sets:ex.map(m=>[m,cu.sets[m]||[]])};
  if(!had){fjRes.xp=xp;addXP({q:key,kind:full?"full":"min",xp,stat:"corpo",bonus:0,t:iso},"");}
  else if((had.xp||0)<xp){fjRes.xp=xp-(had.xp||0);had.xp=xp;had.kind="full";save();render();}
  else{save();render();}
  // semana forjada: 3 dias de treino na mesma semana
  const ws=weekStart(tk),wk=fjWeekDays(f,ws);
  if(wk>=3&&!entries().some(e=>e.q==="forja:sem:"+ws)){fjRes.sem=1;addXP({q:"forja:sem:"+ws,kind:"full",xp:FJ_XP.sem,stat:"corpo",bonus:0,t:iso},"");}
  if(fjAco(f)&&typeof unlockSec==="function")setTimeout(()=>{try{unlockSec("s_aco");}catch(e){}},400);
  fjView="done";const m=$("fjSheet");if(!m||m.hidden)fjOpenDone();else fjRender();fjUI();}
function fjOpenDone(){const m=$("fjSheet");if(m){m.hidden=false;document.body.classList.add("inforja","inmission");fjRender();}}
function fjWeekDays(f,ws){return new Set(f.ses.filter(s=>s&&s.d&&weekStart(s.d)===ws).map(s=>s.d)).size;}
function fjAco(f){const d=new Date();for(let w=0;w<4;w++){const x=new Date(d);x.setDate(x.getDate()-7*w);if(fjWeekDays(f,weekStart(dkey(x)))<3)return false;}return true;}
function fjDoneV(c,f){const r=fjRes||{};
  c.append(fjEl("h3",null,r.full?"Treino "+r.tipo+" forjado 🔥":"Mínimo feito. Sequência protegida 🛡️"));
  c.append(fjEl("div","fjxp",r.xp?"+"+r.xp+" XP"+(r.sem?" · +"+FJ_XP.sem+" Semana forjada":""):"Treino registrado. O XP do Forja de hoje já tinha entrado."));
  const ul=fjEl("ul","sm fjsum");for(const [m,a] of r.sets||[])if(a.length)ul.append(fjEl("li",null,FJ_MOV[m].n+": "+a.join(" / ")+" "+fjUnit(m)));c.append(ul);
  for(const m of fjOffers){const lv=f.lv[m];const o=fjEl("div","fjoffer");o.dataset.mov=m;
    o.append(fjEl("div","sm","Você bateu o topo em todas as séries de "+FJ_MOV[m].n+". Subir para o nível "+(lv+1)+" ("+FJ_MOV[m].L[lv]+") no próximo treino?"));
    const row=fjEl("div","row");row.append(fjBtn("go","Subir de nível",()=>fjLevel(m)),fjBtn("ghost","Agora não",()=>{fjOffers=fjOffers.filter(x=>x!==m);fjRender();}));o.append(row);c.append(o);}
  if(fjUp){c.append(fjEl("div","fjup",fjUp));fjUp="";}
  c.append(fjEl("div","sm muted","Próximo: Treino "+fjNext(f)+(fjNextDay(f)?" ("+fjNextDay(f)+")":"")+". Descanso também faz o músculo crescer."));
  c.append(fjBtn("go fjbig","Fechar",fjClose,"fjClose"));}
function fjLevel(m){const f=fjS();if(f.lv[m]>=5)return;f.lv[m]++;const n=f.lv[m];delete f.last[m];fjOffers=fjOffers.filter(x=>x!==m);
  fjUp="⬆ "+FJ_MOV[m].n+" · nível "+n+": "+FJ_MOV[m].L[n-1];
  const key="forja:lv:"+m+":"+n;
  if(!entries().some(e=>e.q===key))addXP({q:key,kind:"full",xp:FJ_XP.lv,stat:"corpo",bonus:0,t:new Date().toISOString()},"Subiu de nível no Forja. +"+FJ_XP.lv+" XP");else{save();toast("Nível novo gravado.");}
  try{haptic([15,40,15]);}catch(e){}fjRender();fjUI();}
// ---------- quests dos 4 pilares (leves, opcionais, nunca principais: não geram dívida) ----------
function fjPilQ(f){return [
  {id:"fj_prot",title:"Proteína em cada refeição (ovo, frango, feijão, leite, sardinha)",xp:15,stat:"corpo",minTitle:"2 refeições",ifThen:"Quando montar o prato, a proteína vai primeiro.",fj:1},
  {id:"fj_hora",title:"Treino do Forja no horário marcado",xp:10,stat:"foco",days:f.dias.slice(),ifThen:"Quando der o horário, troco de roupa antes de pensar.",fj:1},
  {id:"fj_tela",title:"Tela fora 30 min antes de deitar",xp:15,stat:"corpo",minTitle:"10 min",ifThen:"Quando der o horário, celular no carregador longe da cama.",fj:1}];}
function fjCfgSave(){try{localStorage.setItem(CFG_KEY,JSON.stringify(cfg));}catch(e){}}
function fjEnsure(){const f=prog.forja;if(!f||f.pil!==true||!cfg||cfg.blank||!Array.isArray(cfg.quests)||!cfg.quests.length)return false;let ch=false;
  for(const q of fjPilQ(fjS())){const i=cfg.quests.findIndex(x=>x.id===q.id);
    if(i<0){cfg.quests.push(q);ch=true;}else if(q.days&&String(cfg.quests[i].days)!==String(q.days)){cfg.quests[i].days=q.days;ch=true;}}
  if(ch)fjCfgSave();return ch;}
function fjPil(on,quiet){const f=fjS();f.pil=!!on;
  if(on)fjEnsure();else if(cfg&&Array.isArray(cfg.quests)){cfg.quests=cfg.quests.filter(q=>!/^fj_/.test(q.id));fjCfgSave();}
  save();if(!quiet){render();toast(on?"Quests dos 4 pilares em Hoje.":"Quests dos 4 pilares removidas. Seu XP continua.");}}
function fjSetDay(d){const f=fjS();const has=f.dias.includes(d);if(has&&f.dias.length<=1){toast("Deixe pelo menos 1 dia de treino.");return;}
  f.dias=has?f.dias.filter(x=>x!==d):f.dias.concat([d]).sort((a,b)=>a-b);save();if(f.pil===true)fjEnsure();render();}
function fjDays(box){const r=fjEl("div","fjdays");for(let d=0;d<7;d++){const on=fjS().dias.includes(d);const b=fjBtn("fjday"+(on?" on":""),FJ_DN[d],()=>fjSetDay(d));b.setAttribute("aria-pressed",on?"true":"false");b.dataset.d=d;r.append(b);}box.append(r);}
// ---------- card em Hoje ----------
let fjEdit=false;
function fjReady(){const hid=id=>{const e=$(id);return !e||e.hidden;};return !!(cfg&&!cfg.blank&&cfg.quests&&cfg.quests.length)&&hid("quick")&&hid("onb")&&!document.body.classList.contains("onboarding");}
function fjCard(){let p=$("fjCard");const q=$("quests");const anchor=q&&q.closest(".wrap>section");if(!anchor)return;
  if(!p){p=fjEl("section","panel fjhome");p.id="fjCard";p.dataset.tab="hoje";p.dataset.sf="1";}
  // no começo (body[data-hrstart], guia "Comece por aqui" visto nesta abertura) quem posiciona a Forja é o hrOrder (tools/heroi.js), abaixo das tarefas
  if(!p.parentNode||(!document.body.dataset.hrstart&&p.nextElementSibling!==anchor))anchor.before(p);
  if(!fjReady()){p.hidden=true;return;}p.hidden=false;p.textContent="";
  const f=fjS(),cu=f.cur,dia=f.dias.includes(fjDow()),feito=fjTodayE(),t=fjNext(f);
  const hd=fjEl("div","qhead");hd.append(fjEl("h2",null,"🔥 Forja"));
  const ed=fjBtn("link fjdl",f.dias.map(d=>FJ_DN[d]).join(" · ")+" ✎",()=>{fjEdit=!fjEdit;fjCard();},"fjDaysBtn");ed.setAttribute("aria-label","Dias de treino: "+f.dias.map(d=>FJ_DN[d]).join(", ")+". Toque para mudar");ed.setAttribute("aria-expanded",fjEdit?"true":"false");hd.append(ed);p.append(hd);
  if(fjEdit)fjDays(p);
  if(cu){p.append(fjEl("div","sm","Treino "+cu.tipo+" em andamento · exercício "+(cu.i+1)+" de "+FJ_TR[cu.tipo].length));p.append(fjBtn("go fjbig","Continuar treino",()=>fjOpen(),"fjResume"));return;}
  if(feito){p.append(fjEl("div","sm fjok","Treino de hoje feito ✓ · próximo: Treino "+t+(fjNextDay(f)?" ("+fjNextDay(f)+")":"")));return;}
  if(dia){p.append(fjEl("div","sm fjline","Treino "+t+" · 5 exercícios · ~30 min"));
    const row=fjEl("div","row fjrow");row.append(fjBtn("go","Começar",()=>fjOpen(false),"fjStart"),fjBtn("ghost","Dia ruim (10 min)",()=>fjOpen(true),"fjRuim"));p.append(row);}
  else{p.append(fjEl("div","sm muted","Hoje é descanso. Próximo: Treino "+t+(fjNextDay(f)?" ("+fjNextDay(f)+")":"")+"."));
    const row=fjEl("div","row fjrow");row.append(fjBtn("ghost","Treinar mesmo assim",()=>fjOpen(false),"fjStart"),fjBtn("link","Dia ruim (10 min)",()=>fjOpen(true),"fjRuim"));p.append(row);}}
// ---------- Mais: Forja, meus níveis ----------
function fjPanel(){let p=$("fjPanel");const first=document.querySelector('.wrap>section[data-tab="mais"]');if(!first)return;
  if(!p){p=fjEl("section","panel fjlv");p.id="fjPanel";p.dataset.tab="mais";p.append(fjEl("h2",null,"🔥 Forja: meus níveis"));const b=fjEl("div","fjbody");b.id="fjBody";p.append(b);first.before(p);}
  const b=$("fjBody");if(!b)return;b.textContent="";const f=fjS();
  b.append(fjEl("div","sm muted","Treino em casa, sem equipamento. Bateu "+FJ_HI+" repetições (core: "+FJ_SHI+" s) em todas as "+FJ_SETS+" séries = o app sugere o próximo nível."));
  for(const k in FJ_MOV){const M=FJ_MOV[k],lv=f.lv[k];const d=fjEl("details","fjmov");d.dataset.mov=k;
    const s=fjEl("summary",null,M.n+" · nível "+lv+"/5 · "+M.L[lv-1]);d.append(s);
    const ol=fjEl("ol","sm fjlad");M.L.forEach((x,i)=>ol.append(fjEl("li",i+1<lv?"ok":i+1===lv?"cur":"",x+(i+1<lv?" ✓":i+1===lv?" ← você":""))));d.append(ol);
    const L=f.last[k];d.append(fjEl("div","sm muted",lv>=5?"Nível máximo. Para evoluir: descida em 3 s e pausa de 1 s embaixo.":"Para subir: "+fjTop(k)+" "+fjUnit(k)+" em todas as "+FJ_SETS+" séries"+(Array.isArray(L)&&L.length?" (última vez: "+L.join(" / ")+")":"")+"."));
    b.append(d);}
  const dw=fjEl("div","fjsub");dw.append(fjEl("div","sm","Dias de treino"));fjDays(dw);b.append(dw);
  const pl=fjEl("div","row");pl.append(fjBtn("ghost",f.pil===true?"Tirar as quests dos 4 pilares":"Colocar as quests dos 4 pilares em Hoje",()=>fjPil(f.pil!==true),"fjPilT"));b.append(pl);
  const ws=weekStart(todayKey());b.append(fjEl("div","sm muted","Esta semana: "+fjWeekDays(f,ws)+" de 3 treinos · total: "+f.ses.length+" treinos"));
  const st=fjEl("details","fjstop");st.append(fjEl("summary",null,"⚠ Quando parar"),fjEl("p","sm",FJ_SAFE));b.append(st);}
function fjUI(){try{fjCard();fjPanel();}catch(e){}}
// conquista oculta "Aço" (tools/secret.js): 4 semanas seguidas com 3 treinos
if(typeof SEC!=="undefined"&&Array.isArray(SEC)&&!SEC.some(s=>s[0]==="s_aco"))SEC.push(["s_aco","⚙️","Aço","Forjado no Aço","Quatro semanas sem deixar a forja apagar.","4 semanas seguidas com 3 treinos. Isso já não é fase, é hábito: o ciclo de parar foi quebrado.",40]);
// ▶ na quest de treino do perfil abre o Forja no lugar do timer genérico
if(typeof msOpen==="function"){const _mo=msOpen;msOpen=function(q){if(q&&q.id==="s_treino"){fjOpen(false);return;}return _mo.apply(this,arguments);};}
{const _r=render;render=function(){try{fjEnsure();}catch(e){}_r.apply(this,arguments);fjUI();};}
document.addEventListener("keydown",e=>{const m=$("fjSheet");if(!m||m.hidden)return;if(e.key==="Escape"){fjClose();return;}
  if(e.key==="Tab"){const f=[...m.querySelectorAll("button,summary,[tabindex]")].filter(x=>!x.disabled&&x.getClientRects().length);if(!f.length)return;
    const i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus();}else if(!e.shiftKey&&(i<0||i===f.length-1)){e.preventDefault();f[0].focus();}}});
setTimeout(fjUI,0);
