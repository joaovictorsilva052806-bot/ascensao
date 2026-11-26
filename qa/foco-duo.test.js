// Foco em dupla: convite pelo canal K (fd-HHMM), aceite (fda-), início sozinho no horário, "terminei" (fdk-) e +10 XP para os dois, uma vez.
// Rode com: python3 -m http.server 8000 & node qa/foco-duo.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste Silva',startDate:'2026-11-20',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 20 páginas',xp:10,stat:'mente',main:true}]};
const HD='nome,xp,nivel,,tipo,a,b,s,d,,pnick,seq,dz,av,at\n';
const csv=(soc=[])=>HD+[['Bia',60,2],['Teste',40,1]].map(r=>r.join(',')).join('\n')+'\n'+soc.map(s=>',,,,'+s.join(',')).join('\n')+'\n';
const base=()=>({log:{'2026-11-24':[{q:'q1',kind:'full',xp:10,stat:'mente'}]},extra:{},energy:{'2026-11-25':'media'},rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},rank:{on:true,asked:true,uid:'abc12345'},friends:{l:['Bia'],pend:{},seen:{}},velho:'fica'});
async function drain(p){for(let k=0;k<2;k++){for(let i=0;i<10;i++){const m=p.locator('.sysmodal:not([hidden]) button.go');if(!(await m.count()))break;await m.first().dispatchEvent('click');await p.waitForTimeout(150);}await p.waitForTimeout(500);}}
const HID=()=>{window.__hid=false;Object.defineProperty(document,'hidden',{get:()=>window.__hid,configurable:true});};
const poke=p=>p.evaluate(()=>{window.__hid=true;document.dispatchEvent(new Event('visibilitychange'));window.__hid=false;document.dispatchEvent(new Event('visibilitychange'));});
const P=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
(async()=>{const b=await chromium.launch();
async function open(body0){const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(HID);const p=await ctx.newPage();const errs=[],posts=[];let body=body0||csv();
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_/.test(m.text()))errs.push(m.text())});
  await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await ctx.route('https://docs.google.com/**',r=>{if(r.request().method()==='POST'){posts.push(decodeURIComponent((r.request().postData()||'').replace(/\+/g,' ')));return r.fulfill({status:200,body:''});}return r.fulfill({status:200,contentType:'text/csv',body});});
  await p.clock.install({time:new Date('2026-11-25T14:00:00')});await p.goto(U+'comecar/');
  await p.evaluate(([c,g])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(g));for(const k of ['asc-u-season','asc-u-perm','asc-u-intro'])localStorage.setItem(k,k.endsWith('season')?'2':'1');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));},[CFG,base()]);
  await p.reload();await p.waitForTimeout(1500);await drain(p);return {ctx,p,errs,posts,set:v=>{body=v;}};}
// A) quem convida
let {ctx,p,errs,posts,set}=await open();
await p.locator('#tabbar [data-go="foco"]').dispatchEvent('click');await p.waitForTimeout(300);
ok('botão 🤝 Em dupla na aba Foco',await p.locator('#fzTop .fdgo').count()===1);
await p.locator('#fzTop .fdgo').dispatchEvent('click');await p.waitForTimeout(150);
ok('escolha do amigo com o horário',/Quem foca com você/.test(await p.textContent('#fdSheet'))&&/às 14:0\d/.test(await p.textContent('#fdSheet')));
await p.locator('#fdSheet .duochips button',{hasText:'Bia'}).dispatchEvent('click');await p.waitForTimeout(200);
const HM=(await P(p)).fd.hm;const at=new Date('2026-11-25T'+HM.slice(0,2)+':'+HM.slice(2)+':00').getTime();
ok('convite sai no canal K',posts.some(x=>x.includes('K|Teste|Bia|fd-'+HM+'|20261125')),posts.filter(x=>x.includes('K|')).join(' / '));
set(csv([['K','Bia','Teste','fda-'+HM,'20261125']]));await poke(p);await p.waitForTimeout(900);
let st=await P(p);ok('aceite da Bia chega',st.fd&&st.fd.s==='on'&&st.fd.w==='Bia',JSON.stringify(st.fd));
await p.clock.runFor(Math.max(0,at-await p.evaluate(()=>Date.now()))+6000);await p.waitForTimeout(300);st=await P(p);
ok('no horário o bloco começa sozinho',st.focus&&st.focus.end&&st.focus.fd===1&&await p.isVisible('#froom'),JSON.stringify(st.focus));
ok('contagem compartilhada na sala',/Bia/.test(await p.textContent('#fdBadge')));
await p.screenshot({path:'qa/shots-foco-dupla.png'});
await p.clock.runFor(25*60000+3000);await p.waitForTimeout(600);st=await P(p);
ok('terminou: avisa a Bia',posts.some(x=>x.includes('K|Teste|Bia|fdk-'+HM)));ok('ainda sem bônus (falta a Bia)',!(st.log['2026-11-25']||[]).some(e=>e.q==='fd:2026-11-25'));
await p.evaluate(()=>{const r=document.getElementById('fzRef');if(r)r.hidden=true;});
set(csv([['K','Bia','Teste','fda-'+HM,'20261125'],['K','Bia','Teste','fdk-'+HM,'20261125'],['K','Cadu','Teste','fdk-'+HM,'20261125']]));await poke(p);await p.waitForTimeout(900);
st=await P(p);ok('os dois terminaram: +10 XP uma vez',(st.log['2026-11-25']||[]).filter(e=>e.q==='fd:2026-11-25'&&e.xp===10).length===1,JSON.stringify(st.fd));
await poke(p);await p.waitForTimeout(800);st=await P(p);ok('não paga de novo',(st.log['2026-11-25']||[]).filter(e=>e.q==='fd:2026-11-25').length===1);
ok('dado antigo intacto',st.velho==='fica'&&st.friends.l[0]==='Bia');ok('console limpo (convida)',!errs.length,errs.join(' | '));await ctx.close();
// B) quem recebe
({ctx,p,errs,posts,set}=await open(csv([['K','Bia','Teste','fd-1410','20261125'],['K','Zé','Teste','fd-1415','20261125']])));
await poke(p);await p.waitForTimeout(900);
ok('convite da amiga aparece',await p.isVisible('#fdSheet')&&/Bia te chamou/.test(await p.textContent('#fdSheet'))&&/14:10/.test(await p.textContent('#fdSheet')));
await p.locator('#fdSheet .smgo').dispatchEvent('click');await p.waitForTimeout(200);st=await P(p);
ok('aceite sai no canal K',posts.some(x=>x.includes('K|Teste|Bia|fda-1410')));ok('combinado salvo',st.fd.w==='Bia'&&st.fd.s==='on'&&st.fd.hm==='1410');
await poke(p);await p.waitForTimeout(600);ok('quem não é amigo não chama',!/Zé/.test(await p.textContent('#fdSheet')));
ok('console limpo (recebe)',!errs.length,errs.join(' | '));await ctx.close();
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})();
