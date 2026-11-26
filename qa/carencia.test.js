// Carência da dívida (tools/base.html, DEBT_GRACE=3): nos 3 primeiros dias de jogo nenhuma quest principal gera "Dívida".
// Antes: quem começava às 21h e fazia 1 das 2 principais acordava no dia 2 com "Dívida: −10 XP".
// Depois do 3º dia a regra volta igual (dia 5 com dia em branco = dívida). Nenhum campo salvo muda.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/carencia.test.js
const {chromium}=require('playwright');const U='http://127.0.0.1:8000/comecar/';const R=[];
const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const noise=t=>/TUNNEL|fonts\.g|docs\.google|Failed to load resource|vibrate/.test(t);
const CFG={version:3,name:'Teste',startDate:'2026-11-24',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'q2',title:'Treinar',xp:20,stat:'corpo',main:true}]};
const PROG={log:{'2026-11-24':[{q:'q1',xp:10,t:Date.parse('2026-11-24T21:30:00-03:00')}]},rpg:{cls:'mago'},gd:{off:1}};
async function abre(b,iso){const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:'America/Sao_Paulo'});
  await ctx.addInitScript(([c,g])=>{if(!localStorage.getItem('asc-u-cfg')){localStorage.setItem('asc-u-cfg',c);localStorage.setItem('asc-u-prog',g);localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));}},[JSON.stringify(CFG),JSON.stringify(PROG)]);
  const p=await ctx.newPage();p.on('console',m=>{if(m.type()==='error'&&!noise(m.text()))errs.push(m.text());});p.on('pageerror',e=>errs.push('PE '+e.message));
  await p.clock.install({time:new Date(iso)});await p.goto(U);await p.waitForTimeout(2000);
  const d=await p.evaluate(()=>{const e=document.getElementById('debt');return {vis:!!e&&!e.hidden&&e.getClientRects().length>0,txt:e?e.innerText:''};});
  return {ctx,p,d,errs};}
(async()=>{const b=await chromium.launch();
  {const {ctx,p,d,errs}=await abre(b,'2026-11-25T09:00:00-03:00');
   ok('dia 2: sem "Dívida" depois de fazer 1 de 2 principais no dia 1 (antes: −10 XP)',!d.vis,d.txt);
   const help=await p.evaluate(()=>document.body.innerHTML.includes('nos 3 primeiros dias não tem'));ok('"Como o jogo funciona" explica a carência',help);
   const g=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));ok('dado salvo intacto (log do dia 1 continua lá)',g.log&&g.log['2026-11-24']&&g.log['2026-11-24'][0].q==='q1');
   const c=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-cfg')));ok('cfg intacta (startDate e quests iguais)',c.startDate==='2026-11-24'&&c.quests.length===2);
   ok('dia 2: console limpo',!errs.length,errs.join(' | '));await ctx.close();}
  {const {ctx,d,errs}=await abre(b,'2026-11-26T09:00:00-03:00');ok('dia 3: ainda sem dívida (dia 2 em branco)',!d.vis,d.txt);ok('dia 3: console limpo',!errs.length,errs.join(' | '));await ctx.close();}
  {const {ctx,d,errs}=await abre(b,'2026-11-28T09:00:00-03:00');ok('dia 5: dívida volta (dia 4 em branco conta)',d.vis&&/D[íi]vida/i.test(d.txt),d.txt);ok('dia 5: console limpo',!errs.length,errs.join(' | '));await ctx.close();}
  await b.close();console.log(R.join('\n'));const f=R.filter(r=>r.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
