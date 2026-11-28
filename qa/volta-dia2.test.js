// Volta no dia 2 (retenção D1): quem fez 1 tarefa ontem e abre o app de manhã lê, na 1ª linha do Sistema,
// "Dia 2 em jogo: 1 tarefa e a sequência vira 2" + a missão mais rápida liberada, e o 🔥 fica aceso (não cinza).
// À noite vale o aviso de risco; depois de 1 tarefa a linha volta ao normal.
// Rode com: python3 -m http.server 8000 & node qa/volta-dia2.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const NO=/^(Agora não|Depois|Fechar|Continuar|Entendi|OK|Pular|Não, obrigado|Bora|Valeu, Sistema)$/;
async function close(p){for(let i=0;i<6;i++){const n=await p.evaluate(NO=>{NO=new RegExp(NO);let c=0;for(const m of document.querySelectorAll('.sysmodal,#levelup,[aria-modal="true"]')){if(m.hidden||!m.getClientRects().length)continue;const bs=[...m.querySelectorAll('button')].filter(b=>b.getClientRects().length);const b=bs.find(b=>NO.test(b.textContent.trim()))||bs[bs.length-1];if(b){b.click();c++;}}return c;},NO.source);if(!n)break;await p.clock.runFor(400);}}
const line=p=>p.evaluate(()=>{const e=document.getElementById('sysLine');return e?(e.dataset.t||e.textContent):'';});
const pill=p=>p.evaluate(()=>{const e=document.getElementById('streak');return e?{back:e.classList.contains('back'),risk:e.classList.contains('risk'),op:getComputedStyle(e).opacity,t:e.textContent}:null;});
(async()=>{const b=await chromium.launch();
for(const [tag,age] of [['adulto',3],['14-17',2]]){
const ctx=await b.newContext({viewport:{width:375,height:667},isMobile:true,hasTouch:true});
await ctx.route(/fonts/,r=>r.abort());await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,contentType:'text/csv',body:''}));
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.clock.install({time:new Date('2026-11-28T10:00:00')});
await p.goto(U+'comecar/');await p.clock.runFor(500);await p.click('#q_perm');await p.fill('#q_name','Bia');await p.click('#q_n0');await p.clock.runFor(300);
await p.click(`#q_age button:nth-child(${age})`);await p.clock.runFor(300);
if(await p.locator('#q_occ button').count())await p.click('#q_occ button:nth-child(3)');await p.clock.runFor(300);
for(let i=0;i<6&&!(await p.locator('#q_done:visible').count());i++){const s=p.locator('button:visible',{hasText:/Pular|Continuar|Sim/});if(await s.count())await s.first().click();await p.clock.runFor(300);}
await p.click('#q_done');await p.clock.runFor(1500);await close(p);
const id=await p.evaluate(()=>{const q=document.querySelector('.quest:not(.done):not(.qtlock) .btns .go');return q&&q.closest('.quest').dataset.q;});
await p.locator(`.quest[data-q="${id}"] .btns .go`).first().dispatchEvent('click');await p.clock.runFor(1500);await close(p);
ok(tag+': dia 1 sem a linha de volta',!/em jogo/.test(await line(p)),await line(p));
// dia 2, 9h
await p.clock.setSystemTime(new Date('2026-11-29T09:00:00'));await p.reload();await p.clock.runFor(2000);await close(p);await p.clock.runFor(600);
const l2=await line(p);ok(tag+': dia 2 de manhã: "Dia 2 em jogo"',/Bom dia, Bia\. 🔥 Dia 2 em jogo: 1 tarefa e a sequência vira 2\./.test(l2),l2);
const fast=await p.evaluate(()=>{const q=document.querySelector('.quest:not(.done):not(.qtlock)');return q?q.querySelector('.qt,.title,b,strong')?.textContent||q.textContent:'';});
ok(tag+': cita uma missão liberada ("Comece por:")',/Comece por: .+\.|Qualquer tarefa vale\./.test(l2)&&!/libera às/.test(l2),l2);
const pl=await pill(p);ok(tag+': 🔥 aceso (classe back, opacidade 1)',pl&&pl.back&&!pl.risk&&pl.op==='1',JSON.stringify(pl));
// à noite: risco vence
await p.clock.setSystemTime(new Date('2026-11-29T19:00:00'));await p.reload();await p.clock.runFor(2000);await close(p);await p.clock.runFor(600);
const l3=await line(p);const p3=await pill(p);ok(tag+': à noite vale o aviso de risco',/está em risco/.test(l3)&&p3.risk&&!p3.back,l3+' '+JSON.stringify(p3));
// fez 1 tarefa: linha normal, fogo sem back
await p.clock.setSystemTime(new Date('2026-11-29T10:00:00'));await p.reload();await p.clock.runFor(2000);await close(p);
const id2=await p.evaluate(()=>{const q=document.querySelector('.quest:not(.done):not(.qtlock) .btns .go');return q&&q.closest('.quest').dataset.q;});
await p.locator(`.quest[data-q="${id2}"] .btns .go`).first().dispatchEvent('click');await p.clock.runFor(1500);await close(p);await p.clock.runFor(600);
const l4=await line(p);const p4=await pill(p);ok(tag+': depois de 1 tarefa a linha volta ao normal',!/em jogo|em risco/.test(l4)&&!p4.back,l4+' '+JSON.stringify(p4));
ok(tag+': sem erro de JS',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(`${R.length-f}/${R.length}`);process.exit(f?1:0);})().catch(e=>{console.error(e);process.exit(1);});
