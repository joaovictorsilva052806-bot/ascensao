// Volta do dia 1 ao 3: teaser de amanhã, presente de volta (dia 2 e 3) e resgate da sequência à noite.
// Rode com: python3 -m http.server 8000 & node qa/volta.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';const SP=process.env.SHOTS||(require('os').tmpdir()+'/');
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true,minTitle:'Ler 1 página'},{id:'q2',title:'Treinar',xp:20,stat:'corpo',main:true},{id:'q3',title:'Água',xp:5,stat:'corpo'}]};
const E=(q,d)=>({q,kind:'full',xp:10,stat:'mente',bonus:0,t:d+'T10:00:00'});
const P=(days,extra={})=>Object.assign({log:Object.fromEntries(days.map(d=>[d,[E('q1',d)]])),extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{a_first:'2026-11-01'},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},gd:{off:1},velho:'fica'},extra);
async function drain(p){const t=await drain1(p);await p.waitForTimeout(1000);return t.concat(await drain1(p));}
async function drain1(p){const t=[];for(let i=0;i<12;i++){await p.evaluate(()=>{const m=document.getElementById('tlModal');if(m)m.remove();});const m=p.locator('.sysmodal button.go');if(await m.count()){t.push(((await p.locator('.sysmodal h3').first().textContent())||'')+' | '+((await p.locator('.sysmodal').first().textContent())||''));await m.first().dispatchEvent('click');await p.waitForTimeout(150);continue;}if(await p.locator('#levelup').isVisible()){await p.locator('#luClose').dispatchEvent('click');continue;}await p.waitForTimeout(250);if(!(await p.locator('.sysmodal button.go').count()))break;}return t;}
(async()=>{const b=await chromium.launch();
async function open(route,pre,prog,time,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference',deviceScaleFactor:o.dsf||1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date(time)});await p.goto(U+route);
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG,prog,pre]);
  await p.reload();await p.waitForTimeout(1200);return {ctx,p,errs};}
