// Lembrete diário, fase 1 (recado da EVA 7203065684): o MOMENTO da oferta.
// A oferta "⏰ Quer que o Sistema te chame todo dia?" abre sozinha logo depois da 1ª tarefa do dia 1
// e mais uma vez no dia 2 (dias com tarefa de verdade). Nunca no dia 3+, nunca para quem já disse sim,
// nunca por cima de outra janela do Sistema. Raiz e /comecar/, 390x844, reduce-motion, progresso intacto.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/lembrete-momento.test.js
const {chromium}=require('playwright');const U=process.env.QA_URL||'http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const dk=o=>{const d=new Date();d.setDate(d.getDate()+o);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const CFG={version:3,name:'Teste',startDate:dk(-10),profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'q2',title:'Beber água',xp:5,stat:'corpo',main:true}]};
const E=(q,o)=>({q,kind:'full',xp:10,stat:'mente',bonus:0,t:dk(o)+'T10:00:00.000Z'});
const BASE=()=>({log:{},extra:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1,seen:{foco:1,vendas:1,mente:1,corpo:1}},simple:{off:'2026-11-01'},shield:{n:1},velho:'fica'});
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
async function drain(p){for(let i=0;i<12;i++){const m=p.locator('.sysmodal:visible:not(#lembOffer):not(#qaFake)').first();if(!(await m.count()))break;
    const g=m.locator('button.go');await (await g.count()?g.first():m.locator('button').first()).dispatchEvent('click');await p.waitForTimeout(250);}
  await p.evaluate(()=>{const l=document.getElementById('levelup');if(l)l.hidden=true;});}
async function abre(b,route,pre,prog,lemb){
  const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',isMobile:true,hasTouch:true});
  const p=await ctx.newPage();p.errs=[];
  p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))p.errs.push(m.text())});
  await p.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/,r=>r.abort());
  await p.goto(U+'privacidade/');
  await p.evaluate(([c,o,pre,l])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');
    if(l)localStorage.setItem(pre+'-lemb',JSON.stringify(l));
    for(const [k,v] of [['perm','1'],['intro','1'],['news','99'],['tele','{"asked":1}']])localStorage.setItem(pre+'-'+k,v);},[CFG,prog,pre,lemb||null]);
  await p.goto(U+route);await p.waitForTimeout(1200);await drain(p);
  await p.evaluate(()=>{for(const m of document.querySelectorAll('#tlModal'))m.remove();});
  await p.waitForTimeout(2200);await drain(p);
  return [ctx,p];}
