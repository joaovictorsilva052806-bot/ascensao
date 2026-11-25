// ---------- Desafio em dupla: chame um amigo ou aliado do Esquadrão para o mesmo desafio relâmpago do dia ----------
// Canal: o mesmo formulário do ranking, linha K (como parabéns/cutucar): K|de|para|d-<desafio> (convite), da-<desafio> (aceite), dk-<desafio> (feito).
// Só vale de amigo ou aliado do Esquadrão, só no mesmo dia, 1 dupla por dia, no máximo 3 convites recebidos por dia. Quem tem até 13 anos não participa.
// Os dois fizeram: +DUO_XP para cada um (entrada "zap:duo:<dia>" no log). Só ADICIONA prog.duo = {d,id,w,s,me,pa,paid,seen,ask}.
const DUO_XP=10;
function duoSt(){const td=todayKey();let o=prog.duo&&typeof prog.duo==="object"?prog.duo:null;
  if(!o||o.d!==td){o={d:td,id:"",w:"",s:"",me:0,pa:0,paid:0,seen:{},ask:0};prog.duo=o;}o.seen=o.seen||{};return o;}
const duoN=v=>String(v||"").trim().toLowerCase();
function duoOn(){try{return ageNow()!=="kid"&&!!(prog.rank&&prog.rank.on)&&!!rankName()&&typeof sqiPost==="function";}catch(e){return false;}}
function duoPals(){const out=[];const add=n=>{if(n&&duoN(n)!==duoN(rankName())&&!out.some(x=>duoN(x)===duoN(n)))out.push(n);};
  try{for(const n of frSt().l)add(n);}catch(e){}try{const s=sqSt();if(s)for(const n of s.m)add(n);}catch(e){}return out;}
const duoPal=n=>duoPals().some(x=>duoN(x)===duoN(n));
function duoZap(id){try{return zapToday().find(z=>z.id===id)||null;}catch(e){return null;}}
function duoEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
let duoPick=false;
// bloco dentro da tela do desafio
function duoSlot(z){if(!duoOn())return null;const o=duoSt();const pals=duoPals();
  if(o.id&&o.id!==z.id)return null;
  const box=duoEl("div","duobox");
  if(o.id===z.id&&o.w){const st=o.s==="on"?(o.me?"✓ você":"… você")+" · "+(o.pa?"✓ ":"… ")+o.w:"Convite enviado para "+o.w+". Esperando o aceite.";
    box.append(duoEl("div","duost","🤝 Dupla com "+o.w),duoEl("div","sm muted",o.paid?"Dupla completa: +"+DUO_XP+" XP para cada um.":st+(o.s==="on"?" · os dois fazendo, +"+DUO_XP+" XP para cada.":"")));return box;}
  if(!pals.length){box.append(duoEl("div","sm muted","🤝 Adicione um amigo em Amigos para desafiar em dupla."));return box;}
  if(!duoPick){const b=duoEl("button","ghost duogo","🤝 Desafiar em dupla (+"+DUO_XP+" XP)");b.type="button";b.addEventListener("click",()=>{duoPick=true;zapDraw();const f=document.querySelector("#zapSheet .duochips button");if(f)f.focus();});box.append(b);return box;}
  box.append(duoEl("div","sm","Quem faz este desafio com você hoje?"));const ch=duoEl("div","duochips");
  for(const n of pals.slice(0,12)){const c=duoEl("button","chip","+ "+n);c.type="button";c.addEventListener("click",()=>duoInvite(n,z));ch.append(c);}
  const x=duoEl("button","link","Cancelar");x.type="button";x.addEventListener("click",()=>{duoPick=false;zapDraw();});box.append(ch,x);return box;}
function duoInvite(n,z){if(!duoOn()||!duoPal(n))return;const o=duoSt();if(o.id)return;
  Object.assign(o,{id:z.id,w:n,s:"sent",me:zapDone(z.id)?1:0,pa:0});duoPick=false;save();
  sqiPost(["K",rankName(),n,"d-"+z.id,sqiDk()]);if(o.me)sqiPost(["K",rankName(),n,"dk-"+z.id,sqiDk()]);
  try{haptic([12,30,12]);}catch(e){}toast("🤝 Convite enviado para "+n+". Aparece no app dele.");zapDraw();try{zapUI();}catch(e){}}
