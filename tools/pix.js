// ---------- Cobrar com Pix (só no app do criador, aba Criador): gasto zero, sem servidor, sem intermediário ----------
// Gera o Pix "copia e cola" (BR Code do Banco Central, padrão EMV) e o QR Code no próprio aparelho, com valor e descrição.
// O dinheiro cai direto na conta do JV pelo Pix do banco dele: sem taxa de plataforma e sem guardar dinheiro de ninguém.
// A chave Pix, o nome e as cobranças ficam SÓ neste aparelho (ascensao-pix, fora do progresso): nada vai para o repositório,
// para a planilha ou para a rede. "Recebi" é marcado à mão depois de conferir no app do banco (comprovante em print não vale).
// Recibo sai sempre com a data real de emissão (núcleo, item 0b): a data do pagamento aparece como fato, nunca retroativa.
const PX_KEY="ascensao-pix";
const PX_PRESETS=[["Turma Parceiro · mensalidade",""],["Indicação Bellardi",""],["Consultoria do app",""],["Apoio ao Ascension",""]];
// ---- QR Code (byte, correção M, versões 1 a 10) escrito à mão: o app não tem dependências ----
const QR_EXP=new Array(512),QR_LOG=new Array(256);{let x=1;for(let i=0;i<255;i++){QR_EXP[i]=x;QR_LOG[x]=i;x<<=1;if(x&256)x^=0x11d;}for(let i=255;i<512;i++)QR_EXP[i]=QR_EXP[i-255];}
const qrMul=(a,b)=>a&&b?QR_EXP[QR_LOG[a]+QR_LOG[b]]:0;
// [codewords totais, ec por bloco, [[nº de blocos, dados por bloco],...]] para M
const QR_M=[null,[26,10,[[1,16]]],[44,16,[[1,28]]],[70,26,[[1,44]]],[100,18,[[2,32]]],[134,24,[[2,43]]],[172,16,[[4,27]]],[196,18,[[4,31]]],[242,22,[[2,38],[2,39]]],[292,22,[[3,36],[2,37]]],[346,26,[[4,43],[1,44]]]];
const QR_AL=[null,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];
function qrRsGen(n){let g=[1];for(let i=0;i<n;i++){const ng=new Array(g.length+1).fill(0);for(let j=0;j<g.length;j++){ng[j]^=g[j];ng[j+1]^=qrMul(g[j],QR_EXP[i]);}g=ng;}return g;}
function qrRsRem(d,g){const r=d.concat(new Array(g.length-1).fill(0));for(let i=0;i<d.length;i++){const c=r[i];if(c)for(let j=1;j<g.length;j++)r[i+j]^=qrMul(g[j],c);}return r.slice(d.length);}
function qrEncode(text){const bytes=[...new TextEncoder().encode(text)];let ver=0;
  for(let v=1;v<=10;v++){const [,ec,bl]=QR_M[v];const dc=bl.reduce((s,[n,k])=>s+n*k,0);if(4+(v<10?8:16)+8*bytes.length<=dc*8){ver=v;break;}}
  if(!ver)throw new Error("texto longo demais para o QR");
  const [,ecn,bl]=QR_M[ver];const dc=bl.reduce((s,[n,k])=>s+n*k,0);const bits=[];const put=(v,n)=>{for(let i=n-1;i>=0;i--)bits.push((v>>>i)&1);};
  put(4,4);put(bytes.length,ver<10?8:16);for(const b of bytes)put(b,8);put(0,Math.min(4,dc*8-bits.length));while(bits.length%8)bits.push(0);
  const data=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|bits[i+j];data.push(b);}for(let p=0;data.length<dc;p^=1)data.push(p?0x11:0xEC);
  const blocks=[];let o=0;const g=qrRsGen(ecn);for(const [n,k] of bl)for(let i=0;i<n;i++){const d=data.slice(o,o+k);o+=k;blocks.push([d,qrRsRem(d,g)]);}
  const cw=[];const mx=Math.max(...blocks.map(b=>b[0].length));for(let i=0;i<mx;i++)for(const b of blocks)if(i<b[0].length)cw.push(b[0][i]);for(let i=0;i<ecn;i++)for(const b of blocks)cw.push(b[1][i]);
  const N=ver*4+17;const M=[...Array(N)].map(()=>new Array(N).fill(false)),F=[...Array(N)].map(()=>new Array(N).fill(false));
  const set=(x,y,d)=>{M[y][x]=d;F[y][x]=true;};
  for(let i=0;i<N;i++){set(6,i,i%2===0);set(i,6,i%2===0);}
  for(const [cx,cy] of [[3,3],[N-4,3],[3,N-4]])for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=N||y>=N)continue;const d=Math.max(Math.abs(dx),Math.abs(dy));set(x,y,d!==2&&d!==4);}
  const al=QR_AL[ver],L=al.length;for(let i=0;i<L;i++)for(let j=0;j<L;j++){if((i===0&&j===0)||(i===0&&j===L-1)||(i===L-1&&j===0))continue;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(al[i]+dx,al[j]+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);}
  const fmt=(mask)=>{const d=(0<<3)|mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((d<<10)|r)^0x5412;const g=i=>((b>>>i)&1)===1;
    for(let i=0;i<=5;i++)set(8,i,g(i));set(8,7,g(6));set(8,8,g(7));set(7,8,g(8));for(let i=9;i<15;i++)set(14-i,8,g(i));
    for(let i=0;i<8;i++)set(N-1-i,8,g(i));for(let i=8;i<15;i++)set(8,N-15+i,g(i));set(8,N-8,true);};
  fmt(0);
  if(ver>=7){let r=ver;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=(ver<<12)|r;for(let i=0;i<18;i++){const bit=((b>>>i)&1)===1,a=N-11+i%3,c=Math.floor(i/3);set(a,c,bit);set(c,a,bit);}}
  let i=0;for(let right=N-1;right>=1;right-=2){if(right===6)right=5;for(let v=0;v<N;v++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?N-1-v:v;
    if(!F[y][x]&&i<cw.length*8){M[y][x]=((cw[i>>>3]>>>(7-(i&7)))&1)===1;i++;}}}
  const MK=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
  const apply=m=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!F[y][x]&&MK[m](x,y))M[y][x]=!M[y][x];};
  const score=()=>{let s=0,dark=0;const lines=[];for(let y=0;y<N;y++){lines.push(M[y].map(b=>b?1:0).join(""));lines.push(M.map(r=>r[y]?1:0).join(""));}
    for(const l of lines){let run=1;for(let k=1;k<=N;k++){if(k<N&&l[k]===l[k-1])run++;else{if(run>=5)s+=3+run-5;run=1;}}
      for(const pat of ["10111010000","00001011101"]){let at=l.indexOf(pat);while(at>=0){s+=40;at=l.indexOf(pat,at+1);}}}
    for(let y=0;y<N-1;y++)for(let x=0;x<N-1;x++){const c=M[y][x];if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1])s+=3;}
    for(const r of M)for(const b of r)if(b)dark++;s+=Math.floor(Math.abs(dark*100/(N*N)-50)/5)*10;return s;};
  let best=0,bs=Infinity;for(let m=0;m<8;m++){apply(m);fmt(m);const s=score();if(s<bs){bs=s;best=m;}apply(m);}
  apply(best);fmt(best);return M;}
