// IDs únicos na página (acessibilidade): o painel do Desafio Forja 30 na aba Mais (tools/ouro.js) repetia o id
// "f30BoxP" no invólucro e no quadro de dentro. Leitor de tela e aria-* apontam para o 1º e erram o alvo.
// Confere nas 2 rotas, celular/desktop, com e sem reduce-motion, antes e depois de entrar no desafio, depois de recarregar.
// Rode com: python3 -m http.server 8000 & node qa/ids-unicos.test.js
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'s_treino',title:'Mexer o corpo 20 min',xp:25,stat:'corpo',minTitle:'5 min'}]};
const FJ={ok:true,pt:1,pil:false,lv:{},last:{},ses:[{d:'2026-11-24',tipo:'B',min:30,r:0}],dias:[0,2,4]};
const P=f30=>{const o={log:{'2026-11-20':[{q:'q1',kind:'full',xp:10,stat:'mente',bonus:0,t:'2026-11-20T10:00:00'}]},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},forja:FJ,simple:{off:'2026-11-01'},age:'18',velho:'fica'};if(f30)o.f30=f30;return o;};
const dups=p=>p.evaluate(()=>{const m={};for(const e of document.querySelectorAll('[id]'))m[e.id]=(m[e.id]||0)+1;return Object.entries(m).filter(x=>x[1]>1).map(x=>x[0]+'×'+x[1]);});
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']])for(const vp of [{width:390,height:844},{width:1280,height:800}])for(const rm of ['no-preference','reduce'])for(const f30 of [null,{s:'2026-11-20',d:{},lv0:6}]){
  const tag=(route?'/comecar/':'/')+' '+vp.width+(rm==='reduce'?' rm':'')+(f30?' no desafio':' fora do desafio');
  const ctx=await b.newContext({viewport:vp,reducedMotion:rm});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date('2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG,P(f30),pre]);
  await p.goto(U+route);await p.waitForTimeout(1800);
  let d=await dups(p);ok(tag+': nenhum id repetido na página',d.length===0,d.join(', '));
  ok(tag+': 1 painel do desafio na aba Mais, quadro dentro do invólucro',await p.evaluate(()=>{const w=document.querySelectorAll('#f30WrapP'),q=document.querySelectorAll('#f30BoxP');return w.length===1&&q.length===1&&w[0].contains(q[0])&&!!w[0].closest('#fjBody');}));
  if(!f30){await p.locator('#f30JoinP').first().dispatchEvent('click');await p.waitForTimeout(500);
    const st=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');ok(tag+': "Entrar no desafio" do painel funciona',!!(st.f30&&st.f30.s==='2026-11-27'),JSON.stringify(st.f30));
    d=await dups(p);ok(tag+': depois de entrar, ids seguem únicos e 1 painel só',d.length===0&&await p.locator('#f30WrapP').count()===1,d.join(', '));}
  await p.reload();await p.waitForTimeout(1600);d=await dups(p);
  const st=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
  ok(tag+': recarregar mantém ids únicos e dados antigos',d.length===0&&st.velho==='fica'&&st.log['2026-11-20'].length===1&&st.forja.ses.length===1&&st.rpg.cls.id==='mago',d.join(', '));
  ok(tag+': console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
await b.close();const f=R.filter(x=>x.startsWith('FAIL'));console.log(R.join('\n'));console.log((R.length-f.length)+'/'+R.length+' passaram');process.exit(f.length?1:0);})();
