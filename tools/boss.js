// ---------- Chefão da turma: um chefe por semana para você e seus amigos juntos ----------
// Cada tarefa feita por qualquer pessoa da turma tira vida dele (1 XP da semana = 1 de dano).
// Usa só o que já é público por opção (XP da semana no ranking 14+). Até 13 anos ou fora do ranking: modo solo, tudo no aparelho.
// Derrotado até domingo: +TB_PRIZE XP para cada um e um título raro. Volta toda segunda com outro chefe.
// Só ADICIONA prog.tboss = {won:{semana:1}, seen:{semana:dano}}. XP entra como "ach:tb:<semana>" (não conta sequência).
const TB_HP=300,TB_PRIZE=60;
// [nome, apelido curto, forma, cor principal, cor do brilho, fala]
const TB_LIST=[
 ["Vaelgor, o Adiador","Vaelgor","drag","#7b2cff","#ff4fd8","Amanhã você faz. Amanhã… sempre amanhã."],
 ["Kurogane, Titã do Sofá","Kurogane","tita","#3a4a63","#00d4ff","Senta mais um pouco. Só mais cinco minutos."],
 ["Fera do Scroll Infinito","Fera","drag","#0e8f7a","#64ffda","Mais um vídeo. E mais um. E mais um."],
 ["Mórdax, Dragão do Cansaço","Mórdax","drag","#b8323f","#ff9f43","Você está cansado demais para começar."],
 ["Golem da Distração","Golem","tita","#6b4f2a","#f2c14e","Olha o celular. Viu? Já esqueceu o que ia fazer."],
 ["Nyxar, Sombra da Dúvida","Nyxar","drag","#1f2e8a","#7aa2ff","E se não der certo? Melhor nem tentar."],
 ["Colosso do Barulho","Colosso","tita","#5a2a6b","#ff6ec7","Tanta coisa ao mesmo tempo. Escolhe nenhuma."],
 ["Ignis, Fera da Pressa","Ignis","drag","#c2410c","#ffd166","Faz tudo de uma vez ou não faz nada."]];
function tbSt(){if(!prog.tboss||typeof prog.tboss!=="object")prog.tboss={};const t=prog.tboss;t.won=t.won||{};t.seen=t.seen||{};return t;}
function tbWk(){return weekStart(todayKey());}
function tbBoss(ws){ws=ws||tbWk();let h=7;for(const c of ws)h=(h*33+c.charCodeAt(0))>>>0;return TB_LIST[h%TB_LIST.length];}
function tbKid(){try{return ageNow()==="kid";}catch(e){return false;}}
function tbOn(){return !!cfg&&!cfg.blank&&!!(cfg.quests&&cfg.quests.length);}
function tbSocial(){return !tbKid()&&!!(prog.rank&&prog.rank.on);}
function tbTab(){return tbSocial()?"amigos":"prog";}
const tbN=v=>String(v||"").trim().toLowerCase();
// XP da semana sem a própria recompensa do chefão (senão ele "se mata" com o prêmio)
function tbMyXP(){const ws=tbWk();let x=weekXP();for(const e of entries())if(e.q==="ach:tb:"+ws&&weekStart(e.date)===ws)x-=(e.xp||0);return Math.max(0,x);}
function tbRows(){const me={n:rankName()||"Você",xp:tbMyXP(),me:true,av:""};try{me.av=avCode();}catch(e){}
  const rows=[me];let fr=[];try{if(tbSocial())fr=frSt().l;}catch(e){}
  for(const n of fr){const r=(rankRows||[]).find(x=>tbN(x.n)===tbN(n));if(!r)continue;const p=(typeof sqPub!=="undefined"&&sqPub[tbN(n)])||{};rows.push({n:r.n,xp:Math.max(0,+r.xp||0),av:p.av||""});}
  return rows.sort((a,b)=>b.xp-a.xp);}
function tbState(){const rows=tbRows();const hp=TB_HP*rows.length;const dmg=rows.reduce((a,r)=>a+r.xp,0);const left=Math.max(0,hp-dmg);
  return {rows,hp,dmg:Math.min(dmg,hp),left,pct:Math.round(left/hp*100),boss:tbBoss()};}
function tbEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function tbMotion(){return !matchMedia("(prefers-reduced-motion: reduce)").matches;}
// --- arte original (SVG): dragão ou titã, com aura, olhos acesos e rachaduras quando está fraco ---
function tbArt(b,pct,dead){const [,,form,c1,c2]=b;const id="tb"+Math.random().toString(36).slice(2,7);const hurt=pct<50,crit=pct<20;
  const defs='<defs><radialGradient id="'+id+'a" cx="50%" cy="55%" r="55%"><stop offset="0" stop-color="'+c2+'" stop-opacity=".55"/><stop offset=".55" stop-color="'+c1+'" stop-opacity=".25"/><stop offset="1" stop-color="'+c1+'" stop-opacity="0"/></radialGradient>'+
   '<linearGradient id="'+id+'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c1+'"/><stop offset="1" stop-color="#07090f"/></linearGradient>'+
   '<filter id="'+id+'g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  const aura='<ellipse class="tbaura" cx="100" cy="92" rx="96" ry="70" fill="url(#'+id+'a)"/>'+
   '<g class="tblines" stroke="'+c2+'" stroke-opacity=".35" stroke-width="1.2"><path d="M8 40 L40 58"/><path d="M192 36 L160 56"/><path d="M4 110 L36 102"/><path d="M196 116 L164 104"/><path d="M30 150 L56 128"/><path d="M172 152 L146 128"/></g>';
  const eyes=(lx,ly,rx,ry)=>'<g class="tbeyes" filter="url(#'+id+'g)"><path d="M'+lx+' '+ly+' l22 6 l-4 7 l-20 -5z" fill="'+c2+'"/><path d="M'+rx+' '+ry+' l-22 6 l4 7 l20 -5z" fill="'+c2+'"/>'+
   '<path d="M'+(lx+12)+' '+(ly+5)+' l3 1 l-1 4 l-3 -1z" fill="#fff"/><path d="M'+(rx-12)+' '+(ry+5)+' l-3 1 l1 4 l3 -1z" fill="#fff"/></g>';
  const cracks=hurt?'<g class="tbcrack" stroke="'+c2+'" stroke-width="1.6" fill="none" filter="url(#'+id+'g)"><path d="M86 60 l6 10 l-5 8 l7 9"/>'+(crit?'<path d="M122 70 l-6 9 l6 7 l-4 10"/><path d="M98 112 l4 8 l-6 6"/>':'')+'</g>':'';
  let body;
  if(form==="tita"){
    body='<g class="tbbody"><path d="M28 152 Q30 104 58 92 L74 86 L126 86 L142 92 Q170 104 172 152Z" fill="url(#'+id+'b)" stroke="#000" stroke-opacity=".5"/>'+
     '<path d="M40 104 L22 88 L30 70 L58 84Z M160 104 L178 88 L170 70 L142 84Z" fill="'+c1+'" stroke="#000" stroke-opacity=".5"/>'+
     '<path d="M64 88 L62 46 Q64 26 100 22 Q136 26 138 46 L136 88 Q118 100 100 100 Q82 100 64 88Z" fill="url(#'+id+'b)" stroke="#000" stroke-opacity=".55" stroke-width="1.5"/>'+
     '<path d="M70 50 L130 50 L126 64 L74 64Z" fill="#05070c"/>'+
     '<g class="tbeyes" filter="url(#'+id+'g)"><ellipse cx="100" cy="57" rx="16" ry="5" fill="'+c2+'"/><ellipse cx="100" cy="57" rx="5" ry="3" fill="#fff"/></g>'+
     '<path d="M80 76 L120 76 L116 86 L84 86Z" fill="#05070c"/><path d="M86 76 v6 M94 76 v8 M102 76 v8 M110 76 v6" stroke="'+c2+'" stroke-opacity=".6"/>'+
     '<path d="M70 32 L58 10 L80 26 M130 32 L142 10 L120 26" fill="'+c1+'" stroke="#000" stroke-opacity=".5"/>'+
     '<circle cx="100" cy="122" r="9" fill="none" stroke="'+c2+'" stroke-width="2" filter="url(#'+id+'g)"/></g>';
  }else{
    body='<g class="tbbody"><path d="M100 70 L20 34 L34 66 L6 70 L36 92 L18 110 L70 100Z M100 70 L180 34 L166 66 L194 70 L164 92 L182 110 L130 100Z" fill="'+c1+'" fill-opacity=".85" stroke="#000" stroke-opacity=".5"/>'+
     '<path d="M70 52 Q52 20 34 14 Q56 30 60 58Z M130 52 Q148 20 166 14 Q144 30 140 58Z" fill="#e9e2d0" stroke="#000" stroke-opacity=".4"/>'+
     '<path d="M100 26 L132 44 L142 74 L134 104 L118 128 L100 140 L82 128 L66 104 L58 74 L68 44Z" fill="url(#'+id+'b)" stroke="#000" stroke-opacity=".55" stroke-width="1.5"/>'+
     '<path d="M100 30 L106 52 L100 60 L94 52Z" fill="'+c2+'" fill-opacity=".5"/>'+
     '<path d="M66 66 L96 74 M134 66 L104 74" stroke="#05070c" stroke-width="5" stroke-linecap="round"/>'+
     eyes(68,70,132,70)+
     '<path d="M74 104 L126 104 L114 124 L100 130 L86 124Z" fill="#05070c"/>'+
     '<path d="M78 104 l5 9 l5 -9 l5 10 l5 -10 l5 10 l5 -10 l5 9 l5 -9" fill="#f4f1e8" stroke="none"/>'+
     '<g class="tbbreath" fill="'+c2+'" filter="url(#'+id+'g)"><circle cx="92" cy="134" r="2"/><circle cx="108" cy="136" r="1.6"/><circle cx="100" cy="142" r="1.3"/></g></g>';
  }
  return '<svg class="tbsvg'+(hurt?" hurt":"")+(crit?" crit":"")+(dead?" dead":"")+'" viewBox="0 0 200 160" role="img" aria-label="'+b[0]+'">'+defs+aura+body+cracks+'</svg>';}
