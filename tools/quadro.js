// ---------- 📜 Quadro de Missões (conteúdo v1 da EVA, 28/11): 30 missões curtas de estudo (ATLAS) e treino em casa (ARES) ----------
// 3 ofertas por dia (1 estudo, 1 treino, 1 alternada), fixas pelo dia (hash da data, como o chefe da semana): não dá para "trocar até gostar".
// Aceitar copia para prog.extra[hoje] (formato de quest que já existe) com id "mq_e01:AAAA-MM-DD". Sempre opcional: nunca principal,
// não gera dívida nem quebra sequência. XP 10/15/20; mínimo vale metade (regra do app). Sem Ouro por missão:
// 5 missões do Quadro na mesma semana = +20 Ouro uma vez (orGive "mq:<segunda>", respeita o teto do dia).
// Quem não estuda: a vaga de estudo vira leitura/plano (as missões de estudo que não pedem aula). Não grava nada além de prog.extra.
const MQ_ESTUDO=[
 {id:"mq_e01",title:"📜 Página em branco: 5 min escrevendo tudo o que lembra da última aula, de caderno fechado",xp:15,stat:"mente",attrs:["intel","sabed"],minTitle:"3 tópicos",fala:"ATLAS: Lembrar é o treino. Reler é só olhar.",aula:1},
 {id:"mq_e02",title:"🃏 Criar 5 flashcards da matéria de hoje (pergunta na frente)",xp:10,stat:"mente",attrs:["intel","disc"],minTitle:"2 cards",fala:"ATLAS: Uma pergunta bem feita vale dez páginas grifadas.",aula:1},
 {id:"mq_e03",title:"🧒 Explicar 1 conceito em voz alta como para uma criança de 10 anos (3 min)",xp:15,stat:"mente",attrs:["intel","caris"],minTitle:"1 min",fala:"ATLAS: Travou na explicação? Achou o buraco. Ótimo."},
 {id:"mq_e04",title:"❓ Escrever 3 questões que cairiam na prova e responder sem consultar",xp:15,stat:"mente",attrs:["intel","disc"],minTitle:"1 questão",fala:"ATLAS: Pense como quem faz a prova.",aula:1},
 {id:"mq_e05",title:"🔀 20 min de questões alternando 2 matérias",xp:20,stat:"mente",attrs:["intel","disc"],minTitle:"10 min",fala:"ATLAS: Misturar parece mais difícil. É por isso que funciona.",aula:1},
 {id:"mq_e06",title:"🗺️ Mapa mental de 1 capítulo em 1 folha, sem copiar frases",xp:20,stat:"mente",attrs:["intel","criat"],minTitle:"o centro e 3 ramos",fala:"ORION e ATLAS: Todo mapa começou com um rabisco."},
 {id:"mq_e07",title:"⏱️ Bloco de foco de 25 min com o celular em outro cômodo",xp:20,stat:"mente",attrs:["intel","disc"],minTitle:"10 min",fala:"ATLAS: O celular longe vale mais que força de vontade."},
 {id:"mq_e08",title:"🔁 Revisão do 3º dia: testar-se no que estudou 3 dias atrás (10 min)",xp:15,stat:"mente",attrs:["intel","sabed"],minTitle:"5 min",fala:"ATLAS: Quase esquecer e lembrar de novo é o que fixa.",aula:1},
 {id:"mq_e09",title:"🐛 Refazer 3 questões que errou e escrever por que errou",xp:20,stat:"mente",attrs:["intel","sabed"],minTitle:"1 questão",fala:"ATLAS: Erro anotado é erro que não volta.",aula:1},
 {id:"mq_e10",title:"🔗 Ligar o assunto de hoje a algo da sua vida, em 3 frases",xp:10,stat:"mente",attrs:["intel","sabed"],minTitle:"1 frase",fala:"ATLAS: O que tem gancho não cai."},
 {id:"mq_e11",title:"📖 Ler 10 páginas anotando 1 dúvida por página",xp:15,stat:"mente",attrs:["intel","sabed"],minTitle:"3 páginas",fala:"ATLAS: Leitor com dúvida lê o dobro."},
 {id:"mq_e12",title:"🎯 Plano da semana: listar 3 entregas e o 1º passo de cada (10 min)",xp:10,stat:"foco",attrs:["disc","intel"],minTitle:"só a 1ª entrega",fala:"EVA: Uma tarefa. Agora. Mas primeiro, qual?"},
 {id:"mq_e13",title:"📝 Resumir a aula de hoje em 5 linhas, com as suas palavras",xp:10,stat:"mente",attrs:["intel","sabed"],minTitle:"2 linhas",fala:"ATLAS: Se não cabe em 5 linhas, ainda não entendeu.",aula:1},
 {id:"mq_e14",title:"🧪 Mini-simulado: 10 questões no tempo, sem consulta, e conferir",xp:20,stat:"mente",attrs:["intel","disc"],minTitle:"5 questões",fala:"ATLAS: Treino com relógio, prova sem susto.",aula:1},
 {id:"mq_e15",title:"📣 Mandar para a Guilda 1 dica do que aprendeu hoje",xp:15,stat:"mente",attrs:["caris","intel"],minTitle:"1 frase",fala:"ATLAS: Ensinar é estudar duas vezes."}];
