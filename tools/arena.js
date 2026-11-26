// ---------- Arena do Sistema: batalha por turnos com d20, movida pelos 8 atributos ----------
// O herói é a própria pessoa: os números saem de atLevels() (atributos que sobem com tarefas reais).
//  ❤️ Vitalidade = vida · 🎯 Disciplina = defesa e Postura · 💪 Força = Golpe · 📘 Intelecto = Arcano
//  🦉 Sabedoria = Cura · 🗣️ Carisma = inimigo hesita · 🎨 Criatividade = crítico mais fácil · 💰 Fortuna = mais XP no prêmio
// Bateria do dia (prog.energy) mexe na vida inicial. Ler a meta do dia (leitura.js) dá +1 carga de Arcano.
// Fôlego: 1 luta por dia + 1 por tarefa feita hoje (máx. AR_MAX). Treinar na vida real = lutar mais e mais forte.
// Só ADICIONA prog.arena = {fl, best, w, l, day:{dia:lutas}}. XP entra como "ach:bt:<dia>:<n>" (não conta sequência nem atributo), teto AR_CAP/dia.
const AR_MAX=5,AR_CAP=20;
const arB=l=>Math.floor((l||1)*2/3);
function arSt(){if(!prog.arena||typeof prog.arena!=="object")prog.arena={};const a=prog.arena;a.fl=Math.max(1,a.fl|0||1);a.best=a.best|0;a.w=a.w|0;a.l=a.l|0;a.day=a.day&&typeof a.day==="object"?a.day:{};return a;}
function arEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function arLv(){try{return atLevels();}catch(e){const o={};for(const a of ["forca","vital","intel","sabed","disc","caris","criat","fort"])o[a]=1;return o;}}
function arTk(){return todayKey();}
function arDone(){return (prog.log[arTk()]||[]).filter(e=>!/^(ach|checkin|tip|dun|sq|zap|ch|adm|boss|foco|ler):/.test(String(e.q))).length;}
function arFolego(){const a=arSt();const tot=Math.min(AR_MAX,1+arDone());const used=a.day[arTk()]||0;return {tot,used,left:Math.max(0,tot-used)};}
function arReadToday(){try{return typeof lrHitToday==="function"&&lrHitToday();}catch(e){return false;}}
function arHero(){const L=arLv();const en=((prog.energy||{})[arTk()])||"";let hp=20+4*L.vital;
  if(en==="baixa")hp=Math.round(hp*.8);else if(en==="alta")hp=Math.round(hp*1.1);
  return {L,hp,ac:10+arB(L.disc),arc:2+(arReadToday()?1:0),heal:2,crit:L.criat>=10?18:L.criat>=5?19:20,hes:Math.min(.3,arB(L.caris)*.04),en};}
function arFoe(n){const boss=n%5===0;let b=null;try{b=TB_LIST[(n-1)%TB_LIST.length];}catch(e){}
  if(!b)b=["Sombra do Adiamento","Sombra","drag","#7b2cff","#ff4fd8","Depois você faz."];
  return {n,boss,b,name:(boss?"CHEFE · ":"")+b[0],hp:Math.round((14+4*n)*(boss?1.3:1)),ac:9+Math.floor(n/3),th:1+Math.floor(n/2.5),dmg:Math.floor(n/3)};}
