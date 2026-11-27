// Trilha Primeira Renda (tools/renda.*) + trava de idade 18+ (tools/idade.js), spec do ATLAS (#22, 7221245467).
// Confere: até 13 e sem idade no /comecar/ não veem nada; 14-17 vê "Primeiro passo profissional"; 18+ vê "Primeiro freela";
// quem passou de 14-17 para 18+ espera 7 dias; autorização de responsável (parent) segura a versão 14-17;
// "Fiz" dá +20 de Ouro uma vez só (desmarcar e marcar não paga de novo); trilha completa +50; aviso fixo; links oficiais;
// nada do que o jogador escreve é guardado; dados antigos intactos; reduce-motion; 360 px e desktop; raiz e /comecar/.
// Rode com: python3 -m http.server 8000 & node qa/renda.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=age=>({version:3,name:'Teste',startDate:'2026-11-01',profile:age==null?{}:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const P=(extra={})=>Object.assign({log:{'2026-11-20':[{q:'q1',kind:'full',xp:10,stat:'mente',bonus:0,t:'2026-11-20T10:00:00'}]},extra:{},velho:'fica',rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:0},ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}},extra);
const LS=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date(o.time||'2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre,x])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify(Object.assign({asked:1},x)));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[cfg,prog,pre,o.tele||{}]);
  await p.goto(U+route);await p.waitForTimeout(1300);
  await p.evaluate(()=>{document.querySelectorAll('.sysmodal').forEach(m=>m.remove());const b=document.querySelector('#tabbar [data-go="foco"]');if(b)b.click();});await p.waitForTimeout(300);
  // telas enxutas: a trilha vem recolhida numa linha; um toque abre
  await p.evaluate(()=>{const s=document.getElementById('rdPanel');if(s&&s.classList.contains('fold')&&!s.classList.contains('open'))s.firstElementChild.click();});await p.waitForTimeout(200);
  return {ctx,p,errs};}
