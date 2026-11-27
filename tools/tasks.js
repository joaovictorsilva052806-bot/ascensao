// ---------- Tasks Lendárias (só 18+, aba própria): spec da EVA (#22) ----------
// O app NUNCA guarda, recebe ou repassa dinheiro. Quem paga é sempre um terceiro, direto ao jogador (comprador, plataforma).
// O app só guia o passo a passo (3 passos), o jogador marca cada passo e ganha Ouro ao concluir (uma vez por task, valor pela raridade).
// Sem link de afiliado do criador: só as páginas oficiais. Nada de Ouro/XP por convidar jogador do app. Sem ranking de dinheiro.
// Só ADICIONA prog.tp = {id:{s:{n:dia}, f:dia}} e prog.tpwal (dia em que a Carteira abriu). A Carteira real (o que o jogador
// anotou que recebeu) fica só no aparelho, numa chave própria FORA do prog (nunca sobe para a planilha).
// Trava de idade: só 18+ (ad18); sem idade no /comecar/, 14-17, até 13 e autorização de responsável = a aba nem aparece.
// Mistério: a aba abre na 1ª missão concluída; as tasks se revelam uma a uma (3 à vista + 1 a cada task concluída);
// a 1ª Task Lendária concluída desbloqueia a Carteira e a meta do dia.
// Dados conferidos em 27/11/2026: /mnt/project-files/ascensao/receita/plataformas-que-pagam-27nov.md (valores mudam: vale o app de cada plataforma).
const TP_META=50,TP_SHOW=3;
const TP_TIER={c:["Comum",20],r:["Rara",30],l:["Lendária",50]};
const TP_NOTE="Quem paga é sempre o comprador ou a plataforma, direto para você. O app não guarda seu link, quem você indicou nem dinheiro nenhum. Valores mudam: vale o que está no app de cada plataforma. Meta não é promessa de ganho.";
const TP_WREF="Proibido criar conta no lugar de outra pessoa, usar dados de outra pessoa ou mandar o link em massa ou em grupo: a plataforma cancela o prêmio e a conta. Indique só quem realmente vai usar.";
const TP_WJOB="Ninguém sério cobra para você começar. Se pedirem taxa, depósito ou \"kit\", é golpe: saia.";
const TP_L=[
 {id:"desapega",tier:"l",t:"📦 Desapega",pay:"O preço que você combinar, sem comissão na venda direta.",when:"💸 Cai hoje: Pix do comprador na hora da venda.",
  warn:"Nunca entregue antes de o dinheiro cair na sua conta. Confira o Pix no app do seu banco: print de comprovante não vale. Entrega em local público e movimentado.",
  links:[["OLX","https://www.olx.com.br/"],["Facebook Marketplace","https://www.facebook.com/marketplace/"],["Enjoei","https://www.enjoei.com.br/"]],
  s:["Escolher 1 coisa parada e tirar 3 fotos com luz natural, mostrando defeitos se tiver.",
     "Anunciar com preço um pouco abaixo dos anúncios iguais (vende mais rápido).",
     "Vendeu: conferiu o Pix no SEU banco e só então entregou, em local público."]},
 {id:"cashback",tier:"c",t:"🛍️ Cashback da Black Friday",pay:"De volta uma parte da compra que você já ia fazer (costuma ser 3% a 15%).",when:"⏳ Pendente em 1 a 2 dias; libera quando a loja confirma a compra.",
  warn:"Só vale para compra que você já ia fazer: não compre só pelo cashback. Abra a loja pelo app de cashback e compre no mesmo acesso, sem bloqueador de anúncio.",
  links:[["Cuponomia","https://www.cuponomia.com.br/"],["Méliuz","https://www.meliuz.com.br/"]],
  s:["Criar a SUA conta na Cuponomia ou no Méliuz.",
     "Achar a loja no app de cashback e ativar o cashback antes de comprar.",
     "Comprar nesse mesmo acesso e conferir o cashback pendente no app."]},
 {id:"mpago",tier:"l",t:"💳 Indique a maquininha",pay:"Mercado Pago: até R$ 30 por contato que usar o app e prêmio maior se ele comprar a maquininha (campanha de hoje). PagBank também paga por maquininha ativada.",when:"⏳ Poucos dias depois que a pessoa cumpre a regra.",
  warn:TP_WREF,links:[["Mercado Pago","https://www.mercadopago.com.br/"],["PagBank","https://pagbank.com.br/"]],
  s:["Abrir \"Convide e ganhe\" no app e ler quanto paga, a regra e o prazo.",
     "Listar até 3 pessoas que vendem e precisam de maquininha (comércio, autônomo, personal).",
     "Mandar o link no WhatsApp, uma pessoa por vez, explicando o benefício dela."]},
 {id:"prolific",tier:"r",t:"🔬 Pesquisas acadêmicas (Prolific)",pay:"Estudos pagos em libra ou dólar. Saque a partir de £6 / US$ 6.",when:"⏳ Depois de aprovado, saque no PayPal no mesmo dia (os 4 primeiros têm 72 h de espera). Pode ter fila para entrar.",
  warn:"Precisa de PayPal e de verificação de identidade. Responda com atenção: resposta apressada é rejeitada e não paga.",links:[["Prolific","https://www.prolific.com/"]],
  s:["Criar a conta de participante e fazer a verificação de identidade.",
     "Completar o perfil inteiro (mais estudos aparecem para quem tem perfil completo).",
     "Fazer 1 estudo do começo ao fim e conferir o saldo aprovado."]},
 {id:"inter",tier:"c",t:"🟠 Indique o Inter",pay:"1.000 pontos Loop por conta aprovada (2.000 pontos ≈ R$ 40). É ponto, não dinheiro: troca por cashback.",when:"⏳ Quando a conta do amigo é aprovada.",
  warn:TP_WREF,links:[["Inter","https://inter.co/"]],
  s:["No app do Inter, abrir \"Indique e ganhe\" e ler a regra.",
     "Pensar em até 3 pessoas que querem uma conta digital.",
     "Mandar o link, uma pessoa por vez, e acompanhar os pontos no Loop."]},
 {id:"meliuz",tier:"r",t:"🎟️ Indique o cashback",pay:"Méliuz (campanha de hoje): R$ 50 para você e R$ 5 para quem entra. Cuponomia também tem Indique e ganhe.",when:"⏳ Lento: só libera quando o indicado gasta R$ 500 em compras válidas em até 90 dias.",
  warn:TP_WREF+" O Méliuz proíbe anunciar o link em buscadores.",links:[["Méliuz","https://www.meliuz.com.br/"],["Cuponomia","https://www.cuponomia.com.br/"]],
  s:["Abrir \"Indique e ganhe\" no app de cashback e ler a regra de hoje.",
     "Pensar em até 3 pessoas que compram online com frequência.",
     "Mandar o link, uma pessoa por vez, explicando o cashback que ela ganha."]},
 {id:"outlier",tier:"l",t:"🤖 Treinar IA em português (Outlier)",pay:"Até US$ 10 por hora em projetos de português, mais bônus.",when:"⏳ Semanal, por PayPal ou AirTM, depois de passar no teste.",
  warn:TP_WJOB,links:[["Outlier","https://outlier.ai/"]],
  s:["Criar a conta e escolher projetos de português.",
     "Fazer a avaliação inicial com calma (é ela que libera as tarefas).",
     "Concluir a 1ª tarefa paga e conferir o pagamento da semana."]},
 {id:"yougov",tier:"c",t:"🗳️ Pesquisas de opinião (YouGov)",pay:"17.500 pontos = R$ 50 por transferência.",when:"⏳ 1 a 3 dias úteis depois de resgatar. Juntar os pontos leva semanas.",
  warn:"Responda sempre com sinceridade: respostas incoerentes bloqueiam a conta.",links:[["YouGov","https://yougov.com/"]],
  s:["Criar a conta no painel do Brasil e completar o perfil.",
     "Responder 1 pesquisa por dia quando chegar o convite.",
     "Bateu 17.500 pontos: resgatar para a sua conta bancária."]},
 {id:"userlytics",tier:"r",t:"🧪 Testar sites e apps (Userlytics)",pay:"Valor por teste, informado em cada convite.",when:"⏳ PayPal, na 1ª sexta-feira depois de 15 dias da aprovação.",
  warn:"Os testes gravam a tela e a voz: não mostre senha, documento nem dados de banco.",links:[["Userlytics","https://www.userlytics.com/"]],
  s:["Criar o perfil de testador e ligar o PayPal.",
     "Fazer o teste de qualificação, falando em voz alta o que pensa.",
     "Aceitar 1 convite, concluir o teste e conferir a aprovação."]},
 {id:"freelas",tier:"l",t:"💼 Freela rápido (99Freelas)",pay:"O valor do projeto. A taxa (5% a 20%) é paga pelo contratante.",when:"⏳ Saque por Pix em até 6 dias úteis no plano grátis.",
  warn:TP_WJOB+" Combine tudo pela plataforma: fora dela você perde a proteção.",links:[["99Freelas","https://www.99freelas.com.br/"]],
  s:["Criar o perfil com 1 coisa que você faz bem (texto, design, planilha, vídeo).",
     "Mandar proposta em 3 projetos pequenos, com prazo curto e exemplo do seu trabalho.",
     "Entregou e o cliente aprovou: sacar por Pix."]},
 {id:"motorista",tier:"r",t:"🚗 Indique motorista (Uber ou 99)",pay:"Valor definido por cidade, mostrado no app. Uber paga até 50 indicações.",when:"⏳ Na semana seguinte ao indicado cumprir as viagens (até 90 dias).",
  warn:TP_WREF+" Só para quem já é motorista ativo.",links:[["Uber","https://www.uber.com/br/"],["99","https://99app.com/"]],
  s:["No app de motorista, abrir \"Indicar\" e ver o valor da sua cidade.",
     "Pensar em até 3 pessoas que querem dirigir e têm carro e CNH.",
     "Mandar o link, uma pessoa por vez, e acompanhar as viagens dela no app."]},
 {id:"dataann",tier:"r",t:"🧠 Tarefas de IA por hora (DataAnnotation)",pay:"Até US$ 40 por hora, conforme a dificuldade.",when:"⏳ Semanal, depois de aprovado no teste.",
  warn:TP_WJOB,links:[["DataAnnotation","https://www.dataannotation.tech/"]],
  s:["Criar a conta e fazer o teste inicial com calma.",
     "Aprovado: escolher 1 projeto que você entende.",
     "Concluir as primeiras horas e conferir o pagamento da semana."]},
 {id:"clickworker",tier:"c",t:"🖱️ Microtarefas (Clickworker)",pay:"Pequenas tarefas de texto, foto e pesquisa. Saque a partir de €10.",when:"⏳ Lote semanal, de quarta a sexta, no PayPal.",
  warn:"O cadastro às vezes fecha para o Brasil: se fechar, pule para a próxima.",links:[["Clickworker","https://www.clickworker.com/"]],
  s:["Criar a conta e fazer as avaliações de qualificação.",
     "Fazer as tarefas liberadas até juntar €10.",
     "Pedir o saque no PayPal e conferir no lote da semana."]},
 {id:"appen",tier:"c",t:"🌐 Projetos de dados (CrowdGen)",pay:"Pagamento por projeto, com transferência em reais.",when:"⏳ Mensal.",
  warn:TP_WJOB,links:[["CrowdGen","https://crowdgen.com/"]],
  s:["Criar o perfil completo, com idiomas e aparelhos que você usa.",
     "Candidatar-se a 1 projeto em português.",
     "Concluir as tarefas do mês e conferir a fatura."]},
 {id:"fiverr",tier:"r",t:"🌎 Serviço para o mundo (Fiverr ou Workana)",pay:"O valor do seu serviço. A Fiverr fica com 20%.",when:"⏳ Fiverr: 14 dias depois da entrega. Workana: quando o cliente libera.",
  warn:TP_WJOB+" Receba sempre pela plataforma.",links:[["Fiverr","https://www.fiverr.com/"],["Workana","https://www.workana.com/"]],
  s:["Criar 1 serviço com título claro, preço de entrada e 3 exemplos.",
     "Responder rápido e entregar antes do prazo.",
     "1ª entrega aprovada: conferir o saldo liberado."]},
 {id:"banco",tier:"c",t:"🏦 Indique o banco (PicPay ou C6)",pay:"Varia por campanha (saldo ou pontos), na aba \"Indicar amigos\".",when:"⏳ Depende da campanha (o C6 já levou até 45 dias).",
  warn:TP_WREF,links:[["PicPay","https://picpay.com/"],["C6 Bank","https://www.c6bank.com.br/"]],
  s:["Abrir \"Indicar amigos\" no app e ler a campanha de hoje.",
     "Pensar em até 3 pessoas que querem abrir conta.",
     "Mandar o link, uma pessoa por vez, e acompanhar no app."]},
 {id:"sofisa",tier:"c",t:"📈 Indique quem investe (Sofisa)",pay:"R$ 50 para você e R$ 50 para quem entra.",when:"⏳ Cerca de 30 dias depois que o indicado aplica R$ 1.000 por 12 meses ou mais.",
  warn:TP_WREF+" Indique só quem já investe: nunca convença alguém a aplicar só pelo prêmio.",links:[["Sofisa Direto","https://www.sofisadireto.com.br/"]],
  s:["No app, abrir a área de indicação e ler a regra.",
     "Pensar em quem já investe e procura CDB.",
     "Mandar o link, uma pessoa por vez."]},
 {id:"stock",tier:"r",t:"📸 Venda fotos e vídeos (Adobe Stock ou Shutterstock)",pay:"Royalty a cada licença vendida. Conteúdo feito com IA precisa ser marcado como IA.",when:"⏳ Lento: Adobe paga a partir de US$ 25; Shutterstock, todo mês.",
  warn:"Só envie o que é seu, sem rosto de outra pessoa sem autorização e sem marca famosa. Conteúdo de IA sempre rotulado.",links:[["Adobe Stock","https://contributor.stock.adobe.com/"],["Shutterstock","https://submit.shutterstock.com/"]],
  s:["Criar a conta de colaborador.",
     "Enviar 10 fotos ou vídeos seus, com título e palavras-chave em inglês.",
     "Aprovados: acompanhar as vendas no painel."]}];
function tpEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function tpName(T){return T.t.replace(/^\S+\s/,"");}
function tpOn(){try{return !!(cfg&&!cfg.blank&&cfg.quests&&cfg.quests.length)&&typeof ad18==="function"&&ad18();}catch(e){return false;}}
function tpSt(){let r=prog.tp;if(!r||typeof r!=="object"||Array.isArray(r))r=prog.tp={};for(const T of TP_L){if(!r[T.id]||typeof r[T.id]!=="object"||Array.isArray(r[T.id]))r[T.id]={};if(!r[T.id].s||typeof r[T.id].s!=="object"||Array.isArray(r[T.id].s))r[T.id].s={};}return r;}
function tpN(T){const s=tpSt()[T.id].s;return T.s.filter((x,i)=>s[i]).length;}
function tpDone(){const r=tpSt();return TP_L.filter(T=>r[T.id].f).length;}
// a aba abre na 1ª missão concluída (qualquer dia); conquistas automáticas e check-in não contam
function tpMission(){try{for(const k in prog.log)if((prog.log[k]||[]).some(e=>e&&!/^(ach|checkin):/.test(String(e.q))&&e.kind!=="checkin"))return true;}catch(e){}return false;}
function tpOpenTab(){return tpOn()&&tpMission();}
function tpWal(){return !!prog.tpwal;}
function tpVis(){return Math.min(TP_L.length,TP_SHOW+tpDone());}
// Carteira real: só no aparelho, fora do prog
const TP_WK=(location.pathname.indexOf("/comecar/")>=0?"asc-u":"ascensao")+"-real";
function tpW(){try{const a=JSON.parse(localStorage.getItem(TP_WK)||"[]");return Array.isArray(a)?a.filter(x=>x&&isFinite(+x.v)&&+x.v>0):[];}catch(e){return [];}}
function tpWSave(a){try{localStorage.setItem(TP_WK,JSON.stringify(a.slice(0,200)));}catch(e){}}
function tpBRL(v){return "R$ "+(+v).toFixed(2).replace(".",",");}
function tpAdd(src,raw){const v=Math.round(parseFloat(String(raw).replace(/\s|R\$/g,"").replace(",","."))*100)/100;if(!(v>0&&v<1e6)){toast("Digite um valor maior que zero.");return false;}
  const b=tpW();b.unshift({d:todayKey(),src,v});tpWSave(b);toast("Anotado: "+tpBRL(v)+". Fica só neste aparelho.");return true;}
