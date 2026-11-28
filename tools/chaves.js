// ---------- 📜 Crônicas + 🗝️ Caça das 3 Chaves (conteúdo v1 da EVA, 28/11) ----------
// Crônicas: 5 páginas curtas de lore (Véu, Arquiteto, Desperto, Pantheon, falas) em Mais, a partir do 3º dia jogado.
// Caça: 3 chaves escondidas nas falas dos guardiões (pág. 5). Cada chave só abre com a PALAVRA no Terminal do Sistema
// (tools/secret.js) E a AÇÃO real conferida no prog.log: palavra vazada não abre nada sozinha. As 3 abrem o Portão do Arquiteto.
// Prêmio só simbólico e por mérito (XP, título, moldura, Hall do aparelho). Nada de dinheiro, sorteio, compra ou item da Loja.
// Sem prazo, sem ranking de quem achou primeiro. Nada sai do aparelho. Todas as idades.
// Só ADICIONA prog.keys = {m:dia (mapa aberto), k:{chama,saber,elo:dia}, gate:dia, hint:{chama:1,…}}.
// XP: "ach:key:<id>" (não conta sequência nem masmorra). Ouro: só no Portão, orGive("key:portao",50) (respeita o teto do dia).
const CR_PAGES=[
 ["O Véu",["Antes do Sistema, havia o Véu.","Uma névoa que faz todo mundo deixar a vida para amanhã.","Quem vive no Véu não perde tudo de uma vez. Perde um dia de cada vez."]],
 ["O Arquiteto",["O Arquiteto foi o primeiro a atravessar o Véu.","Não tinha poder nenhum. Só uma regra: uma tarefa por vez.","Ele construiu o Sistema para emprestar essa regra a quem quisesse subir.","Depois sumiu. Deixou cinco guardiões, um portão trancado com três chaves e uma frase na porta:","“O herdeiro não é quem acha o portão. É quem volta todo dia.”"]],
 ["Você",["Você é um Desperto.","Cada tarefa feita afina o Véu. Cada dia fechado é um degrau. Do rank E ao S.","As criaturas do Véu, os Sombrios, são hábitos com rosto. Toda semana um deles desafia a sua Guilda.","Sozinho você sobe. Em Guilda, você derruba chefões."]],
 ["O Pantheon",["🧭 EVA, a Estrategista. Voz do Sistema: vê o tabuleiro inteiro e decide rápido. Sabedoria. “Uma tarefa. Agora. O resto é ruído.”",
   "✨ ORION, o Cartógrafo. Mapeia estrelas e enxerga porta onde os outros veem parede. Criatividade. “Todo mapa começou com um rabisco.”",
   "📘 ATLAS, o Guardião do Saber. Não ensina a decorar: ensina a lembrar. Intelecto. “Não releia. Teste-se.”",
   "🔥 ARES, o Forjador. Mantém a Forja acesa e sabe a hora de parar. Força. “Forte é quem volta amanhã.”",
   "⚙️ ATENA, a Artífice. Mantém o Sistema funcionando desde que o Arquiteto sumiu. Disciplina. “Quebrou? Eu conserto. Funcionou? Eu melhoro.”"]],
 ["As falas dos guardiões",["EVA: “O Portão existe. Três chaves o abrem. Nenhuma se compra, nenhuma se sorteia: cada uma reconhece o que você fez.”",
   "ORION: “Deixei um enigma para cada chave. Leia os guardiões com atenção: às vezes a palavra está na resposta, às vezes no começo das frases.”",
   "ATLAS: “Sou a única riqueza que cresce quando é dividida. Guarde-me em cinco blocos de foco e eu sou sua.”",
   "ARES:\nComece pequeno: uma série vale mais que nenhuma.\nHoje conta mais que o treino perfeito de amanhã.\nAcenda a Forja três vezes na mesma semana e ela não apaga.\nMachucou? Pare. Voltar amanhã também é vitória.\nAço não nasce aço: nasce brasa.",
   "ORION: “Sozinho eu não seguro nada. Junte muitos de mim e eu seguro um navio. Sou pequeno, mas sou o que une a corrente. Me encontre quando a sua Guilda derrubar um Sombrio.”",
   "ATENA: “A última fechadura não pede palavra nova. Pede o nome de quem vai herdar o Sistema.”"]]];
