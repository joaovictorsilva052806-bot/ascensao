// ---------- Trilha Primeira Renda (aba Foco): spec de conteúdo do ATLAS (#22, 7221245467) ----------
// Duas versões pela faixa de idade: 14-17 "Primeiro passo profissional" (só informação e preparo) e 18+ "Primeiro freela".
// Até 13 (ou sem idade no /comecar/): a trilha não aparece, sem mensagem. Quem acabou de passar para 18+ segue na versão 14-17 por 7 dias (tools/idade.js).
// Sem promessa de ganho, sem link de afiliado, só fontes oficiais ou públicas. Missão concluída = check do próprio jogador:
// nada do que ele escreve (currículo, portfólio, valores) é pedido, guardado ou enviado.
// Ouro (decisão da ATENA): +20 por missão e +50 ao fechar a trilha, uma vez por missão, dentro do teto do dia (tools/ouro.js).
// Só ADICIONA prog.renda = {a:{id:dia}, b:{id:dia}} (feitas de cada versão).
const RD_G={m:20,fim:50};
const RD_NOTE="Conteúdo informativo. Não é orientação jurídica, contábil nem promessa de vaga ou renda.";
// [id, título, passo, pronto quando, rótulo da fonte, link oficial, roteiro do app]
const RD_A=[
 ["pr-a01","O que é Jovem Aprendiz","Ler o que é a aprendizagem profissional: contrato especial de trabalho, com curso junto, para quem tem de 14 a 24 anos.","Sabe explicar em 1 frase","Aprendizagem profissional (MTE)","https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/aprendizagem-profissional"],
 ["pr-a02","Seus direitos como aprendiz","Ler o art. 428 da CLT e anotar 3 direitos (por exemplo: carteira assinada, salário-mínimo-hora, curso de formação).","Anotou 3 direitos","CLT, art. 428 (Planalto)","https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm"],
 ["pr-a03","O que a lei proíbe antes dos 18","Ler o art. 7º, XXXIII da Constituição: sem trabalho noturno, perigoso ou insalubre antes dos 18, e nenhum trabalho antes dos 16, salvo aprendiz.","Sabe dizer a regra","Constituição, art. 7º (Planalto)","https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm"],
 ["pr-a04","Carteira de Trabalho Digital","Com um responsável, ver como a Carteira de Trabalho Digital funciona: app oficial, entrada pela conta gov.br.","Sabe onde baixar","Carteira de Trabalho Digital (gov.br)","https://www.gov.br/pt-br/temas/carteira-de-trabalho-digital"],
 ["pr-a05","Onde ficam as vagas","Listar 2 instituições formadoras da sua cidade (SENAI, SENAC, CIEE ou similar) e como cada uma se inscreve.","2 nomes e o caminho de inscrição","Entidades e cursos de aprendizagem (MTE)","https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/aprendizagem-profissional"],
 ["pr-a06","Currículo de 1 página","Escrever um currículo de 1 página: dados de contato, escola e série, cursos, o que sabe fazer e trabalhos voluntários.","Arquivo salvo no aparelho","","","Modelo: contato (e-mail ou telefone de um responsável) · escola e série · cursos · 3 coisas que você sabe fazer · voluntário ou projetos. Uma página, letra simples. Fica só com você: o app não pede nem guarda."],
 ["pr-a07","1 curso gratuito com certificado","Escolher 1 curso curto e gratuito de iniciação profissional e fazer a primeira aula.","1ª aula concluída","Escola Virtual de Governo (EV.G)","https://www.escolavirtual.gov.br"],
 ["pr-a08","Treinar a entrevista","Responder em voz alta 3 perguntas: \"Fale de você\", \"Por que quer ser aprendiz?\" e \"Um ponto forte e um a melhorar\".","Respondeu as 3 em até 2 min cada","","","Roteiro: 1) escola, 1 coisa que gosta e 1 que aprendeu; 2) aprender na prática e começar com registro; 3) um ponto forte real e um ponto a melhorar com o que você já faz para melhorar."],
 ["pr-a09","Primeiro orçamento pessoal","Anotar quanto entra e quanto sai num mês (mesada, lanche, transporte) e separar 1 meta de economia.","Planilha ou anotação feita","","","Roteiro: duas colunas, entra e sai. Some cada uma. Meta: guardar um valor pequeno por semana, sempre o mesmo."],
 ["pr-a10","Conversa com um adulto","Mostrar a trilha para um responsável e combinar o próximo passo: inscrição, curso ou espera.","Combinado registrado","",""]];
