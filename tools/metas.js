// ---------- Modo Criador: Metas, plano de hoje e prioridades da semana ----------
// Tudo vem da planilha do criador (cfg.goals, cfg.focus). Nada pessoal fica no código.
// cfg.goals = [{id,t,due:"AAAA-MM-DD",of,n,unit,quest}]  · n = progresso que a EVA já registrou
// prog.gp[id] = ajuste feito no app com +1/−1 (sobe para a planilha no A2 junto com o resto)
// quest = id de uma tarefa: conta quantas vezes ela foi feita nesta semana (seg a dom)
function mtWeekCount(qid){const d=new Date();const dow=(d.getDay()+6)%7;let n=0;for(let i=0;i<=dow;i++){const x=new Date(d);x.setDate(d.getDate()-i);n+=((prog.log||{})[dkey(x)]||[]).filter(e=>e.q===qid).length?1:0;}return n;}
function mtDays(due){if(!due)return null;const [y,m,d]=String(due).split("-").map(Number);if(!y)return null;const t=new Date();t.setHours(0,0,0,0);return Math.round((new Date(y,m-1,d)-t)/864e5);}
function mtVal(g){if(g.quest)return mtWeekCount(g.quest);const gp=(prog.gp||{})[g.id]||0;return Math.max(0,(Number(g.n)||0)+gp);}
function mtEl(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function mtBox(){let box=$("mtBox");if(box)return box;const pn=$("crPanel");if(!pn)return null;
  box=mtEl("div","mtbox");box.id="mtBox";const ref=pn.querySelector(".qhead+.sm.muted")||pn.querySelector(".qhead");ref.after(box);return box;}
function mtRender(){if(typeof crOn==="function"&&!crOn())return;const box=mtBox();if(!box)return;box.textContent="";
  const goals=(cfg&&Array.isArray(cfg.goals))?cfg.goals.filter(g=>g&&g.t):[];
  // 1) metas
  box.append(mtEl("h3","crh","🎯 Metas"));
  if(!goals.length){box.append(mtEl("div","sm muted","Nenhuma meta na planilha ainda. A EVA coloca em goals."));}
  const sorted=goals.slice().sort((a,b)=>{const da=mtDays(a.due),db=mtDays(b.due);return (da==null?9e9:da)-(db==null?9e9:db);});
  for(const g of sorted){const v=mtVal(g),of=Math.max(1,Number(g.of)||1),done=v>=of,dd=mtDays(g.due);
    const row=mtEl("div","mtgoal"+(done?" ok":dd!=null&&dd<0?" late":dd!=null&&dd<=3?" hot":""));row.dataset.id=g.id||"";
    const top=mtEl("div","mttop");top.append(mtEl("b",null,g.t));
    top.append(mtEl("span","mono sm mtdue",done?"✓ batida":dd==null?(g.quest?"esta semana":""):dd<0?"prazo passou":dd===0?"é hoje":dd===1?"amanhã":"faltam "+dd+" dias"));
    row.append(top);
    const bar=mtEl("div","bar");const i=mtEl("i");i.style.width=Math.min(100,v/of*100)+"%";bar.append(i);row.append(bar);
    const ft=mtEl("div","mtft");ft.append(mtEl("span","sm mono",v+" de "+of+(g.unit?" "+g.unit:"")));
    if(!g.quest&&g.id){const bx=mtEl("span","mtbtns");for(const [lab,d] of [["−1",-1],["+1",1]]){const b=mtEl("button",null,lab);b.type="button";b.setAttribute("aria-label",(d>0?"Somar 1 em ":"Tirar 1 de ")+g.t);
        b.addEventListener("click",()=>{prog.gp=prog.gp||{};const nv=(prog.gp[g.id]||0)+d;if((Number(g.n)||0)+nv<0)return;prog.gp[g.id]=nv;save();mtRender();if(d>0&&mtVal(g)>=of)toast("Meta batida: "+g.t);});bx.append(b);}ft.append(bx);}
    row.append(ft);box.append(row);}
  // 2) plano de hoje
  const qs=(typeof todaysQuests==="function"?todaysQuests():[]).filter(q=>q&&q.id&&!/^q_checkin$/.test(q.id));
  const tk=todayKey(),log=(prog.log||{})[tk]||[],isD=q=>log.some(e=>e.q===q.id);
  const fd=qs.filter(isD).length;
  const h=mtEl("h3","crh","📋 Plano de hoje · "+fd+" de "+qs.length);box.append(h);
  const pend=qs.filter(q=>!isD(q)).sort((a,b)=>(b.main?1:0)-(a.main?1:0)||(b.xp||0)-(a.xp||0));
  if(!qs.length)box.append(mtEl("div","sm muted","Sem tarefas para hoje na planilha."));
  else if(!pend.length)box.append(mtEl("div","sm mtall","Tudo feito hoje. Fecha o dia e descansa."));
  else{const ul=mtEl("ul","mtlist");for(const q of pend.slice(0,8)){const li=mtEl("li");li.append(mtEl("span",null,(q.main?"★ ":"")+q.title));li.append(mtEl("span","sm mono muted"," +"+(q.xp||0)));ul.append(li);}box.append(ul);
    if(pend.length>8)box.append(mtEl("div","sm muted","e mais "+(pend.length-8)+"."));
    const go=mtEl("button","go","Ir para a próxima");go.type="button";go.addEventListener("click",()=>{const t=document.querySelector('#tabbar [data-go="hoje"]');if(t)t.click();});const r=mtEl("div","row");r.append(go);box.append(r);}
  // 3) prioridades da semana
  const fo=(cfg&&Array.isArray(cfg.focus))?cfg.focus.filter(x=>typeof x==="string"&&x.trim()):[];
  if(fo.length){box.append(mtEl("h3","crh","🧭 Prioridade da semana"));const ol=mtEl("ol","mtlist");for(const x of fo.slice(0,5))ol.append(mtEl("li",null,x));box.append(ol);}}
{const tb=document.querySelector('#tabbar [data-go="criador"]');if(tb)tb.addEventListener("click",mtRender);}
{const _mr=render;render=function(){_mr.apply(this,arguments);try{if(typeof crOn==="function"&&crOn())mtRender();}catch(e){}};}
