// mural.gs — Mural da turma (fotos de prova, 14+, só amigos confirmados).
// Encaixe: arquivo novo no projeto "Ascensão - avisos por e-mail" (gatilho do formulário). Publicar como web app:
// executar como "Eu", acesso "Qualquer pessoa". Este é o único doPost do projeto e o ÚNICO arquivo: o aviso diário (ações "pw-…") está no fim deste arquivo.
// Ajuste as 3 constantes de PLANILHA/ABA e, se preferir, troque mh_/mVinc_ pelas g_h/g_n/g_tok que já existem.
//
// Regras (o servidor confere tudo; o app só mostra):
//  - token do jogador obrigatório (n:<nick> -> uid, t:<uid> = 16 bytes do SHA-256 do tk em hex). Sem vínculo, nada.
//  - faixa de idade + consentimento em c:<uid> = {"b":"teen|adult","p":1,"t":ms}. ≤13 nunca registra. 14-17 só com p=1.
//  - amizade confirmada = linhas F/G com coluna C="tk" (pedido F de um e aceite G do outro).
//  - post: JPEG por bytes FFD8FF, ≤ 80 KB, legenda só da lista, 3 por dia, corpo ≤ 100 KB, limite de chamadas por nick.
//  - list: só posts do próprio e de amigos confirmados, últimos 7 dias, no máximo 20, imagem em base64 (nunca URL).
//  - del: só o autor (apaga arquivo e linha). react: 🔥 💪 👏, só amigo ou o próprio, liga/desliga.
//  - report: esconde para quem denunciou; 1 denúncia esconde post de 14-17 para todos, 2 escondem post de adulto. E-mail ao JV a cada uma.
//  - gatilho diário muralLimpa: apaga foto e linha com mais de 7 dias.
//  - fotos ficam numa planilha própria e privada criada pelo script (sem acesso ao Drive).

var MU_SHEET_ID = "";          // vazio = usa SHEET_ID do projeto (planilha 1EY8…, a das respostas)
var MU_RANK_TAB = "Respostas ao formulário 1"; // coluna B = linha crua "F|a|b||d", coluna C = "tk" quando o token foi conferido (validar)
var MU_TAB = "mural";          // aba privada do índice (criada sozinha)
var MU_DAYS = 7, MU_MAX_LIST = 20, MU_MAX_DAY = 3, MU_MAX_IMG = 80000, MU_MAX_BODY = 100000;
var MU_REACT = ["🔥", "💪", "👏"];
var MU_CAPS = ["", "Feito ✅", "Mínimo cumprido", "Dia difícil, fiz mesmo assim", "Novo recorde", "Primeira vez!"];
var MU_MIN_BAND = "teen";      // "teen" = 14+ (decisão do JV em 25/11). Troque para "adult" para só 18+.

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return mOut_({ ok: false, err: "vazio" });
    if (e.postData.contents.length > MU_MAX_BODY) return mOut_({ ok: false, err: "grande" });
    var b = JSON.parse(e.postData.contents);
    if (/^pw-/.test(String(b.a || "")) && typeof pwRoute_ === "function") return mOut_(pwRoute_(b)); // aviso diário (seção PUSH no fim)
    var nick = String(b.n || "").trim().toLowerCase().slice(0, 16);
    if (!nick || !mRate_("mg", 600)) return mOut_({ ok: false, err: "limite" });
    var uid = mVinc_(nick, String(b.tk || ""));
    if (!uid) return mOut_({ ok: false, err: "token" });
    if (!mRate_("mr:" + uid, 30)) return mOut_({ ok: false, err: "limite" }); // por jogador só depois do token: ninguém trava o limite de outro
    var a = String(b.a || "");
    if (a === "reg") return mOut_(mReg_(uid, b));
    var age = mAge_(uid);
    if (!age) return mOut_({ ok: false, err: "idade" });
    if (a === "list") return mOut_(mList_(nick, uid, age));
    if (a === "post") return mOut_(mPost_(nick, uid, age, b));
    if (a === "del") return mOut_(mDel_(nick, String(b.id || "")));
    if (a === "react") return mOut_(mReact_(nick, uid, String(b.id || ""), String(b.e || "")));
    if (a === "report") return mOut_(mReport_(nick, uid, String(b.id || "")));
    if (a === "hall") return mOut_(mHall_(nick, uid, age, b));     // Hall da Fama do Desafio Forja 30 (tools/ouro.js)
    if (a === "hlist") return mOut_(mHList_(nick));
    return mOut_({ ok: false, err: "acao" });
  } catch (err) {
    return mOut_({ ok: false, err: "erro" });
  }
}
function mOut_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function mProps_() { return PropertiesService.getScriptProperties(); }
// --- token: mesmo formato do vínculo do formulário ---
function mh_(tk) { var d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, tk, Utilities.Charset.UTF_8); var s = "";
  for (var i = 0; i < 16; i++) { var v = (d[i] + 256) % 256; s += (v < 16 ? "0" : "") + v.toString(16); } return s; }
