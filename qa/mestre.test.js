// Missões do Mestre 18+ (tools/mestre.*, missoes-mestre.json): trava de idade de 4 itens, +80 de Ouro uma vez,
// sem Ouro nos 3 primeiros dias, selo de publicidade e "O Mestre também ganha R$ X", lista vazia = seção some,
// missão incompleta ou com link http não aparece, só https; raiz e /comecar/.
// Rode com: python3 -m http.server 8000 & node qa/mestre.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=(age,start)=>({version:3,name:'Teste',startDate:start||'2026-11-01',profile:age==null?{}:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const P=(extra={})=>Object.assign({log:{},velho:'fica',ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}},extra);
const FULL={missoes:[{id:'parc1',parceiro:'Parceiro Um',ganho:'R$ 10 de bônus',mestre:15,cond:'Criar conta e fazer a 1ª compra',link:'https://exemplo.com/indica?c=x',regras:'https://exemplo.com/regulamento'},
  {id:'parc2',parceiro:'Parceiro Dois',ganho:'R$ 5',mestre:5,cond:'Criar conta',link:'http://inseguro.com',regras:'https://exemplo.com/r'},
  {id:'parc3',parceiro:'Parceiro Três',ganho:'',mestre:5,cond:'Criar conta',link:'https://exemplo.com',regras:'https://exemplo.com/r'}]};
