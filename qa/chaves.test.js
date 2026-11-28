// 📜 Crônicas + 🗝️ Caça das 3 Chaves (tools/chaves.js, conteúdo v1 da EVA 28/11).
// Confere: Crônicas e Mapa só a partir do 3º dia; palavra sem a ação não abre (nenhum XP); forja:sem abre a Chama (+30 XP, 1 vez);
// 5 focos em 2 dias recusam o Saber, em 3 dias aceitam; Elo com ach:tb; Portão com 2 chaves recusa, com 3 abre com "eu" e com o apelido;
// Ouro do Portão respeita o teto; moldura do Portão nunca no baú; códigos antigos do Terminal seguem; 320 px; console limpo.
// Rode com: python3 -m http.server 8000 & node qa/chaves.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const TK='2026-11-26';const E=(q,x)=>({q,kind:'full',xp:x||10,stat:'foco',bonus:0,t:'x'});
const CFG={version:3,name:'Ana Lima',startDate:'2026-11-01',profile:{age:'18 a 29'},quests:[{id:'q1',title:'Ler 10 páginas',xp:10,stat:'mente',main:true}]};
const base=(log,x)=>Object.assign({log:Object.assign({'2026-11-20':[E('q1')],'2026-11-21':[E('q1')],'2026-11-22':[E('q1')]},log||{}),extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{a_first:'2026-11-01'},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},simple:{off:'2026-11-01'},gd:{off:1},velho:'fica'},x||{});
async function abre(b,prog,o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844}});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route(/fonts|docs\.google|script\.google/,r=>r.fulfill({status:200,body:''}));
  await p.clock.install({time:new Date(TK+'T15:00:00-03:00')});await p.goto(U+'privacidade/');
  await p.evaluate(([c,o])=>{localStorage.setItem('asc-u-cfg',JSON.stringify(c));localStorage.setItem('asc-u-prog',JSON.stringify(o));localStorage.setItem('asc-u-season','2');localStorage.setItem('asc-u-tele',JSON.stringify({asked:1}));
    for(const k of ['asc-u-intro','asc-u-news','asc-u-perm','asc-u-tip','asc-u-guide'])localStorage.setItem(k,'9');},[o.cfg||CFG,prog]);
  await p.goto(U+'comecar/');await p.clock.runFor(3000);await shut(p);
  await p.evaluate(()=>{const t=document.querySelector('#tabbar [data-go="mais"]');if(t)t.click();});await p.clock.runFor(400);return {ctx,p,errs};}
