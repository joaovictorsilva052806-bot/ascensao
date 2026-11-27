// ---------- Missão Criador: um problema real da cidade por semana, em 5 etapas (spec da EVA, #22 comentário 7223690564) ----------
// Fase 1: só no painel Criador (crPanel). Uma etapa por dia; a seguinte libera no dia seguinte. Tema pela semana do ano (sem sorteio), troca 1x por semana.
// XP por etapa 20/20/30/40/60 (chave cm:<semana>:<n>). Ouro pelo orGive (teto do dia): semana completa +60 (cm:<semana>),
// "voltei ao mesmo problema" com número novo +20 ao fechar a semana (cm2:<semana>). 4 semanas completas: título; 10: moldura.
// Dados: só ADICIONA prog.cm. A foto NUNCA entra no prog (logo nunca vai para a planilha): fica em asc-u-cm-foto, no aparelho,
// e vira miniatura por até 8 semanas quando a semana fecha. Texto com telefone, e-mail, @, CEP ou endereço é recusado.
const CM_KEY_IMG="asc-u-cm-foto",CM_XP=[0,20,20,30,40,60],CM_G=60,CM_G2=20,CM_HMAX=52,CM_THUMBW=8;
const CM_T=[// [emoji, nome, pergunta-guia, exemplo de número]
 ["🏠","Moradia","Que casa da sua rua parece insegura ou sem acabamento?","quantas casas sem reboco na quadra"],
 ["📄","Papel e burocracia","O que trava por documento na sua cidade?","quantos dias leva um alvará, segundo o site da prefeitura"],
 ["💧","Água e esgoto","Onde a água falta ou o esgoto corre a céu aberto?","quantas horas a água falta por semana"],
 ["🌡️","Calor e chuva","Onde o calor ou a chuva mais atrapalham a vida?","ponto que alaga; temperatura dentro de casa às 15h"],
 ["🚌","Mobilidade","O que faz alguém perder tempo para chegar aonde precisa?","minutos de espera no ponto"],
 ["🍽️","Comida","O que deixa a comida boa cara ou difícil de achar?","preço da cesta em 2 mercados"],
 ["⚡","Energia","Onde a energia pesa no bolso ou falha?","valor da conta de luz ou do kWh"],
 ["🏫","Escola e estudo","O que atrapalha quem estuda perto de você?","alunos por sala"],
 ["👵","Idosos e acessibilidade","O que impede um idoso ou cadeirante de ir e vir?","degraus até a porta de um idoso"],
 ["🌳","Bairro e espaço público","Que pedaço do bairro ninguém cuida?","postes apagados no trajeto"]];
const CM_FONTE=[["contei","Contei"],["medi","Medi"],["site","Site oficial"],["perguntei","Perguntei"]];
const CM_CAT=[["dinheiro","💰 Dinheiro"],["lei","📜 Lei ou papel"],["tecnica","🔧 Técnica"],["info","💡 Informação"],["gente","🤝 Organização e gente"]];
const CM_TIPO=[["ciencia","🔬 Ciência"],["engenharia","🏗️ Engenharia"],["politica","🏛️ Política"],["negocio","💼 Negócio"]];
const CM_CUSTO=[["zero","Zero"],["100","Até R$ 100"],["1000","Até R$ 1 mil"],["mais","Mais"]];
const CM_STEP=[null,["Observar","Mostre o problema: uma foto ou 1 a 2 frases."],["Medir","Um número, a unidade e de onde veio."],["Gargalo","Por que isso ainda não foi resolvido?"],
 ["Propor","Sua ideia em um parágrafo."],["Testar","Conte a ideia para alguém afetado. O que a pessoa disse?"]];
const CM_AVISO="Não marque ninguém, não mostre rosto e não diga onde a pessoa mora.";
const CM_FECHO="Você olhou, mediu, entendeu, propôs e ouviu alguém. É assim que se começa a resolver o mundo.";
const CM_TT=["cm_t_arq","Arquiteto do Mundo"],CM_FR=["cm_f_planta","Planta Baixa",3,"#4fa3ff","#e8f1ff"];
function cmEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function cmBtn(c,x,fn){const b=cmEl("button",c,x);b.type="button";b.addEventListener("click",fn);return b;}
// semana ISO "AAAA-Wnn" (segunda a domingo) a partir de uma data AAAA-MM-DD
function cmWk(k){const [y,m,d]=k.split("-").map(Number);const t=new Date(Date.UTC(y,m-1,d));const wd=(t.getUTCDay()+6)%7;t.setUTCDate(t.getUTCDate()-wd+3);
  const y0=t.getUTCFullYear(),j=new Date(Date.UTC(y0,0,4));const n=1+Math.round(((t-j)/864e5-3+((j.getUTCDay()+6)%7))/7);return y0+"-W"+(n<10?"0":"")+n;}
