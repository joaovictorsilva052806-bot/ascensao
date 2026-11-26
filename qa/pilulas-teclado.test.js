// Pílulas do topo da aba Hoje (sequência, escudo e classe) funcionam no teclado.
// Antes (até a main 4c31172) a pílula da classe ("⚔️ Mago ⇄") tinha role=button e tabindex,
// mas só ouvia o clique: no teclado ela recebia foco e Enter/Espaço não faziam nada.
// Agora Enter e Espaço abrem a galeria de classes, igual ao toque. O toque continua igual.
// Raiz e /comecar/, celular 390x844, com e sem reduce-motion, console limpo, campo antigo intacto.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/pilulas-teclado.test.js
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]};
const PROG={log:{},extra:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1},simple:{off:'2026-11-01'},velho:'fica'};
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
const aberto=p=>p.evaluate(()=>{const m=document.getElementById('clsModal');return !!(m&&!m.hidden&&m.getClientRects().length);});
const fechaTudo=async p=>{for(let k=0;k<10;k++){const n=await p.evaluate(()=>{const o=[...document.querySelectorAll('.sysmodal,.levelup')].filter(x=>!x.hidden&&x.getClientRects().length);if(!o.length)return 0;const x=o[o.length-1];
  if(x.id==='tlModal'){x.remove();return 1;}if(x.id==='clsModal'){x.remove();return 1;}const g=x.querySelector('#luClose,button.go,button.ghost');g&&g.click();return 1;});if(!n)break;await p.waitForTimeout(400);}};
const limpaCls=p=>p.evaluate(()=>{const m=document.getElementById('clsModal');if(m){const g=[...m.querySelectorAll('button')].find(b=>/fechar|agora não|voltar|cancelar|×|✕/i.test(b.textContent+(b.getAttribute('aria-label')||'')));if(g)g.click();else m.remove();}});
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']])for(const rm of ['no-preference','reduce']){
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
  await p.clock.install({time:new Date('2026-11-26T10:00:00')});await p.goto(U+route);
  await p.evaluate(([c,o,pre])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));},[CFG,PROG,pre]);
  await p.reload();await p.waitForTimeout(1500);await fechaTudo(p);const tag=(route||'/')+(rm==='reduce'?' (reduce-motion)':'')+': ';
  const cp=await p.evaluate(()=>{const e=document.getElementById('clsPill');return e?{vis:!!e.getClientRects().length&&!e.hidden,role:e.getAttribute('role'),tab:e.tabIndex,txt:e.textContent.trim()}:null;});
  ok(tag+'pílula da classe visível e focável ("'+(cp&&cp.txt)+'")',cp&&cp.vis&&cp.role==='button'&&cp.tab===0,JSON.stringify(cp));
  for(const [tecla,nome] of [['Enter','Enter'],[' ','Espaço']]){
    await p.focus('#clsPill');const f=await p.evaluate(()=>document.activeElement&&document.activeElement.id);
    await p.keyboard.press(tecla===' '?'Space':tecla);await p.waitForTimeout(500);
    ok(tag+nome+' na pílula da classe abre a galeria',f==='clsPill'&&await aberto(p),'foco='+f);
    await limpaCls(p);await p.waitForTimeout(300);await fechaTudo(p);}
  // o toque continua abrindo, e só uma galeria por vez
  await p.click('#clsPill');await p.waitForTimeout(500);
  ok(tag+'toque na pílula da classe abre a galeria (uma só)',await aberto(p)&&await p.evaluate(()=>document.querySelectorAll('#clsModal').length===1));
  await limpaCls(p);await p.waitForTimeout(300);await fechaTudo(p);
  // sequência e escudo também respondem ao Enter
  for(const id of ['streak','shieldPill']){const ex=await p.evaluate(id=>{const e=document.getElementById(id);return !!(e&&e.getClientRects().length&&e.getAttribute('role')==='button');},id);
    if(!ex){ok(tag+'#'+id+' existe como botão',false);continue;}
    await p.focus('#'+id);const n0=await p.evaluate(()=>{window.__m=0;window.__mo=new MutationObserver(r=>window.__m+=r.length);window.__mo.observe(document.body,{subtree:true,childList:true,attributes:true});return 0;});
    await p.keyboard.press('Enter');await p.waitForTimeout(400);const n=await p.evaluate(()=>{window.__mo.disconnect();return window.__m;});
    ok(tag+'Enter em #'+id+' responde',n>n0);await fechaTudo(p);}
  const g=await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-prog')||'{}'),pre);
  ok(tag+'classe e campo antigo intactos',g.velho==='fica'&&g.rpg&&g.rpg.cls&&g.rpg.cls.id==='mago',JSON.stringify(g.rpg));
  ok(tag+'console limpo',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
