// Cartas do Sistema (tools/misterio.*): mistério sem sorteio. Carta "???" revelada por conquista, prêmio fixo (Ouro + XP) 1 vez,
// nada comprável, sinal da semana (até 12 palavras) em Hoje no máximo 1 vez por dia, save antigo não perde nada; raiz e /comecar/.
// Rode com: python3 -m http.server 8003 --bind 127.0.0.1 & PORT=8003 node qa/misterio.test.js
const {chromium}=require('playwright');const fs=require('fs');const U='http://localhost:'+(process.env.PORT||8003)+'/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=age=>({version:3,name:'Teste',startDate:'2026-11-01',profile:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const E=q=>({q,kind:'full',xp:10,stat:'mente',bonus:0,t:'2026-11-20T10:00:00.000Z'});
const L1={'2026-11-26':[E('q1')]};
const L3={'2026-11-24':[E('q1')],'2026-11-25':[E('q1')],'2026-11-26':[E('q1')],'2026-11-27':[E('q1')]};
const P=(log,extra={})=>Object.assign({log,extra:{},velho:'fica',sec:{s_zen:'2026-11-02'},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:0},ouro:5,ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}},extra);
const OC=st=>(st.ouroX.h||[]).filter(h=>/^Carta /.test(h.w)).reduce((a,h)=>a+h.v,0);// Ouro pago pelas cartas
const LS=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),k);
const SHOT='/mnt/project-files/missao-noite/';
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},deviceScaleFactor:o.dpr||1,reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date(o.time||'2026-11-27T10:00:00')});
  if(prog){await p.goto(U+route+'__seed__');
    await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[cfg,prog,pre]);}
  await p.goto(U+route);await p.waitForTimeout(1800);return {ctx,p,errs};}
