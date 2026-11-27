// Pedido de avaliação (tools/aval.*): convite leve depois de uma conquista, só com o beta anônimo ligado,
// nunca no 1º dia, 1x a cada 30 dias, some depois de 2 "Agora não", nunca dá XP/Ouro; raiz e /comecar/.
// Rode com: python3 -m http.server 8002 --bind 127.0.0.1 & PORT=8002 node qa/aval.test.js
const {chromium}=require('playwright');const U='http://localhost:'+(process.env.PORT||8002)+'/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const SHOTS=process.env.SHOTS||'';
const CFG=age=>({version:3,name:'Teste',startDate:'2026-11-01',profile:age==null?{}:{age},quests:[
  {id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'q2',title:'Caminhar 15 min',xp:10,stat:'corpo',main:true},{id:'q3',title:'Beber água',xp:5,stat:'corpo'}]});
const ent=q=>[{q,kind:'full',xp:10,stat:'mente',bonus:0,t:'08:00'}];
const LOG3={'2026-11-24':ent('q1'),'2026-11-25':ent('q1'),'2026-11-26':ent('q1')};
const P=(log)=>({log:log||LOG3,extra:{},velho:'fica',rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:0}});
const BETA={on:true,asked:true,id:'abc123',since:'2026-11-20',last:'2026-11-27',parent:0};
const LS=(p,k)=>p.evaluate(k=>localStorage.getItem(k),k);
(async()=>{const b=await chromium.launch();
async function open(route,pre,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},deviceScaleFactor:o.dpr||1,reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[],posts=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route(/docs\.google\.com|script\.google\.com/,r=>{const rq=r.request();if(rq.method()==='POST')posts.push(decodeURIComponent((rq.postData()||'').replace(/\+/g,' ')));r.fulfill({status:200,body:''});});
  await p.clock.install({time:new Date(o.now||'2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,g,pre,beta,av])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(g));localStorage.setItem(pre+'-season','2');
    localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');
    if(beta)localStorage.setItem(pre+'-beta',JSON.stringify(beta));if(av)localStorage.setItem(pre+'-aval',JSON.stringify(av));},[CFG(o.age===undefined?'adult':o.age),P(o.log),pre,o.beta===undefined?BETA:o.beta,o.av||null]);
  await p.goto(U+route);await p.waitForTimeout(1300);await drain(p);
  return {ctx,p,errs,posts};}
// fecha as janelas do Sistema pelo botão (sem tirar do DOM), menos o cartão de avaliação
async function drain(p){for(let i=0;i<10;i++){const x=await p.evaluate(()=>{const lo=document.getElementById('lembOffer');if(lo)lo.remove();
    const m=[...document.querySelectorAll('.sysmodal,.levelup')].find(m=>m.id!=='avlCard'&&!m.hidden&&m.getClientRects().length);if(!m)return null;
    const b=m.querySelector('#luClose')||m.querySelector('button.go:not([disabled])')||m.querySelector('button.ghost,button');if(b)b.click();return 1;});if(x==null)break;await p.waitForTimeout(250);}}
const card=p=>p.evaluate(()=>{const m=document.getElementById('avlCard');return !!m&&m.getClientRects().length>0;});
async function conquer(p,q){await p.locator('#quests .quest[data-q="'+(q||'q2')+'"] button.go').first().dispatchEvent('click');
  for(let i=0;i<14;i++){await p.waitForTimeout(700);await drain(p);if(await card(p))return true;}return false;}
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  // caminho feliz: beta ligado, 3 dias de uso, missão concluída
  let {ctx,p,errs,posts}=await open(route,pre,{dpr:route&&SHOTS?2:1});
  const pre0=await LS(p,pre+'-prog');
  ok(tag+' missão concluída depois de 3 dias: abre o cartão de avaliação',await conquer(p));
  ok(tag+' cartão diz que não vale XP nem Ouro e é anônimo',await p.evaluate(()=>/não vale XP nem Ouro/.test(document.getElementById('avlCard').textContent)&&/anônimo/.test(document.getElementById('avlCard').textContent)));
  ok(tag+' é janela acessível: role dialog, título, 5 estrelas como radio',await p.evaluate(()=>{const m=document.getElementById('avlCard');return m.getAttribute('role')==='dialog'&&!!m.getAttribute('aria-labelledby')&&m.querySelectorAll('[role=radio]').length===5&&!!m.querySelector('[role=radiogroup]');}));
  ok(tag+' Enviar começa desligado (sem nota)',await p.evaluate(()=>document.querySelector('#avlCard .go').disabled));
  ok(tag+' toques com 44 px ou mais',await p.evaluate(()=>[...document.querySelectorAll('#avlCard button')].every(x=>{const r=x.getBoundingClientRect();return r.height>=44&&r.width>=44;})));
  ok(tag+' foco vai para a 1ª estrela',await p.evaluate(()=>document.activeElement&&document.activeElement.classList.contains('avlstar')));
  await p.locator('#avlCard .avlstar[data-n="4"]').click();
  ok(tag+' escolher 4 estrelas acende 4 e libera o Enviar',await p.evaluate(()=>document.querySelectorAll('#avlCard .avlstar.on').length===4&&!document.querySelector('#avlCard .go').disabled&&/Muito bom/.test(document.querySelector('.avllbl').textContent)));
  await p.fill('#avlCard textarea','Curti muito, meu zap 31 99999-8888 e a@b.com www.x.com');
  if(route&&SHOTS){await p.fill('#avlCard textarea','As missões curtas me ajudam a começar o dia.');await p.screenshot({path:SHOTS+'/avaliacao-1-cartao.png'});await p.fill('#avlCard textarea','Curti muito, meu zap 31 99999-8888 e a@b.com www.x.com');}
  const progMid=await LS(p,pre+'-prog');const n0=posts.length;
  await p.locator('#avlCard .go').click();await p.waitForTimeout(300);
  const post=posts.slice(n0).find(x=>/\|aval\|/.test(x))||'';
  ok(tag+' envia pelo canal do beta: id, aval, data, nota e motivo',/B\|abc123\|aval\|20261127\|4\|missao\|/.test(post),post);
  ok(tag+' comentário sai sem telefone, e-mail ou link',/Curti muito, meu zap/.test(post)&&!/9999|a@b|www/.test(post),post);
  ok(tag+' enviar não mexe no progresso (sem XP, sem Ouro)',(await LS(p,pre+'-prog'))===progMid);
  ok(tag+' estado enviado: "Nota recebida" com Fechar',await p.evaluate(()=>/Nota recebida/.test(document.getElementById('avlCard').textContent)&&!!document.querySelector('#avlCard [data-esc]')));
  if(route&&SHOTS)await p.screenshot({path:SHOTS+'/avaliacao-2-enviado.png'});
  await p.keyboard.press('Escape');await p.waitForTimeout(200);
  ok(tag+' Esc fecha o estado enviado',!(await card(p)));
  const av=JSON.parse(await LS(p,pre+'-aval')||'{}');
  ok(tag+' guarda só em '+pre+'-aval (enviado, nota, data)',av.sent==='2026-11-27'&&av.nota===4&&av.last==='2026-11-27');
  {const a=JSON.parse(pre0),z=JSON.parse(progMid);const bad=Object.keys(a.log).filter(k=>k<"2026-11-27"&&JSON.stringify(a.log[k])!==JSON.stringify(z.log[k]));ok(tag+' progresso antigo intacto (só cresceu pela missão)',z.velho==='fica'&&!bad.length,bad.map(k=>k+':'+JSON.stringify(a.log[k])+'=>'+JSON.stringify(z.log[k])).join(' ; '));}
  ok(tag+' console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // nunca: beta desligado, 1º dia, até 13, 14-17 sem responsável
  for(const [nm,o] of [['beta desligado',{beta:null}],['beta com on:false',{beta:Object.assign({},BETA,{on:false})}],['1º dia de uso',{log:{}}],['até 13 anos',{age:'kid'}],['14-17 sem responsável',{age:'teen'}]]){
    ({ctx,p,posts}=await open(route,pre,o));ok(tag+' '+nm+': sem cartão e nada enviado',!(await conquer(p))&&!posts.some(x=>/\|aval\|/.test(x)));await ctx.close();}
  // 14-17 com responsável (beta.parent): pode
  ({ctx,p}=await open(route,pre,{age:'teen',beta:Object.assign({},BETA,{parent:1})}));ok(tag+' 14-17 com responsável: cartão aparece',await conquer(p));await ctx.close();
  // intervalo de 30 dias
  ({ctx,p}=await open(route,pre,{av:{last:'2026-11-10',n:1}}));ok(tag+' mostrado há 17 dias: não repete',!(await conquer(p)));await ctx.close();
  ({ctx,p}=await open(route,pre,{av:{last:'2026-10-20',n:1}}));ok(tag+' mostrado há 38 dias: pode de novo',await conquer(p));await ctx.close();
  ({ctx,p}=await open(route,pre,{av:{last:'2026-10-01',sent:'2026-10-01',nota:5,n:1}}));ok(tag+' já avaliou há 57 dias: espera 90',!(await conquer(p)));await ctx.close();
  // "Agora não" duas vezes: some de vez; Esc não conta
  ({ctx,p}=await open(route,pre,{av:{last:'2026-10-01',n:1}}));await conquer(p);await p.keyboard.press('Escape');await p.waitForTimeout(200);
  let a2=JSON.parse(await LS(p,pre+'-aval'));ok(tag+' Esc fecha sem contar como "Agora não"',!(await card(p))&&!a2.no&&a2.last==='2026-11-27');await ctx.close();
  ({ctx,p}=await open(route,pre,{av:{last:'2026-10-01',n:1,no:1}}));const sh=await conquer(p);await p.locator('#avlCard .ghost').click();await p.waitForTimeout(200);
  a2=JSON.parse(await LS(p,pre+'-aval'));ok(tag+' 2º "Agora não" desliga de vez',sh&&!(await card(p))&&a2.no===2&&a2.off===true);await ctx.close();
  ({ctx,p}=await open(route,pre,{av:a2,now:'2027-03-01T10:00:00',log:Object.assign({},LOG3,{'2027-02-26':ent('q1'),'2027-02-27':ent('q1'),'2027-02-28':ent('q1')})}));
  ok(tag+' desligado: meses depois continua sem cartão',!(await conquer(p)));await ctx.close();
}
// reduce-motion e desktop
let {ctx,p,errs}=await open('comecar/','asc-u',{rm:'reduce'});await conquer(p);
ok('/comecar/ reduce-motion: estrelas sem transição',await p.evaluate(()=>getComputedStyle(document.querySelector('.avlstar')).transitionDuration.split(',').every(x=>parseFloat(x)===0)&&getComputedStyle(document.querySelector('#avlCard .card')).animationName==='none'));await ctx.close();
({ctx,p,errs}=await open('comecar/','asc-u',{vp:{width:1280,height:800}}));
ok('desktop 1280: cartão aparece centrado',await conquer(p)&&await p.evaluate(()=>{const r=document.querySelector('#avlCard .card').getBoundingClientRect();return Math.abs(r.left+r.width/2-640)<4&&r.width<=360;}));
ok('desktop: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length+' passaram');process.exit(f?1:0);})();
