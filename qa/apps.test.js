// Celular: 📅 na tarefa com horário (.ics no iPhone, Google Agenda no Android) e tarefas de app com print de prova (+5 XP).
// Rode com: python3 -m http.server 8000 & node qa/apps.test.js
const {chromium,devices}=require('playwright');const B='http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAEklEQVR4nGP4z8CAB+GTG8HSALfKY52fTcuYAAAAAElFTkSuQmCC','base64');
async function onboard(p){for(let i=0;i<16;i++){if(await p.$('.quest:visible'))break;
  for(const [s,v] of [['#q_name','Teste'],['#q_goal','Estudar 20 min']]){const e=await p.$(s+':visible');if(e&&!(await e.inputValue()))await e.fill(v);}
  let btn=null;for(const t of ['18 a 29','Faculdade']){btn=await p.$(`button:visible:has-text("${t}")`);if(btn)break;}
  if(!btn)for(const x of await p.$$('button:visible')){const id=(await x.getAttribute('id'))||'';if(['q_bk','q_full'].includes(id))continue;if(id.startsWith('q_')){btn=x;break;}}
  if(btn)await btn.click();await p.waitForTimeout(900);}
  for(let i=0;i<8;i++){await p.waitForTimeout(600);const m=await p.$('#clsModal button.go:visible')||await p.$('#clsModal .clsbtn:visible');if(m){await m.click();continue;}
    const bs=await p.$$('.sysmodal button.go:visible');if(!bs.length)break;await bs[bs.length-1].click();}}
