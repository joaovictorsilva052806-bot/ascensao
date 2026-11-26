// Várias turmas (igreja, família...) + ranking semanal em destaque (tools/grupos.*).
// Migração sem perder nada, criar/trocar turma, link por turma dos dois lados, pódio, destaque em Hoje, LGPD 14-17 e ≤13.
// Rode com: python3 -m http.server 8000 & node qa/turmas.test.js
const {chromium}=require('playwright');const crypto=require('crypto');const fs=require('fs');
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const SHOT='/mnt/project-files/ascensao/prints/turmas/';try{fs.mkdirSync(SHOT,{recursive:true});}catch(e){}
const sig=(tk,n)=>'cv'+crypto.createHash('sha256').update(tk+'|'+n.toLowerCase()).digest('hex').slice(0,12);
const CFG=(age)=>({version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]});
const ROWS='nome,xp,nivel\nAna,120,3\nBia,60,2\nTeste,40,1\nCadu,10,1\nZeca,5,1\n';
const base=(x={})=>Object.assign({log:{'2026-11-25':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},
  rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1},simple:{off:'2026-11-01'},rank:{on:true,asked:true,uid:'abc12345',nick:'Teste'},
  friends:{l:['Ana','Bia'],pend:{},seen:{},velhoF:1},turma:{inv:'legado01',view:'turma'},velho:'fica'},x);
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
(async()=>{const b=await chromium.launch();
async function open(route,pre,prog,{age='adult',csv=ROWS,vp={width:390,height:844},query=''}={}){const ctx=await b.newContext({viewport:vp,hasTouch:true});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://docs.google.com/**',r=>r.request().method()==='POST'?r.fulfill({status:200,body:''}):r.fulfill({status:200,contentType:'text/csv',body:csv}));
  await ctx.route(/^https?:\/\/(?!localhost|docs\.google\.com)/,r=>r.abort());
  await p.clock.install({time:new Date('2026-11-26T10:00:00')});await p.goto('http://localhost:8000/'+route);
  await p.evaluate(([c,o,pre])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem(pre+'-tele',JSON.stringify({asked:'2026-11-01'}));},[CFG(age),prog,pre]);
  await p.goto('http://localhost:8000/'+route+query);await p.waitForTimeout(1600);await calm(p);return {ctx,p,errs};}
async function calm(p){let quiet=0;for(let i=0;i<30&&quiet<4;i++){await p.evaluate(()=>{const t=document.getElementById('tlModal');if(t){const g=t.querySelector('button.ghost');g?g.click():t.remove();}});
  const m=p.locator('.sysmodal:not(.avmk):not(#tlModal):not(.gtmodal):not(#gtAge) button.go');if(await m.count()){quiet=0;await m.first().dispatchEvent('click');await p.waitForTimeout(150);continue;}
  if(await p.locator('#levelup').isVisible().catch(()=>false)){quiet=0;await p.locator('#luClose').dispatchEvent('click');continue;}quiet++;await p.waitForTimeout(250);}}
const LS=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
const tab=(p,t)=>p.evaluate(t=>{const x=document.querySelector('#tabbar [data-go="'+t+'"]');if(x)x.click();},t);
const hscroll=p=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
for(const [route,pre,dev,vp] of [['comecar/','asc-u','iPhone',{width:390,height:844}],['comecar/','asc-u','Android',{width:412,height:915}],['','ascensao','iPhone',{width:390,height:844}]]){const tag=(route?'/comecar/':'/')+' '+dev;
  // 1. migração: quem já joga ganha "Minha turma" com os amigos e o link antigo
  let {ctx,p,errs}=await open(route,pre,base(),{vp});
  let st=await LS(p,pre);
  ok(tag+' migração: Minha turma com Ana e Bia',st.turmas&&st.turmas.l.length===1&&st.turmas.l[0].n==='Minha turma'&&st.turmas.l[0].m.join()==='Ana,Bia',JSON.stringify(st.turmas));
  ok(tag+' migração: campos antigos intactos',st.velho==='fica'&&st.friends.velhoF===1&&st.turma.inv==='legado01'&&st.rank.uid==='abc12345'&&st.log['2026-11-25']);
  // 2. destaque em Hoje
  const hero=p.locator('#gtHero');ok(tag+' Hoje: ranking da semana em destaque',await hero.isVisible()&&(await hero.textContent()).includes('Ranking da semana'));
  const ht=await hero.textContent();ok(tag+' Hoje: posição e quem passar',/3º\s*de 3/.test(ht)&&ht.includes('Faltam')&&ht.includes('Bia'),ht);
  await hero.screenshot({path:SHOT+'hoje-destaque-'+dev+(route?'':'-raiz')+'.png'});
  // 3. aba Amigos: seletor de turmas + pódio
  await tab(p,'amigos');await p.waitForTimeout(500);await p.locator('#tmPanel .tmseg button[data-v="turma"]').dispatchEvent('click');await p.waitForTimeout(200);
  ok(tag+' Amigos: seletor de turmas',await p.locator('#tmPanel .gtbar .gtchip.on').count()===1&&(await p.locator('#tmPanel .gtbar').textContent()).includes('Minha turma'));
  ok(tag+' Amigos: pódio com 3',await p.locator('#tmPanel .gtpod .gtp').count()===3);
  ok(tag+' Amigos: link antigo continua',(await p.locator('#tmPanel .cdurl').textContent()).includes('c=legado01')&&!(await p.locator('#tmPanel .cdurl').textContent()).includes('&t='));
  ok(tag+' Amigos: sem rolagem lateral',!(await hscroll(p)));
  await p.locator('#tmPanel').screenshot({path:SHOT+'amigos-turmas-'+dev+(route?'':'-raiz')+'.png'});
  // 4. criar turma Igreja só com a Ana
  await p.locator('#tmPanel .gtnew').click();await p.waitForTimeout(200);
  const md=p.locator('.gtmodal');ok(tag+' nova turma: folha abre como diálogo',await md.isVisible()&&await md.getAttribute('aria-modal')==='true');
  await md.locator('button.go').click();ok(tag+' nova turma: pede nome',(await md.locator('.gtmsg').textContent()).includes('nome'));
  await md.locator('.gtname').fill('Igreja');await md.locator('.gtems button',{hasText:'⛪'}).click();
  await md.locator('.gtchk',{hasText:'Ana'}).locator('input').check();
  await p.screenshot({path:SHOT+'nova-turma-'+dev+(route?'':'-raiz')+'.png'});
  await md.locator('button.go').click();await p.waitForTimeout(300);
  st=await LS(p,pre);const ig=st.turmas.l.find(t=>t.n==='Igreja');
  ok(tag+' nova turma: salva com Ana e vira a atual',ig&&ig.e==='⛪'&&ig.m.join()==='Ana'&&st.turmas.cur===ig.id,JSON.stringify(st.turmas));
  const names=await p.locator('#tmPanel .tmlist li:not(.tmzone) .tmtx b').allTextContents();
  ok(tag+' Igreja: lista só com você e Ana',names.length===2&&names.some(x=>x.startsWith('Ana'))&&!names.some(x=>x.startsWith('Bia')),names.join(','));
  ok(tag+' Igreja: botão da turma com o nome',(await p.locator('#tmPanel .tmseg button[data-v="turma"]').textContent()).includes('⛪'));
  const u=await p.locator('#tmPanel .cdurl').textContent();
  ok(tag+' Igreja: link próprio com a turma',/c=[a-z0-9]{8}&t=Igreja/.test(u)&&!u.includes('legado01'),u);
  // 5. trocar de volta
  await p.locator('#tmPanel .gtchip',{hasText:'Minha turma'}).click();await p.waitForTimeout(200);
  const n2=await p.locator('#tmPanel .tmlist li:not(.tmzone) .tmtx b').allTextContents();ok(tag+' troca: Minha turma volta com 3',n2.length===3,n2.join(','));
  // 6. renomear e apagar
  await p.locator('#tmPanel .gtchip',{hasText:'Igreja'}).click();await p.waitForTimeout(150);await p.locator('#tmPanel .gtchip.on').click();await p.waitForTimeout(150);
  await p.locator('.gtmodal .gtname').fill('Igreja Jovem');await p.locator('.gtmodal button.go').click();await p.waitForTimeout(200);
  st=await LS(p,pre);ok(tag+' editar: renomeia',st.turmas.l.some(t=>t.n==='Igreja Jovem'));
  await p.locator('#tmPanel .gtchip.on').click();await p.waitForTimeout(150);await p.locator('.gtmodal .gtdel').click();await p.locator('.gtmodal .gtdel').click();await p.waitForTimeout(200);
  st=await LS(p,pre);ok(tag+' apagar: turma some e amigos ficam',st.turmas.l.length===1&&st.friends.l.join()==='Ana,Bia');
  ok(tag+' console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  if(route==='')continue; // o resto vale igual nos dois apps; roda no /comecar/
  // 7. quem convidou: Zeca entrou pelo link da turma Família e cai nela
  const csv7=ROWS+',,,,F,Zeca,Teste,'+sig('fam00001','Zeca')+',20261126\n';
  ({ctx,p,errs}=await open(route,pre,base({turmas:{l:[{id:'t0',n:'Minha turma',e:'⭐',c:'',m:['Ana','Bia']},{id:'tf',n:'Família',e:'🏠',c:'fam00001',m:[]}],cur:'t0'}}),{vp,csv:csv7}));
  await tab(p,'amigos');await p.waitForTimeout(1500);st=await LS(p,pre);
  ok(tag+' convite: Zeca virou amigo e entrou na Família',st.friends.l.includes('Zeca')&&st.turmas.l.find(t=>t.id==='tf').m.includes('Zeca')&&!st.turmas.l[0].m.includes('Zeca'),JSON.stringify(st.turmas));
  ok(tag+' convite: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // 8. quem chega pelo link: já cai na turma com o nome do link
  ({ctx,p,errs}=await open(route,pre,base({friends:{l:[],pend:{},seen:{}},turma:{},rank:{on:true,asked:true,uid:'nov12345',nick:'Novo'}}),{vp,query:'?amigo=Ana&c=legado01&t=Fam%C3%ADlia'}));
  await p.waitForTimeout(800);st=await LS(p,pre);const fa=st.turmas&&st.turmas.l.find(t=>t.n==='Família');
  ok(tag+' chegou pelo link: Ana na turma Família',st.friends.l.includes('Ana')&&fa&&fa.m.includes('Ana'),JSON.stringify(st.turmas));
  ok(tag+' chegou pelo link: endereço limpo',!(await p.evaluate(()=>location.search)));await ctx.close();
  // 9. 14-17 fora do ranking: destaque convida, entrar pede apelido + responsável
  ({ctx,p,errs}=await open(route,pre,base({rank:undefined,friends:undefined,turma:undefined}),{vp,age:'teen'}));
  const h9=p.locator('#gtHero');ok(tag+' 14-17: destaque chama para o ranking',await h9.isVisible()&&(await h9.textContent()).includes('Falta você'));
  await h9.screenshot({path:SHOT+'hoje-entrar-'+dev+'.png'});
  await h9.locator('button.go').click();await p.waitForTimeout(200);const ga=p.locator('#gtAge');
  ok(tag+' 14-17: pede apelido e autorização',await ga.isVisible()&&(await ga.textContent()).includes('responsável'));
  await ga.locator('.gtname').fill('Raio');await ga.locator('button.go').click();
  ok(tag+' 14-17: sem autorização não entra',(await ga.locator('.gtmsg').textContent()).includes('responsável')&&!((await LS(p,pre)).rank||{}).on);
  await ga.locator('input[type=checkbox]').check();await ga.locator('button.go').click();await p.waitForTimeout(400);
  st=await LS(p,pre);ok(tag+' 14-17: entra com apelido e autorização gravada',st.rank&&st.rank.on&&st.rank.nick==='Raio'&&/^\d{4}-\d\d-\d\d$/.test(st.rank.par||''),JSON.stringify(st.rank));
  ok(tag+' 14-17: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // 10. "Agora não" some por 3 dias
  ({ctx,p,errs}=await open(route,pre,base({rank:{on:false,asked:true}}),{vp}));
  await p.locator('#gtHero .link',{hasText:'Agora não'}).click();await p.waitForTimeout(100);ok(tag+' agora não: some',!(await p.locator('#gtHero').isVisible()));
  await p.reload();await p.waitForTimeout(1500);ok(tag+' agora não: continua escondido depois de abrir de novo',!(await p.locator('#gtHero').isVisible()));await ctx.close();
  // 11. até 13: nada aparece
  ({ctx,p,errs}=await open(route,pre,base({rank:undefined}),{vp,age:'kid'}));
  ok(tag+' ≤13: sem destaque do ranking',!(await p.locator('#gtHero').isVisible()));ok(tag+' ≤13: console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