const aberta=p=>p.evaluate(()=>{const m=document.getElementById('lembOffer');return !!m&&!!m.getClientRects().length;});
async function faz(p,id){await p.locator('.quest[data-q="'+id+'"] button.go').first().dispatchEvent('click');await p.waitForTimeout(1300);await drain(p);await p.waitForTimeout(800);await drain(p);await p.waitForTimeout(4500);}
const st=(p,pre)=>p.evaluate(pre=>({l:JSON.parse(localStorage.getItem(pre+'-lemb')||'{}'),t:localStorage.getItem(pre+'-systip'),pr:JSON.parse(localStorage.getItem(pre+'-prog')||'{}')}),pre);
(async()=>{const b=await chromium.launch();
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const r0=(route||'/')+' ';
  // 1) Dia 1: nada ao abrir; abre sozinha depois da 1ª tarefa; "Agora não" e não volta no mesmo dia
  {const [ctx,p]=await abre(b,route,pre,BASE());const tag=r0+'dia 1: ';
    ok(tag+'não abre só por abrir o app',!(await aberta(p)));
    await faz(p,'q1');
    ok(tag+'abre sozinha depois da 1ª tarefa',await aberta(p));
    ok(tag+'é a oferta com chips de horário',(await p.locator('#lembOffer .lembchip').count())===5);
    let s=await st(p,pre);ok(tag+'marca que já ofereceu no dia 1 (chave própria)',s.l.a&&s.l.a['1']===dk(0),JSON.stringify(s.l));
    await p.locator('#lembNo').click();await p.waitForTimeout(300);
    ok(tag+'"Agora não" fecha',!(await aberta(p)));
    await faz(p,'q2');ok(tag+'2ª tarefa não reabre',!(await aberta(p)));
    await p.reload();await p.waitForTimeout(1200);await drain(p);await p.waitForTimeout(2800);
    ok(tag+'recarregar não reabre',!(await aberta(p)));
    s=await st(p,pre);ok(tag+'cartão do aviso fica respondido ("0")',s.t==='0',String(s.t));
    ok(tag+'progresso intacto e sem campo novo',s.pr.velho==='fica'&&s.pr.rpg.cls.id==='mago'&&!('lemb' in s.pr)&&(s.pr.log[dk(0)]||[]).length>=2,JSON.stringify(s.pr).slice(0,160));
    ok(tag+'console sem erro',!p.errs.length,p.errs.join(' | '));await ctx.close();}
  // 2) Dia 2 (disse "agora não" ontem): nada ao abrir; 1ª tarefa de hoje → abre 1 vez; aceitar grava "sim"
  {const pr=BASE();pr.log[dk(-1)]=[E('q1',-1)];const [ctx,p]=await abre(b,route,pre,pr,{r:'nao',t:dk(-1),a:{1:dk(-1)}});const tag=r0+'dia 2: ';
    ok(tag+'não abre antes da tarefa',!(await aberta(p)));
    await faz(p,'q1');ok(tag+'abre depois da 1ª tarefa de hoje',await aberta(p));
    await p.locator('#lembOffer .lembchip',{hasText:'21h'}).click();
    const dl=p.waitForEvent('download',{timeout:5000}).catch(()=>null);await p.locator('#lembAdd').click();await dl;await p.waitForTimeout(300);
    const s=await st(p,pre);ok(tag+'aceitou: grava sim e 21h',s.l.r==='sim'&&s.l.h==='21:00'&&s.l.a['2']===dk(0),JSON.stringify(s.l));
    ok(tag+'cartão do aviso fica respondido ("1")',s.t==='1',String(s.t));
    await faz(p,'q2');ok(tag+'não reabre depois',!(await aberta(p)));
    ok(tag+'console sem erro',!p.errs.length,p.errs.join(' | '));await ctx.close();}
  // 3) Dia 2 já oferecido hoje: não repete
  {const pr=BASE();pr.log[dk(-1)]=[E('q1',-1)];const [ctx,p]=await abre(b,route,pre,pr,{r:'nao',t:dk(0),a:{1:dk(-1),2:dk(0)}});const tag=r0+'dia 2 já ofertado: ';
    await faz(p,'q1');ok(tag+'não abre de novo',!(await aberta(p)));await ctx.close();}
  // 4) Dia 3+: nunca sozinha (só pelo cartão ou por Mais > Lembretes)
  {const pr=BASE();pr.log[dk(-3)]=[E('q1',-3)];pr.log[dk(-1)]=[E('q2',-1)];const [ctx,p]=await abre(b,route,pre,pr,{r:'nao',t:dk(-1),a:{1:dk(-3),2:dk(-1)}});const tag=r0+'dia 3: ';
    await faz(p,'q1');ok(tag+'não abre sozinha',!(await aberta(p)));
    const pr2=BASE();pr2.log[dk(-5)]=[E('q1',-5)];pr2.log[dk(-2)]=[E('q1',-2)];await ctx.close();
    const [c2,p2]=await abre(b,route,pre,pr2);await faz(p2,'q1');ok(r0+'veterano sem registro (dia 3): não abre',!(await aberta(p2)));await c2.close();}
  // 5) Quem já disse sim não vê a oferta sozinha
  {const [ctx,p]=await abre(b,route,pre,BASE(),{h:'19:00',r:'sim',t:dk(-1)});await faz(p,'q1');ok(r0+'já disse sim: não abre',!(await aberta(p)));await ctx.close();}
  // 6) Só check-in/conquista não conta como tarefa; e espera outra janela do Sistema fechar
  {const pr=BASE();pr.log[dk(0)]=[{q:'q_checkin',kind:'full',xp:5,stat:'foco',bonus:0,t:dk(0)+'T08:00:00.000Z'}];
    const [ctx,p]=await abre(b,route,pre,pr);const tag=r0+'janela aberta: ';
    ok(r0+'check-in sozinho não dispara',!(await aberta(p)));
    await p.evaluate(()=>{const m=document.createElement('div');m.className='sysmodal';m.id='qaFake';m.style.cssText='position:fixed;inset:0;z-index:5';m.textContent='x';document.body.append(m);});
    await p.locator('.quest[data-q="q1"] button.go').first().dispatchEvent('click');await p.waitForTimeout(3200);
    ok(tag+'não abre por cima de outra janela',!(await aberta(p)));
    await p.evaluate(()=>document.getElementById('qaFake').remove());await p.waitForTimeout(4000);
    ok(tag+'abre quando a janela fecha',await aberta(p));
    ok(tag+'reduce-motion: a janela não anima',await p.evaluate(()=>getComputedStyle(document.querySelector('#lembOffer .card')).animationName==='none'));
    ok(tag+'console sem erro',!p.errs.length,p.errs.join(' | '));await ctx.close();}
}
await b.close();console.log(R.join('\n'));const f=R.filter(r=>r.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length+' passaram');process.exit(f?1:0);})();
