// Sequência estilo Duolingo: escudo automático, marcos, aviso de risco e dia perfeito.
// Rode com: python3 -m http.server 8000 & node qa/sequencia.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';const SP=require('os').tmpdir()+'/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true,minTitle:'Ler 1 página'},{id:'q2',title:'Treinar',xp:20,stat:'corpo',main:true},{id:'q3',title:'Água',xp:5,stat:'corpo'}]};
const E=(q,d)=>({q,kind:'full',xp:10,stat:'mente',bonus:0,t:d+'T10:00:00'});
const P=(days,extra={})=>Object.assign({log:Object.fromEntries(days.map(d=>[d,[E('q1',d)]])),extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{a_first:'2026-11-01'},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},velho:'fica'},extra);
async function drain(p){const t=await drain1(p);await p.waitForTimeout(1000);return t.concat(await drain1(p));}
async function drain1(p){const t=[];for(let i=0;i<10;i++){const m=p.locator('.sysmodal button.go');if(await m.count()){t.push(await p.locator('.sysmodal h3').first().textContent());await m.first().dispatchEvent('click');await p.waitForTimeout(150);continue;}if(await p.locator('#levelup').isVisible()){await p.locator('#luClose').dispatchEvent('click');continue;}await p.waitForTimeout(250);if(!(await p.locator('.sysmodal button.go').count()))break;}return t;}
const b0=()=>chromium.launch();
(async()=>{const b=await b0();
async function open(route,pre,prog,time,rm){const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm||'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date(time)});await p.goto(U+'privacidade/'); // semeia fora do app: o save() da página viva não regrava por cima
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG,prog,pre]);
  await p.goto(U+route);await p.waitForTimeout(1200);return {ctx,p,errs};}
const LS=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  // A: jogador novo, 1ª tarefa acende a sequência
  let {ctx,p,errs}=await open(route,pre,P([]),'2026-11-25T14:00:00');await drain(p);
  ok(tag+' A: escudo inicial 🛡️ 1',(await p.textContent('#shieldPill')).trim()==='🛡️ 1');
  await p.locator('#quests .quest[data-q="q1"] button.go').dispatchEvent('click');await p.waitForTimeout(1200);
  let t=await drain(p);ok(tag+' A: 1ª tarefa comemora "Sequência iniciada"',t.some(x=>x.includes('Sequência iniciada')),t.join(' / '));
  await p.locator('#quests .quest[data-q="q2"] button.go').dispatchEvent('click');await p.waitForTimeout(1200);
  t=await drain(p);ok(tag+' G: todas as principais = Dia perfeito',t.some(x=>x.includes('Missão diária completa')),t.join(' / '));
  ok(tag+' A: console limpo',errs.length===0,errs.join(' | '));await p.screenshot({path:SP+'seq-a.png'});await ctx.close();
  // B: furou ontem, escudo salva sozinho
  ({ctx,p,errs}=await open(route,pre,P(['2026-11-21','2026-11-22','2026-11-23']),'2026-11-25T09:00:00'));t=await drain(p);
  let st=await LS(p,pre);ok(tag+' B: escudo ativado sozinho',t.some(x=>x.includes('Sequência salva: 3'))&&st.shield.used['2026-11-24']===1&&st.shield.n===0,t.join(' / ')+JSON.stringify(st.shield));
  ok(tag+' B: sequência continua 3',(await p.textContent('#streak')).includes('3'));
  ok(tag+' B: campos antigos intactos',st.velho==='fica'&&st.rpg.cls.id==='mago'&&st.log['2026-11-21']);
  await p.reload();await p.waitForTimeout(1200);t=await drain(p);ok(tag+' B: escudo não é gasto 2x',!t.some(x=>x.includes('salva'))&&(await LS(p,pre)).shield.n===0,t.join('/'));await ctx.close();
  // C: furou 2 dias com 1 escudo: recomeço sem culpa
  ({ctx,p,errs}=await open(route,pre,P(['2026-11-20','2026-11-21','2026-11-22']),'2026-11-25T09:00:00'));t=await drain(p);
  ok(tag+' C: recomeço sem culpa',t.some(x=>x.includes('Recomeço')),t.join(' / '));await ctx.close();
  // D: progresso antigo com 8 dias: nada de enxurrada de marcos
  const d8=[];for(let i=18;i<=25;i++)d8.push('2026-11-'+i);
  ({ctx,p,errs}=await open(route,pre,P(d8),'2026-11-25T15:00:00'));t=await drain(p);
  ok(tag+' D: usuário antigo sem enxurrada de marcos',!t.some(x=>/Sequência iniciada|dias seguidos|semana/.test(x)),t.join(' / '));await ctx.close();
  // E: 19h sem tarefa hoje: aviso de risco (e sem animação com reduce-motion)
  ({ctx,p,errs}=await open(route,pre,P(['2026-11-23','2026-11-24']),'2026-11-25T19:30:00','reduce'));await drain(p);await p.waitForTimeout(400);
  ok(tag+' E: pílula em risco',await p.locator('#streak.risk').count()===1);
  ok(tag+' E: Sistema avisa o risco',(await p.textContent('#sysLine')).includes('em risco'),await p.textContent('#sysLine'));
  ok(tag+' E: reduce-motion sem animação',(await p.evaluate(()=>getComputedStyle(document.getElementById('streak')).animationName))==='none');
  await p.screenshot({path:SP+'seq-risco.png'});
  await p.locator('#shieldPill').dispatchEvent('click');await p.waitForTimeout(200);t=await drain(p);ok(tag+' E: tocar no escudo explica',t.some(x=>x.includes('🛡️')),t.join('/'));
  ok(tag+' console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
