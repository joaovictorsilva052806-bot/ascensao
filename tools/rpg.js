// ---------- RPG da vida real: atributos com nível, habilidades, classe, baú, treino diário ----------
const RPG_IC={foco:"🎯",vendas:"🏁",mente:"🧠",corpo:"💪"};
const SKILLS={
  foco:[[2,"Partida de 2 minutos","Comece só 2 minutos. Começar é a parte mais difícil; depois o cérebro embala."],[4,"Bloco blindado","25 minutos com o celular em outro cômodo. Uma coisa só."],[6,"Lista de 3","Na noite anterior, escolha as 3 coisas que importam amanhã."],[8,"Túnel","Uma aba, uma tarefa. Fechou, comemorou, próxima."],[10,"Mestre do foco","Você já sabe entrar no modo foco quando quer. Ensine alguém."]],
  vendas:[[2,"Primeiro passo visível","Quebre a meta até o passo ficar tão pequeno que dá preguiça de não fazer."],[4,"Placar","O que é medido melhora. Anote o número do dia."],[6,"Prazo curto","Metas de 7 dias vencem metas de 1 ano."],[8,"Pedido sem medo","Peça ajuda ou um sim. O pior não é o não, é não pedir."],[10,"Conquistador","Você termina o que começa. Escolha a próxima montanha."]],
  mente:[[2,"Respiro 4-6","Inspire em 4, solte em 6, cinco vezes. O corpo desacelera."],[4,"Diário de 1 linha","Uma frase por dia sobre como foi. Só isso."],[6,"Despejo mental","Cabeça cheia? Tire tudo para o papel antes de decidir."],[8,"Pensamento justo","Troque 'sempre dá errado' pelo fato: 'hoje deu errado nisso'."],[10,"Mente serena","Você atravessa dia ruim sem se largar. Isso é força."]],
  corpo:[[2,"Água ao acordar","Um copo de água antes do celular."],[4,"Caminhada de 10","Dez minutos andando já mudam o humor e o foco."],[6,"Sono no horário","Dormir e acordar no mesmo horário vale mais que dormir muito."],[8,"Força básica","Agachamento, flexão e prancha: 3 séries, 3 vezes por semana."],[10,"Corpo de aço","Seu corpo virou aliado. Mantenha o básico bem feito."]]};
