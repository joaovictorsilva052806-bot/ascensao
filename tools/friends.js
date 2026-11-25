// ---------- Amigos: adicionar, aceitar no app do outro e comparar lado a lado ----------
// Canal: F|de|para||data (pedido) e G|quem|de||data (aceite), no mesmo formulário do ranking. Só apelidos do ranking (14+).
// Só ADICIONA prog.friends = {l:[nomes], pend:{nome:data}, seen:{chave:1}}.
function frSt(){if(!prog.friends||typeof prog.friends!=="object")prog.friends={l:[],pend:{},seen:{}};const f=prog.friends;f.l=f.l||[];f.pend=f.pend||{};f.seen=f.seen||{};return f;}
const frN=v=>String(v||"").trim().toLowerCase();
const frHas=(n)=>frSt().l.some(x=>frN(x)===frN(n));
function frEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function frRow(n){const r=(rankRows||[]).find(x=>frN(x.n)===frN(n));const p=sqPub[frN(n)]||{};return {n,xp:r?r.xp:null,lv:r?r.lv:null,seq:p.seq||0,dz:p.dz||0,av:p.av||"",on:!!r};}
function frMe(){let sq=0;try{sq=streakDays()||0;}catch(e){}return {n:rankName()||"Você",xp:weekXP(),lv:levelOf(totalXP()),seq:sq,dz:avZapWeek(),av:avCode(),me:true,on:true};}
function frAv(code,sz){const o=avParse(code);if(o)return avSvg(o,sz);return '<svg class="av" viewBox="0 0 100 100" width="'+sz+'" height="'+sz+'" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#0d1526" stroke="#1f2e4d" stroke-width="3"/><circle cx="50" cy="44" r="16" fill="#1f2e4d"/><path d="M18 100 Q20 72 50 70 Q80 72 82 100Z" fill="#1f2e4d"/></svg>';}
function frRequest(n){const me=rankName();n=cleanNick(n);if(!me||!n||frN(n)===frN(me)||frHas(n))return;const f=frSt();
  // se ele já me pediu, vira amizade na hora
  const back=sqInvRows.some(r=>r.k==="F"&&frN(r.a)===frN(n)&&frN(r.b)===frN(me));
  sqiPost(["F",me,n,"",sqiDk()]);if(back){f.l.push(n);delete f.pend[n];sqiPost(["G",me,n,"",sqiDk()]);toast(n+" agora é seu amigo.");}
  else{f.pend[n]=todayKey();toast("Pedido enviado para "+n+". Aparece no app dele.");}save();frUI();}
function frCheck(){const me=rankName();if(!me)return;const f=frSt();let ch=false;
  const frPend=n=>Object.keys(f.pend).some(k=>frN(k)===frN(n));
  for(const r of sqInvRows){if(r.k==="G"&&frN(r.b)===frN(me)&&r.a&&!frHas(r.a)&&frPend(r.a)){f.l.push(r.a);for(const k in f.pend)if(frN(k)===frN(r.a))delete f.pend[k];ch=true;const key="g:"+frN(r.a);if(!f.seen[key]){f.seen[key]=1;toast(r.a+" aceitou seu pedido de amizade.");}}}
  if(ch){save();}frUI();try{frRankAv();}catch(e){}
  if($("frModal")||$("sqiModal")||[...document.querySelectorAll(".sysmodal")].some(x=>x.getClientRects().length)||document.body.classList.contains("inmission"))return;
  const inc=sqInvRows.filter(r=>r.k==="F"&&frN(r.b)===frN(me)&&r.a&&!frHas(r.a)&&!f.seen["f:"+frN(r.a)]&&sqiFresh(r.d));
  const td=todayKey();if(!f.ask||f.ask.d!==td)f.ask={d:td,n:0};
  if(inc.length&&f.ask.n<3){f.ask.n++;save();frAsk(inc[inc.length-1].a);}}
function frAsk(n){const f=frSt();const m=frEl("div","sysmodal");m.id="frModal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");const c=frEl("div","card");
  const av=frEl("div","fravbig");av.innerHTML=frAv((sqPub[frN(n)]||{}).av,84);
  c.append(frEl("div","tag","[ SISTEMA ] PEDIDO DE AMIZADE"),av,frEl("h3",null,n+" quer ser seu amigo"),frEl("p","sm","Amigos se comparam lado a lado: XP da semana, nível, sequência e desafios."));
  const row=frEl("div","row");const ok=frEl("button","go","Aceitar");ok.type="button";const no=frEl("button","ghost","Agora não");no.type="button";row.append(ok,no);c.append(row);
  const close=()=>{f.seen["f:"+frN(n)]=1;save();m.remove();setTimeout(frCheck,400);};
  ok.addEventListener("click",()=>{if(!frHas(n))f.l.push(n);delete f.pend[n];sqiPost(["G",rankName(),n,"",sqiDk()]);try{haptic([15,40,15]);}catch(e){}toast(n+" agora é seu amigo.");close();});
  no.addEventListener("click",close);m.append(c);document.body.append(m);setTimeout(()=>ok.focus(),60);}
