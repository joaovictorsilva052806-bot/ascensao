// ---------- Liga da semana (estilo Duolingo, leve): divisão que só sobe, rival mais próximo e fechamento da semana ----------
// Só ADICIONA prog.league = {t, snap:{wk,pos,of,xp}, res:{semana:posição}}. Usa a lista do ranking que já existe (opt-in).
const LG=[["🪨","Ferro"],["🥉","Bronze"],["🥈","Prata"],["🥇","Ouro"],["💠","Platina"],["👑","Mítica"]];
function lgSt(){const l=prog.league||(prog.league={t:0,snap:null,res:{}});l.res=l.res||{};if(typeof l.t!=="number")l.t=0;return l;}
const lgName=t=>LG[Math.min(t,LG.length-1)].join(" Liga ");
function lgRows(){return (rankRows||[]).slice().sort((a,b)=>b.xp-a.xp);}
function lgMe(){if(!(prog.rank&&prog.rank.on)||!rankRows)return null;const me=rankName();const rows=lgRows();const i=rows.findIndex(r=>r.n===me);
  const xp=weekXP();if(i<0)return {pos:rows.filter(r=>r.xp>xp).length+1,of:rows.length+1,xp,rows,i:-1};return {pos:i+1,of:rows.length,xp:Math.max(xp,rows[i].xp),rows,i};}
function lgClose(){const l=lgSt();const s=l.snap;const ws=weekStart(todayKey());if(!s||s.wk>=ws||l.res[s.wk])return;
  l.res[s.wk]=s.pos;const up=s.of>=2&&s.pos<=3&&s.xp>0&&l.t<LG.length-1;if(up)l.t++;save();
  const md=s.pos<=3?["🥇","🥈","🥉"][s.pos-1]:"#"+s.pos;
  sysPop("SEMANA FECHADA","Você ficou em "+s.pos+"º de "+s.of+" "+md,up?"Subiu para a "+lgName(l.t)+". Placar zerado: nova semana, nova chance.":"Você segue na "+lgName(l.t)+". Na liga, ninguém cai: os 3 primeiros da semana sobem. Placar zerado.",null,up?"Bora subir mais":"Nova semana");}
function lgUpdate(){const m=lgMe();const l=lgSt();if(!m){lgUI(null);return;}const ws=weekStart(todayKey());
  const prev=l.snap&&l.snap.wk===ws?l.snap.pos:0;
  if(!l.snap||l.snap.wk!==ws||l.snap.pos!==m.pos||l.snap.of!==m.of||l.snap.xp!==m.xp){l.snap={wk:ws,pos:m.pos,of:m.of,xp:m.xp};save();}
  if(prev&&m.pos>prev){const a=m.rows[m.pos-2];if(a)toast("⚔️ "+a.n+" te passou no ranking. Faltam "+(a.xp-m.xp+1)+" XP.");}
  lgUI(m);}
function lgRival(m){if(m.pos===1){const b=m.rows.find(r=>r.n!==rankName());return b?"Você lidera a semana, "+(m.xp-b.xp)+" XP à frente de "+b.n+".":"Você lidera a semana.";}
  const a=m.rows.filter(r=>r.n!==rankName())[m.pos-2];if(!a)return "";const d=a.xp-m.xp+1;
  return "Faltam "+d+" XP para passar "+a.n+(d<=20?": 1 tarefa resolve.":".");}
function lgUI(m){let pill=$("lgPill");const dp=$("dayPill");
  if(!pill&&dp){pill=document.createElement("span");pill.className="pill lg";pill.id="lgPill";pill.setAttribute("role","button");pill.tabIndex=0;dp.after(pill);
    const go=()=>{goTab("prog");const p=$("rankPanel");if(p&&p.classList.contains("fold")&&!p.classList.contains("open")){const h=p.querySelector(".fhd");if(h)h.click();}setTimeout(()=>p&&p.scrollIntoView({block:"start"}),60);};
    pill.addEventListener("click",go);pill.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});}
  if(pill){pill.hidden=!m;if(m){pill.textContent="🏆 "+m.pos+"º";pill.title=lgRival(m);}}
  let ln=$("lgLine");const rp=$("rankPanel");if(!ln&&rp){ln=document.createElement("div");ln.id="lgLine";ln.className="lgline";const ol=$("rkList");if(ol)ol.before(ln);}
  if(ln){const l=lgSt();ln.hidden=!(prog.rank&&prog.rank.on);ln.innerHTML="";const b=document.createElement("b");b.textContent=lgName(l.t);const s=document.createElement("span");s.textContent=m?" · "+m.pos+"º de "+m.of+". "+lgRival(m):" · Os 3 primeiros da semana sobem de liga. Ninguém cai.";ln.append(b,s);}}
{const _rr=renderRankUI;renderRankUI=function(){_rr();try{lgClose();if(rankRows)lgUpdate();else lgUI(null);}catch(e){}};}
{const _rp=renderPills;renderPills=function(){_rp();try{const p=$("lgPill");if(p&&!p.hidden){const m=lgMe();if(m){p.textContent="🏆 "+m.pos+"º";p.title=lgRival(m);}}}catch(e){}};}
