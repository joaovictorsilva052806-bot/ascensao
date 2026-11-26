// Resumo do beta no Modo Criador: números agregados a partir das abas privadas que o painel já lê.
// Rode com: python3 -m http.server 8000 & node qa/painel.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';const SP=process.env.SHOTS||'/tmp/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
const SYNC='https://script.google.com/macros/s/TESTE_sem_chave_real_0000000/exec';
const CFG={version:3,name:'Criador',startDate:'2026-11-01',quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]};
const PROG={log:{'2026-11-26':[{q:'q1',kind:'full',xp:10,stat:'mente',bonus:0,t:'x'}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:'mago',style:'fant',name:'Mago'}},velho:'fica'};
// hoje = 26/11/2026. Formatos de data misturados de propósito.
const PAINEL={ok:true,at:'2026-11-26T14:00:00Z',
  usuarios:[['apelido','aparelho','entrada','último acesso','xp','dias ativos','feitas','puladas'],
    ['Ana','iPhone','20261118','20261126',300,7,20,4],      // entrou há 8 dias, ativa hoje
    ['Bia','Android','2026-11-24','2026-11-25',80,2,5,5],   // voltou no dia 2, não hoje
    ['Caio','iPhone','25/11/2026','25/11/2026',10,1,1,3],   // não voltou
    ['Duda','Computador','20261126','20261126',5,1,0,0],    // entrou hoje (fora da retenção)
    ['Ana','iPhone','20261118','20261126',300,7,20,4]],     // linha repetida não conta duas vezes
  funil:[['etapa','pessoas'],['1-convite',12],['2-abriu-navegador',9],['3-abriu-app',6],['4-perfil',5],['5-aceitou',4]],
  feedback:[['data','apelido','nota'],['20261125','Bia','bom: gostei do timer'],['20261126','Ana','ruim: muita coisa na tela']]};
(async()=>{const b=await chromium.launch();
for(const [nome,vp,rm] of [['celular',{width:390,height:844},'no-preference'],['desktop',{width:1280,height:800},'reduce']]){
  const ctx=await b.newContext({viewport:vp,reducedMotion:rm});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  await ctx.route('https://docs.google.com/**',r=>r.fulfill({status:200,contentType:'text/csv',body:'nome,xp,nivel\n'}));
  const posts=[];
  await ctx.route('https://script.google.com/**',r=>{const u=r.request().url();if(r.request().method()==='POST'){posts.push(r.request().postData()||'');return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});}
    if(/[?&]k=/.test(u))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(PAINEL)});
    return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({config:CFG,progress:PROG})});});
  // semente antes do 1º carregamento: sem isso, o salvamento atrasado da 1ª abertura (aparelho vazio) pode sobrescrever a semente
  await ctx.addInitScript(([c,o,s])=>{if(sessionStorage.getItem('seed'))return;sessionStorage.setItem('seed','1');localStorage.setItem('ascensao-cfg',JSON.stringify(c));localStorage.setItem('ascensao-prog',JSON.stringify(o));localStorage.setItem('ascensao-sync',s);
    localStorage.setItem('ascensao-painel',JSON.stringify({k:'chave_de_teste_1234567890abcd'}));localStorage.setItem('ascensao-season','2');},[CFG,PROG,SYNC]);
  await p.clock.install({time:new Date('2026-11-26T14:00:00')});await p.goto(U);await p.waitForTimeout(1500);
  for(let i=0;i<6;i++){const g=p.locator('.sysmodal button.ghost, .sysmodal .go');if(await g.count()&&await g.first().isVisible())await g.first().dispatchEvent('click');await p.waitForTimeout(200);}
  await p.evaluate(()=>document.querySelectorAll('.sysmodal').forEach(m=>m.remove()));await p.locator('#tabbar [data-go="criador"]').click();await p.waitForTimeout(1200);
  const sum=p.locator('#bpSum');const txt=(await sum.textContent())||'';
  const tile=async l=>p.evaluate(l=>{const t=[...document.querySelectorAll('#bpSum .bptile')].find(x=>x.querySelector('span').textContent.startsWith(l));return t?t.querySelector('b').textContent:null;},l);
  ok(nome+': 4 testadores (repetido não conta)',await tile('testadores')==='4',await tile('testadores'));
  ok(nome+': 2 ativos hoje',await tile('ativos hoje')==='2',await tile('ativos hoje'));
  ok(nome+': 4 ativos em 7 dias',await tile('ativos 7 dias')==='4',await tile('ativos 7 dias'));
  ok(nome+': voltaram no dia 2 = 67% (2/3)',await tile('voltaram no dia 2')==='67%'&&/2\/3/.test(txt),await tile('voltaram no dia 2'));
  ok(nome+': dia 8 = 100% (1/1)',await tile('ainda jogam no dia 8')==='100%',await tile('ainda jogam no dia 8'));
  ok(nome+': 26 missões feitas, 68% das principais',await tile('missões feitas')==='26'&&/68%/.test(txt),txt.slice(0,200));
  ok(nome+': 2 feedbacks e o último aparece primeiro',await tile('feedbacks')==='2'&&(await p.locator('#bpSum .bpfb li').first().textContent()).includes('muita coisa'));
  ok(nome+': funil com 5 etapas, sem o número da etapa',await p.locator('#bpSum .bpfrow').count()===5&&!/1-convite/.test(txt));
  ok(nome+': nenhum apelido no resumo',!/Ana|Bia|Caio|Duda/.test(txt.replace(/muita coisa na tela|gostei do timer/g,'')),txt);
  ok(nome+': ativos por dia tem rótulo para leitor de tela',/Ativos por dia/.test(await p.locator('#bpSum .bpdays').getAttribute('aria-label')||''));
  const h=await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-painel-hist')||'{}'));
  ok(nome+': histórico local guarda só a contagem do dia',JSON.stringify(h)==='{"20261126":2}',JSON.stringify(h));
  ok(nome+': painel não envia nada novo',!posts.some(x=>/bpSum|painel-hist/.test(x)));
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-prog')));ok(nome+': progresso antigo intacto',st&&st.velho==='fica'&&st.log['2026-11-26'].length>=1,JSON.stringify(st).slice(0,300));
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);ok(nome+': sem rolagem lateral',ov);
  ok(nome+': console sem erros',!errs.length,errs.join(' | '));
  await sum.screenshot({path:SP+'painel-'+nome+'.png'});
  // planilha com aba "diario": ativos por dia vêm dela
  PAINEL.diario=[['id','data'],['a1','20261124'],['a2','20261124'],['a1','20261125'],['a1','20261126'],['a1','20261126']];
  await p.locator('#tabbar [data-go="criador"]').click();await p.waitForTimeout(600);
  const bars=await p.evaluate(()=>[...document.querySelectorAll('#bpSum .bpday small')].map(x=>x.textContent).join(','));
  ok(nome+': aba diario conta pessoas distintas por dia',bars.endsWith('2,1,1'),bars);
  delete PAINEL.diario;
  // sem chave: mensagem clara
  await p.evaluate(()=>localStorage.removeItem('ascensao-painel'));await p.locator('#tabbar [data-go="criador"]').click();await p.waitForTimeout(300);
  ok(nome+': sem chave mostra "ainda não ligado"',/ainda não ligado/.test(await sum.textContent()));
  await ctx.close();}
await b.close();console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log((R.length-f)+'/'+R.length+' passando');process.exit(f?1:0);})();
