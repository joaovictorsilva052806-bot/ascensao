// ---------- reduce-motion também na rolagem (tools/rolagem.js) ----------
// Vários atalhos rolam a tela até um painel com behavior:"smooth" (ficha do personagem, guia, chefão, turma, avatar...).
// O navegador NÃO desliga essa rolagem animada sozinho com "reduzir movimento". Aqui, com reduce-motion ligado,
// toda rolagem "smooth" vira salto direto ("auto"). Sem reduce-motion, nada muda. Não toca em dados.
{const rm=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){return false;}};
 const fix=o=>(o&&typeof o==="object"&&o.behavior==="smooth"&&rm())?Object.assign({},o,{behavior:"auto"}):o;
 const wrap=(obj,k)=>{const f=obj&&obj[k];if(typeof f!=="function"||f.__rmFix)return;const g=function(a,...r){return f.call(this,fix(a),...r);};g.__rmFix=1;obj[k]=g;};
 try{for(const k of ["scrollIntoView","scrollTo","scrollBy"])wrap(Element.prototype,k);for(const k of ["scrollTo","scrollBy","scroll"])wrap(window,k);wrap(Element.prototype,"scroll");}catch(e){}}
