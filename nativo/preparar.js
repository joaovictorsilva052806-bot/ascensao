// Monta nativo/www a partir do /comecar/ publicado (mesmo app dos testadores), sem mexer no app web.
// Rode na pasta nativo/: node preparar.js
// - Mantém a estrutura de pastas do site (www/comecar/, www/icons/…) para que os caminhos "../" e as
//   chaves de dados (asc-u-*) sejam exatamente as do /comecar/.
// - Troca só o que depende do endereço: no app nativo o endereço é capacitor://localhost, então os links
//   de convite e de agenda apontam para o site público.
// - Injeta ponte.js (recursos nativos: háptico, compartilhar, avisos locais, cópia do progresso).
const fs=require('fs'),path=require('path');
const RAIZ=path.resolve(__dirname,'..'),WWW=path.join(__dirname,'www');
const SITE='https://joaovictorsilva052806-bot.github.io/ascensao/';
fs.rmSync(WWW,{recursive:true,force:true});fs.mkdirSync(path.join(WWW,'comecar'),{recursive:true});
const cp=(a,b)=>{fs.mkdirSync(path.dirname(path.join(WWW,b||a)),{recursive:true});fs.cpSync(path.join(RAIZ,a),path.join(WWW,b||a),{recursive:true});};
for(const f of ['icon-180.png','icon-192.png','icon-512.png','icons'])cp(f);
cp('comecar/manifest.webmanifest');
let s=fs.readFileSync(path.join(RAIZ,'comecar/index.html'),'utf8');
function troca(a,b,min){const n=s.split(a).length-1;if(n<(min||1))throw new Error('preparar.js: não achei «'+a.slice(0,60)+'» ('+n+'x). O app mudou: ajuste a troca.');s=s.split(a).join(b);return n;}
// links de convite (/x/ e /convite/) e do criador: site público
troca('location.origin+location.pathname.replace(/(comecar\\/)?(index\\.html)?$/,"")',JSON.stringify(SITE),2);
// links nas notas da agenda e dos apps: site público do /comecar/
troca('location.href.split("#")[0]',JSON.stringify(SITE+'comecar/'),2);
// ponte nativa antes do primeiro script do app (para valer desde o início)
const ponte=fs.readFileSync(path.join(__dirname,'ponte.js'),'utf8');
const i=s.indexOf('<script');if(i<0)throw new Error('sem <script> no /comecar/');
s=s.slice(0,i)+'<script>'+ponte+'</script>'+s.slice(i);
fs.writeFileSync(path.join(WWW,'comecar/index.html'),s);
// entrada do app nativo: abre o /comecar/ (mesmos caminhos do site)
fs.writeFileSync(path.join(WWW,'index.html'),'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Ascension</title><style>html,body{margin:0;background:#070c17}</style><script>location.replace("comecar/index.html")</script></head><body></body></html>');
console.log('www pronto:',fs.readdirSync(WWW).join(', '));
