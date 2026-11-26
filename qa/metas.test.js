// Modo Criador: metas com prazo (+1/−1 sobe para a planilha), plano de hoje e prioridade da semana.
// Rode com: python3 -m http.server 8000 & node qa/metas.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));};
const SID='AKfycbTESTE_1234567890abcdefghij';
const dk=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const now=new Date(),plus=n=>{const d=new Date(now);d.setDate(d.getDate()+n);return dk(d);};
const SHEET={config:{version:3,name:'Teste',startDate:dk(now),
  quests:[{id:'q1',title:'Tarefa principal',xp:30,stat:'vendas',main:true},{id:'q2',title:'Tarefa extra',xp:10,stat:'foco'},{id:'q_gym',title:'Treino',xp:25,stat:'corpo'}],
  goals:[{id:'g1',t:'Meta perto',due:plus(2),of:1,unit:'contrato'},{id:'g2',t:'Meta longe',due:plus(20),of:2,n:1},{id:'g3',t:'Treino na semana',of:3,quest:'q_gym',unit:'treinos'}],
  focus:['Prioridade A','Prioridade B']},
 progress:{log:{[dk(now)]:[{q:'q2',kind:'full',xp:10,stat:'foco',bonus:0,t:'x'},{q:'q_gym',kind:'full',xp:25,stat:'corpo',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{a_first:dk(now)},rpg:{cls:{id:'empreendedor',style:'real',name:'Empreendedor',stat:'vendas'}},updatedAt:'2026-11-20T10:00:00.000Z'}};
async function clear(p){for(let i=0;i<10;i++){const m=p.locator('.sysmodal button.go');if(await m.count()&&await m.first().isVisible()){await m.first().dispatchEvent('click');await p.waitForTimeout(80);continue;}if(await p.locator('#levelup').isVisible()){await p.locator('#luClose').dispatchEvent('click');continue;}break;}}
(async()=>{const b=await chromium.launch();
 for(const vp of [{n:'iPhone',w:390,h:844},{n:'Android',w:412,h:915}]){
  const ctx=await b.newContext({viewport:{width:vp.w,height:vp.h}});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  let last=null;await ctx.route('https://script.google.com/**',async r=>{const q=r.request();
    if(q.method()==='POST'){try{last=JSON.parse(q.postData()).progress;}catch(e){}return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});}
    return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(SHEET)});});
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nv\n'}));
  p.on('dialog',d=>d.accept());await p.goto(U+'#s='+SID);await p.waitForTimeout(2500);await clear(p);
  await p.evaluate(()=>document.querySelector('#tabbar [data-go="criador"]').click());await p.waitForTimeout(400);await clear(p);
  const box=p.locator('#mtBox');ok(vp.n+': caixa de metas no Criador',await box.isVisible());
  const names=await p.locator('#mtBox .mtgoal b').allTextContents();
  ok(vp.n+': metas em ordem de prazo',names[0]==='Meta perto'&&names[1]==='Meta longe',names.join('/'));
  ok(vp.n+': prazo perto fica em destaque',await p.locator('#mtBox .mtgoal.hot').count()===1);
  ok(vp.n+': conta dias',/faltam 2 dias/.test(await p.locator('#mtBox .mtgoal').first().innerText()));
  ok(vp.n+': meta por tarefa conta a semana',/1 de 3 treinos/.test(await p.locator('#mtBox .mtgoal[data-id="g3"]').innerText()));
  ok(vp.n+': meta por tarefa sem +1',await p.locator('#mtBox .mtgoal[data-id="g3"] button').count()===0);
  ok(vp.n+': progresso inicial da planilha',/1 de 2/.test(await p.locator('#mtBox .mtgoal[data-id="g2"]').innerText()));
  await p.locator('#mtBox .mtgoal[data-id="g1"] button',{hasText:'+1'}).click();await p.waitForTimeout(300);
  ok(vp.n+': +1 bate a meta',/batida/.test(await p.locator('#mtBox .mtgoal[data-id="g1"]').innerText()));
  await p.locator('#mtBox .mtgoal[data-id="g1"] button',{hasText:'−1'}).click();await p.locator('#mtBox .mtgoal[data-id="g1"] button',{hasText:'−1'}).click();await p.waitForTimeout(200);
  ok(vp.n+': não fica negativo',/0 de 1/.test(await p.locator('#mtBox .mtgoal[data-id="g1"]').innerText()));
  await p.locator('#mtBox .mtgoal[data-id="g1"] button',{hasText:'+1'}).click();
  const gp=await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-prog')).gp);ok(vp.n+': ajuste salvo em prog.gp',gp&&gp.g1===1,JSON.stringify(gp));
  await p.waitForTimeout(4000);ok(vp.n+': ajuste sobe para a planilha',last&&last.gp&&last.gp.g1===1,JSON.stringify(last&&last.gp));
  const plan=await p.locator('#mtBox').innerText();
  ok(vp.n+': plano de hoje conta feitas',/Plano de hoje · 2 de 3/i.test(plan),plan.slice(0,300));
  ok(vp.n+': pendente aparece com estrela',/★ Tarefa principal/.test(plan));
  ok(vp.n+': feita não aparece na lista',!/Tarefa extra/.test(plan));
  ok(vp.n+': prioridade da semana',/Prioridade A/.test(plan)&&/Prioridade B/.test(plan));
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);ok(vp.n+': sem rolagem lateral',sw);
  const small=await p.evaluate(()=>[...document.querySelectorAll('#mtBox button')].filter(b=>b.getBoundingClientRect().height<44).length);ok(vp.n+': botões com 44px',small===0,String(small));
  await p.screenshot({path:'qa/shots-metas-'+vp.n+'.png',fullPage:false});
  await p.locator('#mtBox button.go').click();await p.waitForTimeout(300);
  ok(vp.n+': "Ir para a próxima" abre Hoje',await p.evaluate(()=>!!document.querySelector('#tabbar [data-go="hoje"].on, #tabbar [data-go="hoje"][aria-current], #tabbar [data-go="hoje"][aria-selected="true"]'))||await p.locator('section[data-tab="hoje"]').first().isVisible());
  ok(vp.n+': console sem erros',errs.length===0,errs.join(' | '));
  await ctx.close();}
 // jogador (/comecar) não tem metas nem Criador
 {const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(U+'comecar/');await p.waitForTimeout(1200);ok('comecar: sem caixa de metas',await p.locator('#mtBox').count()===0);ok('comecar: sem erros',errs.length===0,errs.join(' | '));await ctx.close();}
 await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
