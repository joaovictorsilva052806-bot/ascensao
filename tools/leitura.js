// ---------- Meta de leitura: páginas por dia, livro atual e livros lidos ----------
// Pedido de testador: "acrescenta meta de leitura". Alimenta 📘 Intelecto (70%) e 🦉 Sabedoria (30%).
// XP: 1 a cada 2 páginas (até 15) + 5 ao bater a meta do dia, numa entrada só "ler:<dia>". Terminar um livro: +20 ("ler:livro:<n>").
// Bater a meta do dia carrega +1 Arcano na Arena (arena.js).
// Só ADICIONA prog.read = {goal, d:{dia:páginas}, book:{t,tot,pg}, books:[{t,d}], last:[dia,n]}.
const LR_GOALS=[5,10,20,30],LR_MAXXP=15,LR_HIT=5,LR_BOOK=20;
function lrSt(){if(!prog.read||typeof prog.read!=="object")prog.read={};const r=prog.read;r.d=r.d&&typeof r.d==="object"?r.d:{};r.books=Array.isArray(r.books)?r.books:[];r.goal=r.goal|0;return r;}
function lrEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function lrToday(){return lrSt().d[todayKey()]||0;}
function lrHitToday(){const r=lrSt();return r.goal>0&&lrToday()>=r.goal;}
// páginas lidas -> atributos de leitura
if(typeof atOfEntry==="function"){const _ao=atOfEntry;atOfEntry=function(e,Q){if(/^ler:/.test(String(e&&e.q)))return ["intel","sabed"];return _ao.apply(this,arguments);};}
function lrSync(){const r=lrSt(),tk=todayKey(),n=r.d[tk]||0;const xp=n>0?Math.min(LR_MAXXP,Math.floor(n/2))+(r.goal&&n>=r.goal?LR_HIT:0):0;
  const L=prog.log[tk]=prog.log[tk]||[];const e=L.find(x=>x.q==="ler:"+tk);
  if(!xp){if(e)prog.log[tk]=L.filter(x=>x!==e);return;}
  if(e){e.xp=xp;return;}
  try{addXP({q:"ler:"+tk,kind:"full",xp,stat:"mente",bonus:0,t:new Date().toISOString()},"");}catch(x){L.push({q:"ler:"+tk,kind:"full",xp,stat:"mente",bonus:0,t:new Date().toISOString()});}}
function lrAdd(n){const r=lrSt(),tk=todayKey();const before=r.d[tk]||0;const hitB=lrHitToday();r.d[tk]=Math.max(0,before+n);if(!r.d[tk])delete r.d[tk];
  if(r.book&&r.book.t){r.book.pg=Math.max(0,Math.min(r.book.tot||1e5,(r.book.pg||0)+n));}
  r.last=n>0?[tk,n]:null;lrSync();save();try{haptic(12);}catch(e){}
  if(!hitB&&lrHitToday()){try{sysPop("LEITURA","Meta do dia batida: "+r.goal+" páginas","+"+LR_HIT+" XP extra e +1 carga de Arcano na Arena hoje.");}catch(e){}}
  else if(n>0)toast("📖 +"+n+" páginas");
  lrUI();try{render();}catch(e){}}
function lrUndo(){const r=lrSt();if(!r.last||r.last[0]!==todayKey())return;const n=r.last[1];r.last=null;lrAdd(-n);r.last=null;save();toast("Desfeito.");}
function lrFinish(){const r=lrSt();if(!r.book||!r.book.t)return;r.books.push({t:r.book.t,d:todayKey()});const i=r.books.length;r.book=null;
  if(!entries().some(e=>e.q==="ler:livro:"+i))try{addXP({q:"ler:livro:"+i,kind:"full",xp:LR_BOOK,stat:"mente",bonus:0,t:new Date().toISOString()},"");}catch(e){}
  save();try{sysPop("LIVRO CONCLUÍDO","Livro nº "+i+" na estante","+"+LR_BOOK+" XP em Intelecto e Sabedoria. Qual é o próximo?");}catch(e){}lrUI();try{render();}catch(e){}}
