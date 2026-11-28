// 🎨 Forja › "Dias de treino": o dia escolhido (.fjday.on) era texto branco sobre o ciano do HUD (#00d4ff) = 1,77:1, ilegível.
// Agora texto escuro: precisa >= 4,5:1 (WCAG AA) nas 2 rotas, celular e desktop, com e sem reduce-motion; dia desligado também legível;
// aria-pressed continua certo e tocar num dia liga/desliga sem perder os outros.
// Rode com: python3 -m http.server 8000 & node qa/forja-dias-contraste.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',profile:{age:'18 a 29'},quests:[{id:'q1',title:'Treino de 20 min',xp:20,stat:'corpo',main:true}]};
const PROG={log:{'2026-11-24':[{q:'q1',kind:'full',xp:20,stat:'corpo',bonus:0,t:'x'}]},ach:{a_first:'2026-11-01'},rpg:{cls:{id:'guerreiro',style:'fant',name:'Guerreiro',stat:'corpo'},seen:{foco:1,vendas:1,mente:1,corpo:1}},simple:{off:'2026-11-01'},velho:'fica'};
async function abre(b,route,pre,vp,rm){const ctx=await b.newContext({viewport:vp,reducedMotion:rm?'reduce':'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route(/fonts|docs\.google|script\.google/,r=>r.fulfill({status:200,body:''}));
  await p.clock.install({time:new Date('2026-11-28T10:00:00-03:00')});await p.goto(U+'privacidade/');
  await p.evaluate(([c,o,k])=>{localStorage.setItem(k+'-cfg',JSON.stringify(c));localStorage.setItem(k+'-prog',JSON.stringify(o));localStorage.setItem(k+'-season','2');localStorage.setItem(k+'-tele','{"asked":1}');
    for(const x of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide','ascensao-news'])localStorage.setItem(x,'9');},[CFG,PROG,pre]);
  await p.goto(U+route);await p.clock.runFor(3500);
  for(let i=0;i<8;i++){const n=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal:not([hidden]):not(#clsModal) button, #levelup:not([hidden]) #luClose')].find(x=>x.getClientRects().length);if(m){m.click();return 1;}return 0;});if(!n)break;await p.clock.runFor(300);}
  return {ctx,p,errs};}
const ratio=(p,sel)=>p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const P=c=>c.match(/[\d.]+/g).map(Number);
  const L=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
  let a=e,bg;while(a&&a.nodeType===1){const c=P(getComputedStyle(a).backgroundColor);if(c.length<4||c[3]>.5){bg=c.slice(0,3);break}a=a.parentElement}bg=bg||[2,7,13];
  const c=P(getComputedStyle(e).color),al=c[3]===undefined?1:c[3],fc=c.slice(0,3).map((v,i)=>v*al+bg[i]*(1-al));const l1=L(fc),l2=L(bg);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);},sel);
(async()=>{const b=await chromium.launch();
for(const [route,pre,tag] of [['comecar/','asc-u','/comecar/'],['','ascensao','raiz']])for(const [vp,vt] of [[{width:390,height:844},'celular'],[{width:1280,height:800},'desktop']])for(const rm of [false,true]){
  const T=tag+' '+vt+(rm?' reduce':'');const {ctx,p,errs}=await abre(b,route,pre,vp,rm);
  ok(T+': tem dias de treino na tela',await p.locator('.fjday').count()>=7);
  const on=await ratio(p,'.fjday.on'),off=await ratio(p,'.fjday:not(.on)');
  ok(T+': dia escolhido com contraste >= 4,5:1',on>=4.5,'contraste '+(on&&on.toFixed(2)));
  ok(T+': dia livre com contraste >= 4,5:1',off>=4.5,'contraste '+(off&&off.toFixed(2)));
  const pr=await p.evaluate(()=>[...document.querySelectorAll('.fjday')].every(x=>x.getAttribute('aria-pressed')===(x.classList.contains('on')?'true':'false')));
  ok(T+': aria-pressed bate com o dia ligado',pr);
  if(vt==='celular'&&!rm){const before=await p.evaluate(()=>[...document.querySelectorAll('.fjday.on')].map(x=>x.dataset.d).join());
    await p.evaluate(()=>{const x=document.querySelector('.fjday:not(.on)');x.click();});await p.clock.runFor(600);
    const after=await p.evaluate(()=>[...document.querySelectorAll('.fjday.on')].map(x=>x.dataset.d).join());
    ok(T+': tocar num dia liga ele e mantém os outros',after.split(',').length===before.split(',').length+1&&before.split(',').every(d=>after.split(',').includes(d)),before+' → '+after);
    const on2=await ratio(p,'.fjday.on');ok(T+': contraste continua depois do toque',on2>=4.5,on2&&on2.toFixed(2));
    const s=await p.evaluate(k=>JSON.parse(localStorage.getItem(k+'-prog')),pre);ok(T+': campo antigo intacto',s.velho==='fica'&&s.log['2026-11-24'].length===1);}
  ok(T+': console limpo',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})().catch(e=>{console.error(e);process.exit(1)});
