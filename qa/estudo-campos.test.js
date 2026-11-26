// Campos do Estudo (aba Foco): toda caixa de texto/data/número tem alvo de toque de 44px, fonte de 16px (sem zoom no iPhone)
// e o mesmo fundo escuro do app (antes: caixa padrão do navegador, cinza, com 24px de altura).
// Rode com: python3 -m http.server 8000 & node qa/estudo-campos.test.js
const {chromium,devices}=require('playwright');const B='http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const TK='2026-11-26';
const CFG={version:1,startDate:'2026-11-01',profile:{name:'Teste',age:'18 a 29'},quests:[{id:'m1',title:'Tarefa principal',xp:30,stat:'mente',main:true}]};
const PROG={log:{},extra:{},energy:{[TK]:'media'},rest:{},simple:{off:TK},st:{tasks:[{id:'t1',t:'Prova 2 de Disciplina A',type:'prova',due:'2026-11-28',w:2,blocks:2}],hc:{goal:100,items:[]},cfg:{},blk:{}}};
(async()=>{const b=await chromium.launch();
for(const [nome,opt] of [['iPhone',devices['iPhone 13']],['Android',devices['Pixel 7']],['320px',{viewport:{width:320,height:640},isMobile:true,hasTouch:true}]]){
  const c=await b.newContext({...opt,timezoneId:'America/Sao_Paulo',reducedMotion:'reduce'});const p=await c.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_PROXY|Failed to load resource|ERR_CONNECTION/.test(m.text()))errs.push(m.text());});
  await p.clock.install({time:new Date(TK+'T09:00:00-03:00')});
  // semente gravada fora do app (página sem o app, mesma origem)
  await p.goto(B+'/privacidade/');
  await p.evaluate(([c,o])=>{for(const k of Object.keys(localStorage))localStorage.removeItem(k);localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide'])localStorage.setItem(k,'1');localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));},[CFG,PROG]);
  const antes=await p.evaluate(()=>localStorage.getItem('asc-u-prog'));
  await p.goto(B+'/comecar/');await p.clock.runFor(3000);
  await p.evaluate(()=>{document.querySelectorAll('.sysmodal:not([hidden])').forEach(m=>m.remove());document.querySelector('nav button[data-go="foco"]').click();});
  await p.waitForTimeout(200);await p.evaluate(()=>document.querySelectorAll('#stPanel details').forEach(d=>d.open=true));await p.waitForTimeout(100);
  const f=await p.$$eval('#stPanel input:not([type=checkbox]):not([type=radio])',es=>es.filter(e=>e.checkVisibility()).map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {id:e.id,h:r.height,right:r.right,fs:parseFloat(s.fontSize),bg:s.backgroundColor,fg:s.color};}));
  const vw=await p.evaluate(()=>innerWidth);
  ok(nome+': há campos no Estudo',f.length>=8,String(f.length));
  const baixos=f.filter(x=>x.h<44);ok(nome+': todo campo tem 44px de altura',!baixos.length,baixos.map(x=>x.id+'='+Math.round(x.h)).join(' '));
  const peq=f.filter(x=>x.fs<16);ok(nome+': fonte de 16px (iPhone não dá zoom)',!peq.length,peq.map(x=>x.id).join(' '));
  const claro=f.filter(x=>{const m=x.bg.match(/[\d.]+/g).map(Number);return (m[3]===undefined||m[3]>.5)&&m[0]+m[1]+m[2]>300;});
  ok(nome+': fundo escuro como o resto do app',!claro.length,claro.map(x=>x.id+' '+x.bg).join(' '));
  const txt=f.filter(x=>{const m=x.fg.match(/[\d.]+/g).map(Number);return m[0]+m[1]+m[2]<500;});ok(nome+': texto claro legível',!txt.length,txt.map(x=>x.id+' '+x.fg).join(' '));
  const vaza=f.filter(x=>x.right>vw+1);ok(nome+': nenhum campo vaza da tela',!vaza.length,vaza.map(x=>x.id).join(' '));
  ok(nome+': sem rolagem lateral',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  // digitar e salvar continua funcionando
  await p.fill('#stT','Lista 4 de Disciplina B');await p.fill('#stDue','2026-11-30');
  await p.evaluate(()=>{const b=[...document.querySelectorAll('#stPanel button')].find(x=>x.textContent.trim()==='Salvar');b.click();});await p.waitForTimeout(150);
  const pr=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')||'{}'));
  ok(nome+': tarefa nova salva',pr.st&&pr.st.tasks.some(t=>t.t==='Lista 4 de Disciplina B'));
  const o=JSON.parse(antes);ok(nome+': dado antigo intacto',pr.st.tasks.some(t=>t.id==='t1'&&t.t===o.st.tasks[0].t)&&pr.energy[TK]==='media');
  ok(nome+': console sem erros',!errs.length,errs.join(' | '));
  await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(r=>r.startsWith('FAIL')).length;console.log(`\n${R.length-f}/${R.length} passaram`);process.exit(f?1:0);})();
