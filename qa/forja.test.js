// Forja: treino em casa que evolui sozinho (tools/forja.*): aviso de segurança, teste de nível, séries com − / +,
// subida de nível (+30 uma vez), dia ruim (+20, conta sequência), semana forjada, pilares, dias editáveis.
// Rode com: python3 -m http.server 8000 & node qa/forja.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';const SP=require('os').tmpdir()+'/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'s_treino',title:'Mexer o corpo 20 min',xp:25,stat:'corpo',minTitle:'5 min'}]};
const E=(q,d,xp)=>({q,kind:'full',xp:xp||10,stat:'mente',bonus:0,t:d+'T10:00:00'});
const P=(extra={})=>Object.assign({log:{'2026-11-20':[E('q1','2026-11-20')]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{a_first:'2026-11-01'},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},velho:'fica'},extra);
const FJ=(o={})=>Object.assign({ok:true,pt:1,pil:false,lv:{},last:{},ses:[],dias:[0,2,4]},o);
async function drain(p){for(let k=0;k<2;k++){for(let i=0;i<10;i++){const m=p.locator('.sysmodal button.go');if(await m.count()){await m.first().dispatchEvent('click');await p.waitForTimeout(150);continue;}
  if(await p.locator('#levelup').isVisible()){await p.locator('#luClose').dispatchEvent('click');continue;}await p.waitForTimeout(250);if(!(await p.locator('.sysmodal button.go').count()))break;}await p.waitForTimeout(700);}}
(async()=>{const b=await chromium.launch();
async function open(route,pre,prog,time,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[];if(o.init)await p.addInitScript(o.init);
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date(time)});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[o.cfg||CFG,prog,pre]);
  await p.goto(U+route);await p.waitForTimeout(1200);await drain(p);return {ctx,p,errs};}
