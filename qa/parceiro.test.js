// Turma Parceiro (tools/parceiro.*): link de parceiro só 18+, painel do parceiro só com agregados, prêmio desligado, /parceiros/.
// Servidor simulado (page.route no Apps Script). Confere: até 13 não vê nada e o link some; 14-17 e sem idade (/comecar/) veem "só 18+"
// e nada é enviado; adulto entra com top 3 opcional, o Desafio Forja 30 começa e sai só {c, f} por dia; parceiro cria a turma,
// nome com telefone é recusado, painel esconde ativos e % com menos de 3; sem campo de prêmio; 44 px; console limpo; dados antigos intactos.
// Rode com: python3 -m http.server 8000 & node qa/parceiro.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const TODAY='2026-11-27';
const CFG=age=>({version:3,name:'Ana Teste',startDate:'2026-11-01',profile:age==null?{}:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const P=(extra={})=>Object.assign({log:{'2026-11-20':[{q:'q1',kind:'full',xp:10,stat:'mente',bonus:0,t:'2026-11-20T10:00:00'}]},extra:{},velho:'fica',
  rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:0},simple:{off:'2026-11-01'},rank:{on:true,asked:true,nick:'ana',uid:'u1aaaaaaaa',tk:'tk'+'A'.repeat(22)},
  ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}},extra);
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference',serviceWorkers:'block'});const p=await ctx.newPage();const errs=[],calls=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  const srv=o.srv||{};
  await ctx.route(/^https?:\/\/(?!localhost)/,async r=>{const u=r.request().url();
    if(/script\.google\.com\/macros/.test(u)&&r.request().method()==='POST'){let j={};try{j=JSON.parse(r.request().postData()||'{}');}catch(e){}calls.push(j);
      const h=srv[j.a];const out=typeof h==='function'?h(j):h||{ok:false,err:'acao'};return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(out)});}
    return r.abort();});
  await p.clock.install({time:new Date(o.time||TODAY+'T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[cfg,prog,pre]);
  await p.goto(U+route+(o.q||''));await p.waitForTimeout(1500);
  // popups do Sistema (check-in, level-up) não fazem parte deste teste: saem da frente sempre
  await p.evaluate(()=>{const z=()=>{document.querySelectorAll('.sysmodal').forEach(m=>m.remove());const l=document.getElementById('levelup');if(l)l.hidden=true;};z();setInterval(z,80);});await p.waitForTimeout(200);
  return {ctx,p,errs,calls};}
const LS=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
const vis=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&!e.hidden&&e.getClientRects().length>0;},sel);
const txt=(p,sel)=>p.evaluate(s=>(document.querySelector(s)||{}).textContent||'',sel);
const small=(p,sel)=>p.evaluate(s=>[...document.querySelectorAll(s)].filter(e=>e.getClientRects().length).filter(e=>{const r=e.getBoundingClientRect();return r.height<44;}).map(e=>e.textContent.trim().slice(0,30)),sel);
const Q='?pt=pabcdefghij&pn=Studio%20X';
const openMais=async p=>{await p.evaluate(()=>{const b=document.querySelector('#tabbar [data-go="mais"]');if(b)b.click();});await p.waitForTimeout(300);
  await p.evaluate(()=>{const s=document.getElementById('ptPanel');if(s&&s.classList.contains('fold')&&!s.classList.contains('open'))s.firstElementChild.click();});await p.waitForTimeout(300);};
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  for(const vp of (route?[{width:390,height:844},{width:1280,height:800}]:[{width:390,height:844}])){const vt=tag+' '+vp.width+'px';
  // até 13: nada, e o link some
  let {ctx,p,errs,calls}=await open(route,pre,CFG('kid'),P(),{q:Q,vp});
  ok(vt+' até 13: sem cartão e sem painel',!(await vis(p,'#ptCard'))&&!(await vis(p,'#ptPanel')));
  ok(vt+' até 13: link do parceiro descartado',await p.evaluate(k=>!localStorage.getItem(k),pre+'-parc-link'));
  ok(vt+' até 13: nada enviado',!calls.some(c=>/^pt-|^reg$/.test(c.a)),JSON.stringify(calls));await ctx.close();
  // 14-17
  ({ctx,p,errs,calls}=await open(route,pre,CFG('teen'),P(),{q:Q,vp}));
  ok(vt+' 14-17: cartão diz "só 18+"',await vis(p,'#ptCard')&&(await txt(p,'#ptCard')).includes('só para maiores de 18'),await txt(p,'#ptCard'));
  ok(vt+' 14-17: sem botão de entrar e sem envio',!(await p.locator('#ptCard button:has-text("Entrar no desafio")').count())&&!calls.some(c=>/^pt-/.test(c.a)));
  ok(vt+' 14-17: link sai da barra de endereço',!/pt=/.test(p.url()),p.url());
  await openMais(p);ok(vt+' 14-17: painel do parceiro não aparece',!(await vis(p,'#ptPanel')));
  await p.evaluate(()=>document.querySelector('#tabbar [data-go="hoje"]').click());await p.waitForTimeout(200);
  await p.locator('#ptCard button:has-text("Entendi")').click();await p.waitForTimeout(200);ok(vt+' 14-17: "Entendi" fecha e apaga o convite',!(await vis(p,'#ptCard'))&&await p.evaluate(k=>!localStorage.getItem(k),pre+'-parc-link'));
  await ctx.close();
  if(route){({ctx,p,errs,calls}=await open(route,pre,CFG(null),P(),{q:Q,vp}));
    ok(vt+' sem idade: conta como menor ("só 18+")',(await txt(p,'#ptCard')).includes('só para maiores de 18'));await ctx.close();}
  // adulto entra
  const srv={reg:{ok:true},'pt-join':j=>({ok:true,c:j.c,pn:'Studio X',m:20,n:5,pr:'NÃO MOSTRAR'}),'pt-day':{ok:true},'pt-top':{ok:true},'pt-out':{ok:true}};
  ({ctx,p,errs,calls}=await open(route,pre,CFG('adult'),P(),{q:Q,vp,srv}));
  ok(vt+' adulto: convite com título do parceiro',(await txt(p,'#ptCard h2')).includes('Desafio 30 · Studio X'));
  ok(vt+' adulto: explica o que o parceiro vê',(await txt(p,'#ptCard')).includes('só números da turma'));
  ok(vt+' adulto: botões com 44 px',!(await small(p,'#ptCard button, #ptCard label.chk')).length,JSON.stringify(await small(p,'#ptCard button, #ptCard label.chk')));
  await p.locator('#ptCard input[type=checkbox]').check();await p.locator('#ptCard button:has-text("Entrar no desafio")').click();await p.waitForTimeout(800);
  const jn=calls.find(c=>c.a==='pt-join');
  ok(vt+' adulto: registra faixa 18+ e entra com top 3',calls.some(c=>c.a==='reg'&&c.band==='adult')&&jn&&jn.c==='pabcdefghij'&&jn.top===1,JSON.stringify(calls));
  let st=await LS(p,pre);
  ok(vt+' adulto: prog.parc gravado e Desafio Forja 30 começou',st.parc&&st.parc.c==='pabcdefghij'&&st.parc.pn==='Studio X'&&st.parc.top===1&&st.f30&&st.f30.s===TODAY,JSON.stringify({pc:st.parc,f:st.f30}));
  ok(vt+' adulto: prêmio desligado não é guardado nem mostrado',!st.parc.pr&&!(await txt(p,'#ptCard')).includes('NÃO MOSTRAR'));
  ok(vt+' dados antigos intactos',st.velho==='fica'&&st.log['2026-11-20'].length===1&&st.rank.nick==='ana');
  ok(vt+' adulto: cartão de membro com a barra',await vis(p,'#ptCard .ptbar')&&(await txt(p,'#ptCard')).includes('de 20 dias'),await txt(p,'#ptCard'));
  await p.waitForTimeout(400);
  ok(vt+' entrar já conta o dia (nenhum pt-day extra)',!calls.some(c=>c.a==='pt-day'));
  const rl=async()=>{await p.reload();await p.waitForTimeout(1500);await p.evaluate(()=>setInterval(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.remove()),80));};
  await p.clock.fastForward('24:00:00');await p.waitForTimeout(2500);await rl();const dy=calls.filter(c=>c.a==='pt-day');
  ok(vt+' dia seguinte: pt-day só com código e treinou sim/não',dy.length===1&&Object.keys(dy[0]).sort().join()==='a,c,f,n,tk'&&dy[0].f===0,JSON.stringify(dy));
  await rl();ok(vt+' pt-day: 1 por dia (recarregar não reenvia)',calls.filter(c=>c.a==='pt-day').length===1);
  await p.locator('#ptCard input[type=checkbox]').uncheck();await p.waitForTimeout(400);st=await LS(p,pre);
  ok(vt+' tirar do top 3',calls.some(c=>c.a==='pt-top'&&c.top===0)&&st.parc.top===0);
  await p.locator('#ptCard .ptout').click();await p.locator('#ptCard .ptout').click();await p.waitForTimeout(400);st=await LS(p,pre);
  ok(vt+' sair: 2 toques, linha apagada e histórico local',calls.some(c=>c.a==='pt-out')&&!st.parc.c&&st.parc.h.length===1&&!(await vis(p,'#ptCard')));
  ok(vt+' console sem erros (aluno)',!errs.length,errs.join(' | '));await ctx.close();
  // treinou hoje: manda f=1
  ({ctx,p,errs,calls}=await open(route,pre,CFG('adult'),P({parc:{c:'pabcdefghij',pn:'Studio X',m:20,top:0,j:TODAY,sent:{d:TODAY,f:0},h:[]},forja:{ses:[{d:TODAY,tipo:'A'}]}}),{vp,srv}));
  await p.waitForTimeout(400);const d1=calls.filter(c=>c.a==='pt-day');
  ok(vt+' treinou depois: manda f=1 uma vez',d1.length===1&&d1[0].f===1,JSON.stringify(d1));
  ok(vt+' treinou: cartão confirma',(await txt(p,'#ptCard')).includes('Treino de hoje contou'));await ctx.close();
  // turma encerrada pelo parceiro
  ({ctx,p,errs,calls}=await open(route,pre,CFG('adult'),P({parc:{c:'pabcdefghij',pn:'Studio X',m:20,top:0,j:'2026-11-20',sent:{d:'2026-11-26',f:1},h:[]}}),{vp,srv:{'pt-day':{ok:false,err:'fora'},reg:{ok:true}}}));
  await p.waitForTimeout(500);st=await LS(p,pre);
  ok(vt+' turma encerrada: sai sozinho, sem erro',!st.parc.c&&st.parc.h.length===1&&!(await vis(p,'#ptCard'))&&!errs.length,errs.join('|'));await ctx.close();
  // parceiro cria a turma e vê o painel
  let stat={ok:true,c:'pqwertyuiop',pn:'Studio X',m:25,n:1,hoje:null,sem:null,top:[],min:3};
  const srv2={reg:{ok:true},'pt-new':j=>({ok:true,c:'pqwertyuiop',pn:j.pn,m:j.m}),'pt-stat':()=>stat,'pt-end':{ok:true}};
  ({ctx,p,errs,calls}=await open(route,pre,CFG('adult'),P(),{vp,srv:srv2}));
  await openMais(p);
  ok(vt+' parceiro: painel em Mais',await vis(p,'#ptPanel')&&(await txt(p,'#ptPanel')).includes('Turma Parceiro'));
  ok(vt+' parceiro: sem campo de prêmio (desligado)',!(await txt(p,'#ptPanel')).includes('Prêmio')&&(await p.locator('#ptPanel input.ptname').count())===1);
  await p.fill('#ptPanel input.ptname','Studio 31999998888');await p.locator('#ptPanel button:has-text("Criar link da turma")').click();await p.waitForTimeout(200);
  ok(vt+' parceiro: nome com telefone recusado no app',(await txt(p,'#ptPanel .ptmsg')).includes('sem telefone')&&!calls.some(c=>c.a==='pt-new'));
  await p.fill('#ptPanel input.ptname','Studio X');await p.locator('#ptPanel .ptmeta button:has-text("25 de 30")').click();
  await p.locator('#ptPanel button:has-text("Criar link da turma")').click();await p.waitForTimeout(900);
  const nw=calls.find(c=>c.a==='pt-new');st=await LS(p,pre);
  ok(vt+' parceiro: cria com nome e meta (sem prêmio)',nw&&nw.pn==='Studio X'&&nw.m===25&&!('pr' in nw)&&st.parcD.length===1&&st.parcD[0].c==='pqwertyuiop',JSON.stringify(nw));
  ok(vt+' painel com 1: ativos e % ocultos com aviso',(await txt(p,'#ptPanel .pttile[data-k="hoje"] b'))==='–'&&(await txt(p,'#ptPanel .pttile[data-k="sem"] b'))==='–'&&(await txt(p,'#ptPanel')).includes('menos de 3 participantes'),await txt(p,'#ptPanel .pttiles'));
  stat={ok:true,c:'pqwertyuiop',pn:'Studio X',m:25,n:4,hoje:3,sem:50,top:[{a:'zed',k:6},{a:'cau',k:4}],min:3};
  await p.locator('#ptPanel button:has-text("Atualizar")').click();await p.waitForTimeout(500);
  ok(vt+' painel com 4: números e top 3',(await txt(p,'#ptPanel .pttile[data-k="n"] b'))==='4'&&(await txt(p,'#ptPanel .pttile[data-k="sem"] b'))==='50%'&&(await txt(p,'#ptPanel .pttop')).includes('zed'),await txt(p,'#ptPanel .ptdash'));
  ok(vt+' painel: botões com 44 px',!(await small(p,'#ptPanel button')).length,JSON.stringify(await small(p,'#ptPanel button')));
  ok(vt+' painel: sem rolagem lateral',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.locator('#ptPanel .ptend').click();await p.locator('#ptPanel .ptend').click();await p.waitForTimeout(400);st=await LS(p,pre);
  ok(vt+' encerrar: 2 toques e some da lista',calls.some(c=>c.a==='pt-end')&&st.parcD.length===0);
  ok(vt+' console sem erros (parceiro)',!errs.length,errs.join(' | '));await ctx.close();
  }}
