// Os 3 números do JV (28/11): ativação, volta no D1/D7 e convites por jogador. Mesmo funil anônimo de tools/tele.js
// (só com opt-in, id aleatório, sem apelido; até 13 anos nada sai). E o resumo do Modo Criador mostra os 3 números.
// Rode com: python3 -m http.server 8000 & node qa/tres-numeros.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const TODAY='2026-11-28';const ago=n=>{const d=new Date(TODAY+'T12:00');d.setDate(d.getDate()-n);return d.toISOString().slice(0,10);};
const CFG=(age,start)=>({version:3,name:'Teste Silva',startDate:start,profile:{age},quests:[{id:'q1',title:'Ler 10 páginas',xp:10,stat:'mente',main:true}]});
let PROG=()=>({log:{},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},velho:'fica'});
(async()=>{const b=await chromium.launch();
async function run(age,start,tele,act){const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const posts=[],errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await ctx.route(/fonts/,r=>r.abort());await ctx.route('https://docs.google.com/**',r=>{if(r.request().method()==='POST')posts.push(new URLSearchParams(r.request().postData()).get('entry.807978446')||'');return r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nivel\n'});});
  await p.clock.install({time:new Date(TODAY+'T14:00:00')});await p.goto(U+'privacidade/');
  await p.evaluate(([c,g,t])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(g));if(t)localStorage.setItem('asc-u-tele',JSON.stringify(t));for(const k of ['asc-u-season','asc-u-perm','asc-u-intro','asc-u-news','asc-u-guide'])localStorage.setItem(k,'2');},[CFG(age,start),PROG(),tele]);
  await p.goto(U+'comecar/');await p.clock.runFor(4000);
  if(act)await act(p);
  await p.clock.runFor(16000);await p.reload();await p.clock.runFor(16000);
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));await ctx.close();
  const A=posts.filter(v=>v.startsWith('A|'));const n=s=>A.filter(v=>v.split('|')[2]===s).length;return {A,n,errs,st,posts};}
