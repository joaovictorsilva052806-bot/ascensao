// Missões Lendárias (tools/lendaria.*, missoes-lendarias.json): só 18+, missão "teste" só no Modo Criador, selo de publicidade,
// rel sponsored, passos marcados, +80 Ouro uma vez, chamada em Hoje leva à área, reduce-motion sem animação, dados antigos intactos.
// Rode com: python3 -m http.server 8000 & node qa/lendaria.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=age=>({version:3,name:'Teste',startDate:'2026-11-01',profile:age==null?{}:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const P=(extra={})=>Object.assign({log:{},extra:{},velho:'fica',rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:0},ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}},extra);
const M=(o={})=>Object.assign({id:'parc1',teste:false,parceiro:'Parceiro Um',titulo:'Ative o bônus do Parceiro Um',ganho:'Bônus em cashback.',passos:['Criar conta','Ativar','Comprar'],link:'https://exemplo.com/a',regras:'https://exemplo.com/regras'},o);
const LS=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),k);
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,list,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference',serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];
  await p.route('**/missoes-lendarias.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({missoes:list})}));
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate|Content Security Policy/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date('2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre,x,cr])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify(Object.assign({asked:1},x)));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');if(cr)localStorage.setItem('ascensao-sync','https://script.google.com/macros/s/teste/exec');},[cfg,prog,pre,o.tele||{},!!o.creator]);
  await p.goto(U+route);await p.waitForTimeout(1300);
  await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.remove()));
  return {ctx,p,errs};}
