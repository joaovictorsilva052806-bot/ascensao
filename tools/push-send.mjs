// push-send.mjs — robô do aviso diário (roda no GitHub Actions, .github/workflows/lembrete-push.yml).
// 1) Pede ao Apps Script (server/mural.gs, seção PUSH) a lista da vez ("pw-due", com LEMB_KEY): quem já passou da hora hoje e ainda não abriu o app.
// 2) Manda 1 Web Push para cada um (VAPID). 3) Avisa ao Apps Script quais inscrições morreram (404/410) para apagar.
// Segredos só por variável de ambiente (GitHub Secrets). Nunca imprime endpoint, chave nem resposta crua: só contagens.
import webpush from "web-push";
const URL_ = process.env.PUSH_URL || "https://script.google.com/macros/s/AKfycbwI3tDbLa7qYH2_oLn8kQAHuLrn-NXrtOjLEMXEcjdn_NsjW3UM7QAJE9hvQg_47isJbA/exec";
const PUB = process.env.VAPID_PUBLIC || ""; // a mesma chave pública do tools/push.js (VAPID_FIXA)
const { VAPID_PRIVATE = "", LEMB_KEY = "" } = process.env;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:ascension.app.contato@gmail.com";
if (!PUB || !VAPID_PRIVATE || !LEMB_KEY) { console.log("Segredos ainda não configurados: nada a fazer."); process.exit(0); }
webpush.setVapidDetails(VAPID_SUBJECT, PUB, VAPID_PRIVATE);
const MSGS = ["O Sistema te chama: sua missão de hoje está esperando.", "Uma missão pequena hoje já conta. Bora?", "Sua sequência está te esperando. 1 tarefa e pronto."];
async function call(body) {
  const r = await fetch(URL_, { method: "POST", body: JSON.stringify(body), redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" } });
  if (!r.ok) throw new Error("http " + r.status);
  return r.json();
}
const due = await call({ a: "pw-due", k: LEMB_KEY });
if (!due || due.ok === false) { console.log("Apps Script recusou: " + String(due && due.err || "erro").slice(0, 20)); process.exit(1); }
const subs = Array.isArray(due.subs) ? due.subs : [];
const day = new Date().getUTCDate();
let ok = 0, fail = 0; const gone = [];
for (const s of subs) {
  try {
    await webpush.sendNotification({ endpoint: s.ep, keys: { p256dh: s.p, auth: s.au } },
      JSON.stringify({ t: "⚔️ Ascension", b: MSGS[day % MSGS.length] }), { TTL: 3 * 3600, urgency: "normal", topic: "asc-diario" });
    ok++;
  } catch (e) { if (e && (e.statusCode === 404 || e.statusCode === 410)) gone.push(s.i); else fail++; }
}
if (gone.length) { try { await call({ a: "pw-gone", k: LEMB_KEY, ids: gone }); } catch (e) { fail++; } }
console.log(`Avisos: ${subs.length} na vez · ${ok} enviados · ${gone.length} inscrições vencidas apagadas · ${fail} falhas`);
