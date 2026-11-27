// Missão Criador, fase 3 (tools/cm.js): galeria da turma com as regras do Mural (servidor falso) e agregados no painel do criador.
// Rode com: python3 -m http.server 8000 & node qa/cm-galeria.test.js
const {chromium}=require('playwright');const U=process.env.U||'http://localhost:8000/';const SP=process.env.SHOTS||'/tmp/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const EXEC='https://script.google.com/macros/s/AKfycbTESTE123/exec';
const CSV='nome,xp,nivel\nAna,240,5\nTeste,40,1\n';
const CFG=age=>({version:3,name:'Teste Silva',startDate:'2026-11-01',profile:age?{age}:{},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]});
const G='Reboco custa caro e ninguém junta os vizinhos para comprar junto.',PR='Juntar 3 vizinhos, medir a calçada e mandar o pedido de rampa pelo site da prefeitura.';
const CM=(x={})=>Object.assign({wk:'2026-W48',tema:0,troca:false,s:{1:{d:'2026-11-23',txt:'Casa da esquina sem reboco nenhum e com a laje exposta.'},2:{d:'2026-11-24',n:7,u:'casas',f:'contei'},
  3:{d:'2026-11-25',cat:'dinheiro',txt:G},4:{d:'2026-11-26',txt:PR,tipo:'politica',custo:'zero'},5:{d:'2026-11-27',txt:'Ela disse que ajudava muito'}},hist:[]},x);
const PROG=(x={})=>Object.assign({log:{},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1,seen:{foco:1,vendas:1,mente:1,corpo:1}},simple:{off:'2026-11-01'},
  rank:{on:true,asked:true,uid:'abc12345',nick:'Teste',par:'2026-11-20'},friends:{l:['Ana'],pend:{},seen:{}},mural:{ok:1,reg:'adult'},cm:CM(),velho:'fica'},x);
const ANA={id:'caaaaaaaaaaaaaaa',a:'Ana',me:false,d:'2026-11-27T08:00:00Z',wk:'2026-W48',tema:4,n:25,u:'minutos',cat:'gente',tipo:'negocio',custo:'100',g:'O ônibus passa cheio e ninguém organiza horário extra.',p:'Fazer uma lista de horários com os vizinhos e levar para a empresa de ônibus.',img:'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==',r:{'💡':2,'🔧':0,'📏':1},my:{'💡':false}};
const AGG={ok:true,total:5,grade:[{tema:0,cat:'dinheiro',mun:'contagem',n:3},{tema:4,cat:'gente',mun:'',n:2}],cats:{dinheiro:3,gente:2},tipos:{politica:4,negocio:1},
  top:{tema:4,cat:'gente',tipo:'negocio',p:'Lista de horários com os vizinhos.',r:3},fila:[{id:'cbbbbbbbbbbbbbbb',tema:2,g:'Gargalo denunciado aqui.',p:'Proposta denunciada aqui com texto.',d:2,esc:true}],contato:[{a:'bia',tema:0,p:PR}]};
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[],calls=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.addInitScript(()=>{try{for(const k of ['asc-u-lemb','ascensao-lemb'])if(!localStorage.getItem(k))localStorage.setItem(k,'{"r":"nao","a":{"1":"x","2":"x"}}');}catch(e){}});
  await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  await ctx.route('https://docs.google.com/**',r=>r.request().method()==='POST'?r.fulfill({status:200,body:''}):r.fulfill({status:200,contentType:'text/csv',body:CSV}));
  const posts=[ANA];
  await ctx.route('https://script.google.com/**',r=>{const rq=r.request();if(rq.method()!=='POST')return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({config:cfg})});
    let j={};try{j=JSON.parse(rq.postData()||'{}');}catch(e){}calls.push(j);let out={ok:true};
    if(j.a==='cm'){if(o.err)out={ok:false,err:o.err};else posts.unshift({id:'cmeuuuuuuuuuuuuu',a:'Teste',me:true,d:'2026-11-27T10:00:00Z',wk:j.wk,tema:j.tema,n:j.num,u:j.u,cat:j.cat,tipo:j.tipo,custo:j.custo,g:j.g,p:j.p,img:j.img||'',r:{},my:{}});}
    if(j.a==='cmlist')out={ok:true,posts};if(j.a==='list')out={ok:true,posts:[]};if(j.a==='hlist')out={ok:true,hall:[]};
    if(j.a==='cm-adm')out=AGG;
    return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(out)});});
  await p.clock.install({time:new Date(o.time||'2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,pr,pre,ex,extra])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(pr));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');
    localStorage.setItem(pre+'-tele','{"asked":1}');localStorage.setItem('asc-mural-url',ex);for(const k in extra)localStorage.setItem(k,extra[k]);},[cfg,prog,pre,EXEC,o.ls||{}]);
  await p.goto(U+route);await p.waitForTimeout(1800);
  for(let i=0;i<8;i++){const m=p.locator('.sysmodal:not(.cmmodal) button.go');if(!(await m.count()))break;await m.first().dispatchEvent('click');await p.waitForTimeout(150);}
  await p.evaluate(()=>{document.querySelectorAll('.sysmodal').forEach(m=>m.remove());const l=document.getElementById('levelup');if(l)l.hidden=true;});
  await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await p.waitForTimeout(300);
  await p.evaluate(()=>{const s=document.getElementById('cmPanel');if(s&&s.classList.contains('fold')&&!s.classList.contains('open'))s.firstElementChild.click();});await p.waitForTimeout(900);
  return {ctx,p,errs,calls};}
