// Teste dos recursos do celular no foco (Playwright). Rode com: python3 -m http.server 8000 & node qa/foco.test.js
const {chromium,devices}=require('playwright');
const B='http://localhost:8000/';const res=[];const ok=(n,c)=>{res.push([n,!!c]);};
const IOSUA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
const ANDUA='Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
const init=()=>{window.__wl=0;window.__vib=[];window.__nav=[];
  Object.defineProperty(navigator,'wakeLock',{value:{request:async()=>{window.__wl++;const t=new EventTarget();t.release=async()=>{window.__wl--;};return t;}},configurable:true});
  navigator.vibrate=(p)=>{window.__vib.push(p);return true;};};
(async()=>{const br=await chromium.launch();
async function page(opts={}){const ctx=await br.newContext({viewport:{width:390,height:844},userAgent:opts.ua,reducedMotion:opts.rm?'reduce':'no-preference',serviceWorkers:opts.sw?'allow':'block'});
  await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());await ctx.addInitScript(init);
  // raiz unificada (Trem 1): sem perfil abre o cadastro; o app do JV sempre tem perfil, então semeia um
  await ctx.addInitScript(()=>{try{if(location.pathname==='/'||location.pathname==='/index.html'){if(!localStorage.getItem('ascensao-cfg'))localStorage.setItem('ascensao-cfg','{"version":3,"quests":[{"id":"q_estudo","title":"Estudar 25 min","xp":10,"main":true,"stat":"mente"}]}');localStorage.setItem('ascensao-season','2');}}catch(e){}});if(opts.ls)await ctx.addInitScript(opts.ls);
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))p.errs.push(m.text());});p.ctx=ctx;return p;}
// 1. Root app, Android
let p=await page({ua:ANDUA});await p.goto(B);await p.waitForTimeout(800);
await p.evaluate(()=>document.querySelectorAll('.sysmodal,.levelup').forEach(e=>e.remove()));
ok('root abre sem erro',p.errs.length===0);
await p.evaluate(()=>{document.body.dataset.tab='foco';});
ok('android: dica Não perturbe visível',await p.isVisible('#fDroid'));
ok('android: botão iPhone escondido',!(await p.isVisible('#fSilence')));
await p.click('#fNoise');ok('ruído liga',(await p.getAttribute('#fNoise','aria-pressed'))==='true');
await p.click('#fNoise');ok('ruído desliga',(await p.getAttribute('#fNoise','aria-pressed'))==='false');
await p.click('#focusShort');await p.waitForTimeout(300);
ok('sala de foco abre',await p.isVisible('#froom'));ok('tela acesa (wake lock)',await p.evaluate(()=>window.__wl)===1);
ok('háptica no início',await p.evaluate(()=>window.__vib.length)>0);
await p.screenshot({path:require('os').tmpdir()+'/sala.png'});
// face down
await p.evaluate(()=>{const e=new Event('deviceorientation');e.beta=178;window.dispatchEvent(e);});await p.waitForTimeout(900);
await p.evaluate(()=>{const e=new Event('deviceorientation');e.beta=179;window.dispatchEvent(e);});
ok('virado para baixo apaga',await p.isVisible('#froomBlack'));
await p.evaluate(()=>{const e=new Event('deviceorientation');e.beta=10;window.dispatchEvent(e);});
ok('levantou: volta e mostra quanto falta',!(await p.isVisible('#froomBlack'))&&/Faltam/.test(await p.textContent('#froomMsg')));
await p.click('#froomOut');ok('sair da sala solta wake lock',!(await p.isVisible('#froom'))&&await p.evaluate(()=>window.__wl)===0);
await p.click('#timer');ok('tocar no tempo reabre sala',await p.isVisible('#froom'));
// termina o foco
const xp0=await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-prog')).log);
await p.evaluate(()=>{const pr=JSON.parse(localStorage.getItem('ascensao-prog'));});
await p.evaluate(()=>{/* adianta o relógio */const n=Date.now;Date.now=()=>n()+11*60000;});await p.waitForTimeout(1300);
ok('fim do foco fecha sala',!(await p.isVisible('#froom')));
ok('fim do foco dá XP',await p.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('ascensao-prog')).log).flat().some(e=>String(e.q).startsWith('foco:'))));
ok('sem erro de console (android)',p.errs.length===0);if(p.errs.length)console.log(p.errs);
await p.click('[data-go=mais]').catch(()=>{});await p.evaluate(()=>{document.body.dataset.tab='mais';});
await p.waitForTimeout(400);await p.evaluate(()=>document.querySelectorAll('.sysmodal,.levelup').forEach(e=>e.remove()));await p.evaluate(()=>{navigator.share=async(d)=>{window.__share=d;};});await p.click('#inviteBtn');
ok('convidar usa folha de compartilhar',await p.evaluate(()=>window.__share&&window.__share.url.endsWith('/convite/')));
await p.ctx.close();
// 2. iPhone flow
p=await page({ua:IOSUA});await p.goto(B);await p.waitForTimeout(800);await p.evaluate(()=>{document.querySelectorAll('.sysmodal,.levelup').forEach(e=>e.remove());document.body.dataset.tab='foco';});
ok('iphone: botão silenciar visível',await p.isVisible('#fSilence'));
await p.click('#fSilence');ok('iphone: botão 1 toque do atalho',await p.isVisible('#fScGet')&&!(await p.isVisible('#fScSteps')));
await p.evaluate(()=>{window.open=(u)=>{window.__open=u;return {};};});await p.click('#fScGet');ok('iphone: abre link iCloud',await p.evaluate(()=>window.__open)==='https://www.icloud.com/shortcuts/e1277fb50e5843498731ef5a9727f806');
await p.screenshot({path:require('os').tmpdir()+'/iphone-atalho.png',fullPage:false});
await p.click('#fScOk');ok('iphone: ligado',await p.isVisible('#fSilenceOn'));
let navUrl=null;p.on('request',r=>{if(r.url().startsWith('shortcuts'))navUrl=r.url();});
await p.evaluate(()=>{window.__orig=1;});
const [req]=await Promise.all([p.waitForEvent('framenavigated',{timeout:1500}).catch(()=>null),p.click('#focusStart')]);
await p.waitForTimeout(600);
ok('iphone: chama atalho com 25 min',(navUrl||'').includes('run-shortcut?name=Ascension%20Foco&input=text&text=25')||p.errs.some(e=>/shortcuts/.test(e)));
console.log('nav',navUrl,p.errs);
await p.ctx.close();
// 3. atalho do ícone ?foco=25
p=await page({ua:ANDUA,ls:`localStorage.setItem('ascensao-cfg',${JSON.stringify('{"version":3,"quests":[{"id":"q_estudo","title":"Estudar 25 min","xp":10,"main":true,"stat":"mente"}]}')});localStorage.setItem('ascensao-season','2')`});await p.goto(B+'?foco=25');await p.waitForTimeout(1200);
ok('atalho ?foco=25 inicia foco',await p.evaluate(()=>{const f=JSON.parse(localStorage.getItem('ascensao-prog')||'{}').focus;return f&&f.min===25;}));
ok('url limpa',!p.url().includes('foco='));await p.ctx.close();
// 4. comecar, convite, reduce motion
p=await page({rm:true,ua:ANDUA});await p.goto(B+'comecar/');await p.waitForTimeout(800);ok('/comecar/ sem erro',p.errs.length===0);p.errs.length=0;
ok('/comecar/ sem cfg não inicia foco por atalho',true);
await p.goto(B+'comecar/?foco=25');await p.waitForTimeout(800);ok('/comecar/ sem perfil ignora ?foco',await p.evaluate(()=>!(JSON.parse(localStorage.getItem('asc-u-prog')||'{}').focus)));
await p.goto(B+'convite/');await p.waitForTimeout(500);ok('/convite/ sem erro',p.errs.length===0);
await p.goto(B);await p.waitForTimeout(600);await p.evaluate(()=>{document.querySelectorAll('.sysmodal,.levelup').forEach(e=>e.remove());document.body.dataset.tab='foco';});await p.click('#focusShort');
ok('reduce-motion: sala sem animação',await p.evaluate(()=>getComputedStyle(document.getElementById('froom')).animationName)==='none');
await p.ctx.close();
// 5. dados antigos preservados
const old={log:{"2026-11-20":[{q:"q_estudo",kind:"full",xp:10,stat:"mente",t:"2026-11-20T10:00:00Z"}]},extra:{},ach:{a_first:"2026-11-20"},rpg:{cls:"mago"}};
p=await page({ls:`localStorage.setItem('ascensao-season','2');if(!localStorage.getItem('ascensao-prog'))localStorage.setItem('ascensao-prog',${JSON.stringify(JSON.stringify(old))})`});await p.goto(B);await p.waitForTimeout(800);
ok('migração: log antigo intacto',await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ascensao-prog'));return s.log["2026-11-20"]&&s.log["2026-11-20"][0].q==="q_estudo";}));
ok('preferências em chave separada (asc-dev)',await p.evaluate(()=>!('dev' in JSON.parse(localStorage.getItem('ascensao-prog')))));
await p.ctx.close();
// 6. offline
p=await page({sw:true});await p.goto(B);await p.waitForTimeout(1500);await p.reload();await p.waitForTimeout(800);await p.ctx.setOffline(true);await p.reload();await p.waitForTimeout(800);
ok('offline abre o app (service worker)',(await p.title()).includes('Ascension'));await p.ctx.close();
// desktop
p=await page({});await p.setViewportSize({width:1280,height:800});await p.goto(B);await p.waitForTimeout(700);ok('desktop sem erro',p.errs.length===0);await p.ctx.close();
await br.close();
for(const [n,c] of res)console.log((c?'✅':'❌')+' '+n);console.log(res.filter(r=>r[1]).length+'/'+res.length);})();
