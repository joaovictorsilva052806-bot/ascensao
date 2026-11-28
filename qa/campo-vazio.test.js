// 1ª abertura (/comecar/): tocar em "Bora" com o nome vazio, ou em "Gerar meu jogo" sem foco nem meta.
// Antes: só um tremor no campo (que some com reduce-motion) e nada para o leitor de tela: parecia botão quebrado.
// Confere: aparece um aviso curto em texto ligado ao campo (aria-invalid + aria-describedby, aria-live), some ao digitar,
// o fluxo segue normal depois; celular e desktop, com e sem reduce-motion; sem erro de JS.
// Rode com: python3 -m http.server 8000 & node qa/campo-vazio.test.js
const {chromium}=require('playwright');const BASE=process.env.BASE||'http://localhost:8000';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const err=(p,id)=>p.evaluate(id=>{const i=document.getElementById(id),e=document.getElementById(id+'Err');
  return {inv:i.getAttribute('aria-invalid'),desc:i.getAttribute('aria-describedby'),txt:e&&!e.hidden&&e.getClientRects().length?e.textContent:'',live:e&&e.getAttribute('aria-live'),foco:document.activeElement&&document.activeElement.id};},id);
(async()=>{const b=await chromium.launch();
for(const [vp,nm] of [[{width:390,height:844},'celular'],[{width:1280,height:800},'desktop']])for(const rm of ['no-preference','reduce']){const tag=nm+' '+rm;
  const ctx=await b.newContext({viewport:vp,reducedMotion:rm});
  await ctx.route('https://**',r=>r.fulfill({status:200,body:''}));
  await ctx.addInitScript(()=>{try{localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));}catch(e){}});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(BASE+'/comecar/');await p.waitForTimeout(1200);await p.click('#q_perm');await p.waitForTimeout(500);
  let e=await err(p,'q_name');ok(`${tag}: nome começa sem aviso`,!e.txt&&e.inv!=='true',JSON.stringify(e));
  await p.click('#q_n0');await p.waitForTimeout(300);e=await err(p,'q_name');
  ok(`${tag}: "Bora" vazio mostra aviso em texto`,/nome/i.test(e.txt),JSON.stringify(e));
  ok(`${tag}: campo marcado aria-invalid e ligado ao aviso`,e.inv==='true'&&e.desc==='q_nameErr'&&e.live==='polite',JSON.stringify(e));
  ok(`${tag}: foco fica no campo nome`,e.foco==='q_name',JSON.stringify(e));
  ok(`${tag}: não avança com nome vazio`,await p.isVisible('#q_name'));
  await p.keyboard.type('Teste');await p.waitForTimeout(200);e=await err(p,'q_name');
  ok(`${tag}: digitar some com o aviso`,!e.txt&&e.inv!=='true'&&!e.desc,JSON.stringify(e));
  await p.click('#q_n0');await p.click('button:has-text("18 a 29")');await p.click('button:has-text("Faculdade")');
  for(let i=0;i<8&&!(await p.$('#q_done:visible'));i++){const sk=await p.$('button:visible:has-text("Pular")');if(sk)await sk.click();await p.waitForTimeout(350);}
  // tira todos os focos pré-marcados e tenta gerar sem meta
  await p.evaluate(()=>{for(const x of document.querySelectorAll('#q_focus .on'))x.click();});
  await p.click('#q_done');await p.waitForTimeout(300);e=await err(p,'q_goal');
  ok(`${tag}: sem foco nem meta mostra aviso`,/foco|meta/i.test(e.txt)&&e.inv==='true'&&e.desc==='q_goalErr',JSON.stringify(e));
  ok(`${tag}: não gera o jogo sem foco nem meta`,await p.isVisible('#q_done'));
  await p.evaluate(()=>document.querySelector('#q_focus button').click());await p.waitForTimeout(200);e=await err(p,'q_goal');
  ok(`${tag}: tocar num foco some com o aviso`,!e.txt&&e.inv!=='true',JSON.stringify(e));
  await p.click('#q_done');await p.waitForTimeout(2600);
  ok(`${tag}: com foco, o jogo é gerado`,!(await p.isVisible('#q_done')));
  ok(`${tag}: nome salvo`,await p.evaluate(()=>JSON.stringify(localStorage).includes('Teste')));
  ok(`${tag}: sem rolagem lateral`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  ok(`${tag}: sem erro de JS`,!errs.length,errs.join(' | '));
  await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
