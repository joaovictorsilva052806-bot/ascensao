// Ranking no app do criador (mesmo canal dos testadores). Copiado de tools/fb.js: mantenha os dois iguais.
// ---------- Ranking semanal (opcional): só 1º nome, tipo de celular, nível e XP da semana ----------
const RK_POST="https://docs.google.com/forms/d/e/1FAIpQLSeupI0e9q5NvzLgusfgD1CNKN7hGBx91xGD1jkEl1z2uxPUuw/formResponse";
const RK_CSV="https://docs.google.com/spreadsheets/d/e/2PACX-1vTyr0ZbAqlFWbOWEZXpjcRPXPE04u9EfktPhrq5Mf_vnQ2YjeVEARfhqGrrpqVXxkIVsvnE_x8DMdpr/pub?gid=1002&single=true&output=csv";
const firstName=()=>String((cfg&&cfg.name)||"").trim().split(/\s+/)[0].replace(/[|,;"<>]/g,"").slice(0,20)||"Anônimo";
const ageNow=()=>(cfg&&cfg.profile&&cfg.profile.age)||"";const UA=navigator.userAgent,IOS=/iphone|ipad|ipod/i.test(UA),AND=/android/i.test(UA);
const isMinor=()=>ageNow()==="kid"||ageNow()==="teen";
const cleanNick=v=>String(v||"").trim().replace(/[|,;"<>]/g,"").replace(/\s+/g," ").slice(0,16);
// Nome que vai para o ranking: o apelido, se houver; senão o 1º nome (só para maiores de 18)
const rankName=()=>cleanNick(prog.rank&&prog.rank.nick)||(isMinor()?"":firstName());
function weekXP(ws){ws=ws||weekStart(todayKey());let s=0;for(const e of entries())if(weekStart(e.date)===ws)s+=(e.xp||0)+(e.bonus||0);return s;}
function sendRank(ev,force){const r=prog.rank;if(!r||!r.on)return;const xp=weekXP(),ws=weekStart(todayKey()).replace(/-/g,"");
  if(!force&&r.lastXp===xp&&r.lastWk===ws)return;
  const dev=isMinor()?"-":IOS?"iPhone":AND?"Android":"Computador";if(!rankName())return;
  const v=["R",r.uid,rankName(),dev,ws,xp,levelOf(totalXP()),ev].join("|");
  try{fetch(RK_POST,{method:"POST",mode:"no-cors",keepalive:true,body:new URLSearchParams({"entry.807978446":v})}).catch(()=>{});}catch(e){}
  r.lastXp=xp;r.lastWk=ws;r.last=new Date().toISOString();save();}
function joinRank(ev){if(ageNow()==="kid"){toast("O ranking é a partir de 14 anos.");return;}
  if(isMinor()&&!cleanNick(prog.rank&&prog.rank.nick)){const n=cleanNick($("rkNick").value);if(!n){goTab("prog");$("rkNote").textContent="Escolha um apelido primeiro (não use seu nome real).";setTimeout(()=>$("rkNick").focus(),60);return;}prog.rank=Object.assign(prog.rank||{},{nick:n});}prog.rank=Object.assign({uid:Math.random().toString(36).slice(2,10)},prog.rank||{},{on:true,asked:true});sendRank(ev||"entrou",true);loadRank();renderRankUI();}
function leaveRank(){prog.rank=Object.assign(prog.rank||{},{on:false,asked:true});save();renderRankUI();toast("Você saiu do ranking. Seu nome some na próxima semana.");}
let rankRows=null;
async function loadRank(){try{const t=await (await fetch(RK_CSV+"&t="+Date.now(),{credentials:"omit"})).text();
  rankRows=t.trim().split(/\r?\n/).slice(1).map(l=>l.split(",")).filter(r=>r[0]&&r[0]!=="nome").map(r=>({n:r[0],xp:+r[1]||0,lv:+r[2]||1}));}catch(e){rankRows=rankRows||null;}renderRankUI();}
function renderRankUI(){const on=!!(prog.rank&&prog.rank.on);const asked=!!(prog.rank&&prog.rank.asked)||!!(prog.ping&&prog.ping.asked&&prog.rank);
  const kid=ageNow()==="kid";$("rkJoin").hidden=on||kid;$("rkLeave").hidden=!on;$("rkNickRow").hidden=kid;
  const nk=$("rkNick");if(document.activeElement!==nk)nk.value=(prog.rank&&prog.rank.nick)||"";nk.placeholder=isMinor()?"Apelido (não use seu nome real)":"Apelido no ranking (opcional)";
  $("rkNote").textContent=kid?"O ranking é a partir de 14 anos. Seu progresso continua só no seu celular.":isMinor()?"Entrar é opcional. No ranking aparece só o seu apelido e o XP da semana. Nenhum nome, tarefa ou horário sai do seu celular.":"Entrar é opcional. Aparece seu primeiro nome (ou o apelido) e o XP da semana, e qualquer pessoa com o app vê a lista.";
  const ol=$("rkList");ol.textContent="";
  if(!rankRows){const li=document.createElement("li");li.className="muted";li.textContent="Carregando…";ol.append(li);return;}
  if(!rankRows.length){const li=document.createElement("li");li.className="muted";li.textContent="Ninguém pontuou ainda nesta semana. Seja o primeiro.";ol.append(li);return;}
  const me=on?rankName():null;
  rankRows.forEach((r,i)=>{const li=document.createElement("li");if(me&&r.n===me)li.className="me";
    const p=document.createElement("b");p.textContent=(i<3?["🥇","🥈","🥉"][i]:"#"+(i+1));
    const n=document.createElement("span");n.textContent=r.n+" · nv "+r.lv;const x=document.createElement("i");x.textContent=r.xp+" XP";li.append(p,n,x);ol.append(li);});}
$("rkJoin").addEventListener("click",()=>{joinRank("entrou");toast("Você está no ranking da semana!");});
$("rkLeave").addEventListener("click",leaveRank);
$("rkNickSave").addEventListener("click",()=>{const n=cleanNick($("rkNick").value);prog.rank=Object.assign(prog.rank||{asked:true,on:false},{nick:n});save();if(prog.rank.on)sendRank("apelido",true);renderRankUI();toast(n?"Apelido salvo: "+n:"Apelido apagado.");});
for(const b of document.querySelectorAll('#tabbar [data-go="prog"]'))b.addEventListener("click",loadRank);
document.addEventListener("visibilitychange",()=>{if(document.hidden)sendRank("uso");});
setTimeout(()=>{sendRank("abriu");loadRank();},0);

