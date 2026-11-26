// Runa: d20 no baú, círculo rúnico no "Feito", anel de runas no Despertar (tools/rune.*). Só visual; reduce-motion desliga.
// Rode com: python3 tools/gen.py && python3 -m http.server 8000 & node qa/runa.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const BX=(rar)=>`(()=>{const m=document.createElement('div');m.className='sysmodal bxmodal';m.id='rnT';m.style.zIndex=999;m.innerHTML='<div class="card bxcard"><div class="tag">[ SISTEMA ] BAÚ</div><h3>Baú</h3><div class="bxout" hidden><div class="bxrar">${rar}</div><div class="bxxp">+40 XP</div></div><button class="go">Pegar</button></div>';document.body.append(m);m.querySelector('.bxout').hidden=false;})()`;
(async()=>{const b=await chromium.launch();
for(const [dev,vp] of [['iPhone',{width:390,height:844}],['Pixel7',{width:412,height:915}]])for(const rm of ['no-preference','reduce']){
  const ctx=await b.newContext({viewport:vp,reducedMotion:rm});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const tag=`${dev} ${rm}`;
  await p.goto(U+'comecar/');await p.waitForTimeout(600);
  ok(`${tag}: anel de runas no Despertar`,await p.evaluate(()=>document.querySelectorAll('#qPerm .hxorb .rn path').length>=10));
  for(const [rar,re] of [['Lendário',/^20$/],['Épico',/^(17|18|19)$/],['Raro',/^(13|14|15|16)$/],['',/^([6-9]|1[0-2])$/]]){
    await p.evaluate(BX(rar));await p.waitForTimeout(rm==='reduce'?100:1100);
    const r=await p.evaluate(()=>{const w=document.querySelector('#rnT .rnroll');const o=document.querySelector('#rnT .bxout');return {w:!!w,ah:w&&w.getAttribute('aria-hidden'),n:w&&w.querySelector('text').textContent,land:w&&w.classList.contains('land'),op:getComputedStyle(o).opacity,txt:o.textContent};});
    ok(`${tag}: d20 ${rar||'comum'} rola e para em ${re}`,r.w&&r.land&&re.test(r.n),JSON.stringify(r));
    ok(`${tag}: prêmio ${rar||'comum'} aparece intacto`,r.op==='1'&&/\+40 XP/.test(r.txt),JSON.stringify(r));ok(`${tag}: d20 aria-hidden`,r.ah==='true');
    await p.evaluate(()=>document.getElementById('rnT').remove());}
  ok(`${tag}: sem rolagem lateral`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  ok(`${tag}: sem erro de JS`,!errs.length,errs.join(' | '));await ctx.close();}
// "Feito" com o jogo montado: círculo rúnico (só sem reduce-motion) e quest marcada normalmente
for(const rm of ['no-preference','reduce']){const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(U+'comecar/');await p.waitForTimeout(400);await p.click('#q_perm');await p.fill('#q_name','Teste');await p.click('#q_n0');await p.waitForTimeout(250);
  await p.click('#q_age button:nth-child(3)');await p.waitForTimeout(250);await p.click('#q_occ button:nth-child(3)');await p.waitForTimeout(300);await p.click('#q_done');await p.waitForTimeout(2600);
  await p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal'))m.remove();const l=document.getElementById('levelup');if(l)l.hidden=true;});
  const id=await p.evaluate(()=>{const q=document.querySelector('.quest:not(.done):not(.qtlock)');return q&&q.dataset.q;});
  await p.locator(`.quest[data-q="${id}"] .btns .go`).dispatchEvent('click');await p.waitForTimeout(120);
  const c=await p.evaluate(()=>!!document.querySelector('.rncirc'));ok(`Feito ${rm}: círculo rúnico ${rm==='reduce'?'desligado':'aparece'}`,rm==='reduce'?!c:c);
  ok(`Feito ${rm}: quest concluída`,await p.evaluate(id=>{const k=Object.keys(localStorage).find(k=>/prog$/.test(k));const o=JSON.parse(localStorage.getItem(k)||'{}');return Object.values(o.log||{}).some(l=>l.some(e=>e.q===id));},id));
  ok(`Feito ${rm}: missão cumprida ganha selo`,await p.evaluate(id=>{const q=document.querySelector(`.quest.done[data-q="${id}"]`);return !!q&&getComputedStyle(q,'::after').content.includes('✓');},id));
  await p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal'))m.remove();const l=document.getElementById('levelup');if(l)l.hidden=false;});await p.waitForTimeout(150);
  ok(`Level up ${rm}: círculo mágico atrás do card`,await p.evaluate(()=>!!document.querySelector('#levelup .rnlv[aria-hidden=true]')));
  {let cl=false;for(let k=0;k<4&&!cl;k++){await p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal'))m.remove();});cl=await p.locator('#luClose').click({timeout:1500}).then(()=>true).catch(()=>false);}ok(`Level up ${rm}: Continuar clicável`,cl);}
  ok(`Level up ${rm}: sem rolagem lateral`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  ok(`Feito ${rm}: sem erro de JS`,!errs.length,errs.join(' | '));await ctx.close();}
{const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(U);await p.waitForTimeout(800);ok('raiz: sem erro de JS',!errs.length,errs.join(' | '));await ctx.close();}
await b.close();console.log(R.join('\n'));console.log(R.filter(x=>x.startsWith('PASS')).length+'/'+R.length);process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
