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
  // A: Larissa já joga (ranking ligado, apelido Lari), cola a mensagem do WhatsApp inteira
  let {ctx,p,errs,posts}=await open(route,pre,CFG('adult'),PROG({rank:{on:true,asked:true,uid:'lari1234',nick:'Lari'}}));
  await amigos(p);ok(tag+' A: "Recebeu um convite?" aparece em Amigos',await p.locator('.clpaste').count()===1);
  await p.fill('#clIn','Bora jogar comigo no Ascension? Entra pelo meu link: '+LINK);await p.locator('.clpaste button.go').click();await p.waitForTimeout(1200);
  let st=await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-prog')),pre);
  ok(tag+' A: virou amiga de JV',((st.friends&&st.friends.l)||[]).includes('JV'),JSON.stringify(st.friends));
  ok(tag+' A: entrou na turma do link (Família, com JV)',((st.turmas&&st.turmas.l)||[]).some(t=>/Fam/.test(t.n)&&t.m.includes('JV')),JSON.stringify(st.turmas));
  ok(tag+' A: mandou a linha F (mesmo fluxo do link)',posts.some(x=>/JV/.test(decodeURIComponent(x))&&/Lari/.test(decodeURIComponent(x))),posts.length+' posts');
  ok(tag+' A: progresso e campos antigos intactos',st.velho==='fica'&&st.log['2026-11-25'].length===1&&st.rpg.cls.id==='mago');
  ok(tag+' A: mensagem de pronto',/aceito/.test(await p.textContent('.clmsg')),await p.textContent('.clmsg'));
  ok(tag+' A: console limpo',!errs.length,errs.join(' | '));await ctx.close();
  // B: texto sem convite e convite próprio
  ({ctx,p,errs}=await open(route,pre,CFG('adult'),PROG({rank:{on:true,asked:true,uid:'jv123456',nick:'JV'}})));await amigos(p);
  await p.fill('#clIn','oi tudo bem');await p.locator('.clpaste button.go').click();ok(tag+' B: texto sem convite avisa',/Não achei/.test(await p.textContent('.clmsg')));
  await p.fill('#clIn',LINK);await p.locator('.clpaste button.go').click();ok(tag+' B: o próprio convite não vira amizade',/é seu/.test(await p.textContent('.clmsg')));
  ok(tag+' B: console limpo',!errs.length,errs.join(' | '));await ctx.close();
  // F: pontuação colada no fim do link (achado 1 da EVA/QA 7204805292): não cria turma "Família." / "Família)" / "Família!"
  for(const [nome,txt] of [['ponto',LINK+'.'],['parênteses','('+LINK+')'],['exclamação','entra aí '+LINK+'!'],['aspas','"'+LINK+'"']]){
    ({ctx,p,errs}=await open(route,pre,CFG('adult'),PROG({rank:{on:true,asked:true,uid:'lari1234',nick:'Lari'}})));await amigos(p);
    await p.fill('#clIn',txt);await p.locator('.clpaste button.go').click();await p.waitForTimeout(1200);
    const s=await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-prog')),pre);const ts=((s.turmas&&s.turmas.l)||[]).map(t=>t.n);
    ok(tag+' F '+nome+': turma "Família" sem pontuação, com JV',((s.turmas&&s.turmas.l)||[]).some(t=>t.n==='Família'&&t.m.includes('JV'))&&!ts.some(n=>/Família\W/.test(n)),JSON.stringify(ts));
    ok(tag+' F '+nome+': amigo "JV" sem pontuação',((s.friends&&s.friends.l)||[]).includes('JV'),JSON.stringify(s.friends&&s.friends.l));
    ok(tag+' F '+nome+': console limpo',!errs.length,errs.join(' | '));await ctx.close();}
  // G: JV já é amigo e está em "Minha turma"; o link da Família põe ele também na Família (achado 2)
  ({ctx,p,errs}=await open(route,pre,CFG('adult'),PROG({rank:{on:true,asked:true,uid:'lari1234',nick:'Lari'},friends:{l:['JV'],pend:{},seen:{}},turmas:{l:[{id:'t0',n:'Minha turma',e:'⭐',c:'',m:['JV']}],cur:'t0'}})));await amigos(p);
  await p.fill('#clIn',LINK);await p.locator('.clpaste button.go').click();await p.waitForTimeout(1200);
  st=await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-prog')),pre);
  ok(tag+' G: amigo antigo entra na turma do link',((st.turmas&&st.turmas.l)||[]).some(t=>t.n==='Família'&&t.m.includes('JV')),JSON.stringify(st.turmas));
  ok(tag+' G: e continua na turma antiga',((st.turmas&&st.turmas.l)||[]).some(t=>t.n==='Minha guilda'&&t.m.includes('JV')),JSON.stringify(st.turmas));
  ok(tag+' G: mensagem cita a turma do link',/Família/.test(await p.textContent('.clmsg')),await p.textContent('.clmsg'));
  ok(tag+' G: amigo não duplicou e progresso intacto',st.friends.l.filter(x=>x==='JV').length===1&&st.velho==='fica'&&st.log['2026-11-25'].length===1);
  ok(tag+' G: console limpo',!errs.length,errs.join(' | '));await ctx.close();
  // H: 320 px: campo legível (achado 3)
  ({ctx,p,errs}=await open(route,pre,CFG('adult'),PROG({rank:{on:true,asked:true,uid:'lari1234',nick:'Lari'}}),{viewport:{width:320,height:640}}));await amigos(p);
  const wd=await p.evaluate(()=>{const i=document.getElementById('clIn'),b=document.querySelector('.clpaste button.go');return {i:Math.round(i.getBoundingClientRect().width),b:Math.round(b.getBoundingClientRect().width),bh:Math.round(b.getBoundingClientRect().height),sw:document.documentElement.scrollWidth,iw:innerWidth};});
  ok(tag+' H 320px: campo maior que o botão e ≥ 150 px',wd.i>=150&&wd.i>wd.b,JSON.stringify(wd));
  ok(tag+' H 320px: botão com 44 px e sem rolagem lateral',wd.bh>=44&&wd.sw<=wd.iw+1,JSON.stringify(wd));
  await p.screenshot({path:'/tmp/cola-320-'+pre+'.png'});await ctx.close();
  // C: sem ranking ainda: guarda e pede o apelido
  ({ctx,p,errs}=await open(route,pre,CFG('adult'),PROG()));await amigos(p);
  if(await p.locator('#clIn').count()){await p.fill('#clIn',LINK);await p.locator('.clpaste button.go').click();await p.waitForTimeout(300);
    ok(tag+' C: sem ranking: guarda e pede o apelido',/Entre no ranking/.test(await p.textContent('.clmsg'))&&await p.evaluate(()=>localStorage.getItem('asc-amigo')==='JV'),await p.textContent('.clmsg'));}
  else ok(tag+' C: sem ranking: guarda e pede o apelido',false,'sem caixa');
  ok(tag+' C: console limpo',!errs.length,errs.join(' | '));await ctx.close();
}
// G: pontuação colada no fim do link não cria turma "Família." (achado do QA, Trem 14)
for(const txt of [LINK+'.','('+LINK+')','entra aí '+LINK+'!','"'+LINK+'"']){
  const {ctx,p,errs}=await open('comecar/','asc-u',CFG('adult'),PROG({rank:{on:true,asked:true,uid:'lari1234',nick:'Lari'}}));await amigos(p);
  await p.fill('#clIn',txt);await p.locator('.clpaste button.go').click();await p.waitForTimeout(1200);
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));const ns=((st.turmas&&st.turmas.l)||[]).map(t=>t.n);
  ok('G: '+JSON.stringify(txt.replace(LINK,'LINK'))+' cai em "Família" e não em turma nova',ns.includes('Família')&&!ns.some(n=>/Família./.test(n)),JSON.stringify(ns));
  ok('G: '+JSON.stringify(txt.replace(LINK,'LINK'))+' console limpo',!errs.length,errs.join(' | '));await ctx.close();}
