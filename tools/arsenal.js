// ---------- Arsenal do Herói: vitrine de afiliados (só 18+), pedido da EVA 7219654001 + parecer do ATLAS (7221075738) ----------
// Só para 18+ pela trava de tools/idade.js. Mesma lista fixa para todo mundo: sem recomendação personalizada e sem rastreio próprio.
// Selo de publicidade visível sem clique ao lado de cada link (CONAR 2026 + CDC art. 36). Nada sai do aparelho além do toque no link.
// As tags vêm de afiliados.json (na raiz do site): o JV liga a vitrine editando 1 arquivo, sem trem novo. AFIL aqui é só o reserva.
// Tag de afiliado não é segredo (aparece em todo link), por isso pode ficar no repositório público. Tudo vazio = a vitrine some.
// Momentos certos, sem culpa e sem pressa: (1) aba Mais; (2) atalho na Meta de leitura quando não há livro em andamento e no Estudo;
// (3) "Dica da semana" em Hoje SÓ depois do dia completo, no máximo 1 vez por semana, a partir do 4º dia de conta, com "Agora não"
// e "Não quero dicas". Sem contagem regressiva, sem "só hoje", sem prêmio no jogo por comprar e nada de sorteio.
// Medição: só conta (vistas e toques, sem qual livro) para quem LIGOU o envio anônimo do beta, dentro da linha diária que já existe.
// Grava só fora do progresso: asc-u-vitrine (cópia do afiliados.json) e asc-u-dica ({w: semana vista, x: semana dispensada, off}).
const AFIL={amz:'',ml:''};
const AF_SEAL="Publicidade · link de afiliado: o criador do app ganha comissão se você comprar";
const AF_AMZ="Como associado da Amazon, o criador do app ganha com compras qualificadas.";
const AF_CFG_KEY="asc-u-vitrine",AF_DICA_KEY="asc-u-dica";
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
const AF_DICA_DAYS=3;
let afCfg=null,afTry=0,afGot=0;const afSeen={};
function afEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
const afTag=v=>String(v||"").trim().replace(/[^A-Za-z0-9_-]/g,"").slice(0,40);
const afHttps=u=>{try{const x=new URL(String(u||""));return x.protocol==="https:"?x.href:"";}catch(e){return "";}};
// afiliados.json: {"amazon":"tag-20","mercadolivre":"","apoio":"https://..."}; o arquivo manda, AFIL é o reserva
function afClean(j){if(!j||typeof j!=="object"||Array.isArray(j))return null;return {amz:afTag(j.amazon),ml:afTag(j.mercadolivre),apoio:afHttps(j.apoio)};}
function afUrl(){return (location.pathname.indexOf("/comecar/")>=0?"../":"")+"afiliados.json";}
function afLoad(){if(afGot||afTry>1)return;afTry++;
  if(!afCfg)try{afCfg=afClean(JSON.parse(localStorage.getItem(AF_CFG_KEY)||"null"));}catch(e){}
  try{fetch(afUrl(),{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(j=>{const c=afClean(j);if(!c)return;afGot=1;afCfg=c;try{localStorage.setItem(AF_CFG_KEY,JSON.stringify(j));}catch(e){}afRender();}).catch(()=>{});}catch(e){}}
function afK(k){const c=afCfg||{};return afTag(c[k])||afTag(AFIL[k]);}
function afApoio(){const c=afCfg||{};if(!c.apoio)return "";
  // na loja da Apple, doação/gorjeta fora do app é barrada (regras 3.1.1 e 3.2.2): no app nativo o apoio não aparece
  try{const C=window.Capacitor;if(C&&C.isNativePlatform&&C.isNativePlatform())return "";}catch(e){}return c.apoio;}
function afLink(it){const amz=afK("amz");if(amz&&it[3])return "https://www.amazon.com.br/s?k="+encodeURIComponent(it[3])+"&tag="+encodeURIComponent(amz);
  if(afK("ml")&&it[4]){const u=afHttps(it[4]);if(u)return u;}return "";}
function af18(){return typeof ad18==="function"&&ad18();}
function afOn(){return (!!afK("amz")||!!afK("ml"))&&af18();}
// medição anônima: só soma no contador por aba do beta (só existe no /comecar/ e só conta com o envio ligado)
function afCount(k,once){if(once){const tk=todayKey()+k;if(afSeen[tk])return;afSeen[tk]=1;}try{if(typeof betaTab==="function")betaTab(k);}catch(e){}}
function afA(it,url,lbl,cls,k){const a=afEl("a",cls||"aflink",lbl||"Ver na loja ↗");a.href=url;a.target="_blank";a.rel="sponsored noopener noreferrer";
  a.setAttribute("aria-label","Ver "+it[0]+" na loja. "+AF_SEAL);a.addEventListener("click",()=>afCount(k||"afc"));return a;}
function afGroups(){return afOn()?AF_GROUPS.map(([k,n])=>[n,(AF_ITEMS[k]||[]).map(it=>[it,afLink(it)]).filter(x=>x[1])]).filter(g=>g[1].length):[];}
function afRender(){afLoad();let p=$("afPanel");const groups=afGroups(),apoio=af18()?afApoio():"";
  {const on=groups.length>0;Promise.resolve().then(()=>{try{afWrapUI();afHooks(on);}catch(e){}});}try{afDica(groups);}catch(e){}
  if(!groups.length&&!apoio){if(p)p.hidden=true;return;}
  if(!p){const ms=document.querySelectorAll('.wrap>section[data-tab="mais"]:not(#afPanel)');const anchor=ms[ms.length-1];if(!anchor)return;p=afEl("section","panel afpanel");p.id="afPanel";p.dataset.tab="mais";anchor.after(p);}
  p.hidden=false;p.textContent="";const hd=afEl("div","qhead");hd.append(afEl("h2",null,"🛡️ Arsenal do Herói"),afEl("span","sm mono","publicidade"));p.append(hd);
  if(groups.length){p.append(afEl("div","sm muted","Livros e equipamentos que o time indica, a mesma lista para todo mundo. Comprar é opcional e não muda nada no jogo."));
    for(const [n,L] of groups){p.append(afEl("h3","afh",n));const g=afEl("div","afgrid");
      for(const [it,url] of L){const c=afEl("div","afitem");c.append(afEl("b","aft",it[0]),afEl("span","sm afa",it[1]),afEl("p","aff",it[2]));
        c.append(afEl("span","afseal",AF_SEAL),afA(it,url));g.append(c);}
      p.append(g);}
    p.append(afEl("p","sm muted afnote","O preço e a compra são da loja. O app não sabe o que você comprou e não guarda nada disso."+(afK("amz")?" "+AF_AMZ:"")));}
  if(apoio){const box=afEl("div","afapoio");box.append(afEl("b",null,"☕ Apoie o criador"),afEl("span","sm muted","Opcional, de qualquer valor. Não libera nada no jogo: o app é o mesmo para quem apoia e para quem não apoia."));
    const a=afEl("a","aflink","Apoiar ↗");a.href=apoio;a.target="_blank";a.rel="noopener noreferrer";a.addEventListener("click",()=>afCount("afap"));box.append(a);p.append(box);}
  if(document.body.dataset.tab==="mais")afCount("afv",true);}
// atalhos no lugar em que a pessoa pensa em livro: Meta de leitura sem livro em andamento e o painel de Estudo
function afGo(){if(typeof goTab==="function")goTab("mais");afRender();setTimeout(()=>{const p=$("afPanel");if(p&&!p.hidden)p.scrollIntoView({block:"start"});},60);}
function afHooks(on){for(const [pid,lbl,need] of [["lrPanel","📚 Procurando o próximo livro? Veja os que o time indica","nobook"],["stPanel","📚 Livros que o time indica para estudar melhor",""]]){
  const host=$(pid);let b=host&&host.querySelector(".afgo");
  let show=on&&!!host&&!host.hidden;
  if(show&&need==="nobook"){try{const r=prog.leitura||prog.lr||null;const bk=typeof lrSt==="function"?lrSt().book:r&&r.book;if(bk&&bk.t)show=false;}catch(e){}}
  if(!show){if(b)b.remove();continue;}
  if(!b){b=afEl("button","link afgo");b.type="button";b.addEventListener("click",()=>{afCount("afh");afGo();});host.append(b);}
  b.textContent=lbl+" · publicidade";}}
// Meta de leitura e Estudo redesenham o painel inteiro: depois de cada redesenho, o atalho volta (1 embrulho só)
let afWrapped=0;const afAfter=f=>function(){const r=f.apply(this,arguments);try{afHooks(afGroups().length>0);}catch(e){}return r;};
function afWrapUI(){if(afWrapped)return;afWrapped=1;try{if(typeof lrUI==="function")lrUI=afAfter(lrUI);}catch(e){}try{if(typeof stRender==="function")stRender=afAfter(stRender);}catch(e){}}
// Dica da semana: 1 livro por semana, igual para todo mundo (vem da semana do ano, não da pessoa)
function afWeek(){const [y,m,d]=todayKey().split("-").map(Number);return Math.floor((Date.UTC(y,m-1,d)/864e5+3)/7);}
function afDicaSt(){try{const o=JSON.parse(localStorage.getItem(AF_DICA_KEY)||"{}");return o&&typeof o==="object"?o:{};}catch(e){return {};}}
function afDicaSet(o){try{localStorage.setItem(AF_DICA_KEY,JSON.stringify(o));}catch(e){}}
function afDicaOk(){const s=afDicaSt(),w=afWeek();if(s.off||s.x===w)return false;
  if(typeof adGoldOk==="function"){try{const st=cfg&&/^\d{4}-\d{2}-\d{2}$/.test(cfg.startDate||"")?cfg.startDate:null;if(st&&adDiff(st,todayKey())<AF_DICA_DAYS)return false;}catch(e){}}
  if(s.w===w&&s.d!==todayKey())return false; // já apareceu outro dia desta semana
  try{return typeof allMainsDone==="function"&&allMainsDone(new Date());}catch(e){return false;}}
function afDica(groups){let p=$("afDica");const L=[];for(const [,g] of groups||[])for(const x of g)L.push(x);
  if(!L.length||!afDicaOk()){if(p)p.hidden=true;return;}
  const [it,url]=L[afWeek()%L.length];
  if(!p){const hs=document.querySelectorAll('.wrap>section[data-tab="hoje"]:not(#afDica)');const anchor=hs[hs.length-1];if(!anchor)return;p=afEl("section","panel afdica");p.id="afDica";p.dataset.tab="hoje";p.dataset.sf="1";anchor.after(p);}
  const s=afDicaSt(),w=afWeek();if(s.w!==w){s.w=w;s.d=todayKey();afDicaSet(s);}
  p.hidden=false;p.textContent="";const hd=afEl("div","qhead");hd.append(afEl("h2",null,"📚 Dica da semana"),afEl("span","sm mono","publicidade"));p.append(hd);
  p.append(afEl("div","sm muted","Dia completo. Se quiser uma leitura para a próxima fase, esta é a do time nesta semana."));
  const c=afEl("div","afitem");c.append(afEl("b","aft",it[0]),afEl("span","sm afa",it[1]),afEl("p","aff",it[2]),afEl("span","afseal",AF_SEAL));
  const row=afEl("div","row afrow");row.append(afA(it,url,"Ver na loja ↗","aflink","afdc"));
  const no=afEl("button","ghost","Agora não");no.type="button";no.onclick=()=>{const o=afDicaSt();o.x=afWeek();afDicaSet(o);p.hidden=true;};
  const off=afEl("button","link","Não quero dicas");off.type="button";off.onclick=()=>{const o=afDicaSt();o.off=1;afDicaSet(o);p.hidden=true;toast("Combinado: sem dicas. O Arsenal continua em Mais, se um dia quiser.");};
  row.append(no);c.append(row,off);p.append(c);
  if(document.body.dataset.tab==="hoje")afCount("afd",true);}
{const _r=render;render=function(){_r.apply(this,arguments);try{afRender();}catch(e){}};}
{const _g=typeof goTab==="function"?goTab:null;if(_g)goTab=function(t){_g.apply(this,arguments);try{if(t==="mais"&&$("afPanel")&&!$("afPanel").hidden)afCount("afv",true);if(t==="hoje"&&$("afDica")&&!$("afDica").hidden)afCount("afd",true);}catch(e){}};}
setTimeout(()=>{try{afRender();}catch(e){}},90);
