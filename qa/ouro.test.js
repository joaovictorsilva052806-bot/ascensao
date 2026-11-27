// Ouro + Loja + Desafio Forja 30 + Hall da Fama (tools/ouro.*): ganho com chave única, teto 200/dia, nunca negativo,
// loja com confirmação em 2 toques, escudo até o máximo, texto fixo "não vale dinheiro", desafio 20 de 30 (10 min de timer,
// caminhada de 20 min, força até 4x/semana, "Senti dor, parei" conta), bônus de nível, Hall do aparelho, dados antigos intactos.
// Rode com: python3 -m http.server 8000 & node qa/ouro.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';const SP=require('os').tmpdir()+'/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'q2',title:'Beber água',xp:5,stat:'corpo',main:true},{id:'s_treino',title:'Mexer o corpo 20 min',xp:25,stat:'corpo',minTitle:'5 min'}]};
const E=(q,d,xp)=>({q,kind:'full',xp:xp||10,stat:'mente',bonus:0,t:d+'T10:00:00'});
const P=(extra={})=>Object.assign({log:{'2026-11-20':[E('q1','2026-11-20')]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{a_first:'2026-11-01'},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:999},velho:'fica',shield:{n:1,used:{},ms:{1:'antes'},chk:'2026-11-27'}},extra);
const FJ=(o={})=>Object.assign({ok:true,pt:1,pil:false,lv:{},last:{},ses:[{d:'2026-11-24',tipo:'B',min:30,r:0}],dias:[0,2,4]},o);
async function drain(p){for(let k=0;k<2;k++){for(let i=0;i<10;i++){const m=p.locator('.sysmodal:not(#orModal):not(#f30Walk) button.go');if(await m.count()){await m.first().dispatchEvent('click');await p.waitForTimeout(150);continue;}
  if(await p.locator('#levelup').isVisible()){await p.locator('#luClose').dispatchEvent('click');continue;}await p.waitForTimeout(250);if(!(await m.count()))break;}await p.waitForTimeout(500);}}
