// ---------- Retenção do beta (só no Modo Criador do app do JV) ----------
// Lê as linhas anônimas "A|id|etapa|AAAAMMDD|…" que o painel do criador já recebe (aba funil, ou "diario" se existir).
// Não envia nada e não guarda nada: calcula na hora, no aparelho do criador. Só id aleatório + etapa + data; nenhum nome.
// D1/D3/D7 = de quem apareceu pela 1ª vez há N dias ou mais, quantos abriram o app exatamente N dias depois.
// Funil = ids distintos: perfil pronto → 1ª missão feita → fechou um dia.
const rtNorm=s=>String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim();
function rtDate(v){if(v==null||v==="")return null;const s=String(v).trim();let m;
  if((m=s.match(/^(\d{4})(\d{2})(\d{2})$/)))return new Date(+m[1],m[2]-1,+m[3]);
  if((m=s.match(/^(\d{4})-(\d{2})-(\d{2})/)))return new Date(+m[1],m[2]-1,+m[3]);
  if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)))return new Date(+m[3],m[2]-1,+m[1]);
  return null;}
const rtDiff=(a,b)=>Math.round((new Date(a.getFullYear(),a.getMonth(),a.getDate())-new Date(b.getFullYear(),b.getMonth(),b.getDate()))/864e5);
// junta eventos {id,step,d} de qualquer aba: célula "A|…" (resposta crua do formulário) ou colunas id/etapa/data
function rtEvents(j){const ev=[];if(!j||typeof j!=="object")return ev;
  for(const key of ["funil","diario","anon"]){const T=Array.isArray(j[key])?j[key].filter(r=>Array.isArray(r)):[];if(!T.length)continue;
    const h=T[0].map(rtNorm);const ci=h.findIndex(x=>/^(id|anon|id anonimo)$/.test(x)),cs=h.findIndex(x=>/etapa|step|evento/.test(x)),cd=h.findIndex(x=>/^(data|dia|date)$/.test(x));
    for(const r of T){let hit=false;
      for(const c of r){const s=String(c==null?"":c);if(/^A\|/.test(s)){const p=s.split("|");const d=rtDate(p[3]);if(p[1]&&p[2]&&d){ev.push({id:p[1],step:p[2],d});hit=true;}break;}}
      if(!hit&&ci>=0&&cd>=0&&r!==T[0]){const d=rtDate(r[cd]);if(r[ci]&&d)ev.push({id:String(r[ci]),step:cs>=0?String(r[cs]||""):"abriu",d});}}}
  return ev;}
function rtCalc(j,now){now=now||new Date();const ev=rtEvents(j);const out={n:0,ev:ev.length,ret:{},fun:null};if(!ev.length)return out;
  const first={},days={};for(const e of ev){if(!first[e.id]||e.d<first[e.id])first[e.id]=e.d;(days[e.id]=days[e.id]||new Set()).add(rtDiff(e.d,new Date(2000,0,1)));}
  const ids=Object.keys(first);out.n=ids.length;
  for(const N of [1,3,7]){let b=0,v=0;for(const id of ids){if(rtDiff(now,first[id])<N)continue;b++;if(days[id].has(rtDiff(first[id],new Date(2000,0,1))+N))v++;}out.ret[N]=b?{v,b}:null;}
  const has=re=>new Set(ev.filter(e=>re.test(e.step)).map(e=>e.id)).size;
  out.fun=[["Perfil pronto",has(/perfil/)],["1ª missão feita",has(/quest|missao/)],["Fechou um dia",has(/fechou/)]];
  return out;}
function rtRender(j){const p=$("crPanel");if(!p)return;let box=$("rtBox");
  if(!box){const h=document.createElement("h3");h.className="crh";h.textContent="📈 Retenção (anônima)";box=document.createElement("div");box.id="rtBox";box.className="sm rtbox";
    const anchor=[...p.querySelectorAll("h3.crh")].find(x=>/Usu/.test(x.textContent));if(anchor){anchor.before(h,box);}else p.append(h,box);}
  box.textContent="";const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;};
  if(!j){box.append(el("div","muted","Liga quando o painel responder."));return;}
  const o=rtCalc(j);
  if(!o.n){box.append(el("div","muted","Ainda sem linhas anônimas com id e data. Só conta quem aceitou o painel ou o beta anônimo."));return;}
  const g=el("div","rtgrid");
  for(const N of [1,3,7]){const r=o.ret[N];const t=el("div","rttile");t.append(el("b",null,r?Math.round(100*r.v/r.b)+"%":"—"),el("span",null,"D"+N+(r?" · "+r.v+"/"+r.b:" · cedo")));
    t.title=r?"Voltaram "+N+" dia(s) depois da 1ª vez":"Ninguém chegou ao dia "+N+" ainda";g.append(t);}
  box.append(g);
  const mx=Math.max(1,o.fun[0][1],...o.fun.map(f=>f[1]));const w=el("div","rtfun");let prev=null;
  for(const [l,v] of o.fun){const r=el("div","rtrow");const bar=el("i");bar.style.width=Math.max(2,Math.round(100*v/mx))+"%";
    r.append(el("span",null,l),el("b",null,String(v)+(prev?" · "+Math.round(100*v/prev)+"%":"")),bar);w.append(r);prev=v||null;}
  box.append(w,el("div","muted",o.n+" id(s) anônimo(s). Só quem deu opt-in (14+). Nenhum nome."));}
{const _cd=crData;crData=async function(){const r=await _cd.apply(this,arguments);try{rtRender(crDataC);}catch(e){}return r;};}
