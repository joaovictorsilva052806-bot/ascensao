// Estudo (#139): flashcard e curso de horas complementares sem apagar/editar; Baralho limpava a cada card; "Importar lista" fora do estilo.
// Agora: na revisão há "✎ Editar" e "✕ Apagar" (2 toques); cada curso tem ✎ (corrige nome/horas, status fica) e ✕ (2 toques);
// o Baralho guarda o último usado em prog.st.cfg.deck (campo novo); #stCsv tem o estilo dos campos do Estudo.
// Rode com: python3 -m http.server 8000 & node qa/estudo-cards-horas.test.js
const {chromium,devices}=require('playwright');const B='http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const TK='2026-11-27';
const CFG={version:1,startDate:'2026-11-01',profile:{name:'Teste',age:'18 a 29'},quests:[{id:'m1',title:'Tarefa principal',xp:30,stat:'mente',main:true}]};
const CARDS=[{id:'c1',deck:'Disciplina A',f:'Qauntos lados tem um triângulo?',b:'3',box:null,next:null,old:'x'},
  {id:'c2',deck:'Disciplina A',f:'Capital do Brasil?',b:'Brasília',box:1,next:'2026-11-20'},
  {id:'c3',deck:'Disciplina B',f:'Card do futuro',b:'ok',box:2,next:'2026-12-20'}];
const ST={tasks:[],hc:{goal:200,items:[{id:'h1',t:'Curso de Excel',inst:'Escola X',h:300,date:'2026-11-10',st:'fazendo',old:'y'},{id:'h2',t:'Palestra',inst:'',h:20,date:'2026-11-12',st:'validado'}]},cfg:{blocks:4},blk:{},old:'campo antigo'};
const PROG={log:{},extra:{},energy:{[TK]:'media'},rest:{},st:ST,simple:{off:TK}};
const P=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')||'{}'));
const CK=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-stcards')||'[]'));
const clean=p=>p.evaluate(()=>{document.querySelectorAll('.sysmodal:not([hidden])').forEach(m=>m.remove());const l=document.getElementById('levelup');if(l)l.hidden=true;});
const tab=(p,t)=>p.evaluate(t=>{document.querySelectorAll('.sysmodal:not([hidden])').forEach(m=>m.remove());document.querySelector('nav button[data-go="'+t+'"]').click();},t);
const openD=(p,k)=>p.evaluate(k=>{const d=document.querySelector('#stPanel details[data-k="'+k+'"]');if(d)d.open=true;},k);
const btn=(p,k,re)=>p.evaluate(([k,re])=>{const b=[...document.querySelectorAll('#stPanel details[data-k="'+k+'"] button')].find(b=>new RegExp(re).test(b.textContent.trim()));if(b){b.click();return true;}return false;},[k,re]);
const hcBtn=(p,name,txt)=>p.evaluate(([name,txt])=>{const li=[...document.querySelectorAll('#stPanel details[data-k="hc"] li')].find(l=>l.textContent.includes(name));if(!li)return false;
  const b=[...li.querySelectorAll('button')].find(b=>b.textContent.trim()===txt||b.textContent.trim()==='Apagar?'&&txt==='✕');if(b){b.click();return true;}return false;},[name,txt]);
