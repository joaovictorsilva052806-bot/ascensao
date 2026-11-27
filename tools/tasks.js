// ---------- Tasks que pagam (só 18+, aba Foco): spec da EVA (#22, 7228390484 e 7228395374) ----------
// O app NUNCA guarda, recebe ou repassa dinheiro. Quem paga é sempre um terceiro, direto ao jogador (comprador, plataforma).
// O app só guia o passo a passo, o jogador marca cada passo e ganha Ouro ao concluir (+30, uma vez por task).
// Sem link de afiliado do criador: só as páginas oficiais. Nada de Ouro/XP por convidar jogador do app. Sem ranking de dinheiro.
// Só ADICIONA prog.tp = {id:{s:{n:dia}, f:dia}} (passos marcados). A "Carteira real" (o que o jogador anotou que recebeu)
// fica só no aparelho, numa chave própria FORA do prog (nunca sobe para a planilha).
// Mesma trava de idade da Primeira Renda: só 18+ (ad18); sem idade no /comecar/, 14-17, até 13 e autorização de responsável = não aparece.
const TP_G=30;
const TP_NOTE="Quem paga é sempre o comprador ou a plataforma, direto para você. O app não guarda seu link, quem você indicou nem dinheiro nenhum. Sem promessa de ganho.";
const TP_L=[
 {id:"desapega",t:"📦 Desapega",sub:"Vender 1 coisa parada em casa. Quem paga: o comprador. Em quanto tempo: dias.",
  warn:"Nunca entregue antes de o dinheiro cair na sua conta. Confira o Pix no app do seu banco: print de comprovante não vale. Entrega em local público e movimentado.",
  links:[["OLX","https://www.olx.com.br/"],["Facebook Marketplace","https://www.facebook.com/marketplace/"],["Enjoei","https://www.enjoei.com.br/"]],
  s:["Escolher 1 coisa parada que dá para vender (roupa, livro, eletrônico, móvel).",
     "Tirar 3 fotos com luz natural e fundo limpo, mostrando defeitos se tiver.",
     "Olhar 3 anúncios iguais e definir o preço (um pouco abaixo do mais barato vende mais rápido).",
     "Publicar o anúncio numa das plataformas abaixo, com título claro e o estado real do item.",
     "Vendeu: recebeu primeiro, conferiu no banco e entregou em local público."]},
 {id:"indique",t:"🎟️ Indique e ganhe (cashback)",sub:"Indicar um app de cashback com o SEU link a quem já ia comprar. Quem paga: a plataforma. Em quanto tempo: 1 a 30 dias.",
  warn:"Proibido criar conta no lugar de outra pessoa, usar dados de outra pessoa ou mandar o link em massa ou em grupo: a plataforma cancela o bônus e a conta. Leia as regras de \"Indique e ganhe\" no próprio app da plataforma.",
  links:[["Cuponomia","https://www.cuponomia.com.br/"],["Méliuz","https://www.meliuz.com.br/"],["PicPay","https://picpay.com/"]],
  s:["Escolher 1 app de cashback (abaixo) e criar a SUA conta.",
     "Abrir \"Indique e ganhe\" e ler \"Como funciona\": quanto paga, se o indicado precisa comprar, valor mínimo e prazo.",
     "Pensar em até 3 pessoas que já iam comprar online esta semana.",
     "Mandar o seu link para cada uma, uma por vez, explicando o cashback. Nada de grupo nem mensagem em massa.",
     "O bônus apareceu no seu saldo da plataforma (se quiser, anote na Carteira real)."]}];
function tpEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function tpOn(){try{return !!(cfg&&!cfg.blank&&cfg.quests&&cfg.quests.length)&&typeof ad18==="function"&&ad18();}catch(e){return false;}}
function tpSt(){let r=prog.tp;if(!r||typeof r!=="object"||Array.isArray(r))r=prog.tp={};for(const T of TP_L){if(!r[T.id]||typeof r[T.id]!=="object"||Array.isArray(r[T.id]))r[T.id]={};if(!r[T.id].s||typeof r[T.id].s!=="object"||Array.isArray(r[T.id].s))r[T.id].s={};}return r;}
function tpN(T){const s=tpSt()[T.id].s;return T.s.filter((x,i)=>s[i]).length;}
// Carteira real: só no aparelho, fora do prog
const TP_WK=(location.pathname.indexOf("/comecar/")>=0?"asc-u":"ascensao")+"-real";
function tpW(){try{const a=JSON.parse(localStorage.getItem(TP_WK)||"[]");return Array.isArray(a)?a.filter(x=>x&&isFinite(+x.v)&&+x.v>0):[];}catch(e){return [];}}
function tpWSave(a){try{localStorage.setItem(TP_WK,JSON.stringify(a.slice(0,200)));}catch(e){}}
function tpBRL(v){return "R$ "+(+v).toFixed(2).replace(".",",");}
let tpOpen=null;
function tpStep(T,i){const r=tpSt(),s=r[T.id].s;
  if(s[i])delete s[i];else s[i]=todayKey();
  const all=T.s.every((x,k)=>s[k]);let g=0;
  if(all&&!r[T.id].f){r[T.id].f=todayKey();try{if(typeof orGive==="function")g=orGive("tp:"+T.id,TP_G,"Task que paga");}catch(e){}
    try{haptic([10,30,10]);}catch(e){}save();
    try{sysPop("TASK CONCLUÍDA",T.t.replace(/^\S+\s/,""),"Você fez o passo a passo inteiro. O dinheiro, quando vier, vem direto de quem paga."+(g?" +"+g+" 🪙 de Ouro.":""),null,"Fechar");}catch(e){toast("✓ Task concluída"+(g?" · +"+g+" 🪙":""));}}
  else{if(!all&&r[T.id].f)delete r[T.id].f;save();}
  tpOpen=T.id;tpRender();}
