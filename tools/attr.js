// ---------- 8 atributos e classes personalizadas ----------
// Os 8 atributos saem do histórico que já existe (prog.log): cada tarefa alimenta 1 ou 2 atributos pelo tipo dela.
// Ninguém perde nada: nada é apagado, os 4 atributos antigos continuam (habilidades e ranking usam eles).
// Classe: atributo primário (cresce 1,5x) e secundário (1,2x), +10% de XP real nas tarefas do primário,
// uma habilidade passiva única e títulos por nível (1, 5, 10, 20, 30).
// Só ADICIONA: prog.attr = {seen:{atributo:nível}, pb:{dia:xp de passiva}} e o campo "cb" (bônus de classe) nas entradas novas.
// Teto anti-trapaça: bônus de classe + passiva somam no máximo AT_CAP XP por dia.
const AT=[// [id, ícone, nome, cor, o que treina]
 ["forca","💪","Força","#ff6b6b","treino, academia, esporte"],
 ["vital","❤️","Vitalidade","#ff9f43","sono, água, comida, remédio"],
 ["intel","📘","Intelecto","#4dabf7","estudo, leitura, prova, curso"],
 ["sabed","🦉","Sabedoria","#b197fc","meditar, diário, gratidão, revisão"],
 ["disc","🎯","Disciplina","#00d4ff","rotina, foco, casa, horário, tela"],
 ["caris","🗣️","Carisma","#f783ac","pessoas, família, clientes, conversa"],
 ["criat","🎨","Criatividade","#69db7c","criar, desenhar, escrever, música"],
 ["fort","💰","Fortuna","#f2c14e","dinheiro, vendas, metas, trabalho"]];
const AT_IDS=AT.map(a=>a[0]),AT_BY=Object.fromEntries(AT.map(a=>[a[0],a]));
const AT_CAP=60;
// palavras da tarefa -> atributos (o primeiro que bater é o principal)
const AT_RULES=[
 [/treino|academia|muscula|corrid|correr|caminh|flex[aã]o|agach|prancha|alongar|alonga|esporte|futebol|bike|pedal|nadar|polichinel|movimento|exerc/i,["forca","vital"]],
 [/dormir|sono|deitar|acordar cedo|[aá]gua|beber|remed|rem[eé]dio|comer|comida|fruta|almo[cç]|jantar|caf[eé] da manh|dieta|aliment|banho|skin|dente/i,["vital","disc"]],
 [/estud|aula|prova|enem|vestib|curso|revis[aã]o de|exerc[ií]cio de|lista de|c[aá]lculo|matem|ingl[eê]s|idioma|faculdade|escola|dever|li[cç][aã]o|apostila|resumo|flashcard|duolingo/i,["intel","disc"]],
 [/ler|leitura|livro|p[aá]gina/i,["intel","sabed"]],
 [/medit|respir|di[aá]rio|gratid|f[eé]|ora[cç]|reflex|revis[aã]o da semana|terapia|journal|calma|humor|como voc[eê] est/i,["sabed","vital"]],
 [/fechar o dia|antes de dormir|rotina|organiz|arrumar|limpar|casa|lou[cç]a|roupa|quarto|tela|celular|redes|foco|pomodoro|bloco|planej|agenda|prioridade|miss[aã]o n/i,["disc","sabed"]],
 [/cliente|corretor|abord|proposta|vend|neg[oó]cio|contrato|prospec|follow/i,["fort","caris"]],
 [/ligar|mensagem|amig|fam[ií]lia|m[aã]e|pai|irm[aã]|namor|esposa|marido|filh|visitar|conversar|elogi|ajudar algu|networking|apresent/i,["caris","sabed"]],
 [/desenh|escrev|m[uú]sica|violão|cantar|criar|post|v[ií]deo|conte[uú]do|arte|pintar|projeto|design|foto|cozinhar|receita|reel|instagram/i,["criat","fort"]],
 [/dinheiro|pix|renda|finan|or[cç]amento|poupar|guardar|pagar|boleto|conta|investi|trabalh|emprego|curr[ií]culo|est[aá]gio|meta/i,["fort","disc"]]];
