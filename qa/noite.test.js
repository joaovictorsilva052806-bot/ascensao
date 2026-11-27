// Revisão noturna 26/11 (tools/noite.*, rpg.js, streak.js, base.html): atritos do usuário novo.
// 1) Madrugada: o passo 1 do guia ("Toque em ▶") tocava no ▶ trancado e nada acontecia. Agora abre a 1ª missão liberada;
//    sem nenhuma liberada, diz a hora e abre um desafio relâmpago.
// 2) Textos: "Falta 1." (não "Faltam 1."), "Sequência salva: 1 dia", "Ontem ficou sem tarefa" e "2 dias de check-in".
// 3) "Hoje: N concluída(s)" conta só o que a pessoa fez (check-in e conquista não contam como tarefa).
// 4) Criar card: campos e "+ Criar cards" com 44px de altura.
// 5) Barra de abas abaixo de 390px: "PROGRESSO" não passa mais da aba.
// 6) Voltar do Android com missão/desafio aberto fecha só a folha (antes saía do app).
// 7) "Desfazer" no aviso por 5 s depois de concluir; o aviso sobe quando o atalho da figurinha aparece.
// 11) Dívida: "Recupere N XP hoje…" antes do valor em aberto; sem dia para recuperar, avisa que sai sozinha em até 3 dias.
// 10) Galeria de classes: no dia em que o jogo foi criado, espera a 1ª tarefa (a pílula abre na hora).
// 9) Volta depois de faltar 1 dia: cartão sem cobrança no topo da aba Hoje e 1 toque abre a 1ª missão.
// 8) Dia 1: o check-in entra sozinho, sem a janela "Você apareceu" entre "Criar meu jogo" e a 1ª missão.
// Mais: celular 390x844 e desktop, reduce-motion, dados antigos intactos, raiz abre, console limpo.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/noite.test.js
const {chromium}=require('playwright');const B='http://127.0.0.1:8000';const U=B+'/comecar/';const R=[];
const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const noise=t=>/TUNNEL|fonts\.g|docs\.google|Failed to load resource|vibrate/.test(t);
async function ctxOf(b,o={}){return b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,timezoneId:'America/Sao_Paulo',...o});}
async function page(ctx,iso,errs){const p=await ctx.newPage();p.on('console',m=>{if(m.type()==='error'&&!noise(m.text()))errs.push(m.text());});p.on('pageerror',e=>errs.push('PE '+e.message));await p.clock.install({time:new Date(iso)});return p;}
// fecha avisos do Sistema; o pedido do painel do criador recebe "Agora não" (nunca "Aceito")
async function pops(p){for(let i=0;i<10;i++){const r=await p.evaluate(()=>{const tl=document.querySelector('#tlModal');if(tl&&tl.getClientRects().length){tl.querySelector('button.ghost').click();return 1;}
  const cm=document.querySelector('#clsModal');if(cm&&cm.getClientRects().length){const l=[...cm.querySelectorAll('button.link')].find(x=>/depois/i.test(x.textContent));if(l){l.click();return 1;}}
  const lu=document.querySelector('#luClose');if(lu&&lu.getClientRects().length){lu.click();return 1;}
  for(const m of document.querySelectorAll('.sysmodal')){if(m.id==='secZen'||m.id==='tlModal'||!m.getClientRects().length)continue;const g=m.querySelector('button.go');if(g){g.click();return 1;}}return 0;});
  if(!r)break;await p.waitForTimeout(450);}}
async function onboard(p){await p.goto(U);await p.waitForTimeout(900);await p.click('#q_perm');await p.fill('#q_name','Teste');await p.click('#q_n0');
  await p.click('button:has-text("18 a 29")');await p.click('button:has-text("Faculdade")');
  // com o onboarding de toque (#67) vêm perguntas extras: "Pular esta" até chegar nos focos
  for(let i=0;i<8&&!(await p.$('#q_done:visible'));i++){const sk=await p.$('button:visible:has-text("Pular")');if(sk)await sk.click();await p.waitForTimeout(350);}
  await p.click('#q_done');await p.waitForTimeout(2200);await pops(p);}