function tpToday(){const d=todayKey();return tpW().filter(x=>x.d===d).reduce((a,y)=>a+(+y.v),0);}
let tpOpen=null,tpF="all";
function tpStep(T,i){const r=tpSt(),s=r[T.id].s;
  if(s[i])delete s[i];else s[i]=todayKey();
  const all=T.s.every((x,k)=>s[k]);let g=0;
  if(all&&!r[T.id].f){const before=tpVis();r[T.id].f=todayKey();const tier=TP_TIER[T.tier];
    try{if(typeof orGive==="function")g=orGive("tp:"+T.id,tier[1],"Task "+tier[0]);}catch(e){}
    const first=!prog.tpwal;if(first)prog.tpwal=todayKey();
    try{haptic([10,30,10]);}catch(e){}save();
    const nx=tpVis()>before?TP_L[tpVis()-1]:null;
    const msg=(first?"A Carteira foi desbloqueada: anote ali o que você receber. ":"")+(nx?"Uma nova task se revelou: "+TP_TIER[nx.tier][0]+". ":"")+"O dinheiro, quando vier, vem direto de quem paga."+(g?" +"+g+" 🪙 de Ouro.":"");
    try{sysPop(first?"CARTEIRA DESBLOQUEADA":"TASK "+tier[0].toUpperCase()+" CONCLUÍDA",tpName(T),msg,null,"Fechar");}catch(e){toast("✓ Task concluída"+(g?" · +"+g+" 🪙":""));}}
  else{if(!all&&r[T.id].f)delete r[T.id].f;save();}
  tpOpen=T.id;tpRender();try{tpLine();}catch(e){}}
