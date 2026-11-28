// Link pronto para espalhar (28/11): prévia do /comecar/ no WhatsApp (og:*) e o "Convidar amigo" com texto curto e código da Guilda.
// Nunca envia sozinho: só abre o compartilhar do celular (aqui, navigator.share falso que só anota).
// Rode com: python3 -m http.server 8000 & node qa/convite-pronto.test.js
const {chromium}=require('playwright');const fs=require('fs');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=age=>({version:3,name:'Bia Teste',startDate:'2026-11-20',profile:{age},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]});
const PROG=rank=>({log:{'2026-11-24':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'x'}],'2026-11-25':[{q:'q1',kind:'full',xp:40,stat:'mente',bonus:0,t:'y'}]},extra:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},gd:{off:1},velho:'fica',...(rank?{rank:{on:true,asked:true,uid:'bia12345',nick:'Bia'}}:{})});
(async()=>{
// 1) prévia do link
const h=fs.readFileSync('comecar/index.html','utf8');const m=k=>{const r=new RegExp('<meta (?:property|name)="'+k+'" content="([^"]*)"').exec(h);return r?r[1]:'';};
ok('og:title com dinheiro na frente e 18+',/pagam de verdade/.test(m('og:title'))&&/18\+/.test(m('og:title')),m('og:title'));
ok('og:description diz que o app não guarda dinheiro',/nunca guarda/.test(m('og:description')),m('og:description'));
ok('og:image absoluta no /comecar/',m('og:image')==='https://joaovictorsilva052806-bot.github.io/ascensao/comecar/og.jpg');
const j=fs.readFileSync('comecar/og.jpg');let w=0,hh=0;for(let i=2;i<j.length;){if(j[i]!==0xFF)break;const t=j[i+1],L=j.readUInt16BE(i+2);if(t>=0xC0&&t<=0xC2){hh=j.readUInt16BE(i+5);w=j.readUInt16BE(i+7);break;}i+=2+L;}
ok('og.jpg 1200x630 e menor que 300 KB',w===1200&&hh===630&&j.length<300e3,w+'x'+hh+' '+j.length);
ok('twitter:card grande',m('twitter:card')==='summary_large_image');
ok('raiz (app do JV) sem prévia pública',!/og:image/.test(fs.readFileSync('index.html','utf8')));
// 2) Convidar amigo
const b=await chromium.launch();
for(const [tag,age,rank] of [['adulto','adult',1],['14-17','teen',1],['sem ranking','adult',0]]){
  const ctx=await b.newContext({viewport:{width:390,height:844}});
  await ctx.route(/fonts|google/,r=>r.fulfill({status:200,contentType:'text/plain',body:''}));
  await ctx.addInitScript(()=>{window.__sh=[];window.__open=[];Object.defineProperty(navigator,'share',{value:d=>{window.__sh.push(d);return Promise.resolve();}});window.open=(...a)=>{window.__open.push(a);return null;};});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const posts=[];p.on('request',r=>{if(r.method()==='POST')posts.push(r.url());});
  await p.goto(U+'privacidade/');await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));},[CFG(age),PROG(rank)]);
  await p.goto(U+'comecar/');await p.waitForTimeout(1500);await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(x=>x.remove()));
  await p.locator('#tabbar [data-go="amigos"]').click();await p.waitForTimeout(600);
  const btn=p.locator(rank?'#tmPanel .cdinvb':'#tmPanel button:has-text("Chamar alguém"), #tmPanel button:has-text("Convidar")');
  if(!rank||age==='teen'){ok(tag+': sem convite com apelido ('+(age==='teen'?'14-17 só com autorização do responsável':'sem ranking')+')',!(await p.locator('#tmPanel .cdinvb').count()));await ctx.close();continue;}
  ok(tag+': botão "Convidar amigo" visível',await btn.first().isVisible());
  const n0=posts.length;await btn.first().click();await p.waitForTimeout(400);
  const sh=await p.evaluate(()=>window.__sh);const s=sh[0]||{};
  ok(tag+': abre o compartilhar com texto e link (não envia sozinho)',sh.length===1&&/amigo=Bia/.test(s.url||'')&&s.text&&s.text.length<260,JSON.stringify(sh));
  ok(tag+': texto traz o código da Guilda',/[A-Z0-9]{4}-[A-Z0-9]{4}/.test(s.text||'')&&/Entrar numa Guilda/.test(s.text||''),s.text);
  ok(tag+': adulto vê "pagam de verdade" e 18+',/pagam de verdade/.test(s.text)&&/18\+/.test(s.text),s.text);
  ok(tag+': nada enviado ao clicar',posts.length===n0&&!(await p.evaluate(()=>window.__open.length)));
  ok(tag+': sem erro de JS',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(`${R.length-f}/${R.length}`);process.exit(f?1:0);})().catch(e=>{console.error(e);process.exit(1);});