(async()=>{const b=await chromium.launch();
async function open(route,pre,prog,time,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference'});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.clock.install({time:new Date(time)});await p.goto(U+route+'__seed__');
  await p.evaluate(([c,o,pre])=>{localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');},[o.cfg||CFG,prog,pre]);
  await p.goto(U+route);await p.waitForTimeout(1200);await drain(p);return {ctx,p,errs};}
const LS=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
const tap=async(p,sel)=>{await p.locator(sel).first().dispatchEvent('click');await p.waitForTimeout(120);};
const T='2026-11-27',TT=T+'T10:00:00'; // sexta-feira (dia de treino padrão)
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  // A: perfil antigo sem Ouro. Fechar as 2 principais dá +10 uma vez só.
  let {ctx,p,errs}=await open(route,pre,P(),TT);
  let st=await LS(p,pre);ok(tag+' A: perfil antigo abre sem Ouro (pílula escondida)',!(await p.locator('#ouroPill').isVisible()));
  for(const id of ['q1','q2']){await p.locator('[data-q="'+id+'"] button.go').first().dispatchEvent('click');await p.waitForTimeout(250);await drain(p);}
  await p.waitForTimeout(900);st=await LS(p,pre);
  ok(tag+' A: dia completo = +10 de Ouro',st.ouro===10&&st.ouroX.got['dia:'+T]===T,JSON.stringify({o:st.ouro,x:st.ouroX,l:st.log[T]}));
  ok(tag+' A: pílula 🪙 10 aparece',await p.locator('#ouroPill').isVisible()&&(await p.textContent('#ouroPill')).includes('10'));
  await p.reload();await p.waitForTimeout(1600);await drain(p);st=await LS(p,pre);
  ok(tag+' A: recarregar não rende Ouro de novo (chave única)',st.ouro===10,String(st.ouro));
  ok(tag+' A: campos antigos intactos',st.velho==='fica'&&st.rpg.cls.id==='mago'&&st.log['2026-11-20'].length===1&&st.shield.n===1);
  ok(tag+' A: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // B: teto de 200 por dia; Ouro negativo vira 0; chefão +30 e semana sem quebrar +50
  const wk={};for(let d=16;d<=22;d++){const k='2026-11-'+d;wk[k]=[E('q1',k)];}
  wk['2026-11-23']=[E('q1','2026-11-23'),E('ach:tb:2026-11-23','2026-11-23',100)];
  ({ctx,p,errs}=await open(route,pre,P({log:wk,ouro:-5,ouroX:{t0:'2026-11-10',d:{},got:{},buy:{},h:[]}}),TT));await p.waitForTimeout(800);st=await LS(p,pre);
  ok(tag+' B: semana sem quebrar +50 e chefão +30 (saldo negativo vira 0)',st.ouro===80&&st.ouroX.got['sem:2026-11-16']&&st.ouroX.got['tb:2026-11-23'],JSON.stringify({o:st.ouro,g:st.ouroX&&st.ouroX.got}));
  await ctx.close();
  ({ctx,p,errs}=await open(route,pre,P({log:wk,ouro:0,ouroX:{t0:'2026-11-10',d:{[T]:195},got:{},buy:{},h:[]}}),TT));await p.waitForTimeout(800);st=await LS(p,pre);
  ok(tag+' B: teto de 200 no dia (só +5 entra, o resto tenta amanhã)',st.ouro===5&&st.ouroX.d[T]===200&&Object.keys(st.ouroX.got).length===1,JSON.stringify(st.ouroX));
  await ctx.close();
  // C: Loja: 2 toques para comprar, moldura vai para a coleção e entra em uso, escudo até o máximo, texto da lei
  ({ctx,p,errs}=await open(route,pre,P({ouro:400,ouroX:{t0:T,d:{},got:{},buy:{},h:[{d:T,v:400,w:'teste'}]}}),TT));
  await tap(p,'#ouroPill');ok(tag+' C: loja abre pela pílula',await p.locator('#orModal').isVisible()&&(await p.textContent('#orTitle')).includes('400'));
  ok(tag+' C: texto fixo "Ouro não vale dinheiro e não pode ser sacado."',(await p.textContent('#orModal')).includes('Ouro não vale dinheiro e não pode ser sacado.'));
  ok(tag+' C: janela acessível (dialog, foco dentro)',await p.evaluate(()=>{const m=document.getElementById('orModal');return m.getAttribute('aria-modal')==='true'&&m.contains(document.activeElement);}));
  await p.screenshot({path:SP+'ouro-loja-'+(route?'u':'r')+'.png'});
  await tap(p,'[data-or="o_f_gelo"]');st=await LS(p,pre);ok(tag+' C: 1º toque só pede confirmação',st.ouro===400&&(await p.textContent('[data-or="o_f_gelo"]')).includes('Confirmar'));
  await tap(p,'[data-or="o_f_gelo"]');st=await LS(p,pre);
  ok(tag+' C: compra debita 80 e equipa a moldura',st.ouro===320&&st.ouroX.buy.o_f_gelo&&st.chest.frames.includes('o_f_gelo')&&st.chest.frame==='o_f_gelo',JSON.stringify({o:st.ouro,c:st.chest}));
  await tap(p,'[data-or="o_f_gelo"]');await tap(p,'[data-or="o_f_gelo"]');st=await LS(p,pre);ok(tag+' C: item comprado não cobra de novo',st.ouro===320);
  await tap(p,'[data-or="o_esc"]');await tap(p,'[data-or="o_esc"]');st=await LS(p,pre);ok(tag+' C: escudo 150 → 2 escudos',st.ouro===170&&st.shield.n===2,JSON.stringify({o:st.ouro,s:st.shield}));
  ok(tag+' C: escudo no máximo fica travado',await p.locator('[data-or="o_esc"]').isDisabled());
  await tap(p,'[data-or="o_f_vazio"]');await tap(p,'[data-or="o_f_vazio"]');st=await LS(p,pre);ok(tag+' C: sem Ouro suficiente não compra (nunca negativo)',st.ouro===170&&!st.ouroX.buy.o_f_vazio);
  await tap(p,'[data-or="o_t_tes"]');await tap(p,'[data-or="o_t_tes"]');st=await LS(p,pre);ok(tag+' C: título raro entra na coleção e em uso',st.ouro===70&&st.chest.titles.some(t=>t.id==='o_t_tes')&&st.chest.title==='o_t_tes');
  await tap(p,'#orClose');ok(tag+' C: Esc/fechar some com a loja',!(await p.locator('#orModal').count()));
  ok(tag+' C: título aparece no topo',(await p.textContent('#bxTitle')).includes('Tesoureiro do Sistema'));
  await p.reload();await p.waitForTimeout(1200);await drain(p);
  ok(tag+' C: depois de recarregar a moldura continua aplicada',await p.evaluate(()=>document.body.dataset.bxf)==='o_f_gelo');
  ok(tag+' C: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // D: Desafio Forja 30: entra pelo card, Dia ruim com 11 min conta, menos de 10 min não conta
  ({ctx,p,errs}=await open(route,pre,P({forja:FJ()}),TT));
  ok(tag+' D: convite do desafio no card do Forja',(await p.textContent('#fjCard')).includes('Desafio Forja 30')&&await p.locator('#f30Join').count()===1);
  ok(tag+' D: regra 14-17 só no /comecar/ sem idade (conta como menor)',(await p.locator('.f30teen').count()>0)===!!route);
  await tap(p,'#f30Join');await drain(p);st=await LS(p,pre);ok(tag+' D: entrar grava prog.f30.s',st.f30&&st.f30.s===T&&st.f30.lv0===6,JSON.stringify(st.f30));
  await tap(p,'#fjRuim');for(let i=0;i<4;i++)await tap(p,'#fjSet');await p.clock.fastForward(11*60000);await tap(p,'#fjSet');await p.waitForTimeout(400);
  ok(tag+' D: tela final mostra o dia do desafio',(await p.textContent('#fjSheet')).includes('Desafio Forja 30: dia 1 de 20'),await p.textContent('#fjSheet'));
  st=await LS(p,pre);ok(tag+' D: dia contado como força (Dia ruim)',st.f30.d[T]==='r');
  await tap(p,'#fjClose');ok(tag+' D: card mostra 1/20',(await p.textContent('#fjCard')).includes('1/20'));
  await ctx.close();
  ({ctx,p,errs}=await open(route,pre,P({forja:FJ(),f30:{s:'2026-11-20',d:{},lv0:6}}),TT));
  await tap(p,'#fjRuim');for(let i=0;i<5;i++)await tap(p,'#fjSet');await p.waitForTimeout(400);st=await LS(p,pre);
  ok(tag+' D: treino de menos de 10 min não conta e explica',!st.f30.d[T]&&(await p.textContent('#fjSheet')).includes('Faltaram'));
  await tap(p,'#fjClose');await ctx.close();
  // E: força já contou 4x na semana → treino não conta; caminhada de 20 min conta
  const d4={'2026-11-23':'f','2026-11-24':'f','2026-11-25':'r','2026-11-26':'f'};
  ({ctx,p,errs}=await open(route,pre,P({forja:FJ(),f30:{s:'2026-11-20',d:Object.assign({},d4),lv0:6}}),TT));
  await tap(p,'#fjRuim');await p.clock.fastForward(11*60000);for(let i=0;i<5;i++)await tap(p,'#fjSet');await p.waitForTimeout(400);
  st=await LS(p,pre);ok(tag+' E: 5ª força na semana não conta',!st.f30.d[T]&&(await p.textContent('#fjSheet')).includes('4x nesta semana'));
  await tap(p,'#fjClose');await tap(p,'#f30WalkC');ok(tag+' E: caminhada abre com timer',await p.locator('#f30Walk').isVisible()&&await p.locator('#f30WGo').isDisabled());
  await tap(p,'#f30WMin');await p.clock.fastForward(20*60000+2000);await tap(p,'#f30WalkC');await p.waitForTimeout(1200);
  ok(tag+' E: depois de 20 min libera "Terminei" (tempo contou com a janela fechada)',!(await p.locator('#f30WGo').isDisabled()));
  await tap(p,'#f30WGo');st=await LS(p,pre);ok(tag+' E: caminhada conta o dia',st.f30.d[T]==='c'&&!st.f30.walk);
  ok(tag+' E: sequência com folgas (2 por semana)',(await p.textContent('#fjCard')).includes('Sequência: 5 dias'),await p.textContent('#fjCard'));
  await ctx.close();
  // F: "Senti dor, parei" no meio do treino conta o dia e mostra o aviso de segurança
  ({ctx,p,errs}=await open(route,pre,P({forja:FJ(),f30:{s:'2026-11-20',d:{},lv0:6}}),TT));
  await tap(p,'#fjStart');await tap(p,'#fjSet');await tap(p,'#f30Dor');await p.waitForTimeout(400);st=await LS(p,pre);
  ok(tag+' F: dor conta o dia e fecha o treino',st.f30.d[T]==='dor'&&!st.forja.cur&&!(await p.locator('#fjSheet').isVisible()));
  ok(tag+' F: aviso "Parou na hora certa" com o texto de segurança',await p.locator('.sysmodal').filter({hasText:'PAROU NA HORA CERTA'}).filter({hasText:'Pare na hora'}).count()===1);
  await ctx.close();
  // G: 19 dias + caminhada = desafio cumprido: título, +100, Hall do aparelho; bônus de nível (+50) uma vez
  const d19={};for(let i=0;i<19;i++){const x=new Date(2026,10,5+i);d19[x.toISOString().slice(0,10)]='c';}
  ({ctx,p,errs}=await open(route,pre,P({forja:FJ({lv:{push:2}}),f30:{s:'2026-11-05',d:d19,lv0:6}}),TT));await p.waitForTimeout(600);st=await LS(p,pre);
  ok(tag+' G: subiu 1 nível no mês = +50 e « Acima de Ontem »',st.ouro===50&&st.f30.lvb===1&&st.chest.titles.some(t=>t.id==='o_t_acima'),JSON.stringify({o:st.ouro,f:st.f30.lvb}));
  await drain(p);await tap(p,'#f30WalkC');await p.clock.fastForward(20*60000+2000);await p.waitForTimeout(1200);await tap(p,'#f30WGo');await p.waitForTimeout(800);
  ok(tag+' G: janela de desafio cumprido',await p.locator('.sysmodal').filter({hasText:'Cumprido: 20 dias'}).count()===1);
  await drain(p);st=await LS(p,pre);
  ok(tag+' G: +100 de Ouro, título « Forjado em 30 » e Hall',st.ouro===150&&st.f30.win===T&&st.chest.titles.some(t=>t.id==='o_t_f30')&&st.f30.hall.length===1,JSON.stringify({o:st.ouro,w:st.f30.win,h:st.f30.hall}));
  await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await p.waitForTimeout(500);
  ok(tag+' G: Hall da Fama em Progresso',await p.locator('#hlPanel').count()===1&&(await p.textContent('#hlPanel')).includes('Você · 20 dias'));
  await p.locator('#tabbar [data-go="hoje"]').dispatchEvent('click');await p.waitForTimeout(400);
  await p.reload();await p.waitForTimeout(1400);await drain(p);st=await LS(p,pre);ok(tag+' G: recarregar não paga de novo',st.ouro===150);
  ok(tag+' G: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // H: reduce-motion e 360 px
  ({ctx,p,errs}=await open(route,pre,P({ouro:120,ouroX:{t0:T,d:{},got:{},buy:{},h:[{d:T,v:120,w:'x'}]},forja:FJ(),f30:{s:'2026-11-20',d:d4,lv0:6}}),TT,{rm:'reduce',vp:{width:360,height:740}}));
  ok(tag+' H: 360 px sem rolagem lateral',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await tap(p,'#ouroPill');ok(tag+' H: reduce-motion: aviso de Ouro sem transição',await p.evaluate(()=>{const f=document.createElement('div');f.className='orfx';document.body.append(f);const t=getComputedStyle(f).transitionDuration;f.remove();return t==='0s';}));
  ok(tag+' H: loja cabe em 360 px',await p.evaluate(()=>{const c=document.querySelector('#orModal .orcard');return c&&c.getBoundingClientRect().right<=innerWidth+1&&document.documentElement.scrollWidth<=innerWidth+1;}));
  await p.screenshot({path:SP+'ouro-loja-360-'+(route?'u':'r')+'.png'});
  ok(tag+' H: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // I: desktop
  ({ctx,p,errs}=await open(route,pre,P({ouro:120,ouroX:{t0:T,d:{},got:{},buy:{},h:[{d:T,v:120,w:'x'}]},forja:FJ(),f30:{s:'2026-11-20',d:d4,lv0:6}}),TT,{vp:{width:1280,height:800}}));
  ok(tag+' I: desktop: pílula e card do desafio',await p.locator('#ouroPill').isVisible()&&(await p.textContent('#fjCard')).includes('4/20'));
  await p.screenshot({path:SP+'ouro-hoje-desk-'+(route?'u':'r')+'.png'});
  ok(tag+' I: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
}
// K: uma moeda só: moedas do Baú viram Ouro 1 vez, com backup antes, Baú resgata com Ouro e há caminho de volta
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  const lg={};for(let d=10;d<=20;d++){const k='2026-11-'+d;lg[k]=[E('q1',k,100)];} // 1100 XP = 110 moedas; gastou 30 → 80
  let {ctx,p,errs}=await open(route,pre,P({log:lg,ouro:20,ouroX:{t0:T,d:{},got:{},buy:{},h:[{d:T,v:20,w:'x'}]},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},spent:30,rew:[{t:'Episódio da série',c:50}]}}),TT);
  await p.waitForTimeout(800);const pop=await p.locator('.sysmodal').filter({hasText:'UMA MOEDA SÓ'}).count();await drain(p);let st=await LS(p,pre);
  const bk=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),pre+'-prog-preouro');
  const c=st.ouroX.mig&&st.ouroX.mig.c;
  ok(tag+' K: backup antes da migração (sem a marca da migração)',bk&&bk.rpg.spent===30&&!(bk.ouroX&&bk.ouroX.mig)&&bk.ouro===20);
  ok(tag+' K: moedas viraram Ouro 1 para 1 (no extrato)',c>=80&&st.ouro===20+c&&st.ouroX.h.some(h=>h.v===c&&/viraram Ouro/.test(h.w)),JSON.stringify({c,o:st.ouro,pop}));
  ok(tag+' K: nada apagado (spent e recompensas iguais)',st.rpg.spent===30&&st.rpg.rew.length===1&&st.velho==='fica');
  await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await p.waitForTimeout(400);
  ok(tag+' K: Baú mostra Ouro',(await p.textContent('#coins')).includes('de Ouro'),await p.textContent('#coins'));
  await p.locator('#chestList button.go').first().dispatchEvent('click');await p.waitForTimeout(400);await drain(p);st=await LS(p,pre);
  ok(tag+' K: resgatar desconta do Ouro',st.ouro===20+c-50&&st.rpg.spent===30,String(st.ouro));
  await p.reload();await p.waitForTimeout(1500);await drain(p);st=await LS(p,pre);ok(tag+' K: migração não repete',st.ouro===20+c-50);
  await p.locator('#tabbar [data-go="mais"]').dispatchEvent('click');await p.waitForTimeout(300);
  ok(tag+' K: caminho de volta em Mais',await p.locator('#orUnmerge').count()===1);
  await tap(p,'#orUnmerge');await tap(p,'#orUnmerge');st=await LS(p,pre);
  ok(tag+' K: voltar tira o Ouro migrado e o Baú volta às moedas',st.ouro===Math.max(0,20+c-50-c)&&st.ouroX.mig.off===T,JSON.stringify({o:st.ouro,m:st.ouroX.mig}));
  await p.locator('#tabbar [data-go="prog"]').dispatchEvent('click');await p.waitForTimeout(300);
  ok(tag+' K: Baú em moedas de novo',(await p.textContent('#coins')).includes('moeda'));
  ok(tag+' K: console limpo',errs.length===0,errs.join(' | '));await ctx.close();}
// J: menor de 14 não vê o desafio
{const cfg=Object.assign({},CFG,{profile:{age:'kid'}});let {ctx,p,errs}=await open('comecar/','asc-u',P({forja:FJ()}),TT,{cfg});
  ok('/comecar/ J: até 13 anos não vê o Desafio Forja 30',await p.locator('#fjCard').count()===0||!(await p.textContent('#fjCard')).includes('Desafio Forja 30'));await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log('\n'+(R.length-f)+'/'+R.length+' passaram');process.exit(f?1:0);})();
