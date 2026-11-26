// ---------- Convite que não se perde (26/11) ----------
// Problema: no iPhone, o app instalado na Tela de Início não enxerga o que foi aberto no Safari. Quem já tem o jogo
// (ou instala depois de tocar no link) perdia o convite da turma. Agora:
// 1) Link aberto fora do app instalado: um aviso no topo com "Copiar convite" e o passo a passo para colar no app.
// 2) Aba Amigos: "Recebeu um convite? Cole aqui" aceita o link (ou a mensagem inteira do WhatsApp) e faz o mesmo que abrir o link:
//    grava as 3 chaves que o convite já usa (asc-amigo, asc-amigo-c, asc-amigo-t) e chama o fluxo de sempre (cdInvDo).
// Não grava nada novo nem manda nada além do que o link já mandava. Menor de 14: sem convite (mesma regra do ranking).
function clEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function clStandalone(){try{return !!(navigator.standalone||matchMedia("(display-mode: standalone)").matches);}catch(e){return false;}}
// lê amigo/c/t de um texto qualquer (link puro, ou a mensagem do WhatsApp com o link dentro)
// pontuação colada no fim do link ("LINK.", "(LINK)", "entra aí LINK!") não entra no nome nem na turma
const clTrim=v=>String(v||"").replace(/(?:[.,;:!?)\]}'"]|%2[129cC]|%3[aAbBfF]|%5[dD]|%7[dD])+$/,"");
function clParse(txt){const s=String(txt||"");const m=/[?&]amigo=([^&\s#]+)/.exec(s);if(!m)return null;
  const dec=v=>{try{return decodeURIComponent(clTrim(v).replace(/\+/g," "));}catch(e){return clTrim(v);}};
  const a=typeof cleanNick==="function"?cleanNick(dec(m[1])):dec(m[1]).trim().slice(0,24);if(!a)return null;
  const c=((/[?&]c=([a-z0-9]+)/i.exec(s)||[])[1]||"").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,12);
  const t=clTrim(dec((/[?&]t=([^&\s#]+)/.exec(s)||[])[1]||"")).trim();return {a,c,t};}
// quem JÁ é amigo não passa pelo gtSync (ele só encaixa amigo sem turma): entra direto na turma do link
function clTurma(inv){try{if(!inv||!inv.t||typeof gtSt!=="function")return "";const n=frSt().l.find(x=>gtN(x)===gtN(inv.a));if(!n)return "";
  const g=gtSt();let t=gtByName(inv.t);if(!t){if(g.l.length>=GT_MAX)return "cheio";t={id:"t"+Date.now().toString(36),n:gtClean(inv.t),e:"⭐",c:"",m:[]};g.l.push(t);}
  if(!t.m.some(x=>gtN(x)===gtN(n)))t.m.push(n);try{localStorage.removeItem("asc-amigo-t");}catch(e){}save();return t.n;}catch(e){return "";}}
function clLink(a,c,t){return (typeof CD_URL==="string"?CD_URL:location.origin+location.pathname)+"?amigo="+encodeURIComponent(a)+(c?"&c="+c:"")+(t?"&t="+encodeURIComponent(t):"");}
function clApply(inv){if(!inv)return false;try{localStorage.setItem("asc-amigo",inv.a);localStorage.setItem("asc-amigo-c",inv.c||"");
  if(inv.t&&typeof gtClean==="function"){const t=gtClean(inv.t);if(t)localStorage.setItem("asc-amigo-t",JSON.stringify({a:inv.a,t}));}}catch(e){return false;}return true;}
// 1) aviso no link aberto fora do app instalado (o card.js já tirou os parâmetros da barra; a URL original fica no navigation entry)
(function(){try{if(clStandalone())return;const nav=(performance.getEntriesByType&&performance.getEntriesByType("navigation")[0])||{};
  const inv=clParse(nav.name||"");if(!inv)return;const box=clEl("div","clbar");box.id="clBar";box.setAttribute("role","region");box.setAttribute("aria-label","Convite de "+inv.a);
  box.append(clEl("b",null,"🤝 Convite de "+inv.a+(inv.t?" · turma "+inv.t:"")));
  box.append(clEl("span","sm","Já tem o Ascension instalado? Copie o convite, abra o app e cole em Amigos → Recebeu um convite?"));
  const row=clEl("div","row");const cp=clEl("button","go","Copiar convite");cp.type="button";
  cp.addEventListener("click",async()=>{const u=clLink(inv.a,inv.c,inv.t);let ok=false;try{await navigator.clipboard.writeText(u);ok=true;}catch(e){}
    if(!ok){try{const i=document.createElement("textarea");i.value=u;document.body.append(i);i.select();ok=document.execCommand("copy");i.remove();}catch(e){}}
    cp.textContent=ok?"Copiado ✓":"Copie o link da conversa";toast(ok?"Convite copiado. Abra o app e cole em Amigos.":"Não deu para copiar. Copie o link na conversa e cole no app.");});
  const x=clEl("button","link","Não tenho o app");x.type="button";x.addEventListener("click",()=>box.remove());row.append(cp,x);box.append(row);
  document.body.append(box);}catch(e){}})();
// 2) "Recebeu um convite?" na aba Amigos (fim do painel da Turma). O painel é redesenhado a cada sincronização:
//    a caixa volta no mesmo estado (aberta, texto digitado, mensagem) e nada some enquanto a pessoa digita.
let clOpen=false,clVal="",clMsg="";
function clUI(){const p=$("tmPanel");if(!p||p.hidden)return;if(typeof tmKid==="function"&&tmKid())return;
  let d=p.querySelector(".clpaste");if(d&&d.parentNode===p&&p.lastElementChild===d)return;if(d)d.remove();
  d=clEl("details","clpaste");d.open=clOpen;d.addEventListener("toggle",()=>{clOpen=d.open;});const sm=clEl("summary",null,"🔗 Recebeu um convite? Cole aqui");d.append(sm);
  d.append(clEl("div","sm muted","Cole o link que te mandaram (pode ser a mensagem inteira). Você vira amigo e entra na turma, sem perder nada do seu jogo."));
  const row=clEl("div","row");const i=clEl("input");i.type="text";i.id="clIn";i.placeholder="Cole o link do convite";i.setAttribute("aria-label","Link do convite");i.autocomplete="off";i.value=clVal;
  i.addEventListener("input",()=>{clVal=i.value;});
  const b=clEl("button","go","Entrar");b.type="button";const msg=clEl("div","sm clmsg",clMsg);msg.setAttribute("role","status");
  const say=t=>{clMsg=t;msg.textContent=t;};
  b.addEventListener("click",()=>{const inv=clParse(i.value);if(!inv){say("Não achei um convite nesse texto. Cole o link inteiro que começa com https://");return;}
    const me=typeof rankName==="function"?rankName():"";if(me&&typeof tmN==="function"&&tmN(me)===tmN(inv.a)){say("Esse convite é seu. Mande para um amigo.");return;}
    clApply(inv);i.value="";clVal="";
    if(typeof tmOn==="function"&&tmOn()&&me){const ja=clTurma(inv);
      if(ja==="cheio")say(inv.a+" já é seu amigo. Você já está no limite de "+GT_MAX+" turmas, então ele ficou onde estava.");
      else if(ja){say("Pronto: "+inv.a+" já era seu amigo e agora está na turma "+ja+".");try{tmUI();}catch(e){}}
      else{say("Pronto: convite de "+inv.a+" aceito"+(inv.t?" (turma "+inv.t+")":"")+".");try{cdInvDo();}catch(e){}}}
    else{say("Convite guardado. Entre no ranking com um apelido e você vira amigo de "+inv.a+" na hora.");try{renderRankUI();}catch(e){}}});
  i.addEventListener("keydown",e=>{if(e.key==="Enter")b.click();});row.append(i,b);d.append(row,msg);p.append(d);}
if(typeof tmUI==="function"){const _tu=tmUI;tmUI=function(){if(document.activeElement&&document.activeElement.id==="clIn")return;_tu.apply(this,arguments);try{clUI();}catch(e){}};}
setTimeout(()=>{try{clUI();}catch(e){}},0);
