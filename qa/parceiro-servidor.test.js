// Turma Parceiro no server/mural.gs (ações pt-*), fora do Google, com a mesma planilha simulada do qa/mural-servidor.test.js.
// Confere: só 18+; dono só vê agregados; com menos de 3 participantes, ativos e % somem; top 3 só de quem marcou;
// nome do parceiro sem telefone/e-mail/link; prêmio desligado não é guardado; o dia é do servidor; sair e encerrar apagam as linhas.
// Rode: node qa/parceiro-servidor.test.js
const fs=require('fs'),crypto=require('crypto');const src=fs.readFileSync(process.argv[2]||require('path').join(__dirname,'..','server','mural.gs'),'utf8');
const props={},cache={};let now=Date.now();const files={};let mails=0;
class Sheet{constructor(n,rows){this.n=n;this.v=rows||[];}getDataRange(){const s=this;return{getValues:()=>s.v.map(r=>r.slice())};}appendRow(r){this.v.push(r.slice());}hideSheet(){}
 getRange(r,c,nr,nc){const s=this;return{setValue:x=>{s.v[r-1][c-1]=x;},getValues:()=>[s.v[r-1].slice(c-1,c-1+nc)]};}deleteRow(r){this.v.splice(r-1,1);}
 getLastColumn(){return Math.max(0,...this.v.map(r=>r.length));}createTextFinder(t){const s=this;return{matchEntireCell(){return this;},findNext(){for(let i=0;i<s.v.length;i++){const j=s.v[i].indexOf(t);if(j>=0)return{getRow:()=>i+1,getColumn:()=>j+1};}return null;}};}}
const resp=new Sheet('Respostas ao formulário 1',[['ts','v','c']]);const sheets={[resp.n]:resp};
const ss={getSheetByName:n=>sheets[n]||null,insertSheet:n=>(sheets[n]=new Sheet(n))};const store={},st={getId:()=>'ST',getSheetByName:n=>store[n]||null,insertSheet:n=>(store[n]=new Sheet(n))};let created=0;
const g={SHEET_ID:'x',SpreadsheetApp:{openById:id=>id==='ST'?st:ss,getActive:()=>ss,create:()=>{created++;return st;}},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]??null,setProperty:(k,v)=>{props[k]=v}})},
 CacheService:{getScriptCache:()=>({get:k=>cache[k]??null,put:(k,v)=>{cache[k]=v}})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
 ContentService:{createTextOutput:t=>({setMimeType:()=>JSON.parse(t)}),MimeType:{JSON:1}},
 Utilities:{computeDigest:(a,t)=>[...crypto.createHash('sha256').update(t).digest()].map(b=>b>127?b-256:b),DigestAlgorithm:{SHA_256:1},Charset:{UTF_8:1},
  formatDate:(d,z,f)=>new Date(d).toISOString().slice(0,10),getUuid:()=>crypto.randomUUID(),base64Decode:s=>[...Buffer.from(s,'base64')].map(b=>b>127?b-256:b),base64Encode:b=>Buffer.from(b.map(x=>x&255)).toString('base64'),newBlob:(b,t,n)=>({b})},
 DriveApp:{createFolder:()=>({setSharing(){},getId:()=>'F',createFile:bl=>{const id='f'+Object.keys(files).length;files[id]={b:bl.b,tr:false};return{getId:()=>id};}}),getFolderById:()=>g.DriveApp.createFolder(),
  getFileById:id=>{if(!files[id]||files[id].tr)throw 0;return{getBlob:()=>({getBytes:()=>files[id].b}),setTrashed:()=>{files[id].tr=true}};},Access:{},Permission:{}},
 MailApp:{sendEmail:()=>mails++},Session:{getEffectiveUser:()=>({getEmail:()=>'jv'})},ScriptApp:{}};
