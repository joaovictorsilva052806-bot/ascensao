// ---------- Painel do criador (LGPD): com o "Aceito", o criador vê seu apelido e como você usa o app ----------
// Vai para a planilha PRIVADA do criador pelo mesmo formulário do ranking. Nunca: localização, contatos, telefone, documentos, fotos.
// Contador anônimo de etapas (abriu, instalou, criou perfil) só para quem deu opt-in; quem recusa ou tem até 13 anos não envia nada.
// Sair = para de enviar e pede para apagar: some do painel na hora.
const TL_KEY="asc-u-tele";
function tlGet(){try{return JSON.parse(localStorage.getItem(TL_KEY)||"{}")||{};}catch(e){return {};}}
function tlSet(t){try{localStorage.setItem(TL_KEY,JSON.stringify(t));}catch(e){}}
const tlKid=()=>ageNow()==="kid";
const tlPlat=()=>IOS?"iPhone":AND?"Android":"Computador";
const tlDk=d=>dkey(d||new Date()).replace(/-/g,"");
const tlClean=v=>String(v==null?"":v).replace(/[|\n\r]/g," ").slice(0,280);
function tlPost(parts){const v=parts.map(tlClean).join("|");try{fetch(RK_POST,{method:"POST",mode:"no-cors",keepalive:true,body:new URLSearchParams({"entry.807978446":v})}).catch(()=>{});}catch(e){}}
// contador anônimo: 1 vez por etapa por dia, id aleatório sem ligação com o nome.
// Só com opt-in (aceite do painel ou "sim" do beta anônimo): sem consentimento, nada sai do celular.
// Folga na LGPD: idade desconhecida conta como "não pode"; 14-17 só com a autorização do responsável gravada no próprio aceite.
function tlTeenOk(o){return ageNow()!=="teen"||!!(o&&o.parent);}
function tlAgeOk(){const a=ageNow();return !!a&&a!=="kid";}
function anonOk(){if(!tlAgeOk())return false;const t=tlGet();if(t.on&&tlTeenOk(t))return true;try{const b=JSON.parse(localStorage.getItem("asc-u-beta")||"{}")||{};return !!b.on&&tlTeenOk(b);}catch(e){return false;}}
function anonId(){let id="";try{id=localStorage.getItem("asc-anon")||"";if(!id){id="a"+Math.random().toString(36).slice(2,10);localStorage.setItem("asc-anon",id);}}catch(e){id="a0";}return id;}
function anon(step){if(!anonOk())return;const t=tlGet();t.an=t.an||{};const k=step+":"+tlDk();if(t.an[k])return;
  for(const x in t.an)if(!x.endsWith(tlDk()))delete t.an[x];t.an[k]=1;tlSet(t);
  tlPost(["A",anonId(),step,tlDk(),tlPlat(),standalone()?"app":"navegador"]);}
// linha identificada
function tlStats(){const y=new Date();y.setDate(y.getDate()-1);const yk=dkey(y);const L=(prog.log[yk]||[]).filter(e=>!/^(ach|boss|foco|sq|checkin|tip|dun|zap|ch):/.test(String(e.q)));
  const ms=mainsFor(y);const skip=ms.filter(q=>!L.some(e=>e.q===q.id)).length;
  let act=0;const d=new Date();for(let i=0;i<14;i++){if((prog.log[dkey(d)]||[]).length)act++;d.setDate(d.getDate()-1);}
  return {xp:totalXP(),lv:levelOf(totalXP()),act,done:L.filter(e=>e.kind!=="min").length,min:L.filter(e=>e.kind==="min").length,skip,streak:(typeof streakDays==="function"?streakDays():""),nq:((cfg&&cfg.quests)||[]).length,ms:+prog.msUsed||0,cards:(prog.cards||[]).length};}
function tlSend(ev,extra){const t=tlGet();if(!t.on||!t.uid||(ev!=="sair"&&(!tlAgeOk()||!tlTeenOk(t))))return;const P=(cfg&&cfg.profile)||{};const s=tlStats();
  tlPost(["U",t.uid,t.nick||rankName()||"?",tlPlat(),ev,tlDk(),P.age||"",P.occ||"",s.xp,s.lv,s.act,ev==="dia"?s.done:"",ev==="dia"?s.min:"",ev==="dia"?s.skip:"",s.streak,s.nq,s.ms,s.cards,extra||("v"+(standalone()?"app":"web"))]);}
