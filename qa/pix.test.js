// Cobrar com Pix (tools/pix.*): só no Criador (raiz), chave e cobranças só no aparelho, BR Code com CRC certo,
// QR desenhado no aparelho, "Recebi" e "Apagar" pedem 2 toques, recibo com a data real de emissão, nada sai para a rede.
// Rode com: python3 -m http.server 8000 & node qa/pix.test.js
const {chromium}=require('playwright');const fs=require('fs'),vm=require('vm');const U='http://localhost:8000/';
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x&&!c?' · '+x:''));
// ---- unidade: roda tools/pix.js num contexto isolado ----
const src=fs.readFileSync(__dirname+'/../tools/pix.js','utf8');
const cx={TextEncoder,Math,String,Array,Number,JSON,isFinite,parseFloat,setTimeout:()=>{},crRender:function(){},$:()=>null,toast:()=>{},todayKey:()=>'2026-11-27',localStorage:{getItem:()=>null,setItem:()=>{}}};
vm.createContext(cx);vm.runInContext(src+';this.T={qrEncode,pxPayload,pxCrc,pxNormKey,pxVal,pxAscii};',cx);const T=cx.T;
const crc=s=>T.pxCrc(s);
ok('CRC16 do exemplo do Banco Central (1D3D)',crc('00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304')==='1D3D');
function parse(s){const o={};let i=0;while(i<s.length){const id=s.slice(i,i+2),n=+s.slice(i+2,i+4);o[id]=s.slice(i+4,i+4+n);i+=4+n;}return o;}
const K={t:'evp',v:'123e4567-e12b-12d1-a456-426655440000',n:'João Vítor da Silva Souza Lima',c:'São José dos Campos'};
const pl=T.pxPayload(K,150,'Turma Parceiro · dezembro','ASCabc');const f=parse(pl);const ma=parse(f['26']);
ok('BR Code: campos obrigatórios e valor com 2 casas',f['00']==='01'&&ma['00']==='br.gov.bcb.pix'&&ma['01']===K.v&&f['52']==='0000'&&f['53']==='986'&&f['54']==='150.00'&&f['58']==='BR',pl);
ok('BR Code: nome até 25 e cidade até 15, sem acento',f['59'].length<=25&&f['60'].length<=15&&/^[\x20-\x7e]+$/.test(f['59']+f['60']+ma['02']),f['59']+'|'+f['60']);
ok('BR Code: CRC confere',pl.slice(-4)===crc(pl.slice(0,-4))&&pl.slice(-8,-4)==='6304');
ok('BR Code: txid só letras e números',parse(f['62'])['05']==='ASCabc');
const lg=T.pxPayload({t:'email',v:'nome.muito.comprido.para.testar@exemplo.com.br',n:'A',c:'B'},1.5,'x'.repeat(200),'1');ok('BR Code: descrição cortada para o campo 26 caber em 99',+lg.slice(lg.indexOf('26')+2,lg.indexOf('26')+4)<=99&&parse(lg)['54']==='1.50');
ok('valor: 150, 1.200,50, 0,99 e lixo',T.pxVal('150')===150&&T.pxVal('1.200,50')===1200.5&&T.pxVal('R$ 0,99')===0.99&&T.pxVal('abc')===0&&T.pxVal('-5')===0);
ok('chave: tipos validados',T.pxNormKey('evp','123E4567-E12B-12D1-A456-426655440000')===K.v&&T.pxNormKey('evp','123')===''&&T.pxNormKey('cel','(11) 98765-4321')==='+5511987654321'&&T.pxNormKey('doc','123.456.789-09')==='12345678909'&&T.pxNormKey('email','a@b.co')==='a@b.co'&&T.pxNormKey('email','semarroba')==='');
// QR: tamanho certo por versão, padrões de posição nos 3 cantos e informação de formato válida (BCH) nas 2 cópias
function fmtOk(M){const N=M.length;const a=[];for(let i=0;i<=5;i++)a.push(M[i][8]);a.push(M[7][8],M[8][8],M[8][7]);for(let i=9;i<15;i++)a.push(M[8][14-i]);
  const b=[];for(let i=0;i<8;i++)b.push(M[8][N-1-i]);for(let i=8;i<15;i++)b.push(M[N-15+i][8]);const v=x=>x.reduce((s,bit,i)=>s|((bit?1:0)<<i),0);
  const raw=v(a)^0x5412;const d=raw>>>10;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);return v(a)===v(b)&&(((d<<10)|r)===raw)&&(d>>>3)===0;}
