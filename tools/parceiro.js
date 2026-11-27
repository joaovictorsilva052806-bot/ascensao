// ---------- Turma Parceiro (tools/parceiro.*): um treinador ou academia roda o Desafio 30 com alunos ADULTOS ----------
// Pedido da EVA na #22 (7227387195, 7227438601). Reaproveita o ranking (token), o registro de faixa do mural e o Desafio Forja 30.
// Regras: (1) só 18+ pela trava de tools/idade.js (ad18): 14-17, até 13 e sem idade não entram pelo link; (2) o parceiro vê SÓ números
// da turma (participantes, ativos hoje, % que treinou na semana) e o top 3 de quem marcou; com menos de 3 participantes, ativos e % somem;
// (3) do aparelho do aluno sai 1 bit por dia ("treinou hoje": sim/não) e só se ele entrou na turma; nada de tarefa, foto, dor, corpo ou saúde;
// (4) sem logo de terceiro: o parceiro é só um nome; (5) prêmio do parceiro DESLIGADO (PT_PREMIO=false) até o parecer do ATLAS.
// Só ADICIONA prog.parc = {c, pn, m, pr, top, j, sent:{d,f}, h:[{c,pn,s,e}]} (aluno) e prog.parcD = [{c, pn, m, t}] (turmas que você criou).
// O link pendente fica fora do progresso, em asc-u-parc-link. Servidor: seção PARCEIRO do server/mural.gs (ações pt-*).
const PT_PREMIO=false;
const PT_MIN=3,PT_METAS=[20,25,30],PT_LINK_KEY="asc-u-parc-link";
function ptEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
const ptCode=c=>{c=String(c||"");return /^p[a-z0-9]{10}$/.test(c)?c:"";};
// nome do parceiro: até 30 letras, sem telefone, e-mail, @ ou link (o servidor confere de novo)
const ptName=s=>{const t=String(s||"").replace(/[<>|\n\r]/g," ").replace(/\s+/g," ").trim().slice(0,30);return !t||/\d{4,}|@|https?:|www\.|\.com|[{}\[\]=]/i.test(t)?"":t;};
function ptSt(){let p=prog.parc;if(!p||typeof p!=="object"||Array.isArray(p))p=prog.parc={};if(!Array.isArray(p.h))p.h=[];if(!p.sent||typeof p.sent!=="object")p.sent={};return p;}
function ptMine(){if(!Array.isArray(prog.parcD))prog.parcD=[];return prog.parcD;}
function pt18(){try{return typeof ad18==="function"&&ad18();}catch(e){return false;}}
function ptKid(){try{return ageNow()==="kid";}catch(e){return false;}}
function ptLinkGet(){try{const o=JSON.parse(localStorage.getItem(PT_LINK_KEY)||"null");return o&&ptCode(o.c)?o:null;}catch(e){return null;}}
function ptLinkDrop(){try{localStorage.removeItem(PT_LINK_KEY);}catch(e){}}
// link do parceiro: ...comecar/?pt=CÓDIGO&pn=NOME. Guarda até a pessoa decidir; sai da barra de endereço
(function(){try{const u=new URLSearchParams(location.search);if(!u.has("pt"))return;const c=ptCode(u.get("pt"));
  if(c)localStorage.setItem(PT_LINK_KEY,JSON.stringify({c,pn:ptName(u.get("pn"))||"Parceiro",t:Date.now()}));
  u.delete("pt");u.delete("pn");history.replaceState(null,"",location.pathname+(u.toString()?"?"+u:"")+location.hash);}catch(e){}})();
function ptUrl(c,pn){const base=new URL(location.pathname.indexOf("/comecar/")>=0?"./":"comecar/",location.href);base.search="";base.hash="";
  return base.href+"?pt="+c+"&pn="+encodeURIComponent(pn);}
function ptPage(){return (location.pathname.indexOf("/comecar/")>=0?"../":"")+"parceiros/";}
const ptTitle=pn=>"Desafio 30 · "+pn;
// pronto para falar com o servidor? (ranking com apelido e token; o servidor confere tudo de novo)
function ptReady(){try{return tmOn()&&!!rankName()&&!!muTok();}catch(e){return false;}}
const PT_ERR={idade:"Este desafio é só para maiores de 18 anos.",token:"Seu apelido ainda está sendo confirmado. Tente de novo em alguns minutos.",
  codigo:"Este link de turma não existe mais. Peça um novo ao parceiro.",cheia:"Esta turma está cheia.",limite:"Muitas tentativas agora. Tente de novo em alguns minutos.",
  nome:"Use só o nome do parceiro (sem telefone, e-mail, @ ou site).",dono:"Só quem criou a turma vê o painel.",acao:"O servidor ainda não tem a Turma Parceiro. Tente de novo mais tarde."};