function mVinc_(nick, tk) {
  if (!/^tk[\w-]{22}$/.test(tk)) return "";
  var p = mProps_(); var n = p.getProperty("n:" + nick); if (!n) return "";
  var uid = ""; try { uid = JSON.parse(n).u; } catch (e) { return ""; }
  var t = uid && p.getProperty("t:" + uid); if (!t || t !== mh_(tk)) return "";
  return uid;
}
// --- limite de chamadas por apelido (30 a cada 10 min) ---
function mRate_(k, lim) { var c = CacheService.getScriptCache(); var n = +(c.get(k) || 0); if (n >= lim) return false; c.put(k, String(n + 1), 600); return true; }
// --- faixa de idade e consentimento ---
function mReg_(uid, b) {
  var band = b.band === "teen" ? "teen" : b.band === "adult" ? "adult" : "";
  if (!band) return { ok: false, err: "idade" };
  if (MU_MIN_BAND === "adult" && band !== "adult") return { ok: false, err: "idade" };
  if (band === "teen" && +b.par !== 1) return { ok: false, err: "responsavel" };
  var p = mProps_(); var old = null; try { old = JSON.parse(p.getProperty("c:" + uid) || "null"); } catch (e) {}
  if (old && old.b === "teen" && band === "adult" && Date.now() - old.t < 30 * 864e5) band = "teen"; // não "envelhece" na hora
  p.setProperty("c:" + uid, JSON.stringify({ b: band, p: band === "teen" ? 1 : 0, t: old ? old.t : Date.now() }));
  return { ok: true };
}
function mAge_(uid) { try { var c = JSON.parse(mProps_().getProperty("c:" + uid) || "null"); if (!c) return "";
  if (c.b === "teen" && c.p === 1 && MU_MIN_BAND === "teen") return "teen"; if (c.b === "adult") return "adult"; } catch (e) {} return ""; }
// --- amizade confirmada (F de um + G do outro, ambos com C="tk") ---
function mSS_() { var id = MU_SHEET_ID || (typeof SHEET_ID !== "undefined" ? SHEET_ID : ""); return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActive(); }
function mFriends_(nick) {
  var ss = mSS_();
  var sh = ss.getSheetByName(MU_RANK_TAB); if (!sh) return {};
  var v = sh.getDataRange().getValues(); var F = {}, G = {}, out = {};
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][2]) !== "tk") continue;                 // coluna C: linha com token conferido
    var raw = String(v[i][1] || "");                       // coluna B: a linha "K|a|b|s|d" — CONFERIR
    var p = raw.split("|"); var k = p[0], a = String(p[1] || "").trim().toLowerCase(), bb = String(p[2] || "").trim().toLowerCase();
    if (!a || !bb) continue;
    if (k === "F") F[a + ">" + bb] = 1; else if (k === "G") G[a + ">" + bb] = 1;   // G|quem aceitou|de quem
  }
  for (var key in G) { var x = key.split(">"); var acc = x[0], req = x[1];
    if (!F[req + ">" + acc]) continue;
    if (acc === nick) out[req] = 1; else if (req === nick) out[acc] = 1; }
  return out;
}
// --- índice privado ---
var MU_COLS = ["id", "autor", "nome", "uid", "data", "tarefa", "legenda", "fileId", "reacoes", "removido", "denuncias", "faixa"];
// fotos e índice ficam numa planilha PRÓPRIA e privada (criada pelo script, nunca publicada nem compartilhada).
// Assim o mural não precisa de acesso ao Google Drive e não mora na planilha que tem a aba pública do ranking.
function mStore_() { var p = mProps_(); var id = p.getProperty("mu:ss"); var ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) {} }
  if (!ss) { ss = SpreadsheetApp.create("Ascension - mural (privado, nao compartilhar)"); p.setProperty("mu:ss", ss.getId()); }
  return ss; }
