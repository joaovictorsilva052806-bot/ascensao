// ---------- Estudo (aba Foco): Hoje com 3 tarefas, prazos com alerta, flashcards com revisão espaçada e horas complementares ----------
// Feito para quem tem TDAH: uma tarefa em destaque, blocos de 25 min no timer que já existe, pausa de 5 (15 a cada 4 blocos).
// Grava só prog.st = {tasks:[], cards:[], hc:{goal,items:[]}, cfg:{blocks,train,sleep}, blk:{dia:n}, cur, pause}. Nada sai do aparelho.
// XP novo: "st:t:<id>" (+10, tarefa entregue no prazo) e "st:c:<dia>" (+1 por card revisado, até 10 por dia).
const ST_INT=[1,3,7,14,30],ST_SESS=10,ST_CARDXP=10,ST_TYPES={adm:"Administrativo",prova:"Prova",atividade:"Atividade",trabalho:"Trabalho"};
function stS(){prog.st=prog.st||{};const s=prog.st;s.tasks=s.tasks||[];s.cards=s.cards||[];s.hc=s.hc||{goal:0,items:[]};s.hc.items=s.hc.items||[];
  s.cfg=s.cfg||{};s.blk=s.blk||{};return s;}
function stEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function stBtn(txt,cls,fn,lab){const b=stEl("button",cls||"ghost",txt);b.type="button";if(lab)b.setAttribute("aria-label",lab);b.addEventListener("click",fn);return b;}
function stId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function stAdd(k,n){const [y,m,d]=k.split("-").map(Number);const x=new Date(y,m-1,d);x.setDate(x.getDate()+n);return dkey(x);}
function stDays(due){if(!due)return null;const [y,m,d]=String(due).split("-").map(Number);if(!y)return null;const t=new Date();t.setHours(0,0,0,0);return Math.round((new Date(y,m-1,d)-t)/864e5);}
function stWhen(dd){return dd==null?"sem data":dd<0?"atrasado "+(-dd)+(dd===-1?" dia":" dias"):dd===0?"é hoje":dd===1?"amanhã":"em "+dd+" dias";}
// ---- ordem do "Hoje": administrativo primeiro; depois prazo, peso e tarefa mais curta ----
function stOrder(a,b){const A=a.type==="adm"?0:1,B=b.type==="adm"?0:1;if(A!==B)return A-B;
  const da=stDays(a.due),db=stDays(b.due);const x=(da==null?9e9:da)-(db==null?9e9:db);if(x)return x;
  return (b.w||2)-(a.w||2)||(a.blocks||1)-(b.blocks||1);}
function stOpen(){const tk=todayKey();return stS().tasks.filter(t=>!t.done&&t.sn!==tk).sort(stOrder);}
function stToday(){return stOpen().slice(0,3);}
// ---- treino e sono: nada de estudo no treino ±30 min nem 1 h antes de dormir ----
// Sem configuração, usa a tarefa de treino da rotina (dias + q.from) quando existir.
function stTrain(){const c=stS().cfg.train;if(c&&Array.isArray(c.days)&&Number.isFinite(+c.hour))return {days:c.days,hour:+c.hour,dur:+c.dur||60};
  const q=((cfg&&cfg.quests)||[]).find(q=>q&&(/treino|academia|gym/i.test(q.id+" "+q.title))&&Number.isFinite(+q.from)&&q.from!==""&&q.from!=null);
  return q?{days:q.days||[0,1,2,3,4,5,6],hour:+q.from,dur:60,auto:true}:null;}
function stTrainDay(d){const t=stTrain();if(!t)return false;d=d||new Date();return t.days.includes((d.getDay()+6)%7);}
// devolve o motivo e a hora em que o estudo volta, ou null se agora pode estudar
function stBlocked(now){now=now||new Date();const m=now.getHours()*60+now.getMinutes();const t=stTrain();
  if(t&&stTrainDay(now)){const a=t.hour*60-30,b=t.hour*60+t.dur+30;if(m>=a&&m<b)return {why:"treino",back:b};}
  const sl=stS().cfg.sleep;const sh=Number.isFinite(+sl)&&sl!==""&&sl!=null?+sl:null;
  if(sh!=null){const a=sh*60-60;if(m>=a&&m<sh*60)return {why:"sono",back:null};}
  return null;}
