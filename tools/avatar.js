// ---------- Avatar do jogador: arte original estilo anime de ação (contorno forte, cel-shading, aura de energia) ----------
// Nada de foto: só formas. Fica no celular (prog.avatar) e, para quem está no ranking, viaja como um código curto.
// Cada classe tem 3 roupas temáticas (roupa + chapéu/acessório + item) e existem 3 roupas genéricas.
const AV_SKIN=["#f6d7c3","#e8b896","#c98e66","#a86b47","#7a4a2e","#4f2f1d","#fbe5d6","#d9a37e","#8d5a3b","#3a2215"];
const AV_SKIN_ORD=[6,0,1,7,2,3,8,4,5,9];
const AV_HAIRC=["#1a1410","#3b2416","#7a4a22","#d8b064","#a8b3c6","#5aa2ff","#a8322a","#eef1f6","#e06aa8","#f08a24","#7b4fd6","#3f8f5a"];
const AV_HAIRCN=["Preto","Castanho escuro","Castanho","Loiro","Prata","Azul","Ruivo","Branco","Rosa","Laranja","Roxo","Verde"];
const AV_EYE=["#5a3a22","#1d1410","#2f78c8","#2e9a5e","#c08a2e","#8a93a6","#8b4fe0","#d43a3a"];
const AV_EYEN=["Castanho","Preto","Azul","Verde","Mel","Cinza","Violeta","Rubi"];
const AV_COL=["#6fb1ff","#35d49a","#f2c14e","#ff6b6b","#b388ff","#ff5fd2","#8cf2ff","#e6ecf7","#ff8a1e","#9be564","#7a8cff","#ff4d6d"];
const AV_COLN=["Azul","Verde","Ouro","Rubi","Violeta","Rosa","Ciano","Prata","Laranja","Lima","Índigo","Carmesim"];
const AV_HAIR=["Raspado","Curto","Longo","Moicano","Cacheado","Coque","Espetado","Franja","Rabo de cavalo","Black power"];
const AV_FACE=["Anguloso","Suave","Marcante"];
const AV_EYES=["Afiado","Redondo","Sereno"];
const AV_BROW=["Sério","Arqueado","Grosso","Fino"];
const AV_MOUTH=["Neutro","Sorriso","Confiante","Determinado"];
const AV_BEARD=["Sem barba","Por fazer","Cheia","Cavanhaque","Bigode","Bigode e cavanhaque"];
const AV_GLS=["Sem óculos","Redondo","Quadrado","Escuro"];
const AV_EAR=["Sem brinco","Argola","Ponto de luz","Piercing"];
const AV_BODY=["Magro","Médio","Forte"];
const AV_ACC=[["Nenhum",1],["Fone HUD",2],["Visor",4],["Anel de aura",7],["Coroa de dados",12],["Asas de luz",18]];
const AV_FRAME=[["Anel",1],["Hexágono",3],["Octógono",6],["Radar",10],["Órbita",15]];
const AV_CLS=["mago","guerreiro","arqueiro","cavaleiro","druida","estudante","universitario","profissional","empreendedor","lar","caminhoneiro","motorista","veterano","atleta","ladino","clerigo","bardo","paladino","realeza","monge"];
// classes de fantasia novas (originais): [id, nome, atributo, nome no nv 10, nome no nv 20]
const AV_FANT2=[["ladino","Ladino","foco","Sombra Veloz","Mestre das Sombras"],["clerigo","Clérigo","mente","Guardião da Luz","Voz da Aurora"],["bardo","Bardo","vendas","Menestrel","Lenda das Canções"],["paladino","Paladino","corpo","Vanguarda","Escudo Eterno"],["realeza","Realeza","vendas","Coroa do Reino","Soberania Lendária"],["monge","Monge","mente","Punho Sereno","Mestre Interior"]];
try{if(typeof CLS_FANT!=="undefined")for(const x of AV_FANT2)if(!CLS_FANT.some(y=>y[0]===x[0]))CLS_FANT.push(x);}catch(e){}
// roupa: [nome, corpo, cabeça (vírgula = mais de uma peça), item]
const AV_GEN=[["Casaco de caçador","coat","",""],["Moletom","hoodie","",""],["Jaqueta de couro","leatherjk","",""]];
const AV_OUT={
  mago:[["Manto arcano","robe","wizhat","staff"],["Manto cósmico","robe2","hood","orb"],["Andarilho rúnico","robe","circlet","staff"]],
  guerreiro:[["Armadura leve","armor","headband","sword"],["Couro de batalha","leather","","sword"],["Elmo de aço","armor","helmet",""]],
  arqueiro:[["Capa da floresta","cloak","hood","bow"],["Patrulheiro","leather","headband","bow"],["Batedor","cloak","","bow"]],
  cavaleiro:[["Tabardo","knight","helmet","shield"],["Armadura fechada","armor","knighthelm","shield"],["Escudeiro","knight","","sword"]],
  druida:[["Manto de folhas","druid","leafcrown","wood"],["Guardião","druid","antlers","wood"],["Raiz","cloak","leafcrown",""]],
  estudante:[["Moletom e fone","hoodie","headphones","book"],["Camisa e óculos","polo","glasses","book"],["Foco total","hoodie","",""]],
  universitario:[["Jaqueta college","varsity","","book"],["Formando","suit","gradcap",""],["Laboratório","labcoat","glasses",""]],
  profissional:[["Terno","suit","",""],["Engenharia","vest","hardhat",""],["Social","shirt","rglasses",""]],
  empreendedor:[["Blazer","blazer","",""],["Executivo","suit","rglasses",""],["Startup","hoodie","headphones",""]],
  lar:[["Avental","apron","",""],["Lenço","apron","bandana",""],["Conforto","cardigan","",""]],
  caminhoneiro:[["Xadrez e boné","plaid","truckcap",""],["Estrada","plaid2","sunglasses",""],["Rei da estrada","denim","truckcap,sunglasses",""]],
  motorista:[["Polo","polo","",""],["Uniforme","driver","drivercap",""],["Óculos escuros","polo","sunglasses",""]],
  veterano:[["Farda","military","beret",""],["Cardigã","cardigan","glasses",""],["Medalhas","military","",""]],
  atleta:[["Camisa de jogo","jersey","headband",""],["Agasalho","track","",""],["Regata","jersey2","headband",""]],
  ladino:[["Capuz das sombras","cloakd","hood","dagger"],["Máscara","leather","mask","dagger"],["Veloz","leatherjk","headband","dagger"]],
  clerigo:[["Veste da aurora","priest","circlet","orb"],["Peregrino","priest","hood","wood"],["Oráculo","robe2","circlet",""]],
  bardo:[["Trovador","bard","feathercap","lute"],["Palco","blazer","headphones","lute"],["Viajante","cloak","feathercap","lute"]],
  paladino:[["Armadura dourada","goldarmor","helmet","shield"],["Juramento","goldarmor","circlet","sword"],["Vanguarda","knight","headband","shield"]],
  realeza:[["Manto real","royal","crown","scepter"],["Gala","gown","tiara",""],["Herdeira do reino","royal","tiara","scepter"]],
  monge:[["Robe","monk","",""],["Disciplina","monk","headband",""],["Contas","monk2","",""]]};
const AV_ALL=AV_GEN.concat(...Object.keys(AV_OUT).map(k=>AV_OUT[k]));
const AV_HEADS=[["Chapéu de mago","wizhat"],["Capuz","hood"],["Diadema","circlet"],["Elmo","helmet"],["Elmo fechado","knighthelm"],["Faixa","headband"],["Coroa de folhas","leafcrown"],["Galhada","antlers"],["Fone","headphones"],["Capelo","gradcap"],["Capacete de obra","hardhat"],["Lenço","bandana"],["Boné","truckcap"],["Quepe","drivercap"],["Boina","beret"],["Máscara","mask"],["Chapéu de pena","feathercap"],["Tiara","tiara"],["Coroa","crown"]];
const AV_ITEMS=[["Cajado","staff"],["Orbe","orb"],["Espada","sword"],["Arco","bow"],["Escudo","shield"],["Cajado de madeira","wood"],["Livro","book"],["Adaga","dagger"],["Alaúde","lute"],["Cetro","scepter"]];
function avOuts(cls){return (AV_OUT[cls]||[]).concat(AV_GEN);}
// roupa efetiva: o=0 segue a classe (1ª roupa dela); o>=1 é uma roupa escolhida da lista completa
function avOutOf(o){return o.o>0?(AV_ALL[o.o-1]||AV_GEN[0]):((AV_OUT[o.cls]||AV_GEN)[0]);}
function avLv(){try{return levelOf(totalXP());}catch(e){return 1;}}
function avCls(){try{const c=rpgState().cls;return c&&AV_CLS.includes(c.id)?c.id:"x";}catch(e){return "x";}}
function avEvo(){const l=avLv();return l>=20?2:l>=10?1:0;}
// campos do código público, na ordem, com o tamanho de cada lista
const AV_F=[["s",()=>AV_SKIN.length],["h",()=>AV_HAIR.length],["hc",()=>AV_HAIRC.length],["c",()=>AV_COL.length],["a",()=>AV_ACC.length],["f",()=>AV_FRAME.length],["e",()=>3],
  ["y",()=>AV_EYE.length],["r",()=>AV_FACE.length],["o",()=>AV_ALL.length+1],["bd",()=>AV_BEARD.length],["bw",()=>AV_BROW.length],["gl",()=>AV_GLS.length],["er",()=>AV_EAR.length],
  ["bt",()=>AV_BODY.length],["mo",()=>AV_MOUTH.length],["es",()=>AV_EYES.length],["hw",()=>AV_HEADS.length+2],["it",()=>AV_ITEMS.length+2],["px",()=>AV_CLS.length+1]];
function avSt(){if(!prog.avatar||typeof prog.avatar!=="object"){let h=0;for(const ch of String((cfg&&cfg.name)||"a"))h=(h*31+ch.charCodeAt(0))>>>0;prog.avatar={s:h%6,h:1+(h>>3)%9,hc:(h>>5)%4,c:(h>>7)%8,a:0,f:0,y:(h>>9)%2,r:(h>>11)%3,bt:1};}
  const a=prog.avatar;for(const [k] of AV_F)if(k!=="e"&&!Number.isFinite(a[k]))a[k]=k==="bt"?1:0;return a;}
// código público: classe + números (só dígitos e pontos). Códigos antigos de 8 campos continuam valendo.
function avCode(){const a=avSt();let px=0;try{const p=(rpgState().past||[]).slice(-1)[0];px=p?AV_CLS.indexOf(p.id)+1:0;}catch(e){}
  return [avCls()].concat(AV_F.map(([k])=>k==="e"?avEvo():k==="px"?px:a[k])).join(".");}
function avParse(code){const m=/^([a-z]{1,14})((?:\.\d{1,2}){7,24})$/.exec(String(code||"").trim());if(!m)return null;
  const v=m[2].slice(1).split(".").map(Number);const o={cls:AV_CLS.includes(m[1])?m[1]:"x"};
  AV_F.forEach(([k,n],i)=>{const x=v[i]||0;o[k]=k==="e"?Math.min(2,x):x%n();});if(v.length<15)o.bt=1;return o;}