const arD=n=>1+Math.floor(Math.random()*n);
function arRM(){try{return matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){return false;}}
// --- painel em Progresso ---
function arUI(){let p=$("arPanel");const anchor=$("atPanel")||$("avPanel");
  if(!p){if(!anchor)return;p=arEl("section","panel arp");p.id="arPanel";p.dataset.tab="prog";anchor.after(p);}
  if(!cfg||cfg.blank){p.hidden=true;return;}p.hidden=false;p.textContent="";
  const a=arSt(),h=arHero(),f=arFolego(),foe=arFoe(a.fl);
  const hd=arEl("div","arhd");hd.append(arEl("h2",null,"⚔️ Arena do Sistema"),arEl("span","sm mono","andar "+a.fl+(a.best?" · recorde "+a.best:"")));p.append(hd);
  p.append(arEl("div","sm muted","Batalha por turnos com d20. Sua força aqui é a da vida real: cada atributo que você treina vira poder na luta."));
  const st=arEl("div","arstats");
  for(const [ic,lb,v] of [["❤️","Vida",h.hp],["🛡️","Defesa",h.ac],["💪","Golpe","+"+arB(h.L.forca)],["📘","Arcano","+"+arB(h.L.intel)]]){const c=arEl("div","arst");c.append(arEl("b",null,ic+" "+v),arEl("small",null,lb));st.append(c);}
  p.append(st);
  const nx=arEl("div","arnext");const ic=arEl("span","arico");try{ic.innerHTML=tbArt(foe.b,100,false);}catch(e){}
  const tx=arEl("div","artx");tx.append(arEl("b",null,foe.name),arEl("small",null,"Vida "+foe.hp+" · Defesa "+foe.ac+(foe.boss?" · prêmio dobrado":"")));nx.append(ic,tx);p.append(nx);
  const fo=arEl("div","arfol");fo.append(arEl("span","sm","Fôlego hoje "));const dots=arEl("span","ardots");dots.setAttribute("aria-label",f.left+" de "+f.tot+" lutas");
  for(let i=0;i<AR_MAX;i++)dots.append(arEl("i",i<f.left?"on":i<f.tot?"used":""));fo.append(dots);p.append(fo);
  const go=arEl("button","go arGo",f.left?"Lutar no andar "+a.fl:"Sem fôlego: faça uma tarefa");go.type="button";go.id="arGo";go.disabled=!f.left;go.onclick=arStart;p.append(go);
  if(!f.left)p.append(arEl("div","sm muted","Cada tarefa feita hoje dá +1 luta (até "+AR_MAX+")."));
  if(h.en==="baixa")p.append(arEl("div","sm arwarn","🔋 Bateria baixa hoje: você entra com 80% da vida."));
  if(arReadToday())p.append(arEl("div","sm arok","📖 Meta de leitura batida: +1 carga de Arcano hoje."));
  const dt=arEl("details","arhow");dt.append(arEl("summary",null,"Como cada atributo luta"));const ul=arEl("ul","sm");
  for(const t of ["❤️ Vitalidade: sua vida (sono, água, comida).","🎯 Disciplina: sua defesa e a Postura.","💪 Força: o Golpe.","📘 Intelecto: o Arcano (forte, poucas cargas).","🦉 Sabedoria: a Cura.","🗣️ Carisma: chance de o inimigo hesitar.","🎨 Criatividade: crítico com 19 (nível 5) e 18 (nível 10).","💰 Fortuna: mais XP quando vence."])ul.append(arEl("li",null,t));
  dt.append(ul);p.append(dt);}
// --- a luta ---
let arB_=null;
function arStart(){const f=arFolego();if(!f.left){toast("Sem fôlego. Faça uma tarefa para lutar de novo.");return;}
  const a=arSt();a.day[arTk()]=(a.day[arTk()]||0)+1;for(const k in a.day)if(k<arTk())delete a.day[k];save();
  const h=arHero(),foe=arFoe(a.fl);arB_={h,foe,hp:h.hp,fh:foe.hp,arc:h.arc,heal:h.heal,guard:false,busy:false,turn:1,over:false};arOpen();}
function arOpen(){let m=$("arModal");if(m)m.remove();m=arEl("div","armodal");m.id="arModal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Batalha na Arena");
  const c=arEl("div","arcard");const B=arB_;
  const top=arEl("div","artop");top.append(arEl("span","artag","ANDAR "+B.foe.n),arEl("b","arname",B.foe.name));
  const x=arEl("button","link arflee","Fugir");x.type="button";x.onclick=()=>arEnd(false,true);top.append(x);c.append(top);
  const stage=arEl("div","arstage tbstage");stage.id="arStage";c.append(stage);
  c.append(arBar("arFoeBar","Inimigo"));
  const say=arEl("div","arsay",(B.foe.b[5]||""));c.append(say);
  const roll=arEl("div","arroll");roll.id="arRoll";roll.setAttribute("aria-live","polite");c.append(roll);
  c.append(arBar("arHeroBar","Você"));
  const acts=arEl("div","aracts");acts.id="arActs";
  for(const [k,ic,nm,sub] of [["g","💪","Golpe","Força"],["a","📘","Arcano","Intelecto"],["d","🎯","Postura","Disciplina"],["c","🦉","Cura","Sabedoria"]]){
    const b=arEl("button","aract");b.type="button";b.dataset.k=k;b.append(arEl("b",null,ic+" "+nm),arEl("small",null,sub));b.onclick=()=>arTurn(k);acts.append(b);}
  c.append(acts);m.append(c);document.body.append(m);arDraw();setTimeout(()=>{const b=acts.querySelector("button");if(b)b.focus();},50);}