const MQ_TREINO=[
 {id:"mq_t01",title:"🪑 Levantar e sentar da cadeira: 3 séries de 8, devagar",xp:10,stat:"corpo",attrs:["forca","vital"],minTitle:"1 série",fala:"ARES: Devagar também é forte."},
 {id:"mq_t02",title:"🧱 Flexão na parede ou na mesa: 3 séries de 8 a 12",xp:10,stat:"corpo",attrs:["forca","disc"],minTitle:"1 série",fala:"ARES: Todo mundo começa na parede."},
 {id:"mq_t03",title:"🦵 Agachamento com pausa de 2 s embaixo: 3 séries de 8",xp:15,stat:"corpo",attrs:["forca","vital"],minTitle:"1 série",fala:"ARES: A pausa tira o embalo. Sobra a força."},
 {id:"mq_t04",title:"🌉 Ponte de glúteo no chão: 3 séries de 12",xp:10,stat:"corpo",attrs:["forca","vital"],minTitle:"1 série",fala:"ARES: Base firme, resto firme."},
 {id:"mq_t05",title:"🧘 Mobilidade de 8 min: pescoço, ombros, quadril e tornozelos",xp:10,stat:"corpo",attrs:["vital","sabed"],minTitle:"3 min",fala:"ARES: Corpo solto treina melhor amanhã."},
 {id:"mq_t06",title:"🐻 Prancha: 3 vezes de 20 a 30 s, com 30 s de descanso (joelho no chão vale)",xp:15,stat:"corpo",attrs:["forca","disc"],minTitle:"1 prancha",fala:"ARES: Firme, não tremendo até cair."},
 {id:"mq_t07",title:"🚶 Caminhada de 20 min no seu ritmo, em lugar movimentado",xp:15,stat:"corpo",attrs:["forca","vital"],minTitle:"10 min",fala:"ARES: Ritmo de conversa. Sem pressa."},
 {id:"mq_t08",title:"🪜 Subir e descer 1 degrau por 5 min, segurando no corrimão",xp:15,stat:"corpo",attrs:["forca","vital"],minTitle:"2 min",fala:"ARES: Um degrau de cada vez. Literalmente."},
 {id:"mq_t09",title:"⚔️ Circuito do Guerreiro: 3 voltas de 10 agachamentos, 8 flexões (parede ou joelho) e 20 s de prancha",xp:20,stat:"corpo",attrs:["forca","disc"],minTitle:"1 volta",fala:"ARES: Três voltas. Nenhuma corrida."},
 {id:"mq_t10",title:"🥋 Afundo alternado com apoio na parede: 3 séries de 8 por perna",xp:15,stat:"corpo",attrs:["forca","vital"],minTitle:"1 série",fala:"ARES: Equilíbrio primeiro, carga depois."},
 {id:"mq_t11",title:"🎵 Mexer o corpo por 3 músicas: dança, polichinelo ou marcha parada",xp:10,stat:"corpo",attrs:["forca","criat"],minTitle:"1 música",fala:"ARES: Treino que parece festa também conta."},
 {id:"mq_t12",title:"⏰ Pausa ativa: levantar e andar 2 min a cada hora sentado (3 vezes hoje)",xp:10,stat:"corpo",attrs:["vital","disc"],minTitle:"1 vez",fala:"ARES: Cadeira não é inimiga. Ficar nela é."},
 {id:"mq_t13",title:"🦩 Equilíbrio: 30 s num pé só de cada lado, 3 vezes, perto da parede",xp:10,stat:"corpo",attrs:["vital","disc"],minTitle:"1 vez",fala:"ARES: Parede por perto. Orgulho longe."},
 {id:"mq_t14",title:"🐕 Quatro apoios, braço e perna opostos: 3 séries de 8 por lado",xp:10,stat:"corpo",attrs:["forca","disc"],minTitle:"1 série",fala:"ARES: Lento e controlado. Ninguém está cronometrando."},
 {id:"mq_t15",title:"🤝 Treino da Guilda: 10 min do mesmo treino que 1 amigo, no mesmo dia",xp:20,stat:"corpo",attrs:["forca","caris"],minTitle:"só você, 5 min",fala:"ARES: Sozinho você treina. Junto você volta."}];