function stGoal(){const g=+stS().cfg.blocks||4;return Math.max(1,stTrainDay()?g-1:g);}
function stHM(min){return pad(Math.floor(min/60)%24)+":"+pad(min%60);}
// ---- timer: usa o foco que já existe; ao terminar, pergunta como foi ----
function stStart(t){const s=stS();if(prog.focus&&prog.focus.end){toast("Já tem um bloco rodando.");return;}
  s.cur=t.id;s.pause=null;const sel=$("focusQuest");if(sel){try{fillFocusSelect();}catch(e){}sel.value="";}
  save();startFocus(25);stRender();}
function stAfterBlock(id){const s=stS(),tk=todayKey();s.blk[tk]=(s.blk[tk]||0)+1;const t=s.tasks.find(x=>x.id===id);
  if(t)t.bd=(t.bd||0)+1;s.ask=id;s.cur=null;save();stRender();
  const p=$("stPanel");if(p&&typeof goTab==="function"&&document.body.dataset.tab!=="foco")goTab("foco");}
function stPause(){const s=stS(),n=s.blk[todayKey()]||0;const min=n>0&&n%4===0?15:5;s.pause={end:Date.now()+min*60000,min};s.ask=null;save();stRender();}
function stDone(t){const s=stS();t.done=todayKey();s.ask=null;const dd=stDays(t.due);
  if(dd==null||dd>=0)addXP({q:"st:t:"+t.id,kind:"full",xp:10,stat:"mente",bonus:0,t:new Date().toISOString()},"Entregue no prazo: "+t.t+". +10 XP");
  else{save();toast("Entregue: "+t.t);}stRender();}
// "Travei" ou 2º adiamento: quebrar em um passo de 10 min, que entra no topo
function stBreak(t){const s=stS();s.brk=t.id;s.ask=null;save();stRender();setTimeout(()=>{const i=$("stBrkIn");if(i)i.focus();},50);}
function stSnooze(t){const tk=todayKey();if((t.sc||0)>=1){stBreak(t);return;}t.sc=(t.sc||0)+1;t.sn=tk;save();stRender();toast("Adiado para amanhã. Se travar de novo, a gente quebra em pedaço menor.");}
// ---- flashcards: caixas 1-3-7-14-30 dias; errou volta para 1 dia ----
function stDue(){const tk=todayKey();return stS().cards.filter(c=>!c.next||c.next<=tk);}
function stGrade(c,ok){const tk=todayKey();if(ok){c.box=Math.min(ST_INT.length-1,(c.box==null?-1:c.box)+1);}else c.box=0;c.next=stAdd(tk,ST_INT[c.box]);}
function stCardXP(){const s=stS(),tk=todayKey(),k="st:c:"+tk;const e=(prog.log[tk]||[]).find(x=>x.q===k);
  if(e){if(e.xp<ST_CARDXP){e.xp++;save();}return;}addXP({q:k,kind:"full",xp:1,stat:"mente",bonus:0,t:new Date().toISOString()},"Revisão do dia: +XP por card");}
// importa "frente;verso" (ou tab / vírgula), um card por linha
function stParse(txt,deck){const out=[];for(const ln of String(txt||"").split(/\r?\n/)){const l=ln.trim();if(!l)continue;
    const sep=l.includes(";")?";":l.includes("\t")?"\t":",";const i=l.indexOf(sep);if(i<1)continue;const f=l.slice(0,i).trim(),b=l.slice(i+1).trim();
    if(f&&b)out.push({id:stId(),deck:deck||"Geral",f:f.slice(0,300),b:b.slice(0,600),box:null,next:null});}return out;}
// ---- horas complementares: só "validado" conta como cumprido ----
function stHC(){const h=stS().hc;let v=0,c=0;for(const i of h.items){const n=+i.h||0;if(i.st==="validado")v+=n;else if(i.st==="concluido")c+=n;}return {v,c,goal:+h.goal||0};}

// ---------- tela ----------
function stPanel(){let p=$("stPanel");if(p)return p;const fp=$("focusPanel");if(!fp)return null;
  p=stEl("section","panel stpanel");p.id="stPanel";p.dataset.tab="foco";
  p.dataset.sf="1"; // fica sempre aberto (telas enxutas recolhem o resto): o "Hoje" do estudo precisa estar à vista
  fp.after(p);return p;}
