// ---------- Foco em dupla: chame um amigo para um bloco de 25 min no MESMO horário (contagem compartilhada) ----------
// Canal: o mesmo da dupla do desafio (linha K, tools/duo.js): fd-HHMM (convite para começar às HH:MM), fda-HHMM (aceite), fdk-HHMM (terminou).
// Só amigo ou aliado do Esquadrão, só hoje, 1 foco em dupla por dia, no máximo 3 convites recebidos por dia, ninguém com até 13 anos.
// Os dois terminaram: +FD_XP para cada um (entrada "fd:<dia>"). Grava só prog.fd. Gancho público: window.fdStart() abre a escolha do amigo.
const FD_XP=10,FD_LEAD=2;
function fdOn(){try{return typeof duoOn==="function"&&duoOn()&&typeof sqiPost==="function";}catch(e){return false;}}
function fdSt(){const td=todayKey();let o=prog.fd&&typeof prog.fd==="object"?prog.fd:null;if(!o||o.d!==td){o={d:td,w:"",s:"",hm:"",me:0,pa:0,paid:0,go:0,seen:{},ask:0};prog.fd=o;}o.seen=o.seen||{};return o;}
function fdEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function fdAt(hm){const d=new Date();d.setHours(+hm.slice(0,2),+hm.slice(2),0,0);return d.getTime();}
function fdHM(ms){const d=new Date(ms);return String(d.getHours()).padStart(2,"0")+String(d.getMinutes()).padStart(2,"0");}
const fdShow=hm=>hm.slice(0,2)+":"+hm.slice(2);
function fdSheet(){let m=$("fdSheet");if(!m){m=fdEl("div","smsheet");m.id="fdSheet";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Foco em dupla");document.body.append(m);}
  m.textContent="";m.hidden=false;const c=fdEl("div","smcard");m.append(c);c.append(fdEl("div","smtag","[ SISTEMA ] FOCO EM DUPLA"));
  const x=fdEl("button","smx","✕");x.type="button";x.setAttribute("aria-label","Fechar");x.onclick=()=>{m.hidden=true;};m.append(x);return c;}
// escolher o amigo
function fdStart(){if(!fdOn()){toast("Entre no ranking e adicione um amigo em Amigos para focar em dupla.");return;}const o=fdSt();
  if(o.w){fdStatus();return;}const pals=duoPals();const c=fdSheet();
  if(!pals.length){c.append(fdEl("h3","smh","Ninguém na guilda ainda"),fdEl("p","sm","Adicione um amigo na aba Amigos e chame ele para focar junto."));return;}
  const hm=fdHM(Math.ceil((Date.now()+FD_LEAD*60000)/60000)*60000);
  c.append(fdEl("h3","smh","Quem foca com você?"),fdEl("p","sm","Os dois começam um bloco de 25 min às "+fdShow(hm)+". Terminaram os dois: +"+FD_XP+" XP para cada."));
  const ch=fdEl("div","duochips");for(const n of pals.slice(0,12)){const b=fdEl("button","chip","+ "+n);b.type="button";b.onclick=()=>fdInvite(n,hm);ch.append(b);}c.append(ch);}
window.fdStart=fdStart;
function fdInvite(n,hm){if(!fdOn()||!duoPal(n))return;const o=fdSt();if(o.w)return;Object.assign(o,{w:n,s:"sent",hm,me:0,pa:0,go:0});save();
  sqiPost(["K",rankName(),n,"fd-"+hm,sqiDk()]);try{haptic([12,30,12]);}catch(e){}$("fdSheet").hidden=true;toast("🤝 Convite enviado para "+n+". Começa às "+fdShow(hm)+".");fdBadge();}
function fdStatus(){const o=fdSt();const c=fdSheet();c.append(fdEl("h3","smh","🤝 Dupla com "+o.w),
  fdEl("p","sm",o.paid?"Foco em dupla completo hoje. +"+FD_XP+" XP para cada.":(o.s==="sent"?"Esperando "+o.w+" aceitar. ":"Combinado. ")+"Começa às "+fdShow(o.hm)+". "+(o.me?"✓ você":"… você")+" · "+(o.pa?"✓ ":"… ")+o.w));}
// convite recebido
function fdAsk(n,hm){const c=fdSheet();c.append(fdEl("h3","smh",n+" te chamou para focar junto"),fdEl("p","sm","Bloco de 25 min às "+fdShow(hm)+". Terminaram os dois: +"+FD_XP+" XP para cada."));
  const ok=fdEl("button","go smgo","Aceitar");ok.type="button";ok.onclick=()=>{const o=fdSt();if(!o.w){Object.assign(o,{w:n,s:"on",hm,me:0,pa:0,go:0});save();sqiPost(["K",rankName(),n,"fda-"+hm,sqiDk()]);}
    $("fdSheet").hidden=true;toast("🤝 Combinado: foco às "+fdShow(hm)+".");fdBadge();};
  const no=fdEl("button","link","Agora não");no.type="button";no.onclick=()=>{$("fdSheet").hidden=true;};c.append(ok,no);setTimeout(()=>ok.focus(),60);}
function fdCheck(){if(!fdOn()||typeof sqInvRows==="undefined")return;const me=duoN(rankName()),o=fdSt(),dk=sqiDk();let ch=false;
  for(const r of sqInvRows){if(r.k!=="K"||duoN(r.b)!==me||!r.a||String(r.d).replace(/\D/g,"")!==dk)continue;const m=/^fd(a|k)?-(\d{4})$/.exec(String(r.s));if(!m)continue;const kind=m[1]||"",hm=m[2];
    if(o.w&&duoN(r.a)===duoN(o.w)&&o.hm===hm){if(kind==="a"&&o.s==="sent"){o.s="on";ch=true;toast("🤝 "+o.w+" topou o foco das "+fdShow(hm)+".");}
      if(kind==="k"&&!o.pa){o.pa=1;ch=true;if(o.s==="sent")o.s="on";toast("🤝 "+o.w+" terminou o bloco."+(o.me?"":" Segura aí, falta você."));}}
    else if(!kind&&!o.w&&duoPal(r.a)&&fdAt(hm)+5*60000>Date.now()){const key=duoN(r.a)+":"+hm;if(o.seen[key]||o.ask>=3)continue;
      if(($("fdSheet")&&!$("fdSheet").hidden)||[...document.querySelectorAll(".sysmodal")].some(x=>x.getClientRects().length)||(prog.focus&&prog.focus.end))continue;
      o.seen[key]=1;o.ask++;ch=true;fdAsk(r.a,hm);break;}}
  if(ch){save();fdPay();fdBadge();}}
// na hora combinada o bloco começa sozinho (até 5 min de atraso)
function fdTick(){try{const o=prog.fd;if(o&&o.d===todayKey()&&o.w)fdBadge();if(!o||o.d!==todayKey()||!o.w||o.go||o.s!=="on")return;const at=fdAt(o.hm),now=Date.now();if(now<at)return fdBadge();
  o.go=1;save();if(now>at+5*60000){toast("🤝 O foco em dupla das "+fdShow(o.hm)+" já começou. Comece um bloco quando der.");return;}
  if(!(prog.focus&&prog.focus.end)){if(typeof goTab==="function")try{goTab("foco");}catch(e){}startFocus(25);prog.focus.fd=1;save();toast("🤝 Foco em dupla com "+o.w+": valendo!");}}catch(e){}}
function fdPay(){const o=fdSt();if(!(o.me&&o.pa)||o.paid)return;const td=todayKey();if((prog.log[td]||[]).some(e=>e.q==="fd:"+td)){o.paid=1;save();return;}o.paid=1;
  addXP({q:"fd:"+td,kind:"duo",xp:FD_XP,stat:"foco",bonus:0},"🤝 Foco em dupla completo: +"+FD_XP+" XP");}
// selo e contagem compartilhada na sala de foco
function fdBadge(){const o=prog.fd;let b=$("fdBadge");const fq=$("froomQ");
  if(!o||o.d!==todayKey()||!o.w){if(b)b.remove();return;}
  if(fq&&!b){b=fdEl("div","fdbadge");b.id="fdBadge";fq.after(b);}if(!b)return;
  const left=fdAt(o.hm)-Date.now();b.textContent="🤝 "+o.w+(o.paid?" · dupla completa ✓":left>0?" · começa em "+Math.ceil(left/60000)+" min":" · "+(o.me?"✓ você":"… você")+" · "+(o.pa?"✓ ":"… ")+o.w);}
{const _ff=finishFocus;finishFocus=function(){const f=prog.focus;const was=!!(f&&f.fd);const r=_ff.apply(this,arguments);
  try{const o=prog.fd;if(was&&o&&o.d===todayKey()&&o.w&&!o.me){o.me=1;save();if(fdOn())sqiPost(["K",rankName(),o.w,"fdk-"+o.hm,sqiDk()]);fdPay();fdBadge();}}catch(e){}return r;};}
if(typeof sqiCheck==="function"){const _ck=sqiCheck;sqiCheck=function(){_ck.apply(this,arguments);try{fdCheck();}catch(e){}};}
// botão na aba Foco, logo abaixo de "Focar na missão"
{const _fz=typeof fzUI==="function"?fzUI:null;if(_fz)fzUI=function(){_fz.apply(this,arguments);try{const t=$("fzTop");if(t&&!t.hidden&&fdOn()&&!t.querySelector(".fdgo")){const o=prog.fd&&prog.fd.d===todayKey()&&prog.fd.w?prog.fd:null;
  const b=fdEl("button","ghost fdgo",o?"🤝 Dupla com "+o.w+(o.paid?" ✓":" · "+fdShow(o.hm)):"🤝 Focar em dupla com um amigo");b.type="button";b.onclick=fdStart;t.append(b);}}catch(e){}};}
setInterval(fdTick,5000);setTimeout(()=>{fdTick();fdBadge();},1500);