const AT_OLD={foco:["disc","intel"],vendas:["fort","caris"],mente:["sabed","intel"],corpo:["forca","vital"]};
// classes: [primário, secundário, passiva, títulos nv 5/10/20/30]
const AT_CLS={
 estudante:["intel","disc","foco1","Aplicado","Destaque da Guilda","Mestre dos Estudos","Lenda Acadêmica"],
 universitario:["intel","sabed","noite","Calouro Veterano","Pesquisador","Mestre do Campus","Doutor Lendário"],
 profissional:["fort","disc","manha","Pontual","Referência do Time","Líder Nato","Lenda da Carreira"],
 empreendedor:["fort","caris","combo","Visionário","Fazedor de Negócios","Magnata","Lenda dos Negócios"],
 lar:["vital","disc","fech","Guardião da Casa","Pilar da Família","Mestre do Lar","Coração Lendário"],
 caminhoneiro:["disc","vital","manha","Estradeiro","Rei da Estrada","Mestre das Rotas","Lenda do Asfalto"],
 motorista:["disc","caris","manha","Piloto","Ás do Volante","Mestre das Ruas","Lenda das Rotas"],
 veterano:["sabed","vital","minimo","Experiente","Conselheiro","Sábio","Lenda Viva"],
 atleta:["forca","vital","primeira","Competidor","Campeão","Atleta de Elite","Lenda do Esporte"],
 mago:["intel","sabed","noite","Aprendiz Arcano","Arquimago","Sábio Arcano","Arcano Eterno"],
 guerreiro:["forca","disc","combo","Lâmina Firme","Campeão","Lorde da Guerra","Deus da Guerra"],
 arqueiro:["disc","intel","primeira","Olhar Afiado","Atirador de Elite","Olho de Falcão","Flecha Lendária"],
 cavaleiro:["fort","caris","fech","Escudeiro","Comandante","Cavaleiro Lendário","Paladino do Reino"],
 druida:["vital","sabed","fds","Semente Viva","Guardião da Floresta","Espírito Ancestral","Raiz do Mundo"],
 ladino:["criat","disc","noite","Passo Leve","Sombra Veloz","Mestre das Sombras","Fantasma Lendário"],
 clerigo:["sabed","caris","minimo","Acólito","Guardião da Luz","Voz da Aurora","Santo do Sistema"],
 bardo:["criat","caris","combo","Trovador","Menestrel","Lenda das Canções","Eco Eterno"],
 paladino:["forca","sabed","fech","Juramentado","Vanguarda","Escudo Eterno","Luz Inabalável"],
 realeza:["fort","caris","primeira","Herdeiro","Coroa do Reino","Soberania Lendária","Imperador Eterno"],
 monge:["sabed","forca","manha","Discípulo","Punho Sereno","Mestre Interior","Iluminado"]};
const AT_PAS={// id: [nome, descrição]
 manha:["Primeira Luz","+15% de XP nas tarefas feitas antes das 9h."],
 noite:["Coruja Arcana","+15% de XP nas tarefas feitas depois das 20h."],
 minimo:["Passo Firme","O mínimo vale 75% do XP, não 50%."],
 combo:["Combo","A 3ª tarefa do dia dá +10 XP."],
 primeira:["Iniciativa","A 1ª tarefa do dia dá +10 XP."],
 fech:["Guardião do Dia","Fechar o dia dá +10 XP."],
 fds:["Ciclo Natural","+15% de XP no sábado e no domingo."],
 foco1:["Foco Total","Tarefas de Intelecto dão +5 XP extra."]};
function atSt(){if(!prog.attr||typeof prog.attr!=="object")prog.attr={};const a=prog.attr;a.seen=a.seen||{};a.pb=a.pb||{};return a;}
function atEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
// --- de que atributos é uma tarefa ---
let atQ=null;function atQuests(){const m={};for(const q of ((cfg&&cfg.quests)||[]))m[q.id]=q;for(const d in (prog.extra||{}))for(const q of (prog.extra[d]||[]))m[q.id]=q;return m;}
function atOf(q,stat){if(q&&Array.isArray(q.attrs)&&q.attrs.length)return q.attrs.filter(a=>AT_BY[a]).slice(0,2);const t=String((q&&q.title)||"")+" "+String((q&&q.minTitle)||"");
  for(const [re,a] of AT_RULES)if(re.test(t))return a;return AT_OLD[(q&&q.stat)||stat]||["disc"];}
function atOfEntry(e,Q){const id=String(e.q||"");
  if(/^checkin|^q_checkin|^q_fe$/.test(id))return ["sabed"];if(/^tip:/.test(id))return ["intel"];if(/^zap:/.test(id))return ["forca","disc"];
  if(/^ch:/.test(id))return ["disc","vital"];if(id==="q_mit")return ["disc"];if(/^dun:|^sq:|^duo:/.test(id))return ["disc","caris"];
  if(/^(ach|adm|boss):/.test(id))return [];return atOf(Q[id],e.stat);}