// terminou o desafio: avisa a dupla e confere o bônus
function duoDone(z){const o=duoSt();if(!o.id||o.id!==z.id||o.me)return;o.me=1;save();if(duoOn()&&o.w)sqiPost(["K",rankName(),o.w,"dk-"+z.id,sqiDk()]);duoPay();}
function duoPay(){const o=duoSt();if(!(o.me&&o.pa&&o.s==="on")||o.paid)return;const td=todayKey();
  if((prog.log[td]||[]).some(e=>String(e.q)==="zap:duo:"+td)){o.paid=1;save();return;}o.paid=1;
  addXP({q:"zap:duo:"+td,kind:"duo",xp:DUO_XP,stat:"corpo",bonus:0,t:new Date().toISOString()},"Dupla completa: +"+DUO_XP+" XP");
  sysPop("DUPLA","Desafio em dupla completo","Você e "+o.w+" fizeram o desafio do dia. +"+DUO_XP+" XP para cada um.",null,"Boa");}
// lê o canal: convites, aceites e "feito" da dupla (só de hoje, só de amigo/aliado)
function duoCheck(){if(!duoOn()||typeof sqInvRows==="undefined")return;const me=duoN(rankName());const o=duoSt();const dk=sqiDk();let ch=false;
  for(const r of sqInvRows){if(r.k!=="K"||duoN(r.b)!==me||!r.a||String(r.d).replace(/\D/g,"")!==dk)continue;const m=/^d(a|k)?-([a-z]+)$/.exec(String(r.s));if(!m)continue;
    const kind=m[1]||"",id=m[2];if(!duoZap(id))continue;
    if(o.w&&duoN(r.a)===duoN(o.w)&&o.id===id){
      if(kind==="a"&&o.s==="sent"){o.s="on";ch=true;toast("🤝 "+o.w+" aceitou a dupla. Bora!");}
      if(kind==="k"&&!o.pa){o.pa=1;ch=true;if(o.s==="sent")o.s="on";toast("🤝 "+o.w+" já fez o desafio da dupla."+(o.me?"":" Sua vez."));}}
    else if(!kind&&!o.id&&duoPal(r.a)){const key=duoN(r.a)+":"+id;if(o.seen[key]||o.ask>=3)continue;
      if($("duoModal")||[...document.querySelectorAll(".sysmodal")].some(x=>x.getClientRects().length)||document.body.classList.contains("inmission")||document.body.classList.contains("onboarding"))continue;
      o.seen[key]=1;o.ask++;ch=true;duoAsk(r.a,duoZap(id));break;}}
  if(ch){save();duoPay();try{zapUI();}catch(e){}}}
function duoAsk(n,z){const m=duoEl("div","sysmodal");m.id="duoModal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Convite para desafio em dupla");const c=duoEl("div","card");
  c.append(duoEl("div","tag","[ SISTEMA ] DESAFIO EM DUPLA"),duoEl("h3",null,n+" te chamou para uma dupla"),duoEl("p","sm",z.ic+" "+z.t+". Os dois fizeram hoje: +"+DUO_XP+" XP para cada um."));
  const row=duoEl("div","row");const ok=duoEl("button","go","Aceitar");ok.type="button";const no=duoEl("button","ghost","Agora não");no.type="button";row.append(ok,no);c.append(row);
  ok.addEventListener("click",()=>{const o=duoSt();if(!o.id){Object.assign(o,{id:z.id,w:n,s:"on",me:zapDone(z.id)?1:0,pa:0});save();sqiPost(["K",rankName(),n,"da-"+z.id,sqiDk()]);if(o.me)sqiPost(["K",rankName(),n,"dk-"+z.id,sqiDk()]);}
    m.remove();try{haptic([15,40,15]);}catch(e){}toast("🤝 Dupla com "+n+" aceita.");try{zapUI();}catch(e){}duoPay();});
  no.addEventListener("click",()=>{m.remove();});m.append(c);document.body.append(m);setTimeout(()=>ok.focus(),60);}
// selo 🤝 no cartão do desafio da dupla
{const _z=zapUI;zapUI=function(){_z.apply(this,arguments);try{const o=prog.duo;if(!o||o.d!==todayKey()||!o.id)return;const c=document.querySelector('#zapPanel .zapc[data-id="'+o.id+'"]');if(c&&!c.querySelector(".duo"))c.append(duoEl("span","duo",o.paid?"🤝✓":"🤝"));}catch(e){}};}
{const _ck=sqiCheck;sqiCheck=function(){_ck.apply(this,arguments);try{duoCheck();}catch(e){}};}
