// Mural (com servidor falso) e Álbum de figurinhas. Rode com: python3 -m http.server 8000 & node qa/mural.test.js [pasta-de-prints]
const {chromium}=require('playwright');const U='http://localhost:8000/comecar/';const OUT=process.argv[2]||require('os').tmpdir();
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const EXEC='https://script.google.com/macros/s/AKfycbTESTE123/exec';
const CSV='nome,xp,nivel\nAna,240,5\nBia,180,4\nTeste,40,1\n';
const mk=age=>({version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age},quests:[{id:'q1',title:'Treino de 20 min',xp:20,stat:'corpo',main:true},{id:'s_fech',title:'Antes de dormir: marcar o que fiz hoje',xp:15,stat:'foco',main:true}]});
const base=(x={})=>Object.assign({log:{},extra:{},faith:{},energy:{'2026-11-25':'media'},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},rank:{on:true,asked:true,uid:'abc12345',nick:'Teste'},friends:{l:['Ana'],pend:{},seen:{}}},x);
async function drain(p){for(let i=0;i<10;i++){const m=p.locator('.sysmodal:not(.mumodal):visible');if(!(await m.count()))return;const t=await m.first().textContent();const bt=m.first().locator('button.go, button.ghost, button').first();await bt.dispatchEvent('click');await p.waitForTimeout(250);}}
(async()=>{const b=await chromium.launch();
async function open(prog,age){const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];const calls=[];const posts=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://docs.google.com/**',r=>r.request().method()==='POST'?r.fulfill({status:200,body:''}):r.fulfill({status:200,contentType:'text/csv',body:CSV}));
  await ctx.route('https://script.google.com/**',r=>{const j=JSON.parse(r.request().postData()||'{}');calls.push(j);let out={ok:true};
    if(j.a==='post'){posts.push({id:'m'+'a'.repeat(15),a:'Teste',d:new Date().toISOString(),q:j.q,cap:j.cap,img:j.img,r:{},my:{}});}
    if(j.a==='list')out={ok:true,posts:[...posts,{id:'mbbbbbbbbbbbbbbb',a:'Ana',d:new Date(Date.now()-36e5).toISOString(),q:'',cap:'Feito ✅',img:'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==',r:{'🔥':2},my:{}}]};
    return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(out)});});
  await p.clock.install({time:new Date('2026-11-25T19:00:00')});await p.goto(U);
  await p.evaluate(([c,o,e])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-tele','{"asked":1}');localStorage.setItem('asc-mural-url',e);},[mk(age),prog,EXEC]);
  await p.reload();await p.waitForTimeout(1800);for(let i=0;i<8;i++){const m=p.locator('.sysmodal button.go');if(!(await m.count()))break;await m.first().dispatchEvent('click');await p.waitForTimeout(200);}
  return {ctx,p,errs,calls};}
// 1: 14-17 anos: precisa do responsável; posta foto sem EXIF e até 70 KB; vê post de amigo
let {ctx,p,errs,calls}=await open(base(),'teen');
await p.locator('#quests .quest[data-q="q1"] button.go').first().dispatchEvent('click');await p.waitForTimeout(500);
ok('chip de foto depois da tarefa',(await p.textContent('#muChip').catch(()=>''))==='📸 Provar no mural');
await drain(p);await p.waitForTimeout(800);await drain(p);await p.locator('#muChip').click();await p.waitForTimeout(300);
ok('consentimento pede responsável (14-17)',(await p.textContent('.mumodal')).includes('responsável'));
await p.locator('.mumodal input[type=checkbox]').first().check();await p.locator('.mumodal button.go').click();await p.waitForTimeout(200);
ok('sem o responsável não liga',(await p.textContent('.mumsg')).includes('responsável')&&!calls.some(c=>c.a==='reg'));
await p.locator('.mumodal input[type=checkbox]').nth(1).check();
const fc=p.waitForEvent('filechooser');await p.locator('.mumodal button.go').click();const ch=await fc;
ok('reg com faixa teen e par=1 e token',calls.some(c=>c.a==='reg'&&c.band==='teen'&&c.par===1&&/^tk/.test(c.tk)));
await ch.setFiles(__dirname+'/../ch-Pixel7.png');await p.waitForTimeout(1500);
ok('prévia com aviso de rosto/escola',(await p.textContent('.mumodal')).includes('Sem rosto, escola'));
await p.screenshot({path:OUT+'/mural-previa.png'});
await p.locator('.mumodal .mucaps button',{hasText:'Feito ✅'}).click();await p.locator('.mumodal button.go').click();await p.waitForTimeout(800);
const pc=calls.find(c=>c.a==='post');const raw=pc?Buffer.from(pc.img.split(',')[1],'base64'):Buffer.alloc(0);
ok('post: JPEG até 70 KB',!!pc&&/^data:image\/jpeg;base64,/.test(pc.img)&&raw.length<=70000,pc?raw.length+' bytes':'sem post');
ok('post: sem EXIF/GPS',raw.length>4&&raw[0]===0xFF&&raw[1]===0xD8&&!raw.includes(Buffer.from('Exif')));
ok('post: legenda da lista e tarefa',pc&&pc.cap==='Feito ✅'&&pc.q==='Treino de 20 min');
await p.locator('#tabbar [data-go="amigos"]').dispatchEvent('click');await p.waitForTimeout(800);
ok('mural mostra 2 posts',(await p.locator('.mupost').count())===2);
ok('post sem tarefa mostra só a legenda',(await p.textContent('.mupost:nth-child(2) .muq')).trim()==='Feito ✅');
ok('meu post tem Apagar, do amigo tem Denunciar',(await p.textContent('.mupost:nth-child(1) .muop'))==='Apagar'&&(await p.textContent('.mupost:nth-child(2) .muop'))==='Denunciar');
await p.locator('.mupost:nth-child(2) .murb').first().click();await p.waitForTimeout(300);
ok('reação vai ao servidor',calls.some(c=>c.a==='react'&&c.e==='🔥'&&c.id==='mbbbbbbbbbbbbbbb'));
await p.locator('#muPanel').screenshot({path:OUT+'/mural-turma.png'});
ok('console limpo (1)',errs.length===0,errs.join(' | '));await ctx.close();
// 2: até 13: nada de foto, figurinha no álbum local, nenhuma chamada ao servidor
({ctx,p,errs,calls}=await open(base({rank:undefined,friends:undefined}),'kid'));
await p.locator('#quests .quest[data-q="q1"] button.go').first().dispatchEvent('click');await p.waitForTimeout(500);
ok('≤13: chip de figurinha',(await p.textContent('#muChip').catch(()=>''))==='⭐ Colar figurinha');
await drain(p);await p.waitForTimeout(800);await drain(p);await p.locator('#muChip').click();await p.waitForTimeout(200);await p.locator('.mus',{hasText:'🏆'}).click();await p.waitForTimeout(300);
const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
ok('≤13: figurinha no álbum local',st.mural.stk['2026-11-25'].some(x=>x.e==='🏆'));
ok('≤13: nenhuma chamada ao servidor do mural',calls.length===0);
ok('≤13: painel do mural escondido',!(await p.locator('#muPanel').isVisible()));
await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await p.waitForTimeout(300);
await p.evaluate(()=>{const d=document.querySelector('#muAlbum');if(d&&d.classList.contains('closed'))d.querySelector('h2').click();});
await p.locator('#muAlbum').screenshot({path:OUT+'/album-figurinhas.png'});
ok('console limpo (2)',errs.length===0,errs.join(' | '));await ctx.close();
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