// "Quanto ganhei" dentro de cada card: alimenta a Carteira real (só no aparelho)
function tpGot(T){const f=tpEl("form","tpwf tpgot");const inp=tpEl("input");inp.type="text";inp.inputMode="decimal";inp.maxLength=12;inp.autocomplete="off";inp.placeholder="Quanto ganhei (R$)";inp.setAttribute("aria-label","Quanto ganhei com "+tpName(T)+", em reais");
  const add=tpEl("button","go tpwadd","Anotar");add.type="submit";f.append(inp,add);
  f.addEventListener("submit",ev=>{ev.preventDefault();if(tpAdd(T.id,inp.value)){tpOpen=T.id;tpRender();try{tpLine();}catch(e){}}});return f;}
function tpCard(T){const r=tpSt(),s=r[T.id].s,n=tpN(T),done=n===T.s.length,tier=TP_TIER[T.tier];
  const c=tpEl("details","tpm t-"+T.tier+(done?" ok":""));c.dataset.tp=T.id;c.open=tpOpen===T.id;c.addEventListener("toggle",()=>{if(c.open)tpOpen=T.id;else if(tpOpen===T.id)tpOpen=null;});
  const sm=tpEl("summary","tpt");const nm=tpEl("span","tpnm");nm.append(tpEl("span","tptier",tier[0]),tpEl("span",null,(done?"✓ ":"")+T.t));sm.append(nm,tpEl("span","sm mono",n+"/"+T.s.length));c.append(sm);
  c.append(tpEl("p","tpwhen",T.when),tpEl("p","tpsub","💰 "+T.pay));
  const ol=tpEl("ol","tpsteps");T.s.forEach((x,i)=>{const li=tpEl("li");const b=tpEl("button",(s[i]?"ghost":"go")+" tpbtn",(s[i]?"✓ ":"")+x);b.type="button";b.dataset.i=i;
    b.setAttribute("aria-pressed",s[i]?"true":"false");b.addEventListener("click",()=>tpStep(T,i));li.append(b);ol.append(li);});c.append(ol);
  const lk=tpEl("div","tplinks");lk.append(tpEl("span","sm muted","Páginas oficiais:"));for(const [nm2,u] of T.links){const a=tpEl("a","tplink",nm2+" ↗");a.href=u;a.target="_blank";a.rel="noopener noreferrer";lk.append(a);}c.append(lk);
  c.append(tpEl("p","sm tpwarn","⚠️ "+T.warn));
  if(tpWal())c.append(tpGot(T));
  c.append(tpEl("p","sm muted",done?"✓ Concluída. +"+tier[1]+" 🪙 já entrou (uma vez só).":"Ao marcar os "+T.s.length+" passos: +"+tier[1]+" 🪙 de Ouro (uma vez só)."));
  return c;}
