// ---------- Quebrar correntes: largar um hábito, um dia de cada vez ----------
// Check-in diário "Fiquei limpo hoje": +XP na hora e um bônus que cresce com a sequência (vai para o "cofre").
// Marcos (3, 7, 14, 30, 60, 90 dias) pagam o cofre. Recaída = recomeço: metade do cofre é sua, a sequência volta a 1.
// Linguagem neutra, sem promessa de saúde. Tudo fica no celular. Só ADICIONA prog.chains = [{...}].
const CH_MAX=3,CH_DAY=5,CH_MS=[3,7,14,30,60,90,180,365];
const CH_LIST=[
  {h:"tela",n:"Menos tempo de tela",ic:"📵",age:"all"},{h:"redes",n:"Rolar redes sociais sem parar",ic:"📱",age:"all"},
  {h:"doce",n:"Doces e refrigerante",ic:"🍬",age:"all"},{h:"jogo",n:"Jogar além da conta",ic:"🎮",age:"all"},
  {h:"adiar",n:"Deixar tudo para depois",ic:"⏳",age:"teen"},{h:"unha",n:"Roer unha",ic:"✋",age:"teen"},
  {h:"cigarro",n:"Cigarro ou vape",ic:"🚭",age:"adult",apoio:1},{h:"alcool",n:"Álcool",ic:"🚫",age:"adult",apoio:1},
  {h:"aposta",n:"Apostas",ic:"🎲",age:"adult"},{h:"outro",n:"Outro hábito",ic:"⛓️",age:"adult"}];
function chList(){const a=typeof ageNow==="function"?ageNow():"";return CH_LIST.filter(x=>x.age==="all"||(x.age==="teen"&&a!=="kid")||(x.age==="adult"&&a!=="kid"&&a!=="teen"));}
function chSt(){if(!Array.isArray(prog.chains))prog.chains=[];return prog.chains;}
const chDk=d=>dkey(d||new Date());
function chYest(){const d=new Date();d.setDate(d.getDate()-1);return chDk(d);}
// sequência atual: dias seguidos com check-in até hoje ou ontem
function chRun(c){if(!c.last)return 0;if(c.last!==chDk()&&c.last!==chYest())return 0;return c.run||0;}
function chBonus(run){return Math.min(20,run*2);}
function chNext(run){return CH_MS.find(m=>m>run)||null;}
function chEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function chCheck(c){const tk=chDk();if(c.last===tk||c.rday===tk)return;const run=chRun(c)+1;c.run=run;c.last=tk;c.best=Math.max(c.best||0,run);
  const b=chBonus(run);c.bank=(c.bank||0)+b;let pay=0,ms=null;if(CH_MS.includes(run)){pay=c.bank;c.bank=0;ms=run;}
  save();addXP({q:"ch:"+c.id+":"+tk,kind:"chain",xp:CH_DAY+pay,stat:"mente",bonus:0,t:new Date().toISOString()},"Corrente: dia "+run+" (+"+(CH_DAY+pay)+" XP)");
  try{haptic([12,30,12]);}catch(e){}try{if(typeof sendRank==="function")sendRank("corrente",true);}catch(e){}
  if(ms)sysPop("CORRENTE",ms+" dias: um elo quebrado","\""+c.n+"\": "+ms+" dias seguidos. O cofre abriu: +"+pay+" XP. Próximo marco: "+(chNext(run)||"você decide")+" dias.",null,"Continuar");
  chUI();}
function chRestart(c){if(!confirm("Registrar um recomeço em \""+c.n+"\"? A sequência volta para o dia 1 e metade do cofre vira XP agora."))return;
  const keep=Math.floor((c.bank||0)/2);c.restarts=(c.restarts||0)+1;c.run=0;c.last=null;c.bank=0;c.since=chDk();c.rday=chDk();save();
  if(keep>0)addXP({q:"ch:"+c.id+":r"+c.restarts+":"+chDk(),kind:"chain",xp:keep,stat:"mente",bonus:0,t:new Date().toISOString()},"Recomeço: +"+keep+" XP guardados");
  sysPop("RECOMEÇO","Recomeçar também conta","Você manteve "+keep+" XP do cofre e o seu recorde de "+(c.best||0)+(c.best===1?" dia":" dias")+". Amanhã começa o dia 1. Uma queda não apaga o caminho.",null,"Bora");chUI();}
