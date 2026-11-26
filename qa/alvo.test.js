// Alvo de toque na tela Hoje: o título da tarefa (abre os detalhes) e os selos do topo (🔥 sequência, 🛡️ escudo, classe)
// precisam aceitar o toque numa faixa de ≥ 44px de altura (WCAG 2.5.5 / Apple HIG), sem mudar o visual e sem roubar
// o toque dos botões da tarefa. Antes de 25/11 22h o título tinha 21px e os selos 30px.
// Rode com: python3 -m http.server 8000 & node qa/alvo.test.js
const {chromium}=require('playwright');const B='http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
async function onboard(p){for(let i=0;i<16;i++){if(await p.$('.quest:visible'))break;
  for(const [s,v] of [['#q_name','Teste'],['#q_goal','Estudar 20 min']]){const e=await p.$(s+':visible');if(e&&!(await e.inputValue()))await e.fill(v);}
  let btn=null;for(const t of ['18 a 29','Faculdade']){btn=await p.$(`button:visible:has-text("${t}")`);if(btn)break;}
  if(!btn)for(const x of await p.$$('button:visible')){const id=(await x.getAttribute('id'))||'';if(['q_bk','q_full'].includes(id))continue;if(id.startsWith('q_')){btn=x;break;}}
  if(btn)await btn.click();await p.waitForTimeout(900);}
  for(let i=0;i<8;i++){await p.waitForTimeout(600);const m=await p.$('#clsModal button.go:visible')||await p.$('#clsModal .clsbtn:visible');if(m){await m.click();continue;}
    const bs=await p.$$('.sysmodal button.go:visible');if(!bs.length)break;await bs[bs.length-1].click();}}
// faixa vertical (em px) em que um toque no centro horizontal cai no próprio elemento
const faixa=(p,sel)=>p.$eval(sel,e=>{const r=e.getBoundingClientRect(),x=r.left+r.width/2,c=r.top+r.height/2;let a=0,b=0;
  while(a<40&&e.contains(document.elementFromPoint(x,c-a-1)))a++;while(b<40&&e.contains(document.elementFromPoint(x,c+b+1)))b++;return {alt:Math.round(r.height),hit:a+b+1};});
(async()=>{const b=await chromium.launch();
for(const [nome,vp] of [['celular',{width:390,height:844}],['desktop',{width:1280,height:800}]]){
  const c=await b.newContext({viewport:vp,timezoneId:'America/Sao_Paulo'});await c.clock.install({time:new Date('2026-11-26T12:00:00-03:00')});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_PROXY|Failed to load resource|vibrate/.test(m.text()))errs.push(m.text());});
  // relógio fixo ao meio-dia: entre 0h e 5h as principais ficam trancadas e a única tarefa liberada é uma extra de 2 linhas
  await p.clock.install({time:new Date('2026-11-26T12:00:00-03:00')});
  await p.goto(B+'/comecar/');await p.waitForTimeout(800);await onboard(p);await p.waitForTimeout(600);
  // máquina carregada: espera as animações de entrada (finitas) terminarem antes de medir a área de toque
  await p.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'||(a.effect&&a.effect.getTiming().iterations===Infinity)),null,{timeout:8000}).catch(()=>{});
  await p.evaluate(()=>scrollTo(0,0));
  for(const s of ['#streak','#shieldPill','#clsPill']){const e=await p.$(s+':visible');if(!e){ok(nome+': '+s+' visível',false,'não achou');continue;}
    const f=await faixa(p,s);ok(nome+': selo '+s+' aceita toque em ≥ 44px',f.hit>=44,JSON.stringify(f));ok(nome+': selo '+s+' não cresceu na tela',f.alt<=32,f.alt+'px');}
  const tt='#quests .quest:not(.qtlock) .t .tt';const q=await p.$(tt);
  if(!q)ok(nome+': há tarefa liberada',false);else{await q.evaluate(e=>e.scrollIntoView({block:'center'}));await p.waitForTimeout(100); // centro: a tarefa agora fica logo abaixo do cartão e o 'IfNeeded' a deixava encostada na barra de abas
    const f=await faixa(p,tt);ok(nome+': título da tarefa aceita toque em ≥ 44px',f.hit>=44,JSON.stringify(f));ok(nome+': título não cresceu na tela',f.alt<=30,f.alt+'px');
    const card=await q.evaluateHandle(e=>e.closest('.quest'));const r=await q.boundingBox();
    await p.mouse.click(r.x+r.width/2,r.y+r.height+8);await p.waitForTimeout(250);
    ok(nome+': toque logo abaixo do título abre os detalhes',await card.evaluate(e=>e.classList.contains('open')));
    ok(nome+': aria-expanded acompanha',(await q.getAttribute('aria-expanded'))==='true');
    // os botões da tarefa continuam recebendo o próprio toque
    // (com a lista no topo da tela, os botões do cartão aberto podem ficar atrás da barra de abas: traz para o meio antes de medir)
    await card.evaluate(e=>{const b=e.querySelector('.btns');if(b)b.scrollIntoView({block:'center'});});await p.waitForTimeout(150);
    const bt=await card.evaluate(e=>[...e.querySelectorAll('.btns button')].filter(b=>b.offsetParent).every(b=>{const r=b.getBoundingClientRect();const pts=[[r.left+r.width/2,r.top+2],[r.left+r.width/2,r.top+r.height/2]];return pts.every(([x,y])=>b.contains(document.elementFromPoint(x,y)));}));
    ok(nome+': botões da tarefa não perdem o toque',bt);}
  ok(nome+': sem erro de console',!errs.length,errs.join(' | '));await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
