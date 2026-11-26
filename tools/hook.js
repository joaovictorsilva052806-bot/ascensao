// ---------- Volta do dia 1 ao 3: teaser de amanhã, presente de volta e resgate da sequência ----------
// Só nos primeiros dias de jogo (dia de jornada 1 a 7). Dia de jornada = dias diferentes com pelo menos 1 tarefa de verdade.
// Presente de volta: no 2º e no 3º dia, a 1ª tarefa abre +15 / +25 XP (uma vez só, entra como "ach:volta:<n>": não conta sequência).
// Depois das 18h, sem tarefa hoje: cartão de resgate com a versão mínima da próxima tarefa. Tom sem culpa.
// Só ADICIONA prog.hook = {got:{2:"AAAA-MM-DD",3:"..."}}. Não pede permissão nova: o aviso em 2º plano só sai se os avisos já estão ligados.
const HK_GIFT={2:15,3:25},HK_MAX=7;
function hkSt(){if(!prog.hook||typeof prog.hook!=="object")prog.hook={};const h=prog.hook;if(!h.got||typeof h.got!=="object")h.got={};return h;}
function hkReal(k){return (prog.log[k]||[]).some(e=>!/^(ach|checkin|tip|dun|adm|sq|zap|boss|foco):/.test(String(e.q)));}
// dia de jornada de hoje: dias com tarefa antes de hoje + 1
function hkDay(){const tk=todayKey();let n=0;for(const k in (prog.log||{}))if(k<tk&&hkReal(k))n++;return n+1;}
function hkEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function hkMin(q){return q?(q.minTitle||q.title):"";}
function hkNextQ(){const L=prog.log[todayKey()]||[];return mainsFor(new Date()).find(q=>!L.some(e=>e.q===q.id))||null;}
function hkTomorrowQ(){const d=new Date();d.setDate(d.getDate()+1);return mainsFor(d)[0]||null;}
function hkGo(){const b=document.querySelector("#quests .quest.next .msgo")||document.querySelector("#quests .msgo")||document.querySelector("#quests .quest");
  if(b)b.scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}
// paga o presente do dia 2/3 na 1ª tarefa do dia
function hkPay(){const n=hkDay();const xp=HK_GIFT[n];if(!xp)return;const h=hkSt();if(h.got[n])return;const tk=todayKey();if(!hkReal(tk))return;
  h.got[n]=tk;if(!entries().some(e=>e.q==="ach:volta:"+n))addXP({q:"ach:volta:"+n,kind:"full",xp,stat:"foco",bonus:0,t:new Date().toISOString()},"");save();
  sysPop("PRESENTE DE VOLTA","🎁 Dia "+n+": +"+xp+" XP","Você voltou e já fez 1 tarefa. É assim que o jogo cresce: um dia de cada vez."+(n===2?" Amanhã tem outro presente, maior.":" A partir de agora, a sequência é o seu prêmio: no dia 7 vem um escudo."),null,"Bora");}
function hkTeaser(n){const s=streakDays();const out=[];
  if(n===1)out.push(["🎁","Amanhã: presente de +"+HK_GIFT[2]+" XP","Abre com a 1ª tarefa do dia 2."]);
  else if(n===2)out.push(["🎁","Amanhã: presente de +"+HK_GIFT[3]+" XP","E com 3 dias seguidos o baú do dia vira de prata."]);
  else{const f=7-s;if(f>0)out.push(["🛡️","Faltam "+f+(f===1?" dia":" dias")+" para o escudo","Ele salva a sequência sozinho num dia em branco."]);}
  out.push(["🔥","Amanhã a sequência vira "+(s+1),"1 tarefa por dia já mantém o fogo. O mínimo vale."]);
  const q=hkTomorrowQ();if(q)out.push(["▶","Primeira de amanhã: "+hkMin(q),"Deixe pronto agora o que precisa. Amanhã é só começar."]);
  return out;}
