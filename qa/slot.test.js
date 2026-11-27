// Ordem pela hora do dia (spec da EVA 27/11, issue #22): caso real de testador que abriu o app às 7h e a 1ª tarefa era estudo.
// Agora a lista de Hoje e a missão do Modo Sistema seguem o período atual (manhã/tarde/noite pela rotina), depois "qualquer hora",
// depois os próximos períodos; período que já passou vai para o fim, sem castigo. Na 1ª hora depois de acordar o Sistema não abre com estudo.
// O jogador pode escolher o período no "Minhas tarefas" (campo novo `slot`, só adiciona).
// Rode com: python3 -m http.server 8000 & node qa/slot.test.js
const {chromium,devices}=require('playwright');const B=process.env.B||'http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const TK='2026-11-26';
const QS=[
  {id:'s_rev',title:'Revisão ativa: 15 min de flashcards',xp:30,stat:'mente',main:true,minTitle:'5 cards',ifThen:'Quando terminar de almoçar, abro o material.'},
  {id:'s_fech',title:'Antes de dormir: marcar o que fiz hoje e escolher a tarefa de amanhã',xp:15,stat:'foco',main:true,ifThen:'Quando colocar o celular para carregar à noite, abro este app.'},
  {id:'s_remed',title:'Tomar os remédios da manhã',xp:15,stat:'corpo',main:true,ifThen:'Quando levantar (07h), tomo junto com o primeiro copo d\'água.'},
  {id:'s_agua',title:'Beber 6 copos de água',xp:10,stat:'corpo',minTitle:'3 copos',ifThen:'A cada refeição, 1 copo antes de comer.'},
  {id:'s_along',title:'Alongar 5 min ao acordar',xp:10,stat:'corpo',ifThen:'Quando o alarme das 07h tocar, levanto e alongo.'},
  {id:'u_ler',title:'Ler 10 páginas',xp:15,stat:'mente',slot:'tarde',ifThen:'Logo depois do café.'}, // escolha do jogador vence a dedução
  {id:'u_velha',title:'Tarefa antiga sem gatilho',xp:10,stat:'foco'}];
