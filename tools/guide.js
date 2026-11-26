// ---------- Comece por aqui: 3 passos claros no primeiro uso (some quando termina) ----------
function gdSteps(){const L=prog.log||{};let quest=false;for(const d in L)if((L[d]||[]).some(e=>!/^(ach|checkin|tip|dun|sq|zap|boss|foco):/.test(String(e.q)))){quest=true;break;}
  const zap=Object.keys(prog.zap||{}).length>0;const kid=ageNow()==="kid";const rank=!!(prog.gd&&prog.gd.rank);
  return [{k:"q",ok:quest||!!prog.msUsed,t:"Toque em ▶ na sua PRÓXIMA missão",s:"O app abre a missão com timer e ferramenta."},
    {k:"z",ok:zap,t:"Faça 1 desafio relâmpago ⚡",s:kid?"30 segundos. Vale XP na hora.":"30 segundos. Vale XP e te sobe no ranking."},
    {k:"r",ok:rank,t:kid?"Veja sua evolução":"Veja seu lugar no ranking",s:kid?"Em Progresso: seus atributos e a masmorra.":"Em Progresso: quem está na sua frente."}];}
function gdUI(){let p=$("gdPanel");const anchor=$("zapPanel")||($("quests")&&$("quests").closest("section"));if(!anchor)return;
  prog.gd=prog.gd||{};const st=gdSteps();const all=st.every(x=>x.ok);
  if(all&&!prog.gd.paid){prog.gd.paid=1;save();addXP({q:"tip:guia",kind:"tip",xp:20,stat:"foco",bonus:0,t:new Date().toISOString()},"");sysPop("TUTORIAL","Sistema calibrado","Você já sabe jogar: missão, desafio e "+(ageNow()==="kid"?"evolução":"ranking")+". +20 XP.",null,"Bora");}
  if(!cfg||cfg.blank||all||prog.gd.off){if(p)p.remove();return;}
  if(!p){p=document.createElement("section");p.className="panel gd";p.id="gdPanel";p.dataset.tab="hoje";anchor.before(p);}
  p.textContent="";const hd=document.createElement("div");hd.className="qhead";const h=document.createElement("h2");h.textContent="🧭 Comece por aqui";const n=document.createElement("span");n.className="xp";n.textContent=st.filter(x=>x.ok).length+"/3 · +20 XP";hd.append(h,n);p.append(hd);
  const ol=document.createElement("ol");ol.className="gdl";let first=true;
  for(const [i,x] of st.entries()){const li=document.createElement("li");li.className=x.ok?"ok":first?"now":"";if(!x.ok)first=false;
    const b=document.createElement("button");b.type="button";b.disabled=x.ok;const nb=document.createElement("span");nb.className="n";nb.textContent=x.ok?"✓":String(i+1);
    const tx=document.createElement("span");tx.className="tx";const tb=document.createElement("b");tb.textContent=x.t;const sm=document.createElement("small");sm.textContent=x.s;tx.append(tb,sm);b.append(nb,tx);
    b.addEventListener("click",()=>gdGo(x.k));li.append(b);ol.append(li);}
  p.append(ol);const off=document.createElement("button");off.type="button";off.className="link gdoff";off.textContent="Já sei usar, esconder";off.addEventListener("click",()=>{prog.gd.off=1;save();gdUI();});p.append(off);}
function gdGo(k){if(k==="q"){const b=document.querySelector("#quests .quest.next .msgo")||document.querySelector("#quests .msgo");if(b){b.scrollIntoView({block:"center",behavior:"smooth"});setTimeout(()=>b.click(),350);}}
  else if(k==="z"){const c=document.querySelector(".zapc:not(.done)");if(c)c.click();}
  else if(k==="r"){prog.gd=prog.gd||{};prog.gd.rank=1;save();const b=document.querySelector('nav button[data-go="prog"]');if(b)b.click();setTimeout(()=>{const r=$("rankPanel");if(r&&!r.hidden)r.scrollIntoView({block:"start",behavior:"smooth"});},250);}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest('nav button[data-go="prog"]');if(b&&prog){prog.gd=prog.gd||{};if(!prog.gd.rank){prog.gd.rank=1;save();}}},true);
{const _r=render;render=function(){_r.apply(this,arguments);try{gdUI();}catch(e){}};}
setTimeout(()=>{try{gdUI();}catch(e){}},50);
