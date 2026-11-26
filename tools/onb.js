// ---------- Perfil e geração de quests (onboarding) ----------
const DN=["seg","ter","qua","qui","sex","sáb","dom"];
const FOCI=[["estudos","Estudos"],["sono","Dormir melhor"],["corpo","Saúde e corpo"],["carreira","Carreira"],["dinheiro","Dinheiro"],["relac","Pessoas que amo"],["casa","Casa em ordem"],["remedio","Remédios no horário"],["agua","Beber água"],["tela","Menos tempo de tela"],["leitura","Ler mais"]];
const AGE=[["kid","Até 13"],["teen","14 a 17"],["young","18 a 29"],["adult","30 a 59"],["senior","60 ou mais"]];
const isMinorAge=v=>v==="kid"||v==="teen";
const OCC=[["escola","Estudante (escola)"],["estudante","Faculdade / curso"],["clt","Trabalho fixo (CLT)"],["autonomo","Autônomo / Empreendedor"],["casa","Dono(a) de casa"],["motorista","Motorista / caminhoneiro"],["aposentado","Aposentado(a)"],["outro","Outro"]];
const OCC_SET={escola:{works:false,studies:true,level:"escola",shift:"manha",transport:"ape",focus:["estudos","sono","tela"],hint:"Dever de casa, provas, sono e menos tempo de tela."},
  estudante:{works:false,studies:true,level:"faculdade",shift:"noite",focus:["estudos","sono","corpo"],hint:"Revisão, provas e entregas da faculdade ou do curso."},
  clt:{works:true,focus:["sono","corpo","dinheiro"],hint:"Tarefas que cabem antes, no almoço e depois do trabalho."},
  autonomo:{works:false,transport:"casa",focus:["carreira","dinheiro","sono"],hint:"Bloco de foco no que dá dinheiro e controle de gastos."},
  casa:{works:false,studies:false,transport:"casa",focus:["casa","corpo","relac"],hint:"Casa, saúde e um tempo só seu."},
  motorista:{works:false,studies:false,transport:"carro",focus:["agua","corpo","relac"],hint:"Sem horário fixo: tarefas que cabem na estrada e nas paradas."},
  aposentado:{works:false,studies:false,transport:"ape",focus:["corpo","relac","remedio"],hint:"Saúde, remédios e gente por perto."},outro:{hint:""}};
function pickOcc(v,apply){[...$("o_occ").children].forEach(b=>b.classList.toggle("on",b.dataset.v===v));const s=OCC_SET[v]||{};$("o_occHint").textContent=s.hint||"";
  if(!apply)return;if(s.works!=null)$("o_works").checked=s.works;if(s.studies!=null)$("o_studies").checked=s.studies;if(s.transport)$("o_transport").value=s.transport;if(s.level){$("o_level").value=s.level;levelUI();}if(s.shift){$("o_shift").value=s.shift;shiftTimes();}
  if(s.focus)toggles("o_focus",FOCI,s.focus,6);syncBoxes();}
const SHIFT_T={manha:["07:00","12:20"],tarde:["13:00","17:30"],noite:["19:00","22:30"],integral:["07:00","16:30"]};
function shiftTimes(){const t=SHIFT_T[$("o_shift").value];if(t){$("o_classStart").value=t[0];$("o_classEnd").value=t[1];}}
function levelUI(){const l=$("o_level").value;$("o_courseLbl").textContent=l==="escola"?"Série":l==="enem"?"Curso que você quer":"Curso";
  $("o_course").placeholder=l==="escola"?"Ex.: 9º ano ou 1º ano do médio":l==="enem"?"Ex.: Medicina":"Ex.: Engenharia";}