const ptErr=e=>PT_ERR[String(e&&e.message||"")]||"Sem conexão agora. Tente de novo em instantes.";
// faixa 18+ registrada no servidor (o mesmo "reg" do mural: só a faixa, sem data de nascimento)
async function ptReg(){const s=muSt();if(s.ok&&s.reg==="adult")return;if(s.ptReg==="adult")return;await muApi("reg",{band:"adult",par:0});s.ptReg="adult";save();}
async function ptApi(a,o){await ptReg();return muApi(a,o);}
// treinou hoje: sessão do Forja ou dia marcado no Desafio Forja 30. Vai só sim/não.
function ptTrained(){const tk=todayKey();try{const f=fjS();if((f.ses||[]).some(x=>x&&x.d===tk))return true;}catch(e){}
  try{const d=f30St().d[tk];if(d)return true;}catch(e){}return false;}

// ===== aluno: cartão em Hoje =====
let ptBusy=false,ptLast=""; // ptLast: o último envio desta abertura (o progresso pode ser recarregado no meio)
function ptHost(){const st=$("dayPill");return st&&st.closest("section");}
function ptCard(){let p=$("ptCard");const host=ptHost();if(!host)return null;
  if(!p){p=ptEl("section","panel ptcard");p.id="ptCard";p.dataset.tab="hoje";p.dataset.sf="1";p.setAttribute("aria-live","polite");host.after(p);}return p;}
function ptHide(){const p=$("ptCard");if(p)p.hidden=true;}
function ptInvite(p,lk){p.textContent="";p.hidden=false;
  p.append(ptEl("div","tag","[ SISTEMA ] CONVITE DE PARCEIRO"),ptEl("h2",null,"🤝 "+ptTitle(lk.pn)));
  if(!pt18()){p.append(ptEl("p","ptlead","Este desafio de parceiro é só para maiores de 18 anos."),ptEl("p","sm muted","Seu jogo continua igual. Nada foi enviado."));
    const b=ptEl("button","ghost","Entendi");b.type="button";b.addEventListener("click",()=>{ptLinkDrop();ptHide();});p.append(b);return;}
  p.append(ptEl("p","ptlead","Treine 20 de 30 dias com a turma de "+lk.pn+"."));
  const ul=ptEl("ul","sm ptlist");for(const t of ["O parceiro vê só números da turma: quantos entraram, quantos abriram hoje e quantos treinaram na semana.","Do seu celular sai só “treinou hoje: sim ou não”. Nunca suas tarefas, fotos, dor ou saúde.","Pode sair quando quiser, em 1 toque."])ul.append(ptEl("li",null,t));p.append(ul);
  const l=ptEl("label","chk sm");const top=ptEl("input");top.type="checkbox";l.append(top,document.createTextNode(" Mostrar meu apelido no top 3 da turma (opcional)"));p.append(l);
  const msg=ptEl("div","sm ptmsg");msg.setAttribute("role","status");p.append(msg);
  const row=ptEl("div","row");const ok=ptEl("button","go","Entrar no desafio");ok.type="button";const no=ptEl("button","ghost","Agora não");no.type="button";row.append(ok,no);p.append(row);
  no.addEventListener("click",()=>{ptLinkDrop();ptHide();toast("Tudo bem. O convite saiu daqui.");});
  ok.addEventListener("click",async()=>{if(ptBusy)return;
    if(!ptReady()){msg.textContent="Primeiro entre no ranking (só o apelido aparece). Depois toque de novo aqui.";try{joinRank("parceiro");}catch(e){}return;}
    ptBusy=true;ok.disabled=true;msg.textContent="Entrando…";
    try{const j=await ptApi("pt-join",{c:lk.c,top:top.checked?1:0});const s=ptSt();
      if(s.c&&s.c!==lk.c)s.h.push({c:s.c,pn:s.pn,s:s.j,e:todayKey()});s.h=s.h.slice(-12);
      Object.assign(s,{c:lk.c,pn:ptName(j.pn)||lk.pn,m:PT_METAS.includes(+j.m)?+j.m:20,pr:PT_PREMIO&&j.pr?ptName(j.pr):"",top:top.checked?1:0,j:todayKey(),sent:{d:todayKey(),f:0}});
      ptLinkDrop();try{if(typeof f30Ok==="function"&&f30Ok()&&!f30On())f30Start();}catch(e){}save();try{haptic([12,30,12]);}catch(e){}
      toast("🤝 Você entrou no "+ptTitle(s.pn)+". Bora para o dia 1.");ptUI();}
    catch(e){msg.textContent=ptErr(e);ok.disabled=false;}finally{ptBusy=false;}});}