const cmTemaDe=wk=>(Math.max(1,+wk.slice(6)||1)-1)%CM_T.length;
const cmNum=wk=>{const m=/^(\d{4})-W(\d{2})$/.exec(wk||"");return m?(+m[1])*53+(+m[2]):0;};
function cmClean(t,max){return String(t||"").replace(/\s+/g," ").trim().slice(0,max);}
// recusa texto com dado que identifica alguém (o texto sobe para a planilha do criador)
function cmPII(t){const s=String(t||"");return /\S+@\S+\.\S+/.test(s)||/(^|\s)@[\w.]{2,}/.test(s)||/\b\d{5}-\d{3}\b/.test(s)||/\(?\b\d{2}\)?\s?9?\d{4}[-\s]\d{4}\b/.test(s)||/\b\d{10,11}\b/.test(s)
  ||/\b(rua|r\.|av\.?|avenida|travessa|tv\.|alameda|estrada|rodovia)\s+[^,.;\n]{2,40}?(,\s*|\s+)(n[º°o.]?\s*)?\d{1,5}\b/i.test(s);}
function cmKid(){try{return typeof ageNow==="function"&&ageNow()==="kid";}catch(e){return false;}}
function cmImgs(){try{const o=JSON.parse(localStorage.getItem(CM_KEY_IMG)||"{}");return o&&typeof o==="object"&&!Array.isArray(o)?o:{};}catch(e){return {};}}
function cmImgsSet(o){try{localStorage.setItem(CM_KEY_IMG,JSON.stringify(o));return true;}catch(e){return false;}}
// estado: cria prog.cm só quando a pessoa abre a missão; vira a semana sozinho (a anterior vai para o histórico, sem texto livre)
function cmSt(){let c=prog.cm;const wk=cmWk(todayKey());
  if(!c||typeof c!=="object"||Array.isArray(c))c=prog.cm={wk,tema:cmTemaDe(wk),troca:false,s:{},hist:[]};
  if(!c.s||typeof c.s!=="object")c.s={};if(!Array.isArray(c.hist))c.hist=[];
  if(c.wk!==wk){cmClose(c);const v=c.hist;prog.cm=c={wk,tema:cmTemaDe(wk),troca:false,s:{},hist:v};save();}
  return c;}
function cmDone(c){return [1,2,3,4,5].filter(n=>c.s[n]&&c.s[n].d).length;}
function cmSum(c){const s=c.s||{};const h={wk:c.wk,tema:c.tema,cat:(s[3]||{}).cat||"",tipo:(s[4]||{}).tipo||"",ok:cmDone(c)===5};
  if(s[2]&&s[2].d){h.n=s[2].n;h.u=s[2].u;}if(c.v2of)h.v2of=c.v2of;return h;}
function cmClose(c){if(!c.wk||!cmDone(c))return;if(!c.hist.some(h=>h.wk===c.wk))c.hist.unshift(cmSum(c));c.hist=c.hist.slice(0,CM_HMAX);cmThumb(c.wk);}
// ao fechar a semana: a foto vira miniatura; miniaturas com mais de 8 semanas saem do aparelho
function cmThumb(wk){const o=cmImgs();const now=cmNum(cmWk(todayKey()));
  for(const k in o)if(now-cmNum(k)>=CM_THUMBW)delete o[k];
  const src=o[wk];if(!src||!/^data:image\/jpeg/.test(src)||src.length<20000){cmImgsSet(o);return;}
  const i=new Image();i.onload=()=>{try{const s=Math.min(1,240/Math.max(i.width,i.height));const cv=document.createElement("canvas");cv.width=Math.max(1,Math.round(i.width*s));cv.height=Math.max(1,Math.round(i.height*s));
    cv.getContext("2d").drawImage(i,0,0,cv.width,cv.height);const o2=cmImgs();if(o2[wk])o2[wk]=cv.toDataURL("image/jpeg",.6);cmImgsSet(o2);}catch(e){}};i.onerror=()=>cmImgsSet(o);i.src=src;cmImgsSet(o);}