function tpSealed(T,k){const d=tpEl("div","tpm tpseal t-"+T.tier+(k===0?" nx":""));d.setAttribute("role","img");d.setAttribute("aria-label","Task selada, raridade "+TP_TIER[T.tier][0]+(k===0?", é a próxima a se revelar":""));
  d.append(tpEl("span","tptier",TP_TIER[T.tier][0]),tpEl("span","tpq","???"));if(k===0)d.append(tpEl("span","tpnx","próxima"));return d;}
function tpWallet(){const a=tpW();const d=tpEl("details","tpwallet");d.append(tpEl("summary",null,"💰 Carteira (só neste aparelho)"));
  const tot=a.reduce((x,y)=>x+(+y.v),0);d.append(tpEl("p","tpwtot",a.length?"Total anotado: "+tpBRL(tot):"Nada anotado ainda."));
  const f=tpEl("form","tpwf");const sel=tpEl("select");sel.setAttribute("aria-label","De onde veio");for(const T of TP_L.slice(0,tpVis()))sel.append(new Option(tpName(T),T.id));sel.append(new Option("Outro","outro"));
  const inp=tpEl("input");inp.type="text";inp.inputMode="decimal";inp.maxLength=12;inp.autocomplete="off";inp.placeholder="Valor em R$";inp.setAttribute("aria-label","Valor recebido em reais");
  const add=tpEl("button","go tpwadd","Anotar");add.type="submit";f.append(sel,inp,add);
  f.addEventListener("submit",ev=>{ev.preventDefault();if(tpAdd(sel.value,inp.value))tpRender(true);});
  d.append(f);
  if(a.length){const ul=tpEl("ul","tpwl");for(const x of a.slice(0,10)){const T=TP_L.find(t=>t.id===x.src);ul.append(tpEl("li","sm",x.d+" · "+(T?tpName(T):"Outro")+" · "+tpBRL(x.v)));}d.append(ul);
    const clr=tpEl("button","ghost tpwclr","Apagar a carteira");clr.type="button";clr.addEventListener("click",()=>{if(clr.dataset.c){tpWSave([]);try{localStorage.removeItem(TP_WK);}catch(e){}toast("Carteira apagada.");tpRender(true);}else{clr.dataset.c="1";clr.textContent="Toque de novo para apagar tudo";}});d.append(clr);}
  d.append(tpEl("p","sm muted","Não sobe para a planilha, não entra em ranking e ninguém vê. Ganho fora do app pode ter imposto: veja a missão \"Recebi sem CNPJ\" na Primeira Renda."));
  return d;}
