// ---------- Card de jogador + convite pessoal + destaque da aba Amigos ----------
// Card estilo carta: avatar grande, classe, nível, posição, atributos, sequência e XP da semana.
// O amigo vê o seu card com os mesmos dados (só o que vai para a lista pública: apelido, nível, XP, sequência, avatar e atributos).
// Convite: link .../comecar/?amigo=APELIDO. Quem entra por ele e liga o ranking vira amigo dos dois lados sozinho
// (F|novo|quem convidou|conv+código|data; o app de quem convidou só aceita sozinho se o código for o dele). Só ADICIONA prog.turma.inv / .badge.
const CD_ST=[["foco","🎯","Foco"],["vendas","🏁",typeof STATS!=="undefined"?STATS.vendas:"Metas"],["mente","🧠","Mente"],["corpo","💪","Corpo"]];
const CD_URL="https://joaovictorsilva052806-bot.github.io/ascensao/comecar/";
function cdEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function cdMine(){let at="";try{at=avAttrs();}catch(e){}const m=tmMe();m.at=at;try{m.dz=avZapWeek();}catch(e){m.dz=0;}
  try{const r=rpgState();m.cls=r.cls?clsName(r.cls,m.lv):"";}catch(e){m.cls="";}return m;}
function cdOther(n){const r=(rankRows||[]).find(x=>tmN(x.n)===tmN(n));const p=(typeof sqPub!=="undefined"&&sqPub[tmN(n)])||{};
  const o=avParse(p.av||"");return {n,xp:r?r.xp:0,lv:r?r.lv:null,seq:p.seq||0,dz:p.dz||0,av:p.av||"",at:p.at||"",cls:o&&o.cls!=="x"?tmClsName(o.cls):"",on:!!r};}
function cdPos(n){const rows=tmBoard("geral");const i=rows.findIndex(r=>tmN(r.n)===tmN(n));const fr=tmBoard("turma");const j=fr.findIndex(r=>tmN(r.n)===tmN(n));
  return {g:i>=0?i+1:null,gof:rows.length,t:j>=0&&fr.length>1?j+1:null,tof:fr.length};}
function cdRank(lv){const R=[[1,"E"],[5,"D"],[10,"C"],[15,"B"],[20,"A"],[30,"S"]];let r="E";for(const [l,k] of R)if((lv||1)>=l)r=k;return r;}
function tmCard(n){const me=!n||tmN(n)===tmN(rankName());const d=me?cdMine():cdOther(n);const o=avParse(d.av||"");const C=o?AV_COL[o.c]:"#6fb1ff";
  const m=cdEl("div","sysmodal cdmodal");m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");const c=cdEl("div","card cdcard");c.style.setProperty("--cd",C);
  const close=()=>m.remove();m.addEventListener("click",e=>{if(e.target===m)close();});
  const top=cdEl("div","cdtop");top.append(cdEl("span","cdrk",cdRank(d.lv)),cdEl("span","cdtag",me?"SEU CARD":"CARD DE JOGADOR"),cdEl("span","cdlv","NV "+(d.lv||"–")));c.append(top);
  const art=cdEl("div","cdart");art.innerHTML=tmAv(d.av,150);c.append(art);
  c.append(cdEl("h3","cdname",d.n+(me?" (você)":"")),cdEl("div","cdcls",d.cls||"Classe ainda não escolhida"));
  const ps=cdPos(d.n);const kp=cdEl("div","cdkpi");
  const k=(v,l)=>{const x=cdEl("div");x.append(cdEl("b",null,v),cdEl("span",null,l));return x;};
  kp.append(k(ps.t?ps.t+"º":ps.g?ps.g+"º":"–",ps.t?"na turma":"no geral"),k(String(d.xp||0),"XP semana"),k("🔥 "+(d.seq||0),"sequência"),k("⚡ "+(d.dz||0),"desafios"));c.append(kp);
  const at=String(d.at||"").split("-").map(x=>+x||0);const bars=cdEl("div","cdattr");
  if(at.length===4&&at.some(Boolean)){const mx=Math.max(5,...at);CD_ST.forEach(([key,ic,lb],i)=>{const r=cdEl("div","cdbar");r.append(cdEl("span","cdl",ic+" "+lb));const t=cdEl("span","cdt");const f=cdEl("i");f.style.width=Math.round(at[i]/mx*100)+"%";t.append(f);r.append(t,cdEl("span","cdv","nv "+at[i]));bars.append(r);});}
  else bars.append(cdEl("div","sm muted",me?"Seus atributos aparecem aqui assim que o app atualizar sua ficha.":"Os atributos aparecem quando "+d.n+" abrir o app de novo."));
  c.append(bars);
  const row=cdEl("div","row cdrow");
  if(!me){const fz=frHas(d.n);
    if(fz){for(const kk of ["p","c"]){const t=TM_K[kk];const b=cdEl("button","ghost",t[0]+" "+(kk==="p"?"Parabéns":"Cutucar"));b.type="button";b.addEventListener("click",()=>{tmSend(d.n,kk);close();});row.append(b);}
      const cp=cdEl("button","ghost","⚔️ Comparar");cp.type="button";cp.addEventListener("click",()=>{close();try{frCompare(d.n);}catch(e){}});row.append(cp);}
    else if(!frSt().pend[d.n]){const b=cdEl("button","go","+ Adicionar amigo");b.type="button";b.addEventListener("click",()=>{frRequest(d.n);close();});row.append(b);}}
  else{const b=cdEl("button","go","📨 Convidar amigo");b.type="button";b.addEventListener("click",()=>{close();cdInvite();});row.append(b);}
  const x=cdEl("button","link cdclose","Fechar");x.type="button";x.addEventListener("click",close);c.append(row,x);
  m.append(c);document.body.append(m);try{haptic([10]);}catch(e){}setTimeout(()=>x.focus(),60);}
