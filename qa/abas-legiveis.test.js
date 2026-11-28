// Rótulos da barra de abas legíveis (revisão horária 28/11 13h23).
// Achado: HOJE, FOCO, PROGRESSO, AMIGOS e MAIS estavam em 8px para TODO jogador. A regra "6 abas" de tools/turma.css
// contava o botão ESCONDIDO de Lendárias como 6ª aba (nth-of-type não liga para [hidden]) e encolhia a barra de 5 abas.
// Agora a regra conta só abas visíveis e ntTabFit (tools/noite.js) dá ao rótulo o maior tamanho que cabe na aba (8 a 11,5px),
// em Chakra Petch (2ª fonte do HUD, mais estreita). Recalcula quando aparece/some aba, muda a largura ou a fonte carrega.
// Rode com: python3 -m http.server 8000 & node qa/abas-legiveis.test.js
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',profile:{name:'Ana',age:'18 a 29',wake:'07:00',sleep:'23:00'},quests:[{id:'u_agua',title:'Beber 6 copos de água',xp:10,stat:'corpo'}]};
const PROG={log:{'2026-11-20':[{q:'u_agua',kind:'full',xp:10,stat:'corpo',bonus:0,t:'2026-11-20T10:00:00'}]},rpg:{cls:{id:'mago',style:'fant',name:'Mago',stat:'mente'}},simple:{off:'2026-11-01'},age:'18',velho:'fica'};
const medir=p=>p.evaluate(()=>new Promise(res=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const bar=document.getElementById('tabbar');
  const bs=[...bar.querySelectorAll('button')].filter(b=>!b.hidden&&b.getClientRects().length);
  res(bs.map(b=>{let tw=0;for(const n of b.childNodes)if(n.nodeType===3&&n.textContent.trim()){const g=document.createRange();g.selectNodeContents(n);tw+=g.getBoundingClientRect().width;}
    return {go:b.dataset.go,fs:parseFloat(getComputedStyle(b).fontSize),tw:Math.round(tw),bw:Math.round(b.getBoundingClientRect().width)};}));}))));
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']])for(const vp of [{width:390,height:844},{width:320,height:640},{width:1280,height:800}])for(const rm of [false,true]){
  const N=(route?'/comecar/':'/')+' '+vp.width+(rm?' rm':'');
  const ctx=await b.newContext({viewport:vp,reducedMotion:rm?'reduce':'no-preference'});await ctx.addInitScript(()=>{window.__we=[];addEventListener('error',e=>window.__we.push(String(e.message)));});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide'])localStorage.setItem(k,'1');localStorage.setItem('asc-sm-last',String(Date.now()));},[CFG,PROG,pre]);
  await p.goto(U+route);await p.waitForTimeout(1500);await p.evaluate(()=>document.fonts&&document.fonts.ready);
  let m=await medir(p);const txt=x=>x.map(t=>t.go+' '+t.fs+'px '+t.tw+'/'+t.bw).join(', ');
  const min=Math.min(...m.map(t=>t.fs));
  ok(N+': barra com abas visíveis',m.length>=4,txt(m));
  if(vp.width>=390)ok(N+': rótulos com 10px ou mais (eram 8px)',min>=10,txt(m));
  else ok(N+': rótulos acima de 8px mesmo em 320px',min>8,txt(m));
  ok(N+': todos os rótulos do mesmo tamanho',m.every(t=>t.fs===m[0].fs),txt(m));
  ok(N+': nenhum rótulo passa da largura da aba',m.every(t=>t.tw<=t.bw),txt(m));
  // aparece a aba Lendárias (6 abas): a barra recalcula e continua cabendo
  await p.evaluate(()=>{const l=document.querySelector('#tabbar [data-go="lenda"]');if(l)l.hidden=false;else{const x=document.createElement('button');x.type='button';x.dataset.go='lenda';x.textContent='Lendárias';document.getElementById('tabbar').insertBefore(x,document.querySelector('#tabbar [data-go="mais"]'));}});
  await p.waitForTimeout(200);const m6=await medir(p);
  ok(N+': com 6 abas os rótulos encolhem e cabem',m6.length===m.length+1&&m6.every(t=>t.tw<=t.bw||t.fs===8)&&m6[0].fs<=m[0].fs,txt(m6));
  await p.evaluate(()=>{document.querySelector('#tabbar [data-go="lenda"]').hidden=true;});await p.waitForTimeout(200);const m5=await medir(p);
  ok(N+': aba some, rótulos voltam ao tamanho de antes',m5[0].fs===m[0].fs,txt(m5));
  // trocar de aba não mexe no tamanho; a aba aberta continua marcada
  await p.$eval('#tabbar [data-go="prog"]',e=>e.click());await p.waitForTimeout(200);const mp=await medir(p);
  ok(N+': trocar de aba mantém o tamanho e marca a aba aberta',mp[0].fs===m[0].fs&&await p.$eval('#tabbar [data-go="prog"]',e=>e.getAttribute('aria-current')==='page'),txt(mp));
  if(vp.width===390){await p.setViewportSize({width:320,height:700});await p.waitForTimeout(250);const mn=await medir(p);
    ok(N+': tela estreita (girar/janela menor) recalcula e cabe',mn[0].fs<m[0].fs&&mn.every(t=>t.tw<=t.bw),txt(mn));}
  const we=await p.evaluate(()=>window.__we||[]);ok(N+': sem erro de janela (nem laço do ResizeObserver)',!we.length,we.join(' | '));
  await p.reload();await p.waitForTimeout(1200);
  const st=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
  ok(N+': dados antigos intactos depois de recarregar',st.velho==='fica'&&st.log['2026-11-20'].length===1&&st.rpg.cls.id==='mago',JSON.stringify(st).slice(0,160));
  ok(N+': sem erro de console',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();const f=R.filter(x=>x.startsWith('FAIL'));console.log(R.join('\n'));console.log((R.length-f.length)+'/'+R.length+' passaram');process.exit(f.length?1:0);})();
