// ---- Miniaturas no criador de avatar (tools/avthumb.js): cada opção mostra como VOCÊ fica com ela ----
// Só visual: lê prog.avatar, troca um campo por um instante para desenhar e devolve o valor na hora (nada é salvo aqui).
const AVT_K={"Formato do rosto":"r","Olhos":"es","Sobrancelha":"bw","Expressão":"mo","Barba":"bd","Corte":"h","Roupa":"o","Na cabeça":"hw","Na mão":"it","Corpo":"bt","Óculos":"gl","Brinco e piercing":"er","Acessório do Sistema":"a","Moldura":"f"};
const AVT_HEAD={r:1,es:1,bw:1,mo:1,bd:1,h:1,hw:1,gl:1,er:1};
function avtDraw(row){const k=row.dataset.avk;if(!k)return;let st;try{st=avSt();}catch(e){return;}const old=st[k],oh=st.hw;
  try{if(k==="h")st.hw=1; // corte: mostra sem chapéu para dar para ver o cabelo
    for(const b of row.querySelectorAll("button.avchip[data-i]")){if(b.closest("details:not([open])"))continue;const i=+b.dataset.i;st[k]=i;let th=b.querySelector(".avth");
      if(!th){th=document.createElement("span");th.className="avth"+(AVT_HEAD[k]?" head":"");th.setAttribute("aria-hidden","true");b.prepend(th);b.classList.add("hasth");}
      th.innerHTML=avMine(56);}}
  catch(e){}finally{st[k]=old;st.hw=oh;}}
function avtPane(pane){if(!pane||pane.hidden)return;for(const r of pane.querySelectorAll(".avrow[data-avk]"))avtDraw(r);}
function avtInit(){const m=document.querySelector(".avmk");if(!m||m.dataset.avt)return;m.dataset.avt="1";
  for(const r of m.querySelectorAll(".avrow")){const l=r.querySelector(".avrl");const k=l&&AVT_K[l.textContent.trim()];if(k){r.dataset.avk=k;const ch=r.querySelector(".avchips");if(ch)ch.classList.add("avths");for(const ch2 of r.querySelectorAll(".avchips"))ch2.classList.add("avths");}}
  // raridade pelo nível que destrava: raro (azul), épico (roxo), lendário (dourado)
  const RAR=[["a",typeof AV_ACC!=="undefined"?AV_ACC:[]],["f",typeof AV_FRAME!=="undefined"?AV_FRAME:[]]];
  for(const [k,arr] of RAR){const r=m.querySelector('.avrow[data-avk="'+k+'"]');if(!r)continue;
    for(const b of r.querySelectorAll("button.avchip[data-i]")){const n=(arr[+b.dataset.i]||[])[1]||1;const t=n>=12?"lend":n>=6?"epico":n>=2?"raro":"";if(t){b.dataset.rar=t;const g=document.createElement("span");g.className="avrar";g.setAttribute("aria-hidden","true");g.textContent=t==="lend"?"LENDÁRIO":t==="epico"?"ÉPICO":"RARO";b.append(g);}}}
  const cur=()=>[...m.querySelectorAll(".avpane")].find(p=>!p.hidden);
  let t=0;const later=()=>{clearTimeout(t);t=setTimeout(()=>avtPane(cur()),90);};
  m.addEventListener("click",e=>{if(e.target.closest(".avtab")||e.target.closest("button.avchip")||e.target.closest(".avmkf button")||e.target.closest("summary"))later();});
  avtPane(cur());}
{const _avm=avMaker;avMaker=function(){const r=_avm.apply(this,arguments);try{avtInit();}catch(e){}return r;};}
