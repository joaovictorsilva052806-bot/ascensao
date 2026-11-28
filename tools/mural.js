// ---------- Mural da turma (prova por foto, 14+) e Álbum de figurinhas (todas as idades) ----------
// Mural: foto opcional de uma tarefa feita, vista SÓ por amigos confirmados, some em 7 dias, autor apaga quando quiser.
//   - A foto é redesenhada num canvas no aparelho (sai sem EXIF/GPS), lado maior até 1080 px, JPEG até ~70 KB.
//   - Sem comentário de texto: só reações fixas (🔥 💪 👏) e legenda escolhida de uma lista.
//   - 14 a 17 anos: só com "meu responsável autorizou". Até 13: nada de foto, só figurinha.
//   - O servidor (server/mural.gs) confere token, idade, amizade, tamanho e tipo; o app só mostra.
//   - MURAL_URL vazio = mural de fotos escondido. O Álbum de figurinhas funciona sempre, sem sair do aparelho.
// Só ADICIONA prog.mural = {ok:1, par:1, reg:"faixa", stk:{dia:[{q,e}]}}. Nada novo no formulário público.
// Servidor publicado em 26/11 (thread de segurança, PR #70). Teste com outro servidor: localStorage "asc-mural-url" com um endereço /exec do Apps Script (só no próprio aparelho).
const MURAL_URL=(()=>{const fixo="https://script.google.com/macros/s/AKfycbwI3tDbLa7qYH2_oLn8kQAHuLrn-NXrtOjLEMXEcjdn_NsjW3UM7QAJE9hvQg_47isJbA/exec";try{const t=localStorage.getItem("asc-mural-url")||"";if(/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(t))return t;}catch(e){}return fixo;})();
const MU_REACT=["🔥","💪","👏"];
const MU_CAPS=["","Feito ✅","Mínimo cumprido","Dia difícil, fiz mesmo assim","Novo recorde","Primeira vez!"];
const MU_STK=["⭐","🏆","🔥","💪","📚","🧠","🏃","🎯","🌙","✨","🦸","🐉","🎨","🎵","🥇","💧"];
const MU_MAXB=70000;
function muSt(){if(!prog.mural||typeof prog.mural!=="object")prog.mural={};const m=prog.mural;m.stk=m.stk||{};return m;}
// bloqueio (diretriz 1.2 da App Store): só neste aparelho, em prog.mural.blk = ["apelido em minúsculas"]. Só ADICIONA o campo.
function muBlk(){const b=(prog.mural&&Array.isArray(prog.mural.blk))?prog.mural.blk:[];return b;}
function muIsBlk(a){return muBlk().includes(String(a||"").toLowerCase());}
function muEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function muAge(){let a="";try{a=ageNow();}catch(e){}if(!a&&typeof crOn==="function")return "adult";return a;}
function muKid(){return muAge()==="kid";}
function muBand(){const a=muAge();return a==="teen"?"teen":(a==="young"||a==="adult"||a==="senior")?"adult":"";}
function muTok(){try{return typeof rkTok==="function"?rkTok():"";}catch(e){return "";}}
// pode ver e postar foto? (servidor confere de novo)
function muPhotoOn(){return !!MURAL_URL&&!!muBand()&&!!(prog.rank&&prog.rank.on)&&!!rankName()&&!!muTok();}
async function muApi(a,o){const body=JSON.stringify(Object.assign({a,n:rankName(),tk:muTok()},o||{}));
  const r=await fetch(MURAL_URL,{method:"POST",body,credentials:"omit",redirect:"follow"});const j=await r.json();if(!j||j.ok===false)throw new Error((j&&j.err)||"erro");return j;}
