// Ideia que vale bônus (tools/sug.*): código por ideia, moderação, 1 por dia, Ouro 1 vez quando o criador aceita,
// conquista secreta "Arquiteto do Sistema", créditos só 18+ e com consentimento, nada de campo antigo perdido; raiz e /comecar/.
// Rode com: python3 -m http.server 8000 & node qa/sug.test.js   (PORT=8001 para outra porta)
const {chromium}=require('playwright');const crypto=require('crypto');const U='http://localhost:'+(process.env.PORT||8000)+'/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG=age=>({version:3,name:'Teste Silva',startDate:'2026-11-01',profile:age==null?{}:{age},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true}]});
const CODE='S-ABCDEFGH',H=crypto.createHash('sha256').update(CODE).digest('hex');
const P=(extra={})=>Object.assign({log:{'2026-11-26':[{q:'q1',kind:'full',xp:10,stat:'mente',bonus:0,t:'x'}]},extra:{},velho:'fica',feedback:[{t:'ideia antiga sem código',d:'2026-11-20T12:00:00.000Z'}],rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:0},ouro:5,ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}},extra);
const LS=(p,k)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),k);
(async()=>{const b=await chromium.launch();
async function open(route,pre,cfg,prog,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},deviceScaleFactor:o.dsf||1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.addInitScript(()=>{window.__open=[];window.open=u=>{window.__open.push(String(u));return null;};});
  await ctx.route('**/sugestoes-aceitas.json*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(o.list||{aceitas:[]})}));
  if(o.block)await p.route(/script\.google|docs\.google/,r=>r.fulfill({body:'{}',contentType:'application/json'}));
  await p.clock.install({time:new Date('2026-11-27T10:00:00')});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre,x])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');for(const k in x)localStorage.setItem(k,x[k]);},[cfg,prog,pre,o.ls||{}]);
  await p.goto(U+route);await p.waitForTimeout(1300);const pops0=await shut(p);return {ctx,p,errs,pops0};}
