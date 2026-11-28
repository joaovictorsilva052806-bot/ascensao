// ⌨️ Teclado nos "botões" que não são <button> (tools/dialogo.js): role="button" responde a Enter e Espaço como um toque.
// Antes: "Comece por aqui" (#gdPanel) no app do JV ignorava Enter/Espaço. Quem já trata a tecla não pode disparar 2 vezes.
// Rode com: python3 -m http.server 8000 & node qa/teclado-botoes.test.js
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',profile:{age:'18 a 29'},quests:[{id:'q1',title:'Treino de 20 min',xp:20,stat:'corpo',main:true}]};
const base=x=>Object.assign({log:{'2026-11-24':[{q:'q1',kind:'full',xp:20,stat:'corpo',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{a_first:'2026-11-01'},rpg:{cls:{id:'guerreiro',style:'fant',name:'Guerreiro',stat:'corpo'},seen:{foco:1,vendas:1,mente:1,corpo:1}},simple:{off:'2026-11-01'},velho:'fica'},x||{});
async function abre(b,prog,route='comecar/',pre='asc-u',vp){const ctx=await b.newContext({viewport:vp||{width:390,height:844}});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route(/fonts|docs\.google|script\.google/,r=>r.fulfill({status:200,body:''}));
  await p.clock.install({time:new Date('2026-11-26T15:00:00-03:00')});await p.goto(U+'privacidade/');
  await p.evaluate(([c,o,k])=>{localStorage.setItem(k+'-cfg',JSON.stringify(c));localStorage.setItem(k+'-prog',JSON.stringify(o));localStorage.setItem(k+'-season','2');localStorage.setItem(k+'-tele','{"asked":1}');
    for(const x of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide','ascensao-news'])localStorage.setItem(x,'9');},[CFG,prog,pre]);
  await p.goto(U+route);await p.clock.runFor(3500);
  for(let i=0;i<8;i++){const n=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal:not([hidden]):not(#clsModal) button, #levelup:not([hidden]) #luClose')].find(x=>x.getClientRects().length);if(m){m.click();return 1;}return 0;});if(!n)break;await p.clock.runFor(300);}
  await p.evaluate(()=>{const t=document.querySelector('#tabbar [data-go="prog"]');if(t)t.click();});await p.clock.runFor(500);return {ctx,p,errs};}
const st=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k+'-prog')),k);
const st0=p=>p.evaluate(()=>{const g=document.getElementById('gdPanel');const h=g&&g.querySelector('.qhead');return g?[g.className,g.dataset.full||'',h.getAttribute('aria-expanded')||'',(g.closest('section')||g).className].join('|'):null;});
(async()=>{const b=await chromium.launch();
for(const [route,pre,tag] of [['comecar/','asc-u','/comecar/'],['','ascensao','raiz']]){
  for(const rm of [false,true]){const T=tag+(rm?' (reduce-motion)':'');
  let {ctx,p,errs}=await abre(b,base(),route,pre);if(rm)await p.emulateMedia({reducedMotion:'reduce'});
  await p.evaluate(()=>{const t=document.querySelector('#tabbar [data-go="hoje"]');t&&t.click();});await p.clock.runFor(600);
  // 1) "Comece por aqui": Enter faz o mesmo que 1 toque; toque desfaz (prova que foi 1 vez só); Espaço idem
  const a=await st0(p);ok(T+': painel "Comece por aqui" na tela',!!a);
  await p.focus('#gdPanel .qhead');await p.keyboard.press('Enter');await p.clock.runFor(300);const e1=await st0(p);
  ok(T+': Enter no "Comece por aqui" abre/fecha',e1!==a,a+' → '+e1);
  await p.evaluate(()=>document.querySelector('#gdPanel .qhead').click());await p.clock.runFor(300);
  ok(T+': Enter valeu 1 toque só (um toque volta ao início)',await st0(p)===a,await st0(p));
  await p.focus('#gdPanel .qhead');await p.keyboard.press(' ');await p.clock.runFor(300);const e2=await st0(p);
  ok(T+': Espaço no "Comece por aqui" abre/fecha',e2!==a&&e2===e1,a+' → '+e2);
  // 2) nome da quest (já tinha Enter próprio): continua abrindo 1 vez só
  const tt=p.locator('.quest .tt').first();const x0=await tt.getAttribute('aria-expanded');await tt.focus();await p.keyboard.press('Enter');await p.clock.runFor(200);
  ok(T+': nome da quest: Enter abre 1 vez (sem toque duplo)',x0==='false'&&await tt.getAttribute('aria-expanded')==='true',x0+' → '+await tt.getAttribute('aria-expanded'));
  await p.keyboard.press(' ');await p.clock.runFor(200);ok(T+': nome da quest: Espaço fecha',await tt.getAttribute('aria-expanded')==='false');
  // 3) genérico: div role=button sem tratador ganha Enter/Espaço; <button> de verdade não dispara 2 vezes; Ctrl+Enter e tecla repetida não
  const c=await p.evaluate(async()=>{const d=document.createElement('div');d.setAttribute('role','button');d.tabIndex=0;d.textContent='qa';let n=0;d.addEventListener('click',()=>n++);
    const bt=document.createElement('button');bt.textContent='qa2';let m=0;bt.addEventListener('click',()=>m++);
    const dz=document.createElement('div');dz.setAttribute('role','button');dz.setAttribute('aria-disabled','true');dz.tabIndex=0;let z=0;dz.addEventListener('click',()=>z++);
    document.body.append(d,bt,dz);window.__c=()=>({n,m,z});return 1;});
  await p.focus('div[role=button]:text("qa")');await p.keyboard.press('Enter');await p.keyboard.press(' ');await p.keyboard.press('Control+Enter');
  await p.focus('button:text("qa2")');await p.keyboard.press('Enter');
  await p.focus('div[aria-disabled=true]');await p.keyboard.press('Enter');
  const r=await p.evaluate(()=>__c());
  ok(T+': role=button sem tratador: Enter e Espaço = 2 toques, Ctrl+Enter nada',r.n===2,JSON.stringify(r));
  ok(T+': <button> com Enter = 1 toque (sem duplicar)',r.m===1,JSON.stringify(r));
  ok(T+': aria-disabled não dispara',r.z===0,JSON.stringify(r));
  // 4) digitar Espaço num campo continua escrevendo
  await p.evaluate(()=>{const i=document.createElement('input');i.id='qaIn';document.body.append(i);});await p.focus('#qaIn');await p.keyboard.type('a b');
  ok(T+': Espaço num campo de texto continua escrevendo',await p.inputValue('#qaIn')==='a b');
  ok(T+': console limpo',!errs.length,errs.join(' | '));await ctx.close();}}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})().catch(e=>{console.error(e);process.exit(1)});
