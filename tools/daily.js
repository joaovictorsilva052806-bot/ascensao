// ---------- Ranking do dia + rival do dia + avisos (etapa 2 do ranking) ----------
// Sem servidor novo e sem dado novo saindo do celular: o XP de hoje dos outros vem da diferença entre o XP da semana
// que a lista pública mostra agora e o que este aparelho viu ontem (ou na 1ª abertura de hoje). O seu é exato (log local).
// Guarda só neste aparelho, em chave separada (asc-u-dia), fora do progresso: {d,base,ex,bt,last,ld,pos,ntf,nt}.
const DY_KEY="asc-u-dia";
function dySt(){let s={};try{s=JSON.parse(localStorage.getItem(DY_KEY)||"{}")||{};}catch(e){s={};}s.base=s.base||{};s.last=s.last||{};s.pos=s.pos||{};s.nt=s.nt||{};return s;}
function dySave(s){try{localStorage.setItem(DY_KEY,JSON.stringify(s));}catch(e){}}
const dyN=v=>String(v||"").trim().toLowerCase();
function dyYest(k){const [y,m,d]=k.split("-").map(Number);const t=new Date(y,m-1,d);t.setDate(t.getDate()-1);return dkey(t);}
function dyMyXP(){const tk=todayKey();let s=0;for(const e of (prog.log[tk]||[]))s+=(e.xp||0)+(e.bonus||0);return s;}
// virada do dia e foto da lista: chamada a cada carga do ranking
function dyRoll(){if(!rankRows)return dySt();const s=dySt();const td=todayKey(),ws=weekStart(td);const cur={};for(const r of rankRows)cur[dyN(r.n)]=r.xp||0;
  if(s.d!==td){const now=new Date().toTimeString().slice(0,5);
    if(td===ws&&!(s.ld===td)){s.base={};s.ex=true;s.bt="";}                       // segunda: a semana zerou, XP da semana = XP de hoje
    else if(s.ld===dyYest(td)&&weekStart(s.ld)===ws){s.base=s.last||{};s.ex=true;s.bt="";} // viu a lista ontem: conta exato
    else{s.base=cur;s.ex=false;s.bt=now;}                                          // sem foto de ontem: conta a partir de agora
    s.d=td;s.pos={};s.up={};for(const k in s.nt)if(s.nt[k]!==td)delete s.nt[k];}
  s.last=cur;s.ld=td;dySave(s);return s;}
// lista de hoje (você + todos do ranking), maior XP de hoje primeiro
function dyBoard(){const s=dySt();const me=rankName()||"Você";const mx=dyMyXP();const out=[];
  for(const r of (rankRows||[])){if(dyN(r.n)===dyN(me))continue;const b=s.d===todayKey()?(s.base[dyN(r.n)]||0):(r.xp||0);out.push(Object.assign({},r,{xp:Math.max(0,(r.xp||0)-b),wk:r.xp}));}
  out.push({n:me,xp:mx,me:true});
  return out.sort((a,b)=>(b.xp||0)-(a.xp||0)||(a.me?-1:b.me?1:0));}
// rival do dia: quem está logo acima de você hoje (ou logo abaixo, se você lidera)
function dyRival(){if(!(prog.rank&&prog.rank.on)||!rankRows||!rankRows.length)return null;const L=dyBoard();const i=L.findIndex(r=>r.me);if(i<0)return null;const my=L[i].xp||0;
  if(i===0){const b=L[1];if(!b)return null;return {pos:1,n:b.n,txt:b.xp>0?"Você lidera o dia, "+(my-b.xp)+" XP à frente de "+b.n+".":"Você lidera o dia. Ninguém pontuou hoje ainda."};}
  const a=L[i-1];const gap=(a.xp||0)-my+1;const zp=typeof ZAP_XP!=="undefined"?ZAP_XP:10;const nz=Math.ceil(gap/zp);
  return {pos:i+1,n:a.n,gap,txt:"⚔️ Rival do dia: "+a.n+" ("+a.xp+" XP hoje) · faltam "+gap+" XP"+(typeof zapToday==="function"?" ("+nz+" desafio"+(nz>1?"s":"")+")":"")};}
