// ---------- Indique a Bellardi (só 18+): pacote "jogador e criador ganham", recado da EVA 7227438601 ----------
// Cartão em Mais: o jogador indica alguém que precisa de planta ou de regularizar imóvel; se virar contrato pago, recebe 10%.
// O botão só abre o WhatsApp da Bellardi com um texto pronto. O app NÃO guarda nem envia nenhum dado de quem foi indicado,
// não grava nada no progresso, não dá Ouro nem XP por indicação, não tem ranking de dinheiro nem ganho em cadeia.
// Só para 18+ pela trava de tools/idade.js (sem idade, 14-17 e até 13 = cartão não aparece).
// INDIQUE_WA vazio = cartão oculto. O número entra aqui só quando o JV aprovar (só dígitos, com DDI, ex.: 5511999999999).
const INDIQUE_WA='';
function inEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function inNum(){const n=String(INDIQUE_WA||"").replace(/\D/g,"");return n.length>=10&&n.length<=15?n:"";}
function inOn(){return !!inNum()&&typeof ad18==="function"&&ad18();}
function inNick(){try{return typeof rankName==="function"?String(rankName()||"").trim().slice(0,24):"";}catch(e){return "";}}
function inMsg(){const n=inNick();return "Vim pelo Ascension, indicação de "+(n||"um jogador")+".";}
function inUrl(){return "https://wa.me/"+inNum()+"?text="+encodeURIComponent(inMsg());}
function inRender(){let p=$("inPanel");if(!inOn()){if(p)p.hidden=true;return;}
  if(!p){const ms=document.querySelectorAll('.wrap>section[data-tab="mais"]:not(#inPanel)');const anchor=ms[ms.length-1];if(!anchor)return;
    p=inEl("section","panel inpanel");p.id="inPanel";p.dataset.tab="mais";anchor.after(p);}
  p.hidden=false;p.textContent="";
  const hd=inEl("div","qhead");hd.append(inEl("h2",null,"🤝 Indique a Bellardi"),inEl("span","sm mono","18+"));p.append(hd);
  p.append(inEl("p","inlead","Conhece alguém que precisa de planta ou de regularizar imóvel? Indique. Se virar contrato pago, você recebe 10%."));
  const a=inEl("a","inlink","Abrir o WhatsApp da Bellardi ↗");a.href=inUrl();a.target="_blank";a.rel="noopener noreferrer";
  a.addEventListener("click",()=>{a.href=inUrl();});
  const c=inEl("button","ghost incopy","Copiar link para mandar a quem precisa");c.type="button";
  c.addEventListener("click",async()=>{const u=inUrl();try{await navigator.clipboard.writeText(u);toast("Link copiado. Mande para quem precisa: a pessoa toca e fala direto com a Bellardi.");}catch(e){window.open(u,"_blank","noopener");}});
  const row=inEl("div","inrow");row.append(a,c);p.append(row);
  if(!inNick())p.append(inEl("p","sm muted inhint","Dica: com um apelido em Amigos, a indicação vai com o seu nome."));
  p.append(inEl("p","sm muted inlaw","Opcional. O app não guarda nem envia nada de quem você indicar. Os 10% valem só para contrato pago e são combinados direto com a Bellardi. Não dá Ouro nem XP."));}
{const _r=render;render=function(){_r.apply(this,arguments);try{inRender();}catch(e){}};}
setTimeout(()=>{try{inRender();}catch(e){}},95);
