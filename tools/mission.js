// ---------- Missão ativa: tocar ▶ numa tarefa abre a missão com timer fixo no canto e a ferramenta pronta ----------
// Pedido dos testadores: "não só a ideia do que fazer, já trazer exatamente o que fazer" (ex.: flashcards dentro do app).
// Só ADICIONA dados: prog.cards (flashcards), prog.gastos (gastos anotados), prog.agua (copos por dia). Nada é apagado.
const MS_LV=[0,1,2,4,8,16,30];
let msQ=null;
function msEl(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function msMin(s){const m=/(\d+)\s*min/i.exec(String(s||""));return m?Math.min(90,Math.max(1,+m[1])):0;}
function msTool(q){const t=(q.title||"")+" "+(q.minTitle||"");
  if(/flashcard|\bcards?\b|revis|pergunta/i.test(t))return "cards";
  if(/gasto/i.test(t))return "gastos";
  if(/copo|água|agua|garrafa/i.test(t))return "agua";
  return "";}
function msDays(n){const d=new Date();d.setDate(d.getDate()+n);return dkey(d);}
function msFind(id){return todaysQuests().find(x=>x.id===id);}
function msDone(q){return (prog.log[todayKey()]||[]).find(e=>e.q===q.id);}
// ---- tela da missão ----
function msOpen(q){msQ=q;let m=$("msSheet");
  if(!m){m=msEl("div","mssheet");m.id="msSheet";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Missão");document.body.append(m);}
  m.hidden=false;document.body.classList.add("inmission");msRender();msChip();}
function msClose(){const m=$("msSheet");if(m)m.hidden=true;document.body.classList.remove("inmission");msChip();}
function msRender(){const m=$("msSheet");const q=msQ&&msFind(msQ.id);if(!m||!q){msClose();return;}m.textContent="";
  const c=msEl("div","mscard");
  const top=msEl("div","mstop");top.append(msEl("span","mstag","[ SISTEMA ] MISSÃO ATIVA"));const x=msEl("button","link","Minimizar ⌄");x.type="button";x.addEventListener("click",msClose);top.append(x);
  c.append(top,msEl("h3",null,q.title));
  if(q.ifThen)c.append(msEl("div","sm muted","Gatilho: "+q.ifThen));
  // timer
  const f=prog.focus,on=!!(f&&f.end&&f.q===q.id),busy=!!(f&&f.end&&f.q!==q.id);
  const tb=msEl("div","mstimer");
  if(on){const t=msEl("div","msclock",fmt(f.end-Date.now()));t.id="msClock";tb.append(t);
    const st=msEl("button","ghost","Parar timer");st.type="button";st.addEventListener("click",()=>{prog.focus=null;save();focusUI();if(typeof fxEnd==="function")fxEnd(false);msRender();msChip();});tb.append(st);}
  else if(busy)tb.append(msEl("div","sm muted","Já tem um timer rodando em outra tarefa. Termine ou pare ele no Foco."));
  else{const full=msMin(q.title)||10,mn=msMin(q.minTitle);
    const b=msEl("button","go","▶ Timer de "+full+" min");b.type="button";b.addEventListener("click",()=>msStart(q,full,"full"));tb.append(b);
    if(mn&&mn<full){const b2=msEl("button","ghost","Mínimo: "+mn+" min");b2.type="button";b2.addEventListener("click",()=>msStart(q,mn,"min"));tb.append(b2);}}
  c.append(tb);
  // ferramenta
  const tool=msTool(q);const box=msEl("div","mstool");
  if(tool==="cards")msCards(box);else if(tool==="gastos")msGastos(box);else if(tool==="agua")msAgua(box);
  if(box.childNodes.length)c.append(box);
  // concluir
  const e=msDone(q);const row=msEl("div","row msend");
  const ok=msEl("button","go",e&&e.kind!=="min"?"Concluída ✓":"✓ Concluir missão");ok.type="button";ok.disabled=!!(e&&e.kind!=="min");
  ok.addEventListener("click",()=>{msStopIf(q);msClose();if(!(e&&e.kind!=="min"))toggle(q,"full");});row.append(ok);
  if(q.minTitle&&!e){const mi=msEl("button","ghost","Fiz só o mínimo");mi.type="button";mi.addEventListener("click",()=>{msStopIf(q);msClose();toggle(q,"min");});row.append(mi);}
  c.append(row);
  if((cfg.quests||[]).some(x=>x.id===q.id)){
    const no=msEl("button","link msno","Essa tarefa não combina comigo");no.type="button";no.addEventListener("click",()=>msDrop(q));c.append(no);}
  m.append(c);}
function msStopIf(q){const f=prog.focus;if(f&&f.q===q.id){prog.focus=null;save();focusUI();if(typeof fxEnd==="function")fxEnd(false);}}
function msStart(q,min,kind){prog.focus={end:Date.now()+min*60000,min,q:q.id,ms:kind};save();focusUI();
  try{haptic([15,40,15]);if(dev.noise)noiseOn();noiseUI();}catch(e){}
  if(F_IOS&&dev.sc)setTimeout(()=>runShortcut(min),250);msRender();msChip();}
// Missão: fim do timer conclui a tarefa do jeito escolhido (completa ou mínimo), sem abrir a sala de foco.
{const _ff=finishFocus;finishFocus=function(){const f=prog.focus;if(!(f&&f.ms))return _ff();
  prog.focus=null;clearInterval(focusTick);focusTick=null;try{noiseOff();noiseUI();if(!document.hidden){chime();haptic([20,60,20,60,40]);}}catch(e){}
  const q=msFind(f.q);save();focusUI();
  if(q&&!msDone(q)){toggle(q,f.ms==="min"?"min":"full");}
  sysPop("MISSÃO",q?"Tempo cumprido":"Bloco concluído",q?("\""+q.title+"\" foi marcada. Respira um minuto antes da próxima."):"Bom trabalho.",null,"Continuar");
  msClose();};}
// Timer fixo no canto enquanto a missão roda (toque para voltar para ela).
function msChip(){let ch=$("msChip");const f=prog.focus;const on=!!(f&&f.end&&f.ms)&&($("msSheet")||{}).hidden!==false;
  if(!on){if(ch)ch.hidden=true;return;}
  if(!ch){ch=msEl("button","mschip");ch.id="msChip";ch.type="button";ch.addEventListener("click",()=>{const q=msFind((prog.focus||{}).q);if(q)msOpen(q);});document.body.append(ch);}
  ch.hidden=false;ch.textContent="⏱ "+fmt(f.end-Date.now());ch.setAttribute("aria-label","Voltar para a missão, faltam "+fmt(f.end-Date.now()));}
{const _fu=focusUI;focusUI=function(){_fu();try{const f=prog.focus;const k=$("msClock");if(k&&f&&f.end)k.textContent=fmt(f.end-Date.now());msChip();}catch(e){}};}
// "Não combina comigo": tira a tarefa da lista (o histórico continua). Dá para desfazer.
function msDrop(q){if(!confirm("Tirar \""+q.title+"\" da sua lista? Seu XP e histórico continuam."))return;
  const i=(cfg.quests||[]).findIndex(x=>x.id===q.id);if(i<0)return;const [rm]=cfg.quests.splice(i,1);
  try{localStorage.setItem(CFG_KEY,JSON.stringify(cfg));}catch(e){}msClose();render();
  toast("Tarefa removida. Em Mais > Refazer perfil você ajusta o resto.");
  prog.dropped=(prog.dropped||[]).concat([{id:rm.id,t:rm.title,at:todayKey()}]).slice(-30);save();
  msUndo=()=>{cfg.quests.splice(i,0,rm);try{localStorage.setItem(CFG_KEY,JSON.stringify(cfg));}catch(e){}render();toast("Tarefa de volta.");};
  setTimeout(()=>{const t=$("toast");if(!t||t.hidden)return;const u=msEl("button","link","Desfazer");u.type="button";u.addEventListener("click",()=>{if(msUndo)msUndo();msUndo=null;});t.append(" ",u);},30);}
let msUndo=null;
// ---- Flashcards (repetição espaçada simples) ----
let msCard=null,msShow=false,msSeen=0,msAddOpen=false;
function msDue(){const tk=todayKey();return (prog.cards||[]).filter(c=>(c.due||"")<=tk);}
function msCards(box){prog.cards=prog.cards||[];const due=msDue();
  box.append(msEl("div","mstl","🃏 Flashcards · "+prog.cards.length+" no baralho · "+due.length+" para hoje"));
  if(due.length){if(!msCard||!due.includes(msCard)){msCard=due[0];msShow=false;}
    const cd=msEl("button","fcard"+(msShow?" back":""));cd.type="button";cd.append(msEl("div","sm muted",msShow?"RESPOSTA":"PERGUNTA"),msEl("div","fq",msShow?msCard.b:msCard.f));
    if(!msShow)cd.append(msEl("div","sm muted","toque para virar"));cd.addEventListener("click",()=>{msShow=!msShow;msRender();});box.append(cd);
    if(msShow){const r=msEl("div","row");const er=msEl("button","ghost","✗ Errei");er.type="button";const ac=msEl("button","go","✓ Acertei");ac.type="button";
      const grade=okk=>{const c=msCard;c.lv=okk?Math.min(MS_LV.length-1,(c.lv||0)+1):0;c.due=okk?msDays(MS_LV[c.lv]):todayKey();if(!okk){prog.cards=prog.cards.filter(x=>x!==c).concat([c]);}
        msSeen++;msCard=null;msShow=false;save();msRender();if(!msDue().length)toast("Baralho de hoje feito: "+msSeen+" cards revisados.");};
      er.addEventListener("click",()=>grade(false));ac.addEventListener("click",()=>grade(true));r.append(er,ac);box.append(r);}
  }else if(prog.cards.length)box.append(msEl("div","sm","Nenhum card para hoje. Crie novos com a matéria da última aula ou conclua a missão."));
  else box.append(msEl("div","sm","Crie seus primeiros cards: uma pergunta na frente, a resposta atrás. 5 cards já valem."));
  const d=msEl("details","msadd");if(!prog.cards.length||msAddOpen)d.open=true;d.addEventListener("toggle",()=>{msAddOpen=d.open;});d.append(msEl("summary",null,"+ Criar cards"));
  const f1=msEl("input");f1.placeholder="Pergunta (frente)";f1.maxLength=140;f1.setAttribute("aria-label","Pergunta do card");
  const f2=msEl("input");f2.placeholder="Resposta (verso)";f2.maxLength=200;f2.setAttribute("aria-label","Resposta do card");
  const ad=msEl("button","go","Adicionar card");ad.type="button";
  const add=(a,b)=>{a=String(a||"").trim().slice(0,140);b=String(b||"").trim().slice(0,200);if(!a||!b)return false;prog.cards.push({f:a,b,lv:0,due:todayKey()});return true;};
  ad.addEventListener("click",()=>{if(!add(f1.value,f2.value)){(f1.value?f2:f1).focus();return;}msAddOpen=true;save();msRender();const n1=document.querySelector(".msadd input");if(n1)n1.focus();toast("Card criado.");});
  const bulk=msEl("textarea");bulk.rows=3;bulk.placeholder="Ou cole vários, um por linha:\npergunta ; resposta";bulk.setAttribute("aria-label","Colar vários cards");
  const bb=msEl("button","ghost","Adicionar todos");bb.type="button";bb.addEventListener("click",()=>{let n=0;for(const l of bulk.value.split(/\n+/)){const p=l.split(/\s*[;|]\s*|\s+-\s+|\t/);if(p.length>=2&&add(p[0],p.slice(1).join(" ")))n++;}
    if(!n){toast("Use uma linha por card: pergunta ; resposta");return;}save();msRender();toast(n+" cards criados.");});
  d.append(f1,f2,ad,bulk,bb);box.append(d);}
// ---- Gastos ----
function msGastos(box){prog.gastos=prog.gastos||[];const tk=todayKey();const hoje=prog.gastos.filter(g=>g.d===tk);const tot=hoje.reduce((a,g)=>a+g.v,0);
  box.append(msEl("div","mstl","💸 Gastos de hoje: R$ "+tot.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})));
  const r=msEl("div","add");const v=msEl("input");v.inputMode="decimal";v.placeholder="R$";v.className="msv";v.setAttribute("aria-label","Valor");
  const t=msEl("input");t.placeholder="Com o quê? (ex.: lanche)";t.maxLength=40;t.setAttribute("aria-label","Com o que gastou");
  const b=msEl("button","go","Anotar");b.type="button";b.addEventListener("click",()=>{const n=parseFloat(String(v.value).replace(/\./g,"").replace(",","."));if(!(n>0)){v.focus();return;}
    prog.gastos.push({d:tk,v:Math.round(n*100)/100,t:String(t.value||"").trim().slice(0,40)});prog.gastos=prog.gastos.slice(-400);save();msRender();});
  r.append(v,t,b);box.append(r);
  if(hoje.length){const ul=msEl("ul","sm msl");for(const g of hoje.slice(-6))ul.append(msEl("li",null,"R$ "+g.v.toLocaleString("pt-BR",{minimumFractionDigits:2})+(g.t?" · "+g.t:"")));box.append(ul);}
  const wk=weekStart(tk);const sem=prog.gastos.filter(g=>weekStart(g.d)===wk).reduce((a,g)=>a+g.v,0);
  box.append(msEl("div","sm muted","Na semana: R$ "+sem.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})));}
