// ---------- Ideia que vale bônus (tools/sug.*) ----------
// Cada sugestão ganha um código (S-XXXXXXXX) que só existe neste aparelho e na mensagem do WhatsApp.
// O criador aceita a ideia publicando o SHA-256 do código em sugestoes-aceitas.json (sem nome, sem dado pessoal).
// O app confere a lista, paga Ouro UMA vez por ideia (chave sug:<código>) e destrava a conquista secreta "Arquiteto do Sistema".
// Ouro é moeda do jogo: não vale dinheiro. Moderação: sem link, e-mail, telefone ou número de documento; 1 ideia por dia.
// Só ADICIONA: campos c (código) e n (apelido, opcional, só 18+) nos itens novos de prog.feedback e prog.sug {ok:{código:data}}.
const SUG_OURO=40,SUG_MAX=100,SUG_KEY="asc-u-sug-cfg",SUG_AB="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
if(typeof SEC!=="undefined"&&Array.isArray(SEC)&&!SEC.some(s=>s[0]==="s_arq"))SEC.push(["s_arq","🏛️","Arquiteto do Sistema","Arquiteto do Sistema","Dizem que o Sistema escuta quem sugere.","Sua ideia virou parte do jogo. O Sistema foi construído por você também, Arquiteto.",30]);
function sugUrl(){return (location.pathname.indexOf("/comecar/")>=0?"../":"")+"sugestoes-aceitas.json";}
function sugSt(){let s=prog.sug;if(!s||typeof s!=="object"||Array.isArray(s))s=prog.sug={};if(!s.ok||typeof s.ok!=="object")s.ok={};return s;}
function sugCode(){const a=new Uint8Array(8);crypto.getRandomValues(a);return "S-"+[...a].map(x=>SUG_AB[x%32]).join("");}
function sugAdult(){try{const a=ageNow();return a==="adult"||a==="senior";}catch(e){return false;}}
function sugNick(){if(!sugAdult()||!$("sugNkOk")||!$("sugNkOk").checked)return "";const n=String($("sugNk").value||"").trim().replace(/[|,;"<>@\n\r]/g,"").replace(/\s+/g," ").slice(0,16);return n;}
const sugDay=d=>{try{return dkey(new Date(d));}catch(e){return "";}};
function sugToday(){const tk=todayKey();return (prog.feedback||[]).filter(f=>f&&f.c&&sugDay(f.d)===tk).length;}
// moderação local: o Sistema só precisa da ideia, nada que identifique alguém
function sugCheck(t){t=String(t||"");
  if(t.replace(/\s/g,"").length<8)return "Conte um pouco mais: pelo menos uma frase curta.";
  if(/[\w.+-]+@[\w-]+\.\w/.test(t))return "Tire o e-mail: o Sistema só precisa da ideia.";
  if(/https?:|www\.|\b[\w-]+\.(com|br|net|org|io|me|ly)\b/i.test(t))return "Tire o link: o Sistema só precisa da ideia.";
  if(/(\d[\s().-]*){8,}/.test(t))return "Tire telefone, CPF ou outros números longos: o Sistema só precisa da ideia.";
  if(/(.)\1{9,}/.test(t))return "Parece que o teclado travou. Escreva a ideia de novo.";
  if(sugToday()>=1)return "Hoje você já mandou 1 ideia. Guarde a próxima para amanhã.";
  return "";}
async function sugHash(c){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(String(c).trim().toUpperCase()));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");}
function sugClean(j){const L=j&&Array.isArray(j.aceitas)?j.aceitas:[];return L.filter(x=>x&&/^[0-9a-f]{64}$/.test(String(x.h||""))).map(x=>({h:x.h,ouro:Math.max(0,Math.min(SUG_MAX,Math.floor(+x.ouro||SUG_OURO))),ideia:String(x.ideia||"").slice(0,80),credito:String(x.credito||"").replace(/[<>]/g,"").slice(0,16),v:String(x.versao||"").slice(0,12)}));}
let sugList=[];try{const c=JSON.parse(localStorage.getItem(SUG_KEY)||"null");if(c)sugList=sugClean(c);}catch(e){}
let sugBusy=false;
async function sugApply(){if(sugBusy||!sugList.length||!(prog.feedback||[]).some(f=>f&&f.c))return;
  if(typeof secReady==="function"&&!secReady())return;
  try{if(typeof orReady==="function"&&!orReady())return;}catch(e){}
  sugBusy=true;try{const st=sugSt();const byH={};for(const x of sugList)byH[x.h]=x;let paid=false;
    for(const f of prog.feedback||[]){if(!f||!f.c||st.ok[f.c])continue;const x=byH[await sugHash(f.c)];if(!x)continue;
      let g=0;try{g=orGive("sug:"+f.c,x.ouro,"Ideia aceita");}catch(e){}
      const done=g>0||!!(prog.ouroX&&prog.ouroX.got&&prog.ouroX.got["sug:"+f.c]);if(!done)continue;// teto do dia: tenta de novo amanhã
      st.ok[f.c]=todayKey();save();paid=true;
      try{sysPop("IDEIA ACEITA","🏛️ Sua ideia entrou no jogo","A ideia "+f.c+" foi aprovada pelo criador. +"+g+" 🪙 de Ouro.");}catch(e){}}
    if(Object.keys(st.ok).length&&!(prog.sec&&prog.sec.s_arq)){try{unlockSec("s_arq");}catch(e){}}
    if(paid)sugRender();}finally{sugBusy=false;}}
function sugLoad(){try{fetch(sugUrl(),{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(j=>{if(!j)return;sugList=sugClean(j);try{localStorage.setItem(SUG_KEY,JSON.stringify(j));}catch(e){}sugRender();sugApply();}).catch(()=>{});}catch(e){}}
function sugEl(t,cl,x){const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e;}
function sugRender(){const row=$("sugNkRow");if(row){row.hidden=!sugAdult();$("sugNk").hidden=!($("sugNkOk")&&$("sugNkOk").checked);}
  const mine=$("sugMine");if(mine){const L=(prog.feedback||[]).filter(f=>f&&f.c).slice(-5).reverse();mine.textContent="";mine.hidden=!L.length;
    if(L.length){const st=sugSt();mine.append(sugEl("h3","sugh","Suas ideias"));const ul=sugEl("ul","suglist");
      for(const f of L){const li=sugEl("li",st.ok[f.c]?"ok":"");const b=sugEl("b",null,f.c);const s=sugEl("span","sm",st.ok[f.c]?"✅ Entrou no jogo":"⏳ Com o criador");li.append(b,s);ul.append(li);}mine.append(ul);}}
  const hall=$("sugHall");if(hall){const H=sugList.filter(x=>x.ideia).slice(-5).reverse();hall.textContent="";hall.hidden=!H.length;
    if(H.length){hall.append(sugEl("h3","sugh","Ideias de jogadores que viraram app"));const ul=sugEl("ul","suglist");
      for(const x of H){const li=sugEl("li");li.append(sugEl("span",null,x.ideia+(x.credito?" · ideia de "+x.credito:"")+(x.v?" ("+x.v+")":"")));ul.append(li);}hall.append(ul);}}
  sugCreator();}
// Modo Criador (só no app do JV): cola o código da mensagem e copia a linha pronta para sugestoes-aceitas.json
function sugCreator(){const pn=$("crPanel");if(!pn||$("sugCr"))return;try{if(typeof crOn==="function"&&!crOn())return;}catch(e){return;}
  const box=sugEl("div","sugcr");box.id="sugCr";box.append(sugEl("h3","crh","Aceitar ideia de jogador"),sugEl("div","sm muted","Cole o código da mensagem (S-…). Sai a linha para o arquivo sugestoes-aceitas.json. O jogador recebe o Ouro na próxima vez que abrir o app."));
  const r=sugEl("div","add");const i=sugEl("input");i.id="sugCrIn";i.setAttribute("aria-label","Código da ideia");i.placeholder="S-XXXXXXXX";i.maxLength=12;i.autocomplete="off";
  const b=sugEl("button","go","Gerar linha");b.type="button";b.id="sugCrGo";r.append(i,b);const out=sugEl("pre","sugcrout");out.id="sugCrOut";out.hidden=true;const m=sugEl("div","sm muted");m.id="sugCrMsg";m.setAttribute("aria-live","polite");
  b.addEventListener("click",async()=>{const c=String(i.value||"").trim().toUpperCase();if(!/^S-[A-Z2-9]{8}$/.test(c)){m.textContent="Código inválido. Formato: S- e 8 letras ou números.";out.hidden=true;return;}
    const line=JSON.stringify({h:await sugHash(c),ouro:SUG_OURO,ideia:"",credito:"",versao:""});out.textContent=line;out.hidden=false;
    try{await navigator.clipboard.writeText(line);m.textContent="Linha copiada. Cole dentro de \"aceitas\" e preencha a ideia (curta) e o crédito só se a mensagem pediu.";}catch(e){m.textContent="Copie a linha acima e cole dentro de \"aceitas\".";}});
  box.append(r,out,m);pn.append(box);}
setTimeout(()=>{try{sugRender();sugLoad();}catch(e){}},0);
setTimeout(()=>{try{sugApply();}catch(e){}},3000);
// "💡 Sugerir uma melhoria" em Hoje: abre o painel dobrado antes de pôr o foco no texto
if($("fbQuick"))$("fbQuick").addEventListener("click",()=>{const f=$("fbPanel");if(f&&f.classList.contains("fold")&&!f.classList.contains("open")){const h=f.querySelector(":scope>.fhd");if(h)h.click();}setTimeout(()=>{try{f.scrollIntoView({block:"start"});$("fbText").focus();}catch(e){}},90);});
document.addEventListener("change",e=>{if(e.target&&e.target.id==="sugNkOk")sugRender();});
document.addEventListener("visibilitychange",()=>{if(!document.hidden)sugLoad();});
for(const b of document.querySelectorAll('#tabbar [data-go="mais"],#tabbar [data-go="criador"]'))b.addEventListener("click",()=>{try{sugRender();sugApply();}catch(e){}});
