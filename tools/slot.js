// ---- ordem pela hora do dia (spec EVA 27/11, issue #22): manhã/tarde/noite pela rotina do jogador ----
// quest.slot = manha|tarde|noite|livre (campo novo, opcional). Sem slot: deduz pelo ifThen/título, sem regravar a config.
const SLOTS=["manha","tarde","noite"];
function slotHm(t,d){const m=/^(\d{1,2}):(\d{2})/.exec(t||"");return m?(+m[1])*60+(+m[2]):d;}
function slotRoutine(){const P=(typeof cfg!=="undefined"&&cfg&&cfg.profile)||{};return {wake:slotHm(P.wake,420),sleep:slotHm(P.sleep,1380)};}
function slotOfMin(m,r){r=r||slotRoutine();
  if(m>=r.wake&&m<720)return "manha";if(m>=720&&m<1080)return "tarde";if(m>=1080)return "noite";
  // madrugada: antes do horário de dormir (quem dorme depois da meia-noite) ainda é noite; senão já conta como manhã
  return m<Math.max(240,r.sleep<r.wake?r.sleep:0)?"noite":"manha";}
function slotNow(d){d=d||new Date();return slotOfMin(d.getHours()*60+d.getMinutes());}
function slotGuessText(t){t=String(t||"").toLowerCase();if(!t)return "";
  if(/antes do almo/.test(t))return "manha";
  if(/jantar|dormir|deitar|noite|carregar à noite|carregador fora da cama|na cama/.test(t))return "noite";
  if(/almo[çc]|tarde|sol baixar/.test(t))return "tarde";
  if(/acord|alarme|caf[ée]|(^|[^a])manh[ãa]|levant/.test(t))return "manha";
  const h=/(?:às|\(|\b)(\d{1,2})h(\d{2})?\b/.exec(t);if(h){const m=(+h[1])*60+(+(h[2]||0));return m<720?(m<240?"noite":"manha"):m<1080?"tarde":"noite";}
  return "";}
function qSlot(q){if(!q)return "livre";if(SLOTS.includes(q.slot)||q.slot==="livre")return q.slot;return slotGuessText(q.ifThen)||slotGuessText(q.title)||"livre";}
// 0 = período atual, 1 = livre, 2-3 = próximos períodos, 9 = período que já passou (vai para o fim, sem castigo)
function slotRank(q,cur){cur=cur||slotNow();const s=qSlot(q);if(s==="livre")return 1;const i=SLOTS.indexOf(cur),j=SLOTS.indexOf(s);
  if(j===i)return 0;if(j>i)return 1+(j-i);return 9;}
function slotMainRank(q){return q.main?0:q.once?1:2;}
function slotSort(L,cur){cur=cur||slotNow();return L.map((q,i)=>[q,i]).sort((a,b)=>(slotRank(a[0],cur)*10+slotMainRank(a[0]))-(slotRank(b[0],cur)*10+slotMainRank(b[0]))||a[1]-b[1]).map(x=>x[0]);}
// 1ª hora depois de acordar: o Sistema não abre com estudo ou trabalho pesado
function slotHeavy(q){return !!q&&(/^(s_rev|s_bloco|s_foco|s_carr|s_meta|q_estudo)$/.test(q.id)||((q.stat==="mente"||q.stat==="vendas")&&(q.xp||0)>=30));}
function slotWakeHour(d){d=d||new Date();const r=slotRoutine(),m=d.getHours()*60+d.getMinutes();return m>=r.wake&&m<r.wake+60;}