// --- convite pessoal ---
// link fixo da turma: o mesmo link serve para quantas pessoas quiser (grupo do WhatsApp, Instagram etc.)
function cdLink(){const me=rankName();if(!tmOn()||!me)return "";const s=tmSt();if(!s.inv){const a=new Uint8Array(8);crypto.getRandomValues(a);s.inv=[...a].map(x=>(x%36).toString(36)).join("");save();}return CD_URL+"?amigo="+encodeURIComponent(me)+"&c="+s.inv;}
async function cdInvite(){const me=rankName();if(!tmOn()||!me){toast("Entre no ranking primeiro: o convite usa o seu apelido.");return;}
  const url=cdLink();const text="Bora jogar comigo no Ascension? É um jogo pra subir de nível na vida real. Entra pelo meu link que a gente já vira amigo lá dentro:";
  try{if(navigator.share){await navigator.share({title:"Ascension",text,url});return;}}catch(e){if(e&&e.name==="AbortError")return;}
  try{await navigator.clipboard.writeText(text+" "+url);toast("Link copiado. Cole no WhatsApp do seu amigo.");}catch(e){window.open("https://wa.me/?text="+encodeURIComponent(text+" "+url),"_blank");}}
async function cdSig(tk,n){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(tk+"|"+tmN(n)));return "cv"+[...new Uint8Array(b)].slice(0,6).map(x=>x.toString(16).padStart(2,"0")).join("");}
// quem chegou por convite: guarda quem convidou até poder virar amigo
(function(){try{const u=new URLSearchParams(location.search);const a=cleanNick(u.get("amigo")||"");if(a){localStorage.setItem("asc-amigo",a);localStorage.setItem("asc-amigo-c",String(u.get("c")||"").replace(/[^a-z0-9]/g,"").slice(0,12));u.delete("amigo");u.delete("c");history.replaceState(null,"",location.pathname+(u.toString()?"?"+u:""));}}catch(e){}})();
function cdInvBy(){try{return localStorage.getItem("asc-amigo")||"";}catch(e){return "";}}
let cdBusy=false;async function cdInvDo(){if(cdBusy)return;const a=cdInvBy();const me=rankName();if(!a||!tmOn()||!me||tmKid())return;if(tmN(a)===tmN(me)){try{localStorage.removeItem("asc-amigo");}catch(e){}return;}
  const f=frSt();if(!frHas(a)){f.l.push(a);delete f.pend[a];}let tk="";try{tk=localStorage.getItem("asc-amigo-c")||"";}catch(e){}let sg="";cdBusy=true;try{sg=tk?await cdSig(tk,me):"";}catch(e){}cdBusy=false;sqiPost(["F",me,a,sg,sqiDk()]);save();try{localStorage.removeItem("asc-amigo");localStorage.removeItem("asc-amigo-c");}catch(e){}
  tmFeedAdd("conv",a,"🤝 Você e "+a+" agora são amigos");toast("Pronto: você e "+a+" agora são amigos.");try{frUI();tmUI();}catch(e){}}