// --- classe ---
function atCls(){let c=null;try{c=rpgState().cls;}catch(e){}if(!c)return null;const d=AT_CLS[c.id];
  if(d)return {p:d[0],s:d[1],pas:d[2],t:d.slice(3)};const o=AT_OLD[c.stat]||["disc","sabed"];return {p:o[0],s:o[1],pas:"primeira",t:["Dedicado","Experiente","Mestre","Lenda"]};}
// --- XP de cada atributo (com a afinidade da classe) ---
const AXP=n=>12*n*(n-1);const alvl=x=>{let n=1;while(x>=AXP(n+1))n++;return n;};
function atXP(){const Q=atQuests();const st={};for(const a of AT_IDS)st[a]=0;const k=atCls();
  for(const e of entries()){const v=(e.xp||0);if(v<=0)continue;const as=atOfEntry(e,Q);if(!as.length)continue;
    if(as.length===1)st[as[0]]+=v;else{st[as[0]]+=v*.7;st[as[1]]+=v*.3;}}
  if(k){st[k.p]*=1.5;st[k.s]*=1.2;}for(const a in st)st[a]=Math.round(st[a]);return st;}
function atLevels(){const x=atXP();const o={};for(const a of AT_IDS)o[a]=alvl(x[a]);return o;}
// texto público "8 níveis" (para o card; só sai se o módulo do ranking decidir publicar)
function atCode(){const l=atLevels();return AT_IDS.map(a=>l[a]).join("-");}
// --- títulos por nível ---
{const _cn=clsName;clsName=function(c,lv){const base=_cn(c,lv);try{if(!c)return base;const d=AT_CLS[c.id];if(!d)return base;
  if(lv>=30)return d[6];if(lv>=20)return d[5];if(lv>=10)return d[4];if(lv>=5)return d[3];return base;}catch(e){return base;}};}
// --- bônus de classe e passiva (só nas tarefas novas; some se a tarefa for desmarcada) ---
function atBonus(q,e){const k=atCls();if(!k||!e)return 0;const as=atOf(q,q&&q.stat);let b=0;const xp=e.xp||0;const d=new Date();const h=d.getHours();const tk=todayKey();
  if(as[0]===k.p)b+=Math.max(1,Math.round(xp*.1));
  const L=(prog.log[tk]||[]).filter(x=>!/^(ach|checkin|tip|dun|adm|ch|zap|sq|duo|boss):/.test(String(x.q)));
  switch(k.pas){case "manha":if(h<9)b+=Math.round(xp*.15);break;case "noite":if(h>=20)b+=Math.round(xp*.15);break;
    case "minimo":if(e.kind==="min"&&q&&q.xp)b+=Math.ceil(q.xp*.25);break;case "combo":if(L.length===3&&L[2]===e)b+=10;break;
    case "primeira":if(L.length===1&&L[0]===e)b+=10;break;case "fech":if(/fechar o dia|antes de dormir|fechamento/i.test((q&&q.title)||"")||/^(s_fech|q_fech)$/.test(q&&q.id))b+=10;break;
    case "fds":if(d.getDay()===0||d.getDay()===6)b+=Math.round(xp*.15);break;case "foco1":if(as.includes("intel"))b+=5;break;}
  const s=atSt();const used=s.pb[tk]||0;b=Math.max(0,Math.min(b,AT_CAP-used));return b;}
{const _tg=toggle;toggle=function(q,kind){const tk=todayKey();const had=(prog.log[tk]||[]).find(x=>x.q===q.id);_tg.apply(this,arguments);
  try{const now=(prog.log[tk]||[]).find(x=>x.q===q.id);const s=atSt();
    if(had&&had.cb&&now!==had){s.pb[tk]=Math.max(0,(s.pb[tk]||0)-had.cb);if(now&&now.bonus>=had.cb&&!now.cb)now.bonus-=had.cb;}
    if(now&&now!==had&&!now.cb){const b=atBonus(q,now);if(b>0){now.cb=b;now.bonus=(now.bonus||0)+b;s.pb[tk]=(s.pb[tk]||0)+b;}}
    for(const k in s.pb)if(k<tk)delete s.pb[k];save();if(now&&now.cb&&now!==had)setTimeout(()=>{try{const k=atCls();toast("⚔️ Classe: +"+now.cb+" XP"+(k&&AT_PAS[k.pas]?" ("+AT_PAS[k.pas][0]+")":""));}catch(e){}},900);
    atCheckUp();}catch(e){}};}
