// "Ativar aviso diário" (cartão #sysTip da aba Hoje) no Android.
// Antes (até a main 3f9c96a) o toque baixava o arquivo .ics, que o Android não abre na agenda
// (o próprio app já escondia o botão .ics no Android por isso): o toque não fazia nada útil.
// Agora, no Android, abre o Google Agenda já preenchido com 1 evento diário do Sistema; iPhone/PC seguem com o .ics.
// Raiz e /comecar/, celular 390x844 com reduce-motion, console limpo, campo antigo intacto.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/aviso-agenda.test.js
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'q2',title:'Treino 20 min',xp:20,stat:'corpo',main:true}]};
const PROG={log:{},extra:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1,seen:{foco:1,vendas:1,mente:1,corpo:1}},simple:{off:'2026-11-01'},velho:'fica'};
const UA={Android:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
  iPhone:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'};
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
async function drain(p){for(let i=0;i<12;i++){const m=p.locator('.sysmodal:visible button.go');if(!(await m.count()))return;await m.first().dispatchEvent('click');await p.waitForTimeout(250);}}
(async()=>{const b=await chromium.launch();
for(const [route,pre,tip] of [['comecar/','asc-u','asc-u-systip'],['','ascensao','ascensao-systip']])for(const dev of ['Android','iPhone']){
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',userAgent:UA[dev],isMobile:true,hasTouch:true,acceptDownloads:true});
  const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/,r=>r.abort());
  // semente gravada fora do app (mesma origem), para o app não sobrescrever no reload
  await p.goto(U+'privacidade/');
  await p.evaluate(([c,o,pre])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');
    for(const [k,v] of [['perm','1'],['intro','1'],['news','99'],['tele','{"asked":1}']])localStorage.setItem(pre+'-'+k,v);},[CFG,PROG,pre]);
  await p.addInitScript(()=>{window.__abriu=[];const o=window.open;window.open=function(u){window.__abriu.push(String(u));return null;};});
  await p.goto(U+route);await p.waitForTimeout(1500);await drain(p);await p.waitForTimeout(800);await drain(p);
  await p.evaluate(()=>{for(const m of document.querySelectorAll('#tlModal'))m.remove();});
  const tag=(route||'/')+' '+dev+': ';
  // (quando o cartão aparece é a fase 1 do lembrete; aqui só o que o toque faz)
  const tem=await p.evaluate(()=>!!document.getElementById('sysTip')&&!!document.getElementById('sysTipYes'));
  ok(tag+'cartão "Quer que o Sistema te chame?" existe',tem);
  let baixou=null;p.on('download',d=>{baixou=d.suggestedFilename();});
  await p.evaluate(()=>document.getElementById('sysTipYes').click());await p.waitForTimeout(900);
  const r=await p.evaluate(k=>({abriu:window.__abriu,flag:localStorage.getItem(k),esc:document.getElementById('sysTip').hidden,toast:(document.querySelector('.toast,#toast')||{}).textContent||''}),tip);
  if(dev==='Android'){
    const u=r.abriu[0]||'';
    ok(tag+'abre o Google Agenda já preenchido',/^https:\/\/calendar\.google\.com\/calendar\/render\?action=TEMPLATE/.test(u),JSON.stringify(r.abriu));
    ok(tag+'evento é o aviso diário do Sistema',/text=%5BSISTEMA%5D%20Miss%C3%A3o%20di%C3%A1ria/.test(u),u.slice(0,160));
    ok(tag+'repete todo dia (7 dias)',decodeURIComponent((u.match(/recur=([^&]+)/)||[])[1]||'')==='RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU',u);
    ok(tag+'só 1 evento aberto',r.abriu.length===1,String(r.abriu.length));
    ok(tag+'link do app sem # na descrição',/details=[^&]*localhost/.test(u)&&!/%23/.test((u.match(/details=([^&]+)/)||[])[1]||''),u.slice(-120));
    ok(tag+'não baixa .ics (Android não abre)',baixou===null,String(baixou));
    ok(tag+'aviso fala em Salvar, não em "Adicionar tudo"',/Salvar/.test(r.toast)&&!/Adicionar tudo/.test(r.toast),r.toast);
  }else{
    ok(tag+'baixa o .ics da agenda',baixou==='lembretes-ascensao.ics',String(baixou));
    ok(tag+'não abre o Google Agenda',!r.abriu.length,JSON.stringify(r.abriu));
  }
  ok(tag+'cartão some e grava a resposta',r.esc&&r.flag==='1',JSON.stringify(r));
  const pr=await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-prog')||'{}'),pre);
  ok(tag+'campo antigo intacto',pr.velho==='fica'&&pr.rpg&&pr.rpg.cls&&pr.rpg.cls.id==='mago',JSON.stringify(pr).slice(0,120));
  ok(tag+'console sem erro',!errs.length,errs.join(' | '));
  await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${R.length-f}/${R.length} passaram`);process.exit(f?1:0);})();