async function shut(p){for(let i=0;i<8;i++){const n=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal:not([hidden]) button, #levelup:not([hidden]) #luClose')].find(x=>x.getClientRects().length);if(m){m.click();return 1;}const s=document.getElementById('smSheet');if(s&&!s.hidden){s.hidden=true;document.body.classList.remove('insm');}return 0;});if(!n)break;await p.clock.runFor(400);}}
async function term(p,w){const pop=[];await p.evaluate(w=>{const i=document.getElementById('secCode');i.value=w;document.getElementById('secForm').requestSubmit();},w);await p.clock.runFor(400);
  const T=[];for(let i=0;i<6;i++){const t=await p.evaluate(()=>{const m=[...document.querySelectorAll('.sysmodal:not([hidden])')].find(x=>x.getClientRects().length);if(!m)return null;const s=m.innerText.replace(/\s+/g,' ');const b=m.querySelector('button');if(b)b.click();return s;});if(t===null)break;T.push(t);await p.clock.runFor(150);}await shut(p);const t=T.join(' | ');
  return {out:await p.textContent('#secOut'),pop:t};}
const prog=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('asc-u-prog')));
const xpOf=(st,id)=>Object.values(st.log).flat().filter(e=>e.q==='ach:key:'+id).reduce((a,e)=>a+e.xp,0);
(async()=>{const b=await chromium.launch();
// 0) 2 dias jogados: nada aparece
{const {ctx,p}=await abre(b,base({'2026-11-21':[],'2026-11-22':[]}));ok('2 dias: sem Crônicas nem Mapa',!(await p.locator('#cnPanel:visible, #kyPanel:visible').count()));await ctx.close();}
// 1) Crônicas e Mapa
let {ctx,p,errs}=await abre(b,base());
ok('3º dia: Crônicas em Mais',await p.locator('#cnPanel').isVisible());
ok('Crônicas pág. 1 "O Véu"',/O Véu/.test(await p.textContent('#cnPanel')));
for(let i=0;i<4;i++){await p.locator('#cnPanel .crnav .go').click();await p.clock.runFor(100);}
const pg5=await p.textContent('#cnPanel');ok('pág. 5 tem o acróstico de ARES sem negrito',/Comece pequeno/.test(pg5)&&/Aço não nasce aço/.test(pg5)&&!(await p.locator('#cnPanel b, #cnPanel strong').count()));
ok('Mapa das Chaves: 3 fechaduras + Portão, 0/3',await p.locator('#kyPanel .kyslot').count()===4&&/0\/3/.test(await p.textContent('#kyPanel')));
ok('Mapa não entrega a palavra',!/chama|saber|elo\b/i.test((await p.textContent('#kyPanel')).replace(/Chave/g,'')));
// palavra sem ação
let r=await term(p,'Chama');ok('Chama sem Forja: "ainda não conhece você"',/Ainda não conhece você/.test(r.out)&&!r.pop,JSON.stringify(r));
r=await term(p,'eu');ok('Portão sem chaves: "Faltam 3 chaves"',/Faltam 3 chaves/.test(r.out),r.out);
r=await term(p,'larica');ok('código antigo do Terminal segue funcionando',/aceito/.test(r.out),r.out);
let st=await prog(p);ok('nenhum XP de chave sem a ação',!Object.values(st.log).flat().some(e=>/^ach:key:/.test(e.q)));
ok('320 px sem rolagem lateral',await (p.setViewportSize({width:320,height:700}),p.clock.runFor(200),p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)));
ok('console limpo (1)',!errs.length,errs.join(' | '));await ctx.close();
// 2) Chama com forja:sem; Saber 5 focos em 2 dias recusa, 3 dias aceita; Elo; Portão
const F=(d,n)=>Array.from({length:n},(_,i)=>E('foco:'+d+':'+i,15));
({ctx,p,errs}=await abre(b,base({'2026-11-23':[E('forja:sem:2026-11-23',30)],'2026-11-24':F('a',3),'2026-11-25':F('b',2)})));
r=await term(p,'chama');ok('Chama com forja:sem: chave + janela',/CHAVE ENCONTRADA/.test(r.pop)&&/Portador da Chama/.test(r.pop),JSON.stringify(r));
r=await term(p,'CHAMA!');ok('Chama de novo: "já é sua", sem pagar 2x',/já é sua/.test(r.out),r.out);
st=await prog(p);ok('Chama: +30 XP uma vez só',xpOf(st,'chama')===30,String(xpOf(st,'chama')));
ok('Chama: título no baú de títulos',st.chest.titles.some(t=>t.id==='k_chama'));
r=await term(p,'conhecimento');ok('Saber com 5 focos em 2 dias: recusa',/Ainda não conhece você/.test(r.out),r.out);
r=await term(p,'eu');ok('Portão com 1 chave: "Faltam 2 chaves"',/Faltam 2 chaves/.test(r.out),r.out);await ctx.close();
({ctx,p,errs}=await abre(b,base({'2026-11-23':[E('forja:sem:2026-11-23',30)],'2026-11-24':F('a',2),'2026-11-25':F('b',2),'2026-11-26':F('c',1),'2026-10-12':[E('ach:tb:2026-10-12',40)]},{ouroX:{d:{[TK]:180},got:{},h:[]},ouro:5})));
await p.clock.runFor(800);const hint=await p.evaluate(()=>[...document.querySelectorAll('.toast,#toast')].map(x=>x.textContent).join(' '));
for(const w of ['chama','saber','elo']){r=await term(p,w);ok(w+': chave achada',/CHAVE ENCONTRADA/.test(r.pop),JSON.stringify(r));}
const o0=(await prog(p)).ouro;r=await term(p,'Ana');ok('Portão abre com o 1º nome (3 chaves)',/O PORTÃO SE ABRIU/.test(r.pop)&&/Herdeiro do Arquiteto/.test(r.pop),JSON.stringify(r));
st=await prog(p);ok('Portão: +100 XP',xpOf(st,'portao')===100);
ok('Portão: Ouro respeita o teto do dia (só +20)',st.ouro-o0===20&&st.ouroX.got['key:portao']!==undefined,JSON.stringify({o0,o:st.ouro,got:st.ouroX.got,h:st.ouroX.h}));
ok('Portão: moldura e título lendário',st.chest.frames.includes('k_f_portao')&&st.chest.titles.some(t=>t.id==='k_portao'));
r=await term(p,'eu');ok('Portão já aberto',/já está aberto/.test(r.out),r.out);
ok('Mapa 3/3 e Portão aberto',/3\/3/.test(await p.textContent('#kyPanel'))&&/Aberto em/.test(await p.textContent('#kyPanel')));
ok('console limpo (2)',!errs.length,errs.join(' | '));
// a moldura do Portão nunca sai do baú: filtro do baú ignora molduras marcadas (f[5])
ok('moldura do Portão fora do sorteio do baú',await p.evaluate(()=>{const s=[...document.scripts].map(x=>x.text).join('');return /BX_FR\.filter\(f=>!f\[5\]/.test(s)&&/\["k_f_portao","Portão do Arquiteto",3,"#f2c14e","#7b2cff","chave"\]/.test(s);}));
await ctx.close();
// apelido do ranking também abre
({ctx,p}=await abre(b,base({'2026-11-23':[E('forja:sem:2026-11-23',30)],'2026-11-24':F('a',2),'2026-11-25':F('b',2),'2026-11-26':F('c',1),'2026-10-12':[E('ach:tb:2026-10-12',40)]},{rank:{on:true,asked:true,uid:'u12345678',nick:'Lumi'}})));
for(const w of ['chama','saber','elo'])await term(p,w);r=await term(p,'lumi');ok('Portão abre com o apelido do ranking',/O PORTÃO SE ABRIU/.test(r.pop),JSON.stringify(r));await ctx.close();
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length);process.exit(f?1:0);})().catch(e=>{console.error(e);process.exit(1)});
