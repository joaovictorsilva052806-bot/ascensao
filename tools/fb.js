// ---------- Sugestões (sai pelo WhatsApp; fica salva no aparelho) ----------
$("fbSend").addEventListener("click",()=>{const t=$("fbText").value.trim();if(!t){$("fbMsg").textContent="Escreva a sugestão primeiro.";return;}
  prog.feedback=(prog.feedback||[]).concat([{t,d:new Date().toISOString()}]);save();
  const lv=levelOf(totalXP());const msg="💡 Sugestão para o app Ascensão\n\n"+t+"\n\n(nível "+lv+", "+activeDays()+" dias ativos, "+(cfg&&cfg.quests?cfg.quests.length:0)+" quests)";
  window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");$("fbText").value="";$("fbMsg").textContent="Valeu! Sugestão salva ("+prog.feedback.length+" no total).";});
$("fbQuick").addEventListener("click",()=>{goTab("mais");setTimeout(()=>$("fbText").focus(),60);});
// ---------- Dica de instalação (iPhone fora da tela de início) ----------
function showTip(){let off=false;try{off=localStorage.getItem("asc-u-tip")==="off";}catch(e){}
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent),standalone=navigator.standalone||matchMedia("(display-mode: standalone)").matches;
  $("installTip").hidden=!(ios&&!standalone&&!off&&cfg&&!cfg.blank);}
$("tipClose").addEventListener("click",()=>{try{localStorage.setItem("asc-u-tip","off");}catch(e){}$("installTip").hidden=true;});
setTimeout(showTip,0);
