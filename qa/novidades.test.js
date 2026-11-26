// Tela "Novidades" da 1.0 (tools/versao.js): aparece 1x para quem já jogava, nunca para quem é novo,
// não abre em cima de outro modal e some depois de recarregar. Rodapé em Mais com versão, Privacidade e Termos.
// Rode com: python3 -m http.server 8000 & node qa/novidades.test.js
const {chromium}=require('playwright');const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-20',profile:{age:'adult',occ:'faculdade'},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]};
const P={log:{},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rank:{on:false,asked:true},avAsk:true,rpg:{cg:1}};
const seed=(pre)=>([c,o,pre])=>{localStorage.setItem(pre+'cfg',JSON.stringify(c));localStorage.setItem(pre+'prog',JSON.stringify(o));localStorage.setItem(pre+'season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem(pre+'intro','1');localStorage.setItem(pre+'news','5');localStorage.setItem('asc-u-tele',JSON.stringify({asked:true}));localStorage.setItem('asc-u-beta',JSON.stringify({asked:true}));};
const vis=p=>p.evaluate(()=>{const m=document.getElementById('vsModal');return !!(m&&m.getClientRects().length);});
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u-'],['','ascensao-']]){
  const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8000/'+route);await p.evaluate(seed(pre),[CFG,P,pre]);await p.reload();
  // fecha qualquer modal do Sistema que aparecer antes; a Novidades tem que esperar a vez
  let saw=false;for(let i=0;i<12&&!saw;i++){await p.waitForTimeout(1000);saw=await vis(p);if(!saw)await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal')].find(x=>x.id!=='vsModal'&&x.getClientRects().length);if(m)[...m.querySelectorAll('button')].pop().click();});}
  ok('/'+route+' antigo: Novidades aparece',saw);
  const others=await p.evaluate(()=>[...document.querySelectorAll('.sysmodal,.mssheet')].filter(x=>x.id!=='vsModal'&&x.getClientRects().length).length);
  ok('/'+route+' antigo: sozinha na tela',others===0,'outros modais: '+others);
  await p.keyboard.press('Escape');await p.waitForTimeout(300);ok('/'+route+' Esc fecha',!(await vis(p)));
  ok('/'+route+' grava versão',await p.evaluate(k=>localStorage.getItem(k),pre+'ver')==='1.0.0');
  await p.reload();await p.waitForTimeout(6000);ok('/'+route+' não volta ao recarregar',!(await vis(p)));
  const foot=await p.evaluate(()=>{const f=document.getElementById('vsFoot');return f?[...f.querySelectorAll('a')].map(a=>a.getAttribute('href')).join(','):'';});
  ok('/'+route+' rodapé com Privacidade e Termos',foot===(route?'../privacidade/,../termos/':'./privacidade/,./termos/'),foot);
  ok('/'+route+' rodapé só na aba Mais',await p.evaluate(()=>{document.body.dataset.tab='hoje';const h=document.getElementById('vsFoot').getClientRects().length===0;document.body.dataset.tab='mais';const m=document.getElementById('vsFoot').getClientRects().length>0;document.body.dataset.tab='hoje';return h&&m;}));
  ok('/'+route+' rodapé com alvo de 44px',await p.evaluate(()=>{document.body.dataset.tab='mais';const r=[...document.querySelectorAll('#vsFoot a,#vsFoot button')].every(e=>e.getBoundingClientRect().height>=44);document.body.dataset.tab='hoje';return r;}));
  ok('/'+route+' sem erro de JS',errs.length===0,errs.join(' | '));await ctx.close();
  // 1 tela do Sistema por abertura: aceite do painel pendente (só /comecar/) adia a Novidades
  if(route){const c3=await b.newContext({viewport:{width:390,height:844}});await c3.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));const p3=await c3.newPage();await p3.goto('http://localhost:8000/'+route);await p3.evaluate(seed(pre),[CFG,P,pre]);await p3.evaluate(()=>{localStorage.setItem('asc-u-tele','{}');localStorage.removeItem('asc-u-ver-adia');});await p3.reload();await p3.waitForTimeout(8000);
    ok('/'+route+' aceite pendente: Novidades fica para a próxima (1 tela por abertura)',!(await vis(p3))&&await p3.evaluate(()=>!localStorage.getItem('asc-u-ver')));await c3.close();}
  // alvo de toque de 44px no rodapé
  // pessoa nova: perfil vazio, nunca vê a tela
  const c2=await b.newContext({viewport:{width:390,height:844}});await c2.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));const p2=await c2.newPage();await p2.goto('http://localhost:8000/'+route);await p2.waitForTimeout(7000);
  ok('/'+route+' novo: não aparece no onboarding',!(await vis(p2)));await c2.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
