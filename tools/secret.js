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
 ["s_sexta13","🐈‍⬛","Sexta Sem Azar","Imune ao Azar","Dizem que dá azar…","Sexta-feira 13. Azar é para quem não fez check-in. Você está protegido.",15]];
const SEC_CODES={larica:"s_larica",deboa:"s_deboa",deboanalagoa:"s_deboa",naodesisto:"s_naodesisto",sistema:"s_hacker",
  modozen:"zen",zen:"zen",
  "420":"Boa tentativa. Esse segredo é de hora marcada, não de código.",
  ajuda:"Os códigos estão por aí. Pergunte a quem já achou um.",
  xpinfinito:"Negado. XP infinito só existe para quem faz uma quest de cada vez."};
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
  else if(d.getDay()===5&&d.getDate()===13)unlockSec("s_sexta13");}
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
  if(secS.done.length>=3)unlockSec("s_speed");};
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
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("secZen").hidden)zenClose();});
  renderSec();secClock();setInterval(secClock,20000);document.addEventListener("visibilitychange",secClock);}
setTimeout(secMount,0);
