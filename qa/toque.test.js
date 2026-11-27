// Alvo de toque: o cabeçalho dos painéis recolhíveis ("Como você está", "Treino do Sistema"...) tem 44px de altura
// para o dedão (Apple HIG / WCAG 2.5.5), sem o painel fechado crescer na tela. Antes de 25/11 era 28px.
// Rode com: python3 -m http.server 8000 & node qa/toque.test.js
const {chromium}=require('playwright');const B='http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
async function onboard(p){for(let i=0;i<16;i++){if(await p.$('.quest:visible'))break;
  for(const [s,v] of [['#q_name','Teste'],['#q_goal','Estudar 20 min']]){const e=await p.$(s+':visible');if(e&&!(await e.inputValue()))await e.fill(v);}
  let btn=null;for(const t of ['18 a 29','Faculdade']){btn=await p.$(`button:visible:has-text("${t}")`);if(btn)break;}
  if(!btn)for(const x of await p.$$('button:visible')){const id=(await x.getAttribute('id'))||'';if(['q_bk','q_full'].includes(id))continue;if(id.startsWith('q_')){btn=x;break;}}
  if(btn)await btn.click();await p.waitForTimeout(900);}
  for(let i=0;i<8;i++){await p.waitForTimeout(600);const m=await p.$('#clsModal button.go:visible')||await p.$('#clsModal .clsbtn:visible');if(m){await m.click();continue;}
    const bs=await p.$$('.sysmodal button.go:visible');if(!bs.length)break;await bs[bs.length-1].click();}}
async function medir(p){return p.$$eval('.panel.fold',ps=>ps.filter(x=>x.offsetParent!==null).map(x=>{const h=x.querySelector(':scope>.fhd');const r=h.getBoundingClientRect(),q=x.getBoundingClientRect();
  return {t:(h.querySelector('h2')||h).textContent.trim().slice(0,30),hh:r.height,ph:q.height,open:x.classList.contains('open')};}));}
(async()=>{const b=await chromium.launch();
for(const [nome,vp] of [['celular',{width:390,height:844}],['desktop',{width:1280,height:800}]]){
  const c=await b.newContext({viewport:vp,timezoneId:'America/Sao_Paulo'});await c.addInitScript(()=>{if(!localStorage.getItem('asc-u-tele'))localStorage.setItem('asc-u-tele','{"asked":1}');});const p=await c.newPage();const errs=[]; // o aceite do painel do criador (#tlModal) cobria o cabeçalho na hora do toque; ele tem teste próprio
  p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_PROXY|Failed to load resource/.test(m.text()))errs.push(m.text());});
  await p.goto(B+'/comecar/');await p.waitForTimeout(800);await onboard(p);await p.waitForTimeout(500);
  const fs=(await medir(p)).filter(x=>!x.open);
  ok(nome+': há painéis recolhíveis',fs.length>0,String(fs.length));
  for(const f of fs){ok(nome+': cabeçalho "'+f.t+'" ≥ 44px',f.hh>=44,f.hh+'px');ok(nome+': painel "'+f.t+'" fechado não cresceu',f.ph<=60,f.ph+'px');}
  // tocar 4px abaixo do topo do cabeçalho abre o painel
  const h=await p.$('.panel.fold:not(.open)>.fhd:visible');await h.scrollIntoViewIfNeeded();const r=await h.boundingBox();
  await p.mouse.click(r.x+r.width/2,r.y+4);await p.waitForTimeout(300);
  ok(nome+': toque na borda do cabeçalho abre',await h.evaluate(e=>e.parentElement.classList.contains('open')));
  const o=(await medir(p)).find(x=>x.open);ok(nome+': cabeçalho aberto ≥ 44px',o&&o.hh>=44,o&&o.hh+'px');
  ok(nome+': sem erro de console',!errs.length,errs.join(' | '));await c.close();}
// app pessoal (raiz): mesmo CSS
{const c=await b.newContext({viewport:{width:390,height:844}});await c.addInitScript(()=>{if(!localStorage.getItem('asc-u-tele'))localStorage.setItem('asc-u-tele','{"asked":1}');});const p=await c.newPage();const errs=[]; // o aceite do painel do criador (#tlModal) cobria o cabeçalho na hora do toque; ele tem teste próprio
  p.on('pageerror',e=>errs.push(e.message));
  await p.goto(B+'/');await p.waitForTimeout(1200);const fs=await medir(p);
  ok('raiz: cabeçalhos ≥ 44px',fs.every(f=>f.hh>=44),JSON.stringify(fs.filter(f=>f.hh<44)));ok('raiz: sem erro de página',!errs.length,errs.join(' | '));await c.close();}
// reduce-motion: a seta continua sem transição
{const c=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await c.newPage();await p.goto(B+'/comecar/');await p.waitForTimeout(800);await onboard(p);
  const t=await p.$eval('.panel.fold>.fhd',e=>getComputedStyle(e,'::after').transitionDuration);ok('reduce-motion: seta sem transição',/^0s/.test(t),t);await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