// lado de quem convidou: aceita sozinho quem veio pelo link
async function cdInbox(){const me=rankName();if(!me||typeof sqInvRows==="undefined")return;const f=frSt();let ch=false;
  const tk=tmSt().inv;if(!tk)return;for(const r of sqInvRows){if(r.k!=="F"||tmN(r.b)!==tmN(me)||!r.a||frHas(r.a))continue;
    let ok=false;/* formato antigo (código aberto na planilha) não vale mais: a data vinha do cliente e dava para forjar */if(!ok&&/^cv[0-9a-f]{12}$/.test(r.s)){try{ok=r.s===await cdSig(tk,r.a);}catch(e){}}if(!ok||frHas(r.a))continue;f.l.push(r.a);delete f.pend[r.a];sqiPost(["G",me,r.a,"",sqiDk()]);ch=true;
    tmFeedAdd("conv",r.a,"🤝 "+r.a+" entrou pelo seu convite e agora é seu amigo");cdBadge(1);toast("🤝 "+r.a+" entrou pelo seu convite. Agora são amigos!");}
  if(ch){save();try{frUI();tmUI();}catch(e){}}}
// cartão "Fulano te chamou" para quem chegou pelo link
function cdInvCard(){const a=cdInvBy();let c=$("cdInv");const host=$("tmPanel");
  if(!a||tmKid()||!cfg||cfg.blank||tmOn()&&(cdInvDo(),true)){if(c)c.remove();return;}
  if(!host)return;if(!c){c=cdEl("div","cdinv");c.id="cdInv";}host.prepend(c);c.textContent="";
  c.append(cdEl("b",null,"🤝 "+a+" te chamou para a turma"),cdEl("span","sm muted","Entre no ranking e vocês viram amigos na hora: um vê o card do outro, a liga e a sequência."));
  const b=cdEl("button","go","Entrar e virar amigo de "+a);b.type="button";b.addEventListener("click",()=>{try{joinRank("convite");}catch(e){}setTimeout(()=>{cdInvDo();cdInvCard();},400);});c.append(b);}
// --- destaque da aba Amigos: bolinha com novidades ---
function cdBadge(n){const s=tmSt();s.badge=(s.badge||0)+n;save();cdBadgeUI();}
function cdBadgeUI(){const b=document.querySelector('#tabbar [data-go="amigos"]');if(!b)return;const s=tmSt();let d=b.querySelector(".cdbdg");const n=(s.badge||0)+(cdInvBy()&&!tmOn()?1:0);
  if(n>0&&document.body.dataset.tab!=="amigos"){if(!d){d=cdEl("span","cdbdg");b.append(d);}d.textContent=n>9?"9+":String(n);}else if(d)d.remove();b.classList.toggle("cdhot",n>0);}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest('#tabbar [data-go="amigos"]');if(!b)return;const s=tmSt();if(s.badge){s.badge=0;save();}setTimeout(cdBadgeUI,0);},true);
