// Janelas do Sistema acessíveis (.sysmodal e .levelup): o leitor de tela anuncia "janela, <título>",
// o foco vai para o botão principal quando a janela abre (Enter/Espaço já confirmam), o Tab não escapa
// para a tela de trás e, ao fechar, o foco volta para onde estava. Não muda visual, texto, XP nem dados.
(function(){
  const SEL=".sysmodal,.levelup";let n=0;const back=new WeakMap();
  const vis=m=>m.isConnected&&!m.hidden&&m.getClientRects().length>0;
  const open=()=>[...document.querySelectorAll(SEL)].filter(vis);
  const focaveis=m=>[...m.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(e=>!e.disabled&&!e.hidden&&e.getClientRects().length);
  function arm(m){
    if(!vis(m)||m.dataset.dlg)return;m.dataset.dlg="1";
    m.setAttribute("role","dialog");if(!m.hasAttribute("aria-modal"))m.setAttribute("aria-modal","true");
    if(!m.getAttribute("aria-label")&&!m.getAttribute("aria-labelledby")){
      const ids=[m.querySelector(".card>.tag"),m.querySelector("h3,h2")||m.querySelector(".card>*")].filter((h,i,a)=>h&&h.textContent.trim()&&a.indexOf(h)===i).map(h=>h.id||(h.id="dlgT"+(++n)));
      if(ids.length)m.setAttribute("aria-labelledby",ids.join(" "));}
    const a=document.activeElement;if(a&&a!==document.body&&!m.contains(a))back.set(m,a);
    setTimeout(()=>{if(!vis(m)||m.contains(document.activeElement))return;
      const b=focaveis(m).find(e=>e.matches("button.go"))||focaveis(m)[0];if(b)try{b.focus({preventScroll:true});}catch(e){}},60);}
  function disarm(m){if(!m.dataset.dlg)return;delete m.dataset.dlg;const a=back.get(m);back.delete(m);
    setTimeout(()=>{const ae=document.activeElement;if(open().length||(ae&&ae!==document.body&&ae.isConnected))return;
      if(a&&a.isConnected&&a.getClientRects().length)try{a.focus({preventScroll:true});}catch(e){}},0);}
  function scan(){document.querySelectorAll(SEL).forEach(m=>vis(m)?arm(m):disarm(m));}
  if(window.MutationObserver)new MutationObserver(ms=>{let go=false;for(const r of ms){
      if(r.type==="attributes"){if(r.target.matches&&r.target.matches(SEL))go=true;continue;}
      for(const x of r.addedNodes)if(x.nodeType===1&&(x.matches(SEL)||x.querySelector&&x.querySelector(SEL)))go=true;
      for(const x of r.removedNodes)if(x.nodeType===1&&x.dataset&&x.dataset.dlg)disarm(x);}
    if(go)scan();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});
  // Tab dá a volta dentro da janela de cima
  document.addEventListener("keydown",e=>{if(e.key!=="Tab")return;const o=open();if(!o.length)return;const m=o[o.length-1];
    const f=focaveis(m);if(!f.length)return;const i=f.indexOf(document.activeElement);
    if(i<0||(!e.shiftKey&&i===f.length-1)||(e.shiftKey&&i===0)){e.preventDefault();f[e.shiftKey?f.length-1:0].focus();}},true);
  // Esc fecha a janela de cima quando ela marca a saída segura com data-esc (Fechar/Voltar/Escolher depois):
  // faz o mesmo que tocar no botão. Janelas com escolha (aceitar amigo, idade) não marcam e seguem como estão.
  document.addEventListener("keydown",e=>{if(e.key!=="Escape"||e.repeat||e.defaultPrevented)return;const o=open();if(!o.length)return;
    const b=o[o.length-1].querySelector("[data-esc]");if(!b||b.disabled||!b.getClientRects().length)return;e.preventDefault();e.stopPropagation();b.click();});
  setTimeout(scan,0);
})();
