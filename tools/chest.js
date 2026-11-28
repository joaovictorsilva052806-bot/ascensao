// ---------- Baú do dia: fechou o dia, abre um baú com recompensa surpresa ----------
// Recompensa variável: XP, moldura de avatar ou título raro. Sequência maior = baú melhor (madeira, prata, ouro).
// Tudo no aparelho (vale para todas as idades). O sorteio é guardado antes de abrir: fechar e reabrir não troca o prêmio.
// Só ADICIONA prog.chest = {roll:{dia:prêmio}, got:{dia:1}, frames:[ids], titles:[{id,n,src}], frame:"", title:"", dry:n}.
// XP entra como "ach:bau:<dia>" (não conta sequência nem masmorra).
const BX_FR=[// [id, nome, raridade, cor1, cor2]
 ["f_bronze","Aro de Bronze",1,"#cd7f32","#ffb877"],["f_prata","Aro de Prata",1,"#c0c8d8","#ffffff"],["f_neon","Neon do Sistema",1,"#00d4ff","#7af3ff"],
 ["f_ouro","Coroa Dourada",2,"#f2c14e","#fff2b0"],["f_chama","Chama Viva",2,"#ff5a1f","#ffd166"],["f_sombra","Sombra Roxa",2,"#7b2cff","#ff4fd8"],
 ["f_aurora","Aurora",3,"#3ddc97","#7aa2ff"],["f_eclipse","Eclipse",3,"#0b0b10","#ff3d6e"]];
const BX_TT=[// [id, título, raridade]
 ["t_crep","Guardião do Crepúsculo",1],["t_fech","Fechador de Dias",1],["t_aco","Mente de Aço",1],
 ["t_chama","Chama Constante",2],["t_lamina","Lâmina Silenciosa",2],["t_desp","O Despertado",2],
 ["t_sob","Soberano da Rotina",3],["t_ecl","Filho do Eclipse",3]];
const BX_RAR=["","Raro","Épico","Lendário"],BX_RCOL=["#9fb0c8","#4da3ff","#c77dff","#f2c14e"];
function bxSt(){if(!prog.chest||typeof prog.chest!=="object")prog.chest={};const c=prog.chest;c.roll=c.roll||{};c.got=c.got||{};c.frames=c.frames||[];c.titles=c.titles||[];c.dry=c.dry||0;return c;}
function bxEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function bxMotion(){return !matchMedia("(prefers-reduced-motion: reduce)").matches;}
function bxRnd(){try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296;}catch(e){return Math.random();}}
function bxPick(list){let t=0;for(const x of list)t+=x[1];let r=bxRnd()*t;for(const x of list){r-=x[1];if(r<0)return x[0];}return list[list.length-1][0];}
function bxTier(){let n=0;try{n=streakDays()||0;}catch(e){}return n>=7?2:n>=3?1:0;}
const BX_TIER=[["Baú de madeira","#8b5a2b","#d9a066"],["Baú de prata","#8d99ae","#e9eef7"],["Baú de ouro","#b8860b","#ffe08a"]];
// --- sorteio (com garantia: no máximo 4 baús seguidos sem item) ---
function bxRoll(){const c=bxSt();const tier=bxTier();
  if(typeof clsGrantScroll==="function"&&bxRnd()<[.03,.05,.08][tier])return {k:"s",n:"Pergaminho de Renascimento",r:2,xp:5,tier};
  const fr=BX_FR.filter(f=>!f[5]&&!c.frames.includes(f[0])),tt=BX_TT.filter(t=>!c.titles.some(x=>x.id===t[0]));
  const pc=[.25,.35,.5][tier];const want=(fr.length||tt.length)&&(c.dry>=4||bxRnd()<pc);
  if(want){const w=tier===2?[0,4,4,2]:[0,6,3,1];
    const useF=fr.length&&(!tt.length||bxRnd()<.6);const pool=useF?fr:tt;const id=bxPick(pool.map(x=>[x[0],w[x[2]]]));const it=pool.find(x=>x[0]===id);
    return {k:useF?"f":"t",id,n:it[1],r:it[2],xp:5,tier};}
  const xp=bxPick([[10,40],[15,30],[20,18],[30,9],[40,3]])+(tier===2?5:0);return {k:"x",xp,r:xp>=30?2:xp>=20?1:0,tier};}