// Só números e cores de listas fixas entram no SVG (seguro para innerHTML)
function avSh(h,k){const n=parseInt(String(h).slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return "#"+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1);}
const AV_INK="#0a0f1c",AV_OL=' stroke="#0a0f1c" stroke-width="1.4" stroke-linejoin="round"';
const AV_SH="M10 100 L13 82 Q16 73 32 69.5 L43 66 L50 73 L57 66 L68 69.5 Q84 73 87 82 L90 100Z";
const AV_SHD="M57 66 L68 69.5 Q84 73 87 82 L90 100 L63 100 L61 79Z";
function avMir(s){return '<g transform="matrix(-1 0 0 1 100 0)">'+s+'</g>';}
function avStar(x,y,r,fill){let d="";for(let i=0;i<10;i++){const a=Math.PI/5*i-Math.PI/2,rr=i%2?r*.45:r;d+=(i?"L":"M")+(x+rr*Math.cos(a)).toFixed(2)+" "+(y+rr*Math.sin(a)).toFixed(2)+" ";}return '<path d="'+d+'Z" fill="'+fill+'"/>';}
function avCirc(x,y,r){return "M"+(x-r)+" "+y+" a"+r+" "+r+" 0 1 0 "+(2*r)+" 0 a"+r+" "+r+" 0 1 0 "+(-2*r)+" 0Z";}
function avBody(k,P){const {C,CL,S,id,o}=P,OL=AV_OL,base=f=>'<path d="'+AV_SH+'" fill="'+f+'"'+OL+'/>';
  const V=(f)=>'<path d="M43 66 L50 80 L57 66Z" fill="'+f+'"'+OL+'/>';
  const pads=(f)=>{const p='<path d="M11 86 Q12 71 29 68.5 Q36.5 69 38 76 Q27 75.5 13 87Z" fill="'+f+'"'+OL+'/><circle cx="20" cy="76" r="1" fill="'+AV_INK+'"/><circle cx="28" cy="72.5" r="1" fill="'+AV_INK+'"/>';return p+avMir(p);};
  const plaid=(b)=>'<defs><pattern id="p'+id+'" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="'+b+'"/><path d="M0 2h7M2 0v7" stroke="#000" stroke-opacity=".38" stroke-width="2"/><path d="M0 5.5h7M5.5 0v7" stroke="#fff" stroke-opacity=".2" stroke-width="1"/></pattern></defs>'+base("url(#p"+id+")")+'<path d="M44 66 L50 71.5 L56 66Z" fill="#eef2f8"/><path d="M43 66 L46 74.5 L50 70.5Z M57 66 L54 74.5 L50 70.5Z" fill="'+avSh(b,-.15)+'"'+OL+'/><path d="M58 79 h8 v6 h-8Z" fill="none" stroke="#000" stroke-opacity=".45"/>';
  const R=avSh(C,-.58);
  switch(k){
  case "robe":{const m='<path d="M13 82 Q16 73 32 69.5 L43 66 Q39 76 31 77.5 Q26 84 20 82 Q16 86 13 85Z" fill="'+avSh(R,.22)+'"'+OL+'/>';
    return base(R)+V("#0c0a1c")+'<path d="M43 66 L50 80 L57 66" stroke="#f2c14e" stroke-width="1.6" fill="none"/>'+m+avMir(m)+avStar(24,90,2.6,CL)+avStar(75,92,2.2,CL)+avStar(33,97,1.6,CL)+'<circle cx="50" cy="84" r="6" fill="'+C+'" fill-opacity=".28"/><circle cx="50" cy="84" r="3" fill="'+CL+'"'+OL+'/>';}
  case "robe2":{const c='<path d="M41.5 67 L28 53 L36 71Z" fill="'+avSh(R,.2)+'"'+OL+'/><path d="M41.5 67 L28 53" stroke="'+C+'" stroke-width="1.2"/>';
    return base(R)+'<path d="M43 66 L50 82 L57 66Z" fill="'+C+'" fill-opacity=".55"'+OL+'/>'+c+avMir(c)+'<g fill="'+CL+'"><circle cx="22" cy="88" r=".9"/><circle cx="30" cy="94" r="1.2"/><circle cx="70" cy="86" r="1"/><circle cx="78" cy="94" r=".9"/><circle cx="64" cy="97" r=".8"/></g>'+avStar(26,82,1.8,CL)+avStar(73,80,1.6,CL);}
  case "armor":return base("#5b6577")+'<path d="M39 72 L61 72 L59 91 L50 98 L41 91Z" fill="#8d98ab"'+OL+'/><path d="M41 80 L59 80 M42 87 L58 87" stroke="#4a5262" stroke-width="1.2"/><path d="M50 74.5 L53 78.5 L50 82.5 L47 78.5Z" fill="'+C+'"'+OL+'/>'+pads("#9aa7bd");
  case "leather":return base("#5a3b25")+V("#2b1a10")+'<path d="M28 71 L68 100" stroke="'+AV_INK+'" stroke-width="6"/><path d="M28 71 L68 100" stroke="#2b1a10" stroke-width="4"/><rect x="44" y="81.5" width="6" height="5" rx="1" fill="#f2c14e"'+OL+'/>'+'<path d="M11 86 Q12 72 28 69 Q34 70 35 75 Q25 76 13 87Z" fill="#3b2616"'+OL+'/>';
  case "cloak":return base("#2c5e3f")+V("#1d3b29")+'<path d="M24 100 Q26 86 30 76 M76 100 Q74 86 70 76" stroke="#163322" stroke-width="1.4" fill="none"/><circle cx="50" cy="73" r="2.6" fill="'+C+'"'+OL+'/>';
  case "knight":return base("#5b6577")+'<path d="M41 72 L59 72 L58 100 L42 100Z" fill="'+C+'"'+OL+'/><path d="M48.6 77 h2.8 v5 h5 v2.8 h-5 v9 h-2.8 v-9 h-5 v-2.8 h5Z" fill="#eef2f8"/>'+pads("#9aa7bd");
  case "druid":return base("#3d5a2e")+V("#24361b")+'<path d="M18 92 Q28 84 36 90 T54 92 T76 88" stroke="#8fd96b" stroke-width="1.3" fill="none"/><path d="M36 72 q4 -6 10 -3 q-4 6 -10 3Z M64 72 q-4 -6 -10 -3 q4 6 10 3Z M44 78 q6 -4 12 0 q-6 4 -12 0Z" fill="#35d49a"'+OL+'/>';
  case "hoodie":{const h=avSh(C,-.45);return base(h)+'<path d="M35 71 Q50 80 65 71 Q62 64.5 50 67 Q38 64.5 35 71Z" fill="'+avSh(h,-.3)+'"'+OL+'/><path d="M47 75 L46.4 86 M53 75 L53.6 86" stroke="#e6ecf7" stroke-width="1.1"/><circle cx="46.4" cy="86.6" r="1" fill="#e6ecf7"/><circle cx="53.6" cy="86.6" r="1" fill="#e6ecf7"/><path d="M38 93 L62 93 L60 100 L40 100Z" fill="'+avSh(h,-.18)+'"'+OL+'/>';}
  case "polo":{const p=avSh(C,-.25);return base(p)+'<path d="M43 66 L50 72 L57 66 L59 70.5 L50 76.5 L41 70.5Z" fill="'+avSh(p,.3)+'"'+OL+'/><path d="M50 72 L50 85" stroke="'+AV_INK+'" stroke-width=".9"/><circle cx="50" cy="79" r=".8" fill="'+AV_INK+'"/><circle cx="50" cy="83" r=".8" fill="'+AV_INK+'"/>';}
  case "varsity":{const s='<path d="M10 100 L13 82 Q16 73 32 69.5 L34 76 Q23 80 21 100Z" fill="#efe6d2"'+OL+'/>';return base("#1b2747")+s+avMir(s)+'<path d="M43 66 L50 73 L57 66" stroke="'+C+'" stroke-width="2.6" fill="none"/>'+avStar(39,86,4,C)+'<g fill="#efe6d2"><circle cx="52" cy="80" r=".9"/><circle cx="52" cy="86" r=".9"/><circle cx="52" cy="92" r=".9"/></g>';}
  case "suit":{const l='<path d="M43 66 L40 72 L46 86 L50 81Z" fill="#121826"'+OL+'/>';return base("#1c2233")+V("#e6ecf7")+'<path d="M48.8 70.5 L51.2 70.5 L52.4 86 L50 90 L47.6 86Z" fill="'+C+'"'+OL+'/>'+l+avMir(l)+'<path d="M62 80 L67 79 L66.5 82 L62.4 82.6Z" fill="'+C+'"/>';}
  case "blazer":{const b=avSh(C,-.5),l='<path d="M43 66 L40 72 L46 87 L50 81Z" fill="'+avSh(b,-.3)+'"'+OL+'/>';return base(b)+V("#111827")+l+avMir(l)+'<path d="M62 80 L67 79 L66.5 82 L62.4 82.6Z" fill="#eef2f8"/>';}
  case "shirt":{const s=avSh(C,.55);return base(s)+'<path d="M43 66 L46.5 74.5 L50 70.5Z M57 66 L53.5 74.5 L50 70.5Z" fill="#fff"'+OL+'/><path d="M50 71 L50 100" stroke="'+avSh(s,-.3)+'" stroke-width="1"/><g fill="'+avSh(s,-.45)+'"><circle cx="51.6" cy="78" r=".7"/><circle cx="51.6" cy="85" r=".7"/><circle cx="51.6" cy="92" r=".7"/></g><path d="M34 80 h8 v6 h-8Z" fill="none" stroke="'+avSh(s,-.35)+'"/>';}
  case "labcoat":{const l='<path d="M43 66 L39 73 L46 90 L50 82Z" fill="#dfe5ee"'+OL+'/>';return base("#eef2f8")+V(avSh(C,-.2))+l+avMir(l)+'<path d="M60 82 h8 v8 h-8Z" fill="none" stroke="#9aa7bd"/><path d="M62 82 L62 78 M65 82 L65 77" stroke="'+C+'" stroke-width="1.4"/>';}
  case "vest":{const v='<path d="M14.5 82 Q18 74 33 70.4 L43 67 L46.5 100 L12 100Z" fill="#ff8a1e"'+OL+'/>';return base("#3d6ea8")+'<path d="M43 66 L46.5 73 L50 70Z M57 66 L53.5 73 L50 70Z" fill="#6f9bd0"'+OL+'/>'+v+avMir(v)+'<path d="M12.6 89 L45.9 89 M54.1 89 L87.4 89 M12.3 95 L46.3 95 M53.7 95 L87.7 95" stroke="#eef2f8" stroke-width="2.3"/>';}
  case "apron":{const t=avSh(C,-.2);return base(t)+'<path d="M39 76 L61 76 L63 100 L37 100Z" fill="#eef2f8"'+OL+'/><path d="M40 76 L44 67 M60 76 L56 67" stroke="#eef2f8" stroke-width="2"/><path d="M50 91 L45.5 86.5 A2.6 2.6 0 0 1 50 83 A2.6 2.6 0 0 1 54.5 86.5Z" fill="'+C+'"/>';}
  case "cardigan":return base("#7a5a4a")+'<path d="M43 66 L50 85 L57 66Z" fill="#e6ecf7"'+OL+'/><g fill="#3b2a22"><circle cx="47.5" cy="88" r="1"/><circle cx="47" cy="94" r="1"/></g><path d="M22 86 q3 3 0 6 q-3 3 0 6 M78 86 q-3 3 0 6 q3 3 0 6" stroke="#5e4438" stroke-width="1.2" fill="none"/>';
  case "plaid":return plaid("#b3342b");
  case "plaid2":return plaid("#2f5f9e");
  case "denim":return base("#3b5a8a")+'<path d="M44 66 L50 72 L56 66Z" fill="'+avSh(C,-.2)+'"/><path d="M43 66 L46 75 L50 71Z M57 66 L54 75 L50 71Z" fill="#4c6ea2"'+OL+'/><path d="M31 74 L33 100 M69 74 L67 100" stroke="#d8b064" stroke-width="1" stroke-dasharray="2 2"/><g fill="#d8b064"><circle cx="52" cy="80" r="1"/><circle cx="52" cy="87" r="1"/><circle cx="52" cy="94" r="1"/></g>';
  case "driver":{const e='<path d="M17 79 L31 72 L32 75 L18.5 82Z" fill="'+C+'"'+OL+'/>';return base("#1b2a4a")+V("#e6ecf7")+'<path d="M49 71 L51 71 L51.8 84 L50 87 L48.2 84Z" fill="#0d1424"/>'+e+avMir(e)+avStar(64,81,2.6,"#f2c14e");}
  case "military":return base("#4b5a35")+'<path d="M22 82 h11 v7 h-11Z M67 82 h11 v7 h-11Z" fill="none" stroke="#2f3a20" stroke-width="1.2"/><path d="M43 66 L46 74 L50 70Z M57 66 L54 74 L50 70Z" fill="#3a4728"'+OL+'/><g fill="#f2c14e"'+OL+'><circle cx="50" cy="80" r="1.2"/><circle cx="50" cy="87" r="1.2"/><circle cx="50" cy="94" r="1.2"/></g><rect x="58" y="74.5" width="4" height="3" fill="'+C+'"/><rect x="63" y="74.5" width="4" height="3" fill="#ff6b6b"/><circle cx="60" cy="80" r="1.6" fill="#f2c14e"'+OL+'/><circle cx="65" cy="80" r="1.6" fill="#f2c14e"'+OL+'/>';
  case "jersey":return base(C)+'<path d="M43 66 L50 74 L57 66" stroke="#eef2f8" stroke-width="2.2" fill="none"/><path d="M16 84 L20 100 M84 84 L80 100" stroke="#eef2f8" stroke-width="2"/><text x="50" y="94" text-anchor="middle" font-size="13" font-family="monospace" font-weight="900" fill="#eef2f8" stroke="'+AV_INK+'" stroke-width=".8">'+(10+o.c)+'</text>';
  case "track":{const t=avSh(C,-.5),s='<path d="M14 85 Q18 74.5 32 71" stroke="#eef2f8" stroke-width="1.6" fill="none"/><path d="M16.5 87 Q20 77 33 73.5" stroke="#eef2f8" stroke-width="1.6" fill="none"/>';return base(t)+'<path d="M44 66 L50 70 L56 66 L56 69 L50 73 L44 69Z" fill="'+avSh(t,-.3)+'"'+OL+'/><path d="M50 72 L50 100" stroke="#eef2f8" stroke-width="1.2"/>'+s+avMir(s);}
  case "jersey2":return base(S)+'<path d="M30 100 L32 76 Q36 70 42 68 L50 74 L58 68 Q64 70 68 76 L70 100Z" fill="'+C+'"'+OL+'/><text x="50" y="93" text-anchor="middle" font-size="11" font-family="monospace" font-weight="900" fill="#eef2f8" stroke="'+AV_INK+'" stroke-width=".7">'+(10+o.c)+'</text>';
  case "leatherjk":{const l='<path d="M43 66 L38 71 L45 80 L48 71Z" fill="#2a2a32"'+OL+'/>';return base("#1a1a1f")+'<path d="M43 66 L50 73 L57 66 L55 100 L45 100Z" fill="'+avSh(C,-.3)+'"/>'+l+avMir(l)+'<path d="M53 75 L55 100" stroke="#9aa7bd" stroke-width="1.2"/><path d="M20 90 Q30 86 36 94" stroke="'+C+'" stroke-width=".8" stroke-dasharray="1.5 1.5" fill="none"/>';}
  case "cloakd":return base("#1e2230")+V("#11141d")+'<path d="M24 100 Q26 86 30 76 M76 100 Q74 86 70 76" stroke="#0b0d14" stroke-width="1.4" fill="none"/><path d="M28 72 L68 100" stroke="#3a3f52" stroke-width="2.4"/><circle cx="50" cy="73" r="2.6" fill="'+C+'"'+OL+'/>';
  case "priest":return base("#eef2f8")+'<path d="M43 66 L50 80 L57 66" stroke="#f2c14e" stroke-width="2" fill="none"/><path d="M30 72 L66 100 L58 100 L26 76Z" fill="'+C+'"'+OL+'/><circle cx="50" cy="88" r="4" fill="#f2c14e"'+OL+'/><path d="M50 81 L50 83 M50 93 L50 95 M43 88 L45 88 M55 88 L57 88 M45 83 L46.4 84.4 M55 83 L53.6 84.4 M45 93 L46.4 91.6 M55 93 L53.6 91.6" stroke="#f2c14e" stroke-width="1.2"/>';
  case "bard":{const pf='<path d="M12 86 Q11 72 27 69 Q36 69 37 77 Q27 77 14 88Z" fill="'+avSh(C,.25)+'"'+OL+'/><path d="M17 74 L22 84 M24 71 L28 80 M31 70 L33 77" stroke="'+avSh(C,-.45)+'" stroke-width="1.6"/>';return base(avSh(C,-.35))+V("#eef2f8")+'<path d="M45 70 L55 70 M44.6 74 L55.4 74 M45.8 78 L54.2 78" stroke="'+avSh(C,-.6)+'" stroke-width="1"/>'+pf+avMir(pf)+'<path d="M38 90 Q50 96 62 90" stroke="#f2c14e" stroke-width="1.6" fill="none"/>';}
  case "goldarmor":{const g="#c9a24a",gl="#e8c766";return base(g)+'<path d="M39 72 L61 72 L59 91 L50 98 L41 91Z" fill="'+gl+'"'+OL+'/><path d="M41 80 L59 80 M42 87 L58 87" stroke="#9c7a2c" stroke-width="1.2"/>'+avStar(50,79,3.6,"#fff7d6")+pads(gl)+'<path d="M16 80 Q20 74 28 72" stroke="#fff7d6" stroke-width="1.2" fill="none"/>';}
  case "royal":{const rc=avSh(C,-.4),fur='<path d="M24 76 Q34 64 44 66 L47 74 Q36 72 28 82Z" fill="#f4f6fb"'+OL+'/><g fill="'+AV_INK+'"><circle cx="31" cy="74" r=".8"/><circle cx="38" cy="70" r=".8"/><circle cx="34" cy="78" r=".8"/></g>';return base(rc)+V("#f4f6fb")+fur+avMir(fur)+'<path d="M40 80 Q50 90 60 80" stroke="#f2c14e" stroke-width="1.8" fill="none"/><circle cx="50" cy="87" r="2.6" fill="'+CL+'"'+OL+'/>';}
  case "gown":return base(S)+'<path d="M22 100 L26 80 Q38 75 50 78 Q62 75 74 80 L78 100Z" fill="'+C+'"'+OL+'/><path d="M30 82 Q50 78 70 82" stroke="'+avSh(C,.5)+'" stroke-width="1.4" fill="none"/><path d="M44 66 Q50 72 56 66" stroke="#f2c14e" stroke-width="1.3" fill="none"/><circle cx="50" cy="71" r="1.6" fill="'+CL+'"'+OL+'/>';
  case "monk":return base("#d9822b")+'<path d="M40 66 L62 100 L54 100 L36 70Z" fill="#b8661c"'+OL+'/><path d="M26 92 L74 92 L74 96 L26 96Z" fill="#5a3b25"'+OL+'/>';
  case "monk2":{let bd="";for(let i=0;i<9;i++){const t=Math.PI*(i/8),x=50-11*Math.cos(t),y=70+9*Math.sin(t);bd+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="1.6" fill="#6b4a2a"'+OL+'/>';}return base("#d9822b")+'<path d="M40 66 L62 100 L54 100 L36 70Z" fill="#b8661c"'+OL+'/>'+bd+'<circle cx="50" cy="81" r="2.4" fill="'+C+'"'+OL+'/>';}
  default:{const J="#141c30",fl='<path d="M41 66.5 L36 72.5 L44.5 79 L47.5 70Z" fill="'+J+'"'+OL+'/>';return base(J)+'<path d="M43 66 L50 73 L57 66 L55 100 L45 100Z" fill="#0d1424"/>'+fl+avMir(fl)+'<path d="M36 72.5 L44.5 79 M64 72.5 L55.5 79 M45.5 80 L46.5 100 M54.5 80 L53.5 100" stroke="'+C+'" stroke-width="1.3" fill="none"/>';}}}
// cabeça: {b: atrás da cabeça, f: na frente}
function avHead(k,P){const {C,CL,R,K}=P,OL=AV_OL,I=AV_INK;
  const leaf=(x,y,r)=>'<path d="M'+x+' '+y+' q2.6 -4 0 -7.4 q-2.6 3.4 0 7.4Z" fill="#35d49a"'+OL+' transform="rotate('+r+' '+x+' '+y+')"/>';
  const crown='<path d="M34 36 Q50 29.5 66 36" stroke="'+I+'" stroke-width="3.4" fill="none"/><path d="M34 36 Q50 29.5 66 36" stroke="#2e6b3a" stroke-width="2" fill="none"/>'+leaf(37,35,-40)+leaf(43,32.5,-18)+leaf(50,31.5,0)+leaf(57,32.5,18)+leaf(63,35,40);
  switch(k){
  case "wizhat":return {f:'<path d="M19 35 Q50 45 81 35 Q50 26 19 35Z" fill="'+R+'"'+OL+'/><path d="M33 34 Q38 17 51 6 Q61 1.5 69 11 Q61 9.5 59 16 Q63 26 67 34 Q50 30 33 34Z" fill="'+R+'"'+OL+'/><path d="M33.5 31.5 Q50 27.4 66.5 31.5 L67 34 Q50 30 33 34Z" fill="'+C+'"/>'+avStar(52,19,3,"#f2c14e")+avStar(60,26,1.5,CL)};
  case "hood":return {b:'<path d="M27 64 Q22 30 50 17 Q78 30 73 64 L66 72 L34 72Z" fill="'+K+'"'+OL+'/>',f:'<path d="M31.5 54 Q29 24 50 20 Q71 24 68.5 54 Q67 31 50 28 Q33 31 31.5 54Z" fill="'+avSh(K,-.25)+'"'+OL+'/>',nob:1};
  case "circlet":return {f:'<path d="M34.5 36.5 Q50 31 65.5 36.5" stroke="'+I+'" stroke-width="3" fill="none"/><path d="M34.5 36.5 Q50 31 65.5 36.5" stroke="#f2c14e" stroke-width="1.6" fill="none"/><circle cx="50" cy="34.4" r="4.4" fill="'+C+'" fill-opacity=".3"/><path d="M50 31.2 L52.5 34.4 L50 37.6 L47.5 34.4Z" fill="'+CL+'"'+OL+'/>'};
  case "helmet":return {f:'<path d="M32.5 45 Q31.5 21 50 20 Q68.5 21 67.5 45 L63.5 45 Q63 30 50 29 Q37 30 36.5 45Z" fill="#9aa7bd"'+OL+'/><path d="M48.6 29 L51.4 29 L51 41 L49 41Z" fill="#9aa7bd"'+OL+'/><path d="M47.5 20.5 Q49 9 60 10 Q55 14 53 20.5Z" fill="'+C+'"'+OL+'/><path d="M37 26 Q44 22 50 22" stroke="#eef2f8" stroke-opacity=".7" stroke-width="1.4" fill="none"/>'};
  case "knighthelm":return {f:'<path d="M31.5 54 Q30.5 21 50 20 Q69.5 21 68.5 54 Q60 62.5 50 62.5 Q40 62.5 31.5 54Z" fill="#9aa7bd"'+OL+'/><path d="M36 42 L64 42 L63 46.5 L37 46.5Z" fill="'+I+'"/><path d="M38.5 44.2 L61.5 44.2" stroke="'+C+'" stroke-width="1.3"/><path d="M50 48 L50 60 M45 51 L45 57 M55 51 L55 57" stroke="#6b7486" stroke-width="1"/><path d="M50 20 Q62 7 71 13 Q60 15 53 22Z" fill="'+C+'"'+OL+'/><path d="M37 28 Q43 23.5 50 23" stroke="#eef2f8" stroke-opacity=".7" stroke-width="1.4" fill="none"/>',nob:1,nof:1,noface:1};
  case "headband":return {f:'<path d="M34.3 34.5 Q50 30 65.7 34.5 L65.8 38.2 Q50 33.8 34.2 38.2Z" fill="'+C+'"'+OL+'/><path d="M65 35.5 L78 32.5 L73.5 37.5 L79 41.5 L65 38Z" fill="'+C+'"'+OL+'/>'};
  case "leafcrown":return {f:crown};
  case "antlers":{const a='<path d="M38 31 L31 15 M33 21 L26 17 M31.5 16 L33 9" fill="none" stroke="'+I+'" stroke-width="4" stroke-linecap="round"/><path d="M38 31 L31 15 M33 21 L26 17 M31.5 16 L33 9" fill="none" stroke="#c9a25a" stroke-width="2.4" stroke-linecap="round"/>';return {f:a+avMir(a)+crown};}
  case "headphones":return {f:'<path d="M32 46 Q31 21.5 50 21.5 Q69 21.5 68 46" fill="none" stroke="'+I+'" stroke-width="4.2"/><path d="M32 46 Q31 21.5 50 21.5 Q69 21.5 68 46" fill="none" stroke="'+C+'" stroke-width="2.4"/><rect x="28.5" y="40.5" width="7" height="11" rx="3" fill="'+C+'"'+OL+'/><rect x="64.5" y="40.5" width="7" height="11" rx="3" fill="'+C+'"'+OL+'/>'};
  case "glasses":return {f:'<g fill="#bfe3ff" fill-opacity=".14" stroke="'+I+'" stroke-width="1.3"><circle cx="43" cy="45.3" r="4.3"/><circle cx="57" cy="45.3" r="4.3"/></g><path d="M47.3 45 Q50 43.6 52.7 45" stroke="'+I+'" stroke-width="1.2" fill="none"/>'};
  case "rglasses":return {f:'<g fill="#bfe3ff" fill-opacity=".14" stroke="'+I+'" stroke-width="1.4"><rect x="37.6" y="42.3" width="9.6" height="6.2" rx="1.4"/><rect x="52.8" y="42.3" width="9.6" height="6.2" rx="1.4"/></g><path d="M47.2 44.5 L52.8 44.5" stroke="'+I+'" stroke-width="1.2"/>'};
  case "gradcap":return {f:'<path d="M37 32 L37 38 Q50 43 63 38 L63 32Z" fill="#111c33"'+OL+'/><path d="M26 29 L50 20 L74 29 L50 38Z" fill="#111c33"'+OL+'/><path d="M50 29 L71 31 L71 41" stroke="#f2c14e" stroke-width="1.4" fill="none"/><circle cx="71" cy="42" r="1.6" fill="#f2c14e"/>'};
  case "hardhat":return {f:'<path d="M33 39 Q32.5 21 50 21 Q67.5 21 67 39Z" fill="#f2c14e"'+OL+'/><path d="M29.5 38.5 L70.5 38.5 Q71 42 67 42 L33 42 Q29 42 29.5 38.5Z" fill="#e0ad2e"'+OL+'/><path d="M50 21.5 L50 38 M44 23 L43 38 M56 23 L57 38" stroke="#c99320" stroke-width="1.4"/><path d="M37 28 Q41 24 46 23" stroke="#fff3c4" stroke-width="1.4" fill="none"/>'};
  case "bandana":return {f:'<path d="M33.5 40 Q33 23 50 23 Q67 23 66.5 40 Q58 33 50 33.5 Q42 33 33.5 40Z" fill="'+C+'"'+OL+'/><g fill="#fff" fill-opacity=".65"><circle cx="42" cy="29" r="1"/><circle cx="50" cy="27" r="1"/><circle cx="58" cy="29" r="1"/><circle cx="46" cy="31.6" r=".8"/><circle cx="54" cy="31.6" r=".8"/></g><path d="M66 36 L73 44 L68 45.5Z" fill="'+C+'"'+OL+'/>'};
  case "truckcap":{const cc=avSh(C,-.35);return {f:'<path d="M33 38.5 Q33 22.5 50 22.5 Q67 22.5 67 38.5Z" fill="'+cc+'"'+OL+'/><path d="M38.5 37.5 Q38.5 24.2 50 23.6 Q61.5 24.2 61.5 37.5Z" fill="#eef2f8"'+OL+'/><path d="M44.5 27.5 h11 v5.4 h-11Z" fill="'+C+'"'+OL+'/><path d="M31 38.5 Q50 35 71 38 Q72.5 42 65 42 Q50 39.6 31 41.6Z" fill="'+cc+'"'+OL+'/>',nobrow:1};}
  case "sunglasses":{const l='<path d="M37.3 42.6 L47.6 42.6 Q47.8 48.8 42.6 48.8 Q37.4 48.6 37.3 42.6Z" fill="#101826"'+OL+'/><path d="M39.2 44 L43.4 44" stroke="#9fd4ff" stroke-opacity=".65" stroke-width="1"/><path d="M37.3 43 L34 42" stroke="'+I+'" stroke-width="1.1"/>';return {f:l+avMir(l)+'<path d="M47.6 43.4 Q50 42.2 52.4 43.4" stroke="'+I+'" stroke-width="1.2" fill="none"/>',noeye:1};}
  case "drivercap":return {f:'<path d="M32 36 Q31 24 50 23 Q69 24 68 36 Q50 33 32 36Z" fill="#1b2a4a"'+OL+'/><path d="M33 36 Q50 33 67 36 L66.5 39 Q50 36.5 33.5 39Z" fill="'+I+'"/><path d="M36 39 Q50 37 64 39 Q60 42.6 50 42 Q40 42.6 36 39Z" fill="#0d1424"'+OL+'/>'+avStar(50,29.5,3,"#f2c14e"),nobrow:1};
  case "beret":return {f:'<path d="M32.5 36 Q33 22 52 21.5 Q71 23 69 34 Q62 30.5 50 31 Q40 31.5 32.5 36Z" fill="#4b5a35"'+OL+'/><circle cx="40" cy="30" r="2.2" fill="#f2c14e"'+OL+'/>'};
  case "mask":return {f:'<path d="M35.6 49.5 Q50 46.5 64.4 49.5 L63.6 56 Q58.5 62 50 64.8 Q41.5 62 36.4 56Z" fill="#1e2230"'+OL+'/><path d="M38 52 Q50 50 62 52" stroke="#3a3f52" stroke-width="1" fill="none"/>',nomouth:1};
  case "feathercap":return {f:'<path d="M31 37 Q30 25 48 23 Q66 22 70 33 Q60 31 50 32.5 Q40 33.5 31 37Z" fill="'+avSh(C,-.35)+'"'+OL+'/><path d="M58 27 Q72 14 84 12 Q76 20 62 30Z" fill="'+CL+'"'+OL+'/><path d="M60 28 Q72 18 82 13" stroke="'+avSh(C,-.4)+'" stroke-width=".8" fill="none"/>'};
  case "tiara":return {f:'<path d="M37 33 Q50 27 63 33" stroke="'+I+'" stroke-width="2.8" fill="none"/><path d="M37 33 Q50 27 63 33" stroke="#f2c14e" stroke-width="1.4" fill="none"/><path d="M44 30 L46 25.5 L48 29.4 L50 23 L52 29.4 L54 25.5 L56 30" fill="#f2c14e"'+OL+'/><circle cx="50" cy="28.6" r="1.6" fill="'+CL+'"'+OL+'/>'};
  case "crown":return {f:'<path d="M35 30 L37 16 L43 24 L50 12 L57 24 L63 16 L65 30Z" fill="#f2c14e"'+OL+'/><path d="M35 30 L65 30 L65 33.6 L35 33.6Z" fill="#d9a92e"'+OL+'/><circle cx="50" cy="31.8" r="1.6" fill="'+C+'"/><circle cx="42" cy="31.8" r="1.1" fill="'+CL+'"/><circle cx="58" cy="31.8" r="1.1" fill="'+CL+'"/>'};
  default:return {};}}
function avItem(k,P,front){const {C,CL}=P,OL=AV_OL,I=AV_INK;
  if(front){if(k==="shield")return '<path d="M11 76 L32 76 L32 90 Q22 100 11 90Z" fill="#9aa7bd"'+OL+'/><path d="M14 79 L29 79 L29 89 Q22 96 14 89Z" fill="'+C+'"/><path d="M21.5 80 L21.5 93 M16 85 L27 85" stroke="#eef2f8" stroke-width="1.6"/>';
    if(k==="orb")return '<circle class="avorb" cx="78" cy="84" r="9" fill="'+C+'" fill-opacity=".32"/><circle cx="78" cy="84" r="5" fill="'+CL+'"'+OL+'/><path d="M75.4 82 Q77 80.4 79.2 81" stroke="#fff" stroke-width="1" fill="none"/>';
    if(k==="book")return '<path d="M65 86 L82 81.5 L84.5 98 L67.5 100Z" fill="'+C+'"'+OL+'/><path d="M67.5 88.5 L82 84.8 M68.4 92 L81 89" stroke="#fff" stroke-opacity=".55"/>';
    if(k==="dagger")return '<path d="M74 98 L84 76 L86.6 77.2 L77 99Z" fill="#cfd6e2"'+OL+'/><path d="M80 80 L89 84" stroke="'+I+'" stroke-width="3.6" stroke-linecap="round"/><path d="M80 80 L89 84" stroke="'+C+'" stroke-width="2" stroke-linecap="round"/>';
    if(k==="lute")return '<path d="M30 72 L40 60" stroke="'+I+'" stroke-width="3.6"/><path d="M30 72 L40 60" stroke="#7a4a22" stroke-width="2"/><ellipse cx="24" cy="84" rx="10" ry="9" fill="#b8742e"'+OL+' transform="rotate(-40 24 84)"/><circle cx="25.5" cy="82.5" r="2.4" fill="'+I+'"/><path d="M20 90 L38 63" stroke="#f4e7c8" stroke-width=".5"/>';
    if(k==="scepter")return '<path d="M78 100 L82 74" stroke="'+I+'" stroke-width="4"/><path d="M78 100 L82 74" stroke="#f2c14e" stroke-width="2.4"/><circle class="avorb" cx="82.6" cy="70" r="6.5" fill="'+C+'" fill-opacity=".3"/><circle cx="82.6" cy="70" r="3.4" fill="'+CL+'"'+OL+'/>'+avStar(82.6,70,1.8,"#fff")+'';
    return "";}
  if(k==="staff")return '<path d="M80 100 L84 46" stroke="'+I+'" stroke-width="4.2"/><path d="M80 100 L84 46" stroke="#7a4a22" stroke-width="2.4"/><path d="M80.4 46 Q78.5 40 82 35 M88 46.5 Q90 40.5 86.6 35" stroke="'+I+'" stroke-width="3" fill="none"/><path d="M80.4 46 Q78.5 40 82 35 M88 46.5 Q90 40.5 86.6 35" stroke="#7a4a22" stroke-width="1.6" fill="none"/><circle class="avorb" cx="84.4" cy="40" r="7.5" fill="'+C+'" fill-opacity=".32"/><circle cx="84.4" cy="40" r="3.6" fill="'+CL+'"'+OL+'/>';
  if(k==="wood")return '<path d="M80 100 L83 42" stroke="'+I+'" stroke-width="4.4"/><path d="M80 100 L83 42" stroke="#6b4a2a" stroke-width="2.6"/><path d="M83 42 q6 -5 4 -11 q-6 4 -4 11Z M83 42 q-7 -2 -9 -8 q7 0 9 8Z" fill="#35d49a"'+OL+'/><circle class="avorb" cx="83" cy="40" r="5" fill="'+C+'" fill-opacity=".3"/>';
  if(k==="sword")return '<path d="M81.5 41 L63 92 L60 91 L78.5 40Z" fill="#cfd6e2"'+OL+'/><path d="M74 37.5 L86 43.5" stroke="'+I+'" stroke-width="4.4" stroke-linecap="round"/><path d="M74 37.5 L86 43.5" stroke="'+C+'" stroke-width="2.4" stroke-linecap="round"/><path d="M80 40.5 L84.5 29" stroke="'+I+'" stroke-width="3.6" stroke-linecap="round"/><path d="M80 40.5 L84.5 29" stroke="#5a3b25" stroke-width="2" stroke-linecap="round"/><circle cx="85" cy="27.6" r="2" fill="#f2c14e"'+OL+'/>';
  if(k==="bow")return '<path d="M14 30 Q35 52 22 92" fill="none" stroke="'+I+'" stroke-width="4"/><path d="M14 30 Q35 52 22 92" fill="none" stroke="#7a4a22" stroke-width="2.2"/><path d="M14 30 L22 92" stroke="#e6ecf7" stroke-width=".7"/><path d="M76 68 L82 44 M79.5 69 L86.5 46.5" stroke="#5a3b25" stroke-width="1.8"/><path d="M82 44 l-2.4 3.4 3.4 .4Z M86.5 46.5 l-2.4 3.4 3.4 .4Z" fill="'+C+'"/>';
  return "";}
// cabelo: [atrás, frente, brilho]
function avHair(h){const c=avCirc;return [
  ["",'M35.2 37 Q36 25.3 50 25.3 Q64 25.3 64.8 37 Q58 31.5 50 31.5 Q42 31.5 35.2 37Z','M42 28 Q47 26.4 52 27'],
  ["",'M33.6 42 Q31.5 23 50 20.5 Q68.5 23 66.4 42 L63.6 33.5 L61 38.5 L57.6 31.8 L53.6 37.4 L50 30.8 L46.4 37.4 L42.6 31.8 L39.2 38.5 L36.6 33.5Z','M41 25.6 Q47 23 54 24'],
  ['M33.6 36 Q28.5 58 32 79 L43 75 L41.5 60 L58.5 60 L57 75 L68 79 Q71.5 58 66.4 36Z','M33.4 46 Q30.5 22 50 20.5 Q69.5 22 66.6 46 L64.4 34 Q57 38.5 49 31 Q45 37.5 37 35Z','M40 25.5 Q46 22.6 54 23.5'],
  ["",'M35.2 37 Q36 25.3 50 25.3 Q64 25.3 64.8 37 Q58 31.5 50 31.5 Q42 31.5 35.2 37Z M45.5 32 L42.5 13 L47.3 19 L50 8.5 L52.7 19 L57.5 13 L54.5 32Z','M48.6 15 L49.4 27'],
  [c(32,47,5)+c(68,47,5),c(38,32,6.2)+c(45,26.5,6.4)+c(53.5,25.8,6.4)+c(61.5,30.5,6.2)+c(34.5,39.5,4.6)+c(65.5,39.5,4.6)+c(42,34.5,4.4)+c(50,33.5,4.6)+c(58,34.5,4.4),'M43 24 Q46 22.4 49 23.4'],
  [c(50,18,7.4),'M33.8 41 Q33 24.5 50 24 Q67 24.5 66.2 41 Q61 31.5 50 32.5 Q39 31.5 33.8 41Z','M41 28 Q46 25.6 52 26'],
  ['M33 44 L22.5 31 L33 32.5 L28 17 L39.5 24.5 L41 8 L50 19 L59 8 L60.5 24.5 L72 17 L67 32.5 L77.5 31 L67 44Z','M33.6 43 Q33 23.5 50 22.5 Q67 23.5 66.4 43 L63.8 31.5 L60.5 39 L57.8 29.5 L53.2 38.5 L50 28.5 L46.8 38.5 L42.2 29.5 L39.5 39 L36.2 31.5Z','M40 26 Q46 23.4 53 24.2'],
  ['M33.4 38 Q30.5 56 35 66 L65 66 Q69.5 56 66.6 38Z','M34 41 Q32.5 22.5 50 21.5 Q67.5 22.5 66 41 L64 38 L36 38Z','M40 26 Q46 23.4 54 24.4'],
  ['M58 26 Q80 26 76 52 Q75 62 70 68 Q71 54 66 44 Q64 34 58 30Z','M33.6 43 Q32 22.5 50 21.5 Q68 22.5 66.4 40 Q60 30.5 48 32.5 Q40 34.5 33.6 43Z','M41 26 Q47 23.2 55 24.4'],
  [c(50,33,22.5),'M35 40 Q35 27.5 50 27.5 Q65 27.5 65 40 Q58 32.8 50 32.8 Q42 32.8 35 40Z','M38 17 Q46 12.5 56 13.4']][h]||["","",""];}
const AV_FACEP=['M35 40 Q35 25 50 25 Q65 25 65 40 L64.4 48.5 Q62.8 55.5 56.5 61 L50 64.8 L43.5 61 Q37.2 55.5 35.6 48.5Z',
  'M35 40 Q35 25 50 25 Q65 25 65 40 Q65 52 59.5 58.5 Q55 63.2 50 63.2 Q45 63.2 40.5 58.5 Q35 52 35 40Z',
  'M34.5 40 Q34.5 25 50 25 Q65.5 25 65.5 40 L65 50 Q64 57 58 61.5 L50 64 L42 61.5 Q36 57 35 50Z'];
const AV_EYEP=['M38.3 45 Q41.6 42 47.2 43.2 Q46.2 47.3 42.4 47.6 Q39.5 47.5 38.3 45Z','M38.6 44.8 Q42.6 40.6 47 43.2 Q46.6 48.4 42.6 48.5 Q39 48.2 38.6 44.8Z','M38.3 45.4 Q42 43.4 47.2 44 Q46.2 47.3 42.4 47.6 Q39.5 47.5 38.3 45.4Z'];
const AV_LID=['M37.6 45.3 Q41.4 41.3 47.7 42.9','M37.9 45 Q42.4 39.8 47.5 42.9','M37.6 45.6 Q42 43.2 47.7 43.8'];
const AV_BROWP=['<path d="M38.2 40.4 L46.8 38.6 L47.1 39.9 L39 41.7Z" fill="HD"/>','<path d="M38.4 41.2 Q42.5 37.6 47 39.4 L46.8 40.6 Q42.5 39.2 38.8 42.2Z" fill="HD"/>','<path d="M37.8 40.4 L47 37.8 L47.5 40.4 L38.4 42.6Z" fill="HD"/>','<path d="M38.8 41 Q43 39.2 46.8 39.6" stroke="HD" stroke-width="1" fill="none" stroke-linecap="round"/>'];
function avSvg(o,size){if(!o)return "";const sz=size||48,big=sz>=80,id="g"+Math.random().toString(36).slice(2,7);
  const C=AV_COL[o.c],S=AV_SKIN[o.s],H=AV_HAIRC[o.hc],Y=o.e>=2?C:AV_EYE[o.y||0],OL=AV_OL,I=AV_INK;
  const SD=avSh(S,-.3),HD=avSh(H,-.45),HL=avSh(H,.5),CL=avSh(C,.55),R=avSh(C,-.58);
  const out=avOutOf(o);const K=out[1]==="cloakd"?"#1e2230":/robe|priest/.test(out[1])?R:"#2c5e3f";const P={C,CL,S,R,K,id,o};
  const hk=o.hw===1?[]:o.hw>=2?[AV_HEADS[o.hw-2][1]]:String(out[2]||"").split(",").filter(Boolean);
  const gk=["","glasses","rglasses","sunglasses"][o.gl||0];if(gk&&!hk.includes(gk))hk.push(gk);
  const hp=hk.map(k=>avHead(k,P));const has=f=>hp.some(x=>x[f]);
  const ik=o.it===1?"":o.it>=2?AV_ITEMS[o.it-2][1]:out[3];
  const hr=avHair(o.h),face=AV_FACEP[o.r||0],es=o.es||0;
  let g='<defs><radialGradient id="'+id+'" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="'+C+'" stop-opacity=".42"/><stop offset="1" stop-color="#060a14"/></radialGradient><clipPath id="c'+id+'"><circle cx="50" cy="50" r="44"/></clipPath><clipPath id="f'+id+'"><path d="'+face+'"/></clipPath><clipPath id="e'+id+'"><path d="'+AV_EYEP[es]+'"/></clipPath></defs>';
  g+='<circle cx="50" cy="50" r="46" fill="url(#'+id+')"/>';
  let b='<path d="M6 74 L40 14 M60 98 L96 36 M0 44 L24 4" stroke="'+C+'" stroke-opacity=".16" stroke-width="1.2"/>';
  // aura de energia (mais forte a cada evolução)
  const op=[.2,.36,.58][o.e]||.2;const FL="M50 97 Q15 93 17 60 Q21 70 26 66 Q19 46 30 31 Q32 44 36 42 Q35 21 50 6 Q65 21 64 42 Q68 44 70 31 Q81 46 74 66 Q79 70 83 60 Q85 93 50 97Z";
  b+='<path class="avfl" d="'+FL+'" fill="'+C+'" fill-opacity="'+op+'"/>';
  if(o.e>=1)b+='<g transform="translate(50 97) scale(.74) translate(-50 -97)"><path class="avfl avfl2" d="'+FL+'" fill="'+CL+'" fill-opacity="'+(o.e>=2?.45:.25)+'"/></g>';
  if(o.a===3)b+='<circle cx="50" cy="52" r="35" fill="none" stroke="'+C+'" stroke-opacity=".45" stroke-width="5"/>';
  if(o.a===5){const w='<path d="M30 76 Q6 56 12 26 Q22 46 30 52 Q22 40 24 30 Q32 48 38 62Z" fill="'+CL+'" fill-opacity=".6"'+OL+'/>';b+=w+avMir(w);}
  b+=avItem(ik,P,false);
  for(const x of hp)if(x.b)b+=x.b;
  if(hr[0]&&!has("nob"))b+='<path d="'+hr[0]+'" fill="'+avSh(H,-.2)+'"'+OL+'/>';
  // pescoço e roupa (tipo de corpo muda a largura dos ombros)
  b+='<path d="M45 56 L55 56 L55.8 67 L50 72 L44.2 67Z" fill="'+S+'"'+OL+'/><path d="M45 56 L55 56 L55.4 62 Q50 65.6 44.6 62Z" fill="'+SD+'"/>';
  const bk=[.88,1,1.12][o.bt==null?1:o.bt]||1;
  b+='<g transform="translate(50 0) scale('+bk+' 1) translate(-50 0)">'+avBody(out[1],P)+'<path d="'+AV_SHD+'" fill="#000" fill-opacity=".26"/><path d="M15.5 81 Q19 73.5 32 70.6" stroke="#fff" stroke-opacity=".22" stroke-width="1.6" fill="none"/>';
  if(o.e>=1)b+='<path d="M13 82 Q16 73 32 69.5 L43 66" stroke="'+CL+'" stroke-width="1.3" fill="none"/>';
  b+='</g>';
  // cabeça
  const ear='<path d="M35.4 42.6 Q31.4 41.6 31.9 46.4 Q32.5 50.8 36 50.6Z" fill="'+S+'"'+OL+'/>';
  b+=ear+avMir(ear.replace('fill="'+S+'"','fill="'+SD+'"'));
  const er=o.er||0;if(er){const j=er===1?'<circle cx="33" cy="52.4" r="2" fill="none" stroke="'+I+'" stroke-width="1.5"/><circle cx="33" cy="52.4" r="2" fill="none" stroke="#f2c14e" stroke-width=".8"/>':er===2?'<path d="M33 49.8 L34.4 51.4 L33 53 L31.6 51.4Z" fill="'+CL+'"'+OL+'/>':'<circle cx="33" cy="51.6" r="1" fill="#cfd6e2"'+OL+'/><circle cx="32.4" cy="47.2" r=".8" fill="#cfd6e2"'+OL+'/>';b+=j+avMir(j);}
  b+='<path d="'+face+'" fill="'+S+'"'+OL+'/>';
  b+='<g clip-path="url(#f'+id+')"><path d="M57.5 27 Q66 31 66 40 L65.5 50 Q63 57 56.5 61.5 L50 65.5 Q57.5 56 58.6 46 Q59.4 36 57.5 27Z" fill="'+SD+'" fill-opacity=".8"/><path d="M33 37.5 Q50 32.5 67 37.5 L67 43 Q58 39.4 50 40.4 Q42 39.4 33 43Z" fill="'+SD+'" fill-opacity=".55"/>';
  if(o.bd===1||o.bd===2)b+='<path d="M30 50 Q38 54.5 44 54.6 L56 54.6 Q62 54.5 70 50 L70 70 L30 70Z" fill="'+HD+'" fill-opacity="'+(o.bd===1?.28:0)+'"/>';
  b+='</g>';
  const blush='<path d="M38.4 52.2 L40.4 51 M40 52.6 L42 51.4" stroke="#ff7a7a" stroke-opacity=".55" stroke-width=".7"/>';if(!(o.bd>=2&&o.bd!==4))b+=blush+avMir(blush);
  if(!has("noface")){
    if(o.a===2&&!has("noeye"))b+='<path d="M35.5 42 L64.5 42 L63 48.6 L37 48.6Z" fill="'+I+'"/><path d="M38 45.3 L62 45.3" stroke="'+C+'" stroke-width="2.2"/><path d="M38 45.3 L62 45.3" stroke="#fff" stroke-opacity=".6" stroke-width=".7"/>';
    else if(!has("noeye")){const YL=avSh(Y,.45);let e='<path d="'+AV_EYEP[es]+'" fill="#f4f6fb"/>';
      e+='<g clip-path="url(#e'+id+')"><ellipse cx="43.3" cy="45.4" rx="2.4" ry="2.8" fill="'+Y+'"/><path d="M40.9 46.3 Q43.3 48.7 45.7 46.3 Q43.3 47.3 40.9 46.3Z" fill="'+YL+'"/><ellipse cx="43.4" cy="45.2" rx="1" ry="1.45" fill="'+I+'"/><path d="M38 43.8 Q42 42.4 47.4 43.6 L47.4 44.8 Q42 43.6 38 45Z" fill="#000" fill-opacity=".22"/></g>';
      e+='<circle cx="44.3" cy="'+(es===2?44.9:44.3)+'" r=".78" fill="#fff"/><circle cx="42.3" cy="46.5" r=".38" fill="#fff"/>';
      e+='<path d="'+AV_LID[es]+'" stroke="'+I+'" stroke-width="1.9" fill="none" stroke-linecap="round"/><path d="M38.3 44.8 L36.3 43.5" stroke="'+I+'" stroke-width="1.2" stroke-linecap="round"/><path d="M40.2 47.7 Q43 48.4 46 47.2" stroke="'+SD+'" stroke-width=".6" fill="none"/>';
      if(o.e>=1)e+='<circle class="aveye" cx="43.3" cy="45.4" r="4.4" fill="'+C+'" fill-opacity="'+(o.e>=2?.32:.14)+'"/>';
      if(o.e>=2)e+='<path class="aveye" d="M37.6 44.6 L27 41.6 L37.2 46.4Z" fill="'+CL+'" fill-opacity=".8"/>';
      b+=e+avMir(e);}
    if(!has("nobrow")){const br=AV_BROWP[o.bw||0].split("HD").join(HD);b+=br+avMir(br);}
    if(o.er===3)b+='<circle cx="58.4" cy="38.4" r="1" fill="none" stroke="#cfd6e2" stroke-width=".9"/>';
    b+='<path d="M50.8 48.6 L49.6 52.3 L51.3 52.6" stroke="'+SD+'" stroke-width=".9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    // barba (por cima do rosto) e boca
    const BH='fill="'+H+'"'+OL;
    if(o.bd===2)b+='<path d="M35.6 47 Q36 58 43 62.4 L50 66.6 L57 62.4 Q64 58 64.4 47 Q62.4 54.6 57.4 56.4 Q50 53.8 42.6 56.4 Q37.6 54.6 35.6 47Z" '+BH+'/>';
    if(o.bd===3||o.bd===5)b+='<path d="M47 58.6 Q50 57.8 53 58.6 L52.2 63 L50 64.8 L47.8 63Z" '+BH+'/>';
    if(o.bd===2||o.bd===4||o.bd===5)b+='<path d="M45 55.9 Q47.5 53.6 50 54.9 Q52.5 53.6 55 55.9 Q52.5 56.2 50 55.8 Q47.5 56.2 45 55.9Z" '+BH+'/>';
    if(!has("nomouth")){const MC=o.bd===2?avSh(H,.35):avSh(SD,-.4);const mo=o.mo||0;
      if(mo===1)b+='<path d="M46.6 56.4 Q50.2 59.6 53.6 56.2" stroke="'+MC+'" stroke-width="1.1" fill="none" stroke-linecap="round"/>';
      else if(mo===2)b+='<path d="M47 57.2 Q50.6 57.8 53.8 55.4" stroke="'+MC+'" stroke-width="1.1" fill="none" stroke-linecap="round"/>';
      else if(mo===3)b+='<path d="M47 56.3 L53 56.3 L52 58.3 L48 58.3Z" fill="#f4f6fb" stroke="'+MC+'" stroke-width=".8" stroke-linejoin="round"/>';
      else b+='<path d="M47.3 56.9 Q50.3 57.7 53 56.5" stroke="'+MC+'" stroke-width="1" fill="none" stroke-linecap="round"/>';}}
  // cabelo da frente (cel-shading: contorno + brilho)
  if(hr[1]&&!has("nof"))b+='<path d="'+hr[1]+'" fill="'+H+'"'+OL+'/><path d="'+hr[2]+'" stroke="'+HL+'" stroke-width="1.8" stroke-linecap="round" fill="none" stroke-opacity=".9"/>';
  for(const x of hp)if(x.f)b+=x.f;
  if(o.a===1)b+='<path d="M31 46 Q31 24.5 50 24.5 Q69 24.5 69 46" fill="none" stroke="'+C+'" stroke-width="2"/><circle cx="31" cy="47" r="4" fill="'+C+'"'+OL+'/><path d="M31 51 Q34 60 42 58" stroke="'+C+'" stroke-width="1.6" fill="none"/>';
  if(o.a===4)b+='<path d="M36 24 L40 13 L45 21.5 L50 9 L55 21.5 L60 13 L64 24Z" fill="#f2c14e"'+OL+'/><path d="M50 14.2 L52.6 17.4 L50 20.6 L47.4 17.4Z" fill="'+C+'"/>';
  b+=avItem(ik,P,true);
  // partículas de energia
  if(o.e>=1){const pts=o.e>=2?[[20,78],[80,70],[14,56],[86,52],[28,40],[72,34],[24,22],[78,18]]:[[20,78],[80,70],[16,54],[84,50]];
    pts.forEach(([x,y],i)=>{b+='<path class="avpt" style="animation-delay:'+(i*.33).toFixed(2)+'s" d="M'+x+' '+(y-1.6)+' L'+(x+1.6)+' '+y+' L'+x+' '+(y+1.6)+' L'+(x-1.6)+' '+y+'Z" fill="'+CL+'"/>';});}
  if(o.e>=2)b+='<path class="avzap" d="M16 96 L22 84 L19 84 L25 72 M84 96 L78 84 L81 84 L75 72" stroke="'+CL+'" stroke-width="1.3" fill="none" stroke-linejoin="round"/>';
  g+='<g clip-path="url(#c'+id+')">'+b+'</g>';
  const fr=[ '<circle cx="50" cy="50" r="46" fill="none" stroke="'+C+'" stroke-width="3"/>',
    '<path d="M50 3 L91 26.5 L91 73.5 L50 97 L9 73.5 L9 26.5Z" fill="none" stroke="'+C+'" stroke-width="3"/>',
    '<path d="M31 4 L69 4 L96 31 L96 69 L69 96 L31 96 L4 69 L4 31Z" fill="none" stroke="'+C+'" stroke-width="3"/>',
    '<circle cx="50" cy="50" r="46" fill="none" stroke="'+C+'" stroke-width="2"/><circle cx="50" cy="50" r="48.5" fill="none" stroke="'+C+'" stroke-opacity=".5" stroke-width="1" stroke-dasharray="3 5"/><path d="M50 0 L50 6 M50 94 L50 100 M0 50 L6 50 M94 50 L100 50" stroke="'+C+'" stroke-width="2"/>',
    '<circle cx="50" cy="50" r="46" fill="none" stroke="#f2c14e" stroke-width="3"/><ellipse cx="50" cy="50" rx="49" ry="20" fill="none" stroke="'+C+'" stroke-width="1.4" transform="rotate(-25 50 50)"/><circle cx="94" cy="32" r="2.6" fill="'+C+'"/>'][o.f]||"";
  g+=fr;
  return '<svg class="av'+(big?" avbig":"")+'" viewBox="0 0 100 100" width="'+sz+'" height="'+sz+'" role="img" aria-label="Avatar" xmlns="http://www.w3.org/2000/svg">'+g+'</svg>';}
function avMine(size){return avSvg(avParse(avCode()),size);}
// ---- Criador de avatar (tela cheia, abas, prévia ao vivo) ----
function avEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function avClsLabel(lv){try{const k=rpgState().cls;return k?clsName(k,lv):"";}catch(e){return "";}}
function avMaker(first){if(document.querySelector(".avmk"))return;const a=avSt(),lv=avLv(),cls=avCls();const start=JSON.stringify(a);
  const m=avEl("div","sysmodal avmk");m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Monte seu avatar");
  const c=avEl("div","card avmkc");const hd=avEl("div","avmkh");hd.append(avEl("h3","avmkt",first?"🧬 MONTE SEU AVATAR":"🧬 SEU AVATAR"),avEl("div","sm muted",first?"Deixe com a sua cara. Leva menos de 1 minuto e é assim que seus amigos te veem.":"Mude o que quiser. Seus amigos veem igual."));c.append(hd);
  const pv=avEl("div","avmkpv");const cn=avEl("div","avmkcl");c.append(pv,cn);
  const paint=()=>{pv.innerHTML=avMine(innerHeight<700?100:124);const out=avOutOf(avParse(avCode()));const cl=avClsLabel(lv);cn.textContent=(cl||"Sem classe")+" · "+out[0]+" · nível "+lv;};
  const tabs=avEl("div","avtabs");tabs.setAttribute("role","tablist");const body=avEl("div","avmkb");c.append(tabs,body);const rows=[];let cur=null;
  const sync=()=>{for(const [k,ch] of rows)for(const x of ch.querySelectorAll("button[data-i]")){const on=+x.dataset.i===a[k];x.classList.toggle("on",on);x.setAttribute("aria-pressed",on?"true":"false");}};
  const set=(k,i)=>{a[k]=i;sync();paint();try{haptic([8]);}catch(e){}};
  const chip=(ch,k,i,txt,opt)=>{opt=opt||{};const need=opt.need||1,lock=lv<need;const x=avEl("button","avchip"+(lock?" lock":"")+(opt.star?" cls":""));x.type="button";x.dataset.i=i;
    if(opt.sw){x.style.setProperty("--sw",opt.sw);x.classList.add("sw");x.setAttribute("aria-label",txt);x.title=txt;}else x.textContent=lock?"🔒 "+txt+" · nv "+need:(opt.star?"⭐ ":"")+txt;
    x.addEventListener("click",()=>{if(lock){toast(txt+" destrava no nível "+need+".");return;}set(k,i);});ch.append(x);return x;};
  const row=(pane,label,k,items,opt)=>{opt=opt||{};const w=avEl("div","avrow");w.append(avEl("div","avrl",label));const ch=avEl("div","avchips"+(opt.sw?" sws":""));
    (opt.order||items.map((x,i)=>i)).forEach(i=>chip(ch,k,i,items[i],{sw:opt.sw&&opt.sw[i],need:opt.lock&&opt.lock[i]}));w.append(ch);pane.append(w);rows.push([k,w]);};
  const panes={};const TAB=[["rosto","🙂 Rosto"],["cabelo","💇 Cabelo"],["roupa","🧥 Roupa"],["extra","✨ Extras"]];
  for(const [t,l] of TAB){const b=avEl("button","avtab",l);b.type="button";b.setAttribute("role","tab");b.dataset.t=t;b.addEventListener("click",()=>show(t));tabs.append(b);const p=avEl("div","avpane");p.dataset.t=t;panes[t]=p;body.append(p);}
  const show=t=>{cur=t;for(const b of tabs.children){const on=b.dataset.t===t;b.classList.toggle("on",on);b.setAttribute("aria-selected",on?"true":"false");}for(const k in panes)panes[k].hidden=k!==t;body.scrollTop=0;};
  // Rosto
  row(panes.rosto,"Tom de pele","s",AV_SKIN.map((x,i)=>"Tom "+(AV_SKIN_ORD.indexOf(i)+1)),{sw:AV_SKIN,order:AV_SKIN_ORD});
  row(panes.rosto,"Formato do rosto","r",AV_FACE);
  row(panes.rosto,"Olhos","es",AV_EYES);
  row(panes.rosto,"Cor dos olhos","y",AV_EYEN,{sw:AV_EYE});
  row(panes.rosto,"Sobrancelha","bw",AV_BROW);
  row(panes.rosto,"Expressão","mo",AV_MOUTH);
  row(panes.rosto,"Barba","bd",AV_BEARD);
  // Cabelo
  row(panes.cabelo,"Corte","h",AV_HAIR);
  row(panes.cabelo,"Cor do cabelo e da barba","hc",AV_HAIRCN,{sw:AV_HAIRC});
  // Roupa: a da classe primeiro, depois todas
  {const pane=panes.roupa;const w=avEl("div","avrow");w.append(avEl("div","avrl","Roupa"));const ch=avEl("div","avchips");
    const mine=(AV_OUT[cls]||[]);chip(ch,"o",0,"Visual da classe ("+(mine[0]||AV_GEN[0])[0]+")",{star:true});
    AV_ALL.forEach((x,i)=>{if(mine.includes(x))chip(ch,"o",i+1,x[0],{star:true});});
    const more=avEl("details","avmore");const sm=avEl("summary",null,"Ver roupas de todas as classes");more.append(sm);const ch2=avEl("div","avchips");
    AV_GEN.forEach((x,i)=>chip(ch2,"o",i+1,x[0]));
    for(const k of Object.keys(AV_OUT)){if(k===cls)continue;const nm=avClsNameId(k);AV_OUT[k].forEach(x=>chip(ch2,"o",AV_ALL.indexOf(x)+1,x[0]+" · "+nm));}
    more.append(ch2);w.append(ch,more);pane.append(w);rows.push(["o",w]);}
  row(panes.roupa,"Na cabeça","hw",["Da roupa","Nada"].concat(AV_HEADS.map(x=>x[0])));
  row(panes.roupa,"Na mão","it",["Da roupa","Nada"].concat(AV_ITEMS.map(x=>x[0])));
  row(panes.roupa,"Corpo","bt",AV_BODY);
  row(panes.roupa,"Cor da aura e da roupa","c",AV_COLN,{sw:AV_COL});
  // Extras
  row(panes.extra,"Óculos","gl",AV_GLS);
  row(panes.extra,"Brinco e piercing","er",AV_EAR);
  row(panes.extra,"Acessório do Sistema","a",AV_ACC.map(x=>x[0]),{lock:AV_ACC.map(x=>x[1])});
  row(panes.extra,"Moldura","f",AV_FRAME.map(x=>x[0]),{lock:AV_FRAME.map(x=>x[1])});
  panes.extra.append(avEl("div","sm muted avnote","Acessórios e molduras com 🔒 destravam subindo de nível. No nível 10 a aura ganha vida; no 20, olhos do Sistema."));
  const ft=avEl("div","avmkf");const rnd=avEl("button","ghost","🎲 Aleatório");rnd.type="button";
  rnd.addEventListener("click",()=>{const r=n=>Math.floor(Math.random()*n);Object.assign(a,{s:r(AV_SKIN.length),h:r(AV_HAIR.length),hc:r(AV_HAIRC.length),y:r(AV_EYE.length),r:r(3),c:r(AV_COL.length),es:r(3),bw:r(4),mo:r(4),bd:Math.random()<.3?r(6):0,gl:Math.random()<.25?r(4):0,er:Math.random()<.25?r(4):0,bt:r(3),o:0,hw:0,it:0});sync();paint();});
  const cv=avEl("button","ghost","⭐ Da classe");cv.type="button";cv.addEventListener("click",()=>{Object.assign(a,{o:0,hw:0,it:0});sync();paint();toast("Roupa, chapéu e item da sua classe.");});
  const ok=avEl("button","go","Pronto ✓");ok.type="button";
  const close=()=>{m.remove();document.body.classList.remove("avmkon");setTimeout(()=>{try{clsNotice();}catch(e){}},500);};
  ok.addEventListener("click",()=>{a.ok=1;save();close();try{render();}catch(e){}try{avPost(true);}catch(e){}toast("🧬 Avatar salvo. Seus amigos veem esse mesmo.");});
  const sec=avEl("button","link",first?"Agora não":"Cancelar");sec.type="button";
  sec.addEventListener("click",()=>{Object.assign(a,JSON.parse(start));if(first)prog.avAsk=todayKey();save();close();try{render();}catch(e){}if(first)toast("Tudo bem. Dá para montar depois em Progresso → Seu avatar.");});
  ft.append(rnd,cv,ok,sec);c.append(ft);m.append(c);document.body.append(m);document.body.classList.add("avmkon");show("rosto");sync();paint();}
function avClsNameId(id){try{const x=CLS_REAL.concat(CLS_FANT).find(y=>y[0]===id);return x?x[1]:id;}catch(e){return id;}}
// convite automático: quem nunca montou o avatar (inclusive quem já joga) vê o criador uma vez, sem perder nada
function avBusy(){return [...document.querySelectorAll(".sysmodal,.mssheet")].some(m=>!m.hidden&&m.getClientRects().length)||($("levelup")&&!$("levelup").hidden)||(()=>{const o=$("onb");return !!(o&&!o.hidden&&o.offsetParent);})();}
let avAskT=null,avAsked=false;
// automação (testes) não recebe os convites automáticos; gente de verdade recebe
function avAskNow(){try{if(avAsked||!cfg||cfg.blank||navigator.webdriver)return;if(avSt().ok||prog.avAsk){avAsked=true;clsNotice();return;}if(avBusy()){avAskSoon(4000);return;}avAsked=true;avMaker(true);}catch(e){}}
function avAskSoon(ms){if(avAsked||avAskT)return;avAskT=setTimeout(()=>{avAskT=null;avAskNow();},ms||1500);}
// ---- Galeria de classes + regra de troca ----
// Regra: 1ª escolha grátis e troca livre nas primeiras 24 h. Depois, 1 troca a cada 30 dias, ou usando um 📜 Pergaminho de Renascimento
// (ganho no nível 10, no nível 20 e em recompensas especiais). Quem já jogava ganha 1 pergaminho na estreia da galeria. XP e nível nunca mudam.
const CLS_DAYS=30;
function clsDays(a,b){return Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/864e5);}
function clsGrantScroll(n,why){const r=rpgState();r.ctk=Math.max(0,(r.ctk||0)+(n||1));save();try{toast("📜 +"+(n||1)+" Pergaminho de Renascimento"+(why?" ("+why+")":"")+": vale 1 troca de classe.");}catch(e){}}
function clsTick(){const r=rpgState();const lv=avLv();for(const t of [10,20])if(lv>=t&&(r.lvtk||0)<t){const had=r.lvtk!=null||!!r.cls;r.lvtk=t;if(had&&r.cls){r.ctk=(r.ctk||0)+1;save();sysPop("PERGAMINHO DE RENASCIMENTO","+1 troca de classe","Você chegou ao nível "+t+". Se quiser, troque de classe sem perder nada: Progresso → Classe.");}else save();}}
function clsCan(){const r=rpgState();if(!r.cls)return {ok:1,use:"first",txt:"Primeira escolha: grátis."};
  const now=Date.now(),t=todayKey();if(r.ct0&&now-r.ct0<864e5&&!(r.past||[]).length)return {ok:1,use:"24h",txt:"Mudou de ideia? Troca livre nas primeiras 24 horas."};
  if(r.clast){const d=clsDays(r.clast,t);if(d>=CLS_DAYS)return {ok:1,use:"30d",txt:"Você tem 1 troca grátis (passaram "+CLS_DAYS+" dias)."};
    if((r.ctk||0)>0)return {ok:1,use:"tk",txt:"Você tem "+r.ctk+" 📜 Pergaminho"+(r.ctk>1?"s":"")+" de Renascimento."};
    return {ok:0,txt:"Próxima troca grátis em "+(CLS_DAYS-d)+" dia"+(CLS_DAYS-d>1?"s":"")+". Ou ganhe um 📜 Pergaminho no nível 10, no 20 ou em recompensas especiais."};}
  if((r.ctk||0)>0)return {ok:1,use:"tk",txt:"Você tem "+r.ctk+" 📜 Pergaminho"+(r.ctk>1?"s":"")+" de Renascimento."};
  return {ok:1,use:"30d",txt:"Você tem 1 troca grátis."};}
function clsApply(cl,dress){const r=rpgState();const st=clsCan();if(!st.ok){toast(st.txt);return false;}
  const lv=avLv(),old=r.cls;if(old&&old.id===cl.id&&old.name===cl.name)return false;
  if(old){r.past=(r.past||[]).concat([{id:old.id,name:old.name,style:old.style,d:todayKey()}]).slice(-6);if(st.use==="tk")r.ctk=Math.max(0,(r.ctk||0)-1);r.clast=todayKey();}
  else{r.ct0=Date.now();}
  r.cls=cl;r.evo=lv>=20?2:lv>=10?1:0;r.seen=null;r.cg=1;if(dress){const a=avSt();a.o=0;a.hw=0;a.it=0;}save();render();try{avPost(true);}catch(e){}
  sysPop(old?"CLASSE TROCADA":"CLASSE DEFINIDA",clsName(cl,lv),"Afinidade: "+STATS[cl.stat]+" sobe 1,5x mais rápido."+(old?" Seu XP e nível continuam os mesmos. Agora você é ex-"+old.name+".":""));return true;}
function clsPrev(id,sz){try{const o=avParse(avCode());o.cls=AV_CLS.includes(id)?id:"x";o.o=0;o.hw=0;o.it=0;return avSvg(o,sz);}catch(e){return "";}}
let clsGalOpen=false;
function openCls(){if(clsGalOpen||(rpgState().cls&&!openCls.force))return;const full=!!openCls.force;openCls.force=false;clsGalOpen=true;clsOpen=true;
  const r=rpgState(),occ=(cfg&&cfg.profile&&cfg.profile.occ)||"",lv=avLv();
  const m=avEl("div","sysmodal clsgal");m.id="clsModal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");const c=avEl("div","card clscard");
  const close=()=>{m.remove();clsGalOpen=false;clsOpen=r.cls?false:"later";};
  c.append(avEl("div","tag","[ SISTEMA ] GALERIA DE CLASSES"),avEl("h3",null,r.cls?"Trocar de classe":"Quem é você neste jogo?"));
  const st=clsCan();c.append(avEl("p","sm muted","Sua classe dá afinidade: um atributo sobe 1,5x mais rápido e o avatar ganha a roupa dela. Escolha livre: não precisa ser a sua profissão."));
  const rule=avEl("div","clsrule"+(st.ok?"":" no"),(r.cls?"Atual: "+clsName(r.cls,lv)+". ":"")+st.txt);c.append(rule);
  const SG=clsSuggest(),sg=SG.cl;const list=avEl("div","clsscroll");
  const card=(x,style,sug)=>{const b=avEl("button","clsbtn clsbtn2"+(sug?" sug":"")+(r.cls&&r.cls.id===x[0]?" cur":""));b.type="button";const pv=avEl("div","clspv");pv.innerHTML=clsPrev(x[0],64);
    const t=avEl("b",null,x[1]);const s2=avEl("small",null,RPG_IC[x[2]]+" "+STATS[x[2]]);const tg=sug?avEl("span","clstg","Sugestão"):r.cls&&r.cls.id===x[0]?avEl("span","clstg","Atual"):null;
    b.append(pv,t,s2);if(tg)b.append(tg);b.addEventListener("click",()=>confirm({style,id:x[0],name:x[1],stat:x[2]}));return b;};
  const sec=(title,arr,style)=>{list.append(avEl("div","clssec",title));const g=avEl("div","clsgrid clsgrid2");for(const x of arr)g.append(card(x,style,sg.id===x[0]&&sg.style===style));list.append(g);};
  sec("⚔️ Fantasia",CLS_FANT,"fant");
  sec("🧭 Vida real",CLS_REAL.slice().sort((a,b)=>(b[3]===occ)-(a[3]===occ)),"real");
  // classe com o nome que a pessoa quiser
  list.append(avEl("div","clssec","✍️ Criar a minha"));const own=avEl("div","add");const oi=avEl("input");oi.maxLength=24;oi.placeholder="Ex.: Princesa, Professora, Pedreiro";oi.autocomplete="off";oi.setAttribute("aria-label","Nome da sua classe");
  const os=avEl("select");os.setAttribute("aria-label","Atributo da classe");for(const k in STATS){const o=avEl("option",null,RPG_IC[k]+" "+STATS[k]);o.value=k;os.append(o);}
  const ob=avEl("button","go","Usar");ob.type="button";ob.addEventListener("click",()=>{const n=oi.value.trim().replace(/[<>]/g,"").slice(0,24);if(!n){oi.focus();return;}confirm({style:"real",id:"outra",name:n.charAt(0).toUpperCase()+n.slice(1),stat:os.value});});
  own.append(oi,os,ob);list.append(own);
  // sugestão do Sistema em destaque
  const top=avEl("div","clssug2");const sb=avEl("button","go big");sb.type="button";sb.id="clsSug";const spv=avEl("div","clspv");spv.innerHTML=clsPrev(sg.id,72);const sbt=avEl("div");
  sbt.append(avEl("small",null,"O Sistema sugere"),avEl("b",null,(sg.style==="fant"?"⚔️ ":"🧭 ")+sg.name),avEl("small",null,RPG_IC[sg.stat]+" "+STATS[sg.stat]+" sobe 1,5x mais rápido"));sb.append(spv,sbt);
  sb.addEventListener("click",()=>confirm(sg));top.append(avEl("p","sm muted clswhy",SG.why),sb);const more=avEl("button","link","Ver todas as classes ↓");more.id="clsMore";more.type="button";
  more.addEventListener("click",()=>{list.hidden=false;more.hidden=true;list.scrollIntoView({block:"start",behavior:"smooth"});});top.append(more);
  if(!r.cls||!full)c.append(top);else more.hidden=true;
  if(!r.cls&&!full)list.hidden=true;
  c.append(list);
  const later=avEl("button","link",r.cls?"Fechar":"Escolher depois");later.type="button";later.addEventListener("click",close);c.append(later);
  // confirmação
  function confirm(cl){if(!r.cls){if(clsApply(cl,true))close();return;}const st2=clsCan();const cf=avEl("div","sysmodal clscf");cf.setAttribute("role","dialog");cf.setAttribute("aria-modal","true");const k=avEl("div","card");
    const pv=avEl("div","clspv big");pv.innerHTML=clsPrev(AV_CLS.includes(cl.id)?cl.id:"x",120);k.append(avEl("div","tag",r.cls?"[ SISTEMA ] CONFIRMAR TROCA":"[ SISTEMA ] CONFIRMAR CLASSE"),pv,avEl("h3",null,clsName(cl,lv)));
    const ul=avEl("ul","clsli");const li=t=>ul.append(avEl("li",null,t));
    li("✔ "+RPG_IC[cl.stat]+" "+STATS[cl.stat]+" sobe 1,5x mais rápido.");li("✔ Seu XP, nível e sequência continuam iguais.");
    if(r.cls){li("↺ Você deixa de ser "+clsName(r.cls,lv)+" (vira o título ex-"+r.cls.name+").");li(st2.ok?(st2.use==="tk"?"📜 Usa 1 Pergaminho de Renascimento.":st2.use==="24h"?"⏳ Grátis: ainda está nas primeiras 24 horas.":"🗓 Usa a troca grátis do mês. A próxima libera em "+CLS_DAYS+" dias."):"⛔ "+st2.txt);}
    k.append(ul);const dl=avEl("label","clsdress");const ck=avEl("input");ck.type="checkbox";ck.checked=true;dl.append(ck,document.createTextNode(" Vestir a roupa da classe no avatar"));k.append(dl);
    const row=avEl("div","row");const go=avEl("button","go",r.cls?"Confirmar troca":"Escolher");go.type="button";go.disabled=!st2.ok;const bk=avEl("button","ghost","Voltar");bk.type="button";
    bk.addEventListener("click",()=>cf.remove());go.addEventListener("click",()=>{if(clsApply(cl,ck.checked)){cf.remove();close();}else cf.remove();});row.append(bk,go);k.append(row);cf.append(k);document.body.append(cf);setTimeout(()=>go.focus(),60);}
  m.append(c);document.body.append(m);}
