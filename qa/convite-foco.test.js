// Convite: o "olho" (#stage) mostra anel de foco visível para quem navega pelo teclado (WCAG 2.4.7).
// Antes de 26/11 o .stage tinha outline:none e nenhum substituto: Tab chegava nele sem sinal nenhum.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/convite-foco.test.js
const {chromium}=require('playwright');const U='http://127.0.0.1:8000/';let pass=0,fail=0;
const ok=(n,c,d)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n,d||'')}};
const IGN=/Failed to load resource|ERR_|navigator.vibrate/;
const L=c=>{const m=c.match(/[\d.]+/g).slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*m[0]+.7152*m[1]+.0722*m[2]};
(async()=>{const b=await chromium.launch();
for(const r of ['convite/','x/'])for(const [nome,o] of [['celular',{viewport:{width:390,height:844}}],['desktop',{viewport:{width:1280,height:800}}],['reduce',{viewport:{width:390,height:844},reducedMotion:'reduce'}]]){
  const ctx=await b.newContext(o);const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!IGN.test(m.text()))errs.push(m.text())});
  await p.goto(U+r);await p.waitForTimeout(400);const t=`/${r} ${nome}`;
  // foco pelo mouse/toque não precisa de anel (focus-visible)
  // Tab até o olho
  let achou=false;for(let i=0;i<6&&!achou;i++){await p.keyboard.press('Tab');achou=await p.evaluate(()=>document.activeElement&&document.activeElement.id==='stage');}
  ok(t+': Tab chega no olho',achou);
  const s=await p.$eval('#stage',e=>{const c=getComputedStyle(e);return {st:c.outlineStyle,w:parseFloat(c.outlineWidth),col:c.outlineColor,bg:getComputedStyle(document.body).backgroundColor,fv:e.matches(':focus-visible')}});
  ok(t+': olho em :focus-visible',s.fv);
  ok(t+': anel de foco visível (≥ 2px)',s.st!=='none'&&s.w>=2,JSON.stringify(s));
  const a=L(s.col),bg=L(s.bg);const ratio=(Math.max(a,bg)+.05)/(Math.min(a,bg)+.05);
  ok(t+': anel com contraste ≥ 3:1 ('+ratio.toFixed(1)+')',ratio>=3);
  // Enter continua revelando
  await p.keyboard.press('Enter');await p.waitForTimeout(nome==='reduce'?300:2600);
  if(!/Aceite/.test(await p.locator('#t').textContent())){await p.keyboard.press('Enter');await p.waitForTimeout(nome==='reduce'?300:2600);}
  ok(t+': Enter no olho ainda revela',(await p.locator('#t').textContent()).trim()==='Aceite a missão');
  ok(t+': console limpo',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(pass+'/'+(pass+fail)+' passando');process.exit(fail?1:0);})();
