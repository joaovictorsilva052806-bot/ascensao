// ---------- ⚔️ Torre do Véu: a Arena com 100 andares (spec 5 da EVA, 28/11, pedido do JV) ----------
// O combate d20, o Fôlego e o teto de XP por luta (AR_CAP) NÃO mudam. Muda a curva do inimigo (atrelada ao nível de referência
// Le(n)=1+0,3(n-1): andar 100 ≈ atributos no nível 31, meses de tarefas reais), os marcos e o fim da escalada.
// Mini-chefe a cada 5 (Elite, +20% de vida), Guardião de rank a cada 10, O Reflexo no 100. Prêmio do marco é fixo (nunca aleatório),
// 1 vez só: XP "ach:tw:<n>" (fora do teto da Arena, não conta sequência) e Ouro por orGive("tw:<n>") (respeita o teto do dia).
// Só ADICIONA prog.arena.mk = {"10":"AAAA-MM-DD",…} e prog.arena.top (dia do andar 100). Quem já tinha recorde recebe os marcos 1 vez,
// com um único aviso. Molduras tw_f_* nunca saem no baú nem na Loja (marca no 6º campo, como as da Coleção).
const TW_MAX=100;
const twLe=n=>1+0.3*(n-1);
const TW_BAND=[[10,"E","Porão das Sombras","#9fb0c8"],[30,"D","Salões do Eco","#3ddc97"],[50,"C","Escadaria do Vento","#4da3ff"],[70,"B","Galeria Escura","#c77dff"],[90,"A","Torre Dourada","#f2c14e"],[1e9,"S","Coroa do Véu","#ff3d6e"]];
function twBand(n){return TW_BAND.find(b=>n<=b[0]);}
const TW_GUARD={10:["Golem da Distração","Golem","tita","#6b4f2a","#f2c14e","Olha o celular. Viu? Já esqueceu o que ia fazer."],
 20:["Fera do Scroll Infinito","Fera","drag","#0e8f7a","#64ffda","Mais um vídeo. E mais um. E mais um."],
 30:["Quimera do Caos","Quimera","drag","#2f8f5a","#b7ffd8","Começa três coisas. Termina nenhuma."],
 40:["Vaelgor, o Adiador","Vaelgor","drag","#7b2cff","#ff4fd8","Amanhã você faz. Amanhã… sempre amanhã."],
 50:["Ossário das Desculpas","Ossário","tita","#1e6a8a","#7af3ff","Hoje não dá. Tem um motivo ótimo."],
 60:["Mórdax, Dragão do Cansaço","Mórdax","drag","#b8323f","#ff9f43","Você está cansado demais para começar."],
 70:["Umbra da Madrugada","Umbra","drag","#3b1f6b","#c4b5fd","Só mais uma tela antes de dormir."],
 80:["Grummok, o Perfeccionista","Grummok","tita","#8a6a1e","#fff2b0","Se não for perfeito, nem começa."],
 90:["Talos, o Desistente","Talos","tita","#6b5a1e","#f2c14e","Já tentou antes. Para que tentar de novo?"],
 100:["O Reflexo","Reflexo","drag","#0b0b10","#ff3d6e","Eu sou você de ontem. Você nunca me venceu."]};
const TW_MK={// andar: [xp, ouro, tipo, id, nome, raridade, cor1, cor2]
 10:[30,20,"t","tw_porao","Saiu do Porão"],20:[30,20,"t","tw_eco","Eco Quebrado"],30:[30,20,"f","tw_f_eco","Salão do Eco",1,"#3ddc97","#b7ffd8"],
 40:[30,20,"t","tw_vento","Contra o Vento"],50:[50,30,"f","tw_f_meio","Meio da Torre",2,"#00d4ff","#7af3ff"],60:[30,20,"t","tw_galeria","Andarilho da Galeria"],
 70:[30,20,"f","tw_f_galeria","Galeria Escura",2,"#7b2cff","#c4b5fd"],80:[30,20,"t","tw_dourada","Torre Dourada"],90:[30,20,"f","tw_f_ouro","Coroa Dourada da Torre",3,"#f2c14e","#fff2b0"],
 100:[100,100,"tf","tw_topo","Mais Forte que Ontem","tw_f_topo","Topo do Véu",3,"#0b0b10","#ff3d6e"]};
function twMk(n){if(TW_MK[n])return TW_MK[n];if(n%5===0&&n<TW_MAX)return [10,0,"",""];return null;}
// marcos de moldura entram na lista de molduras (fora do baú: 6º campo marcado)
function twFrames(){try{for(const n in TW_MK){const m=TW_MK[n];if(m[2]==="f"&&!BX_FR.some(f=>f[0]===m[3]))BX_FR.push([m[3],m[4],m[5],m[6],m[7],"torre"]);
  if(m[2]==="tf"&&!BX_FR.some(f=>f[0]===m[5]))BX_FR.push([m[5],m[6],m[7],m[8],m[9],"torre"]);}}catch(e){}}
twFrames();
// --- curva nova (o resto da Arena lê arFoe) ---
arFoe=function(n){const L=Math.round(twLe(n)),guard=n%10===0,mini=n%5===0&&!guard,m=guard?1.4:mini?1.2:1;
  let b=null;if(guard&&TW_GUARD[n])b=TW_GUARD[n];else{try{b=TB_LIST[(n-1)%TB_LIST.length];}catch(e){}}
  if(!b)b=["Sombra do Adiamento","Sombra","drag","#7b2cff","#ff4fd8","Depois você faz."];
  if(guard&&!TW_GUARD[n]){const bd=twBand(n);b=b.slice();b[3]=bd[3];}
  const name=n===TW_MAX?"O Reflexo":guard?"GUARDIÃO · "+b[0]:mini?"Elite · "+b[0]:"Eco de "+b[1];
  return {n,boss:n%5===0,guard,mini,b,name,hp:Math.round((14+2*(L-1)+0.4*n)*m),ac:11+arB(L)+(guard?1:0),th:arB(L)+2+(guard?1:0)+(mini?1:0),dmg:Math.floor(0.8*(L-1))+1+(guard?2:0)};};
