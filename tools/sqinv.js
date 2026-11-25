// ---------- Convite de Esquadrão: tocar no nome chama o amigo; o aviso aparece no app dele ----------
// Usa o mesmo formulário do ranking: I|de|para|esquadrão|data (convite) e J|quem|de|esquadrão|data (aceite).
// A lista pública do ranking traz esses convites (colunas E a I). Só apelidos do ranking; quem tem até 13 anos não participa.
// Só ADICIONA prog.sqInv = {seen:{chave:1}}.
let sqInvRows=[],sqiAt=0,sqPub={};
function sqiSt(){if(!prog.sqInv||typeof prog.sqInv!=="object")prog.sqInv={seen:{}};prog.sqInv.seen=prog.sqInv.seen||{};return prog.sqInv;}
const sqiN=v=>String(v||"").trim().toLowerCase();
const sqiDk=()=>todayKey().replace(/-/g,"");
function sqiFresh(d){const s=String(d||"").replace(/\D/g,"");if(s.length!==8)return true;const t=new Date(+s.slice(0,4),+s.slice(4,6)-1,+s.slice(6,8));return (Date.now()-t)/864e5<8;}
function sqiPost(parts){const v=parts.map(x=>String(x==null?"":x).replace(/[|,\n\r]/g," ").slice(0,40)).join("|");
  try{fetch(RK_POST,{method:"POST",mode:"no-cors",keepalive:true,body:new URLSearchParams({"entry.807978446":v})}).catch(()=>{});}catch(e){}}
async function sqiLoad(){if(ageNow()==="kid"||!(prog.rank&&prog.rank.on))return;sqiAt=Date.now();
  try{const t=await (await fetch(RK_CSV+"&t="+Date.now(),{credentials:"omit"})).text();
    const all=t.trim().split(/\r?\n/).slice(1).map(l=>l.split(","));sqPub={};for(const r of all){const n=String(r[10]||"").trim();if(n&&n!=="pnick"&&/\./.test(r[13]||""))sqPub[n.toLowerCase()]={seq:+r[11]||0,dz:+r[12]||0,av:String(r[13]).trim()};}
    sqInvRows=all.filter(r=>/^[IJFG]$/.test(String(r[4]||"").trim())).map(r=>({k:r[4].trim(),a:String(r[5]||"").trim(),b:String(r[6]||"").trim(),s:String(r[7]||"").trim(),d:String(r[8]||"").trim()}));}catch(e){return;}
  sqiCheck();try{if(typeof frCheck==="function")frCheck();}catch(e){}}
// convite que o Esquadrão manda ao tocar no nome
function sqiInvite(to){const s=sqSt();const me=rankName();if(!s||!me||!to)return;sqiPost(["I",me,to,s.n,sqiDk()]);}
// quem aceitou o meu convite entra sozinho no meu esquadrão
function sqiMerge(){const s=sqSt();const me=sqiN(rankName());if(!s||!me)return false;let ch=false;
  for(const r of sqInvRows){if(r.k!=="J"||sqiN(r.b)!==me||sqiN(r.s)!==sqiN(s.n)||!r.a)continue;
    if(sqiN(r.a)===me||s.m.some(n=>sqiN(n)===sqiN(r.a))||s.m.length>=SQ_MAX)continue;
    const key="j:"+sqiN(r.a)+":"+sqiN(r.s);const st=sqiSt();s.m.push(r.a);ch=true;if(!st.seen[key]){st.seen[key]=1;toast(r.a+" aceitou e entrou no esquadrão "+s.n+".");}}
  if(ch){save();try{sqUI();sqCheckWin();}catch(e){}}return ch;}