$("o_level").addEventListener("change",levelUI);$("o_shift").addEventListener("change",shiftTimes);
function curAge(){const b=$("o_age").querySelector(".on");return b?b.dataset.v:"";}
function pickAge(v,apply){[...$("o_age").children].forEach(b=>b.classList.toggle("on",b.dataset.v===v));const m=isMinorAge(v);
  $("o_pingRow").hidden=m;if(m)$("o_ping").checked=false;
  $("o_ageHint").textContent=v==="kid"?"Peça para alguém da família ajudar a preencher. O ranking fica desligado.":m?"Menor de 18: o ranking começa desligado. Se quiser entrar depois, aparece só um apelido.":"";
  $("o_goal").placeholder=m?"Ex.: passar de ano com nota boa":v==="senior"?"Ex.: caminhar 3 vezes por semana":"Ex.: conseguir um emprego melhor";
  if(!apply)return;
  if(m){if($("o_wake").value==="07:00")$("o_wake").value="06:30";if($("o_sleep").value==="23:00")$("o_sleep").value="22:00";if(!$("o_occ").querySelector(".on"))pickOcc("escola",true);}
  if(v==="senior"&&!$("o_occ").querySelector(".on"))pickOcc("aposentado",true);}
function toggles(id,items,sel,max){const box=$(id);box.textContent="";for(const [v,l] of items){const b=document.createElement("button");b.type="button";b.textContent=l;b.dataset.v=v;if(sel.includes(v))b.classList.add("on");
  b.addEventListener("click",()=>{if(!b.classList.contains("on")&&max&&box.querySelectorAll(".on").length>=max){$("o_msg").textContent="Escolha no máximo "+max+".";return;}b.classList.toggle("on");});box.append(b);}}
const picked=id=>[...$(id).querySelectorAll(".on")].map(b=>b.dataset.v);
function fillOnb(a){a=a||{};const v=(id,x)=>{if(x!=null)$(id).value=x;};
  v("o_name",a.name);v("o_wake",a.wake);v("o_sleep",a.sleep);v("o_workStart",a.workStart);v("o_lunch",a.lunch);v("o_workEnd",a.workEnd);v("o_course",a.course);v("o_classStart",a.classStart);v("o_classEnd",a.classEnd);v("o_transport",a.transport);$("o_level").value=a.level||(a.studies?"faculdade":"escola");$("o_shift").value=a.shift||(a.level==="escola"?"manha":"noite");levelUI();v("o_goal",a.goal);v("o_ctx",a.ctx);v("o_train",a.train||"");v("o_cards",a.cards||"");v("o_free",a.free||"");v("o_money",a.money);v("o_moneyDate",a.moneyDate);
  if(a.works!=null)$("o_works").checked=a.works;if(a.studies!=null)$("o_studies").checked=a.studies;if(a.faith!=null)$("o_faith").checked=a.faith;if(a.ping!=null)$("o_ping").checked=a.ping;
  const dd=DN.map((l,i)=>[String(i),l]);toggles("o_workDays",dd,(a.workDays||[0,1,2,3,4]).map(String));toggles("o_classDays",dd,(a.classDays||[0,1,2,3,4]).map(String));
  toggles("o_focus",FOCI,a.focus||["sono","corpo"],6);syncBoxes();
  const ob=$("o_occ");ob.textContent="";for(const [v,l] of OCC){const b=document.createElement("button");b.type="button";b.textContent=l;b.dataset.v=v;b.addEventListener("click",()=>pickOcc(v,true));ob.append(b);}pickOcc(a.occ||"",false);
  const ab=$("o_age");ab.textContent="";for(const [v,l] of AGE){const b=document.createElement("button");b.type="button";b.textContent=l;b.dataset.v=v;b.addEventListener("click",()=>pickAge(v,true));ab.append(b);}pickAge(a.age||"",false);}
