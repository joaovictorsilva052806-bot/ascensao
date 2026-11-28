// Código curto da Guilda (tools/codigo.js, dica do JV 28/11): em vez do link inteiro, 8 letras digitadas em Amigos → "Entrar numa Guilda".
// Duas contas por um servidor falso compartilhado (como o convite-e2e). Confere:
// 1) JV vê o código da guilda Família (XXXX-XXXX, alfabeto sem 0/O/1/I/L) na caixa do link.
// 2) Lari (já joga, no ranking) digita o código: sai F com "#hash" e assinatura; o código NUNCA vai para a planilha.
// 3) JV recarrega: Lari vira amiga e cai na Família; G assinado sai uma vez. 4) Lari recarrega: JV vira amigo; F normal sai (servidor vê a amizade).
// 5) Código errado não vira amizade; G forjado (sem o código) não vira amizade; caracteres proibidos avisam; o próprio código avisa.
// 6) Sem ranking: o código fica guardado e o pedido sai ao entrar. 7) Menor de 14: nada aparece. 320 px sem rolagem lateral; sem erro de console.
// Rode com: python3 -m http.server 8000 & node qa/guilda-codigo.test.js
const {chromium,devices}=require('playwright');const U='http://localhost:'+(process.env.PORT||8000)+'/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const IGN=/Failed to load resource|ERR_|navigator.vibrate/;
const PUB='https://joaovictorsilva052806-bot.github.io/ascensao/';
const NOW=new Date('2026-11-26T15:00:00');
// ---- servidor falso: um só para as duas contas ----
const HEAD='nome,xp,nivel,,tipo,de,para,esquadrao,data,,pnick,seq,desafios,avatar,attrs';
function store(){const S={rank:{},ev:[],pub:{},posts:[]};
  S.csv=()=>[HEAD,...Object.entries(S.rank).map(([n,[x,l]])=>n+','+x+','+l),...S.ev.map(e=>',,,,'+e.join(',')),
    ...Object.values(S.pub).map(p=>',,,,,,,,,,'+p.join(','))].join('\n')+'\n';
  S.rows=(k)=>S.ev.filter(e=>e[0]===k);return S;}
async function mock(ctx,S,who){
  await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:'[]'}));
  await ctx.route('https://docs.google.com/**',r=>{const q=r.request();
    if(q.method()==='POST'){const v=new URLSearchParams(q.postData()||'').get('entry.807978446')||'';S.posts.push([who,v]);
      // como o servidor: tira o token (último campo tk…) e grava a linha
      const p=v.split('|');if(/^tk/.test(p[p.length-1]))p.pop();
      if(p[0]==='R')S.rank[p[2]]=[+p[5]||0,+p[6]||1];else if(/^[IJFGK]$/.test(p[0]))S.ev.push(p.slice(0,5));else if(p[0]==='P')S.pub[p[1]]=[p[1],p[2],p[3],p[4],p[6]||''];
      return r.fulfill({status:200,body:''});}
    return r.fulfill({status:200,contentType:'text/csv',body:S.csv()});});}
// ---- contas ----
const CFG=(name,age)=>({version:3,name,startDate:'2026-11-20',profile:{age},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]});
const PROG=(x={})=>Object.assign({log:{'2026-11-24':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}],'2026-11-25':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'y'}]},
  extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},gd:{off:1},velho:'fica'},x);
const JV=()=>PROG({rank:{on:true,asked:true,uid:'jv123456',nick:'JV'},friends:{l:[],pend:{},seen:{}},
  turmas:{cur:'tf',l:[{id:'t0',n:'Minha turma',e:'⭐',c:'',m:[]},{id:'tf',n:'Família',e:'🏠',c:'',m:[]}]}});
async function newPage(b,dev,S,who,o={}){const ctx=await b.newContext(Object.assign({},devices[dev],o.ctx||{}));if(S)await mock(ctx,S,who);
  if(o.init)await ctx.addInitScript(o.init);
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!IGN.test(m.text()))errs.push(m.text())});
  // relógio fixo (o dia não vira no meio do teste); fica fora do cenário do aviso, porque apaga o registro de navegação que ele lê
  if(o.clock!==false)await p.clock.install({time:NOW});
  return {ctx,p,errs};}
// semeia numa página do mesmo site que não roda o app, depois abre o app
async function seed(p,cfg,prog){await p.goto(U+'privacidade/');await p.evaluate(([c,o])=>{
  if(c){localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');}
  localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));},[cfg,prog]);}
