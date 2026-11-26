// Reinstalação: ligar a planilha num aparelho novo nunca sobrescreve o progresso da planilha.
// Rode com: python3 -m http.server 8000 & node qa/religar.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));};
const SID='AKfycbTESTE_1234567890abcdefghij';const EXEC='https://script.google.com/macros/s/'+SID+'/exec';
const SHEET={config:{version:3,name:'JV',startDate:'2026-11-01',quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]},
 progress:{log:{"2026-11-10":[{q:"q1",kind:"full",xp:10,stat:"mente",bonus:0,t:"x"}],"2026-11-11":[{q:"q1",kind:"full",xp:10,stat:"mente",bonus:0,t:"x"}]},extra:{},faith:{},energy:{},mit:{},reviews:{},money:[],rest:{},ach:{},rpg:{cls:{id:"mago",style:"fant",name:"Mago"}},updatedAt:"2026-11-20T10:00:00.000Z",velho:"fica"}};
async function clear(p){for(let i=0;i<8;i++){const m=p.locator('.sysmodal button.go');if(await m.count()){await m.first().dispatchEvent('click');await p.waitForTimeout(80);continue;}if(await p.locator('#levelup').isVisible()){await p.locator('#luClose').dispatchEvent('click');continue;}break;}}
(async()=>{const b=await chromium.launch();
for(const modo of ['colar','link']){
  const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});
  const ops=[];await ctx.route('https://script.google.com/**',async r=>{const q=r.request();ops.push(q.method());
    if(q.method()==='POST'){await new Promise(x=>setTimeout(x,50));SHEET._last=JSON.parse(q.postData()).progress;return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});}
    await new Promise(x=>setTimeout(x,1500));return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(SHEET)});});
  await p.goto(U);await p.waitForTimeout(800);
  // jogador mexe antes de ligar (escolhe classe, se o modal aparecer)
  const cl=p.locator('.sysmodal button').first();if(await cl.count())await cl.dispatchEvent('click');await p.waitForTimeout(300);await clear(p);
  await p.evaluate(()=>{const o=JSON.parse(localStorage.getItem('ascensao-prog')||'{"log":{}}');o.log=o.log||{};o.log["2026-11-25"]=[{q:"q_checkin",kind:"full",xp:5,stat:"foco",bonus:0,t:"x"}];o.updatedAt=new Date().toISOString();localStorage.setItem('ascensao-prog',JSON.stringify(o));});
  if(modo==='colar'){await p.reload();await p.waitForTimeout(600);await clear(p);await p.evaluate(e=>{document.getElementById('syncUrl').value=e;document.getElementById('syncSave').click();},EXEC);}
  const dl=[];if(modo!=='colar'){p.on('dialog',d=>{dl.push(d.message());d.accept();});await p.goto(U+'#s='+SID);}
  await p.waitForTimeout(3500);if(modo!=='colar')ok('link: pede confirmação antes de ligar',dl.some(m=>/liga este app/.test(m)),dl.join('/')||'nenhum diálogo');await clear(p);
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-prog')||'{}'));
  const bak=await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-prog-prelink')||'null'));
  ok(modo+': progresso da planilha voltou',st.log&&st.log["2026-11-10"]&&st.velho==='fica',JSON.stringify(st).slice(0,200));
  ok(modo+': nenhum POST antes do 1º GET',ops[0]==='GET',ops.join(','));
  ok(modo+': planilha não recebeu progresso vazio',!SHEET._last||SHEET._last.log["2026-11-10"],JSON.stringify(SHEET._last||{}).slice(0,120));
  ok(modo+': local virou backup',bak&&bak.log["2026-11-25"]);
  ok(modo+': aba Criador visível',await p.locator('#tabbar [data-go="criador"]').isVisible());
  ok(modo+': flag limpa',await p.evaluate(()=>localStorage.getItem('ascensao-sync-first')===null));
  // depois da 1ª ligação, uma ação nova sobe normalmente
  ops.length=0;await p.evaluate(()=>{document.querySelector('#tabbar [data-go="hoje"]').click();});
  ok(modo+': console sem erros',errs.length===0,errs.join(' | '));
  delete SHEET._last;await ctx.close();}
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