function qrSvg(text,px){const M=qrEncode(text),N=M.length,q=4,W=N+q*2;const NS="http://www.w3.org/2000/svg";const svg=document.createElementNS(NS,"svg");
  svg.setAttribute("viewBox","0 0 "+W+" "+W);svg.setAttribute("width",px||240);svg.setAttribute("height",px||240);svg.setAttribute("shape-rendering","crispEdges");svg.setAttribute("role","img");svg.setAttribute("aria-label","QR Code do Pix");
  const bg=document.createElementNS(NS,"rect");bg.setAttribute("width",W);bg.setAttribute("height",W);bg.setAttribute("fill","#fff");svg.append(bg);
  let d="";for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(M[y][x])d+="M"+(x+q)+" "+(y+q)+"h1v1h-1z";const p=document.createElementNS(NS,"path");p.setAttribute("d",d);p.setAttribute("fill","#000");svg.append(p);return svg;}
// ---- Pix copia e cola (BR Code) ----
const pxAscii=(s,n)=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Za-z0-9 .,\-\/@+*:]/g,"").replace(/\s+/g," ").trim().slice(0,n);
const pxF=(id,v)=>id+String(v.length).padStart(2,"0")+v;
function pxCrc(s){let c=0xFFFF;for(const b of new TextEncoder().encode(s)){c^=b<<8;for(let i=0;i<8;i++)c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF;}return c.toString(16).toUpperCase().padStart(4,"0");}
// chave já normalizada pelo tipo: aleatória (uuid), e-mail, celular (+55...), CPF/CNPJ (só números)
function pxNormKey(t,v){v=String(v||"").trim();if(t==="evp")return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)?v.toLowerCase():"";
  if(t==="email")return /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(v)&&v.length<=77?v.toLowerCase():"";
  if(t==="cel"){let d=v.replace(/\D/g,"");if(d.length===10||d.length===11)d="55"+d;return /^55\d{10,11}$/.test(d)?"+"+d:"";}
  if(t==="doc"){const d=v.replace(/\D/g,"");return d.length===11||d.length===14?d:"";}return "";}
