// ---------- Segredos: conquistas ocultas, códigos e títulos raros ----------
// Só ADICIONA campos ao progresso: prog.sec {id: "AAAA-MM-DD"} e prog.secTitle (id do título em uso).
// O XP entra como "ach:<id>" (mesmo tratamento das conquistas: não conta sequência nem masmorra).
// Nada sai do aparelho: os gatilhos são relógio, toques e códigos digitados aqui.
const SEC=[
 // [id, ícone, nome, título, dica (bloqueado), mensagem do Sistema, xp]
 ["s_420","🌿","Hora do Zen","Mestre Zen","Existe uma hora em que o Sistema fica mais calmo. Duas vezes por dia.","4:20. Momento oficial de respirar fundo (de ar puro), beber um copo d'água e fazer uma quest mínima.",10],
 ["s_larica","🍪","Larica Lendária","Caçador de Lanches","Um código que todo mundo já sentiu na barriga.","Fome épica detectada. O Sistema recomenda: água e uma fruta antes do pacote de bolacha. Ponto extra pela honestidade.",10],
 ["s_deboa","🛶","De Boa na Lagoa","Lorde da Calmaria","Um código para quem está tranquilo.","Modo de boa ativado. Até no modo de boa, uma quest mínima conta. É o jeito tranquilo de subir de nível.",10],
 ["s_zen","🧘","Modo Zen","Monge do Sistema","Segure firme o que você é.","Três respirações completas. Seu sistema nervoso agradece. Volte aqui sempre que a cabeça acelerar.",15],
 ["s_cutuca","👉","Para de Me Cutucar","Cutucador Oficial","O Sistema sente cócegas em algum lugar.","Sistema: cutucada número 10 registrada. Tá, você venceu. Agora vai fazer uma quest.",10],
 ["s_tempo","⏳","Relativista","Senhor do Tempo","O tempo passa diferente se você insistir nele.","O tempo é relativo. O prazo, infelizmente, não. Use os próximos 10 minutos a seu favor.",10],
 ["s_1111","🌠","11:11","Sonhador Ativo","Uma hora de fazer pedido.","Pedido registrado. Pedido sem ação é só Wi-Fi sem senha: faça um passo dele hoje.",10],
 ["s_meia","🌑","Ficha Limpa","Guardião da Meia-Noite","Abra o app quando o dia vira.","Meia-noite. O placar de ontem fechou, o de hoje está zerado e é todo seu. Agora vá dormir, herói.",10],
 ["s_coruja","🦉","Vigia da Noite","Coruja","Conclua algo quando quase todo mundo dorme.","Quest de madrugada! Respeito. Mas herói também recarrega: amanhã o XP rende mais com sono.",10],
 ["s_aurora","🌅","Primeira Luz","Madrugador","Conclua algo antes do sol se espreguiçar.","Quest antes das 6h30. Você começou o dia antes do dia começar.",15],
 ["s_fenix","🔥","Fênix","Fênix","Só quem cai e volta encontra este.","Você voltou depois de dias fora. Voltar é a habilidade mais rara do jogo, e você acabou de usar. Sem culpa, só bora.",30],
 ["s_speed","⚡","Speedrunner","Speedrunner","Três vitórias num piscar de olhos.","Três quests em menos de um minuto. Recorde mundial do seu sofá. Só não vale marcar o que não fez.",10],
 ["s_indeciso","🤔","Indeciso","Rei da Dúvida","Marcar, desmarcar, marcar…","Sistema: decide aí, campeão. Feito é melhor que perfeito.",10],
 ["s_naodesisto","🛡️","Inquebrável","Inquebrável","Um código que é uma promessa.","Registrado. Você disse em voz alta, agora é contrato com você mesmo. O Sistema vai lembrar.",15],
 ["s_hacker","💻","Acesso Concedido","Hacker do Sistema","Chame o Sistema pelo nome.","Acesso root concedido. Brincadeira: você só tem acesso ao seu próprio esforço. Que, aliás, é o que importa.",10],
 ["s_2004","🗓️","Feriado do Zen","Lenda do 20/04","Uma data que só alguns comemoram.","20 de abril. Feriado não oficial da calma. Celebre fazendo uma quest com calma total.",15],
 ["s_sexta13","🐈‍⬛","Sexta Sem Azar","Imune ao Azar","Dizem que dá azar…","Sexta-feira 13. Azar é para quem não fez check-in. Você está protegido.",15],
 // piscadelas de cultura pop: só a referência, com texto e nomes nossos (nada de personagens, falas ou marcas)
 ["s_plat","🧳","Plataforma Escondida","Passageiro da Parede","Entre o 9 e o 10 existe um horário que só quem procura acha. Duas vezes por dia.","9h45: o horário entre o 9 e o 10. Quem atravessa a parede sem medo pega o trem certo. Embarque numa quest mínima agora.",15],
 ["s_carta","✉️","A Carta Chegou","Sobrevivente do 11º Dia","Dizem que no 11º dia chega uma carta que muda tudo.","11 dias jogados. Nenhuma coruja trouxe nada, mas a carta chegou mesmo assim: você é do tipo que volta. Seu lugar na escola dos que não desistem está garantido.",30],
 ["s_42","🧣","A Resposta","Portador da Toalha","Um número que responde a tudo. Ele chega fazendo quests.","42 quests concluídas. Dizem que esse número responde a tudo. A pergunta, você escreve amanhã com a quest 43. E nunca saia sem a toalha.",20],
 ["s_9000","📟","Medidor Estourou","Acima do Limite","Existe um nível de poder que faz qualquer medidor explodir.","Seu XP passou de 9000. O medidor do Sistema não aguentou e soltou fumaça. Ninguém chega aqui por sorte: foi uma quest de cada vez.",50],
 ["s_maio4","🌌","Galáxia Distante","Cavaleiro da Rotina","Um dia de maio que fãs de espadas de luz comemoram.","4 de maio. Hoje a força que conta é a de começar: uma quest mínima e você já está do lado certo.",15],
 ["s_classico","🎮","Código Clássico","Jogador das Antigas","Cima, cima, baixo, baixo… você sabe o resto.","Código clássico aceito. Vida extra não existe aqui, mas o dia ainda tem tempo de sobra. Mais uma quest e você zera a fase.",15],
 ["s_pi","🥧","Hora do Pi","Mente Infinita","Um horário com gosto de torta e casas decimais sem fim.","3:14. Um número que nunca termina, igual à sua capacidade de recomeçar. Uma quest e o círculo fecha.",10],
 ["s_coelho","🐇","Toca do Coelho","Curioso Profissional","Siga o bicho branco que vive atrasado.","Você seguiu o coelho branco até aqui. A toca é funda, mas o primeiro passo é pequeno: escolha uma quest e desça.",10]];
