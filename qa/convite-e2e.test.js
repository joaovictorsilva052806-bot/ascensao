// Convite de amigo/turma de ponta a ponta, com DUAS contas falando por um servidor falso compartilhado
// (o formulário docs.google.com recebe as linhas R/P/F/G e o CSV publicado devolve tudo para as duas).
// 1) JV (adulto, no ranking) tem a turma "Família": o link tem amigo=JV, c= e t=; turma vazia: "Mandar o link da turma" manda esse link.
// 2) Amiga NOVA abre o link, cria o jogo pelo caminho real, entra no ranking como "Lari": vira amiga de JV e cai na Família;
//    do lado do JV, ao recarregar, Lari aparece como amiga dentro da Família (assinatura conferida no gtInbox).
// 3) Quem JÁ joga cola a mensagem do WhatsApp em Amigos → "Recebeu um convite?": mesmo resultado, sem perder progresso.
// 4) Link aberto no navegador (fora do app instalado): aviso #clBar com "Copiar convite" copiando o link inteiro.
// 5) Menor de 14: nenhuma tela de convite e nenhuma linha F sai do aparelho.
// Tudo em iPhone 13 e Pixel 7; sem erro de console; Amigos sem rolagem lateral a 320 px.
// Rode com: python3 -m http.server 8000 & node qa/convite-e2e.test.js   (ou PORT=8001 ...)
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
// conta A: JV abre Amigos e pega o link da Família
async function openA(b,dev,S){const A=await newPage(b,dev,S,'A',{init:()=>{window.__sh=[];Object.defineProperty(navigator,'share',{configurable:true,value:async d=>{window.__sh.push(d);}});}});
  await seed(A.p,CFG('João Victor','adult'),JV());await go(A.p,'comecar/');await amigos(A.p);
  A.link=await A.p.evaluate(()=>{const e=document.querySelector('#tmPanel .cdurl');return e?'https://'+e.textContent.trim():'';});return A;}
// do lado de quem convidou: recarrega, sincroniza e mostra a Família
async function checkA(A,tag,S){await A.p.reload();await A.p.waitForTimeout(1500);await pops(A.p);await amigos(A.p);
  await A.p.waitForFunction(()=>{const g=JSON.parse(localStorage.getItem('asc-u-prog'));return g.friends.l.includes('Lari');},null,{timeout:8000}).catch(()=>{});
  await A.p.waitForTimeout(1500);const st=await prog(A.p);const f=fam(st);
  const fm=await A.p.evaluate(()=>{const m=document.getElementById('frModal');return m&&m.getClientRects().length?m.innerText.replace(/\s+/g,' '):'';});
  ok(tag+' A: sem "pedido de amizade" de quem já entrou pelo link',!fm,fm);
  ok(tag+' A: Lari virou amiga de JV',has(st.friends.l,'Lari'),JSON.stringify(st.friends));
  ok(tag+' A: Lari está na turma Família (e só nela)',f&&has(f.m,'Lari')&&!st.turmas.l.some(t=>t.id!=='tf'&&has(t.m,'Lari')),JSON.stringify(st.turmas.l.map(t=>[t.n,t.m])));
  ok(tag+' A: aceite G mandado uma vez',S.rows('G').filter(e=>e[1]==='JV'&&e[2]==='Lari').length===1,JSON.stringify(S.ev));
  await A.p.evaluate(()=>{const b=document.querySelector('#tmPanel .tmseg button[data-v="turma"]');if(b)b.click();});await A.p.waitForTimeout(300);
  const ui=await A.p.evaluate(()=>({seg:(document.querySelector('#tmPanel .tmseg button[data-v="turma"]')||{}).textContent||'',list:[...document.querySelectorAll('#tmPanel .tmlist li .tmtx b')].map(x=>x.textContent)}));
  ok(tag+' A: na tela, a Família lista Lari',/🏠/.test(ui.seg)&&ui.list.includes('Lari'),JSON.stringify(ui));}

