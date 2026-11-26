// Ranking: quem foi "engolido" por outra pessoa de mesmo primeiro nome ganha apelido único; servidor fora do ar não trava em "Carregando…".
// Rode com: python3 -m http.server 8000 & node qa/ranking-nome.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/comecar/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]};
const WS='20261123';
const base=(rank)=>({log:{'2026-11-26':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},rank});
async function run(b,{csv,status,rank,cache}){const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const posts=[];
  await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  await ctx.route('https://docs.google.com/**',r=>{if(r.request().method()==='POST'){posts.push(new URLSearchParams(r.request().postData()).get('entry.807978446')||'');return r.fulfill({status:200,body:''});}
    return r.fulfill({status:status||200,contentType:status?'text/html':'text/csv',body:status?'<html><b>500.</b> error</html>':csv});});
  await p.clock.install({time:new Date('2026-11-26T14:00:00')});await p.goto(U);
  await p.evaluate(([c,o,k])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');if(k)localStorage.setItem('rkcache:/comecar/',JSON.stringify(k));},[CFG,base(rank),cache]);
  await p.reload();for(let i=0;i<6;i++){await p.waitForTimeout(400);const g=p.locator('.sysmodal button.ghost');if(await g.count())await g.first().dispatchEvent('click');}
  await p.waitForTimeout(1500);const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));const txt=await p.evaluate(()=>document.getElementById('rkList').innerText);
  await ctx.close();return {st,posts,txt};}
(async()=>{const b=await chromium.launch();
const last=new Date('2026-11-26T12:00:00').toISOString(),old=new Date('2026-11-26T13:00:00').getTime();const K=(o)=>Object.assign({on:true,asked:true,uid:'abc12345',lastXp:40,lastWk:WS,last,sentWk:WS,sent:[40]},o);
let o=await run(b,{csv:'nome,xp,nivel\nTeste,999,7\nAna,50,2\n',rank:K({shSince:old})});
ok('engolido por outro "Teste": vira "Teste S."',o.st.rank.nick==='Teste S.',o.st.rank.nick);
ok('reenvia o R já com o apelido novo',o.posts.some(v=>/^R\|abc12345\|Teste S\.\|/.test(v)),o.posts.join(' / '));
o=await run(b,{csv:'nome,xp,nivel\nTeste,40,1\n',rank:K({shSince:old})});
ok('XP bate com um que eu mandei (atrasado): mantém o primeiro nome',!o.st.rank.nick&&!o.st.rank.shSince,o.st.rank.nick);
o=await run(b,{csv:'nome,xp,nivel\nTeste,999,7\n',rank:K({})});
ok('1ª vez que não bate: só marca e espera 15 min',!o.st.rank.nick&&o.st.rank.shSince>0,JSON.stringify(o.st.rank));
o=await run(b,{csv:'nome,xp,nivel\nTeste,999,7\n',rank:K({nick:'Tes',shSince:old})});
ok('quem já tem apelido não muda',o.st.rank.nick==='Tes');
o=await run(b,{status:500,rank:{on:true,asked:true,uid:'abc12345'}});
ok('servidor fora e sem lista guardada: "Sem conexão" com tentar de novo',/Sem conexão/.test(o.txt)&&/Tentar de novo/.test(o.txt)&&!/Carregando/.test(o.txt),o.txt);
o=await run(b,{status:500,rank:{on:true,asked:true,uid:'abc12345'},cache:[{n:'Bia',xp:70,lv:3}]});
ok('servidor fora com lista guardada: mostra a última lista',/Bia/.test(o.txt)&&/última lista/.test(o.txt),o.txt);
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