// --- aviso quando um atributo sobe de nível ---
function atCheckUp(){const s=atSt();const l=atLevels();if(!Object.keys(s.seen).length){s.seen=l;save();return;}let ch=false;
  for(const a of AT_IDS){if(l[a]>(s.seen[a]||1)){const x=AT_BY[a];try{if(ascQuietD1())toast(x[1]+" "+x[2]+" nível "+l[a]);else sysPop("ATRIBUTO",x[1]+" "+x[2]+" nível "+l[a],"Você treinou "+x[2]+" ("+x[4]+"). Continue que o radar cresce.");}catch(e){}s.seen[a]=l[a];ch=true;}}if(ch)save();}
// --- radar (SVG) ---
function atRadar(lv,size,col){const n=8,cx=50,cy=50,R=36;const mx=Math.max(5,...AT_IDS.map(a=>lv[a]||1));const pt=(i,r)=>{const t=-Math.PI/2+i*2*Math.PI/n;return [cx+Math.cos(t)*r,cy+Math.sin(t)*r];};
  let g="";for(const f of [.25,.5,.75,1])g+='<polygon points="'+AT_IDS.map((a,i)=>pt(i,R*f).map(v=>v.toFixed(1)).join(",")).join(" ")+'" fill="none" stroke="#1f2e4d" stroke-width=".6"/>';
  for(let i=0;i<n;i++){const [x,y]=pt(i,R);g+='<line x1="50" y1="50" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="#1f2e4d" stroke-width=".5"/>';}
  const poly=AT_IDS.map((a,i)=>pt(i,R*Math.max(.08,(lv[a]||1)/mx)).map(v=>v.toFixed(1)).join(",")).join(" ");
  g+='<polygon class="atpoly" points="'+poly+'" fill="'+(col||"#00d4ff")+'" fill-opacity=".28" stroke="'+(col||"#00d4ff")+'" stroke-width="1.4" stroke-linejoin="round"/>';
  AT_IDS.forEach((a,i)=>{const [x,y]=pt(i,R+9);g+='<text x="'+x.toFixed(1)+'" y="'+(y+2.5).toFixed(1)+'" text-anchor="middle" font-size="7">'+AT_BY[a][1]+'</text>';});
  return '<svg class="atradar" viewBox="0 0 100 100" width="'+size+'" height="'+size+'" role="img" aria-label="Radar dos 8 atributos">'+g+'</svg>';}
// --- painel em Progresso ---
function atUI(){let p=$("atPanel");const anchor=$("avPanel")||document.querySelector('.wrap>section[data-tab="prog"]');if(!anchor)return;
  if(!p){p=atEl("section","panel atp");p.id="atPanel";p.dataset.tab="prog";anchor.after(p);}
  if(!cfg||cfg.blank){p.hidden=true;return;}p.hidden=false;p.textContent="";
  const x=atXP(),l=atLevels(),k=atCls();
  const hd=atEl("div","athd");hd.append(atEl("h2",null,"🧬 Atributos"),atEl("span","sm mono","nível total "+AT_IDS.reduce((s,a)=>s+l[a],0)));p.append(hd);
  const top=atEl("div","attop");const rd=atEl("div","atrd");rd.innerHTML=atRadar(l,170);top.append(rd);
  const info=atEl("div","atcls");
  if(k){let lv=1;try{lv=levelOf(totalXP());}catch(e){}let nm="";try{nm=clsName(rpgState().cls,lv);}catch(e){}
    info.append(atEl("b",null,nm||"Sua classe"),atEl("span","sm","Primário: "+AT_BY[k.p][1]+" "+AT_BY[k.p][2]+" (1,5x)"),atEl("span","sm","Secundário: "+AT_BY[k.s][1]+" "+AT_BY[k.s][2]+" (1,2x)"));
    const pa=AT_PAS[k.pas];if(pa)info.append(atEl("span","sm atpas","✨ "+pa[0]+": "+pa[1]));
    info.append(atEl("span","sm muted","+10% de XP nas tarefas de "+AT_BY[k.p][2]+"."));}
  else info.append(atEl("span","sm muted","Escolha uma classe para ganhar atributo primário, secundário e uma habilidade passiva."));
  top.append(info);p.append(top);
  const ul=atEl("div","atlist");for(const a of AT_IDS.slice().sort((u,v)=>l[v]-l[u]||x[v]-x[u])){const d=AT_BY[a];const n=l[a],lo=AXP(n),hi=AXP(n+1);const pct=Math.min(100,(x[a]-lo)/(hi-lo)*100);
    const r=atEl("div","atrow"+(k&&k.p===a?" pri":k&&k.s===a?" sec":""));r.style.setProperty("--ac",d[3]);
    const nm=atEl("div","atnm");nm.append(atEl("b",null,d[1]+" "+d[2]+(k&&k.p===a?" ★":k&&k.s===a?" ☆":"")),atEl("small",null,d[4]));
    const bar=atEl("div","atbar");const f=atEl("i");f.style.width=pct.toFixed(1)+"%";bar.append(f);nm.append(bar);r.append(nm,atEl("span","atlv","Nv "+n));ul.append(r);}
  p.append(ul);}
