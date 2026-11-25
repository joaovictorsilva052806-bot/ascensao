// ---------- Kit de IA pessoal: pedido pronto + importar resposta (nada sai do aparelho) ----------
const AI_TAG="ASCENSAO_QUESTS";const AI_STATS=["foco","mente","corpo","vendas"];
function aiHistory(){const out={};const tk=todayKey();const d=new Date();
  for(let i=1;i<=14;i++){const x=new Date(d);x.setDate(d.getDate()-i);const k=dkey(x);if(cfg.startDate&&k<cfg.startDate)break;const dow=(x.getDay()+6)%7;
    for(const q of (cfg.quests||[])){if(q.once||(q.days&&!q.days.includes(dow)))continue;const o=out[q.id]=out[q.id]||{t:q.title,feitas:0,minimo:0,dias:0};o.dias++;
      const e=(prog.log[k]||[]).find(e=>e.q===q.id);if(e){if(e.kind==="min")o.minimo++;else o.feitas++;}}}
  return Object.values(out);}
function aiPrompt(){const P=(cfg&&cfg.profile)||{};const DNs=["seg","ter","qua","qui","sex","sáb","dom"];
  const AGEL={kid:"até 13 anos",teen:"14 a 17 anos",young:"18 a 29 anos",adult:"30 a 59 anos",senior:"60 anos ou mais"};
  const perfil=[P.age?"Idade: "+AGEL[P.age]:"",P.occ?"Ocupação: "+((OCC.find(o=>o[0]===P.occ)||[])[1]||P.occ):"",
    "Acordo "+(P.wake||"?")+", durmo "+(P.sleep||"?"),
    P.works?"Trabalho "+(P.workDays||[]).map(d=>DNs[d]).join(",")+" das "+P.workStart+" às "+P.workEnd+(P.lunch?", almoço "+P.lunch:""):"",
    P.studies?"Estudo ("+(P.level||"curso")+(P.course?", "+P.course:"")+") "+(P.classDays||[]).map(d=>DNs[d]).join(",")+" das "+P.classStart+" às "+P.classEnd:"",
    P.transport?"Deslocamento: "+({onibus:"ônibus",carro:"carro ou moto",ape:"a pé ou bicicleta",casa:"fico em casa"}[P.transport]||P.transport):"",(P.focus||[]).length?"Prioridades: "+P.focus.join(", "):"",P.goal?"Meta grande: "+P.goal:""].filter(Boolean).join("\n");
  const hist=aiHistory().map(h=>"- "+h.t+": "+h.feitas+" feitas, "+h.minimo+" no mínimo, de "+h.dias+" dias").join("\n")||"- comecei agora, ainda sem histórico";
  const wish=$("aiWish").value.trim();
  return "Você é um coach de hábitos. Uso o app Ascensão: minha rotina vira um jogo, cada tarefa feita vale XP. Monte minhas tarefas diárias.\n\n"+
  "MEU PERFIL\n"+perfil+"\n\nCOMO FOI NAS ÚLTIMAS 2 SEMANAS\n"+hist+"\n"+(wish?"\nO QUE EU QUERO MUDAR\n"+wish+"\n":"")+
  "\nREGRAS\n- De 4 a 7 tarefas. Cada uma cabe em até 30 minutos e começa com um verbo.\n- No máximo 2 com \"main\": true (as mais importantes do dia).\n- Tarefa que eu fiz pouco: deixe menor ou troque. Tarefa que fiz quase sempre: pode subir um pouco.\n- \"ifThen\" é um gatilho concreto do meu dia: \"Quando [situação], eu [ação]\".\n- \"minTitle\" é a versão mínima para um dia ruim.\n- \"xp\" de 10 a 40. \"stat\" é um de: foco, mente, corpo, vendas (vendas = metas e dinheiro).\n- \"days\" é opcional: lista de 0 (seg) a 6 (dom). Sem \"days\" = todo dia.\n- Linguagem simples, em português do Brasil."+(["kid","teen"].includes(P.age)?" Sou menor de idade: nada de dieta, remédio ou desafio arriscado.":"")+
  "\n\nRESPONDA ASSIM: uma frase curta explicando a ideia e, depois, um único bloco de código exatamente neste formato:\n```\n"+AI_TAG+"\n[{\"title\":\"Ler 10 páginas\",\"minTitle\":\"2 páginas\",\"ifThen\":\"Quando deitar, leio antes de pegar o celular\",\"xp\":15,\"stat\":\"mente\",\"main\":false,\"days\":[0,1,2,3,4]}]\n```";}
