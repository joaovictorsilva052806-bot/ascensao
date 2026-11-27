// ---------- Arsenal do Herói: vitrine de afiliados (só 18+), pedido da EVA 7219654001 + parecer do ATLAS (7221075738) ----------
// Só para 18+ pela trava de tools/idade.js. Mesma lista fixa para todo mundo: sem recomendação personalizada e sem rastreio próprio.
// Selo de publicidade visível sem clique ao lado de cada link (CONAR 2026 + CDC art. 36). Nada sai do aparelho além do toque no link.
// AFIL vazio = a vitrine não aparece. O JV preenche as tags quando abrir as contas (é público no site: tag de afiliado não é segredo).
// Itens por módulo: Estudo (10 livros do ATLAS) e Forja (lista do ARES, ainda vazia: o grupo some). Não grava nada no progresso.
const AFIL={amz:'',ml:''};
const AF_SEAL="Publicidade · link de afiliado: o criador do app ganha comissão se você comprar";
// [título, autor, 1 frase honesta, busca na loja, link do Mercado Livre (opcional, gerado pelo JV)]
const AF_ITEMS={
 estudo:[
  ["Hábitos Atômicos","James Clear","Mostra como hábitos pequenos se somam, com passos práticos para começar bem pequeno.","Hábitos Atômicos James Clear"],
  ["O Poder do Hábito","Charles Duhigg","Explica o ciclo deixa, rotina e recompensa que existe por trás dos hábitos.","O Poder do Hábito Charles Duhigg"],
  ["Trabalho Focado","Cal Newport","Defende blocos longos sem distração para o trabalho que exige concentração.","Trabalho Focado Cal Newport"],
  ["Mindset","Carol S. Dweck","Compara a mentalidade fixa com a de crescimento e o que isso muda no jeito de aprender.","Mindset Carol Dweck"],
  ["Garra","Angela Duckworth","Sobre persistência e interesse de longo prazo, com as pesquisas da autora.","Garra Angela Duckworth"],
  ["Essencialismo","Greg McKeown","Ajuda a dizer não ao que não importa para fazer bem o que importa.","Essencialismo Greg McKeown"],
  ["A Arte de Fazer Acontecer (GTD)","David Allen","O método GTD: tirar tudo da cabeça e organizar em listas de próximas ações.","A Arte de Fazer Acontecer David Allen"],
  ["Rápido e Devagar","Daniel Kahneman","Os dois modos de pensar e os atalhos que levam a erros de julgamento. Leitura mais densa.","Rápido e Devagar Kahneman"],
  ["Mentes Inquietas","Ana Beatriz Barbosa Silva","Livro de divulgação sobre TDAH. Não substitui a avaliação de um profissional de saúde.","Mentes Inquietas Ana Beatriz Barbosa Silva"],
  ["Como Fazer Amigos e Influenciar Pessoas","Dale Carnegie","Clássico sobre conversa e relacionamento, com dicas simples do dia a dia.","Como Fazer Amigos e Influenciar Pessoas Dale Carnegie"]],
 forja:[]};
const AF_GROUPS=[["forja","⚒️ Forja"],["estudo","📚 Estudo"]];
function afEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
const afTag=v=>String(v||"").trim().replace(/[^A-Za-z0-9_-]/g,"").slice(0,40);
function afLink(it){const amz=afTag(AFIL.amz);if(amz&&it[3])return "https://www.amazon.com.br/s?k="+encodeURIComponent(it[3])+"&tag="+encodeURIComponent(amz);
  if(afTag(AFIL.ml)&&it[4]){try{const u=new URL(it[4]);if(u.protocol==="https:")return u.href;}catch(e){}}return "";}
function afOn(){return (!!afTag(AFIL.amz)||!!afTag(AFIL.ml))&&typeof ad18==="function"&&ad18();}
function afRender(){let p=$("afPanel");const groups=afOn()?AF_GROUPS.map(([k,n])=>[n,(AF_ITEMS[k]||[]).map(it=>[it,afLink(it)]).filter(x=>x[1])]).filter(g=>g[1].length):[];
  if(!groups.length){if(p)p.hidden=true;return;}
  if(!p){const ms=document.querySelectorAll('.wrap>section[data-tab="mais"]:not(#afPanel)');const anchor=ms[ms.length-1];if(!anchor)return;p=afEl("section","panel afpanel");p.id="afPanel";p.dataset.tab="mais";anchor.after(p);}
  p.hidden=false;p.textContent="";const hd=afEl("div","qhead");hd.append(afEl("h2",null,"🛡️ Arsenal do Herói"),afEl("span","sm mono","publicidade"));p.append(hd);
  p.append(afEl("div","sm muted","Livros e equipamentos que o time indica, a mesma lista para todo mundo. Comprar é opcional e não muda nada no jogo."));
  for(const [n,L] of groups){p.append(afEl("h3","afh",n));const g=afEl("div","afgrid");
    for(const [it,url] of L){const c=afEl("div","afitem");c.append(afEl("b","aft",it[0]),afEl("span","sm afa",it[1]),afEl("p","aff",it[2]));
      const a=afEl("a","aflink","Ver na loja ↗");a.href=url;a.target="_blank";a.rel="sponsored noopener noreferrer";a.setAttribute("aria-label","Ver "+it[0]+" na loja. "+AF_SEAL);
      c.append(afEl("span","afseal",AF_SEAL),a);g.append(c);}
    p.append(g);}
  p.append(afEl("p","sm muted afnote","O preço e a compra são da loja. O app não sabe o que você comprou e não guarda nada disso."));}
{const _r=render;render=function(){_r.apply(this,arguments);try{afRender();}catch(e){}};}
setTimeout(()=>{try{afRender();}catch(e){}},90);
