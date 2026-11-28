// Barra de abas: o leitor de tela precisa saber qual aba está aberta (antes só a cor/classe .on mostrava).
// Confere nas 2 rotas, celular/desktop, com e sem reduce-motion: nav com nome, exatamente 1 botão com aria-current="page"
// e é o mesmo da classe .on; muda ao tocar e pelo teclado; aba restaurada ao recarregar (inclui as abas criadas depois:
// Amigos e Lendárias); console limpo; dados salvos intactos.
// Rode com: python3 -m http.server 8000 & node qa/abas-atual.test.js   (outra porta: QA_URL=http://127.0.0.1:8001/)
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]};
const PROG={log:{'2026-11-27':[{q:'q1',kind:'q',xp:10,stat:'mente',t:1}]},velho:'fica',rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:0},simple:{off:'2026-11-01'}};
async function shut(p){for(let i=0;i<8;i++){const x=await p.evaluate(()=>{const m=document.querySelector('.sysmodal');if(!m)return null;const b=m.querySelector('[data-esc],button.ghost,button.go')||m.querySelector('button');if(b)b.click();else return null;return 1;});if(x==null)break;await p.waitForTimeout(150);}}
const st=p=>p.evaluate(()=>{const bs=[...document.querySelectorAll('#tabbar button')].filter(b=>!b.hidden);const cur=bs.filter(b=>b.getAttribute('aria-current')==='page');const on=bs.filter(b=>b.classList.contains('on'));
  return {nav:document.getElementById('tabbar').getAttribute('aria-label')||'',cur:cur.map(b=>b.dataset.go),on:on.map(b=>b.dataset.go),tab:document.body.dataset.tab,tabs:bs.map(b=>b.dataset.go)};});
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
 for(const [vn,vp,rm] of [['celular',{width:390,height:844},'no-preference'],['desktop',{width:1280,height:800},'reduce']]){const T=tag+' '+vn+(rm==='reduce'?' + reduce-motion':'');
  const ctx=await b.newContext({viewport:vp,reducedMotion:rm,serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate|Content Security Policy/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date('2026-11-28T10:00:00')});
  await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele','{"asked":1}');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[CFG,PROG,pre]);
  await p.goto(U+route);await p.waitForTimeout(1500);await shut(p);
  let s=await st(p);
  ok(T+': barra de abas tem nome para o leitor de tela',s.nav.length>0,s.nav);
  ok(T+': ao abrir, só a aba atual tem aria-current="page"',s.cur.length===1&&s.cur[0]===s.tab&&s.on.join()===s.cur.join(),JSON.stringify(s));
  ok(T+': Amigos e Lendárias estão na barra',s.tabs.includes('amigos')&&s.tabs.includes('lenda'),s.tabs.join());
  let all=true,bad='';
  for(const t of s.tabs){await shut(p);await p.evaluate(t=>document.querySelector('#tabbar [data-go="'+t+'"]').click(),t);await p.waitForTimeout(250);await shut(p);const x=await st(p);if(!(x.cur.length===1&&x.cur[0]===t&&x.on.join()===t&&x.tab===t)){all=false;bad=t+' '+JSON.stringify(x);}}
  ok(T+': tocar em cada aba move o aria-current junto com o destaque',all,bad);
  // teclado: foco na aba Foco e Enter
  await p.focus('#tabbar [data-go="foco"]');await p.keyboard.press('Enter');await p.waitForTimeout(250);await shut(p);
  s=await st(p);ok(T+': Enter na aba (teclado) também marca aria-current',s.cur.join()==='foco'&&s.tab==='foco',JSON.stringify(s));
  // aba restaurada após recarregar (abas criadas depois pelo módulo)
  for(const t of ['amigos','lenda']){await shut(p);await p.evaluate(t=>document.querySelector('#tabbar [data-go="'+t+'"]').click(),t);await p.waitForTimeout(200);await p.reload();await p.waitForTimeout(1500);await shut(p);
    s=await st(p);ok(T+': recarregar na aba '+t+' volta com aria-current certo',s.cur.join()===t&&s.on.join()===t&&s.tab===t,JSON.stringify(s));}
  const sv=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
  ok(T+': dados antigos intactos',sv&&sv.velho==='fica'&&sv.rpg.cls.id==='mago'&&Array.isArray(sv.log['2026-11-27']));
  ok(T+': console limpo',errs.length===0,errs.join(' | '));
  await ctx.close();}}
// gerados batem com a fonte
{const fs=require('fs');const src=fs.readFileSync(__dirname+'/../tools/base.html','utf8');
 for(const f of ['index.html','comecar/index.html']){const g=fs.readFileSync(__dirname+'/../'+f,'utf8');ok(f+' gerado com aria-current nas abas',/aria-current","page"/.test(g)&&/id="tabbar" aria-label="/.test(g));}
 ok('tools/base.html é a fonte',/aria-current","page"/.test(src));}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
