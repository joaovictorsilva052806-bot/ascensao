// Reduce-motion: com "reduzir movimento" ligado, nada transiciona nem anima com duração (barra de XP, anel do rank e animações CSS).
// Sem reduce-motion, a barra de XP continua animando (o efeito normal não some).
// Rode com: python3 -m http.server 8000 & node qa/movimento.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
(async()=>{const b=await chromium.launch();
for(const r of ['','comecar/'])for(const rm of ['reduce','no-preference']){
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm});const p=await ctx.newPage();
  await p.goto(U+r);await p.waitForTimeout(900);
  const st=await p.evaluate(()=>['xpbar','rank'].map(id=>{const e=document.getElementById(id);if(!e)return null;const s=getComputedStyle(e);
    const dur=s.transitionDuration.split(',').map(parseFloat).reduce((a,x)=>Math.max(a,x),0);return {id,dur,anim:s.animationName};}).filter(Boolean));
  if(rm==='reduce'){for(const s of st){ok(`/${r} reduce: #${s.id} sem transição`,s.dur===0,`duração ${s.dur}s`);ok(`/${r} reduce: #${s.id} sem animação`,s.anim==='none',s.anim);}}
  else{const x=st.find(s=>s.id==='xpbar');ok(`/${r} normal: barra de XP ainda anima`,!!x&&x.dur>0,x&&`duração ${x.dur}s`);}
  await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
