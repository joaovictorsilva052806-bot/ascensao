// ⚔️ Torre do Véu (tools/torre.js, spec 5 da EVA): Arena com 100 andares. Curva nova, mini-chefe a cada 5, Guardião a cada 10, O Reflexo no 100,
// marcos fixos 1 vez só (ach:tw:<n> + orGive("tw:<n>")), migração para quem já tinha recorde, molduras fora do baú, painel e 320 px.
// Rode com: python3 -m http.server 8000 & node qa/torre.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',profile:{age:'18 a 29'},quests:[{id:'q1',title:'Treino de 20 min',xp:20,stat:'corpo',main:true}]};
const base=x=>Object.assign({log:{'2026-11-24':[{q:'q1',kind:'full',xp:20,stat:'corpo',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{a_first:'2026-11-01'},rpg:{cls:{id:'guerreiro',style:'fant',name:'Guerreiro',stat:'corpo'},seen:{foco:1,vendas:1,mente:1,corpo:1}},simple:{off:'2026-11-01'},velho:'fica'},x||{});
async function abre(b,prog,route='comecar/',pre='asc-u',vp){const ctx=await b.newContext({viewport:vp||{width:390,height:844}});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route(/fonts|docs\.google|script\.google/,r=>r.fulfill({status:200,body:''}));
  await p.clock.install({time:new Date('2026-11-26T15:00:00-03:00')});await p.goto(U+'privacidade/');
  await p.evaluate(([c,o,k])=>{localStorage.setItem(k+'-cfg',JSON.stringify(c));localStorage.setItem(k+'-prog',JSON.stringify(o));localStorage.setItem(k+'-season','2');localStorage.setItem(k+'-tele','{"asked":1}');
    for(const x of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide','ascensao-news'])localStorage.setItem(x,'9');},[CFG,prog,pre]);
  await p.goto(U+route);await p.clock.runFor(3500);
  for(let i=0;i<8;i++){const n=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal:not([hidden]):not(#clsModal) button, #levelup:not([hidden]) #luClose')].find(x=>x.getClientRects().length);if(m){m.click();return 1;}return 0;});if(!n)break;await p.clock.runFor(300);}
  await p.evaluate(()=>{const t=document.querySelector('#tabbar [data-go="prog"]');if(t)t.click();});await p.clock.runFor(500);return {ctx,p,errs};}
const st=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k+'-prog')),k);
(async()=>{const b=await chromium.launch();
for(const [route,pre,tag] of [['comecar/','asc-u','/comecar/'],['','ascensao','raiz']]){
  let {ctx,p,errs}=await abre(b,base(),route,pre);
  const F=await p.evaluate(()=>{const f=n=>arQA.foe(n);return {a100:f(100).ac,g10:f(10).guard,m15:f(15).mini,b15:f(15).boss,n1:f(1).name,n10:f(10).name,n100:f(100).name,hp1:f(1).hp,ac1:f(1).ac,hp100:f(100).hp,ac50:f(50).ac,n101:f(110).ac};});
  ok(tag+': andar 100 com defesa 32 (antes era 42, impossível)',F.a100===32,JSON.stringify(F));
  ok(tag+': andar 10 é Guardião, 15 é Elite (prêmio dobrado)',F.g10&&F.m15&&F.b15,JSON.stringify(F));
  ok(tag+': nomes (Eco, Guardião, O Reflexo)',/^Eco de /.test(F.n1)&&/^GUARDIÃO · Golem da Distração/.test(F.n10)&&F.n100==='O Reflexo',JSON.stringify(F));
  ok(tag+': curva da tabela (andar 50: defesa 22; 100: vida 160)',F.ac50===22&&F.hp100===160,JSON.stringify(F));
  ok(tag+': depois do 100 continua subindo (Infinito)',F.n101>F.a100,JSON.stringify(F));
  ok(tag+': painel "Torre do Véu · andar 1 de 100 · rank E"',/Torre do Véu/.test(await p.textContent('#arPanel'))&&/andar 1 de 100 · rank E/.test(await p.textContent('#arPanel')),await p.textContent('#arPanel .arhd'));
  ok(tag+': barra com 10 marcas de Guardião',await p.locator('#arPanel .twbar i').count()===10);
  ok(tag+': cor do rank no painel (--rk e tbrk-E)',await p.evaluate(()=>{const a=document.getElementById('arPanel');return a.classList.contains('tbrk-E')&&a.style.getPropertyValue('--rk')==='#9fb0c8';}));
  ok(tag+': próximo marco: andar 10, « Saiu do Porão »',/Próximo marco: andar 10, título « Saiu do Porão »/.test(await p.textContent('#arPanel')));
  ok(tag+': console limpo',!errs.length,errs.join(' | '));await ctx.close();
  // migração: recorde 37 sem marcos
  ({ctx,p,errs}=await abre(b,base({arena:{fl:38,best:37,w:40,l:3,day:{}}}),route,pre));await p.clock.runFor(1500);
  let s=await st(p,pre);const mk=Object.keys(s.arena.mk||{}).map(Number).sort((a,b)=>a-b);
  ok(tag+': recorde 37 ganha os marcos 5 a 35',JSON.stringify(mk)==='[5,10,15,20,25,30,35]',JSON.stringify(mk));
  const xp=id=>Object.values(s.log).flat().filter(e=>e.q==='ach:tw:'+id).reduce((a,e)=>a+e.xp,0);
  ok(tag+': XP dos marcos (10: 30, 15: 10, 30: 30)',xp(10)===30&&xp(15)===10&&xp(30)===30,JSON.stringify([xp(10),xp(15),xp(30)]));
  ok(tag+': títulos e moldura do 30',s.chest.titles.some(t=>t.id==='tw_porao')&&s.chest.titles.some(t=>t.id==='tw_eco')&&s.chest.frames.includes('tw_f_eco'),JSON.stringify(s.chest));
  ok(tag+': Ouro dos marcos 10, 20 e 30 (+60)',['tw:10','tw:20','tw:30'].every(k=>s.ouroX.got[k]!==undefined)&&s.ouroX.h.filter(h=>/Torre/.test(h.w)).reduce((a,h)=>a+h.v,0)===60,JSON.stringify({o:s.ouro,got:s.ouroX&&s.ouroX.got}));
  ok(tag+': andar atual não muda',s.arena.fl===38);
  const s1=JSON.stringify(s.arena.mk),o1=s.ouro;await p.reload();await p.clock.runFor(4000);s=await st(p,pre);
  ok(tag+': reabrir não paga de novo',JSON.stringify(s.arena.mk)===s1&&s.ouro===o1&&Object.values(s.log).flat().filter(e=>e.q==='ach:tw:10').length===1);
  ok(tag+': painel mostra rank C e 3 Guardiões acesos',/rank C/.test(await p.textContent('#arPanel'))&&await p.locator('#arPanel .twbar i.on').count()===3);
  ok(tag+': molduras da Torre fora do baú (marcadas)',await p.evaluate(()=>{const s=[...document.scripts].map(x=>x.text).join('');return /BX_FR\.filter\(f=>!f\[5\]/.test(s)&&/BX_FR\.push\(\[m\[3\],m\[4\],m\[5\],m\[6\],m\[7\],"torre"\]\)/.test(s);}));
  ok(tag+': 320 px sem rolagem lateral',await (p.setViewportSize({width:320,height:700}),p.clock.runFor(300),p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)));
  ok(tag+': console limpo (migração)',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})().catch(e=>{console.error(e);process.exit(1)});