// --- quando o baú libera: tarefa de fechar o dia feita (ou, sem ela, todas as principais depois das 18h) ---
function bxIsFech(q){return !!q&&(q.id==="s_fech"||q.id==="q_fech"||/fechar o dia|antes de dormir|fechamento/i.test(String(q.title||"")));}
function bxReady(){if(!cfg||cfg.blank||!cfg.quests||!cfg.quests.length)return false;const tk=todayKey();const done=prog.log[tk]||[];
  const fq=(cfg.quests||[]).filter(bxIsFech);if(fq.length)return fq.some(q=>done.some(e=>e.q===q.id));
  let ms=[];try{ms=mainsFor(new Date());}catch(e){}return new Date().getHours()>=18&&ms.length>0&&ms.every(q=>done.some(e=>e.q===q.id));}
function bxPending(){const c=bxSt();const tk=todayKey();return bxReady()&&!c.got[tk];}
// --- arte do baú (SVG original) ---
function bxArt(tier){const [,a,b]=BX_TIER[tier];return '<svg class="bxsvg" viewBox="0 0 160 140" aria-hidden="true">'+
  '<g class="bxrays">'+[0,30,60,90,120,150,180,210,240,270,300,330].map(d=>'<path d="M80 70 L73 8 L87 8Z" fill="#fff1a8" opacity=".55" transform="rotate('+d+' 80 70)"/>').join("")+'<circle cx="80" cy="70" r="26" fill="#fff7c2" opacity=".8"/></g>'+
  '<ellipse cx="80" cy="128" rx="54" ry="7" fill="#000" opacity=".35"/>'+
  '<g class="bxbase"><rect x="26" y="66" width="108" height="58" rx="6" fill="'+a+'" stroke="#1a0f05" stroke-width="3"/><rect x="26" y="84" width="108" height="8" fill="'+b+'" opacity=".8"/>'+
  '<rect x="40" y="66" width="8" height="58" fill="'+b+'" opacity=".6"/><rect x="112" y="66" width="8" height="58" fill="'+b+'" opacity=".6"/>'+
  '<rect x="70" y="78" width="20" height="22" rx="3" fill="'+b+'" stroke="#1a0f05" stroke-width="2"/><circle cx="80" cy="87" r="3" fill="#1a0f05"/><rect x="79" y="88" width="2" height="6" fill="#1a0f05"/></g>'+
  '<g class="bxlid"><path d="M26 66 L26 48 Q26 26 80 24 Q134 26 134 48 L134 66Z" fill="'+a+'" stroke="#1a0f05" stroke-width="3"/>'+
  '<path d="M40 64 L40 40 M120 64 L120 40" stroke="'+b+'" stroke-width="8" opacity=".6"/><path d="M28 60 L132 60" stroke="'+b+'" stroke-width="6" opacity=".8"/></g>'+
  '<g class="bxglow"><circle cx="80" cy="64" r="20" fill="#fff7c2" opacity=".0"/></g></svg>';}
