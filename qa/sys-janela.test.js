// Teclado e leitor de tela nas janelas do Sistema que o app abre sozinho (sysPop: check-in, sequência, conquista, classe, recompensa…; 40+ usos):
// Esc faz o mesmo que o botão (é a única saída) e o foco volta para quem abriu; o leitor de tela lê o texto da janela
// como descrição (aria-describedby), não só o título. Nome, foco e Tab vêm do tools/dialogo.js (conferidos aqui também).
// Antes: Esc não fazia nada (a janela ficava aberta cobrindo a tela) e o texto do Sistema não era lido ao abrir.
// Rode com: python3 -m http.server 8000 & node qa/sys-janela.test.js
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
  // fecha pelo próprio botão as janelas que abrem sozinhas (check-in etc.): remover do DOM travaria a fila sysQ
  for(let i=0;i<8;i++){const n=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal')].find(x=>x.getClientRects().length);if(!m)return 0;const g=m.querySelector('button.ghost')||m.querySelector('button.go');if(g)g.click();else m.remove();return 1;});if(!n)break;await p.waitForTimeout(400);}
  const ae=()=>p.evaluate(()=>{const a=document.activeElement;const m=a&&a.closest('.sysmodal');return {tag:a.tagName,id:a.id,cls:a.className,inSys:!!m&&!m.id};});
  const pop=()=>p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal')].find(x=>!x.id&&x.getClientRects().length);if(!m)return null;
    const txt=k=>(m.getAttribute(k)||'').split(/\s+/).map(i=>document.getElementById(i)).filter(Boolean).map(e=>e.textContent).join(' ');
    return {modal:m.getAttribute('aria-modal'),role:m.getAttribute('role'),nome:txt('aria-labelledby'),desc:txt('aria-describedby'),btn:m.querySelector('button.go').textContent};});
  const foca=s=>p.evaluate(s=>{const x=document.querySelector(s);if(!x||!x.getClientRects().length)return false;x.scrollIntoView({block:'center'});x.focus();return document.activeElement===x;},s);
  // 1) teclado: Enter no 🔥 abre a janela do Sistema "SEQUÊNCIA"
  ok(`${tag}: selo 🔥 recebe foco`,await foca('#streak'));
  await p.keyboard.press('Enter');await p.waitForTimeout(500);
  let j=await pop();ok(`${tag}: janela do Sistema abriu`,!!j);
  if(j){ok(`${tag}: janela é role=dialog e aria-modal`,j.role==='dialog'&&j.modal==='true',JSON.stringify(j));
    ok(`${tag}: janela tem nome (título)`,j.nome.length>0,JSON.stringify(j));
    ok(`${tag}: janela tem descrição (texto)`,j.desc.length>10,JSON.stringify(j));}
  let a=await ae();ok(`${tag}: foco entra no botão da janela`,a.inSys&&a.tag==='BUTTON',JSON.stringify(a));
  await p.keyboard.press('Tab');await p.waitForTimeout(100);a=await ae();ok(`${tag}: Tab não sai da janela`,a.inSys,JSON.stringify(a));
  await p.keyboard.press('Shift+Tab');await p.waitForTimeout(100);a=await ae();ok(`${tag}: Shift+Tab não sai da janela`,a.inSys,JSON.stringify(a));
  await p.keyboard.press('Escape');await p.waitForTimeout(400);
  ok(`${tag}: Esc fecha a janela`,!(await pop()));
  a=await ae();ok(`${tag}: foco volta para o 🔥`,a.id==='streak',JSON.stringify(a));
  // 2) toque continua igual: abre e fecha pelo botão
  await p.locator('#streak').click({timeout:3000}).catch(()=>{});await p.waitForTimeout(500);
  ok(`${tag}: toque no 🔥 abre a janela`,!!(await pop()));
  await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal')].find(x=>!x.id&&x.getClientRects().length);if(m)m.querySelector('button.go').click();});await p.waitForTimeout(400);
  ok(`${tag}: botão fecha a janela`,!(await pop()));
  // 3) Esc sem janela continua sem efeito e sem erro
  await p.keyboard.press('Escape');await p.waitForTimeout(100);
  ok(`${tag}: sem rolagem lateral`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  ok(`${tag}: sem erro de JS`,!errs.length,errs.join(' | '));
  await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
