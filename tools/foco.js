
// ---------- Recursos do celular no foco: sala de foco, tela acesa, háptica, ruído marrom, Não Perturbe (iOS), badge, atalhos ----------
// Preferências do aparelho ficam numa chave própria (não mexe no progresso).
const DEV_KEY="asc-dev";let dev={};try{dev=JSON.parse(localStorage.getItem(DEV_KEY)||"{}")||{};}catch(e){dev={};}
function devSave(){try{localStorage.setItem(DEV_KEY,JSON.stringify(dev));}catch(e){}}
const F_IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const F_AND=/Android/i.test(navigator.userAgent);
const SC_NAME="Ascension Foco";
const SC_LINK="https://www.icloud.com/shortcuts/e1277fb50e5843498731ef5a9727f806"; // link do iCloud do atalho pronto (quando existir, vira 1 toque)
// Háptica: Android usa vibrate; iPhone (iOS 18+) usa o clique de um switch invisível.
function haptic(p){try{if(navigator.vibrate&&navigator.vibrate(p))return;}catch(e){}
  if(!F_IOS)return;try{const l=document.createElement("label");l.setAttribute("aria-hidden","true");l.style.display="none";const i=document.createElement("input");i.type="checkbox";i.setAttribute("switch","");l.append(i);document.head.append(l);l.click();l.remove();}catch(e){}}
// Tela acesa enquanto a sala de foco está aberta.
let wl=null;
async function wakeOn(){try{if("wakeLock" in navigator&&!document.hidden&&!wl){wl=await navigator.wakeLock.request("screen");wl.addEventListener("release",()=>{wl=null;});}}catch(e){wl=null;}}
function wakeOff(){try{if(wl)wl.release();}catch(e){}wl=null;}
// Ruído marrom gerado no aparelho (sem arquivo, sem internet).
let actx=null,noise=null;
function ac(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;if(!actx)actx=new AC();try{actx.resume();}catch(e){}return actx;}
function noiseOn(){if(noise)return true;try{const c=ac();if(!c)return false;try{if(navigator.audioSession)navigator.audioSession.type="playback";}catch(e){}
  const n=c.sampleRate*6,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0),f=Math.floor(c.sampleRate*.05);let last=0;
  for(let i=0;i<n;i++){last=(last+.02*(Math.random()*2-1))/1.02;d[i]=last*3.5;}
  for(let i=0;i<f;i++){const k=i/f;d[i]*=k;d[n-1-i]*=k;}
  const s=c.createBufferSource();s.buffer=b;s.loop=true;const g=c.createGain();g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.55,c.currentTime+1.2);s.connect(g);g.connect(c.destination);s.start();noise={s,g};return true;}catch(e){noise=null;return false;}}
function noiseOff(){if(!noise)return;const {s,g}=noise;noise=null;try{g.gain.cancelScheduledValues(actx.currentTime);g.gain.setValueAtTime(g.gain.value,actx.currentTime);g.gain.linearRampToValueAtTime(0,actx.currentTime+.5);setTimeout(()=>{try{s.stop();}catch(e){}},600);}catch(e){}}
function chime(){try{const c=ac();if(!c)return;try{if(navigator.audioSession&&!noise)navigator.audioSession.type="ambient";}catch(e){}
  [[880,0],[1320,.18]].forEach(([hz,t])=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=hz;g.gain.setValueAtTime(0,c.currentTime+t);g.gain.linearRampToValueAtTime(.25,c.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t+.6);o.connect(g);g.connect(c.destination);o.start(c.currentTime+t);o.stop(c.currentTime+t+.65);});}catch(e){}}
function noiseUI(){const on=!!noise;for(const id of ["fNoise","froomNoise"]){const b=$(id);b.setAttribute("aria-pressed",on?"true":"false");}
  $("fNoise").textContent="🎧 Ruído marrom: "+(on?"ligado":"desligado");$("froomNoise").textContent=on?"🔇 Ruído":"🎧 Ruído";}
function noiseToggle(){if(noise){noiseOff();dev.noise=false;}else{dev.noise=noiseOn();if(!dev.noise)toast("Este navegador não toca o ruído.");}devSave();noiseUI();haptic(10);}
$("fNoise").addEventListener("click",noiseToggle);$("froomNoise").addEventListener("click",noiseToggle);
// Sala de foco: tela preta com o tempo, apaga quando o celular fica virado para baixo.
const standalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
let downSince=0,wasDown=false;
function roomOpen(){const f=prog.focus;if(!(f&&f.end))return;$("froom").hidden=false;document.body.classList.add("inroom");
  const q=f.q&&todaysQuests().find(x=>x.id===f.q);$("froomQ").textContent=q?q.title:"Foco livre";
  $("froomMsg").textContent=F_IOS?"Bloqueie a tela ou deixe aberto: o tempo segue igual.":"Vire o celular para baixo. A tela apaga e o tempo segue.";
  wakeOn();fxTick();
  if(!standalone()&&!F_IOS&&document.documentElement.requestFullscreen&&!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{});}