// fecha os avisos do Sistema e o "subiu de nível"; o pedido de amizade (#frModal) fica, para o teste ver se ele aparece
async function pops(p){for(let i=0;i<10;i++){const m=p.locator('.sysmodal:not(#frModal):visible button.go, #levelup:visible #luClose');if(!(await m.count()))break;await m.first().dispatchEvent('click');await p.waitForTimeout(250);}}
async function go(p,route){await p.goto(U+route);await p.waitForTimeout(1500);await pops(p);}
async function amigos(p){await p.evaluate(()=>{const t=document.querySelector('#tabbar [data-go="amigos"]');if(t)t.click();});await p.waitForTimeout(500);await pops(p);}
const prog=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')||'null'));
const fam=st=>((st&&st.turmas&&st.turmas.l)||[]).find(t=>t.n==='Família');
const has=(a,n)=>(a||[]).some(x=>String(x).toLowerCase()===n.toLowerCase());
const local=u=>u.replace(PUB,U);
// primeiro jogo pelo caminho real (onboarding rápido); idade pelo botão de faixa
async function onboard(p,name,ages){await p.fill('#q_name',name);await p.click('#q_n0');await p.waitForTimeout(400);
  for(let i=0;i<16&&!(await p.$('#q_done:visible'));i++){let btn=null;for(const t of ages.concat(['Pular']))if(btn=await p.$(`button:visible:has-text("${t}")`))break;
    if(!btn)for(const x of await p.$$('button:visible')){const id=(await x.getAttribute('id'))||'';if(id.startsWith('q_')&&!['q_bk','q_full'].includes(id)){btn=x;break;}}
    if(!btn)break;await btn.click();await p.waitForTimeout(400);}
  if(await p.$('#q_done:visible'))await p.click('#q_done');await p.waitForTimeout(2200);await pops(p);}
