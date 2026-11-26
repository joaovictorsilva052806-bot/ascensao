// Avisos do Sistema: nunca dois iguais na tela ao mesmo tempo, e habilidade já anunciada não volta ao reabrir o app.
// Bugs de 25/11: (1) aviso aberto dentro do botão de outro (ex.: check-in que solta habilidade) era mostrado 2x;
// (2) r.seen não era gravado, e o "HABILIDADE DESBLOQUEADA" repetia a cada abertura.
// Rode com: python3 -m http.server 8000 & node qa/avisos.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/comecar/';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},timezoneId:'America/Sao_Paulo'});
await c.addInitScript(()=>{window.__max=0;window.__dup=[];new MutationObserver(()=>{const v=[...document.querySelectorAll('.sysmodal')].filter(m=>m.offsetParent!==null||getComputedStyle(m).display!=='none'&&!m.hidden);
  window.__max=Math.max(window.__max,v.length);const t=v.map(m=>m.innerText.slice(0,80));if(new Set(t).size<t.length)window.__dup.push(t.join(' || '));}).observe(document,{childList:true,subtree:true});});
const p=await c.newPage();const T0=new Date('2026-11-25T12:00:00-03:00');await p.clock.install({time:T0});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(U);await p.waitForTimeout(800);
for(let i=0;i<16;i++){if(await p.$('.quest:visible'))break;
  for(const [s,v] of [['#q_name','Teste'],['#q_goal','Estudar 20 min']]){const e=await p.$(s+':visible');if(e&&!(await e.inputValue()))await e.fill(v);}
  let btn=null;for(const t of ['18 a 29','Faculdade']){btn=await p.$(`button:visible:has-text("${t}")`);if(btn)break;}
  if(!btn)for(const x of await p.$$('button:visible')){const id=(await x.getAttribute('id'))||'';if(['q_bk','q_full'].includes(id))continue;if(id.startsWith('q_')){btn=x;break;}}
  if(btn)await btn.click();await p.waitForTimeout(900);}
const seen=[];const drain=async()=>{for(let i=0;i<8;i++){await p.waitForTimeout(700);const m=await p.$('#clsModal button.go:visible')||await p.$('#clsModal .clsbtn:visible');if(m){await m.click();continue;}
  const bs=await p.$$('.sysmodal:not(#clsModal) button.go:visible');if(!bs.length)return;const h=await p.$$eval('.sysmodal:not(#clsModal) h3',x=>x.map(e=>e.textContent));seen.push(...h);await bs[bs.length-1].click({timeout:3000}).catch(()=>{});/* o aviso pode sair de cena (pedido do painel cede a outro aviso) */}};
await drain();await p.click('.quest:visible button.go:visible');await drain();
const skills1=seen.slice();
await p.clock.setSystemTime(new Date(T0.getTime()+864e5));await p.reload();await p.waitForTimeout(1500);seen.length=0;await drain();
const again=skills1.filter(t=>seen.includes(t)&&!/^Dia /.test(t));
ok('nenhum aviso igual duplicado na tela',(await p.evaluate(()=>window.__dup.length))===0,await p.evaluate(()=>window.__dup[0]));
ok('no máximo 1 aviso do Sistema visível por vez',(await p.evaluate(()=>window.__max))<=1,`máximo ${await p.evaluate(()=>window.__max)}`);
ok('habilidade anunciada ontem não volta hoje',again.length===0,again.join(', '));
ok('fluxo sem erro de JS',errs.length===0,errs[0]);
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