function chgCls(){openCls.force=true;clsGalOpen=false;openCls();}
// estreia da galeria: quem já tinha classe ganha 1 pergaminho e um aviso (uma vez)
function clsNotice(){const r=rpgState();if(r.cg||navigator.webdriver)return;if(!r.cls){r.cg=1;save();return;}if(avBusy()){setTimeout(clsNotice,4000);return;}r.cg=1;r.ctk=(r.ctk||0)+1;save();
  sysPop("NOVA GALERIA DE CLASSES","+1 📜 troca grátis","Agora você escolhe qualquer classe: Ladino, Clérigo, Bardo, Paladino, Realeza, Monge e mais, com prévia do seu avatar. Seu XP fica igual.",()=>{setTimeout(chgCls,250);},"Ver galeria");}
// ---- Painel em Progresso ----
function avUI(){let p=$("avPanel");const first=document.querySelector('.wrap>section[data-tab="prog"]');if(!first)return;
  if(!p){p=document.createElement("section");p.className="panel avp";p.id="avPanel";p.dataset.tab="prog";first.before(p);}
  if(!cfg||cfg.blank){p.hidden=true;return;}p.hidden=false;
  p.textContent="";const lv=avLv();const out=avOutOf(avParse(avCode()));
  const top=avEl("div","avtop");const pv=avEl("div","avpv");pv.innerHTML=avMine(96);
  const info=avEl("div");const h=avEl("h2",null,"🧬 Seu avatar");const sm=avEl("div","sm muted");
  const cn=avClsLabel(lv);const r=rpgState();const ex=(r.past||[]).slice(-1)[0];
  const ev=avEvo();sm.textContent=(cn?cn+" · ":"")+out[0]+" · nível "+lv+(ex?" · ex-"+ex.name:"")+". "+(ev>=2?"Evolução máxima: olhos do Sistema.":ev?"Aura viva. No nível 20, olhos do Sistema.":"No nível 10 a aura ganha vida; no 20, olhos do Sistema.");
  const row=avEl("div","row");const b=avEl("button","go","Editar avatar");b.type="button";b.addEventListener("click",()=>avMaker(false));
  const cb=avEl("button","ghost","Classe ⇄");cb.type="button";cb.addEventListener("click",chgCls);row.append(b,cb);
  info.append(h,sm,row);top.append(pv,info);p.append(top);}
