// ---------- Cartão do jogador na aba Hoje: ficha expansível (tools/heroi.*) ----------
// O topo da aba Hoje ganha uma "ficha" que abre ali mesmo: XP até o próximo nível e o próximo desbloqueio,
// radar dos 8 atributos com a classe, título em uso, lema, fundo do cartão (destrava por nível) e atalhos.
// Só ADICIONA prog.hero = {open:0|1, bg:"id", motto:"texto"}. O lema e o fundo ficam só neste aparelho (nada vai para o ranking).
const HR_BG=[// [id, nome, nível, camada de fundo]
 ["grade","Grade do Sistema",1,""],
 ["aurora","Aurora",3,"radial-gradient(120% 90% at 0% 0%,rgba(61,220,151,.22),transparent 60%),radial-gradient(120% 90% at 100% 100%,rgba(122,162,255,.24),transparent 60%)"],
 ["runas","Círculo Rúnico",6,"repeating-conic-gradient(from 0deg at 85% 30%,rgba(111,177,255,.10) 0 6deg,transparent 6deg 18deg),radial-gradient(80% 80% at 85% 30%,rgba(0,212,255,.18),transparent 70%)"],
 ["brasa","Brasa",9,"radial-gradient(130% 80% at 50% 120%,rgba(255,90,31,.32),transparent 65%),linear-gradient(180deg,transparent,rgba(255,209,102,.07))"],
 ["galaxia","Galáxia",12,"radial-gradient(1.5px 1.5px at 20% 30%,#fff,transparent),radial-gradient(1px 1px at 70% 20%,#cfe3ff,transparent),radial-gradient(1.5px 1.5px at 85% 70%,#fff,transparent),radial-gradient(1px 1px at 35% 80%,#e9d7ff,transparent),radial-gradient(110% 90% at 80% 10%,rgba(179,136,255,.30),transparent 60%),radial-gradient(90% 80% at 10% 100%,rgba(0,212,255,.18),transparent 60%)"],
 ["sombra","Sombra Roxa",16,"linear-gradient(135deg,rgba(123,44,255,.28),transparent 55%),linear-gradient(315deg,rgba(255,79,216,.18),transparent 50%)"],
 ["lenda","Lenda Dourada",20,"radial-gradient(120% 90% at 50% -10%,rgba(242,193,78,.34),transparent 60%),repeating-linear-gradient(115deg,rgba(255,242,176,.05) 0 2px,transparent 2px 14px)"]];
const HR_POSE=["💪","🔥","⚡","Bora!","Subindo!","GG","Foco.","⚔️"];
function hrSt(){if(!prog.hero||typeof prog.hero!=="object")prog.hero={};const h=prog.hero;if(typeof h.motto!=="string")h.motto="";return h;}
function hrEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function hrBtn(cl,x,fn){const b=hrEl("button",cl,x);b.type="button";b.addEventListener("click",fn);return b;}
function hrLv(){try{return levelOf(totalXP());}catch(e){return 1;}}
// o que destrava nos próximos níveis (acessórios, molduras e evolução do avatar, rank, fundos do cartão)
function hrUnlocks(){const L=[];try{for(const [n,l] of AV_ACC)if(l>1)L.push([l,"acessório "+n]);for(const [n,l] of AV_FRAME)if(l>1)L.push([l,"moldura "+n]);}catch(e){}
  L.push([10,"aura viva no avatar"],[20,"olhos do Sistema"]);try{for(const r of RANKS)if(r[0]>1)L.push([r[0],"Rank "+r[1]]);}catch(e){}
  for(const b of HR_BG)if(b[2]>1)L.push([b[2],"fundo "+b[1]]);return L.sort((a,b)=>a[0]-b[0]);}
function hrNext(lv){const L=hrUnlocks().filter(x=>x[0]>lv);if(!L.length)return null;const l=L[0][0];return {lv:l,what:L.filter(x=>x[0]===l).slice(0,2).map(x=>x[1]).join(" e ")};}
// títulos que a pessoa já tem (conquistas secretas + baú) e o que está em uso
function hrTitles(){const out=[];try{for(const id in (prog.sec||{})){const s=secById(id);if(s)out.push({src:"sec",id,n:s[3]});}}catch(e){}
  try{for(const t of bxSt().titles)out.push({src:"bx",id:t.id,n:t.n});}catch(e){}return out;}
