// ---------- Textos da 1ª sessão (TDAH): frase curta, verbo de ação, vitória rápida, nada de culpa ----------
// Só troca TEXTO na tela. Não mexe em dados, XP, fluxo, classes/atributos, consentimento nem Modo Sistema.
// Tudo por id/função (não por posição), para conviver com os outros módulos. Antes/depois: qa/textos1.test.js.
{const tx=(el,t)=>{if(el&&el.textContent!==t)el.textContent=t;};
  // Despertar e perguntas rápidas (tools/quick.html)
  tx(document.querySelector("#qWake p.sm"),"Sem conta. Tudo fica só neste celular.");
  const s0=$("q_name")&&$("q_name").closest(".qstep");if(s0)tx(s0.querySelector("h2"),"Como eu te chamo?");
  tx($("q_n0"),"Bora ▸");
  tx($("q_bk"),"Já jogava? Recuperar meu progresso");
  const fp=$("q_h3")&&$("q_h3").nextElementSibling;if(fp&&fp.tagName==="P")tx(fp,"Escolha até 3.");
  tx($("q_done"),"Começar a jogar ⚡");
  tx($("q_full"),"Responder com mais detalhes");
  tx(document.querySelector(".swipehint"),"Dica: arraste a tarefa para a direita para concluir →");}
// Perguntas com o nome da pessoa
if(typeof qHead==="function"){const _qh=qHead;qHead=function(){_qh.apply(this,arguments);const n=qData.name?qData.name.split(" ")[0]:"";
  if($("q_h1"))$("q_h1").textContent=n?n+", qual a sua idade?":"Qual a sua idade?";
  if($("q_h2"))$("q_h2").textContent="O que ocupa o seu dia?";
  if($("q_h3"))$("q_h3").textContent=n?n+", o que vamos melhorar?":"O que vamos melhorar?";};}
// Jogo criado: primeiro nome e o próximo passo, sem número de tarefas para assustar
{const _t=toast;toast=function(msg){const m=/^Pronto, (.+?)! \d+ quests criadas para o seu dia\.$/.exec(String(msg||""));
  if(m)msg="Jogo pronto, "+m[1].split(" ")[0]+". Sua 1ª missão te espera.";return _t.call(this,msg);};}
// Check-in: o botão diz o que a pessoa ganha
{const _sp=sysPop;sysPop=function(tag,title,text,cb,lbl){
  if(tag==="CHECK-IN DIÁRIO"&&lbl==="Fazer check-in"){const b=+((/\+(\d+) de bônus/.exec(String(text))||[])[1]||0);
    const tk=todayKey(),novo=!Object.keys((prog&&prog.log)||{}).some(d=>d<tk&&(prog.log[d]||[]).length);
    if(title==="Dia 1"&&novo){title="Dia 1 · você chegou";text="Seu primeiro XP é só por abrir o app. Amanhã tem bônus.";}
    else if(title==="Dia 1"){title="Bem-vindo de volta";text="Você voltou, e isso já conta. +10 XP. Amanhã tem bônus.";}
    else text="Você voltou, e isso já conta."+(b?" +10 XP e +"+b+" de bônus pela sequência.":" +10 XP.");
    lbl="Pegar +"+(10+b)+" XP";}
  return _sp.call(this,tag,title,text,cb,lbl);};}
// Guia "Comece por aqui": passos curtos que dizem o que fazer e o que ganha
if(typeof gdSteps==="function"){const _gs=gdSteps;gdSteps=function(){const st=_gs();const T={
    q:["Comece a 1ª missão (toque ▶)","Abre com timer. O mínimo também vale."],
    // menor de 14 não tem ranking (LGPD): o guia não fala dele (mesma regra do tools/guide.js)
    z:["Faça 1 desafio relâmpago ⚡",ageNow()==="kid"?"30 segundos. +10 XP na hora.":"30 segundos. +10 XP e sobe no ranking."],
    r:ageNow()==="kid"?["Veja sua evolução","Em Progresso: seus atributos e a masmorra."]:["Veja seu lugar no ranking","Em Progresso. Só entra se você quiser."]};
  for(const x of st)if(T[x.k]){x.t=T[x.k][0];x.s=T[x.k][1];}return st;};}
function txFix(){const d=$("dayxp");if(d){const m=/^Hoje: (\d+) concluída\(s\) · (.+)$/.exec(d.textContent);if(m)d.textContent="Hoje: "+m[1]+(m[1]==="1"?" feita":" feitas")+" · "+m[2];}
  for(const h of document.querySelectorAll(".mshint"))if(h.textContent!=="Toque ▶ e comece. O timer guia você.")h.textContent="Toque ▶ e comece. O timer guia você.";
  const off=document.querySelector("#gdPanel .gdoff");if(off&&off.textContent!=="Já sei jogar, esconder")off.textContent="Já sei jogar, esconder";}
{const _r=render;render=function(){_r.apply(this,arguments);try{txFix();}catch(e){}};}
setTimeout(()=>{try{txFix();}catch(e){}},80);
if(typeof gdUI==="function"){const _g=gdUI;gdUI=function(){_g.apply(this,arguments);try{txFix();}catch(e){}};}