function chAdd(item,custom){const L=chSt();if(L.length>=CH_MAX){toast("Até "+CH_MAX+" correntes ao mesmo tempo.");return;}
  const n=item.h==="outro"?String(custom||"").trim().replace(/[|<>]/g,"").slice(0,40):item.n;if(!n)return;
  if(L.some(c=>c.h===item.h&&item.h!=="outro")){toast("Essa corrente já está aqui.");return;}
  L.push({id:Math.random().toString(36).slice(2,8),h:item.h,n,ic:item.ic,since:chDk(),run:0,best:0,bank:0,restarts:0,last:null});save();chOpen=false;chUI();
  toast("Corrente criada. Marque todo dia que conseguir.");}
let chOpen=false;
function chUI(){let p=$("chPanel");const anchor=$("quests")&&$("quests").closest("section");if(!anchor)return;
  if(!p){p=chEl("section","panel chn");p.id="chPanel";p.dataset.tab="hoje";anchor.after(p);}
  if(!cfg||cfg.blank){p.hidden=true;return;}p.hidden=false;p.textContent="";const L=chSt();
  const hd=chEl("div","qhead");hd.append(chEl("h2",null,"⛓️ Quebrar correntes"),chEl("span","xp",L.length?L.filter(c=>c.last===chDk()).length+"/"+L.length+" hoje":"um dia de cada vez"));p.append(hd);
  if(!L.length&&!chOpen){p.append(chEl("div","sm muted","Escolha um hábito que você quer largar. Cada dia limpo dá XP, e a sequência enche um cofre que abre nos marcos."));}
  for(const c of L){const run=chRun(c),done=c.last===chDk(),rd=c.rday===chDk(),nx=chNext(run);const dd=n=>n+(n===1?" dia":" dias");const it=CH_LIST.find(x=>x.h===c.h)||{};
    const card=chEl("div","chc"+(done?" done":""));const top=chEl("div","chtop");top.append(chEl("span","ic",c.ic||"⛓️"),chEl("b",null,c.n),chEl("span","chrun",dd(run)));card.append(top);
    const links=chEl("div","chlinks");const pct=nx?Math.round(run/nx*100):100;for(let i=0;i<10;i++){const k=chEl("i",i<Math.round(pct/10)?"on":"");links.append(k);}card.append(links);
    card.append(chEl("div","sm muted",(nx?"Marco de "+nx+" dias: faltam "+dd(nx-run)+". ":"")+"Cofre: "+(c.bank||0)+" XP. Recorde: "+dd(c.best||0)+(c.restarts?" · "+c.restarts+" recomeço(s)":"")+"."));
    const row=chEl("div","row");const ok=chEl("button",done||rd?"ghost":"go",done?"✓ Limpo hoje":rd?"Recomeço hoje · dia 1 amanhã":"Fiquei limpo hoje · +"+CH_DAY+" XP");ok.type="button";ok.disabled=done||rd;ok.addEventListener("click",()=>chCheck(c));
    const rs=chEl("button","link","Recomeçar");rs.type="button";rs.addEventListener("click",()=>chRestart(c));
    const rm=chEl("button","link","Remover");rm.type="button";rm.addEventListener("click",()=>{if(!confirm("Remover a corrente \""+c.n+"\"? O XP que você ganhou continua."))return;prog.chains=chSt().filter(x=>x!==c);save();chUI();});
    row.append(ok,rs,rm);card.append(row);
    if(it.apoio)card.append(chEl("div","chapoio","Quer apoio para parar? Disque Saúde 136 (gratuito)."));
    p.append(card);}
  if(L.length<CH_MAX){if(!chOpen){const b=chEl("button","ghost",L.length?"+ Outra corrente":"Escolher um hábito");b.type="button";b.addEventListener("click",()=>{chOpen=true;chUI();});p.append(b);}
    else{const g=chEl("div","chpick");for(const x of chList()){if(L.some(c=>c.h===x.h&&x.h!=="outro"))continue;const b=chEl("button","chip",x.ic+" "+x.n);b.type="button";
        b.addEventListener("click",()=>{if(x.h!=="outro"){chAdd(x);return;}const r=chEl("div","add");const inp=chEl("input");inp.maxLength=40;inp.placeholder="Qual hábito?";const s=chEl("button","go","Criar");s.type="button";s.addEventListener("click",()=>chAdd(x,inp.value));r.append(inp,s);g.after(r);inp.focus();});g.append(b);}
      const cx=chEl("button","link","Cancelar");cx.type="button";cx.addEventListener("click",()=>{chOpen=false;chUI();});p.append(g,cx);}}}
{const _r=render;render=function(){_r.apply(this,arguments);try{if(!$("chPanel")||!$("chPanel").contains(document.activeElement))chUI();}catch(e){}};}
setTimeout(()=>{try{chUI();}catch(e){}},0);
