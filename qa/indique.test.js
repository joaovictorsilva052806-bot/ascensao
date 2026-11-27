// Indique a Bellardi (tools/indique.*): cartão em Mais só 18+, INDIQUE_WA vazio = some, abre o WhatsApp com texto pronto,
// nada gravado no progresso e nenhum dado do indicado sai do app; raiz e /comecar/.
// Rode com: python3 -m http.server 8000 & node qa/indique.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const NUM='5511912345678';
const CFG=(age)=>({version:3,name:'Teste',startDate:'2026-11-01',profile:age==null?{}:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const P=(extra={})=>Object.assign({log:{},velho:'fica'},extra);
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference',permissions:['clipboard-read','clipboard-write']});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  const reqs=[];p.on('request',r=>reqs.push(r.url()));
  if(o.wa!=null)await p.route(u=>u.href===U+route,async r=>{const res=await r.fetch();let body=await res.text();body=body.replace("const INDIQUE_WA='';","const INDIQUE_WA='"+o.wa+"';");await r.fulfill({response:res,body});});
  await p.clock.install({time:new Date('2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre,x])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify(Object.assign({asked:1},x)));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[cfg,prog,pre,o.tele||{}]);
  await p.goto(U+route);await p.waitForTimeout(1500);
  await p.evaluate(()=>{document.querySelectorAll('.sysmodal').forEach(m=>m.remove());const b=document.querySelector('#tabbar [data-go="mais"]');if(b)b.click();});await p.waitForTimeout(300);
  await p.evaluate(()=>{const s=document.getElementById('inPanel');if(s&&s.classList.contains('fold')&&!s.classList.contains('open'))s.firstElementChild.click();});await p.waitForTimeout(200);
  return {ctx,p,errs,reqs};}
const vis=p=>p.evaluate(()=>{const e=document.getElementById('inPanel');return !!e&&!e.hidden&&e.getBoundingClientRect().height>0;});
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  let {ctx,p,errs,reqs}=await open(route,pre,CFG('young'),P());
  ok(tag+' INDIQUE_WA vazio (como no repositório): cartão não aparece nem para 18+',!(await vis(p))&&!(await p.locator('text=Indique a Bellardi').count()));
  ok(tag+' console limpo (número vazio)',errs.length===0,errs.join(' | '));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P(),{wa:'123'}));
  ok(tag+' número inválido: cartão não aparece',!(await vis(p)));await ctx.close();
  for(const [nm,age,o] of [['até 13','kid',{}],['14-17','teen',{}],['18+ com parent gravado','young',{tele:{parent:1}}],['18+ que era 14-17 há 2 dias','young',{prog:{idade:{a:'young',mn:1,up:'2026-11-25',t0:'2026-11-01'}}}]].concat(route?[['sem idade (/comecar/)',null,{}]]:[])){
    ({ctx,p,errs}=await open(route,pre,CFG(age),P(o.prog||{}),Object.assign({wa:NUM},o)));
    ok(tag+' '+nm+': não vê o cartão',!(await vis(p))&&!(await p.locator('text=Indique a Bellardi').count()));await ctx.close();}
  ({ctx,p,errs,reqs}=await open(route,pre,CFG('young'),P({rank:{nick:'Lobo'}}),{wa:'+55 (11) 91234-5678'}));
  ok(tag+' 18+ com número: vê o cartão em Mais com o texto da oferta',await vis(p)&&/planta ou de regularizar imóvel\? Indique\. Se virar contrato pago, você recebe 10%\./.test(await p.locator('#inPanel').innerText()));
  const href=await p.getAttribute('#inPanel a.inlink','href');
  ok(tag+' link do WhatsApp só com dígitos e o texto pronto com o apelido',href==='https://wa.me/'+NUM+'?text='+encodeURIComponent('Vim pelo Ascension, indicação de Lobo.'),href);
  ok(tag+' link abre em aba nova sem rastrear',await p.getAttribute('#inPanel a.inlink','target')==='_blank'&&/noopener/.test(await p.getAttribute('#inPanel a.inlink','rel')));
  ok(tag+' sem promessa de Ouro/XP nem ranking de dinheiro',/Não dá Ouro nem XP/.test(await p.locator('#inPanel').innerText())&&!(await p.locator('#inPanel input, #inPanel textarea').count()));
  await p.click('#inPanel .incopy');await p.waitForTimeout(200);
  ok(tag+' "Copiar link" copia o mesmo link',(await p.evaluate(()=>navigator.clipboard.readText()))===href);
  ok(tag+' nenhum pedido ao WhatsApp sem o toque no link',!reqs.some(u=>/wa\.me|whatsapp/.test(u)));
  const st=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
  ok(tag+' nada gravado no progresso nem no aparelho sobre a indicação',st.velho==='fica'&&st.rank.nick==='Lobo'&&!Object.keys(st).some(k=>/indi|bellardi/i.test(k))&&!(await p.evaluate(()=>Object.keys(localStorage).some(k=>/indi|bellardi/i.test(k)))));
  ok(tag+' console limpo (18+)',errs.length===0,errs.join(' | '));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('adult'),P(),{wa:NUM}));
  const h2=await p.getAttribute('#inPanel a.inlink','href');const nick=await p.evaluate(()=>!!document.querySelector('#inPanel .inhint'));
  ok(tag+' texto pronto sempre tem "Vim pelo Ascension, indicação de …"',/^https:\/\/wa\.me\/5511912345678\?text=Vim%20pelo%20Ascension%2C%20indica%C3%A7%C3%A3o%20de%20.+\.$/.test(h2),h2);
  ok(tag+' mostra a dica do apelido só quando não há apelido',nick===/indica%C3%A7%C3%A3o%20de%20um%20jogador/.test(h2),nick+' '+h2);await ctx.close();
  for(const vp of [{width:320,height:640},{width:1280,height:800}]){({ctx,p,errs}=await open(route,pre,CFG('adult'),P(),{wa:NUM,vp,rm:'reduce'}));
    ok(tag+' '+vp.width+'px + reduce-motion: sem rolagem lateral, toques de 44 px',await vis(p)&&await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#inPanel .inlink,#inPanel .incopy')].every(e=>e.getBoundingClientRect().height>=44))&&errs.length===0,errs.join('|'));await ctx.close();}
}
const src=require('fs').readFileSync(__dirname+'/../tools/indique.js','utf8');
ok("repositório: INDIQUE_WA vazio (sem número real)",src.includes("const INDIQUE_WA='';"));
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
