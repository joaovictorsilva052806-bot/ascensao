// "Desfazer" do aviso (tools/noite.js) não expira escondido atrás de uma janela do Sistema.
// Achado na revisão de 28/11 15h23: a 1ª missão do dia 1 abre "Intelecto nível 2"; o aviso com "Desfazer" ficava sob o fundo da janela
// e os 5 s acabavam antes de o jogador fechar. Agora os 5 s recomeçam quando a última janela fecha.
// Rode com: python3 -m http.server 8000 & node qa/desfazer-janela.test.js
const {chromium}=require('playwright');const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const B='http://localhost:'+(process.env.QA_PORT||8000)+'/';
// fecha as janelas pelo botão (a fila sysQ precisa do clique) até ficar 1,2 s sem nenhuma
async function fecha(p){for(let i=0,vazio=0;i<30&&vazio<4;i++){const g=p.locator('.sysmodal:visible button.go');if(await g.count()){vazio=0;await g.first().dispatchEvent('click');await p.waitForTimeout(300);continue;}
  const l=p.locator('#levelup:not([hidden]) #luClose');if(await l.count()){vazio=0;await l.dispatchEvent('click');await p.waitForTimeout(300);continue;}vazio++;await p.waitForTimeout(300);}}
async function joga(b,rm){const tag=rm?'reduce-motion':'390px';
  const ctx=await b.newContext({viewport:{width:390,height:844},timezoneId:'America/Sao_Paulo',reducedMotion:rm?'reduce':'no-preference'});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('asc-u-tele'))localStorage.setItem('asc-u-tele','{"asked":1}');});
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,body:''}));await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,body:'{}'}));
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date('2026-11-28T18:30:00Z')});
  await p.goto(B+'comecar/');await p.waitForTimeout(400);
  await p.click('#q_perm');await p.fill('#q_name','Lia');await p.click('#q_n0');await p.waitForTimeout(200);
  await p.locator('#q_age button').nth(2).click();await p.waitForTimeout(200);await p.locator('#q_occ button').nth(1).click();await p.waitForTimeout(200);
  for(let i=0;i<6&&!(await p.locator('#q_done').isVisible());i++){const sk=p.locator('#q_xskip');if(await sk.isVisible())await sk.click();await p.waitForTimeout(150);}
  await p.click('#q_done');await p.waitForTimeout(1500);
  const sug=p.locator('#clsSug');if(await sug.count())await sug.click();await p.waitForTimeout(500);
  for(let i=0;i<6;i++){const g=p.locator('.sysmodal button.go:visible');if(!(await g.count()))break;await g.first().dispatchEvent('click');await p.waitForTimeout(400);}
  await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('asc-u-prog'));s.campoVelho='fica';localStorage.setItem('asc-u-prog',JSON.stringify(s));});
  await p.reload();await p.waitForTimeout(1200);await fecha(p);
  const qid=await p.locator('#quests .msgo:not([disabled])').first().evaluate(e=>e.closest('.quest[data-q]').dataset.q);
  await p.locator('#quests .msgo:not([disabled])').first().click();await p.waitForTimeout(400);
  await p.locator('#msSheet .msend button.go').first().click();
  // espera a janela do Sistema (atributo/nível) que a 1ª missão abre
  let m=0;for(let i=0;i<20&&!m;i++){await p.waitForTimeout(250);m=await p.locator('.sysmodal:visible,#levelup:not([hidden])').count();}
  ok(tag+': a 1ª missão abre uma janela do Sistema',m>0);
  const feito=await p.evaluate(q=>{const d=new Date();const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');return (JSON.parse(localStorage.getItem('asc-u-prog')).log[k]||[]).some(e=>e.q===q)},qid);
  ok(tag+': missão gravada',feito);
  await p.waitForTimeout(7000);
  ok(tag+': com a janela aberta 7 s, o Desfazer continua no aviso',await p.locator('#toast:not([hidden]) .ntundo').count()===1);
  await fecha(p);await p.waitForTimeout(1000);
  const u=p.locator('#toast:not([hidden]) .ntundo');
  ok(tag+': depois de fechar, o Desfazer está visível e tocável',await u.isVisible().catch(()=>false)&&await u.evaluate(e=>{const r=e.getBoundingClientRect();const x=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return x===e;}).catch(()=>false));
  if(!(await u.isVisible().catch(()=>false))){ok(tag+': Desfazer alcançável depois da janela',false,'sumiu atrás da janela');await ctx.close();return;}
  await u.click();await p.waitForTimeout(500);
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
  ok(tag+': Desfazer desmarca a missão',!Object.values(st.log).flat().some(e=>e.q===qid));
  ok(tag+': aviso "Desfeito."',/Desfeito\./.test(await p.textContent('#toast')));
  ok(tag+': campo antigo intacto',st.campoVelho==='fica');
  // de novo: fechada a janela, o Desfazer dura 5 s e some sozinho (não fica para sempre)
  await p.waitForTimeout(3000);await fecha(p);
  await p.locator('.quest[data-q="'+qid+'"] .msgo:not([disabled])').first().click();await p.waitForTimeout(400);
  await p.locator('#msSheet .msend button.go').first().click();await p.waitForTimeout(600);await fecha(p);
  const viu=await p.locator('#toast:not([hidden]) .ntundo').count();
  await p.waitForTimeout(6500);
  ok(tag+': fechada a janela, o Desfazer some depois dos 5 s',viu===1&&await p.locator('#toast:not([hidden]) .ntundo').count()===0,'viu='+viu);
  ok(tag+': console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
(async()=>{const b=await chromium.launch();await joga(b,false);await joga(b,true);await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