function syncBoxes(){$("o_workBox").hidden=!$("o_works").checked;$("o_studyBox").hidden=!$("o_studies").checked;}
$("o_works").addEventListener("change",syncBoxes);$("o_studies").addEventListener("change",syncBoxes);
function readOnb(){const g=id=>$(id).value.trim();const oc=$("o_occ").querySelector(".on");const ag=curAge();return {age:ag,level:$("o_studies").checked?$("o_level").value:"",shift:$("o_shift").value,occ:oc?oc.dataset.v:"",name:g("o_name"),wake:g("o_wake")||"07:00",sleep:g("o_sleep")||"23:00",works:$("o_works").checked,workDays:picked("o_workDays").map(Number),workStart:g("o_workStart"),lunch:g("o_lunch"),workEnd:g("o_workEnd"),
  studies:$("o_studies").checked,course:g("o_course"),classDays:picked("o_classDays").map(Number),classStart:g("o_classStart"),classEnd:g("o_classEnd"),transport:g("o_transport"),focus:picked("o_focus"),goal:g("o_goal"),ctx:g("o_ctx").replace(/[<>]/g,"").slice(0,240),money:g("o_money"),moneyDate:g("o_moneyDate"),faith:$("o_faith").checked,train:g("o_train"),cards:g("o_cards"),free:g("o_free"),ping:!isMinorAge(ag)&&$("o_ping").checked};}
