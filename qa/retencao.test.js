// Retenção D1/D3/D7 e funil (perfil → 1ª missão → fechou o dia): etapas novas só com opt-in; painel só no Modo Criador.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/retencao.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const T='2026-11-26';
const CFG=a=>({version:3,name:'Teste',startDate:'2026-11-20',profile:{age:a},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true},{id:'s_fech',title:'Fechar o dia',xp:5,stat:'foco',main:true}]});
const PROG=(qs)=>({log:{[T]:qs.map(q=>({q,kind:'full',xp:10,stat:'mente',bonus:0,t:'x'}))},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},simple:{off:T},velho:'fica'});
(async()=>{const b=await chromium.launch();
async function ctxNew(vp){const ctx=await b.newContext({viewport:vp||{width:390,height:844}});const posts=[];const errs=[];
  await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  await ctx.route('https://docs.google.com/**',r=>{if(r.request().method()==='POST'){posts.push(decodeURIComponent((r.request().postData()||'').replace(/\+/g,' ')));return r.fulfill({status:200,body:''});}return r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nivel\n'});});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.clock.install({time:new Date(T+'T20:00:00')});return {ctx,p,posts,errs};}
const A=posts=>posts.filter(x=>/entry\.807978446=A\|/.test(x));
async function comecar(age,tele,qs){const c=await ctxNew();await c.p.goto(U+'comecar/__seed__');
  await c.p.evaluate(([cf,o,t])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(cf));localStorage.setItem('asc-u-prog',JSON.stringify(o));for(const k of ['asc-u-season','asc-u-perm','asc-u-intro'])localStorage.setItem(k,'2');if(t)localStorage.setItem('asc-u-tele',JSON.stringify(t));},[CFG(age),PROG(qs),tele]);
  await c.p.goto(U+'comecar/');await c.p.waitForTimeout(3000);return c;}
// 1) opt-in: 1ª missão e dia fechado viram etapas anônimas, 1 vez por dia
{const c=await comecar('adult',{on:true,asked:true,uid:'u1',nick:'Fulano'},['q1','s_fech']);
  const a=A(c.posts);ok('opt-in: etapa 7-quest enviada',a.some(x=>/=A\|a\w+\|7-quest\|20261126\|/.test(x)),a.join(' / '));
  ok('opt-in: etapa 8-fechou-dia enviada',a.some(x=>/=A\|a\w+\|8-fechou-dia\|20261126\|/.test(x)),a.join(' / '));
  ok('opt-in: linha anônima (sem apelido nem uid)',a.every(x=>!x.includes('Fulano')&&!x.includes('|u1|')));
  await c.p.reload();await c.p.waitForTimeout(3000);const n=A(c.posts).filter(x=>/7-quest/.test(x)).length;ok('recarregar no mesmo dia não repete',n===1,String(n));
  const st=await c.p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));ok('progresso intacto',st.velho==='fica'&&st.log['2026-11-26'].length>=2);
  ok('opt-in: console limpo',!c.errs.length,c.errs.join(' | '));await c.ctx.close();}
// 2) opt-in, só uma missão: 7-quest sim, 8-fechou-dia não
{const c=await comecar('adult',{on:true,asked:true,uid:'u1',nick:'F'},['q1']);const a=A(c.posts);
  ok('dia aberto: sem 8-fechou-dia',a.some(x=>/7-quest/.test(x))&&!a.some(x=>/8-fechou-dia/.test(x)),a.join(' / '));await c.ctx.close();}
// 3) sem opt-in e até 13 anos: nada
{const c=await comecar('adult',{asked:true,on:false},['q1','s_fech']);ok('sem opt-in: nada sai',!A(c.posts).length,A(c.posts).join(' / '));await c.ctx.close();}
{const c=await comecar('kid',{on:true,asked:true,uid:'u2',nick:'K'},['q1','s_fech']);ok('até 13 anos: nada sai',!A(c.posts).length,A(c.posts).join(' / '));await c.ctx.close();}
// 4) app do criador: não pede aceite para ele mesmo, não envia nada, e mostra a retenção
const SID='AKfycbTESTE_1234567890abcdefghij';const EXEC='https://script.google.com/macros/s/'+SID+'/exec';const PEX='https://script.google.com/macros/s/PAINEL_teste/exec';
const row=s=>['26/11/2026 10:00:00','A|'+s];
const PAINEL={ok:true,at:T+'T19:00:00',usuarios:[['apelido']],feedback:[['nota']],funil:[['carimbo','resposta'],
  row('a1|4-perfil|20261118|iPhone|app'),row('a1|7-quest|20261118|iPhone|app'),row('a1|8-fechou-dia|20261118|iPhone|app'),row('a1|3-abriu-app|20261119|iPhone|app'),row('a1|3-abriu-app|20261121|iPhone|app'),row('a1|3-abriu-app|20261125|iPhone|app'),
  row('a2|4-perfil|20261118|Android|app'),row('a2|7-quest|20261118|Android|app'),row('a2|3-abriu-app|20261119|Android|app'),
  row('a3|4-perfil|20261124|iPhone|navegador'),row('a3|2-abriu-navegador|20261125|iPhone|navegador'),
  row('a4|4-perfil|20261126|Computador|navegador'),['5-aceitou',3]]};
for(const vp of [{width:390,height:844},{width:1280,height:800}]){const tag=vp.width<500?'celular':'desktop';const c=await ctxNew(vp);const reqs=[];
  await c.ctx.route('https://script.google.com/**',r=>{const u=r.request().url();reqs.push(u);if(u.startsWith(PEX))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(PAINEL)});
    if(r.request().method()==='POST')return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});
    return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({config:CFG('adult'),progress:PROG(['q1','s_fech'])})});});
  await c.p.goto(U+'__seed__');await c.p.evaluate(([e,pe,cf,o])=>{localStorage.setItem('ascensao-sync',e);localStorage.setItem('ascensao-painel',JSON.stringify({url:pe,k:'k'.repeat(24)}));localStorage.setItem('ascensao-cfg',JSON.stringify(cf));localStorage.setItem('ascensao-prog',JSON.stringify(o));for(const k of ['ascensao-season','ascensao-perm','ascensao-intro'])localStorage.setItem(k,'2');},[EXEC,PEX,CFG('adult'),PROG(['q1','s_fech'])]);
  await c.p.goto(U);for(let i=0;i<5;i++){await c.p.waitForTimeout(2500);await c.p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal:not(#tlModal)'))if(m.getClientRects().length)m.remove();});}
  ok(tag+' criador: não pede aceite para ele mesmo',!(await c.p.locator('#tlModal').count()));
  ok(tag+' criador: nenhuma etapa anônima enviada',!A(c.posts).length,A(c.posts).join(' / '));
  await c.p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal'))m.remove();const l=document.getElementById('levelup');if(l)l.hidden=true;document.querySelector('#tabbar [data-go="criador"]').click();});
  await c.p.waitForTimeout(1200);const txt=await c.p.locator('#rtBox').innerText().catch(()=>'');
  ok(tag+' criador: D1 100% (3/3)',/100%\s*D1 · 3\/3/.test(txt),txt.replace(/\n/g,' | '));
  ok(tag+' criador: D3 50% (1/2)',/50%\s*D3 · 1\/2/.test(txt),txt.replace(/\n/g,' | '));
  ok(tag+' criador: D7 50% (1/2)',/50%\s*D7 · 1\/2/.test(txt),txt.replace(/\n/g,' | '));
  ok(tag+' criador: funil 4 → 2 (50%) → 1 (50%)',/Perfil pronto\s*4/.test(txt)&&/1ª missão feita\s*2 · 50%/.test(txt)&&/Fechou um dia\s*1 · 50%/.test(txt),txt.replace(/\n/g,' | '));
  ok(tag+' criador: nenhum nome no resumo',!/Fulano|a1|a2/.test(txt));
  const wide=await c.p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);ok(tag+' criador: sem rolagem lateral',wide);
  if(tag==='celular')await c.p.locator('#rtBox').screenshot({path:'/tmp/claude-0/-home-user/785cbacd-90f5-5452-9be4-96dc0765ad74/scratchpad/rt.png'}).catch(()=>{});
  ok(tag+' criador: console limpo',!c.errs.length,c.errs.join(' | '));await c.ctx.close();}
// 5) /comecar/ não tem o painel de retenção
{const c=await comecar('adult',{asked:true,on:false},[]);ok('comecar: sem painel de retenção',!(await c.p.locator('#rtBox').count()));await c.ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length+' passando');process.exit(f?1:0);})();
