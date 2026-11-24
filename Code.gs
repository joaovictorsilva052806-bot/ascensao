// Ascensão Bellardi — ponte entre o app e a sua Planilha Google.
// Projeto Apps Script ligado à planilha "Ascensão Bellardi" (pelo id).
// Aba "dados": A1 = config (JSON, a Eva edita), A2 = progresso (JSON, o app grava).
// Aba "placar": uma linha por dia, para leitura fácil.
function sheet_(name){const ss=SpreadsheetApp.openById("COLE_AQUI_O_ID_DA_SUA_PLANILHA");return ss.getSheetByName(name)||ss.insertSheet(name);}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function doGet(){
  const s=sheet_("dados");
  const parse=v=>{try{return v?JSON.parse(v):null}catch(e){return null}};
  return json_({config:parse(s.getRange("A1").getValue()),progress:parse(s.getRange("A2").getValue())});
}
function doPost(e){
  const body=JSON.parse(e.postData.contents||"{}");
  const p=body.progress; if(!p||!p.log) return json_({ok:false});
  const lock=LockService.getScriptLock(); lock.waitLock(10000);
  try{
    sheet_("dados").getRange("A2").setValue(JSON.stringify(p));
    const pl=sheet_("placar"); pl.clear();
    pl.appendRow(["data","quests feitas","xp do dia","xp total","nível","atualizado em"]);
    Object.keys(p.log).sort().forEach(d=>{const es=p.log[d]||[];
      pl.appendRow([d,es.map(x=>x.q+(x.kind==="min"?" (mín)":"")).join(", "),es.reduce((a,x)=>a+(x.xp||0)+(x.bonus||0),0),p.totalXP||"",p.level||"",p.updatedAt||""]);});
  } finally { lock.releaseLock(); }
  return json_({ok:true});
}
