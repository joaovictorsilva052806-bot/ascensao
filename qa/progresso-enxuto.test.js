// Telas enxutas em Progresso: Atributos, Arena do Sistema e Meta de leitura também viram linha que abre com 1 toque.
// Antes: o cabeçalho desses 3 painéis (feitos em JS: .athd/.arhd/.lrhd) não era reconhecido pelo tools/simple.js,
// então ficavam sempre abertos (~1.700 px) e a aba Progresso passava de 3.700 px no celular.
// Confere: começam recolhidos, cabeçalho é botão de 44 px com aria-expanded, Enter/toque abre, abrir um fecha o outro,
// "Ver todos ›" dos atributos (Hoje) abre o painel, nenhum dado salvo muda, sem erro de JS, com e sem reduce-motion.
// Rode com: python3 -m http.server 8000 & node qa/progresso-enxuto.test.js
const {chromium}=require('playwright');const BASE=process.env.BASE||'http://localhost:8000';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 páginas',xp:10,stat:'mente',main:true},{id:'q2',title:'Caminhar',xp:10,stat:'corpo'}]};
const PROG=()=>({log:{'2026-11-26':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago',stat:'mente'},cg:1,ct0:Date.parse('2026-11-27T19:00:00')},simple:{off:'2026-11-21'}});
const IDS=['atPanel','arPanel','lrPanel'];
(async()=>{const b=await chromium.launch();
for(const [nome,url,P] of [['comecar',BASE+'/comecar/','asc-u-'],['raiz',BASE+'/','ascensao-']])for(const rm of ['no-preference','reduce']){const tag=nome+' '+rm;
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm});
  await ctx.route('https://**',r=>r.fulfill({status:200,body:''}));
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-27T19:30:00')});
  await p.goto(BASE+'/privacidade/');
  await p.evaluate(([c,o,P])=>{localStorage.setItem(P+'cfg',JSON.stringify(c));localStorage.setItem(P+'prog',JSON.stringify(o));localStorage.setItem(P+'season','2');
    if(P==='asc-u-'){localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));}},[CFG,PROG(),P]);
  await p.goto(url);await p.waitForTimeout(1500);
  const drain=async()=>{for(let i=0;i<8;i++){const n=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal')].find(x=>x.getClientRects().length);if(!m)return 0;const g=m.querySelector('button.ghost')||m.querySelector('button.go');if(g)g.click();return 1;});if(!n)break;await p.waitForTimeout(400);}};
  await drain();
  const antes=await p.evaluate(P=>{const o=JSON.parse(localStorage.getItem(P+'prog'));return JSON.stringify([o.log,o.rpg.cls,o.simple]);},P);
  await p.evaluate(()=>document.querySelector('#tabbar [data-go="prog"]').click());await p.waitForTimeout(600);await drain();
  const est=()=>p.evaluate(ids=>ids.map(id=>{const s=document.getElementById(id);if(!s)return {id,ok:false};const h=s.firstElementChild;const r=h.getBoundingClientRect();
    const corpo=[...s.children].slice(1).some(x=>x.getClientRects().length&&x.getBoundingClientRect().height>0);
    return {id,ok:true,fold:s.classList.contains('fold'),open:s.classList.contains('open'),role:h.getAttribute('role'),exp:h.getAttribute('aria-expanded'),tab:h.tabIndex,alt:Math.round(r.height),corpo,nome:(h.textContent||'').trim().slice(0,30)};}),IDS);
  let e=await est();
  for(const x of e){ok(`${tag}: ${x.id} existe`,x.ok);if(!x.ok)continue;
    ok(`${tag}: ${x.id} começa recolhido`,x.fold&&!x.open&&!x.corpo,JSON.stringify(x));
    ok(`${tag}: ${x.id} cabeçalho é botão com aria-expanded=false`,x.role==='button'&&x.exp==='false'&&x.tab===0,JSON.stringify(x));
    ok(`${tag}: ${x.id} cabeçalho com 44 px ou mais`,x.alt>=44,String(x.alt));}
  const altura=await p.evaluate(()=>document.documentElement.scrollHeight);
  ok(`${tag}: aba Progresso mais curta (<= 2.600 px)`,altura<=2600,String(altura));
  // teclado: Enter abre Atributos
  await p.evaluate(()=>{const h=document.querySelector('#atPanel>.fhd');if(!h)return;h.scrollIntoView({block:'center'});h.focus();});
  await p.keyboard.press('Enter');await p.waitForTimeout(400);
  e=await est();ok(`${tag}: Enter abre Atributos`,e[0].open&&e[0].corpo&&e[0].exp==='true',JSON.stringify(e[0]));
  ok(`${tag}: radar dos atributos aparece aberto`,await p.evaluate(()=>[...document.querySelectorAll('#atPanel .atrow')].some(x=>x.getClientRects().length)));
  // toque: abrir a Arena fecha Atributos (uma coisa por vez)
  await p.evaluate(()=>document.querySelector('#arPanel>.fhd')?.click());await p.waitForTimeout(400);
  e=await est();ok(`${tag}: toque abre a Arena e fecha Atributos`,e[1].open&&e[1].corpo&&!e[0].open&&e[0].exp==='false',JSON.stringify([e[0],e[1]]));
  ok(`${tag}: botão Lutar visível com a Arena aberta`,await p.evaluate(()=>{const g=document.getElementById('arGo');return !!g&&g.getClientRects().length>0;}));
  await p.evaluate(()=>document.querySelector('#lrPanel>.fhd')?.click());await p.waitForTimeout(400);
  e=await est();ok(`${tag}: Meta de leitura abre e mostra as metas`,e[2].open&&await p.evaluate(()=>[...document.querySelectorAll('#lrPanel .lrgoals button')].some(x=>x.getClientRects().length)),JSON.stringify(e[2]));
  await p.evaluate(()=>document.querySelector('#lrPanel>.fhd')?.click());await p.waitForTimeout(400);
  e=await est();ok(`${tag}: toque de novo recolhe`,!e[2].open&&!e[2].corpo,JSON.stringify(e[2]));
  // "Ver todos ›" dos atributos (cartão do herói em Hoje) abre o painel em Progresso
  await p.evaluate(()=>document.querySelector('#tabbar [data-go="hoje"]').click());await p.waitForTimeout(400);
  if(!(await p.evaluate(()=>!!document.querySelector('.hrat')&&document.querySelector('.hrat').getClientRects().length>0)))await p.evaluate(()=>{const t=document.querySelector('.hrtog');if(t)t.click();});
  await p.waitForTimeout(400);
  const temAt=await p.evaluate(()=>{const a=document.querySelector('.hrat');if(!a)return false;a.click();return true;});
  ok(`${tag}: atalho dos atributos existe em Hoje`,temAt);
  await p.waitForTimeout(700);e=await est();
  ok(`${tag}: atalho abre Atributos em Progresso`,await p.evaluate(()=>document.body.dataset.tab==='prog')&&e[0].open&&e[0].corpo,JSON.stringify(e[0]));
  const depois=await p.evaluate(P=>{const o=JSON.parse(localStorage.getItem(P+'prog'));return JSON.stringify([o.log,o.rpg.cls,o.simple]);},P);
  ok(`${tag}: nenhum dado salvo mudou`,antes===depois);
  ok(`${tag}: sem rolagem lateral`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  ok(`${tag}: sem erro de JS`,!errs.length,errs.join(' | '));
  await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
