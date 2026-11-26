// ---------- Celular: 📅 na tarefa com horário e tarefas ligadas a apps (Duolingo, leitura, corrida, meditação) ----------
// 📅 abre o Google Agenda já preenchido (Android) ou baixa um .ics que o Calendário do iPhone abre. Repete nos dias da tarefa.
// Tarefa de app: botão para abrir o app (deep link com reserva na web) e 📸 print de prova (+5 XP, no máx. 3 por dia).
// O print NÃO sai do celular: vira miniatura guardada só hoje (asc-u-appfoto). O XP entra como "app:<id da tarefa>".
const AP_UA=navigator.userAgent,AP_IOS=/iphone|ipad|ipod/i.test(AP_UA)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1),AP_AND=/android/i.test(AP_UA);
const AP_XP=5,AP_MAX=3;
const AP_APPS=[
  {k:"duo",re:/duolingo|ingl[eê]s|espanhol|idioma|franc[eê]s|alem[aã]o|italiano/i,ic:"🦉",nm:"Duolingo",pkg:"com.duolingo",web:"https://www.duolingo.com/learn",hint:"Print da lição concluída"},
  {k:"run",re:/\bcorr(er|ida)\b|caminh(ar|ada)|pedalar|bike\b/i,ic:"🏃",nm:"Strava",pkg:"com.strava",web:"https://www.strava.com/",hint:"Print do app de corrida, da distância ou dos passos"},
  {k:"med",re:/medit|respira[çc][aã]o|mindful/i,ic:"🧘",nm:"",hint:"Print do app de meditação ou do timer"},
  {k:"ler",re:/\bler\b|leitura|livro|p[aá]ginas/i,ic:"📖",nm:"",hint:"Foto da página ou print do app de leitura"}];
function apApp(q){if(!q)return null;if(q.app)return AP_APPS.find(a=>a.k===q.app)||null;const t=String(q.title||"")+" "+String(q.minTitle||"");return AP_APPS.find(a=>a.re.test(t))||null;}
// horário da tarefa: "às 19h", "19:30", "quando der 14h" no gatilho ou no título; senão a hora em que ela libera (noite/almoço)
function apTime(q){if(!q)return null;const s=String(q.ifThen||"")+" "+String(q.title||"");
  let m=/(?:às|as|quando der|a partir das|até)\s+(\d{1,2})(?:[:h](\d{2}))?\s*h?/i.exec(s)||/\b(\d{1,2}):(\d{2})\b/.exec(s)||/\b(\d{1,2})h(\d{2})?\b/.exec(s);
  if(m){const h=+m[1],mi=+(m[2]||0);if(h>=5&&h<=23&&mi<60)return [h,mi];}
  const f=typeof qtFrom==="function"?qtFrom(q):null;if(f!=null&&f>=11)return [f,0];return null;}
function apMins(q){const m=/(\d{1,3})\s*min/i.exec(String(q.title||""));const n=m?+m[1]:15;return Math.max(5,Math.min(120,n));}
function apFirst(q,hm){const d=new Date();d.setHours(hm[0],hm[1],0,0);const days=q.days&&q.days.length?q.days:null;
  for(let i=0;i<8;i++){const dow=(d.getDay()+6)%7;if((!days||days.includes(dow))&&(i>0||d>new Date()-3600000))break;d.setDate(d.getDate()+1);}return d;}
function apRule(q){const days=q.days&&q.days.length&&q.days.length<7?q.days:null;return q.once?"":days?"RRULE:FREQ=WEEKLY;BYDAY="+days.map(x=>BYD[x]).join(","):"RRULE:FREQ=DAILY";}
function apNote(q){return (q.minTitle?"Mínimo: "+q.minTitle+"\n":"")+(q.ifThen?"Gatilho: "+q.ifThen+"\n":"")+location.href.split("#")[0];}
function apICS(q,hm){const s=apFirst(q,hm),e=new Date(s.getTime()+apMins(q)*60000),st=icsDT(new Date()),r=apRule(q);
  const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Ascensao//PT-BR","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT","UID:asc-q-"+String(q.id).replace(/[^\w-]/g,"")+"@ascensao","DTSTAMP:"+st,"DTSTART:"+icsDT(s),"DTEND:"+icsDT(e)];
  if(r)L.push(r);L.push("SUMMARY:"+icsEsc("Ascension: "+q.title),"DESCRIPTION:"+icsEsc(apNote(q)),"BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+icsEsc(q.title),"TRIGGER:PT0M","END:VALARM","END:VEVENT","END:VCALENDAR");return L.join("\r\n");}
function apTZ(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone||"America/Sao_Paulo";}catch(e){return "America/Sao_Paulo";}}
function apGcal(q,hm){const s=apFirst(q,hm),e=new Date(s.getTime()+apMins(q)*60000),r=apRule(q);
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent("Ascension: "+q.title)+"&dates="+icsDT(s)+"/"+icsDT(e)+"&ctz="+encodeURIComponent(apTZ())+(r?"&recur="+encodeURIComponent(r):"")+"&details="+encodeURIComponent(apNote(q));}
function apCal(q){const hm=apTime(q);if(!hm)return;try{prog.apCal=(prog.apCal||0)+1;save();}catch(e){}
  if(AP_IOS){const u=URL.createObjectURL(new Blob([apICS(q,hm)],{type:"text/calendar;charset=utf-8"}));const a=document.createElement("a");a.href=u;a.download="tarefa-ascension.ics";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);
    toast("Abriu o Calendário? Toque em Adicionar. O aviso vem na hora da tarefa.");}
  else{window.open(apGcal(q,hm),"_blank","noopener");toast("No Google Agenda, toque em Salvar. O aviso vem na hora da tarefa.");}}