function mTab_() { var ss = mStore_();
  var sh = ss.getSheetByName(MU_TAB); if (!sh) { sh = ss.insertSheet(MU_TAB); sh.appendRow(MU_COLS); } return sh; }
function mFotos_() { var ss = mStore_(); return ss.getSheetByName("fotos") || ss.insertSheet("fotos"); }
// a foto vai em pedaços de 45 mil caracteres (limite de 50 mil por célula); o "b" na frente impede o Sheets de ler "=", "+" ou "-" como fórmula
function mFotoPut_(id, b64) { var row = [id]; for (var i = 0; i < b64.length; i += 45000) row.push("b" + b64.slice(i, i + 45000)); mFotos_().appendRow(row); }
function mFotoRow_(id) { var c = mFotos_().createTextFinder(id).matchEntireCell(true).findNext(); return c && c.getColumn() === 1 ? c.getRow() : 0; }
function mFotoGet_(id) { var sh = mFotos_(); var r = mFotoRow_(id); if (!r) return ""; var n = sh.getLastColumn(); if (n < 2) return "";
  return sh.getRange(r, 2, 1, n - 1).getValues()[0].map(function (x) { return String(x || "").slice(1); }).join(""); }
function mFotoDel_(id) { var r = mFotoRow_(id); if (r) mFotos_().deleteRow(r); }
function mRows_() { var sh = mTab_(); var v = sh.getDataRange().getValues(); var out = [];
  for (var i = 1; i < v.length; i++) { var r = {}; for (var j = 0; j < MU_COLS.length; j++) r[MU_COLS[j]] = v[i][j]; r._row = i + 1; out.push(r); } return out; }