function tpCard(T){const r=tpSt(),s=r[T.id].s,n=tpN(T),done=n===T.s.length;
  const c=tpEl("details","tpm"+(done?" ok":""));c.dataset.tp=T.id;c.open=tpOpen===T.id;c.addEventListener("toggle",()=>{if(c.open)tpOpen=T.id;else if(tpOpen===T.id)tpOpen=null;});
  const sm=tpEl("summary","tpt");sm.append(tpEl("span",null,(done?"✓ ":"")+T.t),tpEl("span","sm mono",n+"/"+T.s.length));c.append(sm);
  c.append(tpEl("p","tpsub",T.sub));
  const ol=tpEl("ol","tpsteps");T.s.forEach((x,i)=>{const li=tpEl("li");const b=tpEl("button",(s[i]?"ghost":"go")+" tpbtn",(s[i]?"✓ ":"")+x);b.type="button";b.dataset.i=i;
    b.setAttribute("aria-pressed",s[i]?"true":"false");b.addEventListener("click",()=>tpStep(T,i));li.append(b);ol.append(li);});c.append(ol);
  const lk=tpEl("div","tplinks");lk.append(tpEl("span","sm muted","Páginas oficiais:"));for(const [nm,u] of T.links){const a=tpEl("a","tplink",nm+" ↗");a.href=u;a.target="_blank";a.rel="noopener noreferrer";lk.append(a);}c.append(lk);
  c.append(tpEl("p","sm tpwarn","⚠️ "+T.warn));
  c.append(tpEl("p","sm muted",done?"✓ Concluída. +"+TP_G+" 🪙 já entrou (uma vez só).":"Ao marcar os "+T.s.length+" passos: +"+TP_G+" 🪙 de Ouro (uma vez só)."));
  return c;}
function tpWallet(){const a=tpW();const d=tpEl("details","tpwallet");d.append(tpEl("summary",null,"💰 Carteira real (só neste aparelho)"));
  const tot=a.reduce((x,y)=>x+(+y.v),0);d.append(tpEl("p","tpwtot",a.length?"Total anotado: "+tpBRL(tot):"Nada anotado ainda."));
  const f=tpEl("form","tpwf");const sel=tpEl("select");sel.setAttribute("aria-label","De onde veio");for(const T of TP_L)sel.append(new Option(T.t.replace(/^\S+\s/,""),T.id));sel.append(new Option("Outro","outro"));
  const inp=tpEl("input");inp.type="text";inp.inputMode="decimal";inp.maxLength=12;inp.autocomplete="off";inp.placeholder="Valor em R$";inp.setAttribute("aria-label","Valor recebido em reais");
  const add=tpEl("button","go tpwadd","Anotar");add.type="submit";f.append(sel,inp,add);
  f.addEventListener("submit",ev=>{ev.preventDefault();const v=Math.round(parseFloat(String(inp.value).replace(",","."))*100)/100;if(!(v>0&&v<1e6)){toast("Digite um valor maior que zero.");return;}
    const b=tpW();b.unshift({d:todayKey(),src:sel.value,v});tpWSave(b);toast("Anotado: "+tpBRL(v)+". Fica só neste aparelho.");tpRender(true);});
  d.append(f);
  if(a.length){const ul=tpEl("ul","tpwl");for(const x of a.slice(0,10)){const T=TP_L.find(t=>t.id===x.src);ul.append(tpEl("li","sm",x.d+" · "+(T?T.t.replace(/^\S+\s/,""):"Outro")+" · "+tpBRL(x.v)));}d.append(ul);
    const clr=tpEl("button","ghost tpwclr","Apagar a carteira");clr.type="button";clr.addEventListener("click",()=>{if(clr.dataset.c){tpWSave([]);try{localStorage.removeItem(TP_WK);}catch(e){}toast("Carteira apagada.");tpRender(true);}else{clr.dataset.c="1";clr.textContent="Toque de novo para apagar tudo";}});d.append(clr);}
  d.append(tpEl("p","sm muted","Não sobe para a planilha, não entra em ranking e ninguém vê. Ganho fora do app pode ter imposto: veja a missão \"Recebi sem CNPJ\" na Primeira Renda."));
  return d;}
let tpWOpen=false;
function tpRender(keepW){let p=$("tpPanel");if(!tpOn()){if(p)p.hidden=true;return;}
  if(!p){const anchor=$("rdPanel")||$("stPanel")||$("focusPanel");if(!anchor)return;p=tpEl("section","panel tppanel");p.id="tpPanel";p.dataset.tab="foco";anchor.after(p);}
  const wo=keepW||((p.querySelector(".tpwallet")||{}).open);p.hidden=false;p.textContent="";
  const r=tpSt();const n=TP_L.filter(T=>r[T.id].f).length;
  const hd=tpEl("div","qhead");hd.append(tpEl("h2",null,"💸 Tasks que pagam"),tpEl("span","sm mono","18+ · "+n+"/"+TP_L.length));p.append(hd);
  p.append(tpEl("div","sm muted tpintro","Tarefas simples em que quem paga é o comprador ou a plataforma, direto para você. Marque cada passo quando fizer."));
  for(const T of TP_L)p.append(tpCard(T));
  const w=tpWallet();w.open=!!wo;p.append(w);
  p.append(tpEl("p","sm tpnote",TP_NOTE));}
{const _r=render;render=function(){_r.apply(this,arguments);try{tpRender();}catch(e){}};}
setTimeout(()=>{try{tpRender();}catch(e){}},70);