const CLS_REAL=[["estudante","Estudante","foco","escola"],["universitario","Universitário","mente","estudante"],["profissional","Profissional","vendas","clt"],["empreendedor","Empreendedor","vendas","autonomo"],["lar","Cuidador do lar","corpo","casa"],["caminhoneiro","Caminhoneiro","foco","motorista"],["motorista","Motorista","foco",""],["veterano","Veterano da vida","mente","aposentado"],["atleta","Atleta","corpo",""]];
const CLS_FANT=[["mago","Mago","mente","Arquimago","Sábio Arcano"],["guerreiro","Guerreiro","corpo","Campeão","Lorde da Guerra"],["arqueiro","Arqueiro","foco","Atirador de Elite","Olho de Falcão"],["cavaleiro","Cavaleiro","vendas","Comandante","Cavaleiro Lendário"],["druida","Druida","corpo","Guardião da Floresta","Espírito Ancestral"]];
const AFF=1.5;
function clsName(c,lv){if(!c)return "";if(c.style==="fant"){const f=CLS_FANT.find(x=>x[0]===c.id);if(f)return lv>=20?f[4]:lv>=10?f[3]:f[1];}return lv>=20?"Mestre "+c.name:lv>=10?c.name+" Experiente":c.name;}
const TIPS=["Deixe a roupa do treino ou o material separado na noite anterior. Menos decisões de manhã = mais energia.",
"Use um timer visível. Ver o tempo passar ajuda o cérebro com TDAH a sentir o tempo.",
"Faça a tarefa chata logo depois de uma que você gosta. Uma puxa a outra.",
"Cansou no meio? Troque de lugar. Mudar o ambiente reinicia a atenção.",
"Escreva a próxima ação, não a tarefa. Não 'trabalho de história', e sim 'abrir o caderno na página 30'.",
"Celular longe da cama. O sono agradece e a manhã começa sua, não do feed.",
"Música sem letra ou ruído branco ajuda muita gente a focar. Teste hoje.",
"Esqueceu algo? Não brigue com você. Crie um lembrete na hora e siga.",
"Comemore pequeno: punho fechado, 'boa!'. O cérebro aprende com recompensa, não com bronca.",
"Regra do 'nunca dois': falhou um dia, tudo bem. Só não deixe virar dois seguidos.",
"Beba água agora. Desidratação leve já derruba foco e humor.",
"Antes de dormir, anote 1 coisa boa do dia. Treina o cérebro a enxergar progresso.",
"Divida em pedaços de 10 minutos. Dez minutos sempre parecem possíveis.",
"Avise alguém do que você vai fazer. Compromisso dito em voz alta pesa mais.",
"Deixe à vista o que quer fazer e esconda o que te distrai. O ambiente decide por você.",
"Sol de manhã, 5 a 10 minutos, ajusta o relógio do corpo e melhora o sono à noite.",
"Pausa boa é sem tela: alongar, olhar pela janela, beber água.",
"Se a tarefa leva menos de 2 minutos, faça agora.",
"Escolha só 1 prioridade para amanhã. Uma. O resto é bônus.",
"Movimento antes de estudar ou trabalhar (20 polichinelos) acorda a atenção.",
"Erro não apaga o progresso. Seu XP continua aí. Volte na próxima quest.",
"Use o 'modo mínimo': num dia ruim, a versão mínima mantém a sequência viva.",
"Agrupe tarefas parecidas: todas as mensagens juntas, todas as compras juntas.",
"Durma 8 horas na semana de prova. Memória se fixa no sono.",
"Tédio é sinal, não inimigo. Torne a tarefa um desafio: cronometre e tente bater o tempo.",
"Arrume só uma superfície (a mesa, a cama). Ordem visível acalma a cabeça.",
"Diga 'eu sou alguém que treina' em vez de 'preciso treinar'. Identidade puxa hábito.",
"Recompensa planejada funciona: decida antes o que ganha ao terminar.",
"Quando travar, pergunte: qual é o menor passo possível agora?",
"Revise a semana no domingo: o que funcionou fica, o que não funcionou ajusta."];
const SXP=n=>15*n*(n-1);
const slvl=x=>{let n=1;while(x>=SXP(n+1))n++;return n;};
function rpgState(){if(!prog.rpg||typeof prog.rpg!=="object")prog.rpg={};const r=prog.rpg;r.rew=r.rew||null;r.spent=r.spent||0;r.seen=r.seen||null;r.tips=r.tips||{};return r;}
function statXP(){const st={foco:0,vendas:0,mente:0,corpo:0};for(const e of entries()){if(st[e.stat]!=null&&(e.xp||0)>0)st[e.stat]+=e.xp;}
  const c=rpgState().cls;if(c&&c.stat&&st[c.stat]!=null)st[c.stat]=Math.round(st[c.stat]*AFF);return st;}
function coinsEarned(){let s=0;for(const e of entries())s+=Math.max(0,(e.xp||0)+(e.bonus||0));return Math.floor(s/10);}
function rpgTip(){const d=new Date();const n=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);return TIPS[n%TIPS.length];}
let sysQ=[];function sysPop(tag,title,text,cb,lbl){sysQ.push([tag,title,text,cb,lbl]);if(sysQ.length===1)sysNext();}
let sysShown=null;function sysNext(){if(!sysQ.length||(sysShown&&sysShown.isConnected))return;
  // uma janela por vez: espera o criador de avatar fechar (ele abre sozinho no 1º acesso)
  if(document.querySelector(".avmk")||(()=>{const r=document.getElementById("fzRef");return r&&!r.hidden&&r.getClientRects().length;})()){clearTimeout(sysNext._t);sysNext._t=setTimeout(sysNext,1000);return;}const [tag,title,text,cb,lbl]=sysQ[0];const m=document.createElement("div");m.className="sysmodal";m.setAttribute("role","dialog");sysShown=m;
  const c=document.createElement("div");c.className="card";const a=document.createElement("div");a.className="tag";a.textContent="[ SISTEMA ] "+tag;const h=document.createElement("h3");h.textContent=title;const p=document.createElement("p");p.className="sm";p.textContent=text;
  const b=document.createElement("button");b.className="go";b.type="button";b.textContent=lbl||"Aceitar";b.addEventListener("click",()=>{m.remove();sysQ.shift();if(cb)try{cb();}catch(e){}if(sysQ.length)sysNext();else setTimeout(render,50);});c.append(a,h,p,b);m.append(c);document.body.append(m);try{const ua=navigator.userActivation;if(navigator.vibrate&&(!ua||ua.hasBeenActive))navigator.vibrate([10,30,10]);}catch(e){}}