let qrok=true,why='';for(const n of [10,60,120,150,180,200]){const M=T.qrEncode('p'.repeat(n));const N=M.length;const ver=(N-17)/4;
  const fp=(x,y)=>[0,6].every(k=>M[y][x+k]&&M[y+k][x]&&M[y+6][x+k]&&M[y+k][x+6])&&M[y+3][x+3];
  if(!Number.isInteger(ver)||ver<1||ver>10||!fp(0,0)||!fp(N-7,0)||!fp(0,N-7)||!M[N-8][8]||!fmtOk(M)){qrok=false;why=n+' v'+ver;}}
ok('QR: versões 1-10, padrões de posição e formato (correção M) válidos',qrok,why);
let big=false;try{T.qrEncode('p'.repeat(300));}catch(e){big=true;}ok('QR: texto grande demais avisa em vez de gerar errado',big);
// ---- tela ----
const CFG={version:3,name:'JV',startDate:'2026-11-01',profile:{age:'adult'},quests:[{id:'q1',title:'Ler',xp:10,stat:'mente',main:true}]};
(async()=>{const b=await chromium.launch();
async function open(o={}){const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},reducedMotion:o.rm||'no-preference',permissions:['clipboard-read','clipboard-write']});const p=await ctx.newPage();const errs=[],reqs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|navigator.vibrate/.test(m.text()))errs.push(m.text())});p.on('request',r=>reqs.push(r.url()+' '+(r.postData()||'')));
  await ctx.route('https://script.google.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:r.request().method()==='POST'?'{"ok":true}':JSON.stringify({config:CFG,progress:{log:{},velho:'fica'}})}));
  await p.clock.install({time:new Date('2026-11-27T10:00:00')});await p.goto(U+(o.route||'')+'__seed__');
  await p.evaluate(([c,pre,x,sync])=>{if(sync)localStorage.setItem('ascensao-sync','https://script.google.com/macros/s/TESTE/exec');localStorage.setItem(pre+'-cfg',JSON.stringify(c));localStorage.setItem(pre+'-prog',JSON.stringify({log:{},velho:'fica'}));for(const k of ['-season','-perm','-intro'])localStorage.setItem(pre+k,'2');localStorage.setItem(pre+'-tele','{"asked":1}');if(x)localStorage.setItem('ascensao-pix',JSON.stringify(x));},[CFG,o.route?'asc-u':'ascensao',o.pix||null,o.sync!==false&&!o.route]);
  await p.goto(U+(o.route||''));await p.waitForTimeout(2500);
  await p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal'))m.remove();const l=document.getElementById('levelup');if(l)l.hidden=true;const t=document.querySelector('#tabbar [data-go="criador"]');if(t&&!t.hidden)t.click();});await p.waitForTimeout(400);
  return {ctx,p,errs,reqs};}
