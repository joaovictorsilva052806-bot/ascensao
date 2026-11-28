// ---------- Esquadrão (modo cooperativo): até 5 jogadores do ranking enfrentam juntos a Anomalia da semana ----------
// Sem servidor novo: usa a lista do ranking (opt-in). Cada um monta o esquadrão no próprio app tocando nos nomes.
// Só ADICIONA prog.squad = {n:nome, m:[nomes], won:{semana:1}}.
const SQ_MAX=4,SQ_HP=250,SQ_PRIZE=50;
const SQ_BOSS=["Anomalia Zero","Eco Fantasma","Núcleo Corrompido","Sentinela Vazia","Vírus da Inércia","Ruído Infinito","Espelho Quebrado","Maré Estática"];
function sqSt(){return prog.squad||null;}
function sqWk(){return weekStart(todayKey());}
function sqBoss(){const ws=sqWk();let h=0;for(const c of ws)h=(h*31+c.charCodeAt(0))>>>0;return SQ_BOSS[h%SQ_BOSS.length];}
function sqRows(){const s=sqSt();if(!s)return [];const me=rankName()||"Você";const rows=[{n:me,xp:weekXP(),me:true}];
  for(const n of s.m){const r=(rankRows||[]).find(x=>x.n===n);rows.push({n,xp:r?r.xp:0,off:!r});}return rows;}
function sqState(){const rows=sqRows();const hp=SQ_HP*rows.length;const dmg=rows.reduce((a,r)=>a+r.xp,0);return {rows,hp,dmg,left:Math.max(0,hp-dmg),pct:Math.min(100,Math.round(dmg/hp*100))};}
function sqCheckWin(){const s=sqSt();if(!s||!s.m.length)return;const st=sqState();const ws=sqWk();s.won=s.won||{};
  if(st.left>0||s.won[ws])return;s.won[ws]=1;save();
  sysPop("ESQUADRÃO",sqBoss()+" derrotada","O esquadrão "+s.n+" venceu a anomalia da semana. Recompensa: +"+SQ_PRIZE+" XP para você.",()=>{
    if((prog.log[todayKey()]||[]).some(e=>String(e.q)==="sq:"+ws))return;
    addXP({q:"sq:"+ws,kind:"squad",xp:SQ_PRIZE,stat:"foco",t:new Date().toISOString()},"Vitória do esquadrão: +"+SQ_PRIZE+" XP");},"Coletar");}
