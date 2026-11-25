// ---------- Avatar do jogador: SVG original no tema HUD, com visual por classe e itens que destravam por nível ----------
// Nada de foto: só formas. Fica no celular (prog.avatar) e, para quem está no ranking, viaja como um código curto.
const AV_SKIN=["#f6d7c3","#e8b896","#c98e66","#a86b47","#7a4a2e","#4f2f1d"];
const AV_HAIRC=["#1a1410","#3b2416","#7a4a22","#c9a25a","#9aa7bd","#6fb1ff"];
const AV_COL=["#6fb1ff","#35d49a","#f2c14e","#ff6b6b","#b388ff","#ff5fd2","#8cf2ff","#e6ecf7"];
const AV_COLN=["Azul","Verde","Ouro","Rubi","Violeta","Rosa","Ciano","Prata"];
const AV_HAIR=["Raspado","Curto","Longo","Moicano","Cacheado","Coque"];
const AV_ACC=[["Nenhum",1],["Fone HUD",2],["Visor",4],["Aura",7],["Coroa de dados",12],["Asas de luz",18]];
const AV_FRAME=[["Anel",1],["Hexágono",3],["Octógono",6],["Radar",10],["Órbita",15]];
const AV_CLS=["mago","guerreiro","arqueiro","cavaleiro","druida","estudante","universitario","profissional","empreendedor","lar","caminhoneiro","motorista","veterano","atleta"];
function avLv(){try{return levelOf(totalXP());}catch(e){return 1;}}
function avCls(){try{const c=rpgState().cls;return c&&AV_CLS.includes(c.id)?c.id:"x";}catch(e){return "x";}}
function avEvo(){const l=avLv();return l>=20?2:l>=10?1:0;}
function avSt(){if(!prog.avatar||typeof prog.avatar!=="object"){let h=0;for(const ch of String((cfg&&cfg.name)||"a"))h=(h*31+ch.charCodeAt(0))>>>0;prog.avatar={s:h%AV_SKIN.length,h:1+(h>>3)%5,hc:(h>>5)%5,c:(h>>7)%AV_COL.length,a:0,f:0};}return prog.avatar;}
// código público: classe.pele.cabelo.corCabelo.cor.acessório.moldura.evolução
function avCode(){const a=avSt();return [avCls(),a.s,a.h,a.hc,a.c,a.a,a.f,avEvo()].join(".");}
function avParse(code){const m=/^([a-z]{1,14})\.(\d)\.(\d)\.(\d)\.(\d)\.(\d)\.(\d)\.(\d)$/.exec(String(code||"").trim());if(!m)return null;
  const n=i=>+m[i];const o={cls:AV_CLS.includes(m[1])?m[1]:"x",s:n(2)%AV_SKIN.length,h:n(3)%AV_HAIR.length,hc:n(4)%AV_HAIRC.length,c:n(5)%AV_COL.length,a:n(6)%AV_ACC.length,f:n(7)%AV_FRAME.length,e:Math.min(2,n(8))};return o;}
