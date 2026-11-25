// ---------- Desafios relâmpago: 3 por dia, rápidos, que sobem no ranking ----------
// Contador por toque com vibração, timer, prova por foto opcional (a foto NÃO sai do celular e some no dia seguinte).
// Só ADICIONA: entradas "zap:" no log (XP) e prog.zap = {dia:{id:1}}.
const ZAP_POOL=[
  {id:"abd",t:"10 abdominais",n:10,u:"abdominais",ic:"💥",kid:true},{id:"agach",t:"15 agachamentos",n:15,u:"agachamentos",ic:"🦵",kid:true},
  {id:"flex",t:"8 flexões (pode ser no joelho)",n:8,u:"flexões",ic:"💪",kid:true},{id:"pranc",t:"Prancha de 30 s",s:30,ic:"🧱",kid:true},
  {id:"agua",t:"Beber 1 copo d'água agora",n:1,u:"copo",ic:"💧",kid:true},{id:"resp",t:"1 min de respiração 4-4",s:60,ic:"🌬️",kid:true},
  {id:"ler",t:"Ler 5 páginas",n:5,u:"páginas",ic:"📖",kid:true},{id:"cama",t:"Arrumar a cama ou a mesa",n:1,u:"feito",ic:"🛏️",kid:true},
  {id:"alon",t:"Alongar 1 min",s:60,ic:"🧘",kid:true},{id:"pulo",t:"20 polichinelos",n:20,u:"polichinelos",ic:"⚡",kid:true},
  {id:"grat",t:"Escrever 1 coisa boa do dia",n:1,u:"feito",ic:"✍️",kid:true},{id:"tela",t:"10 min sem celular",s:600,ic:"📵",kid:true}];
const ZAP_XP=10,ZAP_PHOTO=5;
function zapToday(){const tk=todayKey();let h=0;for(const c of tk)h=(h*33+c.charCodeAt(0))>>>0;const pool=ZAP_POOL.slice();const out=[];
  while(out.length<3&&pool.length){h=(h*1103515245+12345)>>>0;out.push(pool.splice(h%pool.length,1)[0]);}return out;}
function zapDone(id){return !!(((prog.zap||{})[todayKey()]||{})[id]);}
function zapEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
// posição no ranking: quanto falta para passar o próximo
function zapRankLine(){if(!(prog.rank&&prog.rank.on)||!rankRows||!rankRows.length)return null;const me=rankName();const my=weekXP();
  const rows=rankRows.map(r=>r.n===me?{n:r.n,xp:Math.max(r.xp,my),me:1}:r);if(!rows.some(r=>r.me))rows.push({n:me,xp:my,me:1});rows.sort((a,b)=>b.xp-a.xp);
  const i=rows.findIndex(r=>r.me);if(i<0)return null;if(i===0)return {pos:1,txt:"Você é o #1 da semana. Defenda o topo."};
  const ab=rows[i-1];const gap=ab.xp-my+1;return {pos:i+1,txt:"#"+(i+1)+" na semana · faltam "+gap+" XP para passar "+ab.n+" ("+Math.ceil(gap/ZAP_XP)+" desafio"+(gap>ZAP_XP?"s":"")+")"};}
