// ---------- Perfil e geração de quests (onboarding) ----------
const DN=["seg","ter","qua","qui","sex","sáb","dom"];
const FOCI=[["estudos","Estudos"],["sono","Dormir melhor"],["corpo","Saúde e corpo"],["carreira","Carreira"],["dinheiro","Dinheiro"],["relac","Pessoas que amo"],["casa","Casa em ordem"],["remedio","Remédios no horário"],["agua","Beber água"]];
function toggles(id,items,sel,max){const box=$(id);box.textContent="";for(const [v,l] of items){const b=document.createElement("button");b.type="button";b.textContent=l;b.dataset.v=v;if(sel.includes(v))b.classList.add("on");
  b.addEventListener("click",()=>{if(!b.classList.contains("on")&&max&&box.querySelectorAll(".on").length>=max){$("o_msg").textContent="Escolha no máximo "+max+".";return;}b.classList.toggle("on");});box.append(b);}}
const picked=id=>[...$(id).querySelectorAll(".on")].map(b=>b.dataset.v);
function fillOnb(a){a=a||{};const v=(id,x)=>{if(x!=null)$(id).value=x;};
  v("o_name",a.name);v("o_wake",a.wake);v("o_sleep",a.sleep);v("o_workStart",a.workStart);v("o_lunch",a.lunch);v("o_workEnd",a.workEnd);v("o_course",a.course);v("o_classStart",a.classStart);v("o_classEnd",a.classEnd);v("o_transport",a.transport);v("o_goal",a.goal);v("o_money",a.money);v("o_moneyDate",a.moneyDate);
  if(a.works!=null)$("o_works").checked=a.works;if(a.studies!=null)$("o_studies").checked=a.studies;if(a.faith!=null)$("o_faith").checked=a.faith;if(a.ping!=null)$("o_ping").checked=a.ping;
  const dd=DN.map((l,i)=>[String(i),l]);toggles("o_workDays",dd,(a.workDays||[0,1,2,3,4]).map(String));toggles("o_classDays",dd,(a.classDays||[0,1,2,3,4]).map(String));
  toggles("o_focus",FOCI,a.focus||["sono","corpo"],4);syncBoxes();}
function syncBoxes(){$("o_workBox").hidden=!$("o_works").checked;$("o_studyBox").hidden=!$("o_studies").checked;}
$("o_works").addEventListener("change",syncBoxes);$("o_studies").addEventListener("change",syncBoxes);
function readOnb(){const g=id=>$(id).value.trim();return {name:g("o_name"),wake:g("o_wake")||"07:00",sleep:g("o_sleep")||"23:00",works:$("o_works").checked,workDays:picked("o_workDays").map(Number),workStart:g("o_workStart"),lunch:g("o_lunch"),workEnd:g("o_workEnd"),
  studies:$("o_studies").checked,course:g("o_course"),classDays:picked("o_classDays").map(Number),classStart:g("o_classStart"),classEnd:g("o_classEnd"),transport:g("o_transport"),focus:picked("o_focus"),goal:g("o_goal"),money:g("o_money"),moneyDate:g("o_moneyDate"),faith:$("o_faith").checked,ping:$("o_ping").checked};}