const tab=async(p,t)=>{await p.evaluate(t=>{document.querySelectorAll('.sysmodal').forEach(m=>m.hidden=true);document.querySelector('nav button[data-go="'+t+'"]').click();},t);await p.waitForTimeout(250);};
const openCard=async(p,id)=>{await p.evaluate(id=>{document.querySelectorAll('.sysmodal').forEach(m=>m.hidden=true);document.querySelectorAll('#quests details').forEach(d=>d.open=true);const c=document.querySelector('#quests .quest[data-q="'+id+'"]');c.classList.add('open');c.scrollIntoView({block:'center'});},id);await p.waitForTimeout(150);};
(async()=>{const b=await chromium.launch();
for(const [nome,dev] of [['iPhone',devices['iPhone 13']],['Android',devices['Pixel 7']]]){
  const c=await b.newContext({...dev,timezoneId:'America/Sao_Paulo',acceptDownloads:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_PROXY|Failed to load resource/.test(m.text()))errs.push(m.text());});
  await c.route(/duolingo\.com|calendar\.google\.com|chatgpt\.com/,r=>r.fulfill({status:200,contentType:'text/html',body:'ok'}));
  await p.clock.install({time:new Date('2026-11-26T10:00:00-03:00')});
  await p.goto(B+'/comecar/');await p.waitForTimeout(800);await onboard(p);await p.waitForTimeout(400);
  // jogador novo começa no modo simples (só a próxima missão): este teste usa o app completo
  {const o=await p.$('.s3off:visible');if(o){await o.click();await p.waitForTimeout(300);}}
  const C=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-cfg')));const P=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
  const tk='2026-11-26';const XP=o=>Object.values(o.log||{}).flat().reduce((a,e)=>a+(e.xp||0)+(e.bonus||0),0);
  await tab(p,'mais');await p.waitForTimeout(200);
  ok(nome+': atalhos de app em Minhas tarefas',await p.$$eval('#apAddRow button',b=>b.length)===4);
  const chip=await p.$('#apAddRow button:has-text("Duolingo")');await chip.evaluate(b=>b.click());await p.waitForTimeout(400);
  const dq=((await C()).quests.find(q=>q.app==='duo')||{}).id;ok(nome+': tarefa do Duolingo criada',!!dq);
  ok(nome+': atalho fica marcado ✓',await p.$eval('#apAddRow button:has-text("Duolingo")',b=>b.disabled&&b.textContent.includes('✓')));
  await tab(p,'hoje');await p.waitForTimeout(200);await openCard(p,dq);
  const card='#quests .quest[data-q="'+dq+'"]';
  ok(nome+': selo 🦉 na tarefa',(await p.$eval(card+' .tag',e=>e.textContent)).includes('🦉'));
  ok(nome+': botão Abrir Duolingo',!!await p.$(card+' .qapp .apo:visible'));
  ok(nome+': botão de print visível',!!await p.$(card+' .qapp .apf:visible'));
  const bx=await p.$eval(card+' .qapp .apf',e=>{const r=e.getBoundingClientRect();return {h:r.height,r:r.right,w:innerWidth};});
  ok(nome+': print com alvo ≥ 44px e dentro da tela',bx.h>=44&&bx.r<=bx.w,JSON.stringify(bx));
  ok(nome+': sem rolagem lateral',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await (await p.$(card)).screenshot({path:'qa/shots-apps-'+nome+'.png'});
  if(nome==='iPhone'){const [pop]=await Promise.all([c.waitForEvent('page',{timeout:3000}).catch(()=>null),p.evaluate(s=>document.querySelector(s).click(),card+' .qapp .apo')]);
    ok(nome+': abre o Duolingo (link https, o iOS entrega ao app)',pop&&/duolingo\.com/.test(pop.url()),pop&&pop.url());if(pop)await pop.close();}
  const xp0=XP(await P());
  await p.setInputFiles(card+' .qapp .apf input',{name:'print.png',mimeType:'image/png',buffer:PNG});await p.waitForTimeout(900);
  let o=await P();let L=o.log[tk]||[];
  ok(nome+': print marca a tarefa como feita',L.some(e=>e.q===dq));ok(nome+': +5 XP de prova (uma vez)',L.filter(e=>e.q==='app:'+dq).length===1,JSON.stringify(L));
  ok(nome+': XP subiu',XP(o)>xp0);ok(nome+': sem chip duplicado do mural',!(await p.$('#muChip')));
  await openCard(p,dq);ok(nome+': miniatura da prova aparece',!!await p.$(card+' .qapp .apok img'));
  await (await p.$(card)).screenshot({path:'qa/shots-apps-feito-'+nome+'.png'});
  await p.evaluate(s=>{document.querySelectorAll('.sysmodal').forEach(m=>m.hidden=true);document.querySelector(s).click();},card+' .btns .go');await p.waitForTimeout(300);o=await P();L=o.log[tk]||[];
  ok(nome+': desmarcar tira o bônus',!L.some(e=>e.q===dq)&&!L.some(e=>e.q==='app:'+dq),JSON.stringify(L));
  // teto: 4 tarefas de app com print, só 3 bônus
  await tab(p,'mais');await p.waitForTimeout(200);
  for(const t of ['Ler','Correr','Meditar']){await p.evaluate(t=>[...document.querySelectorAll('#apAddRow button')].find(b=>b.textContent.includes(t)).click(),t);await p.waitForTimeout(250);}
  await tab(p,'hoje');await p.waitForTimeout(200);
  for(const q of (await C()).quests.filter(q=>q.app)){await openCard(p,q.id);const inp=await p.$('#quests .quest[data-q="'+q.id+'"] .qapp .apf input');if(inp){await inp.setInputFiles({name:'p.png',mimeType:'image/png',buffer:PNG});await p.waitForTimeout(700);}}
  o=await P();ok(nome+': teto de 3 bônus por dia',(o.log[tk]||[]).filter(e=>String(e.q).startsWith('app:')).length===3,JSON.stringify(o.log[tk]));
  // 📅 numa tarefa com horário
  const cf=await C();cf.quests.push({id:"t_cal",title:"Revisar a matéria",ifThen:"Às 19h30, abro o caderno",xp:15,stat:"mente",days:[0,2,3,4]},{id:"t_nt",title:"Beber água",xp:10,stat:"corpo"});
  await p.evaluate(c=>localStorage.setItem('asc-u-cfg',JSON.stringify(c)),cf);await p.reload();await p.waitForTimeout(1200);
  await openCard(p,'t_cal');const cb=await p.$('#quests .quest[data-q="t_cal"] .qapp .apc');const ct=cb?await cb.textContent():'';
  ok(nome+': botão 📅 com a hora certa',ct.includes('19:30'),ct);
  if(nome==='iPhone'){const [dl]=await Promise.all([p.waitForEvent('download',{timeout:3000}).catch(()=>null),cb.evaluate(b=>b.click())]);
    let txt='';if(dl)txt=require('fs').readFileSync(await dl.path(),'utf8');
    ok(nome+': .ics baixado',!!dl);ok(nome+': .ics repete seg/qua/qui/sex',/RRULE:FREQ=WEEKLY;BYDAY=MO,WE,TH,FR/.test(txt),txt.slice(0,300));ok(nome+': .ics às 19:30 (hoje)',/DTSTART:20261126T193000/.test(txt),txt.slice(0,400));ok(nome+': .ics com alarme',/BEGIN:VALARM/.test(txt));}
  else{const [pop]=await Promise.all([c.waitForEvent('page',{timeout:3000}).catch(()=>null),cb.evaluate(b=>b.click())]);const u=pop?pop.url():'';if(pop)await pop.close();
    ok(nome+': abre o Google Agenda com repetição, fuso e hora',/calendar\.google\.com/.test(u)&&/recur=RRULE/.test(u)&&/ctz=America/.test(u)&&/20261126T193000/.test(u),u);}
  if(nome==='iPhone'){await tab(p,'mais');const [pop]=await Promise.all([c.waitForEvent('page',{timeout:3000}).catch(()=>null),p.evaluate(()=>document.querySelector('#aiPanel [data-ai="chatgpt"]').click())]);await p.waitForTimeout(400);
    const m=await p.$eval('#aiMsg',e=>e.textContent);ok(nome+': IA abre sem falso "bloqueou"',!!pop&&!/bloqueou/.test(m),m);if(pop)await pop.close();await tab(p,'hoje');}
  ok(nome+': tarefa sem horário e sem app fica limpa',!(await p.$('#quests .quest[data-q="t_nt"] .qapp')));
  ok(nome+': sem erro de console',!errs.length,errs.join(' | '));await c.close();}
{const c=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});await c.route(/script\.google\.com/,r=>r.abort());
  await c.addInitScript(()=>{if(!localStorage.getItem('ascensao-cfg')){localStorage.setItem('ascensao-cfg',JSON.stringify({version:3,quests:[{id:'q_estudo',title:'Estudar 25 min',xp:10,main:true,stat:'mente'}]}));localStorage.setItem('ascensao-sync','https://script.google.com/macros/s/TESTE/exec');}});
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(B+'/');await p.waitForTimeout(1500);ok('raiz: módulo carregado',(await p.content()).includes('apDecorate'));
  ok('raiz: sem atalho de criar (tarefas vêm da planilha)',!(await p.$('#apAddRow')));ok('raiz: sem erro de página',!errs.length,errs.join(' | '));
  ok('raiz: tarefas da planilha intactas',await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-cfg')).quests.some(q=>q.id==='q_estudo')));await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
