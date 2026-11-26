// Estudo na aba Foco: Hoje com 3 tarefas (administrativo primeiro), bloco 25 + pergunta + pausa, alerta de prazo em Hoje,
// flashcards 1-3-7-14-30, horas complementares (só validado conta), adiar 2x quebra a tarefa e nada de estudo no horário do treino.
// Rode com: python3 -m http.server 8000 & node qa/estudo.test.js
const {chromium,devices}=require('playwright');const B='http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const TK='2026-11-26';// quinta-feira
const plus=n=>{const d=new Date(TK+'T12:00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const CFG={version:1,startDate:'2026-11-01',profile:{name:'Teste',age:'18 a 29'},quests:[{id:'m1',title:'Tarefa principal',xp:30,stat:'mente',main:true}]};
const ST={tasks:[
  {id:'t1',t:'Prova 2 de Disciplina A',type:'prova',due:plus(2),w:2,blocks:2},
  {id:'t2',t:'Atividade 3 de Disciplina B',type:'atividade',due:plus(2),w:3,blocks:2},
  {id:'t3',t:'Trabalho de Disciplina C',type:'trabalho',due:plus(5),w:3,blocks:3},
  {id:'t4',t:'Enviar documento na secretaria',type:'adm',due:plus(10),w:1,blocks:1},
  {id:'t5',t:'Prova final de Disciplina D',type:'prova',due:plus(20),w:3,blocks:4}],
 cards:[{id:'c1',deck:'Disciplina A',f:'Pergunta 1',b:'Resposta 1',box:null,next:null},{id:'c2',deck:'Disciplina A',f:'Pergunta 2',b:'Resposta 2',box:0,next:TK},{id:'c3',deck:'Disciplina A',f:'Pergunta 3',b:'Resposta 3',box:2,next:plus(4)}],
 hc:{goal:100,items:[{id:'h1',t:'Curso A',h:10,st:'validado'},{id:'h2',t:'Curso B',h:5,st:'concluido'},{id:'h3',t:'Curso C',h:20,st:'fazendo'}]},cfg:{},blk:{}};
const PROG={log:{},extra:{},energy:{[TK]:'media'},rest:{},st:ST};
const P=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')||'{}'));
const clean=p=>p.evaluate(()=>{document.querySelectorAll('.sysmodal:not([hidden])').forEach(m=>m.remove());const l=document.getElementById('levelup');if(l)l.hidden=true;});
const patch=async(p,fn)=>{await p.evaluate(fn);await p.reload();await p.clock.runFor(2500);await clean(p);await tab(p,'foco');await p.waitForTimeout(150);};
const tab=(p,t)=>p.evaluate(t=>{document.querySelectorAll('.sysmodal:not([hidden])').forEach(m=>m.remove());document.querySelector('nav button[data-go="'+t+'"]').click();},t);
const click=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)throw new Error('sem '+s);e.click();},sel);
const clickTxt=(p,txt)=>p.evaluate(t=>{const b=[...document.querySelectorAll('#stPanel button')].find(x=>x.textContent.trim().startsWith(t));if(!b)throw new Error('sem botão '+t);b.click();},txt);
(async()=>{const b=await chromium.launch();
for(const [nome,dev] of [['iPhone',devices['iPhone 13']],['Android',devices['Pixel 7']]]){
  const c=await b.newContext({...dev,timezoneId:'America/Sao_Paulo'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_PROXY|Failed to load resource|ERR_CONNECTION/.test(m.text()))errs.push(m.text());});
  await p.clock.install({time:new Date(TK+'T09:00:00-03:00')});
  await p.addInitScript(([c,o])=>{if(sessionStorage.getItem('qa-set'))return;sessionStorage.setItem('qa-set','1');for(const k of Object.keys(localStorage))localStorage.removeItem(k);
    localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide'])localStorage.setItem(k,'1');localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));},[CFG,PROG]);
  await p.goto(B+'/comecar/');await p.clock.runFor(3000);await clean(p);
  // 1) alerta na aba Hoje (prazo a 7 dias ou menos)
  const al=await p.$eval('#stAlert',e=>e.textContent).catch(()=>'');ok(nome+': alerta de prazo em Hoje',/Atividade 3/.test(al)&&/em 2 dias/.test(al)&&/\+2 prazos/.test(al),al);
  await tab(p,'foco');await p.waitForTimeout(200);
  ok(nome+': painel Estudo na aba Foco',await p.isVisible('#stPanel'));
  // 2) só 3 tarefas, administrativo primeiro, depois prazo e peso
  const ids=await p.$$eval('#stPanel .sttask',es=>es.map(e=>e.dataset.id));ok(nome+': Hoje mostra 3 na ordem adm → prazo → peso',ids.join()==='t4,t2,t1',ids.join());
  ok(nome+': fila avisa o resto',/\+ 2 na fila/.test(await p.textContent('#stPanel')));
  // 3) bloco de 25 min no timer que já existe → pergunta → terminei → XP
  await clickTxt(p,'▶ Começar 25 min');await p.waitForTimeout(100);
  let pr=await P(p);ok(nome+': começar liga o foco de 25 min',pr.focus&&pr.focus.min===25&&pr.st.cur==='t4',JSON.stringify(pr.focus));
  await p.clock.runFor(25*60*1000+2000);await clean(p);await tab(p,'foco');await p.waitForTimeout(100);
  ok(nome+': fim do bloco pergunta como foi',await p.isVisible('#stPanel .stask'));
  await clickTxt(p,'✓ Terminei a tarefa');await p.waitForTimeout(100);pr=await P(p);
  ok(nome+': tarefa entregue no prazo dá +10 XP',pr.st.tasks.find(t=>t.id==='t4').done===TK&&(pr.log[TK]||[]).some(e=>e.q==='st:t:t4'&&e.xp===10));
  ok(nome+': bloco contado no dia',pr.st.blk[TK]===1&&!pr.st.cur);
  // 4) próximo bloco → "Avancei" abre a pausa de 5 min
  await clean(p);await clickTxt(p,'▶ Começar 25 min');await p.clock.runFor(25*60*1000+2000);await clean(p);await tab(p,'foco');await p.waitForTimeout(100);
  await clickTxt(p,'Avancei');await p.waitForTimeout(100);pr=await P(p);
  ok(nome+': avancei abre pausa de 5 min',pr.st.pause&&pr.st.pause.min===5&&await p.isVisible('#stPanel .stpause'));
  ok(nome+': bloco feito fica na tarefa',pr.st.tasks.find(t=>t.id==='t2').bd===1);
  await p.clock.runFor(5*60*1000+2000);await p.waitForTimeout(100);pr=await P(p);ok(nome+': pausa acaba sozinha',!pr.st.pause&&!(await p.isVisible('#stPanel .stpause')));
  // 5) adiar: 1ª vez some até amanhã; 2ª vez (outro dia) pede para quebrar
  await clickTxt(p,'Não consigo agora');pr=await P(p);ok(nome+': adiar tira de hoje',pr.st.tasks.find(t=>t.id==='t2').sn===TK&&!(await p.$$eval('#stPanel .sttask',es=>es.map(e=>e.dataset.id))).includes('t2'));
  await patch(p,()=>{const o=JSON.parse(localStorage.getItem('asc-u-prog'));o.st.tasks.find(t=>t.id==='t2').sn='2000-01-01';localStorage.setItem('asc-u-prog',JSON.stringify(o));});await clickTxt(p,'Não consigo agora');
  ok(nome+': 2º adiamento pede passo de 10 min',await p.isVisible('#stBrkIn'));
  await p.fill('#stBrkIn','Abrir o material e ler o 1º tópico');await clickTxt(p,'Pôr no topo');
  const top=await p.$eval('#stPanel .sttask.top b',e=>e.textContent).catch(()=>'');ok(nome+': passo menor vai para o topo',/Abrir o material/.test(top),top);
  // 6) flashcards: novo acerta → 1 dia; caixa 0 acerta → 3 dias; errou → 1 dia
  await p.evaluate(()=>{const d=document.querySelector('#stPanel details[data-k="cards"]');d.open=true;});
  ok(nome+': 2 cards para hoje',/2 para revisar hoje/.test(await p.textContent('#stPanel details[data-k="cards"] summary')));
  await clickTxt(p,'Revisar 2 agora');await clickTxt(p,'Mostrar resposta');ok(nome+': verso aparece',/Resposta 1/.test(await p.textContent('#stPanel .stback')));
  await clickTxt(p,'Acertei');await clickTxt(p,'Mostrar resposta');await clickTxt(p,'Acertei');pr=await P(p);
  const c1=pr.st.cards.find(x=>x.id==='c1'),c2=pr.st.cards.find(x=>x.id==='c2');
  ok(nome+': card novo acertado volta em 1 dia',c1.box===0&&c1.next===plus(1),JSON.stringify(c1));
  ok(nome+': caixa 1 acertada volta em 3 dias',c2.box===1&&c2.next===plus(3),JSON.stringify(c2));
  ok(nome+': XP de revisão (1 por card)',(pr.log[TK]||[]).some(e=>e.q==='st:c:'+TK&&e.xp===2));
  await patch(p,()=>{const o=JSON.parse(localStorage.getItem('asc-u-prog'));o.st.cards.find(x=>x.id==='c3').next=null;localStorage.setItem('asc-u-prog',JSON.stringify(o));});
  await p.evaluate(()=>{document.querySelector('#stPanel details[data-k="cards"]').open=true;});
  await clickTxt(p,'Revisar 1 agora');await clickTxt(p,'Mostrar resposta');await clickTxt(p,'Errei');pr=await P(p);
  const c3=pr.st.cards.find(x=>x.id==='c3');ok(nome+': errou volta para 1 dia',c3.box===0&&c3.next===plus(1),JSON.stringify(c3));
  await p.fill('#stCsv','Frente A;Verso A\nlinha ruim\nFrente B;Verso B');await clickTxt(p,'Importar');pr=await P(p);ok(nome+': importa frente;verso (ignora linha ruim)',pr.st.cards.length===5,pr.st.cards.length);
  // 7) horas complementares: só validado conta
  const hc=await p.textContent('#stPanel details[data-k="hc"] summary');ok(nome+': horas validadas / meta',/10\/100 h/.test(hc),hc);
  // 8) treino: hoje às 12h → bloqueado de 11h30 a 13h30 e meta cai 1 bloco
  await p.evaluate(()=>{document.querySelector('#stPanel details[data-k="cfg"]').open=true;});
  await click(p,'#stPanel .stday[aria-label="Treino na quinta"]');await p.fill('#stTh','12');await p.evaluate(()=>{[...document.querySelectorAll('#stPanel details[data-k="cfg"] button')].find(b=>b.textContent==='Salvar').click();});
  pr=await P(p);ok(nome+': ajuste salva treino',JSON.stringify(pr.st.cfg.train)===JSON.stringify({days:[3],hour:12,dur:60}),JSON.stringify(pr.st.cfg));
  ok(nome+': dia de treino tira 1 bloco da meta',/\/3 blocos hoje/.test(await p.textContent('#stPanel .qhead')));
  ok(nome+': fora do treino pode estudar',!(await p.isVisible('#stPanel .stblock')));
  await p.clock.runFor(100*60*1000);await clean(p);await tab(p,'foco');await p.waitForTimeout(100);
  ok(nome+': 30 min antes do treino avisa e mostra a volta',/Hora do treino/.test(await p.textContent('#stPanel')).valueOf()&&/13:30/.test(await p.textContent('#stPanel .stblock').catch(()=>'')));
  ok(nome+': botão começar desligado no treino',await p.$eval('#stPanel .sttask.top button.go',e=>e.disabled).catch(()=>false));
  // 9) sono: 1 h antes de dormir avisa (22h15 com sono às 23h)
  await p.evaluate(()=>{document.querySelector('#stPanel details[data-k="cfg"]').open=true;});await p.fill('#stSl','23');
  await p.evaluate(()=>{[...document.querySelectorAll('#stPanel details[data-k="cfg"] button')].find(b=>b.textContent==='Salvar').click();});
  await p.clock.setSystemTime(new Date(TK+'T22:15:00-03:00'));await p.evaluate(()=>document.querySelector('nav button[data-go="hoje"]').click());await tab(p,'foco');await p.waitForTimeout(100);
  ok(nome+': 1 h antes de dormir avisa',/Hora de desacelerar/.test(await p.textContent('#stPanel')));
  // 10) nova tarefa pelo formulário
  await p.evaluate(()=>{document.querySelector('#stPanel details[data-k="add"]').open=true;});
  await p.fill('#stT','Atividade nova');await p.selectOption('#stTy','atividade');await p.fill('#stDue',plus(1));await clickTxt(p,'Salvar');pr=await P(p);
  ok(nome+': formulário cria tarefa',pr.st.tasks.some(t=>t.t==='Atividade nova'&&t.due===plus(1)&&t.type==='atividade'));
  // layout: sem rolagem lateral
  ok(nome+': sem rolagem lateral',await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
  ok(nome+': sem erros no console',!errs.length,errs.join(' | '));
  if(nome==='iPhone'){await p.evaluate(()=>{window.scrollTo(0,document.getElementById('stPanel').offsetTop-60);});await p.screenshot({path:'qa/shots-estudo-iPhone.png'});}
  await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TUDO OK ('+R.length+')');process.exit(f?1:0);})();