// foto de prova: só no aparelho, guardada só hoje
const ZAP_PH="asc-u-zapfoto";
function zapPhotos(){try{const o=JSON.parse(localStorage.getItem(ZAP_PH)||"{}");return o.d===todayKey()?o:{d:todayKey(),p:{}};}catch(e){return {d:todayKey(),p:{}};}}
function zapSavePhoto(id,url){const o=zapPhotos();o.p[id]=url;try{localStorage.setItem(ZAP_PH,JSON.stringify(o));}catch(e){}}
function zapThumb(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,160/Math.max(im.width,im.height));const c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.6));};im.onerror=rej;im.src=r.result;};r.onerror=rej;r.readAsDataURL(file);});}
// tela do desafio
let zapCur=null,zapCnt=0,zapEnd=0,zapIv=null;
// acessibilidade: nome da tela, foco entra e volta para o cartão, Esc fecha, contagem falada numa região aria-live fixa
function zapSay(t){const l=$("zapLive");if(l)l.textContent=t;}
function zapOpen(z){zapCur=z;zapCnt=0;zapEnd=0;clearInterval(zapIv);let m=$("zapSheet");if(!m){m=zapEl("div","mssheet");m.id="zapSheet";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");document.body.append(m);}
  m.setAttribute("aria-label","Desafio relâmpago: "+z.t);m.textContent="";const lv=zapEl("div","zapsr");lv.id="zapLive";lv.setAttribute("aria-live","polite");lv.setAttribute("role","status");m.append(lv);
  m.hidden=false;document.body.classList.add("inmission");zapDraw();const f=m.querySelector(".zaptap,.mscard .go:not(:disabled),.mscard button");if(f)f.focus();}
function zapClose(){clearInterval(zapIv);zapMoStop();const m=$("zapSheet");if(m)m.hidden=true;document.body.classList.remove("inmission");
  const id=zapCur&&zapCur.id;const c=id&&document.querySelector('#zapPanel .zapc[data-id="'+id+'"]');if(c)c.focus();}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("zapSheet")&&!$("zapSheet").hidden)zapClose();});
function zapDraw(){const z=zapCur,m=$("zapSheet");if(!z||!m)return;const ae=document.activeElement;let had=ae&&m.contains(ae)?(ae.classList.contains("zaptap")?".zaptap":ae.classList.contains("zapmo")?"zapmo":".mscard .go"):null;
  const old=m.querySelector(".zapcard");if(old)old.remove();const c=zapEl("div","mscard zapcard");
  const top=zapEl("div","mstop");top.append(zapEl("span","mstag","[ SISTEMA ] DESAFIO RELÂMPAGO"));const x=zapEl("button","link","Fechar");x.type="button";x.addEventListener("click",zapClose);top.append(x);
  c.append(top,zapEl("h3",null,z.ic+" "+z.t));
  const ok=()=>{if(z.n)return zapCnt>=z.n;return zapEnd&&Date.now()>=zapEnd;};
  if(z.n&&z.n>1){const big=zapEl("button","zaptap");big.type="button";big.setAttribute("aria-label","Contar mais um");big.append(zapEl("b",null,String(zapCnt)),zapEl("span",null,"de "+z.n+" "+z.u));
      big.addEventListener("click",zapInc);c.append(big,zapEl("div","sm muted",zapMo.on?"Sensor ligado: segure o celular junto ao corpo. O toque também conta.":"Toque no círculo a cada repetição."));
      if(zapCnt<z.n&&z.mo!==false){const mb=zapEl("button","ghost zapmo"+(zapMo.on?" on":""),zapMo.on?"⏹ Parar o sensor":"📳 Contar pelo movimento");mb.type="button";mb.setAttribute("aria-pressed",zapMo.on?"true":"false");
        mb.addEventListener("click",()=>{if(zapMo.on){zapMoStop();zapSay("Sensor desligado.");zapDraw();}else zapMoStart();});c.append(mb);}}
  else if(z.s){const left=zapEnd?Math.max(0,zapEnd-Date.now()):z.s*1000;const t=zapEl("div","msclock",fmt(left));t.id="zapClock";c.append(t);
      if(!zapEnd){const b=zapEl("button","go","▶ Começar "+(z.s>=60?Math.round(z.s/60)+" min":z.s+" s"));b.type="button";b.addEventListener("click",()=>{zapEnd=Date.now()+z.s*1000;try{haptic([15,40,15]);}catch(e){}zapIv=setInterval(()=>{const k=$("zapClock");if(!k){clearInterval(zapIv);return;}const l=zapEnd-Date.now();k.textContent=fmt(l);if(l<=0){clearInterval(zapIv);try{chime();haptic([20,60,20,60,40]);}catch(e){}zapSay("Tempo concluído. Toque em Concluir.");zapDraw();const g=$("zapSheet")&&$("zapSheet").querySelector(".msend .go");if(g)g.focus();}},250);zapSay("Cronômetro iniciado.");zapDraw();});c.append(b);}}
  // prova por foto (opcional)
  const ph=zapPhotos().p[z.id];const pr=zapEl("div","zapproof");
  if(ph){const im=zapEl("img");im.src=ph;im.alt="Sua prova";pr.append(im,zapEl("span","sm","Prova registrada · +"+ZAP_PHOTO+" XP. A foto fica só no seu celular."));}
  else{const lb=zapEl("label","ghost zapcam");const inp=zapEl("input");inp.type="file";inp.accept="image/*";inp.setAttribute("capture","environment");inp.hidden=true;
    inp.addEventListener("change",async()=>{const f=inp.files&&inp.files[0];if(!f)return;try{zapSavePhoto(z.id,await zapThumb(f));try{haptic(15);}catch(e){}zapDraw();}catch(e){toast("Não consegui ler a foto.");}});
    lb.append(document.createTextNode("📸 Prova por foto (+"+ZAP_PHOTO+" XP)"),inp);pr.append(lb,zapEl("span","sm muted","Opcional. A foto não sai do seu celular."));}
  c.append(pr);
  if(typeof duoSlot==="function"){const dd=duoSlot(z);if(dd)c.append(dd);}
  const row=zapEl("div","row msend");const fin=zapEl("button","go",zapDone(z.id)?"Concluído ✓":"✓ Concluir +"+ZAP_XP+" XP");fin.type="button";
  const ready=(z.n&&z.n>1)||z.s?ok():true;fin.disabled=zapDone(z.id)||!ready;if(!ready&&!zapDone(z.id))fin.title="Complete primeiro";
  fin.addEventListener("click",()=>zapFinish(z));row.append(fin);c.append(row);m.append(c);
  if(had==="zapmo")had=".zapmo";
  if(had){const t=m.querySelector(had+":not(:disabled)")||m.querySelector(".mscard .go:not(:disabled)")||x;t.focus();}}