const RD_B=[
 ["pr-b01","Escolher 1 serviço","Escrever em 1 frase o que você faz, para quem e qual resultado entrega.","Frase escrita","","","Modelo: \"Eu faço ___ para ___, e o resultado é ___.\""],
 ["pr-b02","Portfólio mínimo","Juntar 3 trabalhos (reais, de curso ou feitos de propósito) numa pasta ou página, cada um com 1 linha de contexto.","3 itens publicados ou salvos","","","Roteiro: em cada item, 1 linha com o problema, o que você fez e o resultado."],
 ["pr-b03","Preço do primeiro serviço","Calcular o preço: horas estimadas × valor-hora + custos. Comparar com 2 referências públicas da sua área.","Preço definido e justificado","","","Conta: horas × valor-hora + custos (programa, transporte, material). Se ficar muito longe das 2 referências, reveja as horas."],
 ["pr-b04","Proposta de 1 página","Escrever escopo, prazo, preço, forma de pagamento e o que não está incluído.","Modelo salvo","","","Modelo: Escopo · Prazo · Preço · Pagamento · Fora do escopo. Uma página."],
 ["pr-b05","Combinado por escrito","Antes de começar, confirmar escopo e valor por escrito (mensagem ou contrato simples). O CDC protege quem contrata: o combinado escrito protege os dois lados.","Modelo de mensagem salvo","CDC (Planalto)","https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm"],
 ["pr-b06","MEI: posso ser?","Conferir se a sua atividade está na lista oficial de ocupações do MEI. Nem toda atividade pode, como algumas intelectuais e regulamentadas.","Sabe se a ocupação existe","Atividades permitidas ao MEI (gov.br)","https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/atividades-permitidas/e"],
 ["pr-b07","Como se formaliza","Ler o passo a passo oficial do registro como MEI e anotar o que é preciso (conta gov.br nível prata ou ouro, dados, ocupação). Não precisa abrir agora.","Lista de requisitos anotada","Registrar-se como MEI (gov.br)","https://www.gov.br/pt-br/servicos/realizar-registro-como-microempreendedor-individual-mei"],
 ["pr-b08","Recebi sem CNPJ: e o imposto?","Ler como pessoa física declara serviço recebido de outra pessoa física (carnê-leão) e anotar a regra principal.","Sabe a regra","Carnê-leão (Receita Federal)","https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/pagamento/carne-leao"],
 ["pr-b09","Primeiros 5 contatos","Listar 5 pessoas ou empresas que podem precisar do serviço e escrever 1 mensagem curta e honesta. Enviar só se quiser.","Lista e mensagem prontas","","","Modelo: \"Oi, ___. Eu faço ___. Vi que ___. Posso te mostrar um exemplo? Sem compromisso.\""],
 ["pr-b10","Separar o dinheiro","Abrir uma \"caixinha\" ou anotação separada para o dinheiro do trabalho e definir quanto guardar de cada pagamento para imposto e reserva.","Regra de separação definida","","","Roteiro: antes de gastar, separe de cada pagamento uma parte para imposto e outra para reserva. Anote a regra num lugar só."]];
function rdEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function rdSt(){let r=prog.renda;if(!r||typeof r!=="object"||Array.isArray(r))r=prog.renda={};for(const k of ["a","b"])if(!r[k]||typeof r[k]!=="object"||Array.isArray(r[k]))r[k]={};return r;}
// versão pela idade: "" (não aparece), "a" (14-17) ou "b" (18+)
function rdVer(){try{if(!cfg||cfg.blank||!cfg.quests||!cfg.quests.length)return "";const a=ageNow();
  if(a==="kid")return "";if(typeof ad18==="function"&&ad18())return "b";
  if(a==="teen"||(a&&typeof adWait==="function"&&adWait()>0))return "a";
  if(a&&typeof adParent==="function"&&adParent())return "a";return "";}catch(e){return "";}}
let rdAll=false;
function rdDone(v,id){return !!rdSt()[v][id];}
function rdToggle(v,m){const r=rdSt();const L=v==="b"?RD_B:RD_A;
  if(r[v][m[0]]){delete r[v][m[0]];save();toast("Missão desmarcada. O Ouro que já entrou fica.");rdRender();return;}
  r[v][m[0]]=todayKey();save();let g=0;try{if(typeof orGive==="function")g=orGive("pr:"+m[0],RD_G.m,"Primeira Renda");}catch(e){}
  try{haptic([10,30,10]);}catch(e){}
  const all=L.every(x=>r[v][x[0]]);
  if(all){let g2=0;try{if(typeof orGive==="function")g2=orGive("pr:fim:"+v,RD_G.fim,"Trilha completa");}catch(e){}
    try{if(typeof sparks==="function")sparks(true);}catch(e){}
    sysPop("TRILHA COMPLETA",v==="b"?"Primeiro freela: 10 de 10":"Primeiro passo profissional: 10 de 10","Você fez a sua parte, passo a passo. Agora é repetir o que funcionou."+(g2?" +"+g2+" 🪙 de Ouro.":""),null,"Fechar");}
  else toast("✓ "+m[1]+(g?" · +"+g+" 🪙":""));
  rdRender();}
