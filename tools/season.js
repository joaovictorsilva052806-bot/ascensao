// ---------- Nova temporada: zera XP uma vez por aparelho, com cópia de segurança local ----------
const SEASON="2";
(function(){let cur="";try{cur=localStorage.getItem("asc-u-season")||"";}catch(e){}
  if(cur===SEASON)return;
  const had=prog&&prog.log&&Object.keys(prog.log).length>0;
  try{if(had){localStorage.setItem("asc-u-prog-t1",JSON.stringify(prog));}localStorage.setItem("asc-u-season",SEASON);}catch(e){return;}
  if(!had)return;
  const keep={rank:prog.rank,money:prog.money};
  prog={log:{},extra:{},faith:{},energy:{},mit:{},reviews:{},money:keep.money||[],rest:{},ach:{}};if(keep.rank)prog.rank=keep.rank;
  if(cfg&&!cfg.blank){cfg.startDate=todayKey();try{localStorage.setItem("asc-u-cfg",JSON.stringify(cfg));}catch(e){}}
  save();
  setTimeout(()=>sysPop("NOVA TEMPORADA","Novo despertar","O Ascensão foi atualizado e todo mundo recomeça do nível 1, junto. Suas tarefas continuam. Agora tem classe, habilidades, baú de recompensas e o Sistema te guiando. Seu progresso antigo ficou guardado neste aparelho."),300);})();
function seasonUI(){let has=false;try{has=!!localStorage.getItem("asc-u-prog-t1");}catch(e){}const b=$("seasonUndo");if(b)b.hidden=!has;}
$("seasonUndo").addEventListener("click",()=>{const b=$("seasonUndo");if(!b.dataset.arm){b.dataset.arm=1;b.textContent="Toque de novo para trazer o progresso antigo (o desta temporada é substituído)";setTimeout(()=>{delete b.dataset.arm;b.textContent="Recuperar meu progresso da temporada anterior";},5000);return;}
  try{const o=JSON.parse(localStorage.getItem("asc-u-prog-t1")||"null");if(o&&o.log){o.rpg=prog.rpg;prog=Object.assign({log:{},extra:{},faith:{},energy:{},mit:{},reviews:{}},o);prog.updatedAt=null;save();render();toast("Progresso antigo de volta.");}}catch(e){toast("Não consegui recuperar.");}
  delete b.dataset.arm;b.textContent="Recuperar meu progresso da temporada anterior";});
seasonUI();