const CFG={version:3,name:'Teste',startDate:'2026-11-01',profile:{name:'Teste',age:'18 a 29',wake:'07:00',sleep:'23:00'},quests:QS};
const PROG=()=>({log:{},extra:{},energy:{[TK]:'media'},rest:{},faith:{},mit:{},reviews:{},money:[],ach:{a_first:'2026-11-01'},rpg:{cls:{id:'mago',style:'fant',name:'Mago',stat:'mente'}},simple:{off:TK},velho:'fica'});
const clean=p=>p.evaluate(()=>{document.querySelectorAll('.sysmodal:not([hidden])').forEach(m=>m.remove());const l=document.getElementById('levelup');if(l)l.hidden=true;});
const order=p=>p.evaluate(()=>[...document.querySelectorAll('#quests .quest[data-q]')].map(e=>e.dataset.q));
async function abre(b,dev,rm,route,pre,hora,cfg){
  const c=await b.newContext({...dev,timezoneId:'America/Sao_Paulo',reducedMotion:rm?'reduce':'no-preference'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_PROXY|Failed to load resource|ERR_CONNECTION|navigator.vibrate/.test(m.text()))errs.push(m.text());});
  await p.clock.install({time:new Date(TK+'T'+hora+':00-03:00')});
  await p.goto(B+'/privacidade/');
  await p.evaluate(([c,o,pre])=>{for(const k of Object.keys(localStorage))localStorage.removeItem(k);
    localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide','asc-sm-last'])localStorage.setItem(k,k==='asc-sm-last'?String(Date.now()):'1');},[cfg||CFG,PROG(),pre]);
  await p.goto(B+route);await p.clock.runFor(3000);await clean(p);
  await p.evaluate(()=>{const s=document.getElementById('smSheet');if(s)s.hidden=true;document.body.classList.remove('insm');});
  return {c,p,errs};}
async function sistema(p){await p.evaluate(()=>{const b=document.getElementById('smBar');if(b)b.click();});await p.waitForTimeout(200);
  return p.evaluate(()=>{const h=document.querySelector('#smSheet:not([hidden]) .smh');return h?h.textContent:'';});}
const T=id=>QS.find(q=>q.id===id).title;
(async()=>{const b=await chromium.launch();
for(const [nome,dev,rm] of [['iPhone',devices['iPhone 13'],false],['Android',devices['Pixel 7'],false],['390x844 reduce-motion',{viewport:{width:390,height:844},isMobile:true,hasTouch:true},true]]){
 for(const [route,pre,tag] of [['/comecar/','asc-u','/comecar/'],['/','ascensao','raiz']]){
  const N=nome+' '+tag;
  // 07:10: manhã e 1ª hora depois de acordar
  let {c,p,errs}=await abre(b,dev,rm,route,pre,'07:10');
  let o=await order(p);
  ok(N+' 7h: 1ª tarefa é da manhã (remédio)',o[0]==='s_remed',o.join(','));
  ok(N+' 7h: estudo da tarde vem depois do remédio',o.indexOf('s_rev')>o.indexOf('s_remed'),o.join(','));
  ok(N+' 7h: fechamento da noite é a última principal',o.indexOf('s_fech')>o.indexOf('s_rev'),o.join(','));
  ok(N+' 7h: alongar (manhã) antes de água (qualquer hora)',o.indexOf('s_along')<o.indexOf('s_agua'),o.join(','));
  ok(N+' 7h: "Ler" com período escolhido (tarde) vem depois de "qualquer hora"',o.indexOf('u_ler')>o.indexOf('s_agua')&&o.indexOf('u_ler')>o.indexOf('u_velha'),o.join(','));
  const sl=await p.evaluate(()=>(document.getElementById('sysLine')||{}).textContent||'');
  ok(N+' 7h: linha do Sistema não aponta o estudo como próxima',!/Revisão ativa/.test(sl),sl);
  let h=await sistema(p);ok(N+' 7h: Sistema abre com tarefa da manhã, não com estudo',h.includes(T('s_remed')),h);
  ok(N+' 7h: sem erro de console',!errs.length,errs.join(' | '));await c.close();
  // 13:00: tarde
  ({c,p,errs}=await abre(b,dev,rm,route,pre,'13:00'));o=await order(p);
  ok(N+' 13h: 1ª tarefa é o estudo da tarde',o[0]==='s_rev',o.join(','));
  ok(N+' 13h: remédio da manhã (já passou) vem depois do estudo',o.indexOf('s_remed')>o.indexOf('s_rev'),o.join(','));
  ok(N+' 13h: "Ler" (tarde, escolhido) vem antes de "qualquer hora"',o.indexOf('u_ler')<o.indexOf('s_agua'),o.join(','));
  h=await sistema(p);ok(N+' 13h: Sistema abre com o estudo',h.includes(T('s_rev')),h);
  ok(N+' 13h: sem erro de console',!errs.length,errs.join(' | '));await c.close();
  // 21:00: noite
  ({c,p,errs}=await abre(b,dev,rm,route,pre,'21:00'));o=await order(p);
  ok(N+' 21h: 1ª tarefa é o fechamento da noite',o[0]==='s_fech',o.join(','));
  ok(N+' 21h: nada de "atrasada" na tela',!/atrasad/i.test(await p.textContent('#quests')));
  h=await sistema(p);ok(N+' 21h: Sistema não abre com o fechamento (regra antiga) e sim com tarefa livre',!h.includes(T('s_fech'))&&h.length>0,h);
  ok(N+' 21h: sem erro de console',!errs.length,errs.join(' | '));await c.close();
 }
 // rotina: quem acorda às 10h, às 9h ainda está na "madrugada/manhã" e às 10h20 o Sistema não abre com estudo pesado da manhã
 {const cfg=JSON.parse(JSON.stringify(CFG));cfg.profile.wake='10:00';cfg.quests[0].ifThen='Logo depois do café, abro o material.';
  let {c,p,errs}=await abre(b,dev,rm,'/comecar/','asc-u','10:20',cfg);
  const h=await sistema(p);ok(nome+' acorda 10h: na 1ª hora o Sistema evita estudo pesado',!h.includes(T('s_rev'))&&h.length>0,h);
  const o=await order(p);ok(nome+' acorda 10h: estudo da manhã continua no topo da lista (só o Sistema poupa)',o.indexOf('s_rev')<o.indexOf('s_fech'),o.join(','));
  ok(nome+' acorda 10h: sem erro de console',!errs.length,errs.join(' | '));await c.close();}
 // editar: escolher o período grava `slot` sem apagar nada; "Automático" tira o campo
 {let {c,p,errs}=await abre(b,dev,rm,'/comecar/','asc-u','07:10');
  const maisEd=()=>p.evaluate(()=>{document.querySelector('nav button[data-go="mais"]').click();const h=document.querySelector('#edPanel .fhd');if(h&&h.getAttribute('aria-expanded')==='false')h.click();});
  await maisEd();await p.waitForTimeout(250);
  const it=p.locator('#edList button',{hasText:'Tarefa antiga sem gatilho'}).first();await it.scrollIntoViewIfNeeded();await it.click();
  const bt=await p.evaluate(()=>[...document.querySelectorAll('#edSlot button')].map(b=>[b.textContent,b.getAttribute('aria-pressed'),Math.round(b.getBoundingClientRect().height)]));
  ok(nome+' editar: 5 opções de período, "Automático" marcado',bt.length===5&&bt[0][0]==='Automático'&&bt[0][1]==='true',JSON.stringify(bt));
  ok(nome+' editar: botões de período com 44 px ou mais',bt.every(x=>x[2]>=44),JSON.stringify(bt));
  await p.locator('#edSlot button',{hasText:'Manhã'}).click();
  ok(nome+' editar: só 1 período marcado',await p.evaluate(()=>document.querySelectorAll('#edSlot .on').length===1&&document.querySelector('#edSlot .on').textContent==='Manhã'));
  await p.locator('#edForm button[type=submit]').click();await p.waitForTimeout(200);
  let cf=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-cfg')));let q=cf.quests.find(x=>x.id==='u_velha');
  ok(nome+' editar: grava slot "manha"',q.slot==='manha',JSON.stringify(q));
  ok(nome+' editar: nada some da config',cf.quests.length===QS.length&&cf.profile.wake==='07:00'&&cf.quests.find(x=>x.id==='s_rev').minTitle==='5 cards');
  await clean(p);let o=await order(p);ok(nome+' editar: a tarefa sobe para o grupo da manhã',o.indexOf('u_velha')<o.indexOf('s_agua'),o.join(','));
  await maisEd();await p.waitForTimeout(250);
  await p.locator('#edList button',{hasText:'Tarefa antiga sem gatilho'}).first().click();
  ok(nome+' editar: reabre com "Manhã" marcado',await p.evaluate(()=>(document.querySelector('#edSlot .on')||{}).textContent==='Manhã'));
  await p.locator('#edSlot button',{hasText:'Automático'}).click();await p.locator('#edForm button[type=submit]').click();await p.waitForTimeout(200);
  cf=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-cfg')));q=cf.quests.find(x=>x.id==='u_velha');
  ok(nome+' editar: "Automático" tira o campo',!('slot' in q),JSON.stringify(q));
  const pr=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));ok(nome+' editar: progresso intacto',pr.velho==='fica'&&pr.energy[TK]==='media');
  ok(nome+' editar: sem erro de console',!errs.length,errs.join(' | '));await c.close();}
}
await b.close();console.log(R.join('\n'));const f=R.filter(r=>r.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
