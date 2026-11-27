// Estudo (#137): tarefa criada sem prazo não ficava em 📅 Prazos (único lugar com ✕) e ficava presa no Hoje.
// Agora toda tarefa aberta aparece em Prazos; as sem data vão para o fim, com "sem data", e apagam com 2 toques.
// Rode com: python3 -m http.server 8000 & node qa/estudo-sem-data.test.js
const {chromium,devices}=require('playwright');const B='http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const TK='2026-11-26';
const plus=n=>{const d=new Date(TK+'T12:00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const CFG={version:1,startDate:'2026-11-01',profile:{name:'Teste',age:'18 a 29'},quests:[{id:'m1',title:'Tarefa principal',xp:30,stat:'mente',main:true}]};
const ST={tasks:[
  {id:'s1',t:'Ler apostila Unidade 1',type:'atividade',due:null,w:3,blocks:2,bd:1},
  {id:'d1',t:'Prova 2 de Disciplina A',type:'prova',due:plus(12),w:2,blocks:2},
  {id:'d2',t:'Atividade 3 de Disciplina B',type:'atividade',due:plus(2),w:2,blocks:1},
  {id:'x1',t:'Tarefa já entregue',type:'atividade',due:null,w:1,blocks:1,done:'2026-11-20'}],hc:{goal:0,items:[]},cfg:{},blk:{},old:'campo antigo'};
const PROG={log:{},extra:{},energy:{[TK]:'media'},rest:{},st:ST,simple:{off:TK}};
const P=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')||'{}'));
const clean=p=>p.evaluate(()=>{document.querySelectorAll('.sysmodal:not([hidden])').forEach(m=>m.remove());const l=document.getElementById('levelup');if(l)l.hidden=true;});
const tab=(p,t)=>p.evaluate(t=>{document.querySelectorAll('.sysmodal:not([hidden])').forEach(m=>m.remove());document.querySelector('nav button[data-go="'+t+'"]').click();},t);
const items=p=>p.$$eval('#stPanel details[data-k="due"] li',es=>es.map(e=>({t:e.querySelector('span').textContent,w:e.querySelectorAll('span')[1].textContent,c:e.className,x:!!e.querySelector('.stx')})));
(async()=>{const b=await chromium.launch();
for(const [nome,dev,rm] of [['iPhone',devices['iPhone 13'],false],['Android',devices['Pixel 7'],false],['390x844 reduce-motion',{viewport:{width:390,height:844},isMobile:true,hasTouch:true},true]]){
  const c=await b.newContext({...dev,timezoneId:'America/Sao_Paulo',reducedMotion:rm?'reduce':'no-preference'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_PROXY|Failed to load resource|ERR_CONNECTION/.test(m.text()))errs.push(m.text());});
  await p.clock.install({time:new Date(TK+'T10:00:00-03:00')});
  // semente gravada fora do app (mesma origem) antes de abrir o app
  await p.goto(B+'/privacidade/');
  await p.evaluate(([c,o])=>{for(const k of Object.keys(localStorage))localStorage.removeItem(k);
    localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide'])localStorage.setItem(k,'1');localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));},[CFG,PROG]);
  await p.goto(B+'/comecar/');await p.clock.runFor(3000);await clean(p);await tab(p,'foco');await p.waitForTimeout(200);
  const sum=await p.$eval('#stPanel details[data-k="due"] summary',e=>e.textContent).catch(()=>'');
  ok(nome+': Prazos conta as 3 abertas (sem data incluída, entregue fora)',/\(3\)/.test(sum),sum);
  let L=await items(p);
  ok(nome+': ordem é prazo mais perto → mais longe → sem data no fim',L.map(i=>i.t).join('|')==='Atividade 3 de Disciplina B|Prova 2 de Disciplina A|Ler apostila Unidade 1',L.map(i=>i.t).join('|'));
  const sd=L.find(i=>/Ler apostila/.test(i.t))||{};
  ok(nome+': tarefa sem data mostra "sem data" e tem ✕',sd.w==='sem data'&&sd.x,JSON.stringify(sd));
  ok(nome+': sem data não ganha cor de prazo perto',sd.c==='',sd.c);
  const hot=L.find(i=>/Atividade 3/.test(i.t))||{};ok(nome+': prazo a 2 dias continua em destaque',/hot/.test(hot.c||''),hot.c);
  // apagar com 2 toques
  const x=()=>p.evaluate(()=>{const li=[...document.querySelectorAll('#stPanel details[data-k="due"] li')].find(l=>/Ler apostila/.test(l.textContent));if(li)li.querySelector(".stx").click();});
  await x();await p.waitForTimeout(80);let pr=await P(p);
  ok(nome+': 1º toque só pergunta',pr.st.tasks.length===4&&/Apagar\?/.test(await p.textContent('#stPanel details[data-k="due"]')));
  await x();await p.waitForTimeout(80);pr=await P(p);
  ok(nome+': 2º toque apaga só a sem data',pr.st.tasks.map(t=>t.id).join()==='d1,d2,x1',pr.st.tasks.map(t=>t.id).join());
  ok(nome+': Hoje não mostra mais a tarefa apagada',!/Ler apostila/.test(await p.textContent('#stPanel')));
  ok(nome+': nada some do save (campos antigos ficam)',pr.st.old==='campo antigo'&&pr.st.tasks.find(t=>t.id==='x1').done==='2026-11-20'&&pr.energy[TK]==='media');
  // nova tarefa sem prazo pelo formulário entra na lista
  await p.evaluate(()=>{document.querySelector('#stPanel details[data-k="add"]').open=true;});
  await p.fill('#stT','Resumo do capítulo 2');await p.evaluate(()=>[...document.querySelectorAll('#stPanel button')].find(b=>b.textContent.trim()==='Salvar').click());await p.waitForTimeout(100);
  await p.evaluate(()=>{const d=document.querySelector('#stPanel details[data-k="due"]');if(d)d.open=true;});
  L=await items(p);ok(nome+': tarefa nova sem prazo aparece em Prazos com ✕',L.some(i=>/Resumo do capítulo 2/.test(i.t)&&i.w==='sem data'&&i.x),L.map(i=>i.t).join('|'));
  ok(nome+': sem erro de console',!errs.length,errs.join(' | '));
  await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(r=>r.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