const guide1=p=>p.evaluate(()=>{const b=document.querySelector('#gdPanel li.now button')||document.querySelector('#gdPanel button');b.click();return b.textContent;});
const sheet=p=>p.evaluate(()=>{for(const s of document.querySelectorAll('.mssheet')){if(!s.hidden&&s.getClientRects().length)return s.id||s.innerText.slice(0,80);}return null;});
const sysTxt=p=>p.evaluate(()=>(document.body.innerText.match(/(Boa madrugada|Bom dia|Boa tarde|Boa noite)[^\n]*/)||[''])[0]);
(async()=>{const b=await chromium.launch();
for(const [nome,opt] of [['celular',{}],['desktop + reduce-motion',{viewport:{width:1280,height:800},isMobile:false,hasTouch:false,reducedMotion:'reduce'}]]){
  const errs=[];const ctx=await ctxOf(b,opt);const p=await page(ctx,'2026-11-27T02:00:00-03:00',errs);await onboard(p);
  ok(nome+': madrugada, principais trancadas',(await p.$$('#quests .quest.qtlock')).length>=1);
  await guide1(p);await p.waitForTimeout(900);const s1=await sheet(p);const t1=await p.evaluate(()=>{const s=[...document.querySelectorAll('.mssheet')].find(x=>!x.hidden&&x.getClientRects().length);return s?s.innerText:'';});
  ok(nome+': passo 1 do guia abre a 1ª missão liberada (antes: nada)',!!s1&&!/libera às/.test(t1),String(s1));
  // sem nenhuma liberada: só as trancadas no perfil
  const lockIds=await p.evaluate(()=>[...document.querySelectorAll('#quests .quest.qtlock[data-q]')].map(c=>c.dataset.q));
  await p.evaluate(ids=>{const c=JSON.parse(localStorage.getItem('asc-u-cfg'));c.quests=c.quests.filter(q=>ids.includes(q.id));localStorage.setItem('asc-u-cfg',JSON.stringify(c));const g=JSON.parse(localStorage.getItem('asc-u-prog'));g.msUsed=0;localStorage.setItem('asc-u-prog',JSON.stringify(g));},lockIds);
  await p.reload();await p.waitForTimeout(2200);await pops(p);
  const st=await sysTxt(p);ok(nome+': Sistema aponta o desafio relâmpago quando tudo está trancado',/libera às 5h/.test(st)&&/desafio relâmpago/.test(st),st);
  await guide1(p);await p.waitForTimeout(250);const toast=await p.evaluate(()=>(document.querySelector('#toast')||{}).textContent||'');
  ok(nome+': passo 1 explica a hora',/liberam às 5h/.test(toast),toast);await p.waitForTimeout(900);
  ok(nome+': e abre um desafio relâmpago (vitória rápida)',await p.evaluate(()=>{const z=document.querySelector('#zapSheet');return !!z&&!z.hidden;}));
  ok(nome+': console limpo',errs.length===0,errs.join(' | '));await ctx.close();}

// noite (20h30): "Falta 1.", contador do dia e campos de 44px
{const errs=[];const ctx=await ctxOf(b);const p=await page(ctx,'2026-11-26T20:30:00-03:00',errs);await onboard(p);
  // abre a revisão de estudo pelo id: desde a ordem por período (qa/slot.test.js), às 20h30 a "PRÓXIMA" é a tarefa da noite
  await p.evaluate(()=>(document.querySelector('#quests .quest[data-q="s_rev"] .msgo')||document.querySelector('#quests .quest.next .msgo')).click());await p.waitForTimeout(900);
  const hs=await p.evaluate(()=>[...document.querySelectorAll('.msadd input,.msadd summary')].filter(e=>e.getClientRects().length).map(e=>Math.round(e.getBoundingClientRect().height)));
  ok('criar card: campos e "+ Criar cards" com 44px ou mais',hs.length>=2&&hs.every(h=>h>=44),hs.join(','));
  await p.evaluate(()=>{const s=[...document.querySelectorAll('.mssheet')].find(x=>!x.hidden);[...s.querySelectorAll('button')].find(x=>/Concluir miss/.test(x.textContent)).click();});await p.waitForTimeout(1200);await pops(p);
  // o atalho "⭐ Colar figurinha" não cobre o "Concluir missão" da próxima missão
  for(let i=0;i<10&&!(await p.$('#muChip'));i++){await pops(p);await p.waitForTimeout(300);}const hadChip=!!(await p.$('#muChip'));
  for(let i=0;i<4;i++){await pops(p);await p.waitForTimeout(500);}  await p.evaluate(()=>{const b=[...document.querySelectorAll('#quests .msgo')].find(x=>!x.disabled);if(b)b.click();});await p.waitForTimeout(600);
  const cover=await p.evaluate(()=>{const c=document.querySelector('#muChip');const s=[...document.querySelectorAll('.mssheet')].find(x=>!x.hidden&&x.getClientRects().length);if(!s)return 'sem missão aberta';
    const g=[...s.querySelectorAll('button')].find(x=>/Concluir miss/.test(x.textContent));const r=g.getBoundingClientRect();const t=document.elementFromPoint(r.left+r.width-12,r.top+r.height/2);return (c&&c.getClientRects().length?'chip visível ':'')+(g.contains(t)?'ok':'coberto por '+(t&&(t.id||t.className))+' '+(t&&t.closest('.sysmodal')?t.closest('.sysmodal').innerText.slice(0,90):''));});
  ok('figurinha não cobre o "Concluir missão" (chip apareceu: '+hadChip+')',hadChip&&cover==='ok',cover);
  await p.evaluate(()=>{const s=[...document.querySelectorAll('.mssheet')].find(x=>!x.hidden);const m=s&&[...s.querySelectorAll('button')].find(x=>/Minimizar/.test(x.textContent));if(m)m.click();});await p.waitForTimeout(400);
  const st=await sysTxt(p);ok('Sistema: "Falta 1." no singular',/Falta 1\./.test(st)&&!/Faltam 1\./.test(st),st);
  const dx=await p.evaluate(()=>document.querySelector('#dayxp').textContent);const log=await p.evaluate(()=>{const g=JSON.parse(localStorage.getItem('asc-u-prog'));const k=Object.keys(g.log).pop();return g.log[k].map(e=>e.q);});
  ok('placar do dia conta só a tarefa (check-in e conquista não)',/^Hoje: 1 (tarefa )?(concluída|feita)/.test(dx)&&log.length>1,dx+' · log: '+log.join(','));
  // dados antigos: tudo que existia continua lá depois de abrir a versão nova
  const before=await p.evaluate(()=>{const g=JSON.parse(localStorage.getItem('asc-u-prog'));g.campoAntigo={x:1};g.log['2026-11-20']=[{q:'velha',kind:'full',xp:10,stat:'foco',t:'2026-11-20T12:00:00Z'}];localStorage.setItem('asc-u-prog',JSON.stringify(g));return {g,c:localStorage.getItem('asc-u-cfg')};});
  await p.reload();await p.waitForTimeout(2000);
  const after=await p.evaluate(()=>({g:JSON.parse(localStorage.getItem('asc-u-prog')),c:localStorage.getItem('asc-u-cfg')}));
  const keep=(a,z)=>Object.keys(a).every(k=>k in z&&(typeof a[k]!=='object'||a[k]===null||keep(a[k],z[k]||{})));
  ok('dados antigos intactos (nenhum campo some)',keep(before.g,after.g)&&after.g.campoAntigo&&after.g.log['2026-11-20'].length===1&&before.c===after.c);
  ok('console limpo (noite)',errs.length===0,errs.join(' | '));
  // dia 27: só abre o app (check-in, sem tarefa). O título diz que é check-in, não a sequência 🔥
  const p2=await page(ctx,'2026-11-27T13:00:00-03:00',errs);await p2.goto(U);await p2.waitForTimeout(2500);
  let ck='';for(let i=0;i<6;i++){ck=await p2.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal')].find(x=>x.getClientRects().length&&/CHECK-IN/.test(x.innerText));return m?m.innerText:'';});if(ck)break;
    await p2.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal')){if(m.id==='secZen'||!m.getClientRects().length)continue;const g=m.id==='tlModal'?m.querySelector('button.ghost'):m.querySelector('button.go');if(g){g.click();return;}}});await p2.waitForTimeout(500);}
  ok('check-in do dia 2: "2 dias de check-in" (antes "Dia 2 seguido", que brigava com 🔥 1 dia)',/2 dias de check-in/.test(ck)&&!/seguido/.test(ck),ck.replace(/\s+/g,' ').slice(0,120));
  await p2.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal')){if(m.getClientRects().length&&/CHECK-IN/.test(m.innerText)){m.querySelector('button.go').click();}}});await p2.waitForTimeout(800);await p2.close();
  // escudo: fez tarefa dia 26, dia 27 só abriu, abre dia 28 → "1 dia" e "Ontem ficou sem tarefa"
  const p3=await page(ctx,'2026-11-28T09:00:00-03:00',errs);await p3.goto(U);await p3.waitForTimeout(2500);
  let sh='';for(let i=0;i<6;i++){sh=await p3.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal')].find(x=>x.getClientRects().length&&/ESCUDO/.test(x.innerText));return m?m.innerText:'';});if(sh)break;
    await p3.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal')){if(m.id==='secZen'||!m.getClientRects().length)continue;const g=m.id==='tlModal'?m.querySelector('button.ghost'):m.querySelector('button.go');if(g){g.click();return;}}});await p3.waitForTimeout(500);}
  ok('escudo: "Sequência salva: 1 dia" e "Ontem ficou sem tarefa"',/Sequência salva: 1 dia\b/.test(sh)&&!/1 dias/.test(sh)&&/Ontem ficou sem tarefa/.test(sh),sh.replace(/\s+/g,' ').slice(0,160));
  await ctx.close();}

// botão Voltar do Android: com a missão aberta, fecha só a folha (antes saía do app)
{const errs=[];const ctx=await ctxOf(b);const p=await page(ctx,'2026-11-26T20:30:00-03:00',errs);await onboard(p);for(let i=0;i<3;i++){await pops(p);await p.waitForTimeout(400);}
  const open=()=>p.evaluate(()=>{const b=[...document.querySelectorAll('#quests .msgo')].find(x=>!x.disabled);b.click();});
  await open();await p.waitForTimeout(600);ok('Voltar: missão aberta',!!(await sheet(p)));
  await p.goBack({timeout:3000}).catch(()=>{});await p.waitForTimeout(600);
  ok('Voltar fecha a missão e continua no app',!(await sheet(p))&&/\/comecar\//.test(p.url())&&!!(await p.$('#quests')),p.url());
  // fechar pelo botão não deixa estado sobrando: o próximo Voltar sai do app normalmente
  await open();await p.waitForTimeout(600);await p.evaluate(()=>{const s=[...document.querySelectorAll('.mssheet')].find(x=>!x.hidden);[...s.querySelectorAll('button')].find(x=>/Minimizar/.test(x.textContent)).click();});await p.waitForTimeout(600);
  ok('fechar pelo botão limpa o histórico',await p.evaluate(()=>!(history.state&&history.state.ntSheet)));
  // desafio relâmpago também
  await p.evaluate(()=>document.querySelector('.zapc:not(.done)').click());await p.waitForTimeout(600);await p.goBack({timeout:3000}).catch(()=>{});await p.waitForTimeout(600);
  ok('Voltar fecha o desafio relâmpago',await p.evaluate(()=>{const z=document.querySelector('#zapSheet');return !!z&&z.hidden&&!document.body.classList.contains('inmission');})&&/\/comecar\//.test(p.url()));
  ok('console limpo (Voltar)',errs.length===0,errs.join(' | '));await ctx.close();}
// marcou sem querer: "Desfazer" no aviso; aviso não fica embaixo do atalho da figurinha
{const errs=[];const ctx=await ctxOf(b);await ctx.addInitScript(()=>{if(!localStorage.getItem('asc-u-cfg')){localStorage.setItem('asc-u-cfg',JSON.stringify({version:1,name:'T',startDate:'2026-11-20',quests:[{id:'a',title:'Estudar 20 min',xp:20,stat:'mente',main:true},{id:'b',title:'Ler 10 páginas',xp:10,stat:'mente'}]}));
  localStorage.setItem('asc-u-prog',JSON.stringify({log:{'2026-11-25':[{q:'a',kind:'full',xp:20,stat:'mente',bonus:0,t:'2026-11-25T15:00:00Z'}]},rpg:{cls:'mago'},gd:{off:1},ach:{a_first:1}}));localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));localStorage.setItem('asc-u-season','2');}});
  const p=await page(ctx,'2026-11-26T15:00:00-03:00',errs);await p.goto(U);await p.waitForTimeout(1800);for(let i=0;i<3;i++){await pops(p);await p.waitForTimeout(300);}
  await p.evaluate(()=>document.querySelector('#quests .quest[data-q="a"] .btns button.go').click());await p.waitForTimeout(400);await pops(p);
  let has=false;for(let i=0;i<8&&!has;i++){has=await p.evaluate(()=>{const u=document.querySelector('#toast .ntundo');return !!u&&!document.querySelector('#toast').hidden;});if(!has)await p.waitForTimeout(200);}
  ok('depois de "Feito", o aviso traz "Desfazer"',has);
  const lap=await p.evaluate(()=>{const c=document.querySelector('#muChip'),t=document.querySelector('#toast');if(!c||!t||t.hidden)return 'sem chip';const a=c.getBoundingClientRect(),b=t.getBoundingClientRect();return b.bottom<=a.top+1?'ok':'sobrepõe';});
  ok('aviso não fica embaixo do "⭐ Colar figurinha"',lap!=='sobrepõe',lap);
  await p.evaluate(()=>document.querySelector('#toast .ntundo').click());await p.waitForTimeout(600);
  const st=await p.evaluate(()=>{const g=JSON.parse(localStorage.getItem('asc-u-prog'));const k=Object.keys(g.log).sort().pop();return {k,a:(g.log['2026-11-26']||[]).some(e=>e.q==='a'),old:(g.log['2026-11-25']||[]).length};});
  ok('"Desfazer" desmarca a tarefa (e não mexe em outros dias)',!st.a&&st.old===1,JSON.stringify(st));
  ok('desmarcar pelo "Desfazer" não oferece outro "Desfazer"',await p.evaluate(()=>!document.querySelector('#toast .ntundo')));
  ok('console limpo (Desfazer)',errs.length===0,errs.join(' | '));await ctx.close();}
// barra de abas: nenhum rótulo passa da própria aba em 320, 360 e 375px
for(const w of [320,360,375,390]){const ctx=await b.newContext({viewport:{width:w,height:700}});await ctx.addInitScript(()=>{localStorage.setItem('asc-u-cfg',JSON.stringify({version:1,name:'T',startDate:'2026-11-20',quests:[{id:'a',title:'Estudar',xp:20,stat:'mente',main:true}]}));localStorage.setItem('asc-u-prog',JSON.stringify({log:{},rpg:{cls:'mago'},gd:{off:1}}));});
  const p=await ctx.newPage();await p.goto(U);await p.waitForTimeout(1200);
  const bad=await p.evaluate(()=>[...document.querySelectorAll('#tabbar button')].filter(x=>x.getClientRects().length).filter(x=>{const r=document.createRange();r.selectNodeContents(x);return r.getBoundingClientRect().width>x.getBoundingClientRect().width+1;}).map(x=>x.textContent.trim()));
  ok('abas em '+w+'px: rótulos cabem',bad.length===0,bad.join(','));await ctx.close();}
// 1º dia: o check-in entra sozinho (sem janela entre "Criar meu jogo" e a 1ª missão); do 2º dia em diante a janela volta
{const errs=[];const ctx=await ctxOf(b);await ctx.addInitScript(()=>{window.__ck=[];new MutationObserver(()=>{for(const m of document.querySelectorAll('.sysmodal')){if(m.getClientRects().length&&/CHECK-IN/.test(m.innerText)&&!window.__ck.length)window.__ck.push(m.innerText.slice(0,60));}}).observe(document,{subtree:true,childList:true,attributes:true});});
  const p=await page(ctx,'2026-11-26T19:00:00-03:00',errs);await onboard(p);await guide1(p);await p.waitForTimeout(900);
  await p.evaluate(()=>{const s=[...document.querySelectorAll('.mssheet')].find(x=>!x.hidden);[...s.querySelectorAll('button')].find(x=>/Concluir miss/.test(x.textContent)).click();});for(let i=0;i<6;i++){await p.waitForTimeout(800);await pops(p);}

  const r=await p.evaluate(()=>({ck:window.__ck,log:Object.entries(JSON.parse(localStorage.getItem('asc-u-prog')).log).map(([k,v])=>k+'='+v.map(e=>e.q))}));
  ok('dia 1: sem janela de check-in antes da 1ª missão',!r.ck.length,r.ck.join(' | '));ok('dia 1: check-in registrado do mesmo jeito (+10 XP) e a 1ª missão também',r.log.some(x=>x.startsWith('2026-11-26=')&&x.includes('checkin:2026-11-26')&&x.split(',').length>=2),r.log.join(','));
  ok('dia 1: console limpo (check-in automático)',errs.length===0,errs.join(' | '));await ctx.close();}
// volta depois de faltar 1 dia: cartão sem cobrança no topo e 1 toque abre a 1ª missão; não aparece para quem fez ontem
{const VC={version:3,name:'Ana',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Estudar 20 min',minTitle:'Abrir o caderno',xp:20,stat:'mente',main:true},{id:'q2',title:'Ler 10 páginas',xp:10,stat:'mente',main:true}]};
  const lg=d=>({['2026-11-'+d]:[{q:'q1',kind:'full',xp:20,stat:'mente',bonus:0,t:'2026-11-'+d+'T22:05:00Z'}]});
  for(const [nome,log,want] of [['faltou ontem',lg(24),true],['fez ontem',lg(25),false],['1º dia sem histórico',{},false]]){
    const errs=[];const ctx=await ctxOf(b);await ctx.addInitScript(([c,g])=>{if(!localStorage.getItem('asc-u-cfg')){localStorage.setItem('asc-u-cfg',c);localStorage.setItem('asc-u-prog',g);localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));}},[JSON.stringify(VC),JSON.stringify({log,rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},gd:{off:1}})]);
    const p=await page(ctx,'2026-11-26T09:00:00-03:00',errs);await p.goto(U);await p.waitForTimeout(1500);for(let i=0;i<5;i++){await pops(p);await p.waitForTimeout(500);}
    // com o #83 no trem, nos primeiros dias o presente de volta (#hkPanel, modo gift) ocupa o topo no lugar deste cartão
    const v=await p.evaluate(()=>{const hk=document.getElementById('hkPanel');const c=hk&&!hk.hidden&&hk.dataset.mode==='gift'&&hk.getClientRects().length?hk:document.getElementById('ntVolta');if(!c||c.hidden||!c.getClientRects().length)return null;return {id:c.id,top:Math.round(c.getBoundingClientRect().top+scrollY),txt:c.innerText};});
    if(!want){ok('volta: sem "Que bom te ver de volta" quando '+nome,!v||v.id!=='ntVolta',v&&v.txt);await ctx.close();continue;}
    ok('volta: cartão no topo da 1ª tela, sem culpa ('+nome+')',!!v&&v.top<400&&(v.id==='hkPanel'||/Sem cobrança/.test(v.txt))&&/Abrir o caderno/.test(v.txt)&&!/Dívida|perdeu|falhou/i.test(v.txt),v&&(v.top+' · '+v.txt.replace(/\s+/g,' ')));
    await p.click('#'+v.id+' button.go');await p.waitForTimeout(1200);let sh=await sheet(p);
    if(v.id==='ntVolta')ok('volta: 1 toque abre a 1ª missão',!!sh,String(sh));else if(!sh){await p.evaluate(()=>{const b=[...document.querySelectorAll('#quests .msgo')].find(x=>!x.disabled);if(b)b.click();});await p.waitForTimeout(1000);}
    await p.evaluate(()=>{const s=[...document.querySelectorAll('.mssheet')].find(x=>!x.hidden);[...s.querySelectorAll('button')].find(x=>/Concluir miss/.test(x.textContent)).click();});for(let i=0;i<4;i++){await p.waitForTimeout(700);await pops(p);}
    ok('volta: cartão some depois da 1ª tarefa',await p.evaluate(()=>{const c=document.getElementById('ntVolta');const hk=document.getElementById('hkPanel');return (!c||c.hidden)&&!(hk&&!hk.hidden&&hk.dataset.mode==='gift'&&hk.getBoundingClientRect().top<400);}));
    ok('volta: console limpo',errs.length===0,errs.join(' | '));await ctx.close();}}
// galeria de classes: no 1º dia espera a 1ª tarefa (antes abria logo depois de "Criar meu jogo"); a pílula abre na hora
{const errs=[];const ctx=await ctxOf(b);await ctx.addInitScript(()=>{window.__cls=0;new MutationObserver(()=>{const m=document.getElementById('clsModal');if(m&&m.getClientRects().length&&!window.__clsAt)window.__clsAt=JSON.parse(localStorage.getItem('asc-u-prog')||'{"log":{}}');}).observe(document,{subtree:true,childList:true});});
  const p=await page(ctx,'2026-11-26T19:00:00-03:00',errs);await onboard(p);await p.waitForTimeout(1200);
  const antes=await p.evaluate(()=>!!window.__clsAt);ok('classe: galeria não abre antes da 1ª missão',!antes);
  await p.evaluate(()=>{const c=document.getElementById('clsPill');if(c)c.click();});await p.waitForTimeout(700);
  ok('classe: a pílula "Escolher classe" abre a galeria na hora',await p.evaluate(()=>{const m=document.getElementById('clsModal');return !!m&&m.getClientRects().length>0;}));
  await p.evaluate(()=>{const l=[...document.querySelectorAll('#clsModal button.link')].find(x=>/depois|Fechar/i.test(x.textContent));if(l)l.click();});await p.waitForTimeout(500);
  await guide1(p);await p.waitForTimeout(900);
  await p.evaluate(()=>{const s=[...document.querySelectorAll('.mssheet')].find(x=>!x.hidden);[...s.querySelectorAll('button')].find(x=>/Concluir miss/.test(x.textContent)).click();});
  let depois=false;for(let i=0;i<10&&!depois;i++){await p.waitForTimeout(700);depois=await p.evaluate(()=>{const m=document.getElementById('clsModal');return !!m&&m.getClientRects().length>0;});
    if(!depois)await p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal')){if(m.id==='clsModal'||m.id==='secZen'||!m.getClientRects().length)continue;const g=m.id==='tlModal'?m.querySelector('button.ghost'):m.querySelector('button.go');if(g){g.click();return;}}});}
  ok('classe: depois de "Escolher depois", a galeria não volta sozinha no mesmo dia (como antes)',!depois);
  ok('classe: console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
{const errs=[];const ctx=await ctxOf(b);const p=await page(ctx,'2026-11-26T19:00:00-03:00',errs);await onboard(p);
  await guide1(p);await p.waitForTimeout(900);
  await p.evaluate(()=>{const s=[...document.querySelectorAll('.mssheet')].find(x=>!x.hidden);[...s.querySelectorAll('button')].find(x=>/Concluir miss/.test(x.textContent)).click();});
  let depois=false;for(let i=0;i<12&&!depois;i++){await p.waitForTimeout(700);depois=await p.evaluate(()=>{const m=document.getElementById('clsModal');return !!m&&m.getClientRects().length>0;});
    if(!depois)await p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal')){if(m.id==='clsModal'||m.id==='secZen'||!m.getClientRects().length)continue;const g=m.id==='tlModal'?m.querySelector('button.ghost'):m.querySelector('button.go');if(g){g.click();return;}}});}
  ok('classe: a galeria abre depois da 1ª tarefa feita',depois);
  ok('classe: e sozinha (nenhum outro aviso aberto junto)',await p.evaluate(()=>[...document.querySelectorAll('.sysmodal,.levelup')].filter(m=>m.id!=='clsModal'&&m.id!=='secZen'&&m.getClientRects().length).length===0));ok('classe: console limpo (2)',errs.length===0,errs.join(' | '));await ctx.close();}
// dívida: o que dá para recuperar hoje vem primeiro (antes: "Dívida… é perdoada"); a regra de XP não muda
{const DC={version:3,name:'Ana',startDate:'2026-11-15',profile:{age:'adult'},quests:[{id:'q1',title:'Estudar',xp:20,stat:'mente',main:true},{id:'q2',title:'Ler',xp:10,stat:'mente',main:true}]};
  for(const [nome,log,re] of [['ontem fez 1 de 2',{'2026-11-25':[{q:'q1',kind:'full',xp:20,stat:'mente',bonus:0,t:'x'}]},/^Recupere 10 XP hoje: faça todas as principais \(o mínimo vale\)\. Dívida em aberto: −\d+ XP\.$/],
                              ['sem dia para recuperar',{'2026-11-25':[{q:'q1',kind:'full',xp:20,stat:'mente',bonus:0,t:'x'},{q:'q2',kind:'full',xp:10,stat:'mente',bonus:0,t:'x'}]},/^Dívida: −\d+ XP de dias sem as principais\. Ela sai sozinha em até 3 dias\.$/]]){
    const errs=[];const ctx=await ctxOf(b);await ctx.addInitScript(([c,g])=>{if(!localStorage.getItem('asc-u-cfg')){localStorage.setItem('asc-u-cfg',c);localStorage.setItem('asc-u-prog',g);localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));}},[JSON.stringify(DC),JSON.stringify({log,rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},gd:{off:1},simple:{off:'2026-11-01'}})]);
    const p=await page(ctx,'2026-11-26T10:00:00-03:00',errs);await p.goto(U);await p.waitForTimeout(1800);await pops(p);
    const t=await p.evaluate(()=>{const e=document.getElementById('debt');return e&&!e.hidden?e.textContent:'';});
    ok('dívida em tom de recuperação ('+nome+')',re.test(t)&&!/perdoada/.test(t),t);ok('dívida: console limpo ('+nome+')',errs.length===0,errs.join(' | '));await ctx.close();}}
// raiz (app do JV): abre com a planilha de exemplo e sem erro
{const errs=[];const ctx=await ctxOf(b);await ctx.addInitScript(()=>{if(!localStorage.getItem('ascensao-cfg')){localStorage.setItem('ascensao-cfg',JSON.stringify({version:3,startDate:'2026-11-20',name:'JV',quests:[{id:'q1',title:'Estudar 20 min',xp:20,stat:'mente',main:true},{id:'q_fech',title:'Fechamento do dia',xp:10,stat:'foco',main:true}]}));localStorage.setItem('ascensao-prog',JSON.stringify({log:{},rpg:{cls:'mago'}}));}});
  const p=await page(ctx,'2026-11-27T02:00:00-03:00',errs);await p.goto(B+'/');await p.waitForTimeout(2500);
  ok('raiz abre com as tarefas',(await p.$$('#quests .quest')).length>=2);ok('raiz: console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));console.log(R.filter(x=>x.startsWith('PASS')).length+'/'+R.length);process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
