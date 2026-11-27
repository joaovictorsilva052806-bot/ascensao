// ---------- Missões do Mestre (só 18+): spec da EVA 7205176627, trava de idade de 7216423824 ----------
// Cartões de parceiros com regulamento próprio. A lista vem de missoes-mestre.json (na raiz do site), para trocar parceiro,
// valor ou link sem trem novo. Missão sem todos os campos preenchidos (ou com link que não é https) não aparece; lista vazia = seção some.
// Só para 18+ pela trava de tools/idade.js (sem idade = menor no /comecar/; 7 dias depois de ter sido menor; some com parent).
// "Fiz" é autodeclarado: +80 de Ouro uma vez por missão, travado nos 3 primeiros dias de conta. Opcional: quem não faz não perde nada.
// Nada sai do aparelho além do toque no link do parceiro. Só ADICIONA prog.mestre = {id: dia}.
const MM_G=80,MM_KEY="asc-u-mestre-cfg";
let mmList=null,mmTry=0;
function mmEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function mmSt(){let m=prog.mestre;if(!m||typeof m!=="object"||Array.isArray(m))m=prog.mestre={};return m;}
const mmHttps=u=>{try{const x=new URL(String(u||""));return x.protocol==="https:"?x.href:"";}catch(e){return "";}};
function mmClean(j){const L=j&&Array.isArray(j.missoes)?j.missoes:[];const out=[];
  for(const m of L){if(!m||typeof m!=="object")continue;const id=String(m.id||"").replace(/[^a-z0-9_-]/gi,"").slice(0,24),parceiro=String(m.parceiro||"").trim().slice(0,40),
    ganho=String(m.ganho||"").trim().slice(0,80),cond=String(m.cond||"").trim().slice(0,140),mestre=Math.round(+m.mestre*100)/100,link=mmHttps(m.link),regras=mmHttps(m.regras);
    if(id&&parceiro&&ganho&&cond&&mestre>0&&link&&regras)out.push({id,parceiro,ganho,cond,mestre,link,regras});}
  return out;}
function mmUrl(){return (location.pathname.indexOf("/comecar/")>=0?"../":"")+"missoes-mestre.json";}
function mmLoad(){if(mmList||mmTry>2)return;mmTry++;
  try{const c=JSON.parse(localStorage.getItem(MM_KEY)||"null");if(c)mmList=mmClean(c);}catch(e){}
  try{fetch(mmUrl(),{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(j=>{if(!j)return;mmList=mmClean(j);try{localStorage.setItem(MM_KEY,JSON.stringify(j));}catch(e){}mmRender();}).catch(()=>{});}catch(e){}}
const mmBRL=v=>"R$ "+v.toFixed(2).replace(".",",").replace(",00","");
function mmDone(m){const s=mmSt();if(s[m.id])return;if(!adGoldOk()){toast("O Ouro das Missões do Mestre libera no 4º dia de conta.");return;}
  s[m.id]=todayKey();save();let g=0;try{g=orGive("mm:"+m.id,MM_G,"Missão do Mestre");}catch(e){}
  toast("✓ "+m.parceiro+(g?" · +"+g+" 🪙":" · o Ouro entra quando couber no teto do dia"));mmRender();}
function mmRender(){let p=$("mmPanel");const ok=typeof ad18==="function"&&ad18()&&typeof orGive==="function";
  if(ok&&!mmList)mmLoad();
  const L=ok&&mmList?mmList:[];if(!L.length){if(p)p.hidden=true;return;}
  if(!p){const anchor=$("orPanel")||$("bxCol")||document.querySelector('.wrap>section[data-tab="prog"]');if(!anchor)return;p=mmEl("section","panel mmpanel");p.id="mmPanel";p.dataset.tab="prog";anchor.after(p);}
  p.hidden=false;const s=mmSt();const gold=adGoldOk();p.textContent="";
  const hd=mmEl("div","qhead");hd.append(mmEl("h2",null,"🎖️ Missões do Mestre"),mmEl("span","sm mono",L.filter(m=>s[m.id]).length+"/"+L.length));p.append(hd);
  p.append(mmEl("div","sm muted","Missões opcionais de parceiros, só para 18+. Quem não faz não perde nada. Cada uma tem regulamento próprio do parceiro."));
  for(const m of L){const done=!!s[m.id];const c=mmEl("div","mmcard"+(done?" ok":""));c.dataset.mm=m.id;
    c.append(mmEl("span","mmad","Publicidade · indicação"),mmEl("b","mmp",(done?"✓ ":"")+m.parceiro),mmEl("p","mmg","Você ganha: "+m.ganho),mmEl("p","sm mmc","Para liberar: "+m.cond));
    c.append(mmEl("p","mmmestre","O Mestre também ganha "+mmBRL(m.mestre)+" se você concluir."));
    const row=mmEl("div","mmrow");const a=mmEl("a","mmlink","Abrir no "+m.parceiro+" ↗");a.href=m.link;a.target="_blank";a.rel="sponsored noopener noreferrer";
    const r=mmEl("a","mmreg","Regulamento ↗");r.href=m.regras;r.target="_blank";r.rel="noopener noreferrer";row.append(a,r);c.append(row);
    const b=mmEl("button",done?"ghost mmfiz":"mmfiz"+(gold?"":" mmlock"),done?"Feita":gold?"Fiz · +"+MM_G+" 🪙":"Ouro libera no 4º dia de conta");b.type="button";
    if(done)b.disabled=true;else b.addEventListener("click",()=>mmDone(m));b.setAttribute("aria-label",done?m.parceiro+": feita":"Marcar como feita: "+m.parceiro);c.append(b);p.append(c);}
  p.append(mmEl("p","sm muted mmlaw","Idade autodeclarada: o parceiro exige 18+ no cadastro dele. "+OR_LAW));}
{const _r=render;render=function(){_r.apply(this,arguments);try{mmRender();}catch(e){}};}
setTimeout(()=>{try{mmRender();}catch(e){}},80);