function cmOk(){return (prog.cm&&Array.isArray(prog.cm.hist)?prog.cm.hist.filter(h=>h.ok&&h.wk!==prog.cm.wk).length:0)+(prog.cm&&cmDone(prog.cm)===5?1:0);}
// próxima etapa e se ela libera hoje (no máximo 1 etapa por dia)
function cmNext(c){const n=cmDone(c)+1;if(n>5)return {n:6,ok:false};const tk=todayKey();const doneToday=[1,2,3,4,5].some(i=>c.s[i]&&c.s[i].d===tk);return {n,ok:!doneToday};}
function cmAnon(step){try{if(typeof anon==="function")anon(step);}catch(e){}}
// Ouro e prêmios: chave única cada; sem espaço no teto de hoje, tenta de novo na próxima abertura
function cmPay(){const c=prog.cm;if(!c||typeof orGive!=="function")return;
  const now=cmNum(c.wk);const L=[cmDone(c)===5?cmSum(c):null].concat(c.hist.slice(0,3)).filter(h=>h&&h.ok&&now-cmNum(h.wk)<=1);
  for(const h of L){try{orGive("cm:"+h.wk,CM_G,"Missão Criador");}catch(e){}
    if(h.v2of){const o=c.hist.find(x=>x.wk===h.v2of);if(o&&o.n!=null&&h.n!=null&&+o.n!==+h.n){try{orGive("cm2:"+h.wk,CM_G2,"Voltei ao mesmo problema");}catch(e){}}}}
  cmPrize();}
function cmHook(){try{const c=bxSt();if(c.titles.some(t=>t.id===CM_TT[0])&&!BX_TT.some(t=>t[0]===CM_TT[0]))BX_TT.push([CM_TT[0],CM_TT[1],3]);
  if(c.frames.includes(CM_FR[0])&&!BX_FR.some(f=>f[0]===CM_FR[0]))BX_FR.push(CM_FR.slice());}catch(e){}}
function cmPrize(){if(typeof bxSt!=="function")return;const n=cmOk();const c=bxSt();let got="";
  if(n>=4&&!c.titles.some(t=>t.id===CM_TT[0])){BX_TT.push([CM_TT[0],CM_TT[1],3]);try{bxGiveTitle(CM_TT[0],CM_TT[1],"Missão Criador");}catch(e){}got="🏷️ Título: "+CM_TT[1];}
  if(n>=10&&!c.frames.includes(CM_FR[0])){if(!BX_FR.some(f=>f[0]===CM_FR[0]))BX_FR.push(CM_FR.slice());c.frames.push(CM_FR[0]);save();try{bxColUI();}catch(e){}got="🖼️ Moldura: "+CM_FR[1];}
  if(got)try{sysPop("MISSÃO CRIADOR",got,n+" semanas completas. É seu, de graça, na sua coleção.");}catch(e){}}
// ---------- salvar uma etapa ----------
function cmSave(n,data){const c=cmSt();const nx=cmNext(c);if(nx.n!==n||!nx.ok)return false;const tk=todayKey();
  c.s[n]=Object.assign({d:tk},data);save();
  try{addXP({q:"cm:"+c.wk+":"+n,kind:"full",xp:CM_XP[n],stat:"mente",bonus:0,t:new Date().toISOString()},"Missão Criador · "+CM_STEP[n][0]+". +"+CM_XP[n]+" XP");}catch(e){}
  if(n===1){cmAnon("cm1");if(c.v2of)cmAnon("cmv2");}
  if(n===5){cmAnon("cm5");cmPay();try{sysPop("MISSÃO CRIADOR","🛠️ Semana completa",CM_FECHO);}catch(e){}}
  return true;}