function sparks(gold){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const pt=lastPt||{x:innerWidth/2,y:innerHeight/2};
  for(let i=0;i<14;i++){const s=document.createElement("i");s.className="spark"+(gold&&i%2?" g":"");const a=Math.PI*2*i/14+Math.random()*.4,r=40+Math.random()*50;
    s.style.left=pt.x+"px";s.style.top=pt.y+"px";s.style.setProperty("--dx",Math.cos(a)*r+"px");s.style.setProperty("--dy",Math.sin(a)*r+"px");document.body.append(s);setTimeout(()=>s.remove(),800);}}
{const _fx=fx;fx=function(xp,gold){_fx(xp,gold);if(xp>0)sparks(gold);};}
function sysLine(){const dt=new Date();const h=dt.getHours();const nm=((cfg&&cfg.name)||"").split(" ")[0];
  const hi=(h<5?"Boa madrugada":h<12?"Bom dia":h<18?"Boa tarde":"Boa noite")+(nm?", "+nm:"")+". ";
  const ms=mainsFor(dt);const done=prog.log[todayKey()]||[];const left=ms.filter(q=>!done.some(e=>e.q===q.id));
  if(!ms.length)return hi+(done.length?"Dia ativo. Quer pegar uma extra?":"Sem missão principal hoje. Uma tarefa já ativa o dia.");
  if(!left.length)return hi+"Missão diária completa. Sequência protegida. Descanse, você mereceu.";
  const nx=left[0];
  if(h>=20)return hi+(left.length>1?"Faltam ":"Falta ")+left.length+". Sugestão: "+(nx.minTitle||nx.title)+" (o mínimo já vale).";
  return hi+(left.length<ms.length?"Bom ritmo. ":"")+"Próxima missão: "+nx.title+".";}
function typeSys(el,t){if(el.dataset.t===t)return;el.dataset.t=t;clearInterval(typeSys.i);
  if(matchMedia("(prefers-reduced-motion: reduce)").matches||document.body.dataset.tab!=="hoje"){el.textContent=t;return;}
  let n=0;el.textContent="";typeSys.i=setInterval(()=>{n+=2;el.textContent=t.slice(0,n);if(n>=t.length)clearInterval(typeSys.i);},22);}