function pxPayload(k,valor,desc,txid){const key=k.v;const gui=pxF("00","br.gov.bcb.pix")+pxF("01",key);let ds=pxAscii(desc,Math.max(0,99-gui.length-4));
  const mai=gui+(ds?pxF("02",ds):"");let s="000201"+pxF("26",mai)+pxF("52","0000")+pxF("53","986");
  if(valor>0)s+=pxF("54",valor.toFixed(2));s+=pxF("58","BR")+pxF("59",pxAscii(k.n,25)||"RECEBEDOR")+pxF("60",pxAscii(k.c,15)||"BRASIL")+pxF("62",pxF("05",String(txid||"***").replace(/[^A-Za-z0-9]/g,"").slice(0,25)||"***"))+"6304";
  return s+pxCrc(s);}
// ---- dados (só neste aparelho) ----
function pxGet(){try{const o=JSON.parse(localStorage.getItem(PX_KEY)||"{}");return o&&typeof o==="object"&&!Array.isArray(o)?o:{};}catch(e){return {};}}
function pxSave(o){try{localStorage.setItem(PX_KEY,JSON.stringify(o));}catch(e){toast("Não deu para salvar neste aparelho.");}}
const pxList=o=>Array.isArray(o.list)?o.list:(o.list=[]);
function pxVal(s){s=String(s||"").replace(/[R$\s]/g,"");if(/,\d{1,2}$/.test(s))s=s.replace(/\./g,"").replace(",",".");else s=s.replace(/,/g,"");const n=Math.round(parseFloat(s)*100)/100;return isFinite(n)&&n>0&&n<=1e6?n:0;}
const pxBRL=n=>"R$ "+n.toFixed(2).replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g,".");
const pxDt=k=>{const [y,m,d]=String(k||"").split("-");return d?d+"/"+m+"/"+y:"";};
function pxEl(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function pxBtn(c,x,fn){const b=pxEl("button",c,x);b.type="button";b.addEventListener("click",fn);return b;}
function pxCopy(t,msg){const ok=()=>toast(msg||"Copiado.");try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,()=>pxCopyOld(t,ok));return;}}catch(e){}pxCopyOld(t,ok);}
function pxCopyOld(t,ok){const a=pxEl("textarea");a.value=t;a.setAttribute("readonly","");a.style.position="fixed";a.style.opacity="0";document.body.append(a);a.select();try{document.execCommand("copy");ok();}catch(e){toast("Segure o código para copiar.");}a.remove();}
function pxMsg(c,code){return "Olá, "+c.quem+"! Segue o Pix de "+pxBRL(c.valor)+" referente a "+c.oq+".\n\nPix copia e cola (no app do banco: Pix > Copia e cola):\n"+code+"\n\nAssim que cair, te mando o recibo. Obrigado!";}
const PX_MES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
function pxRecibo(o,c){const [y,m,d]=todayKey().split("-").map(Number);const k=o.k||{};
  return "RECIBO\n\nRecebi de "+c.quem+" a quantia de "+pxBRL(c.valor)+", referente a "+c.oq+".\nPagamento recebido por Pix em "+pxDt(c.pago)+".\n\n"+(k.c?pxAscii(k.c,40)+", ":"")+d+" de "+PX_MES[m-1]+" de "+y+".\n\n"+(k.n||"")+"\n(Recibo emitido em "+pxDt(todayKey())+".)";}
