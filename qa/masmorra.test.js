// Masmorra da semana (tools/rpg.js): não tinha teste. Achado na revisão de 28/11 16h23:
// quem começa no meio da semana precisa de menos andares (ex.: sábado = 1), mas o baú dizia "Cinco andares numa semana".
// E a grade de andares só tinha símbolos (✓ ✗ ⚔ 🔒): o leitor de tela lia "marca de seleção seg".
// Rode com: python3 -m http.server 8000 & node qa/masmorra.test.js
const {chromium}=require('playwright');const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const B='http://localhost:'+(process.env.QA_PORT||8000)+'/';
async function fecha(p){for(let i=0,v=0;i<30&&v<4;i++){const g=p.locator('.sysmodal:visible button.go');if(await g.count()){v=0;await g.first().dispatchEvent('click');await p.waitForTimeout(300);continue;}
  const l=p.locator('#levelup:not([hidden]) #luClose');if(await l.count()){v=0;await l.dispatchEvent('click');await p.waitForTimeout(300);continue;}v++;await p.waitForTimeout(300);}}
async function onboard(p){await p.goto(B+'comecar/');await p.waitForTimeout(400);
  await p.click('#q_perm');await p.fill('#q_name','Lia');await p.click('#q_n0');await p.waitForTimeout(200);
  await p.locator('#q_age button').nth(2).click();await p.waitForTimeout(200);await p.locator('#q_occ button').nth(1).click();await p.waitForTimeout(200);
  for(let i=0;i<6&&!(await p.locator('#q_done').isVisible());i++){const sk=p.locator('#q_xskip');if(await sk.isVisible())await sk.click();await p.waitForTimeout(150);}
  await p.click('#q_done');await p.waitForTimeout(1500);const sug=p.locator('#clsSug');if(await sug.count())await sug.click();await p.waitForTimeout(500);await fecha(p);}
// grava o save numa página fora do app (a semente não é sobrescrita) e reabre o app
async function semeia(p,fn,arg){const st=await p.evaluate(()=>({prog:localStorage.getItem('asc-u-prog'),cfg:localStorage.getItem('asc-u-cfg')}));
  await p.goto(B+'privacidade/');await p.evaluate(([st,fn,arg])=>{const prog=JSON.parse(st.prog),cfg=JSON.parse(st.cfg);new Function('prog','cfg','arg',fn)(prog,cfg,arg);
    prog.campoVelho='fica';localStorage.setItem('asc-u-prog',JSON.stringify(prog));localStorage.setItem('asc-u-cfg',JSON.stringify(cfg));},[st,fn,arg]);
  await p.goto(B+'comecar/');await p.waitForTimeout(1200);await fecha(p);}
async function abreMasmorra(p){await p.locator('[data-go="prog"]').first().click();await p.waitForTimeout(600);
  const d=p.locator('#dunPanel');await d.scrollIntoViewIfNeeded();if(!(await p.locator('#dunFloors').isVisible()))await d.locator('h2').first().click();await p.waitForTimeout(400);}