function renderRPG(){renderDun();sysTipUI();const r=rpgState();const st=statXP();const lv=levelOf(totalXP());
  // primeira vez: marca o que já tinha sem soltar alertas antigos
  const cur={};for(const k in STATS)cur[k]=slvl(st[k]);
  // grava o que já foi anunciado, senão o alerta volta ao reabrir o app
  if(!r.seen){r.seen=Object.assign({},cur);try{save();}catch(e){}}
  else{let ch=false;for(const k in STATS){const was=r.seen[k]||1;if(cur[k]>was){for(const [lvN,nm,tx] of SKILLS[k])if(lvN>was&&lvN<=cur[k]){if(cfg&&cfg.startDate===todayKey())toast("✨ Habilidade nova: "+nm+" ("+STATS[k]+" nv "+lvN+")");else sysPop("HABILIDADE DESBLOQUEADA",nm,STATS[k]+" nível "+lvN+". "+tx);}r.seen[k]=cur[k];ch=true;}}if(ch)try{save();}catch(e){}}
  if(typeof r.cls==="string")r.cls=null;
  if(r.cls){const t=lv>=20?2:lv>=10?1:0;if(t>(r.evo||0)){r.evo=t;sysPop("EVOLUÇÃO DE CLASSE",clsName(r.cls,lv),"Nível "+lv+". Sua classe evoluiu. Continue no seu ritmo.");}}
  else if(cfg&&!cfg.blank&&(!$("onb")||$("onb").hidden)&&!clsOpen&&!sysQ.length)setTimeout(()=>{if(!sysQ.length)openCls();},400);
  if(!r.rew)r.rew=[{t:"Um episódio da série",c:8},{t:"Lanche favorito",c:12},{t:"1 hora de jogo sem culpa",c:15}];
  const sl=$("sysLine");if(sl)typeSys(sl,sysLine());
  $("rpgCls").textContent=r.cls?clsName(r.cls,lv):"";
  $("rpgAwake").textContent=r.cls?(lv<20?"Afinidade: "+STATS[r.cls.stat]+" sobe 1,5x mais rápido. Evolução da classe no nível "+(lv<10?10:20)+".":"Afinidade: "+STATS[r.cls.stat]+" sobe 1,5x mais rápido."):"Escolha sua classe para ganhar afinidade com um atributo.";
  const cp=$("clsPill");if(cp){cp.hidden=false;cp.textContent=r.cls?(r.cls.style==="fant"?"⚔️ ":"🧭 ")+clsName(r.cls,lv)+" ⇄":"🧭 Escolher classe";cp.title="Trocar classe";}
  const box=$("rpgStats");const open=new Set([...box.querySelectorAll("details[open]")].map(d=>d.dataset.k));box.textContent="";
  for(const k in STATS){const n=cur[k],a=SXP(n),b=SXP(n+1),pct=Math.min(100,(st[k]-a)/(b-a)*100);
    const d=document.createElement("details");d.className="rstat";d.dataset.k=k;if(open.has(k))d.open=true;
    const s=document.createElement("summary");const ic=document.createElement("span");ic.className="ic";ic.textContent=RPG_IC[k];
    const nm=document.createElement("span");nm.className="nm";const bb=document.createElement("b");bb.textContent=STATS[k];const sm=document.createElement("small");
    const nx=SKILLS[k].find(x=>x[0]>n);sm.textContent=nx?"Próxima habilidade no nível "+nx[0]+": "+nx[1]:"Todas as habilidades desbloqueadas";
    const bar=document.createElement("div");bar.className="bar";const bi=document.createElement("i");bi.style.width=pct.toFixed(1)+"%";bar.append(bi);nm.append(bb,sm,bar);
    const l=document.createElement("span");l.className="lv";l.textContent="Nv "+n;s.append(ic,nm,l);
    const ul=document.createElement("ul");ul.className="skills";for(const [lvN,t,tx] of SKILLS[k]){const li=document.createElement("li");if(n>=lvN)li.className="on";const b2=document.createElement("b");b2.textContent=(n>=lvN?"✓ ":"🔒 Nv "+lvN+" · ")+t;li.append(b2,document.createTextNode(n>=lvN?tx:"Suba "+STATS[k]+" para liberar."));ul.append(li);}
    d.append(s,ul);box.append(d);}
  const coins=coinsEarned()-r.spent;$("coins").textContent=coins+" moeda"+(coins===1?"":"s");
  const cl=$("chestList");cl.textContent="";r.rew.forEach((w,i)=>{const row=document.createElement("div");row.className="chest";const sp=document.createElement("span");sp.textContent=w.t;const c=document.createElement("b");c.className="mono";c.textContent=w.c+" 🪙";
    const bt=document.createElement("button");bt.type="button";bt.className=coins>=w.c?"go":"ghost";bt.textContent="Resgatar";bt.addEventListener("click",()=>{if(rpgState().spent+w.c>coinsEarned()){toast("Faltam "+(w.c-(coinsEarned()-rpgState().spent))+" moedas. Bora numa quest.");return;}
      rpgState().spent+=w.c;save();render();sysPop("RECOMPENSA","Aproveite: "+w.t,"Você ganhou isso. Curta sem culpa e volte com energia.");});
    const del=document.createElement("button");del.type="button";del.className="link";del.textContent="✕";del.setAttribute("aria-label","Remover recompensa");del.addEventListener("click",()=>{rpgState().rew.splice(i,1);save();render();});
    row.append(sp,c,bt,del);cl.append(row);});
  const tk=todayKey();const tc=$("tipCard");tc.hidden=!!r.tips[tk];$("sysTipText").textContent=rpgTip();}