function arBar(id,lb){const w=arEl("div","arbar");w.id=id;w.append(arEl("span","arbl",lb),arEl("div","arbt"),arEl("span","arbv"));w.querySelector(".arbt").append(arEl("i"));return w;}
function arSet(id,v,mx){const w=$(id);if(!w)return;const p=Math.max(0,v)/mx*100;w.querySelector("i").style.width=p.toFixed(1)+"%";w.querySelector(".arbv").textContent=Math.max(0,v)+"/"+mx;w.classList.toggle("arlow",p<35);}
function arDraw(){const B=arB_;if(!B)return;const pct=Math.round(Math.max(0,B.fh)/B.foe.hp*100);const s=$("arStage");if(s){try{s.innerHTML=tbArt(B.foe.b,pct,B.fh<=0);}catch(e){}s.classList.toggle("dead",B.fh<=0);}
  arSet("arFoeBar",B.fh,B.foe.hp);arSet("arHeroBar",B.hp,B.h.hp);
  for(const b of document.querySelectorAll("#arActs .aract")){const k=b.dataset.k;let lbl=b.querySelector("small");
    if(k==="a"){lbl.textContent="Intelecto · "+B.arc+"x";b.disabled=B.busy||!B.arc;}else if(k==="c"){lbl.textContent="Sabedoria · "+B.heal+"x";b.disabled=B.busy||!B.heal||B.hp>=B.h.hp;}else b.disabled=B.busy;}}
function arSay(html,cl){const r=$("arRoll");if(!r)return;r.className="arroll"+(cl?" "+cl:"");r.innerHTML=html;}
function arDie(n,cl){return '<span class="ard20'+(cl?" "+cl:"")+'">'+'<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4L90 27V73L50 96L10 73V27Z" fill="#0d1830" stroke="currentColor" stroke-width="4"/><path d="M50 22L22 66H78Z M50 4V22M10 27L50 22M90 27L50 22M10 27L22 66M90 27L78 66M10 73L22 66M90 73L78 66M50 96L22 66M50 96L78 66" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="2.5"/></svg>'+'<b>'+n+'</b></span>';}
function arShake(id){if(arRM())return;const e=$(id);if(!e)return;e.classList.remove("hit");void e.offsetWidth;e.classList.add("hit");}
function arTurn(k){const B=arB_;if(!B||B.busy||B.over)return;B.busy=true;arDraw();const L=B.h.L;let msg="";
  try{haptic(10);}catch(e){}
  if(k==="c"){B.heal--;const v=arD(8)+2+2*arB(L.sabed);const was=B.hp;B.hp=Math.min(B.h.hp,B.hp+v);msg="🦉 Cura: +"+(B.hp-was)+" de vida.";arSay(msg,"good");}
  else if(k==="d"){B.guard=true;msg="🎯 Postura: o próximo ataque vem com desvantagem e você contra-ataca se ele errar.";arSay(msg,"good");}
  else{const at=k==="a"?"intel":"forca";if(k==="a")B.arc--;const d=arD(20),mod=arB(L[at])+3,tot=d+mod;const crit=d>=B.h.crit;
    let dm=0;if(d!==1&&(crit||tot>=B.foe.ac)){dm=k==="a"?arD(6)+arD(6)+arB(L.intel):arD(8)+arB(L.forca);if(crit)dm+=k==="a"?arD(6)+arD(6):arD(8);B.fh-=dm;}
    const nm=k==="a"?"📘 Arcano":"💪 Golpe";
    msg=arDie(d,crit?"crit":d===1?"fail":"")+'<span>'+nm+": "+d+" + "+mod+" = "+tot+" vs defesa "+B.foe.ac+"<br><b>"+(crit?"CRÍTICO! "+dm+" de dano":dm?"Acertou: "+dm+" de dano":d===1?"Falha crítica.":"Errou.")+"</b></span>";
    arSay(msg,crit?"crit":dm?"good":"bad");if(dm){arShake("arStage");if(crit)try{haptic([20,40,30]);}catch(e){}}}
  arDraw();if(B.fh<=0){setTimeout(()=>arEnd(true),arRM()?200:900);return;}
  setTimeout(arFoeTurn,arRM()?300:1100);}