const SEC_CODES={larica:"s_larica",deboa:"s_deboa",deboanalagoa:"s_deboa",naodesisto:"s_naodesisto",sistema:"s_hacker",
  modozen:"zen",zen:"zen",
  "420":"Boa tentativa. Esse segredo é de hora marcada, não de código.",
  ajuda:"Os códigos estão por aí. Pergunte a quem já achou um.",
  xpinfinito:"Negado. XP infinito só existe para quem faz uma quest de cada vez.",
  coelhobranco:"s_coelho",coelho:"s_coelho",uuddlrlrba:"s_classico",ccbbededba:"s_classico",cimacimabaixobaixo:"s_classico",
  "42":"q42","9000":"x9000","8000":"x9000",
  "945":"Quase. Essa plataforma abre no horário, não no código.","934":"Quase. Essa plataforma abre no horário, não no código.",
  "314":"Pi não se digita, se espera: o relógio sabe a hora."};
const secById=id=>SEC.find(s=>s[0]===id);
function secReady(){const hid=id=>{const e=$(id);return !e||e.hidden;};return !!(cfg&&!cfg.blank&&cfg.quests&&cfg.quests.length)&&hid("quick")&&hid("onb")&&!$("clsModal");}
function secMotion(){return !matchMedia("(prefers-reduced-motion: reduce)").matches;}
function unlockSec(id){if(!secReady())return false;prog.sec=prog.sec||{};if(prog.sec[id])return false;const s=secById(id);if(!s)return false;
  prog.sec[id]=todayKey();pushEntry({q:"ach:"+id,kind:"full",xp:s[6],stat:"mente",bonus:0,t:new Date().toISOString()},"");
  renderSec();secReveal(s);return true;}
function secReveal(s){sysPop("SEGREDO DESBLOQUEADO",s[1]+" "+s[2],s[5]+" (+"+s[6]+" XP · título raro: « "+s[3]+" »)",()=>secEquip(s[0]),"Equipar título « "+s[3]+" »");}
function renderSec(){const box=$("secList");if(!box)return;prog.sec=prog.sec||{};box.textContent="";let got=0;
  for(const s of SEC){const on=!!prog.sec[s[0]];if(on)got++;const d=document.createElement("button");d.type="button";d.className="badge secb"+(on?" on":"")+(prog.secTitle===s[0]?" eq":"");
    const b=document.createElement("b");b.textContent=on?s[1]+" "+s[2]:"🔒 ???";d.append(b,document.createTextNode(on?"« "+s[3]+" »"+(prog.secTitle===s[0]?" · em uso":" · toque para usar"):s[4]));
    if(on)d.addEventListener("click",()=>secEquip(prog.secTitle===s[0]?"":s[0]));else d.disabled=true;box.append(d);}
  $("secCount").textContent=got+" / "+SEC.length;
  const t=$("secTitle"),eq=prog.secTitle&&prog.sec[prog.secTitle]&&secById(prog.secTitle);t.hidden=!eq;t.textContent=eq?"« "+eq[3]+" »":"";}
