// ---------- Código curto da Guilda (28/11, dica do JV) ----------
// Em vez do link inteiro, o dono da guilda passa um código de 8 letras (ex.: 7KQM-4XHT) e quem vai entrar digita em
// Amigos → "Entrar numa Guilda". Os links antigos continuam valendo (card.js, grupos.js, colar.js não mudam o formato).
// Segurança (o canal F/G é público na planilha):
// - O código nunca vai para a planilha. Vai só "#"+hash lento (PBKDF2, 100 mil voltas) para o dono achar o pedido,
//   e a assinatura cdSig(código, apelido) que só quem sabe o código consegue fazer (mesma regra do link).
// - O dono confere e responde com G assinado com o código; quem entrou confere a assinatura antes de virar amigo
//   (G solto, sem o código, não vira amizade). Depois manda o F normal, para o servidor também ver a amizade (mural).
// - Alfabeto sem 0/O/1/I/L (não confunde ao digitar). Menor de 14: nada aparece (mesma regra do ranking).
// Só ADICIONA: t.k em cada guilda de prog.turmas, prog.team.ik (código pessoal) e prog.team.kq (pedidos feitos com código).
const KD_AB="23456789abcdefghjkmnpqrstuvwxyz",KD_LEN=8,KD_MAXQ=5;
function kdNew(){const out=[];while(out.length<KD_LEN){const a=new Uint8Array(16);crypto.getRandomValues(a);for(const x of a)if(x<248&&out.length<KD_LEN)out.push(KD_AB[x%31]);}return out.join("");}
function kdShow(k){k=String(k||"").toUpperCase();return k.slice(0,4)+"-"+k.slice(4);}
function kdNorm(v){return String(v||"").toLowerCase().replace(/[^a-z0-9]/g,"");}
// acha um código num texto: só o código (com ou sem hífen/espaço) ou "XXXX-XXXX" dentro de uma mensagem
function kdParse(txt){const s=String(txt||"").trim();let m=/^([a-z0-9]{4})[\s-]?([a-z0-9]{4})$/i.exec(s);if(!m)m=/(?:^|[^a-z0-9])([a-z0-9]{4})-([a-z0-9]{4})(?:$|[^a-z0-9])/i.exec(s);
  if(!m)return null;const k=kdNorm(m[1]+m[2]);return k.length===KD_LEN?k:null;}
function kdValid(k){return typeof k==="string"&&k.length===KD_LEN&&[...k].every(c=>KD_AB.includes(c));}
// código da guilda aberta (a "Minha guilda" usa o código pessoal)
function kdMine(){if(!tmOn()||!rankName())return "";const t=gtCur();if(t.id==="t0"){const s=tmSt();if(!kdValid(s.ik)){s.ik=kdNew();save();}return s.ik;}
  if(!kdValid(t.k)){t.k=kdNew();save();}return t.k;}
