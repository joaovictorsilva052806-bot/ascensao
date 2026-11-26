// ---------- Sequência estilo Duolingo: escudo automático, marcos comemorados e aviso de risco ----------
// Só ADICIONA prog.shield = {n, used:{data:1}, ms:{marco:data}, chk}. Dia com escudo conta como descanso (sem dívida, sem quebrar).
const ST_MS=[1,3,7,14,30,50,100,365],ST_MAX=2;
function stAct(k){return (prog.log[k]||[]).some(e=>!/^(ach|checkin|tip|dun|adm):/.test(String(e.q)));}
function shieldSt(){if(!prog.shield||typeof prog.shield!=="object"){prog.shield={n:1,used:{},ms:{}};const n=streakDays();for(const m of ST_MS)if(m<=n)prog.shield.ms[m]="antes";}
  const s=prog.shield;s.used=s.used||{};s.ms=s.ms||{};if(typeof s.n!=="number")s.n=1;return s;}
function stRun(d){let n=0;d=new Date(d);for(let i=0;i<400;i++){const k=dkey(d);if(stAct(k))n++;else if(!isRest(k))break;d.setDate(d.getDate()-1);}return n;}
function shieldAuto(){if(!cfg||cfg.blank||($("onb")&&!$("onb").hidden))return;const s=shieldSt();const tk=todayKey();if(s.chk===tk)return;
  const d=new Date();d.setDate(d.getDate()-1);const gap=[];
  for(let i=0;i<3;i++){const k=dkey(d);if(stAct(k)||isRest(k))break;gap.push(k);d.setDate(d.getDate()-1);}
  s.chk=tk;if(!gap.length||gap.length>2){save();return;}
  const before=stRun(d);if(!before){save();return;}
  if(gap.length>s.n){save();if(before>=3)sysPop("NOVA SEQUÊNCIA","Recomeço, sem culpa","Sua sequência de "+before+" dias parou, e tudo bem: o seu XP e o seu nível continuam. Hoje é o dia 1 de novo. Uma tarefa já acende o fogo.",null,"Bora");return;}
  for(const k of gap)s.used[k]=1;s.n-=gap.length;save();render();
  sysPop("ESCUDO ATIVADO","🛡️ Sequência salva: "+streakDays()+(streakDays()===1?" dia":" dias"),(gap.length>1?"Dois dias ficaram":"Ontem ficou")+" sem tarefa e o escudo segurou o fogo sozinho. Faça 1 tarefa hoje para ela seguir. Escudos restantes: "+s.n+".",null,"Valeu, Sistema");}
const ST_TXT={1:["Sequência iniciada 🔥","Dia 1. Volte amanhã e vira 2. Uma tarefa por dia já mantém o fogo aceso."],
  3:["3 dias seguidos 🔥","Seu cérebro já está pegando o ritmo. Com 7 dias você ganha um escudo de sequência."],
  7:["1 semana! 🛡️ +1 escudo","Se um dia passar em branco, o escudo salva sua sequência sozinho. Você guarda até 2."]};
function stMilestone(){if(!cfg||cfg.blank)return;const s=shieldSt();const n=streakDays();for(const m in s.ms)if(+m>n)delete s.ms[m];if(!stAct(todayKey()))return;
  let hit=0;for(const m of ST_MS)if(m<=n&&!s.ms[m]){s.ms[m]=todayKey();hit=m;if(m>=7&&s.n<ST_MAX)s.n++;}
  if(!hit)return;save();const t=ST_TXT[hit]||[hit+" dias seguidos 🔥"+(s.n?" 🛡️":""),"Marco de "+hit+" dias. Pouca gente chega aqui. Escudos guardados: "+s.n+" de "+ST_MAX+"."];
  sysPop("MARCO DE SEQUÊNCIA",t[0],t[1],null,"Continuar");}
function stRisk(){const h=new Date().getHours();return h>=18&&!stAct(todayKey())&&!isRest(todayKey())&&streakDays()>0;}
{const _rp=renderPills;renderPills=function(){_rp();const st=$("streak");if(!st)return;const s=shieldSt();
  let sp=$("shieldPill");if(!sp){sp=document.createElement("span");sp.className="pill shield";sp.id="shieldPill";st.after(sp);
    for(const el of [st,sp]){el.setAttribute("role","button");el.tabIndex=0;el.addEventListener("click",stInfo);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();stInfo();}});}}
  sp.textContent="🛡️ "+s.n;sp.title=s.n+" escudo(s) de sequência";sp.classList.toggle("none",!s.n);
  const r=stRisk();st.classList.toggle("risk",r);if(r)st.title="Sequência em risco: 1 tarefa hoje salva";
  if(!sysQ.length)setTimeout(()=>{if(!sysQ.length){shieldAuto();stMilestone();stPerfect();}},700);};}
function stPerfect(){if(!cfg||cfg.blank)return;const s=shieldSt();const tk=todayKey();if(s.perfect===tk)return;const ms=mainsFor(new Date());const L=prog.log[tk]||[];
  if(ms.length<2||!ms.every(q=>L.some(e=>e.q===q.id)))return;s.perfect=tk;save();const n=streakDays();
  sysPop("DIA PERFEITO","Missão diária completa ✓","Todas as "+ms.length+" principais de hoje. Sequência: "+n+(n===1?" dia":" dias")+" 🔥. O resto do dia é bônus: descanse ou pegue uma extra.",null,"Fechou");}
function stInfo(){const s=shieldSt();const n=streakDays();
  sysPop("SEQUÊNCIA","🔥 "+n+(n===1?" dia":" dias")+" · 🛡️ "+s.n,"1 tarefa por dia mantém o fogo (o mínimo vale). Se um dia passar em branco, um escudo salva a sequência sozinho. Você ganha 1 escudo a cada marco de 7, 14, 30 dias e guarda até "+ST_MAX+".",null,"Entendi");}
{const _sl=sysLine;sysLine=function(){const t=_sl();if(!stRisk())return t;const ms=mainsFor(new Date()).filter(q=>!(prog.log[todayKey()]||[]).some(e=>e.q===q.id));const nx=ms[0];
  return "🔥 Sua sequência de "+streakDays()+" dias está em risco. "+(nx?"1 tarefa salva: "+(nx.minTitle||nx.title)+".":"Uma tarefa qualquer salva.")+(shieldSt().n?" Se não der, o escudo segura.":"");};}