function hrTitleNow(){try{const c=bxSt();const t=c.title&&c.titles.find(x=>x.id===c.title);if(t)return t.n;}catch(e){}try{if(prog.secTitle&&prog.sec&&prog.sec[prog.secTitle])return secById(prog.secTitle)[3];}catch(e){}return "";}
function hrEquip(t){try{if(!t){if(typeof bxEquipTitle==="function")bxEquipTitle("");if(typeof secEquip==="function"&&prog.secTitle)secEquip("");else toast("Título removido.");}
  else if(t.src==="bx"){bxEquipTitle(t.id);toast("Título em uso: "+t.n);}else secEquip(t.id);}catch(e){}render();}
function hrApplyBg(sec){const h=hrSt();const lv=hrLv();let b=HR_BG.find(x=>x[0]===h.bg);if(!b||b[2]>lv)b=HR_BG[0];
  let g=sec.querySelector(":scope>.hrbg");if(!g){g=hrEl("div","hrbg");g.setAttribute("aria-hidden","true");sec.prepend(g);}
  sec.dataset.hbg=b[0];g.style.backgroundImage=b[3]||"none";}
function hrMotto(){const h1=$("titleName");if(!h1)return;let m=$("heroMotto");const t=hrSt().motto.trim();
  if(!m){m=hrEl("div","hrmotto");m.id="heroMotto";const after=$("bxTitle")||$("secTitle")||h1;after.after(m);}m.hidden=!t;m.textContent=t?"“"+t+"”":"";}
function hrPose(){const w=$("heroAv");if(!w)return;const av=w.querySelector(".hav");if(!av)return;
  const old=w.querySelector(".hrsay");if(old)old.remove();const s=hrEl("span","hrsay",HR_POSE[Math.floor(Math.random()*HR_POSE.length)]);s.setAttribute("aria-hidden","true");w.append(s);
  av.classList.remove("hrhop");void av.offsetWidth;av.classList.add("hrhop");try{haptic([12,40,12]);}catch(e){}setTimeout(()=>{s.remove();av.classList.remove("hrhop");},1400);}
// --- a ficha ---
function hrBody(box){box.textContent="";const lv=hrLv();let xp=0;try{xp=totalXP();}catch(e){}const need=Math.max(0,xpFor(lv+1)-xp);const nx=hrNext(lv);
  // 1. próximo nível
  const up=hrEl("div","hrup");up.append(hrEl("b",null,"⬆️ Faltam "+need+" XP para o nível "+(lv+1)),hrEl("span","sm muted",nx?"No nível "+nx.lv+": "+nx.what+".":"Você destravou tudo o que existe hoje. Lenda."));box.append(up);
  // 2. atributos (radar) + classe
  const at=hrEl("button","hrat");at.type="button";at.setAttribute("aria-label","Ver atributos em Progresso");
  let ok=false;try{const l=atLevels();const k=atCls();const rd=hrEl("span","hrrd");rd.innerHTML=atRadar(l,112);const inf=hrEl("span","hrati");
    const top=AT_IDS.slice().sort((a,b)=>l[b]-l[a]).slice(0,3);inf.append(hrEl("b",null,"🧬 Atributos · total "+AT_IDS.reduce((s,a)=>s+l[a],0)));
    const ch=hrEl("span","hrtop");for(const a of top){const x=hrEl("span","hrchip",AT_BY[a][1]+" "+AT_BY[a][2]+" "+l[a]);x.style.setProperty("--ac",AT_BY[a][3]);ch.append(x);}inf.append(ch);
    if(k){const pa=AT_PAS[k.pas];inf.append(hrEl("span","sm muted","Classe: "+AT_BY[k.p][1]+" "+AT_BY[k.p][2]+" ★ · "+AT_BY[k.s][1]+" "+AT_BY[k.s][2]+" ☆"+(pa?" · ✨ "+pa[0]:"")));}
    else inf.append(hrEl("span","sm muted","Escolha uma classe para ganhar bônus e uma habilidade passiva."));
    inf.append(hrEl("span","hrgo","Ver todos ›"));at.append(rd,inf);ok=true;}catch(e){}
  if(ok){at.addEventListener("click",()=>{goTab("prog");setTimeout(()=>{const p=$("atPanel");if(!p)return;if(p.classList.contains("fold")&&!p.classList.contains("open")){const h=p.querySelector(":scope>.fhd");if(h)h.click();}p.scrollIntoView({block:"start"});},60);});box.append(at);}
  // 3. título
  const tt=hrTitles();const now=hrTitleNow();const tr=hrEl("div","hrrow");tr.append(hrEl("span","hrlb","🏷️ Título"));
  const tv=hrEl("div","hrchips");
  if(!tt.length)tv.append(hrEl("span","sm muted","Ganhe títulos no baú do Fechar o dia e nas conquistas secretas."));
  else{tv.append(hrBtn("avchip"+(!now?" on":""),"Nenhum",()=>hrEquip(null)));for(const t of tt){const b=hrBtn("avchip"+(t.n===now?" on":""),t.n,()=>hrEquip(t));b.setAttribute("aria-pressed",t.n===now?"true":"false");tv.append(b);}}
  tr.append(tv);box.append(tr);
  // 4. lema
  const mr=hrEl("div","hrrow");mr.append(hrEl("label","hrlb","💬 Seu lema"));const inp=hrEl("input","hrin");inp.id="hrMottoIn";mr.querySelector("label").htmlFor="hrMottoIn";
  inp.maxLength=40;inp.placeholder="Ex.: um dia de cada vez";inp.autocomplete="off";inp.value=hrSt().motto;
  const sv=()=>{const v=inp.value.replace(/\s+/g," ").trim().slice(0,40);if(v===hrSt().motto)return;hrSt().motto=v;save();hrMotto();toast(v?"Lema salvo.":"Lema removido.");};
  inp.addEventListener("change",sv);inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();inp.blur();}});mr.append(inp,hrEl("span","sm muted","Aparece no seu cartão. Fica só neste celular."));box.append(mr);
  // 5. fundo do cartão
  const br=hrEl("div","hrrow");br.append(hrEl("span","hrlb","🎴 Fundo do cartão"));const bc=hrEl("div","hrchips");const cur=hrSt().bg||"grade";
  for(const [id,n,need2,bg] of HR_BG){const lock=lv<need2;const b=hrBtn("avchip hrbgc"+(lock?" lock":"")+(id===cur?" on":""),lock?"🔒 "+n+" · nv "+need2:n,()=>{
      if(lock){toast(n+" destrava no nível "+need2+".");return;}hrSt().bg=id;save();render();try{haptic([8]);}catch(e){}});
    b.style.setProperty("--hb",bg||"none");b.setAttribute("aria-pressed",id===cur?"true":"false");bc.append(b);}
  br.append(bc);box.append(br);
  // 6. atalhos
  const ac=hrEl("div","row hracts");
  ac.append(hrBtn("ghost","🧬 Avatar",()=>{try{avMaker(false);}catch(e){}}),hrBtn("ghost","⚔️ Classe",()=>{try{chgCls();}catch(e){}}),hrBtn("ghost","✨ Pose",hrPose),hrBtn("ghost","🪪 Meu card",()=>{try{tmCard();}catch(e){}}));
  box.append(ac);}