let pxOpen=null,pxConf=null;
function pxMonth(o,k){const m=todayKey().slice(0,7);let rec=0,pen=0;for(const c of pxList(o)){if(c.pago){if(String(c.pago).slice(0,7)===m)rec+=c.valor;}else pen+=c.valor;}return {rec,pen};}
function pxRender(){if(typeof crOn==="function"&&!crOn()){const p0=$("pxPanel");if(p0)p0.hidden=true;return;}
  let p=$("pxPanel");if(!p){const a=$("crPanel");if(!a)return;p=pxEl("section","panel pxpanel");p.id="pxPanel";p.dataset.tab="criador";p.dataset.sf="1";a.after(p);}
  p.hidden=false;p.textContent="";const o=pxGet();const hd=pxEl("div","qhead");hd.append(pxEl("h2",null,"💸 Cobrar com Pix"),pxEl("span","sm mono","sem taxa"));p.append(hd);
  if(!o.k||!o.k.v||o.edit){pxSetup(p,o);return;}
  const {rec,pen}=pxMonth(o);const paidAny=pxList(o).some(c=>c.pago);
  const sum=pxEl("div","pxsum");sum.append(pxEl("div","pxbig",pxBRL(rec)),pxEl("div","sm muted","recebido em "+PX_MES[+todayKey().slice(5,7)-1]+(pen?" · "+pxBRL(pen)+" a receber":"")));
  sum.append(pxEl("div","sm pxgoal",paidAny?"✅ Primeiro pagamento já entrou. Próxima meta: 2 contratos e R$ 2.000 até 23/12.":"🎯 Meta: 1º contrato pago até 06/12. Gere a cobrança assim que o cliente disser sim."));p.append(sum);
  // nova cobrança
  const f=pxEl("div","pxform");const iq=pxEl("input");iq.id="pxQuem";iq.placeholder="Quem paga (nome do cliente)";iq.maxLength=40;
  const iv=pxEl("input");iv.id="pxValor";iv.placeholder="Valor (ex.: 150 ou 1.200,50)";iv.inputMode="decimal";iv.maxLength=14;
  const io=pxEl("input");io.id="pxOq";io.placeholder="Referente a (ex.: Turma Parceiro · dezembro)";io.maxLength=60;
  const chips=pxEl("div","pxchips");for(const [t] of PX_PRESETS)chips.append(pxBtn("ghost pxchip",t,()=>{io.value=t;io.focus();}));
  for(const [i,l] of [[iq,"Quem paga"],[iv,"Valor"],[io,"Referente a"]]){i.setAttribute("aria-label",l);i.autocomplete="off";}
  f.append(iq,iv,io,chips,pxBtn("go","Gerar Pix",()=>{const quem=pxAscii(iq.value,40)?iq.value.trim().slice(0,40):"",valor=pxVal(iv.value),oq=io.value.trim().slice(0,60);
    if(!quem){toast("Diga quem paga.");iq.focus();return;}if(!valor){toast("Valor inválido.");iv.focus();return;}if(!oq){toast("Diga a que se refere.");io.focus();return;}
    const L=pxList(o);const id=Date.now().toString(36);L.unshift({id,quem,valor,oq,d:todayKey(),pago:null});if(L.length>200)L.length=200;pxSave(o);pxOpen=id;pxRender();
    setTimeout(()=>{const q=$("pxShow");if(q)q.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});},40);}));
  p.append(pxEl("h3","crh","Nova cobrança"),f);
  const L=pxList(o);const cur=L.find(c=>c.id===pxOpen);if(cur)p.append(pxShow(o,cur));
  if(L.length){p.append(pxEl("h3","crh","Cobranças"));const ul=pxEl("div","pxlist");
    for(const c of L.slice(0,30)){const r=pxEl("div","pxrow"+(c.pago?" pago":""));const t=pxEl("div","pxrt");t.append(pxEl("b",null,c.quem+" · "+pxBRL(c.valor)),pxEl("span","sm muted",c.oq+" · "+(c.pago?"recebido em "+pxDt(c.pago):"criada em "+pxDt(c.d))));r.append(t);
      const a=pxEl("div","row pxra");
      if(!c.pago){a.append(pxBtn("go","Recebi ✓",()=>{if(pxConf!==c.id+":pg"){pxConf=c.id+":pg";toast("Conferiu no app do banco? Toque de novo para confirmar.");return;}pxConf=null;const first=!pxList(o).some(x=>x.pago);c.pago=todayKey();pxSave(o);pxRender();
          if(first){try{sysPop("PAGAMENTO","Primeiro dinheiro na conta",pxBRL(c.valor)+" de "+c.quem+". O app começou a pagar as contas.");}catch(e){toast("Primeiro pagamento registrado!");}}else toast("Recebido: "+pxBRL(c.valor));}),
        pxBtn("ghost","Pix",()=>{pxOpen=pxOpen===c.id?null:c.id;pxRender();}));}
      else{a.append(pxBtn("ghost","Recibo",()=>{pxCopy(pxRecibo(o,c),"Recibo copiado. Cole no WhatsApp.");}),pxBtn("link","Desfazer",()=>{c.pago=null;pxSave(o);pxRender();}));}
      a.append(pxBtn("link pxdel",pxConf===c.id+":rm"?"Toque de novo para apagar":"Apagar",()=>{if(pxConf!==c.id+":rm"){pxConf=c.id+":rm";pxRender();return;}pxConf=null;o.list=pxList(o).filter(x=>x!==c);if(pxOpen===c.id)pxOpen=null;pxSave(o);pxRender();}));
      r.append(a);ul.append(r);}
    p.append(ul);}
  const ft=pxEl("div","sm muted pxnote","A chave, o nome e as cobranças ficam só neste aparelho. O dinheiro cai direto na sua conta, sem taxa. Marque \"Recebi\" só depois de ver o Pix no app do banco: print de comprovante não vale.");p.append(ft);
  p.append(pxBtn("link","Trocar chave Pix ("+pxMask(o.k)+")",()=>{o.edit=1;pxSave(o);pxRender();}));}