// comparação lado a lado
function frCompare(n){const a=frMe(),b=frRow(n);const m=frEl("div","sysmodal");m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");const c=frEl("div","card frcmp");
  c.append(frEl("div","tag","[ SISTEMA ] COMPARAÇÃO"));
  const hd=frEl("div","frvs");const side=(p)=>{const d=frEl("div","frside");const v=frEl("div");v.innerHTML=frAv(p.av,72);d.append(v,frEl("b",null,p.n+(p.me?" (você)":"")));return d;};
  hd.append(side(a),frEl("span","frvsx","VS"),side(b));c.append(hd);
  const rows=[["XP da semana","xp"],["Nível","lv"],["Sequência (dias)","seq"],["Desafios na semana","dz"]];
  const tb=frEl("div","frstats");for(const [l,k] of rows){const x=a[k]==null?0:+a[k],y=b[k]==null?0:+b[k];const r=frEl("div","frst");
    const l1=frEl("span","v"+(x>y?" win":""),String(x));const l2=frEl("span","v"+(y>x?" win":""),b[k]==null?"–":String(y));r.append(l1,frEl("span","l",l),l2);tb.append(r);}c.append(tb);
  const dx=(b.xp||0)-a.xp;c.append(frEl("p","sm frmsg",b.xp==null?n+" ainda não pontuou nesta semana.":dx>0?"Faltam "+(dx+1)+" XP para você passar "+n+" nesta semana. Um desafio relâmpago dá 10.":dx<0?"Você está "+(-dx)+" XP à frente de "+n+". Segura a liderança.":"Empatados. O próximo XP decide."));
  const row=frEl("div","row");const x=frEl("button","go","Fechar");x.type="button";x.addEventListener("click",()=>m.remove());row.append(x);c.append(row);m.append(c);document.body.append(m);setTimeout(()=>x.focus(),60);}
let frAdd=false;
function frUI(){let p=$("frPanel");const anchor=$("sqPanel")||$("rankPanel");if(!anchor)return;
  if(!p){p=frEl("section","panel frp");p.id="frPanel";p.dataset.tab="prog";const rp=$("rankPanel");(rp||anchor).after(p);}
  const kid=ageNow()==="kid";p.hidden=kid||!cfg||cfg.blank;if(p.hidden)return;
  if(p.contains(document.activeElement)&&document.activeElement.tagName==="INPUT")return;
  p.textContent="";const f=frSt();const hd=frEl("div","qhead");hd.append(frEl("h2",null,"👥 Amigos"),frEl("span","sm muted",f.l.length?f.l.length+" amigo(s)":"compare seu progresso"));p.append(hd);
  if(!(prog.rank&&prog.rank.on)){p.append(frEl("div","sqsys","[SISTEMA] Entre no ranking acima para adicionar amigos e se comparar com eles."));return;}
  const list=[frMe(),...f.l.map(frRow)].sort((x,y)=>(y.xp||0)-(x.xp||0));
  const ol=frEl("ol","frlist");list.forEach((r,i)=>{const li=frEl("li",r.me?"me":"");const av=frEl("span","frav");av.innerHTML=frAv(r.av,40);
    const tx=frEl("div","frtx");tx.append(frEl("b",null,(i+1)+". "+r.n+(r.me?" (você)":"")),frEl("span","sm muted",(r.lv?"nv "+r.lv+" · ":"")+(r.xp==null?"sem XP na semana":r.xp+" XP")+(r.seq?" · 🔥 "+r.seq:"")+(r.dz?" · ⚡ "+r.dz:"")));
    li.append(av,tx);if(!r.me){const b=frEl("button","ghost frcmpb","Comparar");b.type="button";b.addEventListener("click",()=>frCompare(r.n));li.append(b);
      const x=frEl("button","link","✕");x.type="button";x.setAttribute("aria-label","Remover "+r.n);x.addEventListener("click",()=>{if(!confirm("Remover "+r.n+" dos amigos?"))return;f.l=f.l.filter(n=>n!==r.n);save();frUI();});li.append(x);}
    ol.append(li);});p.append(ol);
  const pend=Object.keys(f.pend);if(pend.length)p.append(frEl("div","sm muted","Aguardando aceitar: "+pend.join(", ")+"."));
  if(!frAdd){const b=frEl("button","go","+ Adicionar amigo");b.type="button";b.addEventListener("click",()=>{frAdd=true;frUI();});p.append(b);return;}
  const me=rankName();const cand=(rankRows||[]).map(r=>r.n).filter(n=>n&&frN(n)!==frN(me)&&!frHas(n)&&!f.pend[n]);
  if(cand.length){p.append(frEl("div","sm muted","Toque para mandar o pedido:"));const ch=frEl("div","sqchips");for(const n of cand.slice(0,30)){const c=frEl("button","chip","+ "+n);c.type="button";c.addEventListener("click",()=>frRequest(n));ch.append(c);}p.append(ch);}
  const row=frEl("div","add");const inp=frEl("input");inp.maxLength=16;inp.placeholder="Apelido do amigo no ranking";inp.autocomplete="off";const s=frEl("button","go","Pedir");s.type="button";
  s.addEventListener("click",()=>{const v=cleanNick(inp.value);if(!v){inp.focus();return;}frRequest(v);});row.append(inp,s);p.append(row);
  const cx=frEl("button","link","Fechar");cx.type="button";cx.addEventListener("click",()=>{frAdd=false;frUI();});p.append(cx);}
// avatar no ranking
function frRankAv(){for(const li of document.querySelectorAll("#rkList li")){const sp=li.querySelector("span");if(!sp||li.querySelector(".av"))continue;const nm=sp.textContent.split(" · ")[0];const me=frN(nm)===frN(rankName());const code=me?avCode():(sqPub[frN(nm)]||{}).av;if(!code)continue;const w=frEl("span","rkav");w.innerHTML=frAv(code,26);li.insertBefore(w,sp);}}
{const _rr=renderRankUI;renderRankUI=function(){_rr();try{frUI();frRankAv();}catch(e){}};}
setTimeout(()=>{try{frUI();}catch(e){}},0);
