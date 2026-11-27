// Estudo (#138): no horário do treino só o "▶ Começar 25 min" da 1ª tarefa ficava desligado; o "Começar esta"
// das outras ligava o bloco de 25 min normalmente, e o botão desligado tinha a mesma cara do ligado.
// Agora nenhum botão liga bloco no treino, os travados ficam com cara de desligado e o toque explica: "Hora do treino. Estudo volta às HH:MM."
// Rode com: python3 -m http.server 8000 & node qa/estudo-treino.test.js
const {chromium,devices}=require('playwright');const B=process.env.B||'http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const TK='2026-11-26'; // quinta-feira: índice 3 (segunda = 0)
const CFG={version:1,startDate:'2026-11-01',profile:{name:'Teste',age:'18 a 29'},quests:[{id:'m1',title:'Tarefa principal',xp:30,stat:'mente',main:true}]};
const st=()=>({tasks:[
  {id:'a1',t:'Atividade 3 de Disciplina B',type:'atividade',due:'2026-11-28',w:2,blocks:1},
  {id:'a2',t:'Prova 2 de Disciplina A',type:'prova',due:'2026-12-08',w:2,blocks:2}],hc:{goal:0,items:[]},
  cfg:{train:{days:[3],hour:10,dur:60}},blk:{},old:'campo antigo'});
const P=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')||'{}'));
const clean=p=>p.evaluate(()=>{document.querySelectorAll('.sysmodal:not([hidden])').forEach(m=>m.remove());const l=document.getElementById('levelup');if(l)l.hidden=true;});
const tab=(p,t)=>p.evaluate(t=>{document.querySelectorAll('.sysmodal:not([hidden])').forEach(m=>m.remove());document.querySelector('nav button[data-go="'+t+'"]').click();},t);
const btn=(p,txt)=>p.evaluateHandle(txt=>[...document.querySelectorAll('#stPanel .sttask button')].find(b=>b.textContent.trim()===txt)||null,txt);
const look=(p,txt)=>p.evaluate(txt=>{const b=[...document.querySelectorAll('#stPanel .sttask button')].find(b=>b.textContent.trim()===txt);if(!b)return null;
  const s=getComputedStyle(b);return {op:+s.opacity,cur:s.cursor,aria:b.getAttribute('aria-disabled'),dis:b.disabled};},txt);
async function abre(b,dev,rm,hora){
  const c=await b.newContext({...dev,timezoneId:'America/Sao_Paulo',reducedMotion:rm?'reduce':'no-preference'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_PROXY|Failed to load resource|ERR_CONNECTION/.test(m.text()))errs.push(m.text());});
  await p.clock.install({time:new Date(TK+'T'+hora+':00-03:00')});
  // semente gravada fora do app (mesma origem) antes de abrir o app
  await p.goto(B+'/privacidade/');
  await p.evaluate(([c,o])=>{for(const k of Object.keys(localStorage))localStorage.removeItem(k);
    localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide'])localStorage.setItem(k,'1');localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));},
    [CFG,{log:{},extra:{},energy:{[TK]:'media'},rest:{},st:st(),simple:{off:TK}}]);
  await p.goto(B+'/comecar/');await p.clock.runFor(3000);await clean(p);await tab(p,'foco');await p.waitForTimeout(200);
  return {c,p,errs};}
(async()=>{const b=await chromium.launch();
for(const [nome,dev,rm] of [['iPhone',devices['iPhone 13'],false],['Android',devices['Pixel 7'],false],['390x844 reduce-motion',{viewport:{width:390,height:844},isMobile:true,hasTouch:true},true]]){
  // 1) 10:00, treino às 10h (janela 9:30 a 11:30)
  let {c,p,errs}=await abre(b,dev,rm,'10:00');
  ok(nome+': aviso "Hora do treino" aparece',/Hora do treino/.test(await p.textContent('#stPanel .stblock').catch(()=>'')));
  const g=await look(p,'▶ Começar 25 min'),o=await look(p,'Começar esta');
  ok(nome+': "▶ Começar 25 min" tem cara de desligado',g&&g.op<=0.5&&g.cur==='not-allowed'&&g.aria==='true',JSON.stringify(g));
  ok(nome+': "Começar esta" tem cara de desligado',o&&o.op<=0.5&&o.cur==='not-allowed'&&o.aria==='true',JSON.stringify(o));
  await (await btn(p,'Começar esta')).evaluate(e=>e.click());await p.waitForTimeout(100);
  let pr=await P(p);
  ok(nome+': "Começar esta" não liga bloco no treino',!(pr.focus&&pr.focus.end)&&!pr.st.cur,JSON.stringify({f:pr.focus,cur:pr.st.cur}));
  const t1=await p.evaluate(()=>{const t=document.getElementById('toast');return t&&!t.hidden?t.textContent:'';});
  ok(nome+': toque explica e diz a hora da volta',/Hora do treino\. Estudo volta às 11:30\./.test(t1),t1);
  await p.evaluate(()=>{const t=document.getElementById('toast');if(t)t.hidden=true;});
  await (await btn(p,'▶ Começar 25 min')).evaluate(e=>e.click());await p.waitForTimeout(100);
  pr=await P(p);
  ok(nome+': "▶ Começar 25 min" também não liga e explica',!(pr.focus&&pr.focus.end)&&/Hora do treino/.test(await p.evaluate(()=>{const t=document.getElementById('toast');return t&&!t.hidden?t.textContent:'';})));
  ok(nome+': "✓ Entreguei" e "Não consigo agora" seguem ligados',await p.evaluate(()=>[...document.querySelectorAll('#stPanel .sttask button')].filter(b=>/Entreguei|Não consigo/.test(b.textContent)).every(b=>!b.getAttribute('aria-disabled')&&!b.disabled)));
  ok(nome+': nada some do save',pr.st.old==='campo antigo'&&pr.st.tasks.length===2&&pr.st.cfg.train.hour===10&&pr.energy[TK]==='media');
  ok(nome+': sem erro de console (treino)',!errs.length,errs.join(' | '));
  await c.close();
  // 2) 14:00: fora do treino, tudo normal
  ({c,p,errs}=await abre(b,dev,rm,'14:00'));
  ok(nome+': fora do treino não há aviso',!(await p.$('#stPanel .stblock')));
  const o2=await look(p,'Começar esta');ok(nome+': "Começar esta" com cara de ligado',o2&&o2.op>0.9&&!o2.aria,JSON.stringify(o2));
  await (await btn(p,'Começar esta')).evaluate(e=>e.click());await p.waitForTimeout(150);
  pr=await P(p);ok(nome+': "Começar esta" liga o bloco da 2ª tarefa',!!(pr.focus&&pr.focus.end)&&pr.st.cur==='a2',JSON.stringify({f:pr.focus,cur:pr.st.cur}));
  ok(nome+': sem erro de console (fora do treino)',!errs.length,errs.join(' | '));
  await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(r=>r.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
