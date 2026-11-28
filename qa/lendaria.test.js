// Missões de parceiros dentro das Tasks Lendárias (tools/tasks.js + missoes-lendarias.json; antes tools/lendaria.*, #189):
// só 18+ e com a aba aberta, "teste" só no Modo Criador, selo de publicidade, rel sponsored, aviso de comissão no link do criador,
// "compra" não dá Ouro, fora da revelação 1 a 1, sem JSON = lista fixa intacta, progresso antigo de prog.lend copiado sem apagar.
// Rode com: python3 -m http.server 8000 & node qa/lendaria.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const MISSAO={'2026-11-26':[{q:'q1',xp:10}]};
const CFG=age=>({version:3,name:'Teste',startDate:'2026-11-01',profile:age==null?{}:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const P=(extra={})=>Object.assign({log:MISSAO,extra:{},velho:'fica',rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:0},ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}},extra);
const M=(o={})=>Object.assign({id:'parc1',teste:false,parceiro:'Parceiro Um',titulo:'Ative o bônus do Parceiro Um',ganho:'Bônus em pontos.',passos:['Criar conta','Ativar','Usar 1 vez'],link:'https://exemplo.com/a',regras:'https://exemplo.com/regras'},o);
const LS=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),k);
async function shut(p){for(let i=0;i<8;i++){const x=await p.evaluate(()=>{const m=document.querySelector('.sysmodal');if(!m)return null;const b=m.querySelector('button.go');if(b)b.click();else m.remove();return 1;});if(x==null)break;await p.waitForTimeout(120);}}
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,list,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference',serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];
  await p.route('**/missoes-lendarias.json',r=>list===null?r.fulfill({status:404,body:''}):r.fulfill({contentType:'application/json',body:JSON.stringify({missoes:list})}));
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate|Content Security Policy/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date('2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre,x,cr])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify(Object.assign({asked:1},x)));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');if(cr)localStorage.setItem('ascensao-sync','https://script.google.com/macros/s/teste/exec');},[cfg,prog,pre,o.tele||{},!!o.creator]);
  await p.goto(U+route);await p.waitForTimeout(1400);await shut(p);
  await p.evaluate(()=>{const b=document.querySelector('#tabbar [data-go="lenda"]');if(b)b.click();});await p.waitForTimeout(300);
  return {ctx,p,errs};}