function pxMask(k){const v=k.v||"";if(k.t==="evp")return "aleatória …"+v.slice(-4);if(k.t==="email")return v.replace(/^(.).*(@.*)$/,"$1…$2");return "…"+v.slice(-4);}
function pxShow(o,c){const box=pxEl("div","pxshow");box.id="pxShow";let code="";try{code=pxPayload(o.k,c.valor,c.oq,"ASC"+c.id.toUpperCase());}catch(e){}
  box.append(pxEl("b",null,c.quem+" · "+pxBRL(c.valor)),pxEl("span","sm muted",c.oq));
  try{const w=pxEl("div","pxqr");w.append(qrSvg(code,232));box.append(w);}catch(e){box.append(pxEl("div","sm","Não deu para desenhar o QR. Use o copia e cola."));}
  const ta=pxEl("textarea","pxcode");ta.id="pxCode";ta.readOnly=true;ta.rows=4;ta.value=code;ta.setAttribute("aria-label","Pix copia e cola");box.append(ta);
  const row=pxEl("div","row pxacts");row.append(pxBtn("go","Copiar código",()=>pxCopy(code,"Pix copiado.")));
  const wa=pxEl("a","btnlink pxwa","Enviar no WhatsApp ↗");wa.href="https://wa.me/?text="+encodeURIComponent(pxMsg(c,code));wa.target="_blank";wa.rel="noopener noreferrer";row.append(wa);
  if(navigator.share)row.append(pxBtn("ghost","Compartilhar",()=>{navigator.share({text:pxMsg(c,code)}).catch(()=>{});}));
  box.append(row,pxEl("div","sm muted","O cliente abre o app do banco, toca em Pix > Copia e cola (ou lê o QR) e confere o seu nome antes de pagar."));return box;}
