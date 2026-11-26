// ---------- Check-in diário: abriu o app, ganha XP. Sequência de check-ins dá bônus (até +10). ----------
function ciStreak(){let n=0;const d=new Date();d.setDate(d.getDate()-1);for(let i=0;i<365;i++){if((prog.log[dkey(d)]||[]).some(e=>String(e.q).startsWith("checkin:")))n++;else break;d.setDate(d.getDate()-1);}return n;}
function dailyCheckin(){if(document.body.classList.contains("insm")){clearTimeout(dailyCheckin._t);dailyCheckin._t=setTimeout(dailyCheckin,3000);return;}if(!cfg||cfg.blank||($("onb")&&!$("onb").hidden)||document.getElementById("clsModal"))return;const tk=todayKey();if((prog.log[tk]||[]).some(e=>String(e.q).startsWith("checkin:")))return;
  if(dailyCheckin.shown===tk)return;dailyCheckin.shown=tk;const s=ciStreak()+1;const bonus=Math.min(10,(s-1)*2);
  sysPop("CHECK-IN DIÁRIO",s>1?s+" dias de check-in":"Dia 1","Você apareceu, e isso já conta. +10 XP"+(bonus?" e +"+bonus+" de bônus pela sequência de check-ins.":". Volte amanhã para ganhar bônus."),()=>{
    if((prog.log[todayKey()]||[]).some(e=>String(e.q).startsWith("checkin:")))return;
    addXP({q:"checkin:"+todayKey(),kind:"checkin",xp:10,stat:"foco",bonus,t:new Date().toISOString()},"Check-in feito: +"+(10+bonus)+" XP");
    if(typeof sendRank==="function")sendRank("checkin",true);},"Fazer check-in");}
