// ---------- Sugestões (sai pelo WhatsApp; fica salva no aparelho) ----------
$("fbSend").addEventListener("click",()=>{const t=$("fbText").value.trim();if(!t){$("fbMsg").textContent="Escreva a sugestão primeiro.";return;}
  prog.feedback=(prog.feedback||[]).concat([{t,d:new Date().toISOString()}]);save();
  const lv=levelOf(totalXP());const msg="💡 Sugestão para o app Ascensão\n\n"+t+"\n\n(nível "+lv+", "+activeDays()+" dias ativos, "+(cfg&&cfg.quests?cfg.quests.length:0)+" quests)";
  window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");$("fbText").value="";$("fbMsg").textContent="Valeu! Sugestão salva ("+prog.feedback.length+" no total).";});
$("fbQuick").addEventListener("click",()=>{goTab("mais");setTimeout(()=>$("fbText").focus(),60);});
// ---------- Dica de instalação (iPhone e Android fora da tela de início) ----------
const UA=navigator.userAgent,IOS=/iphone|ipad|ipod/i.test(UA),AND=/android/i.test(UA);let instEvt=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();instEvt=e;$("tipInstall").hidden=false;showTip();});
function showTip(){let off=false;try{off=localStorage.getItem("asc-u-tip")==="off";}catch(e){}
  const standalone=navigator.standalone||matchMedia("(display-mode: standalone)").matches;
  if(AND)$("tipText").innerHTML=instEvt?"Toque em <b>Instalar agora</b>. O app vai aparecer na tela do celular, como os outros.":"Abra no <b>Chrome</b>, toque nos <b>3 pontinhos ⋮</b> no canto de cima e depois em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.";
  $("installTip").hidden=!((IOS||AND)&&!standalone&&!off&&cfg&&!cfg.blank);}
$("tipInstall").addEventListener("click",async()=>{if(!instEvt)return;instEvt.prompt();try{await instEvt.userChoice;}catch(e){}instEvt=null;$("tipInstall").hidden=true;$("installTip").hidden=true;});
$("tipClose").addEventListener("click",()=>{try{localStorage.setItem("asc-u-tip","off");}catch(e){}$("installTip").hidden=true;});
// Android: o arquivo .ics não abre direto no Google Agenda; usar os botões do Google
if(AND){$("calIcs").hidden=true;$("calMsg").textContent="Toque em cada lembrete abaixo. Abre o Google Agenda já preenchido: é só tocar em Salvar.";}
setTimeout(showTip,0);