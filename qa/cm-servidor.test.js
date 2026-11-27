// Galeria da Missão Criador no server/mural.gs (fase 3), fora do Google. Rode: node qa/cm-servidor.test.js
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
['ana','bia','teo','zed'].forEach((n,i)=>player(n,'uid'+i+'aaaa'));
resp.v.push(['','F|Ana|Bia||20261125','tk'],['','G|Bia|Ana||20261125','tk'],['','F|Teo|Ana||20261125','tk'],['','G|Ana|Teo||20261125','tk'],['','F|Zed|Ana||20261125',''],['','G|Ana|Zed||20261125','']);
const call=(n,a,o)=>M.doPost({postData:{contents:JSON.stringify(Object.assign({a,n,tk:P[n]},o))}});
const R=[];const ok=(m,c,x)=>R.push((c?'PASS ':'FAIL ')+m+(c?'':' · '+JSON.stringify(x)));
const img='data:image/jpeg;base64,'+Buffer.concat([Buffer.from([0xff,0xd8,0xff,0xe0]),crypto.randomBytes(3000)]).toString('base64');
const G='O reboco custa caro e ninguém junta os vizinhos para comprar junto.';const PR='Juntar 3 vizinhos, medir a calçada e mandar o pedido de rampa pelo site da prefeitura com fotos.';
const base=o=>Object.assign({wk:'2026-W48',tema:0,num:7,u:'casas',cat:'dinheiro',tipo:'politica',custo:'zero',g:G,p:PR,mun:'Contagem'},o||{});
call('ana','reg',{band:'adult'});call('bia','reg',{band:'adult'});call('teo','reg',{band:'teen',par:1});call('zed','reg',{band:'adult'});
ok('sem amizade confirmada não posta',call('zed','cm',base()).err==='amigo');
ok('telefone no gargalo: recusa o post inteiro',call('ana','cm',base({g:'Liga no 31 98765-4321 que eu explico o problema todo da rua.'})).err==='dados');
ok('endereço na proposta: recusa',call('ana','cm',base({p:'Levar o pedido para a Rua das Flores, 120 e juntar todo mundo da quadra para cobrar.'})).err==='dados');
ok('@usuario: recusa',call('ana','cm',base({p:'Falar com @prefeitura_oficial e juntar todo mundo da quadra para cobrar a rampa.'})).err==='dados');
ok('categoria fora da lista: recusa',call('ana','cm',base({cat:'xyz'})).err==='lista');
ok('proposta curta: recusa',call('ana','cm',base({p:'curta'})).err==='curto');
ok('foto que não é JPEG: recusa',call('ana','cm',base({img:'data:image/jpeg;base64,'+Buffer.from('GIF89a....').toString('base64')})).err==='tipo');
let r1=call('ana','cm',base({img,ct:1,num:'7',etapa5:'Ela disse que ajudava'}));ok('ana posta com foto e aceite de contato',r1.ok,r1);
ok('2º post na mesma semana: recusa',call('ana','cm',base()).err==='repetido');
ok('teo (14-17 com responsável) posta',call('teo','cm',base({wk:'2026-W48',tema:3,ct:1,mun:'Contagem'})).ok);
ok('bia posta',call('bia','cm',base({tema:3,cat:'gente',mun:'Contagem'})).ok);
const row=store.cm.v.find(r=>r[1]==='ana');ok('etapa 5 nunca é guardada',!JSON.stringify(store.cm.v).includes('Ela disse'));
const tRow=store.cm.v.find(r=>r[1]==='teo');ok('aceite de contato de 14-17 é ignorado',tRow[20]===0,tRow[20]);ok('aceite de contato de 18+ grava',row[20]===1);
let la=call('ana','cmlist');ok('ana vê 3 (ela + amigos)',la.posts.length===3,la.posts&&la.posts.map(p=>p.a));
ok('foto volta igual',la.posts.find(p=>p.me).img===img);
ok('lista não traz uid, faixa, município nem contato',!/uid|faixa|mun|contato/.test(JSON.stringify(la.posts.map(p=>Object.keys(p)))));
ok('bia não vê teo (não é amiga)',call('bia','cmlist').posts.every(p=>p.a!=='teo'));
ok('zed (amizade sem tk) não vê nada',call('zed','cmlist').posts.length===0);
const pa=la.posts.find(p=>p.a==='ana'),pt=la.posts.find(p=>p.a==='teo');
ok('reação 💡 ok',call('bia','cmreact',{id:pa.id,e:'💡'}).ok);ok('reação fora da lista recusada',call('bia','cmreact',{id:pa.id,e:'🔥'}).err==='reacao');
ok('não apaga post de outro',call('bia','cmdel',{id:pa.id}).err==='dono');
ok('1 denúncia esconde post de 14-17 para todos',call('ana','cmrep',{id:pt.id}).ok&&call('teo','cmlist').posts.every(p=>p.id!==pt.id));
const pb=la.posts.find(p=>p.a==='bia');call('ana','cmrep',{id:pb.id});ok('1 denúncia esconde post de adulto só para quem denunciou',call('bia','cmlist').posts.some(p=>p.id===pb.id)&&call('ana','cmlist').posts.every(p=>p.id!==pb.id));
// painel do criador
ok('sem chave configurada: nada',call('ana','cm-adm',{k:'qualquer-coisa-1234567'}).err==='chave');
props['cm:adm']='chave_de_teste_1234567890abcd';
ok('chave errada: nada',call('ana','cm-adm',{k:'chave_de_teste_1234567890abce'}).err==='chave');
let A=call('ana','cm-adm',{k:'chave_de_teste_1234567890abcd'});ok('chave certa: agregados',A.ok&&A.total===2,A);
ok('agregados sem foto, sem nome de autor e sem gargalo livre',!/data:image|"ana"|"bia"|reboco/.test(JSON.stringify(A.grade))&&!JSON.stringify(A.cats).includes('ana'));
ok('município com menos de 3 posts não aparece',A.grade.every(g=>g.mun===''),A.grade);
ok('mais reagida (anônima) vem no top',A.top&&A.top.p===PR&&!('a' in A.top),A.top);
ok('fila de denunciados tem os 2',A.fila.length===2&&A.fila.some(f=>f.esc),A.fila);
ok('contato: só 18+ com aceite (ana), nunca 14-17',A.contato.length===1&&A.contato[0].a==='ana',A.contato);
ok('moderação: manter devolve o post de 14-17',call('x','cm-adm-mod',{k:props['cm:adm'],id:pt.id,op:'ok'}).ok&&call('ana','cmlist').posts.some(p=>p.id===pt.id));
ok('moderação: apagar',call('x','cm-adm-mod',{k:props['cm:adm'],id:pb.id,op:'del'}).ok&&!store.cm.v.some(r=>r[0]===pb.id));
ok('autor apaga o próprio (e a foto)',call('ana','cmdel',{id:pa.id}).ok&&!(store.fotos&&store.fotos.v.some(r=>r[0]===pa.id)));
// 30 dias
store.cm.v.forEach((r,i)=>{if(i>0)r[4]=Date.now()-31*864e5;});M.muralLimpa();ok('limpeza apaga o que passou de 30 dias',store.cm.v.length===1);
ok('mural continua: ação antiga "list" responde',call('ana','list').ok);
console.log(R.join('\n'));const f=R.filter(x=>x.startsWith('FAIL')).length;console.log('\n'+(R.length-f)+'/'+R.length+' passaram');process.exit(f?1:0);
