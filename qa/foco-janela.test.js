// Teclado e leitor de tela: as janelas "[ SISTEMA ] Missão" (#smSheet) e "Missão" (#msSheet, botão ▶ da tarefa)
// levam o foco para dentro quando abrem e, ao fechar (Esc ou ✕), devolvem o foco para quem abriu.
// Antes: o ▶ abria a janela com o foco preso atrás dela, e fechar a do Sistema jogava o foco no <body> (volta ao topo da página), e todo Esc dava TypeError no console.
// Rode com: python3 -m http.server 8000 & node qa/foco-janela.test.js
const {chromium}=require('playwright');const BASE=process.env.BASE||'http://localhost:8000';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 páginas',xp:10,stat:'mente',main:true},{id:'q2',title:'Caminhar',xp:10,stat:'corpo'}]};
const PROG=()=>({log:{'2026-11-26':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},simple:{off:'2026-11-21'},rank:{on:false,asked:true},friends:{l:[],seen:{}}});
(async()=>{const b=await chromium.launch();
for(const [nome,url,P] of [['comecar',BASE+'/comecar/','asc-u-'],['raiz',BASE+'/','ascensao-']])for(const rm of ['no-preference','reduce']){const tag=nome+' '+rm;
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm});
  await ctx.route('https://**',r=>r.fulfill({status:200,body:''}));
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-27T19:30:00')});
  // semente numa página sem o app (mesma origem), depois abre o app
  await p.goto(BASE+'/privacidade/');
  await p.evaluate(([c,o,P])=>{localStorage.setItem(P+'cfg',JSON.stringify(c));localStorage.setItem(P+'prog',JSON.stringify(o));localStorage.setItem(P+'season','2');
    if(P==='asc-u-'){localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));}},[CFG,PROG(),P]);
  await p.goto(url);await p.waitForTimeout(1500);
  await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.remove()));await p.waitForTimeout(200);
  // Esc com nenhuma janela aberta não pode dar erro de JS (antes: TypeError em tools/secret.js a cada Esc)
  await p.keyboard.press('Escape');await p.waitForTimeout(100);
  ok(`${tag}: Esc sem janela aberta não dá erro de JS`,!errs.length,errs.join(' | '));
  const ae=()=>p.evaluate(()=>{const a=document.activeElement;return {tag:a.tagName,id:a.id,cls:a.className,inSm:!!a.closest('#smSheet'),inMs:!!a.closest('#msSheet')};});
  const foca=s=>p.evaluate(s=>{const x=document.querySelector(s);if(!x||!x.getClientRects().length)return false;x.scrollIntoView({block:'center'});x.focus();return document.activeElement===x;},s);
  // 1) janela do Sistema (#smBar)
  ok(`${tag}: barra [ SISTEMA ] recebe foco`,await foca('#smBar'));
  await p.keyboard.press('Enter');await p.waitForTimeout(400);
  let a=await ae();ok(`${tag}: Sistema aberto, foco dentro da janela`,a.inSm,JSON.stringify(a));
  await p.keyboard.press('Escape');await p.waitForTimeout(400);
  a=await ae();ok(`${tag}: Esc fecha o Sistema e o foco volta para a barra`,a.id==='smBar',JSON.stringify(a));
  ok(`${tag}: janela do Sistema fechada`,await p.evaluate(()=>{const m=document.getElementById('smSheet');return !m||m.hidden;}));
  // fechar pelo ✕ também devolve o foco
  await foca('#smBar');await p.keyboard.press('Enter');await p.waitForTimeout(400);
  await p.evaluate(()=>document.querySelector('#smSheet .smx').click());await p.waitForTimeout(300);
  a=await ae();ok(`${tag}: ✕ fecha o Sistema e o foco volta para a barra`,a.id==='smBar',JSON.stringify(a));
  // 2) janela da Missão (botão ▶ da tarefa)
  ok(`${tag}: botão ▶ da tarefa recebe foco`,await foca('.quest[data-q] .msgo'));
  await p.keyboard.press('Enter');await p.waitForTimeout(400);
  ok(`${tag}: janela da Missão abriu`,await p.evaluate(()=>{const m=document.getElementById('msSheet');return !!m&&!m.hidden;}));
  a=await ae();ok(`${tag}: Missão aberta, foco dentro da janela (não preso atrás)`,a.inMs,JSON.stringify(a));
  await p.keyboard.press('Escape');await p.waitForTimeout(400);
  a=await ae();ok(`${tag}: Esc fecha a Missão e o foco volta para o ▶`,a.cls.includes('msgo'),JSON.stringify(a));
  // toque (sem teclado) continua igual: abrir e fechar não quebra nada
  await p.locator('.quest[data-q] .msgo').first().click();await p.waitForTimeout(300);
  ok(`${tag}: toque no ▶ abre a Missão`,await p.evaluate(()=>!document.getElementById('msSheet').hidden));
  await p.keyboard.press('Escape');await p.waitForTimeout(300);
  ok(`${tag}: sem rolagem lateral`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  ok(`${tag}: sem erro de JS`,!errs.length,errs.join(' | '));
  await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