function tlDaily(){const t=tlGet();if(!t.on||t.last===tlDk())return;tlSend("dia");t.last=tlDk();tlSet(t);}
// aceite interativo no tema do Sistema
// QA 60 s (28/11): o pedido não abre antes da 1ª missão de verdade (abria por cima do 1º toque no ▶) e os dois botões têm o mesmo peso (LGPD).
function tlMissionDone(){try{for(const k in prog.log)if((prog.log[k]||[]).some(e=>e&&!/^(ach|checkin|tip|zap|ch|adm):/.test(String(e.q))&&e.kind!=="checkin"))return true;}catch(e){}return false;}
function tlAsk(){if(document.body.classList.contains("insm")){setTimeout(tlAsk,5000);return;}if(!cfg||cfg.blank||!cfg.quests||!cfg.quests.length||!tlAgeOk()||!tlMissionDone())return;const t=tlGet();if(t.asked||(t.disp&&t.disp!==tlDk())||$("tlModal")||[...document.querySelectorAll(".sysmodal")].some(x=>x.getClientRects().length)||document.body.classList.contains("onboarding")||document.body.classList.contains("inmission")||!$("onb").hidden)return;
  const teen=ageNow()==="teen";const m=document.createElement("div");m.className="sysmodal";m.id="tlModal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");
  const c=document.createElement("div");c.className="card tlc";const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
  c.append(el("div","tag","[ SISTEMA ] PROTOCOLO DE ACESSO"),el("h3",null,"Liberar seu painel para o criador?"),
    el("p","sm","O criador do Ascension vai ver seu apelido e como você usa o app (missões feitas e puladas, XP, nível, dias ativos, aparelho e suas notas) para deixar o jogo melhor para você."),
    el("p","sm muted","Nunca: localização, contatos, telefone, documentos ou fotos. Dá para sair e apagar em Mais > Painel do criador."));
  const lb=el("label","sm tll","Apelido que ele vai ver");const nk=el("input");nk.maxLength=16;nk.autocomplete="off";nk.value=teen?cleanNick(prog.rank&&prog.rank.nick):(rankName()||firstName());nk.placeholder=teen?"Um apelido (não use seu nome real)":"Seu apelido";lb.append(nk);c.append(lb);
  let par=null;if(teen){const l2=el("label","chk sm");par=el("input");par.type="checkbox";l2.append(par,document.createTextNode(" Meu responsável autorizou"));c.append(l2);}
  const msg=el("div","sm tlmsg","");const row=el("div","row");const ok=el("button","ghost tlb","Aceito");ok.type="button";const no=el("button","ghost tlb","Agora não");no.type="button";row.append(ok,no);c.append(msg,row);
  ok.addEventListener("click",()=>{const n=cleanNick(nk.value);if(!n){msg.textContent="Escolha um apelido.";nk.focus();return;}if(teen&&!(par&&par.checked)){msg.textContent="Marque que seu responsável autorizou.";return;}
    const t2=tlGet();Object.assign(t2,{on:true,asked:true,nick:n,uid:t2.uid||("u"+Math.random().toString(36).slice(2,10)),since:tlDk(),parent:teen?1:0});tlSet(t2);
    m.remove();tlSend("aceite");anon("5-aceitou");Object.assign(t2,{last:tlDk()});tlSet(t2);try{haptic([15,40,15]);}catch(e){}toast("Acesso liberado. Valeu, "+n+"!");tlUI();});
  no.addEventListener("click",()=>{const t2=tlGet();t2.asked=true;t2.on=false;tlSet(t2);m.remove();anon("5-recusou");toast("Tudo certo. Nada sai do seu celular.");tlUI();});
  m.append(c);document.body.append(m);}
function tlLeave(){const t=tlGet();if(!t.on)return;if(!confirm("Sair do painel do criador e pedir para apagar seus dados?"))return;
  tlSend("sair","pedido de exclusão");t.on=false;t.left=tlDk();tlSet(t);tlUI();toast("Pronto. Você saiu e seus dados somem do painel do criador.");}
// Mais > Painel do criador
function tlUI(){let p=$("tlPanel");if(!p){const anchor=$("betaPanel");if(!anchor)return;p=document.createElement("section");p.className="panel";p.id="tlPanel";p.dataset.tab="mais";
    const hd=document.createElement("div");hd.className="qhead";const h=document.createElement("h2");h.textContent="🛰️ Seus dados e o criador";hd.append(h);const bd=document.createElement("div");bd.id="tlBody";bd.className="tlbody";p.append(hd,bd);anchor.after(p);}
  const bd=$("tlBody");const t=tlGet(),kid=tlKid();bd.textContent="";
  const s=document.createElement("div");s.className="sm";s.textContent=kid?"Para quem tem até 13 anos fica desligado. Nada com seu nome sai do celular.":t.on?("Ligado como \""+(t.nick||"")+"\". O criador vê seu apelido e como você usa o app. Nunca localização, contatos, telefone ou fotos."):"Desligado. Nada com seu nome sai do celular.";bd.append(s);
  if(kid)return;const r=document.createElement("div");r.className="row";const b=document.createElement("button");b.type="button";
  if(t.on){b.className="link";b.textContent="Sair e apagar meus dados";b.addEventListener("click",tlLeave);}else{b.className="go";b.textContent="Liberar meu painel";b.addEventListener("click",()=>{const t2=tlGet();t2.asked=false;tlSet(t2);tlAsk();});}
  r.append(b);bd.append(r);}