async function shut(p){let t='';for(let i=0;i<8;i++){const x=await p.evaluate(()=>{const m=document.querySelector('.sysmodal');if(!m)return null;const t=m.textContent;const b=m.querySelector('button.go');if(b)b.click();else m.remove();return t;});if(x==null)break;t+=x+' | ';await p.waitForTimeout(150);}return t;}
const mais=p=>p.evaluate(()=>{document.querySelector('#tabbar [data-go="mais"]').click();const f=document.getElementById('fbPanel');if(f.classList.contains('fold')&&!f.classList.contains('open'))f.querySelector(':scope>.fhd').click();}).then(()=>p.waitForTimeout(250));
async function send(p,t){await p.fill('#fbText',t);await p.evaluate(()=>document.getElementById('fbSend').click());await p.waitForTimeout(150);return (await p.textContent('#fbMsg')).trim();}
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  let {ctx,p,errs}=await open(route,pre,CFG('adult'),P());await mais(p);
  ok(tag+' regra visível: 40 de Ouro, 1 por dia, sem link',await p.evaluate(()=>{const e=document.getElementById('sugRule');return !!e&&e.getClientRects().length>0&&/40 🪙 de Ouro/.test(e.textContent)&&/1 ideia por dia/.test(e.textContent);}));
  ok(tag+' 18+: opção de crédito com apelido aparece, campo só depois do aceite',await p.evaluate(()=>!document.getElementById('sugNkRow').hidden&&document.getElementById('sugNk').hidden));
  ok(tag+' moderação: link',/Tire o link/.test(await send(p,'olha esse site www.exemplo.com que legal')));
  ok(tag+' moderação: e-mail',/Tire o e-mail/.test(await send(p,'me chama no fulano@gmail.com por favor')));
  ok(tag+' moderação: telefone/CPF',/Tire telefone/.test(await send(p,'meu zap é (37) 99197-2904 me liga')));
  ok(tag+' moderação: curto demais',/pelo menos uma frase/.test(await send(p,'oi')));
  ok(tag+' nada foi salvo nem aberto nas recusas',(await LS(p,pre+'-prog')).feedback.length===1&&(await p.evaluate(()=>window.__open.length))===0);
  await p.check('#sugNkOk');await p.waitForTimeout(100);await p.fill('#sugNk','Lobo <b>');
  let m=await send(p,'Queria uma quest de beber água com lembrete');
  let pr=await LS(p,pre+'-prog');const it=pr.feedback[pr.feedback.length-1];
  ok(tag+' envio: código S-XXXXXXXX salvo na ideia',/^S-[A-Z2-9]{8}$/.test(it.c||''),JSON.stringify(it));
  ok(tag+' envio: apelido limpo e só com aceite',it.n==='Lobo b',it.n);
  const url=decodeURIComponent((await p.evaluate(()=>window.__open[0]))||'');
  ok(tag+' mensagem do WhatsApp leva o código e o crédito',url.includes('Código da ideia: '+it.c)&&url.includes('Crédito na lista de ideias: Lobo b'),url.slice(-120));
  ok(tag+' resposta diz o código e o prêmio',m.includes(it.c)&&/40 🪙/.test(m),m);
  ok(tag+' ideia antiga e campos antigos continuam',pr.feedback[0].t==='ideia antiga sem código'&&!pr.feedback[0].c&&pr.velho==='fica'&&pr.ouro===5);
  ok(tag+' "Suas ideias" mostra a ideia com o criador',await p.evaluate(c=>{const e=document.getElementById('sugMine');return !e.hidden&&e.textContent.includes(c)&&/Com o criador/.test(e.textContent);},it.c));
  ok(tag+' limite: 2ª ideia no mesmo dia é recusada',/já mandou 1 ideia/.test(await send(p,'Outra ideia boa para o app hoje mesmo')));
  ok(tag+' limite: nada novo salvo',(await LS(p,pre+'-prog')).feedback.length===2);
  await p.clock.setFixedTime(new Date('2026-11-28T10:00:00'));
  ok(tag+' dia seguinte: pode mandar de novo',/enviada/.test(await send(p,'Mais uma ideia no dia seguinte para o app')));
  ok(tag+' console limpo (envio)',errs.length===0,errs.join(' | '));await ctx.close();
  // menor: sem opção de crédito, sem apelido salvo
  ({ctx,p,errs}=await open(route,pre,CFG('teen'),P()));await mais(p);
  ok(tag+' 14-17: sem opção de crédito',await p.evaluate(()=>document.getElementById('sugNkRow').hidden));
  await send(p,'Uma ideia de menor de idade bem legal');pr=await LS(p,pre+'-prog');
  ok(tag+' 14-17: ideia com código e sem apelido',!!pr.feedback[1].c&&!('n' in pr.feedback[1]));await ctx.close();
  // ideia aceita: paga 1 vez, destrava o segredo, mostra a lista pública
  const list={aceitas:[{h:H,ouro:40,ideia:'Quest de beber água',credito:'Lobo',versao:'1.2'},{h:'zz',ouro:999},{h:'a'.repeat(64),ouro:5000}]};
  let pops0;({ctx,p,errs,pops0}=await open(route,pre,CFG('adult'),P({feedback:[{t:'ideia antiga',d:'2026-11-20T12:00:00.000Z'},{t:'água',d:'2026-11-25T12:00:00.000Z',c:CODE}]}),{list}));
  await p.waitForTimeout(3300);let pops=pops0+await shut(p);pr=await LS(p,pre+'-prog');
  ok(tag+' aceita: +40 de Ouro (5 → 45)',pr.ouro===45,String(pr.ouro));
  ok(tag+' aceita: janela "IDEIA ACEITA" e conquista Arquiteto do Sistema',/IDEIA ACEITA/.test(pops)&&/Arquiteto do Sistema/.test(pops)&&!!(pr.sec&&pr.sec.s_arq),pops.slice(0,200));
  ok(tag+' aceita: registrada em prog.sug.ok e no Ouro (sug:código)',!!pr.sug.ok[CODE]&&!!pr.ouroX.got['sug:'+CODE]);
  await mais(p);
  ok(tag+' "Suas ideias" marca que entrou no jogo',await p.evaluate(()=>/Entrou no jogo/.test(document.getElementById('sugMine').textContent)));
  ok(tag+' lista pública: ideia e crédito, sem lixo',await p.evaluate(()=>{const e=document.getElementById('sugHall');return !e.hidden&&/Quest de beber água · ideia de Lobo \(1\.2\)/.test(e.textContent)&&e.querySelectorAll('li').length===1;}));
  ok(tag+' segredos: contador inclui o novo segredo',/\/ 27$/.test((await p.textContent('#secCount')).trim()),await p.textContent('#secCount'));
  await p.reload();await p.waitForTimeout(3500);pops=await shut(p);pr=await LS(p,pre+'-prog');
  ok(tag+' recarregar não paga de novo',pr.ouro===45&&!/IDEIA ACEITA/.test(pops),String(pr.ouro));
  ok(tag+' console limpo (aceita)',errs.length===0,errs.join(' | '));await ctx.close();
  // celular: toques de 44 px
  ({ctx,p}=await open(route,pre,CFG('adult'),P()));await mais(p);
  ok(tag+' toques com 44 px (aceite do crédito e enviar)',await p.evaluate(()=>['#sugNkRow label','#fbSend'].every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.height>=44;})));await ctx.close();
}
// Modo Criador (só na raiz, com planilha ligada): gera a linha com o hash certo
{const {ctx,p,errs}=await open('','ascensao',CFG('adult'),P(),{block:true,ls:{'ascensao-sync':'https://script.google.com/macros/s/teste/exec'}});
  await p.evaluate(()=>{const b=document.querySelector('#tabbar [data-go="criador"]');if(b)b.click();});await p.waitForTimeout(400);
  const has=await p.evaluate(()=>!!document.getElementById('sugCr'));ok('/ Criador: ferramenta "Aceitar ideia" aparece',has);
  if(has){await p.fill('#sugCrIn','s-xxx');await p.click('#sugCrGo');await p.waitForTimeout(150);
    ok('/ Criador: código inválido é recusado',/inválido/.test(await p.textContent('#sugCrMsg'))&&await p.evaluate(()=>document.getElementById('sugCrOut').hidden));
    await p.fill('#sugCrIn',' s-abcdefgh ');await p.click('#sugCrGo');await p.waitForTimeout(300);
    const line=JSON.parse(await p.textContent('#sugCrOut'));ok('/ Criador: linha com o SHA-256 do código e 40 de Ouro',line.h===H&&line.ouro===40,JSON.stringify(line));}
  await ctx.close();
  const c2=await open('comecar/','asc-u',CFG('adult'),P());ok('/comecar/: jogador não tem a ferramenta do criador',!(await c2.p.evaluate(()=>!!document.getElementById('sugCr'))));await c2.ctx.close();}
if(process.env.SHOT){const {ctx,p}=await open('comecar/','asc-u',CFG('adult'),P({feedback:[{t:'água',d:'2026-11-25T12:00:00.000Z',c:CODE},{t:'b',d:'2026-11-26T12:00:00.000Z',c:'S-QWERTY23'}]}),{dsf:2,list:{aceitas:[{h:H,ouro:40,ideia:'Quest de beber água',credito:'Lobo',versao:'1.2'}]}});
  await p.waitForTimeout(3300);const pop=await p.$('.sysmodal');if(pop)await p.screenshot({path:process.env.SHOT+'-1-aceita.png'});await shut(p);await mais(p);
  await p.check('#sugNkOk');await p.evaluate(()=>document.getElementById('fbPanel').scrollIntoView({block:'start'}));await p.waitForTimeout(200);await p.screenshot({path:process.env.SHOT+'-2-painel.png'});await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${R.length-f}/${R.length} passaram`);process.exit(f?1:0);})();