const hm=t=>{const [h,m]=(t||"0:0").split(":").map(Number);return h*60+(m||0);};
const fm=m=>{m=((m%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+"h"+(m%60?String(m%60).padStart(2,"0"):"");};
function buildCfg(a){const Q=[];let n=0;const add=q=>{q.id=q.id||("g"+(++n));Q.push(q);return q;};
  const bus=a.transport==="onibus"||(!a.transport&&/ônibus|onibus|busão/i.test(a.ctx||"")), busy=a.works&&a.studies, f=x=>a.focus.includes(x);
  const sleepH=((hm(a.wake)-hm(a.sleep)+1440)%1440)/60;
  const tech=/comput|sistem|software|dados|ti\b|informát|ciência da/i.test(a.course||"");
  const FREE=a.free==="manha"?"De manhã, no meu horário livre":a.free==="tarde"?"À tarde, no meu horário livre":a.free==="noite"?"À noite, no meu horário livre":"";
  const studyIds=[], minor=isMinorAge(a.age), school=a.studies&&a.level==="escola", enem=a.studies&&a.level==="enem";
  if(a.studies){
    const days=a.works&&a.workDays.length?a.workDays:(a.classDays.length?a.classDays:[0,1,2,3,4]);
    const anchor=bus?"Quando sentar no ônibus da ida, abro os flashcards antes de qualquer rede social."
      :(a.works&&a.lunch)?"Quando terminar de almoçar (por volta das "+fm(hm(a.lunch)+30)+"), abro o material e dou play no timer."
      :"Logo depois do café da manhã, abro o material da última aula.";
    if(school){const sa=(a.shift==="tarde"||a.shift==="noite")?"Logo depois do café da manhã, abro o caderno antes de ligar o celular ou a TV.":a.shift==="integral"?"Quando chegar em casa e tomar banho, abro o caderno antes do celular.":"Quando chegar da escola e almoçar, abro o caderno antes do celular.";
      studyIds.push(add({id:"s_rev",title:"Dever de casa + 15 min revisando a matéria do dia",xp:30,stat:"mente",main:true,minTitle:"só o dever",days:a.classDays.length?a.classDays:[0,1,2,3,4],ifThen:sa}).id);}
    else if(enem)studyIds.push(add({id:"s_rev",title:"Resolver 10 questões e entender cada erro",xp:30,stat:"mente",main:true,minTitle:"3 questões",days,ifThen:anchor}).id);
    else if(a.cards==="yes")studyIds.push(add({id:"s_rev",title:(bus?"No ônibus: ":"")+"Revisar os flashcards do dia (Anki ou aqui no app)",xp:30,stat:"mente",main:true,minTitle:"10 cards",days,ifThen:anchor}).id);
    else if(a.cards==="no")studyIds.push(add({id:"s_rev",title:(bus?"Revisão ativa no ônibus: ":"Revisão ativa: ")+"15 min tentando lembrar a última aula sem olhar, depois conferir",xp:30,stat:"mente",main:true,minTitle:"5 min",days,ifThen:anchor.replace("abro os flashcards","abro o caderno")}).id);
    else studyIds.push(add({id:"s_rev",title:(bus?"Revisão ativa no ônibus: ":"Revisão ativa: ")+"15 min de perguntas ou flashcards da última aula",xp:30,stat:"mente",main:true,minTitle:"5 cards",days,ifThen:anchor}).id);
    if(a.classDays.length&&school)add({id:"s_aula",title:"Na aula: anotar 1 dúvida no caderno e perguntar ao professor",xp:15,stat:"mente",days:a.classDays,minTitle:"só anotar",ifThen:"Quando o professor terminar a explicação, escrevo a dúvida na última folha do caderno."});
    else if(a.classDays.length)add({id:"s_aula",title:"Na aula: anotar 1 dúvida e tirar com o professor ou o grupo",xp:15,stat:"mente",days:a.classDays,minTitle:"só anotar",ifThen:"Quando a aula começar ("+fm(hm(a.classStart))+"), abro a nota \"Dúvidas\" do celular."});
    studyIds.push(add({id:"s_bloco",title:school?"Bloco de 40 min estudando para a próxima prova":enem?"Simulado ou redação (50 min)":"Bloco de estudo de 50 min (lista, trabalho ou projeto)",xp:40,stat:"mente",main:!school,minTitle:school?"20 min":"25 min",days:[5],ifThen:"Sábado, depois do café, ligo o modo foco de 25 min "+(school?"e depois mais 15.":"duas vezes.")}).id);
    if(school)add({id:"s_mochila",title:"Mochila e uniforme prontos para amanhã",xp:10,stat:"foco",days:(a.classDays.length?a.classDays:[0,1,2,3,4]).map(d=>(d+6)%7),ifThen:"Depois do jantar, antes de pegar o celular."});
  }
  if(f("sono")||sleepH<(minor?8.5:7.5)){
    const pre=(a.studies&&a.classEnd&&hm(a.classEnd)>hm("20:00"))?"Quando chegar da faculdade: banho, roupa de amanhã separada e celular no carregador fora da cama.":"Às "+fm(hm(a.sleep)-30)+", celular no carregador fora da cama e luz baixa.";
    add({id:"s_sono",title:"Deitar até "+fm(hm(a.sleep))+", sem tela na cama",xp:25,stat:"corpo",main:true,minTitle:"celular longe da cama",ifThen:pre});
  }
  if(!a.studies&&f("carreira"))add({id:"s_carr",title:tech?"20 min de programação no seu projeto":"20 min de carreira (curso, portfólio ou currículo)",xp:30,stat:"vendas",main:true,minTitle:"5 min",ifThen:FREE?FREE+", antes de abrir redes sociais.":"Logo depois do café, antes de abrir redes sociais."});
  add({id:"s_fech",title:"Antes de dormir: marcar o que fiz hoje e escolher a tarefa mais importante de amanhã",xp:15,stat:"foco",main:true,minTitle:"só marcar o que fiz",ifThen:"Quando colocar o celular para carregar à noite, abro este app primeiro."});
  if(a.studies&&f("carreira"))add({id:"s_carr",title:tech?"15 min de código no projeto pessoal ou portfólio":"15 min de carreira (estágio, LinkedIn ou portfólio)",xp:25,stat:"vendas",days:[1,3],minTitle:"5 min",ifThen:(a.works&&a.lunch)?"Ter e qui, no almoço, depois de comer.":"Ter e qui, logo depois do café."});
  if(f("corpo")){
    if(busy){add({id:"s_along",title:"Alongar 5 min ao acordar",xp:10,stat:"corpo",ifThen:"Quando o alarme das "+fm(hm(a.wake))+" tocar, levanto e alongo antes do banho."});
      add({id:"s_treino",title:"Caminhada ou treino de 30 min",xp:30,stat:"corpo",days:[5,6],minTitle:"10 min",ifThen:"Fim de semana, antes do almoço, calço o tênis."});}
    else add({id:"s_treino",title:a.train==="gym"?"Treino na academia":a.train==="run"?"Correr ou caminhar 20 min":a.train==="sport"?"Treino do seu esporte ou 20 min de preparo físico":"Mexer o corpo 20 min",xp:25,stat:"corpo",minTitle:a.train==="gym"?"20 min ou 2 séries":"5 min",ifThen:FREE?FREE+", calço o tênis e vou.":"Quando terminar a principal tarefa do dia, calço o tênis."});
  }
  else if(a.train&&a.train!=="no")add({id:"s_treino",title:a.train==="gym"?"Treino na academia":a.train==="run"?"Correr ou caminhar 20 min":"Treino do seu esporte ou 20 min de preparo físico",xp:25,stat:"corpo",minTitle:a.train==="gym"?"20 min ou 2 séries":"10 min",ifThen:FREE?FREE+", calço o tênis e vou.":"Quando terminar a principal tarefa do dia, calço o tênis."});
  if(a.works&&a.lunch&&(f("corpo")||busy))add({id:"s_almoco",title:"Almoçar sem celular e andar 5 min depois",xp:10,stat:"corpo",days:a.workDays,ifThen:"Quando sentar para almoçar ("+fm(hm(a.lunch))+"), celular no bolso."});
  if(f("dinheiro"))add({id:"s_gasto",title:"Anotar os gastos do dia (2 min)",xp:10,stat:"foco",ifThen:bus?"No ônibus da volta, anoto o que gastei.":"Antes do jantar, anoto o que gastei."});
  if(f("tela"))add({id:"s_tela",title:"Primeira hora do dia sem redes sociais",xp:15,stat:"mente",minTitle:"30 min",ifThen:"Quando acordar, deixo o celular longe e só abro redes depois do café"+(school?" e de arrumar as coisas da escola.":".")});
  if(f("leitura"))add({id:"s_ler",title:"Ler 10 páginas de um livro",xp:15,stat:"mente",minTitle:"2 páginas",ifThen:"Antes de dormir, no lugar do celular."});
  if(f("relac")&&minor)add({id:"s_amor",title:"Conversar 10 min com alguém da família, sem celular na mão",xp:10,stat:"foco",ifThen:"Na hora do jantar, celular longe da mesa."});
  else if(f("relac"))add({id:"s_amor",title:"Mandar uma mensagem de carinho para alguém importante",xp:10,stat:"foco",ifThen:(a.works&&a.lunch)?"No almoço, depois de comer, mando 1 mensagem.":"Depois do café, mando 1 mensagem."});
  if(f("casa")&&minor)add({id:"s_casa",title:"Ajudar em casa 10 min (louça, quarto ou lixo)",xp:15,stat:"foco",ifThen:"Depois do jantar, antes do celular."});
  else if(f("casa"))add({id:"s_casa",title:"10 min de arrumação",xp:15,stat:"foco",days:[5,6],ifThen:"Fim de semana, antes de pegar o celular de manhã."});
  if(a.goal){add({id:"s_meta1",title:"Escrever os 3 primeiros passos para: "+a.goal,xp:30,stat:"foco",once:true,ifThen:"No próximo fim de semana, depois do café, com papel e caneta."});
    add({id:"s_meta_d",title:"10 min na minha missão: "+a.goal,xp:20,stat:"foco",minTitle:"5 min",ifThen:FREE?FREE+", antes de abrir redes sociais.":"Logo depois da primeira tarefa do dia."});
    add({id:"s_meta",title:"1 passo da meta: "+a.goal,xp:30,stat:"vendas",days:[6],minTitle:"10 min",ifThen:"Domingo à tarde, antes de planejar a semana."});}
  if(f("remedio"))add({id:"s_remed",title:"Tomar os remédios da manhã",xp:15,stat:"corpo",main:true,ifThen:"Quando levantar ("+fm(hm(a.wake))+"), tomo junto com o primeiro copo d'água."});
  if(f("agua"))add({id:"s_agua",title:"Beber 6 copos de água",xp:10,stat:"corpo",minTitle:"3 copos",ifThen:"A cada refeição, 1 copo antes de comer."});
  const o=a.occ||"", drop=id=>{const i=Q.findIndex(q=>q.id===id);if(i>=0)Q.splice(i,1);};
  if(o==="motorista"){drop("s_sono");drop("s_amor");drop("s_agua");drop("s_along");drop("s_treino");drop("s_almoco");
    add({id:"s_agua",title:"1 garrafa de água a cada parada",xp:15,stat:"corpo",main:true,minTitle:"meia garrafa",ifThen:"Quando parar para abastecer ou comer, encho a garrafa antes de sair."});
    add({id:"s_along",title:"Alongar 5 min na parada (pernas, costas e pescoço)",xp:15,stat:"corpo",main:true,minTitle:"1 min",ifThen:"Quando descer do caminhão na parada, alongo antes de entrar no posto."});
    add({id:"s_familia",title:"Ligar ou mandar um áudio para a família",xp:15,stat:"foco",main:true,minTitle:"uma mensagem",ifThen:"Na primeira parada longa do dia, antes de comer."});
    add({id:"s_sono",title:"Dormir pelo menos 7 h quando parar para descansar",xp:20,stat:"corpo",minTitle:"6 h",ifThen:"Quando estacionar para dormir, celular no carregador e alarme definido."});
    const fe=Q.find(q=>q.id==="s_fech");if(fe)fe.ifThen="Quando parar para dormir, abro este app primeiro.";}
  if(o==="casa"){drop("s_casa");
    add({id:"s_eu",title:"20 min só pra mim (leitura, série, caminhada ou descanso)",xp:20,stat:"foco",main:true,minTitle:"10 min",ifThen:"Depois do almoço, quando a cozinha estiver em ordem."});
    add({id:"s_casa",title:"15 min de arrumação em um cômodo",xp:15,stat:"foco",main:true,minTitle:"5 min",ifThen:"Logo depois do café da manhã."});
    if(!Q.some(q=>q.id==="s_treino"))add({id:"s_treino",title:"Caminhada de 20 min",xp:20,stat:"corpo",minTitle:"10 min",ifThen:"No fim da tarde, quando o sol baixar."});}
  if(o==="estudante"||o==="escola"||a.studies)add({id:"s_provas",title:school?"Olhar as provas e trabalhos da semana (5 min)":"Olhar as provas e entregas da semana (5 min)",xp:15,stat:"mente",days:[6],ifThen:"Domingo à noite, antes de dormir, abro "+(school?"a agenda da escola.":a.level==="enem"?"o cronograma de estudo.":"o calendário do curso.")});
  if(o==="autonomo")add({id:"s_foco",title:"Trabalhar 90 min sem parar no que dá dinheiro, antes de olhar mensagens",xp:40,stat:"vendas",main:true,minTitle:"25 min",days:[0,1,2,3,4],ifThen:"Logo depois do café, celular no modo não perturbe."});
  if(o==="aposentado"){if(!Q.some(q=>q.id==="s_treino"))add({id:"s_treino",title:"Caminhada leve de 20 min",xp:20,stat:"corpo",main:true,minTitle:"10 min",ifThen:"De manhã, depois do café."});
    if(!Q.some(q=>q.id==="s_amor"))add({id:"s_amor",title:"Conversar com alguém (ligação ou visita)",xp:10,stat:"foco",ifThen:"Depois do almoço, ligo para alguém."});}
  // no máximo 3 principais contando o fechamento (remédio e tarefas da ocupação têm prioridade)
  {const pri=q=>q.id==="s_remed"?0:["s_agua","s_along","s_familia","s_eu","s_casa","s_foco"].includes(q.id)&&o?1:2;let k=0;
   for(const q of Q.filter(q=>q.main&&q.id!=="s_fech").sort((x,y)=>pri(x)-pri(y))){k++;if(k>2)q.main=false;}}
  // garante pelo menos 2 principais além do fechamento, seguindo a ordem dos focos
  let mains=Q.filter(q=>q.main).length;for(const q of Q){if(mains>=3)break;if(!q.main&&!q.once&&!q.days){q.main=true;mains++;}}
  const rk=q=>q.id==="s_remed"?0:q.id==="s_fech"?2:1;Q.sort((x,y)=>rk(x)-rk(y));
  const c={version:1,name:a.name||"Você",startDate:todayKey(),profile:a,faith:!!a.faith,quests:Q};
  if(studyIds.length)c.boss={name:"Constância nos estudos",deadline:"Renasce toda segunda",hp:10,fullHit:3,minHit:1,reward:80,questIds:studyIds,hint:"Cada revisão ou bloco de estudo tira 3 de vida; o mínimo tira 1."};
  else{const mi=Q.filter(q=>q.main&&q.id!=="s_fech").map(q=>q.id);if(mi.length)c.boss={name:"Constância da semana",deadline:"Renasce toda segunda",hp:30,fullHit:3,minHit:1,reward:80,questIds:mi,hint:"Cada tarefa principal feita tira 3 de vida; o mínimo tira 1."};}
  const mv=parseFloat(String(a.money||"").replace(/\./g,"").replace(",","."));
  if(mv>0){const d=a.moneyDate||"";c.money={goal:mv,deadline:d||undefined,label:"Meta: R$ "+mv.toLocaleString("pt-BR")+(d?" até "+d.split("-").reverse().slice(0,2).join("/"):"")};}
  return c;}
let introOnly=false;
function showIntro(only){introOnly=!!only;$("intro").hidden=false;$("onb").hidden=true;document.body.classList.add("onboarding");$("slides").scrollTo({left:0});introDots();window.scrollTo(0,0);}
function introIdx(){const s=$("slides");return Math.round(s.scrollLeft/Math.max(1,s.clientWidth));}
function introDots(){const i=introIdx();[...$("dots").children].forEach((d,k)=>d.classList.toggle("on",k===i));$("introNext").textContent=i>=2?"Começar":"Próximo";}
function endIntro(){try{localStorage.setItem("asc-u-intro","1");}catch(e){}
  if(introOnly){introOnly=false;$("intro").hidden=true;document.body.classList.remove("onboarding");window.scrollTo(0,0);return;}$("intro").hidden=true;if(!(cfg&&!cfg.blank)&&typeof openQuick==="function"){openQuick();return;}$("onb").hidden=false;window.scrollTo(0,0);}
$("slides").addEventListener("scroll",()=>{clearTimeout(introDots._t);introDots._t=setTimeout(introDots,60);});
$("introNext").addEventListener("click",()=>{const i=introIdx();if(i>=2)endIntro();else{const s=$("slides");s.scrollTo({left:(i+1)*s.clientWidth,behavior:"smooth"});}});
$("introSkip").addEventListener("click",endIntro);
$("introAgain").addEventListener("click",()=>showIntro(false));
function openOnb(){let a=(cfg&&cfg.profile)||null;
  if(!a){try{const m=location.hash.match(/p=([^&]+)/);if(m){$("o_pre").hidden=false;}if(m)a=JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g,"+").replace(/_/g,"/")))));}catch(e){a=null;}}
  fillOnb(a);$("onb").hidden=false;document.body.classList.add("onboarding");let seen=false;try{seen=localStorage.getItem("asc-u-intro")==="1";}catch(e){}if(!(cfg&&!cfg.blank)){showIntro(false);return;}$("o_cancel").hidden=!(cfg&&!cfg.blank);window.scrollTo(0,0);}