function secEquip(id){prog.secTitle=id;save();renderSec();toast(id?"Título em uso: "+secById(id)[3]:"Título removido.");}
// --- gatilhos de relógio e data (ao abrir e a cada 20 s) ---
function secClock(){if(!secReady()||document.hidden)return;const d=new Date(),h=d.getHours(),m=d.getMinutes();
  if(m===20&&(h===4||h===16))unlockSec("s_420");
  else if(m===11&&(h===11||h===23))unlockSec("s_1111");
  else if(h===0&&m<5)unlockSec("s_meia");
  else if(d.getMonth()===3&&d.getDate()===20)unlockSec("s_2004");
  else if(d.getDay()===5&&d.getDate()===13)unlockSec("s_sexta13");
  if(m===45&&(h===9||h===21))unlockSec("s_plat");
  else if(m===14&&(h===3||h===15))unlockSec("s_pi");
  else if(d.getMonth()===2&&d.getDate()===14)unlockSec("s_pi");
  else if(d.getMonth()===4&&d.getDate()===4)unlockSec("s_maio4");
  secProg();}
// --- gatilhos de progresso: 11 dias jogados, 42 quests, mais de 9000 XP ---
function secQuests(){let n=0;for(const k in prog.log)for(const e of (prog.log[k]||[]))if(!/^(ach|checkin|tip|dun|sq|zap|ch|adm|tb):/.test(String(e.q))&&(e.kind==="full"||e.kind==="min"))n++;return n;}
function secProg(){if(!secReady())return;try{if(activeDays()>=11&&unlockSec("s_carta"))return;}catch(e){}
  if(secQuests()>=42&&unlockSec("s_42"))return;
  try{if(totalXP()>9000)unlockSec("s_9000");}catch(e){}}
// --- gatilhos de quest: madrugada, aurora, fênix, speedrun, indeciso ---
const secS={done:[],flip:{}};
const _secToggle=toggle;
toggle=function(q,kind){const tk=todayKey();const was=(prog.log[tk]||[]).find(e=>e.q===q.id);
  const act=k=>(prog.log[k]||[]).some(e=>!String(e.q).startsWith("ach:")&&!/^(checkin|tip|dun|adm):/.test(String(e.q)));
  let last=null;for(const k in prog.log)if(k<tk&&act(k)&&(!last||k>last))last=k;
  _secToggle(q,kind);
  const now=(prog.log[tk]||[]).find(e=>e.q===q.id);secS.flip[q.id]=(secS.flip[q.id]||0)+1;
  if(secS.flip[q.id]>=6&&unlockSec("s_indeciso"))return;
  if(!now||was)return;const d=new Date(),h=d.getHours(),mm=h*60+d.getMinutes(),t=Date.now();
  secS.done=secS.done.filter(x=>t-x[0]<60000&&x[1]!==q.id).concat([[t,q.id]]);
  const ago=new Date();ago.setDate(ago.getDate()-3);
  if(last&&last<dkey(ago)&&unlockSec("s_fenix"))return;
  if(h<5&&unlockSec("s_coruja"))return;
  if(mm>=300&&mm<390&&unlockSec("s_aurora"))return;
  if(secS.done.length>=3&&unlockSec("s_speed"))return;
  secProg();};
// --- Modo Zen: 3 respirações 4-6 (versão sem movimento quando reduce-motion) ---
let zenT=null;
function zenOpen(){const o=$("secZen");o.classList.toggle("anim",secMotion());o.hidden=false;let s=0;const L=$("zenTxt"),C=$("zenCount");
  const tick=()=>{const c=Math.floor(s/10),p=s%10;if(c>=3){zenClose();if(!unlockSec("s_zen"))toast("Respiração completa. Cabeça mais leve.");return;}
    L.textContent=p<4?"Inspire":"Solte";C.textContent=(p<4?4-p:10-p)+" s · respiração "+(c+1)+" de 3";$("zenDot").classList.toggle("big",p<4);s++;};
  clearInterval(zenT);tick();zenT=setInterval(tick,1000);$("zenExit").focus();}