function dyNote(){const s=dySt();if(s.d!==todayKey()||s.ex)return "";return s.bt?"Os outros contam desde as "+s.bt+" (quando o app abriu hoje). O seu é exato.":"";}
// animação de subida: guarda sua posição por lista; se melhorou, a sua linha sobe até o lugar novo
function dyRM(){return matchMedia("(prefers-reduced-motion: reduce)").matches;}
function dyClimb(ol,view){if(!ol)return;const li=ol.querySelector("li.me");if(!li||!li.getClientRects().length||!rankRows)return;
  const items=[...ol.children].filter(x=>!x.classList.contains("tmzone"));const pos=items.indexOf(li)+1;if(pos<1)return;
  const s=dySt();const prev=+s.pos[view]||0;s.pos[view]=pos;s.up=s.up||{};const now=Date.now();let up=0,anim=true;
  if(prev&&pos<prev){up=prev-pos;s.up[view]={n:up,t:now};}
  else{const u=s.up[view];if(u&&now-u.t<6000&&pos<=prev){up=u.n;anim=now-u.t<1000;}}   // a lista foi redesenhada logo depois: mantém o selo
  dySave(s);if(!up)return;
  const bd=document.createElement("span");bd.className="dyup";bd.textContent="▲ "+up;bd.setAttribute("aria-label","Subiu "+up+" posição"+(up>1?"ões":""));li.append(bd);
  if(prev&&pos<prev){try{haptic([12,40,12]);}catch(e){}}
  if(!anim||dyRM()||!li.animate)return;const h=li.getBoundingClientRect().height+6;
  li.style.zIndex="2";
  const a=li.animate([{transform:"translateY("+(up*h)+"px)",boxShadow:"0 0 0 2px var(--good)"},{transform:"translateY(0)",boxShadow:"0 0 18px rgba(77,255,170,.45)"},{transform:"none",boxShadow:"none"}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"});
  a.onfinish=()=>{li.style.zIndex="";};}
// ---- avisos locais (só se a pessoa ligar): alguém te passou hoje / à noite, se faltar desafio ----
const dyCanNtf=()=>"Notification" in window;
function dyNtfOn(){return !!dySt().ntf&&dyCanNtf()&&Notification.permission==="granted";}
function dyShow(kind,title,body){const s=dySt();const td=todayKey();if(s.nt[kind]===td)return false;s.nt[kind]=td;dySave(s);
  if(!document.hidden){toast(title+" "+body);return true;}
  if(!dyNtfOn())return false;
  const ic=location.pathname.replace(/(comecar\/)?[^/]*$/,"")+"icon-192.png";const o={body,icon:ic,badge:ic,tag:"asc-"+kind,lang:"pt-BR"};
  try{if(navigator.serviceWorker&&navigator.serviceWorker.controller){navigator.serviceWorker.ready.then(r=>r.showNotification(title,o)).catch(()=>{});}else new Notification(title,o);}catch(e){}return true;}
async function dyNtfToggle(){const s=dySt();if(s.ntf){s.ntf=0;dySave(s);toast("Avisos desligados.");dyNtfUI();return;}
  if(!dyCanNtf()){toast(IOS?"No iPhone, os avisos só funcionam com o app instalado na tela de início.":"Este navegador não mostra avisos.");return;}
  let p=Notification.permission;try{if(p==="default")p=await Notification.requestPermission();}catch(e){}
  if(p!=="granted"){toast("Sem permissão para avisos. Dá para liberar nas configurações do navegador.");dyNtfUI();return;}
  s.ntf=1;dySave(s);toast("🔔 Avisos ligados: quando alguém te passar hoje"+(typeof zapToday==="function"?" e às 20h, se faltar desafio.":"."));dyNtfUI();}
function dyNtfUI(){for(const b of document.querySelectorAll(".dyntf")){const on=!!dySt().ntf&&dyCanNtf()&&Notification.permission==="granted";b.textContent=on?"🔔 Avisos ligados":"🔕 Me avise quando alguém me passar";b.setAttribute("aria-pressed",on?"true":"false");}}
function dyNtfBtn(){const b=document.createElement("button");b.type="button";b.className="link dyntf";b.addEventListener("click",dyNtfToggle);setTimeout(dyNtfUI,0);return b;}
function dyEvening(){if(typeof zapToday!=="function"||!cfg||cfg.blank||!dySt().ntf||new Date().getHours()<20)return;
  const left=zapToday().filter(z=>!zapDone(z.id)).length;if(!left)return;
  dyShow("noite","⚡ Ascension",(left>1?"Faltam ":"Falta ")+left+" desafio"+(left>1?"s":"")+" relâmpago hoje. "+(left*10)+" XP te esperando.");}
// a cada carga do ranking: virada do dia, ultrapassagem e posição na pílula
function dyAfterLoad(){if(!(prog.rank&&prog.rank.on)||!rankRows)return;const before=dySt();const was=before.d===todayKey()?+before.pos.rnow||0:0;dyRoll();
  const L=dyBoard();const i=L.findIndex(r=>r.me);if(i<0)return;const pos=i+1;const s=dySt();s.pos.rnow=pos;dySave(s);
  if(was&&pos>was){const a=L[i-1];if(a)dyShow("passou","⚔️ "+a.n+" te passou hoje.","Faltam "+((a.xp||0)-(L[i].xp||0)+1)+" XP para retomar o "+(pos-1)+"º lugar do dia.");}
  dyEvening();}
{const _rr=renderRankUI;renderRankUI=function(){_rr();try{dyAfterLoad();}catch(e){}};}
// com o aviso ligado e o app em segundo plano, confere de vez em quando (o celular pode segurar quando o app está fechado)
setInterval(()=>{try{if(document.hidden&&dySt().ntf){if(typeof loadRank==="function")loadRank();dyEvening();}}catch(e){}},15*60*1000);
document.addEventListener("visibilitychange",()=>{try{if(!document.hidden)dyEvening();}catch(e){}});
setTimeout(()=>{try{dyEvening();}catch(e){}},4000);
