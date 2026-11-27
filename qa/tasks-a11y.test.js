// Tasks Lendárias: polimento (textos, estados vazios e acessibilidade). Não muda Ouro, XP, trava 18+ nem links.
// Foco volta ao mesmo controle depois de redesenhar, avisos no leitor de tela, link avisa que abre fora,
// filtro sem resultado, tudo concluído, sem internet, Carteira vazia, singular/plural e movimento reduzido.
// Rode com: python3 -m http.server 8000 & node qa/tasks-a11y.test.js   (outra porta: PORT=8004)
const {chromium}=require('playwright');const U='http://localhost:'+(process.env.PORT||8000)+'/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const IDS=['desapega','cashback','mpago','prolific','inter','meliuz','outlier','yougov','userlytics','freelas','motorista','dataann','clickworker','appen','fiverr','banco','sofisa','stock'];
const CFG={version:3,name:'Teste',startDate:'2026-11-01',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]};
const P=(extra={})=>Object.assign({log:{'2026-11-26':[{q:'q1',xp:10}]},extra:{},velho:'fica',rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:0},ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}},extra);
const ALL=()=>{const tp={};for(const id of IDS)tp[id]={s:{0:'2026-11-20',1:'2026-11-20',2:'2026-11-20'},f:'2026-11-20'};return tp;};
(async()=>{const b=await chromium.launch();
async function open(route,pre,prog,o={}){const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date('2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG,prog,pre]);
  await p.goto(U+route);await p.waitForTimeout(1300);await shut(p);
  await p.evaluate(()=>{const b=document.querySelector('#tabbar [data-go="lenda"]');if(b)b.click();});await p.waitForTimeout(300);
  return {ctx,p,errs};}
async function shut(p){for(let i=0;i<8;i++){const x=await p.evaluate(()=>{const m=document.querySelector('.sysmodal');if(!m)return null;const b=m.querySelector('button.go');if(b)b.click();else m.remove();return 1;});if(x==null)break;await p.waitForTimeout(120);}}
const live=p=>p.evaluate(()=>(document.getElementById('tpLive')||{}).textContent||'');
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  // trancada
  let {ctx,p,errs}=await open(route,pre,P({log:{}}));
  ok(tag+' trancada: aba com nome "trancada" e ícone escondido do leitor',await p.evaluate(()=>{const b=document.querySelector('#tabbar [data-go="lenda"]');return b.getAttribute('aria-label')==='Lendárias, trancada'&&b.querySelector('svg').getAttribute('aria-hidden')==='true';}));
  ok(tag+' trancada: requisitos legíveis (feito/falta) e cadeado decorativo',await p.evaluate(()=>{const t=document.querySelector('#tpPanel .tpreq').textContent;return /Feito: Idade 18\+ confirmada/.test(t)&&/Falta: Concluir 1 missão de hoje/.test(t)&&document.querySelector('#tpPanel .tpsig').getAttribute('aria-hidden')==='true';}));
  ok(tag+' console limpo (trancada)',errs.length===0,errs.join(' | '));await ctx.close();
  // aberta
  ({ctx,p,errs}=await open(route,pre,P()));
  ok(tag+' aberta: aba sem rótulo de trancada',await p.evaluate(()=>!document.querySelector('#tabbar [data-go="lenda"]').hasAttribute('aria-label')));
  ok(tag+' 0 concluídas e plural certo',/0 concluídas · 3\/18 reveladas/.test(await p.textContent('#tpPanel .qhead'))&&/15 seladas/.test(await p.textContent('#tpPanel .tpslh')));
  ok(tag+' links avisam que abrem fora do app e a seta é decorativa',await p.evaluate(()=>[...document.querySelectorAll('#tpPanel a.tplink')].every(a=>/\(site oficial, abre fora do app\)/.test(a.querySelector('.srlive').textContent)&&a.querySelector('[aria-hidden="true"]').textContent.trim()==='↗')));
  ok(tag+' passos dizem o número para o leitor de tela',await p.evaluate(()=>[...document.querySelectorAll('#tpPanel .tpm[data-tp="desapega"] .tpbtn')].every((x,i)=>x.querySelector('.srlive').textContent==='Passo '+(i+1)+' de 3: ')));
  ok(tag+' selos em lista',await p.evaluate(()=>document.querySelector('#tpPanel .tpseals').getAttribute('role')==='list'&&document.querySelectorAll('#tpPanel .tpseals>[role=listitem] .tpseal').length===15));
  // teclado: marcar um passo mantém o foco no mesmo passo e anuncia
  await p.click('#tpPanel .tpm[data-tp="desapega"] summary');await p.waitForTimeout(100);
  await p.focus('#tpPanel .tpm[data-tp="desapega"] .tpbtn[data-i="0"]');await p.keyboard.press('Enter');await p.waitForTimeout(150);
  ok(tag+' Enter no passo: foco continua no mesmo passo depois de redesenhar',await p.evaluate(()=>{const a=document.activeElement;return a.classList.contains('tpbtn')&&a.dataset.i==='0'&&a.closest('[data-tp]').dataset.tp==='desapega'&&a.getAttribute('aria-pressed')==='true';}));
  ok(tag+' passo marcado é anunciado',/Passo 1 marcado\. 1 de 3 feitos em Desapega/.test(await live(p)),await live(p));
  ok(tag+' ✓ do passo é decorativo',await p.evaluate(()=>document.querySelector('#tpPanel .tpm[data-tp="desapega"] .tpbtn[data-i="0"] [aria-hidden="true"]').textContent.trim()==='✓'));
  await p.keyboard.press('Space');await p.waitForTimeout(150);
  ok(tag+' desmarcar também anuncia e mantém o foco',/Passo 1 desmarcado/.test(await live(p))&&await p.evaluate(()=>document.activeElement.dataset.i==='0'));
  // filtro: foco no chip, anúncio e estado vazio
  await p.focus('#tpPanel .tpchip[data-f="r"]');await p.keyboard.press('Enter');await p.waitForTimeout(150);
  ok(tag+' filtro Rara: foco continua no chip e mostra estado vazio',await p.evaluate(()=>document.activeElement.dataset.f==='r'&&document.activeElement.getAttribute('aria-pressed')==='true')&&/Nenhuma task Rara revelada ainda\. Conclua uma task para revelar a próxima\./.test(await p.textContent('#tpPanel .tpempty')));
  ok(tag+' filtro anunciado',/Filtro Rara: 0 tasks reveladas/.test(await live(p)),await live(p));
  await p.click('#tpPanel .tpchip[data-f="all"]');await p.waitForTimeout(150);
  ok(tag+' "Todas" não mostra estado vazio',!(await p.locator('#tpPanel .tpempty').count()));
  // sem internet
  await ctx.setOffline(true);await p.waitForTimeout(250);
  ok(tag+' sem internet: aviso aparece',/Sem internet\. Os passos funcionam e ficam salvos/.test(await p.textContent('#tpPanel')));
  await ctx.setOffline(false);await p.waitForTimeout(250);
  ok(tag+' internet voltou: aviso some',!(await p.locator('#tpPanel .tpoff').count()));
  ok(tag+' console limpo (aberta)',errs.length===0,errs.join(' | '));await ctx.close();
  // Carteira vazia e 1 concluída (singular)
  ({ctx,p,errs}=await open(route,pre,P({tp:{desapega:{s:{0:'2026-11-27',1:'2026-11-27',2:'2026-11-27'},f:'2026-11-27'}},tpwal:'2026-11-27'})));
  ok(tag+' singular: 1 concluída e 14 seladas',/1 concluída · 4\/18 reveladas/.test(await p.textContent('#tpPanel .qhead'))&&/14 seladas/.test(await p.textContent('#tpPanel .tpslh')));
  ok(tag+' Carteira vazia explica o que fazer',/Nada anotado ainda\. Recebeu\? Anote aqui o valor e de onde veio\./.test(await p.textContent('#tpPanel .tpwallet')));
  ok(tag+' barra da meta tem valor em texto',await p.evaluate(()=>document.querySelector('#tpPanel .tpbar').getAttribute('aria-valuetext')==='R$ 0,00 de R$ 50,00'));
  // anotar valor: foco volta ao campo, data no formato dd/mm
  await p.click('#tpPanel .tpwallet summary');await p.fill('#tpPanel .tpwallet .tpwf input','12');await p.press('#tpPanel .tpwallet .tpwf input','Enter');await p.waitForTimeout(200);
  ok(tag+' anotar com Enter: foco volta ao campo de valor',await p.evaluate(()=>document.activeElement.matches('.tpwallet .tpwf input')));
  ok(tag+' lista da Carteira com data dd/mm',/27\/11 · Desapega · R\$ 12,00/.test(await p.textContent('#tpPanel .tpwl')));
  await p.click('#tpPanel .tpwclr');await p.waitForTimeout(100);
  ok(tag+' apagar: o pedido do 2º toque é anunciado',/Toque de novo para apagar tudo/.test(await live(p)));
  ok(tag+' console limpo (Carteira)',errs.length===0,errs.join(' | '));await ctx.close();
  // tudo concluído
  ({ctx,p,errs}=await open(route,pre,P({tp:ALL(),tpwal:'2026-11-20'}),{rm:'reduce'}));
  ok(tag+' tudo concluído: mensagem de fechamento, sem selos e sem linha em Hoje',/Você concluiu todas as Tasks Lendárias/.test(await p.textContent('#tpPanel'))&&!(await p.locator('#tpPanel .tpseal').count())&&await p.evaluate(()=>{const l=document.getElementById('tpLine');return !l||l.hidden;}));
  ok(tag+' movimento reduzido: barra sem transição e selo sem pulso',await p.evaluate(()=>getComputedStyle(document.querySelector('#tpPanel .tpbar>i')).transitionDuration==='0s'));
  ok(tag+' console limpo (tudo concluído)',errs.length===0,errs.join(' | '));await ctx.close();
}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
