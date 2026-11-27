// Missão Criador, fase 2 (tools/cm.*): aba Progresso para todos (raiz e /comecar/), mesmas regras. Até 13 anos e sem idade no /comecar/: sem foto.
// 1 etapa por dia, XP 20/20/30/40/60, Ouro +60 pelo teto do dia (sem espaço tenta amanhã), foto nunca no progresso nem na planilha,
// troca de tema 1x por semana, filtro de telefone/e-mail/endereço, virada da semana vai para o histórico, título aos 4 e moldura aos 10.
// Rode com: python3 -m http.server 8000 & node qa/cm.test.js
const {chromium}=require('playwright');const path=require('path');const U=process.env.U||'http://localhost:8000/';const SP=process.env.SHOTS||'/tmp/';
const R=[];let TAG='';const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+TAG+n+(x&&!c?' · '+x:''));
const SYNC='https://script.google.com/macros/s/TESTE_sem_chave_real_0000000/exec';
const CFG={version:3,name:'Criador',startDate:'2026-11-01',profile:{age:'young'},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]};
const PROG={log:{},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1,seen:{foco:1,vendas:1,mente:1,corpo:1}},simple:{off:'2026-11-01'},velho:'fica',
  ouroX:{t0:'2026-11-01',d:{},got:{},buy:{},h:[],mig:{d:'2026-11-01',c:0}}};
const L60='Muitas salas da escola do bairro têm ventilador quebrado e janelas que não abrem direito.';
(async()=>{const b=await chromium.launch();let posts=[];let route='',pre='ascensao',tag='/';
async function open(time,ls,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nivel\n'}));
  await ctx.route('https://script.google.com/**',r=>{if(r.request().method()==='POST'){posts.push(r.request().postData()||'');return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});}
    return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({config:CFG})});});
  await ctx.addInitScript(ls=>{if(sessionStorage.getItem('seed'))return;sessionStorage.setItem('seed','1');for(const k in ls)localStorage.setItem(k,ls[k]);},ls);
  await p.clock.install({time:new Date(time)});await p.goto(U+route);await p.waitForTimeout(1500);
  for(let i=0;i<6;i++){const g=p.locator('.sysmodal button.ghost, .sysmodal .go');if(await g.count()&&await g.first().isVisible())await g.first().dispatchEvent('click');await p.waitForTimeout(150);}
  await p.evaluate(()=>{document.querySelectorAll('.sysmodal').forEach(m=>m.remove());const l=document.getElementById('levelup');if(l)l.hidden=true;});
  await p.locator('#tabbar [data-go="prog"]').click();await p.waitForTimeout(300);
  await p.evaluate(()=>{const s=document.getElementById('cmPanel');if(s&&s.classList.contains('fold')&&!s.classList.contains('open'))s.firstElementChild.click();});await p.waitForTimeout(250);return {ctx,p,errs};}
