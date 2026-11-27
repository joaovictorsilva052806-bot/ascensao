// ---------- Aviso diário com o app fechado (Web Push, fase 2 dos lembretes) ----------
// Desenho combinado no #22 (EVA 7203048765 + ATENA 7204199544, itens 1, 2 e 7), sem conta nova:
//   - Opt-in extra SÓ depois do "sim" do lembrete da agenda (tools/lemb.js) ou em Mais > Lembretes.
//   - Idade: menor de 14 (ou idade desconhecida) não vê; 14 a 17 só com "meu responsável autorizou"; o servidor confere de novo.
//   - Precisa do ranking ligado (token do jogador): é ele que prova ao servidor quem é quem.
//   - Guarda no servidor só o endereço de aviso deste aparelho e o horário (server/push.gs, planilha privada).
//   - 1 aviso por dia, só se a pessoa ainda não abriu o app no dia. "Parar avisos" apaga a inscrição na hora.
//   - iPhone: só com o app instalado na Tela de Início (iOS 16.4+). Fora disso, fica só a agenda.
//   - Quem manda é o robô do GitHub Actions (.github/workflows/lembrete-push.yml), a cada 15 min.
// Grava só "asc-u-push" (na raiz vira "ascensao-push"), fora do progresso.
(function(){
  const KEY="asc-u-push",LEMB="asc-u-lemb";
  // chave PÚBLICA VAPID (a privada fica só em GitHub Secrets). Vazia = aviso no celular desligado (ninguém vê a oferta).
  // Teste com outra chave: localStorage "asc-push-vapid" (só no próprio aparelho).
  const VAPID_FIXA="BDcNBzx_o8wholMvtDEJgLzCdxqQR8T7aRwW-it_semHYxGAMa3y_Nf68vz-qtBww3rae2KoG0hms1ClEwlxJXY";
  const VAPID=(()=>{try{const t=localStorage.getItem("asc-push-vapid")||"";if(/^B[A-Za-z0-9_-]{86}$/.test(t))return t;}catch(e){}return VAPID_FIXA;})();
  const URL_=()=>typeof MURAL_URL==="string"?MURAL_URL:"";
  const rd=k=>{try{return JSON.parse(localStorage.getItem(k)||"null")||{};}catch(e){return {};}};
  const st=()=>rd(KEY),wr=o=>{try{localStorage.setItem(KEY,JSON.stringify(Object.assign(st(),o)));}catch(e){}};
  const hora=()=>{const h=rd(LEMB).h;return /^([01]\d|2[0-3]):[0-5]\d$/.test(h||"")?h:"";};
  const hoje=()=>typeof todayKey==="function"?todayKey():new Date().toISOString().slice(0,10);
  const say=t=>{if(typeof toast==="function")toast(t);};
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone=()=>{try{return !!(navigator.standalone||matchMedia("(display-mode: standalone)").matches);}catch(e){return false;}};
  function supported(){return !!(window.isSecureContext&&"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window)&&(!ios||standalone());}
  function band(){let a="";try{a=ageNow();}catch(e){}if(!a&&typeof crOn==="function"&&crOn())return "adult";
    return a==="teen"?"teen":(a==="young"||a==="adult"||a==="senior")?"adult":"";}
  const tok=()=>{try{return typeof rkTok==="function"?rkTok():"";}catch(e){return "";}};
  const nick=()=>{try{return typeof rankName==="function"?rankName():"";}catch(e){return "";}};
  function eligible(){return !!VAPID&&supported()&&!!URL_()&&!!band()&&!!(typeof prog!=="undefined"&&prog.rank&&prog.rank.on)&&!!nick()&&!!tok();}
  async function api(a,o){const r=await fetch(URL_(),{method:"POST",body:JSON.stringify(Object.assign({a,n:nick(),tk:tok()},o||{})),credentials:"omit",redirect:"follow"});
    const j=await r.json();if(!j||j.ok===false)throw new Error((j&&j.err)||"erro");return j;}
  const b64u=s=>{const p="=".repeat((4-s.length%4)%4);const raw=atob((s+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(raw,c=>c.charCodeAt(0));};
  function swReady(){return Promise.race([navigator.serviceWorker.ready,new Promise((_,no)=>setTimeout(()=>no(new Error("sw")),8000))]);}
  async function subscribe(par){const reg=await swReady();let sub=await reg.pushManager.getSubscription();
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(VAPID)});
    const j=sub.toJSON();const k=j.keys||{};const h=hora()||"19:00";
    try{await api("reg",{band:band(),par:band()==="teen"?(par?1:0):0});await api("pw-sub",{ep:j.endpoint,p:k.p256dh,au:k.auth,h});}
    catch(e){try{await sub.unsubscribe();}catch(x){}throw e;}
    wr({on:1,h,ep:j.endpoint,seen:hoje(),t:hoje()});return h;}
  async function stop(quiet){const s=st();let ep=s.ep||"";
    try{const reg=await swReady();const sub=await reg.pushManager.getSubscription();if(sub){ep=sub.endpoint||ep;await sub.unsubscribe();}}catch(e){}
    try{if(tok())await api("pw-del",{ep});}catch(e){}
    wr({on:0,ep:"",off:hoje()});ui();if(!quiet)say("Avisos no celular desligados. Nada fica guardado.");}
  // --- janela de opt-in ---
  function close(m,back){m.remove();document.removeEventListener("keydown",m._k,true);if(back&&back.isConnected)try{back.focus({preventScroll:true});}catch(e){}}
  function offer(){if(document.getElementById("pwOffer")||!eligible())return;const back=document.activeElement;const teen=band()==="teen";const h=hora()||"19:00";
    const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;};
    const m=E("div","sysmodal pw");m.id="pwOffer";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-labelledby","pwT");
    const c=E("div","card");const h3=E("h3",null,"🔔 Quer o aviso direto no celular?");h3.id="pwT";
    c.append(E("div","tag","[ SISTEMA ] AVISO NO CELULAR"),h3,
      E("p","sm","Chega com o app fechado, às "+h.replace(":","h")+". Só chama se você ainda não abriu o app no dia."),
      E("p","sm muted","Guardamos só o endereço de aviso deste aparelho e o horário. Nada mais. Desliga quando quiser em Mais > Lembretes."));
    let chk=null;if(teen){const l=E("label","chk sm");chk=E("input");chk.type="checkbox";chk.id="pwPar";l.append(chk,document.createTextNode(" Meu responsável autorizou os avisos no celular"));c.append(l);}
    const msg=E("div","sm pwmsg");msg.setAttribute("role","status");
    const go=E("button","go","Ligar aviso");go.type="button";go.id="pwYes";const no=E("button","link","Agora não");no.type="button";no.id="pwNo";
    go.addEventListener("click",async()=>{if(teen&&!chk.checked){msg.textContent="Peça para o seu responsável autorizar e marque a caixa.";chk.focus();return;}
      go.disabled=true;msg.textContent="Ligando…";let perm="default";try{perm=await Notification.requestPermission();}catch(e){}
      if(perm!=="granted"){wr({asked:hoje(),r:"negou"});close(m,back);say("Sem permissão de aviso. A agenda continua valendo.");ui();return;}
      try{const hh=await subscribe(teen&&chk.checked);close(m,back);say("Pronto: o Sistema te chama às "+hh.replace(":","h")+", mesmo com o app fechado.");}
      catch(e){go.disabled=false;msg.textContent="Não deu para ligar agora ("+(e&&e.message||"erro")+"). Tente de novo mais tarde.";}
      ui();});
    no.addEventListener("click",()=>{wr({asked:hoje(),r:"nao"});close(m,back);ui();});
    const row=E("div","row pwbt");row.append(go,no);c.append(row,msg);m.append(c);
    m.addEventListener("click",e=>{if(e.target===m)no.click();});
    m._k=e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();no.click();}};document.addEventListener("keydown",m._k,true);
    document.body.append(m);try{go.focus({preventScroll:true});}catch(e){}}
  window.pwOffer=offer;
  // --- Mais > Lembretes: estado e liga/desliga ---
  function ui(){const cal=document.getElementById("calPanel");if(!cal)return;let w=document.getElementById("pwMais");
    const s=st();const show=s.on||eligible();if(!show){if(w)w.remove();return;}
    if(!w){w=document.createElement("div");w.id="pwMais";w.className="pwmais";const ref=document.getElementById("lembMais");if(ref)ref.after(w);else cal.append(w);}
    w.textContent="";const b=document.createElement("button");b.type="button";
    if(s.on){const t=document.createElement("div");t.className="sm";t.textContent="🔔 Aviso no celular ligado: "+(s.h||"").replace(":","h")+", só se você ainda não abriu o app.";
      b.className="link";b.id="pwStop";b.textContent="Parar avisos no celular";b.addEventListener("click",()=>stop());w.append(t,b);}
    else{b.className="ghost";b.id="pwOn";b.textContent="🔔 Aviso no celular (com o app fechado)";
      b.addEventListener("click",()=>{if(hora())offer();else if(typeof window.lembOffer==="function"){say("Primeiro escolha a hora do aviso.");window.lembOffer();}else offer();});w.append(b);}}
  // --- depois do "sim" do lembrete: oferece (1x por dia, no máximo 2 vezes no total); se já está ligado e a hora mudou, atualiza calado ---
  document.addEventListener("click",e=>{if(!e.target||!e.target.closest||!e.target.closest("#lembAdd"))return;
    setTimeout(async()=>{const l=rd(LEMB);if(l.r!=="sim"||!hora())return;const s=st();
      if(s.on){if(s.h!==hora()&&eligible()){try{const hh=await subscribe(true);say("Aviso no celular agora às "+hh.replace(":","h")+".");}catch(x){}ui();}return;}
      if(!eligible()||s.asked===hoje()||(s.n||0)>=2)return;wr({n:(s.n||0)+1});offer();},700);},true);
  // --- a cada abertura: marca "visto hoje" (1x por dia) e confere se a inscrição ainda vale ---
  async function boot(){const s=st();if(!s.on){ui();return;}
    if(!eligible()){await stop(true);return;}                         // saiu do ranking, mudou a idade, etc.
    try{if(Notification.permission==="denied"){await stop(true);return;}
      const reg=await swReady();const sub=await reg.pushManager.getSubscription();
      if(!sub||sub.endpoint!==s.ep){if(Notification.permission==="granted")await subscribe(true);else{await stop(true);return;}}
      else if(st().seen!==hoje()){await api("pw-seen");wr({seen:hoje()});}}catch(e){}
    ui();}
  if(navigator.serviceWorker)navigator.serviceWorker.addEventListener("message",e=>{if(e.data&&e.data.pw==="renew"&&st().on)subscribe(true).catch(()=>{});});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&st().on&&st().seen!==hoje())boot();});
  setTimeout(boot,2500);setTimeout(ui,0);
})();
