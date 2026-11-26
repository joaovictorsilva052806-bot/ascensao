// ---------- Holo: projeção holográfica nas janelas do Sistema, no começo (Despertar) e nos toques. Só visual: não muda texto, dados nem fluxo. ----------
(function(){
const HX_RM=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){return false;}};
// película (scanlines + cantos + varredura) em cada card de janela que aparece
function hxFilm(card){if(!card||card.querySelector(":scope>.hxfx"))return;
  if(getComputedStyle(card).position==="static")card.classList.add("hx-rel");
  const f=document.createElement("i");f.className="hxfx";f.setAttribute("aria-hidden","true");f.append(document.createElement("b"));card.append(f);}
function hxReplay(card){const b=card&&card.querySelector(":scope>.hxfx>b");if(!b)return;b.style.animation="none";void b.offsetWidth;b.style.animation="";}
function hxScanAll(root){for(const m of (root||document).querySelectorAll(".sysmodal,.levelup")){const c=m.querySelector(".card");if(c)hxFilm(c);}}
// janelas criadas na hora (append) e janelas fixas que só trocam o hidden (level up)
try{new MutationObserver(ms=>{for(const m of ms){
    if(m.type==="childList"){for(const n of m.addedNodes){if(n.nodeType!==1)continue;if(n.matches&&n.matches(".sysmodal,.levelup"))hxScanAll(n.parentNode||document);else if(n.querySelector&&n.querySelector(".sysmodal .card"))hxScanAll(n);}}
    else if(m.type==="attributes"&&m.target.matches&&m.target.matches(".sysmodal,.levelup")&&!m.target.hidden){const c=m.target.querySelector(".card");if(c){hxFilm(c);hxReplay(c);}}
  }}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});}catch(e){}
hxScanAll();

// Despertar: anéis do projetor, feixe de luz e leituras nos cantos
function hxWake(){const orb=document.querySelector("#qPerm .qorb"),perm=$("qPerm");if(!orb||!perm||orb.querySelector(".hxorb"))return;
  const ns="http://www.w3.org/2000/svg",svg=document.createElementNS(ns,"svg");svg.setAttribute("class","hxorb");svg.setAttribute("viewBox","0 0 190 190");svg.setAttribute("aria-hidden","true");
  // 3 anéis: tracejado fino, arcos grossos e régua de marcas
  let ticks="";for(let i=0;i<60;i++){const a=i*6*Math.PI/180,r1=i%5?86:82,r2=90;ticks+=`M${(95+r1*Math.cos(a)).toFixed(1)} ${(95+r1*Math.sin(a)).toFixed(1)}L${(95+r2*Math.cos(a)).toFixed(1)} ${(95+r2*Math.sin(a)).toFixed(1)}`;}
  svg.innerHTML=`<g class="r3"><path d="${ticks}" stroke-width="1" opacity=".45"/></g>`+
    `<g class="r1"><circle cx="95" cy="95" r="74" stroke-width="1" stroke-dasharray="2 6" opacity=".7"/></g>`+
    `<g class="r2"><circle cx="95" cy="95" r="64" stroke-width="3" stroke-dasharray="40 26 10 26" opacity=".55"/></g>`;
  orb.append(svg);
  const beam=document.createElement("i");beam.className="hxbeam";beam.setAttribute("aria-hidden","true");perm.prepend(beam);
  const q=$("quick");if(q&&!q.querySelector(":scope>.hxhud")){const h=document.createElement("div");h.className="hxhud";h.setAttribute("aria-hidden","true");
    h.innerHTML='<span class="tl"><i class="dot"></i>Sistema</span><span class="tr">Link <b class="bars"><i style="height:4px"></i><i style="height:6px"></i><i style="height:8px"></i><i style="height:10px"></i></b></span><span class="bl">ASC-OS 2.6</span><span class="br" id="hxSig">Sinal 00%</span>';
    q.append(h);
    // contador de sinal sobe até 100% enquanto a tela Despertar está aberta
    if(!HX_RM()){let v=0;const s=h.querySelector("#hxSig");const t=setInterval(()=>{if(perm.hidden||!document.body.contains(s)){clearInterval(t);return;}v=Math.min(100,v+3+Math.round(Math.random()*6));s.textContent="Sinal "+String(v).padStart(2,"0")+"%";if(v>=100)clearInterval(t);},70);}
    else h.querySelector("#hxSig").textContent="Sinal 100%";}
  const ty=$("qType");if(ty)ty.classList.add("hx-frame");
  try{new MutationObserver(hxHudOff).observe(perm,{attributes:true,attributeFilter:["hidden"]});}catch(e){}}
function hxHudOff(){const h=document.querySelector("#quick>.hxhud");if(h)h.hidden=!!($("qPerm")&&$("qPerm").hidden);}
// abrir o começo: instala o projetor
if(typeof openQuick==="function"){const _oq=openQuick;openQuick=function(){const r=_oq.apply(this,arguments);try{hxWake();hxHudOff();}catch(e){}return r;};}
// Despertar tocado: explosão de luz por cima da transição (não atrasa nada)
{const b=$("q_perm");if(b)b.addEventListener("click",()=>{try{if(!HX_RM()){const fl=document.createElement("i");fl.className="hxflash";const bu=document.createElement("i");bu.className="hxburst";
    const r=document.querySelector("#qPerm .qorb");if(r){const k=r.getBoundingClientRect();if(k.width){bu.style.top=(k.top+k.height/2)+"px";}}
    document.body.append(fl,bu);setTimeout(()=>{fl.remove();bu.remove();},700);}}catch(e){}});}
{const p=$("qPerm");if(p&&!p.hidden){try{hxWake();}catch(e){}}}

// Toque: anel de luz onde o dedo encostou (1 elemento reaproveitado, só transform/opacity)
let hxT=null;
document.addEventListener("pointerdown",e=>{if(HX_RM()||e.pointerType==="mouse"&&e.button!==0)return;
  const t=e.target&&e.target.closest&&e.target.closest("button,.quest,[role=button],summary,a.btnlink");if(!t||t.disabled)return;
  if(!hxT){hxT=document.createElement("i");hxT.className="hxtap";hxT.setAttribute("aria-hidden","true");document.body.append(hxT);}
  hxT.classList.remove("on");hxT.style.left=e.clientX+"px";hxT.style.top=e.clientY+"px";void hxT.offsetWidth;hxT.classList.add("on");},{passive:true});
})();
