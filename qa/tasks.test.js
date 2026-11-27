// Tasks que pagam (tools/tasks.*): só 18+, passos marcados pelo jogador, +30 Ouro uma vez por task, links oficiais,
// Carteira real só no aparelho (fora do prog), nada de link do criador; raiz e /comecar/.
// Rode com: python3 -m http.server 8000 & node qa/tasks.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=age=>({version:3,name:'Teste',startDate:'2026-11-01',profile:age==null?{}:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const P=(extra={})=>Object.assign({log:{},extra:{},velho:'fica',rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:0},ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}},extra);
const LS=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),k);
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date('2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre,x])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify(Object.assign({asked:1},x)));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[cfg,prog,pre,o.tele||{}]);
  await p.goto(U+route);await p.waitForTimeout(1300);
  await p.evaluate(()=>{document.querySelectorAll('.sysmodal').forEach(m=>m.remove());const b=document.querySelector('#tabbar [data-go="foco"]');if(b)b.click();});await p.waitForTimeout(300);
  await p.evaluate(()=>{const s=document.getElementById('tpPanel');if(s&&s.classList.contains('fold')&&!s.classList.contains('open'))s.firstElementChild.click();});await p.waitForTimeout(200);
  return {ctx,p,errs};}
const vis=p=>p.evaluate(()=>{const e=document.getElementById('tpPanel');return !!e&&!e.hidden&&e.getClientRects().length>0;});
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  for(const [nm,age,o] of [['até 13','kid',{}],['14-17','teen',{}],['18+ com parent','young',{tele:{parent:1}}]].concat(route?[['sem idade (/comecar/)',null,{}]]:[])){
    let {ctx,p}=await open(route,pre,CFG(age),P(),o);ok(tag+' '+nm+': não vê Tasks que pagam',!(await vis(p))&&!(await p.locator('text=Tasks que pagam').count()));await ctx.close();}
  let {ctx,p,errs}=await open(route,pre,CFG('adult'),P());
  ok(tag+' 18+: vê o painel com 2 tasks',await vis(p)&&(await p.locator('#tpPanel .tpm').count())===2);
  const txt=await p.textContent('#tpPanel');
  ok(tag+' sem promessa de ganho',!/ganhe R\$|renda garantida|garantid/i.test(txt));
  ok(tag+' avisos de segurança e de regras',/Nunca entregue antes/.test(txt)&&/Proibido criar conta no lugar de outra pessoa/.test(txt));
  const hrefs=await p.$$eval('#tpPanel a',as=>as.map(a=>[a.href,a.target,a.rel]));
  ok(tag+' links só para páginas oficiais, sem parâmetro de indicação, em aba nova',hrefs.length===6&&hrefs.every(([h,t,r])=>/^https:\/\/(www\.)?(olx\.com\.br|facebook\.com|enjoei\.com\.br|cuponomia\.com\.br|meliuz\.com\.br|picpay\.com)\/[a-z\/]*$/.test(h)&&t==='_blank'&&/noopener/.test(r)),JSON.stringify(hrefs));
  // abrir a task 1 e marcar 4 passos: sem Ouro; 5º: +30
  await p.click('#tpPanel .tpm[data-tp="desapega"] summary');await p.waitForTimeout(150);
  for(let i=0;i<4;i++){await p.click('#tpPanel .tpm[data-tp="desapega"] .tpbtn[data-i="'+i+'"]');await p.waitForTimeout(120);}
  let st=await LS(p,pre+'-prog');ok(tag+' 4 de 5 passos: sem Ouro ainda',!(st.ouro>0)&&Object.keys(st.tp.desapega.s).length===4,JSON.stringify(st.tp));
  ok(tag+' a task continua aberta depois de marcar',await p.evaluate(()=>document.querySelector('#tpPanel .tpm[data-tp="desapega"]').open));
  await p.click('#tpPanel .tpm[data-tp="desapega"] .tpbtn[data-i="4"]');await p.waitForTimeout(300);
  st=await LS(p,pre+'-prog');ok(tag+' 5/5: +30 Ouro e task concluída',st.ouro===30&&!!st.tp.desapega.f,JSON.stringify({o:st.ouro,tp:st.tp}));
  await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.remove()));
  await p.click('#tpPanel .tpm[data-tp="desapega"] .tpbtn[data-i="4"]');await p.waitForTimeout(150);
  await p.click('#tpPanel .tpm[data-tp="desapega"] .tpbtn[data-i="4"]');await p.waitForTimeout(300);
  await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.remove()));
  st=await LS(p,pre+'-prog');ok(tag+' desmarcar e marcar de novo não paga de novo',st.ouro===30,String(st.ouro));
  ok(tag+' dados antigos intactos',st.velho==='fica'&&st.rpg.cls.id==='mago');
  // Carteira real
  await p.click('#tpPanel .tpwallet summary');await p.waitForTimeout(100);
  await p.fill('#tpPanel .tpwf input','25,50');await p.click('#tpPanel .tpwadd');await p.waitForTimeout(250);
  const w=await LS(p,pre+'-real');st=await LS(p,pre+'-prog');
  ok(tag+' carteira anota fora do prog',Array.isArray(w)&&w.length===1&&w[0].v===25.5&&!JSON.stringify(st).includes('25.5'),JSON.stringify(w));
  ok(tag+' total aparece',/R\$ 25,50/.test(await p.textContent('#tpPanel .tpwallet')));
  await p.fill('#tpPanel .tpwf input','-3');await p.click('#tpPanel .tpwadd');await p.waitForTimeout(200);
  ok(tag+' valor inválido não entra',(await LS(p,pre+'-real')).length===1);
  await p.click('#tpPanel .tpwclr');await p.waitForTimeout(100);await p.click('#tpPanel .tpwclr');await p.waitForTimeout(200);
  ok(tag+' apagar a carteira pede 2 toques e apaga',(await p.evaluate(k=>localStorage.getItem(k),pre+'-real'))===null);
  ok(tag+' console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  for(const vp of [{width:320,height:640},{width:1280,height:800}]){({ctx,p,errs}=await open(route,pre,CFG('adult'),P(),{vp,rm:'reduce'}));
    await p.click('#tpPanel .tpm[data-tp="indique"] summary');await p.waitForTimeout(150);
    ok(tag+' '+vp.width+'px: sem rolagem lateral, toques de 44 px',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#tpPanel .tpm[open] .tpbtn,#tpPanel .tplink,#tpPanel summary')].every(e=>e.getBoundingClientRect().height>=44))&&errs.length===0,errs.join('|'));await ctx.close();}
}
const src=require('fs').readFileSync(__dirname+'/../tools/tasks.js','utf8');
ok('repositório: nenhum link com código de indicação',!/[?&](ref|aff|indica|codigo|code)=/i.test(src));
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