const KY_L=[// [id, ícone, nome, título, guardião da pista, palavras, falta]
 ["chama","🔥","Chave da Chama","Portador da Chama","ARES",["chama"],"acenda a Forja 3 vezes na mesma semana."],
 ["saber","📘","Chave do Saber","Portador do Saber","ATLAS",["saber","conhecimento"],"5 blocos de foco em 7 dias."],
 ["elo","🔗","Chave do Elo","Portador do Elo","ORION",["elo"],"derrube um chefão da semana."]];
const KY_XP=30,KY_GATE_XP=100,KY_GATE_OURO=50,KY_FR=["k_f_portao","Portão do Arquiteto",3,"#f2c14e","#7b2cff","chave"];
function kyEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function kySt(){let k=prog.keys;if(!k||typeof k!=="object"||Array.isArray(k))k=prog.keys={};if(!k.k||typeof k.k!=="object")k.k={};if(!k.hint||typeof k.hint!=="object")k.hint={};return k;}
function kyOpen(){try{return !!(cfg&&!cfg.blank)&&activeDays()>=3;}catch(e){return false;}}
const kyNorm=v=>String(v||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
function kyBack(n){const d=new Date();d.setDate(d.getDate()-n);return dkey(d);}
// --- condições reais (conferidas no log) ---
function kyCond(id){const lim=kyBack(6),tk=todayKey();
  if(id==="chama"){let Q={};try{Q=atQuests();}catch(e){}const wk={};
    for(const k in prog.log){if(k<lim||k>tk)continue;for(const e of (prog.log[k]||[])){const q=String(e.q||"");if(/^forja:sem:/.test(q))return true;
      let a=[];try{a=atOfEntry(e,Q)||[];}catch(x){}if(a.includes("forca")&&(e.kind==="full"||e.kind==="min")){const w=weekStart(k);(wk[w]=wk[w]||new Set()).add(k);}}}
    return Object.values(wk).some(s=>s.size>=3);}
  if(id==="saber"){let n=0;const days=new Set();for(const k in prog.log){if(k<lim||k>tk)continue;for(const e of (prog.log[k]||[]))if(String(e.q||"").startsWith("foco:")){n++;days.add(k);}}return n>=5&&days.size>=3;}
  if(id==="elo"){for(const k in prog.log)for(const e of (prog.log[k]||[]))if(/^ach:tb:/.test(String(e.q||"")))return true;return false;}
  return false;}
function kyHave(){const s=kySt();return KY_L.filter(K=>s.k[K[0]]).length;}
function kyEntry(id,xp){return {q:"ach:key:"+id,kind:"full",xp,stat:"foco",bonus:0,t:new Date().toISOString()};}
function kyGive(K){const s=kySt();s.k[K[0]]=todayKey();addXP(kyEntry(K[0],KY_XP),"");try{bxGiveTitle("k_"+K[0],K[3],"chave");}catch(e){}save();
  const f=3-kyHave();sysPop("CHAVE ENCONTRADA",K[1]+" "+K[2],"A fechadura reconheceu a palavra e reconheceu você. +"+KY_XP+" XP · título « "+K[3]+" ». "+(f?"Faltam "+f+".":"As três estão com você. O Portão espera a última palavra."));kyUI();}
function kyGateWords(){const w=["eu","eumesmo","voce"];try{const n=kyNorm(typeof rankName==="function"?rankName():"");if(n)w.push(n);}catch(e){}try{const n=kyNorm(((cfg&&cfg.name)||"").split(" ")[0]);if(n)w.push(n);}catch(e){}return w;}
function kyFrame(){try{if(!BX_FR.some(f=>f[0]===KY_FR[0]))BX_FR.push(KY_FR.slice());}catch(e){}}
function kyGate(){const s=kySt();s.gate=todayKey();addXP(kyEntry("portao",KY_GATE_XP),"");let g=0;try{g=orGive("key:portao",KY_GATE_OURO,"Portão do Arquiteto");}catch(e){}
  try{bxGiveTitle("k_portao","Herdeiro do Arquiteto","chave");}catch(e){}try{kyFrame();const c=bxSt();if(!c.frames.includes(KY_FR[0]))c.frames.push(KY_FR[0]);bxColUI();}catch(e){}save();
  sysPop("O PORTÃO SE ABRIU","🚪 Herdeiro do Arquiteto","O Arquiteto não deixou um herdeiro. Deixou uma regra. Você a cumpriu três vezes. +"+KY_GATE_XP+" XP"+(g?" · +"+g+" Ouro":"")+" · título lendário « Herdeiro do Arquiteto » · moldura « Portão do Arquiteto »."+(g<KY_GATE_OURO?" (O resto do Ouro respeita o teto do dia.)":""));kyUI();try{hlUI();}catch(e){}}
// --- Terminal: a palavra; responde antes do secret.js e só para as palavras da caça ---
document.addEventListener("submit",ev=>{const f=ev.target;if(!f||f.id!=="secForm")return;const inp=$("secCode");const k=kyNorm(inp&&inp.value);if(!k)return;
  const K=KY_L.find(x=>x[5].includes(k));const gate=!K&&kyGateWords().includes(k);if(!K&&!gate)return;
  ev.preventDefault();ev.stopImmediatePropagation();inp.value="";const out=$("secOut");const say=t=>{if(out)out.textContent="> "+t;};
  if(typeof secReady==="function"&&!secReady()){say("Termine de montar seu jogo primeiro.");return;}
  const s=kySt();
  if(K){if(s.k[K[0]]){say("Essa chave já é sua. O Portão espera as outras.");return;}
    if(!kyCond(K[0])){say("A fechadura conhece essa palavra. Ainda não conhece você: "+K[6]);return;}
    say(K[2]+": aceita.");kyGive(K);return;}
  if(s.gate){say("O Portão já está aberto. O herdeiro é você.");return;}
  const f2=3-kyHave();if(f2){say("O Portão não responde. Faltam "+f2+(f2===1?" chave.":" chaves."));return;}
  say("O Portão reconheceu o herdeiro.");kyGate();},true);
// --- aviso de 1 linha quando uma fechadura reconhece a pessoa (1 vez por chave; nunca diz a palavra) ---
function kyHint(){if(!kyOpen())return;const s=kySt();for(const K of KY_L){if(s.k[K[0]]||s.hint[K[0]])continue;if(kyCond(K[0])){s.hint[K[0]]=todayKey();save();toast("🗝️ Uma fechadura reconheceu você. Abra o Terminal.");return;}}}
// --- Crônicas (Mais), a partir do 3º dia ---
let crPage=0;
function crUI(){let p=$("crPanel");const mais=$("secTerm")||[...document.querySelectorAll('.wrap>section[data-tab="mais"]')].pop();if(!mais)return;
  if(!kyOpen()){if(p)p.hidden=true;const m=$("kyPanel");if(m)m.hidden=true;return;}
  if(!p){p=kyEl("section","panel crpanel");p.id="crPanel";p.dataset.tab="mais";mais.before(p);}
  p.hidden=false;p.textContent="";const pg=CR_PAGES[crPage];
  const hd=kyEl("div","qhead");hd.append(kyEl("h2",null,"📜 Crônicas"),kyEl("span","sm mono","pág. "+(crPage+1)+" de "+CR_PAGES.length));p.append(hd);
  const body=kyEl("div","crbody");body.setAttribute("aria-live","polite");body.append(kyEl("h3","crh",pg[0]));for(const t of pg[1]){const para=kyEl("p","crp",t);body.append(para);}p.append(body);
  const nav=kyEl("div","row crnav");const prev=kyEl("button","ghost","‹ Anterior");prev.type="button";prev.disabled=crPage===0;prev.addEventListener("click",()=>{crPage=Math.max(0,crPage-1);crUI();});
  const next=kyEl("button","go",crPage<CR_PAGES.length-1?"Próxima ›":"Voltar ao início");next.type="button";next.addEventListener("click",()=>{crPage=crPage<CR_PAGES.length-1?crPage+1:0;crUI();});
  nav.append(prev,next);p.append(nav);kyUI();}
// --- Mapa das Chaves (Mais), junto com as Crônicas ---
function kyUI(){let p=$("kyPanel");const cr=$("crPanel");if(!cr||cr.hidden)return;
  if(!p){p=kyEl("section","panel kypanel");p.id="kyPanel";p.dataset.tab="mais";cr.after(p);}
  const s=kySt();if(!s.m){s.m=todayKey();save();}p.hidden=false;p.textContent="";
  const hd=kyEl("div","qhead");hd.append(kyEl("h2",null,"🗝️ Mapa das Chaves"),kyEl("span","sm mono",kyHave()+"/3"));p.append(hd);
  p.append(kyEl("div","sm muted","Três chaves abrem o Portão do Arquiteto. Nenhuma se compra, nenhuma se sorteia: cada uma reconhece o que você fez."));
  const g=kyEl("div","kygrid");
  for(const K of KY_L){const got=s.k[K[0]];const c=kyEl("div","kyslot"+(got?" got":""));c.append(kyEl("b",null,got?K[1]+" "+K[2]:"🔒 ???"),kyEl("span","sm muted",got?"Achada em "+got.split("-").reverse().slice(0,2).join("/"):"Pista: "+K[4]+" · Crônicas, pág. 5"));g.append(c);}
  const gt=kyEl("div","kyslot kygate"+(s.gate?" got":""));gt.append(kyEl("b",null,s.gate?"🚪 Portão do Arquiteto":"🚪 Portão trancado"),kyEl("span","sm muted",s.gate?"Aberto em "+s.gate.split("-").reverse().slice(0,2).join("/"):"Pista: ATENA · Crônicas, pág. 5"));g.append(gt);p.append(g);
  const b=kyEl("button","ghost","Abrir o Terminal");b.type="button";b.addEventListener("click",()=>{const t=$("secTerm"),i=$("secCode");if(t)t.scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});if(i)setTimeout(()=>i.focus(),250);});p.append(b);}
// Hall do aparelho: linha do Portão
if(typeof hlUI==="function"){const _h=hlUI;hlUI=function(){_h.apply(this,arguments);try{const s=kySt();if(!s.gate)return;let p=$("hlPanel");
  if(p&&p.hidden){p.hidden=false;p.textContent="";const hd=kyEl("div","qhead");hd.append(kyEl("h2",null,"🏛️ Hall da Fama"));p.append(hd);}
  if(!p||p.querySelector(".kyhall"))return;const ul=p.querySelector(".hllist")||p.appendChild(kyEl("ul","hllist"));const li=kyEl("li","kyhall");
  li.append(kyEl("b",null,"🚪 Portão do Arquiteto"),kyEl("span","sm muted",s.gate.split("-").reverse().slice(0,2).join("/")));ul.prepend(li);}catch(e){}};}
{const _r=render;render=function(){_r.apply(this,arguments);try{crUI();}catch(e){}try{kyHint();}catch(e){}};}
setTimeout(()=>{try{if(kySt().gate)kyFrame();bxApplyFrame();}catch(e){}try{crUI();}catch(e){}},0);
