// ---------- Beta: números anônimos com consentimento (LGPD). Nada sai sem o "sim". ----------
const BETA_KEY="asc-u-beta";
function betaGet(){try{return JSON.parse(localStorage.getItem(BETA_KEY)||"{}")||{};}catch(e){return {};}}
function betaSet(b){try{localStorage.setItem(BETA_KEY,JSON.stringify(b));}catch(e){}}
const betaAge=()=>(cfg&&cfg.profile&&cfg.profile.age)||"";
const betaKid=()=>betaAge()==="kid";
function betaId(){const b=betaGet();if(!b.id){const a=new Uint8Array(6);crypto.getRandomValues(a);b.id=[...a].map(x=>x.toString(16).padStart(2,"0")).join("");betaSet(b);}return b.id;}
function betaPost(parts){const v=["B"].concat(parts).map(x=>String(x==null?"":x).replace(/[|\n\r]/g," ")).join("|");
  try{fetch(RK_POST,{method:"POST",mode:"no-cors",keepalive:true,body:new URLSearchParams({"entry.807978446":v})}).catch(()=>{});}catch(e){}}
function betaTab(t){const b=betaGet();if(!b.on)return;const k=todayKey();b.tabs=b.tabs||{};b.tabs[k]=b.tabs[k]||{};b.tabs[k][t]=(b.tabs[k][t]||0)+1;
  for(const d in b.tabs)if(d<k&&Object.keys(b.tabs).length>3)delete b.tabs[d];betaSet(b);}
function betaDaily(){const b=betaGet();if(!b.on||betaKid()||!betaAge()||(betaAge()==="teen"&&!b.parent))return;const tk=todayKey();if(b.last===tk)return;
  const y=new Date();y.setDate(y.getDate()-1);const yk=dkey(y);const L=(prog.log[yk]||[]).filter(e=>!String(e.q).startsWith("ach:"));
  const ms=mainsFor(y);const mDone=ms.filter(q=>L.some(e=>e.q===q.id)).length;
  let act=0;const d=new Date();for(let i=1;i<=14;i++){d.setDate(d.getDate()-1);if((prog.log[dkey(d)]||[]).length)act++;}
  const P=(cfg&&cfg.profile)||{};const c=(prog.rpg&&prog.rpg.cls)||{};const tabs=(b.tabs&&b.tabs[yk])||{};
  const tabStr=Object.keys(tabs).map(k=>k+":"+tabs[k]).join(",");
  const days=cfg&&cfg.startDate?Math.round((new Date(tk)-new Date(cfg.startDate))/864e5):"";
  betaPost([b.id||betaId(),"dia",yk.replace(/-/g,""),P.age||"",P.occ||"",(c.style||"")+":"+(c.id||""),days,L.length,L.filter(e=>e.kind==="min").length,mDone+"/"+ms.length,levelOf(totalXP()),streakDays(),act,tabStr,(cfg.quests||[]).length]);
  b.last=tk;betaSet(b);}
function betaUI(){const b=betaGet(),kid=betaKid(),teen=betaAge()==="teen";
  $("betaParentRow").hidden=!teen||!!b.on;$("betaOn").hidden=!!b.on||kid;$("betaOff").hidden=!b.on;
  $("betaMsg").textContent=kid?"Para quem tem até 13 anos o envio fica desligado. Você pode usar tudo normalmente.":b.on?"Ligado. Obrigado por ajudar! Envio 1 vez por dia, só números.":"Desligado. Nada sai deste aparelho.";
  $("betaTip").hidden=!!(b.on||b.asked||kid||!cfg||cfg.blank);}
$("betaOn").addEventListener("click",()=>{if(betaKid())return;if(betaAge()==="teen"&&!$("betaParent").checked){$("betaMsg").textContent="Marque que seu responsável autorizou para ligar.";return;}
  const b=betaGet();b.on=true;b.asked=true;b.since=todayKey();b.parent=betaAge()==="teen"?1:0;betaSet(b);betaId();betaPost([betaGet().id,"optin",todayKey().replace(/-/g,""),betaAge(),(cfg.profile||{}).occ||""]);betaUI();toast("Obrigado! Envio anônimo ligado.");});
$("betaOff").addEventListener("click",()=>{const b=betaGet();if(b.on)betaPost([b.id,"optout",todayKey().replace(/-/g,"")]);b.on=false;b.asked=true;delete b.tabs;betaSet(b);betaUI();toast("Envio desligado. Nada mais sai deste aparelho.");});
$("betaTipYes").addEventListener("click",()=>{const b=betaGet();b.asked=true;betaSet(b);betaUI();goTab("mais");setTimeout(()=>{const p=$("betaPanel");p.querySelector("details").open=true;p.scrollIntoView({behavior:"smooth",block:"start"});},80);});
$("betaTipNo").addEventListener("click",()=>{const b=betaGet();b.asked=true;betaSet(b);betaUI();});
let betaRate=0;for(const x of $("betaRate").children)x.addEventListener("click",()=>{betaRate=+x.dataset.v;for(const y of $("betaRate").children)y.classList.toggle("on",y===x);});
$("betaSend").addEventListener("click",()=>{if(betaKid()){toast("Para até 13 anos, mande pelo WhatsApp com ajuda de um adulto.");return;}if(!betaRate){toast("Escolha uma carinha primeiro.");return;}
  {const b0=betaGet(),tp=(()=>{try{return JSON.parse(localStorage.getItem("asc-u-tele")||"{}")||{};}catch(e){return {};}})();if(!betaAge()||(betaAge()==="teen"&&!b0.parent&&!tp.parent)){toast("Para mandar a nota, ligue antes o envio anônimo (14 a 17 anos: com a autorização do responsável).");return;}}
  const t=$("betaText").value.trim().replace(/\S+@\S+/g,"[email]").replace(/\+?\d[\d\s().-]{7,}\d/g,"[número]").slice(0,280);
  const b=betaGet();const lr=b.rated||"";if(lr===todayKey()+":"+betaRate+":"+t){toast("Essa nota já foi enviada.");return;}
  betaPost([betaId(),"nota",todayKey().replace(/-/g,""),betaRate,betaAge(),t]);b.rated=todayKey()+":"+betaRate+":"+t;betaSet(b);$("betaText").value="";toast("Valeu! Nota enviada sem seu nome.");});
for(const bt of document.querySelectorAll("#tabbar button"))bt.addEventListener("click",()=>betaTab(bt.dataset.go));