function zapFinish(z){if(zapDone(z.id))return;const tk=todayKey();prog.zap=prog.zap||{};for(const d in prog.zap)if(d<tk&&Object.keys(prog.zap).length>14)delete prog.zap[d];
  (prog.zap[tk]=prog.zap[tk]||{})[z.id]=1;const photo=!!zapPhotos().p[z.id];const xp=ZAP_XP+(photo?ZAP_PHOTO:0);
  const before=zapRankLine();
  addXP({q:"zap:"+z.id+":"+tk,kind:"zap",xp,stat:"corpo",bonus:0,t:new Date().toISOString()},"Desafio relâmpago: +"+xp+" XP");
  try{if(typeof sendRank==="function")sendRank("desafio",true);}catch(e){}
  try{if(typeof duoDone==="function")duoDone(z);}catch(e){}
  if(zapMo.used){try{const k="asc-u-zapmo";const o=JSON.parse(localStorage.getItem(k)||"{}");o[tk]=(o[tk]||0)+1;for(const d in o)if(d<tk)delete o[d];localStorage.setItem(k,JSON.stringify(o));}catch(e){}zapMo.used=false;}
  zapClose();zapUI();
  const after=zapRankLine();const all=zapToday().every(q=>zapDone(q.id));
  if(before&&after&&after.pos<before.pos)sysPop("RANKING","Subiu para #"+after.pos,"Você passou alguém no ranking da semana. "+(after.pos>1?after.txt.replace(/^#\d+ na semana · /,"Agora "):"Topo conquistado."),null,"Bora");
  else if(all)sysPop("DESAFIOS","3 de 3 hoje","Todos os desafios relâmpago do dia feitos. Amanhã chegam 3 novos.",null,"Continuar");}
// um a mais no contador (toque ou sensor)
function zapInc(){const z=zapCur;if(!z||!z.n||zapCnt>=z.n)return;zapCnt++;try{haptic(zapCnt>=z.n?[20,60,40]:12);}catch(e){}
  if(zapCnt>=z.n){zapMoStop();try{chime();}catch(e){}}zapSay(zapCnt>=z.n?"Pronto: "+z.n+" de "+z.n+". Toque em Concluir.":zapCnt+" de "+z.n);zapDraw();}
// contar pelo sensor de movimento: pico acima da média, depois vale abaixo = 1 repetição. Nada sai do celular.
// iPhone: a permissão só pode ser pedida no toque (DeviceMotionEvent.requestPermission). Sem sensor ou sem sinal: volta para o toque.
const ZMO_HI=2.6,ZMO_LO=-1.2,ZMO_GAP=450;
let zapMo={on:false,avg:null,armed:false,last:0,got:0,t0:0,used:false,chk:0};
function zapMoH(e){const g=e.accelerationIncludingGravity,l=e.acceleration;const ok=v=>v&&(v.x!=null||v.y!=null||v.z!=null);const a=ok(g)?g:ok(l)?l:null;if(!a)return;
  const m=Math.hypot(a.x||0,a.y||0,a.z||0);if(!isFinite(m))return;
  zapMo.got++;const now=Date.now();const w=now-zapMo.t0<600?.3:.08;zapMo.avg=zapMo.avg==null?m:zapMo.avg*(1-w)+m*w;const d=m-zapMo.avg;if(now-zapMo.t0<600)return;
  if(zapMo.armed&&d>ZMO_HI&&now-zapMo.last>ZMO_GAP){zapMo.armed=false;zapMo.last=now;zapMo.used=true;zapInc();}
  else if(!zapMo.armed&&d<ZMO_LO)zapMo.armed=true;}
function zapMoStop(){if(!zapMo.on)return;zapMo.on=false;clearTimeout(zapMo.chk);window.removeEventListener("devicemotion",zapMoH);}
function zapMoStart(){const fail=t=>{zapMoStop();toast(t);zapSay(t);zapDraw();};
  if(typeof DeviceMotionEvent==="undefined"){fail("Este aparelho não tem sensor de movimento. Use o toque.");return;}
  const go=()=>{Object.assign(zapMo,{on:true,avg:null,armed:true,last:0,got:0,t0:Date.now()});window.addEventListener("devicemotion",zapMoH);
    zapMo.chk=setTimeout(()=>{if(zapMo.on&&!zapMo.got)fail("O sensor não respondeu. Use o toque no círculo.");},2500);
    try{haptic([15,40,15]);}catch(e){}zapSay("Sensor ligado. Cada repetição conta sozinha.");zapDraw();};
  if(typeof DeviceMotionEvent.requestPermission==="function"){DeviceMotionEvent.requestPermission().then(r=>{if(r==="granted")go();else fail("Sem permissão do sensor. Use o toque no círculo.");},()=>fail("Sem permissão do sensor. Use o toque no círculo."));}
  else go();}
// card na aba Hoje
function zapUI(){let p=$("zapPanel");const qp=$("quests")&&$("quests").closest("section");if(!qp)return;
  if(!p){p=zapEl("section","panel zap");p.id="zapPanel";p.dataset.tab="hoje";qp.before(p);}
  if(!cfg||cfg.blank){p.hidden=true;return;}p.hidden=false;p.textContent="";
  const list=zapToday();const n=list.filter(z=>zapDone(z.id)).length;
  const hd=zapEl("div","qhead");hd.append(zapEl("h2",null,"⚡ Desafios relâmpago"),zapEl("span","xp",n+"/3 · +"+ZAP_XP+" XP cada"));p.append(hd);
  const rl=zapRankLine();const rv=typeof dyRival==="function"?dyRival():null;
  p.append(zapEl("div","zaprank",rl?rl.txt:(prog.rank&&prog.rank.on?"Cada desafio soma no ranking da semana.":ageNow()==="kid"?"Desafios rápidos para ganhar XP.":"Entre no ranking (em Progresso) e cada desafio te faz subir.")));
  if(rv)p.append(zapEl("div","zaprank zaprival",rv.txt));
  const g=zapEl("div","zapgrid");for(const z of list){const d=zapDone(z.id);const b=zapEl("button","zapc"+(d?" done":""));b.type="button";b.dataset.id=z.id;if(d)b.setAttribute("aria-label",z.t+": concluído");
    b.append(zapEl("span","ic",d?"✓":z.ic),zapEl("span","tt",z.t));if(zapPhotos().p[z.id])b.append(zapEl("span","ph","📸"));
    b.addEventListener("click",()=>{if(!d)zapOpen(z);});g.append(b);}p.append(g);}
{const _rr=renderRankUI;renderRankUI=function(){_rr();try{zapUI();}catch(e){}};}
{const _r=render;render=function(){_r.apply(this,arguments);try{zapUI();}catch(e){}};}
setTimeout(()=>{try{zapUI();}catch(e){}},0);