(async()=>{const b=await chromium.launch();
for(const dev of ['iPhone 13','Pixel 7']){const tag='['+dev+']';
  // ===== 1 + 2: amiga nova pelo link =====
  {const S=store();const A=await openA(b,dev,S);const L=A.link;
    const q=new URL(L).searchParams;const c=q.get('c')||'';
    ok(tag+' 1: link da Família tem amigo=JV, c= e t=Família',L.startsWith(PUB+'comecar/?')&&q.get('amigo')==='JV'&&/^[a-z0-9]{6,12}$/.test(c)&&q.get('t')==='Família'&&/t=Fam%C3%ADlia$/.test(L),L);
    ok(tag+' 1: código do link é o da turma Família',fam(await prog(A.p)).c===c);
    await A.p.evaluate(()=>{const b=document.querySelector('#tmPanel .tmseg button[data-v="turma"]');if(b)b.click();});await A.p.waitForTimeout(300);
    const iv=A.p.locator('#tmPanel .tminv');
    ok(tag+' 1: turma vazia mostra "Mandar o link da turma"',await iv.isVisible(),await A.p.evaluate(()=>document.getElementById('tmPanel').innerText.slice(0,300)));
    ok(tag+' 1: "por apelido" fica como opção secundária',await A.p.locator('#tmPanel .tmempty .tmnick').isVisible());
    if(await iv.count())await iv.click();await A.p.waitForTimeout(300);
    const sh=await A.p.evaluate(()=>window.__sh);
    ok(tag+' 1: o botão compartilha exatamente o link da Família',sh.length===1&&sh[0].url===L,JSON.stringify(sh));
    const MSG=sh.length?sh[0].text+' '+sh[0].url:'';
    ok(tag+' 1: A console limpo',!A.errs.length,A.errs.join(' | '));
    // amiga nova: abre o link num aparelho sem o jogo e cria o jogo
    const B=await newPage(b,dev,S,'B');await seed(B.p,null,null);await B.p.goto(local(L));await B.p.waitForTimeout(1500);
    ok(tag+' 2: link guardou o convite (amigo, código, turma)',await B.p.evaluate(c=>localStorage.getItem('asc-amigo')==='JV'&&localStorage.getItem('asc-amigo-c')===c&&/Família/.test(localStorage.getItem('asc-amigo-t')||''),c));
    ok(tag+' 2: parâmetros saem da barra de endereço',await B.p.evaluate(()=>location.search===''),B.p.url());
    ok(tag+' 2: aparelho novo cai na criação do jogo',await B.p.locator('#q_name').isVisible());
    await onboard(B.p,'Larissa Souza',['18 a 29','Faculdade']);
    ok(tag+' 2: jogo criado',await B.p.evaluate(()=>{const c=JSON.parse(localStorage.getItem('asc-u-cfg')||'null');return !!(c&&!c.blank&&c.quests&&c.quests.length);}));
    ok(tag+' 2: convite sobreviveu à criação do jogo',await B.p.evaluate(()=>localStorage.getItem('asc-amigo')==='JV'&&!!localStorage.getItem('asc-amigo-t')));
    await amigos(B.p);
    ok(tag+' 2: Amigos mostra "JV te chamou para a turma"',await B.p.locator('#cdInv').isVisible()&&/JV te chamou/.test(await B.p.textContent('#cdInv')));
    ok(tag+' 2: nenhuma linha F antes de entrar no ranking',!S.rows('F').length);
    // apelido "Lari" e entra pelo botão do convite
    await B.p.evaluate(()=>{const r=document.getElementById('rankPanel');if(r&&r.classList.contains('fold')&&!r.classList.contains('open')){const h=r.querySelector('.fhd');if(h)h.click();}});await B.p.waitForTimeout(300);
    await B.p.fill('#rkNick','Lari');await B.p.click('#rkNickSave');await B.p.waitForTimeout(300);
    await B.p.locator('#cdInv button.go').click();
    await B.p.waitForFunction(()=>!localStorage.getItem('asc-amigo'),null,{timeout:6000}).catch(()=>{});await B.p.waitForTimeout(800);
    let st=await prog(B.p);
    ok(tag+' 2: B entrou no ranking como Lari',st.rank&&st.rank.on&&st.rank.nick==='Lari',JSON.stringify(st.rank));
    ok(tag+' 2: B virou amiga de JV',has(st.friends.l,'JV'),JSON.stringify(st.friends));
    ok(tag+' 2: B está na turma Família com JV',fam(st)&&has(fam(st).m,'JV'),JSON.stringify(st.turmas));
    const F=S.rows('F');
    ok(tag+' 2: uma linha F Lari→JV com assinatura',F.length===1&&F[0][1]==='Lari'&&F[0][2]==='JV'&&/^cv[0-9a-f]{12}$/.test(F[0][3]),JSON.stringify(F));
    ok(tag+' 2: chaves do convite limpas',await B.p.evaluate(()=>!localStorage.getItem('asc-amigo')&&!localStorage.getItem('asc-amigo-c')&&!localStorage.getItem('asc-amigo-t')));
    ok(tag+' 2: cartão do convite some',!(await B.p.locator('#cdInv').count()));
    ok(tag+' 2: B console limpo',!B.errs.length,B.errs.join(' | '));
    await checkA(A,tag+' 2:',S);
    ok(tag+' 2: A console limpo',!A.errs.length,A.errs.join(' | '));
    await B.ctx.close();await A.ctx.close();
    // ===== 3: quem já joga cola a mensagem do WhatsApp =====
    {const S=store();const A=await openA(b,dev,S);const msg=MSG.replace(L,A.link);
      const B=await newPage(b,dev,S,'B');await seed(B.p,CFG('Larissa Souza','adult'),PROG({rank:{on:true,asked:true,uid:'lari1234',nick:'Lari'}}));await go(B.p,'comecar/');await amigos(B.p);
      ok(tag+' 3: "Recebeu um convite? Cole aqui" em Amigos',await B.p.locator('.clpaste').count()===1);
      await B.p.evaluate(()=>{const d=document.querySelector('.clpaste');d.open=true;d.scrollIntoView({block:'center'});});await B.p.waitForTimeout(200);
      await B.p.fill('#clIn',msg);await B.p.locator('.clpaste button.go').click();await B.p.waitForTimeout(1500);
      const st=await prog(B.p);
      ok(tag+' 3: mensagem de pronto cita a turma',/convite de JV aceito \(guilda Família\)/.test(await B.p.textContent('.clmsg')),await B.p.textContent('.clmsg'));
      ok(tag+' 3: B virou amiga de JV',has(st.friends.l,'JV'),JSON.stringify(st.friends));
      ok(tag+' 3: B está na turma Família com JV',fam(st)&&has(fam(st).m,'JV'),JSON.stringify(st.turmas));
      const F=S.rows('F');ok(tag+' 3: uma linha F Lari→JV com assinatura',F.length===1&&F[0][1]==='Lari'&&F[0][2]==='JV'&&/^cv[0-9a-f]{12}$/.test(F[0][3]),JSON.stringify(F));
      ok(tag+' 3: progresso de B intacto',st.velho==='fica'&&st.log['2026-11-24'].length===1&&st.log['2026-11-25'].length===1&&st.rpg.cls.id==='mago'&&st.rank.uid==='lari1234',JSON.stringify(st.log));
      // 320 px: Amigos sem rolagem lateral (dos dois lados)
      for(const [w,P] of [['B',B.p],['A',A.p]]){await P.setViewportSize({width:320,height:640});await P.waitForTimeout(300);
        const sw=await P.evaluate(()=>document.documentElement.scrollWidth);ok(tag+' 3: '+w+' Amigos a 320 px sem rolagem lateral',sw<=320,sw+'px');
        await P.setViewportSize(devices[dev].viewport);}
      ok(tag+' 3: B console limpo',!B.errs.length,B.errs.join(' | '));
      await checkA(A,tag+' 3:',S);
      ok(tag+' 3: A console limpo',!A.errs.length,A.errs.join(' | '));
      // ===== 4: link aberto no navegador (sem o app instalado) =====
      const E=await newPage(b,dev,null,'E',{clock:false,ctx:{permissions:['clipboard-read','clipboard-write']}});
      await mock(E.ctx,store(),'E');await seed(E.p,null,null);await E.p.goto(local(A.link));await E.p.waitForTimeout(1500);
      ok(tag+' 4: aviso #clBar no topo',await E.p.locator('#clBar').isVisible());
      ok(tag+' 4: aviso diz quem chamou e a turma',/Convite de JV · guilda Família/.test(await E.p.textContent('#clBar').catch(()=>'')));
      if(await E.p.locator('#clBar button.go').count())await E.p.locator('#clBar button.go').click();await E.p.waitForTimeout(300);
      const clip=await E.p.evaluate(()=>navigator.clipboard.readText().catch(()=>''));
      ok(tag+' 4: "Copiar convite" copia o link inteiro',clip===A.link,clip+' ≠ '+A.link);
      ok(tag+' 4: console limpo',!E.errs.length,E.errs.join(' | '));await E.ctx.close();
      // instalado (standalone): sem aviso
      const E2=await newPage(b,dev,store(),'E',{clock:false,init:()=>{Object.defineProperty(navigator,'standalone',{get:()=>true});}});
      await seed(E2.p,null,null);await E2.p.goto(local(A.link));await E2.p.waitForTimeout(1200);
      ok(tag+' 4: no app instalado não mostra o aviso',!(await E2.p.locator('#clBar').count()));await E2.ctx.close();
      await B.ctx.close();await A.ctx.close();}
  }
  // ===== 5: menor de 14 =====
  {const S=store();const A=await openA(b,dev,S);
    // (a) criança nova abre o link e cria o jogo como "Até 13"
    const K=await newPage(b,dev,S,'K');await seed(K.p,null,null);await K.p.goto(local(A.link));await K.p.waitForTimeout(1500);
    await onboard(K.p,'Pedro',['Até 13','Escola','Ensino']);
    const cfgK=await K.p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-cfg')||'null'));
    ok(tag+' 5: jogo criado como menor de 14',cfgK&&cfgK.profile&&cfgK.profile.age==='kid',JSON.stringify(cfgK&&cfgK.profile));
    await amigos(K.p);await K.p.waitForTimeout(4000);
    const ui=await K.p.evaluate(()=>['#cdInv','.clpaste','.tminv','.cdlink','.cdinvb','#clIn'].filter(s=>{const e=document.querySelector(s);return e&&e.getClientRects().length;}));
    ok(tag+' 5: criança não vê nenhuma tela de convite',!ui.length,ui.join(','));
    ok(tag+' 5: criança não entra no ranking',!(await prog(K.p)).rank||!(await prog(K.p)).rank.on);
    ok(tag+' 5: nenhuma linha F/R sai do aparelho da criança',!S.posts.some(([w,v])=>w==='K'&&/^[FR]\|/.test(v)),JSON.stringify(S.posts.filter(x=>x[0]==='K')));
    ok(tag+' 5: (a) console limpo',!K.errs.length,K.errs.join(' | '));await K.ctx.close();
    // (b) criança que já joga (com ranking ligado de um perfil antigo) e convite guardado: cdInvDo não manda nada
    const K2=await newPage(b,dev,S,'K2');await seed(K2.p,CFG('Pedro','kid'),PROG({rank:{on:true,asked:true,uid:'kid12345',nick:'Pepe'}}));
    await K2.p.evaluate(()=>{localStorage.setItem('asc-amigo','JV');localStorage.setItem('asc-amigo-c','abc123');});
    await go(K2.p,'comecar/');await amigos(K2.p);await K2.p.waitForTimeout(4000);
    const ui2=await K2.p.evaluate(()=>['#cdInv','.clpaste','.tminv','.cdlink','.cdinvb','#clIn','#tmPanel'].filter(s=>{const e=document.querySelector(s);return e&&e.getClientRects().length;}));
    ok(tag+' 5: (b) criança com jogo antigo não vê convite nem turma',!ui2.length,ui2.join(','));
    ok(tag+' 5: (b) nenhuma linha F sai',!S.posts.some(([w,v])=>w==='K2'&&/^F\|/.test(v)),JSON.stringify(S.posts.filter(x=>x[0]==='K2')));
    ok(tag+' 5: (b) JV não virou amigo da criança',!has((await prog(K2.p)).friends&&(await prog(K2.p)).friends.l,'JV'));
    ok(tag+' 5: (b) console limpo',!K2.errs.length,K2.errs.join(' | '));await K2.ctx.close();
    // (c) criança que já joga abre o link no navegador: o aviso "Copiar convite" também não aparece
    const K3=await newPage(b,dev,store(),'K3',{clock:false});await seed(K3.p,CFG('Pedro','kid'),PROG());await K3.p.goto(local(A.link));await K3.p.waitForTimeout(1500);
    ok(tag+' 5: (c) criança que já joga não vê o aviso do convite no navegador',!(await K3.p.locator('#clBar').isVisible()),await K3.p.textContent('#clBar').catch(()=>''));
    await K3.ctx.close();await A.ctx.close();}
}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})().catch(e=>{console.error(e);process.exit(1)});
