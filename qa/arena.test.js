// Arena do Sistema (batalha d20 pelos 8 atributos) + Meta de leitura. Rode com: python3 -m http.server 8000 & node qa/arena.test.js [pasta-de-prints] [raiz]
const {chromium,devices}=require('playwright');const ROOT=process.argv[3]==='raiz';const U='http://localhost:8000/'+(ROOT?'':'comecar/');const OUT=process.argv[2]||require('os').tmpdir();
const K=ROOT?'ascensao-':'asc-u-';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'young'},quests:[
 {id:'q1',title:'Treino de 20 min',xp:20,stat:'corpo',main:true},{id:'q2',title:'Estudar 25 min de Cálculo',xp:20,stat:'mente',main:true},
 {id:'q3',title:'Beber 2 litros de água',xp:10,stat:'corpo'},{id:'s_fech',title:'Antes de dormir: marcar o que fiz hoje',xp:15,stat:'foco',main:true}]};
const LOG={'2026-11-23':[{q:'q1',kind:'full',xp:20,stat:'corpo',bonus:0,t:'x'},{q:'q2',kind:'full',xp:20,stat:'mente',bonus:0,t:'x'},{q:'q3',kind:'full',xp:10,stat:'corpo',bonus:0,t:'x'}],
 '2026-11-24':[{q:'q1',kind:'full',xp:20,stat:'corpo',bonus:0,t:'x'},{q:'q2',kind:'full',xp:20,stat:'mente',bonus:0,t:'x'}]};