function mJ_(s, d) { try { return JSON.parse(s || "") || d; } catch (e) { return d; } }
function mFresh_(d) { return Date.now() - Number(d) < MU_DAYS * 864e5; } // data guardada em ms (número): o Sheets não converte
function mClean_(s, n) { return String(s || "").replace(/[<>|\n\r]/g, " ").trim().slice(0, n); }
// --- ações ---
function mLock_(fn) { var l = LockService.getScriptLock(); l.waitLock(10000); try { return fn(); } finally { l.releaseLock(); } }
function mPost_(nick, uid, age, b) {
  var img = String(b.img || ""); var m = /^data:image\/jpeg;base64,([A-Za-z0-9+\/=]+)$/.exec(img); if (!m) return { ok: false, err: "tipo" };
  var bytes = Utilities.base64Decode(m[1]); if (bytes.length > MU_MAX_IMG) return { ok: false, err: "grande" };
  if ((bytes[0] & 255) !== 0xFF || (bytes[1] & 255) !== 0xD8 || (bytes[2] & 255) !== 0xFF) return { ok: false, err: "tipo" };
  var cap = String(b.cap || ""); if (MU_CAPS.indexOf(cap) < 0) cap = "";
  if (!Object.keys(mFriends_(nick)).length) return { ok: false, err: "amigo" };
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var today = Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd"); var n = 0;
    mRows_().forEach(function (r) { if (r.autor === nick && Utilities.formatDate(new Date(Number(r.data)), "America/Sao_Paulo", "yyyy-MM-dd") === today) n++; });
    if (n >= MU_MAX_DAY) return { ok: false, err: "limite" };
    var id = "m" + Utilities.getUuid().replace(/-/g, "").slice(0, 15); // "m" na frente: o Sheets nunca lê o id como número (ex.: 12e45…)
    mFotoPut_(id, m[1]);
    // tarefa: título é texto livre do jogador; só guarda para adulto (nunca vira canal de texto com 14-17)
    mTab_().appendRow([id, nick, mClean_(b.n, 16), uid, Date.now(), age === "adult" ? mClean_(b.q, 40) : "", cap, id, "{}", "", "[]", age]);
  } finally { lock.releaseLock(); }
  return { ok: true };
}
function mList_(nick, uid, age) {
  var fr = mFriends_(nick); var out = [];
  var rows = mRows_().filter(function (r) { return !r.removido && mFresh_(r.data) && (r.autor === nick || fr[r.autor]) && mJ_(r.denuncias, []).indexOf(uid) < 0; })
    .sort(function (a, b) { return Number(b.data) - Number(a.data); }).slice(0, MU_MAX_LIST);
  rows.forEach(function (r) { var img = "";
    try { var b64 = mFotoGet_(r.id); if (!b64) return; img = "data:image/jpeg;base64," + b64; } catch (e) { return; }
    var rx = mJ_(r.reacoes, {}); var cnt = {}, my = {};
    MU_REACT.forEach(function (e) { var l = rx[e] || []; cnt[e] = l.length; my[e] = l.indexOf(uid) >= 0; });
    out.push({ id: r.id, a: r.nome, d: new Date(Number(r.data)).toISOString(), q: age === "adult" && r.faixa === "adult" ? r.tarefa : "", cap: r.legenda, img: img, r: cnt, my: my }); });
  return { ok: true, posts: out };
}
function mFind_(id) { var all = mRows_(); for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return null; }
function mDel_(nick, id) { return mLock_(function () { var r = mFind_(id); if (!r || r.autor !== nick) return { ok: false, err: "dono" };
  mFotoDel_(r.id); mTab_().deleteRow(r._row); return { ok: true }; }); }
function mReact_(nick, uid, id, e) { if (MU_REACT.indexOf(e) < 0) return { ok: false, err: "reacao" };
  var fr = mFriends_(nick); return mLock_(function () { var r = mFind_(id); if (!r || r.removido || (r.autor !== nick && !fr[r.autor])) return { ok: false, err: "amigo" };
  var rx = mJ_(r.reacoes, {}); var l = rx[e] || []; var k = l.indexOf(uid); if (k >= 0) l.splice(k, 1); else l.push(uid); rx[e] = l;
  mTab_().getRange(r._row, 9).setValue(JSON.stringify(rx)); return { ok: true }; }); }
function mReport_(nick, uid, id) { var fr = mFriends_(nick); var r, d, hide; var bad = mLock_(function () { r = mFind_(id); if (!r || (r.autor !== nick && !fr[r.autor])) return true;
  d = mJ_(r.denuncias, []); if (d.indexOf(uid) < 0) d.push(uid);
  hide = (r.faixa === "teen" && d.length >= 1) || d.length >= 2;
  var sh = mTab_(); sh.getRange(r._row, 11).setValue(JSON.stringify(d)); if (hide) sh.getRange(r._row, 10).setValue("denuncia"); return false; });
  if (bad) return { ok: false, err: "amigo" };
  try { var ok = typeof g_emailOk === "function" ? g_emailOk() : true;
    if (ok) MailApp.sendEmail(Session.getEffectiveUser().getEmail(), "Ascension: denúncia no mural (" + d.length + ")",
      "Post " + r.id + " de " + r.nome + " (" + r.faixa + ") denunciado por " + nick + ". " + (hide ? "Escondido para todos." : "Escondido para quem denunciou.") +
      "\nA foto fica na planilha privada do mural (aba fotos, id " + r.id + ") e some sozinha em 7 dias."); } catch (e) {}
  return { ok: true }; }
