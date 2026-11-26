// Modo Sistema: a recompensa (atributo/nível) aparece sozinha, antes do "Embalou?", e não fica escondida atrás do Sistema.
// Rode com: python3 -m http.server 8000 & node qa/sistema-recompensa.test.js
const {chromium,devices}=require('playwright');const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const vis=p=>p.evaluate(()=>[...document.querySelectorAll('.sysmodal:not([hidden]),.smsheet:not([hidden]),.levelup:not([hidden])')].map(e=>(e.id||e.className)+':'+(e.innerText||'').slice(0,60).replace(/\n/g,' / ')));
(async()=>{const b=await chromium.launch();
for(const [nome,dev] of [['iPhone',devices['iPhone 13']],['Android',devices['Pixel 7']]]){
  const c=await b.newContext({...dev,timezoneId:'America/Sao_Paulo'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-26T08:10:00-03:00')});
  await p.addInitScript(()=>{if(sessionStorage.s)return;sessionStorage.s=1;localStorage.setItem('asc-sm-qa','1');
    localStorage.setItem('asc-u-cfg',JSON.stringify({version:1,startDate:'2026-11-20',profile:{name:'Ana',age:'18 a 29'},quests:[{id:'m1',title:'Estudar 25 min para a prova',minTitle:'Abrir o caderno',xp:30,stat:'mente',main:true},{id:'m2',title:'Treinar 30 min',minTitle:'Pôr o tênis',xp:30,stat:'corpo',main:true}]}));
    localStorage.setItem('asc-u-prog',JSON.stringify({log:{'2026-11-25':[{q:'m1',kind:'full',xp:30,stat:'mente'}]},extra:{},energy:{'2026-11-26':'media'},rest:{}}));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide'])localStorage.setItem(k,'1');localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-tele','{"asked":1}');});
  await p.route(/fonts\.(googleapis|gstatic)|docs\.google\.com/,r=>r.abort());
  await p.goto('http://localhost:8000/comecar/');
  // fecha o que vier antes (classe, check-in, habilidade) até o Sistema abrir
  for(let i=0;i<20;i++){await p.clock.runFor(1500);await p.waitForTimeout(80);const v=await vis(p);if(v.some(x=>/^smSheet/.test(x)&&/MISSÃO/.test(x)))break;
    const t=await p.$('.sysmodal:not([hidden]) button.go')||await p.$('#clsModal:not([hidden]) button');if(t)await t.click().catch(()=>{});}
  ok(nome+': Sistema abre na missão',(await vis(p)).some(x=>/MISSÃO PRINCIPAL/.test(x)));
  // B2: outro aria-modal entra por cima do Sistema aberto
  await p.evaluate(()=>{const d=document.createElement('div');d.id='qaModal';d.className='sysmodal';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.innerHTML='<div class="card"><button class="go">Ok</button></div>';document.body.append(d);});
  await p.clock.runFor(400);await p.waitForTimeout(100);
  ok(nome+': com outro diálogo por cima, o Sistema fica inerte',await p.evaluate(()=>{const m=document.getElementById('smSheet');return m.inert&&m.getAttribute('aria-hidden')==='true';}));
  await p.evaluate(()=>document.getElementById('qaModal').remove());await p.clock.runFor(400);await p.waitForTimeout(100);
  ok(nome+': diálogo fechou, o Sistema volta a ser tocável',await p.evaluate(()=>{const m=document.getElementById('smSheet');return !m.inert&&!m.hasAttribute('aria-hidden');}));
  await p.click('#smSheet .smgo');await p.clock.runFor(125000);await p.click('#smSheet .smgo');await p.clock.runFor(1200);await p.waitForTimeout(300);
  let v=await vis(p);ok(nome+': recompensa aparece sozinha',v.length===1&&/^sysmodal/.test(v[0]),JSON.stringify(v));
  ok(nome+': Sistema saiu da frente',await p.evaluate(()=>document.getElementById('smSheet').hidden&&!document.body.classList.contains('insm')));
  await p.click('.sysmodal:not([hidden]) button.go');await p.clock.runFor(1500);await p.waitForTimeout(300);
  for(let i=0;i<5;i++){const t=await p.$('.sysmodal:not([hidden]) button.go');if(!t)break;await t.click();await p.clock.runFor(1200);await p.waitForTimeout(200);}
  ok(nome+': prêmio fechou, o Sistema volta a ser tocável',await p.evaluate(()=>{const m=document.getElementById('smSheet');return !m.inert&&!m.hasAttribute('aria-hidden');}));
  v=await vis(p);ok(nome+': depois vem o "Embalou?"',v.length===1&&/MÍNIMO CUMPRIDO/.test(v[0]),JSON.stringify(v));
  ok(nome+': mínimo marcado',(JSON.parse(await p.evaluate(()=>localStorage.getItem('asc-u-prog'))).log['2026-11-26']||[]).some(e=>e.q==='m1'&&e.kind==='min'));
  ok(nome+': sem erro de página',!errs.length,errs.join(' | '));await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
