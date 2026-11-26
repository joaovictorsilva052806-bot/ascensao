// Forja: treino em casa que evolui sozinho (tools/forja.*): aviso de segurança, teste de nível, séries com − / +,
// subida de nível (+30 uma vez), dia ruim (+20, conta sequência), semana forjada, pilares, dias editáveis.
// Rode com: python3 -m http.server 8000 & node qa/forja.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';const SP=require('os').tmpdir()+'/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'s_treino',title:'Mexer o corpo 20 min',xp:25,stat:'corpo',minTitle:'5 min'}]};
const E=(q,d,xp)=>({q,kind:'full',xp:xp||10,stat:'mente',bonus:0,t:d+'T10:00:00'});
const P=(extra={})=>Object.assign({log:{'2026-11-20':[E('q1','2026-11-20')]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{a_first:'2026-11-01'},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},velho:'fica'},extra);
const FJ=(o={})=>Object.assign({ok:true,pt:1,pil:false,lv:{},last:{},ses:[],dias:[0,2,4]},o);
async function drain(p){for(let k=0;k<2;k++){for(let i=0;i<10;i++){const m=p.locator('.sysmodal button.go');if(await m.count()){await m.first().dispatchEvent('click');await p.waitForTimeout(150);continue;}
  if(await p.locator('#levelup').isVisible()){await p.locator('#luClose').dispatchEvent('click');continue;}await p.waitForTimeout(250);if(!(await p.locator('.sysmodal button.go').count()))break;}await p.waitForTimeout(700);}}
(async()=>{const b=await chromium.launch();
async function open(route,pre,prog,time,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date(time)});await p.goto(U+route);
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[o.cfg||CFG,prog,pre]);
  await p.reload();await p.waitForTimeout(1200);await drain(p);return {ctx,p,errs};}