const names=Object.keys(g);const fn=new Function(...names,src+';return {doPost,muralLimpa};');const M=fn(...names.map(k=>g[k]));
const h=t=>[...crypto.createHash('sha256').update(t).digest()].slice(0,16).map(b=>b.toString(16).padStart(2,'0')).join('');
const P={};function player(n,u){const tk='tk'+crypto.randomBytes(16).toString('base64url');props['n:'+n]=JSON.stringify({u,t:now});props['t:'+u]=h(tk);P[n]=tk;}
['ana','bia','teo','zed','kid','cau','duda','eli'].forEach((n,i)=>player(n,'uid'+i+'aaaa'));
resp.v.push(['','F|Ana|Bia||20261125','tk'],['','G|Bia|Ana||20261125','tk'],['','F|Teo|Ana||20261125','tk'],['','G|Ana|Teo||20261125','tk'],['','F|Zed|Ana||20261125',''],['','G|Ana|Zed||20261125','']);
const call=(n,a,o)=>M.doPost({postData:{contents:JSON.stringify(Object.assign({a,n,tk:P[n]},o))}});
const R=[];const ok=(m,c,x)=>R.push((c?'PASS ':'FAIL ')+m+(c?'':' · '+JSON.stringify(x)));
ok('sem registro de idade: recusado',call('ana','pt-new',{pn:'Studio X'}).err==='idade');
['ana','bia','zed','cau','duda','eli'].forEach(n=>call(n,'reg',{band:'adult'}));call('teo','reg',{band:'teen',par:1});
ok('14-17 (com responsável) não cria turma',call('teo','pt-new',{pn:'Studio X'}).err==='idade');
ok('≤13 nunca registra e não entra',call('kid','reg',{band:'kid'}).err==='idade'&&call('kid','pt-join',{c:'pabcdefghij'}).err==='idade');
ok('nome com telefone recusado',call('ana','pt-new',{pn:'Studio 31999998888'}).err==='nome');
ok('nome com e-mail/@ recusado',call('ana','pt-new',{pn:'studio@x'}).err==='nome');
ok('nome com link recusado',call('ana','pt-new',{pn:'www.studiox.com'}).err==='nome');
const nw=call('ana','pt-new',{pn:'Studio X',m:20,pr:'1 mês grátis'});ok('adulto cria turma',nw.ok&&/^p[a-z0-9]{10}$/.test(nw.c)&&nw.pn==='Studio X'&&nw.m===20,nw);const C=nw.c;
ok('prêmio desligado: não guarda nem devolve',!('pr' in nw)&&store.parceiro.v[1][5]==='',store.parceiro.v[1]);
ok('meta fora da lista vira 20',call('ana','pt-new',{pn:'Studio Y',m:7}).m===20);
call('ana','pt-new',{pn:'Studio Z'});ok('no máximo 3 turmas por dono',call('ana','pt-new',{pn:'Studio W'}).err==='limite');
ok('código inválido recusado',call('bia','pt-join',{c:'x'}).err==='codigo'&&call('bia','pt-join',{c:'pzzzzzzzzzz'}).err==='codigo');
ok('teen não entra pelo link',call('teo','pt-join',{c:C}).err==='idade');
const info=call('bia','pt-info',{c:C});ok('pt-info só nome, meta e contagem',info.ok&&info.pn==='Studio X'&&info.n===0&&Object.keys(info).sort().join()==='c,m,n,ok,pn',info);
ok('bia entra sem top 3',call('bia','pt-join',{c:C,top:0}).n===1);
ok('apelido não é guardado sem o top 3',store.pmembros.v[1][2]==='',store.pmembros.v[1]);
let S=call('ana','pt-stat',{c:C});ok('com 1 participante: ativos e % ocultos',S.ok&&S.n===1&&S.hoje===null&&S.sem===null,S);
ok('quem não é dono não vê o painel',call('bia','pt-stat',{c:C}).err==='dono');
call('zed','pt-join',{c:C,top:1});call('cau','pt-join',{c:C,top:1});call('duda','pt-join',{c:C,top:1});
ok('pt-day fora da turma recusado',call('eli','pt-day',{c:C,f:1}).err==='fora');
call('zed','pt-day',{c:C,f:1});call('cau','pt-day',{c:C,f:1});call('cau','pt-day',{c:C,f:0});
ok('treinou não volta para 0 no mesmo dia',Object.values(JSON.parse(store.pmembros.v.find(r=>r[2]==='cau')[4])).includes(1));
ok('o dia é o do servidor (data mandada pelo app é ignorada)',call('duda','pt-day',{c:C,f:0,d:'2020-01-01'}).ok&&!store.pmembros.v.some(r=>String(r[4]).includes('2020')));
S=call('ana','pt-stat',{c:C});
ok('painel com 4: participantes, ativos hoje e % da semana',S.n===4&&S.hoje===4&&S.sem===50,S);
ok('top 3 só de quem marcou, por dias treinados',S.top.length===3&&S.top.every(t=>['zed','cau','duda'].includes(t.a))&&!S.top.some(t=>t.a==='bia')&&S.top[2].a==='duda',S.top);
ok('painel não devolve uid, dias nem texto livre',JSON.stringify(S).indexOf('uid')<0&&!("dias" in S)&&S.top.every(t=>Object.keys(t).sort().join()==='a,k'),S);
ok('tirar o top 3 apaga o apelido',call('zed','pt-top',{c:C,top:0}).ok&&!call('ana','pt-stat',{c:C}).top.some(t=>t.a==='zed'));
const C2=call('eli','pt-new',{pn:'Academia Y'}).c;call('duda','pt-join',{c:C2});
ok('1 turma de parceiro por vez (entrar em outra tira da antiga)',call('ana','pt-stat',{c:C}).n===3&&call('eli','pt-stat',{c:C2}).n===1);
ok('sair apaga a linha',call('cau','pt-out',{c:C}).ok&&!store.pmembros.v.some(r=>r[1]==='uid5aaaa'&&r[0]===C));
ok('só o dono encerra',call('bia','pt-end',{c:C}).err==='dono');
ok('encerrar apaga turma e participantes',call('ana','pt-end',{c:C}).ok&&!store.pmembros.v.some(r=>r[0]===C)&&!store.parceiro.v.some(r=>r[0]===C));
const realNow=Date.now;Date.now=()=>realNow()+61*864e5;M.muralLimpa();Date.now=realNow;
ok('limpeza: 60 dias sem abrir sai; turma vazia antiga some',store.pmembros.v.length===1&&store.parceiro.v.length===1,{m:store.pmembros.v.length,t:store.parceiro.v.length});
ok('nada do parceiro na planilha do ranking',!sheets.parceiro&&!sheets.pmembros);
console.log(R.join("\n"));process.exit(R.some(x=>x.startsWith("FAIL"))?1:0);