function closeOnb(){$("onb").hidden=true;document.body.classList.remove("onboarding");}
$("o_go").addEventListener("click",()=>{const a=readOnb();if(!a.name){$("o_msg").textContent="Coloque seu nome.";return;}
  if(!a.age){$("o_msg").textContent="Escolha sua faixa de idade (é ela que define ranking e privacidade).";try{$("o_age").scrollIntoView({block:"center"});}catch(e){}return;}
  cfg=buildCfg(a);
  try{localStorage.setItem("asc-u-cfg",JSON.stringify(cfg));}catch(e){}
  if(location.hash)history.replaceState(null,"",location.pathname);
  $("titleName").textContent=cfg.name;try{localStorage.setItem("asc-u-lang",(LANG_SIMPLE_OCC.includes(a.occ)||a.age==="senior")?"simples":"completo");}catch(e){}langUI();langFix(document.body);if(a.ping)setTimeout(()=>joinRank("cadastro"),0);else prog.rank=prog.rank||{on:false,asked:true};if(isMinorAge(a.age)&&prog.rank&&prog.rank.on&&!prog.rank.nick)leaveRank();try{localStorage.setItem("asc-u-news",NEWS_V);}catch(e){}closeOnb();save();render();goTab("hoje");showTip();toast("Pronto, "+cfg.name+"! "+cfg.quests.length+" quests criadas para o seu dia.");});