// --- moldura: anel em volta do seu avatar (só no seu aparelho) ---
function bxFrameCss(id){const f=BX_FR.find(x=>x[0]===id);return f?"--bxf1:"+f[3]+";--bxf2:"+f[4]:"";}
function bxApplyFrame(){const c=bxSt();const f=BX_FR.find(x=>x[0]===c.frame);if(f){document.body.dataset.bxf=f[0];document.body.style.setProperty("--bxf1",f[3]);document.body.style.setProperty("--bxf2",f[4]);}else delete document.body.dataset.bxf;}
// --- título: aparece embaixo do seu nome (troca com os títulos dos Segredos) ---
function bxTitleUI(){const c=bxSt();const h1=$("titleName");if(!h1)return;let t=$("bxTitle");if(!t){t=bxEl("div","sectitle bxtitle");t.id="bxTitle";(($("secTitle"))||h1).after(t);}
  const it=c.title&&c.titles.find(x=>x.id===c.title);t.hidden=!it;t.textContent=it?"« "+it.n+" »":"";if(it){const s=$("secTitle");if(s)s.hidden=true;}}
function bxEquipTitle(id){const c=bxSt();c.title=id||"";if(id&&prog.secTitle){prog.secTitle="";try{renderSec();}catch(e){}}save();bxTitleUI();bxColUI();}
if(typeof secEquip==="function"){const _se=secEquip;secEquip=function(id){if(id){const c=bxSt();c.title="";}_se.apply(this,arguments);try{bxTitleUI();}catch(e){}};}
function bxGiveTitle(id,n,src){const c=bxSt();if(c.titles.some(x=>x.id===id))return false;c.titles.push({id,n,src:src||"baú"});save();bxColUI();return true;}
// --- abrir ---
function bxOpen(){if($("bxModal"))return;const c=bxSt();const tk=todayKey();if(c.got[tk]||!bxReady())return;
  if(!c.roll[tk]){c.roll[tk]=bxRoll();for(const k in c.roll)if(k<tk)delete c.roll[k];save();}
  const rw=c.roll[tk];const tier=rw.tier||0;
  const m=bxEl("div","sysmodal bxmodal");m.id="bxModal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Baú do dia");
  const card=bxEl("div","card bxcard");card.append(bxEl("div","tag","[ SISTEMA ] BAÚ DO DIA"),bxEl("h3",null,"Dia fechado. "+BX_TIER[tier][0]+" liberado."));
  const hint=bxEl("p","sm muted bxhint",tier<2?"Sequência de "+(tier?7:3)+" dias melhora o baú.":"Sequência de 7+ dias: chance maior de item lendário.");
  const btn=bxEl("button","bxbtn t"+tier);btn.type="button";btn.innerHTML=bxArt(tier);btn.setAttribute("aria-label","Abrir o baú");
  const tap=bxEl("div","bxtap",bxMotion()?"Toque 3 vezes para abrir":"Toque para abrir");
  const out=bxEl("div","bxout");out.hidden=true;
  const row=bxEl("div","row bxrow");row.hidden=true;
  card.append(btn,tap,hint,out,row);m.append(card);document.body.append(m);setTimeout(()=>btn.focus(),60);
  let taps=0;const need=bxMotion()?3:1;
  btn.addEventListener("click",()=>{if(btn.dataset.open)return;taps++;try{haptic(taps<need?[10]:[20,40,30]);}catch(e){}
    if(taps<need){btn.classList.remove("shake");void btn.offsetWidth;btn.classList.add("shake");tap.textContent=need-taps===1?"Mais uma vez!":"Mais "+(need-taps)+"…";return;}
    btn.dataset.open="1";btn.classList.add("open");tap.hidden=true;hint.hidden=true;setTimeout(reveal,bxMotion()?650:0);});
  function reveal(){if(c.got[tk])return;c.got[tk]=1;for(const k in c.got)if(k<dkeyBack(30))delete c.got[k];
    if(!c.paid||c.paid.d!==tk){c.paid={d:tk};if(rw.k==="s"){try{clsGrantScroll(1,"baú");}catch(e){}c.dry=0;}else if(rw.k==="f"){if(!c.frames.includes(rw.id))c.frames.push(rw.id);c.dry=0;}else if(rw.k==="t"){bxGiveTitle(rw.id,rw.n,"baú");c.dry=0;}else c.dry++;
    }save();
    if(!entries().some(e=>e.q==="ach:bau:"+tk))addXP({q:"ach:bau:"+tk,kind:"full",xp:rw.xp,stat:"mente",bonus:0,t:new Date().toISOString()},"");
    out.hidden=false;out.textContent="";out.style.setProperty("--rc",BX_RCOL[rw.r||0]);
    out.append(bxEl("div","bxrar",rw.r?BX_RAR[rw.r]:"Comum"));
    if(rw.k==="f"){const pv=bxEl("div","bxfpv");pv.style.cssText=bxFrameCss(rw.id);try{pv.innerHTML=avMine(84);}catch(e){}out.append(pv,bxEl("b","bxname","Moldura: "+rw.n),bxEl("span","sm muted","+"+rw.xp+" XP"));}
    else if(rw.k==="s")out.append(bxEl("b","bxname","📜 "+rw.n),bxEl("span","sm muted","Vale 1 troca de classe · +"+rw.xp+" XP"));
    else if(rw.k==="t")out.append(bxEl("b","bxname","Título: « "+rw.n+" »"),bxEl("span","sm muted","+"+rw.xp+" XP"));
    else out.append(bxEl("b","bxname bxxp","+"+rw.xp+" XP"),bxEl("span","sm muted",c.dry>=3?"Item garantido em até "+Math.max(1,5-c.dry)+" baú(s).":"Amanhã tem outro."));
    row.hidden=false;row.textContent="";
    if(rw.k==="f"||rw.k==="t"){const eq=bxEl("button","go","Usar agora");eq.type="button";eq.addEventListener("click",()=>{if(rw.k==="f"){c.frame=rw.id;save();bxApplyFrame();}else bxEquipTitle(rw.id);toast("Equipado: "+rw.n);close();});row.append(eq);}
    const ok=bxEl("button",rw.k==="x"?"go":"ghost","Fechar");ok.type="button";ok.addEventListener("click",close);row.append(ok);setTimeout(()=>(row.querySelector("button")||ok).focus(),50);
    try{if(typeof sparks==="function")sparks(true);}catch(e){}
    bxColUI();bxPill();}
  function close(){m.remove();bxPill();try{render();}catch(e){}}
  m.addEventListener("click",e=>{if(e.target===m&&btn.dataset.open)close();});}