$("tipOk").addEventListener("click",()=>{const r=rpgState(),tk=todayKey();if(r.tips[tk])return;r.tips[tk]=1;addXP({q:"tip:"+tk,kind:"tip",xp:5,stat:"mente",bonus:0,t:new Date().toISOString()},"Treino concluído: +5 XP");});
$("chestForm").addEventListener("submit",e=>{e.preventDefault();const t=$("chestT").value.trim().slice(0,40);const c=Math.max(1,Math.min(500,parseInt($("chestC").value,10)||10));if(!t)return;
  const r=rpgState();if(r.rew.length>=12){toast("Máximo de 12 recompensas.");return;}r.rew.push({t,c});$("chestT").value="";$("chestC").value="";save();render();});

document.body.classList.add("enter");setTimeout(()=>document.body.classList.remove("enter"),1500);

// ---------- Escolha de classe (no começo; vale para quem já usa também) ----------
let clsOpen=false;
function openCls(){if(clsOpen||(rpgState().cls&&!openCls.force))return;const full=!!openCls.force;openCls.force=false;clsOpen=true;let style="real";const occ=(cfg&&cfg.profile&&cfg.profile.occ)||"";
  const m=document.createElement("div");m.className="sysmodal";m.id="clsModal";m.setAttribute("role","dialog");const c=document.createElement("div");c.className="card clscard";
  const tag=document.createElement("div");tag.className="tag";tag.textContent="[ SISTEMA ] ESCOLHA DE CLASSE";const h=document.createElement("h3");h.textContent="Quem é você neste jogo?";
  const p=document.createElement("p");p.className="sm muted";p.textContent="Sua classe dá afinidade com um atributo: ele sobe 1,5x mais rápido. Dá para trocar quando quiser: toque na classe, no topo.";
  const seg=document.createElement("div");seg.className="seg";const grid=document.createElement("div");grid.className="clsgrid";const own=document.createElement("div");own.className="add";own.hidden=true;
  const oi=document.createElement("input");oi.maxLength=24;oi.placeholder="Ex.: Professora, Pedreiro, Enfermeiro";oi.autocomplete="off";const os=document.createElement("select");for(const k in STATS){const o=document.createElement("option");o.value=k;o.textContent=STATS[k];os.append(o);}
  const ob=document.createElement("button");ob.type="button";ob.className="go";ob.textContent="Usar";own.append(oi,os,ob);
  const pick=(cl)=>{const r=rpgState();r.cls=cl;r.evo=0;const lv=levelOf(totalXP());r.evo=lv>=20?2:lv>=10?1:0;r.seen=null;save();m.remove();clsOpen=false;render();sysPop("CLASSE DEFINIDA",clsName(cl,lv),"Afinidade: "+STATS[cl.stat]+". Evolui no nível 10 e no 20.");};
  ob.addEventListener("click",()=>{const n=oi.value.trim().replace(/[<>]/g,"").slice(0,24);if(!n){oi.focus();return;}pick({style:"real",id:"outra",name:n.charAt(0).toUpperCase()+n.slice(1),stat:os.value});});
  function fill(){grid.textContent="";own.hidden=style!=="real";for(const b of seg.children)b.classList.toggle("on",b.dataset.v===style);
    const list=style==="real"?CLS_REAL.slice().sort((a,b)=>(b[3]===occ)-(a[3]===occ)):CLS_FANT;
    for(const x of list){const b=document.createElement("button");b.type="button";b.className="clsbtn"+(style==="real"&&x[3]&&x[3]===occ?" sug":"");const t=document.createElement("b");t.textContent=x[1];const s2=document.createElement("small");s2.textContent=RPG_IC[x[2]]+" "+STATS[x[2]];b.append(t,s2);
      b.addEventListener("click",()=>pick({style,id:x[0],name:x[1],stat:x[2]}));grid.append(b);}}
  for(const [v,l] of [["real","🧭 Vida real"],["fant","⚔️ Fantasia"]]){const b=document.createElement("button");b.type="button";b.dataset.v=v;b.textContent=l;b.addEventListener("click",()=>{style=v;fill();});seg.append(b);}
  const later=document.createElement("button");later.type="button";later.className="link";later.textContent="Escolher depois";later.addEventListener("click",()=>{m.remove();clsOpen="later";});
  // Escolha enxuta (1 toque): o Sistema sugere uma classe; a lista completa fica atrás de "Ver outras".
  const SG=clsSuggest(),sg=SG.cl;
  const sug=document.createElement("div");sug.className="clssug";const sb=document.createElement("button");sb.type="button";sb.className="go big";sb.id="clsSug";
  const sbt=document.createElement("b");sbt.textContent=(sg.style==="fant"?"⚔️ ":"🧭 ")+sg.name;const sbs=document.createElement("small");sbs.textContent=RPG_IC[sg.stat]+" "+STATS[sg.stat]+" sobe 1,5x mais rápido";sb.append(sbt,sbs);
  sb.addEventListener("click",()=>pick(sg));const more=document.createElement("button");more.type="button";more.className="link";more.id="clsMore";more.textContent="Ver outras classes";
  sug.append(sb,more);const box=document.createElement("div");box.className="clsall";box.append(seg,grid,own);
  more.addEventListener("click",()=>{sug.hidden=true;box.hidden=false;p.hidden=false;});
  const why=document.createElement("p");why.className="sm muted clswhy";why.textContent=SG.why;sug.prepend(why);
  if(!full){h.textContent="O Sistema escolheu sua classe";p.hidden=true;box.hidden=true;style=sg.style;}else sug.hidden=true;
  c.append(tag,h,p,sug,box,later);m.append(c);document.body.append(m);fill();}