// --- dano novo desde a última vez que você olhou: número subindo e tremida ---
function tbHitFx(box,n){if(!box||n<=0||!tbMotion())return;const f=tbEl("span","tbdmg","-"+n);box.append(f);box.classList.remove("tbhit");void box.offsetWidth;box.classList.add("tbhit");
  setTimeout(()=>f.remove(),1300);try{haptic([8,20,8]);}catch(e){}}
function tbCheckWin(st){const s=tbSt();const ws=tbWk();if(st.left>0||s.won[ws]||st.rows.length<1)return;s.won[ws]=1;save();const b=st.boss;
  const solo=st.rows.length===1;if(!tbSocial())s.won[ws]=1;
  sysPop("CHEFÃO DERROTADO",b[0]+" caiu!",(solo?"Você derrubou o chefão sozinho.":"A guilda ("+st.rows.length+" pessoas) derrubou o chefão antes de domingo.")+" Recompensa: +"+TB_PRIZE+" XP e o título raro « Ruína de "+b[1]+" »"+(typeof clsGrantScroll==="function"&&!tbSt().scroll?" + 1 Pergaminho de Renascimento (1ª vitória).":"."),()=>{
    if(!entries().some(e=>e.q==="ach:tb:"+ws))addXP({q:"ach:tb:"+ws,kind:"full",xp:TB_PRIZE,stat:"foco",bonus:0,t:new Date().toISOString()},"Chefão derrotado: +"+TB_PRIZE+" XP");
    try{if(typeof clsGrantScroll==="function"&&!tbSt().scroll){tbSt().scroll=1;save();clsGrantScroll(1,"chefão");}}catch(e){}
    try{if(typeof bxGiveTitle==="function")bxGiveTitle("tb_"+tbN(b[1]),"Ruína de "+b[1],"chefão");}catch(e){}
    try{tbUI();}catch(e){}},"Coletar recompensa");}
// --- painel na aba Amigos (logo acima da turma) ---
function tbPlace(){const wrap=document.querySelector(".wrap");if(!wrap)return null;let p=$("tbPanel");
  if(!p){p=tbEl("section","panel tb");p.id="tbPanel";}const tab=tbTab();p.dataset.tab=tab;
  if(tab==="amigos"){const tm=$("tmPanel");if(tm&&tm.parentNode===wrap){if(p.nextElementSibling!==tm)tm.before(p);}else if(!p.isConnected)wrap.append(p);}
  else{const first=document.querySelector('.wrap>section[data-tab="prog"]');if(first&&p.nextElementSibling!==first&&p!==first)first.before(p);else if(!p.isConnected)wrap.append(p);}
  return p;}