// desfez o "Fechar o dia": o XP do baú sai; ao fechar de novo, o mesmo prêmio volta (item não duplica)
function bxUndo(){const c=bxSt();const tk=todayKey();if(!c.got[tk]||bxReady())return;delete c.got[tk];
  prog.log[tk]=(prog.log[tk]||[]).filter(e=>e.q!=="ach:bau:"+tk);save();try{render();}catch(e){}toast("Baú do dia guardado: volta quando você fechar o dia.");}
function dkeyBack(n){const d=new Date();d.setDate(d.getDate()-n);try{return dkey(d);}catch(e){return "";}}
// --- pílula na tela Hoje quando o baú está esperando ---
function bxPill(){let p=$("bxPill");const hoje=document.querySelector('.wrap>section[data-tab="hoje"] .status');if(!hoje)return;
  const on=bxPending();if(!p){if(!on)return;p=bxEl("button","bxpill");p.type="button";p.id="bxPill";p.addEventListener("click",bxOpen);hoje.closest("section").before(p);}
  p.hidden=!on;if(on){p.textContent="";const i=bxEl("span","bxpi");i.innerHTML=bxArt(bxTier());p.append(i,bxEl("b",null,"🎁 Baú do dia pronto"),bxEl("span","sm","Toque para abrir"));}}
// --- coleção (aba Progresso): molduras e títulos para equipar ---
// mantém o cabeçalho (as telas enxutas transformam ele no botão de abrir/fechar) e troca só o resto
function bxHead(p,t,meta){const h=p.firstElementChild;if(h&&h.classList.contains("qhead")){const h2=h.querySelector("h2"),sp=h.querySelector("span");if(h2)h2.textContent=t;if(sp)sp.textContent=meta;while(h.nextSibling)h.nextSibling.remove();return h;}
  p.textContent="";const hd=bxEl("div","qhead");hd.append(bxEl("h2",null,t),bxEl("span","sm mono",meta));p.append(hd);return hd;}