let cmErr="",cmPhoto="";
// erro aparece no próprio formulário, sem redesenhar (o que a pessoa digitou fica)
function cmFail(t){const f=document.querySelector("#cmBox form");if(!f){cmErr=t;cmRender();return;}let e=f.querySelector(".cmerr");if(!e){e=cmEl("div","cmerr");e.setAttribute("role","alert");f.querySelector(".cmgo").before(e);}e.textContent=t;}
function cmSubmit(n,f){cmErr="";const ee=f.querySelector(".cmerr");if(ee)ee.remove();const g=id=>{const e=f.querySelector("#"+id);return e?(e.type==="checkbox"?e.checked:e.value):"";};const pick=nm=>{const e=f.querySelector('input[name="'+nm+'"]:checked');return e?e.value:"";};
  const PII="Tire telefone, e-mail, @, CEP ou endereço do texto. Nada que identifique alguém.";
  if(n===1){const txt=cmClean(g("cmTxt"),280);const img=!!cmPhoto;
    if(!img&&txt.length<30)return cmFail("Escreva pelo menos 30 letras ou mande uma foto.");
    if(img&&!g("cmSafe"))return cmFail("Confirme que a foto não tem rosto, placa, número de casa nem uniforme de escola.");
    if(cmPII(txt))return cmFail(PII);
    if(img){const o=cmImgs();o[cmSt().wk]=cmPhoto;if(!cmImgsSet(o))return cmFail("Sem espaço no aparelho para a foto. Tente só com a descrição.");}
    const d={txt};if(img)d.img=true;cmPhoto="";return cmSave(1,d);cmRender();}
  if(n===2){const raw=String(g("cmN")).replace(",",".").trim();const v=+raw;const u=cmClean(g("cmU"),20),fo=pick("cmF");
    if(!raw||!isFinite(v)||Math.abs(v)>1e9)return cmFail("Coloque um número válido.");if(!u)return cmFail("Diga a unidade (ex.: casas, minutos, R$).");if(!fo)return cmFail("Escolha de onde veio o número.");
    if(cmPII(u))return cmFail(PII);return cmSave(2,{n:Math.round(v*100)/100,u,f:fo});cmRender();}
  if(n===3){const cat=pick("cmC"),txt=cmClean(g("cmTxt"),280);if(!cat)return cmFail("Escolha o tipo de gargalo.");if(txt.length<30)return cmFail("Explique em pelo menos 30 letras.");if(cmPII(txt))return cmFail(PII);
    return cmSave(3,{cat,txt});cmRender();}
  if(n===4){const txt=cmClean(g("cmTxt"),400),tipo=pick("cmT"),custo=pick("cmK");if(txt.length<60)return cmFail("Conte a ideia em pelo menos 60 letras.");if(!tipo)return cmFail("Escolha o tipo de solução.");if(!custo)return cmFail("Escolha a faixa de custo.");
    if(cmPII(txt))return cmFail(PII);return cmSave(4,{txt,tipo,custo});cmRender();}
  if(n===5){const txt=cmClean(g("cmTxt"),240);if(!g("cmOkP"))return cmFail("Só vale com a pessoa concordando que você anotasse.");if(txt.length<20)return cmFail("Escreva pelo menos 20 letras.");if(cmPII(txt))return cmFail(PII);
    return cmSave(5,{txt});cmRender();}}
// ---------- tela ----------
function cmChips(name,L,cur){const w=cmEl("div","cmchips");w.setAttribute("role","radiogroup");
  for(const [v,t] of L){const l=cmEl("label","cmchip");const i=cmEl("input");i.type="radio";i.name=name;i.value=v;if(cur===v)i.checked=true;l.append(i,cmEl("span",null,t));w.append(l);}return w;}
function cmArea(ph,max,lbl){const t=cmEl("textarea","cmta");t.id="cmTxt";t.maxLength=max;t.rows=3;t.placeholder=ph;t.setAttribute("aria-label",lbl);
  const cnt=cmEl("span","sm muted cmcnt","0/"+max);t.addEventListener("input",()=>{cnt.textContent=t.value.length+"/"+max;});return [t,cnt];}