function sqEl(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function sqShare(){const s=sqSt();if(!s)return;const me=rankName()||"eu";
  const url=location.origin+location.pathname.replace(/(comecar\/)?(index\.html)?$/,"")+"x/";
  const t="[ ESQUADRÃO "+s.n.toUpperCase()+" ] Anomalia da semana detectada. Entra no Ascension, vai em Progresso > Esquadrão e me recruta: "+me+". "+url;
  if(navigator.share){navigator.share({title:"Ascension",text:t}).catch(()=>{});return;}
  window.open("https://wa.me/?text="+encodeURIComponent(t),"_blank","noopener");}
function sqUI(){let p=$("sqPanel");const rp=$("rankPanel");if(!rp)return;
  if(!p){p=sqEl("section","panel sq");p.id="sqPanel";p.dataset.tab="prog";rp.after(p);}
  const kid=ageNow()==="kid";p.hidden=kid||!cfg||cfg.blank;if(p.hidden)return;p.textContent="";
  const hd=sqEl("div","qhead");hd.append(sqEl("h2",null,"🛰️ Esquadrão"),sqEl("span","sm muted","modo cooperativo"));p.append(hd);
  const on=!!(prog.rank&&prog.rank.on);const s=sqSt();
  if(!on){p.append(sqEl("div","sqsys","[SISTEMA] Para formar um esquadrão, entre no ranking acima. Seus aliados precisam estar lá também."));return;}
  if(!s){p.append(sqEl("div","sqsys","[SISTEMA] Junte até "+SQ_MAX+" aliados. Toda semana uma anomalia aparece, e o XP de todos tira a vida dela. Venceu, cada um ganha +"+SQ_PRIZE+" XP."));
    const row=sqEl("div","add");const inp=sqEl("input");inp.maxLength=16;inp.placeholder="Nome do esquadrão";inp.autocomplete="off";const b=sqEl("button","go","Formar");b.type="button";
    b.addEventListener("click",()=>{const n=String(inp.value||"").trim().replace(/[|,;"<>]/g,"").slice(0,16);if(!n){inp.focus();return;}prog.squad={n,m:[],won:{}};save();sqUI();toast("Esquadrão "+n+" formado. Recrute aliados.");});
    row.append(inp,b);p.append(row);return;}
  const st=sqState();
  const boss=sqEl("div","sqboss");const top=sqEl("div","sqbt");top.append(sqEl("b",null,"⚠ "+sqBoss().toUpperCase()),sqEl("span",null,st.left?st.left+" HP":"DERROTADA"));
  const bar=sqEl("div","sqbar");const fill=sqEl("i");fill.style.width=(100-st.pct)+"%";bar.append(fill);
  boss.append(sqEl("div","sqtag","ESQUADRÃO "+s.n.toUpperCase()+" · SEMANA"),top,bar,sqEl("div","sm muted",st.left?"Dano do esquadrão: "+st.dmg+" de "+st.hp+". Cada XP de vocês conta.":"Anomalia derrotada. Nova ameaça na segunda."));
  p.append(boss);
  const ol=sqEl("ol","sqm");const mx=Math.max(1,...st.rows.map(r=>r.xp));
  for(const r of st.rows){const li=sqEl("li",r.me?"me":"");const nm=sqEl("span","n",r.n+(r.me?" (você)":""));const xb=sqEl("span","x",r.off?"fora do ranking":r.xp+" XP");
    const g=sqEl("div","g");const gi=sqEl("i");gi.style.width=Math.round(r.xp/mx*100)+"%";g.append(gi);li.append(nm,xb,g);
    if(!r.me){const x=sqEl("button","link","✕");x.type="button";x.title="Remover";x.addEventListener("click",()=>{s.m=s.m.filter(n=>n!==r.n);save();sqUI();});li.append(x);}
    ol.append(li);}
  p.append(ol);
  // convidados ficam de fora (sem XP nem dano) até aceitarem; convite some em 7 dias
  s.inv=s.inv||{};for(const k in s.inv)if((Date.now()-new Date(s.inv[k]).getTime())/864e5>7)delete s.inv[k];const inv=Object.keys(s.inv).filter(n=>!s.m.includes(n));
  if(inv.length){const ul=sqEl("ul","sqm sqinv");for(const n of inv){const li=sqEl("li");li.append(sqEl("span","n",n),sqEl("span","x","convidado · aguardando"));const x=sqEl("button","link","✕");x.type="button";x.title="Cancelar convite";x.addEventListener("click",()=>{delete s.inv[n];save();sqUI();});li.append(x);ul.append(li);}p.append(ul);}
  const cand=(rankRows||[]).map(r=>r.n).filter(n=>n&&n!==rankName()&&!s.m.includes(n)&&!s.inv[n]);
  if(s.m.length+inv.length<SQ_MAX&&cand.length){p.append(sqEl("div","sm muted","Recrutar do ranking:"));const ch=sqEl("div","sqchips");
    for(const n of cand.slice(0,24)){const c=sqEl("button","chip","+ "+n);c.type="button";c.addEventListener("click",()=>{if(s.m.length+Object.keys(s.inv||{}).length>=SQ_MAX)return;s.inv=s.inv||{};s.inv[n]=new Date().toISOString();save();try{sqiInvite(n);}catch(e){}sqUI();toast("Convite enviado para "+n+". Entra no esquadrão quando aceitar.");});ch.append(c);}
    p.append(ch);}
  const row=sqEl("div","row");const sh=sqEl("button","ghost","📡 Chamar aliados");sh.type="button";sh.addEventListener("click",sqShare);
  const lv=sqEl("button","link","Desfazer esquadrão");lv.type="button";lv.addEventListener("click",()=>{if(!confirm("Desfazer o esquadrão "+s.n+"?"))return;prog.squad=null;save();sqUI();});
  row.append(sh,lv);p.append(row);}
{const _rr=renderRankUI;renderRankUI=function(){_rr();try{sqUI();sqCheckWin();}catch(e){}};}
setTimeout(()=>{try{sqUI();}catch(e){}},0);