function muAgo(iso){const m=Math.max(0,Math.round((Date.now()-new Date(iso))/6e4));return m<60?(m<1?"agora":m+" min"):m<1440?Math.round(m/60)+" h":Math.round(m/1440)+" d";}
// --- foto: redesenha no canvas (tira EXIF/GPS) e comprime ---
async function muShrink(file){if(!file||!/^image\//.test(file.type||"image/"))throw new Error("tipo");
  let src;try{src=await createImageBitmap(file,{imageOrientation:"from-image"});}catch(e){src=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(file);});}
  const W=src.width,H=src.height;let side=1080,q=.72,url="";
  for(let k=0;k<9;k++){const s=Math.min(1,side/Math.max(W,H));const c=document.createElement("canvas");c.width=Math.max(1,Math.round(W*s));c.height=Math.max(1,Math.round(H*s));
    const g=c.getContext("2d");g.fillStyle="#000";g.fillRect(0,0,c.width,c.height);g.drawImage(src,0,0,c.width,c.height);url=c.toDataURL("image/jpeg",q);
    if(url.length*.75<=MU_MAXB)return url;if(q>.45)q-=.12;else side=Math.round(side*.8);}
  if(url.length*.75<=MU_MAXB)return url;throw new Error("grande");}
// --- depois de concluir uma tarefa: atalho por 8 s ---
function muBlocked(){return [...document.querySelectorAll(".sysmodal,#levelup:not([hidden]),#bxModal")].some(x=>x.getClientRects().length);}
function muChip(q,tries){if(!q||!cfg||cfg.blank)return;tries=tries||0;if(muBlocked()){if(tries<40)setTimeout(()=>muChip(q,tries+1),500);return;}const old=$("muChip");if(old)old.remove();const photo=muPhotoOn();
  const b=muEl("button","much",photo?"📸 Provar no mural":"⭐ Colar figurinha");b.type="button";b.id="muChip";
  b.addEventListener("click",()=>{b.remove();photo?muCompose(q):muSticker(q);});document.body.append(b);setTimeout(()=>{if(b.isConnected)b.remove();},8000);}
{const _tg=toggle;toggle=function(q,kind){const tk=todayKey();const had=(prog.log[tk]||[]).some(e=>e.q===q.id);_tg.apply(this,arguments);
  try{const now=(prog.log[tk]||[]).some(e=>e.q===q.id);if(!had&&now&&!/^(s_fech|q_fech)$/.test(q.id))muChip(q);}catch(e){}};}
// --- figurinha (todas as idades, fica no aparelho) ---
function muSticker(q){const m=muEl("div","sysmodal mumodal");m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");const c=muEl("div","card");
  const title=String(q.title||"Tarefa").replace(/^\S+\s(?=Fechar)/,"").slice(0,60);
  c.append(muEl("div","tag","[ SISTEMA ] PROVA DA TAREFA"),muEl("h3",null,"Cole uma figurinha"),muEl("p","sm muted","« "+title+" » vai para o seu álbum. Fica só neste aparelho."));
  const g=muEl("div","mustk");for(const e of MU_STK){const b=muEl("button","mus",e);b.type="button";b.setAttribute("aria-label","Figurinha "+e);
    b.addEventListener("click",()=>{const s=muSt();const tk=todayKey();s.stk[tk]=(s.stk[tk]||[]).filter(x=>x.q!==title).concat([{q:title,e}]).slice(-12);
      const keys=Object.keys(s.stk).sort();while(keys.length>60)delete s.stk[keys.shift()];save();m.remove();try{haptic([10,30,10]);}catch(e){}toast(e+" Figurinha colada no álbum.");muAlbumUI();});g.append(b);}
  const no=muEl("button","link","Agora não");no.type="button";no.addEventListener("click",()=>m.remove());c.append(g,no);m.append(c);document.body.append(m);}
function muAlbumUI(){let p=$("muAlbum");const anchor=$("bxCol")||$("avPanel")||document.querySelector('.wrap>section[data-tab="prog"]');if(!anchor)return;
  if(!p){p=muEl("section","panel mualb");p.id="muAlbum";p.dataset.tab="prog";anchor.after(p);}
  const s=muSt();const days=Object.keys(s.stk).sort().reverse().filter(d=>(s.stk[d]||[]).length);if(!cfg||cfg.blank){p.hidden=true;return;}p.hidden=false;
  let n=0;for(const d of days)n+=s.stk[d].length;
  (typeof bxHead==="function"?bxHead:(p,t,m)=>{p.textContent="";const hd=muEl("div","qhead");hd.append(muEl("h2",null,t),muEl("span","sm mono",m));p.append(hd);})(p,"⭐ Álbum de figurinhas",n+(n===1?" figurinha":" figurinhas"));
  if(!days.length){p.append(muEl("div","sm muted","Concluiu uma tarefa? Toque em « ⭐ Colar figurinha » e ela entra aqui como prova. Fica só no seu aparelho."));return;}
  for(const d of days.slice(0,14)){const row=muEl("div","muday");const [y,mo,da]=d.split("-");row.append(muEl("span","mudd",da+"/"+mo));
    const g=muEl("div","mudg");for(const x of s.stk[d]){const t=muEl("span","mut",x.e);t.title=x.q;t.setAttribute("aria-label",x.e+" "+x.q);g.append(t);}row.append(g);p.append(row);}}
