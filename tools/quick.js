// ---------- Começo em modo jogo: 4 toques, quase nada para ler. O formulário completo continua em "montar com detalhes". ----------
const Q_ICON={kid:"🧒",teen:"🎮",young:"⚡",adult:"💼",senior:"🌳",escola:"🎒",estudante:"🎓",clt:"🏢",autonomo:"🚀",casa:"🏠",motorista:"🚚",aposentado:"☕",outro:"✨"};
const Q_FOC_ICON={estudos:"📚",sono:"😴",corpo:"💪",carreira:"📈",dinheiro:"💰",relac:"❤️",casa:"🧹",remedio:"💊",agua:"💧",tela:"📵",leitura:"📖"};
let qStep=0,qData={};
function qGo(n){qStep=n;for(const s of document.querySelectorAll("#quick .qstep"))s.hidden=+s.dataset.s!==n;$("qBar").style.width=(n/4*100)+"%";$("qSync").textContent=n<4?"SINCRONIA "+Math.round(n/4*100)+"%":"SINCRONIA 100%";qHead();$("q_full").hidden=n>=4;
  if(n===0)setTimeout(()=>$("q_name").focus(),120);if(n===3)qFocus();try{if(navigator.vibrate)navigator.vibrate(8);}catch(e){}}
function qBtns(id,items,cb){const box=$(id);box.textContent="";for(const [v,l] of items){const b=document.createElement("button");b.type="button";b.textContent=(Q_ICON[v]||Q_FOC_ICON[v]||"")+" "+l;b.dataset.v=v;b.addEventListener("click",()=>cb(v,b));box.append(b);}}
function qFocus(){const minor=qData.age==="kid"||qData.age==="teen";const pref=(OCC_SET[qData.occ]||{}).focus||[];
  const order=FOCI.map(x=>x[0]).sort((a,b)=>(pref.includes(b)-pref.includes(a)));const list=order.map(v=>FOCI.find(x=>x[0]===v)).filter(x=>!(minor&&(x[0]==="remedio"||x[0]==="carreira"))).slice(0,8);
  qBtns("q_focus",list,(v,b)=>{const on=[...$("q_focus").querySelectorAll(".on")];if(!b.classList.contains("on")&&on.length>=3){on[0].classList.remove("on");}b.classList.toggle("on");});
  for(const b of $("q_focus").children)if(pref.slice(0,2).includes(b.dataset.v))b.classList.add("on");
  $("q_goal").placeholder=minor?"Ou escreva a sua (ex.: passar de ano)":"Ou escreva a sua (ex.: emprego novo)";}
function qPermSeen(){try{return !!localStorage.getItem("asc-u-perm");}catch(e){return true;}}
const Q_RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
function qHead(){const n=qData.name?qData.name.split(" ")[0]:"";$("q_h1").textContent=n?n+", quantos anos você tem?":"Quantos anos você tem?";
  $("q_h2").textContent="O que você faz no dia a dia?";$("q_h3").textContent=n?"Onde você quer evoluir, "+n+"?":"No que você quer evoluir?";}
// Despertar: a 1ª tela do app. Um toque aceita a única permissão que o app usa e já começa.
function qAwake(){const box=$("qType"),L=["Sinal confirmado.","Jogador detectado.","Pronto para despertar?"];box.textContent="";$("qWake").classList.remove("on");
  if(Q_RM){box.innerHTML=L.map(x=>"<p>"+x+"</p>").join("");$("qWake").classList.add("on");return;}
  let i=0;(function line(){if(i>=L.length||$("qPerm").hidden){$("qWake").classList.add("on");return;}const p=document.createElement("p");p.className="cur";box.append(p);let n=0;
    const t=setInterval(()=>{n++;p.textContent=L[i].slice(0,n);if(n>=L[i].length){clearInterval(t);p.className="";i++;setTimeout(line,320);}},38);})();}
function openQuick(){qData={};$("q_name").value="";$("q_goal").value="";$("quick").hidden=false;$("onb").hidden=true;$("intro").hidden=true;document.body.classList.add("onboarding");
  if(qPermSeen()){$("qPerm").hidden=true;$("quick").classList.remove("waking");qGo(0);return;}
  for(const s of document.querySelectorAll("#quick .qstep"))s.hidden=s.id!=="qPerm";$("quick").classList.add("waking");$("q_full").hidden=true;qAwake();}
// pular a digitação com um toque na tela
$("qPerm").addEventListener("click",e=>{if(e.target.closest("button"))return;const b=$("qType");b.innerHTML="<p>Sinal confirmado.</p><p>Jogador detectado.</p><p>Pronto para despertar?</p>";$("qWake").classList.add("on");});
$("q_perm").addEventListener("click",async()=>{let ok=false;try{if(navigator.storage&&navigator.storage.persist)ok=await navigator.storage.persist();}catch(e){}
  try{localStorage.setItem("asc-u-perm",ok?"granted":"asked");localStorage.setItem("asc-u-intro","1");}catch(e){}
  try{if(navigator.vibrate)navigator.vibrate([12,60,24]);}catch(e){}
  $("qPerm").hidden=true;$("quick").classList.remove("waking");qGo(0);});
// 1ª abertura: sem slides de apresentação, direto para o jogo (a apresentação continua em Mais).
{const _showIntro=showIntro;showIntro=function(only){if(!only&&!(cfg&&!cfg.blank)){openQuick();return;}return _showIntro(only);};}
function qNameNext(){const n=$("q_name").value.trim();if(!n){$("q_name").focus();$("q_name").classList.add("shake");setTimeout(()=>$("q_name").classList.remove("shake"),400);return;}qData.name=n.replace(/[<>]/g,"").slice(0,24);qGo(1);}
$("q_n0").addEventListener("click",qNameNext);$("q_name").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();qNameNext();}});
qBtns("q_age",AGE,v=>{qData.age=v;qGo(2);});
qBtns("q_occ",OCC,v=>{qData.occ=v;qGo(3);});
$("q_done").addEventListener("click",()=>{qData.focus=[...$("q_focus").querySelectorAll(".on")].map(b=>b.dataset.v);qData.goal=$("q_goal").value.trim().replace(/[<>]/g,"").slice(0,60);
  if(!qData.focus.length&&!qData.goal){$("q_goal").focus();return;}
  qGo(4);const msgs=["Lendo sua rotina…","Calibrando dificuldade…","Forjando suas missões…"];let i=0;const t=setInterval(()=>{i++;if(msgs[i])$("q_load").textContent=msgs[i];},450);
  setTimeout(()=>{clearInterval(t);
    $("o_name").value=qData.name;pickAge(qData.age,true);pickOcc(qData.occ,true);
    const foc=qData.focus.length?qData.focus:((OCC_SET[qData.occ]||{}).focus||["sono"]).slice(0,2);for(const b of $("o_focus").children)b.classList.toggle("on",foc.includes(b.dataset.v));
    $("o_goal").value=qData.goal||"";if($("o_ping"))$("o_ping").checked=false;
    $("quick").hidden=true;$("o_go").click();},1400);});
$("q_full").addEventListener("click",()=>{$("quick").hidden=true;$("onb").hidden=false;if(qData.name)$("o_name").value=qData.name;if(qData.age)pickAge(qData.age,true);if(qData.occ)pickOcc(qData.occ,true);window.scrollTo(0,0);});
$("q_bk").addEventListener("click",()=>{$("q_full").click();const d=$("o_bkBox");if(d){d.open=true;setTimeout(()=>d.scrollIntoView({block:"center"}),60);}});
