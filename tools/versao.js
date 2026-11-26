// ---------- Versão do app e tela "Novidades" (1x por versão, só para quem já jogava) ----------
// Quem é novo não vê: o onboarding já apresenta o jogo, e a versão fica marcada como vista ao terminar.
// Nunca abre em cima de outro modal, do onboarding ou de missão ativa. Grava só a chave *-ver, fora do progresso.
const APP_VERSION="1.0.0";
const VS_KEY=location.pathname.includes("/comecar/")?"asc-u-ver":"ascensao-ver";
const VS_BASE=location.pathname.includes("/comecar/")?"../":"./";
const VS_NEWS=[["⚔️","Classes","que evoluem com você nos níveis 10 e 20"],["▶️","Missão ativa","com timer e a ferramenta certa em 1 toque"],["🐉","Chefão, masmorra e baú","toda semana"],["⚡","Desafios relâmpago","e Quebrar correntes"],["👥","Esquadrão, liga da semana","e desafio em dupla com amigos"],["🔒","Política de Privacidade e Termos","novos, em Mais"]];
function vsGet(){try{return localStorage.getItem(VS_KEY)||"";}catch(e){return "";}}
function vsSet(){try{localStorage.setItem(VS_KEY,APP_VERSION);}catch(e){}}
function vsPlaying(){return !!(typeof cfg!=="undefined"&&cfg&&!cfg.blank&&cfg.quests&&cfg.quests.length);}
function vsBusy(){if(document.hidden)return true;const b=document.body.classList;if(b.contains("onboarding")||b.contains("inmission"))return true;
  if([...document.querySelectorAll(".sysmodal,.mssheet,[role=dialog]")].some(m=>!m.hidden&&m.getClientRects().length))return true;
  const lu=document.getElementById("levelup");if(lu&&!lu.hidden)return true;const o=document.getElementById("onb");return !!(o&&!o.hidden&&o.getClientRects().length);}
function vsOpen(){if(document.getElementById("vsModal"))return;const prev=document.activeElement;
  const m=document.createElement("div");m.className="sysmodal vsnews";m.id="vsModal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-labelledby","vsTitle");
  const c=document.createElement("div");c.className="card";const t=document.createElement("div");t.className="tag";t.textContent="[ SISTEMA ] ATUALIZAÇÃO "+APP_VERSION.replace(/\.0$/,"");
  const h=document.createElement("h3");h.id="vsTitle";h.textContent="Ascension "+APP_VERSION.replace(/\.0$/,"");
  const p=document.createElement("p");p.className="sm";p.textContent="O jogo saiu do beta. Obrigado por testar com a gente.";
  const ul=document.createElement("ul");ul.className="vsl";for(const [i,b,r] of VS_NEWS){const li=document.createElement("li");const e=document.createElement("span");e.className="vsi";e.setAttribute("aria-hidden","true");e.textContent=i;const s=document.createElement("span");const bb=document.createElement("b");bb.textContent=b;s.append(bb," "+r);li.append(e,s);ul.append(li);}
  const k=document.createElement("p");k.className="sm muted";k.textContent="Seu XP, sua sequência e seu histórico continuam iguais.";
  const go=document.createElement("button");go.type="button";go.className="go";go.textContent="Continuar";
  const close=()=>{vsSet();m.remove();document.removeEventListener("keydown",esc);try{prev&&prev.focus&&prev.focus();}catch(e){}};
  const esc=e=>{if(e.key==="Escape")close();};
  go.addEventListener("click",close);document.addEventListener("keydown",esc);
  c.append(t,h,p,ul,k,go);m.append(c);document.body.append(m);setTimeout(()=>{try{go.focus();}catch(e){}},30);}
// rodapé em Mais: versão, novidades e textos legais
function vsFoot(){if(document.getElementById("vsFoot"))return;const ms=[...document.querySelectorAll('section[data-tab="mais"]')];if(!ms.length)return;
  const d=document.createElement("section");d.id="vsFoot";d.className="vsfoot sm muted";d.dataset.tab="mais";d.setAttribute("aria-label","Sobre o app");
  const v=document.createElement("span");v.textContent="Ascension "+APP_VERSION;
  const nb=document.createElement("button");nb.type="button";nb.className="link";nb.textContent="Novidades";nb.addEventListener("click",vsOpen);
  const mk=(href,txt)=>{const a=document.createElement("a");a.href=VS_BASE+href;a.textContent=txt;a.target="_blank";a.rel="noopener";return a;};
  d.append(v,nb,mk("privacidade/","Privacidade"),mk("termos/","Termos"));ms[ms.length-1].after(d);}
(function vsBoot(){let isNew=null,tries=0;
  const tick=()=>{tries++;if(vsGet()===APP_VERSION)return;const playing=vsPlaying();
    if(isNew===null)isNew=!playing;
    if(isNew){if(playing)vsSet();else if(tries<400)setTimeout(tick,3000);return;} // novo: marca como visto ao terminar o perfil
    if(!vsBusy()){vsOpen();return;}
    if(tries<60)setTimeout(tick,3000);};
  const start=()=>{try{vsFoot();}catch(e){}setTimeout(tick,2500);};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();})();
