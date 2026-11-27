// Meta de leitura: "Trocar livro" não apaga o livro sem perguntar (issue #140).
// 2 toques para trocar; o livro largado fica guardado em prog.read.paused e dá para voltar a ele.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/trocar-livro.test.js
const {chromium}=require('playwright');
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'young'},quests:[
 {id:'q1',title:'Treino de 20 min',xp:20,stat:'corpo',main:true},{id:'q2',title:'Estudar 25 min',xp:20,stat:'mente',main:true},
 {id:'s_fech',title:'Antes de dormir: marcar o que fiz hoje',xp:15,stat:'foco',main:true}]};
const T='2026-11-25';
const base=()=>({log:{'2026-11-24':[{q:'q1',kind:'full',xp:20,stat:'corpo',bonus:0,t:'x'}],[T]:[{q:'ler:'+T,kind:'full',xp:5,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},
  rpg:{cls:{id:'guerreiro',style:'fant',name:'Guerreiro',stat:'corpo'},seen:{foco:1,vendas:1,mente:1,corpo:1}},velho:'fica',
  read:{goal:10,d:{[T]:10},book:{t:'O Hobbit',tot:300,pg:10},books:[{t:'Duna',d:'2026-11-01'}]}});
async function drain(p){for(let i=0;i<12;i++){const m=p.locator('.sysmodal:visible:not(#clsModal) button.go, .levelup:visible button.go');if(!(await m.count()))return;await m.first().dispatchEvent('click');await p.waitForTimeout(200);}}
const abre=async(p,id)=>{await p.evaluate(id=>{const s=document.getElementById(id);if(s&&s.classList.contains('fold')&&!s.classList.contains('open')){s.scrollIntoView({block:'start'});s.querySelector(':scope>.fhd').click();}},id);await p.waitForTimeout(300);}; // painel recolhido (telas enxutas): abre com 1 toque no título
(async()=>{const b=await chromium.launch();
for(const ROOT of [false,true])for(const rm of ['no-preference','reduce']){
  const U='http://localhost:8000/'+(ROOT?'':'comecar/'),K=ROOT?'ascensao-':'asc-u-',tag=(ROOT?'raiz':'comecar')+(rm==='reduce'?' rm':'');
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nivel\n'}));
  await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"posts":[]}'}));
  await p.clock.install({time:new Date(T+'T10:00:00')});
  await p.goto(U+'__seed__');
  await p.evaluate(([c,o,k])=>{localStorage.setItem(k+'cfg',JSON.stringify(c));localStorage.setItem(k+'prog',JSON.stringify(o));localStorage.setItem(k+'season','2');localStorage.setItem(k+'perm','1');localStorage.setItem(k+'intro','1');localStorage.setItem(k+'tele','{"asked":1}');},[CFG,base(),K]);
  await p.goto(U);await p.waitForTimeout(1800);await drain(p);
  const st=()=>p.evaluate(k=>JSON.parse(localStorage.getItem(k+'prog')),K);
  await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await p.waitForTimeout(500);await drain(p);
  await abre(p,'lrPanel');
  const sw=p.locator('#lrPanel .lrbook button',{hasText:'Trocar'});
  ok(tag+': livro atual aparece',/O Hobbit/.test(await p.textContent('#lrPanel'))&&/10\/300/.test(await p.textContent('#lrPanel')));
  await sw.click();await p.waitForTimeout(300);
  let s=await st();
  ok(tag+': 1º toque não apaga o livro',s.read.book&&s.read.book.t==='O Hobbit'&&s.read.book.pg===10,JSON.stringify(s.read.book));
  const has=(await sw.count())===1;ok(tag+': 1º toque pede confirmação',has&&/Toque de novo/.test(await sw.textContent())&&/fica guardado/.test(await sw.getAttribute('aria-label')),has?await sw.textContent():'botão sumiu');
  if(!has){await ctx.close();continue;}
  await p.clock.runFor(3500);await p.waitForTimeout(200);
  ok(tag+': confirmação some sozinha em 3 s',(await p.locator('#lrPanel .lrbook button',{hasText:'Trocar livro'}).count())===1);
  await sw.click();await p.waitForTimeout(150);await sw.click();await p.waitForTimeout(400);
  s=await st();
  ok(tag+': 2º toque troca',!s.read.book,JSON.stringify(s.read.book));
  ok(tag+': livro largado fica guardado com as páginas',Array.isArray(s.read.paused)&&s.read.paused.length===1&&s.read.paused[0].t==='O Hobbit'&&s.read.paused[0].pg===10&&s.read.paused[0].tot===300,JSON.stringify(s.read.paused));
  ok(tag+': não conta como livro lido nem dá XP',s.read.books.length===1&&!Object.values(s.log).flat().some(e=>/^ler:livro/.test(e.q)),JSON.stringify(s.read.books));
  ok(tag+': páginas de hoje e dado antigo intactos',s.read.d[T]===10&&s.velho==='fica'&&s.read.goal===10&&s.log['2026-11-24'].length===1);
  ok(tag+': abre o formulário do livro novo',await p.locator('#lrPanel .lrform').isVisible());
  const back=p.locator('#lrPanel .lrbook button',{hasText:'Voltar a O Hobbit'});
  ok(tag+': oferece voltar ao livro guardado',(await back.count())===1&&/10\/300/.test(await back.textContent()));
  await back.click();await p.waitForTimeout(400);s=await st();
  ok(tag+': voltar restaura o livro e as páginas',s.read.book&&s.read.book.t==='O Hobbit'&&s.read.book.pg===10&&s.read.book.tot===300&&s.read.paused.length===0,JSON.stringify(s.read));
  // trocar e começar outro: o antigo continua guardado
  await sw.click();await p.waitForTimeout(150);await sw.click();await p.waitForTimeout(400);
  await p.locator('#lrPanel .lrform input').first().fill('Neuromancer');await p.locator('#lrPanel .lrform input[type=number]').fill('250');await p.locator('#lrPanel .lrform button.go').click();await p.waitForTimeout(400);
  s=await st();
  ok(tag+': livro novo salvo, antigo guardado',s.read.book.t==='Neuromancer'&&s.read.paused.length===1&&s.read.paused[0].t==='O Hobbit');
  await p.reload();await p.waitForTimeout(1500);await drain(p);s=await st();
  ok(tag+': tudo continua depois de reabrir',s.read.book.t==='Neuromancer'&&s.read.paused[0].pg===10&&s.read.books[0].t==='Duna');
  ok(tag+': console sem erros',!errs.length,errs.join(' | '));
  await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${R.length-f}/${R.length} passaram`);process.exit(f?1:0);})();
