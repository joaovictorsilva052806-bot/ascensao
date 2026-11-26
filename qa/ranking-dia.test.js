// Etapa 2 do ranking: ranking do dia + rival do dia, animação de subida, contagem pelo sensor, avisos locais e desafio em dupla.
// Rode com: python3 -m http.server 8000 & node qa/ranking-dia.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]};
const HD='nome,xp,nivel,,tipo,a,b,s,d,,pnick,seq,dz,av,at\n';
const csv=(rank,soc=[])=>HD+rank.map(r=>r.join(',')).join('\n')+'\n'+soc.map(s=>',,,,'+s.join(',')).join('\n')+'\n';
const base=(x={})=>Object.assign({log:{'2026-11-24':[{q:'q1',kind:'full',xp:25,stat:'mente',bonus:0,t:'x'}],'2026-11-25':[{q:'q1',kind:'full',xp:15,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},rank:{on:true,asked:true,uid:'abc12345'},velho:'fica'},x);
// ontem (24/11) este aparelho viu: Ana 100, Bia 55, Cadu 10. Hoje a lista mostra Ana 140, Bia 60, Cadu 10 → hoje: Ana 40, você (15 + check-in), Bia 5, Cadu 0
const YDAY={d:'2026-11-24',base:{},last:{ana:100,bia:55,cadu:10,teste:25},ld:'2026-11-24',pos:{},nt:{}};
const RANK=[['Ana',140,3],['Bia',60,2],['Teste',40,1],['Cadu',10,1]];
async function drain(p){for(let k=0;k<2;k++){for(let i=0;i<10;i++){const m=p.locator('.sysmodal:not([hidden]) button.go');if(!(await m.count()))break;await m.first().dispatchEvent('click');await p.waitForTimeout(150);}await p.waitForTimeout(600);}}
const NTF=()=>{window.__nt=[];class N{constructor(t,o){window.__nt.push(t+' | '+(o&&o.body));}static requestPermission(){N.permission='granted';return Promise.resolve('granted');}}N.permission='default';window.Notification=N;
  window.__hid=false;Object.defineProperty(document,'hidden',{get:()=>window.__hid,configurable:true});};
(async()=>{const b=await chromium.launch();
async function open(o){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm?'reduce':'no-preference'});await ctx.addInitScript(NTF);if(o.init)await ctx.addInitScript(o.init);
  const p=await ctx.newPage();const errs=[],posts=[];let body=o.csv||csv(RANK);
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await ctx.route('https://docs.google.com/**',r=>{if(r.request().method()==='POST'){posts.push(decodeURIComponent((r.request().postData()||'').replace(/\+/g,' ')));return r.fulfill({status:200,body:''});}return r.fulfill({status:200,contentType:'text/csv',body});});
  await p.clock.install({time:new Date(o.time||'2026-11-25T14:00:00')});await p.goto(U+(o.root?'':'comecar/')+'__seed__');
  const K=o.root?{cfg:'ascensao-cfg',prog:'ascensao-prog',dia:'ascensao-dia'}:{cfg:'asc-u-cfg',prog:'asc-u-prog',dia:'asc-u-dia'};
  await p.evaluate(([c,g,d,K,root])=>{localStorage.setItem(K.cfg,JSON.stringify(c));localStorage.setItem(K.prog,JSON.stringify(g));if(d)localStorage.setItem(K.dia,JSON.stringify(d));
    for(const k of root?['ascensao-season','ascensao-perm','asc-u-intro']:['asc-u-season','asc-u-perm','asc-u-intro'])localStorage.setItem(k,k.endsWith('season')?'2':'1');},[CFG,o.prog||base(),o.dia===undefined?YDAY:o.dia,K,!!o.root]);
  await p.goto(U+(o.root?'':'comecar/'));await p.waitForTimeout(1500);await drain(p);
  return {ctx,p,errs,posts,K,set:v=>{body=v;}};}
const amigos=async p=>{await p.locator('#tabbar [data-go="amigos"]').dispatchEvent('click');await p.waitForTimeout(700);};
const names=p=>p.$$eval('#tmPanel .tmlist li:not(.tmzone) .tmtx b',x=>x.map(e=>e.textContent));
// 1) ranking do dia + rival do dia (celular)
let {ctx,p,errs,posts,K,set}=await open({});
const myX=async()=>p.evaluate(K=>(JSON.parse(localStorage.getItem(K.prog)).log['2026-11-25']||[]).reduce((a,e)=>a+(e.xp||0)+(e.bonus||0),0),K);let me=await myX();
let rv=await p.textContent('#zapPanel .zaprival').catch(()=>'');const gap=40-me+1;
ok('Hoje: rival do dia é quem está logo acima (Ana)',rv.includes('Rival do dia: Ana (40 XP hoje) · faltam '+gap+' XP ('+Math.ceil(gap/10)+' desafio'),rv+' · meu XP hoje '+me);
await amigos(p);
ok('Amigos abre na lista de Hoje',await p.locator('#tmPanel .tmseg button.on').textContent()==='Hoje');
let L=await names(p);ok('ordem do dia: Ana, você, Bia, Cadu',L.join(',')==='Ana,Teste (você),Bia,Cadu',L.join(','));
const xs=await p.$$eval('#tmPanel .tmlist li .tmxp',x=>x.map(e=>e.textContent));ok('XP de hoje na lista',xs.join(',')==='+40 hoje,+'+me+' hoje,+5 hoje,+0 hoje',xs.join(','));
ok('sem aviso de contagem parcial quando viu a lista ontem',!(await p.locator('#tmPanel .dybox .muted').count()));
await p.locator('#tmPanel .tmseg button',{hasText:'Semana'}).dispatchEvent('click');await p.waitForTimeout(200);
L=await names(p);ok('aba Semana continua com o XP da semana',L.join(',')==='Ana,Bia,Teste (você),Cadu',L.join(','));
await p.screenshot({path:'/tmp/claude-0/rk-semana.png'}).catch(()=>{});
await p.locator('#tmPanel .tmseg button',{hasText:'Hoje'}).dispatchEvent('click');await p.waitForTimeout(200);
let st=await p.evaluate(K=>JSON.parse(localStorage.getItem(K.prog)),K);ok('progresso antigo intacto (só leitura)',st.velho==='fica'&&st.rank.uid==='abc12345'&&st.log['2026-11-24'].length===1);
let dy=await p.evaluate(K=>JSON.parse(localStorage.getItem(K.dia)),K);ok('virada do dia: base = o que viu ontem',dy.d==='2026-11-25'&&dy.base.ana===100&&dy.ex===true,JSON.stringify(dy));
// 2) passa a Ana: desafio relâmpago +10 → 25 > 20, sobe para 1º com animação
const ids=await p.$$eval('#zapPanel .zapc',x=>x.map(e=>[e.dataset.id,e.querySelector('.tt').textContent]));
const ci=ids.findIndex(x=>/^\d+ /.test(x[1])&&!/^1 /.test(x[1]));
await p.locator('#tabbar [data-go="hoje"]').dispatchEvent('click');await p.waitForTimeout(200);
const fin=async id=>{await p.locator('#zapPanel .zapc[data-id="'+id+'"]').dispatchEvent('click');await p.waitForTimeout(150);
  if(await p.locator('#zapSheet .zaptap').count()){const tot=await p.evaluate(()=>+document.querySelector('#zapSheet .zaptap span').textContent.match(/\d+/)[0]);for(let i=0;i<tot;i++)await p.locator('#zapSheet .zaptap').dispatchEvent('click');}
  else if(await p.locator('#zapSheet .mscard .go',{hasText:'Começar'}).count()){await p.locator('#zapSheet .mscard .go',{hasText:'Começar'}).dispatchEvent('click');await p.clock.runFor(601000);}
  await p.locator('#zapSheet .msend button.go').dispatchEvent('click');await p.waitForTimeout(300);await drain(p);};
const need=Math.ceil(gap/10);ok('dá para passar a Ana com os desafios de hoje',need<=2,String(need));
for(const [k,x] of ids.filter((x,i)=>i!==ci).slice(0,need).entries())await fin(x[0]);me=await myX();
rv=await p.textContent('#zapPanel .zaprival').catch(()=>'');ok('depois dos desafios: você lidera o dia',rv.includes('Você lidera o dia, '+(me-40)+' XP à frente de Ana'),rv);
await amigos(p);L=await names(p);ok('lista do dia: você em 1º',L[0]==='Teste (você)',L.join(','));
ok('selo ▲ 1 na sua linha',(await p.textContent('#tmPanel li.me .dyup').catch(()=>''))==='▲ 1');
ok('sua linha anima subindo',await p.evaluate(()=>document.querySelector('#tmPanel li.me').getAnimations().length>0));
await p.waitForTimeout(1000);await p.screenshot({path:'/tmp/claude-0/rk-hoje.png'}).catch(()=>{});
// 3) avisos locais: liga com permissão; à noite, app em segundo plano, faltando desafio → notificação
await p.locator('#tmPanel .dyntf').dispatchEvent('click');await p.waitForTimeout(200);
ok('botão liga os avisos (pede permissão no toque)',(await p.textContent('#tmPanel .dyntf'))==='🔔 Avisos ligados');
await p.evaluate(()=>{window.__hid=true;});await p.clock.runFor(7*3600*1000);await p.waitForTimeout(300);
let nt=await p.evaluate(()=>window.__nt);ok('20h+ em segundo plano: aviso de desafio faltando',nt.some(x=>/Faltam \d desafios? relâmpago/.test(x)),nt.join(' / '));
await p.clock.runFor(30*60*1000);nt=await p.evaluate(()=>window.__nt);ok('aviso da noite só 1 vez por dia',nt.filter(x=>/Faltam/.test(x)).length===1,nt.join(' / '));
// alguém te passa (Bia ganha 30 hoje): aviso de ultrapassagem
set(csv([['Ana',140,3],['Bia',200,2],['Teste',50,1],['Cadu',10,1]]));await p.clock.runFor(15*60*1000);await p.waitForTimeout(400);
nt=await p.evaluate(()=>window.__nt);ok('alguém te passou: aviso "Bia te passou hoje"',nt.some(x=>/Bia te passou hoje/.test(x)),nt.join(' / '));
ok('console limpo (dia + avisos)',!errs.length,errs.join(' | '));await ctx.close();
// 4) reduce-motion: selo sim, movimento não
({ctx,p,errs}=await open({rm:true,dia:Object.assign({},YDAY,{d:'2026-11-25',base:{ana:100,bia:55,cadu:10},ex:true,pos:{hoje:3}})}));await amigos(p);
ok('reduce-motion: selo ▲ aparece',(await p.textContent('#tmPanel li.me .dyup').catch(()=>''))==='▲ 1');
ok('reduce-motion: sem animação na linha',await p.evaluate(()=>document.querySelector('#tmPanel li.me').getAnimations().length===0));await ctx.close();
// 5) sem foto de ontem numa quarta: conta a partir de agora e avisa; segunda: semana = dia, exato
({ctx,p,errs}=await open({dia:null}));await amigos(p);
const nn=await p.textContent('#tmPanel .dybox').catch(()=>'');ok('sem foto de ontem: avisa que os outros contam desde agora',/desde as 14:00/.test(nn),nn);
L=await names(p);ok('sem foto de ontem: você (15) na frente de quem não pontuou desde agora',L[0]==='Teste (você)',L.join(','));await ctx.close();
({ctx,p,errs}=await open({dia:null,time:'2026-11-23T14:00:00',prog:base({log:{'2026-11-23':[{q:'q1',kind:'full',xp:15,stat:'mente',bonus:0,t:'x'}]}})}));await amigos(p);
L=await names(p);ok('segunda-feira: dia = semana, sem aviso parcial',L.join(',')==='Ana,Bia,Teste (você),Cadu'&&!(await p.locator('#tmPanel .dybox .muted').count()),L.join(','));await ctx.close();
// 6) sensor de movimento: iPhone pede permissão no toque; picos contam; sem sinal volta para o toque
const IOSP=()=>{window.__perm=0;window.DeviceMotionEvent.requestPermission=()=>{window.__perm++;return Promise.resolve(window.__deny?'denied':'granted');};};
({ctx,p,errs}=await open({init:IOSP}));
const zi=await p.$$eval('#zapPanel .zapc',x=>{const a=x.map(e=>[e.dataset.id,e.querySelector('.tt').textContent]);const i=a.findIndex(y=>/^\d+ /.test(y[1])&&!/^1 /.test(y[1]));return i<0?null:a[i][0];});
if(!zi)ok('há desafio de contagem hoje',false,'nenhum desafio com contagem em 25/11');else{
  await p.locator('#zapPanel .zapc[data-id="'+zi+'"]').dispatchEvent('click');await p.waitForTimeout(150);
  ok('sem pedir sensor antes do toque',await p.evaluate(()=>window.__perm)===0);
  await p.locator('#zapSheet .zapmo').click();await p.waitForTimeout(150);
  ok('iPhone: pede permissão do sensor ao tocar',await p.evaluate(()=>window.__perm)===1);
  ok('botão vira "Parar o sensor"',/Parar o sensor/.test(await p.textContent('#zapSheet .zapmo')));
  const mo=async(z)=>{await p.evaluate(z=>window.dispatchEvent(new DeviceMotionEvent('devicemotion',{accelerationIncludingGravity:{x:0,y:0,z}})),z);};
  for(let i=0;i<8;i++){await mo(9.8);await p.clock.runFor(100);}   // repouso
  for(let r=0;r<3;r++){await mo(14.5);await p.clock.runFor(250);await mo(6.5);await p.clock.runFor(300);await mo(9.8);await p.clock.runFor(200);}
  let n=await p.evaluate(()=>+document.querySelector('#zapSheet .zaptap b').textContent);ok('3 repetições pelo sensor = 3',n===3,String(n));
  for(let i=0;i<3;i++){await mo(14.5);await p.clock.runFor(40);}  // tremida rápida não conta em dobro
  n=await p.evaluate(()=>+document.querySelector('#zapSheet .zaptap b').textContent);ok('tremida rápida não conta em dobro',n===4,String(n));
  await p.locator('#zapSheet .zaptap').dispatchEvent('click');n=await p.evaluate(()=>+document.querySelector('#zapSheet .zaptap b').textContent);ok('toque continua contando com o sensor ligado',n===5,String(n));
  await p.keyboard.press('Escape');await p.waitForTimeout(100);
  // sem sinal
  await p.locator('#zapPanel .zapc[data-id="'+zi+'"]').dispatchEvent('click');await p.waitForTimeout(150);await p.locator('#zapSheet .zapmo').click();await p.clock.runFor(2600);await p.waitForTimeout(100);
  ok('sem sinal do sensor: volta para o toque e avisa',/não respondeu/.test(await p.textContent('#toast'))&&/Contar pelo movimento/.test(await p.textContent('#zapSheet .zapmo')));
  await p.keyboard.press('Escape');
  // negado
  await p.evaluate(()=>{window.__deny=1;});await p.locator('#zapPanel .zapc[data-id="'+zi+'"]').dispatchEvent('click');await p.waitForTimeout(150);await p.locator('#zapSheet .zapmo').click();await p.waitForTimeout(150);
  ok('permissão negada: avisa e segue no toque',/Sem permissão do sensor/.test(await p.textContent('#toast')));await p.keyboard.press('Escape');}
ok('console limpo (sensor)',!errs.length,errs.join(' | '));await ctx.close();
// 7) desafio em dupla: convidar amiga, aceite e "feito" chegam pela lista, bônus para os dois
({ctx,p,errs,posts,set}=await open({prog:base({friends:{l:['Bia'],pend:{},seen:{}}})}));
const did=await p.$eval('#zapPanel .zapc',e=>e.dataset.id);
await p.locator('#zapPanel .zapc[data-id="'+did+'"]').dispatchEvent('click');await p.waitForTimeout(150);
await p.locator('#zapSheet .duogo').dispatchEvent('click');await p.waitForTimeout(100);await p.locator('#zapSheet .duochips button',{hasText:'Bia'}).dispatchEvent('click');await p.waitForTimeout(200);
ok('convite de dupla sai no canal K',posts.some(x=>x.includes('K|Teste|Bia|d-'+did+'|20261125')),posts.filter(x=>x.includes('K|')).join(' / '));
ok('tela mostra a espera do aceite',/Esperando o aceite/.test(await p.textContent('#zapSheet .duobox')));
await p.keyboard.press('Escape');
set(csv(RANK,[['K','Bia','Teste','da-'+did,'20261125'],['K','Bia','Teste','dk-'+did,'20261125'],['K','Cadu','Teste','dk-'+did,'20261125']]));
await p.evaluate(()=>{window.__hid=true;document.dispatchEvent(new Event('visibilitychange'));window.__hid=false;document.dispatchEvent(new Event('visibilitychange'));});await p.waitForTimeout(800);
st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));ok('aceite e "feito" da Bia chegam (Cadu, que não é a dupla, não conta)',st.duo.s==='on'&&st.duo.pa===1&&st.duo.w==='Bia',JSON.stringify(st.duo));
await fin(did);st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
ok('os dois fizeram: +10 XP de dupla, uma vez',(st.log['2026-11-25']||[]).filter(e=>e.q==='zap:duo:2026-11-25'&&e.xp===10).length===1);
ok('aviso de feito sai para a Bia',posts.some(x=>x.includes('K|Teste|Bia|dk-'+did)));
await p.reload();await p.waitForTimeout(1500);await drain(p);await p.waitForTimeout(2500);st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
ok('recarregar não paga a dupla de novo',(st.log['2026-11-25']||[]).filter(e=>e.q==='zap:duo:2026-11-25').length===1);
ok('dado antigo intacto (dupla)',st.velho==='fica'&&st.friends.l[0]==='Bia');ok('console limpo (dupla)',!errs.length,errs.join(' | '));await ctx.close();
// convite recebido: só de amigo, aparece no app e o aceite sai no canal
const DM=()=>{window.__dm=[];addEventListener('DOMContentLoaded',()=>new MutationObserver(()=>{const m=document.getElementById('duoModal');if(m&&!window.__dm.includes(m.textContent))window.__dm.push(m.textContent);}).observe(document.body,{childList:true}));};
({ctx,p,errs,posts}=await open({init:DM,prog:base({friends:{l:['Bia'],pend:{},seen:{}}}),csv:csv(RANK,[['K','Cadu','Teste','d-abd','20261125'],['K','Bia','Teste','d-'+did,'20261125']])}));await p.waitForTimeout(2500);
st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));ok('convite da amiga aparece e o aceite sai no canal',st.duo&&st.duo.w==='Bia'&&st.duo.s==='on'&&posts.some(x=>x.includes('K|Teste|Bia|da-'+did)),JSON.stringify(st.duo));
const dmt=await p.evaluate(()=>window.__dm);ok('modal: "Bia te chamou para uma dupla"',dmt.some(x=>/Bia te chamou para uma dupla/.test(x)),dmt.join(' / '));ok('convite de quem não é amigo é ignorado',!dmt.some(x=>/Cadu/.test(x))&&!posts.some(x=>x.includes('K|Teste|Cadu')));ok('console limpo (convite)',!errs.length,errs.join(' | '));await ctx.close();
// 8) app pessoal (raiz) e desktop: lista do dia sem erro
({ctx,p,errs}=await open({root:true,vp:{width:1280,height:800},prog:base({rpg:{cls:{id:'mago',style:'fant',name:'Mago'}}})}));await amigos(p);
L=await names(p);ok('raiz (desktop): lista do dia funciona',L.join(',')==='Ana,Teste (você),Bia,Cadu',L.join(','));
ok('raiz: dado do dia fica em ascensao-dia',await p.evaluate(()=>!!localStorage.getItem('ascensao-dia')&&!localStorage.getItem('asc-u-dia')));
ok('raiz: console limpo',!errs.length,errs.join(' | '));await ctx.close();
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