const base=(x={})=>Object.assign({log:JSON.parse(JSON.stringify(LOG)),extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'guerreiro',style:'fant',name:'Guerreiro',stat:'corpo'},seen:{foco:1,vendas:1,mente:1,corpo:1}},velho:'fica'},x);
async function drain(p){for(let i=0;i<12;i++){const m=p.locator('.sysmodal:visible:not(#clsModal) button.go, .levelup:visible button.go');if(!(await m.count()))return;await m.first().dispatchEvent('click');await p.waitForTimeout(200);}}
(async()=>{const b=await chromium.launch();
async function open(prog,time,dev){const ctx=await b.newContext(dev||{viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://docs.google.com/**',r=>r.request().method()==='POST'?r.fulfill({status:200,body:''}):r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nivel\n'}));
  await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"posts":[]}'}));
  // dado previsível: o mesmo sorteio em toda rodada
  await ctx.addInitScript(()=>{let s=12345;Math.random=()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648;};});
  await p.clock.install({time:new Date(time)});
  await p.goto(U+'__seed__');
  await p.evaluate(([c,o,k])=>{localStorage.setItem(k+'cfg',JSON.stringify(c));localStorage.setItem(k+'prog',JSON.stringify(o));localStorage.setItem(k+'season','2');localStorage.setItem(k+'perm','1');localStorage.setItem(k+'intro','1');localStorage.setItem(k+'tele','{"asked":1}');},[CFG,prog,K]);
  await p.goto(U);await p.waitForTimeout(1800);await drain(p);return {ctx,p,errs};}
const st=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k+'prog')),K);
const prog=async p=>{await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await p.waitForTimeout(500);};
// 1: painel da arena com os números dos atributos; fôlego = 1 + tarefas de hoje
let {ctx,p,errs}=await open(base({log:Object.assign(JSON.parse(JSON.stringify(LOG)),{'2026-11-25':[{q:'q3',kind:'full',xp:10,stat:'corpo',bonus:0,t:'x'}]})}),'2026-11-25T10:00:00');
await prog(p);
ok('painel da Arena em Progresso',await p.locator('#arPanel').isVisible());
ok('painel da Meta de leitura em Progresso',await p.locator('#lrPanel').isVisible());
ok('Arena vem logo depois dos atributos',await p.evaluate(()=>document.getElementById('atPanel').nextElementSibling.id==='arPanel'));
ok('fôlego = 1 + 1 tarefa = 2',(await p.locator('#arPanel .ardots i.on').count())===2);
ok('vida sai da Vitalidade (20 + 4 x nível)',await p.evaluate(()=>arQA.hero().hp===20+4*arQA.lv().vital));
await p.locator('#arPanel').screenshot({path:OUT+'/arena-painel.png'});
// 2: meta de leitura: escolher 10/dia, somar 6 + 5 = meta batida (XP numa entrada só, em Intelecto/Sabedoria)
await p.locator('#lrPanel .lrgoals button',{hasText:'10 págs'}).click();await p.waitForTimeout(200);
await p.locator('#lrPanel .lradd button',{hasText:'+5'}).click();await p.waitForTimeout(300);await drain(p);
let s=await st(p);let e=s.log['2026-11-25'].find(x=>x.q==='ler:2026-11-25');
ok('5 páginas = 2 XP',e&&e.xp===2,JSON.stringify(e));
await p.locator('#lrPanel input[type=number]').fill('6');await p.locator('#lrPanel .lradd button',{hasText:'Somar'}).click();await p.waitForTimeout(500);
ok('aviso de meta batida',await p.locator('.sysmodal:visible',{hasText:'Meta do dia batida'}).count()>0);await drain(p);
s=await st(p);e=s.log['2026-11-25'].filter(x=>/^ler:/.test(x.q));
ok('11 páginas = 5 + 5 de meta, numa entrada só',e.length===1&&e[0].xp===10,JSON.stringify(e));
ok('leitura alimenta Intelecto e Sabedoria',await p.evaluate(()=>JSON.stringify(arQA.of({q:"ler:2026-11-25"})))==='["intel","sabed"]');
await p.locator('#lrPanel .link',{hasText:'Desfazer'}).click();await p.waitForTimeout(300);await drain(p);s=await st(p);
ok('desfazer tira as 6 páginas e o bônus',s.read.d['2026-11-25']===5&&s.log['2026-11-25'].find(x=>x.q==='ler:2026-11-25').xp===2,JSON.stringify(s.read));
await p.locator('#lrPanel input[type=number]').fill('6');await p.locator('#lrPanel .lradd button',{hasText:'Somar'}).click();await p.waitForTimeout(400);await drain(p);
await p.locator('#lrPanel .lrbook button').click();await p.locator('#lrPanel .lrform input').first().fill('O Hobbit');await p.locator('#lrPanel .lrform input[type=number]').fill('300');await p.locator('#lrPanel .lrform button').click();await p.waitForTimeout(300);
await p.locator('#lrPanel .lradd button',{hasText:'+10'}).click();await p.waitForTimeout(400);await drain(p);
ok('livro atual avança com as páginas',/O Hobbit/.test(await p.textContent('#lrPanel'))&&/10\/300/.test(await p.textContent('#lrPanel')),await p.textContent('#lrPanel'));
await p.locator('#lrPanel').screenshot({path:OUT+'/leitura-painel.png'});
await p.locator('#lrPanel button',{hasText:'Terminei'}).click();await p.waitForTimeout(400);
ok('livro terminado: aviso e +20',await p.locator('.sysmodal:visible',{hasText:'LIVRO'}).count()>0);await drain(p);s=await st(p);
ok('livro na estante e XP salvo',s.read.books.length===1&&s.log['2026-11-25'].some(x=>x.q==='ler:livro:1'&&x.xp===20));
ok('Arena ganha +1 Arcano com a meta de leitura',await p.evaluate(()=>arQA.hero().arc===3));
// 3: batalha
await p.locator('#arGo').click();await p.waitForTimeout(400);
ok('tela de batalha abre',await p.locator('#arModal').isVisible());
ok('4 ações grandes (>= 56px)',await p.evaluate(()=>[...document.querySelectorAll('#arActs .aract')].length===4&&[...document.querySelectorAll('#arActs .aract')].every(b=>b.getBoundingClientRect().height>=56)));
s=await st(p);ok('fôlego gasto ao entrar',s.arena.day['2026-11-25']===1);
await p.locator('#arActs .aract[data-k="g"]').click();await p.waitForTimeout(450);
await p.screenshot({path:OUT+'/arena-batalha.png'});
for(let i=0;i<30&&!(await p.locator('#arModal .arres').count());i++){await p.waitForFunction(()=>document.querySelector('#arModal .arres')||[...document.querySelectorAll('#arActs .aract')].some(b=>!b.disabled),null,{timeout:4000});
  if(await p.locator('#arModal .arres').count())break;const k=await p.evaluate(()=>{const B=arQA.battle();return B.arc?'a':(B.hp<B.max*.4&&B.heal)?'c':'g';});await p.locator('#arActs .aract[data-k="'+k+'"]').click();await p.waitForTimeout(150);}
