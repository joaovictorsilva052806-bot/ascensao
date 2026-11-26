// ---------- Trocar esta tarefa (1ª semana): outra do mesmo foco, com o mesmo XP, dias e se é principal ----------
// Pedido dos testadores: tarefa genérica que não serve (ex.: ônibus para quem não anda de ônibus). Mexe só no texto da tarefa em cfg; guarda a original em q.orig.
const SW_GRP={s_rev:"estudo",s_bloco:"estudo",s_aula:"estudo",s_provas:"estudo",s_mochila:"estudo",s_sono:"sono",s_treino:"corpo",s_along:"corpo",s_almoco:"corpo",s_carr:"carreira",s_gasto:"dinheiro",s_tela:"tela",s_ler:"leitura",s_amor:"relac",s_familia:"relac",s_casa:"casa",s_agua:"agua",s_meta_d:"meta",s_meta:"meta",s_foco:"trabalho",s_eu:"eu"};
function swFree(P){return P.free==="manha"?"De manhã, no meu horário livre":P.free==="tarde"?"À tarde, no meu horário livre":P.free==="noite"?"À noite, no meu horário livre":"Logo depois da primeira refeição do dia";}
function swAlts(q){const P=(cfg&&cfg.profile)||{};const F=swFree(P),g=SW_GRP[q.id],goal=String(P.goal||"").slice(0,60),minor=P.age==="kid"||P.age==="teen";
  const A={
    estudo:[{t:"Montar 10 flashcards da última aula",m:"3 cards",i:F+", abro o caderno e escrevo uma pergunta por card."},
      {t:"Resolver 5 exercícios da matéria mais difícil",m:"2 exercícios",i:F+", abro a lista antes de qualquer rede social."},
      {t:"Explicar a matéria em voz alta por 5 min, como se ensinasse alguém",m:"2 min",i:F+", fecho o caderno e explico sem olhar."},
      {t:"Fazer um resumo de 1 página da última aula",m:"5 linhas",i:F+", com o material aberto e o celular longe."}],
    sono:[{t:"Celular fora do quarto 30 min antes de deitar",m:"fora da cama",i:"Quando escovar os dentes à noite, deixo o celular carregando fora do quarto."},
      {t:"Desligar telas 30 min antes de dormir",m:"15 min",i:"Quando der o horário, troco a tela por um banho ou um livro."},
      {t:"Acordar no mesmo horário de ontem",m:"até 30 min de diferença",i:"Quando o alarme tocar, levanto e abro a janela."}],
    corpo:[{t:"3 séries de agachamento e flexão",m:"1 série",i:F+", ponho uma música e começo."},
      {t:"Caminhada de 15 min",m:"5 min",i:F+", calço o tênis antes de pensar."},
      {t:"Alongar 5 min (pernas, costas e pescoço)",m:"1 min",i:"Quando levantar da cadeira depois de um bloco de estudo ou trabalho, alongo."},
      {t:"Subir e descer escada por 5 min",m:"2 min",i:F+", uso a escada mais perto."}],
    carreira:[{t:"Atualizar 1 parte do currículo ou do LinkedIn",m:"1 linha",i:F+", abro o arquivo e mudo só uma parte."},
      {t:"Assistir 1 aula de um curso online da sua área",m:"10 min",i:F+", com fone e o celular no silencioso."},
      {t:"Mandar 1 mensagem para alguém da área que você admira",m:"escrever o rascunho",i:F+", escrevo 3 linhas e envio."}],
    dinheiro:[{t:"Anotar o maior gasto do dia (1 min)",m:"só o valor",i:"Antes de dormir, abro o app e anoto."},
      {t:"Conferir o saldo e achar 1 gasto para cortar",m:"só conferir o saldo",i:F+", abro o app do banco por 3 min."},
      {t:"Passar um dia sem compra por impulso",m:"esperar 24 h antes de comprar",i:"Quando der vontade de comprar algo, salvo e decido amanhã."}],
    tela:[{t:"Celular em outro cômodo por 1 hora",m:"30 min",i:F+", deixo o celular carregando longe."},
      {t:"Tirar 1 app de rede social da tela inicial",m:"esconder numa pasta",i:"Agora mesmo, seguro o ícone e tiro da tela inicial."},
      {t:"Desligar as notificações de 1 app",m:"silenciar por hoje",i:"Quando uma notificação inútil chegar, desligo as notificações daquele app."}],
    leitura:[{t:"Ler 5 páginas antes de dormir",m:"1 página",i:"Quando deitar, livro na mão no lugar do celular."},
      {t:"Ler 1 capítulo de um livro",m:"5 páginas",i:F+", 15 min de leitura com o celular longe."},
      {t:"Ouvir 15 min de audiolivro ou podcast que ensina algo",m:"5 min",i:"Quando estiver andando ou arrumando a casa, dou play."}],
    relac:[{t:"Ligar 5 min para alguém de quem você gosta",m:"um áudio",i:F+", escolho uma pessoa e ligo."},
      {t:"Elogiar alguém de verdade hoje",m:"uma mensagem",i:"Quando alguém fizer algo legal, falo na hora."},
      {t:minor?"Fazer algo junto com alguém da família por 15 min":"Fazer algo junto com alguém por 15 min (refeição, jogo ou caminhada)",m:"5 min",i:"Na hora da refeição, celular longe da mesa."}],
    casa:[{t:"Arrumar a cama ao levantar",m:"esticar o lençol",i:"Quando levantar, antes de pegar o celular."},
      {t:"Guardar 10 coisas fora do lugar",m:"5 coisas",i:F+", ponho uma música e guardo."},
      {t:"Lavar a louça logo depois de comer",m:"só o que eu usei",i:"Quando terminar de comer, levo o prato direto para a pia."}],
    agua:[{t:"Garrafa cheia na mesa desde cedo",m:"meia garrafa",i:"Quando acordar, encho a garrafa e deixo à vista."},
      {t:"1 copo de água ao acordar e 1 em cada refeição",m:"2 copos",i:"Quando sentar para comer, bebo 1 copo antes."}],
    meta:goal?[{t:"Pesquisar 10 min sobre: "+goal,m:"5 min",i:F+", anoto 3 coisas que aprendi."},
      {t:"Falar com 1 pessoa que já conseguiu: "+goal,m:"mandar a mensagem",i:F+", escrevo uma pergunta curta e envio."},
      {t:"Fazer a menor parte possível de: "+goal,m:"2 min",i:F+", começo pelo passo mais fácil."}]:[],
    trabalho:[{t:"Responder o cliente ou orçamento que está parado",m:"1 mensagem",i:"Logo depois do café, antes de abrir redes sociais."},
      {t:"Postar 1 conteúdo do seu trabalho",m:"1 story",i:F+", tiro uma foto de algo que fiz hoje."},
      {t:"Listar 3 pessoas para oferecer seu serviço",m:"1 pessoa",i:F+", abro os contatos e escolho."}],
    eu:[{t:"15 min fazendo algo que você gosta, sem culpa",m:"5 min",i:F+", escolho uma coisa só para mim."},
      {t:"Pausa de 10 min ao ar livre",m:"3 min",i:"Depois do almoço, saio na porta ou na janela."}]};
  return (A[g]||[]).filter(a=>P.transport==="onibus"||!/ônibus|onibus/i.test(a.t+a.i));}