function cmCheck(id,txt){const l=cmEl("label","cmck");const i=cmEl("input");i.type="checkbox";i.id=id;l.append(i,cmEl("span",null,txt));return l;}
function cmForm(c,n){const f=cmEl("form","cmform");f.noValidate=true;const T=CM_T[c.tema];
  f.append(cmEl("h3","cmh","Etapa "+n+" · "+CM_STEP[n][0]),cmEl("div","sm",CM_STEP[n][1]));
  if(n===1){if(!cmKid()){const fl=cmEl("label","cmfile");const i=cmEl("input");i.type="file";i.accept="image/*";i.id="cmFile";
      const pv=cmEl("img","cmprev");pv.alt="Prévia da foto";pv.hidden=!cmPhoto;if(cmPhoto)pv.src=cmPhoto;
      i.addEventListener("change",async()=>{const fi=i.files&&i.files[0];if(!fi)return;try{if(typeof muShrink!=="function")throw 0;cmPhoto=await muShrink(fi);pv.src=cmPhoto;pv.hidden=false;cmErr="";}catch(e){cmPhoto="";pv.hidden=true;toast("Não deu para usar essa foto. Tente outra ou escreva.");}});
      fl.append(cmEl("span",null,"📷 Foto (opcional)"),i);f.append(fl,pv,cmCheck("cmSafe","Sem rosto, placa, número de casa ou uniforme de escola"));}
    const [t,cnt]=cmArea("Ex.: "+T[2],280,"Descrição do problema");f.append(t,cnt);}
  if(n===2){const r=cmEl("div","cmnum");const i=cmEl("input","cmin");i.id="cmN";i.inputMode="decimal";i.placeholder="Número";i.setAttribute("aria-label","Número");
    const u=cmEl("input","cmin");u.id="cmU";u.maxLength=20;u.placeholder="Unidade";u.setAttribute("aria-label","Unidade");r.append(i,u);
    f.append(cmEl("div","sm muted","Ex.: "+T[3]+"."),r,cmEl("div","sm","De onde veio?"),cmChips("cmF",CM_FONTE));}
  if(n===3){f.append(cmChips("cmC",CM_CAT));const [t,cnt]=cmArea("Por que ainda não foi resolvido?",280,"Por que ainda não foi resolvido");f.append(t,cnt);}
  if(n===4){const [t,cnt]=cmArea("O que você faria? Como?",400,"Sua proposta");f.append(t,cnt,cmEl("div","sm","Tipo"),cmChips("cmT",CM_TIPO),cmEl("div","sm","Custo"),cmChips("cmK",CM_CUSTO));}
  if(n===5){const [t,cnt]=cmArea("Ex.: \"Faria sentido, mas o ônibus para cedo.\" (sem nome)",240,"O que a pessoa disse");f.append(t,cnt,cmCheck("cmOkP","A pessoa concordou que eu anotasse"));}
  if(cmErr){const e=cmEl("div","cmerr",cmErr);e.setAttribute("role","alert");f.append(e);}
  const b=cmEl("button","go cmgo","Concluir etapa · +"+CM_XP[n]+" XP");b.type="submit";f.append(b);
  f.addEventListener("submit",ev=>{ev.preventDefault();cmSubmit(n,f);});return f;}
function cmSwap(c){const box=cmEl("div","cmswap");box.append(cmEl("div","sm","Escolha outro tema para esta semana (só 1 troca):"));const g=cmEl("div","cmchips");
  CM_T.forEach((t,i)=>{if(i===c.tema)return;g.append(cmBtn("cmchip",t[0]+" "+t[1],()=>{c.tema=i;c.troca=true;save();cmUI.swap=false;cmRender();toast("Tema da semana: "+t[0]+" "+t[1]);}));});
  box.append(g,cmBtn("link","Cancelar",()=>{cmUI.swap=false;cmRender();}));return box;}
function cmBackTo(c){const L=c.hist.filter(h=>h.ok&&h.n!=null&&h.wk!==c.wk).slice(0,6);if(!L.length)return null;const box=cmEl("div","cmswap");
  box.append(cmEl("div","sm","Volte a um problema que você já estudou e meça de novo. Número novo no fim da semana: +"+CM_G2+" 🪙."));const g=cmEl("div","cmchips");
  for(const h of L){const t=CM_T[h.tema]||CM_T[0];g.append(cmBtn("cmchip",t[0]+" "+t[1]+" · "+h.n+" "+(h.u||""),()=>{c.tema=h.tema;c.v2of=h.wk;save();cmUI.back=false;cmRender();toast("Voltando ao problema de "+t[1]+".");}));}
  box.append(g,cmBtn("link","Cancelar",()=>{cmUI.back=false;cmRender();}));return box;}
const cmUI={swap:false,back:false};
function cmBox(){let b=$("cmBox");if(b)return b;const p=$("crPanel");if(!p)return null;b=cmEl("div","cmbox");b.id="cmBox";
  const hd=p.querySelector(".qhead");const ref=hd&&hd.nextElementSibling;if(ref)ref.after(b);else p.append(b);return b;}
