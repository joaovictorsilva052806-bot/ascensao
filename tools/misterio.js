// ---------- Cartas do Sistema: mistério sem sorteio (tools/misterio.*) ----------
// Cartas "???" que se revelam por CONQUISTA (sequência, nível, missões, chefão, 1ª Task que paga). Nada é aleatório,
// nada se compra com Ouro ou dinheiro (ECA Digital, art. 20): cada carta tem prêmio fixo e paga 1 vez.
// 1 sinal por semana na voz do Sistema (no máximo 12 palavras), mostrado em Hoje no máximo 1 vez por dia.
// Só ADICIONA prog.myst = {c:{id:dia da revelação}, p:{id:dia em que o Ouro foi pago}, hd:dia em que o sinal foi escondido}. O XP entra como "ach:myst:<id>";
// o Ouro passa por orGive("myst:<id>") (idempotente e com o teto do dia: se o teto bateu, paga no dia seguinte). Nada sai do aparelho.
const MY_C=[// [id, ícone, nome, dica selada, fala ao revelar, Ouro, XP, progresso()->[atual,meta], aparece?]
 ["m_3d","🔥","Brasa Acesa","Três sóis seguidos acendem algo aqui.","Três dias seguidos. A brasa pegou: agora é só não deixar apagar.",20,10,()=>[myStreak(),3]],
 ["m_q10","✦","Dez Passos","Dez vitórias abrem a primeira fresta.","Dez missões cumpridas. O Sistema anotou seu nome entre os que fazem.",20,10,()=>[myQuests(),10]],
 ["m_lv5","◈","Quinto Selo","No quinto degrau, o selo cede.","Nível 5. Você deixou de ser iniciante. O Sistema percebeu.",40,15,()=>[myLevel(),5]],
 ["m_boss","⚔️","Eco do Chefão","Derrube o que ruge no fim da semana.","Chefão no chão. O eco dessa luta fica guardado nesta carta.",30,15,()=>[myBoss()?1:0,1]],
 ["m_7d","☄️","Cometa de Sete Noites","Sete noites sem deixar a luz apagar.","Sete dias seguidos. Raro como cometa, e foi você que fez.",50,20,()=>[myStreak(),7]],
 ["m_tp","👑","Primeiro Tesouro","Uma tarefa que paga de verdade abre este cofre.","Sua 1ª Task que paga saiu. Esforço real, resultado real.",50,20,()=>[myTp(),1],()=>{try{return typeof ad18==="function"&&ad18();}catch(e){return false;}}]];
// sinais da semana: um por semana, em rodízio, sempre apontando para uma carta ainda selada (até 12 palavras cada)
const MY_P={m_3d:"Sinal fraco detectado: três sóis, uma brasa.",m_q10:"O Sistema conta em silêncio. Faltam poucas vitórias.",m_lv5:"Um selo treme quando você sobe.",
 m_boss:"Algo ruge no fim da semana. Ele guarda uma carta.",m_7d:"Um cometa passa a cada sete noites sem falha.",m_tp:"Existe um cofre que só abre com trabalho de verdade."};
function mySt(){let m=prog.myst;if(!m||typeof m!=="object"||Array.isArray(m))m=prog.myst={};if(!m.c||typeof m.c!=="object"||Array.isArray(m.c))m.c={};return m;}
function myEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function myStreak(){try{return streakDays();}catch(e){return 0;}}
function myQuests(){try{return secQuests();}catch(e){return 0;}}
function myLevel(){try{return levelOf(totalXP());}catch(e){return 1;}}
function myBoss(){for(const k in prog.log)for(const e of (prog.log[k]||[]))if(/^ach:tb:/.test(String(e.q)))return true;return false;}
function myTp(){try{return typeof tpDone==="function"?tpDone():0;}catch(e){return 0;}}
function myList(){return MY_C.filter(c=>!c[8]||c[8]()||mySt().c[c[0]]);}
function myReady(){try{return typeof secReady==="function"?secReady():!!(cfg&&!cfg.blank);}catch(e){return false;}}
function myProg(c){try{const [a,b]=c[7]();return [Math.max(0,Math.min(+a||0,b)),b];}catch(e){return [0,1];}}
// semana do ano (determinística: mesmo aparelho, mesma semana, mesmo sinal; nada é sorteado)
function myWeek(){const ws=weekStart(todayKey()).split("-").map(Number);return Math.floor(Date.UTC(ws[0],ws[1]-1,ws[2])/(7*864e5));}
function mySignal(){const sealed=myList().filter(c=>!mySt().c[c[0]]);if(!sealed.length)return null;const c=sealed[myWeek()%sealed.length];return {c,t:MY_P[c[0]]};}
// paga o que ainda falta (o teto diário do Ouro pode ter adiado)
function myPay(){if(typeof orGive!=="function")return;const m=mySt();if(!m.p||typeof m.p!=="object"||Array.isArray(m.p))m.p={};let ch=false;
  for(const c of MY_C)if(m.c[c[0]]&&!m.p[c[0]]){try{orGive("myst:"+c[0],c[5],"Carta "+c[2]);if(orX().got["myst:"+c[0]]){m.p[c[0]]=todayKey();ch=true;}}catch(e){}}if(ch)save();}
