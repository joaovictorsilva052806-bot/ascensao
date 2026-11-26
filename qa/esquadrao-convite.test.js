// Esquadrão: recrutar manda convite e NÃO põe a pessoa no esquadrão (sem XP nem dano) até ela aceitar (linha J). Convite vence em 7 dias.
// Rode com: python3 -m http.server 8000 & node qa/esquadrao-convite.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/comecar/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]};
const row=(t,a,b,s,d)=>['','','','',t,a,b,s,d].join(',');
const HEAD=['nome,xp,nivel,,tipo,de,para,esquadrao,data,,pnick,seq,desafios,avatar,attrs','Ana,120,3','Teste,40,1'];
let CSV=HEAD.join('\n')+'\n';
const base=()=>({log:{'2026-11-26':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},
  rank:{on:true,asked:true,uid:'abc12345'},friends:{l:[],seen:{}},squad:{n:'Squad',m:[],won:{}}});
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});const errs=[];
await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
const posts=[];await ctx.route('https://docs.google.com/**',r=>{if(r.request().method()==='POST'){posts.push(new URLSearchParams(r.request().postData()).get('entry.807978446')||'');return r.fulfill({status:200,body:''});}return r.fulfill({status:200,contentType:'text/csv',body:CSV});});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.clock.install({time:new Date('2026-11-26T14:00:00')});await p.goto(U);
const put=o=>p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG,o]);
const get=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
await put(base());await p.reload();await p.waitForTimeout(1200);
const toasts=[];await p.exposeFunction('__t',t=>toasts.push(t));
await p.evaluate(()=>{const el=document.getElementById('toast');new MutationObserver(()=>window.__t(el.textContent)).observe(el,{childList:true,characterData:true,subtree:true});});
const clicked=await p.evaluate(()=>{const c=[...document.querySelectorAll('#sqPanel .sqchips .chip')].find(x=>/Ana/.test(x.textContent));if(!c)return false;c.click();return true;});
ok('chip de recrutar a Ana existe',clicked);await p.waitForTimeout(800);
let st=await get();
ok('convidada NÃO entra no esquadrão',!(st.squad.m||[]).includes('Ana'),JSON.stringify(st.squad.m));
ok('convite guardado com data no esquadrão',st.squad.inv&&/^2026-11-26/.test(st.squad.inv.Ana||''),JSON.stringify(st.squad.inv));
ok('convite guardado com data em sent',st.sqInv&&st.sqInv.sent&&/^2026-11-26/.test(Object.values(st.sqInv.sent)[0]||''),JSON.stringify(st.sqInv));
ok('linha I enviada uma vez só',posts.filter(x=>/^I\|/.test(x)).length===1,posts.join(' / '));
ok('toast diz convite enviado',toasts.some(t=>/Convite enviado/.test(t))&&!toasts.some(t=>/entrou no esquadr/.test(t)),toasts.join(' / '));
const pane=await p.evaluate(()=>document.getElementById('sqPanel').textContent);
ok('painel mostra "convidado · aguardando"',/convidado · aguardando/.test(pane),pane.slice(0,200));
ok('Ana não some/repete nos chips de recrutar',await p.evaluate(()=>![...document.querySelectorAll('#sqPanel .sqchips .chip')].some(x=>/Ana/.test(x.textContent))));
ok('chefe só conta eu (HP 250, sem XP da convidada)',/Dano do esquadrão: \d+ de 250\./.test(pane),pane.slice(0,300));
// Ana aceita: linha J chega
CSV=HEAD.concat([row('J','Ana','Teste','Squad','20261126')]).join('\n')+'\n';await p.reload();await p.waitForTimeout(1500);
st=await get();ok('linha J: Ana entra no esquadrão',(st.squad.m||[]).includes('Ana'),JSON.stringify(st.squad));
ok('linha J: convite pendente limpo',!st.squad.inv||!st.squad.inv.Ana,JSON.stringify(st.squad.inv));
// convite vencido (8 dias): J atrasado de quem não é amigo não entra, pendente some
CSV=HEAD.concat([row('J','Ana','Teste','Squad','20261126')]).join('\n')+'\n';
const old='2026-11-18T10:00:00.000Z';const o=base();o.squad.inv={Ana:old};o.sqInv={seen:{},sent:{ana:old}};await put(o);await p.reload();await p.waitForTimeout(1500);
st=await get();ok('convite vencido: J não põe ninguém no esquadrão',!(st.squad.m||[]).includes('Ana'),JSON.stringify(st.squad));
ok('convite vencido: pendente limpo',!st.squad.inv||!st.squad.inv.Ana,JSON.stringify(st.squad.inv));
ok('sem erros de página',errs.length===0,errs.join(' / '));
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
