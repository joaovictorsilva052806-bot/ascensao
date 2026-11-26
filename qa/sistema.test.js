// Modo Sistema: uma missão por vez, começo de 2 min, bateria do dia e missão de recuperação.
// Rode com: python3 -m http.server 8000 & node qa/sistema.test.js
const {chromium,devices}=require('playwright');const B='http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const TK='2026-11-26';
const CFG={version:1,startDate:'2026-11-20',profile:{name:'Teste',age:'18 a 29'},quests:[
  {id:'m1',title:'Bloco de estudo de 25 min',minTitle:'Abrir o caderno e ler 1 página',xp:30,stat:'mente',main:true},
  {id:'m2',title:'Treino em casa de 20 min',minTitle:'10 polichinelos',xp:30,stat:'corpo',main:true},
  {id:'x1',title:'Beber 2 litros de água',xp:10,stat:'corpo'},
  {id:'x2',title:'Organizar a mesa',xp:10,stat:'foco'}]};
const sheet=p=>p.evaluate(()=>{const m=document.getElementById('smSheet');return m&&!m.hidden?{tag:(m.querySelector('.smtag')||{}).textContent,h:(m.querySelector('.smh')||{}).textContent,txt:m.textContent}:null;});
// prêmio (atributo, conquista) agora aparece por cima do Sistema: o usuário toca em Aceitar e segue
const dismiss=async p=>{for(let i=0;i<6;i++){const ix=await p.evaluate(()=>[...document.querySelectorAll('.sysmodal:not([hidden]) button.go')].findIndex(b=>b.getClientRects().length));if(ix<0)return;await p.locator('.sysmodal:not([hidden]) button.go').nth(ix).click();await p.waitForTimeout(120);}};
const btn=async(p,t)=>{await dismiss(p);const h=p.locator('#smSheet button:not([disabled])',{hasText:t}).first();if(!(await h.count()))return false;await h.click();return true;};
const P=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')||'{}'));
async function boot(b,dev,prog){const c=await b.newContext({...dev,timezoneId:'America/Sao_Paulo'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_PROXY|Failed to load resource|ERR_CONNECTION/.test(m.text()))errs.push(m.text());});
  if(process.env.VIB)await p.addInitScript(()=>{const v=navigator.vibrate.bind(navigator);navigator.vibrate=function(x){if(!navigator.userActivation.hasBeenActive)console.log('VIB '+new Error().stack.split('\n').slice(1,9).join(' | '));return v(x);};});
  if(process.env.VIB)p.on('console',m=>{if(/^VIB/.test(m.text()))console.log(m.text().slice(0,300));});
  await p.clock.install({time:new Date(TK+'T10:00:00-03:00')});
  await p.addInitScript(([c,o])=>{if(sessionStorage.getItem('qa-set'))return;sessionStorage.setItem('qa-set','1');for(const k of Object.keys(localStorage))localStorage.removeItem(k);
    localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide'])localStorage.setItem(k,'1');localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-sm-qa','1');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));},[CFG,prog]);
  await p.goto(B+'/comecar/');
  // fecha o que vier antes (check-in, avisos) para o Sistema poder abrir
  for(let i=0;i<30;i++){await p.clock.runFor(1500);await p.waitForTimeout(80);if(await sheet(p))break;await p.evaluate(()=>{for(const id of ['tlModal','clsModal']){const e=document.getElementById(id);if(e)e.remove();}});
    const m=p.locator('.sysmodal:not([hidden]) button.go').first();if(await m.count())await m.click({timeout:2000}).catch(()=>{});}
  return {c,p,errs};}
