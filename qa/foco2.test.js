// Foco com mais utilidade: missão do Sistema, 15/50 min, barra na sala, estacionamento de distrações, relatório e mapa de calor.
// Rode com: python3 -m http.server 8000 & node qa/foco2.test.js
const {chromium,devices}=require('playwright');const B='http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const TK='2026-11-26';
const CFG={version:1,startDate:'2026-11-01',profile:{name:'Teste',age:'18 a 29'},quests:[
  {id:'m1',title:'Bloco de estudo de 25 min',minTitle:'Ler 1 página',xp:30,stat:'mente',main:true},{id:'x1',title:'Beber água',xp:10,stat:'corpo'}]};
const PROG={log:{'2026-11-24':[{q:'foco:1',kind:'full',xp:15,stat:'mente'},{q:'foco:2',kind:'full',xp:15,stat:'mente'}],'2026-11-25':[{q:'foco:3',kind:'full',xp:6,stat:'mente'}]},extra:{},energy:{[TK]:'media'},rest:{}};
const P=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')||'{}'));
const tab=(p,t)=>p.evaluate(t=>{document.querySelectorAll('.sysmodal:not([hidden])').forEach(m=>m.remove());document.querySelector('nav button[data-go="'+t+'"]').click();},t);
(async()=>{const b=await chromium.launch();
for(const [nome,dev] of [['iPhone',devices['iPhone 13']],['Android',devices['Pixel 7']]]){
  const c=await b.newContext({...dev,timezoneId:'America/Sao_Paulo'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_PROXY|Failed to load resource|ERR_CONNECTION/.test(m.text()))errs.push(m.text());});
  await p.clock.install({time:new Date(TK+'T10:00:00-03:00')});
  await p.addInitScript(([c,o])=>{if(sessionStorage.getItem('qa-set'))return;sessionStorage.setItem('qa-set','1');for(const k of Object.keys(localStorage))localStorage.removeItem(k);
    localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide'])localStorage.setItem(k,'1');localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));},[CFG,PROG]);
  await p.goto(B+'/comecar/');await p.clock.runFor(3000);await tab(p,'foco');await p.waitForTimeout(200);
  // 1) missão do Sistema e tempos
  const mis=await p.$eval('#fzBox .fzmis',e=>e.textContent).catch(()=>'');ok(nome+': botão focar na missão do Sistema',/FOCAR NA MISSÃO/.test(mis)&&/estudo/i.test(mis),mis);
  ok(nome+': tempos 15 e 50 min',(await p.$$eval('#fzBox .fzdur button',b=>b.map(x=>x.textContent).join(','))).includes('15 min,50 min'));
  // 5) mapa de calor com o histórico antigo
  const cells=await p.$$eval('#fzHeat .fzc[title]',c=>c.map(x=>x.title+'|'+x.className));ok(nome+': mapa com 28 dias',cells.length===28,String(cells.length));
  ok(nome+': dia 24 com 50 min (2 blocos antigos)',cells.some(x=>x.startsWith('2026-11-24: 50 min')&&/l3/.test(x)),cells.filter(x=>x.includes('11-24')).join());
  ok(nome+': hoje marcado',cells.some(x=>x.startsWith(TK)&&/tdy/.test(x)));
  ok(nome+': total da semana',/Esta semana: 1 h 0 min|Esta semana: 60 min|Esta semana: 1 h 0 min/.test(await p.textContent('#fzHeat'))||/Esta semana: (1 h )?\d+ min/.test(await p.textContent('#fzHeat')));
  ok(nome+': sem rolagem lateral',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.screenshot({path:'qa/shots-foco-aba-'+nome+'.png',fullPage:true});
  // 3) estacionamento pela aba
  await p.fill('#fzIn','Responder o grupo');await p.click('#fzPark button.go');await p.waitForTimeout(150);
  ok(nome+': anota distração',(await P(p)).fz.park[0].t==='Responder o grupo');
  // foco na missão: sala com barra e anotação
  await p.click('#fzBox .fzmis');await p.waitForTimeout(300);
  ok(nome+': sala de foco abre na missão',await p.isVisible('#froom')&&/estudo/i.test(await p.textContent('#froomQ')));
  ok(nome+': quest ligada ao foco',(await P(p)).focus.q==='m1');
  await p.clock.runFor(5*60000);await p.waitForTimeout(1200);const w=await p.$eval('#fzBar i',e=>parseFloat(e.style.width));ok(nome+': barra de progresso anda (~20%)',w>15&&w<25,String(w));
  await p.click('#fzPk');await p.fill('#fzPi','Comprar pilha');await p.click('#fzPf button');await p.waitForTimeout(150);
  ok(nome+': anota sem sair da sala',await p.isVisible('#froom')&&(await P(p)).fz.park[0].t==='Comprar pilha');
  await p.screenshot({path:'qa/shots-foco-sala-'+nome+'.png'});
  // fim do bloco: relatório
  await p.clock.runFor(21*60000);await p.waitForTimeout(1500);await p.clock.runFor(2000);await p.waitForTimeout(300);
  ok(nome+': relatório no fim do bloco',await p.isVisible('#fzRef')&&/RELATÓRIO/.test(await p.textContent('#fzRef')));
  ok(nome+': registrar só depois de escolher',await p.$eval('#fzRef .smgo',e=>e.disabled));
  await p.screenshot({path:'qa/shots-foco-relatorio-'+nome+'.png'});
  await p.click('#fzRef .fzrate button:has-text("Fluxo")');await p.click('#fzRef .fzstat button:has-text("Mente")');await p.click('#fzRef .smgo');await p.waitForTimeout(300);
  let o=await P(p);const L=o.log[TK]||[];
  ok(nome+': +3 XP no atributo escolhido',L.some(e=>/^fr:/.test(e.q)&&e.xp===3&&e.stat==='mente'),JSON.stringify(L.map(e=>e.q)));
  ok(nome+': minutos de hoje registrados (25)',o.fz.min[TK]===25,JSON.stringify(o.fz.min));
  ok(nome+': missão marcada pelo foco',L.some(e=>e.q==='m1'));
  // virar tarefa
  await tab(p,'foco');await p.waitForTimeout(200);await p.evaluate(()=>{document.querySelectorAll('.levelup,.sysmodal:not([hidden])').forEach(e=>e.remove());[...document.querySelectorAll('#fzPl li:first-child button')].find(b=>/Tarefa/.test(b.textContent)).click();});await p.waitForTimeout(200);o=await P(p);
  ok(nome+': distração vira tarefa extra',(o.extra[TK]||[]).some(q=>q.title==='Comprar pilha')&&!o.fz.park.some(x=>x.t==='Comprar pilha'));
  // teto da reflexão
  const cap=await p.evaluate(()=>{const o=JSON.parse(localStorage.getItem('asc-u-prog'));return o.fz.ref;});ok(nome+': contador de reflexões',cap[TK]===1,JSON.stringify(cap));
  ok(nome+': sem erro de console',!errs.length,errs.join(' | '));await c.close();}
{const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(B+'/');await p.waitForTimeout(2000);ok('raiz: sem erro de página',!errs.length,errs.join(' | '));await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
