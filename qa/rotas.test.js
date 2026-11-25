// Fumaça: as 3 rotas abrem sem erro de console no celular (390x844) e no desktop, com e sem reduce-motion.
// Rode com: python3 -m http.server 8000 & node qa/rotas.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
(async()=>{const b=await chromium.launch();
for(const vp of [{width:390,height:844},{width:1280,height:800}])for(const rm of ['no-preference','reduce'])for(const r of ['','comecar/','convite/']){
  const ctx=await b.newContext({viewport:vp,reducedMotion:rm});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  const res=await p.goto(U+r);await p.waitForTimeout(900);
  ok('/'+r+' '+vp.width+' '+rm,res.status()===200&&errs.length===0,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