function ptMember(p,s){p.textContent="";p.hidden=false;
  const hd=ptEl("div","pthd");hd.append(ptEl("h2",null,"🤝 "+ptTitle(s.pn)));p.append(hd);
  let n=0,idx=0;try{const f=f30St();if(f30On()){n=f30Count(f);idx=f30Idx(f);}}catch(e){}
  const meta=s.m||20;const bar=ptEl("div","ptbar");bar.setAttribute("role","progressbar");bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax",String(meta));bar.setAttribute("aria-valuenow",String(Math.min(n,meta)));
  bar.setAttribute("aria-label","Dias no desafio");const fill=ptEl("i");fill.style.width=Math.min(100,Math.round(100*n/meta))+"%";bar.append(fill);p.append(bar);
  p.append(ptEl("p","ptlead",idx?n+" de "+meta+" dias · dia "+idx+" de 30":"Comece o Desafio Forja 30 no card 🔥 Forja para contar os dias."));
  if(PT_PREMIO&&s.pr)p.append(ptEl("p","sm ptpr","🎁 Quem cumprir a meta ganha: "+s.pr+", dado por "+s.pn+"."));
  p.append(ptEl("p","sm muted",ptTrained()?"✅ Treino de hoje contou para a turma.":"Treinou hoje? O Forja ou a caminhada do desafio contam para a turma."));
  const l=ptEl("label","chk sm");const top=ptEl("input");top.type="checkbox";top.checked=!!s.top;l.append(top,document.createTextNode(" Meu apelido no top 3 da turma"));p.append(l);
  top.addEventListener("change",async()=>{const v=top.checked?1:0;try{await ptApi("pt-top",{c:s.c,top:v});s.top=v;save();toast(v?"Seu apelido pode aparecer no top 3.":"Seu apelido saiu do top 3.");}catch(e){top.checked=!v;toast(ptErr(e));}});
  const out=ptEl("button","link ptout","Sair da turma");out.type="button";
  out.addEventListener("click",async()=>{if(out.dataset.k!=="1"){out.dataset.k="1";out.textContent="Toque de novo para sair (seu treino e seu XP continuam)";return;}
    try{await ptApi("pt-out",{c:s.c});}catch(e){if(!/fora|codigo/.test(String(e&&e.message))){toast(ptErr(e));return;}}
    s.h.push({c:s.c,pn:s.pn,s:s.j,e:todayKey()});s.h=s.h.slice(-12);s.c="";save();ptHide();toast("Você saiu da turma de "+s.pn+". Seu Desafio continua no seu jogo.");});
  p.append(out);}
// 1 envio por dia (e outro se treinar depois): só {c, f}
async function ptPing(){const s=ptSt();if(ptBusy||!s.c||!pt18()||!ptReady())return;const tk=todayKey();const f=ptTrained()?1:0;
  if(s.sent.d===tk&&(s.sent.f||0)>=f)return;const key=s.c+":"+tk+":"+f;if(ptLast===key){s.sent={d:tk,f};save();return;}ptBusy=true;
  try{await ptApi("pt-day",{c:s.c,f});ptLast=key;const s2=ptSt();s2.sent={d:tk,f};save();}
  catch(e){const m=String(e&&e.message||"");if(m==="fora"||m==="codigo"){s.h.push({c:s.c,pn:s.pn,s:s.j,e:tk});s.h=s.h.slice(-12);s.c="";save();toast("A turma de "+s.pn+" foi encerrada. Seu Desafio continua no seu jogo.");ptHide();}}
  finally{ptBusy=false;}}
function ptUI(){const p=ptCard();if(!p)return;if(ptKid()||!cfg||cfg.blank||document.body.classList.contains("onboarding")){p.hidden=true;if(ptKid())ptLinkDrop();return;}
  if(p.contains(document.activeElement)&&document.activeElement.tagName==="INPUT")return;
  const lk=ptLinkGet();const s=ptSt();
  if(lk&&lk.c!==s.c){ptInvite(p,lk);return;}
  if(lk)ptLinkDrop();
  if(s.c&&pt18()){ptMember(p,s);setTimeout(()=>ptPing().catch(()=>{}),0);return;}
  p.hidden=true;}