function lrMonth(){const r=lrSt();const m=todayKey().slice(0,7);let p=0,d=0;for(const k in r.d)if(k.slice(0,7)===m&&r.d[k]>0){p+=r.d[k];d++;}return {p,d};}
function lrUI(){let p=$("lrPanel");const anchor=$("arPanel")||$("atPanel")||$("avPanel");
  if(!p){if(!anchor)return;p=lrEl("section","panel lrp");p.id="lrPanel";p.dataset.tab="prog";anchor.after(p);}
  if(!cfg||cfg.blank){p.hidden=true;return;}p.hidden=false;p.textContent="";const r=lrSt();
  const hd=lrEl("div","lrhd");hd.append(lrEl("h2",null,"📖 Meta de leitura"));p.append(hd);
  if(!r.goal||r.edit){p.append(lrEl("div","sm muted","Quantas páginas por dia? Comece pequeno: dá pra subir depois. Conta para 📘 Intelecto e 🦉 Sabedoria."));
    const row=lrEl("div","lrgoals");for(const g of LR_GOALS){const b=lrEl("button","ghost"+(r.goal===g?" on":""),g+" págs/dia");b.type="button";b.onclick=()=>{r.goal=g;delete r.edit;lrSync();save();lrUI();};row.append(b);}
    p.append(row);if(r.goal){const c=lrEl("button","link","Cancelar");c.type="button";c.onclick=()=>{delete r.edit;lrUI();};p.append(c);}return;}
  const n=lrToday();hd.append(lrEl("span","sm mono",n+"/"+r.goal+" hoje"));
  const bar=lrEl("div","lrbar"+(n>=r.goal?" hit":""));const i=lrEl("i");i.style.width=Math.min(100,n/r.goal*100).toFixed(1)+"%";bar.append(i);p.append(bar);
  const add=lrEl("div","lradd");for(const k of [2,5,10]){const b=lrEl("button","go","+"+k);b.type="button";b.setAttribute("aria-label","Somar "+k+" páginas");b.onclick=()=>lrAdd(k);add.append(b);}
  const inp=lrEl("input");inp.type="number";inp.inputMode="numeric";inp.min="1";inp.max="500";inp.placeholder="nº";inp.setAttribute("aria-label","Outro número de páginas");
  const ok=lrEl("button","ghost","Somar");ok.type="button";ok.onclick=()=>{const v=Math.round(+inp.value||0);if(v>0&&v<=500)lrAdd(v);};add.append(inp,ok);p.append(add);
  if(r.last&&r.last[0]===todayKey()){const u=lrEl("button","link","Desfazer +"+r.last[1]);u.type="button";u.onclick=lrUndo;p.append(u);}
  const mo=lrMonth();p.append(lrEl("div","sm muted",mo.p+" páginas este mês em "+mo.d+(mo.d===1?" dia":" dias")+(r.books.length?" · "+r.books.length+(r.books.length===1?" livro lido":" livros lidos"):"")));
  const bk=lrEl("div","lrbook");
  if(r.book&&r.book.t){const t=lrEl("div","lrbt");t.append(lrEl("b",null,"📕 "+r.book.t),lrEl("span","sm mono",(r.book.pg||0)+(r.book.tot?"/"+r.book.tot:"")+" págs"));bk.append(t);
    if(r.book.tot){const b2=lrEl("div","lrbar thin");const j=lrEl("i");j.style.width=Math.min(100,(r.book.pg||0)/r.book.tot*100).toFixed(1)+"%";b2.append(j);bk.append(b2);}
    const row=lrEl("div","row");const f=lrEl("button","ghost","Terminei o livro 🎉");f.type="button";f.onclick=lrFinish;const x=lrEl("button","link","Trocar livro");x.type="button";x.onclick=()=>{r.book=null;save();lrUI();lrBookForm();};row.append(f,x);bk.append(row);}
  else{const b=lrEl("button","link","+ Livro que estou lendo (opcional)");b.type="button";b.onclick=lrBookForm;bk.append(b);}
  p.append(bk);
  const ch=lrEl("button","link","Mudar meta");ch.type="button";ch.onclick=()=>{r.edit=1;lrUI();};p.append(ch);}
function lrBookForm(){const p=$("lrPanel");if(!p)return;const bk=p.querySelector(".lrbook");if(!bk)return;bk.textContent="";
  const f=lrEl("form","lrform");const t=lrEl("input");t.placeholder="Nome do livro";t.maxLength=60;t.setAttribute("aria-label","Nome do livro");
  const n=lrEl("input");n.type="number";n.inputMode="numeric";n.placeholder="Total de páginas";n.min="1";n.max="5000";n.setAttribute("aria-label","Total de páginas");
  const s=lrEl("button","go","Salvar");s.type="submit";f.append(t,n,s);
  f.onsubmit=e=>{e.preventDefault();const nm=t.value.trim();if(!nm){t.focus();return;}const r=lrSt();r.book={t:nm,tot:Math.max(0,Math.min(5000,Math.round(+n.value||0))),pg:0};save();lrUI();};
  bk.append(f);setTimeout(()=>t.focus(),30);}
{const _r=render;render=function(){_r.apply(this,arguments);try{if((document.body.dataset.tab==="prog"&&!document.querySelector("#lrPanel .lrform"))||!$("lrPanel"))lrUI();}catch(e){}};}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest('#tabbar [data-go="prog"]');if(b)setTimeout(()=>{try{lrUI();}catch(x){}},0);},true);
setTimeout(()=>{try{lrUI();}catch(e){}},0);
// gancho de teste (só leitura dos números; não muda nada)
try{window.arQA={hero:()=>arHero(),foe:n=>arFoe(n),b:l=>arB(l),lv:()=>atLevels(),of:e=>atOfEntry(e,{}),battle:()=>arB_&&{hp:arB_.hp,max:arB_.h.hp,arc:arB_.arc,heal:arB_.heal}};}catch(e){}
