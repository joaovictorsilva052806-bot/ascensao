// Cartão "Aviso diário do Sistema" (#sysTip) na aba Hoje: ele nunca aparecia.
// Causa (até a main bc89c05): o sysTipUI escondia o cartão se existisse QUALQUER .sysmodal no DOM,
// e o #secZen (Modo Zen, tools/secret.js) fica sempre no DOM, só com hidden. Resultado: ninguém via a oferta do lembrete.
// Agora só uma janela aberta de verdade (sem hidden e na tela) segura o cartão.
// Raiz e /comecar/, 390x844 com reduce-motion: aparece, some com janela aberta, "Agora não" grava e não volta no reload,
// campo antigo intacto, console limpo.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/aviso-visivel.test.js
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'q2',title:'Treino 20 min',xp:20,stat:'corpo',main:true}]};
const PROG={log:{},extra:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1,seen:{foco:1,vendas:1,mente:1,corpo:1}},simple:{off:'2026-11-01'},velho:'fica'};
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
async function drain(p){for(let i=0;i<12;i++){const m=p.locator('.sysmodal:visible button.go');if(!(await m.count()))return;await m.first().dispatchEvent('click');await p.waitForTimeout(250);}}
// as outras dicas da Hoje saem da frente (só 1 .tip aparece por vez, de propósito)
const soTip=p=>p.evaluate(()=>{if(!document.getElementById('qaTip')){const st=document.createElement('style');st.id='qaTip';st.textContent='.panel.tip:not(#sysTip){display:none!important}#sysTip:not([hidden]){display:block!important}';document.head.appendChild(st);}for(const m of document.querySelectorAll('#tlModal'))m.remove();});
const est=p=>p.evaluate(()=>{const e=document.getElementById('sysTip');return {hid:e.hidden,vis:!!e.getClientRects().length,zen:!!document.getElementById('secZen')&&document.getElementById('secZen').hidden};});
(async()=>{const b=await chromium.launch();
for(const [route,pre,tip] of [['comecar/','asc-u','asc-u-systip'],['','ascensao','ascensao-systip']]){
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',isMobile:true,hasTouch:true});
  const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/,r=>r.abort());
  // semente gravada fora do app (mesma origem), para o app não sobrescrever no reload
  await p.goto(U+'privacidade/');
  await p.evaluate(([c,o,pre])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');
    for(const [k,v] of [['perm','1'],['intro','1'],['news','99'],['tele','{"asked":1}']])localStorage.setItem(pre+'-'+k,v);},[CFG,PROG,pre]);
  await p.goto(U+route);await p.waitForTimeout(1500);await drain(p);await p.waitForTimeout(800);await drain(p);await soTip(p);
  const tag=(route||'/')+': ';
  let s=await est(p);
  ok(tag+'Modo Zen fechado continua no DOM (era o que travava)',s.zen===true,JSON.stringify(s));
  ok(tag+'cartão do aviso diário aparece na Hoje',!s.hid&&s.vis,JSON.stringify(s));
  // com uma janela do Sistema aberta de verdade, o cartão espera
  await p.evaluate(()=>{const z=document.getElementById('secZen');z.hidden=false;});
  await p.locator('#quests .quest[data-q="q1"] button.go').dispatchEvent('click');await p.waitForTimeout(500);
  s=await est(p);ok(tag+'com janela aberta, o cartão espera',s.hid,JSON.stringify(s));
  await p.evaluate(()=>{const z=document.getElementById('secZen');z.hidden=true;});
  await drain(p);await p.evaluate(()=>{const l=document.getElementById('luClose');if(l&&!document.getElementById('levelup').hidden)l.click();});await p.waitForTimeout(300);await drain(p);
  await p.locator('#quests .quest[data-q="q2"] button.go').dispatchEvent('click');await p.waitForTimeout(500);await soTip(p);
  s=await est(p);ok(tag+'janela fechou: o cartão volta',!s.hid,JSON.stringify(s));
  // "Agora não" grava e não volta
  await p.evaluate(()=>document.getElementById('sysTipNo').click());await p.waitForTimeout(300);
  const flag=await p.evaluate(k=>localStorage.getItem(k),tip);
  ok(tag+'"Agora não" esconde e grava',(await est(p)).hid&&flag==='0',String(flag));
  await p.reload();await p.waitForTimeout(1500);await drain(p);await soTip(p);
  ok(tag+'depois do "Agora não", não volta no reload',(await est(p)).hid);
  const pr=await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-prog')||'{}'),pre);
  ok(tag+'campo antigo intacto',pr.velho==='fica'&&pr.rpg&&pr.rpg.cls&&pr.rpg.cls.id==='mago',JSON.stringify(pr).slice(0,120));
  ok(tag+'console sem erro',!errs.length,errs.join(' | '));
  await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${R.length-f}/${R.length} passaram`);process.exit(f?1:0);})();