// aba própria: botão na barra, só para 18+
const TP_ICON='<svg viewBox="0 0 24 24"><path d="M12 3l3 5 5 1-3.5 4 1 5.5L12 16l-5.5 2.5 1-5.5L4 9l5-1z"/></svg>';
function tpTab(){const bar=$("tabbar");if(!bar)return;let b=bar.querySelector('[data-go="lenda"]');
  if(!b){b=document.createElement("button");b.type="button";b.dataset.go="lenda";b.className="tplbar";b.innerHTML=TP_ICON+"Lendárias";
    b.addEventListener("click",()=>{goTab("lenda");tpRender();});const mais=bar.querySelector('[data-go="mais"]');bar.insertBefore(b,mais||null);
    try{if(sessionStorage.getItem("asc-tab")==="lenda")setTimeout(()=>{if(tpOn())goTab("lenda");},0);}catch(e){}}
  b.hidden=!tpOn();b.classList.toggle("lock",!tpOpenTab());if(b.hidden&&document.body.dataset.tab==="lenda")goTab("hoje");}
function tpRender(keepW){try{tpTab();}catch(e){}let p=$("tpPanel");if(!tpOn()){if(p)p.hidden=true;return;}
  if(!p){const w=document.querySelector(".wrap");if(!w)return;p=tpEl("section","panel tppanel");p.id="tpPanel";p.dataset.tab="lenda";w.append(p);}
  const wo=keepW||((p.querySelector(".tpwallet")||{}).open);p.hidden=false;p.textContent="";
  const hd=tpEl("div","qhead");p.append(hd);
  if(!tpOpenTab()){p.classList.add("tplock");
    hd.append(tpEl("h2",null,"⚜️ Tasks Lendárias"),tpEl("span","sm mono","🔒"));
    const v=tpEl("div","tpvault");v.append(tpEl("div","tpsig","🔒"),tpEl("p","tpq","O Sistema guarda tarefas que pagam de verdade."),tpEl("p","sm muted","Só se revelam para quem já provou constância."));
    const ul=tpEl("ul","tpreq");ul.append(tpEl("li","ok","✓ 18+ confirmado"),tpEl("li",null,"○ Conclua 1 missão de hoje"));v.append(ul);
    const go=tpEl("button","go","Ir para as missões de hoje");go.type="button";go.addEventListener("click",()=>goTab("hoje"));v.append(go);p.append(v);return;}
  p.classList.remove("tplock");
  const dn=tpDone(),vis=tpVis();
  hd.append(tpEl("h2",null,"⚜️ Tasks Lendárias"),tpEl("span","sm mono",dn+" concluídas · "+vis+"/"+TP_L.length+" reveladas"));
  if(tpWal()){const td=tpToday(),pc=Math.min(100,Math.round(td/TP_META*100));const mt=tpEl("div","tpmeta");
    mt.append(tpEl("div","tpmt","🎯 Meta de hoje: seus primeiros "+tpBRL(TP_META).replace(",00","")),tpEl("div","sm mono tpmv",td>=TP_META?"✓ Meta batida: "+tpBRL(td)+" anotados hoje":"Anotado hoje: "+tpBRL(td)+" de "+tpBRL(TP_META)));
    const bar=tpEl("div","tpbar");bar.setAttribute("role","progressbar");bar.setAttribute("aria-label","Meta de hoje");bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax","100");bar.setAttribute("aria-valuenow",String(pc));const fill=tpEl("i");fill.style.width=pc+"%";bar.append(fill);mt.append(bar);
    p.append(mt);}
  else p.append(tpEl("div","tpmeta tpwlock","🔒 Conclua 1 Task Lendária para abrir a Carteira e a meta do dia."));
  p.append(tpEl("div","sm muted tpintro","Quem paga é o comprador ou a plataforma, direto para você. Comece pelo Desapega: é o único que cai hoje."));
  const fl=tpEl("div","tpfil");fl.setAttribute("role","group");fl.setAttribute("aria-label","Filtrar por raridade");
  for(const [k,lb] of [["all","Todas"],["l","Lendária"],["r","Rara"],["c","Comum"]]){const b=tpEl("button","tpchip"+(k!=="all"?" t-"+k:"")+(tpF===k?" on":""),lb);b.type="button";b.setAttribute("aria-pressed",tpF===k?"true":"false");b.addEventListener("click",()=>{tpF=k;tpRender();});fl.append(b);}
  p.append(fl);
  const sg=tpEl("div","tpseals");TP_L.forEach((T,k)=>{if(tpF!=="all"&&T.tier!==tpF)return;if(k<vis)p.append(tpCard(T));else sg.append(tpSealed(T,k-vis));});
  if(sg.children.length){p.append(tpEl("div","sm muted tpslh","🔒 "+sg.children.length+" seladas · cada task concluída revela a próxima"));p.append(sg);}
  if(tpWal()){const w=tpWallet();w.open=!!wo;p.append(w);}
  p.append(tpEl("p","sm tpnote",TP_NOTE));}