// ---- Meu card na aba Hoje: o avatar entra no painel do topo (sem card duplicado); tocar abre o card completo ----
function avHome(){const st=document.querySelector('.wrap>section[data-tab="hoje"] .status');if(!st)return;let w=$("heroAv");
  if(!w){w=avEl("button","heroav");w.type="button";w.id="heroAv";const rk=$("rank");st.insertBefore(w,rk||st.firstChild);const sv=avEl("span","hav");w.append(sv);if(rk)w.append(rk);
    w.addEventListener("click",e=>{if(e.target.closest("#rank"))return;if(typeof tmCard==="function")tmCard();else avMaker(false);});}
  const lv=avLv();w.querySelector(".hav").innerHTML=avMine(innerWidth<380?76:88);w.setAttribute("aria-label","Meu card: nível "+lv+". Toque para abrir");
  const pills=st.querySelector(".pills");if(!pills)return;let pp=$("heroPos");
  let pos="";try{if(prog.rank&&prog.rank.on&&ageNow&&ageNow()!=="kid"&&typeof cdPos==="function"&&typeof rankName==="function"&&rankName()){const ps=cdPos(rankName());pos=ps.t?"🏆 "+ps.t+"º na turma":ps.g?"🏆 "+ps.g+"º no geral":"";}}catch(e){}
  if(!pp){pp=avEl("span","pill");pp.id="heroPos";pp.setAttribute("role","button");pp.tabIndex=0;pp.addEventListener("click",()=>{const t=document.querySelector('#tabbar [data-go="amigos"]');t&&t.click();});pills.append(pp);}
  pp.hidden=!pos;pp.textContent=pos;}
{const _r=render;render=function(){_r.apply(this,arguments);try{avUI();}catch(e){}try{avHome();}catch(e){}try{clsTick();}catch(e){}try{avAskSoon();}catch(e){}};}
setTimeout(()=>{try{avUI();avHome();}catch(e){}},0);
avAskSoon(1500);
// ---- LEVEL UP com o avatar: flash, glitch de HUD e evolução ----
function avLvFx(l){const box=$("levelup");if(!box)return;const card=box.querySelector(".card");if(!card)return;
  let av=card.querySelector(".lvav");if(!av){av=avEl("div","lvav");card.prepend(av);const t=avEl("div","lvtag","LEVEL UP");t.setAttribute("aria-hidden","true");card.prepend(t);}
  av.innerHTML=avMine(130);if(l===10||l===20){const m=$("luMsg");if(m)m.textContent=l===10?"EVOLUÇÃO DESBLOQUEADA: sua aura ganhou vida.":"EVOLUÇÃO MÁXIMA: olhos do Sistema despertaram.";}
  box.classList.remove("lvfx");void box.offsetWidth;box.classList.add("lvfx");try{haptic([30,40,60]);}catch(e){}}