const OPT={on:true,asked:true,uid:'u1',nick:'Fulano'};
const feito=async p=>{await p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal'))m.remove();const s=document.getElementById('smSheet');if(s)s.hidden=true;});
  await p.locator('.quest[data-q="q1"] .btns .go').dispatchEvent('click');await p.clock.runFor(500);
  await p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal'))m.remove();const l=document.getElementById('levelup');if(l)l.hidden=true;});};
// dia 0: novo + ativou (1 vez só, mesmo recarregando)
let r=await run('18 a 29',TODAY,OPT,feito);
ok('D0: "9-novo" uma vez',r.n('9-novo')===1,r.A.join(' / '));
ok('D0: 1ª missão manda "10-ativou" uma vez',r.n('10-ativou')===1,r.A.join(' / '));
ok('D0: nada de D1/D7 no dia 0',!r.n('11-voltou-d1')&&!r.n('12-voltou-d7'));
ok('linhas anônimas (sem apelido nem uid)',r.A.every(v=>!v.includes('Fulano')&&!v.includes('|u1|')),r.A.join(' / '));
ok('progresso intacto',r.st.velho==='fica');ok('console limpo (D0)',!r.errs.length,r.errs.join(' | '));
// dia 1 e dia 7
r=await run('18 a 29',ago(1),OPT);ok('D1: "11-voltou-d1" uma vez',r.n('11-voltou-d1')===1&&!r.n('9-novo'),r.A.join(' / '));
r=await run('18 a 29',ago(7),OPT);ok('D7: "12-voltou-d7" uma vez',r.n('12-voltou-d7')===1&&!r.n('11-voltou-d1'),r.A.join(' / '));
// quem já jogava há 20 dias não vira "novo" nem "ativou"
r=await run('18 a 29',ago(20),OPT,feito);ok('jogador antigo: sem novo/ativou/D1/D7',!r.n('9-novo')&&!r.n('10-ativou')&&!r.n('11-voltou-d1')&&!r.n('12-voltou-d7'),r.A.join(' / '));
// convite conta (1 por dia)
r=await run('18 a 29',ago(3),OPT,async p=>{await p.evaluate(()=>{window.navigator.share=undefined;});
  await p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal'))m.remove();const t=document.querySelector('#tabbar [data-go="amigos"]');if(t)t.click();});await p.clock.runFor(800);
  await p.evaluate(()=>{const b=document.querySelector('#tmPanel button.tminv, #tmPanel .cdinvb');if(b)b.click();});await p.clock.runFor(500);});
ok('sem ranking não há convite, nada conta',r.n('13-convidou')===0,r.A.join(' / '));
{const PR=PROG;PROG=()=>Object.assign(PR(),{rank:{on:true,asked:true,uid:'jv123456',nick:'JV'}});
 r=await run('18 a 29',ago(3),OPT,async p=>{await p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal'))m.remove();const t=document.querySelector('#tabbar [data-go="amigos"]');if(t)t.click();});await p.clock.runFor(800);
   for(let i=0;i<2;i++){await p.evaluate(()=>{const b=document.querySelector('#tmPanel .cdlbtn button');if(b)b.click();});await p.clock.runFor(300);}});
 PROG=PR;ok('convite (copiar link) conta 1 vez no dia',r.n('13-convidou')===1,r.A.join(' / '));ok('convite: sem apelido na linha A',r.A.every(v=>!v.includes('JV')),r.A.join(' / '));}
// sem opt-in / criança: nada
r=await run('18 a 29',TODAY,{asked:true,on:false},feito);ok('sem opt-in: nenhuma linha A',r.A.length===0,r.A.join(' / '));
r=await run('kid',TODAY,OPT,feito);ok('até 13 anos: nenhuma linha A',r.A.length===0,r.A.join(' / '));
// --- Modo Criador: os 3 números a partir da aba funil ---
{const SYNC='https://script.google.com/macros/s/TESTE_sem_chave_real_0000000/exec';
 const C={version:3,name:'Criador',startDate:'2026-11-01',quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]};
 const PAINEL={ok:true,usuarios:[['apelido','entrada','último acesso'],['Ana','20261120','20261128']],
   funil:[['etapa','pessoas'],['2-abriu-navegador',30],['4-perfil',20],['9-novo',20],['10-ativou',13],['11-voltou-d1',9],['12-voltou-d7',4],['13-convidou',10]],feedback:[['data','apelido','nota']]};
 const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
 await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nivel\n'}));
 await ctx.route('https://script.google.com/**',r=>{const u=r.request().url();if(r.request().method()==='POST')return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});
   if(/[?&]k=/.test(u))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(PAINEL)});return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({config:C,progress:PROG()})});});
 await ctx.addInitScript(([c,o,s])=>{if(sessionStorage.getItem('seed'))return;sessionStorage.setItem('seed','1');localStorage.setItem('ascensao-cfg',JSON.stringify(c));localStorage.setItem('ascensao-prog',JSON.stringify(o));localStorage.setItem('ascensao-sync',s);
   localStorage.setItem('ascensao-painel',JSON.stringify({k:'chave_de_teste_1234567890abcd'}));localStorage.setItem('ascensao-season','2');},[C,PROG(),SYNC]);
 await p.clock.install({time:new Date(TODAY+'T14:00:00')});await p.goto(U);await p.waitForTimeout(1500);
 await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.remove()));await p.locator('#tabbar [data-go="criador"]').click();await p.waitForTimeout(1200);
 const tile=l=>p.evaluate(l=>{const t=[...document.querySelectorAll('#bpSum .bp3 .bptile')].find(x=>x.querySelector('span').textContent.startsWith(l));return t?t.querySelector('b').textContent:null;},l);
 ok('Criador: ativação 65% (13/20)',await tile('ativação')==='65%',await tile('ativação'));
 ok('Criador: D1 45%',await tile('voltaram no D1')==='45%',await tile('voltaram no D1'));
 ok('Criador: D7 20%',await tile('voltaram no D7')==='20%',await tile('voltaram no D7'));
 ok('Criador: 0,5 convite por jogador',await tile('convites por jogador')==='0,5',await tile('convites por jogador'));
 const fun=await p.evaluate(()=>[...document.querySelectorAll('#bpSum .bpfun .bpfrow span')].map(x=>x.textContent));
 ok('Criador: funil antigo segue sem as etapas novas',fun.includes('abriu-navegador')&&!fun.some(x=>/novo|ativou|voltou|convidou/.test(x)),JSON.stringify(fun));
 ok('Criador: sem rolagem lateral',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));ok('Criador: console limpo',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})().catch(e=>{console.error(e);process.exit(1)});