// Hoje: uma linha só (integra as Lendárias com o dia). Trancada: pista misteriosa. Aberta: o próximo passo que paga.
function tpNext(){const r=tpSt(),v=tpVis();for(const T of TP_L.slice(0,v)){const i=T.s.findIndex((x,k)=>!r[T.id].s[k]);if(i>=0)return {T,i};}return null;}
function tpGo(id){goTab("lenda");if(id){tpOpen=id;tpF="all";}tpRender();const p=$("tpPanel");if(!p)return;
  setTimeout(()=>{const c=id&&p.querySelector('.tpm[data-tp="'+id+'"]');if(c){c.open=true;c.scrollIntoView({block:"start"});const b=c.querySelector(".tpbtn.go");if(b)try{b.focus({preventScroll:true});}catch(e){}}},60);}
function tpLine(){let l=$("tpLine");if(!tpOn()){if(l)l.hidden=true;return;}
  const open=tpOpenTab(),nx=open?tpNext():null;if(open&&!nx){if(l)l.hidden=true;return;}
  if(!l){const q=$("quests")&&$("quests").closest("section");if(!q)return;l=tpEl("section","panel tpline");l.id="tpLine";l.dataset.tab="hoje";
    const anchor=$("chPanel")||$("fjCard")||q;anchor.after(l);}
  l.hidden=false;l.textContent="";l.classList.toggle("tplock",!open);const b=tpEl("button","tplbtn");b.type="button";
  if(!open){b.append(tpEl("span","tplk","⚜️ ??? · Algo foi selado no Sistema"),tpEl("span","tplx","Conclua 1 missão de hoje para ver o que paga de verdade."),tpEl("span","tplgo","Ver ›"));
    b.setAttribute("aria-label","Tasks Lendárias, trancadas: conclua 1 missão de hoje");b.addEventListener("click",()=>tpGo(null));}
  else{b.append(tpEl("span","tplk","⚜️ Task "+TP_TIER[nx.T.tier][0]+" · "+tpName(nx.T)+" "+(nx.i+1)+"/"+nx.T.s.length),tpEl("span","tplx",nx.T.s[nx.i]),tpEl("span","tplgo","Abrir ›"));
    b.setAttribute("aria-label","Abrir a task "+tpName(nx.T)+": passo "+(nx.i+1)+" de "+nx.T.s.length);b.addEventListener("click",()=>tpGo(nx.T.id));}
  l.append(b);}
{const _r=render;render=function(){_r.apply(this,arguments);try{tpRender();}catch(e){}try{tpLine();}catch(e){}};}
setTimeout(()=>{try{tpRender();}catch(e){}try{tpLine();}catch(e){}},70);