// --- consentimento (1ª vez) e aviso curto nas próximas ---
function muConsent(done){const s=muSt();const teen=muBand()==="teen";
  const m=muEl("div","sysmodal mumodal");m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");const c=muEl("div","card");
  c.append(muEl("div","tag","[ SISTEMA ] MURAL DA GUILDA"),muEl("h3",null,"Antes da 1ª foto"));
  const ul=muEl("ul","sm mulist");for(const t of ["Só seus amigos confirmados veem. Nunca fica público nem vai para o ranking.","A foto some sozinha em 7 dias. Você pode apagar antes, quando quiser.","Não mostre rosto (nem o seu, nem de ninguém), uniforme, nome da escola, endereço, número da casa, placa ou documento.","Sem comentários: só reações 🔥 💪 👏. Viu algo errado? Toque em Denunciar."])ul.append(muEl("li",null,t));c.append(ul);
  const l1=muEl("label","chk sm");const c1=muEl("input");c1.type="checkbox";l1.append(c1,document.createTextNode(" Entendi as regras"));c.append(l1);
  let c2=null;if(teen){const l2=muEl("label","chk sm");c2=muEl("input");c2.type="checkbox";l2.append(c2,document.createTextNode(" Meu responsável autorizou eu postar fotos para meus amigos"));c.append(l2);}
  const msg=muEl("div","sm mumsg");c.append(msg);
  const row=muEl("div","row");const ok=muEl("button","go","Continuar");ok.type="button";const no=muEl("button","ghost","Agora não");no.type="button";row.append(ok,no);c.append(row);
  no.addEventListener("click",()=>m.remove());
  ok.addEventListener("click",async()=>{if(!c1.checked){msg.textContent="Marque que entendeu as regras.";return;}if(teen&&!(c2&&c2.checked)){msg.textContent="Para quem tem 14 a 17 anos, o responsável precisa autorizar.";return;}
    ok.disabled=true;msg.textContent="Ligando…";try{await muApi("reg",{band:muBand(),par:teen?1:0});s.ok=1;s.reg=muBand();if(teen)s.par=1;save();m.remove();done();}
    catch(e){ok.disabled=false;msg.textContent="Não deu para ligar agora. Tente de novo em instantes.";}});
  m.append(c);document.body.append(m);}
// --- postar foto ---
function muCompose(q){if(!muPhotoOn())return muSticker(q);const s=muSt();if(!s.ok||s.reg!==muBand())return muConsent(()=>muCompose(q));
  const inp=muEl("input");inp.type="file";inp.accept="image/*";inp.hidden=true;document.body.append(inp);
  inp.addEventListener("change",async()=>{const f=inp.files&&inp.files[0];inp.remove();if(!f)return;let url;try{url=await muShrink(f);}catch(e){toast("Não deu para usar essa foto. Tente outra.");return;}muPreview(q,url);});
  inp.click();}
