// Páginas públicas da 1.0 (/lancamento/, /privacidade/, /termos/): botão principal legível e
// links do topo e do rodapé fáceis de tocar. Antes, "Instalar no celular" era branco sobre
// #3d8bff (3,3:1, WCAG pede 4,5:1) e "Abrir o app →", "Privacidade", "Termos de uso" e
// "Sobre o app" tinham ~17 px de altura (alvo de toque < 24 px, WCAG 2.5.8; aqui pedimos 44 px).
// 27/11: o índice de /privacidade/ ("1. Quem cuida dos seus dados"...) tinha 26 px por link; agora 44 px.
// Também confere: sem rolagem lateral, console limpo, todo link interno responde 200, reduce-motion.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/paginas-1-0.test.js
const {chromium}=require('playwright');const U=process.env.BASE||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
(async()=>{const b=await chromium.launch();
for(const [vw,vh,rm] of [[390,844,'no-preference'],[1280,800,'reduce']]){
 for(const route of ['lancamento/','privacidade/','termos/']){
  const ctx=await b.newContext({viewport:{width:vw,height:vh},reducedMotion:rm});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
  await p.goto(U+route);await p.waitForTimeout(300);
  const tag=route+' '+vw+': ';
  const d=await p.evaluate(()=>{
   const rgb=s=>s.match(/[\d.]+/g).map(Number);
   const L=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
   const cr=(x,y)=>{const a=L(x),c=L(y);return (Math.max(a,c)+.05)/(Math.min(a,c)+.05)};
   const btn=document.querySelector('.btn.p');let c=null;
   if(btn){const cs=getComputedStyle(btn);c=cr(rgb(cs.color),rgb(cs.backgroundColor));}
   const small=[...document.querySelectorAll('header a, footer a, nav.toc a')].filter(a=>a.getBoundingClientRect().height<44).map(a=>a.textContent.trim()+' '+Math.round(a.getBoundingClientRect().height)+'px');
   const links=[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.href).filter(h=>h.startsWith(location.origin)).map(h=>h.split('#')[0]))];
   return {c,small,links,sw:document.documentElement.scrollWidth,iw:innerWidth};});
  if(d.c!==null)ok(tag+'botão principal com contraste ≥ 4,5:1',d.c>=4.5,d.c.toFixed(2)+':1');
  ok(tag+'links do topo, do rodapé e do índice com 44 px de altura',d.small.length===0,d.small.join(', '));
  ok(tag+'sem rolagem lateral',d.sw<=d.iw,d.sw+'>'+d.iw);
  if(vw===390){for(const h of d.links){const r=await ctx.request.get(h);ok(tag+'link '+h.replace(U,'/')+' responde 200',r.status()===200,String(r.status()));}}
  ok(tag+'console sem erro',errs.length===0,errs.join(' | '));
  await ctx.close();}}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${R.length-f}/${R.length} passaram`);process.exit(f?1:0);})();