function pxSetup(p,o){const k=o.k||{};p.append(pxEl("div","sm muted","Uma vez só: a chave Pix onde o dinheiro vai cair. Fica só neste aparelho, nunca no site, no repositório ou na planilha."));
  const f=pxEl("div","pxform");const sel=pxEl("select");sel.id="pxTipo";sel.setAttribute("aria-label","Tipo de chave");
  for(const [v,t] of [["evp","Chave aleatória (recomendada)"],["email","E-mail"],["cel","Celular"],["doc","CPF ou CNPJ"]]){const op=pxEl("option",null,t);op.value=v;sel.append(op);}sel.value=k.t||"evp";
  const ik=pxEl("input");ik.id="pxChave";ik.placeholder="Cole a chave Pix";ik.autocomplete="off";ik.value=k.v||"";ik.setAttribute("aria-label","Chave Pix");
  const warn=pxEl("div","sm pxwarn");const upd=()=>{warn.textContent=sel.value==="evp"?"Boa escolha: a chave aleatória não mostra seu CPF nem seu celular para quem recebe a cobrança.":"Atenção: essa chave vai dentro do código que o cliente recebe. A aleatória protege mais (crie no app do banco em Pix > Minhas chaves).";};sel.addEventListener("change",upd);upd();
  const inn=pxEl("input");inn.id="pxNome";inn.placeholder="Seu nome (como no banco)";inn.maxLength=25;inn.value=k.n||"";inn.setAttribute("aria-label","Nome do recebedor");
  const ic=pxEl("input");ic.id="pxCidade";ic.placeholder="Cidade";ic.maxLength=15;ic.value=k.c||"";ic.setAttribute("aria-label","Cidade");
  f.append(sel,ik,warn,inn,ic,pxBtn("go","Salvar neste aparelho",()=>{const v=pxNormKey(sel.value,ik.value);if(!v){toast("Chave inválida para esse tipo.");ik.focus();return;}
    if(!pxAscii(inn.value,25)){toast("Coloque seu nome.");inn.focus();return;}if(!pxAscii(ic.value,15)){toast("Coloque a cidade.");ic.focus();return;}
    o.k={t:sel.value,v,n:inn.value.trim().slice(0,25),c:ic.value.trim().slice(0,15)};delete o.edit;pxSave(o);pxRender();toast("Chave salva só neste aparelho.");}));
  if(o.edit)f.append(pxBtn("link","Cancelar",()=>{delete o.edit;pxSave(o);pxRender();}));p.append(f);}
{const _r=crRender;crRender=function(){const r=_r.apply(this,arguments);try{pxRender();}catch(e){}return r;};}
setTimeout(()=>{try{pxRender();}catch(e){}},120);
