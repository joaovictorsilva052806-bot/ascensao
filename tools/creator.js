// ---------- Modo Criador (só no app do JV): jogadores, XP manual, esconder módulos, atalhos ----------
const CR_HIDE="ascensao-hide",CR_CSV="https://docs.google.com/spreadsheets/d/e/2PACX-1vTyr0ZbAqlFWbOWEZXpjcRPXPE04u9EfktPhrq5Mf_vnQ2YjeVEARfhqGrrpqVXxkIVsvnE_x8DMdpr/pub?gid=1002&single=true&output=csv";
const crLS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}};
function crOn(){return !!crLS("ascensao-sync");}
function crMods(){return [...document.querySelectorAll(".wrap>section[data-tab]")].filter(s=>s.dataset.tab!=="criador"&&!s.querySelector("#titleName")&&!(s.hasAttribute("hidden")&&!s.id)).map((s,i)=>{const h=s.querySelector("h2");const k=s.id||(h?h.textContent.trim():"m"+i);return {s,k,n:h?h.textContent.trim():k};}).filter(m=>m.n&&m.s.id!=="syncCard"&&m.s.id!=="sysTip");}
function crApply(){let hide=[];try{hide=JSON.parse(crLS(CR_HIDE)||"[]");}catch(e){}for(const m of crMods()){const off=hide.includes(m.k);m.s.classList.toggle("crhide",off);if(off)m.s.dataset.crh="1";}}
function crRender(){const on=crOn();document.body.classList.toggle("creator",on);const tb=document.querySelector('#tabbar [data-go="criador"]');if(tb)tb.hidden=!on;if(!on)return;
  $("crSync").textContent=crLS("ascensao-sync")?"● planilha ligada":"○ sem planilha";
  let hide=[];try{hide=JSON.parse(crLS(CR_HIDE)||"[]");}catch(e){}const box=$("crMods");box.textContent="";
  for(const m of crMods()){const l=document.createElement("label");const c=document.createElement("input");c.type="checkbox";c.checked=!hide.includes(m.k);
    c.addEventListener("change",()=>{let h=[];try{h=JSON.parse(crLS(CR_HIDE)||"[]");}catch(e){}h=h.filter(x=>x!==m.k);if(!c.checked)h.push(m.k);crLS(CR_HIDE,JSON.stringify(h));crApply();});
    const tab={hoje:"Hoje",foco:"Foco",prog:"Progresso",mais:"Mais"}[m.s.dataset.tab]||"";const sp=document.createElement("span");sp.textContent=m.n.replace(/^[^\wÀ-ú]+/,"")+(tab?" · "+tab:"");l.append(c,sp);box.append(l);}}
async function crPlayers(){const el=$("crPlayers");el.textContent="Carregando…";try{const t=await (await fetch(CR_CSV+"&t="+Date.now(),{credentials:"omit"})).text();
  const rows=t.trim().split(/\r?\n/).slice(1).map(l=>l.split(",")).filter(r=>r[0]);if(!rows.length){el.textContent="Ninguém no ranking desta semana ainda.";return;}
  const tb=document.createElement("table");for(const [i,r] of rows.entries()){const tr=document.createElement("tr");for(const v of [(i+1)+".",r[0],r[1]+" XP","nv "+(r[2]||1)]){const td=document.createElement("td");td.textContent=v;tr.append(td);}tb.append(tr);}
  el.textContent="";const p=document.createElement("div");p.textContent=rows.length+" jogador(es) no ranking desta semana. Só aparece quem aceitou entrar no ranking.";el.append(p,tb);}
  catch(e){el.textContent="Sem conexão com a planilha agora.";}}
document.querySelectorAll(".crxp button").forEach(b=>b.addEventListener("click",()=>{const n=+b.dataset.xp;addXP({q:"adm:"+Date.now(),kind:"adm",xp:n,stat:"foco",bonus:0,t:new Date().toISOString()},"");toast((n>0?"+":"")+n+" XP (criador)");}));
$("crReload").addEventListener("click",crPlayers);
$("crCls").addEventListener("click",()=>{if(typeof chgCls==="function")chgCls();});
$("crFresh").addEventListener("click",async()=>{try{for(const r of await navigator.serviceWorker.getRegistrations())await r.update();for(const k of await caches.keys())await caches.delete(k);}catch(e){}location.reload();});
document.querySelector('#tabbar [data-go="criador"]')&&document.querySelector('#tabbar [data-go="criador"]').addEventListener("click",()=>{crRender();crPlayers();});
