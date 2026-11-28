// Saneamento do armazenamento (tools/base.html sanProg/sanCfg/levelOf): formato corrompido ou XP gigante não derrubam nem travam o app;
// nada de alert por nome/título com HTML; entradas válidas do log continuam intactas. Raiz e /comecar/.
// Rode com: python3 -m http.server 8000 & node qa/saneamento.test.js
const {chromium}=require('playwright');const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
(async()=>{const b=await chromium.launch();
const CFG=JSON.stringify({version:3,name:'T',startDate:'2026-11-01',profile:{age:'adult'},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]});
const cases={'prog {':['{',CFG],'prog null':['null',CFG],'prog []':['[]',CFG],'prog log=5':['{"log":5}',CFG],'prog log arr':['{"log":[1,2]}',CFG],'log day str':['{"log":{"2026-11-26":"x"}}',CFG],'log entry null':['{"log":{"2026-11-26":[null,5,{"q":null}]}}',CFG],
'tp junk':['{"log":{"2026-11-26":[{"q":"q1","xp":10}]},"tp":{"desapega":{"s":"x"}},"tpwal":5,"ouro":"abc","ouroX":7}',CFG],
'cfg {':['{}','{'],'cfg quests str':['{}','{"version":3,"name":"T","quests":"x"}'],'cfg null':['{}','null'],'xp huge':['{"log":{"2026-11-26":[{"q":"q1","xp":1e308}]}}',CFG],
'valido':['{"log":{"2026-11-25":[{"q":"q1","xp":10,"stat":"mente"}],"2026-11-26":[{"q":"q1","xp":10},{"q":"ach:x","xp":5}]},"velho":"fica"}',CFG],'name html':['{}',JSON.stringify({version:3,name:'<img src=x onerror=alert(1)>',startDate:'2026-11-01',profile:{age:'adult'},quests:[{id:'q1',title:'<b onmouseover=alert(1)>x</b>',xp:10,stat:'mente',main:true}]})]};
for(const [k,[pr,cf]] of Object.entries(cases)){for(const route of ['','comecar/']){const pre=route?'asc-u':'ascensao';
 const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss();});
 await p.goto('http://localhost:8000/privacidade/');
 await p.evaluate(([pre,pr,cf])=>{localStorage.setItem(pre+'-cfg',cf);localStorage.setItem(pre+'-prog',pr);localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele','{"asked":1}');localStorage.setItem(pre+'-real','{"x":1}');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[pre,pr,cf]);
 await p.goto('http://localhost:8000/'+route);await p.waitForTimeout(1800);
 for(const t of ['foco','prog','lenda','mais','hoje']){await p.evaluate(t=>{const b=document.querySelector('#tabbar [data-go="'+t+'"]');b&&b.click();},t);await p.waitForTimeout(200);}
 const vis=await p.evaluate(()=>document.body.innerText.length);
 ok(k+' /'+route+': sem erro, sem travar e com tela',!errs.length&&vis>100,[...new Set(errs)].slice(0,3).join(' | ')+' text='+vis);
 if(k==='valido'){const st=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');ok('valido /'+route+': log válido intacto',st.velho==='fica'&&st.log['2026-11-25'].length===1&&st.log['2026-11-26'].length>=2,JSON.stringify(st.log));}
 await ctx.close();}}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