function stField(lab,inp){const l=stEl("label","stf");l.append(stEl("span","sm muted",lab),inp);return l;}
function stInput(id,type,ph,max){const i=document.createElement("input");i.id=id;i.type=type||"text";if(ph)i.placeholder=ph;if(max)i.maxLength=max;return i;}
function stSelect(id,opts,v){const s=document.createElement("select");s.id=id;for(const [k,t] of opts){const o=stEl("option",null,t);o.value=k;s.append(o);}if(v!=null)s.value=v;return s;}
function stDetails(sum,open){const d=document.createElement("details");d.className="stdet";const s=stEl("summary",null,sum);d.append(s);if(open)d.open=true;return d;}
let stTick=null,stRev=null;
function stRender(){const p=stPanel();if(!p)return;const s=stS(),tk=todayKey();
  const keep={};for(const d of p.querySelectorAll("details[data-k]"))keep[d.dataset.k]=d.open;
  p.textContent="";const hd=stEl("div","qhead");hd.append(stEl("h2",null,"📚 Estudo"));
  const nb=s.blk[tk]||0,gl=stGoal();hd.append(stEl("span","xp mono",nb+"/"+gl+" blocos hoje"));p.append(hd);
  const run=!!(prog.focus&&prog.focus.end&&s.cur);
  // 1) depois do bloco: como foi?
  if(s.ask){const t=s.tasks.find(x=>x.id===s.ask);const box=stEl("div","stbox stask");box.append(stEl("b",null,"Bloco feito"+(t?": "+t.t:"")+". Como foi?"));
    const r=stEl("div","row");
    if(t)r.append(stBtn("✓ Terminei a tarefa","go",()=>stDone(t)));
    r.append(stBtn("Avancei","ghost",()=>stPause()));
    if(t)r.append(stBtn("Travei","ghost",()=>stBreak(t)));
    box.append(r);p.append(box);}
  // 2) quebrar em passo menor
  if(s.brk){const t=s.tasks.find(x=>x.id===s.brk);const box=stEl("div","stbox");
    box.append(stEl("b",null,"Quebra em um passo de 10 min"),stEl("div","sm muted","Qual é a menor coisa que dá para fazer agora? Ex.: abrir o material e ler só o 1º tópico."));
    const i=stInput("stBrkIn","text","Primeiro passo",120);box.append(i);const r=stEl("div","row");
    r.append(stBtn("Pôr no topo","go",()=>{const v=i.value.trim();if(!v){i.focus();return;}
      s.tasks.push({id:stId(),t:v,disc:t?t.disc:"",type:t&&t.type==="adm"?"adm":"atividade",due:todayKey(),w:3,blocks:1,step:1});
      if(t){t.sn=null;}s.brk=null;save();stRender();}));
    r.append(stBtn("Cancelar","ghost",()=>{s.brk=null;save();stRender();}));box.append(r);p.append(box);}
  // 3) pausa
  const pz=s.pause&&s.pause.end>Date.now()?s.pause:null;
  if(pz){const box=stEl("div","stbox stpause");box.append(stEl("b",null,"☕ Pausa de "+pz.min+" min"),stEl("div","timer sttimer mono",fmt(pz.end-Date.now())));
    box.append(stEl("div","sm muted","Levanta, bebe água, olha longe. Nada de celular."));box.append(stBtn("Pular pausa","ghost",()=>{s.pause=null;save();stRender();}));p.append(box);
    if(!stTick)stTick=setInterval(()=>{const q=stS().pause;if(!q||q.end<=Date.now()){clearInterval(stTick);stTick=null;if(q){stS().pause=null;save();toast("Pausa acabou. Bora o próximo bloco?");}stRender();return;}const e=document.querySelector("#stPanel .sttimer");if(e)e.textContent=fmt(q.end-Date.now());},1000);}
  else if(s.pause){s.pause=null;}
  // 4) Hoje: até 3 tarefas, uma em destaque
  const bl=stBlocked();
  if(bl){const m=stEl("div","stbox stblock");m.append(stEl("b",null,bl.why==="treino"?"🏋️ Hora do treino":"🌙 Hora de desacelerar"));
    m.append(stEl("div","sm muted",bl.why==="treino"?"Estudo volta às "+stHM(bl.back)+". Treino também é tarefa.":"Perto da hora de dormir: revisão leve só se quiser, nada de matéria nova."));p.append(m);}
  const list=stToday(),all=stOpen();
  if(!s.tasks.length){p.append(stEl("div","sm muted","Cadastre a próxima prova, atividade ou documento. O app escolhe o que vem primeiro."));}
  else if(!list.length){p.append(stEl("div","sm stall","Nada pendente para hoje. Vitória: revisa os cards ou descansa."));}
  list.forEach((t,i)=>{const dd=stDays(t.due);const row=stEl("div","sttask"+(i===0?" top":"")+(dd!=null&&dd<0?" late":dd!=null&&dd<=7?" hot":""));row.dataset.id=t.id;
    const top=stEl("div","sttop");const ti=stEl("b",null,(t.type==="adm"?"📌 ":"")+t.t);top.append(ti,stEl("span","sm mono stdue",stWhen(dd)));row.append(top);
    const meta=[ST_TYPES[t.type]||"Tarefa"];if(t.disc)meta.push(t.disc);meta.push((t.blocks||1)+" bloco"+((t.blocks||1)>1?"s":"")+" de 25 min");if(t.bd)meta.push(t.bd+" feito"+(t.bd>1?"s":""));
    row.append(stEl("div","sm muted",meta.join(" · ")));
    if(i===0){const r=stEl("div","row");
      if(run&&s.cur===t.id)r.append(stEl("span","sm stgo","⏱ Bloco rodando no timer acima"));
      else{const b=stBtn("▶ Começar 25 min","go",()=>stStart(t),"Começar 25 minutos em "+t.t);if(bl&&bl.why==="treino")b.disabled=true;r.append(b);
        r.append(stBtn("Não consigo agora","ghost",()=>stSnooze(t)));}
      row.append(r);}
    else{const r=stEl("div","row");r.append(stBtn("Começar esta","ghost",()=>stStart(t)),stBtn("✓ Entreguei","ghost",()=>stDone(t),"Marcar "+t.t+" como entregue"));row.append(r);}
    p.append(row);});
  if(all.length>3)p.append(stEl("div","sm muted","+ "+(all.length-3)+" na fila. Uma coisa de cada vez."));
  // 5) nova tarefa / prazo
  {const d=stDetails("+ Prova, atividade ou prazo",keep.add);d.dataset.k="add";const f=stEl("div","stform");
    const ti=stInput("stT","text","Ex.: Prova 2 de Disciplina A",80),di=stInput("stD","text","Disciplina (opcional)",40),ty=stSelect("stTy",Object.entries(ST_TYPES),"prova"),
      du=stInput("stDue","date"),w=stSelect("stW",[["3","Peso alto"],["2","Peso médio"],["1","Peso baixo"]],"2"),bk=stSelect("stBk",[["1","1 bloco (25 min)"],["2","2 blocos"],["3","3 blocos"],["4","4 blocos"],["6","6 blocos"]],"2");
    f.append(stField("O quê",ti),stField("Disciplina",di),stField("Tipo",ty),stField("Prazo",du),stField("Peso",w),stField("Tempo estimado",bk));
    f.append(stBtn("Salvar","go",()=>{const v=ti.value.trim();if(!v){ti.focus();return;}s.tasks.push({id:stId(),t:v,disc:di.value.trim(),type:ty.value,due:du.value||null,w:+w.value,blocks:+bk.value});
      save();stRender();toast("Salvo. Alerta a 7, 3 e 1 dia do prazo.");}));d.append(f);p.append(d);}
  // 6) prazos (todos, com alerta)
  {const pend=s.tasks.filter(t=>!t.done&&t.due).sort((a,b)=>a.due<b.due?-1:1);
    if(pend.length){const d=stDetails("📅 Prazos ("+pend.length+")",keep.due);d.dataset.k="due";const ul=stEl("ul","stlist");
      for(const t of pend){const dd=stDays(t.due);const li=stEl("li",dd<0?"late":dd<=7?"hot":"");li.append(stEl("span",null,(t.type==="adm"?"📌 ":"")+t.t),stEl("span","sm mono",stWhen(dd)));
        li.append(stBtn("✕","ghost stx",()=>{s.tasks=s.tasks.filter(x=>x.id!==t.id);save();stRender();},"Apagar "+t.t));ul.append(li);}
      d.append(ul);p.append(d);}}
  // 7) flashcards
  {const due=stDue();const d=stDetails("🧠 Flashcards · "+due.length+" para revisar hoje",keep.cards||!!stRev);d.dataset.k="cards";
    if(stRev&&stRev.q.length){const c=stRev.q[0];const box=stEl("div","stbox stcard");box.append(stEl("div","sm muted",c.deck+" · "+(stRev.n+1)+" de "+stRev.tot));
      box.append(stEl("div","stfront",c.f));
      if(stRev.show){box.append(stEl("div","stback",c.b));const r=stEl("div","row");
        r.append(stBtn("Errei","ghost",()=>stAnswer(false)),stBtn("Acertei","go",()=>stAnswer(true)));box.append(r);}
      else box.append(stBtn("Mostrar resposta","go",()=>{stRev.show=true;stRender();}));
      box.append(stBtn("Parar","ghost",()=>{stRev=null;stRender();}));d.append(box);}
    else{if(due.length){d.append(stBtn("Revisar "+Math.min(ST_SESS,due.length)+" agora (cabe em 5 min)","go",()=>{const q=stDue().slice(0,ST_SESS);stRev={q,n:0,tot:q.length,show:false};stRender();}));}
      else d.append(stEl("div","sm muted",s.cards.length?"Tudo revisado hoje. Os próximos voltam no dia certo.":"Nenhum card ainda. Crie abaixo ou cole uma lista."));
      const f=stEl("div","stform");const dk=stInput("stDk","text","Baralho (ex.: Disciplina A)",40),fr=stInput("stFr","text","Frente (pergunta)",300),bk=stInput("stBkv","text","Verso (resposta)",600);
      f.append(stField("Baralho",dk),stField("Frente",fr),stField("Verso",bk));
      f.append(stBtn("+ Card","go",()=>{const a=fr.value.trim(),b=bk.value.trim();if(!a||!b){(a?bk:fr).focus();return;}s.cards.push({id:stId(),deck:dk.value.trim()||"Geral",f:a,b,box:null,next:null});save();stRender();toast("Card criado.");}));
      const ta=document.createElement("textarea");ta.id="stCsv";ta.rows=3;ta.placeholder="Colar vários: frente;verso (1 por linha)";
      f.append(stField("Importar lista",ta),stBtn("Importar","ghost",()=>{const n=stParse(ta.value,dk.value.trim());if(!n.length){toast("Nada para importar. Use frente;verso.");return;}s.cards.push(...n);save();stRender();toast(n.length+" cards importados.");}));
      d.append(f);}
    p.append(d);}
  // 8) horas complementares
  {const h=stHC();const d=stDetails("🎓 Horas complementares"+(h.goal?" · "+h.v+"/"+h.goal+" h":""),keep.hc);d.dataset.k="hc";
    if(h.goal){const bar=stEl("div","bar stbar");const iv=stEl("i");iv.style.width=Math.min(100,h.v/h.goal*100)+"%";const ic=stEl("i","stc");ic.style.width=Math.min(100,h.c/h.goal*100)+"%";bar.append(iv,ic);d.append(bar);
      d.append(stEl("div","sm muted",h.v+" h validadas · "+h.c+" h concluídas esperando validação · faltam "+Math.max(0,h.goal-h.v)+" h"));}
    const ul=stEl("ul","stlist");for(const it of s.hc.items){const li=stEl("li",it.st==="validado"?"ok":"");li.append(stEl("span",null,it.t+(it.inst?" · "+it.inst:"")),stEl("span","sm mono",(+it.h||0)+" h"));
      const sel=stSelect("",[["fazendo","Fazendo"],["concluido","Concluído"],["validado","Validado"]],it.st||"fazendo");sel.removeAttribute("id");sel.setAttribute("aria-label","Status de "+it.t);
      sel.addEventListener("change",()=>{it.st=sel.value;save();stRender();});li.append(sel);ul.append(li);}
    if(s.hc.items.length)d.append(ul);
    const f=stEl("div","stform");const g=stInput("stHg","number","Ex.: 200");g.min="0";g.value=h.goal||"";
    const n=stInput("stHn","text","Curso",80),ins=stInput("stHi","text","Instituição",60),hh=stInput("stHh","number","Horas");hh.min="0";
    f.append(stField("Meta (horas)",g),stBtn("Salvar meta","ghost",()=>{s.hc.goal=Math.max(0,+g.value||0);save();stRender();}));
    f.append(stField("Curso",n),stField("Instituição",ins),stField("Horas",hh),stBtn("+ Curso","go",()=>{const v=n.value.trim();if(!v||!(+hh.value>0)){(v?hh:n).focus();return;}
      s.hc.items.push({id:stId(),t:v,inst:ins.value.trim(),h:+hh.value,date:todayKey(),st:"fazendo"});save();stRender();}));
    d.append(f);p.append(d);}
  // 9) ajustes: blocos por dia, treino, sono
  {const d=stDetails("⚙️ Ritmo, treino e sono",keep.cfg);d.dataset.k="cfg";const f=stEl("div","stform");const c=s.cfg,tr=stTrain();
    const bk=stSelect("stCb",[["2","2 blocos por dia"],["3","3 blocos"],["4","4 blocos"],["6","6 blocos"],["8","8 blocos"]],String(c.blocks||4));
    const th=stInput("stTh","number","Hora (0-23)");th.min="0";th.max="23";th.value=tr?tr.hour:"";
    const sl=stInput("stSl","number","Ex.: 23");sl.min="0";sl.max="23";sl.value=c.sleep!=null?c.sleep:"";
    const dw=stEl("div","stdays");const DN=["S","T","Q","Q","S","S","D"],DL=["segunda","terça","quarta","quinta","sexta","sábado","domingo"];const sel=new Set(tr?tr.days:[]);
    DN.forEach((x,i)=>{const b=stBtn(x,"ghost stday"+(sel.has(i)?" on":""),()=>{sel.has(i)?sel.delete(i):sel.add(i);b.classList.toggle("on");b.setAttribute("aria-pressed",sel.has(i));},"Treino na "+DL[i]);b.setAttribute("aria-pressed",sel.has(i));dw.append(b);});
    f.append(stField("Meta de blocos",bk),stEl("span","sm muted","Dias de treino"),dw,stField("Hora do treino",th),stField("Hora de dormir",sl));
    if(tr&&tr.auto)f.append(stEl("div","sm muted","Treino lido da sua rotina. Salve para ajustar."));
    f.append(stEl("div","sm muted","Em dia de treino a meta cai 1 bloco, e nada de estudo 30 min antes e depois."));
    f.append(stBtn("Salvar","go",()=>{c.blocks=+bk.value;const h=th.value===""?null:Math.max(0,Math.min(23,+th.value));
      c.train=h==null||!sel.size?null:{days:[...sel].sort(),hour:h,dur:60};c.sleep=sl.value===""?null:Math.max(0,Math.min(23,+sl.value));save();stRender();toast("Ritmo salvo.");}));
    d.append(f);p.append(d);}
  stAlert();}
