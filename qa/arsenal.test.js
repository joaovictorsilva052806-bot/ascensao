// Arsenal do Herói (tools/arsenal.*): vitrine de afiliados só 18+, AFIL vazio = some, selo de publicidade visível em cada link,
// mesma lista para todo mundo, rel sponsored, nada gravado no progresso, nenhum pedido à loja sem o toque; raiz e /comecar/.
// Rode com: python3 -m http.server 8000 & node qa/arsenal.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const SEAL='Publicidade · link de afiliado: o criador do app ganha comissão se você comprar';
const CFG=(age)=>({version:3,name:'Teste',startDate:'2026-11-01',profile:age==null?{}:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const P=(extra={})=>Object.assign({log:{},velho:'fica',ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}},extra);
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,o={}){const ctx=await b.newContext({serviceWorkers:o.json?'block':'allow',viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  const reqs=[];p.on('request',r=>reqs.push(r.url()));
  if(o.json)await p.route(u=>/\/afiliados\.json/.test(u.href),r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(o.json)}));
  if(o.cap)await ctx.addInitScript(()=>{window.Capacitor={isNativePlatform:()=>true,Plugins:{}};});
  if(o.beta)await ctx.addInitScript(()=>{if(!localStorage.getItem('asc-u-beta'))localStorage.setItem('asc-u-beta',JSON.stringify({on:true,asked:true,id:'abc123'}));});
  if(o.tag)await p.route(u=>u.href===U+route,async r=>{const res=await r.fetch();let body=await res.text();body=body.replace("const AFIL={amz:'',ml:''};","const AFIL={amz:'"+o.tag+"',ml:''};");await r.fulfill({response:res,body});});
  await p.clock.install({time:new Date('2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre,x])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify(Object.assign({asked:1},x)));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[cfg,prog,pre,o.tele||{}]);
  if(o.dica)await p.evaluate(([pre,x])=>localStorage.setItem(pre+'-dica',JSON.stringify(x)),[pre,o.dica]);
  await p.goto(U+route);await p.waitForTimeout(1500);
  await p.evaluate(t=>{document.querySelectorAll('.sysmodal').forEach(m=>m.remove());const b=document.querySelector('#tabbar [data-go="'+t+'"]');if(b)b.click();},o.tab||'mais');await p.waitForTimeout(300);
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
  ok(tag+' nada gravado no progresso nem rastro de clique/compra',!('arsenal' in st)&&!('afil' in st)&&st.velho==='fica'&&!(await p.evaluate(()=>Object.keys(localStorage).some(k=>/arsenal|afil|compra/i.test(k)))));
  ok(tag+' console limpo (18+)',errs.length===0,errs.join(' | '));await ctx.close();

  // ---- tag pelo afiliados.json (o JV liga sem mexer no código) ----
  const DONE={log:{'2026-11-27':[{q:'q1',kind:'full',xp:10,stat:'mente',bonus:0,t:'2026-11-27T09:00:00.000Z'}]}};
  ({ctx,p,errs,reqs}=await open(route,pre,CFG('young'),P(),{json:{amazon:'jv-json-20',mercadolivre:'',apoio:''}}));
  ok(tag+' afiliados.json com a tag liga a vitrine (código com AFIL vazio)',await vis(p)&&(await p.$$eval('#afPanel a.aflink',a=>a.every(x=>/&tag=jv-json-20$/.test(x.href))))&&errs.length===0,errs.join('|'));
  ok(tag+' aviso de associado da Amazon no rodapé',await p.locator('#afPanel .afnote:has-text("associado da Amazon")').count()===1);
  ok(tag+' cópia do afiliados.json fica fora do progresso',await p.evaluate(pre=>!!localStorage.getItem(pre+'-vitrine')&&!JSON.parse(localStorage.getItem(pre+'-prog')).vitrine,pre));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P(),{json:{amazon:'<script>x',apoio:'javascript:alert(1)'}}));
  ok(tag+' tag suja é limpa e apoio sem https não aparece',!(await p.locator('#afPanel .afapoio').count())&&(await p.$$eval('#afPanel a.aflink',a=>a.every(x=>/&tag=scriptx$/.test(x.href)))));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('teen'),P(),{json:{amazon:'jv-json-20',apoio:'https://exemplo.org/apoio'}}));
  ok(tag+' 14-17 com tag e apoio no json: nada aparece',!(await vis(p))&&!(await p.locator('text=Apoie o criador').count()));await ctx.close();
  // ---- apoio voluntário ----
  ({ctx,p,errs}=await open(route,pre,CFG('adult'),P(),{json:{amazon:'',apoio:'https://exemplo.org/apoio'}}));
  ok(tag+' só apoio no json: card de apoio sem livros, sem prometer nada no jogo',await vis(p)&&!(await p.locator('#afPanel .afitem').count())&&(await p.locator('#afPanel .afapoio:has-text("Não libera nada no jogo")').count())===1);await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('adult'),P(),{json:{amazon:'jv-json-20',apoio:'https://exemplo.org/apoio'},cap:1}));
  ok(tag+' no app nativo (regra 3.1.1 da Apple) o apoio some e a vitrine fica',await vis(p)&&!(await p.locator('#afPanel .afapoio').count()));await ctx.close();
  // ---- Dica da semana em Hoje ----
  const J={json:{amazon:'jv-json-20'},tab:'hoje'};
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P(),J));
  ok(tag+' dia ainda não completo: sem Dica da semana',!(await p.evaluate(()=>{const e=document.getElementById('afDica');return !!e&&!e.hidden;})));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,Object.assign(CFG('young'),{startDate:'2026-11-26'}),P(DONE),J));
  ok(tag+' conta com 1 dia: sem Dica da semana mesmo com dia completo',!(await p.evaluate(()=>{const e=document.getElementById('afDica');return !!e&&!e.hidden;})));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P(DONE),Object.assign({beta:1},J)));
  const dv=()=>p.evaluate(()=>{const e=document.getElementById('afDica');return !!e&&!e.hidden&&e.getBoundingClientRect().height>0;});
  ok(tag+' dia completo: Dica da semana em Hoje com selo e 1 livro',await dv()&&(await p.locator('#afDica .afseal').count())===1&&(await p.locator('#afDica .afitem').count())===1&&errs.length===0,errs.join('|'));
  ok(tag+' dica sem pressão (nada de "só hoje", contagem ou culpa)',!(/só hoje|últim|corra|perder|acaba em|\d+:\d{2}/i.test(await p.locator('#afDica').innerText())));
  await p.evaluate(()=>{const a=document.querySelector('#afDica a.aflink');a.addEventListener('click',e=>e.preventDefault(),{once:true});a.click();});
  if(route){const bt=await p.evaluate(()=>{const b=JSON.parse(localStorage.getItem('asc-u-beta')||'{}');return (b.tabs||{})['2026-11-27']||{};});
    ok(tag+' beta ligado: conta vista e toque da dica, sem dizer o livro',bt.afd===1&&bt.afdc===1&&!Object.keys(bt).some(k=>/h[aá]bito|livro|amazon/i.test(k)),JSON.stringify(bt));}
  await p.click('#afDica button.ghost');await p.waitForTimeout(150);
  ok(tag+' "Agora não" esconde a dica',!(await dv()));
  await p.reload();await p.waitForTimeout(1500);await p.evaluate(()=>{document.querySelectorAll('.sysmodal').forEach(m=>m.remove());});
  ok(tag+' "Agora não" vale até a semana seguinte (sobrevive ao recarregar)',!(await dv()));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P(DONE),Object.assign({dica:{w:1,x:1}},J)));
  await p.click('#afDica button.link');await p.waitForTimeout(150);
  ok(tag+' "Não quero dicas" desliga de vez',!(await dv())&&await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-dica')).off===1,pre));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P(DONE),Object.assign({dica:{w:2969,d:'2026-11-24'}},J)));
  ok(tag+' no máximo 1 dia de dica por semana',!(await dv()));await ctx.close();
  // ---- atalhos na Meta de leitura e no Estudo ----
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P(),{json:{amazon:'jv-json-20'},tab:'prog'}));
  const hk=await p.evaluate(()=>[...document.querySelectorAll('.afgo')].map(b=>b.closest('section').id+':'+/publicidade/.test(b.textContent)));
  ok(tag+' atalho para o Arsenal na Meta de leitura (com "publicidade")',hk.includes('lrPanel:true'),JSON.stringify(hk));
  await p.evaluate(()=>document.querySelector('#lrPanel .afgo').click());await p.waitForTimeout(300);
  ok(tag+' atalho leva para o Arsenal em Mais',await p.evaluate(()=>document.body.dataset.tab==='mais'&&!document.getElementById('afPanel').hidden));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P(),{tab:'prog'}));
  ok(tag+' sem tag: nenhum atalho',!(await p.locator('.afgo').count()));await ctx.close();
  // beta desligado: nada contado
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P(),{json:{amazon:'jv-json-20'}}));
  ok(tag+' beta desligado: nenhum contador gravado',await p.evaluate(()=>{const b=JSON.parse(localStorage.getItem('asc-u-beta')||'{}');return !b.tabs;}));await ctx.close();
  // mesma lista para 18-29 e 30-59 (sem personalização)
  const lists=[];for(const a of ['young','senior']){({ctx,p,errs}=await open(route,pre,CFG(a),P(),{tag:'teste-20'}));lists.push(await p.$$eval('#afPanel .aft',x=>x.map(e=>e.textContent).join('|')));await ctx.close();}
  ok(tag+' mesma lista para todas as faixas 18+',lists[0]&&lists[0]===lists[1]);
  for(const vp of [{width:360,height:740},{width:1280,height:800}]){({ctx,p,errs}=await open(route,pre,CFG('adult'),P(),{tag:'teste-20',vp,rm:'reduce'}));
    ok(tag+' '+vp.width+'px + reduce-motion: sem rolagem lateral, link de 44 px',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#afPanel .aflink')].every(e=>e.getBoundingClientRect().height>=44))&&errs.length===0,errs.join('|'));await ctx.close();}
}
const src=require('fs').readFileSync(__dirname+'/../tools/arsenal.js','utf8');
ok("repositório: AFIL vazio (sem ID real)",src.includes("const AFIL={amz:'',ml:''};"));
const aj=JSON.parse(require('fs').readFileSync(__dirname+'/../afiliados.json','utf8'));ok("afiliados.json válido, só tag/link (sem segredo)",Object.keys(aj).every(k=>["amazon","mercadolivre","apoio"].includes(k)));
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
