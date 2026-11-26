// Cartão do jogador: ficha expansível na aba Hoje (tools/heroi.*). Rode com: python3 -m http.server 8000 & node qa/cartao.test.js [pasta-de-prints]
const {chromium,devices}=require('playwright');const OUT=process.argv[2]||require('os').tmpdir();
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'young'},quests:[{id:'q1',title:'Treino de 20 min',xp:20,stat:'corpo',main:true},{id:'q2',title:'Estudar 25 min',xp:20,stat:'mente',main:true}]};
const prog={log:{'2026-11-23':[{q:'q2',kind:'full',xp:300,stat:'mente',bonus:0,t:'x'}],'2026-11-24':[{q:'q1',kind:'full',xp:420,stat:'corpo',bonus:0,t:'x'}]},extra:{},faith:{},energy:{'2026-11-26':'media'},mit:{},reviews:{},money:[],rest:{},ach:{},chest:{titles:[{id:'t_aco',n:'Mente de Aço'}]},rpg:{cls:{id:'guerreiro',style:'fant',name:'Guerreiro',stat:'corpo'},seen:{foco:1,vendas:1,mente:1,corpo:1}},velho:'fica'};
async function drain(p){for(let i=0;i<12;i++){const m=p.locator('.sysmodal:visible button.go');if(!(await m.count()))return;await m.first().dispatchEvent('click');await p.waitForTimeout(250);}}
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
(async()=>{const b=await chromium.launch();for(const [nm,dev] of [['iphone',devices['iPhone 13']],['android',devices['Pixel 7']],['se',devices['iPhone SE']]]){
const ctx=await b.newContext(dev);const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|vibrate/.test(m.text()))errs.push(m.text())});
await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nivel\n'}));
await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"posts":[]}'}));
await p.clock.install({time:new Date('2026-11-26T10:00:00')});await p.goto('http://localhost:8000/comecar/__seed__');
await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-news','5');localStorage.setItem('asc-u-tele','{"asked":1}');},[CFG,prog]);
await p.goto('http://localhost:8000/comecar/');await p.waitForTimeout(2000);await drain(p);await p.waitForTimeout(3000);await drain(p);
const sec=p.locator('section:has(.status)');
ok(nm+' botão da ficha',await p.locator('#hrTog').isVisible());
ok(nm+' próximo desbloqueio no botão',/nv \d+:/.test(await p.textContent('#hrTog')),await p.textContent('#hrTog'));
await sec.screenshot({path:OUT+'/card-fechado-'+nm+'.png'});
ok(nm+' Comece por aqui compacto (só o passo da vez)',await p.locator('#gdPanel.gdmini').count()===1&&await p.locator('#gdPanel .gdl li:visible').count()===1);
await p.locator('#gdPanel .qhead').dispatchEvent('click');await p.waitForTimeout(200);ok(nm+' toque no título mostra os 3 passos',await p.locator('#gdPanel .gdl li:visible').count()===3);
ok(nm+' relâmpago logo depois das tarefas',await p.evaluate(()=>document.getElementById('quests').closest('section').nextElementSibling.id==='zapPanel'));
await drain(p);await p.locator('#hrTog').click();await p.waitForTimeout(500);
ok(nm+' abre a ficha',await p.locator('#hrBox').isVisible());
ok(nm+' radar 8',(await p.locator('#hrBox .atradar text').count())===8);
ok(nm+' faltam XP',/Faltam \d+ XP para o nível 5/.test(await p.textContent('#hrBox')),(await p.textContent('#hrBox')).slice(0,120));
await p.locator('#hrBox .hrchips button',{hasText:'Mente de Aço'}).click();await p.waitForTimeout(300);
ok(nm+' título equipado',/Mente de Aço/.test(await p.textContent('#bxTitle')));
await p.fill('#hrMottoIn','um dia de cada vez');await p.press('#hrMottoIn','Enter');await p.waitForTimeout(300);
ok(nm+' lema no cartão',(await p.textContent('#heroMotto')).includes('um dia de cada vez'));
await p.locator('#hrBox button',{hasText:'Aurora'}).click();await p.waitForTimeout(300);
ok(nm+' fundo aurora',(await sec.getAttribute('data-hbg'))==='aurora');
await p.locator('#hrBox button',{hasText:'Galáxia'}).click();await p.waitForTimeout(300);
ok(nm+' fundo travado não aplica',(await sec.getAttribute('data-hbg'))==='aurora');
await p.locator('#hrBox button',{hasText:'Pose'}).click();await p.waitForTimeout(200);
ok(nm+' pose',await p.locator('#heroAv .hrsay').count()===1);
ok(nm+' sem rolagem lateral',!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)));
await p.waitForTimeout(1500);await sec.screenshot({path:OUT+'/card-aberto-'+nm+'.png'});
await p.reload();await p.waitForTimeout(2500);await drain(p);
const s=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
ok(nm+' persiste e não perde dados',s.hero&&s.hero.open===1&&s.hero.bg==='aurora'&&s.hero.motto==='um dia de cada vez'&&s.velho==='fica'&&s.log['2026-11-24'].length===1,JSON.stringify(s.hero));
ok(nm+' ficha continua aberta',await p.locator('#hrBox').isVisible());
await p.locator('#hrBox .hrat').click();await p.waitForTimeout(400);
ok(nm+' radar leva para Progresso',await p.evaluate(()=>document.body.dataset.tab)==='prog');
await p.locator('#tabbar [data-go="hoje"]').dispatchEvent('click');await p.waitForTimeout(300);const dx=await p.textContent('#dayxp');ok(nm+' contador do dia só conta tarefas',!/concluída|\d+ tarefa/.test(dx)||/^Hoje: \d+ tarefa/.test(dx),dx);
ok(nm+' console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
console.log(R.join('\n'));await b.close();process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