// ===== parceiro: painel em Mais =====
const ptStats={};let ptView="";
function ptPanel(){let p=$("ptPanel");if(!p){const ms=document.querySelectorAll('.wrap>section[data-tab="mais"]:not(#ptPanel)');const anchor=ms[ms.length-1];if(!anchor)return null;
  p=ptEl("section","panel ptpanel");p.id="ptPanel";p.dataset.tab="mais";anchor.after(p);}return p;}
function ptTile(v,l,id){const d=ptEl("div","pttile");if(id)d.dataset.k=id;d.append(ptEl("b",null,v),ptEl("span",null,l));return d;}
async function ptLoad(c){if(ptStats[c]&&ptStats[c].loading)return;ptStats[c]={loading:1};try{const j=await ptApi("pt-stat",{c});ptStats[c]={t:Date.now(),j};}catch(e){ptStats[c]={t:Date.now(),err:ptErr(e),code:String(e&&e.message||"")};}
  if(ptStats[c].code==="dono"||ptStats[c].code==="codigo"){const L=ptMine();const i=L.findIndex(x=>x.c===c);if(i>=0){L.splice(i,1);save();}}ptPanelUI();}
async function ptShare(t){const url=ptUrl(t.c,t.pn);const text=ptTitle(t.pn)+": 30 dias de treino em casa no Ascension, 20 contam. Entre pelo link (só maiores de 18):";
  try{if(navigator.share){await navigator.share({title:ptTitle(t.pn),text,url});return;}}catch(e){if(e&&e.name==="AbortError")return;}
  try{await navigator.clipboard.writeText(text+" "+url);toast("Link copiado. Cole no grupo da turma.");}catch(e){window.open("https://wa.me/?text="+encodeURIComponent(text+" "+url),"_blank","noopener");}}
function ptForm(p){const f=ptEl("div","ptform");
  const lb=ptEl("label","ptlbl","Nome do parceiro (aparece no link)");const inp=ptEl("input","ptname");inp.maxLength=30;inp.autocomplete="off";inp.placeholder="Ex.: Studio X";lb.append(inp);f.append(lb);
  let meta=20;const ch=ptEl("div","ptmeta");ch.setAttribute("role","radiogroup");ch.setAttribute("aria-label","Meta do desafio");
  for(const m of PT_METAS){const b=ptEl("button",m===meta?"on":"",m+" de 30");b.type="button";b.setAttribute("role","radio");b.setAttribute("aria-checked",m===meta?"true":"false");
    b.addEventListener("click",()=>{meta=m;for(const x of ch.children){x.classList.toggle("on",x===b);x.setAttribute("aria-checked",x===b?"true":"false");}});ch.append(b);}
  f.append(ptEl("div","ptlbl","Meta: dias de treino em 30"),ch);
  let pr=null;if(PT_PREMIO){const l2=ptEl("label","ptlbl","Prêmio de quem cumprir a meta (você entrega)");pr=ptEl("input","ptname");pr.maxLength=30;pr.placeholder="Ex.: 1 mês grátis";l2.append(pr);f.append(l2,ptEl("p","sm muted","Sem sorteio e sem compra: ganha quem cumprir a meta."));}
  const msg=ptEl("div","sm ptmsg");msg.setAttribute("role","status");f.append(msg);
  const ok=ptEl("button","go","Criar link da turma");ok.type="button";f.append(ok);
  ok.addEventListener("click",async()=>{const n=ptName(inp.value);if(!n){msg.textContent=inp.value.trim()?PT_ERR.nome:"Escreva o nome do parceiro.";inp.focus();return;}
    if(!ptReady()){msg.textContent="Primeiro entre no ranking (só o apelido aparece). Depois toque de novo aqui.";try{joinRank("parceiro");}catch(e){}return;}
    ok.disabled=true;msg.textContent="Criando…";
    try{const o={pn:n,m:meta};if(PT_PREMIO&&pr)o.pr=ptName(pr.value);const j=await ptApi("pt-new",o);const t={c:ptCode(j.c),pn:ptName(j.pn)||n,m:+j.m||meta,t:todayKey()};
      if(!t.c)throw new Error("erro");ptMine().push(t);ptView=t.c;save();toast("🤝 Turma "+ptTitle(t.pn)+" criada. Mande o link no grupo.");ptPanelUI();ptLoad(t.c);}
    catch(e){msg.textContent=ptErr(e);ok.disabled=false;}});
  p.append(f);}
