// ---------- Tarefas mais limpas + horário certo ----------
// Cada tarefa mostra só o título, o XP e os botões. Tocar no título abre os detalhes (tipo, gatilho, mínimo, link).
// Tarefas com hora certa ficam com cadeado até o horário: "antes de dormir" libera às 20h, as da manhã às 5h,
// e quem tem "Quando der 19h" / "Às 14h" no gatilho libera 1 hora antes. Pode trocar em cfg: q.from = hora.
function qtFrom(q){if(!q)return null;if(Number.isFinite(+q.from)&&q.from!==""&&q.from!=null)return Math.max(0,Math.min(23,+q.from));
  const t=String(q.title||"").toLowerCase(),i=String(q.ifThen||"").toLowerCase();
  if(q.id==="s_fech"||q.id==="q_fech"||/antes de dormir|fechamento|marcar o que fiz hoje/.test(t))return 20;
  if(q.id==="s_mochila"||/depois do jantar/.test(i))return 18;
  if(/almo[cç]/.test(t))return 11;
  const m=/(?:quando der|às|as|a partir das)\s+(\d{1,2})\s*h/.exec(i);if(m){const h=+m[1];if(h>=6&&h<=23)return Math.max(5,h-1);}
  if(/ao acordar|acordar|da manhã|primeira hora do dia/.test(t+" "+i))return 5;
  return null;}
function qtLocked(q){const f=qtFrom(q);if(f==null)return null;const h=new Date().getHours();
  return h<f?f:null;} // o dia vira à meia-noite: 0h-4h59 já é o dia novo, então "Fechar o dia" fica trancado até a hora dele
