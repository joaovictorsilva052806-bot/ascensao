// Chefão da turma + baú do dia. Rode com: python3 -m http.server 8000 & node qa/chefe-bau.test.js [pasta-de-prints]
const {chromium,devices}=require('playwright');const U='http://localhost:8000/comecar/';const OUT=process.argv[2]||require('os').tmpdir();
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'young'},quests:[{id:'q1',title:'Ler 10 páginas',xp:20,stat:'mente',main:true},{id:'s_fech',title:'Antes de dormir: marcar o que fiz hoje',xp:15,stat:'foco',main:true}]};
const CSV='nome,xp,nivel\nAna,240,5\nBia,180,4\nTeste,40,1\nCadu,10,1\n';
async function drain(p){const t=[];for(let k=0;k<2;k++){for(let i=0;i<10;i++){const m=p.locator('.sysmodal:not(#bxModal) button.go');if(!(await m.count()))break;t.push(await p.locator('.sysmodal h3').first().textContent());await m.first().dispatchEvent('click');await p.waitForTimeout(150);}await p.waitForTimeout(700);}return t;}
const base=(x={})=>Object.assign({log:{'2026-11-25':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{'2026-11-25':'media'},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},rank:{on:true,asked:true,uid:'abc12345',nick:'Teste'},friends:{l:['Ana','Bia'],pend:{},seen:{}},velho:'fica'},x);
(async()=>{const b=await chromium.launch();
async function open(prog,time,dev,cfg){const ctx=await b.newContext(dev||{viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://docs.google.com/**',r=>r.request().method()==='POST'?r.fulfill({status:200,body:''}):r.fulfill({status:200,contentType:'text/csv',body:CSV}));
  await p.clock.install({time:new Date(time)});await p.goto(U);
  await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-tele','{"asked":1}');},[cfg||CFG,prog]);
  await p.reload();await p.waitForTimeout(1800);return {ctx,p,errs};}
// 1: turma com 2 amigos, chefão com vida e faixa em Hoje
let {ctx,p,errs}=await open(base(),'2026-11-25T21:00:00');await drain(p);
const strip=await p.textContent('#tbStrip').catch(()=>'');ok('faixa do chefão em Hoje',/% de vida/.test(strip),strip);
await p.screenshot({path:OUT+'/chefe-hoje-iphone.png'});
await p.locator('#tbStrip').click();await p.waitForTimeout(500);
ok('faixa leva para Amigos',await p.evaluate(()=>document.body.dataset.tab)==='amigos');
const hp=await p.textContent('.tbhpn');ok('vida = 300 x 3 pessoas menos o dano (40+240+180)',/^\d+ \/ 900 HP$/.test(hp.trim()),hp);
ok('ranking de dano com coroa no maior',(await p.textContent('.tbm li:first-child')).includes('👑 Ana'));
await p.locator('#tbPanel').screenshot({path:OUT+'/chefe-turma-iphone.png'});
// 2: fechar o dia => baú
await p.locator('#tabbar [data-go="hoje"]').dispatchEvent('click');await p.waitForTimeout(200);
await p.locator('#quests .quest[data-q="s_fech"] button.go').first().dispatchEvent('click');await p.waitForTimeout(1500);await drain(p);
ok('baú abre ao fechar o dia',await p.locator('#bxModal').isVisible());
await p.screenshot({path:OUT+'/bau-fechado-iphone.png'});
for(let i=0;i<3;i++){await p.locator('#bxModal .bxbtn').click();await p.waitForTimeout(250);}await p.waitForTimeout(900);
const rv=await p.textContent('#bxModal .bxout').catch(()=>'');ok('baú revela prêmio',/XP|Moldura|Título/.test(rv),rv);
await p.screenshot({path:OUT+'/bau-aberto-iphone.png'});
let st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
ok('prêmio gravado e XP com ach:bau',st.chest.got['2026-11-25']===1&&st.log['2026-11-25'].some(e=>e.q==='ach:bau:2026-11-25'));
ok('campos antigos intactos',st.velho==='fica'&&st.rank.uid==='abc12345');
await p.locator('#bxModal .bxrow button').last().click();await p.waitForTimeout(300);
ok('sem pílula depois de aberto',!(await p.locator('#bxPill').isVisible()));
await p.reload();await p.waitForTimeout(1500);await drain(p);ok('baú não reabre no mesmo dia',!(await p.locator('#bxModal').count()));
ok('console limpo (1)',errs.length===0,errs.join(' | '));await ctx.close();
// 3: sorteio guardado: fechar sem abrir e reabrir dá o mesmo prêmio
({ctx,p,errs}=await open(base({log:{'2026-11-25':[{q:'s_fech',kind:'full',xp:15,stat:'foco',bonus:0,t:'x'}]}}),'2026-11-25T22:00:00'));await drain(p);
ok('pílula do baú esperando',await p.locator('#bxPill').isVisible());
await p.locator('#bxPill').click();await p.waitForTimeout(300);const r1=await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('asc-u-prog')).chest.roll['2026-11-25']));
await p.evaluate(()=>document.getElementById('bxModal').remove());await p.reload();await p.waitForTimeout(1500);await drain(p);
await p.locator('#bxPill').click();await p.waitForTimeout(300);const r2=await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('asc-u-prog')).chest.roll['2026-11-25']));
ok('reabrir não troca o prêmio',r1===r2,r1+' vs '+r2);await ctx.close();
// 3b: desmarcar o "Fechar o dia" tira o XP do baú; marcar de novo devolve o mesmo prêmio, sem duplicar
({ctx,p,errs}=await open(base({chest:{roll:{'2026-11-25':{k:'x',xp:30,r:2,tier:0}}}}),'2026-11-27T20:30:00'.replace('27','25')));await drain(p);
const fech=()=>p.locator('#quests .quest[data-q="s_fech"] button.go').first().dispatchEvent('click');
const bau=async()=>(await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')).log['2026-11-25'].filter(e=>e.q==='ach:bau:2026-11-25').reduce((a,e)=>a+e.xp,0)));
await fech();await p.waitForTimeout(1500);await drain(p);for(let i=0;i<3;i++){await p.locator('#bxModal .bxbtn').click();await p.waitForTimeout(250);}await p.waitForTimeout(900);
ok('baú deu +30',(await bau())===30);await p.locator('#bxModal .bxrow button').last().click();await p.waitForTimeout(300);
await fech();await p.waitForTimeout(800);ok('desmarcar tira o XP do baú',(await bau())===0);
await fech();await p.waitForTimeout(1500);await drain(p);ok('marcar de novo reabre o baú',await p.locator('#bxModal').isVisible());
for(let i=0;i<3;i++){await p.locator('#bxModal .bxbtn').click();await p.waitForTimeout(250);}await p.waitForTimeout(900);
ok('mesmo prêmio, XP uma vez só',(await bau())===30&&(await p.textContent('#bxModal .bxout')).includes('+30'));
ok('console limpo (3b)',errs.length===0,errs.join(' | '));await ctx.close();
// 4: chefão derrotado => +60 XP e título, uma vez só
({ctx,p,errs}=await open(base({log:{'2026-11-25':[{q:'q1',kind:'full',xp:500,stat:'mente',bonus:0,t:'x'}]}}),'2026-11-25T14:00:00'));
let t=await drain(p);ok('vitória sobre o chefão',t.some(x=>/caiu/.test(x)),t.join('/'));
st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
ok('+60 XP e título do chefão',st.log['2026-11-25'].some(e=>/^ach:tb:/.test(e.q)&&e.xp===60)&&st.chest.titles.some(x=>x.src==='chefão'));
await p.reload();await p.waitForTimeout(1500);t=await drain(p);ok('vitória não repete',!t.some(x=>/caiu/.test(x)));
await p.locator('#tabbar [data-go="amigos"]').dispatchEvent('click');await p.waitForTimeout(300);await p.locator('#tbPanel').screenshot({path:OUT+'/chefe-derrotado.png'});
await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await p.waitForTimeout(300);await p.locator('#bxCol').screenshot({path:OUT+'/bau-colecao.png'});
ok('console limpo (4)',errs.length===0,errs.join(' | '));await ctx.close();
// 5: até 13 anos: chefão solo em Progresso, sem dados da turma; baú funciona
const KID=Object.assign({},CFG,{profile:{age:'kid'}});
({ctx,p,errs}=await open(base({rank:undefined,friends:undefined}),'2026-11-25T21:00:00',null,KID));await drain(p);
ok('≤13: faixa do chefão solo',(await p.textContent('#tbStrip')).includes('% de vida'));
ok('≤13: painel em Progresso e só "você"',await p.evaluate(()=>document.getElementById('tbPanel').dataset.tab==='prog'&&document.querySelectorAll('.tbm li').length===1));
ok('≤13: sem aba Amigos',!(await p.locator('#tabbar [data-go="amigos"]').isVisible()));
ok('console limpo (5)',errs.length===0,errs.join(' | '));await ctx.close();
// 6: Android (Pixel 7)
({ctx,p,errs}=await open(base(),'2026-11-25T21:00:00',devices['Pixel 7']));await drain(p);
await p.screenshot({path:OUT+'/chefe-hoje-android.png'});
const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);ok('Android: sem rolagem lateral',!ov);
ok('console limpo (6)',errs.length===0,errs.join(' | '));await ctx.close();
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