const LS=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
const CF=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-cfg');
const tap=async(p,sel)=>{await p.locator(sel).first().dispatchEvent('click');await p.waitForTimeout(80);};
const sets=async(p,n)=>{for(let i=0;i<n;i++)await tap(p,'#fjSet');await p.waitForTimeout(300);};
const day=(st,d)=>st.log[d]||[];
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  // A: perfil antigo sem prog.forja, quarta-feira (dia de treino padrão)
  let {ctx,p,errs}=await open(route,pre,P(),'2026-11-25T10:00:00');
  ok(tag+' A: card do Forja em Hoje',await p.locator('#fjCard').isVisible()&&(await p.textContent('#fjCard')).includes('Treino A · 5 exercícios · ~30 min'),await p.textContent('#fjCard').catch(()=>''));
  ok(tag+' A: botões Começar e Dia ruim',await p.locator('#fjStart').isVisible()&&(await p.textContent('#fjRuim')).includes('Dia ruim (10 min)'));
  await tap(p,'#fjStart');
  ok(tag+' A: aviso de segurança antes do 1º treino',await p.locator('#fjSheet').isVisible()&&(await p.textContent('#fjSheet')).includes('Pare na hora')&&(await p.textContent('#fjSheet')).includes('não substitui orientação médica'));
  ok(tag+' A: janela acessível (foco dentro, outras telas esperam)',await p.evaluate(()=>{const m=document.getElementById('fjSheet');return m.getAttribute('role')==='dialog'&&m.contains(document.activeElement)&&document.body.classList.contains('inmission');}));
  await tap(p,'#fjOk');let st=await LS(p,pre);ok(tag+' A: aviso lido grava prog.forja.ok',st.forja&&st.forja.ok===true);
  ok(tag+' A: teste de nível e pergunta dos pilares',await p.locator('[data-pt="push"]').count()===1&&await p.locator('#fjPilYes').count()===1);
  await tap(p,'[data-pt="push"]');await tap(p,'#fjPilYes');await tap(p,'#fjGo');
  ok(tag+' A: "Sim" no teste pula para o nível 3',(await p.textContent('#fjEx')).trim()==='Flexão de joelhos',await p.textContent('#fjEx'));
  ok(tag+' A: rodapé "Quando parar" no treino',(await p.locator('#fjSheet .fjstop summary').textContent()).includes('Quando parar'));
  ok(tag+' A: alvo inicial 8 repetições',(await p.textContent('#fjVal')).trim()==='8');
  await tap(p,'#fjPlus');ok(tag+' A: + ajusta o número',(await p.textContent('#fjVal')).trim()==='9');
  await tap(p,'#fjSet');ok(tag+' A: descanso automático após a série',/Descanso 01:[23]\d/.test(await p.textContent('#fjRest')),await p.textContent('#fjRest'));
  await sets(p,14);ok(tag+' A: treino completo mostra resultado',(await p.textContent('#fjSheet')).includes('+40 XP'),await p.textContent('#fjSheet'));
  await p.screenshot({path:SP+'forja-fim.png'});await tap(p,'#fjClose');
  st=await LS(p,pre);const lg=day(st,'2026-11-25');
  ok(tag+' A: XP forja:<dia> = 40',lg.filter(e=>e.q==='forja:2026-11-25').length===1&&lg.find(e=>e.q==='forja:2026-11-25').xp===40);
  ok(tag+' A: quest s_treino marcada sem XP dobrado',lg.some(e=>e.q==='s_treino'&&e.xp===0));
  ok(tag+' A: sessão gravada',st.forja.ses.length===1&&st.forja.ses[0].tipo==='A'&&st.forja.ses[0].r===0&&st.forja.lv.push===3&&st.forja.last.push[0]===9,JSON.stringify(st.forja));
  ok(tag+' A: campos antigos intactos',st.velho==='fica'&&st.rpg.cls.id==='mago'&&st.log['2026-11-20'].length===1,JSON.stringify({v:st.velho,r:st.rpg,l:st.log['2026-11-20']}));
  let cf=await CF(p,pre);const fq=cf.quests.filter(q=>/^fj_/.test(q.id));
  ok(tag+' A: 3 quests dos pilares, nenhuma principal',fq.length===3&&fq.every(q=>!q.main&&q.ifThen),JSON.stringify(fq.map(q=>q.id)));
  ok(tag+' A: card mostra treino feito',(await p.textContent('#fjCard')).includes('Treino de hoje feito'));
  ok(tag+' A: sequência acesa',(await p.textContent('#streak')).includes('1'),await p.textContent('#streak'));
  ok(tag+' A: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // B: 11/11/11 na última vez → alvo 12; 12/12/12 sugere subir; aceitar grava lv e dá +30 uma vez; < 15 toques além das repetições
  ({ctx,p,errs}=await open(route,pre,P({forja:FJ({lv:{push:2},last:{push:[11,11,11]},ses:[{d:'2026-11-24',tipo:'B',min:30,r:0}]})}),'2026-11-25T10:00:00'));
  let taps=0;await tap(p,'#fjStart');taps++;
  ok(tag+' B: treino alterna para A',(await p.textContent('#fjSheet')).includes('TREINO A'));
  ok(tag+' B: alvo = última +1',(await p.textContent('#fjVal')).trim()==='12');
  await sets(p,15);taps++; // Fechar
  ok(tag+' B: Treino A completo com '+taps+' toques além das repetições',taps<15);
  ok(tag+' B: sugere subir só Empurrar',await p.locator('.fjoffer').count()===1&&await p.locator('.fjoffer[data-mov="push"]').count()===1);
  await p.locator('.fjoffer[data-mov="push"] button.go').dispatchEvent('click');await p.waitForTimeout(400);await drain(p);
  st=await LS(p,pre);ok(tag+' B: aceitar grava lv.push=3 e +30',st.forja.lv.push===3&&day(st,'2026-11-25').filter(e=>e.q==='forja:lv:push:3'&&e.xp===30).length===1&&!st.forja.last.push,JSON.stringify(st.forja.lv));
  ok(tag+' B: selo de nível',await p.locator('.fjup').count()===1);
  await tap(p,'#fjClose');ok(tag+' B: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // B2: o +30 do mesmo nível não se repete
  const lg2=P({forja:FJ({lv:{push:2},last:{push:[12,12,12]},ses:[{d:'2026-11-26',tipo:'B',min:30,r:0}]})});lg2.log['2026-11-25']=[E('forja:lv:push:3','2026-11-25',30)];
  ({ctx,p,errs}=await open(route,pre,lg2,'2026-11-27T10:00:00'));await tap(p,'#fjStart');await sets(p,15);
  await p.locator('.fjoffer[data-mov="push"] button.go').dispatchEvent('click');await p.waitForTimeout(400);
  st=await LS(p,pre);ok(tag+' B2: +30 só uma vez por nível',st.forja.lv.push===3&&Object.values(st.log).flat().filter(e=>e.q==='forja:lv:push:3').length===1);
  ok(tag+' B2: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // C: dia ruim = 1 série de cada, +20, conta para a sequência; 3º treino da semana = Semana forjada +25
  ({ctx,p,errs}=await open(route,pre,P({forja:FJ({ses:[{d:'2026-11-23',tipo:'A',min:30,r:0},{d:'2026-11-24',tipo:'B',min:30,r:0}]})}),'2026-11-25T10:00:00',{rm:'reduce'}));
  await tap(p,'#fjRuim');ok(tag+' C: dia ruim tem 1 série',(await p.textContent('#fjSheet')).includes('1 série')&&(await p.textContent('#fjSheet')).includes('DIA RUIM'));
  ok(tag+' C: reduce-motion sem animação',(await p.evaluate(()=>getComputedStyle(document.querySelector('.fjcard')).animationName))==='none');
  await sets(p,5);st=await LS(p,pre);const lc=day(st,'2026-11-25');
  ok(tag+' C: dia ruim dá +20',lc.some(e=>e.q==='forja:2026-11-25'&&e.xp===20&&e.kind==='min'));
  ok(tag+' C: Semana forjada +25',lc.some(e=>e.q==='forja:sem:2026-11-23'&&e.xp===25));
  ok(tag+' C: dia ruim conta como treino',st.forja.ses.length===3&&st.forja.ses[2].r===1&&lc.some(e=>e.q==='s_treino'&&e.kind==='min'));
  ok(tag+' C: sem sugestão de nível no dia ruim',await p.locator('.fjoffer').count()===0);
  await tap(p,'#fjClose');ok(tag+' C: sequência acesa pelo dia ruim',(await p.textContent('#streak')).includes('1'));
  ok(tag+' C: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // D: desktop, descanso (quinta), editar dias em 1 toque, ▶ da quest de treino, Mais > níveis, tirar pilares
  const cfgP=JSON.parse(JSON.stringify(CFG));cfgP.quests.push({id:'fj_prot',title:'Proteína',xp:15,stat:'corpo',fj:1});
  ({ctx,p,errs}=await open(route,pre,P({forja:FJ({pil:true})}),'2026-11-26T10:00:00',{vp:{width:1280,height:800},cfg:cfgP}));
  ok(tag+' D: quinta é descanso',(await p.textContent('#fjCard')).includes('Hoje é descanso'),await p.textContent('#fjCard'));
  ok(tag+' D: sem rolagem lateral no desktop',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await tap(p,'#fjDaysBtn');await tap(p,'#fjCard .fjday[data-d="3"]');
  ok(tag+' D: quinta virou dia de treino',(await p.textContent('#fjCard')).includes('~30 min')&&(await LS(p,pre)).forja.dias.join()==='0,2,3,4');
  const cfD=await CF(p,pre);ok(tag+' D: pilares completados sem duplicar',cfD.quests.filter(q=>q.id==='fj_prot').length===1&&cfD.quests.find(q=>q.id==='fj_hora').days.join()==='0,2,3,4');
  const play=p.locator('#quests .quest[data-q="s_treino"] .msgo');
  ok(tag+' D: ▶ na quest de treino',await play.count()===1);
  if(await play.count()){await play.dispatchEvent('click');await p.waitForTimeout(300);ok(tag+' D: ▶ abre o Forja, não o timer genérico',await p.locator('#fjSheet').isVisible()&&!(await p.locator('#msSheet').isVisible().catch(()=>false)));await tap(p,'#fjMin');}
  ok(tag+' D: Mais > Forja: meus níveis',(await p.textContent('#fjPanel')).includes('Forja: meus níveis')&&(await p.textContent('#fjPanel')).includes('Empurrar · nível 1/5'));
  await tap(p,'#fjPilT');ok(tag+' D: tirar os pilares',!(await CF(p,pre)).quests.some(q=>/^fj_/.test(q.id))&&(await LS(p,pre)).forja.pil===false);
  ok(tag+' D: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // E: celular sem rolagem lateral com o treino aberto + prog.forja quebrado não derruba o app
  ({ctx,p,errs}=await open(route,pre,P({forja:{lv:'x',last:null,ses:{},cur:{d:'2020-01-01',tipo:'Z'}}}),'2026-11-25T10:00:00'));
  ok(tag+' E: dado estranho em prog.forja não quebra',await p.locator('#fjCard').isVisible());
  await tap(p,'#fjStart');await tap(p,'#fjOk');await tap(p,'#fjGo');
  ok(tag+' E: celular sem rolagem lateral',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.screenshot({path:SP+'forja-celular.png'});
  ok(tag+' E: console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
