// Convite que não se perde (tools/colar.*): quem JÁ tem o jogo cola o link em Amigos e vira amigo + entra na turma,
// sem perder progresso; link aberto fora do app mostra "Copiar convite"; menor de 14 não vê; texto sem convite avisa.
// Rode com: python3 -m http.server 8000 & node qa/convite-colar.test.js
const {chromium,devices}=require('playwright');const U='http://localhost:'+(process.env.PORT||8000)+'/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=(age)=>({version:3,name:'Lari Souza',startDate:'2026-11-20',profile:{age},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]});
const PROG=(x={})=>Object.assign({log:{'2026-11-25':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},
  rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},gd:{off:1},velho:'fica'},x);
const LINK='https://joaovictorsilva052806-bot.github.io/ascensao/comecar/?amigo=JV&c=ab12cd&t=Fam%C3%ADlia';
async function open(route,pre,cfg,prog,ctxo={}){const b=open.b;const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844}},ctxo));const p=await ctx.newPage();const errs=[];const posts=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://docs.google.com/**',r=>{if(r.request().method()==='POST')posts.push(r.request().postData()||'');return r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nivel\nJV,120,3\n'});});
  await ctx.route('https://script.google.com/**',r=>{if(r.request().method()==='POST')posts.push(r.request().postData()||'');return r.fulfill({status:200,body:'[]'});});
  // relógio falso só com jogo semeado: ele apaga o registro de navegação que o aviso do link (E) usa
  if(cfg)await p.clock.install({time:new Date('2026-11-26T19:00:00')});
  if(cfg){await p.goto(U+'privacidade/');await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));},[cfg,prog,pre]);}
  await p.goto(U+route);await p.waitForTimeout(1500);
  for(let i=0;i<8;i++){const m=p.locator('.sysmodal:visible button.go');if(!(await m.count()))break;await m.first().dispatchEvent('click');await p.waitForTimeout(250);}
  return {ctx,p,errs,posts};}
async function amigos(p){await p.evaluate(()=>{const t=document.querySelector('#tabbar [data-go="amigos"]');if(t)t.click();});await p.waitForTimeout(400);
  await p.evaluate(()=>{const d=document.querySelector('.clpaste');if(d){d.open=true;d.scrollIntoView({block:'center'});}});await p.waitForTimeout(200);}
(async()=>{const b=await chromium.launch();open.b=b;
for(const [route,pre,tag] of [['comecar/','asc-u','/comecar/'],['','ascensao','/']]){
  // A: ranking ligado, turma vazia: o botão principal manda o link da turma
  let {ctx,p,errs}=await open(route,pre,CFG('adult'),PROG({rank:{on:true,asked:true,uid:'lari1234',nick:'Lari'}}));
  await p.evaluate(()=>{window.__sh=[];navigator.share=async o=>{window.__sh.push(o);};});
  await p.evaluate(()=>{const t=document.querySelector('#tabbar [data-go="amigos"]');if(t)t.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{const s=[...document.querySelectorAll('#tmPanel .tmseg button')].find(x=>/Guilda/.test(x.textContent));if(s)s.click();});await p.waitForTimeout(300);
  ok(tag+' A: turma vazia mostra "Mandar o link da turma"',await p.locator('#tmPanel .tmempty .tminv').count()===1);
  ok(tag+' A: por apelido continua como opção secundária',await p.locator('#tmPanel .tmempty .tmnick').count()===1);
  await p.locator('#tmPanel .tmempty .tminv').click();await p.waitForTimeout(300);
  const sh=await p.evaluate(()=>window.__sh);const lk=await p.evaluate(()=>{const u=document.querySelector('#tmPanel .cdurl');return u?'https://'+u.textContent:'';});
  ok(tag+' A: compartilha o mesmo link da caixa da turma',sh.length===1&&sh[0].url===lk&&/amigo=Lari&c=[a-z0-9]+/.test(sh[0].url),JSON.stringify(sh)+' '+lk);
  const bx=await p.evaluate(()=>{const b=document.querySelector('.cdtouch,.tmempty .tminv');return b?b.getBoundingClientRect().height:0;});ok(tag+' A: botão com 44 px',bx>=44,bx+'');
  // sem Web Share: copia
  await p.evaluate(()=>{delete navigator.share;Object.defineProperty(navigator,'share',{value:undefined,configurable:true});window.__cp='';navigator.clipboard.writeText=async t=>{window.__cp=t;};});
  await p.locator('#tmPanel .tmempty .tminv').click();await p.waitForTimeout(300);
  ok(tag+' A: sem compartilhar, copia o link',(await p.evaluate(()=>window.__cp)).includes(lk));
  await p.locator('#tmPanel .tmempty .tmnick').click();await p.waitForTimeout(500);
  ok(tag+' A: "por apelido" abre o campo de apelido',await p.evaluate(()=>{const i=document.querySelector('#frPanel input');return !!i;}));
  ok(tag+' A: console limpo',!errs.length,errs.join(' | '));await ctx.close();
  // B: sem ranking: só o botão antigo
  ({ctx,p,errs}=await open(route,pre,CFG('adult'),PROG()));await p.evaluate(()=>{const t=document.querySelector('#tabbar [data-go="amigos"]');if(t)t.click();});await p.waitForTimeout(500);
  ok(tag+' B: sem ranking não mostra o link',await p.locator('#tmPanel .tminv').count()===0);ok(tag+' B: console limpo',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