let myBusy=false;const myNew=new Set();// só a carta recém-revelada gira (uma vez por sessão)
function myScan(){if(myBusy||!myReady())return;myBusy=true;try{const m=mySt(),got=[];
  for(const c of myList()){if(m.c[c[0]])continue;const [a,b]=myProg(c);if(a<b)continue;m.c[c[0]]=todayKey();got.push(c);myNew.add(c[0]);}
  if(!got.length){myPay();return;}
  save();for(const c of got)pushEntry({q:"ach:myst:"+c[0],kind:"full",xp:c[6],stat:"mente",bonus:0,t:new Date().toISOString()},"");
  myPay();myPanel();myPop(got);}finally{myBusy=false;}}
function myPop(got){const c=got[got.length-1];const ouro=got.reduce((s,x)=>s+x[5],0),xp=got.reduce((s,x)=>s+x[6],0);
  const title=got.length>1?"🃏 "+got.length+" cartas reveladas":c[1]+" "+c[2];
  const txt=(got.length>1?got.map(x=>x[1]+" "+x[2]).join(" · ")+". ":c[4]+" ")+"(+"+ouro+" Ouro · +"+xp+" XP)";
  sysPop("CARTA REVELADA",title,txt,myGo,"Ver minhas cartas");}
// ---------- painel na aba Progresso ----------
function myPanel(){let p=$("myPanel");const anchor=$("secPanel")||$("achList")&&$("achList").closest("section");if(!anchor)return;
  if(!p){p=myEl("section","panel mypanel");p.id="myPanel";p.dataset.tab="prog";anchor.before(p);}
  if(!myReady()){p.hidden=true;return;}p.hidden=false;const m=mySt(),L=myList(),n=L.filter(c=>m.c[c[0]]).length;
  let hd=p.firstElementChild;if(!hd||!hd.classList.contains("qhead")){p.textContent="";hd=myEl("div","qhead");hd.append(myEl("h2",null,"🃏 Cartas do Sistema"),myEl("span","sm mono"));p.append(hd);}
  hd.querySelector("span").textContent=n+" / "+L.length;while(hd.nextSibling)hd.nextSibling.remove();
  p.append(myEl("div","sm muted","Cada carta abre com uma conquista. Prêmio fixo, 1 vez. Nada se compra."));
  const g=myEl("div","mygrid");g.setAttribute("role","list");
  for(const c of L){const on=!!m.c[c[0]],[a,b]=myProg(c);const d=myEl("div","mycard"+(on?" on":"")+(on&&myNew.has(c[0])?" new":""));d.setAttribute("role","listitem");
    if(on){d.append(myEl("span","myico",c[1]),myEl("b",null,c[2]),myEl("span","sm",c[4]),myEl("span","sm mono myprize","+"+c[5]+" 🪙 · +"+c[6]+" XP"));
      d.setAttribute("aria-label","Carta revelada: "+c[2]+". "+c[4]);}
    else{d.append(myEl("span","myico","?"),myEl("b",null,"???"),myEl("span","sm",c[3]));
      const bar=myEl("div","mymeter");bar.setAttribute("role","progressbar");bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax",String(b));bar.setAttribute("aria-valuenow",String(a));
      bar.setAttribute("aria-label","Carta selada: "+a+" de "+b);const f=myEl("i");f.style.width=Math.round(100*a/b)+"%";bar.append(f);d.append(bar,myEl("span","sm mono muted",a+"/"+b));}
    g.append(d);}
  p.append(g);const s=mySignal();if(s)p.append(myEl("div","sm mono mysig","📡 Sinal da semana: « "+s.t+" »"));}
function myGo(){setTimeout(()=>{myNew.clear();},4000);goTab("prog");setTimeout(()=>{const p=$("myPanel");if(!p)return;try{if(p._fset)p._fset(true);}catch(e){}
  p.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});},80);}
// ---------- sinal em Hoje: no máximo 1 aviso misterioso por dia, e nunca junto da linha das Tasks que pagam ----------
function myLine(){let l=$("myLine");const s=myReady()?mySignal():null;const tp=$("tpLine");
  const show=!!s&&mySt().hd!==todayKey()&&!(tp&&!tp.hidden)&&!document.body.classList.contains("onboarding");
  if(!show){if(l)l.hidden=true;return;}
  if(!l){const q=$("quests")&&$("quests").closest("section");if(!q)return;l=myEl("section","panel myline");l.id="myLine";l.dataset.tab="hoje";q.after(l);}
  l.hidden=false;l.textContent="";const b=myEl("button","mylbtn");b.type="button";b.id="myLineGo";
  b.append(myEl("span","sm mono mytag","[ SISTEMA ] SINAL"),myEl("span","mytxt","« "+s.t+" »"));b.addEventListener("click",myGo);
  const x=myEl("button","myx","✕");x.type="button";x.id="myLineX";x.setAttribute("aria-label","Esconder o sinal até amanhã");
  x.addEventListener("click",()=>{mySt().hd=todayKey();save();l.hidden=true;toast("Sinal guardado. Volta amanhã.");});
  l.append(b,x);}
{const _r=render;render=function(){_r.apply(this,arguments);try{myPanel();myLine();}catch(e){}clearTimeout(myScan._t);myScan._t=setTimeout(()=>{try{myScan();}catch(e){}},700);};}