function ptDash(p,t){const box=ptEl("div","ptdash");box.append(ptEl("h3",null,ptTitle(t.pn)),ptEl("p","sm muted","Meta: "+(t.m||20)+" de 30 dias. Você vê só números da turma."));
  const S=ptStats[t.c];const g=ptEl("div","pttiles");
  if(!S||S.loading)g.append(ptEl("p","sm muted","Carregando o painel…"));
  else if(S.err)g.append(ptEl("p","sm muted",S.err));
  else{const j=S.j;const n=+j.n||0;g.append(ptTile(String(n),"participantes","n"),ptTile(j.hoje==null?"–":String(j.hoje),"ativos hoje","hoje"),ptTile(j.sem==null?"–":j.sem+"%","treinou na semana","sem"));}
  box.append(g);
  if(S&&S.j&&(S.j.hoje==null||S.j.sem==null))box.append(ptEl("p","sm muted ptpriv","Com menos de "+PT_MIN+" participantes, ativos e % ficam ocultos para proteger quem entrou."));
  if(S&&S.j){const top=(S.j.top||[]).slice(0,3);const ol=ptEl("ol","pttop");ol.setAttribute("aria-label","Top 3 da turma");
    top.forEach((r,i)=>{const li=ptEl("li");li.append(ptEl("span",null,["🥇","🥈","🥉"][i]),ptEl("b",null,String(r.a||"").slice(0,16)),ptEl("span","sm muted",(+r.k||0)+" dias"));ol.append(li);});
    box.append(ptEl("div","ptlbl","Top 3 (só quem marcou)"));box.append(top.length?ol:ptEl("p","sm muted","Ninguém marcou o top 3 ainda."));}
  const row=ptEl("div","row");const sh=ptEl("button","go","📨 Mandar o link");sh.type="button";sh.addEventListener("click",()=>ptShare(t));
  const up=ptEl("button","ghost","Atualizar");up.type="button";up.addEventListener("click",()=>{delete ptStats[t.c];ptPanelUI();ptLoad(t.c);});row.append(sh,up);box.append(row);
  const end=ptEl("button","link ptend","Encerrar esta turma");end.type="button";
  end.addEventListener("click",async()=>{if(end.dataset.k!=="1"){end.dataset.k="1";end.textContent="Toque de novo para encerrar (apaga os números de todos da turma)";return;}
    try{await ptApi("pt-end",{c:t.c});}catch(e){if(!/dono|codigo/.test(String(e&&e.message))){toast(ptErr(e));return;}}
    const L=ptMine();const i=L.indexOf(t);if(i>=0)L.splice(i,1);delete ptStats[t.c];ptView="";save();ptPanelUI();toast("Turma encerrada. Os números dela foram apagados.");});
  box.append(end);p.append(box);}
function ptPanelUI(){const p=ptPanel();if(!p)return;if(!pt18()||!cfg||cfg.blank){p.hidden=true;return;}
  if(p.contains(document.activeElement)&&document.activeElement.tagName==="INPUT")return;p.hidden=false;
  const wasOpen=p.classList.contains("open");p.textContent="";
  const hd=ptEl("div","qhead");hd.append(ptEl("h2",null,"🤝 Turma Parceiro"),ptEl("span","sm muted","treinador ou academia"));p.append(hd);
  p.append(ptEl("p","sm","Rode um desafio de 30 dias de treino em casa com seus alunos adultos. Você manda 1 link; o painel mostra só números da turma."));
  const L=ptMine();if(L.length){if(!L.some(x=>x.c===ptView))ptView=L[0].c;
    if(L.length>1){const bar=ptEl("div","ptsel");for(const t of L){const b=ptEl("button","ptchip"+(t.c===ptView?" on":""),t.pn);b.type="button";b.setAttribute("aria-pressed",t.c===ptView?"true":"false");b.addEventListener("click",()=>{ptView=t.c;ptPanelUI();if(!ptStats[t.c])ptLoad(t.c);});bar.append(b);}p.append(bar);}
    const t=L.find(x=>x.c===ptView);ptDash(p,t);if(!ptStats[t.c])ptLoad(t.c);
    if(L.length<3){const d=ptEl("details","ptmore");d.append(ptEl("summary",null,"+ Criar outra turma"));ptForm(d);p.append(d);}}
  else ptForm(p);
  const a=ptEl("a","link ptinfo","Como funciona a Turma Parceiro");a.href=ptPage();a.target="_blank";a.rel="noopener";p.append(a);
  if(wasOpen)p.classList.add("open");}
{const _r=render;render=function(){_r.apply(this,arguments);try{ptUI();}catch(e){}try{ptPanelUI();}catch(e){}};}
setTimeout(()=>{try{ptUI();ptPanelUI();}catch(e){}},0);