const LS=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
const CF=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-cfg');
const tap=async(p,sel)=>{await p.locator(sel).first().dispatchEvent('click');await p.waitForTimeout(80);};
const sets=async(p,n)=>{for(let i=0;i<n;i++)await tap(p,'#fjSet');await p.waitForTimeout(300);};
const day=(st,d)=>st.log[d]||[];
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  // A: perfil antigo sem prog.forja, quarta-feira (dia de treino padrão)
  let {ctx,p,errs}=await open(route,pre,P(),'2026-11-25T10:00:00');
  ok(tag+' A: card do Forja em Hoje',await p.locator('#fjCard').isVisible()&&(await p.textContent('#fjCard')).includes('Treino A · 5 exercícios · ~30 min'),await p.textContent('#fjCard').catch(()=>''));
  ok(tag+' A: botões Começar e Dia ruim',await p.locator('#fjStart').isVisible()&&(await p.textContent('#fjRuim')).includes('Dia ruim (10 min)'));
  await tap(p,'#fjStart');
  ok(tag+' A: aviso de segurança antes do 1º treino',await p.locator('#fjSheet').isVisible()&&(await p.textContent('#fjSheet')).includes('Pare na hora')&&(await p.textContent('#fjSheet')).includes('não substitui orientação médica'));
  ok(tag+' A: janela acessível (foco dentro, outras telas esperam)',await p.evaluate(()=>{const m=document.getElementById('fjSheet');return m.getAttribute('role')==='dialog'&&m.contains(document.activeElement)&&document.body.classList.contains('inmission');}));
  await tap(p,'#fjOk');let st=await LS(p,pre);ok(tag+' A: aviso lido grava prog.forja.ok',st.forja&&st.forja.ok===true);
  ok(tag+' A: teste de nível e pergunta dos pilares',await p.locator('[data-pt="push"]').count()===1&&await p.locator('#fjPilYes').count()===1);
  await tap(p,'[data-pt="push"]');await tap(p,'#fjPilYes');await tap(p,'#fjGo');
  ok(tag+' A: "Sim" no teste pula para o nível 3',(await p.textContent('#fjEx')).trim()==='Flexão de joelhos',await p.textContent('#fjEx'));
  ok(tag+' A: rodapé "Quando parar" no treino',(await p.locator('#fjSheet .fjstop summary').textContent()).includes('Quando parar'));
  ok(tag+' A: como fazer + aquecimento no 1º exercício',(await p.textContent('#fjHow')).includes('Joelhos no chão')&&(await p.locator('.fjwarm').count())===1);
  await p.focus('#fjPlus');await p.keyboard.press('Enter');await p.waitForTimeout(100);
  ok(tag+' A: Enter no + mantém o foco no + (não registra série)',await p.evaluate(()=>document.activeElement&&document.activeElement.id)==='fjPlus'&&(await p.textContent('#fjVal')).trim()==='9');
  await tap(p,'#fjMinus');
  ok(tag+' A: "Quando parar" com 44 px de toque (#136)',await p.evaluate(()=>document.querySelector('#fjSheet .fjstop summary').getBoundingClientRect().height>=44));
  ok(tag+' A: alvo inicial 8 repetições',(await p.textContent('#fjVal')).trim()==='8');
  await tap(p,'#fjPlus');ok(tag+' A: + ajusta o número',(await p.textContent('#fjVal')).trim()==='9');
  await tap(p,'#fjSet');ok(tag+' A: descanso automático após a série',/Descanso 01:[23]\d/.test(await p.textContent('#fjRest')),await p.textContent('#fjRest'));
  await sets(p,14);ok(tag+' A: treino completo mostra resultado',(await p.textContent('#fjSheet')).includes('+40 XP'),await p.textContent('#fjSheet'));
  await p.screenshot({path:SP+'forja-fim.png'});await tap(p,'#fjClose');
  st=await LS(p,pre);const lg=day(st,'2026-11-25');
  ok(tag+' A: XP forja:<dia> = 40',lg.filter(e=>e.q==='forja:2026-11-25').length===1&&lg.find(e=>e.q==='forja:2026-11-25').xp===40);
  ok(tag+' A: quest s_treino marcada sem XP dobrado',lg.some(e=>e.q==='s_treino'&&e.xp===0));
  ok(tag+' A: sessão gravada',st.forja.ses.length===1&&st.forja.ses[0].tipo==='A'&&st.forja.ses[0].r===0&&st.forja.lv.push===3&&st.forja.last.push[0]===9,JSON.stringify(st.forja));
  ok(tag+' A: campos antigos intactos',st.velho==='fica'&&st.rpg.cls.id==='mago'&&st.log['2026-11-20'].length===1,JSON.stringify({v:st.velho,r:st.rpg,l:st.log['2026-11-20']}));
  let cf=await CF(p,pre);const fq=cf.quests.filter(q=>/^fj_/.test(q.id));
  ok(tag+' A: 3 quests dos pilares, nenhuma principal',fq.length===3&&fq.every(q=>!q.main&&q.ifThen),JSON.stringify(fq.map(q=>q.id)));
  ok(tag+' A: card mostra treino feito',(await p.textContent('#fjCard')).includes('Treino de hoje feito'));
  ok(tag+' A: sequência acesa',(await p.textContent('#streak')).includes('1'),await p.textContent('#streak'));
  ok(tag+' A: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // B: 11/11/11 na última vez → alvo 12; 12/12/12 sugere subir; aceitar grava lv e dá +30 uma vez; < 15 toques além das repetições
  ({ctx,p,errs}=await open(route,pre,P({forja:FJ({lv:{push:2},last:{push:[11,11,11]},ses:[{d:'2026-11-24',tipo:'B',min:30,r:0}]})}),'2026-11-25T10:00:00'));
  let taps=0;await tap(p,'#fjStart');taps++;
  ok(tag+' B: treino alterna para A',(await p.textContent('#fjSheet')).includes('TREINO A'));
  ok(tag+' B: alvo = última +1',(await p.textContent('#fjVal')).trim()==='12');
  await sets(p,15);taps++; // Fechar
  ok(tag+' B: Treino A completo com '+taps+' toques além das repetições',taps<15);
  ok(tag+' B: mostra a melhora vs. a última vez',(await p.textContent('#fjSheet')).includes('↑ +3'),await p.textContent('#fjSheet'));
  ok(tag+' B: sugere subir só Empurrar',await p.locator('.fjoffer').count()===1&&await p.locator('.fjoffer[data-mov="push"]').count()===1);
  await p.locator('.fjoffer[data-mov="push"] button.go').dispatchEvent('click');await p.waitForTimeout(400);await drain(p);
  st=await LS(p,pre);ok(tag+' B: aceitar grava lv.push=3 e +30',st.forja.lv.push===3&&day(st,'2026-11-25').filter(e=>e.q==='forja:lv:push:3'&&e.xp===30).length===1&&!st.forja.last.push,JSON.stringify(st.forja.lv));
  ok(tag+' B: selo de nível',await p.locator('.fjup').count()===1);
  await tap(p,'#fjClose');ok(tag+' B: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // B2: o +30 do mesmo nível não se repete
  const lg2=P({forja:FJ({lv:{push:2},last:{push:[12,12,12]},ses:[{d:'2026-11-26',tipo:'B',min:30,r:0}]})});lg2.log['2026-11-25']=[E('forja:lv:push:3','2026-11-25',30)];
  ({ctx,p,errs}=await open(route,pre,lg2,'2026-11-27T10:00:00'));await tap(p,'#fjStart');await sets(p,15);
  await p.locator('.fjoffer[data-mov="push"] button.go').dispatchEvent('click');await p.waitForTimeout(400);
  st=await LS(p,pre);ok(tag+' B2: +30 só uma vez por nível',st.forja.lv.push===3&&Object.values(st.log).flat().filter(e=>e.q==='forja:lv:push:3').length===1);
  ok(tag+' B2: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // C: dia ruim = 1 série de cada, +20, conta para a sequência; 3º treino da semana = Semana forjada +25
  ({ctx,p,errs}=await open(route,pre,P({forja:FJ({last:{push:[10,10,10]},ses:[{d:'2026-11-23',tipo:'A',min:30,r:0},{d:'2026-11-24',tipo:'B',min:30,r:0}]})}),'2026-11-25T10:00:00',{rm:'reduce'}));
  ok(tag+' C: falta 1 para a Semana forjada',(await p.textContent('#fjCard')).includes('Falta 1 para a Semana forjada'),await p.textContent('#fjCard'));
  await tap(p,'#fjRuim');ok(tag+' C: dia ruim tem 1 série',(await p.textContent('#fjSheet')).includes('1 série')&&(await p.textContent('#fjSheet')).includes('DIA RUIM'));
  ok(tag+' C: reduce-motion sem animação',(await p.evaluate(()=>getComputedStyle(document.querySelector('.fjcard')).animationName))==='none');
  await sets(p,5);st=await LS(p,pre);const lc=day(st,'2026-11-25');
  ok(tag+' C: dia ruim dá +20',lc.some(e=>e.q==='forja:2026-11-25'&&e.xp===20&&e.kind==='min'));
  ok(tag+' C: Semana forjada +25',lc.some(e=>e.q==='forja:sem:2026-11-23'&&e.xp===25));
  ok(tag+' C: dia ruim conta como treino',st.forja.ses.length===3&&st.forja.ses[2].r===1&&lc.some(e=>e.q==='s_treino'&&e.kind==='min'));
  ok(tag+' C: dia ruim não rebaixa o alvo',st.forja.last.push.join()==='10,10,10',JSON.stringify(st.forja.last.push));
  ok(tag+' C: sem sugestão de nível no dia ruim',await p.locator('.fjoffer').count()===0);
  await tap(p,'#fjClose');ok(tag+' C: sequência acesa pelo dia ruim',(await p.textContent('#streak')).includes('1'));
  ok(tag+' C: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // D: desktop, descanso (quinta), editar dias em 1 toque, ▶ da quest de treino, Mais > níveis, tirar pilares
  const cfgP=JSON.parse(JSON.stringify(CFG));cfgP.quests.push({id:'fj_prot',title:'Proteína',xp:15,stat:'corpo',fj:1});
  ({ctx,p,errs}=await open(route,pre,P({forja:FJ({pil:true})}),'2026-11-26T10:00:00',{vp:{width:1280,height:800},cfg:cfgP}));
  ok(tag+' D: quinta é descanso',(await p.textContent('#fjCard')).includes('Hoje é descanso'),await p.textContent('#fjCard'));
  ok(tag+' D: no descanso o card vai para depois das tarefas',await p.evaluate(()=>{const c=document.getElementById('fjCard'),q=document.getElementById('quests').closest('section');return !!(q.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_FOLLOWING);}));
  ok(tag+' D: sem rolagem lateral no desktop',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await tap(p,'#fjDaysBtn');await tap(p,'#fjCard .fjday[data-d="3"]');
  ok(tag+' D: quinta virou dia de treino',(await p.textContent('#fjCard')).includes('~30 min')&&(await LS(p,pre)).forja.dias.join()==='0,2,3,4');
  await p.fill('#fjHoraC','18:30');await p.dispatchEvent('#fjHoraC','change');await p.waitForTimeout(200);
  ok(tag+' D: horário fixo no card',(await LS(p,pre)).forja.hora==='18:30'&&(await p.textContent('#fjDaysBtn')).includes('18:30'));
  const cfD=await CF(p,pre);ok(tag+' D: pilares completados sem duplicar',cfD.quests.filter(q=>q.id==='fj_prot').length===1&&cfD.quests.find(q=>q.id==='fj_hora').days.join()==='0,2,3,4'&&cfD.quests.find(q=>q.id==='fj_hora').title.includes('às 18:30'));
  const play=p.locator('#quests .quest[data-q="s_treino"] .msgo');
  ok(tag+' D: ▶ na quest de treino',await play.count()===1);
  if(await play.count()){await play.dispatchEvent('click');await p.waitForTimeout(300);ok(tag+' D: ▶ abre o Forja, não o timer genérico',await p.locator('#fjSheet').isVisible()&&!(await p.locator('#msSheet').isVisible().catch(()=>false)));await tap(p,'#fjMin');}
  ok(tag+' D: Mais > Forja: meus níveis',(await p.textContent('#fjPanel')).includes('Forja: meus níveis')&&(await p.textContent('#fjPanel')).includes('Empurrar · nível 1/5'));
  await tap(p,'#fjPilT');ok(tag+' D: tirar os pilares',!(await CF(p,pre)).quests.some(q=>/^fj_/.test(q.id))&&(await LS(p,pre)).forja.pil===false);
  ok(tag+' D: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // F: faltou na quarta (sexta-feira, último treino na segunda): recaída sem culpa
  // quem já treina não está no 1º uso: guia escondido (no 1º uso a Forja desce de propósito, #111/#131)
  ({ctx,p,errs}=await open(route,pre,P({gd:{off:1},forja:FJ({ses:[{d:'2026-11-23',tipo:'A',min:30,r:0}]})}),'2026-11-27T10:00:00'));
  ok(tag+' F: faltou 1 dia, mensagem sem culpa',(await p.textContent('#fjCard')).includes('Faltou na qua? Normal'),await p.textContent('#fjCard'));
  ok(tag+' F: card antes das tarefas no dia de treino',await p.evaluate(()=>{const c=document.getElementById('fjCard');return !!(c.nextElementSibling&&c.nextElementSibling.querySelector('#quests'));}));
  ok(tag+' F: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // G: jogador novo sem classe no dia 1: a galeria espera o Forja fechar e os avisos da vitória passarem, uma janela por vez (#135)
  {const cfg=Object.assign({},CFG,{startDate:'2026-11-25'});const pg=P({forja:FJ(),log:{}});delete pg.rpg;
  ({ctx,p,errs}=await open(route,pre,pg,'2026-11-25T10:00:00',{cfg}));}
  const gal=()=>p.evaluate(()=>{const m=document.getElementById('clsModal');return !!(m&&!m.hidden&&m.getClientRects().length);});
  ok(tag+' G: dia 1 sem vitória, galeria ainda fechada',!(await gal()));
  await tap(p,'#fjStart');await sets(p,15);await p.clock.runFor(3000);
  ok(tag+' G: galeria não abre com o Forja aberto',!(await gal()));
  await tap(p,'#fjClose');let both=false,seen=false;
  for(let i=0;i<30;i++){await p.clock.runFor(500);const st=await p.evaluate(()=>{const g=document.getElementById('clsModal');const gv=!!(g&&g.getClientRects().length);const o=[...document.querySelectorAll('.sysmodal,.levelup,#levelup')].filter(m=>m.id!=='clsModal'&&!m.hidden&&m.getClientRects().length).length;return {gv,o};});
    if(st.gv&&st.o)both=true;if(st.gv)seen=true;
    if(st.o&&!st.gv){const b=p.locator('.sysmodal:not(#clsModal) button.go');if(await b.count())await b.first().dispatchEvent('click');else if(await p.locator('#levelup').isVisible())await p.locator('#luClose').dispatchEvent('click');}}
  ok(tag+' G: nunca duas janelas juntas',!both);ok(tag+' G: galeria abre depois dos avisos',seen);
  ok(tag+' G: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // E: celular sem rolagem lateral com o treino aberto + prog.forja quebrado não derruba o app
  ({ctx,p,errs}=await open(route,pre,P({forja:{lv:'x',last:null,ses:{},cur:{d:'2020-01-01',tipo:'Z'}}}),'2026-11-25T10:00:00'));
  ok(tag+' E: dado estranho em prog.forja não quebra',await p.locator('#fjCard').isVisible());
  await tap(p,'#fjStart');await tap(p,'#fjOk');await tap(p,'#fjGo');
  ok(tag+' E: celular sem rolagem lateral',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.screenshot({path:SP+'forja-celular.png'});
  ok(tag+' E: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // H: caminhada de 20 min, "senti dor, parei" e leitura do dia (base do Desafio Forja 30)
  ({ctx,p,errs}=await open(route,pre,P({gd:{off:1},forja:FJ({ses:[{d:'2026-11-23',tipo:'A',min:30,r:0}]})}),'2026-11-25T18:00:00'));
  ok(tag+' H: botão de caminhada no card',(await p.textContent('#fjWalk')).includes('caminhada de 20 min'),await p.textContent('#fjCard'));
  await tap(p,'#fjWalk');
  ok(tag+' H: timer da caminhada aberto',await p.locator('#fjWalkT').isVisible()&&(await p.textContent('#fjSheet')).includes('dá para conversar'));
  await p.clock.runFor(5*60000);await tap(p,'#fjWalkEnd');
  ok(tag+' H: antes de 10 min não conta',(await LS(p,pre)).forja.walk&&!day(await LS(p,pre),'2026-11-25').some(e=>e.q==='forja:2026-11-25'));
  await tap(p,'#fjMin');await p.clock.runFor(1000);
  ok(tag+' H: minimizar mantém a caminhada no card',(await p.textContent('#fjCard')).includes('Caminhada em andamento'));
  await tap(p,'#fjResume');await p.clock.runFor(16*60000);
  ok(tag+' H: 21 min, meta batida',(await p.textContent('#fjWalkS')).includes('Meta de 20 min'));
  await tap(p,'#fjWalkEnd');st=await LS(p,pre);
  const ce=day(st,'2026-11-25').find(e=>e.q==='forja:2026-11-25');
  ok(tag+' H: caminhada dá +20 e marca o treino do perfil',ce&&ce.xp===20&&day(st,'2026-11-25').some(e=>e.q==='s_treino'),JSON.stringify(day(st,'2026-11-25')));
  ok(tag+' H: caminhada grava tipo C, sem mexer em nível nem alvo',st.forja.ses.at(-1).tipo==='C'&&st.forja.ses.at(-1).min>=20&&!st.forja.walk&&JSON.stringify(st.forja.last)==='{}');
  ok(tag+' H: tela final da caminhada',(await p.textContent('#fjSheet')).includes('Caminhada feita'));
  await tap(p,'#fjClose');
  ok(tag+' H: card mostra caminhada feita e o próximo continua B',(await p.textContent('#fjCard')).includes('Caminhada de hoje feita')&&(await p.textContent('#fjCard')).includes('Treino B'),await p.textContent('#fjCard'));
  ok(tag+' H: fjDia lê caminhada e treino',await p.evaluate(()=>[ascForja.dia('2026-11-25'),ascForja.dia('2026-11-23'),ascForja.dia('2026-11-24')].join())==='caminhada,treino,',await p.evaluate(()=>typeof ascForja));
  ok(tag+' H: caminhada não entra na Semana forjada',(await p.textContent('#fjPanel')).includes('Esta semana: 1 de 3'),await p.textContent('#fjPanel'));
  ok(tag+' H: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // H2: senti dor no treino: conta o dia, encerra na hora, não mexe no alvo
  ({ctx,p,errs}=await open(route,pre,P({gd:{off:1},forja:FJ({last:{pull:[10,10,10]},ses:[{d:'2026-11-23',tipo:'A',min:30,r:0}]})}),'2026-11-25T18:00:00'));
  await tap(p,'#fjStart');
  ok(tag+' H2: botão "Senti dor, parei" no treino',(await p.textContent('#fjDor')).includes('Senti dor'));
  ok(tag+' H2: botão de dor com 44 px',await p.evaluate(()=>document.getElementById('fjDor').getBoundingClientRect().height>=44));
  await tap(p,'#fjDor');st=await LS(p,pre);
  ok(tag+' H2: dor conta o dia (+20) mesmo sem série',(day(st,'2026-11-25').find(e=>e.q==='forja:2026-11-25')||{}).xp===20&&st.forja.ses.at(-1).dor===1&&!st.forja.cur);
  ok(tag+' H2: treino parado por dor não troca A/B',(await p.textContent('#fjSheet')).includes('Próximo: Treino B'),await p.textContent('#fjSheet'));
  ok(tag+' H2: dor não mexe no alvo',JSON.stringify(st.forja.last)==='{"pull":[10,10,10]}');
  ok(tag+' H2: tela final orienta a parar e procurar ajuda',(await p.textContent('#fjSheet')).includes('procure atendimento'));
  ok(tag+' H2: fjDia lê dor; fjNivelSubiu sem subida',await p.evaluate(()=>ascForja.dia('2026-11-25')+','+ascForja.nivelSubiu('2026-11-01'))==='dor,false');
  ok(tag+' H2: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // I: tela acesa (Wake Lock) só com o treino ou a caminhada abertos
  const WL=()=>{window.__wl={req:0,on:0};Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{__wl.req++;__wl.on++;const ls=[];return {addEventListener:(e,f)=>ls.push(f),release:async()=>{__wl.on--;ls.forEach(f=>f());}};}}});};
  ({ctx,p,errs}=await open(route,pre,P({gd:{off:1},forja:FJ({ses:[{d:'2026-11-23',tipo:'A',min:30,r:0}]})}),'2026-11-25T18:00:00',{init:WL}));
  let wl=()=>p.evaluate(()=>window.__wl.on);
  ok(tag+' I: tela livre fora do treino',await wl()===0);
  await tap(p,'#fjStart');await p.waitForTimeout(150);ok(tag+' I: treino aberto segura a tela',await wl()===1);
  await tap(p,'#fjPlus');await tap(p,'#fjSet');await p.waitForTimeout(150);ok(tag+' I: um pedido só durante o treino',await p.evaluate(()=>window.__wl.req)===1&&await wl()===1);
  await tap(p,'#fjMin');await p.waitForTimeout(150);ok(tag+' I: minimizar solta a tela',await wl()===0);
  await tap(p,'#fjResume');await p.waitForTimeout(150);ok(tag+' I: voltar ao treino segura de novo',await wl()===1);
  await tap(p,'#fjDor');await p.waitForTimeout(150);ok(tag+' I: tela final solta a tela',await wl()===0);
  await tap(p,'#fjClose');await p.waitForTimeout(150);ok(tag+' I: fechar deixa a tela livre',await wl()===0);
  ok(tag+' I: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,P({gd:{off:1},forja:FJ({ses:[{d:'2026-11-23',tipo:'A',min:30,r:0}]})}),'2026-11-25T18:00:00',{init:WL}));
  await tap(p,'#fjWalk');await p.waitForTimeout(150);ok(tag+' I: caminhada segura a tela',await wl()===1);
  await tap(p,'#fjMin');await p.waitForTimeout(150);ok(tag+' I: minimizar a caminhada solta a tela',await wl()===0);
  ok(tag+' I: console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