function rdCard(v,m,big){const done=rdDone(v,m[0]);const c=rdEl("div","rdm"+(done?" ok":"")+(big?" big":""));c.dataset.rd=m[0];
  const h=rdEl(big?"h3":"b","rdt",(done?"✓ ":"")+m[1]);c.append(h);
  if(big||!done){c.append(rdEl("p","rdp",m[2]),rdEl("p","sm rdq","Pronto quando: "+m[3]));
    if(m[5]){const a=rdEl("a","rdsrc","Fonte: "+m[4]+" ↗");a.href=m[5];a.target="_blank";a.rel="noopener noreferrer";c.append(a);}
    if(m[6]){const d=rdEl("details","rdtip");d.append(rdEl("summary",null,"Ver o roteiro"),rdEl("p","sm",m[6]));c.append(d);}}
  const b=rdEl("button",done?"ghost rdbtn":"go rdbtn",done?"Desmarcar":"Fiz ✓ +"+RD_G.m+" 🪙");b.type="button";
  b.setAttribute("aria-label",(done?"Desmarcar ":"Marcar como feita: ")+m[1]);b.addEventListener("click",()=>rdToggle(v,m));c.append(b);return c;}
function rdRender(){let p=$("rdPanel");const v=rdVer();
  if(!v){if(p)p.hidden=true;return;}
  if(!p){const anchor=$("stPanel")||$("focusPanel");if(!anchor)return;p=rdEl("section","panel rdpanel");p.id="rdPanel";p.dataset.tab="foco";anchor.after(p);}
  p.hidden=false;const L=v==="b"?RD_B:RD_A,r=rdSt();const n=L.filter(m=>r[v][m[0]]).length;
  const keep=document.activeElement&&p.contains(document.activeElement)?(document.activeElement.closest("[data-rd]")||{}).dataset:null;
  p.textContent="";const hd=rdEl("div","qhead");hd.append(rdEl("h2",null,"💼 Primeira Renda"),rdEl("span","sm mono",n+"/"+L.length));p.append(hd);
  p.append(rdEl("div","sm muted rdsub",(v==="b"?"Primeiro freela":"Primeiro passo profissional")+" · 1 missão por vez, até 25 min. +"+RD_G.m+" 🪙 por missão, +"+RD_G.fim+" ao fechar."));
  const bar=rdEl("div","bar rdbar");const i=rdEl("i");i.style.width=Math.round(100*n/L.length)+"%";bar.append(i);bar.setAttribute("role","progressbar");bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax",String(L.length));bar.setAttribute("aria-valuenow",String(n));bar.setAttribute("aria-label","Missões feitas");p.append(bar);
  const next=L.find(m=>!r[v][m[0]]);
  if(next)p.append(rdEl("div","tag","[ PRÓXIMA MISSÃO ]"),rdCard(v,next,true));
  else p.append(rdEl("p","rddone","✓ Trilha completa. Você pode rever qualquer missão abaixo."));
  const d=rdEl("details","rdall");d.open=rdAll||!next;d.addEventListener("toggle",()=>{rdAll=d.open;});d.append(rdEl("summary",null,"Todas as missões ("+n+"/"+L.length+")"));
  const g=rdEl("div","rdlist");for(const m of L)if(m!==next)g.append(rdCard(v,m,false));d.append(g);p.append(d);
  p.append(rdEl("p","sm rdnote",RD_NOTE));
  if(keep&&keep.rd){const b=p.querySelector('[data-rd="'+keep.rd+'"] .rdbtn')||p.querySelector(".rdbtn");if(b)try{b.focus({preventScroll:true});}catch(e){}}}
// Ouro que não coube no teto do dia (200) entra no dia seguinte: a chave só é gravada quando o Ouro entra
function rdPay(){const v=rdVer();if(!v||typeof orGive!=="function"||typeof orReady!=="function"||!orReady())return;const r=rdSt(),L=v==="b"?RD_B:RD_A,got=orX().got;
  for(const m of L)if(r[v][m[0]]&&!got["pr:"+m[0]])orGive("pr:"+m[0],RD_G.m,"Primeira Renda");
  if(L.every(m=>r[v][m[0]])&&!got["pr:fim:"+v])orGive("pr:fim:"+v,RD_G.fim,"Trilha completa");}
{const _r=render;render=function(){_r.apply(this,arguments);try{rdRender();}catch(e){}clearTimeout(rdPay._t);rdPay._t=setTimeout(()=>{try{rdPay();}catch(e){}},900);};}
setTimeout(()=>{try{rdRender();}catch(e){}},60);