function cmRender(){cmLast=cmSig();const b=cmBox();if(!b)return;if(typeof crOn==="function"&&!crOn()){b.hidden=true;return;}b.hidden=false;
  const c=cmSt(),T=CM_T[c.tema]||CM_T[0],d=cmDone(c),nx=cmNext(c);b.textContent="";
  const hd=cmEl("div","cmhd");hd.append(cmEl("h3","crh","🛠️ Missão Criador"),cmEl("span","sm mono",d+"/5"));b.append(hd);
  const card=cmEl("div","cmcard"+(d===5?" ok":""));
  card.append(cmEl("b","cmtit","Tema "+T[0]+" "+T[1]+" · "+(d===5?"semana completa ✓":"etapa "+Math.min(5,d+1)+" de 5")));
  const dots=cmEl("div","cmdots");dots.setAttribute("aria-hidden","true");for(let i=1;i<=5;i++)dots.append(cmEl("span","cmdot"+(i<=d?" on":i===nx.n&&nx.ok?" now":"")));card.append(dots);
  card.append(cmEl("div","sm cmq",T[2]));if(c.v2of)card.append(cmEl("div","sm cmv2","↩ Voltando a um problema antigo: meça de novo na etapa 2."));
  if(d===5){card.append(cmEl("p","cmfecho",CM_FECHO));const g=prog.ouroX&&prog.ouroX.got||{};
    card.append(cmEl("div","sm muted",(g["cm:"+c.wk]?"+"+CM_G+" 🪙 entrou.":"+"+CM_G+" 🪙 entra quando couber no teto do dia.")+" Nova missão na segunda."));}
  else if(nx.ok){if(cmUI.swap)card.append(cmSwap(c));else if(cmUI.back){const bk=cmBackTo(c);if(bk)card.append(bk);}
    else{card.append(cmForm(c,nx.n));const row=cmEl("div","row cmrow");
      if(!c.troca)row.append(cmBtn("link","Trocar tema (1x por semana)",()=>{cmUI.swap=true;cmUI.back=false;cmRender();}));
      if(d===0&&!c.v2of&&c.hist.some(h=>h.ok&&h.n!=null))row.append(cmBtn("link","↩ Voltar a um problema anterior",()=>{cmUI.back=true;cmUI.swap=false;cmRender();}));
      if(row.childNodes.length)card.append(row);}}
  else{card.append(cmEl("div","cmwait","✓ Etapa de hoje feita. A etapa "+nx.n+" ("+CM_STEP[nx.n][0]+") libera amanhã."));
    if(cmUI.swap)card.append(cmSwap(c));else if(!c.troca)card.append(cmBtn("link","Trocar tema (1x por semana)",()=>{cmUI.swap=true;cmRender();}));}
  card.append(cmEl("div","sm cmaviso","⚠️ "+CM_AVISO));b.append(card);
  // histórico curto + prêmios
  const n=cmOk(),h=c.hist.filter(x=>x.wk!==c.wk).slice(0,5);const foot=cmEl("div","sm muted cmfoot");
  foot.append(cmEl("div",null,n>=10?"🏆 "+n+" semanas completas · título e moldura liberados":n>=4?"🏆 "+n+" semanas completas · faltam "+(10-n)+" para a moldura « "+CM_FR[1]+" »":"🏆 "+n+" de 4 semanas para o título « "+CM_TT[1]+" »"));
  if(h.length){const ul=cmEl("ul","cmhist");const im=cmImgs();for(const x of h){const t=CM_T[x.tema]||CM_T[0];const li=cmEl("li",x.ok?"ok":"");
      if(im[x.wk]){const i=cmEl("img","cmth");i.src=im[x.wk];i.alt="";li.append(i);}
      li.append(cmEl("span",null,(x.ok?"✓ ":"· ")+x.wk.slice(5)+" "+t[0]+" "+t[1]+(x.n!=null?" · "+x.n+" "+(x.u||""):"")+(x.v2of?" ↩":"")));ul.append(li);}foot.append(ul);}
  b.append(foot);}
cmHook();
// render() do app roda toda hora: só redesenha a missão quando o estado muda (senão apagaria o que a pessoa está digitando)
function cmSig(){const c=prog.cm||{};let on=true;try{on=typeof crOn!=="function"||crOn();}catch(e){}return [on,todayKey(),c.wk,c.tema,c.troca,c.v2of,JSON.stringify(c.s||{}).length,(c.hist||[]).length].join("|");}
let cmLast="";
{const _r=render;render=function(){_r.apply(this,arguments);try{if(prog.cm)cmPay();const g=cmSig();if(g!==cmLast||!$("cmBox"))cmRender();}catch(e){}};}
setTimeout(()=>{try{cmHook();if(prog.cm)cmPay();cmRender();}catch(e){}},90);
