// Aviso diário com o app fechado (Web Push, fase 2 dos lembretes · tools/push.js + server/push.gs).
// Push do navegador e Apps Script simulados. Confere: oferta só depois do "sim" do lembrete; adulto liga e manda reg + pw-sub
// (endpoint, chaves, hora); "Agora não" não manda nada; menor de 14 e quem está fora do ranking não veem; 14-17 só com o responsável;
// permissão negada não inscreve; iPhone fora do app instalado não vê; Parar apaga (unsubscribe + pw-del); "visto" 1x por dia;
// 320 px sem rolagem lateral; console limpo. Raiz e /comecar/.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/push.test.js
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const UA={Android:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
  iPhone:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'};
const CFG=age=>({version:3,name:'Teste',startDate:'2026-11-20',profile:age?{age}:{},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const RK={on:true,asked:true,uid:'pw123456',nick:'Pwteste'};
const PROG=(rank,age)=>Object.assign({log:{},extra:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1,seen:{foco:1,vendas:1,mente:1,corpo:1}},simple:{off:'2026-11-01'},velho:'fica'},rank?{rank:Object.assign({},RK,age==='teen'?{par:1}:{})}:{}); // 14-17 no ranking já tem o ok do responsável (#117)
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
async function drain(p){for(let i=0;i<12;i++){const m=p.locator('.sysmodal:visible:not(#lembOffer):not(#pwOffer) button.go');if(!(await m.count()))return;await m.first().dispatchEvent('click');await p.waitForTimeout(250);}}
// o "push" do navegador de mentira: guarda o que o app pede
const FAKE=perm=>`(()=>{const PERM=${JSON.stringify(perm)};window.__pw={sub:null,unsub:0,subs:0};window.PushManager=function(){};
  const mk=()=>({endpoint:'https://fcm.googleapis.com/fcm/send/teste-'+(++window.__pw.subs),toJSON(){return {endpoint:this.endpoint,keys:{p256dh:'B'+'x'.repeat(86),auth:'a'.repeat(22)}};},unsubscribe(){window.__pw.unsub++;window.__pw.sub=null;return Promise.resolve(true);}});
  const pm={getSubscription:()=>Promise.resolve(window.__pw.sub),subscribe:o=>{window.__pw.opts=!!(o&&o.userVisibleOnly&&o.applicationServerKey&&o.applicationServerKey.length===65);window.__pw.sub=mk();return Promise.resolve(window.__pw.sub);}};
  try{Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{ready:Promise.resolve({pushManager:pm}),addEventListener(){},register(){return Promise.resolve({});},getRegistration(){return Promise.resolve(null);}}});}catch(e){}
  window.Notification=function(){};let cur=PERM==='granted'&&localStorage.getItem('__pwperm')?'granted':'default';
  Object.defineProperty(Notification,'permission',{get:()=>cur});Notification.requestPermission=()=>{cur=PERM;if(PERM==='granted')localStorage.setItem('__pwperm','1');return Promise.resolve(PERM);};
  window.open=()=>null;})();`;
async function abre(b,{route='comecar/',pre='asc-u',age='adult',rank=true,dev='Android',w=390,perm='granted',keep=null}={}){
  const ctx=keep||await b.newContext({viewport:{width:w,height:844},reducedMotion:'reduce',userAgent:UA[dev],isMobile:true,hasTouch:true,acceptDownloads:true});
  const p=await ctx.newPage();p.errs=[];p.posts=[];
  p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))p.errs.push(m.text())});
  await p.route('https://script.google.com/**',r=>{const d=r.request().postData()||'';try{p.posts.push(JSON.parse(d));}catch(e){}return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"posts":[]}'});});
  await p.route(/^https?:\/\/(?!localhost|127\.0\.0\.1|script\.google\.com)/,r=>r.abort());
  if(!keep){await p.goto(U+'privacidade/');
    await p.evaluate(([c,o,pre])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');
      for(const [k,v] of [['perm','1'],['intro','1'],['news','99'],['tele','{"asked":1}']])localStorage.setItem(pre+'-'+k,v);},[CFG(age),PROG(rank,age),pre]);}
  await p.addInitScript(FAKE(perm));
  await p.goto(U+route);await p.waitForTimeout(1500);await drain(p);await p.waitForTimeout(800);await drain(p);
  await p.evaluate(()=>{for(const m of document.querySelectorAll('#tlModal'))m.remove();});
  return [ctx,p];}
