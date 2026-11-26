// "Comece por aqui" respeita a idade: menor de 14 não tem ranking (regra do projeto),
// então o guia não pode mandar a criança "ver seu lugar no ranking" nem prometer que o desafio "sobe no ranking".
// 14+ continua igual. Raiz e /comecar/, celular 390x844, console limpo e dado antigo intacto.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/guia-idade.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=age=>({version:3,name:'Teste',startDate:'2026-11-01',profile:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'q2',title:'Treinar',xp:20,stat:'corpo',main:true}]});
const PROG={log:{},extra:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1},simple:{off:'2026-11-01'},velho:'fica'};
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']])for(const age of ['kid','teen','adult']){
  const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
  await p.clock.install({time:new Date('2026-11-26T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));},[CFG(age),PROG,pre]);
  await p.goto(U+route);await p.waitForSelector('#gdPanel',{state:'attached',timeout:8000});await p.waitForTimeout(400);
  const t=await p.$eval('#gdPanel',e=>e.textContent);const tag=(route||'/')+' '+age+': ';
  if(age==='kid'){ok(tag+'guia não fala de ranking',!/ranking/i.test(t),t);ok(tag+'passo 3 vira "Veja sua evolução"',/Veja sua evolução/.test(t),t);}
  else{ok(tag+'passo 3 continua no ranking',/Veja seu lugar no ranking/.test(t),t);ok(tag+'desafio ainda sobe no ranking',/sobe no ranking/.test(t),t);}
  // o passo 3 leva para Progresso nas três idades
  await p.evaluate(()=>{const b=[...document.querySelectorAll('#gdPanel .gdl button')][2];b.click();});await p.waitForTimeout(500);
  const g=await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-prog')||'{}'),pre);
  ok(tag+'passo 3 marca feito e mantém campo antigo',g.gd&&g.gd.rank===1&&g.velho==='fica',JSON.stringify(g.gd)+' '+g.velho);
  ok(tag+'console limpo',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
