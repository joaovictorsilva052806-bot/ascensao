// 8 atributos e classes. Rode com: python3 -m http.server 8000 & node qa/atributos.test.js [pasta-de-prints]
const {chromium,devices}=require('playwright');const U='http://localhost:8000/comecar/';const OUT=process.argv[2]||require('os').tmpdir();
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'young'},quests:[
 {id:'q1',title:'Treino de 20 min',xp:20,stat:'corpo',main:true},{id:'q2',title:'Estudar 25 min de Cálculo',xp:20,stat:'mente',main:true},
 {id:'q3',title:'Mandar mensagem para 2 clientes',xp:15,stat:'vendas'},{id:'q4',title:'Desenhar a planta',xp:15,stat:'foco'},
 {id:'s_fech',title:'Antes de dormir: marcar o que fiz hoje',xp:15,stat:'foco',main:true}]};
const LOG={'2026-11-23':[{q:'q1',kind:'full',xp:20,stat:'corpo',bonus:0,t:'x'},{q:'q2',kind:'full',xp:20,stat:'mente',bonus:0,t:'x'},{q:'q3',kind:'full',xp:15,stat:'vendas',bonus:0,t:'x'}],
 '2026-11-24':[{q:'q1',kind:'full',xp:20,stat:'corpo',bonus:0,t:'x'},{q:'q4',kind:'full',xp:15,stat:'foco',bonus:0,t:'x'}]};
