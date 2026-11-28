
// ---------- Telas enxutas: cada aba mostra uma coisa principal; o resto vira linha que abre com um toque ----------
// Não apaga nada: só recolhe. O que fica aberto é lembrado nesta sessão (preferência de tela, não é progresso).
(function(){
  const KEEP=new Set(["focusPanel","dunPanel","invPanel","onb","quick","syncCard","zapPanel","gdPanel","chPanel","tpLine","tpPanel","mqPanel","cnPanel","kyPanel"]);
  // cabeçalhos que viram linha: .qhead/h2 e os dos painéis de Progresso feitos em JS (Atributos, Arena, Meta de leitura)
  const HD=".qhead,h2,.athd,.arhd,.lrhd";
  const openKey="asc-ui-open";let opened={};try{opened=JSON.parse(sessionStorage.getItem(openKey)||"{}")||{};}catch(e){}
  const saveOpen=()=>{try{sessionStorage.setItem(openKey,JSON.stringify(opened));}catch(e){}};
  function foldAll(){for(const sec of document.querySelectorAll(".wrap>section.panel[data-tab]:not([data-sf])")){
    const tab=sec.dataset.tab;
    if(KEEP.has(sec.id)||sec.classList.contains("tip")||sec.classList.contains("onb")||tab==="criador"){sec.dataset.sf="1";continue;}
    const hd=sec.firstElementChild;if(!hd)continue; // ainda vazia: tenta de novo quando o conteúdo chegar
    sec.dataset.sf="1";if(!hd.matches(HD))continue;
    // Hoje: perfil e tarefas ficam abertos. Progresso: a masmorra fica aberta. Mais: tudo vira menu.
    if(tab==="hoje"&&sec.querySelector("#quests"))continue;
    const key=sec.id||(tab+":"+(hd.textContent||"").trim().slice(0,40));
    sec.classList.add("fold");sec._fkey=key;
    const set=(o)=>{sec.classList.toggle("open",o);const h=sec.firstElementChild;if(h)h.setAttribute("aria-expanded",o?"true":"false");};
    sec._fset=set;markHd(sec);set(!!opened[key]);
    const flip=()=>{const o=!sec.classList.contains("open");
      if(o)for(const other of document.querySelectorAll('.panel.fold.open[data-tab="'+tab+'"]'))if(other!==sec){other.classList.remove("open");if(other.firstElementChild)other.firstElementChild.setAttribute("aria-expanded","false");for(const k in opened)if(opened[k]===tab)delete opened[k];}
      set(o);if(o)opened[key]=tab;else delete opened[key];saveOpen();
      if(o){const r=sec.getBoundingClientRect();if(r.top<0||r.top>innerHeight*.6)sec.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}};
    // delegado na seção: o cabeçalho pode ser recriado (Amigos, Esquadrão, Álbum) e continua abrindo
    const onHd=e=>{const h=sec.firstElementChild;return h&&e.target.closest(".fhd")===h;};
    sec.addEventListener("click",e=>{if(!onHd(e))return;if(e.target.closest("a,input,select,textarea")||(e.target.closest("button")&&e.target.closest("button")!==sec.firstElementChild))return;flip();});
    // botão dentro do cabeçalho (ex.: "+ Nova" em Minhas tarefas): abre o painel ANTES do clique dele, senão o que ele mostra fica escondido
    sec.addEventListener("click",e=>{if(!onHd(e))return;const b=e.target.closest("button");if(b&&b!==sec.firstElementChild&&!sec.classList.contains("open"))flip();},true);
    // Enter/Espaço só dobram quando o foco está no próprio cabeçalho; num botão de dentro, o botão faz o trabalho dele
    sec.addEventListener("keydown",e=>{if(!onHd(e)||e.target!==sec.firstElementChild)return;if(e.key==="Enter"||e.key===" "){e.preventDefault();flip();}});
    }}
  function markHd(sec){const h=sec.firstElementChild;if(!h||h.classList.contains("fhd"))return;if(!h.matches(HD))return;
    h.classList.add("fhd");h.setAttribute("role","button");h.tabIndex=0;h.setAttribute("aria-expanded",sec.classList.contains("open")?"true":"false");}
  let rq=0;const refold=()=>{if(rq)return;rq=1;Promise.resolve().then(()=>{rq=0;foldAll();for(const sec of document.querySelectorAll(".wrap>section.panel.fold"))markHd(sec);});};
  foldAll();const w=document.querySelector(".wrap");if(w&&window.MutationObserver)new MutationObserver(refold).observe(w,{childList:true,subtree:true});
  // Foco: explicação longa vira uma linha
  const fn=document.getElementById("focusNote");if(fn&&/^Escolha a quest, aperte começar/.test(fn.textContent))fn.textContent="Celular virado para baixo. No fim, o XP entra sozinho.";
})();