// --- gatilho diário: apaga de verdade o que passou de 7 dias ---
function muralLimpa() { try { hallLimpa(); } catch (e) {} mLock_(function () { var sh = mTab_(); var all = mRows_(); for (var i = all.length - 1; i >= 0; i--) { var r = all[i];
  if (!mFresh_(r.data)) { try { mFotoDel_(r.id); } catch (e) {} sh.deleteRow(r._row); } } }); }
function muralInstalaGatilho() { ScriptApp.newTrigger("muralLimpa").timeBased().everyDays(1).atHour(4).create(); }
// --- Hall da Fama (Desafio Forja 30): mesmas regras do Mural ---
// Só quem passou pelo token e pelo registro de faixa (14-17 com responsável) chega aqui. Nada de texto livre:
// guarda apelido, nome de exibição, data, o desafio ("f30"), o início (AAAA-MM-DD) e quantos dias. Lista só o próprio e amigos confirmados.
// 1 entrada por jogador por desafio; some sozinha em 365 dias (hallLimpa no mesmo gatilho do mural).
var HL_TAB = "hall", HL_DAYS = 365, HL_COLS = ["id", "autor", "nome", "uid", "data", "desafio", "inicio", "dias", "faixa"];
function hTab_() { var ss = mStore_(); var sh = ss.getSheetByName(HL_TAB); if (!sh) { sh = ss.insertSheet(HL_TAB); sh.appendRow(HL_COLS); } return sh; }
function hRows_() { var v = hTab_().getDataRange().getValues(); var out = [];
  for (var i = 1; i < v.length; i++) { var r = {}; for (var j = 0; j < HL_COLS.length; j++) r[HL_COLS[j]] = v[i][j]; r._row = i + 1; out.push(r); } return out; }
function mHall_(nick, uid, age, b) {
  if (String(b.c || "") !== "f30") return { ok: false, err: "desafio" };
  var ini = String(b.s || ""); if (!/^\d{4}-\d{2}-\d{2}$/.test(ini)) return { ok: false, err: "data" };
  var dias = Math.floor(+b.k || 0); if (dias < 20 || dias > 30) return { ok: false, err: "dias" };
  if (!Object.keys(mFriends_(nick)).length) return { ok: false, err: "amigo" };
  return mLock_(function () {
    var dup = hRows_().some(function (r) { return r.uid === uid && String(r.inicio) === "i" + ini; });
    if (!dup) hTab_().appendRow(["h" + Utilities.getUuid().replace(/-/g, "").slice(0, 15), nick, mClean_(b.n, 16), uid, Date.now(), "f30", "i" + ini, dias, age]);
    return { ok: true };
  });
}
function mHList_(nick) {
  var fr = mFriends_(nick);
  var rows = hRows_().filter(function (r) { return Date.now() - Number(r.data) < HL_DAYS * 864e5 && (r.autor === nick || fr[r.autor]); })
    .sort(function (a, b) { return Number(b.data) - Number(a.data); }).slice(0, 30);
  return { ok: true, hall: rows.map(function (r) { return { a: r.nome, d: new Date(Number(r.data)).toISOString(), c: r.desafio, n: Number(r.dias) || 0 }; }) };
}
function hallLimpa() { mLock_(function () { var sh = hTab_(); var all = hRows_(); for (var i = all.length - 1; i >= 0; i--) if (Date.now() - Number(all[i].data) >= HL_DAYS * 864e5) sh.deleteRow(all[i]._row); }); }