// reduce-motion: barra sem transição
{const {ctx,p,errs}=await open('comecar/','asc-u',CFG('adult'),P({parc:{c:'pabcdefghij',pn:'Studio X',m:20,top:0,j:TODAY,sent:{d:TODAY,f:0},h:[]}}),{rm:'reduce',srv:{reg:{ok:true},'pt-day':{ok:true}}});
  const tr=await p.evaluate(()=>{const i=document.querySelector('#ptCard .ptbar i');return i?getComputedStyle(i).transitionDuration:'x';});
  ok('reduce-motion: barra sem animação',tr==='0s',tr);ok('reduce-motion: console sem erros',!errs.length,errs.join('|'));await ctx.close();}
// página /parceiros/
for(const vp of [{width:390,height:844},{width:1280,height:800}]){const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  const r=await p.goto(U+'parceiros/');const t=await p.textContent('main');
  ok('/parceiros/ '+vp.width+'px: abre (200) e tem 3 passos',r.status()===200&&(await p.locator('ol.steps li').count())===3);
  ok('/parceiros/ '+vp.width+'px: WhatsApp escondido até o JV aprovar o número',!(await p.isVisible('#wa'))&&await p.isVisible('#soon'));
  ok('/parceiros/ '+vp.width+'px: diz 18+ e só números',t.includes('maiores de 18')&&t.includes('só números da turma'));
  ok('/parceiros/ '+vp.width+'px: cabe em 1 tela no desktop e sem rolagem lateral',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)&&(vp.width<1000||await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight*1.15)),String(await p.evaluate(()=>document.documentElement.scrollHeight)));
  ok('/parceiros/ '+vp.width+'px: console sem erros',!errs.length,errs.join('|'));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' falha(s)':'tudo verde ('+R.length+')');process.exit(f?1:0);})();