const LS=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  const reqs=[];p.on('request',r=>{if(!r.url().startsWith(U))reqs.push(r.url());});
  if(o.json!==undefined)await p.route('**/missoes-mestre.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(o.json)}));
  await p.clock.install({time:new Date(o.time||'2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre,x])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify(Object.assign({asked:1},x)));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[cfg,prog,pre,o.tele||{}]);
  await p.goto(U+route);await p.waitForTimeout(1500);
  await p.evaluate(()=>{document.querySelectorAll('.sysmodal').forEach(m=>m.remove());const b=document.querySelector('#tabbar [data-go="prog"]');if(b)b.click();});await p.waitForTimeout(300);
  await p.evaluate(()=>{const s=document.getElementById('mmPanel');if(s&&s.classList.contains('fold')&&!s.classList.contains('open'))s.firstElementChild.click();});await p.waitForTimeout(200);
  return {ctx,p,errs,reqs};}
const vis=p=>p.evaluate(()=>{const e=document.getElementById('mmPanel');return !!e&&!e.hidden;});
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  // arquivo do repositório (vazio): seção some até para 18+
  let {ctx,p,errs,reqs}=await open(route,pre,CFG('young'),P());
  ok(tag+' lista do repositório vazia: seção não aparece',!(await vis(p))&&!(await p.locator('text=Missões do Mestre').count()));
  ok(tag+' console limpo (lista vazia)',errs.length===0,errs.join(' | '));await ctx.close();
  for(const [nm,age,o] of [['até 13','kid',{}],['14-17','teen',{}],['18+ com parent gravado','young',{tele:{parent:1}}],['18+ que era 14-17 há 2 dias','young',{prog:{idade:{a:'young',mn:1,up:'2026-11-25',t0:'2026-11-01'}}}]].concat(route?[['sem idade (/comecar/)',null,{}]]:[])){
    ({ctx,p,errs}=await open(route,pre,CFG(age),P(o.prog||{}),Object.assign({json:FULL},o)));
    ok(tag+' '+nm+': não vê as Missões do Mestre',!(await vis(p))&&!(await p.locator('text=O Mestre também ganha').count()));await ctx.close();}
  ({ctx,p,errs,reqs}=await open(route,pre,CFG('young'),P(),{json:FULL}));
  ok(tag+' 18+: vê a seção',await vis(p));
  const cards=await p.$$eval('#mmPanel .mmcard',cs=>cs.map(c=>c.dataset.mm));
  ok(tag+' só a missão completa e com https aparece',cards.join()==='parc1',cards.join());
  const t=await p.textContent('#mmPanel');
  ok(tag+' texto fixo "O Mestre também ganha R$ 15 se você concluir."',t.includes('O Mestre também ganha R$ 15 se você concluir.'));
  ok(tag+' selo de publicidade visível sem clique',await p.locator('#mmPanel .mmad').first().isVisible()&&t.includes('Publicidade'));
  ok(tag+' mostra parceiro, ganho, condição e regulamento',t.includes('Parceiro Um')&&t.includes('R$ 10 de bônus')&&t.includes('Criar conta e fazer a 1ª compra')&&(await p.getAttribute('#mmPanel .mmreg','href'))==='https://exemplo.com/regulamento');
  ok(tag+' link do parceiro: aba nova, rel sponsored',(await p.getAttribute('#mmPanel .mmlink','rel')).includes('sponsored')&&(await p.getAttribute('#mmPanel .mmlink','target'))==='_blank');
  await p.locator('#mmPanel .mmfiz').click();await p.waitForTimeout(400);let st=await LS(p,pre);
  ok(tag+' Fiz: +80 de Ouro',st.ouro===80&&st.mestre.parc1==='2026-11-27',JSON.stringify({o:st.ouro,m:st.mestre}));
  ok(tag+' Fiz não pode repetir',await p.locator('#mmPanel .mmfiz').isDisabled());
  await p.reload();await p.waitForTimeout(1500);st=await LS(p,pre);ok(tag+' recarregar não paga de novo',st.ouro===80,String(st.ouro));
  ok(tag+' nada vai ao parceiro sem o toque no link (nenhum pedido a exemplo.com)',!reqs.some(u=>/exemplo\.com|inseguro/.test(u)),reqs.join(' '));
  ok(tag+' campos antigos intactos',st.velho==='fica');
  ok(tag+' console limpo (18+)',errs.length===0,errs.join(' | '));await ctx.close();
  // conta nova: sem Ouro nos 3 primeiros dias
  ({ctx,p,errs}=await open(route,pre,CFG('young','2026-11-26'),P(),{json:FULL}));
  ok(tag+' conta de 1 dia: botão mostra a trava',(await p.textContent('#mmPanel .mmfiz')).includes('4º dia'));
  await p.locator('#mmPanel .mmfiz').click();await p.waitForTimeout(300);st=await LS(p,pre);
  ok(tag+' conta de 1 dia: Fiz não dá Ouro nem marca',!st.ouro&&!(st.mestre&&st.mestre.parc1),JSON.stringify({o:st.ouro,m:st.mestre}));await ctx.close();
  ({ctx,p,errs}=await open(route,pre,CFG('young','2026-11-24'),P(),{json:FULL}));
  await p.locator('#mmPanel .mmfiz').click();await p.waitForTimeout(300);st=await LS(p,pre);
  ok(tag+' 4º dia de conta: Fiz dá Ouro',st.ouro===80,String(st.ouro));await ctx.close();
  // 7 dias depois de ter sido menor: libera
  ({ctx,p,errs}=await open(route,pre,CFG('young'),P({idade:{a:'young',mn:1,up:'2026-11-20',t0:'2026-11-01'}}),{json:FULL}));
  ok(tag+' 18+ que era 14-17 há 7 dias: vê',await vis(p));await ctx.close();
  for(const vp of [{width:360,height:740},{width:1280,height:800}]){({ctx,p,errs}=await open(route,pre,CFG('adult'),P(),{json:FULL,vp,rm:'reduce'}));
    ok(tag+' '+vp.width+'px + reduce-motion: sem rolagem lateral, toques de 44 px',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#mmPanel .mmlink,#mmPanel .mmfiz,#mmPanel .mmreg')].every(e=>e.getBoundingClientRect().height>=44))&&errs.length===0,errs.join('|'));await ctx.close();}
}
// arquivo do repositório: só missões vazias, sem link real
const j=JSON.parse(require('fs').readFileSync(__dirname+'/../missoes-mestre.json','utf8'));
ok('missoes-mestre.json no repositório sem link preenchido',j.missoes.every(m=>!m.link&&!m.regras));
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
