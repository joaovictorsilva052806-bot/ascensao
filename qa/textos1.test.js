// Textos da 1ª sessão (tools/textos1.js): o texto novo aparece e o fluxo/dados não mudam.
// Rode com: python3 -m http.server 8000 & node qa/textos1.test.js
const {chromium}=require('playwright');const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
(async()=>{const b=await chromium.launch();
for(const vp of [{width:390,height:844},{width:1280,height:800}]){const tag=vp.width+'px';
  const ctx=await b.newContext({viewport:vp,timezoneId:'America/Sao_Paulo'});const p=await ctx.newPage();const errs=[];
  await p.clock.install({time:new Date('2026-11-26T13:00:00Z')});
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,body:''}));await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,body:'{}'}));
  await p.goto('http://localhost:8000/comecar/');await p.waitForTimeout(400);
  ok(tag+': Despertar curto',(await p.textContent('#qWake')).includes('Sem conta. Tudo fica só neste celular.'));
  await p.click('#q_perm');await p.waitForTimeout(200);
  ok(tag+': pergunta do nome',(await p.textContent('#quick')).includes('Como eu te chamo?'));
  await p.fill('#q_name','Lia Souza');await p.click('#q_n0');await p.waitForTimeout(200);
  ok(tag+': idade com o nome',(await p.textContent('#q_h1'))==='Lia, qual a sua idade?',await p.textContent('#q_h1'));
  await p.locator('#q_age button').nth(2).click();await p.waitForTimeout(200);
  ok(tag+': rotina',(await p.textContent('#q_h2'))==='O que ocupa o seu dia?');
  await p.locator('#q_occ button').nth(1).click();await p.waitForTimeout(200);
  ok(tag+': foco com gancho',(await p.textContent('#q_h3')).includes('subir de nível'));
  ok(tag+': botão final',(await p.textContent('#q_done')).includes('Começar a jogar'));
  await p.click('#q_done');await p.waitForTimeout(1500);
  const toastTxt=await p.textContent('#toast').catch(()=>'');
  ok(tag+': aviso de jogo pronto com 1º nome',/Jogo pronto, Lia\. Sua 1ª missão te espera\./.test(toastTxt),toastTxt);
  // classe (inalterada) e check-in
  const sug=p.locator('#clsSug');if(await sug.count())await sug.click();await p.waitForTimeout(500);
  let ci='';for(let i=0;i<6;i++){const g=p.locator('.sysmodal button.go:visible');if(!(await g.count()))break;const t=await p.locator('.sysmodal:visible').first().innerText();if(/CHECK-IN/.test(t))ci=t;await g.first().dispatchEvent('click');await p.waitForTimeout(400);}
  ok(tag+': check-in diz o ganho',/Dia 1 · você chegou/.test(ci)&&/Pegar \+10 XP/.test(ci),ci);
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));const cfg=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-cfg')));
  ok(tag+': check-in ainda grava +10 XP',Object.values(st.log).flat().some(e=>String(e.q).startsWith('checkin:')&&e.xp===10));
  ok(tag+': perfil gravado igual (nome, idade, rotina)',cfg.name==='Lia Souza'&&cfg.profile.age==='young'&&cfg.profile.occ==='estudante',JSON.stringify(cfg.profile));
  const gd=await p.textContent('#gdPanel');ok(tag+': guia com passos curtos',gd.includes('Comece a 1ª missão')&&gd.includes('+10 XP na hora')&&gd.includes('Já sei jogar, esconder'),gd);
  await p.locator('#quests .msgo:not([disabled])').first().click();await p.waitForTimeout(300);await p.locator('#msSheet .msend button.go').first().click();await p.waitForTimeout(600);
  ok(tag+': placar do dia sem "(s)"',/^Hoje: \d+ feitas? · \+\d+ XP$/.test(await p.textContent('#dayxp')),await p.textContent('#dayxp'));
  ok(tag+': console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
// reduce-motion: Despertar aparece inteiro, sem digitação, com o texto novo
{const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,body:''}));await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,body:'{}'}));
  await p.goto('http://localhost:8000/comecar/');await p.waitForTimeout(150);
  ok('reduce-motion: Despertar pronto na hora',(await p.textContent('#qType')).includes('Pronto para despertar?')&&(await p.textContent('#qWake')).includes('Sem conta.'));
  await p.click('#q_perm');await p.fill('#q_name','Ana');await p.click('#q_n0');await p.waitForTimeout(100);
  ok('reduce-motion: perguntas com texto novo',(await p.textContent('#q_h1'))==='Ana, qual a sua idade?');
  ok('reduce-motion: console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
// dado antigo: jogador que já existia abre o app, nada some e o texto novo aparece
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const ctx=await b.newContext({viewport:{width:390,height:844},timezoneId:'America/Sao_Paulo'});const p=await ctx.newPage();const errs=[];
  await p.clock.install({time:new Date('2026-11-26T13:00:00Z')});p.on('pageerror',e=>errs.push(e.message));
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,body:''}));await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,body:'{}'}));
  const CFG={version:1,name:'Velho',startDate:'2026-10-01',profile:{age:'adult',occ:'clt',focus:['sono']},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]};
  const PROG={log:{'2026-11-24':[{q:'q1',kind:'full',xp:10,stat:'mente',bonus:0,t:'2026-11-24T12:00:00Z'},{q:'checkin:2026-11-24',kind:'checkin',xp:10,stat:'foco',bonus:0,t:'2026-11-24T12:00:00Z'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},campoVelho:'fica'};
  await p.goto('http://localhost:8000/'+route);
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG,PROG,pre]);
  await p.reload();await p.waitForTimeout(1200);
  let ci='';for(let i=0;i<8&&!ci;i++){const g=p.locator('.sysmodal button.go:visible');if(!(await g.count())){await p.waitForTimeout(700);continue;}const t=await p.locator('.sysmodal:visible').first().innerText();if(/CHECK-IN/.test(t))ci=t;await g.first().dispatchEvent('click');await p.waitForTimeout(300);}
  const st=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
  ok((route||'/')+' dado antigo: log e campo antigo intactos',st.campoVelho==='fica'&&(st.log['2026-11-24']||[]).length===2,JSON.stringify(st.log['2026-11-24']));
  if(route)ok((route||'/')+' dado antigo: check-in com texto novo',/Pegar \+\d+ XP/.test(ci)&&/Bem-vindo de volta/.test(ci)&&!/primeiro XP/.test(ci),ci);
  ok((route||'/')+' dado antigo: console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
// modo "simples" e app do JV (raiz) seguem abrindo sem erro
{const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,body:''}));await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,body:'{}'}));
  await p.goto('http://localhost:8000/');await p.waitForTimeout(800);ok('raiz: abre sem erro',errs.length===0,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
