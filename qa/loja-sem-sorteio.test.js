// Loja do Ouro sem sorteio (ECA Digital, Lei 15.211/2025, art. 20): nada comprado com Ouro pode ter resultado aleatório.
// Confere: (1) todo item da loja é de escolha direta (moldura, fundo, título ou escudo, com nome e preço fixos);
// (2) comprar cada item e resgatar uma recompensa do Baú não chama nenhum gerador aleatório nem mexe no sorteio do Baú do dia;
// (3) o Baú do dia (grátis por mérito) não tem nenhum caminho que gaste Ouro.
// Rode com: python3 -m http.server 8000 & node qa/loja-sem-sorteio.test.js
const {chromium}=require('playwright');const fs=require('fs');const U='http://localhost:8000/';
const LS=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]};
const PROG={log:{},extra:{},rpg:{rew:[{t:'Um episódio',c:20}],spent:0},ouro:5000,ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}},chest:{roll:{'2026-11-27':{k:'x',xp:10}},got:{}}};
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  // conta só os sorteios que nascem de uma compra ou resgate com Ouro (pela pilha da chamada).
  // Fora da conta, por serem só enfeite visual: avSvg (id único do SVG) e sparks (ângulo das faíscas).
  await p.addInitScript(()=>{window.__rc=0;const VIS=['avSvg','sparks'];const hit=()=>{const s=new Error().stack||'';const c=(s.split('\n')[3]||'').trim().split(' ')[1]||'';if(/orBuy|orSpend|orChest/.test(s)&&!VIS.includes(c)){window.__rc++;const f=s.split('\n').slice(2,4).map(l=>l.trim().split(' ')[1]).join('<');(window.__rf=window.__rf||{})[f]=1;}};const mr=Math.random;Math.random=function(){hit();return mr();};const gv=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=function(a){hit();return gv(a);};});
  await p.clock.install({time:new Date('2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG,PROG,pre]);
  await p.goto(U+route);await p.waitForTimeout(1500);
  // a loja como o jogador vê: cada botão é um item com nome e preço na cara
  await p.locator('#ouroPill').dispatchEvent('click');await p.waitForTimeout(300);
  const shop=await p.$$eval('#orModal .oritem',bs=>bs.map(b=>({id:b.dataset.or,n:b.querySelector('.orn').textContent,p:b.querySelector('.orp').textContent})));
  const src=fs.readFileSync(__dirname+'/../tools/ouro.js','utf8');const m=/const OR_SHOP=\[([\s\S]*?)\];/.exec(src);
  const kinds=[...(m?m[1]:'').matchAll(/k:"(\w)"/g)].map(x=>x[1]);
  ok(tag+' loja tem itens',shop.length>0&&shop.length===kinds.length,shop.length+' vs '+kinds.length);
  ok(tag+' todo item é de escolha direta (moldura, fundo, título ou escudo)',kinds.length>0&&kinds.every(k=>'fbts'.includes(k)),kinds.join(''));
  ok(tag+' todo item mostra o preço fixo antes de comprar',shop.every(it=>/^\d+ 🪙/.test(it.p)),JSON.stringify(shop));
  ok(tag+' nenhum item se chama baú, caixa, sorteio ou surpresa',shop.every(it=>!/ba[uú]|caixa|sorte|surpresa|aleat|loot|pacote|mist/i.test(it.n+' '+it.id)),JSON.stringify(shop.map(s=>s.n)));
  const roll0=JSON.stringify((await LS(p,pre)).chest);
  await p.evaluate(()=>{window.__rc=0;});
  for(const it of shop){for(let k=0;k<2;k++){await p.locator('#orModal [data-or="'+it.id+'"]').dispatchEvent('click');await p.waitForTimeout(150);}}
  await p.locator('#orClose').dispatchEvent('click');await p.waitForTimeout(200);
  await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.remove()));
  await p.evaluate(()=>{const b=[...document.querySelectorAll('#chestList button')].find(x=>/Resgatar/.test(x.textContent));if(b)b.click();});await p.waitForTimeout(300);
  const st=await LS(p,pre);const rc=await p.evaluate(()=>window.__rc);
  const bought=shop.filter(it=>st.ouroX.buy[it.id]).length;
  ok(tag+' comprou todos os itens e resgatou a recompensa',bought===shop.length&&st.ouroX.h.some(h=>h.w==='Um episódio'),bought+'/'+shop.length);
  ok(tag+' compras e resgate não chamam gerador aleatório',rc===0,'chamadas: '+rc+' '+JSON.stringify(await p.evaluate(()=>window.__rf)));
  ok(tag+' sorteio do Baú do dia intacto depois das compras',JSON.stringify({roll:st.chest.roll,got:st.chest.got})===JSON.stringify({roll:JSON.parse(roll0).roll,got:JSON.parse(roll0).got}));
  ok(tag+' console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
// Baú do dia: grátis por mérito, sem nenhum caminho que gaste Ouro
const chest=fs.readFileSync(__dirname+'/../tools/chest.js','utf8');
ok('Baú do dia não gasta Ouro (tools/chest.js sem orSpend/prog.ouro)',!/orSpend|prog\.ouro|orBal/.test(chest));
ok('Loja não chama o sorteio do Baú (tools/ouro.js sem bxRoll/bxRnd/bxPick/Math.random)',!/bxRoll|bxRnd|bxPick|Math\.random|getRandomValues/.test(fs.readFileSync(__dirname+'/../tools/ouro.js','utf8')));
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
