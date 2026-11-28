// 📜 Quadro de Missões (tools/quadro.js, conteúdo v1 da EVA 28/11): 3 ofertas por dia, fixas pelo dia, sempre opcionais.
// Confere: 3 cartas (estudo + treino + 1), mesmas ao recarregar; Aceitar vira tarefa extra de hoje (id mq_xNN:dia, nunca principal);
// no máx. 3; concluir marca "✓ Feita"; 5 na semana = +20 Ouro uma vez; quem não estuda não recebe missão que pede aula;
// 1º uso (asc-fresh) não mostra o Quadro; raiz e /comecar/; 320 px sem rolagem lateral; console limpo; progresso intacto.
// Rode com: python3 -m http.server 8000 & node qa/quadro.test.js
const {chromium,devices}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const AULA=['mq_e01','mq_e02','mq_e04','mq_e05','mq_e08','mq_e09','mq_e13','mq_e14'];
const CFG=(prof)=>({version:3,name:'Teste',startDate:'2026-11-10',profile:Object.assign({age:'18 a 29'},prof),quests:[{id:'q1',title:'Ler 10 páginas',xp:10,stat:'mente',main:true}]});
const PROG=(x)=>Object.assign({log:{'2026-11-20':[{q:'q1',kind:'full',xp:10,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{a_first:'2026-11-10'},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},simple:{off:'2026-11-01'},gd:{off:1},velho:'fica'},x||{});
async function abre(b,{route='comecar/',pre='asc-u',day='2026-11-26',cfg,prog,vp}={}){
  const ctx=await b.newContext(Object.assign({},vp?{viewport:vp}:devices['iPhone 13']));const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route(/fonts|docs\.google|script\.google/,r=>r.fulfill({status:200,body:''}));
  await p.clock.install({time:new Date(day+'T15:00:00-03:00')});await p.goto(U+'privacidade/');
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide','ascensao-news'])localStorage.setItem(k,'9');},[cfg||CFG({studies:true,occ:'faculdade'}),prog||PROG(),pre]);
  await p.goto(U+route);await p.clock.runFor(3000);await shut(p);return {ctx,p,errs,pre};}
async function shut(p){for(let i=0;i<8;i++){const n=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal:not([hidden]) button, #levelup:not([hidden]) #luClose')].find(x=>x.getClientRects().length);if(m){m.click();return 1;}const s=document.getElementById('smSheet');if(s&&!s.hidden){s.hidden=true;document.body.classList.remove('insm');}return 0;});if(!n)break;await p.clock.runFor(400);}}
const cards=p=>p.evaluate(()=>[...document.querySelectorAll('#mqPanel .mqcard')].map(c=>({t:c.querySelector('.mqt1').textContent,k:c.className,b:c.querySelector('button').textContent,d:c.querySelector('button').disabled})));
const prog=(p,pre)=>p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-prog')),pre);
(async()=>{const b=await chromium.launch();
for(const [route,pre,tag] of [['comecar/','asc-u','/comecar/'],['','ascensao','raiz']]){
  let {ctx,p,errs}=await abre(b,{route,pre});
  let c=await cards(p);ok(tag+': 3 missões no Quadro',c.length===3,JSON.stringify(c));
  ok(tag+': 1 de estudo e 1 de treino pelo menos',c.some(x=>/mqe/.test(x.k))&&c.some(x=>/mqt/.test(x.k)),JSON.stringify(c));
  ok(tag+': sem repetir',new Set(c.map(x=>x.t)).size===3);
  ok(tag+': mostra a fala do Pantheon e o XP',await p.evaluate(()=>/(ATLAS|ARES|EVA|ORION):/.test(document.querySelector('#mqPanel').textContent)&&/\+\d+ XP · mínimo:/.test(document.querySelector('#mqPanel').textContent)));
  await p.reload();await p.clock.runFor(3000);await shut(p);const c2=await cards(p);ok(tag+': mesmas 3 ao recarregar (fixas pelo dia)',JSON.stringify(c2.map(x=>x.t))===JSON.stringify(c.map(x=>x.t)));
  await p.locator('#mqPanel .mqcard button').first().click();await p.clock.runFor(500);await shut(p);
  let st=await prog(p,pre);const ex=(st.extra['2026-11-26']||[]);
  ok(tag+': Aceitar vira tarefa extra de hoje',ex.length===1&&/^mq_[et]\d\d:2026-11-26$/.test(ex[0].id)&&ex[0].mq===1&&!ex[0].main,JSON.stringify(ex));
  ok(tag+': a tarefa aparece em Hoje',await p.locator(`#quests .quest[data-q="${ex[0].id}"]`).count()===1);
  c=await cards(p);ok(tag+': carta aceita diz "Na sua lista"',c[0].b==='Na sua lista',JSON.stringify(c[0]));
  for(let i=1;i<3;i++){await p.locator('#mqPanel .mqcard button.go').first().click();await p.clock.runFor(400);await shut(p);}
  st=await prog(p,pre);ok(tag+': no máximo 3 por dia',(st.extra['2026-11-26']||[]).length===3);
  await p.locator(`#quests .quest[data-q="${ex[0].id}"] .btns .go`).dispatchEvent('click');await p.clock.runFor(800);await shut(p);
  c=await cards(p);ok(tag+': concluir marca "✓ Feita"',c[0].b==='✓ Feita',JSON.stringify(c[0]));
  st=await prog(p,pre);ok(tag+': progresso intacto',st.velho==='fica'&&st.log['2026-11-20'].length===1);
  ok(tag+': 320 px sem rolagem lateral',await (p.setViewportSize({width:320,height:700}),p.clock.runFor(300),p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)));
  ok(tag+': console limpo',!errs.length,errs.join(' | '));await ctx.close();
  // 5 na semana = +20 Ouro (uma vez)
  const L=(id,d)=>({q:id+':'+d,kind:'full',xp:10,stat:'corpo',bonus:0,t:'x'});
  const pr=PROG({log:{'2026-11-23':[L('mq_t01','2026-11-23'),L('mq_e03','2026-11-23')],'2026-11-24':[L('mq_t02','2026-11-24')],'2026-11-25':[L('mq_t05','2026-11-25')],'2026-11-20':[L('mq_t07','2026-11-20')]}});
  ({ctx,p,errs}=await abre(b,{route,pre,prog:pr}));st=await prog(p,pre);
  ok(tag+': 4 na semana (a da semana passada não conta): sem Ouro',!(st.ouroX&&st.ouroX.got&&st.ouroX.got['mq:2026-11-23']),JSON.stringify(st.ouroX));
  await p.locator('#mqPanel .mqcard button.go').first().click();await p.clock.runFor(400);await shut(p);st=await prog(p,pre);const id=st.extra['2026-11-26'][0].id;
  await p.locator(`#quests .quest[data-q="${id}"] .btns .go`).dispatchEvent('click');await p.clock.runFor(800);await shut(p);
  st=await prog(p,pre);ok(tag+': 5ª da semana dá +20 Ouro',st.ouroX&&st.ouroX.got&&st.ouroX.got['mq:2026-11-23'],JSON.stringify(st.ouroX));
  const o1=JSON.stringify(st.ouroX);await p.reload();await p.clock.runFor(3000);await shut(p);st=await prog(p,pre);
  ok(tag+': Ouro do Quadro só uma vez',JSON.stringify(st.ouroX.got)===JSON.parse(JSON.stringify(o1))&&true||Object.keys(st.ouroX.got).filter(k=>k.startsWith('mq:')).length===1);
  ok(tag+': pill 5/5 na semana',/5\/5/.test(await p.textContent('#mqPanel .mqpill')));await ctx.close();}
// quem não estuda: nenhuma missão que pede aula, em 8 dias seguidos
{let bad=[];for(let d=20;d<28;d++){const {ctx,p}=await abre(b,{day:'2026-11-'+d,cfg:CFG({occ:'clt'})});const c=await cards(p);
  const ids=await p.evaluate(()=>[...document.querySelectorAll('#mqPanel .mqt1')].map(x=>x.textContent));bad=bad.concat(ids.filter(t=>/última aula|matéria de hoje|cairiam na prova|alternando 2 matérias|Revisão do 3º dia|questões que errou|aula de hoje|Mini-simulado/.test(t)));
  if(c.length!==3)bad.push('n='+c.length);await ctx.close();}
 ok('quem não estuda: nenhuma missão de aula em 8 dias',!bad.length,bad.join(' | '));}
// 1º uso: Quadro escondido (asc-fresh)
{const {ctx,p}=await abre(b,{prog:PROG({log:{},ach:{}})});ok('1º uso: Quadro escondido até a 1ª missão',!(await p.locator('#mqPanel').isVisible()));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})().catch(e=>{console.error(e);process.exit(1)});