// ===== PUSH — Aviso diário com o app fechado (Web Push), sem servidor novo e sem conta nova.
// Mora no mesmo arquivo do mural (antes era server/push.gs; se existir um push.gs antigo no projeto, apague). O doPost acima
// chama pwRoute_() quando a ação começa com "pw". Depois de colar, "Implantar > Gerenciar implantações > editar > Nova versão"
// (mesmo endereço /exec, nada muda no app).
//
// Script Properties (Configurações do projeto > Propriedades do script):
//   LEMB_KEY = o mesmo segredo de GitHub Secrets > LEMB_KEY (o robô do GitHub Actions usa para pedir a lista da hora).
//   Sem LEMB_KEY, as ações do robô respondem "chave" e nada sai.
//
// O que fica guardado (aba "push" da planilha PRIVADA do mural, nunca a pública do ranking):
//   id | uid | endpoint | p256dh | auth | hora (HH:MM) | visto (AAAA-MM-DD) | enviado (AAAA-MM-DD) | criado (ms)
//   Só isso: o endereço de aviso do aparelho e o horário. Nada de tarefa, nome ou conteúdo.
//
// Regras (o servidor confere tudo):
//  - token do jogador obrigatório (mVinc_ do mural.gs). Faixa de idade já registrada (mAge_): ≤13 nunca; 14-17 só com responsável (p=1).
//  - endpoint só de serviço de push conhecido (Google, Mozilla, Apple, Microsoft): o robô nunca chama outro endereço.
//  - no máximo 3 aparelhos por jogador. Trocar a hora = mesma linha.
//  - 1 aviso por dia, só se o jogador ainda não abriu o app no dia ("visto" ≠ hoje). Sem abrir há 30 dias: a linha é apagada (para de chamar).
//  - "Parar avisos" (pw-del) apaga a linha na hora.

var PW_TAB = "push";
var PW_COLS = ["id", "uid", "endpoint", "p256dh", "auth", "hora", "visto", "enviado", "criado"];
var PW_MAX_DEV = 3, PW_IDLE_DAYS = 30, PW_TZ = "America/Sao_Paulo";
var PW_HOSTS = /^https:\/\/(fcm\.googleapis\.com|android\.googleapis\.com|updates\.push\.services\.mozilla\.com|[\w.-]*push\.apple\.com|[\w.-]*\.notify\.windows\.com)\//;

function pwRoute_(b) {
  var a = String(b.a || "");
  if (a === "pw-ping") return { ok: true, pw: 1 };            // o app pergunta se o aviso já está ligado aqui (sem nome nem token)
  if (a === "pw-due" || a === "pw-gone") {                 // robô do GitHub Actions
    if (!pwKeyOk_(String(b.k || ""))) return { ok: false, err: "chave" };
    return a === "pw-due" ? pwDue_() : pwGone_(b.ids);
  }
  var nick = String(b.n || "").trim().toLowerCase().slice(0, 16);
  if (!nick || !mRate_("mg", 600)) return { ok: false, err: "limite" };
  var uid = mVinc_(nick, String(b.tk || ""));
  if (!uid) return { ok: false, err: "token" };
  if (!mRate_("pw:" + uid, 20)) return { ok: false, err: "limite" };
  if (a === "pw-del") return pwDel_(uid, String(b.ep || ""));
  if (a === "pw-seen") return pwSeen_(uid);
  if (a === "pw-sub") { if (!mAge_(uid)) return { ok: false, err: "idade" }; return pwSub_(uid, b); }
  return { ok: false, err: "acao" };
}
function pwKeyOk_(k) {
  var want = mProps_().getProperty("LEMB_KEY") || "";
  if (want.length < 24 || k.length !== want.length) return false;
  var d = 0; for (var i = 0; i < k.length; i++) d |= k.charCodeAt(i) ^ want.charCodeAt(i); return d === 0;
}
function pwToday_() { return Utilities.formatDate(new Date(), PW_TZ, "yyyy-MM-dd"); }
function pwTab_() { var ss = mStore_(); var sh = ss.getSheetByName(PW_TAB); if (!sh) { sh = ss.insertSheet(PW_TAB); sh.appendRow(PW_COLS); }
  sh.getRange("A:I").setNumberFormat("@"); return sh; }       // tudo como texto: o Sheets não converte hora/data