const vis=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&!e.hidden&&e.getClientRects().length>0;},sel);
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  for(const [nm,age,o] of [['até 13','kid',{}],['14-17','teen',{}],['18+ com parent','young',{tele:{parent:1}}]].concat(route?[['sem idade (/comecar/)',null,{}]]:[])){
    let {ctx,p}=await open(route,pre,CFG(age),P(),[M()],o);ok(tag+' '+nm+': não vê missão de parceiro',!(await p.locator('text=Ative o bônus do Parceiro Um').count()));await ctx.close();}
  {let {ctx,p}=await open(route,pre,CFG('adult'),P({log:{}}),[M()]);ok(tag+' aba trancada (sem missão feita): parceiro não aparece',!(await vis(p,'#tpParc')));await ctx.close();}
  for(const [nm,list] of [['sem passos',[M({passos:[]})]],['link http',[M({link:'http://exemplo.com/'})]],['missão "teste" fora do Criador',[M({teste:true})]]]){
    let {ctx,p}=await open(route,pre,CFG('adult'),P(),list);ok(tag+' '+nm+': não aparece',!(await vis(p,'#tpParc')));await ctx.close();}
  // sem JSON: lista fixa intacta
  {let {ctx,p,errs}=await open(route,pre,CFG('adult'),P(),null);ok(tag+' sem o JSON: sem parceiros, Tasks Lendárias normais',!(await vis(p,'#tpParc'))&&(await p.locator('#tpPanel .tpm[data-tp="desapega"]').count())===1&&errs.length===0,errs.join('|'));await ctx.close();}
  let {ctx,p,errs}=await open(route,pre,CFG('adult'),P(),[M(),M({id:'parc2',titulo:'Cashback do Parceiro Dois',compra:true,passos:['Ativar e comprar']})]);
  const before=await p.$$eval('#tpPanel .tpm:not(.tpseal)',cs=>cs.length);
  ok(tag+' 2 parceiros no topo da aba, dentro do painel das Tasks Lendárias',await vis(p,'#tpPanel #tpParc')&&(await p.locator('#tpParc .tpm').count())===2);
  ok(tag+' parceiros não ocupam vaga da revelação (3 fixas + 2 parceiros)',before===5,String(before));
  const txt=await p.textContent('#tpParc');
  ok(tag+' selo "Publicidade · parceiro" visível sem abrir o card',await p.locator('#tpParc .tpad').first().isVisible()&&txt.includes('Publicidade · parceiro'));
  ok(tag+' sem aviso de comissão quando não é link do criador',!/comissão/.test(txt));
  await p.click('#tpParc .tpm[data-tp="p_parc1"] summary');await p.waitForTimeout(150);
  const a=await p.$eval('#tpParc .tpm[data-tp="p_parc1"] .tplink',e=>[e.href,e.target,e.rel]);
  ok(tag+' link do parceiro em aba nova com rel sponsored',a[0]==='https://exemplo.com/a'&&a[1]==='_blank'&&/sponsored/.test(a[2])&&/noopener/.test(a[2]),JSON.stringify(a));
  for(let i=0;i<3;i++){await p.click('#tpParc .tpm[data-tp="p_parc1"] .tpbtn[data-i="'+i+'"]');await p.waitForTimeout(150);}await shut(p);
  let st=await LS(p,pre+'-prog');ok(tag+' parceiro sem compra: 3/3 dá Ouro da raridade Lendária (+50) uma vez',st.ouro===50&&!!st.tp.p_parc1.f,JSON.stringify({o:st.ouro,tp:st.tp&&st.tp.p_parc1}));
  ok(tag+' concluir parceiro não revela task fixa nova',(await p.$$eval('#tpPanel > .tpm:not(.tpseal)',cs=>cs.length))===3);
  await p.click('#tpParc .tpm[data-tp="p_parc2"] summary');await p.waitForTimeout(150);await p.click('#tpParc .tpm[data-tp="p_parc2"] .tpbtn[data-i="0"]');await p.waitForTimeout(300);await shut(p);
  st=await LS(p,pre+'-prog');ok(tag+' parceiro com "compra": não dá Ouro (#196)',st.ouro===50&&!!st.tp.p_parc2.f&&/não dá Ouro/.test(await p.textContent('#tpParc .tpm[data-tp="p_parc2"]')),String(st.ouro));
  ok(tag+' dados antigos intactos',st.velho==='fica'&&st.rpg.cls.id==='mago');
  ok(tag+' console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // progresso do #189 (prog.lend) vira prog.tp sem apagar prog.lend
  ({ctx,p,errs}=await open(route,pre,CFG('adult'),P({lend:{parc1:{s:{0:'2026-11-26',1:'2026-11-26'}}}}),[M()]));
  st=await LS(p,pre+'-prog');ok(tag+' prog.lend antigo copiado para prog.tp e mantido',st.tp&&st.tp.p_parc1&&Object.keys(st.tp.p_parc1.s).length===2&&st.lend.parc1.s[0]==='2026-11-26'&&/2\/3/.test(await p.textContent('#tpParc')),JSON.stringify(st.tp&&st.tp.p_parc1));await ctx.close();
  for(const vp of [{width:320,height:640},{width:1280,height:800}]){({ctx,p,errs}=await open(route,pre,CFG('adult'),P(),[M()],{vp,rm:'reduce'}));
    await p.click('#tpParc summary');await p.waitForTimeout(150);
    ok(tag+' '+vp.width+'px + reduce-motion: sem rolagem lateral, toques de 44 px',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#tpParc .tpm[open] .tpbtn,#tpParc .tplink,#tpParc summary')].every(e=>e.getBoundingClientRect().height>=44))&&errs.length===0,errs.join('|'));await ctx.close();}
}
// Modo Criador (só na raiz): missão "teste" com aviso de teste e de comissão
{let {ctx,p}=await open('','ascensao',CFG('adult'),P(),[M({id:'cuponomia',teste:true,indicacao:true,compra:true,parceiro:'Cuponomia',titulo:'Ative o cashback da Cuponomia'})],{creator:true});
  const t=await p.textContent('#tpParc').catch(()=>'');
  ok('/ Modo Criador: missão "teste" aparece com "TESTE · só você vê"',t.includes('TESTE · só você vê')&&t.includes('Cuponomia'));
  await p.click('#tpParc summary');await p.waitForTimeout(150);
  ok('/ link de indicação do criador: aviso de comissão visível',(await p.textContent('#tpParc')).includes('o criador ganha uma comissão da Cuponomia'));await ctx.close();}
// arquivos do repositório
{const fs=require('fs');const j=JSON.parse(fs.readFileSync(__dirname+'/../missoes-lendarias.json','utf8'));const c=(j.missoes||[]).find(m=>m.id==='cuponomia');
  ok('repositório: Cuponomia só como teste, com compra (sem Ouro), aviso de indicação e https',!!c&&c.teste===true&&c.compra===true&&c.indicacao===true&&/^https:\/\//.test(c.link));
  ok('repositório: nenhuma missão aberta a todos com link de indicação',(j.missoes||[]).every(m=>m.teste===true||m.indicacao!==true));
  ok('repositório: tools/lendaria.* saiu (sem área duplicada)',!fs.existsSync(__dirname+'/../tools/lendaria.js')&&!/lendaria\.js/.test(fs.readFileSync(__dirname+'/../tools/gen.py','utf8')));}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