const MARCA='const ids=cfg.quests.map(q=>q.id);for(const k of arg){prog.log[k]=(prog.log[k]||[]).concat(ids.map(id=>({q:id,xp:10,stat:"foco",t:k+"T12:00:00.000Z"})));}';
async function caso(b,vw,rm,semana){const tag=(vw===390?'390px':'desktop')+(rm?' reduce-motion':'')+(semana?' · 5 andares':' · começou no sábado');
  const ctx=await b.newContext({viewport:{width:vw,height:vw===390?844:900},timezoneId:'America/Sao_Paulo',reducedMotion:rm?'reduce':'no-preference'});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('asc-u-tele'))localStorage.setItem('asc-u-tele','{"asked":1}');});
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,body:''}));await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,body:'{}'}));
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date('2026-11-28T19:30:00Z')});// sábado 16h30 em Brasília
  await onboard(p);
  if(semana)await semeia(p,'cfg.startDate="2026-11-02";'+MARCA,['2026-11-23','2026-11-24','2026-11-25','2026-11-26','2026-11-27']);
  await abreMasmorra(p);
  const it=p.locator('#dunFloors [role="listitem"]');
  ok(tag+': a grade é uma lista com 7 andares',await p.locator('#dunFloors[role="list"]').count()===1&&await it.count()===7);
  const lb=await it.evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));
  ok(tag+': cada andar diz o dia por extenso',lb.length===7&&lb[0]&&lb[0].startsWith('segunda')&&lb[5].startsWith('sábado')&&lb[6].startsWith('domingo'),JSON.stringify(lb));
  ok(tag+': hoje (sábado) está em aberto',/^sábado: hoje, em aberto$/.test(lb[5]||''),lb[5]);
  ok(tag+': domingo ainda não chegou',/^domingo: ainda não chegou$/.test(lb[6]||''),lb[6]);
  if(semana)ok(tag+': seg a sex limpos',lb.slice(0,5).every(x=>/: limpo$/.test(x)),JSON.stringify(lb));
  else ok(tag+': antes do começo é dito',lb.slice(0,5).every(x=>/: antes do seu começo$/.test(x)),JSON.stringify(lb));
  ok(tag+': símbolos escondidos do leitor de tela',await p.locator('#dunFloors b:not([aria-hidden="true"])').count()===0);
  ok(tag+': o rótulo curto continua na tela',(await p.locator('#dunFloors').innerText()).replace(/\s+/g,' ').includes('sáb'));
  if(!semana){ok(tag+': contador 0/1',(await p.textContent('#dunCount')).trim()==='0/1 andares');
    ok(tag+': baú fechado antes de limpar',await p.locator('#dunOpen').isHidden());
    await semeia(p,MARCA,['2026-11-28']);await abreMasmorra(p);
    ok(tag+': limpou hoje: andar de sábado limpo',(await p.locator('#dunFloors [role="listitem"]').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label'))))[5]==='sábado: limpo');}
  else ok(tag+': contador 5/5',(await p.textContent('#dunCount')).trim()==='5/5 andares');
  const open=p.locator('#dunOpen');ok(tag+': baú pronto para abrir',await open.isVisible());
  await open.click();let txt='';for(let i=0;i<20&&!/MASMORRA VENCIDA/.test(txt);i++){await p.waitForTimeout(250);txt=(await p.locator('.sysmodal:visible').allInnerTexts()).join(' ');}
  ok(tag+': janela MASMORRA VENCIDA',/MASMORRA VENCIDA/.test(txt));
  if(semana)ok(tag+': texto conta 5 andares',/Cinco andares numa semana/.test(txt),txt);
  else{ok(tag+': texto não diz "Cinco andares" a quem limpou 1',!/Cinco andares/.test(txt),txt);ok(tag+': texto diz 1 andar e a próxima com 5',/1 andar já na sua 1ª semana/.test(txt)&&/com 5 andares/.test(txt),txt);}
  await fecha(p);
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));const dun=Object.values(st.log).flat().filter(e=>e.q==='dun:2026-11-23');
  ok(tag+': +50 XP gravado uma vez',dun.length===1&&dun[0].xp===50,JSON.stringify(dun));
  ok(tag+': campo antigo intacto',st.campoVelho==='fica');
  await abreMasmorra(p);ok(tag+': baú aberto some e o texto avisa',await open.isHidden()&&/Baú aberto/.test(await p.textContent('#dunText')));
  await p.reload();await p.waitForTimeout(1200);await fecha(p);await abreMasmorra(p);
  ok(tag+': recarregar mantém o baú aberto',await p.locator('#dunOpen').isHidden()&&(await p.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('asc-u-prog')).log).flat().filter(e=>e.q==='dun:2026-11-23').length))===1);
  ok(tag+': console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
(async()=>{const b=await chromium.launch();for(const [vw,rm,s] of [[390,false,false],[390,true,false],[1280,false,true],[390,true,true]])await caso(b,vw,rm,s);await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
