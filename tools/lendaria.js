// ---------- Missões de Parceiros: missões lendárias patrocinadas (só 18+, no topo da aba Lendárias; sem a aba, na aba Foco; chamada em Hoje) ----------
// Lista em missoes-lendarias.json (raiz do site), para trocar parceiro, texto ou link sem trem novo. Missão sem os campos
// obrigatórios (ou link que não é https) não aparece; lista vazia = a área some.
// "teste": true = só o Modo Criador vê (o JV testa antes de abrir a todos). O resto só para 18+ pela trava de tools/idade.js.
// Conteúdo de parceiro: selo "Publicidade · parceiro" sempre visível e link com rel="sponsored". Nada é sorteado nem comprável.
// "indicacao": true = o link é de indicação do criador: o card diz, sem letra miúda, que o criador ganha se a pessoa entrar por ele.
// O app não guarda, recebe nem repassa dinheiro: quem paga é o parceiro, direto ao jogador. Ouro é do jogo e não vale dinheiro.
// Jogador marca cada passo; ao fechar todos: +80 de Ouro uma vez por missão (travado nos 3 primeiros dias de conta).
// Só ADICIONA prog.lend = {id:{s:{passo:dia}, f:dia}}.
const LN_G=80,LN_KEY=(location.pathname.indexOf("/comecar/")>=0?"asc-u":"ascensao")+"-lend-cfg";
let lnList=null,lnTry=0,lnOpen=null;
function lnEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
const lnHttps=u=>{try{const x=new URL(String(u||""));return x.protocol==="https:"?x.href:"";}catch(e){return "";}};
function lnClean(j){const L=j&&Array.isArray(j.missoes)?j.missoes:[];const out=[];
  for(const m of L.slice(0,12)){if(!m||typeof m!=="object")continue;
    const id=String(m.id||"").replace(/[^a-z0-9_-]/gi,"").slice(0,24),parceiro=String(m.parceiro||"").trim().slice(0,40),titulo=String(m.titulo||"").trim().slice(0,70),
      ganho=String(m.ganho||"").trim().slice(0,200),passos=(Array.isArray(m.passos)?m.passos:[]).map(x=>String(x||"").trim().slice(0,160)).filter(Boolean).slice(0,6),
      link=lnHttps(m.link),regras=lnHttps(m.regras),teste=m.teste===true,ind=m.indicacao===true;
    if(id&&parceiro&&titulo&&ganho&&passos.length&&link)out.push({id,parceiro,titulo,ganho,passos,link,regras,teste,ind});}
  return out;}