// ---- Água ----
function msAgua(box){prog.agua=prog.agua||{};const tk=todayKey();const n=prog.agua[tk]||0;const goal=+((/(\d+)\s*copos?/i.exec(msQ.title)||[])[1]||6);
  box.append(msEl("div","mstl","💧 "+n+" de "+goal+" copos hoje"));
  const r=msEl("div","row");const b=msEl("button","go","+1 copo");b.type="button";b.addEventListener("click",()=>{prog.agua[tk]=n+1;save();haptic(10);msRender();if(n+1==goal)toast("Meta de água batida.");});
  const u=msEl("button","ghost","−1");u.type="button";u.disabled=!n;u.addEventListener("click",()=>{prog.agua[tk]=Math.max(0,n-1);save();msRender();});r.append(b,u);box.append(r);}
// ---- botão ▶ em cada tarefa pendente ----
function msDecorate(){for(const c of document.querySelectorAll("#quests .quest[data-q]")){if(c.querySelector(".msgo"))continue;
  if(c.classList.contains("done"))continue;const q=msFind(c.dataset.q);if(!q)continue;const bt=c.querySelector(".btns");if(!bt)continue;
  const b=msEl("button","msgo","▶");b.type="button";b.title="Começar missão";b.setAttribute("aria-label","Começar: "+q.title);
  b.addEventListener("click",ev=>{ev.stopPropagation();msOpen(q);});bt.prepend(b);
  if(c.classList.contains("next")&&!c.querySelector(".mshint")&&!(prog.cards||prog.msUsed)){const h=msEl("div","mshint","Toque em ▶ para começar: o app te guia com timer e ferramenta.");c.append(h);}}}
{const _r=render;render=function(){_r.apply(this,arguments);try{msDecorate();msChip();}catch(e){}};}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest(".msgo")){prog.msUsed=(+prog.msUsed||0)+1;}},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("msSheet")&&!$("msSheet").hidden)msClose();});
setTimeout(()=>{try{msDecorate();msChip();}catch(e){}},0);
