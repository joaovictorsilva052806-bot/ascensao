// Vibração do aviso do Sistema (tools/rpg.js, usado na raiz e no /comecar/): não chama navigator.vibrate antes do
// 1º toque na página (o Chrome bloqueia e joga erro no console), e continua vibrando depois que a pessoa toca.
// Rode com: python3 -m http.server 8000 & node qa/vibrar.test.js
const {chromium}=require('playwright');const U='http://localhost:8000/comecar/';const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
async function onboard(p){await p.goto(U);await p.waitForTimeout(800);
  for(let i=0;i<16;i++){if(await p.$('.quest:visible'))return;
    for(const [s,v] of [['#q_name','Teste'],['#q_goal','Estudar 20 min']]){const e=await p.$(s+':visible');if(e&&!(await e.inputValue()))await e.fill(v);}
    let btn=null;for(const t of ['18 a 29','Faculdade']){btn=await p.$(`button:visible:has-text("${t}")`);if(btn)break;}
    if(!btn)for(const x of await p.$$('button:visible')){const id=(await x.getAttribute('id'))||'';if(['q_bk','q_full'].includes(id))continue;if(id.startsWith('q_')){btn=x;break;}}
    if(btn)await btn.click();await p.waitForTimeout(900);}}
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{window.__vib=0;const v=navigator.vibrate&&navigator.vibrate.bind(navigator);navigator.vibrate=function(x){window.__vib++;return v?v(x):true;};});
const T0=new Date('2026-11-25T12:00:00-03:00');const p0=await ctx.newPage();await p0.clock.install({time:T0});await onboard(p0);
for(let i=0;i<6;i++){await p0.waitForTimeout(700);const m=await p0.$('#clsModal .clsbtn:visible')||await p0.$('.sysmodal button.go:visible');if(m)await m.click();}ok('onboarding para preparar o perfil',!!(await p0.$('.quest:visible')));await p0.close();
// página nova no dia seguinte = sem toque ainda; o Sistema abre o check-in sozinho
const p=await ctx.newPage();await p.clock.install({time:new Date(T0.getTime()+864e5)});const errs=[];p.on('console',m=>{if(m.type()==='error'&&/vibrate/.test(m.text()))errs.push(m.text())});
await p.goto(U);await p.waitForTimeout(2500);
const modal=await p.$('.sysmodal');ok('aviso do Sistema aparece sem toque',!!modal);
ok('sem toque: não vibra',(await p.evaluate(()=>window.__vib))===0,`vibrou ${await p.evaluate(()=>window.__vib)}x`);
ok('sem toque: console sem erro de vibrate',errs.length===0,errs[0]);
// depois de tocar, o próximo aviso vibra
for(let i=0;i<4;i++){const m=await p.$('#clsModal .clsbtn:visible')||await p.$('.sysmodal button.go:visible');if(!m)break;await m.click();await p.waitForTimeout(700);}
ok('depois do toque: vibra',(await p.evaluate(()=>window.__vib))>=1,`vibrou ${await p.evaluate(()=>window.__vib)}x`);
await b.close();console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0);})();
