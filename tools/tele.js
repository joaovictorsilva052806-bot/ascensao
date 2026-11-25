// ---------- Painel do criador (LGPD): com o "Aceito", o criador vê seu apelido e como você usa o app ----------
// Vai para a planilha PRIVADA do criador pelo mesmo formulário do ranking. Nunca: localização, contatos, telefone, documentos, fotos.
// Quem recusa (ou tem até 13 anos) entra só no contador anônimo de etapas (abriu, instalou, criou perfil).
// Sair = para de enviar e pede para apagar: some do painel na hora.
const TL_KEY="asc-u-tele";
function tlGet(){try{return JSON.parse(localStorage.getItem(TL_KEY)||"{}")||{};}catch(e){return {};}}
function tlSet(t){try{localStorage.setItem(TL_KEY,JSON.stringify(t));}catch(e){}}
const tlKid=()=>ageNow()==="kid";
const tlPlat=()=>IOS?"iPhone":AND?"Android":"Computador";
const tlDk=d=>dkey(d||new Date()).replace(/-/g,"");
const tlClean=v=>String(v==null?"":v).replace(/[|\n\r]/g," ").slice(0,280);
function tlPost(parts){const v=parts.map(tlClean).join("|");try{fetch(RK_POST,{method:"POST",mode:"no-cors",keepalive:true,body:new URLSearchParams({"entry.807978446":v})}).catch(()=>{});}catch(e){}}
// contador anônimo: 1 vez por etapa por dia, id aleatório sem ligação com o nome
function anonId(){let id="";try{id=localStorage.getItem("asc-anon")||"";if(!id){id="a"+Math.random().toString(36).slice(2,10);localStorage.setItem("asc-anon",id);}}catch(e){id="a0";}return id;}
function anon(step){if(tlKid())return;const t=tlGet();t.an=t.an||{};const k=step+":"+tlDk();if(t.an[k])return;
  for(const x in t.an)if(!x.endsWith(tlDk()))delete t.an[x];t.an[k]=1;tlSet(t);
  tlPost(["A",anonId(),step,tlDk(),tlPlat(),standalone()?"app":"navegador"]);}
// linha identificada
function tlStats(){const y=new Date();y.setDate(y.getDate()-1);const yk=dkey(y);const L=(prog.log[yk]||[]).filter(e=>!/^(ach|boss|foco|sq|checkin|tip|dun):/.test(String(e.q)));
  const ms=mainsFor(y);const skip=ms.filter(q=>!L.some(e=>e.q===q.id)).length;
  let act=0;const d=new Date();for(let i=0;i<14;i++){if((prog.log[dkey(d)]||[]).length)act++;d.setDate(d.getDate()-1);}
  return {xp:totalXP(),lv:levelOf(totalXP()),act,done:L.filter(e=>e.kind!=="min").length,min:L.filter(e=>e.kind==="min").length,skip,streak:(typeof streakDays==="function"?streakDays():""),nq:((cfg&&cfg.quests)||[]).length,ms:+prog.msUsed||0,cards:(prog.cards||[]).length};}
function tlSend(ev,extra){const t=tlGet();if(!t.on||tlKid()||!t.uid)return;const P=(cfg&&cfg.profile)||{};const s=tlStats();
  tlPost(["U",t.uid,t.nick||rankName()||"?",tlPlat(),ev,tlDk(),P.age||"",P.occ||"",s.xp,s.lv,s.act,ev==="dia"?s.done:"",ev==="dia"?s.min:"",ev==="dia"?s.skip:"",s.streak,s.nq,s.ms,s.cards,extra||("v"+(standalone()?"app":"web"))]);}
