// ---------- Pedido de avaliação (tools/aval.*): convite leve depois de uma conquista ----------
// Só aparece para quem ligou o Teste do app (beta anônimo; 14 a 17 com responsável; até 13 nunca).
// Nunca no 1º dia de uso, no máximo 1 vez a cada 30 dias, some de vez depois de 2 "Agora não".
// NUNCA dá XP, Ouro ou item: avaliação não é trocada por recompensa (regra das lojas).
// Estado só em asc-u-aval (fora do prog). A nota (1 a 5) e o comentário opcional saem pelo mesmo canal do beta.
const AVL_KEY="asc-u-aval",AVL_GAP=30,AVL_GAP_SENT=90;
function avlGet(){try{return JSON.parse(localStorage.getItem(AVL_KEY)||"{}")||{};}catch(e){return {};}}
function avlSet(a){try{localStorage.setItem(AVL_KEY,JSON.stringify(a));}catch(e){}}
const avlDays=(a,b)=>Math.round((new Date(b)-new Date(a))/864e5);
// comentário anônimo: sem e-mail, link, @perfil ou número de telefone; no máximo 140 letras
function avlClean(t){return String(t||"").replace(/\S+@\S+/g,"").replace(/(https?:\/\/|www\.)\S+/gi,"").replace(/@\w+/g,"").replace(/(\d[\s().-]*){6,}/g,"").replace(/[|\r\n]+/g," ").replace(/\s+/g," ").trim().slice(0,140);}
function avlBeta(){try{const b=betaGet();return !!b.on&&!betaKid()&&!!betaAge()&&!(betaAge()==="teen"&&!b.parent);}catch(e){return false;}}
function avlFirstDay(){let f="";try{for(const e of entries())if(!/^(ach|checkin|tip|dun|sq|zap|ch|adm):/.test(String(e.q))&&(!f||e.date<f))f=e.date;}catch(e){}return f;}
function avlOk(){const a=avlGet(),tk=todayKey();if(a.off||(a.no||0)>=2||!cfg||cfg.blank||!avlBeta())return false;
  const f=avlFirstDay();if(!f||f>=tk)return false;if(activeDays()<2)return false;
  if(a.last&&avlDays(a.last,tk)<AVL_GAP)return false;if(a.sent&&avlDays(a.sent,tk)<AVL_GAP_SENT)return false;return true;}
function avlBusy(){let q=0;try{q=sysQ.length;}catch(e){}const b=document.body.classList;
  return q>0||b.contains("onboarding")||b.contains("inmission")||b.contains("inroom")||b.contains("infz")||!!document.getElementById("lembOffer")||
    [...document.querySelectorAll(".sysmodal,.levelup,#clsModal,#onb")].some(m=>!m.hidden&&m.getClientRects().length);}
let avlTry=null,avlSession=false;
// chamado depois de uma conquista: espera as janelas do Sistema fecharem e só então mostra o cartão
function avlMaybe(why){if(avlSession||avlTry||!avlOk())return;let n=0;
  avlTry=setInterval(()=>{if(++n>40||!avlOk()){clearInterval(avlTry);avlTry=null;return;}if(avlBusy())return;clearInterval(avlTry);avlTry=null;avlShow(why);},1500);}
function avlEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function avlShow(why){if(document.getElementById("avlCard"))return;avlSession=true;const a=avlGet();a.last=todayKey();a.n=(a.n||0)+1;avlSet(a);
  let nota=0;const m=avlEl("div","sysmodal avl");m.id="avlCard";m.setAttribute("aria-modal","true");const c=avlEl("div","card");
  const tag=avlEl("div","tag","[ SISTEMA ] CALIBRAGEM");const h=avlEl("h3",null,"Como está sua jornada?");h.id="avlT";m.setAttribute("aria-labelledby","avlT");
  const p=avlEl("p","sm","Dê uma nota ao app. É anônimo e não vale XP nem Ouro.");p.id="avlP";m.setAttribute("aria-describedby","avlP");
  const st=avlEl("div","avlstars");st.setAttribute("role","radiogroup");st.setAttribute("aria-label","Nota de 1 a 5");const bs=[];
  const lbl=avlEl("div","sm muted avllbl","Toque numa estrela.");lbl.setAttribute("aria-live","polite");
  const send=avlEl("button","go","Enviar nota");send.type="button";send.disabled=true;
  for(let i=1;i<=5;i++){const b=avlEl("button","avlstar","★");b.type="button";b.dataset.n=i;b.setAttribute("role","radio");b.setAttribute("aria-checked","false");b.setAttribute("aria-label",i+(i>1?" estrelas":" estrela"));
    b.addEventListener("click",()=>{nota=i;bs.forEach((x,k)=>{x.classList.toggle("on",k<i);x.setAttribute("aria-checked",k===i-1?"true":"false");});send.disabled=false;lbl.textContent=["","Fraco","Dá para melhorar","Bom","Muito bom","Lendário"][i];});bs.push(b);st.append(b);}
  const ta=avlEl("textarea","avltxt");ta.maxLength=140;ta.rows=2;ta.placeholder="Comentário (opcional). Sem nome ou contato.";ta.setAttribute("aria-label","Comentário opcional");
  const no=avlEl("button","ghost","Agora não");no.type="button";
  const close=cnt=>{if(cnt){const x=avlGet();x.no=(x.no||0)+1;if(x.no>=2)x.off=true;avlSet(x);}m.remove();};
  no.addEventListener("click",()=>close(true));
  send.addEventListener("click",()=>{if(!nota)return;const x=avlGet();x.sent=todayKey();x.nota=nota;avlSet(x);
    try{betaPost([betaGet().id||betaId(),"aval",todayKey().replace(/-/g,""),nota,why||"",avlClean(ta.value)]);}catch(e){}
    c.textContent="";const t2=avlEl("div","tag","[ SISTEMA ] REGISTRADO");const h2=avlEl("h3",null,"Nota recebida");h2.id="avlT";
    const p2=avlEl("p","sm","Obrigado. O Sistema usa isso para ficar melhor para você.");p2.id="avlP";
    const f=avlEl("button","go","Fechar");f.type="button";f.dataset.esc="1";f.addEventListener("click",()=>close(false));c.append(t2,h2,p2,f);setTimeout(()=>{try{f.focus({preventScroll:true});}catch(e){}},30);});
  // Esc fecha sem contar como "Agora não" (o intervalo de 30 dias já vale)
  m.addEventListener("keydown",e=>{if(e.key==="Escape"&&!m.querySelector("[data-esc]")){e.preventDefault();e.stopPropagation();close(false);}});
  const row=avlEl("div","avlrow");row.append(send,no);c.append(tag,h,p,st,lbl,ta,row);m.append(c);document.body.append(m);
  setTimeout(()=>{try{bs[0].focus({preventScroll:true});}catch(e){}},80);}
// conquistas que podem abrir o convite: missão concluída (com 3+ dias de sequência ou 3+ dias ativos) e Task que paga concluída
{const _tg=toggle;toggle=function(q,kind){const k=todayKey(),b=(prog.log[k]||[]).length;const r=_tg.apply(this,arguments);
  try{if((prog.log[k]||[]).length>b&&(streakDays()>=3||activeDays()>=3))setTimeout(()=>avlMaybe("missao"),1200);}catch(e){}return r;};}
if(typeof tpStep==="function"){const _ts=tpStep;tpStep=function(T){const was=!!(tpSt()[T.id]||{}).f;const r=_ts.apply(this,arguments);
  try{if(!was&&(tpSt()[T.id]||{}).f)setTimeout(()=>avlMaybe("task"),1500);}catch(e){}return r;};}