const goLn=p=>p.evaluate(()=>{const e=document.getElementById('lnPanel');const t=e?e.dataset.tab:'foco';const b=document.querySelector('#tabbar [data-go="'+t+'"]');if(b)b.click();}).then(()=>p.waitForTimeout(250));
const tab=(p,t)=>p.evaluate(t=>{const b=document.querySelector('#tabbar [data-go="'+t+'"]');if(b)b.click();},t).then(()=>p.waitForTimeout(250));
const vis=(p,id)=>p.evaluate(id=>{const e=document.getElementById(id);return !!e&&!e.hidden&&e.getClientRects().length>0;},id);
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  for(const [nm,age,o] of [['até 13','kid',{}],['14-17','teen',{}],['18+ com parent','young',{tele:{parent:1}}]].concat(route?[['sem idade (/comecar/)',null,{}]]:[])){
    let {ctx,p}=await open(route,pre,CFG(age),P(),[M()],o);await goLn(p);ok(tag+' '+nm+': não vê Missões Lendárias',!(await vis(p,'lnPanel'))&&!(await p.locator('text=Missões Lendárias').count()));await ctx.close();}
  // lista vazia ou missão incompleta / link http: some
  for(const [nm,list] of [['lista vazia',[]],['sem passos',[M({passos:[]})]],['link http',[M({link:'http://exemplo.com/'})]]]){
    let {ctx,p}=await open(route,pre,CFG('adult'),P(),list);await goLn(p);ok(tag+' '+nm+': área some',!(await vis(p,'lnPanel'))&&!(await vis(p,'lnTease')));await ctx.close();}
  // missão de teste: 18+ comum não vê
  {let {ctx,p}=await open(route,pre,CFG('adult'),P(),[M({teste:true})]);await goLn(p);ok(tag+' missão "teste" fora do Modo Criador: não aparece',!(await vis(p,'lnPanel')));await ctx.close();}
  let {ctx,p,errs}=await open(route,pre,CFG('adult'),P(),[M(),M({id:'parc2',titulo:'Segunda missão',passos:['Um passo só']})]);
  ok(tag+' Hoje: chamada lendária visível com 2 missões',await vis(p,'lnTease')&&/2 missões que pagam/.test(await p.textContent('#lnTease')));
  await p.click('#lnTease button');await p.waitForTimeout(300);
  ok(tag+' chamada leva para a aba Lendárias com a área visível',await p.evaluate(()=>document.body.dataset.tab==='lenda'&&document.getElementById('lnPanel').dataset.tab==='lenda')&&await vis(p,'lnPanel'));
  ok(tag+' área fica no topo, antes das Tasks Lendárias',await p.evaluate(()=>{const a=document.getElementById('lnPanel'),t=document.getElementById('tpPanel');return !t||!!(a.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_FOLLOWING);}));
  const txt=await p.textContent('#lnPanel');
  ok(tag+' selo "Publicidade · parceiro" e tag LENDÁRIA visíveis sem clique',await p.locator('#lnPanel .lnad').first().isVisible()&&await p.locator('#lnPanel .lnrar').first().isVisible()&&txt.includes('Publicidade · parceiro'));
  ok(tag+' sem link de indicação: sem aviso de comissão',!/comissão/.test(txt));
  ok(tag+' sem promessa de ganho e com aviso de 18+',/Sem promessa de ganho/.test(txt)&&/exige 18\+/.test(txt)&&!/renda garantida|garantid/i.test(txt));
  const a=await p.$eval('#lnPanel .lncard[data-ln="parc1"] .lnlink',e=>[e.href,e.target,e.rel]);
  ok(tag+' link do parceiro em aba nova com rel sponsored',a[0]==='https://exemplo.com/a'&&a[1]==='_blank'&&/sponsored/.test(a[2])&&/noopener/.test(a[2]),JSON.stringify(a));
  await p.click('#lnPanel .lncard[data-ln="parc1"] summary');await p.waitForTimeout(150);
  for(let i=0;i<2;i++){await p.click('#lnPanel .lncard[data-ln="parc1"] .lnbtn[data-i="'+i+'"]');await p.waitForTimeout(120);}
  let st=await LS(p,pre+'-prog');ok(tag+' 2 de 3 passos: sem Ouro ainda',!(st.ouro>0)&&Object.keys(st.lend.parc1.s).length===2,JSON.stringify(st.lend));
  ok(tag+' passos continuam abertos depois de marcar',await p.evaluate(()=>document.querySelector('#lnPanel .lncard[data-ln="parc1"] details').open));
  await p.click('#lnPanel .lncard[data-ln="parc1"] .lnbtn[data-i="2"]');await p.waitForTimeout(300);
  st=await LS(p,pre+'-prog');ok(tag+' 3/3: +80 Ouro e missão concluída',st.ouro===80&&!!st.lend.parc1.f,JSON.stringify({o:st.ouro,l:st.lend}));
  await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.remove()));
  await p.click('#lnPanel .lncard[data-ln="parc1"] .lnbtn[data-i="2"]');await p.waitForTimeout(150);
  await p.click('#lnPanel .lncard[data-ln="parc1"] .lnbtn[data-i="2"]');await p.waitForTimeout(300);
  await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.remove()));
  st=await LS(p,pre+'-prog');ok(tag+' desmarcar e marcar de novo não paga de novo',st.ouro===80,String(st.ouro));
  ok(tag+' dados antigos intactos',st.velho==='fica'&&st.rpg.cls.id==='mago');
  await tab(p,'hoje');ok(tag+' chamada em Hoje conta só a que falta',/1 missão que paga/.test(await p.textContent('#lnTease')));
  ok(tag+' console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // conta nova (1 dia): sem Ouro
  {const c=CFG('adult');c.startDate='2026-11-27';let {ctx,p}=await open(route,pre,c,P({ouroX:{t0:'2026-11-27',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-27',c:0}}}),[M({passos:['Só um']})]);await goLn(p);
    ok(tag+' conta de 1 dia: avisa a trava do Ouro',(await p.textContent('#lnPanel')).includes('4º dia'));
    await p.click('#lnPanel summary.lnsteps,#lnPanel .lnsteps summary');await p.click('#lnPanel .lnbtn[data-i="0"]');await p.waitForTimeout(300);
    const s2=await LS(p,pre+'-prog');ok(tag+' conta de 1 dia: concluir não dá Ouro',!(s2.ouro>0)&&!!s2.lend.parc1.f,JSON.stringify(s2.lend));await ctx.close();}
  for(const vp of [{width:320,height:640},{width:1280,height:800}]){({ctx,p,errs}=await open(route,pre,CFG('adult'),P(),[M()],{vp,rm:'reduce'}));
    const tease=await p.evaluate(()=>{const b=document.querySelector('#lnTease button');return b&&getComputedStyle(b).animationName;});
    await goLn(p);await p.click('#lnPanel .lnsteps summary');await p.waitForTimeout(150);
    const anim=await p.evaluate(()=>getComputedStyle(document.querySelector('#lnPanel .lncard'),'::after').animationName);
    ok(tag+' '+vp.width+'px + reduce-motion: sem animação, sem rolagem lateral, toques de 44 px',tease==='none'&&anim==='none'&&await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#lnPanel .lnbtn,#lnPanel .lnlink,#lnPanel .lnreg,#lnPanel summary')].every(e=>e.getBoundingClientRect().height>=44))&&errs.length===0,[tease,anim,errs.join('|')].join(' · '));await ctx.close();}
}
// Modo Criador (só existe na raiz): a missão "teste" aparece com o aviso, mesmo para 18+
{let {ctx,p,errs}=await open('','ascensao',CFG('adult'),P(),[M({id:'cuponomia',teste:true,indicacao:true,parceiro:'Cuponomia'})],{creator:true});await goLn(p);
  ok('/ Modo Criador: missão "teste" aparece com "TESTE · só você vê"',await vis(p,'lnPanel')&&(await p.textContent('#lnPanel')).includes('TESTE · só você vê'));
  ok('/ link de indicação do criador: aviso de comissão visível',(await p.textContent('#lnPanel')).includes('o criador ganha uma comissão da Cuponomia'));await ctx.close();}
{let {ctx,p}=await open('','ascensao',CFG('teen'),P(),[M({teste:true})],{creator:true});await goLn(p);
  ok('/ Modo Criador sem a aba Lendárias (perfil 14-17): área cai na aba Foco',await vis(p,'lnPanel')&&await p.evaluate(()=>document.getElementById('lnPanel').dataset.tab==='foco'));await ctx.close();}
// o arquivo do repositório: Cuponomia como teste (só o criador vê) e válido
{const j=JSON.parse(require('fs').readFileSync(__dirname+'/../missoes-lendarias.json','utf8'));const c=(j.missoes||[]).find(m=>m.id==='cuponomia');
  ok('repositório: Cuponomia está como teste e com link https',!!c&&c.teste===true&&c.indicacao===true&&/^https:\/\//.test(c.link)&&c.passos.length>0);}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