const base=(x={})=>Object.assign({log:JSON.parse(JSON.stringify(LOG)),extra:{},faith:{},energy:{'2026-11-25':'media'},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'guerreiro',style:'fant',name:'Guerreiro',stat:'corpo'},seen:{foco:1,vendas:1,mente:1,corpo:1}},velho:'fica'},x);
async function drain(p){for(let i=0;i<12;i++){const m=p.locator('.sysmodal:visible:not(#clsModal) button.go');if(process.env.DBG&&(await m.count()))console.log('MODAL',(await p.locator('.sysmodal:visible:not(#clsModal)').first().textContent()).slice(0,120));if(!(await m.count()))return;await m.first().dispatchEvent('click');await p.waitForTimeout(200);}}
(async()=>{const b=await chromium.launch();
async function open(prog,time,dev){const ctx=await b.newContext(dev||{viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://docs.google.com/**',r=>r.request().method()==='POST'?r.fulfill({status:200,body:''}):r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nivel\n'}));
  await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"posts":[]}'}));
  await p.clock.install({time:new Date(time)});await p.goto(U);
  await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-tele','{"asked":1}');},[CFG,prog]);
  await p.reload();await p.waitForTimeout(1800);await drain(p);return {ctx,p,errs};}
const st=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
// 1: painel com 8 atributos e radar; classe Guerreiro (Força ★, Disciplina ☆, passiva Combo)
let {ctx,p,errs}=await open(base(),'2026-11-25T10:00:00');
if(process.env.DBG)console.log('S1',await p.textContent('#clsPill'),await p.evaluate(()=>[...document.querySelectorAll('.sysmodal')].map(m=>m.id+':'+(m.offsetParent?'vis':'hid')+':'+m.textContent.slice(0,50))));
await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await p.waitForTimeout(500);
ok('8 atributos no painel',(await p.locator('#atPanel .atrow').count())===8);
ok('radar com 8 pontas',(await p.locator('#atPanel .atradar text').count())===8);
const txt=await p.textContent('#atPanel');ok('primário/secundário/passiva da classe',/Primário: 💪 Força/.test(txt)&&/Secundário: 🎯 Disciplina/.test(txt)&&/Combo/.test(txt),txt.slice(0,300));
ok('Força é o maior (treino + afinidade)',(await p.textContent('#atPanel .atrow:first-child b')).includes('Força'));
await p.locator('#atPanel').screenshot({path:OUT+'/atributos-iphone.png'});
let s=await st(p);if(process.env.DBG)console.log('PROG',JSON.stringify({v:s.velho,rpg:s.rpg,keys:Object.keys(s)}));ok('nada antigo mudou',s.velho==='fica'&&s.log['2026-11-23'].length===3&&!s.log['2026-11-23'].some(e=>e.cb));
ok('console limpo (1)',errs.length===0,errs.join(' | '));
// 2: bônus de classe: treino (Força = primário) dá +10%; 3ª tarefa do dia dá +10 (Combo); desmarcar tira
await p.locator('#tabbar [data-go="hoje"]').dispatchEvent('click');await p.waitForTimeout(300);
const done=id=>p.locator('#quests .quest[data-q="'+id+'"] button.go').first().dispatchEvent('click');
await done('q1');await p.waitForTimeout(600);await drain(p);s=await st(p);let e=s.log['2026-11-25'].find(x=>x.q==='q1');
ok('treino: +2 XP de classe (10%)',e&&e.cb===2,JSON.stringify(e));
await done('q2');await p.waitForTimeout(500);await drain(p);await done('q3');await p.waitForTimeout(600);await drain(p);s=await st(p);e=s.log['2026-11-25'].find(x=>x.q==='q3');
ok('3ª tarefa: +10 (Combo)',e&&e.cb===10,JSON.stringify(s.log['2026-11-25'].map(x=>[x.q,x.cb||0])));
await done('q1');await p.waitForTimeout(600);await drain(p);s=await st(p);
ok('desmarcar tira o bônus (teto do dia volta)',!s.log['2026-11-25'].some(x=>x.q==='q1')&&s.attr.pb['2026-11-25']===10,JSON.stringify(s.attr));
ok('console limpo (2)',errs.length===0,errs.join(' | '));await ctx.close();
// 3: teto de 60 XP/dia de bônus de classe
({ctx,p,errs}=await open(base({rpg:{cls:{id:'guerreiro',style:'fant',name:'Guerreiro',stat:'corpo'}},attr:{seen:{},pb:{'2026-11-25':58}}}),'2026-11-25T10:00:00'));
await p.locator('#quests .quest[data-q="q1"] button.go').first().dispatchEvent('click');await p.waitForTimeout(600);s=await st(p);
ok('teto diário respeitado',(s.log['2026-11-25'].find(x=>x.q==='q1')||{}).cb===2&&s.attr.pb['2026-11-25']===60,JSON.stringify(s.attr));await ctx.close();
// 4: título por nível (nível 5+ = título novo) e escolha de classe mostra atributos
({ctx,p,errs}=await open(base({log:Object.assign(JSON.parse(JSON.stringify(LOG)),{'2026-11-22':[{q:'q1',kind:'full',xp:2500,stat:'corpo',bonus:0,t:'x'}]})}),'2026-11-25T10:00:00'));
ok('título de nível 5+ no topo',/Lâmina Firme|Campeão/.test(await p.textContent('#clsPill')),await p.textContent('#clsPill'));
await p.locator('#clsPill').dispatchEvent('click');await p.waitForTimeout(500);
const more=p.locator('#clsMore');if(await more.isVisible())await more.click();await p.waitForTimeout(300);
const fant=p.locator('#clsModal .seg button',{hasText:'Fantasia'});if(await fant.count())await fant.click();await p.waitForTimeout(300);
ok('lista de classes mostra primário/secundário/passiva',/Força · .*Disciplina · ✨ Combo/.test(await p.textContent('#clsModal')),(await p.textContent('#clsModal')).slice(0,400));
await p.locator('#clsModal').screenshot({path:OUT+'/classes-iphone.png'});
ok('console limpo (4)',errs.length===0,errs.join(' | '));await ctx.close();
// 5: Android
({ctx,p,errs}=await open(base(),'2026-11-25T10:00:00',devices['Pixel 7']));await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await p.waitForTimeout(500);
ok('Android: sem rolagem lateral',!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)));
await p.locator('#atPanel').screenshot({path:OUT+'/atributos-android.png'});ok('console limpo (5)',errs.length===0,errs.join(' | '));await ctx.close();
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
