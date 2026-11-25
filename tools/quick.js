// ---------- Começo em modo jogo: 4 toques, quase nada para ler. O formulário completo continua em "montar com detalhes". ----------
const Q_ICON={kid:"🧒",teen:"🎮",young:"⚡",adult:"💼",senior:"🌳",escola:"🎒",estudante:"🎓",clt:"🏢",autonomo:"🚀",casa:"🏠",motorista:"🚚",aposentado:"☕",outro:"✨"};
const Q_FOC_ICON={estudos:"📚",sono:"😴",corpo:"💪",carreira:"📈",dinheiro:"💰",relac:"❤️",casa:"🧹",remedio:"💊",agua:"💧",tela:"📵",leitura:"📖"};
let qStep=0,qData={};
function qGo(n){qStep=n;for(const s of document.querySelectorAll("#quick .qstep"))s.hidden=+s.dataset.s!==n;$("qBar").style.width=(n/4*100)+"%";$("q_full").hidden=n>=4;
  if(n===0)setTimeout(()=>$("q_name").focus(),120);if(n===3)qFocus();try{if(navigator.vibrate)navigator.vibrate(8);}catch(e){}}
function qBtns(id,items,cb){const box=$(id);box.textContent="";for(const [v,l] of items){const b=document.createElement("button");b.type="button";b.textContent=(Q_ICON[v]||Q_FOC_ICON[v]||"")+" "+l;b.dataset.v=v;b.addEventListener("click",()=>cb(v,b));box.append(b);}}
function qFocus(){const minor=qData.age==="kid"||qData.age==="teen";const pref=(OCC_SET[qData.occ]||{}).focus||[];
  const order=FOCI.map(x=>x[0]).sort((a,b)=>(pref.includes(b)-pref.includes(a)));const list=order.map(v=>FOCI.find(x=>x[0]===v)).filter(x=>!(minor&&(x[0]==="remedio"||x[0]==="carreira"))).slice(0,8);
  qBtns("q_focus",list,(v,b)=>{const on=[...$("q_focus").querySelectorAll(".on")];if(!b.classList.contains("on")&&on.length>=3){on[0].classList.remove("on");}b.classList.toggle("on");});
  for(const b of $("q_focus").children)if(pref.slice(0,2).includes(b.dataset.v))b.classList.add("on");
  $("q_goal").placeholder=minor?"Escreva a sua (ex.: tirar 8 em matemática)":"Escreva a sua (ex.: arrumar um emprego melhor)";}
function qPermSeen(){try{return !!localStorage.getItem("asc-u-perm");}catch(e){return true;}}
function openQuick(){qData={};$("q_name").value="";$("q_goal").value="";$("quick").hidden=false;$("onb").hidden=true;document.body.classList.add("onboarding");
  if(qPermSeen()){$("qPerm").hidden=true;qGo(0);return;}
  for(const s of document.querySelectorAll("#quick .qstep"))s.hidden=s.id!=="qPerm";$("qBar").style.width="0%";$("q_full").hidden=true;}
// Primeira abertura: pede só a permissão que o app usa de verdade (armazenamento persistente), depois a configuração.
$("q_perm").addEventListener("click",async()=>{let ok=false;try{if(navigator.storage&&navigator.storage.persist)ok=await navigator.storage.persist();}catch(e){}
  try{localStorage.setItem("asc-u-perm",ok?"granted":"asked");}catch(e){}$("qPerm").hidden=true;
  if(qAfterPerm){const f=qAfterPerm;qAfterPerm=null;$("quick").hidden=true;f();return;}qGo(0);});
// Igual app de loja: na 1ª abertura a permissão vem antes de tudo (até da apresentação).
let qAfterPerm=null;
{const _showIntro=showIntro;showIntro=function(only){if(!only&&!qPermSeen()&&!(cfg&&!cfg.blank)){qAfterPerm=()=>_showIntro(false);openQuick();return;}return _showIntro(only);};}
function qNameNext(){const n=$("q_name").value.trim();if(!n){$("q_name").focus();$("q_name").classList.add("shake");setTimeout(()=>$("q_name").classList.remove("shake"),400);return;}qData.name=n;qGo(1);}
$("q_n0").addEventListener("click",qNameNext);$("q_name").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();qNameNext();}});
qBtns("q_age",AGE,v=>{qData.age=v;qGo(2);});
qBtns("q_occ",OCC,v=>{qData.occ=v;qGo(3);});
$("q_done").addEventListener("click",()=>{qData.focus=[...$("q_focus").querySelectorAll(".on")].map(b=>b.dataset.v);qData.goal=$("q_goal").value.trim().replace(/[<>]/g,"").slice(0,60);
  if(!qData.focus.length&&!qData.goal){$("q_goal").focus();return;}
  qGo(4);const msgs=["Lendo sua rotina…","Calibrando dificuldade…","Gerando missões…"];let i=0;const t=setInterval(()=>{i++;if(msgs[i])$("q_load").textContent=msgs[i];},450);
  setTimeout(()=>{clearInterval(t);
    $("o_name").value=qData.name;pickAge(qData.age,true);pickOcc(qData.occ,true);
    const foc=qData.focus.length?qData.focus:((OCC_SET[qData.occ]||{}).focus||["sono"]).slice(0,2);for(const b of $("o_focus").children)b.classList.toggle("on",foc.includes(b.dataset.v));
    $("o_goal").value=qData.goal||"";if($("o_ping"))$("o_ping").checked=false;
    $("quick").hidden=true;$("o_go").click();},1400);});
$("q_full").addEventListener("click",()=>{$("quick").hidden=true;$("onb").hidden=false;if(qData.name)$("o_name").value=qData.name;if(qData.age)pickAge(qData.age,true);if(qData.occ)pickOcc(qData.occ,true);window.scrollTo(0,0);});
$("q_bk").addEventListener("click",()=>{$("q_full").click();const d=$("o_bkBox");if(d){d.open=true;setTimeout(()=>d.scrollIntoView({block:"center"}),60);}});