await p.waitForSelector('#arModal .arres',{timeout:5000});
const won=await p.locator('#arModal .arres.win').count();
ok('herói treinado vence o andar 1',won===1,await p.textContent('#arModal .arres'));
await p.screenshot({path:OUT+'/arena-vitoria.png'});
s=await st(p);ok('andar 2 liberado e recorde salvo',s.arena.fl===2&&s.arena.best===1,JSON.stringify(s.arena));
ok('XP da arena entra como conquista (não conta sequência)',s.log['2026-11-25'].some(x=>/^ach:bt:2026-11-25:1$/.test(x.q)&&x.xp>0));
ok('nada antigo mudou',s.velho==='fica'&&s.log['2026-11-23'].length===3);
await p.locator('#arModal .arres button',{hasText:'Voltar'}).click();await p.waitForTimeout(300);
ok('modal fecha',!(await p.locator('#arModal').count()));
ok('console limpo (1)',errs.length===0,errs.join(' | '));await ctx.close();
// 4: sem fôlego: botão desliga; derrota dá conselho de vida real
({ctx,p,errs}=await open(base({arena:{fl:12,day:{'2026-11-25':0}},energy:{'2026-11-25':'baixa'}}),'2026-11-25T10:00:00'));await prog(p);
ok('bateria baixa avisa e corta a vida',/Bateria baixa/.test(await p.textContent('#arPanel'))&&await p.evaluate(()=>arQA.hero().hp===Math.round((20+4*arQA.lv().vital)*.8)));
await p.locator('#arGo').click();await p.waitForTimeout(300);
for(let i=0;i<40&&!(await p.locator('#arModal .arres').count());i++){await p.waitForFunction(()=>document.querySelector('#arModal .arres')||[...document.querySelectorAll('#arActs .aract')].some(b=>!b.disabled),null,{timeout:4000});
  if(await p.locator('#arModal .arres').count())break;await p.locator('#arActs .aract[data-k="g"]').click();await p.waitForTimeout(150);}
await p.waitForSelector('#arModal .arres',{timeout:5000});
ok('andar 12 com nível baixo: derrota',await p.locator('#arModal .arres.lose').count()===1);
ok('derrota mostra o ponto fraco e o hábito que sobe',/Ponto fraco: .* nível \d+\. Ele sobe com /.test(await p.textContent('#arModal .arres')),await p.textContent('#arModal .arres'));
await p.screenshot({path:OUT+'/arena-derrota.png'});
ok('sem fôlego: sem botão de tentar de novo',!(await p.locator('#arModal .arres button',{hasText:'Tentar'}).count()));
await p.locator('#arModal .arres button',{hasText:'Voltar'}).click();await p.waitForTimeout(300);
ok('botão Lutar desligado sem fôlego',await p.locator('#arGo').isDisabled());
s=await st(p);ok('derrota não tira andar',s.arena.fl===12&&s.arena.l===1);
ok('console limpo (2)',errs.length===0,errs.join(' | '));await ctx.close();
// 5: Android e iPhone pequeno: sem rolagem lateral, ações visíveis sem rolar
for(const [nm,dev] of [['Android',devices['Pixel 7']],['iPhone SE',devices['iPhone SE']]]){({ctx,p,errs}=await open(base(),'2026-11-25T10:00:00',dev));await prog(p);
  ok(nm+': sem rolagem lateral',!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)));
  await p.locator('#arGo').click();await p.waitForTimeout(400);
  ok(nm+': ações cabem na tela',await p.evaluate(()=>[...document.querySelectorAll('#arActs .aract')].every(b=>b.getBoundingClientRect().bottom<=innerHeight+1)));
  await p.screenshot({path:OUT+'/arena-batalha-'+nm.replace(' ','')+'.png'});
  ok(nm+': console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
// 6: perfil novo (tudo nível 1) vence o andar 1 na maioria das vezes (simulação com a regra real)
({ctx,p,errs}=await open(base({log:{}}),'2026-11-25T10:00:00'));
const wr=await p.evaluate(()=>{let w=0;for(let i=0;i<400;i++){const h=arQA.hero(),f=arQA.foe(1),arB=arQA.b;let hp=h.hp,fh=f.hp,arc=h.arc;for(let t=0;t<40;t++){const k=arc?'a':'g';if(k==='a')arc--;const d=1+Math.floor(Math.random()*20);const L=h.L;if(d!==1&&(d>=h.crit||d+arB(L[k==='a'?'intel':'forca'])+3>=f.ac))fh-=k==='a'?2+Math.floor(Math.random()*11):1+Math.floor(Math.random()*8);if(fh<=0){w++;break;}const e=1+Math.floor(Math.random()*20);if(e===20||(e!==1&&e+f.th>=h.ac))hp-=1+Math.floor(Math.random()*6)+f.dmg;if(hp<=0)break;}}return w/400;});
ok('iniciante vence o andar 1 em 85%+',wr>=.85,String(wr));await ctx.close();
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TUDO OK ('+R.length+')');process.exit(f?1:0);})();
