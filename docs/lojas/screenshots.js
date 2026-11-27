// Screenshots de loja: python3 -m http.server 8000 (na raiz) & node docs/lojas/screenshots.js && python3 docs/lojas/moldura.py
require("fs").mkdirSync("/tmp/asc-shots",{recursive:true});
const {chromium}=require('playwright');
const Q=[{id:'q1',title:'Estudar 40 min de Cálculo',xp:20,stat:'mente',main:true},{id:'q2',title:'Treino de 20 min',xp:15,stat:'corpo',main:true},{id:'q3',title:'Ler 10 páginas',xp:10,stat:'mente',main:true},{id:'q4',title:'Beber 2 L de água',xp:5,stat:'corpo'},{id:'q5',title:'Arrumar a mesa',xp:5,stat:'foco'}];
const CFG={version:3,name:'Lucas',startDate:'2026-11-10',profile:{age:'adult',occ:'faculdade',focus:['estudos']},quests:Q};
const log={};const d=new Date();d.setDate(d.getDate()-14);
for(let i=0;i<14;i++){const k=d.toISOString().slice(0,10);log[k]=Q.filter(q=>q.main||i%2).map(q=>({q:q.id,kind:'full',xp:q.xp,t:Date.now()}));d.setDate(d.getDate()+1);}
const today=new Date().toISOString().slice(0,10);log[today]=[{q:'q1',kind:'full',xp:20},{q:'q4',kind:'full',xp:5}];
const P={log,extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rank:{on:true,asked:true,uid:'abc12345',nick:'Lucas',par:'2026-11-10'},friends:{l:['Bia','Rafa','Duda'],pend:{},seen:{}}};
const CSV='nome,xp,nivel\nBia,1240,7\nLucas,1105,6\nRafa,980,6\nDuda,720,5\nTheo,540,4\nMalu,310,3\n';
(async()=>{const b=await chromium.launch();
for(const [name,vp,dsf] of [['android',{width:412,height:915},2.625],['iphone',{width:430,height:932},3]]){
 const ctx=await b.newContext({viewport:vp,deviceScaleFactor:dsf,isMobile:true,hasTouch:true});const p=await ctx.newPage();
 await ctx.route('https://docs.google.com/**',r=>r.request().method()==='POST'?r.fulfill({status:200,body:''}):r.fulfill({status:200,contentType:'text/csv',body:CSV}));await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));
 await p.clock.install({time:new Date(new Date().toISOString().slice(0,10)+'T09:41:00')});await p.goto('http://localhost:8000/comecar/');
 await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-news','5');localStorage.setItem('asc-u-tele',JSON.stringify({asked:true}));localStorage.setItem('asc-u-beta',JSON.stringify({asked:true}));},[CFG,P]);
 await p.reload();await p.waitForTimeout(2500);
 // fecha modais que aparecerem
 for(let i=0;i<6;i++){const closed=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal,[role=dialog]')].find(x=>x.getClientRects().length&&getComputedStyle(x).display!=='none');if(!m)return false;const btn=[...m.querySelectorAll('button')].pop();if(btn){btn.click();return true;}return false;});if(!closed)break;await p.waitForTimeout(700);}
 await p.waitForTimeout(3500);await p.screenshot({path:`/tmp/asc-shots/${name}-1-hoje.png`});
 await p.evaluate(()=>{const q=document.querySelector('#quests');const sec=q&&q.closest('section');window.scrollTo(0,(sec||q).getBoundingClientRect().top+scrollY-70);});await p.waitForTimeout(600);await p.screenshot({path:`/tmp/asc-shots/${name}-2-quests.png`});
 for(const [t,lab] of [['3-foco','Foco'],['4-prog','Progresso'],['5-amigos','Amigos']]){await p.evaluate(()=>window.scrollTo(0,0));await p.locator('nav >> text='+lab).first().click().catch(e=>console.log('nav',lab,e.message.slice(0,80)));await p.waitForTimeout(1200);
  for(let i=0;i<4;i++){const c=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal')].find(x=>x.getClientRects().length);if(!m)return false;[...m.querySelectorAll('button')].pop().click();return true;});if(!c)break;await p.waitForTimeout(600);}
  await p.screenshot({path:`/tmp/asc-shots/${name}-${t}.png`});}
 await ctx.close();}
await b.close();})();
