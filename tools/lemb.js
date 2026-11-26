// Lembrete diário de 1 toque (recado da EVA 7200114707, fase 1): "Quer que o Sistema te chame todo dia?"
// Chips de horário (7h, 12h, 19h, 21h, outro). iPhone/PC: .ics com 1 evento DAILY e UID fixo (trocar o horário substitui).
// Android: Google Agenda já preenchido (recur DAILY). Grava só o horário e a resposta numa chave própria, fora do progresso.
// Nada sai do aparelho. Abre pelo "Ativar aviso diário" (#sysTip) e por Mais > Lembretes.
(function(){
  const KEY="asc-u-lemb"; // na raiz o gen.py --root troca para "ascensao-lemb"
  const CH=["07:00","12:00","19:00","21:00"];
  const ANDROID=/android/i.test(navigator.userAgent);
  const rd=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")||{};}catch(e){return {};}};
  const wr=o=>{try{localStorage.setItem(KEY,JSON.stringify(Object.assign(rd(),o)));}catch(e){}};
  const f2=m=>{m=((m%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");};
  const okH=h=>/^([01]\d|2[0-3]):[0-5]\d$/.test(h||"");
  function pre(){const s=rd();if(okH(s.h))return s.h;
    const w=(typeof cfg!=="undefined"&&cfg&&cfg.profile&&cfg.profile.wake)||"";
    if(okH(w)){const [h,m]=w.split(":").map(Number);return f2(h*60+m+30);}return "19:00";}
  const link=()=>location.href.split("#")[0];
  const TIT="⚔️ Ascension: sua missão de hoje",TXT="O Sistema te chama: abra o Ascension e faça a próxima missão.";
  function nextAt(h){const [hh,mm]=h.split(":").map(Number);const d=new Date();const x=new Date(d);x.setHours(hh,mm,0,0);if(x<=d)x.setDate(x.getDate()+1);return x;}
  const dt=x=>x.getFullYear()+String(x.getMonth()+1).padStart(2,"0")+String(x.getDate()).padStart(2,"0")+"T"+String(x.getHours()).padStart(2,"0")+String(x.getMinutes()).padStart(2,"0")+"00";
  const esc=s=>String(s).replace(/[\\;,]/g,m=>"\\"+m).replace(/\n/g,"\\n");
  function ics(h){const s=nextAt(h),e=new Date(s.getTime()+10*60000);
    return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Ascensao//PT-BR","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT","UID:asc-diario@ascensao","DTSTAMP:"+dt(new Date()),
      "DTSTART:"+dt(s),"DTEND:"+dt(e),"RRULE:FREQ=DAILY","SUMMARY:"+esc(TIT),"DESCRIPTION:"+esc(TXT+"\n"+link()),
      "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+esc(TIT),"TRIGGER:PT0M","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");}
  function gcal(h){const s=nextAt(h),e=new Date(s.getTime()+10*60000);
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(TIT)+"&dates="+dt(s)+"/"+dt(e)+"&ctz=America/Sao_Paulo&recur="+encodeURIComponent("RRULE:FREQ=DAILY")+"&details="+encodeURIComponent(TXT+"\n"+link());}
  const say=t=>{if(typeof toast==="function")toast(t);};
  function close(m,back){m.remove();document.removeEventListener("keydown",m._k,true);if(back&&back.isConnected)try{back.focus({preventScroll:true});}catch(e){}}
  function open(from){if(document.getElementById("lembOffer"))return;const back=document.activeElement;let pick=pre();
    const m=document.createElement("div");m.className="sysmodal lemb";m.id="lembOffer";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-labelledby","lembT");
    const c=document.createElement("div");c.className="card";
    const tg=document.createElement("div");tg.className="tag";tg.textContent="[ SISTEMA ] AVISO DIÁRIO";
    const h=document.createElement("h3");h.id="lembT";h.textContent="⏰ Quer que o Sistema te chame todo dia?";
    const p=document.createElement("p");p.className="sm";p.textContent="Escolha a hora. Vai pela agenda do celular, com o app fechado.";
    const row=document.createElement("div");row.className="lembchips";row.setAttribute("role","radiogroup");row.setAttribute("aria-label","Horário do aviso");
    const inp=document.createElement("input");inp.type="time";inp.id="lembOutro";inp.className="lembtime";inp.setAttribute("aria-label","Outro horário");inp.hidden=true;
    const chips=[];const mk=(v,lbl)=>{const b=document.createElement("button");b.type="button";b.className="lembchip";b.dataset.v=v;b.textContent=lbl;b.setAttribute("role","radio");chips.push(b);row.append(b);return b;};
    CH.forEach(v=>mk(v,String(+v.slice(0,2))+"h"));mk("outro","outro");
    function sel(v){const out=!CH.includes(v);chips.forEach(b=>{const on=out?b.dataset.v==="outro":b.dataset.v===v;b.classList.toggle("on",on);b.setAttribute("aria-checked",on?"true":"false");b.tabIndex=on?0:-1;});
      inp.hidden=!out;if(out&&okH(v))inp.value=v;pick=out?(okH(inp.value)?inp.value:""):v;}
    chips.forEach(b=>b.addEventListener("click",()=>{if(b.dataset.v==="outro"){sel(okH(inp.value)?inp.value:"outro");inp.focus();}else sel(b.dataset.v);}));
    inp.addEventListener("input",()=>{if(okH(inp.value))pick=inp.value;});
    const add=document.createElement("button");add.type="button";add.className="go";add.id="lembAdd";add.textContent="Adicionar à agenda";
    const no=document.createElement("button");no.type="button";no.className="link";no.id="lembNo";no.textContent="Agora não";
    add.addEventListener("click",()=>{if(!okH(pick)){inp.hidden=false;inp.focus();say("Escolha a hora do aviso.");return;}
      wr({h:pick,r:"sim",t:new Date().toISOString().slice(0,10)});
      if(ANDROID){window.open(gcal(pick),"_blank","noopener");say("Abriu o Google Agenda? Toque em Salvar. O Sistema te chama às "+pick.replace(":","h")+".");}
      else{const u=URL.createObjectURL(new Blob([ics(pick)],{type:"text/calendar;charset=utf-8"}));const a=document.createElement("a");a.href=u;a.download="aviso-diario-ascension.ics";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);
        say("Abriu a agenda? Toque em Adicionar. O Sistema te chama às "+pick.replace(":","h")+".");}
      close(m,back);if(typeof from==="function")from(true);});
    no.addEventListener("click",()=>{wr({r:"nao",t:new Date().toISOString().slice(0,10)});close(m,back);if(typeof from==="function")from(false);});
    const bt=document.createElement("div");bt.className="row lembbt";bt.append(add,no);
    c.append(tg,h,p,row,inp,bt);m.append(c);
    m.addEventListener("click",e=>{if(e.target===m)no.click();});
    m._k=e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();no.click();}
      else if((e.key==="ArrowRight"||e.key==="ArrowLeft")&&chips.includes(document.activeElement)){e.preventDefault();const i=chips.indexOf(document.activeElement);const n=chips[(i+(e.key==="ArrowRight"?1:chips.length-1))%chips.length];n.click();n.focus();}};
    document.addEventListener("keydown",m._k,true);
    document.body.append(m);sel(pick);
    // foco no chip escolhido (antes do foco automático das janelas do Sistema, que iria para o botão principal)
    const f=chips.find(b=>b.classList.contains("on"))||chips[0];try{f.focus({preventScroll:true});}catch(e){}}
  window.lembOffer=open;
  // Momento da oferta (fase 1): sozinha, logo depois da 1ª tarefa do dia 1 e uma vez no dia 2 (dias com tarefa de verdade).
  // Quem já disse "sim" não vê mais. Depois do dia 2 só pelo cartão ou por Mais > Lembretes. Espera as janelas do Sistema fecharem.
  const SYSTIP=KEY.indexOf("ascensao")===0?"ascensao-systip":"asc-u-systip";
  function real(k,e){if(!e||(e.kind!=="full"&&e.kind!=="min"))return false;if(e.q==="q_mit")return true;
    return ((cfg&&cfg.quests)||[]).some(q=>q.id===e.q)||((prog.extra&&prog.extra[k])||[]).some(q=>q.id===e.q);}
  function diaN(){const tk=todayKey();const log=(prog&&prog.log)||{};
    const ds=Object.keys(log).filter(k=>k<=tk&&(log[k]||[]).some(e=>real(k,e))).sort();
    return ds[ds.length-1]===tk?ds.length:0;}
  const busy=()=>{let q=0;try{q=sysQ.length;}catch(e){}return q>0||!!document.getElementById("lembOffer")||[...document.querySelectorAll(".sysmodal:not([hidden]),#levelup:not([hidden])")].some(m=>m.getClientRects().length);};
  let tries=0,tmr=0,calm=0; // calm: a tela precisa ficar livre por 2 checagens seguidas (o baú do dia abre logo depois da fila do Sistema)
  function auto(){tmr=0;try{if(!cfg||cfg.blank)return;const s=rd();if(s.r==="sim")return;let st="";try{st=localStorage.getItem(SYSTIP)||"";}catch(e){}if(st==="1")return;
    const n=diaN();if(n!==1&&n!==2)return;const a=s.a||{};if(a[n])return;if(n===2&&a[1]===todayKey())return;
    if(busy()){calm=0;if(++tries<40)tmr=setTimeout(auto,1500);return;}
    if(!calm){calm=1;tmr=setTimeout(auto,1200);return;}calm=0;tries=0;
    a[n]=todayKey();wr({a});
    open(ok=>{try{localStorage.setItem(SYSTIP,ok?"1":"0");}catch(e){}const t=document.getElementById("sysTip");if(t)t.hidden=true;});}catch(e){}}
  const later=ms=>{if(!tmr)tmr=setTimeout(auto,ms);};
  document.addEventListener("click",()=>{tries=0;later(1600);});
  setTimeout(()=>later(0),2500);
  // Mais > Lembretes: sempre dá para (re)escolher o horário
  const cal=document.getElementById("calPanel");
  if(cal&&!document.getElementById("lembMais")){const b=document.createElement("button");b.type="button";b.className="ghost";b.id="lembMais";b.textContent="⏰ Aviso diário do Sistema (1 evento)";
    b.addEventListener("click",()=>open());const ref=document.getElementById("calIcs");if(ref)ref.before(b);else cal.append(b);}
})();