function hkUI(){let p=$("hkPanel");const qs=$("quests");const anchor=qs&&qs.closest("section");
  const hide=()=>{if(p)p.hidden=true;};
  if(!anchor||!cfg||cfg.blank||!cfg.quests||!cfg.quests.length||document.body.classList.contains("onboarding")||($("onb")&&!$("onb").hidden))return hide();
  const n=hkDay();if(n>HK_MAX)return hide();const tk=todayKey();const done=hkReal(tk);const h=hkSt();
  let mode="";if(done)mode="teaser";else if(HK_GIFT[n]&&!h.got[n])mode="gift";else if(new Date().getHours()>=18&&!isRest(tk)&&(n===1||streakDays()>0))mode="save";
  if(!mode)return hide();
  if(!p){p=document.createElement("section");p.className="panel hk";p.id="hkPanel";p.dataset.tab="hoje";p.dataset.sf="1";/* sf: as telas enxutas não recolhem este cartão */p.setAttribute("aria-live","polite");}
  if(p.previousElementSibling!==anchor)anchor.after(p);
  p.hidden=false;p.dataset.mode=mode;p.textContent="";
  const hd=hkEl("div","qhead");const h2=hkEl("h2");hd.append(h2);p.append(hd);
  if(mode==="teaser"){h2.textContent="🌙 Amanhã no Sistema";hd.append(hkEl("span","sm muted","dia "+(n+1)));
    const ul=hkEl("ul","hkl");for(const [ic,t,s] of hkTeaser(n)){const li=hkEl("li");li.append(hkEl("span","hki",ic));const tx=hkEl("span","hkt");tx.append(hkEl("b",null,t),hkEl("small",null,s));li.append(tx);ul.append(li);}
    p.append(ul);return;}
  const nq=hkNextQ();
  if(mode==="gift"){h2.textContent="🎁 Presente do dia "+n;hd.append(hkEl("span","xp","+"+HK_GIFT[n]+" XP"));
    p.append(hkEl("div","sm","Que bom te ver de volta. Faça 1 tarefa e o presente abre."+(nq?" A mais rápida: "+hkMin(nq)+".":"")));}
  else if(n===1){h2.textContent="🔥 Ainda dá tempo do dia 1";
    p.append(hkEl("div","sm","Uma tarefa acende o fogo. "+(nq?"A versão mínima já vale: "+hkMin(nq)+".":"Qualquer uma vale.")));}
  else{const s=streakDays();h2.textContent="🔥 Dá tempo de salvar o dia";
    p.append(hkEl("div","sm","Sequência de "+s+(s===1?" dia":" dias")+". "+(nq?"A versão mínima salva: "+hkMin(nq)+".":"Uma tarefa qualquer salva.")+(prog.shield&&prog.shield.n?" Se hoje não der, o escudo segura.":"")));}
  const b=hkEl("button","go","Ir para a tarefa");b.type="button";b.addEventListener("click",hkGo);const row=hkEl("div","row");row.append(b);p.append(row);}
// com os avisos já ligados (Ranking do dia) e o app em 2º plano: um lembrete gentil à noite nos primeiros dias
function hkBg(){if(typeof dyShow!=="function"||typeof dySt!=="function"||!document.hidden||!dySt().ntf)return;
  if(!cfg||cfg.blank||hkDay()>HK_MAX||new Date().getHours()<19)return;const tk=todayKey();if(hkReal(tk)||isRest(tk)||!streakDays())return;
  const q=hkNextQ();dyShow("volta","🔥 Ascension","Dá tempo de salvar a sequência. "+(q?"2 minutos: "+hkMin(q)+".":"1 tarefa basta."));}
{const _r=render;render=function(){_r.apply(this,arguments);try{hkUI();hkPay();}catch(e){}};}
setTimeout(()=>{try{hkUI();}catch(e){}},60);
setInterval(()=>{try{hkBg();}catch(e){}},15*60*1000);
document.addEventListener("visibilitychange",()=>{try{if(document.hidden)hkBg();else hkUI();}catch(e){}});