// H: já é amiga de JV e já está numa turma: colar o link da Família põe JV na Família (a mensagem não mente)
{const {ctx,p,errs}=await open('comecar/','asc-u',CFG('adult'),PROG({rank:{on:true,asked:true,uid:'lari1234',nick:'Lari'},friends:{l:['JV'],pend:{}},turmas:{cur:'t0',l:[{id:'t0',n:'Minha turma',e:'⭐',c:'',m:['JV']}]}}));await amigos(p);
  await p.fill('#clIn',LINK);await p.locator('.clpaste button.go').click();await p.waitForTimeout(1200);
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
  ok('H: amigo antigo entra na turma do link',((st.turmas&&st.turmas.l)||[]).some(t=>t.n==='Família'&&t.m.includes('JV')),JSON.stringify(st.turmas));
  ok('H: continua na turma antiga e sem amigo duplicado',st.turmas.l.find(t=>t.id==='t0').m.includes('JV')&&st.friends.l.filter(x=>x==='JV').length===1,JSON.stringify(st.friends));
  ok('H: mensagem cita a turma',/guilda Família/.test(await p.textContent('.clmsg')),await p.textContent('.clmsg'));
  ok('H: console limpo',!errs.length,errs.join(' | '));await ctx.close();}
// I: 320 px: campo maior que o botão e botão inteiro
{const {ctx,p,errs}=await open('comecar/','asc-u',CFG('adult'),PROG({rank:{on:true,asked:true,uid:'lari1234',nick:'Lari'}}),{viewport:{width:320,height:640}});await amigos(p);
  const w=await p.evaluate(()=>({i:document.querySelector('#clIn').getBoundingClientRect().width,b:document.querySelector('.clpaste button.go').getBoundingClientRect().width,sw:document.documentElement.scrollWidth}));
  ok('I: 320 px: campo largo e botão compacto',w.i>=150&&w.b<=110&&w.i>w.b,JSON.stringify(w));ok('I: 320 px: sem rolagem lateral',w.sw<=320,JSON.stringify(w));await ctx.close();}
