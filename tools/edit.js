// ---------- Editar tarefas no app (sem refazer o perfil) ----------
let edCur=null;const ED_DN=["seg","ter","qua","qui","sex","sáb","dom"];
function edSave(){try{localStorage.setItem("asc-u-cfg",JSON.stringify(cfg));}catch(e){}}
function renderEd(){const box=$("edList");if(!box)return;box.textContent="";const Q=((cfg&&cfg.quests)||[]);
  if(!Q.length){const d=document.createElement("div");d.className="sm muted";d.textContent="Nenhuma tarefa ainda.";box.append(d);return;}
  for(const q of Q){const b=document.createElement("button");b.type="button";if(q.main)b.className="m";b.textContent=(q.main?"★ ":"")+q.title;
    const s=document.createElement("small");s.textContent=[q.xp+" XP",q.once?"uma vez":q.days?q.days.map(d=>ED_DN[d]).join(", "):"todo dia",q.ifThen||""].filter(Boolean).join(" · ");b.append(s);
    b.addEventListener("click",()=>edOpen(q.id));box.append(b);}}
function edOpen(id){const q=id?(cfg.quests||[]).find(x=>x.id===id):{title:"",xp:15,stat:"foco"};if(!q)return;edCur=id||null;
  $("edTitle").value=q.title||"";$("edMin").value=q.minTitle||"";$("edIf").value=q.ifThen||"";$("edXp").value=String([10,15,20,25,30,40].reduce((a,v)=>Math.abs(v-(q.xp||15))<Math.abs(a-(q.xp||15))?v:a,15));
  $("edStat").value=q.stat||"foco";$("edMain").checked=!!q.main;$("edMain").disabled=!!q.once;
  toggles("edDays",ED_DN.map((l,i)=>[String(i),l]),(q.days||[0,1,2,3,4,5,6]).map(String));$("edDays").hidden=!!q.once;
  edSlotUI(q.slot||"");
  $("edDel").hidden=!id;$("edDel").textContent="Apagar";$("edDel").dataset.arm="";$("edForm").hidden=false;$("edList").hidden=true;$("edTitle").focus();}
function edClose(){$("edForm").hidden=true;$("edList").hidden=false;edCur=null;renderEd();}
// período (tools/slot.js): 1 escolha; "Automático" segue o "Quando fazer"
function edSlotUI(v){const box=$("edSlot");box.textContent="";for(const [k,l] of [["","Automático"],["manha","Manhã"],["tarde","Tarde"],["noite","Noite"],["livre","Qualquer hora"]]){const b=document.createElement("button");b.type="button";b.textContent=l;b.dataset.v=k;
  const on=k===v;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on?"true":"false");b.addEventListener("click",()=>edSlotUI(k));box.append(b);}}
function edSlotVal(){const b=$("edSlot").querySelector(".on");return b?b.dataset.v:"";}
$("edNew").addEventListener("click",()=>edOpen(null));$("edCancel").addEventListener("click",edClose);
$("edForm").addEventListener("submit",ev=>{ev.preventDefault();const t=$("edTitle").value.trim();if(!t)return;
  let full=false;const Q=(cfg.quests||[]).slice();let q=edCur?Q.find(x=>x.id===edCur):null;const wasMain=!!(q&&q.main);
  if(!q){q={id:"u"+Date.now().toString(36)};Q.push(q);}
  q.title=t;const mt=$("edMin").value.trim(),it=$("edIf").value.trim();if(mt)q.minTitle=mt;else delete q.minTitle;if(it)q.ifThen=it;else delete q.ifThen;
  q.xp=Number($("edXp").value)||15;q.stat=$("edStat").value;const sl=edSlotVal();if(sl)q.slot=sl;else delete q.slot;
  if(!q.once){const days=picked("edDays").map(Number).sort();if(!days.length){toast("Escolha pelo menos um dia.");return;}if(days.length<7)q.days=days;else delete q.days;
    let main=$("edMain").checked;if(main&&!wasMain&&Q.filter(x=>x.main&&x!==q).length>=3){full=true;main=false;}if(main)q.main=true;else delete q.main;
    // mudou quem é principal: a contagem de dívida recomeça hoje, para não cobrar o passado
    if(main!==wasMain)cfg.startDate=todayKey();}
  cfg=Object.assign({},cfg,{quests:Q,blank:false});edSave();save();edClose();render();toast(full?"Salva como extra: já tem 3 principais.":"Tarefa salva.");});
$("edDel").addEventListener("click",()=>{const b=$("edDel");if(!edCur)return;if(b.dataset.arm!=="1"){b.dataset.arm="1";b.textContent="Toque de novo para apagar";return;}
  const q=(cfg.quests||[]).find(x=>x.id===edCur);cfg=Object.assign({},cfg,{quests:(cfg.quests||[]).filter(x=>x.id!==edCur)});if(q&&q.main)cfg.startDate=todayKey();
  edSave();save();edClose();render();toast("Tarefa apagada. Os pontos que ela deu continuam.");});
// ---------- Ajuste automático: principal que ficou para trás 3 vezes em 5 dias ----------
function adjFind(){if(!cfg||cfg.blank)return null;const sn=(prog.adj||{});const now=todayKey();
  for(const q of (cfg.quests||[]).filter(q=>q.main&&q.id!=="s_fech")){if(sn[q.id]&&sn[q.id]>now)continue;let elig=0,miss=0;
    for(let i=1;i<=7&&elig<5;i++){const d=new Date();d.setDate(d.getDate()-i);const k=dkey(d);if(cfg.startDate&&k<cfg.startDate)break;const dow=(d.getDay()+6)%7;
      if(q.days&&!q.days.includes(dow))continue;if(isRest(k))continue;elig++;if(!(prog.log[k]||[]).some(e=>e.q===q.id))miss++;}
    if(elig>=3&&miss>=3)return {q,miss,elig};}return null;}
let adjQ=null;
function renderAdj(){const f=adjFind();adjQ=f&&f.q;$("adjCard").hidden=!f;if(!f)return;
  $("adjText").textContent="\""+f.q.title+"\" ficou para trás "+f.miss+" vezes nos últimos "+f.elig+" dias. Normal: talvez esteja grande demais ou no horário errado. "+(f.q.minTitle?"Mais leve = a meta passa a ser \""+f.q.minTitle+"\".":"Mais leve = metade do tempo e dos pontos.");}
function adjSnooze(id,days){prog.adj=prog.adj||{};const d=new Date();d.setDate(d.getDate()+days);prog.adj[id]=dkey(d);save();}
$("adjLight").addEventListener("click",()=>{const q=adjQ&&(cfg.quests||[]).find(x=>x.id===adjQ.id);if(!q)return;
  if(q.minTitle){q.title=q.minTitle.charAt(0).toUpperCase()+q.minTitle.slice(1);delete q.minTitle;}else q.title=q.title+" (versão curta)";q.xp=Math.max(10,Math.round(q.xp/2/5)*5);
  edSave();adjSnooze(q.id,7);render();toast("Pronto: ficou mais leve. Constância primeiro, tamanho depois.");});
$("adjUnmain").addEventListener("click",()=>{const q=adjQ&&(cfg.quests||[]).find(x=>x.id===adjQ.id);if(!q)return;delete q.main;cfg.startDate=todayKey();edSave();adjSnooze(q.id,7);render();toast("Agora ela é extra: sem dívida se ficar para depois.");});
$("adjNo").addEventListener("click",()=>{if(adjQ)adjSnooze(adjQ.id,7);$("adjCard").hidden=true;});