// Só números e cores de listas fixas entram no SVG (seguro para innerHTML)
function avSvg(o,size){if(!o)return "";const C=AV_COL[o.c],S=AV_SKIN[o.s],H=AV_HAIRC[o.hc],sz=size||48;const id="g"+Math.random().toString(36).slice(2,7);
  let g='<defs><radialGradient id="'+id+'" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="'+C+'" stop-opacity=".35"/><stop offset="1" stop-color="#070c17" stop-opacity="1"/></radialGradient><clipPath id="c'+id+'"><circle cx="50" cy="50" r="44"/></clipPath></defs>';
  g+='<circle cx="50" cy="50" r="46" fill="url(#'+id+')"/>';
  let b='';
  if(o.a===3)b+='<circle cx="50" cy="52" r="34" fill="none" stroke="'+C+'" stroke-opacity=".35" stroke-width="6"/>';
  if(o.a===5)b+='<path d="M30 74 Q8 54 14 30 Q24 50 36 62Z M70 74 Q92 54 86 30 Q76 50 64 62Z" fill="'+C+'" fill-opacity=".55"/>';
  // corpo e roupa por classe
  const dark="#0d1526";b+='<path d="M16 100 Q18 74 50 70 Q82 74 84 100Z" fill="'+dark+'" stroke="'+C+'" stroke-width="1.6"/>';
  b+='<rect x="45" y="58" width="10" height="12" rx="3" fill="'+S+'"/>';
  const cl=o.cls;
  if(cl==="profissional")b+='<path d="M44 71 L50 78 L56 71 L53 92 L50 96 L47 92Z" fill="'+C+'"/><path d="M38 72 L50 80 L62 72" fill="none" stroke="#e6ecf7" stroke-width="2"/>';
  else if(cl==="empreendedor")b+='<path d="M36 73 L50 92 L64 73" fill="none" stroke="'+C+'" stroke-width="3"/><circle cx="62" cy="84" r="2.6" fill="#f2c14e"/>';
  else if(cl==="lar")b+='<path d="M50 90 L42 82 A4.5 4.5 0 0 1 50 76 A4.5 4.5 0 0 1 58 82Z" fill="'+C+'"/>';
  else if(cl==="atleta")b+='<text x="50" y="91" text-anchor="middle" font-size="11" font-family="monospace" font-weight="700" fill="'+C+'">'+(10+o.c)+'</text>';
  else if(cl==="guerreiro"||cl==="cavaleiro")b+='<path d="M20 86 Q24 72 36 72 L34 84Z M80 86 Q76 72 64 72 L66 84Z" fill="'+C+'" fill-opacity=".8"/>';
  else if(cl==="mago")b+='<circle cx="80" cy="80" r="5" fill="'+C+'"/><circle cx="80" cy="80" r="8" fill="none" stroke="'+C+'" stroke-opacity=".5"/>';
  else if(cl==="druida")b+='<path d="M24 92 Q30 80 40 82 Q34 90 24 92Z M76 92 Q70 80 60 82 Q66 90 76 92Z" fill="#35d49a"/>';
  else b+='<path d="M46 82 L50 76 L54 82 L50 88Z" fill="'+C+'"/>';
  if(o.e>=1)b+='<path d="M22 80 L30 76 M78 80 L70 76" stroke="'+C+'" stroke-width="2" stroke-linecap="round"/>';
  // cabelo atrás
  if(o.h===2)b+='<path d="M31 44 Q30 70 38 72 L62 72 Q70 70 69 44Z" fill="'+H+'"/>';
  // cabeça
  b+='<circle cx="50" cy="45" r="17" fill="'+S+'"/>';
  // cabelo na frente
  const hair=["",'<path d="M33 42 Q34 26 50 26 Q66 26 67 42 Q60 34 50 34 Q40 34 33 42Z" fill="'+H+'"/>','<path d="M32 46 Q32 26 50 26 Q68 26 68 46 Q62 33 50 33 Q38 33 32 46Z" fill="'+H+'"/>','<path d="M45 24 L55 24 L54 36 L46 36Z" fill="'+H+'"/><path d="M34 42 Q36 34 46 33 M66 42 Q64 34 54 33" stroke="'+H+'" stroke-width="2" fill="none"/>','<g fill="'+H+'"><circle cx="38" cy="32" r="6"/><circle cx="46" cy="27" r="6"/><circle cx="55" cy="27" r="6"/><circle cx="63" cy="32" r="6"/><circle cx="34" cy="40" r="4.5"/><circle cx="66" cy="40" r="4.5"/></g>','<circle cx="50" cy="22" r="6" fill="'+H+'"/><path d="M33 42 Q34 27 50 27 Q66 27 67 42 Q60 34 50 34 Q40 34 33 42Z" fill="'+H+'"/>'][o.h]||"";
  b+=hair;
  // olhos HUD
  b+=o.a===2?'<rect x="36" y="42" width="28" height="7" rx="3.5" fill="#070c17" stroke="'+C+'" stroke-width="1.4"/><rect x="39" y="44.5" width="22" height="2" rx="1" fill="'+C+'"/>':'<rect x="41" y="44" width="5" height="3" rx="1.5" fill="#070c17"/><rect x="54" y="44" width="5" height="3" rx="1.5" fill="#070c17"/><rect x="42" y="44.6" width="2" height="1.4" fill="'+C+'"/><rect x="55" y="44.6" width="2" height="1.4" fill="'+C+'"/>';
  // equipamento da classe na cabeça
  const head={
    mago:'<path d="M28 50 Q30 22 50 14 Q70 22 72 50 Q66 34 50 32 Q34 34 28 50Z" fill="'+C+'" fill-opacity=".9"/>',
    guerreiro:'<path d="M32 44 Q32 25 50 25 Q68 25 68 44 L64 44 Q62 31 50 31 Q38 31 36 44Z" fill="#9aa7bd"/><path d="M50 14 Q58 18 56 27 L50 25Z" fill="'+C+'"/>',
    arqueiro:'<path d="M30 52 Q30 26 50 20 Q70 26 70 52 Q64 34 50 33 Q36 34 30 52Z" fill="#2c5e3f"/><path d="M68 30 L80 16" stroke="'+C+'" stroke-width="2.2"/><path d="M80 16 L76 24 L82 22Z" fill="'+C+'"/>',
    cavaleiro:'<path d="M32 52 Q31 25 50 24 Q69 25 68 52Z" fill="#9aa7bd"/><rect x="37" y="42" width="26" height="4" rx="2" fill="#070c17"/><rect x="40" y="43" width="20" height="1.6" fill="'+C+'"/><path d="M50 24 Q60 12 66 18 Q58 18 52 26Z" fill="'+C+'"/>',
    druida:'<path d="M38 30 L32 16 M32 22 L26 18 M62 30 L68 16 M68 22 L74 18" stroke="#c9a25a" stroke-width="2.4" stroke-linecap="round"/><path d="M36 31 Q50 25 64 31" stroke="#35d49a" stroke-width="3" fill="none"/>',
    estudante:'<path d="M32 46 Q32 24 50 24 Q68 24 68 46" fill="none" stroke="'+C+'" stroke-width="3"/><rect x="28" y="41" width="7" height="11" rx="3" fill="'+C+'"/><rect x="65" y="41" width="7" height="11" rx="3" fill="'+C+'"/>',
    universitario:'<path d="M28 28 L50 20 L72 28 L50 36Z" fill="#111c33" stroke="'+C+'" stroke-width="1.2"/><path d="M38 32 L38 37 Q50 42 62 37 L62 32" fill="#111c33"/><path d="M70 28 L70 38" stroke="#f2c14e" stroke-width="1.6"/>',
    caminhoneiro:'<path d="M32 36 Q34 24 50 24 Q66 24 68 36Z" fill="'+C+'"/><path d="M30 36 L76 36 Q74 40 66 40 L30 40Z" fill="'+C+'" fill-opacity=".8"/>',
    motorista:'<path d="M32 36 Q34 24 50 24 Q66 24 68 36Z" fill="#111c33" stroke="'+C+'" stroke-width="1.2"/><path d="M30 36 L76 36 Q74 40 66 40 L30 40Z" fill="'+C+'"/>',
    veterano:'<path d="M36 50 Q38 64 50 66 Q62 64 64 50 Q58 58 50 58 Q42 58 36 50Z" fill="#c9cfd9"/>',
    atleta:'<rect x="32" y="34" width="36" height="5" rx="2.5" fill="'+C+'"/>'}[cl]||"";
  b+=head;
  if(o.a===1)b+='<path d="M31 46 Q31 25 50 25 Q69 25 69 46" fill="none" stroke="'+C+'" stroke-width="2"/><circle cx="31" cy="47" r="4" fill="'+C+'"/><path d="M31 51 Q34 60 42 58" stroke="'+C+'" stroke-width="1.6" fill="none"/>';
  if(o.a===4)b+='<path d="M36 24 L40 14 L45 22 L50 10 L55 22 L60 14 L64 24Z" fill="#f2c14e"/><rect x="47" y="15" width="6" height="6" fill="'+C+'" transform="rotate(45 50 18)"/>';
  if(o.e>=2)b+='<g fill="'+C+'"><circle cx="22" cy="30" r="1.6"/><circle cx="78" cy="26" r="1.6"/><circle cx="84" cy="50" r="1.2"/><circle cx="16" cy="54" r="1.2"/></g>';
  g+='<g clip-path="url(#c'+id+')">'+b+'</g>';
  // moldura
  const fr=[ '<circle cx="50" cy="50" r="46" fill="none" stroke="'+C+'" stroke-width="3"/>',
    '<path d="M50 3 L91 26.5 L91 73.5 L50 97 L9 73.5 L9 26.5Z" fill="none" stroke="'+C+'" stroke-width="3"/>',
    '<path d="M31 4 L69 4 L96 31 L96 69 L69 96 L31 96 L4 69 L4 31Z" fill="none" stroke="'+C+'" stroke-width="3"/>',
    '<circle cx="50" cy="50" r="46" fill="none" stroke="'+C+'" stroke-width="2"/><circle cx="50" cy="50" r="48.5" fill="none" stroke="'+C+'" stroke-opacity=".5" stroke-width="1" stroke-dasharray="3 5"/><path d="M50 0 L50 6 M50 94 L50 100 M0 50 L6 50 M94 50 L100 50" stroke="'+C+'" stroke-width="2"/>',
    '<circle cx="50" cy="50" r="46" fill="none" stroke="#f2c14e" stroke-width="3"/><ellipse cx="50" cy="50" rx="49" ry="20" fill="none" stroke="'+C+'" stroke-width="1.4" transform="rotate(-25 50 50)"/><circle cx="94" cy="32" r="2.6" fill="'+C+'"/>'][o.f]||"";
  g+=fr;
  return '<svg class="av" viewBox="0 0 100 100" width="'+sz+'" height="'+sz+'" role="img" aria-label="Avatar" xmlns="http://www.w3.org/2000/svg">'+g+'</svg>';}