function pwRows_() { var v = pwTab_().getDataRange().getValues(); var out = [];
  for (var i = 1; i < v.length; i++) { var r = {}; for (var j = 0; j < PW_COLS.length; j++) r[PW_COLS[j]] = String(v[i][j] == null ? "" : v[i][j]); r._row = i + 1; out.push(r); }
  return out; }
function pwSub_(uid, b) {
  var ep = String(b.ep || ""), p = String(b.p || ""), au = String(b.au || ""), h = String(b.h || "");
  if (ep.length > 800 || !PW_HOSTS.test(ep)) return { ok: false, err: "endpoint" };
  if (!/^[A-Za-z0-9_-]{80,100}$/.test(p) || !/^[A-Za-z0-9_-]{16,32}$/.test(au)) return { ok: false, err: "chave" };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(h)) return { ok: false, err: "hora" };
  return mLock_(function () {
    var sh = pwTab_(); var rows = pwRows_(); var mine = rows.filter(function (r) { return r.uid === uid; });
    var same = mine.filter(function (r) { return r.endpoint === ep; })[0];
    if (same) { sh.getRange(same._row, 4, 1, 4).setValues([[p, au, h, pwToday_()]]); return { ok: true }; }
    if (mine.length >= PW_MAX_DEV) { mine.sort(function (x, y) { return Number(x.criado) - Number(y.criado); }); sh.deleteRow(mine[0]._row); }
    sh.appendRow(["p" + Utilities.getUuid().replace(/-/g, "").slice(0, 15), uid, ep, p, au, h, pwToday_(), "", String(Date.now())]);
    return { ok: true };
  });
}
function pwSeen_(uid) { var t = pwToday_(); return mLock_(function () { var sh = pwTab_();
  pwRows_().forEach(function (r) { if (r.uid === uid && r.visto !== t) sh.getRange(r._row, 7).setValue(t); }); return { ok: true }; }); }
function pwDel_(uid, ep) { return mLock_(function () { var sh = pwTab_(); var rows = pwRows_();
  for (var i = rows.length - 1; i >= 0; i--) if (rows[i].uid === uid && (!ep || rows[i].endpoint === ep)) sh.deleteRow(rows[i]._row);
  return { ok: true }; }); }
// lista da vez: hora já passou hoje, ainda não abriu o app hoje, ainda não recebeu hoje. Marca "enviado" na mesma trava (o robô nunca manda 2x).
function pwDue_() { return mLock_(function () {
  var sh = pwTab_(); var t = pwToday_(); var now = Utilities.formatDate(new Date(), PW_TZ, "HH:mm"); var out = [];
  var idle = Utilities.formatDate(new Date(Date.now() - PW_IDLE_DAYS * 864e5), PW_TZ, "yyyy-MM-dd");
  var rows = pwRows_();
  for (var i = rows.length - 1; i >= 0; i--) { var r = rows[i];
    if (r.visto && r.visto < idle) { sh.deleteRow(r._row); continue; }          // 30 dias sem abrir: para de chamar
    if (r.hora > now || r.visto === t || r.enviado === t) continue;
    sh.getRange(r._row, 8).setValue(t);
    out.push({ i: r.id, ep: r.endpoint, p: r.p256dh, au: r.auth }); }
  return { ok: true, subs: out };
}); }
function pwGone_(ids) { if (!Array.isArray(ids)) return { ok: false, err: "ids" }; var set = {}; ids.slice(0, 500).forEach(function (x) { set[String(x)] = 1; });
  return mLock_(function () { var sh = pwTab_(); var rows = pwRows_(); var n = 0;
    for (var i = rows.length - 1; i >= 0; i--) if (set[rows[i].id]) { sh.deleteRow(rows[i]._row); n++; }
    return { ok: true, n: n }; }); }
