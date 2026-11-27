// Pacote da App Store (nativo/www, Capacitor) com um Capacitor falso no navegador.
// Rode com: python3 -m http.server 8000 & node qa/nativo.test.js (o teste roda nativo/preparar.js antes)
// Confere: abre sem erro, links de convite apontam para o site público, ponte nativa (háptico, aviso,
// compartilhar) e a cópia do progresso no Preferences (restaura só aparelho vazio, guarda o "antes").
const {chromium}=require('playwright');const U='http://localhost:8000/nativo/www/';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const SITE='https://joaovictorsilva052806-bot.github.io/ascensao/';
require('child_process').execFileSync('node',['preparar.js'],{cwd:__dirname+'/../nativo',stdio:'ignore'});
const fs=require('fs');const html=fs.readFileSync(__dirname+'/../nativo/www/comecar/index.html','utf8');
ok('www: convites usam o site público',html.includes(JSON.stringify(SITE)+'+"x/"')&&html.includes(JSON.stringify(SITE)+'+"convite/"')&&!html.includes('location.origin+location.pathname.replace'));
ok('www: ponte injetada antes do 1º script do app',html.indexOf('isNativePlatform')>0&&html.indexOf('isNativePlatform')<html.indexOf('const $='));
const MOCK=store=>`window.__log=[];window.__pref=JSON.parse(sessionStorage.getItem('__pref')||${JSON.stringify(JSON.stringify(store||{}))});
window.Capacitor={isNativePlatform:()=>true,Plugins:{
 Haptics:{impact:o=>{__log.push('impact:'+o.style);return Promise.resolve();},notification:o=>{__log.push('notif:'+o.type);return Promise.resolve();}},
 Share:{share:o=>{__log.push('share:'+o.url);return Promise.resolve({});}},
 LocalNotifications:{schedule:o=>{__log.push('ln:'+o.notifications[0].title);return Promise.resolve();},requestPermissions:()=>Promise.resolve({display:'granted'}),checkPermissions:()=>Promise.resolve({display:'prompt'})},
 Preferences:{get:o=>Promise.resolve({value:__pref[o.key]||null}),set:o=>{__pref[o.key]=o.value;sessionStorage.setItem('__pref',JSON.stringify(__pref));__log.push('pref:'+o.key);return Promise.resolve();}},
 StatusBar:{setStyle:()=>Promise.resolve()}}};`;
const CFG={version:3,name:'Lucas',startDate:'2026-11-10',profile:{age:'adult',occ:'faculdade',focus:['estudos']},quests:[{id:'q1',title:'Estudar 40 min',xp:20,stat:'mente',main:true}]};
const PROG={log:{'2026-11-20':[{q:'q1',kind:'full',xp:20}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},campoFuturo:{x:1}};
(async()=>{const b=await chromium.launch();
async function abre(store,seed){const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://**',r=>r.fulfill({status:200,body:''}));
  await ctx.addInitScript(MOCK(store));
  if(seed)await ctx.addInitScript(([c,o])=>{if(!sessionStorage.getItem('sem')){sessionStorage.setItem('sem','1');localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-intro','1');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-season','2');}},seed);
  const res=await p.goto(U);await p.waitForTimeout(2500);return {ctx,p,errs,res};}
// 1: aparelho com progresso: ponte liga, cópia vai para o Preferences, nada é sobrescrito
let {ctx,p,errs}=await abre({},[CFG,PROG]);
ok('abre em /comecar/ (mesmos caminhos do site)',new URL(p.url()).pathname==='/nativo/www/comecar/index.html');
ok('classe nativo no html',await p.evaluate(()=>document.documentElement.classList.contains('nativo')));
await p.evaluate(()=>{navigator.vibrate(8);navigator.vibrate([12,60,12]);navigator.vibrate(60);});
let log=await p.evaluate(()=>__log);
ok('háptico nativo no lugar do vibrate',log.includes('impact:LIGHT')&&log.includes('impact:MEDIUM')&&log.includes('notif:SUCCESS'),log.join(','));
ok('Notification vira aviso local',await p.evaluate(async()=>{const r=await Notification.requestPermission();new Notification('Teste',{body:'x'});return r==='granted'&&Notification.permission==='granted'&&__log.includes('ln:Teste');}));
ok('compartilhar pelo menu nativo',await p.evaluate(async()=>{await navigator.share({title:'A',url:'https://x/'});return __log.includes('share:https://x/');}));
await p.waitForTimeout(3500);
const pref=await p.evaluate(()=>__pref);const cp=pref['asc-copia-nativa']?JSON.parse(pref['asc-copia-nativa']):{};
ok('cópia do progresso no Preferences',!!cp['asc-u-prog']&&JSON.parse(cp['asc-u-prog']).campoFuturo.x===1);
const local=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
ok('progresso local intacto (campo desconhecido mantido)',local.campoFuturo&&local.campoFuturo.x===1&&local.log['2026-11-20'].length===1);
ok('console limpo (1)',errs.length===0,errs.join(' | '));await ctx.close();
// 2: aparelho apagado pelo iOS: restaura da cópia, guarda o "antes"
({ctx,p,errs}=await abre(pref));await p.waitForTimeout(1500);
const back=await p.evaluate(()=>{try{return JSON.parse(localStorage.getItem('asc-u-prog'));}catch(e){return null;}});
ok('aparelho vazio: progresso volta da cópia',back&&back.campoFuturo&&back.campoFuturo.x===1&&back.log['2026-11-20'].length===1);
ok('aparelho vazio: estado anterior guardado',await p.evaluate(()=>typeof __pref['asc-copia-nativa-antes']==='string'));
ok('console limpo (2)',errs.length===0,errs.join(' | '));await ctx.close();
// 3: fora do app nativo (navegador comum) a ponte não faz nada
{const ctx=await b.newContext();const p=await ctx.newPage();await ctx.route('https://**',r=>r.fulfill({status:200,body:''}));await p.goto(U);await p.waitForTimeout(1200);
 ok('sem Capacitor: ponte desligada',!(await p.evaluate(()=>document.documentElement.classList.contains('nativo'))));await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
