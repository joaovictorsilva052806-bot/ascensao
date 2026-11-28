// ⚡ Abertura sem trava: ao abrir o app, o render() roda ~8 vezes e o ajuste do texto do campo "Quest rápida" (hrPh, tools/heroi.js)
// media o campo a cada render, forçando o navegador a recalcular o layout da tela inteira 8x (~150 ms num PC; ~1 s de tela travada
// num celular lento). A película holográfica das janelas (hxFilm, tools/holo.js) também lia getComputedStyle a cada janela nova.
// Agora: no máximo 2 medidas do campo por abertura (1 por quadro) e nenhuma leitura de estilo na película.
// Continua igual: o texto do campo se ajusta à largura (cabe em 320 px, completo no desktop, muda ao girar/redimensionar),
// a película aparece nas janelas e fica presa ao card (position relative), dados intactos, console limpo, reduce-motion.
// Rode com: python3 -m http.server 8000 & node qa/abertura-rapida.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',profile:{age:'18 a 29'},quests:[{id:'q1',title:'Treino de 20 min',xp:20,stat:'corpo',main:true},{id:'q2',title:'Ler 10 páginas',xp:10,stat:'mente'}]};
const log={};for(let d=1;d<28;d++)log['2026-11-'+String(d).padStart(2,'0')]=[{q:'q1',kind:'full',xp:20,stat:'corpo',bonus:0,t:'x'}];
const PROG={log,ach:{a_first:'2026-11-01'},rpg:{cls:{id:'guerreiro',style:'fant',name:'Guerreiro',stat:'corpo'},seen:{foco:1,vendas:1,mente:1,corpo:1}},simple:{off:'2026-11-01'},velho:'fica'};
async function semear(p,pre){await p.goto(U+'privacidade/');
  await p.evaluate(([c,o,k])=>{localStorage.setItem(k+'-cfg',JSON.stringify(c));localStorage.setItem(k+'-prog',JSON.stringify(o));localStorage.setItem(k+'-season','2');localStorage.setItem(k+'-tele','{"asked":1}');},[CFG,PROG,pre]);}
async function ctxPage(b,vp,rm){const ctx=await b.newContext({viewport:vp,reducedMotion:rm?'reduce':'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route(/fonts|docs\.google|script\.google/,r=>r.fulfill({status:200,body:''}));return {ctx,p,errs};}
(async()=>{const b=await chromium.launch();
for(const [route,pre,tag] of [['comecar/','asc-u','/comecar/'],['','ascensao','raiz']]){
  // 1) recálculos forçados na abertura (trace do Chrome, com a pilha de quem pediu)
  {const {ctx,p,errs}=await ctxPage(b,{width:390,height:844});await semear(p,pre);
    await b.startTracing(p,{categories:['devtools.timeline','disabled-by-default-devtools.timeline.stack']});
    await p.goto(U+route,{waitUntil:'load'});await p.waitForTimeout(1500);
    const ev=JSON.parse((await b.stopTracing()).toString()).traceEvents.filter(e=>(e.name==='Layout'||e.name==='UpdateLayoutTree')&&e.ph==='X');
    const by=fn=>ev.filter(e=>{const st=e.args&&e.args.beginData&&e.args.beginData.stackTrace;return st&&st[0]&&st[0].functionName===fn;}).length;
    const ph=by('hrPh'),fm=by('hxFilm');
    ok(tag+': campo "Quest rápida" mede no máximo 3x na abertura',ph<=3,ph+' recálculos forçados');
    ok(tag+': película das janelas não força recálculo',fm===0,fm+' recálculos forçados');
    ok(tag+': console limpo na abertura',!errs.length,errs.join(' | '));await ctx.close();}
  // 2) o ajuste do texto continua funcionando
  for(const rm of [false,true]){const T=tag+(rm?' reduce':'');const {ctx,p,errs}=await ctxPage(b,{width:320,height:700},rm);await semear(p,pre);
    await p.goto(U+route);await p.waitForTimeout(1200);
    const fits=()=>p.evaluate(()=>{const i=document.getElementById('addInput');if(!i||!i.clientWidth)return null;const cs=getComputedStyle(i);const c=document.createElement('canvas').getContext('2d');c.font=cs.fontSize+' '+cs.fontFamily;
      return {ph:i.placeholder,fit:c.measureText(i.placeholder).width<=i.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-2||i.placeholder==='Quest rápida'};});
    const a=await fits();ok(T+': 320 px: texto do campo cabe',a&&a.fit,JSON.stringify(a));
    ok(T+': 320 px: texto encurtado',a&&a.ph!=='Quest rápida (vale 10 XP)',a&&a.ph);
    await p.setViewportSize({width:1280,height:800});await p.waitForTimeout(500);
    const d=await fits();ok(T+': ao alargar a tela o texto completo volta',d&&d.ph==='Quest rápida (vale 10 XP)',d&&d.ph);
    await p.setViewportSize({width:320,height:700});await p.waitForTimeout(500);
    const e=await fits();ok(T+': ao estreitar de novo, encurta de novo',e&&e.fit&&e.ph!=='Quest rápida (vale 10 XP)',e&&e.ph);
    // quest rápida continua adicionando (render dispara o ajuste sem erro)
    await p.evaluate(()=>{const f=document.getElementById('addInput');f.value='Beber água';f.form.requestSubmit();});await p.waitForTimeout(500);
    const s=await p.evaluate(k=>JSON.parse(localStorage.getItem(k+'-prog')),pre);
    ok(T+': quest rápida salva e dados antigos intactos',s.velho==='fica'&&s.log['2026-11-24'].length===1&&JSON.stringify(s).includes('Beber água'));
    // 3) película holográfica numa janela do Sistema: presente, absoluta e presa ao card
    const film=await p.evaluate(()=>{const out=[];for(const m of document.querySelectorAll('.sysmodal,.levelup,.smsheet')){const c=m.querySelector('.card,.smcard');if(!c)continue;const f=c.querySelector(':scope>.hxfx');
      out.push({film:!!f,pos:getComputedStyle(c).position,fpos:f&&getComputedStyle(f).position});}return out;});
    ok(T+': toda janela tem a película',film.length>0&&film.every(x=>x.film),JSON.stringify(film));
    ok(T+': card da janela não fica "static" (película não escapa)',film.every(x=>x.pos!=='static'&&x.fpos==='absolute'),JSON.stringify(film));
    ok(T+': console limpo',!errs.length,errs.join(' | '));await ctx.close();}
}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})().catch(e=>{console.error(e);process.exit(1)});