// fecha as janelas do Sistema pelo botão (remover do DOM trava a fila do sysPop) e devolve o texto delas
async function shut(p){let t='';for(let i=0;i<8;i++){const x=await p.evaluate(()=>{const m=document.querySelector('.sysmodal:not([hidden])');if(!m)return null;const t=m.textContent;const b=m.querySelector('button.go')||m.querySelector('button');if(b)b.click();return t;});if(x==null)break;t+=x+' | ';await p.waitForTimeout(250);}return t;}
const go=(p,t)=>p.evaluate(t=>document.querySelector('#tabbar [data-go="'+t+'"]').click(),t);
const lineOn=p=>p.evaluate(()=>{const l=document.getElementById('myLine');return !!l&&!l.hidden&&l.getClientRects().length>0;});
// textos curtos: dica e sinal com no máximo 12 palavras
{const src=fs.readFileSync(__dirname+'/../tools/misterio.js','utf8');const words=s=>s.trim().split(/\s+/).length;
  const P_=[...src.match(/const MY_P=\{([\s\S]*?)\};/)[1].matchAll(/m_\w+:"([^"]+)"/g)].map(m=>m[1]);
  const D_=[...src.matchAll(/\["m_\w+","[^"]+","[^"]+","([^"]+)"/g)].map(m=>m[1]);
  ok('6 cartas e 6 sinais, todos com até 12 palavras',P_.length===6&&D_.length===6&&P_.concat(D_).every(s=>words(s)<=12),JSON.stringify(P_.concat(D_).filter(s=>words(s)>12)));
  ok('sem sorteio no código (Math.random fora do módulo)',!/Math\.random/.test(src));}
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  // save antigo (sem prog.myst) com 4 dias seguidos: a 1ª carta se revela sozinha
  let {ctx,p,errs}=await open(route,pre,CFG('teen'),P(L3));
  const pop=await shut(p);
  ok(tag+' 3 dias seguidos: janela CARTA REVELADA com Brasa Acesa',/CARTA REVELADA/.test(pop)&&/Brasa Acesa/.test(pop)&&/\+20 Ouro/.test(pop),pop.slice(0,300));
  let st=await LS(p,pre+'-prog');
  ok(tag+' grava só prog.myst e paga fixo: +20 Ouro e 1 entrada ach:myst:m_3d (+10 XP)',st.myst&&st.myst.c.m_3d==='2026-11-27'&&OC(st)===20&&st.ouroX.got['myst:m_3d']&&Object.values(st.log).flat().filter(e=>e.q==='ach:myst:m_3d'&&e.xp===10).length===1,JSON.stringify({m:st.myst,o:st.ouro}));
  ok(tag+' migração: nada some (log, segredos, classe, campo extra)',st.velho==='fica'&&st.sec.s_zen==='2026-11-02'&&st.rpg.cls.id==='mago'&&['2026-11-24','2026-11-25','2026-11-26'].every(k=>st.log[k].length===1&&st.log[k][0].q==='q1'));
  await go(p,'prog');await p.waitForTimeout(300);
  ok(tag+' painel Cartas do Sistema: 1 revelada e as outras "???" com progresso',await p.evaluate(()=>{const p=document.getElementById('myPanel');if(!p||p.hidden)return false;const on=p.querySelectorAll('.mycard.on'),off=[...p.querySelectorAll('.mycard:not(.on)')];
    return on.length===1&&/Brasa Acesa/.test(on[0].textContent)&&off.length===4&&off.every(c=>/\?\?\?/.test(c.textContent)&&c.querySelector('[role="progressbar"]'))&&/1 \/ 5/.test(p.querySelector('.qhead').textContent);}));
  ok(tag+' 14-17: sem a carta da Task que paga',!(await p.evaluate(()=>/Tesouro|cofre/.test(document.getElementById('myPanel').textContent))));
  ok(tag+' nada comprável: painel sem botão de compra, preço ou Pix',await p.evaluate(()=>{const p=document.getElementById('myPanel');return !p.querySelector('button,a,input')&&!/comprar|R\$|pix|sorteio/i.test(p.textContent);}));
  ok(tag+' console limpo',errs.length===0,errs.join(' | '));
  // recarregar não paga de novo
  await p.reload();await p.waitForTimeout(1800);const pop2=await shut(p);st=await LS(p,pre+'-prog');
  ok(tag+' recarregar: sem nova janela e sem pagar de novo',!/CARTA REVELADA/.test(pop2)&&OC(st)===20&&Object.values(st.log).flat().filter(e=>e.q==='ach:myst:m_3d').length===1,pop2.slice(0,200)+' ouro='+st.ouro);
  // a Loja do Ouro continua sem carta/baú/sorteio para comprar
  await p.evaluate(()=>{const b=document.getElementById('ouroPill');if(b)b.click();});await p.waitForTimeout(300);
  const lojaOk=await p.evaluate(()=>{const m=document.getElementById('orModal');window.__lj=m?m.textContent:'(sem modal)';return !!m&&!/carta|\?\?\?|mistério|surpresa|sorteio/i.test(m.textContent.split('Extrato')[0].replace(/não entra em sorteio/gi,''));});ok(tag+' Loja do Ouro não vende carta nem mistério',lojaOk,await p.evaluate(()=>String(window.__lj).slice(0,600)));
  await ctx.close();
  // jogador novo (1 dia): tudo selado, sinal da semana em Hoje, ✕ esconde até amanhã
  ({ctx,p,errs}=await open(route,pre,CFG('teen'),P(L1)));await shut(p);await go(p,'hoje');await p.waitForTimeout(300);
  st=await LS(p,pre+'-prog');
  ok(tag+' 1 dia: nenhuma carta revelada',!st.myst||!Object.keys(st.myst.c||{}).length);
  ok(tag+' Hoje: 1 sinal do Sistema, curto e com toque de 44 px',await lineOn(p)&&await p.evaluate(()=>{const l=document.getElementById('myLine');const t=l.querySelector('.mytxt').textContent.replace(/[«»]/g,'').trim();
    return /\[ SISTEMA \] SINAL/.test(l.textContent)&&t.split(/\s+/).length<=12&&document.getElementById('myLineGo').getBoundingClientRect().height>=44&&document.getElementById('myLineX').getBoundingClientRect().height>=44&&document.querySelectorAll('#myLine').length===1;}));
  await p.click('#myLineGo');await p.waitForTimeout(400);
  ok(tag+' tocar no sinal leva às Cartas em Progresso',await p.evaluate(()=>{const e=document.getElementById('myPanel');return document.body.dataset.tab==='prog'&&!!e&&e.getClientRects().length>0&&/Sinal da semana/.test(e.textContent);}));
  if(route){await p.screenshot({path:'/tmp/my-sealed.png'}).catch(()=>{});}
  await go(p,'hoje');await p.waitForTimeout(200);await p.click('#myLineX');await p.waitForTimeout(200);
  st=await LS(p,pre+'-prog');ok(tag+' ✕ esconde o sinal até amanhã (prog.myst.hd)',!(await lineOn(p))&&st.myst.hd==='2026-11-27');
  await p.reload();await p.waitForTimeout(1500);await shut(p);await go(p,'hoje');await p.waitForTimeout(200);
  ok(tag+' recarregar no mesmo dia: sinal continua escondido',!(await lineOn(p)));await ctx.close();
  // dia seguinte: volta
  ({ctx,p,errs}=await open(route,pre,CFG('teen'),Object.assign(P(L1),{myst:{c:{},hd:'2026-11-27'}}),{time:'2026-11-28T10:00:00'}));await shut(p);await go(p,'hoje');await p.waitForTimeout(200);
  ok(tag+' no dia seguinte o sinal volta',await lineOn(p));
  ok(tag+' console limpo (sinal)',errs.length===0,errs.join(' | '));await ctx.close();
  // 18+ com a linha das Tasks que pagam: o sinal não aparece junto (1 aviso misterioso por vez)
  ({ctx,p,errs}=await open(route,pre,CFG('adult'),P(L1)));await shut(p);await go(p,'hoje');await p.waitForTimeout(300);
  ok(tag+' 18+: com a linha das Tasks em Hoje, o sinal fica de fora',await p.evaluate(()=>{const t=document.getElementById('tpLine');const m=document.getElementById('myLine');return !!t&&!t.hidden&&(!m||m.hidden);}));
  ok(tag+' 18+: carta da 1ª Task que paga aparece selada',await p.evaluate(()=>document.querySelectorAll('#myPanel .mycard').length===6));
  await ctx.close();
  // várias conquistas de uma vez: 1 janela só, prêmio somado; reduce-motion sem giro; desktop sem erro
  const big={};for(let i=0;i<8;i++){const d=new Date(2026,10,20+i);const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');big[k]=[E('q1'),E('q1b')];}
  ({ctx,p,errs}=await open(route,pre,CFG('teen'),P(big),{rm:'reduce',vp:{width:1280,height:800}}));const popB=await shut(p);st=await LS(p,pre+'-prog');
  ok(tag+' 8 dias e 16 missões: 3 cartas numa janela só (Brasa, Dez Passos, Cometa)',(popB.match(/CARTA REVELADA/g)||[]).length===1&&/3 cartas reveladas/.test(popB)&&['m_3d','m_q10','m_7d'].every(k=>st.myst.c[k])&&OC(st)===90,popB.slice(0,300)+' ouro='+st.ouro);
  await go(p,'prog');await p.waitForTimeout(300);
  ok(tag+' reduce-motion: carta nova sem animação',await p.evaluate(()=>[...document.querySelectorAll('#myPanel .mycard.on .myico')].every(e=>getComputedStyle(e).animationName==='none')));
  ok(tag+' desktop 1280: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
}
// prints de celular (iPhone 390x844 @2x): cartas seladas e carta revelada
try{fs.mkdirSync(SHOT,{recursive:true});
  let {ctx,p}=await open('comecar/','asc-u',CFG('adult'),P(L1),{dpr:2});await shut(p);await go(p,'prog');await p.waitForTimeout(300);
  await p.evaluate(()=>{const e=document.getElementById('myPanel');if(e._fset)e._fset(true);e.scrollIntoView({block:'start'});});await p.waitForTimeout(300);
  await p.screenshot({path:SHOT+'misterio-1-seladas.png'});await ctx.close();
  ({ctx,p}=await open('comecar/','asc-u',CFG('adult'),P(L3),{dpr:2}));
  for(let i=0;i<8;i++){const top=await p.evaluate(()=>{const m=document.querySelector('.sysmodal:not([hidden])');if(!m)return 'none';if(/CARTA REVELADA/.test(m.textContent))return 'card';m.querySelector('button.go,button').click();return 'next';});if(top!=='next')break;await p.waitForTimeout(400);}await p.waitForTimeout(3000);
  await p.screenshot({path:SHOT+'misterio-2-revelada.png'});await shut(p);await ctx.close();
  ({ctx,p}=await open('comecar/','asc-u',CFG('adult'),P(L3,{myst:{c:{m_3d:'2026-11-27'}}}),{dpr:2}));await shut(p);await go(p,'prog');await p.waitForTimeout(300);
  await p.evaluate(()=>{const e=document.getElementById('myPanel');if(e._fset)e._fset(true);e.scrollIntoView({block:'start'});});await p.waitForTimeout(300);
  await p.screenshot({path:SHOT+'misterio-3-painel.png'});await ctx.close();}catch(e){console.log('prints: '+e.message);}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
