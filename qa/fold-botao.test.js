// Botão dentro do cabeçalho de um painel recolhido (ex.: "+ Nova" em Mais › Minhas tarefas).
// Antes: o toque abria o formulário DENTRO do painel ainda fechado (nada aparecia na tela), e Enter no botão
// só dobrava o painel (o formulário nunca abria pelo teclado).
// Confere: toque e Enter em "+ Nova" abrem o painel E o formulário com o foco no campo Tarefa; Cancelar volta à lista;
// Enter/Espaço no próprio cabeçalho continuam dobrando; nenhum dado salvo muda; sem erro de JS; com e sem reduce-motion.
// Rode com: python3 -m http.server 8000 & node qa/fold-botao.test.js
const {chromium}=require('playwright');const BASE=process.env.BASE||'http://localhost:8000';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 páginas',xp:10,stat:'mente',main:true},{id:'q2',title:'Caminhar',xp:10,stat:'corpo'}]};
const PROG=()=>({log:{'2026-11-26':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago',stat:'mente'},cg:1,ct0:Date.parse('2026-11-27T19:00:00')},simple:{off:'2026-11-21'}});
(async()=>{const b=await chromium.launch();
for(const [nome,url,P] of [['comecar',BASE+'/comecar/','asc-u-'],['raiz',BASE+'/','ascensao-']])for(const rm of ['no-preference','reduce']){const tag=nome+' '+rm;
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm,hasTouch:true});
  await ctx.route('https://**',r=>r.fulfill({status:200,body:''}));
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-27T19:30:00')});
  await p.goto(BASE+'/privacidade/');
  await p.evaluate(([c,o,P])=>{localStorage.setItem(P+'cfg',JSON.stringify(c));localStorage.setItem(P+'prog',JSON.stringify(o));localStorage.setItem(P+'season','2');
    if(P==='asc-u-'){localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));}},[CFG,PROG(),P]);
  const drain=async()=>{for(let i=0;i<8;i++){const n=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal')].find(x=>x.getClientRects().length);if(!m)return 0;const g=m.querySelector('button.ghost')||m.querySelector('button.go');if(g)g.click();return 1;});if(!n)break;await p.waitForTimeout(400);}};
  const abreMais=async()=>{await p.goto(url);await p.waitForTimeout(1500);await drain();await p.evaluate(()=>document.querySelector('#tabbar [data-go="mais"]').click());await p.waitForTimeout(600);await drain();};
  const dados=()=>p.evaluate(P=>{const o=JSON.parse(localStorage.getItem(P+'prog'));return JSON.stringify([o.log,o.rpg.cls,o.simple,JSON.parse(localStorage.getItem(P+'cfg')).quests]);},P);
  const st=()=>p.evaluate(()=>{const s=document.getElementById('edPanel'),f=document.getElementById('edForm'),l=document.getElementById('edList');
    const vis=x=>!!x&&!x.hidden&&x.getClientRects().length>0&&x.getBoundingClientRect().height>0;
    return {fold:s.classList.contains('fold'),open:s.classList.contains('open'),exp:s.firstElementChild.getAttribute('aria-expanded'),form:vis(f),lista:vis(l),foco:document.activeElement&&document.activeElement.id};});
  await abreMais();const antes=await dados();
  let e=await st();ok(`${tag}: Minhas tarefas começa recolhido`,e.fold&&!e.open&&!e.form,JSON.stringify(e));
  // toque no "+ Nova"
  await p.locator('#edNew').scrollIntoViewIfNeeded();await p.tap('#edNew');await p.waitForTimeout(500);
  e=await st();ok(`${tag}: toque em "+ Nova" abre o painel`,e.open&&e.exp==='true',JSON.stringify(e));
  ok(`${tag}: toque em "+ Nova" mostra o formulário`,e.form,JSON.stringify(e));
  ok(`${tag}: foco vai para o campo Tarefa`,e.foco==='edTitle',JSON.stringify(e));
  await p.evaluate(()=>document.getElementById('edCancel').click());await p.waitForTimeout(400);
  e=await st();ok(`${tag}: Cancelar volta para a lista com o painel aberto`,e.open&&!e.form&&e.lista,JSON.stringify(e));
  // toque em "+ Nova" com o painel já aberto não fecha o painel
  await p.tap('#edNew');await p.waitForTimeout(400);e=await st();
  ok(`${tag}: "+ Nova" com o painel aberto mantém aberto`,e.open&&e.form,JSON.stringify(e));
  await p.evaluate(()=>document.getElementById('edCancel').click());await p.waitForTimeout(300);
  // teclado: Enter no "+ Nova" com o painel recolhido
  await abreMais();
  await p.focus('#edNew');await p.keyboard.press('Enter');await p.waitForTimeout(500);
  e=await st();ok(`${tag}: Enter em "+ Nova" abre o painel e o formulário`,e.open&&e.form&&e.foco==='edTitle',JSON.stringify(e));
  await p.evaluate(()=>document.getElementById('edCancel').click());await p.waitForTimeout(300);
  // Espaço no "+ Nova" também
  await abreMais();
  await p.focus('#edNew');await p.keyboard.press(' ');await p.waitForTimeout(500);
  e=await st();ok(`${tag}: Espaço em "+ Nova" abre o painel e o formulário`,e.open&&e.form,JSON.stringify(e));
  await p.evaluate(()=>document.getElementById('edCancel').click());await p.waitForTimeout(300);
  // o cabeçalho continua dobrando com Enter
  await p.evaluate(()=>document.querySelector('#edPanel>.fhd').focus());await p.keyboard.press('Enter');await p.waitForTimeout(400);
  e=await st();ok(`${tag}: Enter no cabeçalho recolhe`,!e.open&&e.exp==='false',JSON.stringify(e));
  await p.keyboard.press('Enter');await p.waitForTimeout(400);
  e=await st();ok(`${tag}: Enter no cabeçalho abre de novo (lista visível)`,e.open&&e.lista&&!e.form,JSON.stringify(e));
  // toque no texto do cabeçalho continua dobrando
  await p.evaluate(()=>document.querySelector('#edPanel>.fhd h2').click());await p.waitForTimeout(400);
  e=await st();ok(`${tag}: toque no título recolhe`,!e.open,JSON.stringify(e));
  ok(`${tag}: nenhum dado salvo mudou`,antes===await dados());
  ok(`${tag}: sem rolagem lateral`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  ok(`${tag}: sem erro de JS`,!errs.length,errs.join(' | '));
  await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