const vis=(p,s)=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&!e.hidden&&e.getClientRects().length>0;},s);
let {ctx,p,errs,reqs}=await open();
ok('criador sem chave: pede a chave uma vez, com aleatória recomendada',await vis(p,'#pxPanel')&&await vis(p,'#pxChave')&&(await p.inputValue('#pxTipo'))==='evp');
await p.fill('#pxChave','123');await p.fill('#pxNome','JV');await p.fill('#pxCidade','Campinas');await p.click('#pxPanel button.go');
ok('chave inválida não salva',!(await p.evaluate(()=>localStorage.getItem('ascensao-pix'))));
await p.selectOption('#pxTipo','cel');ok('celular/CPF mostram o aviso de exposição',/A aleatória protege mais/.test(await p.locator('.pxwarn').innerText()));await p.selectOption('#pxTipo','evp');
await p.fill('#pxChave',K.v);await p.fill('#pxNome','João Vítor');await p.click('#pxPanel button.go');await p.waitForTimeout(200);
const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-pix')));
ok('chave salva só no aparelho, fora do progresso',st.k&&st.k.v===K.v&&!(await p.evaluate(()=>localStorage.getItem('ascensao-prog'))).includes(K.v));
await p.fill('#pxQuem','Academia Força');await p.fill('#pxValor','abc');await p.click('#pxPanel .pxform button.go');ok('valor inválido não gera',!(await vis(p,'#pxShow')));
await p.fill('#pxValor','150');await p.click('#pxPanel .pxchip >> nth=0');await p.click('#pxPanel .pxform button.go');await p.waitForTimeout(300);
const code=await p.inputValue('#pxCode');const cf=parse(code);
ok('gera Pix copia e cola com valor e CRC certos',/^000201/.test(code)&&cf['54']==='150.00'&&parse(cf['26'])['01']===K.v&&code.slice(-4)===crc(code.slice(0,-4)),code);
ok('desenha o QR (SVG) no aparelho',await p.locator('#pxShow .pxqr svg path').count()===1&&(await p.locator('#pxShow .pxqr svg').getAttribute('aria-label'))==='QR Code do Pix');
const wa=await p.getAttribute('#pxShow a.pxwa','href');ok('WhatsApp com a mensagem pronta e sem número fixo',wa.startsWith('https://wa.me/?text=')&&decodeURIComponent(wa).includes(code)&&decodeURIComponent(wa).includes('Academia Força'));
await p.click('#pxShow button.go');await p.waitForTimeout(150);ok('Copiar código copia o Pix',(await p.evaluate(()=>navigator.clipboard.readText()))===code);
await p.click('.pxrow button.go');await p.waitForTimeout(100);ok('"Recebi" no 1º toque só pergunta',(await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-pix')).list[0].pago))===null);
await p.click('.pxrow button.go');await p.waitForTimeout(400);
const pg=await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-pix')).list[0].pago);ok('"Recebi" no 2º toque marca com a data de hoje',pg==='2026-11-27');
ok('1º pagamento comemora no Sistema',await p.locator('.sysmodal:has-text("Primeiro dinheiro")').count()>=1);
await p.evaluate(()=>{for(const m of document.querySelectorAll('.sysmodal'))m.remove();});
ok('resumo do mês soma o recebido',/R\$ 150,00/.test(await p.locator('.pxbig').innerText()));
await p.click('.pxrow button:has-text("Recibo")');await p.waitForTimeout(150);const rc=await p.evaluate(()=>navigator.clipboard.readText());
ok('recibo com a data real de emissão e a do pagamento como fato',/Recibo emitido em 27\/11\/2026/.test(rc)&&/27 de novembro de 2026/.test(rc)&&/Pix em 27\/11\/2026/.test(rc)&&/R\$ 150,00/.test(rc),rc);
await p.click('.pxrow .pxdel');ok('"Apagar" pede confirmação',(await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-pix')).list.length))===1&&/Toque de novo/.test(await p.locator('.pxrow .pxdel').innerText()));
await p.click('.pxrow .pxdel');ok('2º toque apaga',(await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-pix')).list.length))===0);
ok('nada da chave, do cliente ou do valor sai para a rede',!reqs.some(r=>r.includes(K.v)||/Academia|For%C3%A7a/.test(r)||/pix/i.test(r)),reqs.filter(r=>/pix|Academia/i.test(r)).join(' | '));
ok('progresso intacto',(await p.evaluate(()=>JSON.parse(localStorage.getItem('ascensao-prog')).velho))==='fica');
ok('console limpo',errs.length===0,errs.join(' | '));await ctx.close();
// telas pequenas, desktop e reduce-motion com cobrança aberta
for(const vp of [{width:360,height:740},{width:1280,height:800}]){({ctx,p,errs}=await open({vp,rm:'reduce',pix:{k:{t:'evp',v:K.v,n:'JV',c:'Campinas'},list:[{id:'a1',quem:'Cliente com nome comprido demais para a linha',valor:1234.5,oq:'Turma Parceiro · mensalidade de dezembro',d:'2026-11-27',pago:null}]}}));
  await p.click('.pxrow button.ghost');await p.waitForTimeout(250);
  ok(vp.width+'px + reduce-motion: QR aparece, sem rolagem lateral, botões de 44 px',await vis(p,'#pxShow .pxqr svg')&&await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#pxPanel button,#pxPanel a.btnlink,#pxPanel input,#pxPanel select')].filter(e=>e.getClientRects().length&&!e.classList.contains('link')).every(e=>e.getBoundingClientRect().height>=43.5))&&errs.length===0,errs.join('|'));
  await p.screenshot({path:__dirname+'/shots-pix-'+vp.width+'.png'});await ctx.close();}
// fora do Criador ninguém vê
({ctx,p,errs}=await open({sync:false}));ok('raiz sem planilha ligada: sem painel de cobrança',!(await p.locator('#pxPanel').count())||!(await vis(p,'#pxPanel')));await ctx.close();
({ctx,p,errs}=await open({route:'comecar/'}));ok('/comecar/ (jogadores): sem painel e sem o código de cobrança',!(await p.locator('#pxPanel').count())&&!fs.readFileSync(__dirname+'/../comecar/index.html','utf8').includes('br.gov.bcb.pix'));await ctx.close();
ok('repositório sem chave Pix real',!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(src)&&!fs.readFileSync(__dirname+'/../index.html','utf8').match(/br\.gov\.bcb\.pix0[0-9]{3}[^"']{8}/));
await b.close();console.log(R.join('\n'));const n=R.filter(x=>x.startsWith('FAIL')).length;console.log(n?n+' FALHA(S)':'TODOS PASSARAM ('+R.length+')');process.exit(n?1:0);})();