function arFoeTurn(){const B=arB_;if(!B||B.over)return;const f=B.foe;let txt="";
  if(Math.random()<B.h.hes){txt="🗣️ "+f.b[1]+" hesitou. Seu Carisma pesou.";arSay(txt,"good");}
  else{let d=arD(20);if(B.guard)d=Math.min(d,arD(20));const hit=d===20||(d!==1&&d+f.th>=B.h.ac);
    if(hit){const dm=arD(6)+f.dmg+(d===20?arD(6):0);B.hp-=dm;txt=f.b[1]+" atacou: "+d+" + "+f.th+" vs sua defesa "+B.h.ac+". <b>−"+dm+" de vida</b>";arShake("arHeroBar");try{haptic(30);}catch(e){}arSay(txt,"bad");}
    else{let ex="";if(B.guard){const c=arB(B.h.L.disc)+1;B.fh-=c;ex=" Contra-ataque: "+c+" de dano.";}txt=f.b[1]+" errou ("+d+" + "+f.th+" vs "+B.h.ac+")."+ex;arSay(txt,"good");}}
  B.guard=false;B.turn++;B.busy=false;arDraw();
  if(B.fh<=0){setTimeout(()=>arEnd(true),arRM()?200:900);return;}
  if(B.hp<=0){B.busy=true;arDraw();setTimeout(()=>arEnd(false),arRM()?200:900);}}
// fraqueza: o atributo mais baixo entre os que pesam na luta vira conselho de vida real
function arTip(){const L=arLv();const keys=["vital","forca","intel","disc","sabed"];let w=keys[0];for(const k of keys)if((L[k]||1)<(L[w]||1))w=k;
  let d=null;try{d=AT_BY[w];}catch(e){}return d?"Ponto fraco: "+d[1]+" "+d[2]+" nível "+(L[w]||1)+". Ele sobe com "+d[4]+".":"Faça suas tarefas de hoje para ficar mais forte.";}
function arXPToday(){const tk=arTk();return (prog.log[tk]||[]).filter(e=>String(e.q).startsWith("ach:bt:")).reduce((s,e)=>s+(e.xp||0),0);}
function arEnd(win,fled){const B=arB_;if(!B||B.over)return;B.over=true;B.busy=true;const a=arSt();const m=$("arModal");
  let title,text,xp=0;
  if(win){a.w++;const n=B.foe.n;xp=Math.min(AR_CAP-arXPToday(),(4+Math.floor(n/2)+arB(B.h.L.fort))*(B.foe.boss?2:1));xp=Math.max(0,xp);
    if(n===a.fl)a.fl=n+1;a.best=Math.max(a.best,n);
    if(xp>0){try{const tk=arTk();const i=(prog.log[tk]||[]).filter(e=>String(e.q).startsWith("ach:bt:")).length;addXP({q:"ach:bt:"+tk+":"+(i+1),kind:"full",xp,stat:"foco",bonus:0,t:new Date().toISOString()},"");}catch(e){}}
    title=B.foe.boss?"CHEFE DERROTADO":"VITÓRIA";text=B.foe.b[1]+" caiu no andar "+n+"."+(xp?" +"+xp+" XP.":" (XP da arena de hoje já no teto.)")+" Andar "+a.fl+" liberado.";}
  else{if(!fled)a.l++;title=fled?"VOCÊ RECUOU":"DERROTA";const fp=Math.max(0,B.fh)/B.foe.hp;text=(fled?"Recuar também é estratégia. ":fp<.3?"Faltou pouco. ":"Esse andar ainda está acima do seu nível. ")+arTip();}
  save();
  if(m){const c=m.querySelector(".arcard");const r=arEl("div","arres "+(win?"win":"lose"));r.append(arEl("b",null,(win?"🏆 ":fled?"🏳️ ":"💀 ")+title),arEl("p",null,text));
    if(!win&&!fled)r.append(arEl("p","sm muted","Sua força na arena vem das tarefas reais. Volte mais forte."));
    const f=arFolego();const row=arEl("div","row");
    if(f.left){const again=arEl("button","go",win?"Próximo andar ("+f.left+" fôlego)":"Tentar de novo ("+f.left+" fôlego)");again.type="button";again.onclick=()=>{m.remove();arStart();};row.append(again);}
    const ok=arEl("button",f.left?"ghost":"go","Voltar");ok.type="button";ok.onclick=()=>{m.remove();arB_=null;try{arUI();}catch(e){}};row.append(ok);r.append(row);
    const acts=$("arActs");if(acts)acts.remove();const fl=m.querySelector(".arflee");if(fl)fl.remove();c.append(r);setTimeout(()=>{try{(row.querySelector("button")).focus();}catch(e){}},50);}
  try{arUI();}catch(e){}}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("arModal")&&arB_){if(arB_.over){$("arModal").remove();arB_=null;}}});
{const _r=render;render=function(){_r.apply(this,arguments);try{if(document.body.dataset.tab==="prog"||!$("arPanel"))arUI();}catch(e){}};}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest('#tabbar [data-go="prog"]');if(b)setTimeout(()=>{try{arUI();}catch(x){}},0);},true);
setTimeout(()=>{try{arUI();}catch(e){}},0);