const MQ_MAX=3,MQ_WEEK=5,MQ_OURO=20;
function mqEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function mqStudies(){const P=(cfg&&cfg.profile)||{};return !!(P.studies||P.level||/^(estudante|escola|faculdade)$/.test(P.occ||""));}
function mqHash(s){let h=11;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h;}
// as 3 do dia: estudo, treino e uma alternada (dia par: estudo; ímpar: treino), sem repetir
function mqOffers(tk){tk=tk||todayKey();const h=mqHash(tk);const E=mqStudies()?MQ_ESTUDO:MQ_ESTUDO.filter(q=>!q.aula),T=MQ_TREINO;
  const e1=E[h%E.length],t1=T[(h>>>5)%T.length];const alt=(h>>>10)%2?T:E;let x=alt[(h>>>12)%alt.length];
  for(let i=1;x===e1||x===t1;i++)x=alt[((h>>>12)+i)%alt.length];return [e1,t1,x];}
function mqBase(id){return String(id||"").split(":")[0];}
function mqTaken(tk){tk=tk||todayKey();return (prog.extra[tk]||[]).filter(q=>/^mq_[et]\d\d:/.test(q.id));}
function mqDone(tk,id){return (prog.log[tk]||[]).find(e=>e.q===id);}
function mqAccept(q){const tk=todayKey();const L=mqTaken(tk);if(L.length>=MQ_MAX||L.some(x=>mqBase(x.id)===q.id))return false;
  const c={id:q.id+":"+tk,title:q.title,xp:q.xp,stat:q.stat,attrs:q.attrs.slice(),minTitle:q.minTitle,mq:1};
  prog.extra[tk]=(prog.extra[tk]||[]).concat([c]);save();try{haptic([10]);}catch(e){}toast("📜 Missão aceita. Está na sua lista de hoje.");render();return true;}
// 5 do Quadro na semana (segunda a domingo): +20 Ouro uma vez
function mqWeek(){const ws=typeof weekStart==="function"?weekStart(todayKey()):todayKey();let n=0;
  for(const k in prog.log){if(k<ws||k>todayKey())continue;n+=(prog.log[k]||[]).filter(e=>/^mq_[et]\d\d:/.test(String(e.q))).length;}return {ws,n};}
function mqOuro(){try{const w=mqWeek();if(w.n>=MQ_WEEK&&typeof orGive==="function"){const g=orGive("mq:"+w.ws,MQ_OURO,"Quadro de Missões");if(g)toast("📜 5 missões do Quadro nesta semana: +"+g+" Ouro");}}catch(e){}}
function mqRender(){let p=$("mqPanel");if(!cfg||cfg.blank||!cfg.quests||!cfg.quests.length){if(p)p.hidden=true;return;}
  const qs=$("quests");const sec=qs&&qs.closest("section");if(!sec)return;
  if(!p){p=mqEl("section","panel mqpanel");p.id="mqPanel";p.dataset.tab="hoje";sec.after(p);}
  p.hidden=false;const tk=todayKey(),L=mqTaken(tk),w=mqWeek();p.textContent="";
  const hd=mqEl("div","qhead");hd.append(mqEl("h2",null,"📜 Quadro de Missões"),mqEl("span","pill mqpill",Math.min(w.n,MQ_WEEK)+"/"+MQ_WEEK+" na semana"));p.append(hd);
  p.append(mqEl("p","sm muted",w.n>=MQ_WEEK?"Semana fechada no Quadro: +"+MQ_OURO+" Ouro garantido. As de hoje seguem valendo XP.":"Missões extras, sempre opcionais. 5 na semana = +"+MQ_OURO+" Ouro. Trocam amanhã."));
  const ul=mqEl("div","mqlist");
  for(const q of mqOffers(tk)){const c=mqEl("div","mqcard "+(q.stat==="corpo"?"mqt":"mqe"));const tk2=L.find(x=>mqBase(x.id)===q.id);const done=tk2&&mqDone(tk,tk2.id);
    c.append(mqEl("div","mqtag",(q.stat==="corpo"?"ARES · treino":"ATLAS · estudo")+" · "+"★".repeat(q.xp/5-1)),mqEl("b","mqt1",q.title),mqEl("div","sm mqfala",q.fala),
      mqEl("div","sm muted","+"+q.xp+" XP · mínimo: "+q.minTitle));
    const b=mqEl("button",tk2?"ghost":"go",done?"✓ Feita":tk2?"Na sua lista":"Aceitar");b.type="button";b.disabled=!!tk2||L.length>=MQ_MAX;
    if(!tk2)b.addEventListener("click",()=>{mqAccept(q);});
    if(tk2&&!done){b.disabled=false;b.addEventListener("click",()=>{const el=document.querySelector('#quests .quest[data-q="'+tk2.id+'"]');if(el)el.scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});});}
    c.append(b);ul.append(c);}
  p.append(ul);}
{const _r=render;render=function(){_r.apply(this,arguments);try{mqRender();}catch(e){}try{mqOuro();}catch(e){}};}
setTimeout(()=>{try{mqRender();}catch(e){}},0);