// aliados do mesmo esquadrão (quem já aceitou o mesmo líder)
function sqiAllies(from,squad,me){const out=[from];for(const r of sqInvRows)if(r.k==="J"&&sqiN(r.b)===sqiN(from)&&sqiN(r.s)===sqiN(squad)&&sqiN(r.a)!==sqiN(me)&&!out.some(n=>sqiN(n)===sqiN(r.a)))out.push(r.a);return out.slice(0,SQ_MAX);}
function sqiCheck(){sqiMerge();const me=rankName();if(!me||$("sqiModal")||[...document.querySelectorAll(".sysmodal")].some(x=>x.getClientRects().length)||document.body.classList.contains("inmission"))return;
  const st=sqiSt();const s=sqSt();
  const inv=sqInvRows.filter(r=>r.k==="I"&&sqiN(r.b)===sqiN(me)&&r.a&&r.s&&sqiFresh(r.d)&&!st.seen["i:"+sqiN(r.a)+":"+sqiN(r.s)]&&!(s&&sqiN(s.n)===sqiN(r.s)&&s.m.some(n=>sqiN(n)===sqiN(r.a))));
  if(inv.length)sqiAsk(inv[inv.length-1]);}
function sqiAsk(r){const st=sqiSt();const key="i:"+sqiN(r.a)+":"+sqiN(r.s);const s=sqSt();const me=rankName();
  const m=document.createElement("div");m.className="sysmodal";m.id="sqiModal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");
  const c=document.createElement("div");c.className="card";const el=(t,cl,x)=>{const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;};
  c.append(el("div","tag","[ SISTEMA ] CONVOCAÇÃO"),el("h3",null,r.a+" te chamou para o esquadrão "+r.s),
    el("p","sm","Juntos vocês enfrentam a anomalia da semana. Cada XP de vocês tira vida dela. Venceu, cada um ganha +"+SQ_PRIZE+" XP."));
  if(s&&sqiN(s.n)!==sqiN(r.s))c.append(el("p","sm muted","Você está no esquadrão "+s.n+". Aceitar troca para o "+r.s+"."));
  const row=el("div","row");const ok=el("button","go","Aceitar");ok.type="button";const no=el("button","ghost","Agora não");no.type="button";row.append(ok,no);c.append(row);
  const close=()=>{st.seen[key]=1;save();m.remove();setTimeout(sqiCheck,400);};
  ok.addEventListener("click",()=>{const cur=sqSt();const allies=sqiAllies(r.a,r.s,me);
    if(cur&&sqiN(cur.n)===sqiN(r.s)){for(const n of allies)if(cur.m.length<SQ_MAX&&!cur.m.some(x=>sqiN(x)===sqiN(n)))cur.m.push(n);}
    else prog.squad={n:r.s,m:allies,won:{}};
    sqiPost(["J",me,r.a,r.s,sqiDk()]);try{haptic([15,40,15]);}catch(e){}toast("Você entrou no esquadrão "+r.s+".");close();try{goTab("prog");sqUI();sqCheckWin();}catch(e){}});
  no.addEventListener("click",close);m.append(c);document.body.append(m);setTimeout(()=>ok.focus(),60);}
// tocar no nome do ranking também manda o convite (o amigo recebe o aviso no app dele)
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#sqPanel .sqchips .chip");if(!b)return;const n=b.textContent.replace(/^\+\s*/,"").trim();
  setTimeout(()=>{const s=sqSt();if(s&&s.m.includes(n)){sqiInvite(n);toast("Convite enviado para "+n+". Aparece no app dele.");}},0);},true);
// dica no painel do Esquadrão
{const _sq=sqUI;sqUI=function(){_sq();try{const p=$("sqPanel");if(p&&!p.hidden&&sqSt()&&!p.querySelector(".sqitip")){const d=document.createElement("div");d.className="sm muted sqitip";d.textContent="Tocou no nome, o amigo recebe o convite no app dele. Quando ele aceita, entra aqui sozinho.";const ch=p.querySelector(".sqchips");if(ch)ch.after(d);}}catch(e){}};}
document.addEventListener("visibilitychange",()=>{if(!document.hidden)sqiLoad();});
for(const b of document.querySelectorAll('#tabbar [data-go="prog"]'))b.addEventListener("click",sqiLoad);
function sqiSoon(){if(Date.now()-sqiAt<20000){sqiCheck();return;}sqiLoad();}
{const _rr=renderRankUI;renderRankUI=function(){_rr();try{sqiSoon();}catch(e){}};}
{const _r=render;render=function(){_r.apply(this,arguments);try{if(sqInvRows.length)sqiCheck();}catch(e){}};}
setTimeout(sqiLoad,3500);setInterval(()=>{if(!document.hidden)sqiLoad();},120000);
