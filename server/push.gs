// push.gs — Aviso diário com o app fechado (Web Push), sem servidor novo e sem conta nova.
// Encaixe: arquivo novo no MESMO projeto do mural.gs ("Ascensão - avisos por e-mail"). O doPost continua um só (mural.gs):
// ele chama pwRoute_() quando a ação começa com "pw". Depois de colar, "Implantar > Gerenciar implantações > editar > Nova versão"
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
