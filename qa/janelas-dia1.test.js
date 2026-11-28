// Dia 1 calmo (QA dos 60 s, P1-1/P1-4/P1-5): celular de verdade (navigator.webdriver=false), iPhone SE 375x667.
// Cadastro pelo caminho real, 1ª missão concluída, 60 s de uso: no máximo 2 janelas extras e o 1º ▶ na primeira tela.
// Rode com: python3 -m http.server 8000 & node qa/janelas-dia1.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const NO=/^(Agora não|Depois|Fechar|Continuar|Entendi|OK|Ok|Pular|Mais tarde|Agora não, obrigado|×|✕)$/;
async function watch(p,seen,ms){for(let t=0;t<ms;t+=300){await p.clock.runFor(300);
  const r=await p.evaluate(NO=>{NO=new RegExp(NO);const out=[];
    for(const m of document.querySelectorAll('.sysmodal,#levelup,[aria-modal="true"]')){if(m.hidden||!m.getClientRects().length)continue;
      const key=(m.id||'')+'|'+(m.querySelector('h2,h3,.tag')||m).textContent.trim().slice(0,40);out.push(key);
      const bs=[...m.querySelectorAll('button')].filter(b=>b.getClientRects().length);const b=bs.find(b=>NO.test(b.textContent.trim()))||bs[bs.length-1];if(b)b.click();}
    return out;},NO.source);
  for(const k of r)seen.add(k);}}
(async()=>{const b=await chromium.launch();
for(const [tag,age,hr] of [['adulto',3,'10:00'],['14-17',2,'10:00'],['14-17 madrugada',2,'00:56'],['adulto madrugada',3,'00:56']]){
  const ctx=await b.newContext({viewport:{width:375,height:667},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));
  await ctx.route(/fonts/,r=>r.abort());await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,contentType:'text/csv',body:''}));
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.clock.install({time:new Date('2026-11-28T'+hr+':00')});
  await p.goto(U+'comecar/');await p.clock.runFor(500);await p.click('#q_perm');await p.fill('#q_name','Bia');await p.click('#q_n0');await p.clock.runFor(300);
  await p.click(`#q_age button:nth-child(${age})`);await p.clock.runFor(300);
  if(await p.locator('#q_occ button').count())await p.click('#q_occ button:nth-child(3)');await p.clock.runFor(300);
  for(let i=0;i<6&&!(await p.locator('#q_done:visible').count());i++){const s=p.locator('button:visible',{hasText:/Pular|Continuar|Sim/});if(await s.count())await s.first().click();await p.clock.runFor(300);}
  await p.click('#q_done');const seen=new Set();await watch(p,seen,3000);
  // P1-5: o 1º ▶ na primeira tela do SE
  await p.evaluate(()=>window.scrollTo(0,0));
  const y=await p.evaluate(()=>{const q=document.querySelector('.quest:not(.done):not(.qtlock) .btns .go');if(!q)return -1;const r=q.getBoundingClientRect();return Math.round(r.bottom+scrollY);});
  const sb=await p.evaluate(()=>{const e=document.getElementById('smBar');if(!e||!e.getClientRects().length)return -1;return Math.round(e.getBoundingClientRect().bottom+scrollY);});
  ok(tag+': barra do Sistema com Aceitar acima da barra de abas',sb>0&&sb<=602,String(sb));
  ok(tag+': 1º ▶ visível na 1ª tela do SE (fundo em '+y+' de 667)',y>0&&y<=667,String(y));
  const id=await p.evaluate(()=>{const q=document.querySelector('.quest:not(.done):not(.qtlock)');return q&&q.dataset.q;});
  await p.locator(`.quest[data-q="${id}"] .btns .go`).dispatchEvent('click');await watch(p,seen,57000);
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')||'{}'));
  ok(tag+': 1ª missão concluída',Object.values(st.log||{}).some(l=>l.some(e=>e.q===id)));
  const L=[...seen];ok(tag+': no máximo 2 janelas no 1º minuto ('+L.length+')',L.length<=2,L.join(' / '));
  ok(tag+': sem Classe nem Aviso diário no dia 1',!L.some(k=>/lembOffer|CLASSE|AVATAR|avatar/i.test(k)),L.join(' / '));
  ok(tag+': sem erro de JS',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log(`${R.length-f}/${R.length}`);process.exit(f?1:0);})().catch(e=>{console.error(e);process.exit(1);});