function zenClose(){clearInterval(zenT);zenT=null;$("secZen").hidden=true;}
// --- montagem (injeta os painéis sem mexer nos arquivos de layout) ---
function secMount(){
  const h1=$("titleName");if(h1&&!$("secTitle")){const t=document.createElement("div");t.id="secTitle";t.className="sectitle";t.hidden=true;h1.after(t);}
  const ach=$("achList")&&$("achList").closest("section");
  if(ach&&!$("secPanel")){const p=document.createElement("section");p.dataset.tab="prog";p.className="panel secp";p.id="secPanel";
    p.innerHTML='<div class="qhead"><h2>🗝️ Segredos</h2><span class="sm mono" id="secCount"></span></div><div class="sm muted">Conquistas escondidas. Cada uma libera um título raro. Algumas são códigos: pergunte a quem já achou.</div><div class="ach" id="secList"></div>';ach.after(p);}
  const mais=[...document.querySelectorAll('.wrap>section[data-tab="mais"]')].pop();
  if(mais&&!$("secTerm")){const p=document.createElement("section");p.dataset.tab="mais";p.className="panel secterm";p.id="secTerm";
    p.innerHTML='<h2>&gt;_ Terminal do Sistema</h2><form class="add" id="secForm" autocomplete="off"><input id="secCode" maxlength="24" placeholder="Digite um código…" autocapitalize="off" spellcheck="false" aria-label="Código secreto"><button class="go" type="submit">Enviar</button></form><div class="sm muted mono" id="secOut">Aguardando comando.</div>';mais.after(p);}
  if(!$("secZen")){const z=document.createElement("div");z.id="secZen";z.className="sysmodal seczen";z.hidden=true;z.setAttribute("role","dialog");z.setAttribute("aria-modal","true");z.setAttribute("aria-label","Modo Zen");
    z.innerHTML='<div class="card"><div class="tag mono">[ SISTEMA ] MODO ZEN</div><div class="zenring"><i id="zenDot"></i></div><div class="big zentxt" id="zenTxt" aria-live="polite">Inspire</div><div class="sm mono muted" id="zenCount"></div><button class="ghost" type="button" id="zenExit">Sair</button></div>';
    document.body.append(z);$("zenExit").addEventListener("click",zenClose);}
  $("secForm").addEventListener("submit",ev=>{ev.preventDefault();const raw=$("secCode").value;$("secCode").value="";
    const k=raw.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");if(!k)return;const out=$("secOut");const v=SEC_CODES[k];
    if(!v){out.textContent="> "+k+": comando desconhecido. O Sistema anotou sua curiosidade.";return;}
    if(v==="zen"){out.textContent="> modo zen: iniciando.";zenOpen();return;}
    if(v==="q42"){if((prog.sec||{}).s_42){out.textContent="> 42. Você já sabe a resposta.";return;}const f=Math.max(1,42-secQuests());out.textContent="> A resposta existe, mas só depois de 42 quests. Faltam "+f+".";return;}
    if(v==="x9000"){if((prog.sec||{}).s_9000){out.textContent="> Medidor já estourado. Respeito.";return;}let x=0;try{x=totalXP();}catch(e){}out.textContent="> Medidor: "+x+" XP. Ele estoura quando passar de 9000.";return;}
    if(!secById(v)){out.textContent="> "+v;return;}
    if(!secReady()){out.textContent="> Termine de montar seu jogo primeiro.";return;}
    if((prog.sec||{})[v]){out.textContent="> Código já usado. Segredo: "+secById(v)[2]+".";return;}
    out.textContent="> Código aceito.";unlockSec(v);});
  // toques: cutucar o rank 10x em 4 s; segurar o rank 1 s abre o Modo Zen; tocar o relógio 7x
  const rk=$("rank");let taps=[],hold=null;
  if(rk){rk.addEventListener("click",()=>{const t=Date.now();taps=taps.filter(x=>t-x<4000).concat([t]);if(taps.length>=10){taps=[];unlockSec("s_cutuca");}});
    rk.addEventListener("pointerdown",()=>{clearTimeout(hold);hold=setTimeout(()=>{taps=[];zenOpen();},1000);});
    ["pointerup","pointerleave","pointercancel"].forEach(e=>rk.addEventListener(e,()=>clearTimeout(hold)));
    rk.addEventListener("contextmenu",e=>e.preventDefault());}
  const ck=$("clock");let ct=[];if(ck)ck.addEventListener("click",()=>{const t=Date.now();ct=ct.filter(x=>t-x<4000).concat([t]);if(ct.length>=7){ct=[];unlockSec("s_tempo");}});
  const KS=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];let ki=0;
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("secZen").hidden)zenClose();
    const tg=e.target&&e.target.tagName;if(tg==="INPUT"||tg==="TEXTAREA")return;const k=e.key.length===1?e.key.toLowerCase():e.key;
    ki=k===KS[ki]?ki+1:(k===KS[0]?1:0);if(ki===KS.length){ki=0;unlockSec("s_classico");}});
  renderSec();secClock();setInterval(secClock,20000);document.addEventListener("visibilitychange",secClock);}
setTimeout(secMount,0);