const LS=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
const vis=p=>p.evaluate(()=>{const e=document.getElementById('hkPanel');return !!e&&!e.hidden&&e.offsetHeight>0;});
const txt=p=>p.evaluate(()=>{const e=document.getElementById('hkPanel');return e?e.textContent:'';});
const done=async(p,q)=>{await p.locator('#quests .quest[data-q="'+q+'"] button.go').first().dispatchEvent('click');await p.waitForTimeout(1200);};
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';const sh=route?'u':'r';
  // A: dia 1, à tarde, sem tarefa: nada de cartão (sem pressão). Fez a 1ª: teaser de amanhã.
  let {ctx,p,errs}=await open(route,pre,P([]),'2026-11-25T14:00:00');await drain(p);
  ok(tag+' A: dia 1 sem tarefa, à tarde: sem cartão',!(await vis(p)));
  await done(p,'q1');let t=await drain(p);
  ok(tag+' A: teaser de amanhã aparece',await vis(p),await txt(p));
  let x=await txt(p);ok(tag+' A: teaser fala do presente +15 e da 1ª tarefa de amanhã (mínimo)',x.includes('+15 XP')&&x.includes('Primeira de amanhã: Ler 1 página'),x);
  ok(tag+' A: nada de presente no dia 1',!t.some(s=>s.includes('PRESENTE')),t.join(' / '));
  ok(tag+' A: cartão logo depois das tarefas',await p.evaluate(()=>document.getElementById('hkPanel').previousElementSibling===document.getElementById('quests').closest('section')));
  await p.screenshot({path:SP+'volta-1-teaser-'+sh+'.png',fullPage:false});
  ok(tag+' A: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // B: dia 2 de manhã: cartão do presente; 1ª tarefa abre +15 XP uma vez só
  ({ctx,p,errs}=await open(route,pre,P(['2026-11-24']),'2026-11-25T09:00:00'));await drain(p);
  x=await txt(p);ok(tag+' B: dia 2 mostra o presente esperando',await vis(p)&&x.includes('Presente do dia 2')&&x.includes('Ler 1 página'),x);
  await p.screenshot({path:SP+'volta-2-presente-'+sh+'.png'});
  await done(p,'q1');t=await drain(p);let st=await LS(p,pre);
  ok(tag+' B: 1ª tarefa abre o presente',t.some(s=>s.includes('Dia 2: +15 XP')),t.join(' / '));
  ok(tag+' B: XP entra como ach:volta:2 e prog.hook.got[2]',(st.log['2026-11-25']||[]).filter(e=>e.q==='ach:volta:2').length===1&&st.hook.got['2']==='2026-11-25',JSON.stringify(st.hook));
  ok(tag+' B: teaser do dia 3 (+25)',(await txt(p)).includes('+25 XP'),await txt(p));
  await done(p,'q2');await p.reload();await p.waitForTimeout(1200);t=await drain(p);st=await LS(p,pre);
  ok(tag+' B: não paga 2 vezes',!t.some(s=>s.includes('PRESENTE'))&&(st.log['2026-11-25']||[]).filter(e=>e.q==='ach:volta:2').length===1,t.join('/'));
  ok(tag+' B: campos antigos intactos',st.velho==='fica'&&st.rpg.cls.id==='mago'&&st.log['2026-11-24'].length===1&&st.ach.a_first==='2026-11-01');
  ok(tag+' B: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // C: dia 3 depois de pular um dia (volta sem culpa): presente +25 continua valendo
  ({ctx,p,errs}=await open(route,pre,P(['2026-11-21','2026-11-23'],{hook:{got:{2:'2026-11-23'}}}),'2026-11-25T11:00:00',{rm:'reduce'}));await drain(p);
  x=await txt(p);ok(tag+' C: dia 3 depois de pausa: presente +25 sem culpa',x.includes('Presente do dia 3')&&x.includes('+25')&&!/perdeu|falhou|culpa/i.test(x),x);
  ok(tag+' C: reduce-motion sem animação',(await p.evaluate(()=>getComputedStyle(document.getElementById('hkPanel')).animationName))==='none');await ctx.close();
  // D: dia 4, 19h30, sem tarefa: resgate com a versão mínima
  ({ctx,p,errs}=await open(route,pre,P(['2026-11-22','2026-11-23','2026-11-24'],{hook:{got:{2:'2026-11-23',3:'2026-11-24'}}}),'2026-11-25T19:30:00'));await drain(p);
  x=await txt(p);ok(tag+' D: resgate da sequência à noite',await vis(p)&&x.includes('Dá tempo de salvar o dia')&&x.includes('versão mínima salva: Ler 1 página'),x);
  await p.screenshot({path:SP+'volta-3-resgate-'+sh+'.png'});
  await done(p,'q1');await drain(p);x=await txt(p);ok(tag+' D: salvou: vira teaser com escudo',x.includes('Amanhã no Sistema')&&x.includes('para o escudo'),x);await ctx.close();
  // E: dia 1 à noite sem tarefa: convite leve
  ({ctx,p,errs}=await open(route,pre,P([]),'2026-11-25T20:00:00'));await drain(p);
  x=await txt(p);ok(tag+' E: dia 1 à noite: ainda dá tempo',x.includes('Ainda dá tempo do dia 1'),x);await ctx.close();
  // F: veterano (8 dias): sem cartão nenhum, sem presente
  const d8=[];for(let i=17;i<=24;i++)d8.push('2026-11-'+i);
  ({ctx,p,errs}=await open(route,pre,P(d8),'2026-11-25T19:30:00'));t=await drain(p);await done(p,'q1');t=t.concat(await drain(p));
  ok(tag+' F: veterano não vê o cartão',!(await vis(p))&&!t.some(s=>s.includes('PRESENTE')),await txt(p));
  ok(tag+' F: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // G: desktop
  ({ctx,p,errs}=await open(route,pre,P(['2026-11-24']),'2026-11-25T09:00:00',{vp:{width:1280,height:900}}));await drain(p);
  ok(tag+' G: desktop mostra o presente',await vis(p));ok(tag+' G: console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