// --- radar no seu card (e no de amigos que já publicam 8 níveis) ---
if(typeof tmCard==="function"){const _tc=tmCard;tmCard=function(n){_tc.apply(this,arguments);try{const ms=document.querySelectorAll(".cdmodal");const m=ms[ms.length-1];if(!m)return;const box=m.querySelector(".cdattr");if(!box)return;
  let me=!n;try{me=me||tmN(n)===tmN(rankName());}catch(e){}let lv=null;
  if(me)lv=atLevels();else{const p=(typeof sqPub!=="undefined"&&sqPub[tmN(n)])||{};const v=String(p.at||"").split("-").map(Number);if(v.length===8&&v.every(z=>z>0))lv=Object.fromEntries(AT_IDS.map((a,i)=>[a,v[i]]));}
  if(!lv)return;box.textContent="";box.classList.add("atcard");const col=getComputedStyle(m.querySelector(".cdcard")).getPropertyValue("--cd").trim()||"#00d4ff";
  const w=atEl("div","atrd");w.innerHTML=atRadar(lv,150,col);box.append(w);const lg=atEl("div","atlg");for(const a of AT_IDS)lg.append(atEl("span",null,AT_BY[a][1]+" "+lv[a]));box.append(lg);}catch(e){}};}
// --- classe na escolha: mostra primário, secundário e passiva ---
function atClsNote(id,stat){const d=AT_CLS[id];if(!d){const o=AT_OLD[stat]||["disc","sabed"];return AT_BY[o[0]][1]+" "+AT_BY[o[0]][2]+" · "+AT_BY[o[1]][1]+" "+AT_BY[o[1]][2];}
  const pa=AT_PAS[d[2]];return AT_BY[d[0]][1]+" "+AT_BY[d[0]][2]+" · "+AT_BY[d[1]][1]+" "+AT_BY[d[1]][2]+(pa?" · ✨ "+pa[0]:"");}
function atClsDecorate(){const m=$("clsModal");if(!m)return;const all=(typeof CLS_REAL!=="undefined"?CLS_REAL:[]).concat(typeof CLS_FANT!=="undefined"?CLS_FANT:[]);
  for(const b of m.querySelectorAll(".clsbtn")){if(b.dataset.at)continue;const nm=(b.querySelector("b")||{}).textContent;const x=all.find(y=>y[1]===nm);if(!x)continue;const s=b.querySelector("small");if(s){s.textContent=atClsNote(x[0],x[2]);b.dataset.at="1";}}
  const sg=$("clsSug");if(sg&&!sg.dataset.at){const nm=(sg.querySelector("b")||{}).textContent||"";const x=all.find(y=>nm.endsWith(y[1]));const s=sg.querySelector("small");if(x&&s){s.textContent=atClsNote(x[0],x[2]);sg.dataset.at="1";}}}
new MutationObserver(()=>{try{atClsDecorate();}catch(e){}}).observe(document.body,{childList:true,subtree:true});
{const _r=render;render=function(){_r.apply(this,arguments);try{if(document.body.dataset.tab==="prog"||!$("atPanel"))atUI();}catch(e){}};}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest('#tabbar [data-go="prog"]');if(b)setTimeout(()=>{try{atUI();}catch(x){}},0);},true);
setTimeout(()=>{try{atUI();atCheckUp();}catch(e){}},0);
