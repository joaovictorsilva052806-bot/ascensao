// Janelas do Sistema (check-in, avisos, subir de nível) acessíveis por teclado e leitor de tela:
// - são "janela modal" com nome (o leitor diz "Check-in diário, janela", não só "janela");
// - ao abrir, o foco vai para o botão principal: Enter confirma sem precisar caçar o botão;
// - Tab não escapa para a tela de trás (que está coberta);
// - ao fechar, o foco volta para onde estava.
// Antes (até a main 6eec89c) o foco ficava atrás da janela e ela não tinha nome nem aria-modal.
// Raiz e /comecar/, celular 390x844, com e sem reduce-motion, console limpo, campo antigo intacto.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/dialogo.test.js
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-26',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]};
const PROG={log:{},extra:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1},simple:{off:'2026-11-01'},velho:'fica'};
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
const dentro=p=>p.evaluate(()=>{const o=[...document.querySelectorAll('.sysmodal,.levelup')].filter(m=>!m.hidden&&m.getClientRects().length);const m=o[o.length-1];return !!(m&&m.contains(document.activeElement));});
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']])for(const rm of ['no-preference','reduce']){
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
  await p.clock.install({time:new Date('2026-11-26T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));},[CFG,PROG,pre]);
  await p.goto(U+route);const tag=(route||'/')+(rm==='reduce'?' (reduce-motion)':'')+': ';
  // 1) a primeira janela do Sistema que abrir (check-in do dia)
  await p.waitForSelector('.sysmodal button.go',{state:'visible',timeout:10000});await p.waitForTimeout(400);
  const info=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal')].find(x=>!x.hidden&&x.getClientRects().length);
    const id=m.getAttribute('aria-labelledby');const nome=(m.getAttribute('aria-label')||(id||'').split(' ').map(x=>document.getElementById(x)).filter(Boolean).map(x=>x.textContent.trim()).join(' ')).trim();
    const a=document.activeElement;return {role:m.getAttribute('role'),modal:m.getAttribute('aria-modal'),nome,foco:m.contains(a),go:!!(a&&a.matches&&a.matches('button.go')),txt:a?a.textContent.trim():''};});
  ok(tag+'janela é dialog modal',info.role==='dialog'&&info.modal==='true',JSON.stringify(info));
  ok(tag+'janela tem nome ("'+info.nome.slice(0,40)+'")',info.nome.length>1);
  ok(tag+'nome diz o que é a janela ("check-in")',/check-in/i.test(info.nome),info.nome);
  ok(tag+'nome bate no leitor de tela (getByRole)',await p.getByRole('dialog',{name:/check-in/i}).count()>=1);
  ok(tag+'foco abre no botão principal ("'+info.txt+'")',info.foco&&info.go,JSON.stringify(info));
  for(let i=0;i<4;i++)await p.keyboard.press('Tab');
  ok(tag+'Tab não escapa da janela',await dentro(p));
  await p.keyboard.press('Shift+Tab');await p.keyboard.press('Shift+Tab');
  ok(tag+'Shift+Tab não escapa da janela',await dentro(p));
  // Enter no botão principal fecha (e o resto da fila, se houver, também recebe o foco)
  for(let k=0;k<6;k++){const vis=await p.evaluate(()=>[...document.querySelectorAll('.sysmodal')].some(x=>!x.hidden&&x.getClientRects().length));if(!vis)break;
    await p.waitForTimeout(150);const f=await dentro(p);if(!f){ok(tag+'janela seguinte da fila também recebe foco',false);break;}
    const go=await p.evaluate(()=>document.activeElement&&document.activeElement.matches('button.go'));
    if(go)await p.keyboard.press('Enter');else await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal')].find(x=>!x.hidden&&x.getClientRects().length);const g=m.querySelector('button.ghost,button.go');g&&g.click();});
    await p.waitForTimeout(500);}
  ok(tag+'Enter fecha as janelas do Sistema',!(await p.evaluate(()=>[...document.querySelectorAll('.sysmodal')].some(x=>!x.hidden&&x.getClientRects().length))));
  // 2) subir de nível: foco no "Continuar" e volta para onde estava
  await p.evaluate(()=>{const t=[...document.querySelectorAll('nav button')].find(b=>/Progresso/i.test(b.textContent));t.focus();});
  await p.evaluate(()=>{document.getElementById('levelup').hidden=false;});await p.waitForTimeout(300);
  const lu=await p.evaluate(()=>{const m=document.getElementById('levelup'),a=document.activeElement;const id=m.getAttribute('aria-labelledby');
    return {role:m.getAttribute('role'),modal:m.getAttribute('aria-modal'),nome:(id||'').split(' ').map(x=>document.getElementById(x)).filter(Boolean).map(x=>x.textContent.trim()).join(' ')||(m.getAttribute('aria-label')||''),foco:a&&a.id};});
  ok(tag+'subir de nível é dialog modal com nome',lu.role==='dialog'&&lu.modal==='true'&&/n[íi]vel/i.test(lu.nome),JSON.stringify(lu));
  ok(tag+'subir de nível: foco no Continuar',lu.foco==='luClose',JSON.stringify(lu));
  await p.keyboard.press('Enter');await p.waitForTimeout(300);
  const volta=await p.evaluate(()=>({h:document.getElementById('levelup').hidden,a:document.activeElement?document.activeElement.textContent.trim():''}));
  ok(tag+'Enter fecha o subir de nível',volta.h);
  ok(tag+'foco volta para a aba Progresso',/Progresso/i.test(volta.a),volta.a);
  // 3) dados e console
  const g=await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-prog')||'{}'),pre);
  ok(tag+'campo antigo intacto',g.velho==='fica');
  ok(tag+'console limpo',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