function roomClose(){$("froom").hidden=true;$("froomBlack").hidden=true;document.body.classList.remove("inroom");wakeOff();
  try{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});}catch(e){}}
function darkOn(){$("froomBlack").hidden=false;}
function darkOff(){$("froomBlack").hidden=true;}
$("froomOut").addEventListener("click",()=>{roomClose();toast("O foco continua contando. Toque no tempo para voltar à sala.");});
$("froomDark").addEventListener("click",darkOn);
$("froomBlack").addEventListener("click",darkOff);
$("timer").addEventListener("click",()=>{if(prog.focus&&prog.focus.end)roomOpen();});
window.addEventListener("deviceorientation",e=>{if($("froom").hidden||e.beta==null)return;const down=Math.abs(e.beta)>150;
  if(down){if(!downSince)downSince=Date.now();if(Date.now()-downSince>800&&$("froomBlack").hidden){darkOn();wasDown=true;haptic(8);}}
  else if(Math.abs(e.beta)<120){downSince=0;if(wasDown){wasDown=false;darkOff();const f=prog.focus;if(f&&f.end){const m=Math.max(1,Math.ceil((f.end-Date.now())/60000));$("froomMsg").textContent="Faltam "+m+" min. Pode virar de novo, o tempo segue.";}}}});
function fxTick(){const f=prog.focus;if(!(f&&f.end)||$("froom").hidden)return;$("froomT").textContent=fmt(f.end-Date.now());}
// iPhone: Não Perturbe pelo Atalho "Ascension Foco" (o app passa os minutos do bloco).
function runShortcut(min){location.href="shortcuts://run-shortcut?name="+encodeURIComponent(SC_NAME)+"&input=text&text="+min;}
function silenceUI(){$("fSilence").hidden=!F_IOS||!!dev.sc;$("fSilenceOn").hidden=!F_IOS||!dev.sc;$("fDroid").hidden=!F_AND;
  $("fScGet").hidden=!SC_LINK;$("fScSteps").hidden=!!SC_LINK;$("fScOk").textContent=SC_LINK?"2. Pronto, adicionei":"Pronto, criei";}
$("fSilence").addEventListener("click",()=>{$("fSc").hidden=false;$("fSilence").hidden=true;});
$("fScClose").addEventListener("click",()=>{$("fSc").hidden=true;silenceUI();});
$("fScGet").addEventListener("click",()=>{if(!SC_LINK)return;const w=window.open(SC_LINK,"_blank");if(!w)location.href=SC_LINK;});
$("fScTest").addEventListener("click",()=>runShortcut(1));
$("fScOk").addEventListener("click",()=>{dev.sc=true;devSave();$("fSc").hidden=true;silenceUI();haptic([10,30,10]);toast("Pronto. No próximo foco o iPhone fica em silêncio.");});
$("fScOff").addEventListener("click",()=>{dev.sc=false;devSave();silenceUI();});
// Ganchos chamados pelo Modo foco
function fxStart(min){haptic([15,40,15]);if(dev.noise)noiseOn();noiseUI();roomOpen();if(F_IOS&&dev.sc)setTimeout(()=>runShortcut(min),250);}
function fxEnd(done){noiseOff();noiseUI();roomClose();if(done&&!document.hidden){chime();haptic([20,60,20,60,40]);}}
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!$("froom").hidden)wakeOn();});
// Número no ícone: quests principais que faltam hoje (onde o sistema deixa, sem pedir permissão).
function appBadge(){try{if(!navigator.setAppBadge)return;const tk=todayKey(),log=prog.log[tk]||[];
  const n=todaysQuests().filter(q=>q.main&&!log.some(e=>e.q===q.id)).length;(n?navigator.setAppBadge(n):navigator.clearAppBadge()).catch(()=>{});}catch(e){}}
// Convidar amigo pela folha de compartilhar do celular.
function invite(){const url=location.origin+location.pathname.replace(/(comecar\/)?(index\.html)?$/,"")+"convite/";
  const text="[ SINAL DETECTADO ] Poucos foram escolhidos. Você é um deles.";
  if(navigator.share){navigator.share({title:"Ascension",text,url}).catch(()=>{});return;}
  const t=text+" "+url;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast("Convite copiado. Cole no WhatsApp."),()=>toast(t));}
$("inviteBtn").addEventListener("click",invite);
noiseUI();silenceUI();