// nota do "Teste do app" também vai identificada para quem aceitou
{const bs=$("betaSend");if(bs)bs.addEventListener("click",()=>{try{const t=tlGet();if(!t.on||!tlAgeOk()||!tlTeenOk(t)||!betaRate)return;const tx=$("betaText").value.trim().replace(/\S+@\S+/g,"[email]").replace(/\+?\d[\d\s().-]{7,}\d/g,"[número]").slice(0,240);tlSend("nota",betaRate+": "+tx);}catch(e){}},true);}
// funil anônimo do dia (mesmo opt-in e mesmo formato A|id|etapa|data): fez 1 missão de verdade hoje; fechou o dia (baú liberado)
// Os 3 números do JV (28/11), mesmo opt-in e mesmo formato anônimo: 9-novo (perfil criado hoje), 10-ativou (1ª missão de verdade, 1 vez na vida),
// 11-voltou-d1 / 12-voltou-d7 (abriu 1 e 7 dias depois de criar o perfil), 13-convidou (mandou convite ou código da guilda, 1 por dia).
// O dia de entrada é o cfg.startDate que o app já tem: quem já jogava não conta como novo.
function tlDays(){const s=cfg&&cfg.startDate;if(!/^\d{4}-\d{2}-\d{2}$/.test(s||""))return null;return Math.round((new Date(todayKey()+"T12:00")-new Date(s+"T12:00"))/864e5);}
function tlOnce(step,flag){const t=tlGet();if(t[flag])return;if(!anonOk())return;t[flag]=tlDk();tlSet(t);anon(step);}
function tlCohort(){try{if(!anonOk()||!cfg||cfg.blank||!cfg.quests||!cfg.quests.length)return;const d=tlDays();if(d==null)return;
  if(d===0)tlOnce("9-novo","n0");if(d===1)tlOnce("11-voltou-d1","r1");if(d===7)tlOnce("12-voltou-d7","r7");}catch(e){}}
function tlInvited(){try{anon("13-convidou");}catch(e){}}
function tlFunnel(){try{if(!anonOk()||!cfg||cfg.blank||!cfg.quests||!cfg.quests.length)return;const L=prog.log[todayKey()]||[];const ids=new Set(cfg.quests.map(q=>q.id));
  if(L.some(e=>ids.has(e.q))){anon("7-quest");const d=tlDays();if(d!=null&&d<=7)tlOnce("10-ativou","a1");}tlCohort();if(typeof bxReady==="function"&&bxReady())anon("8-fechou-dia");}catch(e){}}
function tlBoot(){try{anon(standalone()?"3-abriu-app":"2-abriu-navegador");if(cfg&&!cfg.blank&&cfg.quests&&cfg.quests.length){anon("4-perfil");tlDaily();tlZap();setTimeout(tlAsk,2500);}tlUI();tlFunnel();setInterval(tlFunnel,15000);document.addEventListener("visibilitychange",()=>{if(document.hidden)tlFunnel();});}catch(e){}}
// Métrica dos desafios relâmpago (só com opt-in, anônima: id aleatório, sem apelido): 1 linha por dia sobre ONTEM.
// A|id|6-desafios|dia de ontem|aparelho|app/navegador|feitos de 3|dupla 0/1|sensor 0/1|usou o app ontem 0/1
function tlZap(){if(!anonOk()||typeof zapToday!=="function")return;const t=tlGet();const y=new Date();y.setDate(y.getDate()-1);const yk=dkey(y),yd=yk.replace(/-/g,"");if(t.zd===yd)return;
  const n=Object.keys(((prog.zap||{})[yk])||{}).length;const L=prog.log[yk]||[];const duo=L.some(e=>String(e.q).startsWith("zap:duo:"))?1:0;
  let mo=0;try{mo=(JSON.parse(localStorage.getItem("asc-u-zapmo")||"{}")||{})[yk]?1:0;}catch(e){}
  t.zd=yd;tlSet(t);tlPost(["A",anonId(),"6-desafios",yd,tlPlat(),standalone()?"app":"navegador",Math.min(3,n)+"/3",duo,mo,L.length?1:0]);}
setTimeout(tlBoot,1200);
// quem acabou de criar o perfil vê o aceite depois de fechar os avisos de boas-vindas
let tlTry=0;const tlIv=setInterval(()=>{if(tlGet().asked||tlKid()||++tlTry>120){clearInterval(tlIv);return;}try{if(cfg&&cfg.quests&&cfg.quests.length){anon("4-perfil");tlAsk();}}catch(e){}},5000);
// um aviso por vez: se outro aviso do Sistema abrir por cima, o pedido do painel sai de cena e volta depois (sem contar como resposta)
if(window.MutationObserver)new MutationObserver(ms=>{const tm=$("tlModal");if(!tm)return;for(const m of ms)for(const n of m.addedNodes){if(n!==tm&&n.nodeType===1&&n.classList&&n.classList.contains("sysmodal")&&!n.hidden){tm.remove();const t=tlGet();if(!t.disp){t.disp=tlDk();tlSet(t);}setTimeout(tlAsk,20000);return;}}}).observe(document.body,{childList:true});
