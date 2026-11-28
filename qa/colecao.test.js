// Marcos da coleção (tools/colecao.*). Rode com: python3 -m http.server 8000 & node qa/colecao.test.js [pasta-de-prints]
const {chromium}=require('playwright');const H='http://localhost:8000/';const OUT=process.argv[2]||require('os').tmpdir();
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-20',profile:{age:'young'},quests:[{id:'q1',title:'Ler 10 páginas',xp:20,stat:'mente',main:true},{id:'s_fech',title:'Antes de dormir: marcar o que fiz hoje',xp:15,stat:'foco',main:true}]};
const base=(x={})=>Object.assign({log:{'2026-11-24':[{q:'q1',kind:'full',xp:20,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{'2026-11-25':'media'},mit:{},reviews:{},money:[{v:5}],rest:{},ach:{a_first:'2026-11-20'},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},velho:'fica'},x);
const SEC8={s_larica:'2026-11-01',s_zen:'2026-11-01',s_deboa:'2026-11-01',s_cutuca:'2026-11-01',s_tempo:'2026-11-01',s_hacker:'2026-11-01',s_coruja:'2026-11-01',s_speed:'2026-11-01'};
(async()=>{const b=await chromium.launch();
async function open(prog,time,{root=false,vp={width:390,height:844},rm}={}){const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,reducedMotion:rm});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nivel\n'}));
  await p.clock.install({time:new Date(time)});await p.goto(H+'qa/');const pre=root?'ascensao':'asc-u';
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-perm','1');localStorage.setItem(pre+'-intro','1');localStorage.setItem(pre+'-tele','{"asked":1}');},[CFG,prog,pre]);
  await p.goto(root?H:H+'comecar/');await p.waitForTimeout(1500);return {ctx,p,errs,key:pre+'-prog'};}
const LS=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),k);
async function drain(p){const t=[];for(let i=0;i<10;i++){const m=p.locator('.sysmodal:not(#bxModal):not(#tlModal) button.go');if(!(await m.count()))break;t.push(await p.locator('.sysmodal:not(#bxModal) h3').first().textContent());await m.first().dispatchEvent('click');await p.waitForTimeout(200);}return t;}
const s3off=async p=>{const x=p.locator('.s3off');if(await x.count())await x.first().dispatchEvent('click');await p.waitForTimeout(200);};
const abre=async(p,sel)=>{await p.evaluate(sel=>{const s=document.querySelector(sel);const f=s&&s.closest('.panel.fold');if(f&&!f.classList.contains('open')){const h=f.querySelector('.fhd');h&&h.click();}},sel);await p.waitForTimeout(150);};
// 1: 2 itens => barra mostra 2, faltam 1; nada concedido
let {ctx,p,errs,key}=await open(base({sec:{s_larica:'2026-11-01',s_zen:'2026-11-01'}}),'2026-11-25T14:00:00');await drain(p);await s3off(p);await drain(p);
await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await abre(p,'#bxCol .bxgrid');
let bar=await p.textContent('#colBar').catch(()=>'');ok('barra: Coleção 2 itens, faltam 1 para Faísca',bar.includes('Coleção: 2 itens')&&bar.includes('faltam 1')&&bar.includes('Faísca'),bar);
ok('molduras de marco bloqueadas mostram "aos N itens"',(await p.textContent('#bxCol .bxgrid')).includes('aos 8 itens'));
ok('nada concedido com 2 itens',!((await LS(p,key)).chest||{frames:[]}).frames.includes('f_col1'));
await p.locator('#bxCol').screenshot({path:OUT+'/colecao-antes-do-marco.png'});
// 2: 3º item pelo Terminal => segredo e depois o marco
await p.locator('#tabbar [data-go="mais"]').dispatchEvent('click');await abre(p,'#secCode');await p.fill('#secCode','deboa');await p.press('#secCode','Enter');await p.waitForTimeout(500);
const t=await drain(p);ok('3º item: segredo e depois "Moldura exclusiva"',t.findIndex(x=>/De Boa/.test(x))>=0&&t.findIndex(x=>/De Boa/.test(x))<t.findIndex(x=>/Moldura exclusiva: Faísca/.test(x)),JSON.stringify(t));
let st=await LS(p,key);ok('f_col1 gravada em chest.frames e em uso pelo "Usar agora"',st.chest.frames.includes('f_col1')&&st.chest.frame==='f_col1',JSON.stringify(st.chest));
ok('campos antigos intactos',st.velho==='fica'&&st.money[0].v===5&&st.ach.a_first&&st.sec.s_larica==='2026-11-01'&&st.rpg.cls.id==='mago');
await p.reload();await p.waitForTimeout(1500);const t2=await drain(p);ok('recarregar não repete o marco',!t2.some(x=>/Moldura exclusiva/.test(x)),JSON.stringify(t2));
await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await abre(p,'#bxCol .bxgrid');bar=await p.textContent('#colBar');ok('barra: 3 itens, faltam 5 para Prisma',bar.includes('Coleção: 3 itens')&&bar.includes('faltam 5')&&bar.includes('Prisma'),bar);
ok('marco não conta a si mesmo (3, não 4)',!bar.includes('4 itens'));
await p.locator('#bxCol').screenshot({path:OUT+'/colecao-depois-do-marco.png'});
ok('celular: console sem erros',errs.length===0,errs.join(' | '));await ctx.close();
// 3: save antigo cheio (8 segredos + 3 molduras + 4 títulos = 15) => 3 marcos de uma vez, 1 janela só
({ctx,p,errs,key}=await open(base({sec:SEC8,secTitle:'s_zen',chest:{roll:{},got:{},frames:['f_bronze','f_prata','f_neon'],titles:[{id:'t_crep',n:'Guardião do Crepúsculo',src:'baú'},{id:'t_fech',n:'Fechador de Dias',src:'baú'},{id:'t_aco',n:'Mente de Aço',src:'baú'},{id:'t_x',n:'Caçador',src:'chefão'}],frame:'f_neon',title:'',dry:2}}),'2026-11-25T14:00:00',{root:true}));
let t3=await drain(p);st=await LS(p,key);
ok('raiz: 15 itens => 3 molduras de marco',['f_col1','f_col2','f_col3'].every(x=>st.chest.frames.includes(x))&&!st.chest.frames.includes('f_col4'),JSON.stringify(st.chest.frames));
ok('raiz: uma janela só para os 3 marcos',t3.filter(x=>/Moldura exclusiva/.test(x)).length===1,JSON.stringify(t3));
ok('raiz: molduras e títulos antigos intactos, dry mantido',['f_bronze','f_prata','f_neon'].every(x=>st.chest.frames.includes(x))&&st.chest.titles.length===4&&st.chest.dry===2&&st.secTitle==='s_zen');
ok('raiz: console sem erros',errs.length===0,errs.join(' | '));await ctx.close();
// 4: baú aberto mostra "faltam N" na hora do prêmio
({ctx,p,errs,key}=await open(base({sec:{s_larica:'2026-11-01'},chest:{roll:{'2026-11-25':{k:'x',xp:15,r:0,tier:0}},got:{},frames:[],titles:[],dry:0}}),'2026-11-25T21:00:00'));await drain(p);await s3off(p);await drain(p);
await p.locator('#tabbar [data-go="hoje"]').dispatchEvent('click');await p.locator('#quests .quest[data-q="s_fech"] button.go').first().dispatchEvent('click');await p.waitForTimeout(1500);await drain(p);await p.waitForTimeout(800);
if(await p.locator('#bxModal').count()){for(let i=0;i<3;i++){await p.locator('#bxModal .bxbtn').click();await p.waitForTimeout(250);}await p.waitForTimeout(900);}
const out=await p.textContent('#bxModal .bxout').catch(()=>'');ok('baú: linha da coleção no prêmio',/Faltam 2 para/.test(out),out);
await p.screenshot({path:OUT+'/colecao-bau.png'});ok('baú: console sem erros',errs.length===0,errs.join(' | '));await ctx.close();
// 5: reduce-motion + desktop
({ctx,p,errs,key}=await open(base({sec:{s_larica:'2026-11-01'}}),'2026-11-25T14:00:00',{rm:'reduce',vp:{width:1280,height:800}}));await drain(p);await s3off(p);await drain(p);
await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await abre(p,'#bxCol .bxgrid');
ok('reduce-motion: barra sem transição',await p.evaluate(()=>{const i=document.querySelector('#colBar .colmeter i');return !!i&&getComputedStyle(i).transitionDuration==='0s';}));
ok('desktop: sem rolagem horizontal',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
ok('acessível: barra com role=progressbar e rótulo',await p.evaluate(()=>{const m=document.querySelector('#colBar [role=progressbar]');return !!m&&/Faltam 2/.test(m.getAttribute('aria-label'));}));
ok('desktop: console sem erros',errs.length===0,errs.join(' | '));await ctx.close();
// 6: perfil novo (onboarding) não ganha nada nem quebra
{const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(H+'comecar/');await p.waitForTimeout(1200);
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')||'{}'));ok('perfil novo: nenhum marco no onboarding',!(st.chest&&st.chest.frames&&st.chest.frames.length));ok('perfil novo: sem erro',errs.length===0,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));console.log(R.filter(r=>r.startsWith('PASS')).length+'/'+R.length);})();
