// Testa server/mural.gs fora do Google (simula planilha, Drive e cache). Rode: node qa/mural-servidor.test.js (ou passe outro .gs como argumento)
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
const big=Buffer.concat([Buffer.from([0xff,0xd8,0xff,0xe0]),require('crypto').randomBytes(60000)]);const img='data:image/jpeg;base64,'+big.toString('base64');
const R=[];const ok=(m,c,x)=>R.push((c?'PASS ':'FAIL ')+m+(c?'':' · '+JSON.stringify(x)));
ok('token errado recusado',call('ana','list',{tk:'tk'+'A'.repeat(22)}).err==='token');
ok('sem registro de idade recusado',call('ana','list').err==='idade');
ok('teen sem responsável recusado',call('teo','reg',{band:'teen',par:0}).err==='responsavel');
ok('reg ana adulto',call('ana','reg',{band:'adult'}).ok);call('bia','reg',{band:'adult'});ok('reg teo teen',call('teo','reg',{band:'teen',par:1}).ok);call('zed','reg',{band:'adult'});
ok('zed sem amizade com tk não posta',call('zed','post',{img}).err==='amigo');
ok('teo posta',call('teo','post',{img,q:'me chama no zap 3199',cap:'Feito ✅'}).ok);
ok('ana posta',call('ana','post',{img,q:'Correr 5 km',cap:'xxx livre'}).ok);
let la=call('ana','list');ok('ana vê 2 posts',la.posts&&la.posts.length===2,la);ok('foto grande (2 pedaços) volta idêntica',la.posts.every(p=>p.img===img));
const pt=la.posts.find(p=>p.a==='teo'),pa=la.posts.find(p=>p.a==='ana');
ok('texto livre do teen não é guardado',pt.q==='',pt.q);ok('legenda fora da lista vira vazio',pa.cap==='',pa.cap);ok('adulto vê tarefa de adulto',pa.q==='Correr 5 km');
const lt=call('teo','list');ok('teen não vê tarefa de adulto',lt.posts.find(p=>p.a==='ana').q==='');
ok('bia vê só ana (teo não é amigo dela)',call('bia','list').posts.map(p=>p.a).join()==='ana');
ok('zed (amizade sem tk) não vê nada',call('zed','list').posts.length===0);
ok('reação ok',call('bia','react',{id:pa.id,e:'🔥'}).ok);ok('reação fora da lista recusada',call('bia','react',{id:pa.id,e:'💩'}).err==='reacao');
ok('bia não reage a post de não amigo',call('bia','react',{id:pt.id,e:'🔥'}).err==='amigo');
ok('bia não apaga post da ana',call('bia','del',{id:pa.id}).err==='dono');
ok('1 denúncia esconde teen',call('ana','report',{id:pt.id}).ok&&call('ana','list').posts.every(p=>p.a!=='teo')&&call('teo','list').posts.every(p=>p.a!=='teo'));
call('bia','report',{id:pa.id});ok('1 denúncia não esconde adulto para outros',call('teo','list').posts.some(p=>p.a==='ana'));
ok('e-mail a cada denúncia',mails===2,mails);
ok('ana apaga o próprio (foto some)',call('ana','del',{id:pa.id}).ok&&!store.fotos.v.some(r=>r[0]===pa.id));
ok('id não é número',/^m[0-9a-f]{15}$/.test(pt.id),pt.id);
for(let i=0;i<3;i++)call('teo','post',{img});ok('teto de 3 posts/dia',call('teo','post',{img}).err==='limite');
const realNow=Date.now;Date.now=()=>realNow()+8*864e5;M.muralLimpa();Date.now=realNow;ok('limpeza apaga >7 dias (índice e fotos)',store.mural.v.length===1&&store.fotos.v.length===0,store.mural.v.length);
ok('fotos numa planilha própria (nada na planilha do ranking)',created===1&&!sheets.mural&&!sheets.fotos);
ok('img com bytes não-JPEG recusada',call('ana','post',{img:'data:image/jpeg;base64,'+Buffer.from('<svg>').toString('base64')}).err==='tipo');
console.log(R.join("\n"));process.exit(R.some(x=>x.startsWith("FAIL"))?1:0);
