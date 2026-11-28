// ---------- Resumo do beta (só no Modo Criador do app pessoal) ----------
// Só LÊ o que o painel do criador já recebe (abas usuarios, funil, feedback; e "diario", se a planilha tiver).
// Não envia nada novo e não coleta nada dos jogadores. Os números são agregados: nenhum nome aparece no resumo.
// Guarda no aparelho do criador só a contagem de ativos por dia (ascensao-painel-hist), para montar a linha de 7 dias.
const BP_HIST="ascensao-painel-hist";
const bpNorm=s=>String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim();
// aceita 20261125, 2026-11-25, 2026-11-25T10:00, 25/11/2026 e datas por extenso do Google
function bpDate(v){if(v==null||v==="")return null;if(v instanceof Date)return isNaN(v)?null:v;const s=String(v).trim();let m;
  if((m=s.match(/^(\d{4})(\d{2})(\d{2})$/)))return new Date(+m[1],m[2]-1,+m[3]);
  if((m=s.match(/^(\d{4})-(\d{2})-(\d{2})/)))return new Date(+m[1],m[2]-1,+m[3]);
  if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)))return new Date(+m[3],m[2]-1,+m[1]);
  const d=new Date(s);return isNaN(d)?null:new Date(d.getFullYear(),d.getMonth(),d.getDate());}
const bpDay=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x;};
const bpDiff=(a,b)=>Math.round((bpDay(a)-bpDay(b))/864e5);
const bpK=d=>dkey(d).replace(/-/g,"");
const bpNum=v=>{if(typeof v==="number")return isFinite(v)?v:null;const t=String(v==null?"":v).trim();return /^-?\d+([.,]\d+)?$/.test(t)?parseFloat(t.replace(",",".")):null;};
function bpCol(hdr,res){for(const re of res){const i=hdr.findIndex(h=>re.test(h));if(i>=0)return i;}return -1;}
const bpRows=t=>(t||[]).filter(r=>Array.isArray(r)&&r.some(c=>c!==""&&c!=null));
// conta tudo sem expor ninguém
function bpCalc(j,now){now=now||new Date();const out={};
  const U=bpRows(j.usuarios);if(U.length>1){const h=U[0].map(bpNorm),R=U.slice(1);
    const cN=bpCol(h,[/apelido|nick|nome/]),cE=bpCol(h,[/entrada|desde|inicio|since/]),cL=bpCol(h,[/ultim|last|acesso/]),
      cF=bpCol(h,[/feitas|concluid|done/]),cP=bpCol(h,[/pulad|skip/]),cA=bpCol(h,[/dias ativos|ativos|ativ/]);
    const seen=new Set();const us=[];for(const r of R){const k=cN>=0?bpNorm(r[cN]):JSON.stringify(r);if(seen.has(k))continue;seen.add(k);us.push(r);}
    out.n=us.length;
    if(cL>=0){const L=us.map(r=>bpDate(r[cL])).filter(Boolean);out.hoje=L.filter(d=>bpDiff(now,d)===0).length;out.sem=L.filter(d=>{const x=bpDiff(now,d);return x>=0&&x<7;}).length;}
    if(cE>=0&&cL>=0){let b1=0,v1=0,b7=0,v7=0;for(const r of us){const e=bpDate(r[cE]),l=bpDate(r[cL]);if(!e||!l)continue;
        if(bpDiff(now,e)>=1){b1++;if(bpDiff(l,e)>=1)v1++;}if(bpDiff(now,e)>=7){b7++;if(bpDiff(l,e)>=7)v7++;}}
      out.d1=b1?{v:v1,b:b1}:null;out.d7=b7?{v:v7,b:b7}:null;}
    if(cF>=0){let f=0,p=0;for(const r of us){f+=bpNum(r[cF])||0;if(cP>=0)p+=bpNum(r[cP])||0;}out.feitas=f;out.puladas=cP>=0?p:null;}
    if(cA>=0){const a=us.map(r=>bpNum(r[cA])).filter(x=>x!=null);out.mediaAtivos=a.length?a.reduce((x,y)=>x+y,0)/a.length:null;}}
  // ativos por dia: da aba "diario" (uma linha por envio diário), se existir
  const D=bpRows(j.diario);if(D.length>1){const h=D[0].map(bpNorm),cI=bpCol(h,[/^id$|uid|anon|apelido|nick/]),cD=bpCol(h,[/data|dia|date/]);
    if(cI>=0&&cD>=0){const per={};for(const r of D.slice(1)){const d=bpDate(r[cD]);if(!d)continue;const k=bpK(d);(per[k]=per[k]||new Set()).add(String(r[cI]));}
      out.dias={};for(const k in per)out.dias[k]=per[k].size;}}
  const F=bpRows(j.funil);if(F.length>1){out.funil=F.slice(1).map(r=>{const lab=r.find(c=>c!==""&&bpNum(c)==null);const nums=r.map(bpNum).filter(x=>x!=null);return lab&&nums.length?{l:String(lab).replace(/^\d+-/,""),v:nums[nums.length-1]}:null;}).filter(Boolean);}
  const B=bpRows(j.feedback);if(B.length>1){out.fb=B.length-1;const h=B[0].map(bpNorm);const cT=bpCol(h,[/nota|texto|feedback|mensagem|comentario/]);
    out.fbUlt=cT>=0?B.slice(1).map(r=>String(r[cT]||"").trim()).filter(Boolean).slice(-3).reverse():[];}
  return out;}
// guarda só a contagem de hoje, para a linha dos 7 dias quando a planilha não tem a aba "diario"
function bpHist(n,now){let h={};try{h=JSON.parse(localStorage.getItem(BP_HIST)||"{}")||{};}catch(e){}
  if(n!=null){h[bpK(now)]=n;const ks=Object.keys(h).sort();while(ks.length>30)delete h[ks.shift()];try{localStorage.setItem(BP_HIST,JSON.stringify(h));}catch(e){}}return h;}
