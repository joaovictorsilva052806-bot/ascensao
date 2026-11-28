// Barra de vida do chefão: o número "300 / 300 HP" precisa ser legível em qualquer cor da barra
// (verde cheio, amarelo ferido, vermelho crítico e zerada). Antes era branco direto em cima do
// verde-limão (contraste ~1,4:1). Mede o pior caso de contraste (WCAG ≥ 4,5:1) contra cada cor do
// gradiente, mais o fundo vazio da barra. Raiz e /comecar/, celular 390x844, console limpo.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/chefe-contraste.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]};
const PROG={log:{},extra:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1},simple:{off:'2026-11-01'},velho:'fica'};
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){
  const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
  await p.clock.install({time:new Date('2026-11-26T10:00:00')});await p.goto(U+'privacidade/');
  await p.evaluate(([c,o,pre])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));},[CFG,PROG,pre]);
  await p.goto(U+route);await p.waitForSelector('.tbhpn',{state:'attached',timeout:8000});
  await p.evaluate(()=>{const t=[...document.querySelectorAll('nav button')].find(b=>/Progresso/i.test(b.textContent));t&&t.click();});await p.waitForTimeout(500);
  const tag=(route||'/')+': ';
  ok(tag+'número de vida aparece',/\d+ \/ \d+ HP/.test(await p.$eval('.tbhpn',e=>e.textContent)));
  for(const st of ['','hurt','crit']){
    const c=await p.evaluate(st=>{
      const fill=document.querySelector('.tbhp>i'),lbl=document.querySelector('.tbhpn'),bar=document.querySelector('.tbhp');
      fill.className=st;fill.style.width='100%';
      const rgba=s=>{const m=s.match(/[\d.]+/g).map(Number);return {r:m[0],g:m[1],b:m[2],a:m.length>3?m[3]:1}};
      const L=({r,g,b})=>{const f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
      const mix=(top,bot)=>({r:top.r*top.a+bot.r*(1-top.a),g:top.g*top.a+bot.g*(1-top.a),b:top.b*top.a+bot.b*(1-top.a),a:1});
      const cr=(x,y)=>{const a=L(x),b=L(y);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
      const cs=getComputedStyle(lbl);const fg=rgba(cs.color),own=rgba(cs.backgroundColor);
      const stops=(getComputedStyle(fill).backgroundImage.match(/rgba?\([^)]*\)/g)||[]).map(rgba);
      stops.push(rgba(getComputedStyle(bar).backgroundColor));// parte vazia da barra
      let worst=99;for(const s of stops){const bg=own.a>0?mix(own,s):s;worst=Math.min(worst,cr(mix(fg,bg),bg));}
      return worst;},st);
    ok(tag+'contraste do número na barra '+(st||'cheia')+' ≥ 4,5 (pior caso '+c.toFixed(2)+')',c>=4.5);
  }
  // o número continua dentro da barra (não vaza nem corta)
  const box=await p.evaluate(()=>{const a=document.querySelector('.tbhp').getBoundingClientRect(),b=document.querySelector('.tbhpn').getBoundingClientRect();return {in:b.left>=a.left-1&&b.right<=a.right+1&&b.top>=a.top-1&&b.bottom<=a.bottom+1,w:b.width,h:b.height}});
  ok(tag+'número cabe na barra',box.in&&box.w>20&&box.h>8,JSON.stringify(box));
  const g=await p.evaluate(pre=>JSON.parse(localStorage.getItem(pre+'-prog')||'{}'),pre);
  ok(tag+'campo antigo intacto',g.velho==='fica');
  ok(tag+'console limpo',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
