// Checklist da EVA (issue #22), item 3: amigos e avatar abrem, salvam e reabrem sem perder dados,
// nada apaga campo antigo, console limpo e acessível. Raiz e /comecar/, celular 390x844.
// Rode com: python3 -m http.server 8000 --bind 127.0.0.1 & node qa/amigos-avatar.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const CFG={version:3,name:'Teste',startDate:'2026-11-01',profile:{age:'adult'},quests:[{id:'q1',title:'Ler 10 min',xp:10,stat:'mente',main:true},{id:'q2',title:'Treinar',xp:20,stat:'corpo',main:true}]};
const PROG=()=>({log:{'2026-11-25':[{q:'q1',kind:'full',xp:10,stat:'mente',bonus:0,t:'2026-11-25T10:00:00'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},
  ach:{a_first:'2026-11-01'},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1},simple:{off:'2026-11-01'},velho:'fica',
  rank:{on:true,nick:'Teste'},friends:{l:['Ana'],pend:{Bia:'2026-11-25'},seen:{'f:zed':1},extraAntigo:7}});
process.on('unhandledRejection',e=>{console.log(R.join('\n'));console.log('ERRO',String(e.message).split('\n')[0]);process.exit(1);});
(async()=>{const b=await chromium.launch();
async function open(route,pre,seed){const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
  await p.clock.install({time:new Date('2026-11-26T10:00:00')});await p.goto(U+route);
  if(seed)await p.evaluate(([c,o,pre])=>{localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem(pre+'-tele',JSON.stringify({asked:'2026-11-01'}));},[CFG,PROG(),pre]);
  await p.reload();await p.waitForTimeout(1200);await calm(p);return {ctx,p,errs};}
// fecha avisos do Sistema sem tocar no aceite do painel do criador
async function calm(p){let quiet=0;for(let i=0;i<30&&quiet<4;i++){await p.evaluate(()=>{const t=document.getElementById('tlModal');if(t){const g=t.querySelector('button.ghost');g?g.click():t.remove();}});
  const m=p.locator('.sysmodal:not(.avmk):not(#tlModal) button.go');if(await m.count()){quiet=0;await m.first().dispatchEvent('click');await p.waitForTimeout(150);continue;}
  if(await p.locator('#levelup').isVisible().catch(()=>false)){quiet=0;await p.locator('#luClose').dispatchEvent('click');continue;}quiet++;await p.waitForTimeout(250);}}
const LS=(p,pre)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),pre+'-prog');
const tab=(p,t)=>p.evaluate(t=>{const x=document.querySelector('#tabbar [data-go="'+t+'"]');if(x)x.click();},t);
// todo botão/campo visível no recorte tem nome acessível
const noName=(p,sel)=>p.evaluate(sel=>[...document.querySelectorAll(sel+' button,'+sel+' input,'+sel+' [role=button],'+sel+' [role=tab]')].filter(e=>e.getClientRects().length)
  .filter(e=>!((e.getAttribute('aria-label')||'').trim()||(e.textContent||'').trim()||(e.title||'').trim()||(e.placeholder||'').trim()||(e.labels&&e.labels.length))).map(e=>e.outerHTML.slice(0,80)),sel);
const keep=(st,tag,what)=>ok(tag+' '+what+': campos antigos intactos',st.velho==='fica'&&st.log['2026-11-25']&&st.rpg.cls.id==='mago'&&st.ach.a_first&&st.friends.extraAntigo===7&&st.friends.seen['f:zed']===1&&st.rank.nick==='Teste',JSON.stringify(st).slice(0,200));
for(const [route,pre] of [['comecar/','asc-u'],['','ascensao']]){const tag=route?'/comecar/':'/';
  let {ctx,p,errs}=await open(route,pre,true);
  // ---------- AVATAR ----------
  await tab(p,'prog');await p.waitForTimeout(300);
  ok(tag+' avatar: painel em Progresso',await p.locator('#avPanel').isVisible());
  await p.locator('#avPanel button.go').click();await p.waitForTimeout(300);
  const mk=p.locator('.avmk');ok(tag+' avatar: criador abre como diálogo',await mk.count()===1&&await mk.getAttribute('role')==='dialog'&&await mk.getAttribute('aria-modal')==='true'&&!!(await mk.getAttribute('aria-label')));
  ok(tag+' avatar: abas com role=tab e uma selecionada',await p.locator('.avmk [role=tab]').count()===4&&await p.locator('.avmk [role=tab][aria-selected=true]').count()===1);
  ok(tag+' avatar: todos os botões com nome',(await noName(p,'.avmk')).length===0,(await noName(p,'.avmk')).join(' | '));
  await p.locator('.avmk .avtab[data-t="cabelo"]').click();
  const hair=p.locator('.avmk .avpane[data-t="cabelo"] .avrow').first().locator('button[data-i="3"]');await hair.click();
  ok(tag+' avatar: escolha marcada (aria-pressed)',await hair.getAttribute('aria-pressed')==='true');
  await p.locator('.avmk .avtab[data-t="rosto"]').click();await p.locator('.avmk .avpane[data-t="rosto"] .avrow').nth(5).locator('button[data-i="2"]').click();
  await p.locator('.avmk button.go').click();await p.waitForTimeout(400);
  let st=await LS(p,pre);ok(tag+' avatar: salvo no aparelho',st.avatar&&st.avatar.h===3&&st.avatar.mo===2&&st.avatar.ok===1,JSON.stringify(st.avatar));
  ok(tag+' avatar: criador fechou',await p.locator('.avmk').count()===0);keep(st,tag,'avatar');
  // reabrir depois de recarregar: continua igual
  await p.reload();await p.waitForTimeout(1200);await calm(p);await tab(p,'prog');await p.waitForTimeout(300);
  st=await LS(p,pre);ok(tag+' avatar: sobrevive ao recarregar',st.avatar.h===3&&st.avatar.mo===2&&st.avatar.ok===1,JSON.stringify(st.avatar));
  await p.locator('#avPanel button.go').click();await p.waitForTimeout(300);await p.locator('.avmk .avtab[data-t="cabelo"]').click();
  ok(tag+' avatar: reabre com a escolha salva',await p.locator('.avmk .avpane[data-t="cabelo"] .avrow').first().locator('button[data-i="3"]').getAttribute('aria-pressed')==='true');
  // cancelar desfaz só o que mudou agora
  await p.locator('.avmk .avpane[data-t="cabelo"] .avrow').first().locator('button[data-i="5"]').click();await p.locator('.avmk button.link').click();await p.waitForTimeout(300);
  st=await LS(p,pre);ok(tag+' avatar: cancelar volta ao salvo',st.avatar.h===3&&await p.locator('.avmk').count()===0,JSON.stringify(st.avatar));
  // o avatar aparece no topo de Hoje
  await tab(p,'hoje');await p.waitForTimeout(300);ok(tag+' avatar: no topo de Hoje com nome',await p.locator('#heroAv svg.av').count()===1&&!!(await p.locator('#heroAv').getAttribute('aria-label')));
  // ---------- AMIGOS ----------
  await tab(p,'amigos');await p.waitForTimeout(400);const fp=p.locator('#frPanel');
  // painéis recolhidos de Amigos: o título continua sendo botão depois de redesenhar (antes virava caixa vazia)
  for(const id of ['frPanel','sqPanel']){const h=p.locator('#'+id+'>.fhd');ok(tag+' '+id+': título é botão com aria-expanded',await h.count()===1&&await h.getAttribute('role')==='button'&&await h.getAttribute('aria-expanded')==='false'&&(await h.textContent()).trim().length>0);}
  await p.locator('#frPanel>.fhd').click();await p.waitForTimeout(300);
  ok(tag+' amigos: toque no título abre',await p.locator('#frPanel>.fhd').getAttribute('aria-expanded')==='true'&&await fp.locator('button.go',{hasText:'Adicionar amigo'}).isVisible());
  ok(tag+' amigos: painel abre',await fp.isVisible());
  ok(tag+' amigos: lista com você e Ana (dados)',(await fp.locator('.frlist li').count())===2&&(await fp.textContent()).includes('Ana'),await fp.textContent());
  await p.locator('#tmPanel .tmseg button[data-v="turma"]').click();await p.waitForTimeout(300);
  ok(tag+' amigos: Ana na turma',(await p.locator('#tmPanel .tmlist').textContent()).includes('Ana'),await p.locator('#tmPanel').textContent());
  ok(tag+' amigos: pendente aparece',(await fp.textContent()).includes('Aguardando aceitar: Bia'));
  ok(tag+' amigos: todos os botões com nome',(await noName(p,'#frPanel')).length===0,(await noName(p,'#frPanel')).join(' | '));
  await p.locator('#tmPanel .tmlist li.tap',{hasText:'Ana'}).click();await p.waitForTimeout(300);
  ok(tag+' amigos: card do amigo abre como diálogo',await p.locator('.cdmodal[role=dialog]').count()===1&&(await p.locator('.cdmodal').textContent()).includes('Ana'));
  ok(tag+' amigos: card com botões nomeados',(await noName(p,'.cdmodal')).length===0,(await noName(p,'.cdmodal')).join(' | '));
  await p.locator('.cdmodal button',{hasText:'Comparar'}).click();await p.waitForTimeout(300);
  const cmp=p.locator('.sysmodal .frcmp');ok(tag+' amigos: comparar abre diálogo',await cmp.count()===1&&await p.locator('.sysmodal[role=dialog]:has(.frcmp)').count()===1);
  ok(tag+' amigos: foco no Fechar',await p.evaluate(()=>document.activeElement&&document.activeElement.textContent==='Fechar'));
  await cmp.locator('button.go').click();await p.waitForTimeout(200);ok(tag+' amigos: comparar fecha',await p.locator('.frcmp').count()===0);
  await fp.locator('button.go',{hasText:'Adicionar amigo'}).click();await p.waitForTimeout(200);
  const inp=fp.locator('input');ok(tag+' amigos: campo do apelido com nome',(await noName(p,'#frPanel')).length===0);
  await inp.fill('Caio');await fp.locator('button.go',{hasText:'Pedir'}).click();await p.waitForTimeout(400);
  st=await LS(p,pre);ok(tag+' amigos: pedido salvo',!!st.friends.pend.Caio&&st.friends.pend.Bia==='2026-11-25'&&st.friends.l.includes('Ana'),JSON.stringify(st.friends));keep(st,tag,'amigos');
  await p.reload();await p.waitForTimeout(1200);await calm(p);await tab(p,'amigos');await p.waitForTimeout(400);
  ok(tag+' amigos: continua aberto depois de recarregar (sessão)',await p.locator('#frPanel>.fhd').getAttribute('aria-expanded')==='true');
  await p.locator('#frPanel>.fhd').press('Enter');await p.waitForTimeout(200);ok(tag+' amigos: Enter fecha',await p.locator('#frPanel>.fhd').getAttribute('aria-expanded')==='false'&&!(await p.locator('#frPanel .frlist').isVisible()));
  await p.locator('#frPanel>.fhd').press('Enter');await p.waitForTimeout(200);
  st=await LS(p,pre);const tx=await p.locator('#frPanel').textContent();
  ok(tag+' amigos: sobrevive ao recarregar',st.friends.l.includes('Ana')&&!!st.friends.pend.Caio&&tx.includes('Ana')&&/Aguardando aceitar:.*Bia.*Caio|Caio.*Bia/.test(tx),tx);
  st=await LS(p,pre);ok(tag+' avatar ainda salvo depois de mexer em amigos',st.avatar.h===3&&st.avatar.ok===1);keep(st,tag,'final');
  ok(tag+' console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // ---------- Turma vazia: "+ Adicionar amigo" abre o painel recolhido e foca o campo ----------
  ({ctx,p,errs}=await open(route,pre,false));
  await p.evaluate(([c,pre])=>{const o={log:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1},simple:{off:'2026-11-01'},rank:{on:true,nick:'Solo'},friends:{l:[],pend:{},seen:{}},tm:{view:'turma'}};
    localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem(pre+'-tele',JSON.stringify({asked:1}));},[CFG,pre]);
  await p.reload();await p.waitForTimeout(1200);await calm(p);await tab(p,'amigos');await p.waitForTimeout(300);
  const tmA=p.locator('#tmPanel .tmempty button.go');
  if(!(await tmA.count())){await p.locator('#tmPanel .tmseg button[data-v="turma"]').click();await p.waitForTimeout(300);}
  await p.locator('#tmPanel .tmempty button.go').click();await p.waitForTimeout(500);
  ok(tag+' turma vazia: botão abre o painel de amigos',await p.locator('#frPanel>.fhd').getAttribute('aria-expanded')==='true'&&await p.locator('#frPanel input').isVisible());
  ok(tag+' turma vazia: foco no campo do apelido',await p.evaluate(()=>document.activeElement&&document.activeElement.closest('#frPanel')&&document.activeElement.tagName==='INPUT'));
  ok(tag+' turma vazia: console limpo',errs.length===0,errs.join(' | '));await ctx.close();
  // ---------- Jogador antigo, sem avatar nem amigos: nada quebra e só ADICIONA campos ----------
  ({ctx,p,errs}=await open(route,pre,false));
  await p.evaluate(([c,pre])=>{const o={log:{'2026-11-20':[{q:'q1',kind:'full',xp:10,stat:'mente',bonus:0,t:'2026-11-20T10:00:00'}]},rpg:{cls:{id:'mago',style:'fant',name:'Mago'},cg:1},simple:{off:'2026-11-01'},velho:'fica',rank:{on:true,nick:'Velho'}};
    localStorage.clear();localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify(o));localStorage.setItem(pre+'-season','2');localStorage.setItem('asc-u-perm','1');localStorage.setItem('asc-u-intro','1');localStorage.setItem(pre+'-tele',JSON.stringify({asked:'2026-11-01'}));},[CFG,pre]);
  await p.reload();await p.waitForTimeout(1200);await calm(p);await tab(p,'amigos');await p.waitForTimeout(300);await tab(p,'prog');await p.waitForTimeout(300);
  st=await LS(p,pre);ok(tag+' antigo: abre amigos e avatar sem erro',await p.locator('#avPanel').isVisible()&&errs.length===0,errs.join(' | '));
  ok(tag+' antigo: nada apagado',st.velho==='fica'&&st.log['2026-11-20']&&st.rpg.cls.id==='mago'&&st.rank.nick==='Velho',JSON.stringify(st).slice(0,200));
  await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
