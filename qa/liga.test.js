// Liga da semana: divisão que só sobe, rival mais próximo, fechamento da semana e aviso de ultrapassagem.
// Rode com: python3 -m http.server 8000 & node qa/liga.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/comecar/';const SP=require('os').tmpdir()+'/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]};
const CSV='nome,xp,nivel\nAna,120,3\nBia,60,2\nTeste,40,1\nCadu,10,1\n';
async function drain(p){const t=[];for(let k=0;k<2;k++){for(let i=0;i<10;i++){const m=p.locator('.sysmodal button.go');if(!(await m.count()))break;t.push(await p.locator('.sysmodal h3').first().textContent()+' | '+await p.locator('.sysmodal p').first().textContent());await m.first().dispatchEvent('click');await p.waitForTimeout(150);}await p.waitForTimeout(900);}return t;}
(async()=>{const b=await chromium.launch();
async function open(prog,time){const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];const posts=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://docs.google.com/**',r=>{if(r.request().method()==='POST'){posts.push(r.request().postData());return r.fulfill({status:200,body:''});}return r.fulfill({status:200,contentType:'text/csv',body:CSV});});
  await p.clock.install({time:new Date(time)});await p.goto(U);
  await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG,prog]);
  await p.reload();await p.waitForTimeout(1500);return {ctx,p,errs,posts};}
const base=(x={})=>Object.assign({log:{'2026-11-25':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},rank:{on:true,asked:true,uid:'abc12345'},velho:'fica'},x);
// 1: no ranking, 3º lugar
let {ctx,p,errs,posts}=await open(base(),'2026-11-25T14:00:00');let t=await drain(p);
ok('pílula 🏆 3º em Hoje',(await p.textContent('#lgPill')).includes('3º'),await p.textContent('#lgPill').catch(()=>'?'));
await p.locator('#lgPill').dispatchEvent('click');await p.waitForTimeout(300);
ok('tocar na pílula abre a aba Amigos com o ranking',await p.locator('#tmPanel').isVisible()&&await p.locator('#rankPanel').isVisible());
const ln=await p.textContent('#lgLine');ok('linha da liga com rival',ln.includes('Ferro')&&ln.includes('3º de 4')&&/Faltam \d+ XP para passar Bia/.test(ln),ln);
await p.screenshot({path:'/mnt/project-files/sequencia/liga.png'});
let st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
ok('snap salvo e campos antigos intactos',st.league.snap.pos===3&&st.velho==='fica'&&st.rank.uid==='abc12345');
ok('console limpo',errs.length===0,errs.join(' | '));await ctx.close();
// 2: semana anterior fechada em 2º: sobe de liga, uma vez só
({ctx,p,errs}=await open(base({league:{t:0,snap:{wk:'2026-11-16',pos:2,of:5,xp:80},res:{}}}),'2026-11-25T14:00:00'));t=await drain(p);
ok('fechamento: ficou em 2º e subiu para Bronze',t.some(x=>x.includes('2º de 5')&&x.includes('Bronze')),t.join(' / '));
st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));ok('liga t=1 e resultado gravado',st.league.t===1&&st.league.res['2026-11-16']===2);
await p.reload();await p.waitForTimeout(1500);t=await drain(p);ok('fechamento não repete',!t.some(x=>x.includes('SEMANA')||x.includes('ficou em')),t.join('/'));await ctx.close();
// 3: semana fechada em 4º: não cai
({ctx,p,errs}=await open(base({league:{t:2,snap:{wk:'2026-11-16',pos:4,of:5,xp:30},res:{}}}),'2026-11-25T14:00:00'));t=await drain(p);
st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));ok('4º: mantém a liga, ninguém cai',st.league.t===2&&t.some(x=>x.includes('ninguém cai')),t.join('/'));await ctx.close();
// 4: era 2º nesta semana, agora 3º: aviso de ultrapassagem
({ctx,p,errs}=await open(base({league:{t:0,snap:{wk:'2026-11-23',pos:2,of:4,xp:40},res:{}}}),'2026-11-25T14:00:00'));
ok('aviso: Bia te passou',(await p.textContent('#toast')).includes('Bia te passou'),await p.textContent('#toast'));await ctx.close();
// 5: fora do ranking: nada aparece
({ctx,p,errs}=await open(base({rank:undefined}),'2026-11-25T14:00:00'));await drain(p);
ok('fora do ranking: sem pílula',!(await p.locator('#lgPill').isVisible()));ok('fora do ranking: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