function muPreview(q,url){const title=String(q.title||"Tarefa").slice(0,40);let cap="";
  const m=muEl("div","sysmodal mumodal");m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");const c=muEl("div","card");
  c.append(muEl("div","tag","[ SISTEMA ] PROVA NO MURAL"));const im=muEl("img","muprev");im.alt="Sua foto";im.src=url;c.append(im,muEl("b",null,title));
  const caps=muEl("div","mucaps");for(const t of MU_CAPS){const b=muEl("button","chip"+(t===cap?" on":""),t||"Sem legenda");b.type="button";b.addEventListener("click",()=>{cap=t;for(const x of caps.children)x.classList.toggle("on",x===b);});caps.append(b);}caps.firstChild.classList.add("on");c.append(caps);
  c.append(muEl("p","sm muwarn","⚠ Sem rosto, escola, endereço ou documento. Só amigos veem, some em 7 dias."));
  const msg=muEl("div","sm mumsg");c.append(msg);
  const row=muEl("div","row");const ok=muEl("button","go","Postar para amigos");ok.type="button";const no=muEl("button","ghost","Cancelar");no.type="button";row.append(ok,no);c.append(row);
  no.addEventListener("click",()=>m.remove());
  ok.addEventListener("click",async()=>{ok.disabled=true;msg.textContent="Enviando…";try{await muApi("post",{q:title,cap,img:url});m.remove();try{haptic([15,40,15]);}catch(e){}toast("📸 Prova no mural. Seus amigos já podem reagir.");muAt=0;muLoad();}
    catch(e){ok.disabled=false;const er=String(e.message||"");msg.textContent=/limite/.test(er)?"Hoje já foram 3 fotos. Amanhã tem mais.":/amigo/.test(er)?"Adicione um amigo antes de postar.":"Não deu para enviar agora. Tente de novo.";}});
  m.append(c);document.body.append(m);}
// --- painel na aba Amigos ---
let muPosts=null,muAt=0,muBusy=false;
async function muLoad(){if(!muPhotoOn()||muBusy||!muSt().ok)return muUI();if(Date.now()-muAt<45000)return muUI();muBusy=true;muAt=Date.now();
  try{const j=await muApi("list");muPosts=Array.isArray(j.posts)?j.posts.slice(0,20):[];}catch(e){muPosts=muPosts||[];}muBusy=false;muUI();}
