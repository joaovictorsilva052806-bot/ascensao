// Métrica dos desafios relâmpago (tools/tele.js): só com opt-in, anônima (id aleatório, sem apelido), 1 linha por dia sobre ontem.
// Rode com: python3 -m http.server 8000 & node qa/metricas.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/comecar/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=a=>({version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:a},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]});
const PROG={log:{'2026-11-24':[{q:'zap:abd:2026-11-24',kind:'zap',xp:10,stat:'corpo',bonus:0,t:'x'},{q:'zap:duo:2026-11-24',kind:'duo',xp:10,stat:'corpo',bonus:0,t:'x'}]},zap:{'2026-11-24':{abd:1,agach:1}},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},velho:'fica'};
(async()=>{const b=await chromium.launch();
async function run(age,tele,tag){const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const posts=[],errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await ctx.route(/fonts/,r=>r.abort());await ctx.route('https://docs.google.com/**',r=>{if(r.request().method()==='POST'){posts.push(new URLSearchParams(r.request().postData()).get('entry.807978446')||'');}return r.fulfill({status:200,body:''});});
  await p.clock.install({time:new Date('2026-11-25T14:00:00')});await p.goto(U);
  await p.evaluate(([c,g,t])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(g));if(t)localStorage.setItem('asc-u-tele',JSON.stringify(t));localStorage.setItem('asc-u-zapmo',JSON.stringify({'2026-11-24':2}));for(const k of ['asc-u-season','asc-u-perm','asc-u-intro'])localStorage.setItem(k,'2');},[CFG(age),PROG,tele]);
  await p.reload();await p.waitForTimeout(2500);const first=posts.filter(v=>v.includes('|6-desafios|'));
  await p.reload();await p.waitForTimeout(2500);const all=posts.filter(v=>v.includes('|6-desafios|'));
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));await ctx.close();return {first,all,errs,st};}
let r=await run('adult',{on:true,asked:true,uid:'u1',nick:'Fulano'});
ok('opt-in: 1 linha sobre ontem com 2/3, dupla, sensor e uso',r.first.length===1&&/^A\|a\w+\|6-desafios\|20261124\|\w+\|(app|navegador)\|2\/3\|1\|1\|1$/.test(r.first[0]),r.first.join(' / '));
ok('opt-in: linha anônima (sem apelido nem uid)',r.first.every(v=>!v.includes('Fulano')&&!v.includes('|u1|')));
ok('recarregar no mesmo dia não manda de novo',r.all.length===1,String(r.all.length));
ok("progresso intacto",r.st.velho==="fica"&&r.st.zap["2026-11-24"].abd===1,JSON.stringify(r.st).slice(0,600));ok('console limpo',!r.errs.length,r.errs.join(' | '));
r=await run('adult',{asked:true,on:false});ok('sem opt-in: nada sai',r.all.length===0,r.all.join(' / '));
r=await run('kid',{on:true,asked:true,uid:'u2',nick:'Kid'});ok('até 13 anos: nada sai, mesmo com aceite gravado',r.all.length===0,r.all.join(' / '));
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