// D: menor de 14 não vê a caixa
{const {ctx,p,errs}=await open('comecar/','asc-u',CFG('kid'),PROG());await amigos(p);ok('D: menor de 14 sem convite',await p.locator('.clpaste').count()===0);ok('D: console limpo',!errs.length,errs.join(' | '));await ctx.close();}
// E: link aberto no Safari (fora do app instalado): aviso com Copiar convite
{const {ctx,p,errs}=await open('comecar/?amigo=JV&c=ab12cd&t=Fam%C3%ADlia',null,null,null,{...devices['iPhone 13'],permissions:['clipboard-read','clipboard-write']});
  ok('E: aviso do convite no topo',await p.locator('#clBar').isVisible(),await p.locator('#clBar').count()+'');
  ok('E: aviso diz quem convidou e a turma',/JV/.test(await p.textContent('#clBar'))&&/Família/.test(await p.textContent('#clBar')));
  await p.locator('#clBar button.go').click();await p.waitForTimeout(300);
  ok('E: copia o link completo',/amigo=JV&c=ab12cd&t=Fam/.test(await p.evaluate(()=>navigator.clipboard.readText().catch(()=>''))),await p.textContent('#clBar button.go'));
  ok('E: convite também guardado para quem vai criar o jogo aqui',await p.evaluate(()=>localStorage.getItem('asc-amigo')==='JV'));
  ok('E: console limpo',!errs.length,errs.join(' | '));await ctx.close();}
// F: app aberto sem convite: sem aviso
{const {ctx,p,errs}=await open('comecar/',null,null,null,devices['iPhone 13']);ok('F: sem convite, sem aviso',await p.locator('#clBar').count()===0);await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