function bxColUI(){let p=$("bxCol");const first=$("avPanel")||document.querySelector('.wrap>section[data-tab="prog"]');if(!first)return;
  if(!p){p=bxEl("section","panel bxcol");p.id="bxCol";p.dataset.tab="prog";first.after(p);}
  if(!cfg||cfg.blank){p.hidden=true;return;}p.hidden=false;const c=bxSt();
  bxHead(p,"🎁 Coleção do baú",(c.frames.length+c.titles.length)+((c.frames.length+c.titles.length)===1?" item":" itens"));
  p.append(bxEl("div","sm muted","Feche o dia para abrir 1 baú. Toque num item para usar; toque de novo para tirar."));
  p.append(bxEl("h3","bxh","Molduras"));const g=bxEl("div","bxgrid");
  for(const f of BX_FR){const own=c.frames.includes(f[0]);const b=bxEl("button","bxf"+(own?"":" lock")+(c.frame===f[0]?" eq":""));b.type="button";b.style.cssText=bxFrameCss(f[0]);
    const ring=bxEl("span","bxring");if(own){try{ring.innerHTML=avMine(44);}catch(e){}}else ring.textContent="🔒";b.append(ring,bxEl("span","bxfn",own?f[1]:"???"),bxEl("span","bxfr",f[5]&&!own?"aos "+f[5]+" itens":BX_RAR[f[2]]));b.style.setProperty("--rc",BX_RCOL[f[2]]);
    b.disabled=!own;b.setAttribute("aria-label",own?f[1]+(c.frame===f[0]?" (em uso)":""):"Moldura bloqueada, "+(f[5]?"sai aos "+f[5]+" itens da coleção":BX_RAR[f[2]]));
    if(own)b.addEventListener("click",()=>{c.frame=c.frame===f[0]?"":f[0];save();bxApplyFrame();bxColUI();toast(c.frame?"Moldura em uso: "+f[1]:"Moldura removida.");});g.append(b);}
  p.append(g);p.append(bxEl("h3","bxh","Títulos"));const tl=bxEl("div","bxtl");
  if(!c.titles.length)tl.append(bxEl("span","sm muted","Nenhum ainda. Baús e chefões dão títulos raros."));
  for(const t of c.titles){const r=(BX_TT.find(x=>x[0]===t.id)||[0,0,2])[2];const b=bxEl("button","bxtt"+(c.title===t.id?" eq":""));b.type="button";b.style.setProperty("--rc",BX_RCOL[r]);
    b.append(bxEl("b",null,"« "+t.n+" »"),bxEl("span","sm muted",(t.src==="chefão"?"do chefão":BX_RAR[r])+(c.title===t.id?" · em uso":"")));b.addEventListener("click",()=>bxEquipTitle(c.title===t.id?"":t.id));tl.append(b);}
  p.append(tl);}
// quando a tarefa de fechar o dia sai, o baú aparece
{const _tg=toggle;toggle=function(q,kind){const before=bxPending();_tg.apply(this,arguments);try{bxUndo();bxPill();if(!before&&bxPending())setTimeout(()=>{if(sysQ&&sysQ.length){const w=setInterval(()=>{if(!sysQ.length){clearInterval(w);bxOpen();}},400);setTimeout(()=>clearInterval(w),20000);}else bxOpen();},900);}catch(e){}};}
{const _r=render;render=function(){_r.apply(this,arguments);try{bxPill();bxTitleUI();}catch(e){}};}
setTimeout(()=>{try{bxApplyFrame();bxTitleUI();bxColUI();bxPill();}catch(e){}},0);