function tlDaily(){const t=tlGet();if(!t.on||t.last===tlDk())return;tlSend("dia");t.last=tlDk();tlSet(t);}
// aceite interativo no tema do Sistema
function tlAsk(){if(!cfg||cfg.blank||!cfg.quests||!cfg.quests.length||tlKid())return;const t=tlGet();if(t.asked||$("tlModal")||[...document.querySelectorAll(".sysmodal")].some(x=>x.getClientRects().length)||document.body.classList.contains("onboarding")||!$("onb").hidden)return;
  const teen=ageNow()==="teen";const m=document.createElement("div");m.className="sysmodal";m.id="tlModal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");
  const c=document.createElement("div");c.className="card tlc";const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
  c.append(el("div","tag","[ SISTEMA ] PROTOCOLO DE ACESSO"),el("h3",null,"Liberar seu painel para o criador?"),
    el("p","sm","O criador do Ascension vai ver seu apelido e como você usa o app (missões feitas e puladas, XP, nível, dias ativos, aparelho e suas notas) para deixar o jogo melhor para você."),
    el("p","sm muted","Nunca: localização, contatos, telefone, documentos ou fotos. Dá para sair e apagar em Mais > Painel do criador."));
  const lb=el("label","sm tll","Apelido que ele vai ver");const nk=el("input");nk.maxLength=16;nk.autocomplete="off";nk.value=teen?cleanNick(prog.rank&&prog.rank.nick):(rankName()||firstName());nk.placeholder=teen?"Um apelido (não use seu nome real)":"Seu apelido";lb.append(nk);c.append(lb);
  let par=null;if(teen){const l2=el("label","chk sm");par=el("input");par.type="checkbox";l2.append(par,document.createTextNode(" Meu responsável autorizou"));c.append(l2);}
  const msg=el("div","sm tlmsg","");const row=el("div","row");const ok=el("button","go","Aceito");ok.type="button";const no=el("button","ghost","Agora não");no.type="button";row.append(ok,no);c.append(msg,row);
  ok.addEventListener("click",()=>{const n=cleanNick(nk.value);if(!n){msg.textContent="Escolha um apelido.";nk.focus();return;}if(teen&&!(par&&par.checked)){msg.textContent="Marque que seu responsável autorizou.";return;}
    const t2=tlGet();Object.assign(t2,{on:true,asked:true,nick:n,uid:t2.uid||("u"+Math.random().toString(36).slice(2,10)),since:tlDk(),parent:teen?1:0});tlSet(t2);
    m.remove();tlSend("aceite");anon("5-aceitou");Object.assign(t2,{last:tlDk()});tlSet(t2);try{haptic([15,40,15]);}catch(e){}toast("Acesso liberado. Valeu, "+n+"!");tlUI();});
  no.addEventListener("click",()=>{const t2=tlGet();t2.asked=true;t2.on=false;tlSet(t2);m.remove();anon("5-recusou");toast("Tudo certo. Só a contagem anônima fica ligada.");tlUI();});
  m.append(c);document.body.append(m);}
function tlLeave(){const t=tlGet();if(!t.on)return;if(!confirm("Sair do painel do criador e pedir para apagar seus dados?"))return;
  tlSend("sair","pedido de exclusão");t.on=false;t.left=tlDk();tlSet(t);tlUI();toast("Pronto. Você saiu e seus dados somem do painel do criador.");}
// Mais > Painel do criador
function tlUI(){let p=$("tlPanel");if(!p){const anchor=$("betaPanel");if(!anchor)return;p=document.createElement("section");p.className="panel";p.id="tlPanel";p.dataset.tab="mais";
    const hd=document.createElement("div");hd.className="qhead";const h=document.createElement("h2");h.textContent="🛰️ Painel do criador";hd.append(h);const bd=document.createElement("div");bd.id="tlBody";bd.className="tlbody";p.append(hd,bd);anchor.after(p);}
  const bd=$("tlBody");const t=tlGet(),kid=tlKid();bd.textContent="";
  const s=document.createElement("div");s.className="sm";s.textContent=kid?"Para quem tem até 13 anos fica desligado. Nada com seu nome sai do celular.":t.on?("Ligado como \""+(t.nick||"")+"\". O criador vê seu apelido e como você usa o app. Nunca localização, contatos, telefone ou fotos."):"Desligado. Só uma contagem anônima (abriu, instalou) sai do celular.";bd.append(s);
  if(kid)return;const r=document.createElement("div");r.className="row";const b=document.createElement("button");b.type="button";
  if(t.on){b.className="link";b.textContent="Sair e apagar meus dados";b.addEventListener("click",tlLeave);}else{b.className="go";b.textContent="Liberar meu painel";b.addEventListener("click",()=>{const t2=tlGet();t2.asked=false;tlSet(t2);tlAsk();});}
  r.append(b);bd.append(r);}
// nota do "Teste do app" também vai identificada para quem aceitou
{const bs=$("betaSend");if(bs)bs.addEventListener("click",()=>{try{const t=tlGet();if(!t.on||tlKid()||!betaRate)return;const tx=$("betaText").value.trim().replace(/\S+@\S+/g,"[email]").replace(/\+?\d[\d\s().-]{7,}\d/g,"[número]").slice(0,240);tlSend("nota",betaRate+": "+tx);}catch(e){}},true);}
function tlBoot(){try{anon(standalone()?"3-abriu-app":"2-abriu-navegador");if(cfg&&!cfg.blank&&cfg.quests&&cfg.quests.length){anon("4-perfil");tlDaily();setTimeout(tlAsk,2500);}tlUI();}catch(e){}}
setTimeout(tlBoot,1200);
// quem acabou de criar o perfil vê o aceite depois de fechar os avisos de boas-vindas
let tlTry=0;const tlIv=setInterval(()=>{if(tlGet().asked||tlKid()||++tlTry>120){clearInterval(tlIv);return;}try{if(cfg&&cfg.quests&&cfg.quests.length){anon("4-perfil");tlAsk();}}catch(e){}},5000);
