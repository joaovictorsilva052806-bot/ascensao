// Funil anônimo só com opt-in: sem aceite nada sai (nem do convite); com aceite as etapas vão.
// Rode com: python3 -m http.server 8000 & node qa/funil.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]};
const PROG={log:{'2026-11-26':[{q:'checkin:2026-11-26',kind:'checkin',xp:10,stat:'foco',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},velho:'fica'};
(async()=>{const b=await chromium.launch();
async function ctxNew(){const ctx=await b.newContext({viewport:{width:390,height:844}});const posts=[];const errs=[];
  await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  await ctx.route('https://docs.google.com/**',r=>{if(r.request().method()==='POST'){posts.push(decodeURIComponent((r.request().postData()||'').replace(/\+/g,' ')));return r.fulfill({status:200,body:''});}return r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nivel\n'});});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.clock.install({time:new Date('2026-11-26T14:00:00')});return {ctx,p,posts,errs};}
const A=posts=>posts.filter(x=>/entry\.807978446=A\|/.test(x));
// 1) convite e /x/: nenhum envio
for(const r of ['convite/','x/']){const {ctx,p,posts,errs}=await ctxNew();await p.goto(U+r);await p.waitForTimeout(1500);
  ok(r+': nada enviado sem consentimento',!A(posts).length,A(posts).join(' / '));ok(r+': sem erro de JS',!errs.length,errs.join(' | '));
  ok(r+': não cria id anônimo',await p.evaluate(()=>localStorage.getItem('asc-anon'))===null);await ctx.close();}
// 2) /comecar/ com perfil, recusando o aceite: nenhum A
{const {ctx,p,posts,errs}=await ctxNew();await p.goto(U+'comecar/');
  await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG,PROG]);
  await p.reload();await p.waitForTimeout(1500);
  for(let i=0;i<30;i++){await p.waitForTimeout(400);const no=p.locator('#tlModal button.ghost');if(await no.count()){await no.dispatchEvent('click');break;}const g=p.locator('.sysmodal:not(#tlModal) button');if(await g.count())await g.first().dispatchEvent('click');}
  await p.waitForTimeout(1500);
  ok('comecar sem aceite: nenhuma etapa anônima enviada',!A(posts).length,A(posts).join(' / '));
  ok('comecar sem aceite: recusa registrada no aparelho',await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-tele')||'{}').asked===true));
  ok('comecar sem aceite: sem erro de JS',!errs.length,errs.join(' | '));
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));ok('progresso antigo intacto',st.velho==='fica');
  await ctx.close();}
// 3) /comecar/ aceitando: etapas vão, com id aleatório
{const {ctx,p,posts,errs}=await ctxNew();await p.goto(U+'comecar/');
  await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG,PROG]);
  await p.reload();let done=false;
  for(let i=0;i<30&&!done;i++){await p.waitForTimeout(400);if(await p.locator('#tlModal').count()){await p.fill('#tlModal input','Tester');await p.locator('#tlModal button.go').dispatchEvent('click');done=true;break;}const g=p.locator('.sysmodal:not(#tlModal) button');if(await g.count())await g.first().dispatchEvent('click');}
  await p.waitForTimeout(800);
  ok('comecar com aceite: modal apareceu',done);
  ok('comecar com aceite: etapa "5-aceitou" enviada',A(posts).some(x=>/\|5-aceitou\|/.test(x)),A(posts).join(' / '));
  await p.reload();await p.waitForTimeout(2500);
  ok('comecar com aceite: etapas seguintes enviadas',A(posts).some(x=>/\|4-perfil\|/.test(x)),A(posts).join(' / '));
  ok('comecar com aceite: sem erro de JS',!errs.length,errs.join(' | '));await ctx.close();}
// 4) beta anônimo ligado também conta como opt-in
{const {ctx,p,posts}=await ctxNew();await p.goto(U+'comecar/');
  await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-beta','{"on":true,"id":"abc"}');localStorage.setItem('asc-u-tele','{"asked":true}');},[CFG,PROG]);
  await p.reload();await p.waitForTimeout(2500);
  ok('beta anônimo ligado: etapas vão',A(posts).some(x=>/\|4-perfil\|/.test(x)),A(posts).join(' / '));await ctx.close();}
// 5) até 13 anos: nada, nem com beta ligado
{const {ctx,p,posts}=await ctxNew();await p.goto(U+'comecar/');const kid=Object.assign({},CFG,{profile:{age:'kid'}});
  await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-beta','{"on":true,"id":"abc"}');},[kid,PROG]);
  await p.reload();await p.waitForTimeout(2500);
  ok('até 13 anos: nada enviado',!A(posts).length,A(posts).join(' / '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length+' passando');process.exit(f?1:0);})();