// Sugestão de classe pelo perfil (antes caía sempre em Mago quando a ocupação não tinha classe de vida real).
function clsSuggest(){const P=(cfg&&cfg.profile)||{};const occ=P.occ||"";const F=P.focus||[];
  const FL={estudos:"Estudos",sono:"Dormir melhor",corpo:"Saúde e corpo",carreira:"Carreira",dinheiro:"Dinheiro",relac:"Pessoas que amo",casa:"Casa em ordem",remedio:"Remédios",agua:"Beber água",tela:"Menos tela",leitura:"Ler mais"};
  const W={estudos:{mente:2},leitura:{mente:2},tela:{foco:2},sono:{corpo:1,mente:1},corpo:{corpo:2},agua:{corpo:1},remedio:{corpo:1},carreira:{vendas:2},dinheiro:{vendas:2},casa:{foco:2},relac:{foco:1,corpo:1}};
  const sc={foco:0,mente:0,corpo:0,vendas:0};const by={foco:[],mente:[],corpo:[],vendas:[]};
  F.forEach((f,i)=>{const w=W[f]||{};const k=1+(F.length-i)*.1;for(const st in w){sc[st]+=w[st]*k;by[st].push(FL[f]||f);}});
  if(/^(estudante|escola)$/.test(occ)){sc.mente+=1;}if(occ==="autonomo"||occ==="clt"){sc.vendas+=.8;}if(occ==="motorista"){sc.foco+=1;}
  if(P.goal&&/treino|academia|peso|corrida|correr|músculo|saúde/i.test(P.goal)){sc.corpo+=1.5;by.corpo.push("sua meta");}
  if(P.goal&&/dinheiro|emprego|empresa|cliente|vend|negócio|renda/i.test(P.goal)){sc.vendas+=1.5;by.vendas.push("sua meta");}
  if(P.goal&&/prova|enem|vestibular|nota|estud|curso|faculdade/i.test(P.goal)){sc.mente+=1.5;by.mente.push("sua meta");}
  let h=0;for(const c of String((cfg&&cfg.name)||"")+(cfg&&cfg.startDate||""))h=(h*31+c.charCodeAt(0))>>>0;
  const st=Object.keys(sc).sort((a,b)=>sc[b]-sc[a]||((h>>("fmcv".indexOf(a[0])*2))&3)-((h>>("fmcv".indexOf(b[0])*2))&3))[0];
  const real=CLS_REAL.find(x=>x[3]&&x[3]===occ);
  const why0=by[st].length?"Por causa de "+[...new Set(by[st])].slice(0,2).join(" e ")+", seu ponto forte é "+STATS[st]+".":"Pelo seu perfil, seu ponto forte é "+STATS[st]+".";
  if(real&&real[2]===st)return {cl:{style:"real",id:real[0],name:real[1],stat:real[2]},why:why0+" Classe da sua rotina."};
  const opts=CLS_FANT.filter(x=>x[2]===st);const f=opts[h%opts.length]||CLS_FANT[0];
  return {cl:{style:"fant",id:f[0],name:f[1],stat:f[2]},why:why0};}
function chgCls(){openCls.force=true;clsOpen=false;openCls();}
$("clsChange").addEventListener("click",chgCls);
if($("clsPill")){const cp=$("clsPill");cp.setAttribute("role","button");cp.tabIndex=0;cp.addEventListener("click",chgCls);cp.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();chgCls();}});}