$("o_cancel").addEventListener("click",closeOnb);
$("redo").addEventListener("click",openOnb);
function applyCopy(){const P=(cfg&&cfg.profile)||{};const o=P.occ||"",m=isMinorAge(P.age);
  const mit=P.level==="escola"||o==="escola"?"Ex.: terminar o trabalho de Ciências":o==="estudante"?"Ex.: entregar a lista da faculdade":o==="motorista"?"Ex.: ligar para casa na parada":o==="casa"?"Ex.: pagar a conta de luz":o==="aposentado"?"Ex.: marcar a consulta":o==="autonomo"?"Ex.: mandar o orçamento que está parado":"Ex.: a coisa mais importante de hoje";
  $("mit").placeholder=mit;$("fIntent").placeholder=m?"Ex.: apresentar o trabalho sem travar":"Ex.: pedir ajuda com aquilo que estou adiando";}
// ---------- Novidades (1x por versão, para quem já tinha perfil) e fluxos de Mais ----------
const NEWS_V="5";
function showNews(){let seen="";try{seen=localStorage.getItem("asc-u-news")||"";}catch(e){}$("newsCard").hidden=!(cfg&&!cfg.blank&&seen!==NEWS_V);}
function newsDone(){try{localStorage.setItem("asc-u-news",NEWS_V);}catch(e){}$("newsCard").hidden=true;}
$("newsRedo").addEventListener("click",()=>{newsDone();openOnb();});
$("newsIntro").addEventListener("click",()=>{showIntro(true);});
$("newsClose").addEventListener("click",newsDone);
$("introMais").addEventListener("click",()=>showIntro(true));
let wipeArmed=0;
$("wipe").addEventListener("click",()=>{const b=$("wipe");
  if(Date.now()-wipeArmed>5000){wipeArmed=Date.now();b.textContent="Tem certeza? Toque de novo para apagar";return;}
  try{Object.keys(localStorage).filter(k=>k.startsWith("asc-u-")).forEach(k=>localStorage.removeItem(k));}catch(e){}
  location.replace(location.pathname);});
