// A PRÓXIMA nunca fica escondida (revisão horária 28/11 14h23).
// Caso real (onboarding de faculdade, 14h30 de sábado): o Sistema escolhia "10 min na minha missão" (tarefa de qualquer hora,
// não principal), a barra dizia "Próxima: 10 min na minha missão · ACEITAR" e o selo PRÓXIMA ia para esse cartão, mas ele
// morava em "Extras de hoje", fechado. Na tela, 3 cartões e nenhum era a PRÓXIMA. Agora o cartão sobe para o topo da lista
// (só na tela, nada gravado), o contador do "Extras" acompanha e o grupo some se ficar vazio.
// Rode com: python3 -m http.server 8000 & node qa/proxima-visivel.test.js
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const BLOCO={id:'s_bloco',title:'Bloco de estudo de 50 min',xp:40,stat:'mente',main:true,slot:'manha'};
const META={id:'s_meta_d',title:'10 min na minha missão: Estudar 20 min',xp:20,stat:'foco',minTitle:'5 min',ifThen:'Logo depois da primeira tarefa do dia.'};
const SONO={id:'s_sono',title:'Deitar até 23h, sem tela na cama',xp:15,stat:'corpo',main:false,slot:'noite'};
const FECH={id:'s_fech',title:'Antes de dormir: marcar o que fiz hoje e escolher a tarefa de amanhã',xp:15,stat:'foco',main:true,slot:'noite'};
const CFG=qs=>({version:3,name:'Teste',startDate:'2026-11-01',profile:{name:'Ana',age:'18 a 29',wake:'07:00',sleep:'23:00'},quests:qs});
const PROG=()=>({log:{'2026-11-20':[{q:'s_bloco',kind:'full',xp:40,stat:'mente',bonus:0,t:'2026-11-20T10:00:00'}]},rpg:{cls:{id:'mago',style:'fant',name:'Mago',stat:'mente'}},simple:{off:'2026-11-01'},age:'18',velho:'fica'});
async function abre(b,vp,rm,route,pre,hora,qs){
  const ctx=await b.newContext({viewport:vp,reducedMotion:rm?'reduce':'no-preference',timezoneId:'America/Sao_Paulo',serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date('2026-11-28T'+hora+':00-03:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide'])localStorage.setItem(k,'1');localStorage.setItem('asc-sm-last',String(Date.now()));},[CFG(qs),PROG(),pre]);
  await p.goto(U+route);await p.clock.runFor(2500);
  return {ctx,p,errs};}
const leia=p=>p.evaluate(()=>{const n=document.querySelector('#quests .quest.next');const dt=n&&n.closest('details');const r=n&&n.getBoundingClientRect();
  const g=document.querySelector('#quests > .qgroup');const ex=[...document.querySelectorAll('#quests > details')].find(d=>/Extras/.test((d.querySelector('summary')||{}).textContent||''));
  return {bar:((document.querySelector('#smBar .smbn')||{}).textContent||''),next:n?n.dataset.q:'',nNext:document.querySelectorAll('#quests .quest.next').length,
    hidden:!!(dt&&!dt.open),visible:!!(r&&r.width>0&&r.height>0),first:!!(g&&g.querySelector(':scope > .quest')===n),
    extra:ex?(ex.querySelector('summary').textContent):'',extraQs:ex?[...ex.querySelectorAll(':scope > .quest')].map(e=>e.dataset.q):[],
    order:[...document.querySelectorAll('#quests .quest[data-q]')].map(e=>e.dataset.q)};});
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']])for(const vp of [{width:390,height:844},{width:1280,height:800}])for(const rm of [false,true]){
  const N=(route?'/comecar/':'/')+' '+vp.width+(rm?' rm':'');
  // 14h30: Sistema escolhe a de qualquer hora, que é extra
  let {ctx,p,errs}=await abre(b,vp,rm,route,pre,'14:30',[BLOCO,SONO,META,FECH]);let s=await leia(p);
  ok(N+' 14h30: Sistema oferece a missão de 10 min (nome curto, cabe na barra)',/10 min · Estudar 20 min/.test(s.bar),s.bar);
  ok(N+' 14h30: selo PRÓXIMA no mesmo cartão da barra (um só)',s.next==='s_meta_d'&&s.nNext===1,JSON.stringify(s));
  ok(N+' 14h30: cartão PRÓXIMA não fica dentro de "Extras" fechado',!s.hidden&&s.visible,JSON.stringify(s));
  ok(N+' 14h30: cartão PRÓXIMA é o 1º da lista de Hoje',s.first&&s.order[0]==='s_meta_d',s.order.join(','));
  ok(N+' 14h30: "Extras de hoje" conta só o que ficou nele',/\(1\)/.test(s.extra)&&s.extraQs.join()==='s_sono',s.extra+' / '+s.extraQs.join());
  // tocar em Feito no cartão que subiu conclui a tarefa certa
  await p.evaluate(()=>document.querySelector('#quests .quest.next .btns button.go').click());await p.clock.runFor(800);
  let st=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
  ok(N+' Feito no cartão que subiu grava a tarefa certa',(st.log['2026-11-28']||[]).some(e=>e.q==='s_meta_d'),JSON.stringify(st.log['2026-11-28']||[]));
  ok(N+' dados antigos intactos',st.velho==='fica'&&st.log['2026-11-20'].length===1&&st.rpg.cls.id==='mago',JSON.stringify(st).slice(0,200));
  ok(N+' 14h30: sem erro de console',!errs.length,errs.join(' | '));await ctx.close();
  // único extra: o grupo "Extras" some em vez de ficar vazio
  ({ctx,p,errs}=await abre(b,vp,rm,route,pre,'14:30',[BLOCO,META,FECH]));s=await leia(p);
  ok(N+' único extra: PRÓXIMA visível e no topo',s.next==='s_meta_d'&&!s.hidden&&s.first,JSON.stringify(s));
  ok(N+' único extra: sem "Extras de hoje" vazio',s.extra==='',s.extra);await ctx.close();
  // 21h: "Fechar o dia" liberado segue no topo (regra do slot) e a PRÓXIMA vem logo abaixo, visível
  ({ctx,p,errs}=await abre(b,vp,rm,route,pre,'21:00',[BLOCO,META,FECH]));s=await leia(p);
  ok(N+' 21h: Fechar o dia no topo e a PRÓXIMA logo abaixo',s.order[0]==='s_fech'&&s.order[1]==='s_meta_d'&&s.next==='s_meta_d'&&!s.hidden,JSON.stringify(s));await ctx.close();
  // quando a PRÓXIMA já é principal, nada muda de lugar
  ({ctx,p,errs}=await abre(b,vp,rm,route,pre,'09:00',[BLOCO,SONO,FECH]));s=await leia(p);
  ok(N+' 9h: PRÓXIMA principal, ordem igual à de antes',s.next==='s_bloco'&&s.order.join()==='s_bloco,s_fech,s_sono'&&/\(1\)/.test(s.extra),JSON.stringify(s));
  // recarregar: continua visível
  await ctx.close();({ctx,p,errs}=await abre(b,vp,rm,route,pre,'14:30',[BLOCO,SONO,META,FECH]));
  await p.reload();await p.clock.runFor(2500);s=await leia(p);
  ok(N+' recarregar: PRÓXIMA segue visível no topo',s.next==='s_meta_d'&&!s.hidden&&s.first,JSON.stringify(s));
  ok(N+' recarregar: sem erro de console',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();const f=R.filter(x=>x.startsWith('FAIL'));console.log(R.join('\n'));console.log((R.length-f.length)+'/'+R.length+' passaram');process.exit(f.length?1:0);})();
