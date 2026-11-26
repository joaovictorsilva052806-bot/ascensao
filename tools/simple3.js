// ---------- Modo simples nos 3 primeiros dias (pedido dos testadores: "muita coisa, me senti perdido") ----------
// Dia 1: Hoje mostra só a PRÓXIMA missão + XP. Dia 2 (ou nível 2): todas as tarefas e o check-in. Dia 3 (ou nível 3): desafios relâmpago e o guia. Depois: app completo.
// Só para quem cria o perfil a partir desta versão. Grava só prog.simple {from, seen, off}. "Mostrar tudo" sai na hora.
const S3_UNLOCK=["","Todas as tarefas do dia e o check-in \"Como você está\".","Desafios relâmpago ⚡: 30 segundos que valem XP.","App completo: correntes, treino do Sistema e todos os painéis."];
function s3Days(){const s=prog.simple;const [y,m,d]=String(s.from).split("-").map(Number);const [a,b,c]=todayKey().split("-").map(Number);return Math.round((new Date(a,b-1,c)-new Date(y,m-1,d))/864e5);}
function s3Stage(){const s=prog.simple;if(!s||s.off||!s.from||!cfg||cfg.blank)return 3;return Math.max(0,Math.min(3,Math.max(s3Days(),levelOf(totalXP())-1)));}
function s3Level(sec){if(sec.querySelector(".status")||sec.querySelector("#quests"))return 0;
  if(sec.id==="installTip"||sec.querySelector("#energy"))return 1;if(sec.id==="zapPanel"||sec.id==="gdPanel")return 2;return 3;}
let s3All=false;
function s3Apply(){const st=s3Stage();const on=st<3&&!s3All;document.body.classList.toggle("s3",st<3);document.body.dataset.s3=on?String(st):"";
  for(const sec of document.querySelectorAll('.wrap>section[data-tab="hoje"]'))sec.classList.toggle("s3hide",st<3&&s3Level(sec)>st);
  let bar=$("s3Bar");const qp=$("quests")&&$("quests").closest("section");
  if(st>=3){if(bar)bar.remove();return;}
  if(!bar&&qp){bar=document.createElement("div");bar.id="s3Bar";bar.className="s3bar";qp.append(bar);}
  if(!bar)return;bar.textContent="";
  const pend=document.querySelectorAll("#quests .quest:not(.done)").length,nx=document.querySelector("#quests .quest.next");
  if(on&&st===0&&!nx&&pend===0){const d=document.createElement("div");d.className="s3done";d.textContent="✓ Missões de hoje feitas. Amanhã o Sistema libera mais.";bar.append(d);}
  if(on&&st===0&&pend>1){const b=document.createElement("button");b.type="button";b.className="link";b.textContent="Ver todas as tarefas de hoje ("+pend+")";b.addEventListener("click",()=>{s3All=true;s3Apply();});bar.append(b);}
  const nxt=document.createElement("div");nxt.className="sm muted s3next";nxt.textContent="🔒 Próximo desbloqueio: "+S3_UNLOCK[st+1].replace(/\.$/,"")+" (amanhã ou no nível "+(st+2)+").";bar.append(nxt);
  const off=document.createElement("button");off.type="button";off.className="link s3off";off.textContent="Já sei usar, mostrar o app completo";
  off.addEventListener("click",()=>{prog.simple.off=todayKey();save();s3All=false;s3Apply();render();toast("App completo liberado.");});bar.append(off);}
function s3Check(){const s=prog.simple;if(!s||s.off)return;const st=s3Stage();if(st>(+s.seen||0)){s.seen=st;save();
  try{sysPop("DESBLOQUEIO","Novo no seu jogo",S3_UNLOCK[st],null,"Bora");}catch(e){}}}
// novo jogador: liga o modo simples quando o perfil é criado pela 1ª vez (refazer o perfil não liga)
{let wasBlank=false;const go=$("o_go");if(go){go.addEventListener("click",()=>{wasBlank=!cfg||!!cfg.blank||!(cfg.quests||[]).length;},true);
  go.addEventListener("click",()=>{if(wasBlank&&cfg&&!cfg.blank&&!prog.simple){prog.simple={from:todayKey(),seen:0};save();s3Apply();}});}}
{const _r=render;render=function(){_r.apply(this,arguments);try{s3Apply();s3Check();}catch(e){}};}
setTimeout(()=>{try{s3Apply();}catch(e){}},60);
