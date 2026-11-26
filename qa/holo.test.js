// Holo: projeção holográfica (tools/holo.*). Só visual: não muda texto, fluxo nem layout; reduce-motion desliga tudo.
// Rode com: python3 tools/gen.py && python3 -m http.server 8000 & node qa/holo.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
(async()=>{const b=await chromium.launch();
for(const [dev,vp] of [['iPhone',{width:390,height:844}],['Pixel7',{width:412,height:915}]])for(const rm of ['no-preference','reduce']){
  const ctx=await b.newContext({viewport:vp,reducedMotion:rm,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  const tag=`${dev} ${rm}`;
  await p.goto(U+'comecar/');await p.waitForTimeout(700);
  const w=await p.evaluate(()=>({svg:!!document.querySelector('#qPerm .hxorb'),hud:!!document.querySelector('#quick>.hxhud[aria-hidden=true]'),sw:document.documentElement.scrollWidth}));
  ok(`${tag}: Despertar tem anéis do projetor`,w.svg);ok(`${tag}: leituras do HUD (aria-hidden)`,w.hud);ok(`${tag}: sem rolagem lateral`,w.sw<=vp.width,w.sw);
  await p.click('#q_perm');await p.waitForTimeout(300);
  ok(`${tag}: Despertar segue para o nome`,await p.isVisible('#q_name'));
  ok(`${tag}: HUD some depois do Despertar`,await p.evaluate(()=>document.querySelector('#quick>.hxhud').hidden));
  await p.fill('#q_name','Teste');await p.click('#q_n0');await p.waitForTimeout(200);
  const tap=await p.evaluate(()=>!!document.querySelector('.hxtap'));ok(`${tag}: anel de toque ${rm==='reduce'?'desligado':'aparece'}`,rm==='reduce'?!tap:tap);
  await p.evaluate(()=>{const m=document.createElement('div');m.className='sysmodal';m.id='hxT';m.innerHTML='<div class="card"><h3>Título intacto</h3><button class="go">OK</button></div>';document.body.append(m);});
  await p.waitForTimeout(100);
  const m=await p.evaluate(()=>{const c=document.querySelector('#hxT .card'),f=c.querySelector('.hxfx'),cs=getComputedStyle(c);return {f:!!f,pe:f&&getComputedStyle(f).pointerEvents,ah:f&&f.getAttribute('aria-hidden'),h3:c.querySelector('h3').textContent,anim:cs.animationName};});
  ok(`${tag}: janela ganha película holográfica`,m.f);ok(`${tag}: película não recebe toque`,m.pe==='none',m.pe);ok(`${tag}: película aria-hidden`,m.ah==='true');ok(`${tag}: texto da janela intacto`,m.h3==='Título intacto',m.h3);
  ok(`${tag}: janela ${rm==='reduce'?'sem':'com'} animação`,rm==='reduce'?m.anim==='none':m.anim==='hxUnfold',m.anim);
  await p.click('#hxT .go',{timeout:3000}).then(()=>ok(`${tag}: botão da janela clicável`,true)).catch(e=>ok(`${tag}: botão da janela clicável`,false,e.message.slice(0,80)));
  ok(`${tag}: sem erro de JS`,!errs.length,errs.join(' | '));await ctx.close();}
// app do JV (raiz) não quebra
{const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(U);await p.waitForTimeout(800);ok('raiz: sem erro de JS',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));console.log(R.filter(x=>x.startsWith('PASS')).length+'/'+R.length);process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