function lnUrl(){return (location.pathname.indexOf("/comecar/")>=0?"../":"")+"missoes-lendarias.json";}
function lnLoad(){if(lnList||lnTry>2)return;lnTry++;
  try{const c=JSON.parse(localStorage.getItem(LN_KEY)||"null");if(c)lnList=lnClean(c);}catch(e){}
  try{fetch(lnUrl(),{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(j=>{if(!j)return;lnList=lnClean(j);try{localStorage.setItem(LN_KEY,JSON.stringify(j));}catch(e){}lnRender();}).catch(()=>{});}catch(e){}}
function lnCreator(){try{return typeof crOn==="function"&&crOn();}catch(e){return false;}}
function lnAdult(){try{return typeof ad18==="function"&&ad18();}catch(e){return false;}}
function lnReady(){try{return !!(cfg&&!cfg.blank&&cfg.quests&&cfg.quests.length);}catch(e){return false;}}
function lnVis(){if(!lnReady())return [];if(!lnList)lnLoad();const L=lnList||[];const ad=lnAdult(),cr=lnCreator();return L.filter(m=>m.teste?cr:ad);}
function lnSt(){let r=prog.lend;if(!r||typeof r!=="object"||Array.isArray(r))r=prog.lend={};return r;}
function lnM(m){const r=lnSt();let x=r[m.id];if(!x||typeof x!=="object"||Array.isArray(x))x=r[m.id]={};if(!x.s||typeof x.s!=="object"||Array.isArray(x.s))x.s={};return x;}
function lnN(m){const s=lnM(m).s;return m.passos.filter((p,i)=>s[i]).length;}
function lnStep(m,i){const x=lnM(m),s=x.s;
  if(s[i])delete s[i];else s[i]=todayKey();
  const all=m.passos.every((p,k)=>s[k]);let g=0;
  if(all&&!x.f){x.f=todayKey();
    if(typeof adGoldOk==="function"&&adGoldOk()){try{if(typeof orGive==="function")g=orGive("ln:"+m.id,LN_G,"Missão Lendária");}catch(e){}}
    try{haptic([10,30,10,30,20]);}catch(e){}save();
    try{sysPop("MISSÃO LENDÁRIA CONCLUÍDA",m.titulo,"Você fechou todos os passos. Se tiver ganho, ele vem direto da "+m.parceiro+", não do app."+(g?" +"+g+" 🪙 de Ouro.":""),null,"Fechar");}catch(e){toast("⚜️ Missão Lendária concluída"+(g?" · +"+g+" 🪙":""));}}
  else{if(!all&&x.f)delete x.f;save();}
  lnOpen=m.id;lnRender();}
function lnCard(m){const x=lnM(m),s=x.s,n=lnN(m),done=!!x.f;
  const c=lnEl("article","lncard"+(done?" ok":""));c.dataset.ln=m.id;
  const top=lnEl("div","lntop");top.append(lnEl("span","lnrar","LENDÁRIA"),lnEl("span","lnad","Publicidade · parceiro"));if(m.teste)top.append(lnEl("span","lntest","TESTE · só você vê"));c.append(top);
  c.append(lnEl("b","lnt",(done?"✓ ":"")+m.titulo),lnEl("span","sm lnp",m.parceiro));
  c.append(lnEl("p","lng","💰 "+m.ganho));
  if(m.ind)c.append(lnEl("p","sm lnind","Transparência: este é o link de indicação do criador do app. Se você se cadastrar por ele, o criador ganha uma comissão da "+m.parceiro+". Para você não muda nada."));
  const bar=lnEl("div","lnbar");bar.setAttribute("role","progressbar");bar.setAttribute("aria-label","Passos feitos");bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax",String(m.passos.length));bar.setAttribute("aria-valuenow",String(n));
  const fill=lnEl("i");fill.style.width=Math.round(n/m.passos.length*100)+"%";bar.append(fill);c.append(bar);
  const d=lnEl("details","lnsteps");d.open=lnOpen===m.id;d.addEventListener("toggle",()=>{if(d.open)lnOpen=m.id;else if(lnOpen===m.id)lnOpen=null;});
  d.append(lnEl("summary",null,done?"Ver os passos ("+n+"/"+m.passos.length+")":"Começar a missão · "+n+"/"+m.passos.length+" passos"));
  const ol=lnEl("ol");m.passos.forEach((p,i)=>{const li=lnEl("li");const b=lnEl("button",(s[i]?"ghost":"go")+" lnbtn",(s[i]?"✓ ":"")+p);b.type="button";b.dataset.i=i;
    b.setAttribute("aria-pressed",s[i]?"true":"false");b.addEventListener("click",()=>lnStep(m,i));li.append(b);ol.append(li);});d.append(ol);c.append(d);
  const row=lnEl("div","lnrow");const a=lnEl("a","lnlink","Abrir a "+m.parceiro+" ↗");a.href=m.link;a.target="_blank";a.rel="sponsored noopener noreferrer";row.append(a);
  if(m.regras){const r=lnEl("a","lnreg","Regras ↗");r.href=m.regras;r.target="_blank";r.rel="noopener noreferrer";row.append(r);}c.append(row);
  c.append(lnEl("p","sm muted lnrew",done?"✓ Concluída. O Ouro desta missão já entrou (uma vez só).":(typeof adGoldOk==="function"&&adGoldOk()?"Fechou todos os passos: +"+LN_G+" 🪙 de Ouro (uma vez só).":"O Ouro desta missão libera no 4º dia de conta.")));
  return c;}
function lnRender(){const L=lnVis();let p=$("lnPanel"),t=$("lnTease");
  if(!L.length){if(p)p.hidden=true;if(t)t.hidden=true;return;}
  // casa: no topo da aba Lendárias quando ela existe para a pessoa; senão, na aba Foco (ex.: Modo Criador sem idade no perfil)
  const lb=document.querySelector('#tabbar [data-go="lenda"]'),tp=$("tpPanel"),inL=!!(lb&&!lb.hidden&&tp&&!tp.hidden);
  if(!p){p=lnEl("section","panel lnpanel");p.id="lnPanel";p.dataset.sf="1";}
  if(inL){p.dataset.tab="lenda";if(p.nextElementSibling!==tp)tp.before(p);}
  else{p.dataset.tab="foco";const f=$("focusPanel");if(!f)return;if(f.nextElementSibling!==p)f.after(p);}
  p.hidden=false;p.textContent="";const r=lnSt();const n=L.filter(m=>r[m.id]&&r[m.id].f).length;
  const hd=lnEl("div","qhead lnhd");hd.append(lnEl("h2",null,"🏷️ Missões de Parceiros"),lnEl("span","sm mono","18+ · "+n+"/"+L.length));p.append(hd);
  p.append(lnEl("div","sm lnintro","Missões de parceiros em que quem paga é o parceiro, direto para você. Opcionais: quem não faz não perde nada."));
  for(const m of L)p.append(lnCard(m));
  p.append(lnEl("p","sm muted lnlaw","Sem promessa de ganho: cada parceiro tem as próprias regras e exige 18+ no cadastro. O app não guarda seu link nem dinheiro nenhum. "+(typeof OR_LAW==="string"?OR_LAW:"")));
  // chamada em Hoje: 1 toque leva para a área
  const left=L.filter(m=>!(r[m.id]&&r[m.id].f));
  if(!t){const q=$("quests");const sec=q&&q.closest("section");if(!sec)return;t=lnEl("section","panel lntease");t.id="lnTease";t.dataset.tab="hoje";t.dataset.sf="1";
    const b=lnEl("button","lntbtn");b.type="button";b.addEventListener("click",()=>{const pp0=$("lnPanel");try{goTab(pp0&&pp0.dataset.tab||"foco");}catch(e){}const pp=$("lnPanel");if(pp)setTimeout(()=>pp.scrollIntoView({block:"start"}),60);});t.append(b);sec.after(t);}
  if(!left.length){t.hidden=true;return;}
  t.hidden=false;const b=t.firstElementChild;b.textContent="";
  b.append(lnEl("span","lnrar","LENDÁRIA"),lnEl("span","lntt",left.length===1?"1 missão que paga te espera":left.length+" missões que pagam te esperam"),lnEl("span","lntgo","Ver ›"));
  b.setAttribute("aria-label","Missões de parceiros: "+left.length+(left.length>1?" disponíveis":" disponível")+". Abrir.");}
{const _r=render;render=function(){_r.apply(this,arguments);try{lnRender();}catch(e){}};}
setTimeout(()=>{try{lnRender();}catch(e){}},90);