function swDays(){const s=cfg&&(cfg.swFrom||cfg.startDate);if(!s)return 99;const [y,m,d]=s.split("-").map(Number);return Math.floor((new Date(todayKey().replace(/-/g,"/"))-new Date(y,m-1,d))/864e5);}
function swCan(q){return !!(q&&cfg&&cfg.profile&&SW_GRP[q.id]&&swDays()<7&&!msDone(q)&&swAlts(q).length&&(cfg.quests||[]).some(x=>x.id===q.id));}
function swDo(q){const c=(cfg.quests||[]).find(x=>x.id===q.id);if(!c)return;
  if(!c.orig)c.orig={t:c.title,m:c.minTitle||"",i:c.ifThen||""};
  const list=[c.orig].concat(swAlts(c).filter(a=>a.t!==c.orig.t));const cur=list.findIndex(a=>a.t===c.title);const nx=list[(cur+1)%list.length];
  const prev={t:c.title,m:c.minTitle||"",i:c.ifThen||""};
  const ap=a=>{c.title=a.t;if(a.m)c.minTitle=a.m;else delete c.minTitle;if(a.i)c.ifThen=a.i;else delete c.ifThen;try{localStorage.setItem(CFG_KEY,JSON.stringify(cfg));}catch(e){}};
  ap(nx);prog.swaps=(+prog.swaps||0)+1;save();try{haptic(10);}catch(e){}render();msQ=msFind(c.id)||msQ;msRender();
  toast(nx===c.orig?"Voltou a tarefa original.":"Trocada. Toque de novo para ver outra.");
  setTimeout(()=>{const t=$("toast");if(!t||t.hidden)return;const u=msEl("button","link","Desfazer");u.type="button";u.addEventListener("click",()=>{ap(prev);render();msQ=msFind(c.id)||msQ;if(!$("msSheet").hidden)msRender();toast("Desfeito.");});t.append(" ",u);},30);}
{const _mr=msRender;msRender=function(){_mr();try{const q=msQ&&msFind(msQ.id);const card=document.querySelector("#msSheet .mscard");if(!card||!swCan(q))return;
  const b=msEl("button","ghost msswap","🔄 Trocar esta tarefa");b.type="button";b.setAttribute("aria-label","Trocar esta tarefa por outra do mesmo tipo");b.addEventListener("click",()=>swDo(q));
  const no=card.querySelector(".msno");if(no)no.before(b);else card.append(b);}catch(e){}};}