const vis=p=>p.evaluate(()=>{const e=document.getElementById('rdPanel');return !!e&&!e.hidden&&e.getClientRects().length>0;});
const sub=p=>p.evaluate(()=>(document.querySelector('#rdPanel .rdsub')||{}).textContent||'');
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  let {ctx,p,errs}=await open(route,pre,CFG('kid'),P());
  ok(tag+' até 13: trilha não aparece',!(await vis(p))&&!(await p.locator('text=Primeira Renda').count()));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG(null),P()));
  if(route)ok(tag+' sem idade: não aparece (pode ser menor de 14)',!(await vis(p)));
  else ok(tag+' sem idade no app do criador: versão 18+',(await sub(p)).startsWith('Primeiro freela'),await sub(p));
  await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('teen'),P()));
  ok(tag+' 14-17: "Primeiro passo profissional"',await vis(p)&&(await sub(p)).startsWith('Primeiro passo profissional'),await sub(p));
  const txt=await p.textContent('#rdPanel');
  ok(tag+' 14-17: nada da versão 18+ (MEI, freela, carnê-leão)',!/\bMEI\b/.test(txt)&&!/freela|carnê|proposta/i.test(txt));
  ok(tag+' aviso fixo no rodapé',txt.includes('Conteúdo informativo. Não é orientação jurídica, contábil nem promessa de vaga ou renda.'));
  ok(tag+' sem promessa de ganho',!/ganhe R\$|renda garantida/i.test(txt));
  const hrefs=await p.$$eval('#rdPanel a',as=>as.map(a=>[a.href,a.target,a.rel]));
  ok(tag+' links só oficiais (gov.br/planalto) e em aba nova',hrefs.length>0&&hrefs.every(([h,t,r])=>/^https:\/\/(www\.)?(gov\.br|planalto\.gov\.br|escolavirtual\.gov\.br)\//.test(h)&&t==='_blank'&&/noopener/.test(r)),JSON.stringify(hrefs));
  // Fiz: +20 uma vez
  await p.locator('#rdPanel .rdm.big .rdbtn').dispatchEvent('click');await p.waitForTimeout(400);let st=await LS(p,pre);
  ok(tag+' Fiz: missão marcada e +20 de Ouro',st.renda.a['pr-a01']==='2026-11-27'&&st.ouro===20,JSON.stringify({r:st.renda,o:st.ouro}));
  ok(tag+' próxima missão vira a 2ª',(await p.getAttribute('#rdPanel .rdm.big','data-rd'))==='pr-a02');
  await p.locator('#rdPanel summary:has-text("Todas as missões")').click();await p.locator('#rdPanel [data-rd="pr-a01"] .rdbtn').click();await p.waitForTimeout(300);
  await p.locator('#rdPanel .rdm.big .rdbtn').click();await p.waitForTimeout(300);st=await LS(p,pre);
  ok(tag+' desmarcar e marcar de novo não paga de novo',st.ouro===20&&st.renda.a['pr-a01'],String(st.ouro));
  ok(tag+' só guarda o dia (nenhum texto do jogador)',Object.values(st.renda.a).every(v=>/^\d{4}-\d{2}-\d{2}$/.test(v))&&Object.keys(st.renda).sort().join()==='a,b');
  for(let i=0;i<9;i++){await p.locator('#rdPanel .rdm.big .rdbtn').dispatchEvent('click');await p.waitForTimeout(200);}
  st=await LS(p,pre);
  ok(tag+' trilha completa: 10/10, teto de 200 no dia respeitado (+50 fica para amanhã)',Object.keys(st.renda.a).length===10&&!st.ouroX.got['pr:fim:a']&&st.ouro===200,JSON.stringify({n:Object.keys(st.renda.a).length,o:st.ouro,d:st.ouroX.d}));
  await p.clock.fastForward('24:00:00');await p.reload();await p.waitForTimeout(2500);st=await LS(p,pre);
  ok(tag+' no dia seguinte entra o +50 da trilha, uma vez só',st.ouro===250&&st.ouroX.got['pr:fim:a']==='2026-11-28',JSON.stringify({o:st.ouro,g:st.ouroX.got['pr:fim:a']}));
  ok(tag+' campos antigos intactos',st.velho==='fica'&&st.rpg.cls.id==='mago'&&st.log['2026-11-20'].length===1);
  ok(tag+' console limpo (14-17)',errs.length===0,errs.join(' | '));await ctx.close();
  // 18+
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P(),{rm:'reduce'}));
  ok(tag+' 18+: "Primeiro freela"',(await sub(p)).startsWith('Primeiro freela'),await sub(p));
  ok(tag+' 18+: tem MEI e nenhum link de afiliado',(await p.textContent('#rdPanel')).includes('MEI')&&!(await p.$$eval('#rdPanel a',as=>as.some(a=>/tag=|afil|amzn|mercadolivre/i.test(a.href)))));
  ok(tag+' reduce-motion: abre sem erro',errs.length===0,errs.join(' | '));await ctx.close();
  // 18+ com autorização de responsável gravada: segue na 14-17
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P(),{tele:{parent:1}}));
  ok(tag+' 18+ com parent gravado: versão 14-17',(await sub(p)).startsWith('Primeiro passo'),await sub(p));await ctx.close();
  // passou de 14-17 para 18+: 7 dias na versão 14-17
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P({idade:{a:'teen',mn:1,t0:'2026-11-01'}})));
  st=await LS(p,pre);
  ok(tag+' 14-17 → 18+: espera 7 dias (versão 14-17 hoje)',(await sub(p)).startsWith('Primeiro passo')&&st.idade.up==='2026-11-27'&&st.idade.a==='young',JSON.stringify(st.idade));
  await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P({idade:{a:'young',mn:1,up:'2026-11-27',t0:'2026-11-01'}}),{time:'2026-12-04T10:00:00'}));
  ok(tag+' 14-17 → 18+: 7 dias depois vira "Primeiro freela"',(await sub(p)).startsWith('Primeiro freela'),await sub(p));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P({idade:{a:'young',mn:1,up:'2026-11-27',t0:'2026-11-01'}}),{time:'2026-12-03T10:00:00'}));
  ok(tag+' 14-17 → 18+: no 6º dia ainda espera',(await sub(p)).startsWith('Primeiro passo'),await sub(p));await ctx.close();
  // telas: 360 px e desktop, sem rolagem lateral
  for(const vp of [{width:360,height:740},{width:1280,height:800}]){({ctx,p,errs}=await open(route,pre,CFG('teen'),P(),{vp}));
    const w=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);const h=await p.evaluate(()=>{const b=document.querySelector('#rdPanel .rdm.big .rdbtn');const r=b.getBoundingClientRect();return r.height>=44;});
    ok(tag+' '+vp.width+'px: sem rolagem lateral e botão de 44 px',w&&h);await ctx.close();}
}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
