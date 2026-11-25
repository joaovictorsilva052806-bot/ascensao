// Acessibilidade: todo campo de texto (input, select, textarea) tem nome acessível (label, aria-label ou title),
// não só placeholder, que some ao digitar e muitos leitores de tela ignoram (WCAG 1.3.1 / 4.1.2).
// Antes de 25/11 eram 5 campos sem nome na raiz e 13 em /comecar/ (ex.: #addInput, #q_name, #bkText).
// Rode com: python3 -m http.server 8000 & node qa/rotulos.test.js
const {chromium}=require('playwright');const B='http://localhost:8000';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const semNome=p=>p.$$eval('input:not([type=hidden]),select,textarea',els=>els.filter(e=>!((e.labels&&e.labels.length)||(e.getAttribute('aria-label')||'').trim()||e.getAttribute('aria-labelledby')||(e.getAttribute('title')||'').trim())).map(e=>'#'+e.id));
(async()=>{const b=await chromium.launch();
for(const [nome,vp] of [['celular',{width:390,height:844}],['desktop',{width:1280,height:800}]]){
  for(const u of ['/','/comecar/','/convite/']){const c=await b.newContext({viewport:vp});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(B+u);await p.waitForTimeout(1200);const s=await semNome(p);
    ok(nome+' '+u+': todo campo tem nome acessível',!s.length,s.join(', '));
    if(u!=='/convite/'){const n=await p.getByRole('textbox',{name:'Nova quest rápida',includeHidden:true}).count();ok(nome+' '+u+': campo de quest rápida achado pelo nome',n===1,String(n));}
    ok(nome+' '+u+': sem erro de página',!errs.length,errs.join(' | '));await c.close();}}
// quest rápida continua funcionando pelo nome acessível
{const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();await p.goto(B+'/');await p.waitForTimeout(1200);
  await p.evaluate(()=>{const f=document.getElementById('addInput');f.value='Beber água';f.form.requestSubmit();});await p.waitForTimeout(300);
  const ex=await p.evaluate(()=>{try{const g=JSON.parse(localStorage.getItem('ascensao-prog')||'{}');return JSON.stringify(g.extra||{});}catch(e){return '';}});
  ok('raiz: quest rápida salva',ex.includes('Beber água'),ex);await c.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