const hm=t=>{const [h,m]=(t||"0:0").split(":").map(Number);return h*60+(m||0);};
const fm=m=>{m=((m%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+"h"+(m%60?String(m%60).padStart(2,"0"):"");};
function buildCfg(a){const Q=[];let n=0;const add=q=>{q.id=q.id||("g"+(++n));Q.push(q);return q;};
  const bus=a.transport==="onibus", busy=a.works&&a.studies, f=x=>a.focus.includes(x);
  const sleepH=((hm(a.wake)-hm(a.sleep)+1440)%1440)/60;
  const tech=/comput|sistem|software|dados|ti\b|informát|ciência da/i.test(a.course||"");
  const studyIds=[];
  if(a.studies){
    const days=a.works&&a.workDays.length?a.workDays:(a.classDays.length?a.classDays:[0,1,2,3,4]);
    const anchor=bus?"Quando sentar no ônibus da ida, abro os flashcards antes de qualquer rede social."
      :(a.works&&a.lunch)?"Quando terminar de almoçar (por volta das "+fm(hm(a.lunch)+30)+"), abro o material e dou play no timer."
      :"Logo depois do café da manhã, abro o material da última aula.";
    studyIds.push(add({id:"s_rev",title:(bus?"Revisão ativa no ônibus: ":"Revisão ativa: ")+"15 min de perguntas ou flashcards da última aula",xp:30,stat:"mente",main:true,minTitle:"5 cards",days,ifThen:anchor}).id);
    if(a.classDays.length)add({id:"s_aula",title:"Na aula: anotar 1 dúvida e tirar com o professor ou o grupo",xp:15,stat:"mente",days:a.classDays,minTitle:"só anotar",ifThen:"Quando a aula começar ("+fm(hm(a.classStart))+"), abro a nota \"Dúvidas\" do celular."});
    studyIds.push(add({id:"s_bloco",title:"Bloco de estudo de 50 min (lista, trabalho ou projeto)",xp:40,stat:"mente",main:true,minTitle:"25 min",days:[5],ifThen:"Sábado, depois do café, ligo o modo foco de 25 min duas vezes."}).id);
  }
  if(f("sono")||sleepH<7.5){
    const pre=(a.studies&&a.classEnd&&hm(a.classEnd)>hm("20:00"))?"Quando chegar da faculdade: banho, roupa de amanhã separada e celular no carregador fora da cama.":"Às "+fm(hm(a.sleep)-30)+", celular no carregador fora da cama e luz baixa.";
    add({id:"s_sono",title:"Deitar até "+fm(hm(a.sleep))+", sem tela na cama",xp:25,stat:"corpo",main:true,minTitle:"celular longe da cama",ifThen:pre});
  }
  if(!a.studies&&f("carreira"))add({id:"s_carr",title:tech?"20 min de programação no seu projeto":"20 min de carreira (curso, portfólio ou currículo)",xp:30,stat:"vendas",main:true,minTitle:"5 min",ifThen:"Logo depois do café, antes de abrir redes sociais."});
  add({id:"s_fech",title:"Fechamento de 3 min: marcar as quests e escolher a nº 1 de amanhã",xp:15,stat:"foco",main:true,ifThen:"Quando colocar o celular para carregar à noite, abro este app primeiro."});
  if(a.studies&&f("carreira"))add({id:"s_carr",title:tech?"15 min de código no projeto pessoal ou portfólio":"15 min de carreira (estágio, LinkedIn ou portfólio)",xp:25,stat:"vendas",days:[1,3],minTitle:"5 min",ifThen:(a.works&&a.lunch)?"Ter e qui, no almoço, depois de comer.":"Ter e qui, logo depois do café."});
  if(f("corpo")){
    if(busy){add({id:"s_along",title:"Alongar 5 min ao acordar",xp:10,stat:"corpo",ifThen:"Quando o alarme das "+fm(hm(a.wake))+" tocar, levanto e alongo antes do banho."});
      add({id:"s_treino",title:"Caminhada ou treino de 30 min",xp:30,stat:"corpo",days:[5,6],minTitle:"10 min",ifThen:"Fim de semana, antes do almoço, calço o tênis."});}
    else add({id:"s_treino",title:"Mexer o corpo 20 min",xp:25,stat:"corpo",minTitle:"5 min",ifThen:"Quando terminar a principal tarefa do dia, calço o tênis."});
  }
  if(a.works&&a.lunch&&(f("corpo")||busy))add({id:"s_almoco",title:"Almoço de verdade: 10 min sem celular e 5 min andando",xp:10,stat:"corpo",days:a.workDays,ifThen:"Quando sentar para almoçar ("+fm(hm(a.lunch))+"), celular no bolso."});
  if(f("dinheiro"))add({id:"s_gasto",title:"Anotar os gastos do dia (2 min)",xp:10,stat:"foco",ifThen:bus?"No ônibus da volta, anoto o que gastei.":"Antes do jantar, anoto o que gastei."});
  if(f("relac"))add({id:"s_amor",title:"Mandar uma mensagem de carinho para alguém importante",xp:10,stat:"foco",ifThen:(a.works&&a.lunch)?"No almoço, depois de comer, mando 1 mensagem.":"Depois do café, mando 1 mensagem."});
  if(f("casa"))add({id:"s_casa",title:"10 min de arrumação",xp:15,stat:"foco",days:[5,6],ifThen:"Fim de semana, antes de pegar o celular de manhã."});
  if(a.goal){add({id:"s_meta1",title:"Escrever os 3 primeiros passos para: "+a.goal,xp:30,stat:"foco",once:true,ifThen:"No próximo fim de semana, depois do café, com papel e caneta."});
    add({id:"s_meta",title:"1 passo da meta: "+a.goal,xp:30,stat:"vendas",days:[6],minTitle:"10 min",ifThen:"Domingo à tarde, antes de planejar a semana."});}
  if(f("remedio"))add({id:"s_remed",title:"Tomar os remédios da manhã",xp:15,stat:"corpo",main:true,ifThen:"Quando levantar ("+fm(hm(a.wake))+"), tomo junto com o primeiro copo d'água."});
  if(f("agua"))add({id:"s_agua",title:"Beber 6 copos de água",xp:10,stat:"corpo",minTitle:"3 copos",ifThen:"A cada refeição, 1 copo antes de comer."});
  // garante pelo menos 2 principais além do fechamento, seguindo a ordem dos focos
  let mains=Q.filter(q=>q.main).length;for(const q of Q){if(mains>=3)break;if(!q.main&&!q.once&&!q.days){q.main=true;mains++;}}
  const rk=q=>q.id==="s_remed"?0:q.id==="s_fech"?2:1;Q.sort((x,y)=>rk(x)-rk(y));
  const c={version:1,name:a.name||"Você",startDate:todayKey(),profile:a,faith:!!a.faith,quests:Q};
  if(studyIds.length)c.boss={name:"Constância nos estudos",deadline:"Renasce toda segunda",hp:10,fullHit:3,minHit:1,reward:80,questIds:studyIds,hint:"Cada revisão ou bloco de estudo tira 3 de vida; o mínimo tira 1."};
  const mv=parseFloat(String(a.money||"").replace(/\./g,"").replace(",","."));
  if(mv>0){const d=a.moneyDate||"";c.money={goal:mv,deadline:d||undefined,label:"Meta: R$ "+mv.toLocaleString("pt-BR")+(d?" até "+d.split("-").reverse().slice(0,2).join("/"):"")};}
  return c;}
function openOnb(){let a=(cfg&&cfg.profile)||null;
  if(!a){try{const m=location.hash.match(/p=([^&]+)/);if(m){$("o_pre").hidden=false;}if(m)a=JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g,"+").replace(/_/g,"/")))));}catch(e){a=null;}}
  fillOnb(a);$("onb").hidden=false;document.body.classList.add("onboarding");$("o_cancel").hidden=!(cfg&&!cfg.blank);window.scrollTo(0,0);}
function closeOnb(){$("onb").hidden=true;document.body.classList.remove("onboarding");}
$("o_go").addEventListener("click",()=>{const a=readOnb();if(!a.name){$("o_msg").textContent="Coloque seu nome.";return;}
  cfg=buildCfg(a);
  try{localStorage.setItem("asc-u-cfg",JSON.stringify(cfg));}catch(e){}
  if(location.hash)history.replaceState(null,"",location.pathname);
  $("titleName").textContent=cfg.name;prog.ping=prog.ping||{};prog.ping.asked=true;if(a.ping)sendPing("cadastro");closeOnb();save();render();goTab("hoje");showTip();toast("Pronto, "+cfg.name+"! "+cfg.quests.length+" quests criadas para o seu dia.");});
$("o_cancel").addEventListener("click",closeOnb);
$("redo").addEventListener("click",openOnb);
