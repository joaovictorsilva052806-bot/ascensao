// ---------- IA de 1 toque: abre ChatGPT/Claude/Gemini com o pedido pronto e lê a resposta da área de transferência ----------
// Custo zero: nada passa por servidor nosso. Modos: tarefas do dia, plano de treino, plano de estudo, revisão da semana.
let aiMode="dia";
const AI_MODE={
  dia:null,
  treino:"Monte um PLANO DE TREINO em forma de tarefas diárias (stat \"corpo\"), progressivo e seguro para o meu nível, com aquecimento e descanso. Pode incluir 1 ou 2 tarefas de sono e água.",
  estudo:"Monte um PLANO DE ESTUDO em forma de tarefas diárias (stat \"mente\"), com blocos curtos, revisão e um dia leve. Use as minhas matérias ou o meu curso, se eu disser.",
  revisao:"Faça a REVISÃO DA MINHA SEMANA: diga em 3 frases o que funcionou, o que travou e por quê, com base no histórico. Depois proponha a lista de tarefas da semana que vem já ajustada."};
{const _p=aiPrompt;aiPrompt=function(){const t=_p();const m=AI_MODE[aiMode];if(!m)return t;return t.replace("Monte minhas tarefas diárias.",m);};}
function aiSetMode(m){aiMode=m;for(const b of $("aiMode").children){const on=b.dataset.m===m;b.classList.toggle("on",on);b.setAttribute("aria-checked",on?"true":"false");}
  $("aiWish").placeholder={dia:"Ex.: estou sem tempo de manhã; quero treinar mais",treino:"Ex.: iniciante, 3x por semana, sem academia",estudo:"Ex.: Cálculo e Física, prova dia 10",revisao:"Ex.: travei no treino; quero dormir mais cedo"}[m];}
$("aiMode").addEventListener("click",e=>{const b=e.target.closest("button[data-m]");if(b)aiSetMode(b.dataset.m);});
async function aiCopyText(t){try{await navigator.clipboard.writeText(t);return true;}catch(e){}const ta=$("aiPrompt");ta.value=t;ta.hidden=false;ta.select();try{return document.execCommand("copy");}catch(e){return false;}finally{ta.hidden=true;}}
const AI_URL={chatgpt:t=>"https://chatgpt.com/?q="+encodeURIComponent(t),claude:t=>"https://claude.ai/new?q="+encodeURIComponent(t),gemini:()=>"https://gemini.google.com/app"};
for(const b of document.querySelectorAll("#aiPanel [data-ai]"))b.addEventListener("click",async()=>{const k=b.dataset.ai;const t=aiPrompt();
  // abre na hora (no iPhone o pop-up precisa sair do toque); depois copia como reserva
  // sem "noopener": com ele o navegador devolve null e o app achava que a janela foi bloqueada
  const w=window.open(AI_URL[k](t),"_blank");if(w)try{w.opener=null;}catch(e){}const ok=await aiCopyText(t);
  $("aiMsg").textContent=(k==="gemini"?"O Gemini abriu: cole o pedido (já copiado) e envie. ":"A IA abriu com o pedido pronto: é só enviar. ")+"Quando ela responder, toque em Copiar na resposta e volte aqui em 📋 Colar resposta."+(ok?"":" (Se o pedido não veio, toque em Só copiar o pedido.)");
  if(!w)$("aiMsg").textContent="O celular bloqueou a janela. Toque em Só copiar o pedido e abra a IA você mesmo.";
  try{prog.aiUse=(prog.aiUse||0)+1;save();}catch(e){}});
$("aiPaste").addEventListener("click",async()=>{let t="";try{t=await navigator.clipboard.readText();}catch(e){}
  if(!t||t.indexOf("[")<0){const d=document.querySelector("#aiPanel .aiman");if(d)d.open=true;$("aiMsg").textContent=t?"Isso não parece a resposta da IA. Copie a resposta inteira (com o bloco de código) e tente de novo, ou cole na mão aqui embaixo.":"Não consegui ler a área de transferência. Cole a resposta na mão aqui embaixo.";setTimeout(()=>$("aiIn").focus(),60);return;}
  $("aiIn").value=t;$("aiRead").click();const p=$("aiPrev");if(!p.hidden)p.scrollIntoView({block:"center",behavior:"smooth"});});
