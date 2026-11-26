// O ▶ da PRÓXIMA missão (o botão mais importante de Hoje) precisa ser legível: contraste ≥ 4.5:1
// entre o símbolo e o fundo do botão (WCAG 1.4.3). Antes: branco sobre ciano, 1.77:1.
// Raiz e /comecar/, celular 390x844. Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/proxima-contraste.test.js
const {chromium}=require('playwright');const U=process.env.U||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'q2',title:'Treinar',xp:20,stat:'corpo',main:true}]};
const PROG={log:{},extra:{},ach:{a_first:'2026-11-01'},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1},simple:{off:'2026-11-01'}};
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  for(const motion of ['no-preference','reduce']){
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:motion});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/,r=>r.abort());
  await p.clock.install({time:new Date('2026-11-26T10:00:00')});await p.goto(U+route);
  await p.evaluate(([c,o,pre])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem(pre+'-tele',JSON.stringify({asked:'2026-11-01'}));},[CFG,PROG,pre]);
  await p.reload();await p.waitForTimeout(1500);
  for(let i=0;i<20;i++){await p.evaluate(()=>{const t=document.getElementById('tlModal');if(t){const g=t.querySelector('button.ghost');g?g.click():t.remove();}document.querySelectorAll('.sysmodal button.go').forEach(x=>x.click());const l=document.getElementById('luClose');if(l&&l.getClientRects().length)l.click();});await p.waitForTimeout(120);}
  const r=await p.evaluate(()=>{const L=c=>{const m=c.match(/[\d.]+/g).map(Number);return m.slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)};
    return [...document.querySelectorAll('#quests .quest.next .msgo')].map(e=>{const s=getComputedStyle(e);const a=L(s.color),bg=L(s.backgroundColor);return {cr:(Math.max(a,bg)+.05)/(Math.min(a,bg)+.05),name:e.getAttribute('aria-label')||'',bgA:(s.backgroundColor.match(/[\d.]+/g)[3]??'1')};});});
  const t=tag+' '+motion;
  ok(t+': há um ▶ na próxima missão',r.length===1,JSON.stringify(r));
  if(r[0]){ok(t+': fundo do ▶ é sólido',+r[0].bgA>.9,r[0].bgA);ok(t+': contraste do ▶ ≥ 4.5:1',r[0].cr>=4.5,r[0].cr.toFixed(2)+':1');ok(t+': ▶ tem nome acessível',/^Começar: /.test(r[0].name),r[0].name);}
  ok(t+': console limpo',errs.length===0,errs.join(' | '));
  await ctx.close();}}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
