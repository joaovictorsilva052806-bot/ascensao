// Arsenal do Herói (tools/arsenal.*): vitrine de afiliados só 18+, AFIL vazio = some, selo de publicidade visível em cada link,
// mesma lista para todo mundo, rel sponsored, nada gravado no progresso, nenhum pedido à loja sem o toque; raiz e /comecar/.
// Rode com: python3 -m http.server 8000 & node qa/arsenal.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const SEAL='Publicidade · link de afiliado: o criador do app ganha comissão se você comprar';
const CFG=(age)=>({version:3,name:'Teste',startDate:'2026-11-01',profile:age==null?{}:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const P=(extra={})=>Object.assign({log:{},velho:'fica',ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}},extra);
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  const reqs=[];p.on('request',r=>reqs.push(r.url()));
  if(o.tag)await p.route(u=>u.href===U+route,async r=>{const res=await r.fetch();let body=await res.text();body=body.replace("const AFIL={amz:'',ml:''};","const AFIL={amz:'"+o.tag+"',ml:''};");await r.fulfill({response:res,body});});
  await p.clock.install({time:new Date('2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre,x])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify(Object.assign({asked:1},x)));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[cfg,prog,pre,o.tele||{}]);
  await p.goto(U+route);await p.waitForTimeout(1500);
  await p.evaluate(()=>{document.querySelectorAll('.sysmodal').forEach(m=>m.remove());const b=document.querySelector('#tabbar [data-go="mais"]');if(b)b.click();});await p.waitForTimeout(300);
  await p.evaluate(()=>{const s=document.getElementById('afPanel');if(s&&s.classList.contains('fold')&&!s.classList.contains('open'))s.firstElementChild.click();});await p.waitForTimeout(200);
  return {ctx,p,errs,reqs};}
const vis=p=>p.evaluate(()=>{const e=document.getElementById('afPanel');return !!e&&!e.hidden;});
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  let {ctx,p,errs,reqs}=await open(route,pre,CFG('young'),P());
  ok(tag+' AFIL vazio (como no repositório): vitrine não aparece nem para 18+',!(await vis(p))&&!(await p.locator('text=Arsenal do Herói').count()));
  ok(tag+' console limpo (AFIL vazio)',errs.length===0,errs.join(' | '));await ctx.close();
  for(const [nm,age,o] of [['até 13','kid',{}],['14-17','teen',{}],['18+ com parent gravado','young',{tele:{parent:1}}],['18+ que era 14-17 há 2 dias','young',{prog:{idade:{a:'young',mn:1,up:'2026-11-25',t0:'2026-11-01'}}}]].concat(route?[['sem idade (/comecar/)',null,{}]]:[])){
    ({ctx,p,errs}=await open(route,pre,CFG(age),P(o.prog||{}),Object.assign({tag:'teste-20'},o)));
    ok(tag+' '+nm+': não vê a vitrine',!(await vis(p))&&!(await p.locator('text='+SEAL).count()));await ctx.close();}
  ({ctx,p,errs,reqs}=await open(route,pre,CFG('young'),P(),{tag:'teste-20'}));
  ok(tag+' 18+ com AFIL: vê a vitrine',await vis(p));
  const items=await p.$$eval('#afPanel .afitem',cs=>cs.map(c=>({t:c.querySelector('.aft').textContent,seal:c.querySelector('.afseal')&&c.querySelector('.afseal').textContent,href:c.querySelector('a').href,rel:c.querySelector('a').rel,tg:c.querySelector('a').target})));
  ok(tag+' 10 livros do Estudo; Forja vazia não aparece',items.length===10&&!(await p.locator('#afPanel .afh:has-text("Forja")').count()),items.length+'');
  ok(tag+' selo de publicidade em todo card, visível sem clique',items.every(i=>i.seal===SEAL)&&await p.locator('#afPanel .afseal').first().isVisible());
  ok(tag+' links da loja com a tag, aba nova e rel sponsored',items.every(i=>/^https:\/\/www\.amazon\.com\.br\/s\?k=.+&tag=teste-20$/.test(i.href)&&/sponsored/.test(i.rel)&&i.tg==='_blank'),JSON.stringify(items[0]));
  ok(tag+' nenhum pedido à loja sem o toque',!reqs.some(u=>/amazon|mercadoli/.test(u)));
  const st=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
  ok(tag+' nada gravado no progresso',!('arsenal' in st)&&st.velho==='fica'&&!(await p.evaluate(()=>Object.keys(localStorage).some(k=>/arsenal|afil/i.test(k)))));
  ok(tag+' console limpo (18+)',errs.length===0,errs.join(' | '));await ctx.close();
  // mesma lista para 18-29 e 30-59 (sem personalização)
  const lists=[];for(const a of ['young','senior']){({ctx,p,errs}=await open(route,pre,CFG(a),P(),{tag:'teste-20'}));lists.push(await p.$$eval('#afPanel .aft',x=>x.map(e=>e.textContent).join('|')));await ctx.close();}
  ok(tag+' mesma lista para todas as faixas 18+',lists[0]&&lists[0]===lists[1]);
  for(const vp of [{width:360,height:740},{width:1280,height:800}]){({ctx,p,errs}=await open(route,pre,CFG('adult'),P(),{tag:'teste-20',vp,rm:'reduce'}));
    ok(tag+' '+vp.width+'px + reduce-motion: sem rolagem lateral, link de 44 px',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#afPanel .aflink')].every(e=>e.getBoundingClientRect().height>=44))&&errs.length===0,errs.join('|'));await ctx.close();}
}
const src=require('fs').readFileSync(__dirname+'/../tools/arsenal.js','utf8');
ok("repositório: AFIL vazio (sem ID real)",src.includes("const AFIL={amz:'',ml:''};"));
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
