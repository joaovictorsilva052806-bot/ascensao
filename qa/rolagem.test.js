// Reduce-motion na ROLAGEM: os atalhos que levam a um painel (ficha do personagem, guia, chefão, turma, avatar...)
// usavam scrollIntoView/scrollTo com behavior:"smooth", e o navegador não desliga essa animação sozinho.
// Com reduce-motion ligado, a rolagem tem de ser um salto (1 evento de scroll); sem reduce-motion, continua suave.
// Antes (até a main 0418169) a tela deslizava mesmo com "reduzir movimento".
// Raiz e /comecar/, celular 390x844, console limpo, campo antigo intacto.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/rolagem.test.js
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'q2',title:'Treino 20 min',xp:20,stat:'corpo',main:true}]};
const PROG={log:{},extra:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1,seen:{foco:1,vendas:1,mente:1,corpo:1}},simple:{off:'2026-11-01'},velho:'fica'};
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
async function drain(p){for(let i=0;i<12;i++){const m=p.locator('.sysmodal:visible button.go');if(!(await m.count()))return;await m.first().dispatchEvent('click');await p.waitForTimeout(250);}}
// conta os eventos de scroll durante a rolagem disparada por fn (no navegador)
const medir=(p,modo)=>p.evaluate(async modo=>{window.scrollTo(0,0);await new Promise(r=>setTimeout(r,200));let n=0;const on=()=>n++;addEventListener('scroll',on);
  if(modo==='el'){const s=[...document.querySelectorAll('.wrap section')].filter(x=>x.getClientRects().length).pop();s.scrollIntoView({block:'start',behavior:'smooth'});}
  else window.scrollTo({top:document.documentElement.scrollHeight,behavior:'smooth'});
  await new Promise(r=>setTimeout(r,1200));removeEventListener('scroll',on);return {n,y:Math.round(scrollY)};},modo);
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']])for(const rm of ['reduce','no-preference']){
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/,r=>r.abort());
  await p.goto(U+route);
  await p.evaluate(([c,o,pre])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');
    for(const [k,v] of [['perm','1'],['intro','1'],['news','99'],['tele','{"asked":1}']])localStorage.setItem(pre+'-'+k,v);},[CFG,PROG,pre]);
  await p.reload();await p.waitForTimeout(1500);await drain(p);await p.waitForTimeout(800);await drain(p);
  await p.evaluate(()=>{for(const m of document.querySelectorAll('#tlModal'))m.remove();});
  const tag=(route||'/')+(rm==='reduce'?' (reduce-motion)':' (normal)')+': ';const red=rm==='reduce';
  const alto=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight);ok(tag+'página rola (altura extra '+alto+' px)',alto>600,String(alto));
  // 1) scrollIntoView({behavior:"smooth"}) num painel lá embaixo
  const a=await medir(p,'el');
  ok(tag+'scrollIntoView chegou ao painel (y='+a.y+')',a.y>300,JSON.stringify(a));
  ok(tag+(red?'scrollIntoView é salto (1 evento)':'scrollIntoView continua suave (vários eventos)'),red?a.n<=1:a.n>=3,JSON.stringify(a));
  // 2) window.scrollTo({behavior:"smooth"})
  const w=await medir(p,'win');
  ok(tag+(red?'scrollTo é salto (1 evento)':'scrollTo continua suave'),(red?w.n<=1:w.n>=3)&&w.y>300,JSON.stringify(w));
  // 3) caminho real: "Ficha do personagem" abre e rola a ficha para a tela; com reduce-motion, sem deslizar
  const tg=p.locator('#hrTog');
  if(await tg.count()&&await tg.isVisible()){
    await p.evaluate(()=>{const t=document.getElementById('hrTog');window.scrollTo(0,0);const r=t.getBoundingClientRect();window.scrollTo(0,Math.max(0,scrollY+r.top-innerHeight+60));});
    await p.waitForTimeout(300);
    const r=await p.evaluate(async()=>{let n=0;const y0=scrollY;const on=()=>n++;addEventListener('scroll',on);document.getElementById('hrTog').click();await new Promise(r=>setTimeout(r,1200));removeEventListener('scroll',on);
      const b=document.getElementById('hrBox').getBoundingClientRect();return {n,dy:Math.round(scrollY-y0),ini:Math.round(b.top),fim:Math.round(b.bottom),h:innerHeight};});
    ok(tag+'ficha abre e sobe para a tela (topo '+r.ini+', fim '+r.fim+')',r.ini>=0&&r.ini<r.h*0.6&&r.fim<=r.h+24,JSON.stringify(r));
    if(red)ok(tag+'ficha: rolagem em salto, sem deslizar ('+r.n+' evento)',r.dy>0&&r.n<=1,JSON.stringify(r));
    else ok(tag+'ficha: rolagem suave mantida',r.dy>0&&r.n>=3,JSON.stringify(r));
    await p.locator('#hrTog').click();
  }else ok(tag+'botão da ficha visível',false);
  const pr=await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-prog')||'{}'),pre);
  ok(tag+'campo antigo intacto',pr.velho==='fica'&&pr.rpg&&pr.rpg.cls&&pr.rpg.cls.id==='mago',JSON.stringify(pr).slice(0,120));
  ok(tag+'console sem erro',!errs.length,errs.join(' | '));
  await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${R.length-f}/${R.length} passaram`);process.exit(f?1:0);})();
