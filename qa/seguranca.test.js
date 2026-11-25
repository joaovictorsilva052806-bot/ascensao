// Segurança: linhas falsas na planilha pública não viram amizade, esquadrão nem spam; links de troca pedem confirmação; CSP sem bloqueios.
// Rode com: python3 -m http.server 8000 & node qa/seguranca.test.js
const {chromium}=require('playwright');const crypto=require('crypto');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]};
const INV='abcdefghjkmn';const sig=n=>'cv'+crypto.createHash('sha256').update(INV+'|'+n.toLowerCase()).digest('hex').slice(0,12);
const row=(t,a,b,s,d)=>['','','','',t,a,b,s,d].join(',');
const CSV=['nome,xp,nivel,,tipo,de,para,esquadrao,data,,pnick,seq,desafios,avatar,attrs','Ana,120,3','Bia,60,2','Teste,40,1',
  row('G','Mallory','Teste','','20261126'),            // aceite falso: ninguém pediu
  row('G','Ana','Teste','','20261126'),                // aceite real: eu pedi para Ana
  row('K','Zed','Teste','c','20261126'),               // cutucada de quem não é amigo
  ...['20261120','20261121','20261122','20261123','20261124','20261125','20261126'].map(d=>row('K','Bia','Teste','c',d)), // 7 da amiga: só 5 avisam
  row('J','Eve','Teste','Squad','20261126'),           // entrou no meu esquadrão sem convite
  row('J','Bia','Teste','Squad','20261126'),           // amiga entrou: vale
  row('F','Copiador','Teste','conv'+INV,'20261126'),   // copiou o código aberto da planilha
  row('F','Novo',  'Teste',sig('Novo'),'20261126'),    // veio pelo link de verdade
  row('F','Falso', 'Teste',sig('Novo'),'20261126'),    // reusou a assinatura de outro
].join('\n')+'\n';
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[],csp=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{const t=m.text();if(/Content Security Policy|Refused to/.test(t))csp.push(t);else if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(t))errs.push(t)});
await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
const posts=[];await ctx.route('https://docs.google.com/**',r=>{if(r.request().method()==='POST'){posts.push(new URLSearchParams(r.request().postData()).get('entry.807978446')||'');return r.fulfill({status:200,body:''});}return r.fulfill({status:200,contentType:'text/csv',body:CSV});});
await p.clock.install({time:new Date('2026-11-26T14:00:00')});await p.goto(U+'comecar/');
const prog={log:{'2026-11-26':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},
  rank:{on:true,asked:true,uid:'abc12345'},friends:{l:['Bia'],pend:{Ana:'2026-11-25'},seen:{}},squad:{n:'Squad',m:[],won:{}},turma:{inv:INV},velho:'fica'};
await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG,prog]);
await p.reload();
const toasts=[];await p.exposeFunction('__t',t=>toasts.push(t));
await p.evaluate(()=>{const el=document.getElementById('toast');new MutationObserver(()=>window.__t(el.textContent)).observe(el,{childList:true,characterData:true,subtree:true});});
// fecha janelas sem aceitar nada
for(let i=0;i<14;i++){await p.waitForTimeout(500);const g=p.locator('.sysmodal button.ghost');if(await g.count())await g.first().dispatchEvent('click');}
const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));const fl=(st.friends&&st.friends.l)||[];
ok('aceite falso (G sem pedido) não vira amizade',!fl.includes('Mallory'),fl.join(','));
ok('aceite real (G com pedido) vira amizade',fl.includes('Ana'),fl.join(','));
ok('código copiado da planilha não vira amizade',!fl.includes('Copiador'),fl.join(','));
ok('assinatura certa do convite vira amizade',fl.includes('Novo'),fl.join(','));
ok('assinatura de outro apelido não vale',!fl.includes('Falso'),fl.join(','));
const sm=(st.squad&&st.squad.m)||[];ok('esquadrão: estranho não entra sozinho',!sm.includes('Eve'),sm.join(','));ok('esquadrão: amiga entra',sm.includes('Bia'),sm.join(','));
const cut=toasts.filter(t=>/te cutucou/.test(t));
ok('cutucada de quem não é amigo é ignorada',!toasts.some(t=>t.includes('Zed')),toasts.join(' / '));
ok('no máx. 5 avisos de cutucar por dia',st.turma.inN&&st.turma.inN.n<=5,JSON.stringify(st.turma.inN));
const tkR=posts.filter(v=>/^[RPFGIJK]\|/.test(v));const tks=new Set(tkR.map(v=>(v.match(/\|(tk[\w-]{22})$/)||[])[1]));
ok('token: toda linha R/P/F/G/I/J/K leva o mesmo token',tkR.length>0&&!tks.has(undefined)&&tks.size===1,tkR.map(v=>v.slice(0,3)+'…'+v.slice(-6)).join(' '));
ok('token salvo em prog.rank.tk',/^tk[\w-]{22}$/.test(st.rank.tk||'')&&tks.has(st.rank.tk));
ok('campos antigos intactos',st.velho==='fica'&&st.rank.uid==='abc12345');
ok('CSP sem bloqueios em /comecar/',csp.length===0,csp.join(' | '));ok('console limpo em /comecar/',errs.length===0,errs.join(' | '));
// link #s= trocando a planilha já ligada: pergunta e, se recusar, mantém
const A='https://script.google.com/macros/s/AKfycbTESTE_original_1234567890/exec',X='AKfycbTESTE_atacante_0987654321';
await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
const p2=await ctx.newPage();const dlg=[];p2.on('dialog',d=>{dlg.push(d.message());d.dismiss();});
p2.on('console',m=>{if(/Content Security Policy|Refused to/.test(m.text()))csp.push('raiz: '+m.text())});
await p2.goto(U);await p2.evaluate(a=>localStorage.setItem('ascensao-sync',a),A);await p2.goto(U+'#s='+X);await p2.waitForTimeout(800);
ok('#s= de outra planilha pede confirmação',dlg.some(m=>m.includes('troca a planilha')),dlg.join('/'));
ok('recusou: planilha original mantida',(await p2.evaluate(()=>localStorage.getItem('ascensao-sync')))===A);
await p2.goto(U+'#k=chave_nova_de_teste_123456789012');await p2.waitForTimeout(300);
ok('#k= guarda a chave do painel só no aparelho',(await p2.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-painel')||'{}').k))==='chave_nova_de_teste_123456789012');
ok('CSP sem bloqueios na raiz',csp.length===0,csp.join(' | '));
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
