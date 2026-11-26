// Desafios relâmpago (#45): acessibilidade da tela do desafio.
// Antes de 25/11 (revisão 18h): Esc não fechava, a tela não tinha nome para leitor de tela, o foco ficava atrás dela,
// cada toque no contador recriava o botão (o foco se perdia) e a contagem não era anunciada.
// Também confere: contar até o fim libera o "Concluir", XP entra no log e dado antigo continua intacto.
// Rode com: python3 -m http.server 8000 & node qa/relampago.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/comecar/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]};
const PROG={log:{},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},velho:'fica'};
async function drain(p){for(let k=0;k<2;k++){for(let i=0;i<10;i++){const m=p.locator('.sysmodal:not([hidden]) button.go');if(!(await m.count()))break;await m.first().dispatchEvent('click');await p.waitForTimeout(150);}await p.waitForTimeout(700);}}
(async()=>{const b=await chromium.launch();
for(const rm of [false,true]){const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm?'reduce':'no-preference'});const p=await ctx.newPage();const errs=[];const tag=rm?' (reduce-motion)':'';
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,body:''}));
  await p.clock.install({time:new Date('2026-11-25T14:00:00')});await p.goto(U+'__seed__');
  await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));},[CFG,PROG]);
  await p.goto(U);await p.waitForTimeout(1500);await drain(p);
  const cards=p.locator('#zapPanel .zapc');ok('3 desafios na aba Hoje'+tag,await cards.count()===3,String(await cards.count()));
  // abre o 1º desafio de contagem (n>1); se não houver no dia, o 1º qualquer
  const idx=await p.evaluate(()=>{const t=[...document.querySelectorAll('#zapPanel .zapc .tt')].map(e=>e.textContent);const i=t.findIndex(x=>/^\d+ /.test(x)&&!/^1 /.test(x));return i<0?0:i;});
  await cards.nth(idx).focus();await cards.nth(idx).press('Enter');await p.waitForTimeout(200);
  const sh=p.locator('#zapSheet');ok('tela do desafio abre'+tag,await sh.isVisible());
  ok('tela tem nome para leitor de tela'+tag,!!(await sh.getAttribute('aria-label')||await sh.getAttribute('aria-labelledby')));
  ok('foco vai para dentro da tela'+tag,await p.evaluate(()=>{const m=document.getElementById('zapSheet');return !!m&&m.contains(document.activeElement);}));
  const tap=p.locator('#zapSheet .zaptap');
  if(await tap.count()){const tot=await p.evaluate(()=>+document.querySelector('#zapSheet .zaptap span').textContent.match(/\d+/)[0]);
    await tap.focus();await p.keyboard.press('Enter');await p.waitForTimeout(80);
    ok('foco continua no contador depois do toque'+tag,await p.evaluate(()=>!!document.activeElement&&document.activeElement.classList.contains('zaptap')));
    ok('contagem é anunciada (aria-live)'+tag,await p.evaluate(()=>{const l=document.querySelector('#zapSheet [aria-live]');return !!l&&/1 de \d+/.test(l.textContent);}),await p.evaluate(()=>{const l=document.querySelector('#zapSheet [aria-live]');return l?l.textContent:'sem região aria-live';}));
    for(let i=1;i<tot;i++){await p.locator('#zapSheet .zaptap').dispatchEvent('click');}
    await p.waitForTimeout(100);const fin=p.locator('#zapSheet .msend button.go');ok('contar até o fim libera o Concluir'+tag,await fin.isEnabled());
    ok('fim da contagem anunciado'+tag,await p.evaluate(()=>/pronto|concluir/i.test((document.querySelector('#zapSheet [aria-live]')||{}).textContent||'')));}
  await p.keyboard.press('Escape');await p.waitForTimeout(150);
  ok('Esc fecha a tela'+tag,!(await sh.isVisible()));
  ok('foco volta para o cartão do desafio'+tag,await p.waitForFunction(()=>!!document.activeElement&&document.activeElement.classList.contains('zapc'),null,{timeout:1500}).then(()=>true,()=>false),await p.evaluate(()=>{const a=document.activeElement;return a?(a.tagName+'.'+a.className+' «'+a.textContent.slice(0,40)+'» em '+((a.closest('[id]')||{}).id||'?')):'nada';}));
  // concluir pelo fluxo normal
  await cards.nth(idx).dispatchEvent('click');await p.waitForTimeout(150);
  if(await p.locator('#zapSheet .zaptap').count()){const tot=await p.evaluate(()=>+document.querySelector('#zapSheet .zaptap span').textContent.match(/\d+/)[0]);for(let i=0;i<tot;i++)await p.locator('#zapSheet .zaptap').dispatchEvent('click');
    await p.locator('#zapSheet .msend button.go').dispatchEvent('click');await p.waitForTimeout(300);await drain(p);
    const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
    ok('XP do desafio no log'+tag,(st.log['2026-11-25']||[]).some(e=>e.kind==='zap'&&e.xp>=10));
    ok('dado antigo intacto'+tag,st.velho==='fica'&&st.rpg.cls.id==='mago');}
  if(rm)ok('reduce-motion: contador não encolhe ao tocar',await p.evaluate(()=>{const r=[...document.styleSheets].flatMap(s=>{try{return [...s.cssRules]}catch(e){return []}});return r.some(x=>x.media&&/reduce/.test(x.media.mediaText)&&/\.zaptap/.test(x.cssText)&&/transform:\s*none/.test(x.cssText));}));
  ok('sem erro de console'+tag,!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
