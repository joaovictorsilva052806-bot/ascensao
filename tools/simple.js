
// ---------- Telas enxutas: cada aba mostra uma coisa principal; o resto vira linha que abre com um toque ----------
// Não apaga nada: só recolhe. O que fica aberto é lembrado nesta sessão (preferência de tela, não é progresso).
(function(){
  const KEEP=new Set(["focusPanel","dunPanel","invPanel","onb","quick","syncCard","zapPanel","gdPanel","chPanel"]);
  const openKey="asc-ui-open";let opened={};try{opened=JSON.parse(sessionStorage.getItem(openKey)||"{}")||{};}catch(e){}
  const saveOpen=()=>{try{sessionStorage.setItem(openKey,JSON.stringify(opened));}catch(e){}};
  function foldAll(){for(const sec of document.querySelectorAll(".wrap>section.panel[data-tab]:not([data-sf])")){
    sec.dataset.sf="1";const tab=sec.dataset.tab;
    if(KEEP.has(sec.id)||sec.classList.contains("tip")||sec.classList.contains("onb")||tab==="criador")continue;
    const hd=sec.firstElementChild;if(!hd||!(hd.matches(".qhead")||hd.matches("h2")))continue;
    // Hoje: perfil e tarefas ficam abertos. Progresso: a masmorra fica aberta. Mais: tudo vira menu.
    if(tab==="hoje"&&sec.querySelector("#quests"))continue;
    const key=sec.id||(tab+":"+(hd.textContent||"").trim().slice(0,40));
    sec.classList.add("fold");hd.classList.add("fhd");hd.setAttribute("role","button");hd.tabIndex=0;
    const set=(o)=>{sec.classList.toggle("open",o);hd.setAttribute("aria-expanded",o?"true":"false");};
    set(!!opened[key]);
    const flip=()=>{const o=!sec.classList.contains("open");
      if(o)for(const other of document.querySelectorAll('.panel.fold.open[data-tab="'+tab+'"]'))if(other!==sec){other.classList.remove("open");other.firstElementChild.setAttribute("aria-expanded","false");for(const k in opened)if(opened[k]===tab)delete opened[k];}
      set(o);if(o)opened[key]=tab;else delete opened[key];saveOpen();
      if(o){const r=sec.getBoundingClientRect();if(r.top<0||r.top>innerHeight*.6)sec.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}};
    hd.addEventListener("click",e=>{if(e.target.closest("a,input,select,textarea")||(e.target.closest("button")&&e.target.closest("button")!==hd))return;flip();});
    hd.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();flip();}});
    }}
  foldAll();const w=document.querySelector(".wrap");if(w&&window.MutationObserver)new MutationObserver(foldAll).observe(w,{childList:true});
  // Foco: explicação longa vira uma linha
  const fn=document.getElementById("focusNote");if(fn&&/^Escolha a quest, aperte começar/.test(fn.textContent))fn.textContent="Celular virado para baixo. No fim, o XP entra sozinho.";
})();