const QT_SHORT={s_fech:"🌙 Fechar o dia",q_fech:"🌙 Fechar o dia"};
const QT_SHORT_RE=[[/^antes de dormir/i,"🌙 Fechar o dia"],[/^fechamento/i,"🌙 Fechar o dia"],[/trabalhar 90 min/i,"Bloco de foco: 90 min"],[/oferecer desenho/i,"Oferecer desenho técnico"],[/abordar 3 corretores/i,"Abordar 3 corretores"]];
// título longo: corta o parêntese ou o que vem depois de ":" (o texto inteiro fica nos detalhes)
function qtAuto(t){t=String(t||"");if(t.length<=34)return null;let s=t.replace(/\s*\([^)]*\)/g,"").trim();if(s.length>40&&t.indexOf(": ")>8){const c=t.slice(0,t.indexOf(": "));if(!/\s(para|de|do|da|dos|das|com|em|no|na|a|o|e|ou|pra|por|sobre)$/i.test(c))s=c;}return s&&s!==t&&s.length<t.length?s:null;}
function qtShort(q){return q.short||QT_SHORT[q.id]||(String(q.title).length>46&&QT_SHORT_RE.find(r=>r[0].test(q.title))||[])[1]||qtAuto(q.title);}
function qtTidy(){const box=$("quests");if(!box)return;let nextMoved=false;
  for(const c of box.querySelectorAll(".quest[data-q]")){const q=((cfg&&cfg.quests)||[]).find(x=>x.id===c.dataset.q);if(!q)continue;
    const nm=c.querySelector(".t > div:not(.xp)");const x=c.querySelector(".t .xp");
    const sh=qtShort(q);
    if(nm&&!nm.dataset.qt&&sh&&sh!==q.title){nm.textContent=sh;const d=document.createElement("div");d.className="qtdesc";d.textContent=q.title;nm.after(d);}
    if(nm&&!nm.dataset.qt){nm.dataset.qt="1";nm.classList.add("tt");nm.setAttribute("role","button");nm.tabIndex=0;nm.setAttribute("aria-expanded","false");
      const tg=()=>{c.classList.toggle("open");nm.setAttribute("aria-expanded",c.classList.contains("open")?"true":"false");};
      nm.onclick=tg;nm.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tg();}};}
    if(x&&!x.dataset.qt){x.dataset.qt="1";const parts=x.textContent.split("  ·  mínimo: ");x.textContent=parts[0];if(parts[1]){const mn=document.createElement("span");mn.className="qtmin";mn.textContent=" · mínimo: "+parts[1];x.append(mn);}}
    // rodapé: XP à esquerda, botões à direita (uma linha só)
    const bt=c.querySelector(".btns");if(x&&bt&&!c.querySelector(".qtfoot")){const f=document.createElement("div");f.className="qtfoot";(c.querySelector(".t")||c).after(f);f.append(x,bt);}
    const done=c.classList.contains("done")||c.classList.contains("min");
    const lk=done?null:qtLocked(q);c.classList.toggle("qtlock",!!lk);
    let lb=c.querySelector(".qtlb");if(lk!=null){if(!lb){lb=document.createElement("div");lb.className="qtlb";(c.querySelector(".qtfoot")||c).append(lb);}lb.textContent="🔒 libera às "+lk+"h";}else if(lb)lb.remove();
    for(const b of c.querySelectorAll(".btns button")){b.disabled=lk!=null;if(lk!=null)b.title="Libera às "+lk+"h";}
    if(c.classList.contains("next")&&lk!=null){c.classList.remove("next");const l=c.querySelector(".nextlbl");if(l)l.remove();nextMoved=true;}}
  // travadas vão para o fim da lista: o que dá para fazer agora fica em cima
  for(const g of box.querySelectorAll(".qgroup")){const L=[...g.querySelectorAll(":scope > .quest.qtlock")];L.sort((a,b)=>(qtLocked(questById(a.dataset.q))||0)-(qtLocked(questById(b.dataset.q))||0));for(const c of L)g.append(c);}
  // grupo das principais todo travado (ex.: só "Fechar o dia", que libera à noite): desce para depois das extras liberadas
  {const g0=box.querySelector(":scope > .qgroup");const qs=g0?[...g0.querySelectorAll(":scope > .quest")]:[];
    if(qs.length&&qs.every(c=>c.classList.contains("qtlock"))){const ex=[...box.querySelectorAll(":scope > details")].find(d=>d.querySelector(".quest:not(.done):not(.min):not(.qtlock)"));
      if(ex){ex.open=true;if(g0.compareDocumentPosition(ex)&Node.DOCUMENT_POSITION_FOLLOWING){ex.after(g0);nextMoved=true;}}}}
  if(nextMoved||!box.querySelector(".quest.next")){const cand=[...box.querySelectorAll(".qgroup .quest[data-q]")].find(c=>!c.classList.contains("qtlock")&&!c.classList.contains("done")&&!c.classList.contains("min"));
    if(cand&&!cand.classList.contains("next")){cand.classList.add("next");const nx=document.createElement("div");nx.className="nextlbl";nx.textContent="PRÓXIMA";cand.prepend(nx);}}}
{const _r=render;render=function(){_r.apply(this,arguments);try{qtTidy();}catch(e){}};}
// mensagem do [SISTEMA]: aponta para a primeira tarefa liberada, com o título curto
if(typeof sysLine==="function"){const _sl=sysLine;sysLine=function(){const t=_sl();try{const dt=new Date();const done=prog.log[todayKey()]||[];
  const left=mainsFor(dt).filter(q=>!done.some(e=>e.q===q.id));if(!left.length)return t;const nx=left[0];const ok=(typeof slotSort==="function"?slotSort(left):left).find(q=>qtLocked(q)==null);
  const nm=q=>qtShort(q)||q.title;
  if(t.includes("Próxima missão: "+nx.title)){if(ok)return t.replace("Próxima missão: "+nx.title,"Próxima missão: "+nm(ok));const lk=qtLocked(nx);return t.replace("Próxima missão: "+nx.title+".","Próxima missão libera às "+lk+"h: "+nm(nx)+".");}
  if(t.includes("Sugestão: "+(nx.minTitle||nx.title))&&ok&&ok!==nx)return t.replace("Sugestão: "+(nx.minTitle||nx.title),"Sugestão: "+(ok.minTitle||nm(ok)));}catch(e){}return t;};}
setTimeout(()=>{try{qtTidy();}catch(e){}},0);
// vira a hora com o app aberto: libera sozinho
setInterval(()=>{try{if(!document.hidden&&document.querySelector("#quests .qtlock")){const h=new Date().getHours();if(h!==qtTidy.h){qtTidy.h=h;render();}}}catch(e){}},60000);
// trava de verdade: nem o deslizar marca antes da hora (desmarcar continua livre)
if(typeof toggle==="function"){const _tg=toggle;toggle=function(q,kind){try{const done=(prog.log[todayKey()]||[]).some(e=>e.q===q.id);const lk=done?null:qtLocked(q);
  if(lk!=null){toast("🔒 Essa libera às "+lk+"h.");try{haptic([30]);}catch(e){}return;}}catch(e){}return _tg.apply(this,arguments);};}