// --- marcos ---
function twGive(n,quiet){const a=arSt();a.mk=a.mk&&typeof a.mk==="object"?a.mk:{};if(a.mk[n])return null;const m=twMk(n);if(!m)return null;a.mk[n]=todayKey();
  if(m[0])addXP({q:"ach:tw:"+n,kind:"full",xp:m[0],stat:"foco",bonus:0,t:new Date().toISOString()},"");
  let g=0;if(m[1])try{g=orGive("tw:"+n,m[1],"Torre do Véu, andar "+n);}catch(e){}
  const got=[];try{if(m[2]==="t"||m[2]==="tf"){if(bxGiveTitle(m[3],m[4],"torre"))got.push("título « "+m[4]+" »");}
    if(m[2]==="f"||m[2]==="tf"){twFrames();const id=m[2]==="f"?m[3]:m[5],nm=m[2]==="f"?m[4]:m[6];const c=bxSt();if(!c.frames.includes(id)){c.frames.push(id);got.push("moldura « "+nm+" »");}try{bxColUI();}catch(e){}}}catch(e){}
  if(n===TW_MAX)a.top=todayKey();save();
  if(!quiet&&(m[0]||g||got.length))sysPop(n===TW_MAX?"TOPO DA TORRE":"MARCO DA TORRE",n===TW_MAX?"👑 Andar 100 · Mais Forte que Ontem":"🗼 Andar "+n,
    (n===TW_MAX?"“Então é isso. Você de hoje é mais forte que eu.” ":"")+"+"+m[0]+" XP"+(g?" · +"+g+" Ouro":"")+(got.length?" · "+got.join(" · "):"")+".");
  return {xp:m[0],g};}
function twCatchUp(){const a=arSt();if(!a.best)return;const had=a.mk&&typeof a.mk==="object";a.mk=had?a.mk:{};let n=0;
  for(let k=5;k<=Math.min(a.best,TW_MAX);k+=5)if(!a.mk[k]&&twGive(k,true))n++;
  if(n&&!had){save();toast("🗼 Marcos da Torre reconhecidos: "+n+".");}}
{const _e=arEnd;arEnd=function(win){const B=arB_;const n=B&&B.foe?B.foe.n:0;const r=_e.apply(this,arguments);
  try{if(win&&n){const a=arSt();if(a.best>=n){const res=twGive(n);if(res){const m=$("arModal");const p=m&&m.querySelector(".arres p");if(p)p.textContent+=" Marco do andar "+n+": +"+res.xp+" XP"+(res.g?" e +"+res.g+" Ouro":"")+".";}}}}catch(e){}
  try{arUI();}catch(e){}return r;};}
// --- painel: Torre do Véu ---
{const _u=arUI;arUI=function(){_u.apply(this,arguments);try{const p=$("arPanel");if(!p||p.hidden)return;const a=arSt(),n=a.fl,bd=twBand(n),foe=arFoe(n);
  const h2=p.querySelector(".arhd h2"),sm=p.querySelector(".arhd .mono");if(h2)h2.textContent="⚔️ Torre do Véu";
  if(sm)sm.textContent="andar "+n+(n<=TW_MAX?" de "+TW_MAX:" · Infinito")+" · rank "+bd[1]+(a.best?" · recorde "+a.best:"");
  let bar=p.querySelector(".twbar");if(!bar){bar=arEl("div","twbar");bar.setAttribute("role","img");p.querySelector(".arhd").after(bar);}
  bar.textContent="";const mk=a.mk||{};let lit=0;for(let k=10;k<=TW_MAX;k+=10){const on=!!mk[k];if(on)lit++;const i=arEl("i",on?"on":"");i.title="Andar "+k;bar.append(i);}
  bar.setAttribute("aria-label","Guardiões vencidos: "+lit+" de 10");
  const tx=p.querySelector(".arnext .artx b");if(tx){tx.textContent=foe.name;tx.parentNode.classList.toggle("twg",!!foe.guard);tx.parentNode.classList.toggle("twm",!!foe.mini);}
  let nm=p.querySelector(".twnext");if(!nm){nm=arEl("div","sm muted twnext");const nx=p.querySelector(".arnext");if(nx)nx.after(nm);}
  if(a.top){nm.textContent="👑 Topo alcançado em "+a.top.split("-").reverse().slice(0,2).join("/")+". Os Andares do Infinito seguem.";}
  else{let k=Math.ceil(n/10)*10;if(k<n)k+=10;for(;k<=TW_MAX&&mk[k];k+=10);const m=TW_MK[k];
    nm.textContent=m?"Próximo marco: andar "+k+", "+(m[2]==="t"?"título « "+m[4]+" »":m[2]==="f"?"moldura « "+m[4]+" »":"título « "+m[4]+" » e moldura « "+m[6]+" »")+".":"";}
  // cor do rank (régua do visual.css): --rk + classe tbrk-E…tbrk-S no painel e na janela da luta
  p.style.setProperty("--rk",bd[3]);for(const r of "EDCBAS")p.classList.toggle("tbrk-"+r,r===bd[1]);
  const mo=$("arModal");if(mo){mo.style.setProperty("--rk",bd[3]);for(const r of "EDCBAS")mo.classList.toggle("tbrk-"+r,r===bd[1]);}}catch(e){}};}
setTimeout(()=>{try{twCatchUp();}catch(e){}},1500);