// conta como novidade o que chega de fora (parabéns, cutucada, amigo novo, amigo que subiu de nível)
{const _fa=tmFeedAdd;tmFeedAdd=function(k,n,t){const s=tmSt();const before=s.feed.length?s.feed[0].id:"";_fa(k,n,t);if(s.feed.length&&s.feed[0].id!==before&&k!=="conv")cdBadge(1);};}
// a lista da turma abre o card (em vez de ir direto para a comparação)
document.addEventListener("click",e=>{const li=e.target.closest&&e.target.closest("#tmPanel .tmlist li");if(!li||e.target.closest("button"))return;const nm=li.querySelector(".tmtx b");if(!nm)return;
  e.stopImmediatePropagation();tmCard(nm.textContent.replace(/ \(você\)$/,""));},true);
// botões novos no painel da turma: meu card e convidar
{const _tu=tmUI;tmUI=function(){_tu();try{const p=$("tmPanel");if(!p||p.hidden)return;cdInvCard();if(!tmOn())return;
  if(!p.querySelector(".cdacts")){const r=cdEl("div","cdacts");const a=cdEl("button","go cdinvb","📨 Convidar amigo");a.type="button";a.addEventListener("click",cdInvite);
    const b=cdEl("button","ghost","🪪 Meu card");b.type="button";b.addEventListener("click",()=>tmCard());r.append(a,b);const seg=p.querySelector(".tmseg");(seg||p.lastChild).before(r);}
  if(!p.querySelector(".cdlink")){const u=cdLink();if(u){const bx=cdEl("div","cdlink");bx.append(cdEl("b",null,"🔗 Link da sua turma"),cdEl("span","sm muted","Mande no grupo: quem entrar por ele vira seu amigo na hora. Serve para quantas pessoas quiser."));
      const lk=cdEl("div","cdurl",u.replace(/^https:\/\//,""));bx.append(lk);const r=cdEl("div","cdlbtn");
      const c1=cdEl("button","ghost","Copiar link");c1.type="button";c1.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(u);toast("Link da turma copiado.");}catch(e){const sel=getSelection();const rg=document.createRange();rg.selectNodeContents(lk);sel.removeAllRanges();sel.addRange(rg);toast("Segure no link para copiar.");}});
      const c2=cdEl("button","ghost","WhatsApp");c2.type="button";c2.addEventListener("click",()=>window.open("https://wa.me/?text="+encodeURIComponent("Bora jogar comigo no Ascension? É um jogo pra subir de nível na vida real. Entra pela minha turma: "+u),"_blank"));
      r.append(c1,c2);bx.append(r);const ac=p.querySelector(".cdacts");(ac||p.querySelector(".tmseg")).after(bx);}}
  for(const li of p.querySelectorAll(".tmlist li:not(.tmzone)"))li.classList.add("tap");
  const lg=p.querySelector(".tmlg");if(lg&&!lg.querySelector(".cdme")){const ps=cdPos(rankName());if(ps.g){const x=cdEl("div","cdme");x.append(cdEl("b",null,(ps.t||ps.g)+"º"),cdEl("span",null,ps.t?"de "+ps.tof+" na turma":"de "+ps.gof+" no geral"));lg.append(x);}}}catch(e){}cdBadgeUI();};}
{const _ck=sqiCheck;sqiCheck=function(){_ck.apply(this,arguments);try{cdInbox();cdInvDo();}catch(e){}};}
{const _rr=renderRankUI;renderRankUI=function(){_rr();try{cdInvDo();}catch(e){}};}
setTimeout(()=>{try{cdBadgeUI();tmUI();}catch(e){}},0);
// menor de 18 sem apelido: o pedido de apelido fica na aba Amigos (o ranking mora lá agora)
if(typeof joinRank==="function"){const _jr=joinRank;joinRank=function(){_jr.apply(this,arguments);try{if(!tmOn()&&$("rkNick")){goTab("amigos");const r=$("rankPanel");if(r){if(r.classList.contains("fold")&&!r.classList.contains("open")){const h=r.querySelector(".fhd");if(h)h.click();}r.scrollIntoView({block:"center"});}setTimeout(()=>$("rkNick").focus(),80);}}catch(e){}};}
