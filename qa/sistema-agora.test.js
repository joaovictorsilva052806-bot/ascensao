// Missão do Sistema = algo que dá para fazer AGORA (revisão horária 28/11 12h23).
// Caso real (jogador novo de faculdade, cadastro às 12h30 de sábado): a lista de Hoje marcava "Bloco de estudo" como PRÓXIMA,
// mas a barra do Sistema e a linha [SISTEMA] diziam "Próxima: Deitar até 23h, sem tela na cama". O smCands punha o período
// que ainda não chegou (noite) antes do que ficou da manhã. Agora, só no Sistema: período atual > qualquer hora >
// o que ficou de um período que passou (sem castigo) > período que ainda não chegou. A ordem da lista de Hoje não muda.
// Rode com: python3 -m http.server 8000 & node qa/sistema-agora.test.js
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const QS=[
  {id:'s_bloco',title:'Bloco de estudo de 50 min',xp:40,stat:'mente',main:true,slot:'manha',ifThen:'Sábado, depois do café, ligo o modo foco.'},
  {id:'s_sono',title:'Deitar até 23h, sem tela na cama',xp:15,stat:'corpo',main:false,slot:'noite',ifThen:'Quando chegar em casa, celular no carregador fora da cama.'},
  {id:'s_fech',title:'Antes de dormir: marcar o que fiz hoje e escolher a tarefa de amanhã',xp:15,stat:'foco',main:true,slot:'noite',ifThen:'Quando colocar o celular para carregar à noite, abro este app.'}];
const LIVRE={id:'u_agua',title:'Beber 6 copos de água',xp:10,stat:'corpo',ifThen:'A cada refeição, 1 copo.'};
const CFG=qs=>({version:3,name:'Teste',startDate:'2026-11-01',profile:{name:'Ana',age:'18 a 29',wake:'07:00',sleep:'23:00'},quests:qs});
const PROG=()=>({log:{'2026-11-20':[{q:'s_bloco',kind:'full',xp:40,stat:'mente',bonus:0,t:'2026-11-20T10:00:00'}]},rpg:{cls:{id:'mago',style:'fant',name:'Mago',stat:'mente'}},simple:{off:'2026-11-01'},age:'18',velho:'fica'});
async function abre(b,vp,rm,route,pre,hora,qs){
  const ctx=await b.newContext({viewport:vp,reducedMotion:rm?'reduce':'no-preference',timezoneId:'America/Sao_Paulo'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date('2026-11-28T'+hora+':00-03:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide'])localStorage.setItem(k,'1');localStorage.setItem('asc-sm-last',String(Date.now()));},[CFG(qs),PROG(),pre]);
  await p.goto(U+route);await p.clock.runFor(2500);
  return {ctx,p,errs};}
const leia=p=>p.evaluate(()=>({bar:((document.querySelector('#smBar .smbn')||{}).textContent||''),line:((document.getElementById('sysLine')||{}).textContent||''),
  next:((document.querySelector('#quests .quest.next')||{}).dataset||{}).q||'',order:[...document.querySelectorAll('#quests .quest[data-q]')].map(e=>e.dataset.q)}));
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']])for(const vp of [{width:390,height:844},{width:1280,height:800}])for(const rm of [false,true]){
  const N=(route?'/comecar/':'/')+' '+vp.width+(rm?' rm':'');
  // 12h30: a manhã passou, a noite ainda não chegou
  let {ctx,p,errs}=await abre(b,vp,rm,route,pre,'12:30',QS);let s=await leia(p);
  ok(N+' 12h30: barra do Sistema não manda "Deitar até 23h"',!/Deitar até 23h/.test(s.bar)&&s.bar.length>0,s.bar);
  ok(N+' 12h30: barra do Sistema aponta o bloco de estudo (dá para fazer agora)',/Bloco de estudo/.test(s.bar),s.bar);
  ok(N+' 12h30: linha [SISTEMA] não manda deitar',!/Próxima missão: Deitar/.test(s.line),s.line);
  ok(N+' 12h30: Sistema e lista de Hoje concordam na PRÓXIMA',s.next==='s_bloco'&&/Bloco de estudo/.test(s.bar),s.next+' / '+s.bar);
  ok(N+' 12h30: ordem da lista de Hoje igual à de antes (só o Sistema muda)',JSON.stringify(s.order)==='["s_bloco","s_fech","s_sono"]',s.order.join(','));
  await p.evaluate(()=>{const b=document.getElementById('smBar');if(b)b.click();});await p.waitForTimeout(300);
  const h=await p.evaluate(()=>{const e=document.querySelector('#smSheet:not([hidden]) .smh');return e?e.textContent:'';});
  ok(N+' 12h30: tela do Sistema abre com o bloco de estudo',/Bloco de estudo/.test(h),h);
  ok(N+' 12h30: sem erro de console',!errs.length,errs.join(' | '));await ctx.close();
  // 12h30 com tarefa de qualquer hora: ela vem antes do que ficou da manhã
  ({ctx,p,errs}=await abre(b,vp,rm,route,pre,'12:30',[...QS,LIVRE]));s=await leia(p);
  ok(N+' 12h30 + "qualquer hora": Sistema oferece a de qualquer hora',/Beber 6 copos/.test(s.bar),s.bar);await ctx.close();
  // 20h30: a noite chegou, então "Deitar" volta a valer como missão do período
  ({ctx,p,errs}=await abre(b,vp,rm,route,pre,'20:30',[QS[1],QS[2]]));s=await leia(p);
  ok(N+' 20h30: período da noite atual, Sistema oferece "Deitar até 23h"',/Deitar até 23h/.test(s.bar),s.bar);await ctx.close();
  // 7h10: manhã atual; o bloco pesado fica fora da 1ª hora, e mesmo assim a noite não vem antes da manhã
  ({ctx,p,errs}=await abre(b,vp,rm,route,pre,'07:10',[QS[0],QS[1],{id:'s_along',title:'Alongar 5 min ao acordar',xp:10,stat:'corpo',slot:'manha'}]));s=await leia(p);
  ok(N+' 7h10: Sistema oferece alongar (manhã, leve)',/Alongar/.test(s.bar),s.bar);
  // dados: nada some depois de recarregar
  await p.reload();await p.clock.runFor(2000);
  const st=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
  ok(N+' dados antigos intactos depois de recarregar',st.velho==='fica'&&st.log['2026-11-20'].length===1&&st.rpg.cls.id==='mago',JSON.stringify(st).slice(0,200));
  ok(N+' 7h10: sem erro de console',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();const f=R.filter(x=>x.startsWith('FAIL'));console.log(R.join('\n'));console.log((R.length-f.length)+'/'+R.length+' passaram');process.exit(f.length?1:0);})();
