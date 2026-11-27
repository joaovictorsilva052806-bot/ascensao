// Teclado nas janelas que abrem por toque e só têm saída segura (Fechar/Voltar/Escolher depois):
// card de jogador (avatar no topo de Hoje) e galeria de classes + confirmação (Progresso › Classe ⇄).
// Esc faz o mesmo que o botão de saída marcado com data-esc (tools/dialogo.js) e o foco volta para quem abriu.
// Na confirmação de classe, Esc só volta para a galeria (não troca nada). A classe salva não muda.
// Antes: Esc não fazia nada nessas janelas (só o toque fechava).
// Rode com: python3 -m http.server 8000 & node qa/esc-janelas.test.js
const {chromium}=require('playwright');const BASE=process.env.BASE||'http://localhost:8000';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 páginas',xp:10,stat:'mente',main:true},{id:'q2',title:'Caminhar',xp:10,stat:'corpo'}]};
const PROG=()=>({log:{'2026-11-26':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago',stat:'mente'},cg:1,ct0:Date.parse('2026-11-27T19:00:00')},simple:{off:'2026-11-21'},rank:{on:false,asked:true},friends:{l:[],seen:{}}});
(async()=>{const b=await chromium.launch();
for(const [nome,url,P] of [['comecar',BASE+'/comecar/','asc-u-'],['raiz',BASE+'/','ascensao-']])for(const rm of ['no-preference','reduce']){const tag=nome+' '+rm;
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm});
  await ctx.route('https://**',r=>r.fulfill({status:200,body:''}));
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-27T19:30:00')});
  await p.goto(BASE+'/privacidade/');
  await p.evaluate(([c,o,P])=>{localStorage.setItem(P+'cfg',JSON.stringify(c));localStorage.setItem(P+'prog',JSON.stringify(o));localStorage.setItem(P+'season','2');
    if(P==='asc-u-'){localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));}},[CFG,PROG(),P]);
  await p.goto(url);await p.waitForTimeout(1500);
  for(let i=0;i<8;i++){const n=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal')].find(x=>x.getClientRects().length);if(!m)return 0;const g=m.querySelector('button.ghost')||m.querySelector('button.go');if(g)g.click();else m.remove();return 1;});if(!n)break;await p.waitForTimeout(400);}
  const vis=s=>p.evaluate(s=>[...document.querySelectorAll(s)].some(x=>x.getClientRects().length),s);
  const ae=()=>p.evaluate(()=>{const a=document.activeElement;return {tag:a.tagName,id:a.id,txt:(a.textContent||'').trim().slice(0,30)};});
  const foca=s=>p.evaluate(s=>{const x=document.querySelector(s);if(!x||!x.getClientRects().length)return false;x.scrollIntoView({block:'center'});x.focus();return document.activeElement===x;},s);
  // 1) card de jogador: Enter no avatar abre, Esc fecha, foco volta
  ok(`${tag}: avatar do topo recebe foco`,await foca('#heroAv'));
  await p.keyboard.press('Enter');await p.waitForTimeout(500);
  ok(`${tag}: card de jogador abriu`,await vis('.cdmodal'));
  await p.keyboard.press('Escape');await p.waitForTimeout(400);
  ok(`${tag}: Esc fecha o card`,!(await vis('.cdmodal')));
  let a=await ae();ok(`${tag}: foco volta para o avatar`,a.id==='heroAv',JSON.stringify(a));
  // toque continua igual
  await p.evaluate(()=>document.getElementById('heroAv').click());await p.waitForTimeout(400);
  ok(`${tag}: toque abre o card`,await vis('.cdmodal'));
  await p.evaluate(()=>document.querySelector('.cdmodal .cdclose').click());await p.waitForTimeout(300);
  ok(`${tag}: Fechar fecha o card`,!(await vis('.cdmodal')));
  // 2) galeria de classes + confirmação
  await p.evaluate(()=>document.querySelector('#tabbar [data-go="prog"]').click());await p.waitForTimeout(400);
  const cb='#avPanel button.ghost';
  ok(`${tag}: botão Classe ⇄ recebe foco`,await foca(cb));
  await p.keyboard.press('Enter');await p.waitForTimeout(500);
  ok(`${tag}: galeria de classes abriu`,await vis('#clsModal'));
  await p.evaluate(()=>{const g=document.querySelector('#clsModal .clsbtn2:not(.cur)');if(g)g.click();});await p.waitForTimeout(400);
  ok(`${tag}: confirmação abriu`,await vis('.clscf'));
  await p.keyboard.press('Escape');await p.waitForTimeout(400);
  ok(`${tag}: Esc na confirmação só volta (galeria continua)`,!(await vis('.clscf'))&&await vis('#clsModal'));
  await p.keyboard.press('Escape');await p.waitForTimeout(400);
  ok(`${tag}: Esc fecha a galeria`,!(await vis('#clsModal')));
  a=await ae();ok(`${tag}: foco volta para Classe ⇄`,/Classe/.test(a.txt),JSON.stringify(a));
  const cls=await p.evaluate(P=>JSON.parse(localStorage.getItem(P+'prog')).rpg.cls,P);
  ok(`${tag}: classe salva não mudou`,cls&&cls.id==='mago'&&cls.name==='Mago',JSON.stringify(cls));
  // galeria abre de novo (trava clsGalOpen liberada)
  await p.evaluate(s=>document.querySelector(s).click(),cb);await p.waitForTimeout(400);
  ok(`${tag}: galeria reabre depois do Esc`,await vis('#clsModal'));
  await p.keyboard.press('Escape');await p.waitForTimeout(300);
  await p.keyboard.press('Escape');await p.waitForTimeout(100);
  ok(`${tag}: sem rolagem lateral`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  ok(`${tag}: sem erro de JS`,!errs.length,errs.join(' | '));
  await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
