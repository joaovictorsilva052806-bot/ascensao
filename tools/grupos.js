// ---------- Várias turmas (igreja, família, trabalho...) + ranking semanal em destaque ----------
// Turma = grupo de amigos que você organiza. Tudo fica neste aparelho: o canal público (F/G/K) não muda e nada novo sai do celular.
// Só ADICIONA prog.turmas = {l:[{id,n,e,c,m:[apelidos]}], cur:id, hx:"AAAA-MM-DD"}.
// Migração: quem já joga ganha a turma "Minha turma" com todos os amigos de hoje e o mesmo link de convite (links já enviados continuam valendo).
// Link por turma: ...?amigo=APELIDO&c=CÓDIGO-DA-TURMA&t=NOME. Quem entra vira amigo (mesma assinatura do card.js) e cai na turma certa dos dois lados.
// LGPD: até 13 anos, nada disso aparece. 14-17 (e idade não informada no /comecar) só entram no ranking com apelido e "meu responsável autorizou".
const GT_EM=["⭐","⛪","🏠","⚽","🎓","💼","🎮","💪","🎸","❤️"];
const GT_MAX=12;
const gtN=v=>String(v||"").trim().toLowerCase();
const gtClean=v=>String(v||"").replace(/[|,;"<>\n\r]/g,"").replace(/\s+/g," ").trim().slice(0,20);
function gtEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function gtCode(){const a=new Uint8Array(8);crypto.getRandomValues(a);return [...a].map(x=>(x%36).toString(36)).join("");}
function gtSt(){let g=prog.turmas;
  if(!g||typeof g!=="object"||!Array.isArray(g.l)||!g.l.length){let fr=[];try{fr=frSt().l.slice();}catch(e){}
    g=prog.turmas={l:[{id:"t0",n:"Minha turma",e:"⭐",c:"",m:fr}],cur:"t0"};save();}
  for(const t of g.l){t.m=Array.isArray(t.m)?t.m:[];t.n=gtClean(t.n)||"Turma";if(!GT_EM.includes(t.e))t.e="⭐";}
  if(!g.l.some(t=>t.id===g.cur))g.cur=g.l[0].id;return g;}
function gtCur(){const g=gtSt();return g.l.find(t=>t.id===g.cur)||g.l[0];}
function gtByName(n){return gtSt().l.find(t=>gtN(t.n)===gtN(n));}
// amigo novo que ainda não está em nenhuma turma entra na turma aberta (ou na turma do link pelo qual entrou)
function gtPendGet(){try{return JSON.parse(localStorage.getItem("asc-amigo-t")||"null");}catch(e){return null;}}
function gtSync(){const g=gtSt();let fr=[];try{fr=frSt().l;}catch(e){return;}let ch=false;const has=n=>fr.some(x=>gtN(x)===gtN(n));
  for(const t of g.l){const k=t.m.filter(has);if(k.length!==t.m.length){t.m=k;ch=true;}}
  const pd=gtPendGet();
  for(const n of fr){if(g.l.some(t=>t.m.some(x=>gtN(x)===gtN(n))))continue;let t=gtCur();
    if(pd&&gtN(pd.a)===gtN(n)&&pd.t){t=gtByName(pd.t);if(!t&&g.l.length<GT_MAX){t={id:"t"+Date.now().toString(36),n:gtClean(pd.t),e:"⭐",c:"",m:[]};g.l.push(t);}t=t||gtCur();
      try{localStorage.removeItem("asc-amigo-t");}catch(e){}setTimeout(()=>toast("🤝 "+n+" entrou na turma "+t.n+"."),1800);}
    t.m.push(n);ch=true;}
  if(ch)save();}
// a lista "turma" da aba Amigos passa a ser a turma escolhida
tmGroup=function(){try{gtSync();}catch(e){}const t=gtCur();return t.m.map(n=>frRow(n));};
tmGroupName=function(){const t=gtCur();return t.e+" Turma";};
// --- link de convite por turma ---
{const _cl=cdLink;cdLink=function(){const u=_cl();if(!u)return u;const t=gtCur();if(t.id==="t0"&&!t.c)return u;
  if(!t.c){t.c=gtCode();save();}return u.replace(/&c=[a-z0-9]*/,"&c="+t.c)+"&t="+encodeURIComponent(t.n);};}
(function(){try{const u=new URLSearchParams(location.search);const t=gtClean(u.get("t")||"");if(!u.has("t"))return;
  const a=localStorage.getItem("asc-amigo")||"";if(t&&a)localStorage.setItem("asc-amigo-t",JSON.stringify({a,t}));
  u.delete("t");history.replaceState(null,"",location.pathname+(u.toString()?"?"+u:""));}catch(e){}})();
// lado de quem convidou: quem entrou pelo link de uma turma vira amigo e cai nela
let gtBusy=false;
async function gtInbox(){const me=rankName();if(gtBusy||!me||typeof sqInvRows==="undefined"||!tmOn())return;const g=gtSt();const T=g.l.filter(t=>t.c&&t.id!=="t0");if(!T.length)return;
  gtBusy=true;let ch=false;try{const f=frSt();
    for(const r of sqInvRows){if(r.k!=="F"||gtN(r.b)!==gtN(me)||!r.a||frHas(r.a)||!/^cv[0-9a-f]{12}$/.test(r.s))continue;
      for(const t of T){let ok=false;try{ok=r.s===await cdSig(t.c,r.a);}catch(e){}if(!ok||frHas(r.a))continue;
        f.l.push(r.a);delete f.pend[r.a];if(!t.m.some(x=>gtN(x)===gtN(r.a)))t.m.push(r.a);sqiPost(["G",me,r.a,"",sqiDk()]);ch=true;
        tmFeedAdd("conv",r.a,"🤝 "+r.a+" entrou pelo link da turma "+t.n);try{cdBadge(1);}catch(e){}toast("🤝 "+r.a+" entrou na turma "+t.n+". Agora são amigos!");break;}}}
  finally{gtBusy=false;}if(ch){save();try{frUI();tmUI();}catch(e){}}}
{const _ck=sqiCheck;sqiCheck=function(){gtInbox().catch(()=>{});_ck.apply(this,arguments);};}
// --- criar, editar e trocar de turma ---
function gtGo(id){const g=gtSt();g.cur=id;try{tmSt().view="turma";}catch(e){}save();try{haptic([8]);}catch(e){}tmUI();}
function gtSheet(id){const g=gtSt();const novo=!id;const t=novo?{id:"",n:"",e:GT_EM[g.l.length%GT_EM.length],c:"",m:[]}:g.l.find(x=>x.id===id);if(!t)return;
  let fr=[];try{fr=frSt().l.slice();}catch(e){}
  const m=gtEl("div","sysmodal gtmodal");m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label",novo?"Nova turma":"Editar turma");
  const c=gtEl("div","card gtcard");c.append(gtEl("div","tag",novo?"[ SISTEMA ] NOVA TURMA":"[ SISTEMA ] EDITAR TURMA"));
  const close=()=>{m.remove();};m.addEventListener("click",e=>{if(e.target===m)close();});
  const lb=gtEl("label","gtlbl","Nome da turma");const inp=gtEl("input","gtname");inp.maxLength=20;inp.autocomplete="off";inp.placeholder="Ex.: Igreja, Família, Trabalho";inp.value=t.n;lb.append(inp);c.append(lb);
  const ems=gtEl("div","gtems");ems.setAttribute("role","radiogroup");ems.setAttribute("aria-label","Ícone da turma");let em=t.e;
  for(const e of GT_EM){const b=gtEl("button",e===em?"on":"",e);b.type="button";b.setAttribute("role","radio");b.setAttribute("aria-checked",e===em?"true":"false");
    b.addEventListener("click",()=>{em=e;for(const x of ems.children){x.classList.toggle("on",x===b);x.setAttribute("aria-checked",x===b?"true":"false");}});ems.append(b);}
  c.append(ems);
  const sel=new Set(t.m.map(gtN));
  if(fr.length){c.append(gtEl("div","gtlbl","Quem está nesta turma"));const ul=gtEl("div","gtmem");
    for(const n of fr){const l=gtEl("label","gtchk");const x=gtEl("input");x.type="checkbox";x.checked=sel.has(gtN(n));x.addEventListener("change",()=>{if(x.checked)sel.add(gtN(n));else sel.delete(gtN(n));});
      const av=gtEl("span","gtav");av.innerHTML=tmAv((typeof sqPub!=="undefined"&&sqPub[gtN(n)]||{}).av,28);l.append(x,av,gtEl("span",null,n));ul.append(l);}c.append(ul);
    c.append(gtEl("p","sm muted","Um amigo pode estar em mais de uma turma. Para chamar gente nova, use o link da turma."));}
  else c.append(gtEl("p","sm muted","Ainda sem amigos para pôr aqui. Crie a turma e mande o link dela no grupo do WhatsApp: quem entrar cai direto nela."));
  const msg=gtEl("div","sm gtmsg");msg.setAttribute("role","status");c.append(msg);inp.addEventListener("input",()=>{msg.textContent="";});
  const row=gtEl("div","row");const ok=gtEl("button","go",novo?"Criar turma":"Salvar");ok.type="button";const no=gtEl("button","ghost","Cancelar");no.type="button";row.append(ok,no);c.append(row);
  ok.addEventListener("click",()=>{const n=gtClean(inp.value);if(!n){msg.textContent="Dê um nome para a turma.";inp.focus();return;}
    if(g.l.some(x=>x!==t&&gtN(x.n)===gtN(n))){msg.textContent="Já existe uma turma com esse nome.";inp.focus();return;}
    t.n=n;t.e=em;t.m=fr.filter(x=>sel.has(gtN(x)));
    if(novo){if(g.l.length>=GT_MAX){msg.textContent="Limite de "+GT_MAX+" turmas.";return;}t.id="t"+Date.now().toString(36);g.l.push(t);}
    g.cur=t.id;try{tmSt().view="turma";}catch(e){}save();close();tmUI();toast(novo?t.e+" Turma "+t.n+" criada. Mande o link dela no grupo.":"Turma salva.");});
  no.addEventListener("click",close);
  if(!novo&&g.l.length>1){const del=gtEl("button","link gtdel","Apagar esta turma");del.type="button";del.addEventListener("click",()=>{
      if(del.dataset.k!=="1"){del.dataset.k="1";del.textContent="Toque de novo para apagar (os amigos continuam seus amigos)";return;}
      g.l=g.l.filter(x=>x!==t);g.cur=g.l[0].id;save();close();tmUI();toast("Turma apagada. Os amigos continuam na sua lista.");});c.append(del);}
  m.append(c);document.body.append(m);setTimeout(()=>(novo?inp:ok).focus(),60);}
function gtBar(){const g=gtSt();const bar=gtEl("div","gtbar");bar.setAttribute("role","tablist");bar.setAttribute("aria-label","Suas turmas");
  for(const t of g.l){const on=t.id===g.cur;const b=gtEl("button","gtchip"+(on?" on":""));b.type="button";b.setAttribute("role","tab");b.setAttribute("aria-selected",on?"true":"false");b.dataset.t=t.id;
    b.append(gtEl("span","gte",t.e),gtEl("span","gtn",t.n),gtEl("span","gtc",String(t.m.length)));
    b.addEventListener("click",()=>{if(on)gtSheet(t.id);else gtGo(t.id);});bar.append(b);}
  if(g.l.length<GT_MAX){const nb=gtEl("button","gtchip gtnew","+ Nova turma");nb.type="button";nb.addEventListener("click",()=>gtSheet());bar.append(nb);}
  return bar;}
// pódio: os 3 primeiros em destaque, com avatar grande
function gtPodium(L,view){const top=L.slice(0,3);if(top.length<2)return null;const w=gtEl("div","gtpod");w.setAttribute("aria-label","Pódio da semana");
  const ord=top.length===3?[1,0,2]:[1,0];for(const i of ord){const r=top[i];if(!r)continue;const d=gtEl("div","gtp gtp"+(i+1)+(r.me?" me":""));
    const av=gtEl("div","gtpav");av.innerHTML=tmAv(r.av,i===0?72:56);d.append(gtEl("span","gtpm",["🥇","🥈","🥉"][i]),av,gtEl("b",null,r.n+(r.me?" (você)":"")),gtEl("span","gtpx",(view==="hoje"?"+":"")+(r.xp||0)+" XP"),gtEl("i","gtpb"));w.append(d);}
  return w;}
{const _tu=tmUI;tmUI=function(){_tu.apply(this,arguments);try{const p=$("tmPanel");if(!p||p.hidden||!tmOn())return;const s=tmSt();
  const hd=p.querySelector(".tmhd");if(hd&&!p.querySelector(".gtbar"))hd.after(gtBar());
  if(s.view==="turma"){const t=gtCur();const lk=p.querySelector(".cdlink > b");if(lk)lk.textContent="🔗 Link da turma "+t.e+" "+t.n;
    const em=p.querySelector(".tmempty p");if(em&&t.id!=="t0")em.textContent="Ninguém na turma "+t.n+" ainda. Mande o link dela no grupo ou toque na turma para pôr amigos que você já tem.";}
  const ol=p.querySelector(".tmlist");if(ol&&s.view!=="hoje"&&!p.querySelector(".gtpod")){const L=tmBoard(s.view);const pd=gtPodium(L,s.view);if(pd)ol.before(pd);}
  if(ol&&!p.querySelector(".gtcount")){const L=tmBoard(s.view);const me=L.findIndex(r=>r.me);if(L.length>1&&me>=0)ol.before(gtEl("div","gtcount",(me+1)+"º de "+L.length+(s.view==="geral"?" no ranking da semana":s.view==="hoje"?" hoje":" na turma")));}}catch(e){}};}
// --- destaque em Hoje: ranking da semana sempre à vista ---
function gtHero(){let h=$("gtHero");const st=$("dayPill");const host=st&&st.closest("section");if(!host)return;
  if(!h){h=gtEl("section","panel gthero");h.id="gtHero";h.dataset.tab="hoje";host.after(h);}
  // 1º uso (menos de 3 dias ativos): o cartão fica abaixo das tarefas de hoje, para não empurrar a 1ª missão
  {let nw=false;try{nw=activeDays()<3;}catch(e){}const qs=$("quests");const qh=qs&&qs.closest("section");const at=nw&&qh?qh:host;if(at.nextElementSibling!==h)at.after(h);}
  const kid=(()=>{try{return ageNow()==="kid";}catch(e){return false;}})();
  if(kid||!cfg||cfg.blank||document.body.classList.contains("onboarding")){h.hidden=true;return;}
  const g=gtSt();const on=tmOn();const pc=$("pingCard");
  if(!on&&((pc&&!pc.hidden)||(g.hx&&g.hx>=todayKey()))){h.hidden=true;return;}
  h.hidden=false;h.textContent="";let tier="";try{tier=lgName(lgSt().t);}catch(e){}
  const hd=gtEl("div","gthd");hd.append(gtEl("h2",null,"🏆 Ranking da semana"),gtEl("span","gtclock","⏳ fecha em "+tmLeft()));h.append(hd);
  const n=(rankRows||[]).length;
  const held=!on&&prog.rank&&prog.rank.hold&&!prog.rank.par;
  if(held){h.append(gtEl("p","gtlead","Seu nome saiu do ranking por enquanto."),gtEl("p","sm muted","Para quem tem 14 a 17 anos, agora o responsável precisa autorizar. Seu apelido, seus amigos e seu XP continuam guardados."));
    const row=gtEl("div","row");const b=gtEl("button","go","Confirmar autorização");b.type="button";b.addEventListener("click",()=>{joinRank("autorizou");setTimeout(gtHero,500);});
    const x=gtEl("button","link","Agora não");x.type="button";x.addEventListener("click",()=>{const d=new Date();d.setDate(d.getDate()+3);g.hx=dkey(d);save();h.hidden=true;});row.append(b,x);h.append(row);return;}
  if(!on){h.append(gtEl("p","gtlead",n?n+" pessoa"+(n>1?"s estão":" está")+" disputando a semana. Falta você.":"A semana está aberta. Seja o primeiro a pontuar."));
    const peek=gtEl("div","gtpeek");(rankRows||[]).slice(0,5).forEach((r,i)=>{const d=gtEl("span","gtpk");d.innerHTML=tmAv((typeof sqPub!=="undefined"&&sqPub[gtN(r.n)]||{}).av,34);d.title=r.n;d.style.zIndex=String(9-i);peek.append(d);});if(peek.children.length)h.append(peek);
    h.append(gtEl("p","sm muted",isMinor()?"Só aparece um apelido e o XP da semana. Nenhuma tarefa sai do seu celular.":"Aparece só o apelido (ou 1º nome) e o XP da semana. Os 3 primeiros sobem de liga."));
    const row=gtEl("div","row");const b=gtEl("button","go","Entrar no ranking");b.type="button";b.addEventListener("click",()=>{joinRank("destaque");setTimeout(gtHero,500);});
    const x=gtEl("button","link","Agora não");x.type="button";x.addEventListener("click",()=>{const d=new Date();d.setDate(d.getDate()+3);g.hx=dkey(d);save();h.hidden=true;});row.append(b,x);h.append(row);return;}
  let t=gtCur();let L=tmBoard("turma");let where="em "+t.e+" "+t.n;if(L.length<2){L=tmBoard("geral");where="no geral";}
  const i=L.findIndex(r=>r.me);
  const me=gtEl("div","gtme");me.append(gtEl("b","gtpos",i>=0?(i+1)+"º":"–"),gtEl("span",null,"de "+L.length+" "+where+(tier?" · "+tier:"")));h.append(me);
  const top=gtEl("ol","gttop");L.slice(0,3).forEach((r,k)=>{const li=gtEl("li",r.me?"me":"");const av=gtEl("span","gtav");av.innerHTML=tmAv(r.av,30);li.append(gtEl("span","gtm",["🥇","🥈","🥉"][k]),av,gtEl("span","gtnm",r.n+(r.me?" (você)":"")),gtEl("span","gtx",(r.xp||0)+" XP"));top.append(li);});
  if(i>2){const li=gtEl("li","me gtgap");const av=gtEl("span","gtav");av.innerHTML=tmAv(L[i].av,30);li.append(gtEl("span","gtm",(i+1)+"º"),av,gtEl("span","gtnm",L[i].n+" (você)"),gtEl("span","gtx",(L[i].xp||0)+" XP"));top.append(li);}
  h.append(top);
  let tip="";if(i>0){const a=L[i-1];const d=(a.xp||0)-(L[i].xp||0)+1;tip="Faltam "+d+" XP para passar "+a.n+(d<=20?": 1 tarefa resolve.":".");}else if(L.length>1)tip="Você lidera. Segura até domingo.";
  if(tip)h.append(gtEl("p","gtlead",tip));
  const row=gtEl("div","row");const b=gtEl("button","ghost","Ver ranking completo");b.type="button";b.addEventListener("click",()=>{try{tmSt().view=where==="no geral"?"geral":"turma";save();}catch(e){}goTab("amigos");try{loadRank();}catch(e){}tmUI();});
  const inv=gtEl("button","ghost","📨 Chamar alguém");inv.type="button";inv.addEventListener("click",()=>{try{cdInvite();}catch(e){}});row.append(b,inv);h.append(row);}
{const _rr=renderRankUI;renderRankUI=function(){_rr.apply(this,arguments);try{gtHero();}catch(e){}};}
{const _r=render;render=function(){_r.apply(this,arguments);try{gtHero();}catch(e){}};}
// --- LGPD: 14-17 (e idade não informada) só entram no ranking com apelido e autorização do responsável ---
{const _jr=joinRank;joinRank=function(){const args=arguments;let need=false;try{need=isMinor()&&ageNow()!=="kid"&&!(prog.rank&&prog.rank.on)&&!(prog.rank&&prog.rank.par);}catch(e){}
  if(!need)return _jr.apply(this,args);if($("gtAge"))return;const teen=ageNow()==="teen";
  const m=gtEl("div","sysmodal");m.id="gtAge";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Entrar no ranking");const c=gtEl("div","card gtcard");
  c.append(gtEl("div","tag","[ SISTEMA ] ENTRAR NO RANKING"),gtEl("h3",null,"Escolha como você aparece"),gtEl("p","sm","No ranking aparece só o apelido e o XP da semana. Nada de nome real, tarefa ou horário."));
  const lb=gtEl("label","gtlbl","Apelido (não use seu nome real)");const nk=gtEl("input","gtname");nk.maxLength=16;nk.autocomplete="off";nk.value=(prog.rank&&prog.rank.nick)||"";lb.append(nk);c.append(lb);
  const l2=gtEl("label","chk sm");const par=gtEl("input");par.type="checkbox";l2.append(par,document.createTextNode(teen?" Meu responsável autorizou eu aparecer no ranking":" Tenho 18 anos ou mais, ou meu responsável autorizou"));c.append(l2);
  const msg=gtEl("div","sm gtmsg");msg.setAttribute("role","status");c.append(msg);
  const row=gtEl("div","row");const ok=gtEl("button","go","Entrar");ok.type="button";const no=gtEl("button","ghost","Agora não");no.type="button";row.append(ok,no);c.append(row);
  ok.addEventListener("click",()=>{const n=cleanNick(nk.value);if(!n){msg.textContent="Escolha um apelido.";nk.focus();return;}if(!par.checked){msg.textContent=teen?"Para quem tem 14 a 17 anos, o responsável precisa autorizar.":"Marque a confirmação para entrar.";return;}
    prog.rank=Object.assign(prog.rank||{},{nick:n,par:new Date().toISOString().slice(0,10)});delete prog.rank.hold;save();m.remove();_jr.apply(null,args);try{tmUI();gtHero();}catch(e){}});
  no.addEventListener("click",()=>m.remove());m.append(c);document.body.append(m);setTimeout(()=>nk.focus(),60);};}

// LGPD: quem tem 14-17 (ou idade não informada no /comecar/) e já estava no ranking sem a autorização gravada sai da lista
// até confirmar. Nada se apaga: apelido, uid e amigos ficam; só para de enviar e mostra o aviso (prog.rank.hold = data).
function gtNeedHold(){try{const r=prog.rank;return !!(r&&r.on&&!r.par&&cfg&&!cfg.blank&&isMinor()&&ageNow()!=="kid");}catch(e){return false;}}
function gtHold(){if(!gtNeedHold())return false;prog.rank.on=false;prog.rank.hold=todayKey();save();return true;}
{const _sr=sendRank;sendRank=function(){if(gtHold()){try{renderRankUI();}catch(e){}return;}return _sr.apply(this,arguments);};}
{const _r=render;render=function(){try{gtHold();}catch(e){}return _r.apply(this,arguments);};}
setTimeout(()=>{try{gtSync();gtHero();}catch(e){}},0);