function kdAll(){const L=[];const s=tmSt();if(kdValid(s.ik))L.push({k:s.ik,t:null});try{for(const t of gtSt().l)if(kdValid(t.k))L.push({k:t.k,t:t.id==="t0"?null:t});}catch(e){}return L;}
const kdHc={};
async function kdHash(k){if(kdHc[k])return kdHc[k];const E=new TextEncoder();const key=await crypto.subtle.importKey("raw",E.encode(k),"PBKDF2",false,["deriveBits"]);
  const b=await crypto.subtle.deriveBits({name:"PBKDF2",salt:E.encode("ascension-guilda-v1"),iterations:100000,hash:"SHA-256"},key,48);
  return kdHc[k]="#"+[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");}
function kdQ(){const s=tmSt();if(!Array.isArray(s.kq))s.kq=[];const lim=new Date();lim.setDate(lim.getDate()-14);const lk=dkey(lim);
  s.kq=s.kq.filter(x=>x&&kdValid(x.k)&&typeof x.d==="string"&&x.d>=lk).slice(-KD_MAXQ);return s.kq;}
// --- quem digita o código ---
function kdPendGet(){try{return localStorage.getItem("asc-guilda-k")||"";}catch(e){return "";}}
let kdBusy=false;
async function kdJoin(){const k=kdPendGet();const me=rankName();if(!k||kdBusy||!tmOn()||!me||tmKid())return false;
  try{localStorage.removeItem("asc-guilda-k");}catch(e){}if(!kdValid(k))return false;
  if(kdAll().some(x=>x.k===k)){toast("Esse código é da sua guilda. Mande para um amigo.");return false;}
  kdBusy=true;try{const h=await kdHash(k),sg=await cdSig(k,me);const q=kdQ();if(!q.some(x=>x.k===k))q.push({k,d:todayKey()});if(q.length>KD_MAXQ)q.shift();
    sqiPost(["F",me,h,sg,sqiDk()]);save();toast("🗝️ Pedido enviado. Quando o dono da guilda abrir o app, vocês viram amigos.");return true;}
  catch(e){return false;}finally{kdBusy=false;}}
async function kdAccepted(){const me=rankName();const q=kdQ();if(!me||!q.length||typeof sqInvRows==="undefined")return;const f=frSt();let ch=false;
  for(const r of sqInvRows){if(r.k!=="G"||tmN(r.b)!==tmN(me)||!r.a||frHas(r.a)||tmN(r.a)===tmN(me)||!/^cv[0-9a-f]{12}$/.test(r.s))continue;
    for(const x of q.slice()){let ok=false;try{ok=r.s===await cdSig(x.k,"g|"+r.a);}catch(e){}if(!ok)continue;
      if(!frHas(r.a))f.l.push(r.a);delete f.pend[r.a];q.splice(q.indexOf(x),1);ch=true;
      try{sqiPost(["F",me,r.a,await cdSig(x.k,me),sqiDk()]);}catch(e){}
      tmFeedAdd("conv",r.a,"🗝️ Você entrou na guilda de "+r.a+". Agora são amigos");toast("🗝️ "+r.a+" aceitou. Agora vocês são amigos!");break;}}
  if(ch){save();try{frUI();tmUI();}catch(e){}}}
// --- dono da guilda: acha os pedidos pelo hash e confere a assinatura ---
async function kdInbox(){const me=rankName();if(!me||!tmOn()||typeof sqInvRows==="undefined")return;const C=kdAll();if(!C.length)return;
  const rows=sqInvRows.filter(r=>r.k==="F"&&/^#[0-9a-f]{12}$/.test(r.b)&&r.a&&!frHas(r.a)&&tmN(r.a)!==tmN(me)&&/^cv[0-9a-f]{12}$/.test(r.s)).slice(-30);if(!rows.length)return;
  const f=frSt();let ch=false;
  for(const x of C){const h=await kdHash(x.k);
    for(const r of rows){if(r.b!==h||frHas(r.a))continue;let ok=false;try{ok=r.s===await cdSig(x.k,r.a);}catch(e){}if(!ok)continue;
      f.l.push(r.a);delete f.pend[r.a];const t=x.t;if(t&&!t.m.some(n=>gtN(n)===gtN(r.a)))t.m.push(r.a);
      try{sqiPost(["G",me,r.a,await cdSig(x.k,"g|"+me),sqiDk()]);}catch(e){}ch=true;
      tmFeedAdd("conv",r.a,"🗝️ "+r.a+" entrou com o código"+(t?" da guilda "+t.n:""));try{cdBadge(1);}catch(e){}toast("🗝️ "+r.a+" entrou"+(t?" na guilda "+t.n:" na sua guilda")+". Agora são amigos!");}}
  if(ch){save();try{frUI();tmUI();}catch(e){}}}
let kdRun=false;async function kdTick(){if(kdRun)return;kdRun=true;try{await kdJoin();await kdInbox();await kdAccepted();}catch(e){}finally{kdRun=false;}}
{const _ck=sqiCheck;sqiCheck=function(){_ck.apply(this,arguments);kdTick();};}
{const _rr=renderRankUI;renderRankUI=function(){_rr.apply(this,arguments);try{if(kdPendGet())kdTick();}catch(e){}};}
// --- tela: código na caixa do link da guilda ---
function kdUI(){const p=$("tmPanel");if(!p||p.hidden||tmKid()||!tmOn())return;const bx=p.querySelector(".cdlink");if(!bx)return;const k=kdMine();if(!k)return;
  let c=bx.querySelector(".kdbox");if(c&&c.dataset.k===k)return;if(c)c.remove();
  c=cdEl("div","kdbox");c.dataset.k=k;const t=gtCur();
  c.append(cdEl("span","sm muted","Ou passe só o código"+(t.id==="t0"?"":" da guilda "+t.n)+". A pessoa digita em Amigos → Entrar numa Guilda."));
  const row=cdEl("div","kdrow");const v=cdEl("b","kdcode",kdShow(k));v.setAttribute("aria-label","Código "+[...k.toUpperCase()].join(" "));
  const cp=cdEl("button","ghost","Copiar código");cp.type="button";
  cp.addEventListener("click",async()=>{const txt="Entra na minha guilda no Ascension: abre o app, vai em Amigos → Entrar numa Guilda e digita "+kdShow(k);
    let ok=false;try{await navigator.clipboard.writeText(txt);ok=true;}catch(e){}toast(ok?"Código copiado.":"Anote o código: "+kdShow(k));});
  row.append(v,cp);c.append(row);const r=bx.querySelector(".cdlbtn");(r||bx.lastChild).after(c);}
{const _tu=tmUI;tmUI=function(){_tu.apply(this,arguments);try{kdUI();}catch(e){}};}
setTimeout(()=>{try{kdUI();}catch(e){}},0);
