// "+XP" empilhado: quando uma quest e uma conquista (ou o baú/chefe) dão XP no mesmo toque, cada "+XP" sobe
// numa linha própria em vez de nascer no mesmo ponto e virar um borrão ilegível. Vale com e sem reduce-motion.
// Rode com: python3 -m http.server 8000 & node qa/xp-pilha.test.js
const {chromium}=require('playwright');const B='http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
async function onboard(p){for(let i=0;i<16;i++){if(await p.$('.quest:visible'))break;
  for(const [s,v] of [['#q_name','Teste'],['#q_goal','Estudar 20 min']]){const e=await p.$(s+':visible');if(e&&!(await e.inputValue()))await e.fill(v);}
  let btn=null;for(const t of ['18 a 29','Faculdade']){btn=await p.$(`button:visible:has-text("${t}")`);if(btn)break;}
  if(!btn)for(const x of await p.$$('button:visible')){const id=(await x.getAttribute('id'))||'';if(['q_bk','q_full'].includes(id))continue;if(id.startsWith('q_')){btn=x;break;}}
  if(btn)await btn.click();await p.waitForTimeout(900);}
  for(let i=0;i<8;i++){await p.waitForTimeout(600);const m=await p.$('#clsModal button.go:visible')||await p.$('#clsModal .clsbtn:visible');if(m){await m.click();continue;}
    const bs=await p.$$('.sysmodal button.go:visible');if(!bs.length)break;await bs[bs.length-1].click();}}
// grava cada "+XP" no instante em que nasce (antes de a animação mexer): texto, topo e quantos estavam vivos
const SPY=()=>{window.__xp=[];new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.classList&&n.classList.contains('xpfloat')){
  const r=n.getBoundingClientRect();window.__xp.push({t:n.textContent,top:parseFloat(n.style.top),h:r.height,vivos:document.querySelectorAll('.xpfloat').length});}}).observe(document.body,{childList:true});};
(async()=>{const b=await chromium.launch();
for(const rm of ['no-preference','reduce']){
  const tag='comecar '+rm;const c=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm,timezoneId:'America/Sao_Paulo'});
  await c.addInitScript(()=>{if(!localStorage.getItem('asc-u-tele'))localStorage.setItem('asc-u-tele','{"asked":1}');});
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_PROXY|Failed to load resource/.test(m.text()))errs.push(m.text());});
  await p.goto(B+'/comecar/');await p.waitForTimeout(800);await onboard(p);
  await p.evaluate(SPY);
  for(let i=0;i<4;i++){const bs=await p.$$('.sysmodal button.go:visible');if(!bs.length)break;await bs[bs.length-1].click();await p.waitForTimeout(400);}
  await p.evaluate(()=>{window.__xp.length=0;});
  const q=await p.$('.quest:visible button.go:visible');const box=q&&await q.boundingBox();
  ok(tag+': há quest para marcar',!!box);
  if(box){await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await p.waitForTimeout(400);}
  const xs=await p.evaluate(()=>window.__xp);
  R.push('INFO '+tag+': '+JSON.stringify(xs));
  ok(tag+': o toque mostra "+XP"',xs.length>=1,JSON.stringify(xs));
  let bate=null;xs.forEach((x,i)=>{if(i&&x.vivos>1&&xs.slice(0,i).some(a=>Math.abs(a.top-x.top)<x.h))bate=x;});
  ok(tag+': "+XP" juntos não se sobrepõem',!bate,JSON.stringify(xs));
  ok(tag+': "+XP" fica dentro da tela',xs.every(x=>x.top>=0),JSON.stringify(xs));
  ok(tag+': sem erro de console',!errs.length,errs.join(' | '));await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.filter(x=>x.startsWith('PASS')).length)+'/'+(R.filter(x=>!x.startsWith('INFO')).length));process.exit(f?1:0);})();