// abrir o app: Android usa intent com o pacote (sem o app, cai na web); iPhone abre o link https, que o iOS entrega ao app instalado (sem o app, abre o site). Nada de esquema duolingo:// no iPhone: sem o app ele mostra "endereço inválido".
let apBack=null;
function apOpen(a,q){if(!a||!a.web)return;try{prog.apOpen=(+prog.apOpen||0)+1;save();}catch(e){}if(q)apBack={q:q.id,a,t:Date.now()};
  if(AP_AND&&a.pkg){location.href="intent://"+a.web.replace(/^https:\/\//,"")+"#Intent;scheme=https;package="+a.pkg+";S.browser_fallback_url="+encodeURIComponent(a.web)+";end";return;}
  window.open(a.web,"_blank","noopener");}
// voltou do app: aponta a tarefa e lembra do print
document.addEventListener("visibilitychange",()=>{if(document.hidden||!apBack)return;const o=apBack,el=(Date.now()-o.t)/1000;apBack=null;
  if(el<20||el>4*3600||(prog.log[todayKey()]||[]).some(e=>e.q===o.q))return;
  const c=document.querySelector('#quests .quest[data-q="'+CSS.escape(o.q)+'"]');if(c){c.classList.add("open","apback");c.scrollIntoView({block:"center",behavior:"smooth"});setTimeout(()=>c.classList.remove("apback"),4000);}
  toast(o.a.ic+" Voltou? Mande o print de prova (+"+AP_XP+" XP) ou toque em Feito.");try{haptic([20,40,20]);}catch(e){}});
// prints de prova: só no aparelho, só hoje
const AP_PH="asc-u-appfoto";
function apPhotos(){try{const o=JSON.parse(localStorage.getItem(AP_PH)||"{}");return o.d===todayKey()?o:{d:todayKey(),p:{}};}catch(e){return {d:todayKey(),p:{}};}}
function apSavePhoto(id,url){const o=apPhotos();o.p[id]=url;try{localStorage.setItem(AP_PH,JSON.stringify(o));}catch(e){}}
function apThumb(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,160/Math.max(im.width,im.height));const c=document.createElement("canvas");c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.6));};im.onerror=rej;im.src=r.result;};r.onerror=rej;r.readAsDataURL(file);});}
function apBonusToday(){return (prog.log[todayKey()]||[]).filter(e=>String(e.q).startsWith("app:")).length;}
function apHas(q){return (prog.log[todayKey()]||[]).some(e=>e.q==="app:"+q.id);}
async function apProof(q,file){if(!file)return;let url;try{url=await apThumb(file);}catch(e){toast("Não consegui ler a imagem.");return;}
  const tk=todayKey(),done=(prog.log[tk]||[]).some(e=>e.q===q.id);
  if(!done){toggle(q,"full");const mc=$("muChip");if(mc)mc.remove();if(!(prog.log[tk]||[]).some(e=>e.q===q.id))return;} // travada pelo horário: não marca nem dá XP
  apSavePhoto(q.id,url);try{haptic(15);}catch(e){}
  if(apHas(q)){render();toast("Print trocado.");return;}
  if(apBonusToday()>=AP_MAX){render();toast("Prova registrada. O bônus de print é de até "+AP_MAX+" por dia.");return;}
  addXP({q:"app:"+q.id,kind:"full",xp:AP_XP,stat:q.stat||"foco"},"📸 Prova registrada · +"+AP_XP+" XP");}
function apEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function apDecorate(){const box=$("quests");if(!box)return;
  for(const c of box.querySelectorAll(".quest[data-q]")){if(c.querySelector(".qapp"))continue;const q=questById(c.dataset.q);if(!q)continue;
    const a=apApp(q),hm=apTime(q);if(!a&&!hm)continue;
    const nm=c.querySelector(".t .tt, .t > div:not(.xp)");if(nm&&!c.querySelector(".t .tt")&&!q.ifThen){nm.classList.add("tt");nm.setAttribute("role","button");nm.tabIndex=0;nm.onclick=()=>c.classList.toggle("open");}
    if(a){const tg=c.querySelector(".t .tag");if(tg&&!tg.dataset.ap){tg.dataset.ap="1";tg.textContent=a.ic+" "+tg.textContent;}}
    const row=apEl("div","qapp");const done=c.classList.contains("done")||c.classList.contains("min");
    if(a&&a.web){const b=apEl("button","ghost apo",a.ic+" Abrir "+a.nm);b.type="button";b.onclick=ev=>{ev.stopPropagation();apOpen(a,q);};row.append(b);}
    if(a){const ph=apPhotos().p[q.id];
      if(ph&&done){const w=apEl("div","apok");const im=apEl("img");im.src=ph;im.alt="Seu print de prova";w.append(im,apEl("span","sm",apHas(q)?"Prova registrada · +"+AP_XP+" XP":"Prova registrada"));row.append(w);}
      else{const lb=apEl("label","ghost apf");const inp=apEl("input");inp.type="file";inp.accept="image/*";inp.setAttribute("aria-label","Enviar print de prova de "+q.title);
        inp.addEventListener("change",()=>{const f=inp.files&&inp.files[0];inp.value="";apProof(q,f);});lb.append(document.createTextNode("📸 Print +"+AP_XP+" XP"),inp);row.append(lb);}
      if(!(ph&&done))row.append(apEl("div","sm muted aph",(a.hint||"Print de prova")+". Marca a tarefa como feita. A imagem fica só no seu celular."));}
    if(hm){const b=apEl("button","ghost apc","📅 "+String(hm[0]).padStart(2,"0")+":"+String(hm[1]).padStart(2,"0")+" na agenda");b.type="button";b.setAttribute("aria-label","Pôr na agenda do celular às "+hm[0]+"h"+(hm[1]?String(hm[1]).padStart(2,"0"):""));b.onclick=ev=>{ev.stopPropagation();apCal(q);};row.append(b);}
    const ft=c.querySelector(".qtfoot");if(ft)ft.after(row);else c.append(row);}}
{const _r=render;render=function(){_r.apply(this,arguments);try{apDecorate();apAddUI();}catch(e){}};}
// desmarcou a tarefa: o bônus do print sai junto
{const _tg=toggle;toggle=function(q){const r=_tg.apply(this,arguments);try{const tk=todayKey(),L=prog.log[tk]||[];if(q&&!L.some(e=>e.q===q.id)&&L.some(e=>e.q==="app:"+q.id)){prog.log[tk]=L.filter(e=>e.q!=="app:"+q.id);save();render();}}catch(e){}return r;};}
// atalho: adicionar uma tarefa de app pronta (só onde dá para editar tarefas)
const AP_ADD=[{app:"duo",title:"Duolingo: 1 lição",minTitle:"1 lição curta",xp:15,stat:"mente"},{app:"ler",title:"Ler 10 páginas",minTitle:"2 páginas",xp:15,stat:"mente"},{app:"run",title:"Correr ou caminhar 20 min",minTitle:"10 min",xp:20,stat:"corpo"},{app:"med",title:"Meditar 5 min",minTitle:"1 min respirando",xp:10,stat:"foco"}];
function apAdd(t){if(!cfg||typeof edSave!=="function")return;const Q=(cfg.quests||[]).slice();if(Q.some(x=>x.app===t.app)){toast("Você já tem essa tarefa.");return;}
  Q.push(Object.assign({id:"ap_"+t.app+Date.now().toString(36)},t));cfg=Object.assign({},cfg,{quests:Q,blank:false});edSave();save();render();toast(t.title+": adicionada às tarefas de hoje (extra).");apAddUI();}
function apAddUI(){const ed=$("edNew");if(!ed||typeof edSave!=="function")return;let w=$("apAdd");
  // planilha ligada: as tarefas vêm dela (o que for criado aqui seria sobrescrito na próxima sincronização)
  let sy="";try{sy=SYNC;}catch(e){}if(sy){if(w)w.remove();return;}
  if(!w){w=apEl("div","apadd");w.id="apAdd";w.append(apEl("div","sm muted","Tarefas com app e prova por print:"));const r=apEl("div","row");r.id="apAddRow";w.append(r);const hd=ed.closest(".qhead")||ed;hd.parentNode.insertBefore(w,hd.nextSibling);}
  const r=$("apAddRow");r.textContent="";const Q=(cfg&&cfg.quests)||[];
  for(const t of AP_ADD){const a=AP_APPS.find(x=>x.k===t.app);const has=Q.some(x=>x.app===t.app);const b=apEl("button","ghost",a.ic+" "+(has?"✓ ":"")+t.title);b.type="button";b.disabled=has;b.onclick=()=>apAdd(t);r.append(b);}}
setTimeout(()=>{try{apAddUI();apDecorate();}catch(e){}},0);