const dump=p=>p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k);}return o;});
const prog=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
const clean=async p=>{await p.evaluate(()=>{document.querySelectorAll('.sysmodal').forEach(m=>m.remove());const l=document.getElementById('levelup');if(l)l.hidden=true;});};
const chip=(p,t)=>p.locator('#cmBox .cmchip',{hasText:t}).first().dispatchEvent('click');
const go=async p=>{await p.locator('#cmBox .cmgo').dispatchEvent('click');await p.waitForTimeout(300);await clean(p);};
const xpOf=(st,k)=>{for(const d in st.log)for(const e of st.log[d])if(e.q===k)return e.xp;return 0;};
async function run(){posts=[];
let ls={[pre+'-cfg']:JSON.stringify(CFG),[pre+'-prog']:JSON.stringify(PROG),[pre+'-season']:'2','asc-u-perm':'1','asc-u-intro':'1'};if(!route)ls['ascensao-sync']=SYNC;
// ---- dia 1 (sex 27/11/2026, semana 2026-W48 → tema 8 = Escola) ----
let {ctx,p,errs}=await open('2026-11-27T10:00:00',ls);
ok('aparece na aba Progresso',await p.locator('#cmPanel #cmBox').isVisible());
let t=await p.textContent('#cmPanel');
ok('cartão com tema da semana do ano (W48 → 🏫 Escola) e etapa 1 de 5',t.includes('🏫 Escola e estudo')&&t.includes('etapa 1 de 5'),t.slice(0,120));
ok('aviso fixo de privacidade',t.includes('Não marque ninguém, não mostre rosto e não diga onde a pessoa mora.'));
await p.locator('#cmBox textarea').fill('curto');await go(p);
ok('descrição curta sem foto: recusa',(await p.textContent('#cmBox .cmerr')||'').includes('30'));
await p.locator('#cmBox textarea').fill('Na rua da escola, liga pro 11 98765-4321 para saber mais do problema');await go(p);
ok('telefone no texto: recusa',(await p.textContent('#cmBox .cmerr')||'').includes('telefone'));
// troca de tema 1x
await p.locator('#cmBox .link',{hasText:'Trocar tema'}).dispatchEvent('click');await p.locator('#cmBox .cmchip',{hasText:'Moradia'}).dispatchEvent('click');await p.waitForTimeout(200);
let st=await prog(p);ok('troca de tema grava tema 0 e troca=true',st.cm.tema===0&&st.cm.troca===true,JSON.stringify(st.cm&&{t:st.cm.tema,x:st.cm.troca}));
ok('depois da troca, não oferece trocar de novo',!(await p.locator('#cmBox .link',{hasText:'Trocar tema'}).count()));
// foto + texto
await p.setInputFiles('#cmFile',path.join(__dirname,'..','icon-512.png'));await p.waitForSelector('#cmBox .cmprev:not([hidden])',{timeout:15000});
await p.locator('#cmBox textarea').fill('Casa da esquina sem reboco e com a laje exposta.');await go(p);
ok('foto sem confirmar "sem rosto": recusa',(await p.textContent('#cmBox .cmerr')||'').includes('rosto'));
await p.locator('#cmSafe').evaluate(e=>{e.checked=true});await go(p);await p.waitForTimeout(1200);
st=await prog(p);let all=await dump(p);
ok('etapa 1 salva com img=true e +20 XP',st.cm.s[1]&&st.cm.s[1].img===true&&xpOf(st,'cm:2026-W48:1')===20,JSON.stringify(st.cm.s));
ok('foto fica em '+pre+'-cm-foto, no aparelho',/^data:image\/jpeg/.test((JSON.parse(all[pre+'-cm-foto']||'{}'))['2026-W48']||''));
ok('foto NÃO está no progresso',!/data:image/.test(all[pre+'-prog']));
ok('foto NÃO sai do aparelho (nenhum POST com imagem)',!posts.some(x=>/data:image|base64/.test(x)),'posts='+posts.length);
if(!route)ok('planilha do criador recebe o prog.cm (sem foto)',posts.some(x=>x.includes('"cm"')&&x.includes('2026-W48')));
t=await p.textContent('#cmPanel');ok('mesmo dia: etapa 2 bloqueada até amanhã',t.includes('libera amanhã')&&!(await p.locator('#cmBox form').count()));
await p.screenshot({path:SP+'cm-1-etapa-feita.png'});
ok('console limpo (dia 1)',errs.length===0,errs.join(' | '));ls=await dump(p);await ctx.close();
// ---- dia 2: medir ----
({ctx,p,errs}=await open('2026-11-28T09:00:00',ls));
ok('dia seguinte: etapa 2 liberada',(await p.textContent('#cmPanel')).includes('Etapa 2 · Medir'));
await p.fill('#cmN','abc');await p.fill('#cmU','casas');await chip(p,'Contei');await go(p);
ok('número inválido: recusa',(await p.textContent('#cmBox .cmerr')||'').includes('número'));
await p.fill('#cmN','7');await go(p);st=await prog(p);
ok('etapa 2 salva (n=7, u, f) e +20 XP',st.cm.s[2]&&st.cm.s[2].n===7&&st.cm.s[2].f==='contei'&&xpOf(st,'cm:2026-W48:2')===20,JSON.stringify(st.cm.s[2]));
ls=await dump(p);await ctx.close();
// ---- dia 3 (dom 29/11): gargalo; endereço recusado ----
({ctx,p,errs}=await open('2026-11-29T09:00:00',ls));
await chip(p,'Dinheiro');await p.locator('#cmBox textarea').fill('A família da Rua das Flores, 120 não tem dinheiro para o reboco.');await go(p);
ok('endereço no texto: recusa',(await p.textContent('#cmBox .cmerr')||'').includes('endereço'));
await p.locator('#cmBox textarea').fill('Reboco custa caro e ninguém junta os vizinhos para comprar junto.');await go(p);st=await prog(p);
ok('etapa 3 salva e +30 XP',st.cm.s[3]&&st.cm.s[3].cat==='dinheiro'&&xpOf(st,'cm:2026-W48:3')===30);
ls=await dump(p);await ctx.close();
// ---- segunda 30/11: semana vira, a anterior (3/5) vai para o histórico sem texto livre ----
({ctx,p,errs}=await open('2026-11-30T09:00:00',ls));st=await prog(p);all=await dump(p);
const h0=st.cm.hist[0]||{};
ok('virada da semana: histórico com 3/5, tema, gargalo, número',st.cm.wk==='2026-W49'&&h0.wk==='2026-W48'&&h0.ok===false&&h0.cat==='dinheiro'&&h0.n===7&&h0.tema===0,JSON.stringify(st.cm));
ok('histórico sem texto livre',!/reboco|vizinhos|laje/.test(JSON.stringify(st.cm.hist)));
ok('semana nova: etapas zeradas, troca liberada, tema W49 (9 = Idosos)',Object.keys(st.cm.s).length===0&&st.cm.troca===false&&st.cm.tema===8);
ok('miniatura da semana fechada continua no aparelho',!!JSON.parse(all[pre+'-cm-foto']||'{}')['2026-W48']);
ok('campos antigos intactos',st.velho==='fica'&&st.rpg.cls.id==='mago');
ls=await dump(p);await ctx.close();
// ---- semana completa em 5 dias; no 5º dia o teto do Ouro está cheio: paga no dia seguinte ----
const days=['2026-11-30','2026-12-01','2026-12-02','2026-12-03','2026-12-04'];
for(let i=0;i<5;i++){
  if(i===4){const pr=JSON.parse(ls[pre+'-prog']);pr.ouroX.d['2026-12-04']=200;ls[pre+'-prog']=JSON.stringify(pr);}
  ({ctx,p,errs}=await open(days[i]+'T09:00:00',ls));const n=i+1;
  if(n===1)await p.locator('#cmBox textarea').fill('Calçada da praça com degrau alto e sem rampa nenhuma para cadeira.');
  if(n===2){await p.fill('#cmN','3');await p.fill('#cmU','degraus');await chip(p,'Medi');}
  if(n===3){await chip(p,'Organização');await p.locator('#cmBox textarea').fill('Ninguém sabe a quem pedir a rampa na subprefeitura.');}
  if(n===4){await p.locator('#cmBox textarea').fill('Juntar 3 vizinhos, medir a calçada e mandar o pedido de rampa pelo site da prefeitura com fotos.');await chip(p,'Política');await chip(p,'Zero');}
  if(n===5){await p.locator('#cmBox textarea').fill('Ela disse que uma rampa já ajudava muito.');await go(p);
    ok('etapa 5 sem o aceite da pessoa: recusa',(await p.textContent('#cmBox .cmerr')||'').includes('concordando'));await p.locator('#cmOkP').evaluate(e=>{e.checked=true});}
  await go(p);st=await prog(p);
  if(n===5){ok('semana completa: 170 XP no total',[1,2,3,4,5].reduce((a,k)=>a+xpOf(st,'cm:2026-W49:'+k),0)===170);
    ok('teto do dia cheio: Ouro não entra hoje e a chave fica livre',!st.ouro&&!st.ouroX.got['cm:2026-W49'],JSON.stringify({o:st.ouro,g:st.ouroX.got}));
    t=await p.textContent('#cmPanel');ok('fecho da semana na tela',t.includes('É assim que se começa a resolver o mundo.')&&t.includes('5/5'));
    await p.screenshot({path:SP+'cm-2-semana-completa.png'});}
  ok('console limpo (W49 dia '+n+')',errs.length===0,errs.join(' | '));ls=await dump(p);await ctx.close();}
({ctx,p,errs}=await open('2026-12-05T09:00:00',ls));st=await prog(p);
ok('dia seguinte: +60 de Ouro pela semana completa',st.ouro===60&&!!st.ouroX.got['cm:2026-W49'],String(st.ouro));
await p.reload();await p.waitForTimeout(1200);st=await prog(p);ok('recarregar não paga de novo',st.ouro===60,String(st.ouro));
ls=await dump(p);await ctx.close();
// ---- voltar ao mesmo problema (W50) com número novo + 4ª semana completa: +20 e título ----
{const pr=JSON.parse(ls[pre+'-prog']);pr.cm.hist=pr.cm.hist.concat([{wk:'2026-W40',tema:1,cat:'lei',tipo:'politica',ok:true,n:30,u:'dias'},{wk:'2026-W39',tema:2,cat:'tecnica',tipo:'engenharia',ok:true,n:12,u:'horas'}]);ls[pre+'-prog']=JSON.stringify(pr);}
const d50=['2026-12-07','2026-12-08','2026-12-09','2026-12-10','2026-12-11'];
for(let i=0;i<5;i++){({ctx,p,errs}=await open(d50[i]+'T09:00:00',ls));const n=i+1;
  if(n===1){await p.locator('#cmBox .link',{hasText:'Voltar a um problema'}).dispatchEvent('click');await p.locator('#cmBox .cmchip',{hasText:'Idosos'}).dispatchEvent('click');await p.waitForTimeout(200);
    ok('voltar ao problema: marca v2of',(await prog(p)).cm.v2of==='2026-W49');await p.locator('#cmBox textarea').fill('Voltei à calçada da praça para ver se mudou alguma coisa.');}
  if(n===2){await p.fill('#cmN','2');await p.fill('#cmU','degraus');await chip(p,'Medi');}
  if(n===3){await chip(p,'Organização');await p.locator('#cmBox textarea').fill('O pedido entrou mas ainda espera a vistoria da prefeitura.');}
  if(n===4){await p.locator('#cmBox textarea').fill('Levar o protocolo para a associação de moradores e cobrar a vistoria em grupo, com a medição.');await chip(p,'Política');await chip(p,'Zero');}
  if(n===5){await p.locator('#cmBox textarea').fill('Ele achou boa a ideia de ir em grupo.');await p.locator('#cmOkP').evaluate(e=>{e.checked=true});}
  await go(p);await p.waitForTimeout(400);ls=await dump(p);if(n<5)await ctx.close();}
st=await prog(p);
ok('número novo no mesmo problema: +60 +20 de Ouro',st.ouro===140&&!!st.ouroX.got['cm2:2026-W50'],String(st.ouro));
ok('4 semanas completas: título "Arquiteto do Mundo" na coleção',(st.chest&&st.chest.titles||[]).some(x=>x.id==='cm_t_arq'),JSON.stringify(st.chest&&st.chest.titles));
ok('título não vem do baú nem custa Ouro (ouro intacto)',st.ouro===140);
ok('console limpo (W50)',errs.length===0,errs.join(' | '));await ctx.close();
// ---- 10 semanas: moldura ----
{const pr=JSON.parse(ls[pre+'-prog']);for(let w=30;w<36;w++)pr.cm.hist.push({wk:'2026-W'+w,tema:w%10,cat:'',tipo:'',ok:true});ls[pre+'-prog']=JSON.stringify(pr);}
({ctx,p,errs}=await open('2026-12-12T09:00:00',ls));st=await prog(p);
ok('10 semanas completas: moldura "Planta Baixa"',(st.chest.frames||[]).includes('cm_f_planta'));await ctx.close();
// ---- 360 px + reduce-motion: sem rolagem lateral e sem pulso ----
for(const vp of [{width:360,height:740},{width:1280,height:800}]){({ctx,p,errs}=await open('2026-12-14T09:00:00',ls,{vp,rm:'reduce'}));
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);ok(vp.width+'px: sem rolagem lateral',ov<=0,String(ov));
  const an=await p.evaluate(()=>{const d=document.querySelector('#cmBox .cmdot.now');return d?getComputedStyle(d).animationName:'none';});ok(vp.width+'px reduce-motion: sem animação',an==='none',an);
  const small=await p.evaluate(()=>[...document.querySelectorAll('#cmBox button,#cmBox .cmchip')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().height<44).map(e=>e.textContent.slice(0,20)));
  ok(vp.width+'px: alvos de toque ≥ 44 px',small.length===0,small.join(','));
  if(vp.width===360)await p.screenshot({path:SP+'cm-3-360.png'});
  ok(vp.width+'px: console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
}
for([route,pre] of [['','ascensao'],['comecar/','asc-u']]){TAG=(route?'/comecar/':'/')+' ';await run();}
TAG='';
// ---- foto: até 13 anos e sem idade no /comecar/ não têm foto; faz a missão só com texto ----
for(const [nm,rt,px,age] of [['até 13 (/comecar/)','comecar/','asc-u','kid'],['sem idade (/comecar/)','comecar/','asc-u',null],['14-17 (/comecar/)','comecar/','asc-u','teen'],['até 13 (raiz)','','ascensao','kid']]){
  route=rt;pre=px;const c=Object.assign({},CFG,{profile:age?{age}:{}});
  const ls={[px+'-cfg']:JSON.stringify(c),[px+'-prog']:JSON.stringify(PROG),[px+'-season']:'2','asc-u-perm':'1','asc-u-intro':'1'};
  const {ctx,p,errs}=await open('2026-11-27T10:00:00',ls);const has=await p.locator('#cmFile').count();
  ok(nm+(age==='teen'?': tem foto':': sem foto, só texto'),age==='teen'?has===1:has===0);
  if(age!=='teen'){await p.locator('#cmBox textarea').fill('A quadra da escola fica sem luz à noite e ninguém consegue jogar.');await go(p);const st=await prog(p);
    ok(nm+': etapa 1 só com texto funciona',st.cm.s[1]&&!st.cm.s[1].img);}
  ok(nm+': console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
// ---- antes do perfil: a missão não aparece ----
{route='comecar/';pre='asc-u';const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();await p.goto(U+'comecar/');await p.waitForTimeout(1200);
  ok('/comecar/ sem perfil: sem Missão Criador',!(await p.locator('#cmPanel').isVisible().catch(()=>false)));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log('\n'+(R.length-f)+'/'+R.length+' passaram');process.exit(f?1:0);})().catch(e=>{console.log(R.join('\n'));console.log('ERRO: '+e.message.split('\n')[0]);process.exit(1);});
