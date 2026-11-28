// Tasks Lendárias (tools/tasks.*): aba própria só 18+, trancada até a 1ª missão, tasks se revelam uma a uma,
// 3 passos marcados pelo jogador, Ouro pela raridade uma vez por task, links oficiais, 1ª task concluída abre a Carteira
// (só no aparelho, fora do prog), meta do dia, nada de link do criador; raiz e /comecar/.
// Rode com: python3 -m http.server 8000 & node qa/tasks.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=age=>({version:3,name:'Teste',startDate:'2026-11-01',profile:age==null?{}:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const MISSAO={'2026-11-26':[{q:'q1',xp:10}]};
const P=(extra={})=>Object.assign({log:MISSAO,extra:{},velho:'fica',rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:0},ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}},extra);
const LS=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),k);
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date('2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre,x])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify(Object.assign({asked:1},x)));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[cfg,prog,pre,o.tele||{}]);
  await p.goto(U+route);await p.waitForTimeout(1300);
  await shut(p);
  if(o.tab!==false){await p.evaluate(()=>{const b=document.querySelector('#tabbar [data-go="lenda"]');if(b)b.click();});await p.waitForTimeout(300);}
  return {ctx,p,errs};}
const vis=p=>p.evaluate(()=>{const e=document.getElementById('tpPanel');return !!e&&!e.hidden&&e.getClientRects().length>0;});
const tabOn=p=>p.evaluate(()=>{const b=document.querySelector('#tabbar [data-go="lenda"]');return !!b&&!b.hidden&&b.getClientRects().length>0;});
// fecha as janelas do Sistema pelo botão (remover do DOM deixaria a fila do sysPop travada)
async function shut(p){let t='';for(let i=0;i<8;i++){const x=await p.evaluate(()=>{const m=document.querySelector('.sysmodal');if(!m)return null;const t=m.textContent;const b=m.querySelector('button.go');if(b)b.click();else m.remove();return t;});if(x==null)break;t+=x+' | ';await p.waitForTimeout(120);}return t;}
const pop=shut;
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  for(const [nm,age,o] of [['até 13','kid',{}],['14-17','teen',{}],['18+ com parent','young',{tele:{parent:1}}]].concat(route?[['sem idade (/comecar/)',null,{}]]:[])){
    let {ctx,p}=await open(route,pre,CFG(age),P(),o);
    ok(tag+' '+nm+': sem aba, sem painel e sem linha em Hoje',!(await tabOn(p))&&!(await vis(p))&&!(await p.locator('text=Tasks Lendárias').count())&&!(await p.evaluate(()=>{const l=document.getElementById('tpLine');return !!l&&!l.hidden;})));await ctx.close();}
  // 18+ sem nenhuma missão: aba trancada, com mistério
  let {ctx,p,errs}=await open(route,pre,CFG('adult'),P({log:{}}),{tab:false});
  await p.evaluate(()=>document.querySelector('#tabbar [data-go="hoje"]').click());await p.waitForTimeout(250);
  ok(tag+' 18+ sem missão: Hoje mostra a linha selada',await p.evaluate(()=>{const l=document.getElementById('tpLine');return !!l&&!l.hidden&&l.getClientRects().length>0&&/\?\?\?/.test(l.textContent)&&/Conclua 1 missão/.test(l.textContent);}));
  await p.click('#tpLine button');await p.waitForTimeout(300);
  ok(tag+' a linha leva à aba Lendárias trancada, sem nenhuma task à vista',await tabOn(p)&&await p.evaluate(()=>document.body.dataset.tab==='lenda'&&!!document.querySelector('#tpPanel .tpvault')&&!document.querySelector('#tpPanel .tpm')&&!document.querySelector('#tpPanel a')));
  ok(tag+' console limpo (trancada)',errs.length===0,errs.join(' | '));await ctx.close();
  // 18+ com 1 missão: aberta
  ({ctx,p,errs}=await open(route,pre,CFG('adult'),P()));
  ok(tag+' 18+: aba Lendárias aberta, 3 tasks reveladas e o resto selado',await vis(p)&&(await p.locator('#tpPanel .tpm[data-tp]').count())===3&&(await p.locator('#tpPanel .tpseal').count())>=15);
  ok(tag+' ordem: Desapega (cai hoje), Cashback, Maquininha',await p.evaluate(()=>[...document.querySelectorAll('#tpPanel .tpm[data-tp]')].map(e=>e.dataset.tp).join()==='desapega,cashback,mpago'&&/Cai hoje/.test(document.querySelector('#tpPanel .tpm[data-tp="desapega"] .tpwhen').textContent)));
  ok(tag+' cada card tem raridade, quanto paga e quando cai',await p.evaluate(()=>[...document.querySelectorAll('#tpPanel .tpm[data-tp]')].every(c=>c.querySelector('.tptier')&&/💰/.test(c.querySelector('.tpsub').textContent)&&c.querySelector('.tpwhen').textContent.length>8&&c.querySelectorAll('.tpbtn').length===3)));
  ok(tag+' selada não mostra nome nem link',await p.evaluate(()=>[...document.querySelectorAll('#tpPanel .tpseal')].every(s=>!s.querySelector('a')&&/\?\?\?/.test(s.textContent)&&!/Prolific|Outlier|Inter/.test(s.textContent))));
  ok(tag+' Carteira trancada até a 1ª task',!(await p.locator('#tpPanel .tpwallet').count())&&/Conclua 1 Task Lendária para abrir a Carteira/.test(await p.textContent('#tpPanel'))&&!(await p.locator('#tpPanel .tpgot').count()));
  const txt=await p.textContent('#tpPanel');
  ok(tag+' sem promessa de ganho',!/ganhe R\$|renda garantida|garantid/i.test(txt));
  ok(tag+' avisos de segurança e de regras',/Nunca entregue antes/.test(txt)&&/Proibido criar conta no lugar de outra pessoa/.test(txt));
  const hrefs=await p.$$eval('#tpPanel a',as=>as.map(a=>[a.href,a.target,a.rel]));
  ok(tag+' links só para páginas oficiais, sem parâmetro de indicação, em aba nova',hrefs.length===7&&hrefs.every(([h,t,r])=>/^https:\/\/(www\.)?(olx\.com\.br|facebook\.com|enjoei\.com\.br|cuponomia\.com\.br|meliuz\.com\.br|mercadopago\.com\.br|pagbank\.com\.br)\/[a-z\/]*$/.test(h)&&t==='_blank'&&/noopener/.test(r)),JSON.stringify(hrefs));
  // filtro de raridade
  await p.click('#tpPanel .tpchip.t-l');await p.waitForTimeout(150);
  ok(tag+' filtro Lendária mostra só lendárias',await p.evaluate(()=>[...document.querySelectorAll('#tpPanel .tpm')].every(e=>e.classList.contains('t-l'))&&document.querySelectorAll('#tpPanel .tpm[data-tp]').length===2));
  await p.click('#tpPanel .tpchip:not([class*="t-"])');await p.waitForTimeout(150);
  // Hoje: linha com o próximo passo; tocar abre a task
  await p.evaluate(()=>document.querySelector('#tabbar [data-go="hoje"]').click());await p.waitForTimeout(250);
  ok(tag+' Hoje: 1 linha com o próximo passo que paga',await p.evaluate(()=>{const l=document.getElementById('tpLine');return !!l&&!l.hidden&&l.getClientRects().length>0&&/Lendária · Desapega 1\/3/.test(l.textContent)&&!l.classList.contains('fold')&&l.getBoundingClientRect().height>=44;}));
  await p.click('#tpLine button');await p.waitForTimeout(400);
  ok(tag+' tocar na linha abre a aba com Desapega aberta',await p.evaluate(()=>{const c=document.querySelector('#tpPanel .tpm[data-tp="desapega"]');return document.body.dataset.tab==='lenda'&&!!c&&c.open&&c.getClientRects().length>0;}));
  // 2 de 3 passos: sem Ouro; 3º: +50 (Lendária), Carteira abre, nova task se revela
  for(let i=0;i<2;i++){await p.click('#tpPanel .tpm[data-tp="desapega"] .tpbtn[data-i="'+i+'"]');await p.waitForTimeout(120);}
  let st=await LS(p,pre+'-prog');ok(tag+' 2 de 3 passos: sem Ouro ainda',!(st.ouro>0)&&Object.keys(st.tp.desapega.s).length===2,JSON.stringify(st.tp));
  ok(tag+' a task continua aberta depois de marcar',await p.evaluate(()=>document.querySelector('#tpPanel .tpm[data-tp="desapega"]').open));
  await p.click('#tpPanel .tpm[data-tp="desapega"] .tpbtn[data-i="2"]');await p.waitForTimeout(300);
  const pp=await pop(p);
  st=await LS(p,pre+'-prog');ok(tag+' 3/3: +50 Ouro (Lendária) e task concluída',st.ouro===50&&!!st.tp.desapega.f,JSON.stringify({o:st.ouro,tp:st.tp}));
  ok(tag+' 1ª task concluída: aviso de Carteira desbloqueada e nova task revelada',/CARTEIRA DESBLOQUEADA/.test(pp)&&/nova task se revelou/.test(pp)&&!!st.tpwal&&(await p.locator('#tpPanel .tpm[data-tp]').count())===4&&!!(await p.locator('#tpPanel .tpm[data-tp="prolific"]').count()),pp);
  await p.click('#tpPanel .tpm[data-tp="desapega"] .tpbtn[data-i="2"]');await p.waitForTimeout(150);
  await p.click('#tpPanel .tpm[data-tp="desapega"] .tpbtn[data-i="2"]');await p.waitForTimeout(300);await pop(p);
  st=await LS(p,pre+'-prog');ok(tag+' desmarcar e marcar de novo não paga de novo',st.ouro===50,String(st.ouro));
  ok(tag+' dados antigos intactos',st.velho==='fica'&&st.rpg.cls.id==='mago');
  // Carteira
  ok(tag+' meta de hoje aparece com a Carteira',/Meta de hoje: seus primeiros R\$ 50/.test(await p.textContent('#tpPanel .tpmeta')));
  await p.click('#tpPanel .tpwallet summary');await p.waitForTimeout(100);
  await p.fill('#tpPanel .tpwallet .tpwf input','25,50');await p.click('#tpPanel .tpwallet .tpwadd');await p.waitForTimeout(250);
  const w=await LS(p,pre+'-real');st=await LS(p,pre+'-prog');
  ok(tag+' carteira anota fora do prog',Array.isArray(w)&&w.length===1&&w[0].v===25.5&&!JSON.stringify(st).includes('25.5'),JSON.stringify(w));
  ok(tag+' total aparece',/R\$ 25,50/.test(await p.textContent('#tpPanel .tpwallet')));
  await p.fill('#tpPanel .tpwallet .tpwf input','-3');await p.click('#tpPanel .tpwallet .tpwadd');await p.waitForTimeout(200);
  ok(tag+' valor inválido não entra',(await LS(p,pre+'-real')).length===1);
  ok(tag+' meta de hoje soma o anotado hoje',/Anotado hoje: R\$ 25,50 de R\$ 50,00/.test(await p.textContent('#tpPanel .tpmeta')));
  await p.evaluate(()=>{const c=document.querySelector('#tpPanel .tpm[data-tp="cashback"]');c.open=true;});await p.waitForTimeout(100);
  await p.fill('#tpPanel .tpm[data-tp="cashback"] .tpgot input','30');await p.click('#tpPanel .tpm[data-tp="cashback"] .tpgot .tpwadd');await p.waitForTimeout(250);
  const w2=await LS(p,pre+'-real');
  ok(tag+' "quanto ganhei" do card entra na Carteira com a origem certa e bate a meta',w2.length===2&&w2[0].src==='cashback'&&w2[0].v===30&&/Meta batida/.test(await p.textContent('#tpPanel .tpmeta')),JSON.stringify(w2));
  await p.evaluate(()=>{document.querySelector('#tpPanel .tpwallet').open=true;});await p.waitForTimeout(100);
  await p.click('#tpPanel .tpwclr');await p.waitForTimeout(100);await p.click('#tpPanel .tpwclr');await p.waitForTimeout(200);
  ok(tag+' apagar a carteira pede 2 toques e apaga',(await p.evaluate(k=>localStorage.getItem(k),pre+'-real'))===null);
  ok(tag+' console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  for(const vp of [{width:320,height:640},{width:1280,height:800}]){({ctx,p,errs}=await open(route,pre,CFG('adult'),P(),{vp,rm:'reduce'}));
    await p.click('#tpPanel .tpm[data-tp="mpago"] summary');await p.waitForTimeout(150);
    ok(tag+' '+vp.width+'px: sem rolagem lateral, toques de 44 px, barra com a aba',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#tpPanel .tpm[open] .tpbtn,#tpPanel .tplink,#tpPanel summary,#tpPanel .tpchip')].every(e=>e.getBoundingClientRect().height>=44))&&await tabOn(p)&&errs.length===0,errs.join('|'));await ctx.close();}
}
const src=require('fs').readFileSync(__dirname+'/../tools/tasks.js','utf8');
ok('repositório: nenhum link com código de indicação',!/[?&](ref|aff|indica|codigo|code|invite|convite)=/i.test(src));
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(f?f+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(f?1:0);})();
