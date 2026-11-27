// Escolha de classe enxuta: 1 toque na sugestão do Sistema; lista completa em "Ver outras" e ao trocar pelo topo.
// Desde o #47 a sugestão vem do perfil (foco/meta), não cai mais sempre em Mago.
// Rode com: python3 -m http.server 8000 & node qa/classe.test.js
const {chromium}=require('playwright');const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=(occ,focus)=>({version:3,name:'Teste',startDate:'2026-11-25',profile:{age:'adult',occ,focus},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]});
const P={log:{},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},velho:'fica'};
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']])for(const [occ,exp,focus,why] of [['estudante','Universitário',[],''],['','⚔️',[],'Pelo seu perfil'],['','Corpo',['corpo'],'Saúde e corpo']]){const tag=(route||'/')+' '+(occ||(focus.length?'foco '+focus[0]:'sem rotina'));
  const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{if(!localStorage.getItem('asc-u-tele'))localStorage.setItem('asc-u-tele','{"asked":1}');});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,body:''}));
  await p.goto('http://localhost:8000/'+route);
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG(occ,focus),P,pre]);
  await p.reload();
  for(let i=0;i<12&&!(await p.locator('#clsModal').count());i++){const m=p.locator('.sysmodal:not(#clsModal) button.go');if(await m.count())await m.first().dispatchEvent('click');await p.waitForTimeout(300);}
  ok(tag+': modal com sugestão '+exp,(await p.textContent('#clsSug').catch(()=>'')).includes(exp),await p.textContent('#clsSug').catch(()=>'sem modal'));
  if(why)ok(tag+': mostra o porquê',(await p.textContent('#clsModal .clswhy').catch(()=>'')).includes(why),await p.textContent('#clsModal .clswhy').catch(()=>'sem porquê'));
  ok(tag+': lista escondida',!(await p.locator('#clsModal .clsgrid').first().isVisible()));
  if(!occ&&!focus.length){await p.screenshot({path:'/mnt/project-files/sequencia/classe.png'});await p.click('#clsMore');ok(tag+': ver outras mostra a lista',await p.locator('#clsModal .clsgrid').first().isVisible()&&(await p.locator('#clsModal .clsbtn').count())>=5);await p.locator('#clsModal .clsbtn').first().click();}
  else await p.click('#clsSug');
  await p.waitForTimeout(300);const st=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
  ok(tag+': 1 toque grava a classe',st.rpg&&st.rpg.cls&&st.rpg.cls.name&&st.velho==='fica',JSON.stringify(st.rpg||{}));
  for(let i=0;i<5;i++){const m=p.locator('.sysmodal button.go');if(await m.count())await m.first().dispatchEvent('click');await p.waitForTimeout(200);}
  await p.locator('#clsPill').dispatchEvent('click');await p.waitForTimeout(200);
  ok(tag+': trocar pelo topo abre a lista completa',await p.locator('#clsModal .clsgrid').first().isVisible()&&!(await p.locator('#clsSug').isVisible()));
  ok(tag+': console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