const LS=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
const share=p=>p.locator('#cmPanel button',{hasText:'Mostrar na galeria'});
// ---- 18+ no /comecar/: mostra, galeria, reações, denúncia ----
let {ctx,p,errs,calls}=await open('comecar/','asc-u',CFG('young'),PROG());
ok('18+ com ranking e amigo: botão "Mostrar na galeria da turma"',await share(p).count()===1);
ok('galeria lista o post da amiga',(await p.textContent('#cmGal')).includes('O ônibus passa cheio')&&(await p.textContent('#cmGal')).includes('Ana'));
ok('galeria só com reações 💡 🔧 📏 (sem campo de comentário)',await p.locator('#cmGal .cmrxb').count()===3&&!(await p.locator('#cmGal textarea, #cmGal input[type=text]').count()));
await share(p).dispatchEvent('click');await p.waitForTimeout(300);
ok('janela de mostrar abre com o aviso de rosto/placa/escola',(await p.textContent('#cmModal')).includes('Sem rosto, placa, número da casa, uniforme ou nome de escola'));
ok('18+: oferece o aceite de contato do criador',await p.locator('#cmGCt').count()===1);
await p.locator('#cmModal button.go').dispatchEvent('click');await p.waitForTimeout(200);
ok('sem confirmar o aviso: não envia',!calls.some(c=>c.a==='cm')&&(await p.textContent('#cmModal .cmerr')).includes('Confirme'));
await p.fill('#cmMun','Rua das Flores 120');await p.locator('#cmGSafe').evaluate(e=>{e.checked=true});await p.locator('#cmModal button.go').dispatchEvent('click');await p.waitForTimeout(200);
ok('cidade com número/endereço: recusa',!calls.some(c=>c.a==='cm')&&(await p.textContent('#cmModal .cmerr')).includes('cidade'.replace('c','C'))||(await p.textContent('#cmModal .cmerr')).includes('só o nome'));
await p.fill('#cmMun','Contagem');await p.locator('#cmGCt').evaluate(e=>{e.checked=true});await p.locator('#cmModal button.go').dispatchEvent('click');await p.waitForTimeout(800);
const sent=calls.find(c=>c.a==='cm')||{};
ok('envia tema, número, gargalo, proposta, tipo, custo e cidade',sent.tema===0&&sent.num===7&&sent.u==='casas'&&sent.g===G&&sent.p===PR&&sent.tipo==='politica'&&sent.custo==='zero'&&sent.mun==='Contagem'&&sent.wk==='2026-W48',JSON.stringify(sent).slice(0,300));
ok('etapa 5 NUNCA vai para a galeria',!JSON.stringify(calls).includes('Ela disse que ajudava'));
ok('aceite de contato vai só porque marcou (18+)',sent.ct===1);
let st=await LS(p,'asc-u');ok('grava prog.cm.pub e mostra "Na galeria"',st.cm.pub==='2026-W48'&&(await p.textContent('#cmPanel')).includes('Na galeria da turma')&&!(await share(p).count()));
ok('meu post aparece com "Apagar"',(await p.locator('#cmGal .cmgcard',{hasText:'Juntar 3 vizinhos'}).locator('button',{hasText:'Apagar'}).count())===1);
await p.locator('#cmGal .cmgcard',{hasText:'O ônibus'}).locator('.cmrxb').first().dispatchEvent('click');await p.waitForTimeout(300);
ok('reagir 💡 chama cmreact',calls.some(c=>c.a==='cmreact'&&c.e==='💡'&&c.id===ANA.id));
const den=()=>p.locator('#cmGal .cmgcard',{hasText:'O ônibus'}).locator('button',{hasText:/enunciar/});
await den().dispatchEvent('click');await p.waitForTimeout(200);ok('denúncia pede 2º toque',!calls.some(c=>c.a==='cmrep')&&(await den().textContent()).includes('de novo'));
await den().dispatchEvent('click');await p.waitForTimeout(300);ok('2º toque denuncia',calls.some(c=>c.a==='cmrep'&&c.id===ANA.id));
ok('nenhum Ouro por galeria ou reação (só os 60 da semana completa)',st.ouro===60&&!Object.keys(st.ouroX.got).some(k=>!/^cm:/.test(k)),String(st.ouro));ok('campos antigos intactos',st.velho==='fica');
await p.evaluate(()=>document.getElementById('cmPanel').scrollIntoView());await p.screenshot({path:SP+'cm-galeria.png'});
ok('console limpo (18+)',errs.length===0,errs.join(' | '));await ctx.close();
// ---- erro do servidor: já mostrou ----
({ctx,p,errs,calls}=await open('comecar/','asc-u',CFG('young'),PROG(),{err:'repetido'}));
await share(p).dispatchEvent('click');await p.waitForTimeout(200);await p.locator('#cmGSafe').evaluate(e=>{e.checked=true});await p.locator('#cmModal button.go').dispatchEvent('click');await p.waitForTimeout(500);
ok('servidor diz "repetido": avisa e não oferece de novo',(await p.textContent('#cmModal .cmerr')).includes('já mostrou')&&(await LS(p,'asc-u')).cm.pub==='2026-W48');await ctx.close();
// ---- 14-17 sem o aceite do Mural: pede o responsável antes ----
({ctx,p,errs,calls}=await open('comecar/','asc-u',CFG('teen'),PROG({mural:{}})));
await share(p).dispatchEvent('click');await p.waitForTimeout(300);
ok('14-17: pede o responsável (consentimento do Mural) antes de mostrar',(await p.textContent('.mumodal')).includes('responsável')&&!(await p.locator('#cmModal').count()));
await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.remove()));
const teenP=PROG({mural:{ok:1,reg:'teen',par:1}});await ctx.close();
({ctx,p,errs,calls}=await open('comecar/','asc-u',CFG('teen'),teenP));await share(p).dispatchEvent('click');await p.waitForTimeout(300);
ok('14-17 autorizado: mostra, sem o aceite de contato',await p.locator('#cmModal').count()===1&&!(await p.locator('#cmGCt').count()));await ctx.close();
// ---- até 13, sem ranking, sem idade: nada de galeria ----
for(const [nm,cfg,pr] of [['até 13',CFG('kid'),PROG()],['sem ranking',CFG('young'),PROG({rank:{on:false}})],['sem idade (/comecar/)',CFG(null),PROG()]]){
  ({ctx,p,errs,calls}=await open('comecar/','asc-u',cfg,pr));
  ok(nm+': sem botão e sem galeria',!(await share(p).count())&&!(await p.locator('#cmGal').count()));
  ok(nm+': não chama a galeria no servidor',!calls.some(c=>/^cm/.test(String(c.a))));ok(nm+': console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
// ---- antes da etapa 4: não oferece ----
({ctx,p,errs,calls}=await open('comecar/','asc-u',CFG('young'),PROG({cm:CM({s:{1:{d:'2026-11-26',txt:'Casa da esquina sem reboco nenhum e com a laje exposta.'}}})})));
ok('antes da etapa 4: sem botão de mostrar (galeria aparece)',!(await share(p).count())&&await p.locator('#cmGal').count()===1);await ctx.close();
// ---- painel do criador (raiz): agregados e moderação ----
const SYNC='https://script.google.com/macros/s/TESTE_sem_chave_real_0000000/exec';
({ctx,p,errs,calls}=await open('','ascensao',CFG('adult'),PROG(),{ls:{'ascensao-sync':SYNC,'ascensao-painel':JSON.stringify({k:'chave_de_teste_1234567890abcd'})}}));
await p.locator('#tabbar [data-go="criador"]').dispatchEvent('click');await p.waitForTimeout(400);
ok('Criador: caixa "Missão Criador · turma" com Carregar',(await p.textContent('#cmAdm')).includes('Carregar'));
await p.locator('#cmAdm button',{hasText:'Carregar'}).dispatchEvent('click');await p.waitForTimeout(600);let t=await p.textContent('#cmAdm');
ok('agregados: total, top gargalos e solução mais proposta',t.includes('5 missões')&&t.includes('Dinheiro (3)')&&t.includes('Política (4)'),t.slice(0,200));
ok('pedido leva a chave do painel',calls.some(c=>c.a==='cm-adm'&&c.k==='chave_de_teste_1234567890abcd'));
ok('fila de denunciados com Manter e Apagar',t.includes('Denunciados (1)')&&await p.locator('#cmAdm button',{hasText:'Manter'}).count()===1);
ok('contatos só dos que aceitaram',t.includes('Querem levar a ideia adiante (18+, com aceite): 1'));
await p.locator('#cmAdm button.link',{hasText:'Apagar'}).dispatchEvent('click');await p.waitForTimeout(400);
ok('Apagar chama cm-adm-mod del',calls.some(c=>c.a==='cm-adm-mod'&&c.op==='del'&&c.id==='cbbbbbbbbbbbbbbb'));
await p.screenshot({path:SP+'cm-adm.png'});ok('console limpo (criador)',errs.length===0,errs.join(' | '));await ctx.close();
// ---- 360 px + reduce-motion ----
({ctx,p,errs,calls}=await open('comecar/','asc-u',CFG('young'),PROG(),{vp:{width:360,height:740},rm:'reduce'}));
const ov=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);ok('360px: sem rolagem lateral',ov<=0,String(ov));
const small=await p.evaluate(()=>[...document.querySelectorAll('#cmGal button,#cmPanel .cmrow button')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().height<44).map(e=>e.textContent.slice(0,20)));
ok('360px: botões da galeria ≥ 44 px',small.length===0,small.join(','));ok('360px: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log('\n'+(R.length-f)+'/'+R.length+' passaram');process.exit(f?1:0);})().catch(e=>{console.log(R.join('\n'));console.log('ERRO: '+e.message.split('\n')[0]);process.exit(1);});