function muImgOk(u){return typeof u==="string"&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(u)&&u.length<200000;}
async function muAct(a,o,okMsg){try{await muApi(a,o);if(okMsg)toast(okMsg);}catch(e){toast("Não deu agora. Tente de novo.");}muAt=0;muLoad();}
function muUI(){let p=$("muPanel");const wrap=document.querySelector(".wrap");if(!wrap)return;
  if(!p){p=muEl("section","panel mu");p.id="muPanel";p.dataset.tab="amigos";const at=$("tmPanel");at&&at.parentNode===wrap?at.after(p):wrap.append(p);}
  if(!MURAL_URL||!muBand()||!(prog.rank&&prog.rank.on)){p.hidden=true;return;}p.hidden=false;p.textContent="";const s=muSt();
  const hd=muEl("div","muhd");hd.append(muEl("h2",null,"📸 Mural da guilda"),muEl("span","sm muted","só amigos · 7 dias"));p.append(hd);
  if(!muPhotoOn()){p.append(muEl("div","sm muted","O mural liga quando você está no ranking com apelido."));return;}
  if(!s.ok){p.append(muEl("p","sm","Prove uma tarefa com foto. Só seus amigos veem e ela some em 7 dias."));const b=muEl("button","go","Ligar o mural");b.type="button";b.addEventListener("click",()=>muConsent(()=>{muAt=0;muLoad();}));p.append(b);return;}
  const add=muEl("button","ghost","＋ Postar prova de uma tarefa de hoje");add.type="button";add.addEventListener("click",()=>{const tk=todayKey();const done=(prog.log[tk]||[]).map(e=>e.q);
    const qs=((cfg&&cfg.quests)||[]).concat(prog.extra[tk]||[]).filter(q=>done.includes(q.id));if(!qs.length){toast("Conclua uma tarefa primeiro.");return;}
    if(qs.length===1)return muCompose(qs[0]);const m=muEl("div","sysmodal mumodal");const c=muEl("div","card");c.append(muEl("h3",null,"Qual tarefa?"));
    for(const q of qs.slice(0,10)){const b=muEl("button","ghost mupick",q.title);b.type="button";b.addEventListener("click",()=>{m.remove();muCompose(q);});c.append(b);}
    const no=muEl("button","link","Cancelar");no.type="button";no.addEventListener("click",()=>m.remove());c.append(no);m.append(c);document.body.append(m);});p.append(add);
  if(muPosts===null){p.append(muEl("div","sm muted","Carregando o mural…"));return;}
  const muVis=muPosts.filter(x=>!muIsBlk(x.a));
  if(!muVis.length){p.append(muEl("div","sm muted mu0","Nenhuma foto nos últimos 7 dias. Seja o primeiro a provar uma tarefa."));muUnblk(p);return;}
  const me=String(rankName()||"").toLowerCase();const L=muEl("div","mulst");
  for(const x of muVis){if(!muImgOk(x.img))continue;const card=muEl("article","mupost");const top=muEl("div","mutop");
    const av=muEl("span","muav");try{av.innerHTML=frAv(((typeof sqPub!=="undefined"&&sqPub[String(x.a||"").toLowerCase()])||{}).av,32);}catch(e){}
    top.append(av,muEl("b",null,String(x.a||"").slice(0,16)),muEl("span","sm muted",muAgo(x.d)));card.append(top);
    const im=muEl("img","muimg");im.alt="Foto de prova de "+String(x.a||"");im.loading="lazy";im.src=x.img;card.append(im);
    {const qt=String(x.q||"").slice(0,40),cp=x.cap&&MU_CAPS.includes(x.cap)?x.cap:"";const tx=[qt,cp].filter(Boolean).join(" · ")||"Tarefa feita";card.append(muEl("div","muq",(/✅/.test(tx)?"":"✅ ")+tx));}
    const bar=muEl("div","murx");for(const e of MU_REACT){const n=+((x.r||{})[e])||0;const mine=!!((x.my||{})[e]);const b=muEl("button","murb"+(mine?" on":""),e+(n?" "+n:""));b.type="button";b.setAttribute("aria-pressed",mine?"true":"false");b.setAttribute("aria-label","Reagir "+e);
      b.addEventListener("click",()=>{x.my=x.my||{};x.r=x.r||{};x.my[e]=!mine;x.r[e]=Math.max(0,n+(mine?-1:1));muUI();muAct("react",{id:x.id,e});});bar.append(b);}
    const own=String(x.a||"").toLowerCase()===me;const act=muEl("button","link muop",own?"Apagar":"Denunciar");act.type="button";
    act.addEventListener("click",()=>{if(own){if(confirm("Apagar esta foto do mural?")){muPosts=muPosts.filter(y=>y!==x);muUI();muAct("del",{id:x.id},"Foto apagada.");}}
      else if(confirm("Denunciar esta foto? Ela some para você e o criador do app é avisado.")){muPosts=muPosts.filter(y=>y!==x);muUI();muAct("report",{id:x.id},"Denúncia enviada. Obrigado.");}});
    bar.append(act);
    if(!own){const bk=muEl("button","link muop","Bloquear");bk.type="button";bk.setAttribute("aria-label","Bloquear "+String(x.a||"").slice(0,16));
      bk.addEventListener("click",()=>{const nm=String(x.a||"").slice(0,16);if(!confirm("Bloquear "+nm+"? Você para de ver as fotos dessa pessoa no mural. Dá para desfazer no fim do mural."))return;
        const s=muSt();s.blk=Array.isArray(s.blk)?s.blk:[];const k=String(x.a||"").toLowerCase();if(!s.blk.includes(k))s.blk.push(k);s.blk=s.blk.slice(-200);save();muUI();toast("Bloqueio feito: "+nm+". Você não vê mais as fotos dessa pessoa.");});bar.append(bk);}
    card.append(bar);L.append(card);}
  p.append(L);muUnblk(p);}
function muUnblk(p){const n=muBlk().length;if(!n)return;const r=muEl("div","sm muted mublk");r.append(document.createTextNode((n===1?"1 pessoa bloqueada":n+" pessoas bloqueadas")+" · "));
  const b=muEl("button","link","Desbloquear");b.type="button";b.addEventListener("click",()=>{if(!confirm("Voltar a ver as fotos de quem você bloqueou?"))return;muSt().blk=[];save();muUI();toast("Desbloqueado.");});r.append(b);p.append(r);}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest('#tabbar [data-go="amigos"]');if(b)setTimeout(()=>{try{muLoad();}catch(x){}},0);},true);
{const _r=render;render=function(){_r.apply(this,arguments);try{if(!$("muAlbum")||document.body.dataset.tab==="prog")muAlbumUI();}catch(e){}};}
setTimeout(()=>{try{muAlbumUI();muUI();}catch(e){}},0);