if(typeof levelUp==="function"){const _lu=levelUp;levelUp=function(l){_lu.apply(this,arguments);try{avLvFx(l);}catch(e){}};}
// ---- Perfil público (só para quem está no ranking, 14+): sequência, desafios da semana e avatar ----
function avZapWeek(){let n=0;try{const ws=weekStart(todayKey());for(const e of entries())if(String(e.q).startsWith("zap:")&&!String(e.q).startsWith("zap:duo:")&&weekStart(e.date)===ws)n++;}catch(e){}return n;}
// atributos públicos no card (nível de Foco-Metas-Mente-Corpo), ex.: "4-2-3-1"
function avAttrs(){try{const st=statXP();return ["foco","vendas","mente","corpo"].map(k=>slvl(st[k]||0)).join("-");}catch(e){return "";}}
function avPost(force){if(typeof RK_POST==="undefined"||ageNow()==="kid"||!(prog.rank&&prog.rank.on))return;const me=rankName();if(!me)return;
  let sq=0;try{sq=streakDays()||0;}catch(e){}const at=avAttrs();const key=[me,sq,avZapWeek(),avCode(),todayKey(),at].join("|");if(!force&&prog.avPub===key)return;if(prog.avPub===key)return;prog.avPub=key;save();
  const v=["P",me,sq,avZapWeek(),avCode(),todayKey().replace(/-/g,""),at,(typeof rkTok==="function"?rkTok():"")].join("|");
  try{fetch(RK_POST,{method:"POST",mode:"no-cors",keepalive:true,body:new URLSearchParams({"entry.807978446":v})}).catch(()=>{});}catch(e){}}
if(typeof sendRank==="function"){const _sr=sendRank;sendRank=function(){_sr.apply(this,arguments);try{avPost();}catch(e){}};}
