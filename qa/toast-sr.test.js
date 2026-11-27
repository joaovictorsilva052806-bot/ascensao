// Leitor de tela: todo toast ("+XP", "Convite enviado", conquista...) é anunciado por uma região viva fixa (#toastSr, role=status).
// O #toast visual aparece/some com hidden, então sozinho ele não é anunciado. Vale no /comecar/ e no app da raiz.
// Rode com: python3 -m http.server 8000 & node qa/toast-sr.test.js
const {chromium}=require('playwright');const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 páginas',xp:10,stat:'mente',main:true},{id:'q2',title:'Caminhar',xp:10,stat:'corpo'}]};
const PROG=()=>({log:{'2026-11-26':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},simple:{off:'2026-11-21'},rank:{on:false,asked:true},friends:{l:[],seen:{}}});
const ROUTES=[['comecar','http://localhost:8000/comecar/','asc-u-'],['raiz','http://localhost:8000/','ascensao-']];
(async()=>{const b=await chromium.launch();
for(const [nome,url,pre] of ROUTES)for(const rm of ['no-preference','reduce']){const tag=`${nome} ${rm}`;
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm});
  await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,contentType:'text/csv',body:'nome,xp\n'}));
  await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,body:''}));
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-27T15:30:00')});
  // semente numa página sem o app (mesma origem), depois abre o app
  await p.goto('http://localhost:8000/privacidade/');
  await p.evaluate(([c,o,pre])=>{const P=pre==='asc-u-'?'asc-u-':'ascensao-';localStorage.setItem(P+'cfg',JSON.stringify(c));localStorage.setItem(P+'prog',JSON.stringify(o));localStorage.setItem(P+'season','2');
    if(P==='asc-u-'){localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));}},[CFG,PROG(),pre]);
  await p.goto(url);await p.waitForTimeout(1500);
  const sr=await p.evaluate(()=>{const s=document.getElementById('toastSr');if(!s)return null;const r=s.getBoundingClientRect();return {role:s.getAttribute('role'),live:s.getAttribute('aria-live'),atomic:s.getAttribute('aria-atomic'),hidden:s.hidden,w:r.width,h:r.height};});
  ok(`${tag}: região viva #toastSr existe`,!!sr);
  ok(`${tag}: role=status, aria-live=polite, aria-atomic`,sr&&sr.role==='status'&&sr.live==='polite'&&sr.atomic==='true'&&!sr.hidden,JSON.stringify(sr));
  ok(`${tag}: região viva invisível (1 px, não ocupa tela)`,sr&&sr.w<=1&&sr.h<=1,JSON.stringify(sr));
  // dispara um toast de verdade: marca uma quest
  await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.hidden=true));
  const clicou=await p.evaluate(()=>{const x=document.querySelector('[data-q=q2] .done,[data-q=q2] button.go');if(!x)return false;x.click();return true;});
  ok(`${tag}: quest marcada`,clicou);
  await p.waitForTimeout(400);
  const r=await p.evaluate(()=>({t:document.getElementById('toast').textContent,vis:!document.getElementById('toast').hidden,s:(document.getElementById('toastSr')||{}).textContent||''}));
  ok(`${tag}: toast visual apareceu`,r.vis&&r.t.length>0,JSON.stringify(r));
  ok(`${tag}: leitor de tela recebe o mesmo texto do toast`,r.s.length>0&&r.t.startsWith(r.s),JSON.stringify(r));
  // segundo toast: a região esvazia e reenche (é isso que faz o leitor falar de novo, mesmo com texto igual)
  await p.evaluate(()=>{const s=document.getElementById('toastSr');window.__seen=[];if(!s)return;new MutationObserver(()=>window.__seen.push(s.textContent)).observe(s,{childList:true,characterData:true,subtree:true});});
  await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.hidden=true));
  const cl2=await p.evaluate(()=>{const x=document.querySelector('#toast .ntundo');if(!x)return false;x.click();return true;});
  await p.waitForTimeout(400);
  const rep=await p.evaluate(()=>({seen:window.__seen,t:document.getElementById('toast').textContent}));
  ok(`${tag}: "Desfazer" do toast é anunciado (região esvazia e reenche)`,cl2&&rep.seen.includes('')&&rep.seen.includes('Desfeito.'),JSON.stringify(rep));
  // some sozinho depois
  await p.clock.runFor(7000);
  ok(`${tag}: região esvazia depois`,await p.evaluate(()=>(document.getElementById('toastSr')||{}).textContent==='' ));
  ok(`${tag}: sem rolagem lateral`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  ok(`${tag}: sem erro de JS`,!errs.length,errs.join(' | '));
  await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
