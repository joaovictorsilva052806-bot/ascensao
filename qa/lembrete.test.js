// Lembrete diário de 1 toque (recado da EVA 7200114707, fase 1): oferta com chips de horário.
// Antes: "Ativar aviso diário" baixava um .ics com 5+ eventos semanais (iPhone) ou abria o Google sem escolher hora.
// Agora: abre "⏰ Quer que o Sistema te chame todo dia?" com 7h/12h/19h/21h/outro; 1 evento DAILY, UID fixo.
// Raiz e /comecar/, iPhone e Android em 390x844 (e 320 para rolagem lateral), reduce-motion, console limpo, progresso intacto.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/lembrete.test.js
const {chromium}=require('playwright');const fs=require('fs');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=(wake)=>({version:3,name:'Teste',startDate:'2026-11-20',profile:Object.assign({age:'adult'},wake?{wake}:{}),quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const PROG={log:{},extra:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1,seen:{foco:1,vendas:1,mente:1,corpo:1}},simple:{off:'2026-11-01'},velho:'fica'};
const UA={Android:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
  iPhone:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'};
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
async function drain(p){for(let i=0;i<12;i++){const m=p.locator('.sysmodal:visible:not(#lembOffer) button.go');if(!(await m.count()))return;await m.first().dispatchEvent('click');await p.waitForTimeout(250);}}
async function abre(b,route,pre,dev,wake,w){
  const ctx=await b.newContext({viewport:{width:w||390,height:844},reducedMotion:'reduce',userAgent:UA[dev],isMobile:true,hasTouch:true,acceptDownloads:true});
  const p=await ctx.newPage();p.errs=[];
  p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))p.errs.push(m.text())});
  await p.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/,r=>r.abort());
  await p.goto(U+'privacidade/');
  await p.evaluate(([c,o,pre])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');
    for(const [k,v] of [['perm','1'],['intro','1'],['news','99'],['tele','{"asked":1}']])localStorage.setItem(pre+'-'+k,v);},[CFG(wake),PROG,pre]);
  await p.addInitScript(()=>{window.__abriu=[];window.open=function(u){window.__abriu.push(String(u));return null;};});
  await p.goto(U+route);await p.waitForTimeout(1500);await drain(p);await p.waitForTimeout(800);await drain(p);
  await p.evaluate(()=>{for(const m of document.querySelectorAll('#tlModal'))m.remove();});
  return [ctx,p];}
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const r0=route||'/';
  // 1) iPhone, perfil acorda 06:30 → pré-seleciona 7h; .ics com 1 evento DAILY e UID fixo
  {const [ctx,p]=await abre(b,route,pre,'iPhone','06:30');const tag=r0+' iPhone: ';
    await p.evaluate(()=>document.getElementById('sysTipYes').click());await p.waitForTimeout(400);
    ok(tag+'abre a oferta "Quer que o Sistema te chame todo dia?"',await p.locator('#lembOffer').isVisible()&&/Quer que o Sistema te chame todo dia/.test(await p.locator('#lembOffer h3').textContent()));
    const ch=await p.$$eval('#lembOffer .lembchip',bs=>bs.map(b=>({t:b.textContent.trim(),on:b.getAttribute('aria-checked'),h:b.getBoundingClientRect().height,w:b.getBoundingClientRect().width})));
    ok(tag+'chips 7h, 12h, 19h, 21h e outro',ch.map(c=>c.t).join(',')==='7h,12h,19h,21h,outro',JSON.stringify(ch));
    ok(tag+'pré-seleção = acordar + 30 min (7h)',ch[0].on==='true'&&ch.filter(c=>c.on==='true').length===1,JSON.stringify(ch));
    ok(tag+'chips com ≥ 44px',ch.every(c=>c.h>=44&&c.w>=44),JSON.stringify(ch));
    ok(tag+'foco no chip escolhido',await p.evaluate(()=>document.activeElement&&document.activeElement.classList.contains('lembchip')&&document.activeElement.textContent==='7h'));
    ok(tag+'janela com nome e aria-modal',await p.evaluate(()=>{const m=document.getElementById('lembOffer');return m.getAttribute('role')==='dialog'&&m.getAttribute('aria-modal')==='true'&&!!document.getElementById(m.getAttribute('aria-labelledby'));}));
    ok(tag+'reduce-motion: a janela não anima',await p.evaluate(()=>getComputedStyle(document.querySelector('#lembOffer .card')).animationName==='none'));
    await p.locator('#lembOffer .lembchip',{hasText:'21h'}).click();
    const dl=p.waitForEvent('download',{timeout:5000});await p.locator('#lembAdd').click();const d=await dl;
    const ics=fs.readFileSync(await d.path(),'utf8');
    ok(tag+'arquivo aviso-diario-ascension.ics',d.suggestedFilename()==='aviso-diario-ascension.ics',d.suggestedFilename());
    ok(tag+'.ics com 1 evento só',(ics.match(/BEGIN:VEVENT/g)||[]).length===1,ics.slice(0,200));
    ok(tag+'.ics repete todo dia (DAILY)',/\r\nRRULE:FREQ=DAILY\r\n/.test(ics));
    ok(tag+'.ics com UID fixo (trocar hora substitui)',/\r\nUID:asc-diario@ascensao\r\n/.test(ics));
    ok(tag+'.ics avisa na hora (VALARM PT0M)',/BEGIN:VALARM[\s\S]*TRIGGER:PT0M[\s\S]*END:VALARM/.test(ics));
    ok(tag+'.ics no horário escolhido (21h)',/\r\nDTSTART:\d{8}T210000\r\n/.test(ics),(ics.match(/DTSTART:[^\r]+/)||[''])[0]);
    ok(tag+'.ics com título da missão',/SUMMARY:⚔️ Ascension: sua missão de hoje/.test(ics));
    ok(tag+'.ics com link do app sem #',/DESCRIPTION:[^\r]*localhost/.test(ics)&&!/DESCRIPTION:[^\r]*#/.test(ics));
    const st=await p.evaluate(pre=>({l:JSON.parse(localStorage.getItem(pre+'-lemb')||'{}'),t:localStorage.getItem(pre+'-systip'),pr:JSON.parse(localStorage.getItem(pre+'-prog')||'{}'),aberta:!!document.getElementById('lembOffer')}),pre);
    ok(tag+'grava só horário e resposta, chave própria',st.l.h==='21:00'&&st.l.r==='sim'&&Object.keys(st.l).sort().join()==='h,r,t',JSON.stringify(st.l));
    ok(tag+'cartão não volta (respondeu sim)',st.t==='1'&&!st.aberta,JSON.stringify(st.t));
    ok(tag+'progresso intacto e sem campo novo',st.pr.velho==='fica'&&st.pr.rpg.cls.id==='mago'&&!('lemb' in st.pr),JSON.stringify(st.pr).slice(0,120));
    // Mais > Lembretes reabre com o horário salvo; "outro" aceita hora livre
    await p.evaluate(()=>document.getElementById('lembMais').click());await p.waitForTimeout(300);
    ok(tag+'Mais > Lembretes reabre com 21h marcado',await p.evaluate(()=>{const o=document.querySelector('#lembOffer .lembchip.on');return !!o&&o.textContent==='21h';}));
    await p.locator('#lembOffer .lembchip',{hasText:'outro'}).click();
    ok(tag+'"outro" mostra campo de hora',await p.locator('#lembOutro').isVisible());
    await p.locator('#lembOutro').fill('06:45');
    const dl2=p.waitForEvent('download',{timeout:5000});await p.locator('#lembAdd').click();const d2=await dl2;const ics2=fs.readFileSync(await d2.path(),'utf8');
    ok(tag+'"outro" 06:45 vai para o .ics com o mesmo UID',/DTSTART:\d{8}T064500/.test(ics2)&&/UID:asc-diario@ascensao/.test(ics2));
    ok(tag+'console sem erro',!p.errs.length,p.errs.join(' | '));await ctx.close();}
  // 2) Android, sem hora de acordar → 19h; Google Agenda DAILY, sem .ics
  {const [ctx,p]=await abre(b,route,pre,'Android','');const tag=r0+' Android: ';
    await p.evaluate(()=>document.getElementById('sysTipYes').click());await p.waitForTimeout(400);
    ok(tag+'sem perfil de horário, pré-seleção 19h',await p.evaluate(()=>{const o=document.querySelector('#lembOffer .lembchip.on');return !!o&&o.textContent==='19h';}));
    let baixou=null;p.on('download',d=>{baixou=d.suggestedFilename();});
    await p.locator('#lembAdd').click();await p.waitForTimeout(600);
    const u=(await p.evaluate(()=>window.__abriu))[0]||'';
    ok(tag+'abre o Google Agenda com recur DAILY',/^https:\/\/calendar\.google\.com\/calendar\/render\?action=TEMPLATE/.test(u)&&decodeURIComponent((u.match(/recur=([^&]+)/)||[])[1]||'')==='RRULE:FREQ=DAILY',u.slice(0,200));
    ok(tag+'fuso de Brasília e 19h',/ctz=America\/Sao_Paulo/.test(u)&&/dates=\d{8}T190000\//.test(u),u.slice(0,200));
    ok(tag+'nada de .ics no Android',baixou===null,String(baixou));
    ok(tag+'console sem erro',!p.errs.length,p.errs.join(' | '));await ctx.close();}
  // 3) "Agora não" e Esc: fecham sem baixar nada e o cartão não insiste; 320 px sem rolagem lateral
  {const [ctx,p]=await abre(b,route,pre,'iPhone','',320);const tag=r0+' 320px: ';
    await p.evaluate(()=>document.getElementById('sysTipYes').click());await p.waitForTimeout(400);
    ok(tag+'sem rolagem lateral com a oferta aberta',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),String(await p.evaluate(()=>document.documentElement.scrollWidth)));
    const cr=await p.$eval('#lembOffer .card',c=>{const r=c.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;});ok(tag+'oferta cabe na tela',cr);
    let baixou=null;p.on('download',d=>{baixou=d.suggestedFilename();});
    await p.keyboard.press('Escape');await p.waitForTimeout(300);
    const st=await p.evaluate(pre=>({aberta:!!document.getElementById('lembOffer'),l:JSON.parse(localStorage.getItem(pre+'-lemb')||'{}'),t:localStorage.getItem(pre+'-systip')}),pre);
    ok(tag+'Esc fecha e grava "agora não"',!st.aberta&&st.l.r==='nao'&&st.t==='0'&&baixou===null,JSON.stringify(st));
    await p.evaluate(()=>document.getElementById('lembMais').click());await p.waitForTimeout(300);
    await p.locator('#lembNo').click();await p.waitForTimeout(200);
    ok(tag+'"Agora não" fecha sem baixar',!(await p.locator('#lembOffer').count())&&baixou===null);
    ok(tag+'console sem erro',!p.errs.length,p.errs.join(' | '));await ctx.close();}
}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${R.length-f}/${R.length} passaram`);process.exit(f?1:0);})();