async function mais(p){await p.evaluate(()=>{const t=document.querySelector('#tabbar [data-go="mais"]');if(t)t.click();});await p.waitForTimeout(400);
  await p.evaluate(()=>{const c=document.getElementById('calPanel');if(c&&c.classList.contains('fold')&&!c.classList.contains('open')){const h=c.querySelector(':scope>.fhd');if(h)h.click();}});await p.waitForTimeout(200);}
async function lembSim(p){await mais(p);await p.evaluate(()=>document.getElementById('lembMais').click());await p.waitForTimeout(300);
  await p.evaluate(()=>{const c=[...document.querySelectorAll('#lembOffer .lembchip')].find(b=>b.dataset.v==='19:00');c.click();document.getElementById('lembAdd').click();});await p.waitForTimeout(1200);}
const vis=async(p,s)=>p.evaluate(s=>{const e=document.querySelector(s);return !!(e&&e.getClientRects().length);},s);
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const T=(route||'/')+' ';
  // A) adulto no ranking: "sim" no lembrete → oferta → liga
  {const [ctx,p]=await abre(b,{route,pre});
    ok(T+'A: nada de oferta antes do lembrete',!(await vis(p,'#pwOffer')));
    await lembSim(p);ok(T+'A: oferta aparece depois do "sim" do lembrete',await vis(p,'#pwOffer'));
    ok(T+'A: texto diz o que fica guardado',/só o endereço de aviso deste aparelho e o horário/.test(await p.textContent('#pwOffer')));
    ok(T+'A: adulto não vê a caixa do responsável',!(await vis(p,'#pwPar')));
    await p.click('#pwYes');await p.waitForTimeout(800);
    const a=p.posts.map(x=>x.a);ok(T+'A: manda reg e pw-sub',a.join(',')==='reg,pw-sub',a.join(','));
    const s=p.posts.find(x=>x.a==='pw-sub')||{};ok(T+'A: pw-sub com endpoint, chaves, hora e token',/^https:\/\/fcm/.test(s.ep)&&s.p&&s.au&&s.h==='19:00'&&/^tk/.test(s.tk)&&s.n==='Pwteste',JSON.stringify(s).slice(0,200));
    ok(T+'A: reg adulto sem responsável',(p.posts[0]||{}).band==='adult'&&(p.posts[0]||{}).par===0);
    ok(T+'A: inscrição com userVisibleOnly e chave VAPID de 65 bytes',await p.evaluate(()=>window.__pw.opts));
    ok(T+'A: oferta fecha',!(await vis(p,'#pwOffer')));
    const st=await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-push')),pre);ok(T+'A: grava só a chave própria (on, hora)',st&&st.on===1&&st.h==='19:00',JSON.stringify(st));
    ok(T+'A: progresso intacto',await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-prog')).velho==='fica',pre));
    await mais(p);ok(T+'A: Mais mostra "Parar avisos"',await vis(p,'#pwStop'));
    // F) parar
    p.posts.length=0;await p.click('#pwStop');await p.waitForTimeout(600);
    ok(T+'F: Parar faz unsubscribe',await p.evaluate(()=>window.__pw.unsub)>=1);ok(T+'F: Parar manda pw-del',p.posts.some(x=>x.a==='pw-del'),p.posts.map(x=>x.a).join(','));
    ok(T+'F: volta o botão de ligar',await vis(p,'#pwOn'));
    ok(T+'A/F: console limpo',!p.errs.length,p.errs.join(' | '));await ctx.close();}
  // B) Agora não
  {const [ctx,p]=await abre(b,{route,pre});await lembSim(p);await p.click('#pwNo');await p.waitForTimeout(400);
    ok(T+'B: "Agora não" não manda nada',!p.posts.some(x=>/^pw|reg/.test(x.a)),p.posts.map(x=>x.a).join(','));
    await lembSim(p);ok(T+'B: não insiste no mesmo dia',!(await vis(p,'#pwOffer')));ok(T+'B: console limpo',!p.errs.length,p.errs.join(' | '));await ctx.close();}
  // H) permissão negada
  {const [ctx,p]=await abre(b,{route,pre,perm:'denied'});await lembSim(p);await p.click('#pwYes');await p.waitForTimeout(500);
    ok(T+'H: negou a permissão: nada sai',!p.posts.some(x=>/^pw|reg/.test(x.a))&&await p.evaluate(()=>window.__pw.subs)===0);ok(T+'H: console limpo',!p.errs.length,p.errs.join(' | '));await ctx.close();}
  // G) "visto" 1x por dia
  {const [ctx,p]=await abre(b,{route,pre});await lembSim(p);await p.click('#pwYes');await p.waitForTimeout(600);
    await p.evaluate(pre=>{const s=JSON.parse(localStorage.getItem(pre+'-push'));s.seen='2026-01-01';localStorage.setItem(pre+'-push',JSON.stringify(s));},pre);
    const sub=await p.evaluate(()=>window.__pw.sub&&window.__pw.sub.endpoint);await p.close();
    const [,p2]=await abre(b,{route,pre,keep:ctx});await p2.evaluate(ep=>{window.__pw.sub={endpoint:ep,toJSON(){return {endpoint:ep,keys:{p256dh:'B'+'x'.repeat(86),auth:'a'.repeat(22)}};},unsubscribe(){return Promise.resolve(true);}};},sub);
    await p2.waitForTimeout(2500);ok(T+'G: abriu o app: manda pw-seen',p2.posts.filter(x=>x.a==='pw-seen').length===1,p2.posts.map(x=>x.a).join(','));
    await p2.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'));});await p2.waitForTimeout(500);
    ok(T+'G: só 1x por dia',p2.posts.filter(x=>x.a==='pw-seen').length===1);ok(T+'G: console limpo',!p2.errs.length,p2.errs.join(' | '));await ctx.close();}
  // C) menor de 14, idade desconhecida, fora do ranking, iPhone no Safari
  for(const [tag,o] of [['C: menor de 14',{age:'kid'}],['C: idade desconhecida',{age:''}],['E: fora do ranking',{rank:false}],['I: iPhone no Safari (sem instalar)',{dev:'iPhone'}]]){
    if(route===''&&tag.includes('idade desconhecida'))continue; // raiz = app do criador (adulto por definição)
    const [ctx,p]=await abre(b,{route,pre,...o});await lembSim(p);
    ok(T+tag+': sem oferta',!(await vis(p,'#pwOffer')));await mais(p);ok(T+tag+': sem botão em Mais',!(await vis(p,'#pwOn')));
    ok(T+tag+': nada sai',!p.posts.some(x=>/^pw|reg/.test(x.a)));ok(T+tag+': console limpo',!p.errs.length,p.errs.join(' | '));await ctx.close();}
  // D) 14-17 só com o responsável
  if(route){const [ctx,p]=await abre(b,{route,pre,age:'teen'});await lembSim(p);
    ok(T+'D: 14-17 vê a caixa do responsável',await vis(p,'#pwPar'));await p.click('#pwYes');await p.waitForTimeout(300);
    ok(T+'D: sem marcar, não liga',!p.posts.some(x=>/^pw|reg/.test(x.a))&&/responsável/.test(await p.textContent('.pwmsg')));
    await p.check('#pwPar');await p.click('#pwYes');await p.waitForTimeout(700);
    const r=p.posts.find(x=>x.a==='reg')||{};ok(T+'D: marcou: reg teen com responsável',r.band==='teen'&&r.par===1,JSON.stringify(r));
    ok(T+'D: e inscreve',p.posts.some(x=>x.a==='pw-sub'));ok(T+'D: console limpo',!p.errs.length,p.errs.join(' | '));await ctx.close();}
  // J) 320 px
  {const [ctx,p]=await abre(b,{route,pre,w:320});await lembSim(p);
    const r=await p.evaluate(()=>{const c=document.querySelector('#pwOffer .card').getBoundingClientRect();const bs=[...document.querySelectorAll('#pwOffer button')].map(x=>x.getBoundingClientRect());
      return {sw:document.documentElement.scrollWidth,vw:innerWidth,l:c.left,r:c.right,h:Math.min(...bs.map(x=>x.height))};});
    ok(T+'J: 320 px sem rolagem lateral e cabe',r.sw<=r.vw&&r.l>=0&&r.r<=r.vw,JSON.stringify(r));ok(T+'J: botões com 44 px',r.h>=44,JSON.stringify(r));
    if(route)await p.screenshot({path:process.env.SHOT||'/tmp/pw-320.png'});
    ok(T+'J: console limpo',!p.errs.length,p.errs.join(' | '));await ctx.close();}
}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