// ---------- Masmorra da semana: 7 andares (seg a dom). Andar limpo = todas as principais do dia (ou 1 tarefa, se não houver principal). 5 andares abrem o baú. ----------
const DUN_NEED=5,DUN_XP=50;
function dunWeek(){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d;}
function dunFloor(dt){const k=dkey(dt);if(cfg&&cfg.startDate&&k<cfg.startDate)return "pre";if(isRest(k))return "rest";const L=(prog.log[k]||[]).filter(e=>!/^(ach|checkin|tip|dun):/.test(String(e.q)));const ms=mainsFor(dt);
  if(ms.length?ms.every(q=>L.some(e=>e.q===q.id)):L.length>0)return "ok";return k<todayKey()?"miss":k===todayKey()?"now":"lock";}
function renderDun(){const box=$("dunFloors");if(!box)return;const w=dunWeek(),wk=dkey(w);let n=0,pre=0;box.textContent="";const DN=["seg","ter","qua","qui","sex","sáb","dom"];
  for(let i=0;i<7;i++){const d=new Date(w);d.setDate(w.getDate()+i);const st=dunFloor(d);if(st==="ok"||st==="rest")n++;if(st==="pre")pre++;const c=document.createElement("div");c.className=st;
    const b=document.createElement("b");b.textContent=st==="pre"?"·":st==="ok"?"✓":st==="rest"?"☾":st==="miss"?"✗":st==="now"?"⚔":"🔒";c.append(b,document.createTextNode(DN[i]));box.append(c);}
  const got=Object.keys(prog.log).some(k=>k>=wk&&(prog.log[k]||[]).some(e=>e.q==="dun:"+wk));
  const need=Math.max(1,Math.min(DUN_NEED,7-pre-1));renderDun.need=need;$("dunCount").textContent=n+"/"+need+" andares";
  $("dunOpen").hidden=got||n<need;
  $("dunText").textContent=got?"Baú aberto. A masmorra renasce na segunda.":n>=need?"Masmorra vencida! Abra o baú.":"Andar limpo = todas as principais do dia (o mínimo vale). Descanso protege o andar. Limpe "+need+" para abrir o baú: +"+DUN_XP+" XP.";}
$("dunOpen").addEventListener("click",()=>{const wk=dkey(dunWeek());if(Object.keys(prog.log).some(k=>(prog.log[k]||[]).some(e=>e.q==="dun:"+wk)))return;
  addXP({q:"dun:"+wk,kind:"dun",xp:DUN_XP,stat:"foco",bonus:0,t:new Date().toISOString()},"");sysPop("MASMORRA VENCIDA","Baú aberto: +"+DUN_XP+" XP","Cinco andares numa semana. Isso é constância de verdade. A próxima masmorra abre na segunda.");});

// ---------- Aviso diário do Sistema: vai pela agenda do celular (arquivo .ics com todos os lembretes) ----------
const SYSTIP_KEY=document.getElementById("o_go")?"asc-"+"u-systip":"ascensao-systip";
function sysTipUI(){let d="";try{d=localStorage.getItem(SYSTIP_KEY)||"";}catch(e){}const el=$("sysTip");if(!el)return;
  const days=1;el.hidden=!!d||!cfg||cfg.blank||!!document.querySelector(".sysmodal")||days<1;}
// Android não abre o arquivo .ics: lá o "Ativar" abre o Google Agenda já preenchido com o aviso diário (1 evento, todo dia)
$("sysTipYes").addEventListener("click",()=>{try{localStorage.setItem(SYSTIP_KEY,"1");}catch(e){}$("sysTip").hidden=true;
  if(/android/i.test(navigator.userAgent)){const r=remPlan()[0];if(r)window.open(gcalLink(r),"_blank","noopener");toast("Abriu o Google Agenda? Toque em Salvar. O aviso do Sistema vem todo dia.");return;}
  if($("calIcs"))$("calIcs").click();toast("Abriu a agenda? Toque em Adicionar tudo. O aviso do Sistema vem junto.");});
$("sysTipNo").addEventListener("click",()=>{try{localStorage.setItem(SYSTIP_KEY,"0");}catch(e){}$("sysTip").hidden=true;});
