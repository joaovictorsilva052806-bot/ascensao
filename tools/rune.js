// ---------- Runa: toque de RPG de mesa no HUD (dado d20 no baú, círculo rúnico no "Feito", crítico no bônus, anel de runas no Despertar). Só visual. ----------
(function(){
const RN_RM=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){return false;}};
// runas próprias do Sistema (traços em grade 10x14), não são alfabeto real
const RN_G=["M2 1V13M2 4L8 1M2 8L8 5","M5 1V13M1 4L5 7L9 4","M2 1V13M8 1V13M2 7H8","M1 13L5 1L9 13M3 8H7","M5 1V13M5 4L1 1M5 4L9 1M5 10L1 13","M1 1L9 13M9 1L1 13M1 7H9","M2 1V13M2 1L8 5L2 9","M1 1H9L5 7L9 13H1","M5 1L9 7L5 13L1 7Z","M2 13V1L8 13V1"];
function rnRing(cx,cy,r,n,s){let o="";for(let i=0;i<n;i++){const a=i/n*360;o+=`<path d="${RN_G[i%RN_G.length]}" transform="rotate(${a.toFixed(1)} ${cx} ${cy}) translate(${cx-5*s} ${cy-r-7*s}) scale(${s})"/>`;}return o;}
// faixa de runas (fundo das etiquetas das janelas)
try{const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="10" viewBox="0 0 120 10"><g fill="none" stroke="#00d4ff" stroke-width="1.4" stroke-linecap="round">${[0,1,2,3,4,5,6,7].map(i=>`<path d="${RN_G[(i*3)%RN_G.length]}" transform="translate(${i*15+2} .5) scale(.62)"/>`).join("")}</g></svg>`;
  document.documentElement.style.setProperty("--rn-strip",`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);}catch(e){}

// 1) Despertar: anel de runas por fora do projetor
function rnWake(){const o=document.querySelector("#qPerm .hxorb");if(!o||o.querySelector(".rn"))return;
  const g=document.createElementNS("http://www.w3.org/2000/svg","g");g.setAttribute("class","rn");g.innerHTML=rnRing(95,95,104,18,.8);o.setAttribute("viewBox","-20 -20 230 230");o.append(g);}
if(typeof openQuick==="function"){const _oq=openQuick;openQuick=function(){const r=_oq.apply(this,arguments);try{rnWake();}catch(e){}return r;};}
try{rnWake();}catch(e){}

// 2) "Feito": círculo rúnico no ponto do toque; bônus surpresa vira CRÍTICO com d20
let rnX=innerWidth/2,rnY=innerHeight/2;
document.addEventListener("click",e=>{if(e.target&&e.target.closest&&e.target.closest(".quest button")){rnX=e.clientX||rnX;rnY=e.clientY||rnY;}},true);
function rnCircle(x,y,gold){if(RN_RM())return;const ns="http://www.w3.org/2000/svg",s=document.createElementNS(ns,"svg");s.setAttribute("class","rncirc"+(gold?" gold":""));s.setAttribute("viewBox","0 0 120 120");s.setAttribute("aria-hidden","true");
  s.innerHTML='<circle cx="60" cy="60" r="56"/><circle cx="60" cy="60" r="40"/><path d="M60 22L93 79H27Z M60 98L27 41H93Z"/><g class="rnr">'+rnRing(60,60,40,10,.55)+'</g>';
  s.style.left=x+"px";s.style.top=y+"px";document.body.append(s);setTimeout(()=>s.remove(),900);}
function rnCrit(x,y){const d=document.createElement("div");d.className="rncrit";d.setAttribute("aria-hidden","true");d.innerHTML=rnD20(20)+"<b>CRÍTICO!</b>";
  d.style.left=x+"px";d.style.top=(y-56)+"px";document.body.append(d);setTimeout(()=>d.remove(),1500);}
if(typeof fx==="function"){const _fx=fx;fx=function(xp,gold){const r=_fx.apply(this,arguments);try{rnCircle(rnX,rnY,gold);if(gold)rnCrit(rnX,rnY);}catch(e){}return r;};}

// 4) Level up: círculo mágico grande girando atrás do card
function rnLevel(){const l=$("levelup");if(!l||l.querySelector(".rnlv"))return;const ns="http://www.w3.org/2000/svg",s=document.createElementNS(ns,"svg");s.setAttribute("class","rnlv");s.setAttribute("viewBox","0 0 200 200");s.setAttribute("aria-hidden","true");
  let tk="";for(let i=0;i<72;i++){const a=i*5*Math.PI/180,r1=i%6?92:88;tk+=`M${(100+r1*Math.cos(a)).toFixed(1)} ${(100+r1*Math.sin(a)).toFixed(1)}L${(100+95*Math.cos(a)).toFixed(1)} ${(100+95*Math.sin(a)).toFixed(1)}`;}
  s.innerHTML='<g class="a"><circle cx="100" cy="100" r="96"/><path d="'+tk+'"/></g><g class="b">'+rnRing(100,100,74,16,.6)+'<circle cx="100" cy="100" r="62"/></g><g class="c"><path d="M100 40L152 130H48Z M100 160L48 70H152Z"/><circle cx="100" cy="100" r="40"/></g>';
  l.prepend(s);}
try{const l=$("levelup");if(l){rnLevel();}}catch(e){}

// 3) Baú: rola um d20 antes do prêmio (o prêmio já está sorteado; o dado só mostra a raridade)
function rnD20(n){return '<svg class="rnd20" viewBox="0 0 100 100" aria-hidden="true"><path class="f" d="M50 4L90 27V73L50 96L10 73V27Z"/><path class="l" d="M50 22L22 66H78Z M50 4L50 22M10 27L50 22M10 27L22 66M90 27L50 22M90 27L78 66M10 73L22 66M90 73L78 66M50 96L22 66M50 96L78 66"/><text x="50" y="52" text-anchor="middle" dominant-baseline="middle">'+n+'</text></svg>';}
function rnRoll(out){if(!out||out.dataset.rn)return;out.dataset.rn="1";
  const rar=(out.querySelector(".bxrar")||{}).textContent||"";const n=/lend/i.test(rar)?20:/épic|epic/i.test(rar)?17+Math.floor(Math.random()*3):/raro/i.test(rar)?13+Math.floor(Math.random()*4):6+Math.floor(Math.random()*7);
  const w=document.createElement("div");w.className="rnroll"+(n===20?" nat":"");w.setAttribute("aria-hidden","true");w.innerHTML=rnD20(n)+'<div class="rnlbl">'+(n===20?"20 NATURAL!":"Rolou "+n)+'</div>';
  out.before(w);if(RN_RM()){w.classList.add("land");return;}
  out.classList.add("rnwait");const t=w.querySelector("text");let k=0;const iv=setInterval(()=>{k++;t.textContent=1+Math.floor(Math.random()*20);},70);
  setTimeout(()=>{clearInterval(iv);t.textContent=n;w.classList.add("land");out.classList.remove("rnwait");try{if(navigator.vibrate)navigator.vibrate(n===20?[20,50,20,50,40]:[18]);}catch(e){}},850);}
try{new MutationObserver(ms=>{for(const m of ms){const t=m.target;if(m.type==="attributes"&&t.classList&&t.classList.contains("bxout")&&!t.hidden)rnRoll(t);}})
  .observe(document.body,{subtree:true,attributes:true,attributeFilter:["hidden"]});}catch(e){}
})();