$("aiCopy").addEventListener("click",async()=>{const t=aiPrompt();const ta=$("aiPrompt");ta.value=t;let ok=false;
  try{await navigator.clipboard.writeText(t);ok=true;}catch(e){}
  if(!ok){ta.hidden=false;ta.focus();ta.select();try{ok=document.execCommand("copy");}catch(e){}}
  $("aiMsg").textContent=ok?"Pedido copiado. Agora abra sua IA, cole e envie.":"Não consegui copiar sozinho: segure no texto acima, Selecionar tudo e Copiar.";});
let aiNew=null;
function aiParse(raw){let s=String(raw||"");const i=s.indexOf(AI_TAG);if(i>=0)s=s.slice(i+AI_TAG.length);
  const a=s.indexOf("["),b=s.lastIndexOf("]");if(a<0||b<=a)throw new Error("Não achei a lista de tarefas. Copie a resposta inteira da IA, com o bloco de código.");
  let arr;try{arr=JSON.parse(s.slice(a,b+1).replace(/[“”]/g,'"'));}catch(e){throw new Error("A resposta veio com erro de formato. Peça à IA: \"mande de novo só o bloco ASCENSAO_QUESTS\".");}
  if(!Array.isArray(arr))throw new Error("Formato inesperado.");
  const txt=(v,n)=>String(v==null?"":v).replace(/<[^>]*>/g,"").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,n);let mains=0;const out=[];
  for(const q of arr.slice(0,8)){if(!q||typeof q!=="object")continue;const title=txt(q.title,90);if(!title)continue;
    let xp=Math.round(Number(q.xp));if(!(xp>=5))xp=15;xp=Math.min(40,xp);
    const days=Array.isArray(q.days)?[...new Set(q.days.map(Number).filter(d=>Number.isInteger(d)&&d>=0&&d<=6))].sort():null;
    const o={id:"ai"+Date.now().toString(36)+"_"+out.length,title,xp,stat:AI_STATS.includes(q.stat)?q.stat:"foco"};
    const mt=txt(q.minTitle,50),it=txt(q.ifThen,140);if(mt)o.minTitle=mt;if(it)o.ifThen=it;if(days&&days.length&&days.length<7)o.days=days;
    if(q.main===true&&mains<2){o.main=true;mains++;}out.push(o);}
  if(!out.length)throw new Error("A lista veio vazia.");return out;}
$("aiRead").addEventListener("click",()=>{const box=$("aiPrev");box.textContent="";box.hidden=true;$("aiApply").hidden=true;aiNew=null;
  try{aiNew=aiParse($("aiIn").value);}catch(e){$("aiMsg").textContent=e.message;return;}
  for(const q of aiNew){const li=document.createElement("li");li.textContent=(q.main?"★ ":"")+q.title+" · "+q.xp+" XP";const sm=document.createElement("small");sm.textContent=[q.ifThen,q.minTitle?"Mínimo: "+q.minTitle:""].filter(Boolean).join(" · ");li.append(sm);box.append(li);}
  box.hidden=false;$("aiApply").hidden=false;$("aiMsg").textContent=aiNew.length+" tarefas lidas. ★ = principal. Confira e escolha:";});
function aiApply(replace){if(!aiNew)return;let Q=(cfg.quests||[]).slice();
  if(replace)Q=Q.filter(q=>q.id==="s_fech");
  const room=3-Q.filter(q=>q.main).length;let k=0;for(const q of aiNew){if(q.main){k++;if(k>room)q.main=false;}}
  Q=aiNew.concat(Q);
  // tarefas novas não geram dívida retroativa: a contagem recomeça hoje
  const fresh=replace||aiNew.some(q=>q.main);cfg=Object.assign({},cfg,{quests:Q,blank:false,aiAt:todayKey()},fresh?{startDate:todayKey()}:{});
  try{localStorage.setItem("asc-u-cfg",JSON.stringify(cfg));}catch(e){}save();aiNew=null;$("aiPrev").hidden=true;$("aiApply").hidden=true;$("aiIn").value="";
  $("aiMsg").textContent="";render();goTab("hoje");toast(replace?"Tarefas novas no ar! Seu XP e histórico continuam.":"Tarefas adicionadas!");}
$("aiReplace").addEventListener("click",()=>aiApply(true));$("aiAdd").addEventListener("click",()=>aiApply(false));