function hrUI(){const st=document.querySelector('.wrap>section[data-tab="hoje"] .status');if(!st)return;const sec=st.closest("section");
  if(!cfg||cfg.blank){const t=$("hrTog");if(t)t.hidden=true;const b=$("hrBox");if(b)b.hidden=true;return;}
  hrApplyBg(sec);hrMotto();const h=hrSt();const lv=hrLv();const nx=hrNext(lv);
  let tog=$("hrTog"),box=$("hrBox");
  if(!tog){tog=hrEl("button","hrtog");tog.type="button";tog.id="hrTog";tog.setAttribute("aria-controls","hrBox");st.after(tog);
    tog.addEventListener("click",()=>{const s=hrSt();s.open=s.open?0:1;save();hrUI();try{haptic([8]);}catch(e){}if(s.open)setTimeout(()=>{const b=$("hrBox");if(b&&b.getBoundingClientRect().bottom>innerHeight)b.scrollIntoView({block:"nearest",behavior:"smooth"});},60);});}
  if(!box){box=hrEl("div","hrbox");box.id="hrBox";tog.after(box);}
  tog.hidden=false;tog.setAttribute("aria-expanded",h.open?"true":"false");tog.textContent="";
  tog.append(hrEl("span","hrtl",h.open?"Fechar ficha":"Ficha do personagem"),hrEl("span","hrnx",h.open?"":nx?"nv "+nx.lv+": "+nx.what:"tudo destravado"),hrEl("span","hrch",h.open?"▴":"▾"));
  box.hidden=!h.open;if(h.open){const ae=document.activeElement;const typing=ae&&ae.id==="hrMottoIn";if(!typing)hrBody(box);}}
{const _r=render;render=function(){_r.apply(this,arguments);try{hrUI();}catch(e){}};}
setTimeout(()=>{try{hrUI();}catch(e){}},0);
// "Hoje: N concluída(s)" contava check-in, bônus e conquistas como tarefa (dava "4 concluídas" com 0/3 principais feitas).
// Agora conta só as tarefas da lista de hoje; o XP continua sendo o do dia inteiro.
function hrDayCount(){const el=$("dayxp");if(!el)return;const tk=todayKey();const done=prog.log[tk]||[];if(!done.length)return;
  const ids=new Set(((cfg&&cfg.quests)||[]).map(q=>q.id).concat((prog.extra[tk]||[]).map(q=>q.id)));
  const n=done.filter(e=>ids.has(e.q)).length;let xp=0;for(const e of done)xp+=(e.xp||0)+(e.bonus||0);
  el.textContent=n?"Hoje: "+n+(n===1?" tarefa feita":" tarefas feitas")+" · +"+xp+" XP no dia":"Nenhuma tarefa ainda · +"+xp+" XP de bônus. Comece pela primeira.";}
{const _r2=render;render=function(){_r2.apply(this,arguments);try{hrDayCount();}catch(e){}};}
// Aba Hoje: as tarefas sobem para logo depois do cartão. Só ficam entre os dois a barra do Sistema (Próxima missão)
// e a Forja (que se prende ao topo das tarefas). Desafios relâmpago, Comece por aqui, ranking da semana e chefão vão
// para depois da lista, nessa ordem; qualquer bloco novo que apareça no meio também desce.
const HR_AFTER=["zapPanel","tpLine","gdPanel","gtHero","tbStrip"];
function hrOrder(){const q=$("quests")&&$("quests").closest("section");const st=document.querySelector('.wrap>section[data-tab="hoje"] .status');const hero=st&&st.closest("section");
  if(!q||!hero||hero.parentNode!==q.parentNode)return;
  // 1º uso (guia "Comece por aqui" visto nesta abertura): a Forja também desce, para a 1ª missão caber na primeira tela.
  // A marca fica até fechar o app (nada pula durante o uso); tools/forja.js lê a mesma marca e não se reposiciona.
  const g=$("gdPanel");if(g&&!g.hidden)document.body.dataset.hrstart="1";
  const stay=new Set(document.body.dataset.hrstart?["smBar"]:["smBar","fjCard"]);const mid=[];
  for(let e=hero.nextElementSibling;e&&e!==q;e=e.nextElementSibling)if(!stay.has(e.id)&&!e.classList.contains("tip")&&e.dataset.tab==="hoje"||e.id==="tbStrip")mid.push(e);
  const ord=HR_AFTER.map(id=>$(id)).filter(Boolean).concat(mid.filter(e=>!HR_AFTER.includes(e.id)));let at=q;
  for(const e of ord){if(e.parentNode!==q.parentNode)continue;if(at.nextElementSibling!==e)at.after(e);at=e;}}
{const _r3=render;render=function(){_r3.apply(this,arguments);try{hrOrder();}catch(e){}};}
setTimeout(()=>{try{hrOrder();}catch(e){}},50);
// "Comece por aqui": depois do 1º passo feito, vira uma linha só (o passo da vez); toque no título mostra os 3 de novo.
function hrGuide(){const p=$("gdPanel");if(!p)return;const ok=p.querySelectorAll(".gdl li.ok").length;const mini=ok>0&&!p.dataset.full;p.classList.toggle("gdmini",mini);
  const h=p.querySelector(".qhead");if(h&&!h.dataset.hr){h.dataset.hr="1";h.setAttribute("role","button");h.tabIndex=0;h.addEventListener("click",()=>{if(p.dataset.full)delete p.dataset.full;else p.dataset.full="1";hrGuide();});}
  if(h)h.setAttribute("aria-expanded",mini?"false":"true");}
{const _r4=render;render=function(){_r4.apply(this,arguments);try{hrGuide();}catch(e){}};}
setTimeout(()=>{try{hrGuide();}catch(e){}},80);
// placeholder da quest rápida cortava em telas de 320-360px
function hrPh(){const i=$("addInput");if(!i||!i.clientWidth||!/^(Quest rápida|Nova quest)/.test(i.placeholder))return;const cs=getComputedStyle(i);const c=document.createElement("canvas").getContext("2d");c.font=cs.fontSize+" "+cs.fontFamily;
  const box=i.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-2;const opts=["Quest rápida (vale 10 XP)","Quest rápida (+10 XP)","Quest rápida +10","Quest rápida"];
  const want=opts.find(t=>c.measureText(t).width<=box)||opts[opts.length-1];if(i.placeholder!==want)i.placeholder=want;}
addEventListener("resize",()=>{try{hrPh();}catch(e){}});setTimeout(()=>{try{hrPh();}catch(e){}},0);{const _r5=render;render=function(){_r5.apply(this,arguments);try{hrPh();}catch(e){}};}