const bpPct=o=>o?Math.round(100*o.v/o.b)+"%":"—";
function bpRender(j){const box=$("bpSum");if(!box)return;box.textContent="";
  if(!j){box.textContent="Painel ainda não ligado. Os números aparecem quando a planilha responder.";return;}
  const now=new Date(),o=bpCalc(j,now);
  const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;};
  if(!o.n&&!o.funil&&!o.fb){box.append(el("div",null,"Nenhum testador aceitou o painel ainda. Quando aceitar, os números aparecem aqui."));return;}
  const g=el("div","bpgrid");const tile=(v,l,hint)=>{const t=el("div","bptile");t.append(el("b",null,v),el("span",null,l));if(hint)t.title=hint;g.append(t);};
  tile(String(o.n||0),"testadores","Aceitaram o painel do criador");
  tile(o.hoje!=null?String(o.hoje):"—","ativos hoje");
  tile(o.sem!=null?String(o.sem):"—","ativos 7 dias");
  tile(bpPct(o.d1),"voltaram no dia 2"+(o.d1?" ("+o.d1.v+"/"+o.d1.b+")":""),"Entre quem entrou há 1 dia ou mais");
  tile(bpPct(o.d7),"ainda jogam no dia 8"+(o.d7?" ("+o.d7.v+"/"+o.d7.b+")":""),"Entre quem entrou há 7 dias ou mais");
  if(o.feitas!=null)tile(String(o.feitas),"missões feitas"+(o.puladas!=null&&o.feitas+o.puladas>0?" · "+Math.round(100*o.feitas/(o.feitas+o.puladas))+"% das principais":""));
  if(o.fb!=null)tile(String(o.fb),"feedbacks");
  box.append(g);
  // os 3 números (funil anônimo, só de quem aceitou): ativação, volta no D1/D7 e convites por jogador
  const fv=re=>{const f=(o.funil||[]).find(x=>re.test(bpNorm(x.l)));return f?f.v:null;};
  const nv=fv(/^novo/),at=fv(/^ativou/),v1=fv(/^voltou-d1/),v7=fv(/^voltou-d7/),cv=fv(/^convidou/);
  if(nv!=null||at!=null||v1!=null||cv!=null){const g3=el("div","bpgrid bp3");const t3=(v,l,hint)=>{const t=el("div","bptile");t.append(el("b",null,v),el("span",null,l));if(hint)t.title=hint;g3.append(t);};
    const pc=(a,b)=>a!=null&&b?Math.min(100,Math.round(100*a/b))+"%":"—";
    t3(pc(at,nv),"ativação"+(at!=null?" ("+at+"/"+(nv||0)+")":""),"Fez a 1ª missão de verdade, entre quem criou o perfil");
    t3(pc(v1,nv),"voltaram no D1"+(v1!=null?" ("+v1+")":""),"Abriram o app 1 dia depois de criar o perfil");
    t3(pc(v7,nv),"voltaram no D7"+(v7!=null?" ("+v7+")":""),"Abriram o app 7 dias depois de criar o perfil");
    t3(cv!=null&&nv?(cv/nv).toFixed(1).replace(".",","):"—","convites por jogador"+(cv!=null?" ("+cv+")":""),"Dias em que alguém mandou convite ou código da guilda, por jogador novo");
    box.append(el("div","bpsub","Os 3 números (anônimo, só de quem aceitou o painel)"),g3);}
  // ativos por dia (7 dias): planilha "diario" > histórico deste aparelho
  const days=o.dias||bpHist(o.hoje,now);
  const ser=[];for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);const k=bpK(d);ser.push({d,v:days[k]!=null?days[k]:null});}
  if(ser.some(s=>s.v!=null)){const mx=Math.max(1,...ser.map(s=>s.v||0));const w=el("div","bpdays");w.setAttribute("role","img");
    w.setAttribute("aria-label","Ativos por dia, últimos 7 dias: "+ser.map(s=>s.d.toLocaleDateString("pt-BR",{weekday:"short"})+" "+(s.v==null?"sem dado":s.v)).join(", "));
    for(const s of ser){const c=el("div","bpday");const bar=el("i");bar.style.height=(s.v==null?0:Math.max(4,Math.round(40*s.v/mx)))+"px";if(s.v==null)c.classList.add("bpnone");
      c.append(el("small",null,s.v==null?"·":String(s.v)),bar,el("span",null,s.d.toLocaleDateString("pt-BR",{weekday:"narrow"})));w.append(c);}
    box.append(el("div","bpsub","Ativos por dia"+(o.dias?"":" (anotado cada vez que você abre o painel)")),w);}
  const fun=(o.funil||[]).filter(f=>!/^(novo|ativou|voltou-d[17]|convidou)/.test(bpNorm(f.l))).slice(0,8);
  if(fun.length){const mx=Math.max(1,...fun.map(f=>f.v));const w=el("div","bpfun");
    for(const f of fun){const r=el("div","bpfrow");const bar=el("i");bar.style.width=Math.max(2,Math.round(100*f.v/mx))+"%";r.append(el("span",null,f.l),el("b",null,String(f.v)),bar);w.append(r);}
    box.append(el("div","bpsub","Funil do convite (anônimo)"),w);}
  if(o.fbUlt&&o.fbUlt.length){const ul=el("ul","bpfb");for(const t of o.fbUlt)ul.append(el("li",null,t.length>140?t.slice(0,140)+"…":t));box.append(el("div","bpsub","Últimos feedbacks"),ul);}}
