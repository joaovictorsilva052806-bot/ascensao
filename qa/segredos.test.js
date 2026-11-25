// Teste dos Segredos (Playwright). Rode com: python3 -m http.server 8000 & node qa/segredos.test.js
const {chromium}=require('playwright');const SP=require('os').tmpdir()+'/';const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));};
const CFG={version:3,name:'Teste',startDate:'2026-11-01',quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'q2',title:'Treinar',xp:20,stat:'corpo',main:true,minTitle:'10 min'},{id:'q3',title:'Água',xp:5,stat:'corpo'}]};
const base=()=>({log:{"2026-11-20":[{q:"q1",kind:"full",xp:10,stat:"foco",bonus:0,t:"x"}],"2026-11-25":[{q:"checkin:ok",kind:"full",xp:0,bonus:0,t:"x"}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[{v:5}],rest:{},ach:{a_first:"2026-11-20"},rpg:{cls:{id:"mago",style:"fant",name:"Mago"}},foo:"campo-antigo"});
const LS=(p,k='ascensao-prog')=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),k);
const sec=async(p,k)=>((await LS(p,k)).sec)||{};
async function seed(p,o,pre='ascensao'){await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));},[CFG,o,pre]);await p.reload();await p.waitForTimeout(1000);await clear(p);}
async function clear(p){for(let i=0;i<8;i++){const m=p.locator('.sysmodal:not(.seczen) button.go');if(await m.count()){await m.first().dispatchEvent('click');await p.waitForTimeout(80);continue;}if(await p.locator('#levelup').isVisible()){await p.locator('#luClose').dispatchEvent('click');continue;}break;}}
const modal=async p=>{const h=p.locator('.sysmodal:not(.seczen) h3').last();return (await h.count())?await h.textContent():'';};
const tap=async(p,id)=>{await p.locator('#quests .quest[data-q="'+id+'"] button.go').dispatchEvent('click');await p.waitForTimeout(80);};
(async()=>{const b=await chromium.launch();
async function page(opts={},time){const ctx=await b.newContext({viewport:{width:390,height:844},...opts});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});if(time)await p.clock.install({time});return {ctx,p,errs};}
let {ctx,p,errs}=await page({},new Date('2026-11-25T14:00:00'));
await p.goto(U);await seed(p,base());
ok('root: painel Segredos existe',await p.locator('#secPanel').count()===1);
ok('root: 0 / 17',(await p.textContent('#secCount')).trim()==='0 / 17',await p.textContent('#secCount'));
await p.click('#tabbar [data-go="mais"]');await p.fill('#secCode','  LÁRICA ');await p.press('#secCode','Enter');await p.waitForTimeout(400);
ok('código "LÁRICA" (maiúscula/acento) revela',(await modal(p)).includes('Larica'),await p.textContent('#secOut'));
await p.screenshot({path:SP+'reveal.png'});
await p.click('.sysmodal button.go');await p.click('#tabbar [data-go="hoje"]');
ok('título em uso no topo',(await p.textContent('#secTitle')).includes('Caçador de Lanches'));
await p.screenshot({path:SP+'titulo.png'});
await p.reload();await p.waitForTimeout(900);await clear(p);
let st=await LS(p);
ok('persistiu prog.sec e secTitle',st.sec&&st.sec.s_larica&&st.secTitle==='s_larica');
ok('campos antigos intactos',st.foo==='campo-antigo'&&st.money[0].v===5&&st.ach.a_first&&st.log["2026-11-20"][0].q==='q1'&&st.rpg.cls.id==='mago');
await p.click('#tabbar [data-go="mais"]');await p.fill('#secCode','larica');await p.press('#secCode','Enter');
ok('código repetido não dá XP de novo',(await p.textContent('#secOut')).includes('já usado'));
await p.fill('#secCode','banana');await p.press('#secCode','Enter');ok('código desconhecido responde',(await p.textContent('#secOut')).includes('desconhecido'));
await p.fill('#secCode','420');await p.press('#secCode','Enter');ok('código 420 dá pista',(await p.textContent('#secOut')).includes('hora marcada'));
await p.click('#tabbar [data-go="hoje"]');for(let i=0;i<10;i++)await p.click('#rank',{delay:10,force:true});await p.waitForTimeout(300);
ok('cutucar rank 10x',(await modal(p)).includes('Cutucar'));await clear(p);
console.log('TOP',await p.evaluate(()=>{const r=document.getElementById('clock').getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e&&(e.id||e.className)+' '+r.x+','+r.y;}));for(let i=0;i<7;i++)await p.click('#clock',{force:true});await p.waitForTimeout(200);ok('tocar relógio 7x',!!(await sec(p)).s_tempo,await modal(p)+JSON.stringify(await sec(p)));await clear(p);
{const bb=await p.locator('#rank').boundingBox();await p.mouse.move(bb.x+20,bb.y+20);}await p.mouse.down();await p.clock.runFor(1100);await p.mouse.up();
ok('segurar rank abre Modo Zen',await p.isVisible('#secZen'));await p.clock.runFor(2000);await p.screenshot({path:SP+'zen.png'});
await p.clock.runFor(30000);await p.waitForTimeout(200);ok('zen completo libera segredo',(await modal(p)).includes('Modo Zen')&&await p.locator('#secZen').isHidden());await clear(p);
for(let i=0;i<6;i++){await tap(p,'q1');}await p.waitForTimeout(200);
ok('indeciso (marcar/desmarcar 6x)',!!(await sec(p)).s_indeciso);await clear(p);
st=await LS(p);const se=Object.values(st.log).flat().filter(e=>String(e.q).startsWith('ach:s_'));
ok('XP dos segredos entra como ach:',se.length===Object.keys(st.sec).length,se.length);ok('spam da mesma quest não vira speedrun',!st.sec.s_speed);
await p.click('#tabbar [data-go="prog"]');await p.screenshot({path:SP+'painel.png',fullPage:false});await p.locator('#secPanel').screenshot({path:SP+'painel.png'});
ok('root: console sem erros',errs.length===0,errs.join(' | '));await ctx.close();
// 16:20 + fênix (volta após 5 dias)
({ctx,p,errs}=await page({},new Date('2026-11-25T16:20:05')));await p.goto(U);await seed(p,base());
ok('16:20 libera Hora do Zen',!!(await sec(p)).s_420);
await tap(p,'q1');await p.waitForTimeout(300);ok('fênix: volta após 5 dias fora',!!(await sec(p)).s_fenix);
ok('relógio: console sem erros',errs.length===0,errs.join(' | '));await ctx.close();
// madrugada; aurora; virar o dia
({ctx,p,errs}=await page({},new Date('2026-11-25T03:10:00')));await p.goto(U);const b2=base();b2.log["2026-11-24"]=[{q:"q1",kind:"full",xp:10,bonus:0,t:"x"}];await seed(p,b2);
await tap(p,'q1');ok('coruja às 3h',!!(await sec(p)).s_coruja);ok('sem fênix se jogou ontem',!(await sec(p)).s_fenix);await clear(p);
await p.clock.setSystemTime(new Date('2026-11-26T05:40:00'));await p.clock.runFor(21000);await p.waitForTimeout(300);await clear(p);
await tap(p,'q2');ok('aurora às 5h40 do dia seguinte',!!(await sec(p)).s_aurora);await clear(p);
ok('madrugada: console sem erros',errs.length===0,errs.join(' | '));await ctx.close();
// speedrun
({ctx,p,errs}=await page({},new Date('2026-11-25T10:00:00')));await p.goto(U);await seed(p,b2);
await tap(p,'q1');await tap(p,'q2');await tap(p,'q3');await p.waitForTimeout(200);ok('speedrun: 3 quests em <1 min',!!(await sec(p)).s_speed);await ctx.close();
// datas
({ctx,p,errs}=await page({},new Date('2027-04-20T10:00:00')));await p.goto(U);await seed(p,b2);ok('20/04 libera Feriado do Zen',!!(await sec(p)).s_2004);await ctx.close();
({ctx,p,errs}=await page({},new Date('2026-11-13T10:00:00')));await p.goto(U);await seed(p,b2);ok('sexta 13 libera',!!(await sec(p)).s_sexta13);await ctx.close();
({ctx,p,errs}=await page({},new Date('2026-11-25T23:11:10')));await p.goto(U);await seed(p,b2);ok('23:11 libera 11:11',!!(await sec(p)).s_1111);await ctx.close();
({ctx,p,errs}=await page({},new Date('2026-11-26T00:02:00')));await p.goto(U);await seed(p,b2);ok('meia-noite libera Ficha Limpa',!!(await sec(p)).s_meia);await ctx.close();
// reduce-motion
({ctx,p,errs}=await page({reducedMotion:'reduce'}));await p.goto(U);await seed(p,b2);
await p.click('#tabbar [data-go="mais"]');await p.fill('#secCode','deboa');await p.press('#secCode','Enter');await p.waitForTimeout(200);
ok('reduce-motion: revelação sem animação',await p.evaluate(()=>getComputedStyle(document.querySelector('.sysmodal .card')).animationName==='none'));await clear(p);
await p.fill('#secCode','modozen');await p.press('#secCode','Enter');await p.waitForTimeout(1300);
ok('reduce-motion: zen sem movimento',await p.evaluate(()=>{const s=getComputedStyle(document.getElementById('zenDot'));return s.transform==='none'&&(s.transitionDuration==='0s');}));
await p.click('#zenExit');ok('zen: botão Sair fecha',await p.locator('#secZen').isHidden());
ok('reduce: console sem erros',errs.length===0,errs.join(' | '));await ctx.close();
// /comecar/: bloqueado no onboarding; funciona com perfil
({ctx,p,errs}=await page());await p.goto(U+'comecar/');await p.waitForTimeout(900);
for(let i=0;i<8;i++)await p.click('#clock',{force:true});ok('comecar: nada dispara durante o onboarding',!(await sec(p,'asc-u-prog')).s_tempo);
await seed(p,b2,'asc-u');await p.click('#tabbar [data-go="mais"]');await p.fill('#secCode','naodesisto');await p.press('#secCode','Enter');await p.waitForTimeout(300);
ok('comecar: código funciona com perfil',(await modal(p)).includes('Inquebrável')&&!!(await sec(p,'asc-u-prog')).s_naodesisto);
ok('comecar: console sem erros',errs.length===0,errs.join(' | '));await ctx.close();
// desktop + convite
({ctx,p,errs}=await page({viewport:{width:1280,height:800}}));await p.goto(U);await seed(p,b2);await p.click('#tabbar [data-go="prog"]');await p.screenshot({path:SP+'desktop.png'});
await p.goto(U+'convite/');await p.waitForTimeout(500);await p.goto(U+'comecar/');await p.waitForTimeout(500);ok('desktop: /, /comecar/, /convite/ sem erros',errs.length===0,errs.join(' | '));await ctx.close();
// offline
({ctx,p,errs}=await page());await p.goto(U);await p.waitForTimeout(1500);await p.reload();await p.waitForTimeout(800);await ctx.setOffline(true);await p.reload();await p.waitForTimeout(800);
ok('offline: abre do cache com Segredos',await p.locator('#secPanel').count()===1);await ctx.close();
await b.close();console.log(R.join('\n'));console.log(R.filter(r=>r.startsWith('PASS')).length+'/'+R.length);})();