function avMine(size){return avSvg(avParse(avCode()),size);}
// ---- Editor em Progresso ----
let avOpen=false;
function avUI(){let p=$("avPanel");const first=document.querySelector('.wrap>section[data-tab="prog"]');if(!first)return;
  if(!p){p=document.createElement("section");p.className="panel avp";p.id="avPanel";p.dataset.tab="prog";first.before(p);}
  if(!cfg||cfg.blank){p.hidden=true;return;}p.hidden=false;
  if(p.contains(document.activeElement)&&avOpen&&p.dataset.r==="1"){}
  p.textContent="";const a=avSt(),lv=avLv();
  const top=document.createElement("div");top.className="avtop";const pv=document.createElement("div");pv.className="avpv";pv.innerHTML=avMine(avOpen?120:72);
  const info=document.createElement("div");const h=document.createElement("h2");h.textContent="🧬 Seu avatar";const sm=document.createElement("div");sm.className="sm muted";
  let cn="";try{const c=rpgState().cls;cn=c?clsName(c,lv):"";}catch(e){}
  sm.textContent=(cn?cn+" · ":"")+"nível "+lv+(avEvo()?" · evolução "+avEvo():"")+". A roupa muda com a classe; itens novos destravam com o nível.";
  const b=document.createElement("button");b.type="button";b.className=avOpen?"ghost":"go";b.textContent=avOpen?"Pronto":"Editar avatar";b.addEventListener("click",()=>{avOpen=!avOpen;avUI();try{avPost(true);}catch(e){}});
  info.append(h,sm,b);top.append(pv,info);p.append(top);if(!avOpen)return;
  const row=(label,items,key,lockLv,sw)=>{const w=document.createElement("div");w.className="avrow";const l=document.createElement("div");l.className="sm muted";l.textContent=label;const ch=document.createElement("div");ch.className="avchips";
    items.forEach((it,i)=>{const need=lockLv?lockLv[i]:1;const lock=lv<need;const x=document.createElement("button");x.type="button";x.className="avchip"+(a[key]===i?" on":"")+(lock?" lock":"");
      if(sw){x.style.setProperty("--sw",sw[i]);x.classList.add("sw");x.setAttribute("aria-label",it);x.title=it;}else x.textContent=lock?"🔒 "+it+" · nv "+need:it;if(lock)x.setAttribute("aria-label",it+": destrava no nível "+need);
      x.setAttribute("aria-pressed",a[key]===i?"true":"false");
      x.addEventListener("click",()=>{if(lock){toast(it+" destrava no nível "+need+".");return;}a[key]=i;save();avUI();});ch.append(x);});w.append(l,ch);p.append(w);};
  row("Pele",AV_SKIN.map((c,i)=>"Tom "+(i+1)),"s",null,AV_SKIN);
  row("Cabelo",AV_HAIR,"h");
  row("Cor do cabelo",AV_HAIRC.map((c,i)=>"Cor "+(i+1)),"hc",null,AV_HAIRC);
  row("Cor do Sistema",AV_COLN,"c",null,AV_COL);
  row("Acessório",AV_ACC.map(x=>x[0]),"a",AV_ACC.map(x=>x[1]));
  row("Moldura",AV_FRAME.map(x=>x[0]),"f",AV_FRAME.map(x=>x[1]));}
{const _r=render;render=function(){_r.apply(this,arguments);try{avUI();}catch(e){}};}
setTimeout(()=>{try{avUI();}catch(e){}},0);
// ---- Perfil público (só para quem está no ranking, 14+): sequência, desafios da semana e avatar ----
function avZapWeek(){let n=0;try{const ws=weekStart(todayKey());for(const e of entries())if(String(e.q).startsWith("zap:")&&weekStart(e.date)===ws)n++;}catch(e){}return n;}
function avPost(force){if(typeof RK_POST==="undefined"||ageNow()==="kid"||!(prog.rank&&prog.rank.on))return;const me=rankName();if(!me)return;
  let sq=0;try{sq=streakDays()||0;}catch(e){}const key=[me,sq,avZapWeek(),avCode(),todayKey()].join("|");if(!force&&prog.avPub===key)return;if(prog.avPub===key)return;prog.avPub=key;save();
  const v=["P",me,sq,avZapWeek(),avCode(),todayKey().replace(/-/g,"")].join("|");
  try{fetch(RK_POST,{method:"POST",mode:"no-cors",keepalive:true,body:new URLSearchParams({"entry.807978446":v})}).catch(()=>{});}catch(e){}}
if(typeof sendRank==="function"){const _sr=sendRank;sendRank=function(){_sr.apply(this,arguments);try{avPost();}catch(e){}};}