const W=p=>p.waitForTimeout(120);
(async()=>{const b=await chromium.launch();
for(const [nome,dev,rm] of [['iPhone',devices['iPhone 13'],false],['Android',devices['Pixel 7'],false],['390x844 reduce-motion',{viewport:{width:390,height:844},isMobile:true,hasTouch:true},true]]){
  const c=await b.newContext({...dev,timezoneId:'America/Sao_Paulo',reducedMotion:rm?'reduce':'no-preference'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_PROXY|Failed to load resource|ERR_CONNECTION/.test(m.text()))errs.push(m.text());});
  await p.clock.install({time:new Date(TK+'T10:00:00-03:00')});
  await p.goto(B+'/privacidade/');
  await p.evaluate(([c,o,k])=>{for(const x of Object.keys(localStorage))localStorage.removeItem(x);
    localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-stcards',JSON.stringify(k));
    for(const x of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide'])localStorage.setItem(x,'1');localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));},[CFG,PROG,CARDS]);
  await p.goto(B+'/comecar/');await p.clock.runFor(3000);await clean(p);await tab(p,'foco');await W(p);
  // --- flashcards: editar e apagar na revisão ---
  await openD(p,'cards');ok(nome+': revisão começa',await btn(p,'cards','^Revisar 2'));await W(p);
  ok(nome+': revisão tem ✎ Editar',await btn(p,'cards','Editar'));await W(p);
  const ef=await p.$('#stEf');ok(nome+': editar abre a frente preenchida',!!ef&&/Qauntos/.test(await ef.inputValue()));
  if(ef){await p.fill('#stEf','Quantos lados tem um triângulo?');await btn(p,'cards','^Salvar card$');await W(p);}
  let k=await CK(p);const k1=k.find(x=>x.id==='c1')||{};
  ok(nome+': card editado salva no aparelho (frente nova, caixa e campos antigos iguais)',k1.f==='Quantos lados tem um triângulo?'&&k1.b==='3'&&k1.box===null&&k1.old==='x'&&k.length===3,JSON.stringify(k1));
  ok(nome+': depois de salvar, a revisão continua no mesmo card',/Quantos lados/.test(await p.textContent('#stPanel details[data-k="cards"]')));
  await btn(p,'cards','Apagar');await W(p);k=await CK(p);
  ok(nome+': 1º toque em Apagar só pergunta',k.length===3&&/Apagar\?/.test(await p.textContent('#stPanel details[data-k="cards"]')));
  await btn(p,'cards','^Apagar\\?$');await W(p);k=await CK(p);
  ok(nome+': 2º toque apaga só esse card',k.map(x=>x.id).join()==='c2,c3',k.map(x=>x.id).join());
  const txt=await p.textContent('#stPanel details[data-k="cards"]');
  ok(nome+': revisão segue no próximo card',/Capital do Brasil/.test(txt)&&/1 de 1/.test(txt),txt.slice(0,120));
  await btn(p,'cards','^Parar$');await W(p);
  // --- Baralho lembra o último ---
  await openD(p,'cards');await p.fill('#stDk','Disciplina C');await p.fill('#stFr','Frente 1');await p.fill('#stBkv','Verso 1');await btn(p,'cards','^\\+ Card$');await W(p);
  ok(nome+': Baralho continua preenchido depois de "+ Card"',(await p.inputValue('#stDk').catch(()=>''))==='Disciplina C');
  await p.fill('#stFr','Frente 2');await p.fill('#stBkv','Verso 2');await btn(p,'cards','^\\+ Card$');await W(p);k=await CK(p);
  ok(nome+': 2º card cai no mesmo baralho sem redigitar',k.filter(x=>x.deck==='Disciplina C').length===2,k.map(x=>x.deck).join());
  let pr=await P(p);ok(nome+': último baralho fica em prog.st.cfg.deck (só adiciona)',pr.st.cfg.deck==='Disciplina C'&&pr.st.cfg.blocks===4);
  // --- Importar lista com o estilo dos campos ---
  const sty=await p.evaluate(()=>{document.activeElement&&document.activeElement.blur();const a=getComputedStyle(document.getElementById('stCsv')),b=getComputedStyle(document.getElementById('stFr'));return {f:a.fontFamily===b.fontFamily,bg:a.backgroundColor===b.backgroundColor,br:a.borderTopColor===b.borderTopColor,af:a.fontFamily};});
  ok(nome+': "Importar lista" com a mesma fonte e fundo dos outros campos',sty.f&&sty.bg&&sty.br,JSON.stringify(sty));
  // --- horas complementares: editar e apagar ---
  await openD(p,'hc');ok(nome+': curso tem ✎',await hcBtn(p,'Curso de Excel','✎'));await W(p);
  ok(nome+': editar preenche as horas',(await p.inputValue('#stHh').catch(()=>''))==='300');
  await p.fill('#stHh','30');await btn(p,'hc','^Salvar curso$');await W(p);pr=await P(p);const h1=pr.st.hc.items.find(x=>x.id==='h1')||{};
  ok(nome+': horas corrigidas, status, data e campos antigos iguais',h1.h===30&&h1.st==='fazendo'&&h1.date==='2026-11-10'&&h1.old==='y'&&h1.inst==='Escola X'&&pr.st.hc.items.length===2,JSON.stringify(h1));
  ok(nome+': formulário volta para "+ Curso"',await p.evaluate(()=>[...document.querySelectorAll('#stPanel details[data-k="hc"] button')].some(b=>b.textContent.trim()==='+ Curso')));
  await openD(p,'hc');await hcBtn(p,'Palestra','✕');await W(p);pr=await P(p);
  ok(nome+': 1º toque no ✕ do curso só pergunta',pr.st.hc.items.length===2);
  await hcBtn(p,'Palestra','✕');await W(p);pr=await P(p);
  ok(nome+': 2º toque apaga só esse curso',pr.st.hc.items.map(x=>x.id).join()==='h1',pr.st.hc.items.map(x=>x.id).join());
  ok(nome+': meta e resto do save intactos',pr.st.hc.goal===200&&pr.st.old==='campo antigo'&&pr.energy[TK]==='media');
  // --- reabrir: nada se perde ---
  await p.reload();await p.clock.runFor(3000);await clean(p);await tab(p,'foco');await W(p);await openD(p,'cards');
  ok(nome+': depois de reabrir, Baralho ainda é o último',(await p.inputValue('#stDk').catch(()=>''))==='Disciplina C');
  await openD(p,'hc');ok(nome+': botões dos cursos com 44 px',await p.evaluate(()=>{const bs=[...document.querySelectorAll('#stPanel details[data-k="hc"] li button')];return bs.length>0&&bs.every(b=>{const r=b.getBoundingClientRect();return r.width>=44&&r.height>=44;});}));
  ok(nome+': botões dos cursos com nome acessível',await p.evaluate(()=>[...document.querySelectorAll('#stPanel details[data-k="hc"] li button')].every(b=>/Curso de Excel/.test(b.getAttribute('aria-label')||''))));
  ok(nome+': nome do curso numa linha inteira (não espremido ao lado dos botões)',await p.evaluate(()=>{const li=[...document.querySelectorAll('#stPanel details[data-k="hc"] li')].find(l=>l.textContent.includes('Curso de Excel'));const sp=li&&li.querySelector('span');return !!sp&&sp.getBoundingClientRect().width>=li.getBoundingClientRect().width*0.9;}));
  ok(nome+': sem rolagem lateral',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  ok(nome+': sem erro de console',!errs.length,errs.join(' | '));
  await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(r=>r.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
