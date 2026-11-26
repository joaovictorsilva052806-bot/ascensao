// Feedback dos testadores (25/11): Missão ativa v2, onboarding v2 (perguntas de toque + "Trocar esta tarefa") e modo simples nos 3 primeiros dias.
// Rode com: python3 -m http.server 8000 & node qa/feedback.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';const SP=require('os').tmpdir()+'/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
async function drain(p){for(let i=0;i<12;i++){await p.evaluate(()=>document.querySelectorAll('#tlModal').forEach(e=>e.remove()));const m=p.locator('.sysmodal button.go');if(await m.count()){await m.first().dispatchEvent('click');await p.waitForTimeout(120);continue;}
  if(await p.locator('#levelup').isVisible()){await p.locator('#luClose').dispatchEvent('click');continue;}await p.evaluate(()=>document.querySelectorAll('#tlModal').forEach(e=>e.remove()));await p.waitForTimeout(200);if(!(await p.locator('.sysmodal button.go').count()))break;}}
(async()=>{const b=await chromium.launch();
async function ctxp(time,opt={}){const ctx=await b.newContext({viewport:opt.vp||{width:390,height:844},reducedMotion:opt.rm||'no-preference',serviceWorkers:'block'});await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  if(time)await p.clock.install({time:new Date(time)});return {ctx,p,errs};}
const LS=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),k);
// ---------- 1. Onboarding v2 + modo simples (dia 1) + trocar tarefa ----------
for(const vp of [{width:390,height:844},{width:1280,height:800}]){const tag=vp.width<500?'[celular]':'[desktop]';
  let {ctx,p,errs}=await ctxp('2026-11-25T10:00:00',{vp});await p.goto(U+'comecar/');await p.waitForTimeout(500);
  if(await p.isVisible('#q_perm'))await p.click('#q_perm');
  await p.fill('#q_name','Bia');await p.click('#q_n0');await p.click('#q_age button[data-v=young]');await p.click('#q_occ button[data-v=estudante]');
  const hs=[];for(const v of ['carro','run','yes','manha']){await p.waitForTimeout(120);hs.push(await p.textContent('#q_xh'));await p.click('#q_x button[data-v='+v+']');}
  ok(tag+' onboarding: 4 perguntas de toque',hs.length===4&&/desloca/.test(hs[0])&&/treina/.test(hs[1])&&/flashcards/.test(hs[2])&&/livre/.test(hs[3]),hs.join(' / '));
  await p.waitForTimeout(150);ok(tag+' onboarding: depois vai para os focos',/evoluir|subir de nível/.test(await p.textContent('#quick .qstep:not([hidden]) h2')));
  await p.click('#q_done');await p.waitForTimeout(2300);await drain(p);
  const cfg=await LS(p,'asc-u-cfg');const P=cfg.profile;
  ok(tag+' perfil guarda as respostas',P.transport==='carro'&&P.train==='run'&&P.cards==='yes'&&P.free==='manha',JSON.stringify(P));
  const T=cfg.quests.map(q=>q.title+' '+(q.ifThen||'')).join(' | ');
  ok(tag+' sem ônibus para quem anda de carro',!/ônibus/i.test(T),T);
  ok(tag+' quem usa flashcards ganha revisão de flashcards',cfg.quests.some(q=>q.id==='s_rev'&&/flashcards do dia/.test(q.title)),T);
  ok(tag+' quem corre ganha treino de corrida no horário livre',cfg.quests.some(q=>q.id==='s_treino'&&/Correr/.test(q.title)&&/De manhã/.test(q.ifThen)),T);
  const pr=await LS(p,'asc-u-prog');ok(tag+' modo simples liga para jogador novo',pr.simple&&pr.simple.from==='2026-11-25');
  const vis=await p.evaluate(()=>[...document.querySelectorAll('#quests .quest')].filter(e=>e.getClientRects().length).map(e=>e.dataset.q));
  ok(tag+' dia 1: só a PRÓXIMA missão aparece',vis.length===1,vis.join(','));
  const hojeVis=await p.evaluate(()=>[...document.querySelectorAll('.wrap>section[data-tab="hoje"]')].filter(e=>e.getClientRects().length).length);
  ok(tag+' dia 1: Hoje tem só o status e a missão',hojeVis===2,String(hojeVis));
  await p.screenshot({path:SP+'fb-dia1'+(vp.width<500?'':'-desk')+'.png'});
  await drain(p);await p.locator('#s3Bar .link:not(.s3off)').dispatchEvent('click');await p.waitForTimeout(150);
  ok(tag+' "Ver todas" mostra as outras',(await p.evaluate(()=>[...document.querySelectorAll('#quests .quest')].filter(e=>e.getClientRects().length).length))>1);
  // trocar esta tarefa
  await p.locator('#quests .quest.next .msgo').dispatchEvent('click');await p.waitForTimeout(300);
  ok(tag+' missão: botão "Trocar esta tarefa"',await p.isVisible('.msswap'));
  const id=await p.evaluate(()=>document.querySelector('#quests .quest.next').dataset.q);const c0=(await LS(p,'asc-u-cfg')).quests.find(q=>q.id===id);
  await p.locator('.msswap').dispatchEvent('click');await p.waitForTimeout(200);const c1=(await LS(p,'asc-u-cfg')).quests.find(q=>q.id===id);
  ok(tag+' trocar: título muda, XP/principal/dias iguais, original guardada',c1.title!==c0.title&&c1.xp===c0.xp&&c1.main===c0.main&&JSON.stringify(c1.days)===JSON.stringify(c0.days)&&c1.orig&&c1.orig.t===c0.title,c0.title+' -> '+c1.title);
  ok(tag+' trocar: a tela mostra a nova',(await p.textContent('#msSheet h3'))===c1.title);
  await p.locator('#toast button').dispatchEvent('click');await p.waitForTimeout(150);
  ok(tag+' trocar: desfazer volta',(await LS(p,'asc-u-cfg')).quests.find(q=>q.id===id).title===c0.title);
  await p.keyboard.press('Escape');
  ok(tag+' console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
// ---------- 2. Modo simples desbloqueia por dia e não liga para quem já jogava ----------
const CFG={version:3,name:'Teste',startDate:'2026-11-20',profile:{age:'young',occ:'estudante',transport:'carro',focus:['sono']},quests:[
  {id:'s_rev',title:'Revisão ativa: 15 min de flashcards',xp:30,stat:'mente',main:true,minTitle:'5 cards',ifThen:'Logo depois do café da manhã, abro o material.'},
  {id:'s_ler',title:'Ler 10 páginas de um livro',xp:15,stat:'mente',minTitle:'2 páginas',ifThen:'Antes de dormir, no lugar do celular.'},
  {id:'s_treino',title:'Treino na academia: 4 séries',xp:25,stat:'corpo',ifThen:'De manhã, no meu horário livre, calço o tênis e vou.'},
  {id:'s_aula',title:'Na aula: anotar 1 dúvida',xp:15,stat:'mente',ifThen:'Quando a aula começar, abro a nota.'},
  {id:'s_fech',title:'Antes de dormir: marcar o que fiz hoje',xp:15,stat:'foco',main:true,ifThen:'Quando colocar o celular para carregar à noite, abro este app primeiro.'}]};
const PROG=x=>Object.assign({log:{},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},gd:{off:1},velho:'fica'},x);
async function open(route,pre,prog,time){const o=await ctxp(time);const {p}=o;await p.goto(U+route);
  await p.evaluate(([c,pr,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(pr));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-news','99');try{const t=JSON.parse(localStorage.getItem('asc-u-tele')||'{}');t.asked=true;localStorage.setItem('asc-u-tele',JSON.stringify(t));}catch(e){}},[CFG,prog,pre]);
  await p.reload();await p.waitForTimeout(1000);await drain(p);return o;}
const vis=p=>p.evaluate(()=>({q:[...document.querySelectorAll('#quests .quest')].filter(e=>e.getClientRects().length).length,zap:!!(document.getElementById('zapPanel')||{getClientRects:()=>[]}).getClientRects().length,ci:[...document.querySelectorAll('.wrap>section')].some(s=>s.querySelector('#energy')&&s.getClientRects().length),s3:document.body.dataset.s3}));
{let {ctx,p,errs}=await open('comecar/','asc-u',PROG({}),'2026-11-25T10:00:00');let v=await vis(p);
  ok('quem já jogava não entra no modo simples',v.q>1&&v.zap&&v.s3==='',JSON.stringify(v));await ctx.close();
  ({ctx,p,errs}=await open('comecar/','asc-u',PROG({simple:{from:'2026-11-24',seen:0}}),'2026-11-25T10:00:00'));v=await vis(p);
  const pr=await LS(p,'asc-u-prog');ok('dia 2: todas as tarefas + check-in, sem desafios',v.q>1&&v.ci&&!v.zap&&v.s3==='1',JSON.stringify(v));
  ok('dia 2: aviso de desbloqueio 1 vez',pr.simple.seen===1);await ctx.close();
  ({ctx,p,errs}=await open('comecar/','asc-u',PROG({simple:{from:'2026-11-23',seen:1}}),'2026-11-25T10:00:00'));v=await vis(p);
  ok('dia 3: desafios relâmpago liberados',v.zap&&v.s3==='2',JSON.stringify(v));
  await p.locator('.s3off').dispatchEvent('click');await p.waitForTimeout(200);v=await vis(p);
  ok('"mostrar o app completo" sai do modo simples',v.s3===''&&(await LS(p,'asc-u-prog')).simple.off==='2026-11-25');await ctx.close();
  ({ctx,p,errs}=await open('comecar/','asc-u',PROG({simple:{from:'2026-11-21',seen:2}}),'2026-11-25T10:00:00'));v=await vis(p);
  ok('dia 5: app completo',v.s3===''&&v.zap,JSON.stringify(v));ok('dados antigos intactos',(await LS(p,'asc-u-prog')).velho==='fica');await ctx.close();}
// ---------- 3. Missão ativa v2 (nos dois apps) ----------
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  let {ctx,p,errs}=await open(route,pre,PROG({}),'2026-11-25T10:00:00');
  const openM=async id=>{await p.evaluate(()=>{const d=document.querySelector('#quests details');if(d)d.open=true;});await p.locator('#quests .quest[data-q="'+id+'"] .msgo').dispatchEvent('click');await p.waitForTimeout(200);};
  await openM("s_ler");ok(tag+' leitura: contador de páginas',/0 de 10 páginas/.test(await p.textContent('.mstool .mstl')));
  await p.click('.mstool button:has-text("+5")');await p.click('.mstool button:has-text("+1")');
  ok(tag+' leitura: soma e grava',/6 de 10/.test(await p.textContent('.mstool .mstl'))&&(await LS(p,pre+'-prog')).leitura['2026-11-25']===6);
  await p.screenshot({path:SP+'fb-leitura.png'});await p.keyboard.press('Escape');
  await openM('s_treino');ok(tag+' treino: séries com meta do título',/0 de 4 séries/.test(await p.textContent('.mstool .mstl')));
  await p.click('.mstool button:has-text("+1")');await p.waitForTimeout(100);
  ok(tag+' treino: +1 série inicia descanso',/Descanso: \d+ s/.test(await p.textContent('#msRestC'))&&(await LS(p,pre+'-prog')).series['2026-11-25']===1);
  await p.screenshot({path:SP+'fb-treino.png'});await p.keyboard.press('Escape');
  await openM('s_aula');await p.fill('.mstool input','O que é derivada?');await p.click('.mstool button:has-text("Anotar")');
  ok(tag+' dúvida: anota',(await LS(p,pre+'-prog')).duvidas[0].t==='O que é derivada?');
  await p.click('.msdl button');ok(tag+' dúvida: marca como tirada',!!(await LS(p,pre+'-prog')).duvidas[0].ok);await p.keyboard.press('Escape');
  await openM('s_fech');const steps=await p.$$eval('.msstep',e=>e.map(x=>x.textContent));
  ok(tag+' passos: checklist gerado do gatilho',steps.length>=3&&/Gatilho: Quando colocar/.test(steps[0]),steps.join(' / '));
  await p.click('.msstep >> nth=0');ok(tag+' passos: marca e grava',(await LS(p,pre+'-prog')).msSteps['2026-11-25'].s_fech[0]===1);
  await p.screenshot({path:SP+'fb-passos.png'});await p.keyboard.press('Escape');
  ok(tag+' trocar tarefa só para tarefa gerada pelo perfil',await (async()=>{await p.evaluate(()=>{const d=document.querySelector('#quests details');if(d)d.open=true;});await p.locator('#quests .quest[data-q="s_ler"] .msgo').dispatchEvent('click');await p.waitForTimeout(200);const v=await p.isVisible('.msswap');await p.keyboard.press('Escape');return v;})());
  ok(tag+' console limpo (missão)',errs.length===0,errs.join(' | '));ok(tag+' dados antigos intactos (missão)',(await LS(p,pre+'-prog')).velho==='fica');await ctx.close();}
// ---------- 4. reduce-motion: barra sem transição ----------
{const {ctx,p}=await ctxp('2026-11-25T10:00:00',{rm:'reduce'});await p.goto(U+'comecar/');
  await p.evaluate(([c,pr])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(pr));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-news','99');},[CFG,PROG({})]);
  await p.reload();await p.waitForTimeout(900);await drain(p);await p.evaluate(()=>{const d=document.querySelector('#quests details');if(d)d.open=true;});await p.locator('#quests .quest[data-q="s_ler"] .msgo').dispatchEvent('click');await p.waitForTimeout(200);
  ok('reduce-motion: barra de progresso sem animação',(await p.$eval('.msbar i',e=>getComputedStyle(e).transitionDuration))==='0s');await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log('\n'+(R.length-f)+'/'+R.length+' passaram');process.exit(f?1:0);})();