setTimeout(showNews,0);
$("o_bkGo").addEventListener("click",()=>{let withCfg=false;try{withCfg=restoreBackup($("o_bk").value);}catch(e){$("o_msg").textContent="Esse texto não é um backup válido.";return;}if(withCfg===null)return;
  $("o_bk").value="";if(withCfg){try{localStorage.setItem("asc-u-news",NEWS_V);}catch(e){}closeOnb();render();goTab("hoje");toast("Tudo de volta: tarefas, pontos e histórico.");}
  else{$("o_bkBox").open=false;$("o_msg").textContent="Pontos e histórico de volta. Esse backup é antigo e não tem as tarefas: confira o perfil e toque em Criar meu jogo.";}});

// Textos mais claros para quem já tinha o jogo (só troca o título; progresso e XP ficam iguais)
{const FIX={"Fechamento de 3 min: marcar as quests e escolher a nº 1 de amanhã":"Antes de dormir: marcar o que fiz hoje e escolher a tarefa mais importante de amanhã","Almoço de verdade: 10 min sem celular e 5 min andando":"Almoçar sem celular e andar 5 min depois","Bloco de 90 min no trabalho que dá dinheiro, antes de abrir mensagens":"Trabalhar 90 min sem parar no que dá dinheiro, antes de olhar mensagens"};
  setTimeout(()=>{try{let ch=false;for(const q of (cfg&&cfg.quests)||[]){if(FIX[q.title]){q.title=FIX[q.title];if(q.id==="s_fech"&&!q.minTitle)q.minTitle="só marcar o que fiz";ch=true;}}if(ch){localStorage.setItem("asc-u-cfg",JSON.stringify(cfg));try{render();}catch(e){}}}catch(e){}},0);}
