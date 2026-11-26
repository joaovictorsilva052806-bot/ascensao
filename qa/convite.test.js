// Convite (checklist da EVA, issue #22): /convite/ e /x/ iguais; o olho; os passos em ordem por aparelho;
// redirecionamento certo pelo ícone, sem loop e sem erro de console.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/convite.test.js
const {chromium,devices}=require('playwright');const fs=require('fs'),path=require('path');
const U='http://127.0.0.1:8000/';let pass=0,fail=0;
const ok=(n,c,d)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n,d||'')}};
const IGN=/Failed to load resource|ERR_|navigator.vibrate/;
const UA={
  iphone:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  iphoneInsta:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0',
  android:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
  androidZap:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36 WhatsApp/2.24',
  pc:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'};
const VIEWS=['v-prompt','v-ios','v-ios-other','v-and','v-and-other','v-pc','v-done'];
async function open(b,r,o={}){const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},hasTouch:true},o));
  const p=await ctx.newPage(),errs=[],navs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!IGN.test(m.text()))errs.push(m.text())});
  p.on('framenavigated',f=>{if(f===p.mainFrame())navs.push(f.url())});
  const res=await p.goto(U+r,{waitUntil:'load'});return {ctx,p,errs,navs,res};}
const visible=p=>p.evaluate(ids=>ids.filter(id=>!document.getElementById(id).hidden),VIEWS);

(async()=>{
  // 1) /x/ é cópia do /convite/ (tirando o comentário e o canonical)
  const norm=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8').replace(/<!--[^]*?-->\n?/g,'').replace(/<link rel="canonical"[^>]*>/,'');
  ok('/x/ igual ao /convite/ (código)',norm('convite/index.html')===norm('x/index.html'));
  ok('/x/ manifest igual ao do /convite/',fs.readFileSync(path.join(__dirname,'../convite/manifest.webmanifest'),'utf8')===fs.readFileSync(path.join(__dirname,'../x/manifest.webmanifest'),'utf8'));

  const b=await chromium.launch();
  // 2) as duas rotas abrem e mostram o mesmo texto depois do toque no olho
  const txt={};
  for(const r of ['convite/','x/'])for(const rm of ['no-preference','reduce']){
    const {ctx,p,errs,res}=await open(b,r,{userAgent:UA.android,reducedMotion:rm});
    ok(r+' '+rm+': responde 200',res.status()===200);
    const eye=p.locator('#stage');
    ok(r+' '+rm+': olho é botão com nome',await eye.getAttribute('role')==='button'&&!!(await eye.getAttribute('aria-label')));
    await p.waitForFunction(()=>document.getElementById('t').textContent.includes('escolhido')||document.getElementById('t').textContent.includes('Toque'),null,{timeout:8000}).catch(()=>{});
    await eye.click();await p.waitForTimeout(rm==='reduce'?300:2500);
    if(!/Aceite/.test(await p.locator('#t').textContent())){await eye.click();await p.waitForTimeout(rm==='reduce'?300:2500);}
    ok(r+' '+rm+': tocar no olho revela "Aceite a missão"',(await p.locator('#t').textContent()).trim()==='Aceite a missão',await p.locator('#t').textContent());
    ok(r+' '+rm+': explica em 1 linha',/missões, XP/.test(await p.locator('#why').textContent()));
    ok(r+' '+rm+': atalho "entrar sem instalar" aponta para /comecar/',await p.locator('#skip').evaluate(a=>a.href)===U+'comecar/');
    txt[r+rm]=await p.locator('body').innerText();
    ok(r+' '+rm+': console limpo',!errs.length,errs.join(' | '));await ctx.close();}
  const norm2=s=>s.replace(/ID [0-9A-F]{4}-[0-9A-F]{4}/g,'');
  ok('/convite/ e /x/ mostram o mesmo texto',norm2(txt['convite/no-preference'])===norm2(txt['x/no-preference']));

  // 3) teclado: Enter no olho também revela (acessível sem dedo)
  {const {ctx,p}=await open(b,'convite/',{userAgent:UA.pc,viewport:{width:1280,height:800},hasTouch:false,reducedMotion:'reduce'});
    await p.locator('#stage').focus();await p.keyboard.press('Enter');await p.keyboard.press('Enter');await p.waitForTimeout(300);
    ok('teclado: Enter no olho revela',(await p.locator('#t').textContent()).trim()==='Aceite a missão');await ctx.close();}

  // 4) passos certos por aparelho, numerados em ordem e só uma tela de passos por vez
  const CASES=[['iphone','v-ios',3],['iphoneInsta','v-ios-other',1],['android','v-and',3],['androidZap','v-and-other',1],['pc','v-pc',1]];
  for(const [k,v,n] of CASES){const {ctx,p,errs}=await open(b,'convite/',{userAgent:UA[k],reducedMotion:'reduce'});
    const vis=await visible(p);ok(k+': mostra só '+v,vis.length===1&&vis[0]===v,vis.join(','));
    const nums=await p.locator('#'+v+' .n').allTextContents();
    ok(k+': '+n+' passo(s) em ordem',nums.length===n&&nums.every((x,i)=>x===String(i+1).padStart(2,'0')),nums.join(','));
    ok(k+': passos escondidos até tocar no olho',!(await p.locator('#'+v).isVisible()));
    await p.locator('#stage').click();await p.locator('#stage').click();await p.waitForTimeout(300);
    ok(k+': passos aparecem depois do olho',await p.locator('#'+v).isVisible());
    if(/other|pc/.test(v))ok(k+': tem "Copiar link"',await p.locator('#'+v+' .copy').isVisible());
    ok(k+': console limpo',!errs.length,errs.join(' | '));await ctx.close();}

  // 5) aberto pelo ícone (standalone): vai para /comecar/ uma vez e fica lá (sem loop)
  for(const r of ['convite/','x/'])for(const how of ['display-mode','navigator.standalone']){
    const ctx=await b.newContext({viewport:{width:390,height:844}});
    await ctx.addInitScript(h=>{if(h==='display-mode'){const mm=window.matchMedia.bind(window);
        window.matchMedia=q=>/display-mode:\s*standalone/.test(q)?({matches:true,media:q,onchange:null,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}):mm(q);}
      else Object.defineProperty(navigator,'standalone',{get:()=>true});},how);
    const p=await ctx.newPage(),errs=[],navs=[];p.on('pageerror',e=>errs.push(e.message));
    p.on('framenavigated',f=>{if(f===p.mainFrame())navs.push(f.url())});
    await p.goto(U+r).catch(()=>{});await p.waitForTimeout(2500);
    ok(r+' '+how+': redireciona para /comecar/',p.url()===U+'comecar/',p.url());
    const hops=navs.filter(u=>/convite\/|x\//.test(u)).length;
    ok(r+' '+how+': sem loop ('+navs.length+' navegação(ões))',hops===1&&navs.length<=3,navs.join(' > '));
    ok(r+' '+how+': sem erro de JS',!errs.length,errs.join(' | '));await ctx.close();}

  // 6) no navegador comum não redireciona
  {const {ctx,p}=await open(b,'convite/',{userAgent:UA.iphone});await p.waitForTimeout(800);
    ok('navegador comum: fica no convite',p.url()===U+'convite/',p.url());await ctx.close();}
  await b.close();
  console.log(pass+'/'+(pass+fail)+' passando');process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
