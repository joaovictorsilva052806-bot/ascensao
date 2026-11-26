// ---------- Marcos da coleção: cada segredo, moldura e título conta para um prêmio exclusivo ----------
// Gradiente de meta: quanto mais perto do prêmio, mais a pessoa acelera (cartão de café, Kivetz et al., 2006).
// As 4 molduras dos marcos NÃO saem no baú: só colecionando. Ficam em prog.chest.frames como as outras
// (só ADICIONA ids novos à lista que já existe; nada é renomeado). Nada sai do aparelho.
const COL_M=[// [itens, id, nome, raridade, cor1, cor2]
 [3,"f_col1","Faísca do Colecionador",1,"#ffd166","#00d4ff"],
 [8,"f_col2","Prisma",2,"#ff4fd8","#3ddc97"],
 [15,"f_col3","Constelação",3,"#7aa2ff","#ffffff"],
 [25,"f_col4","Coroa do Arquivista",3,"#f2c14e","#ff3d6e"]];
for(const m of COL_M)if(!BX_FR.some(f=>f[0]===m[1]))BX_FR.push([m[1],m[2],m[3],m[4],m[5],m[0]]);
const colIsM=id=>COL_M.some(m=>m[1]===id);
function colCount(){const c=bxSt();let n=0;try{for(const id in (prog.sec||{}))if(secById(id))n++;}catch(e){}
  return n+c.frames.filter(id=>!colIsM(id)).length+c.titles.length;}
function colNext(){const n=colCount();return COL_M.find(m=>n<m[0])||null;}
function colReady(){try{return typeof secReady==="function"?secReady():!!(cfg&&!cfg.blank);}catch(e){return false;}}
let colBusy=false;
function colCheck(){if(colBusy||!colReady())return;colBusy=true;try{const c=bxSt(),n=colCount(),got=[];
  for(const m of COL_M)if(n>=m[0]&&!c.frames.includes(m[1])){c.frames.push(m[1]);got.push(m);}
  if(got.length){save();try{bxColUI();}catch(e){}colPop(got,n);}}finally{colBusy=false;}}
// mostra o prêmio depois que o baú fecha (uma janela por vez)
function colPop(got,n){const m=got[got.length-1],nx=colNext();
  const txt="Você juntou "+n+" itens"+(got.length>1?" e passou de "+got.length+" marcos de uma vez":"")+". Essa moldura não sai em baú: só quem coleciona tem."+(nx?" Próximo prêmio aos "+nx[0]+" itens.":" Coleção máxima: você zerou os marcos.");
  const go=()=>sysPop("MARCO DA COLEÇÃO","🏅 Moldura exclusiva: "+m[2],txt,()=>{const c=bxSt();c.frame=m[1];save();try{bxApplyFrame();bxColUI();}catch(e){}toast("Moldura em uso: "+m[2]);},"Usar agora");
  // espera a janela do item (segredo/baú) entrar na fila primeiro: o marco vem depois dela
  if(!$("bxModal"))return setTimeout(go,0);const w=setInterval(()=>{if(!$("bxModal")){clearInterval(w);go();}},400);}
// barra de progresso na Coleção do baú + linha "falta pouco" no baú aberto
function colBar(){const p=$("bxCol");if(!p||p.hidden)return;let b=$("colBar");const n=colCount(),nx=colNext();
  if(!b){b=bxEl("div","colbar");b.id="colBar";}const hd=p.querySelector(".qhead");const ref=hd&&hd.nextElementSibling;if(ref)ref.after(b);else p.append(b);
  b.textContent="";const prev=[...COL_M].reverse().find(m=>n>=m[0]);const lo=prev?prev[0]:0,hi=nx?nx[0]:lo||1;
  const top=bxEl("div","coltop");top.append(bxEl("b",null,"Coleção: "+n+(n===1?" item":" itens")),bxEl("span","sm",nx?"faltam "+(nx[0]-n)+" para « "+nx[2]+" »":"todos os marcos ✓"));
  const bar=bxEl("div","colmeter");bar.setAttribute("role","progressbar");bar.setAttribute("aria-valuemin",String(lo));bar.setAttribute("aria-valuemax",String(hi));bar.setAttribute("aria-valuenow",String(Math.min(n,hi)));
  bar.setAttribute("aria-label",nx?"Faltam "+(nx[0]-n)+" itens para a moldura "+nx[2]:"Coleção completa");
  const fill=bxEl("i");fill.style.width=(nx?Math.round(100*(n-lo)/Math.max(1,hi-lo)):100)+"%";bar.append(fill);
  const dots=bxEl("div","coldots");for(const m of COL_M){const d=bxEl("span","coldot"+(n>=m[0]?" on":"")+(nx===m?" nx":""),m[0]);d.title=m[2]+" aos "+m[0]+" itens";dots.append(d);}
  b.append(top,bar,dots,bxEl("div","sm muted","Segredos, molduras e títulos contam. Cada marco dá uma moldura que não sai no baú."));}
function colChestLine(){const o=document.querySelector("#bxModal .bxout");if(!o||o.hidden||o.querySelector(".colnext"))return;const nx=colNext();
  o.append(bxEl("span","sm colnext",nx?"Coleção "+colCount()+"/"+nx[0]+" · faltam "+(nx[0]-colCount())+" para « "+nx[2]+" »":"Coleção: todos os marcos ✓"));}
{const _c=bxColUI;bxColUI=function(){_c.apply(this,arguments);try{colBar();colChestLine();colCheck();}catch(e){}};}
{const _r=renderSec;renderSec=function(){_r.apply(this,arguments);try{colCheck();}catch(e){}};}
setTimeout(()=>{try{colBar();colCheck();}catch(e){}},50);