function stAnswer(ok){if(!stRev)return;const c=stRev.q.shift();const real=stS().cards.find(x=>x.id===c.id);if(real)stGrade(real,ok);stRev.n++;stRev.show=false;save();stCardXP();
  if(!stRev.q.length){const n=stRev.tot;stRev=null;toast("Revisão feita: "+n+" cards.");}stRender();}
// ---- alerta na aba Hoje: próximo prazo a 7 dias ou menos (ou atrasado) ----
function stAlert(){const host=document.querySelector('section[data-tab="hoje"].panel');if(!host)return;let a=$("stAlert");
  const pend=stS().tasks.filter(t=>!t.done&&t.due&&stDays(t.due)<=7).sort(stOrder);
  if(!pend.length){if(a)a.remove();return;}
  if(!a){a=stEl("button","stalert");a.type="button";a.id="stAlert";a.addEventListener("click",()=>{if(typeof goTab==="function")goTab("foco");setTimeout(()=>{const p=$("stPanel");if(p)p.scrollIntoView({block:"start"});},50);});host.append(a);}
  const t=pend[0],dd=stDays(t.due);a.className="stalert"+(dd<0?" late":dd<=3?" hot":"");
  a.textContent=(dd<0?"⚠️ ":"📚 ")+t.t+": "+stWhen(dd)+(pend.length>1?" · +"+(pend.length-1)+" prazo"+(pend.length>2?"s":"")+" na semana":"");}
// ---- ganchos no foco que já existe ----
{const _ff=finishFocus;finishFocus=function(){const id=prog.st&&prog.st.cur;_ff.apply(this,arguments);if(id)stAfterBlock(id);};}
{const fs=$("focusStop");if(fs)fs.addEventListener("click",()=>{if(prog.st&&prog.st.cur){prog.st.cur=null;save();stRender();}});}
{const tb=document.querySelector('#tabbar [data-go="foco"]');if(tb)tb.addEventListener("click",()=>setTimeout(stRender,0));}
// não refaz o painel com a pessoa digitando nele (o texto do formulário não se perde)
{const _sr=render;render=function(){_sr.apply(this,arguments);try{const p=$("stPanel"),ae=document.activeElement;if(p&&ae&&p.contains(ae)&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName)){stAlert();return;}stRender();}catch(e){}};}