function tbUI(){const p=tbPlace();if(!p)return;if(!tbOn()){p.hidden=true;tbStrip();return;}p.hidden=false;
  const st=tbState();const s=tbSt();const ws=tbWk();const b=st.boss;const dead=st.left<=0;const prev=s.seen[ws]||0;const gain=st.dmg-prev;
  p.textContent="";
  const hd=tbEl("div","tbhd");hd.append(tbEl("span","tbtag",tbSocial()?"CHEFÃO DA GUILDA":"CHEFÃO DA SEMANA"),tbEl("span","tbclock",dead?"✔ derrotado":"⏳ até domingo · "+(typeof tmLeft==="function"?tmLeft():"")));p.append(hd);
  const stage=tbEl("div","tbstage"+(dead?" dead":""));stage.innerHTML=tbArt(b,st.pct,dead);if(dead)stage.append(tbEl("span","tbstamp","DERROTADO"));p.append(stage);
  p.append(tbEl("h3","tbname",b[0]));
  const hp=tbEl("div","tbhp");const fill=tbEl("i");fill.style.width=st.pct+"%";if(st.pct<20)fill.className="crit";else if(st.pct<50)fill.className="hurt";hp.append(fill);
  const lbl=tbEl("span","tbhpn",dead?"0 HP":st.left+" / "+st.hp+" HP");hp.append(lbl);p.append(hp);
  p.append(tbEl("p","tbsay",dead?"« Isso… não estava nos meus planos. »":"« "+b[5]+" »"));
  p.append(tbEl("div","sm muted tbrule",dead?"Recompensa coletada por quem estava na guilda. Novo chefão na segunda.":(tbSocial()?"Cada tarefa feita por alguém da guilda tira vida dele (1 XP = 1 de dano). Derrotem até domingo: +"+TB_PRIZE+" XP e título raro para cada um.":"Cada tarefa sua tira vida dele (1 XP = 1 de dano). Derrote até domingo: +"+TB_PRIZE+" XP e um título raro.")));
  // quem bateu mais
  const ol=tbEl("ol","tbm");const mx=Math.max(1,...st.rows.map(r=>r.xp));st.rows.slice(0,8).forEach((r,i)=>{const li=tbEl("li",r.me?"me":"");
    li.append(tbEl("span","tbmn",(i===0&&r.xp>0?"👑 ":"")+r.n+(r.me?" (você)":"")),tbEl("span","tbmx",r.xp+" de dano"));
    const g=tbEl("div","tbmg");const gi=tbEl("i");gi.style.width=Math.round(r.xp/mx*100)+"%";g.append(gi);li.append(g);ol.append(li);});
  p.append(ol);
  if(st.rows.length===1&&tbSocial()){const e=tbEl("div","tbsolo");e.append(tbEl("span",null,"Sozinho a vida dele é "+TB_HP+". Cada amigo soma "+TB_HP+" de vida e o dano dele também."));
    const bt=tbEl("button","ghost","+ Chamar amigo para a luta");bt.type="button";bt.addEventListener("click",()=>{try{frAdd=true;frUI();}catch(e){}const f=$("frPanel");if(f){f.classList.remove("tmoff");f.scrollIntoView({block:"start",behavior:"smooth"});}});e.append(bt);p.append(e);}
  if(gain>0&&prev>0)tbHitFx(stage,gain);
  if(st.dmg!==prev){s.seen[ws]=st.dmg;for(const k in s.seen)if(k<ws)delete s.seen[k];save();}
  tbStrip(st);tbCheckWin(st);}
// --- faixa pequena na tela Hoje: vida do chefão e atalho para Amigos ---
function tbStrip(st){let el=$("tbStrip");const hoje=document.querySelector('.wrap>section[data-tab="hoje"] .status');
  if(!tbOn()||!hoje){if(el)el.hidden=true;return;}
  if(!el){el=tbEl("button","tbstrip");el.type="button";el.id="tbStrip";el.addEventListener("click",()=>{const t=tbTab();goTab(t);if(t==="amigos"){try{loadRank();}catch(e){}try{tmUI();}catch(e){}}tbUI();const p=$("tbPanel");if(p)p.scrollIntoView({block:"start"});});
    const sec=hoje.closest("section");sec.after(el);}
  st=st||tbState();el.hidden=false;el.textContent="";const b=st.boss;const dead=st.left<=0;
  const ic=tbEl("span","tbsico");ic.innerHTML=tbArt(b,st.pct,dead);
  const tx=tbEl("span","tbstx");tx.append(tbEl("b",null,dead?"Vitória sobre "+b[1]+" ✔":"🐉 "+b[1]+" · "+st.pct+"% de vida"));
  const bar=tbEl("span","tbsbar");const f=tbEl("i");f.style.width=st.pct+"%";bar.append(f);tx.append(bar);
  tx.append(tbEl("span","tbssub",dead?(tbSocial()?"A guilda venceu esta semana.":"Você venceu esta semana."):"Cada tarefa sua tira vida dele."));
  el.append(ic,tx);el.setAttribute("aria-label",dead?"Chefão derrotado. Abrir o chefão":"Chefão "+b[1]+" com "+st.pct+"% de vida. Abrir o chefão");}
// quando você conclui uma tarefa, o chefão sente na hora (faixa treme e mostra o dano)
{const _tg=toggle;toggle=function(q,kind){const a=tbOn()?tbMyXP():0;_tg.apply(this,arguments);if(!tbOn())return;const d=tbMyXP()-a;
  try{tbUI();if(d>0){const el=$("tbStrip");if(el&&tbMotion()){const f=tbEl("span","tbdmg sm","-"+d);el.append(f);el.classList.remove("tbhit");void el.offsetWidth;el.classList.add("tbhit");setTimeout(()=>f.remove(),1300);}}}catch(e){}};}
{const _rr=renderRankUI;renderRankUI=function(){_rr.apply(this,arguments);try{tbUI();}catch(e){}};}
{const _r=render;render=function(){_r.apply(this,arguments);try{tbStrip();}catch(e){}};}
setTimeout(()=>{try{tbUI();}catch(e){}},0);