async function typeCode(p,v){await amigos(p);await p.evaluate(()=>{const d=document.querySelector('.clpaste');if(d)d.open=true;});await p.fill('#clIn',v);await p.locator('.clpaste button.go').click();await p.waitForTimeout(1800);return p.textContent('.clmsg');}
(async()=>{const b=await chromium.launch();
for(const dev of ['iPhone 13','Pixel 7']){const tag=dev;const S=store();
  const A=await newPage(b,dev,S,'A');await seed(A.p,CFG('João Victor','adult'),JV());await go(A.p,'comecar/');await amigos(A.p);
  const kd=await A.p.evaluate(()=>{const e=document.querySelector('#tmPanel .kdcode');return e?e.textContent.trim():'';});
  ok(tag+' 1: código da guilda aparece no formato XXXX-XXXX',/^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/.test(kd),kd);
  ok(tag+' 1: texto cita a guilda Família e "Entrar numa Guilda"',/Família/.test(await A.p.textContent('#tmPanel .kdbox'))&&/Entrar numa Guilda/.test(await A.p.textContent('#tmPanel .kdbox')));
  let st=await prog(A.p);ok(tag+' 1: código salvo na guilda (t.k), links antigos intactos',fam(st)&&fam(st).k===kd.replace('-','').toLowerCase()&&st.turmas.l.find(t=>t.id==='t0').n==='Minha guilda',JSON.stringify(st.turmas));
  ok(tag+' 1: sem rolagem lateral',await A.p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const code=kd.replace('-','').toLowerCase();
  // 2) Lari digita
  const B=await newPage(b,dev,S,'B');await seed(B.p,CFG('Larissa Souza','adult'),PROG({rank:{on:true,asked:true,uid:'lari1234',nick:'Lari'}}));await go(B.p,'comecar/');
  ok(tag+' 2: "Entrar numa Guilda" em Amigos',(await (amigos(B.p),B.p.waitForTimeout(300),B.p.textContent('.clpaste summary')))==='🗝️ Entrar numa Guilda');
  let m=await typeCode(B.p,'O0I1-LLLL');ok(tag+' 5: caracteres proibidos avisam',/Confira o código/.test(m),m);
  m=await typeCode(B.p,' '+kd.toLowerCase()+' ');ok(tag+' 2: mensagem de enviado',/enviado/.test(m),m);
  const F=S.rows('F').filter(e=>e[1]==='Lari');
  ok(tag+' 2: F com #hash e assinatura',F.length===1&&/^#[0-9a-f]{12}$/.test(F[0][2])&&/^cv[0-9a-f]{12}$/.test(F[0][3]),JSON.stringify(F));
  ok(tag+' 2: o código nunca vai para a planilha',!S.posts.some(([,v])=>v.toLowerCase().includes(code)),JSON.stringify(S.posts.map(x=>x[1])));
  // 3) JV recarrega
  await A.p.reload();await A.p.waitForTimeout(1500);await pops(A.p);await amigos(A.p);
  await A.p.waitForFunction(()=>JSON.parse(localStorage.getItem('asc-u-prog')).friends.l.includes('Lari'),null,{timeout:10000}).catch(()=>{});
  st=await prog(A.p);ok(tag+' 3: Lari virou amiga de JV',has(st.friends.l,'Lari'),JSON.stringify(st.friends));
  ok(tag+' 3: Lari caiu na Família',has(fam(st).m,'Lari'),JSON.stringify(st.turmas.l.map(t=>[t.n,t.m])));
  let G=S.rows('G').filter(e=>e[1]==='JV'&&e[2]==='Lari');ok(tag+' 3: G assinado mandado uma vez',G.length===1&&/^cv[0-9a-f]{12}$/.test(G[0][3]),JSON.stringify(G));
  await A.p.reload();await A.p.waitForTimeout(2500);G=S.rows('G').filter(e=>e[1]==='JV'&&e[2]==='Lari');ok(tag+' 3: recarregar de novo não repete o G',G.length===1,JSON.stringify(G));
  // 5) G forjado por quem não sabe o código
  S.ev.push(['G','Mallory','Lari','cv0123456789ab','2026-11-26']);
  // 4) Lari recarrega
  await B.p.reload();await B.p.waitForTimeout(1500);await pops(B.p);
  await B.p.waitForFunction(()=>JSON.parse(localStorage.getItem('asc-u-prog')).friends.l.includes('JV'),null,{timeout:10000}).catch(()=>{});await B.p.waitForTimeout(800);
  st=await prog(B.p);ok(tag+' 4: JV virou amigo de Lari',has(st.friends.l,'JV'),JSON.stringify(st.friends));
  ok(tag+' 5: G forjado (sem o código) não vira amizade',!has(st.friends.l,'Mallory'),JSON.stringify(st.friends));
  ok(tag+' 4: pedido com código some depois do aceite',!(st.team&&st.team.kq&&st.team.kq.length)||!(st.team.kq||[]).length,JSON.stringify(st.team&&st.team.kq));
  ok(tag+' 4: F normal Lari→JV sai (servidor vê a amizade)',S.rows('F').some(e=>e[1]==='Lari'&&e[2]==='JV'),JSON.stringify(S.rows('F')));
  // 5) código certo no formato, mas errado: ninguém aceita
  const C=await newPage(b,dev,S,'C');await seed(C.p,CFG('Caio','adult'),PROG({rank:{on:true,asked:true,uid:'caio1234',nick:'Caio'}}));await go(C.p,'comecar/');
  m=await typeCode(C.p,'ZZZZ-ZZZZ');ok(tag+' 5: código errado também sai como pedido',/enviado/.test(m),m);
  await A.p.reload();await A.p.waitForTimeout(3000);st=await prog(A.p);ok(tag+' 5: código errado não vira amizade',!has(st.friends.l,'Caio'),JSON.stringify(st.friends));
  // 5) o próprio código
  m=await typeCode(A.p,kd);ok(tag+' 5: o próprio código avisa',/é seu|sua guilda/.test(m+(await A.p.evaluate(()=>[...document.querySelectorAll('.toast,#toast')].map(x=>x.textContent).join(' ')))),m);
  ok(tag+' 5: o próprio código não manda F',!S.rows('F').some(e=>e[1]==='JV'&&/^#/.test(e[2])),JSON.stringify(S.rows('F')));
  // 6) sem ranking: guarda e manda ao entrar
  const D=await newPage(b,dev,S,'D');await seed(D.p,CFG('Duda','adult'),PROG());await go(D.p,'comecar/');
  m=await typeCode(D.p,kd);ok(tag+' 6: sem ranking guarda o código',/guardado/.test(m)&&await D.p.evaluate(c=>localStorage.getItem('asc-guilda-k')===c,code),m);
  ok(tag+' 6: nada sai antes do ranking',!S.posts.some(([w])=>w==='D'));
  ok(tag+' 6: Amigos sem rolagem lateral a 320 px',await (D.p.setViewportSize({width:320,height:700}),D.p.waitForTimeout(300),D.p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)));
  for(const [n,X] of [['A',A],['B',B],['C',C],['D',D]])ok(tag+' sem erro de console ('+n+')',!X.errs.length,X.errs.join(' | '));
  // 7) menor de 14
  const K=await newPage(b,dev,store(),'K');await seed(K.p,CFG('Pedro','kid'),PROG());await go(K.p,'comecar/');await amigos(K.p);
  ok(tag+' 7: menor de 14 não vê código nem "Entrar numa Guilda"',!(await K.p.locator('.kdbox:visible, .clpaste:visible').count()));
  for(const X of [A,B,C,D,K])await X.ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})().catch(e=>{console.error(e);process.exit(1)});