(async()=>{const b=await chromium.launch();
for(const [nome,dev] of [['iPhone',devices['iPhone 13']],['Android',devices['Pixel 7']]]){
  // ---- dia normal ----
  let {c,p,errs}=await boot(b,dev,{log:{'2026-11-25':[{q:'m1',kind:'full',xp:30}]},extra:{},energy:{},rest:{}});
  let s=await sheet(p);console.log('DBG',JSON.stringify(s),await p.evaluate(()=>[[...document.querySelectorAll('.sysmodal')].map(m=>m.textContent.slice(0,80)),document.querySelectorAll('.sysmodal').length,!!document.getElementById('onb')&&!document.getElementById('onb').hidden,document.body.className]));ok(nome+': Sistema abre sozinho',!!s,JSON.stringify(s));
  ok(nome+': abre direto na missão, com a bateria no cartão',s&&/MISSÃO PRINCIPAL/.test(s.tag)&&/Bateria hoje/.test(s.txt),s&&s.tag+' '+(s&&s.txt));
  await p.screenshot({path:'qa/shots-sistema-energia-'+nome+'.png'});
  await btn(p,'Baixa');await p.waitForTimeout(200);s=await sheet(p);
  ok(nome+': missão principal em tela cheia',s&&/MISSÃO PRINCIPAL/.test(s.tag),s&&s.tag);
  ok(nome+': abre no mínimo (2 min)',s&&/COMECE POR AQUI/.test(s.txt)&&/Abrir o caderno|10 polichinelos/.test(s.txt),s&&s.txt);
  ok(nome+': recompensa diz o que paga',s&&/Mínimo feito: \+\d+ XP\. Completa: \+\d+ XP/.test(s.txt),s&&s.txt);
  ok(nome+': bateria baixa sem culpa',s&&/o mínimo já vale/.test(s.txt)&&!/Bateria hoje/.test(s.txt));
  ok(nome+': bateria gravada',(await P(p)).energy[TK]==='baixa');
  ok(nome+': lista escondida atrás',await p.evaluate(()=>document.body.classList.contains('insm')));
  ok(nome+': sem rolagem lateral',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const go=await p.$eval('#smSheet .smgo',e=>e.getBoundingClientRect().height);ok(nome+': ACEITAR grande (≥ 56px)',go>=55,String(go));
  await p.screenshot({path:'qa/shots-sistema-missao-'+nome+'.png'});
  const h1=s.h;await btn(p,'Trocar');await p.waitForTimeout(100);s=await sheet(p);ok(nome+': Trocar mostra outra',s&&s.h!==h1,h1+' / '+(s&&s.h));
  ok(nome+': bateria baixa = só principais',s&&/MISSÃO PRINCIPAL/.test(s.tag)&&!/água|mesa/i.test(s.h),s&&s.h);
  const h2=s.h;await btn(p,'Adiar');await p.waitForTimeout(100);s=await sheet(p);
  ok(nome+': Adiar tira da vez',s&&s.h!==h2,h2+' / '+(s&&s.h));const snz=(await P(p)).sm.snz;ok(nome+': adiada por 1h',Object.keys(snz).length===1);
  const qn=s.h;await btn(p,'ACEITAR');await p.waitForTimeout(100);s=await sheet(p);
  ok(nome+': timer de 2:00',s&&/2 MINUTOS/.test(s.tag)&&/2:00/.test(s.txt),s&&s.txt);
  await p.screenshot({path:'qa/shots-sistema-2min-'+nome+'.png'});
  await p.clock.runFor(121000);await p.waitForTimeout(100);ok(nome+': tempo acaba e avisa',await p.$eval('#smSheet .smclock',e=>e.classList.contains('end')&&e.textContent==='0:00'));
  await btn(p,'Fiz o mínimo');await p.clock.runFor(800);await p.waitForTimeout(200);
  for(let i=0;i<6;i++){const ix=await p.evaluate(()=>[...document.querySelectorAll('.sysmodal:not([hidden]) button.go')].findIndex(b=>b.getClientRects().length));if(ix<0)break;await p.locator('.sysmodal:not([hidden]) button.go').nth(ix).click();await p.clock.runFor(800);await p.waitForTimeout(150);}
  let o=await P(p);let L=o.log[TK]||[];
  ok(nome+': mínimo marcado',L.some(e=>e.kind==='min'),JSON.stringify(L));s=await sheet(p);ok(nome+': oferece continuar com bônus',s&&/MÍNIMO CUMPRIDO/.test(s.tag)&&/\+5 XP/.test(s.txt));
  await p.screenshot({path:'qa/shots-sistema-continuar-'+nome+'.png'});
  await btn(p,'Já fiz tudo');await p.waitForTimeout(200);o=await P(p);L=o.log[TK]||[];
  const qid=L.find(e=>e.kind!=='checkin'&&/^m/.test(e.q)).q;
  ok(nome+': completa marcada',L.some(e=>e.q===qid&&e.kind==='full'),JSON.stringify(L));ok(nome+': +5 de bônus uma vez',L.filter(e=>e.q==='smb:'+qid).length===1);
  // barra em Hoje
  await p.evaluate(()=>{const x=document.querySelector('#smSheet .smx');if(x)x.click();});await p.waitForTimeout(100);
  const bar=await p.$eval('#smBar',e=>e.textContent).catch(()=>'');ok(nome+': barra do Sistema em Hoje',/SISTEMA/.test(bar),bar);
  ok(nome+': sem erro de console',!errs.length,errs.join(' | '));await c.close();
  // ---- recuperação: 24 com atividade, 25 vazio ----
  ({c,p,errs}=await boot(b,dev,{log:{'2026-11-24':[{q:'m1',kind:'full',xp:30}]},extra:{},energy:{[TK]:'media'},rest:{},shield:{n:0,used:{},ms:{}}}));
  s=await sheet(p);ok(nome+': oferece missão de recuperação',s&&/RECUPERAÇÃO/.test(s.tag),s&&s.tag);
  await p.screenshot({path:'qa/shots-sistema-recuperacao-'+nome+'.png'});
  await btn(p,'salvar minha sequência');await p.waitForTimeout(100);await btn(p,'ACEITAR');await p.waitForTimeout(100);await btn(p,'Fiz o mínimo');await p.waitForTimeout(300);
  o=await P(p);ok(nome+': ontem vira dia salvo',o.rest&&o.rest['2026-11-25']==='rec',JSON.stringify(o.rest));ok(nome+': +10 XP de recuperação',(o.log[TK]||[]).some(e=>e.q==='rec:'+TK&&e.xp===10));
  const st=await p.$eval('#streak',e=>e.textContent).catch(()=>'');ok(nome+': sequência continua',/[2-9]/.test(st),st);
  ok(nome+': sem erro de console',!errs.length,errs.join(' | '));await c.close();
  // ---- já usou nos últimos 7 dias: não oferece de novo ----
  ({c,p,errs}=await boot(b,dev,{log:{'2026-11-24':[{q:'m1',kind:'full',xp:30}]},extra:{},energy:{[TK]:'media'},rest:{},shield:{n:0,used:{},ms:{}},sm:{rec:{'2026-11-22':'2026-11-21'}}}));
  s=await sheet(p);ok(nome+': recuperação no máx. 1x por semana',s&&!/RECUPERAÇÃO/.test(s.tag),s&&s.tag);await c.close();
}
{const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(B+'/');await p.waitForTimeout(2500);ok('raiz: sem erro de página',!errs.length,errs.join(' | '));await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
