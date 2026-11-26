// ---------- Check-in diário: abriu o app, ganha XP. Sequência de check-ins dá bônus (até +10). ----------
function ciStreak(){let n=0;const d=new Date();d.setDate(d.getDate()-1);for(let i=0;i<365;i++){if((prog.log[dkey(d)]||[]).some(e=>String(e.q).startsWith("checkin:")))n++;else break;d.setDate(d.getDate()-1);}return n;}
function dailyCheckin(){if(document.body.classList.contains("insm")){clearTimeout(dailyCheckin._t);dailyCheckin._t=setTimeout(dailyCheckin,3000);return;}if(!cfg||cfg.blank||($("onb")&&!$("onb").hidden)||document.getElementById("clsModal"))return;const tk=todayKey();if((prog.log[tk]||[]).some(e=>String(e.q).startsWith("checkin:")))return;
  if(dailyCheckin.shown===tk)return;dailyCheckin.shown=tk;const s=ciStreak()+1;const bonus=Math.min(10,(s-1)*2);
  // 1º dia de quem acabou de criar o jogo: o check-in entra sozinho, sem janela. "Você apareceu" logo depois de "Criar meu jogo"
  // era 1 toque a mais entre a pessoa e a 1ª missão (revisão noturna 26/11). Do 2º dia em diante a janela volta igual.
  if(s===1&&cfg.startDate===tk&&!Object.keys(prog.log||{}).some(k=>k!==tk&&(prog.log[k]||[]).length)){
    addXP({q:"checkin:"+tk,kind:"checkin",xp:10,stat:"foco",bonus:0,t:new Date().toISOString()},"Check-in do dia 1: +10 XP");
    if(typeof sendRank==="function")sendRank("checkin",true);return;}
  sysPop("CHECK-IN DIÁRIO",s>1?s+" dias de check-in":"Dia 1","Você apareceu, e isso já conta. +10 XP"+(bonus?" e +"+bonus+" de bônus pela sequência de check-ins.":". Volte amanhã para ganhar bônus."),()=>{
    if((prog.log[todayKey()]||[]).some(e=>String(e.q).startsWith("checkin:")))return;
    addXP({q:"checkin:"+todayKey(),kind:"checkin",xp:10,stat:"foco",bonus,t:new Date().toISOString()},"Check-in feito: +"+(10+bonus)+" XP");
    if(typeof sendRank==="function")sendRank("checkin",true);},"Fazer check-in");}
