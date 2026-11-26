// Robô do aviso diário (tools/push-send.mjs) contra um Apps Script falso e um serviço de push falso (HTTPS local).
// Rode com: npm i --no-save web-push@3.6.7 && node qa/push-send.test.mjs
// Confere: sem segredos termina verde sem chamar ninguém; manda 1 push cifrado por inscrição da vez; 410 vira "pw-gone";
// erro 500 não apaga; nada de endpoint ou chave no log.
import http from "node:http"; import https from "node:https"; import crypto from "node:crypto"; import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url"; import path from "node:path"; import fs from "node:fs";
const R = []; const ok = (n, c, x) => R.push((c ? "PASS " : "FAIL ") + n + (x && !c ? " · " + x : ""));
const dir = path.dirname(fileURLToPath(import.meta.url)); const SCRIPT = path.join(dir, "..", "tools", "push-send.mjs");
// certificado autoassinado só para o teste
const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || "/tmp", "pwqa-"));
await new Promise((res, rej) => execFile("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", tmp + "/k.pem", "-out", tmp + "/c.pem", "-days", "1", "-subj", "/CN=localhost"], e => e ? rej(e) : res()));
const pushes = []; const ps = https.createServer({ key: fs.readFileSync(tmp + "/k.pem"), cert: fs.readFileSync(tmp + "/c.pem") }, (q, r) => {
  let b = []; q.on("data", d => b.push(d)); q.on("end", () => { pushes.push({ url: q.url, h: q.headers, len: Buffer.concat(b).length });
    r.statusCode = q.url.includes("vencido") ? 410 : q.url.includes("quebrado") ? 500 : 201; r.end(); }); });
await new Promise(r => ps.listen(0, r)); const PP = ps.address().port;
const calls = []; const as = http.createServer((q, r) => { let b = ""; q.on("data", d => b += d); q.on("end", () => { const j = JSON.parse(b || "{}"); calls.push(j);
  r.setHeader("Content-Type", "application/json");
  if (j.k !== "k".repeat(32)) return r.end(JSON.stringify({ ok: false, err: "chave" }));
  if (j.a === "pw-due") return r.end(JSON.stringify({ ok: true, subs: ["bom", "vencido", "quebrado"].map((n, i) => {
    const e = crypto.createECDH("prime256v1"); e.generateKeys();
    return { i: "p" + i, ep: `https://localhost:${PP}/push/${n}`, p: e.getPublicKey().toString("base64url"), au: crypto.randomBytes(16).toString("base64url") }; }) }));
  if (j.a === "pw-gone") return r.end(JSON.stringify({ ok: true, n: j.ids.length }));
  r.end(JSON.stringify({ ok: false })); }); });
await new Promise(r => as.listen(0, r)); const AP = as.address().port;
const vk = (await import("web-push")).default.generateVAPIDKeys();
const run = env => new Promise(res => execFile(process.execPath, [SCRIPT], { env: Object.assign({ PATH: process.env.PATH, NODE_TLS_REJECT_UNAUTHORIZED: "0", NODE_NO_WARNINGS: "1", PUSH_URL: `http://localhost:${AP}/exec` }, env) }, (e, out, err) => res({ code: e ? e.code : 0, out: out + err })));
// 1) sem segredos
let r = await run({});
ok("sem segredos: termina verde", r.code === 0, r.out); ok("sem segredos: não chama o Apps Script", calls.length === 0, calls.length + "");
// 2) com segredos
const ENV = { VAPID_PRIVATE: vk.privateKey, VAPID_PUBLIC: vk.publicKey, VAPID_SUBJECT: "mailto:teste@example.com", LEMB_KEY: "k".repeat(32) };
r = await run(ENV);
ok("com segredos: termina verde", r.code === 0, r.out);
ok("pede a lista da vez com a chave", calls[0] && calls[0].a === "pw-due" && calls[0].k === ENV.LEMB_KEY);
ok("manda 1 push por inscrição (3)", pushes.length === 3, pushes.length + "");
ok("push cifrado (aes128gcm) e com VAPID", pushes.every(p => p.h["content-encoding"] === "aes128gcm" && /^vapid t=/.test(p.h.authorization || "") && p.len > 0));
ok("TTL de 3 h e tópico fixo", pushes.every(p => p.h.ttl === "10800" && p.h.topic === "asc-diario"));
const g = calls.find(c => c.a === "pw-gone"); ok("410 vira pw-gone só com a vencida", g && JSON.stringify(g.ids) === '["p1"]', JSON.stringify(g));
ok("log com contagens", /3 na vez · 1 enviados · 1 inscrições vencidas apagadas · 1 falhas/.test(r.out), r.out);
ok("log sem endpoint nem chave", !/localhost|push\/|kkkk/.test(r.out) && !r.out.includes(vk.privateKey), r.out);
// 3) chave errada
calls.length = 0; r = await run(Object.assign({}, ENV, { LEMB_KEY: "x".repeat(32) }));
ok("chave errada: falha sem mandar push", r.code !== 0 && pushes.length === 3, r.out);
ok("chave errada: log não mostra a chave", !r.out.includes("x".repeat(32)), r.out);
ps.close(); as.close(); fs.rmSync(tmp, { recursive: true, force: true });
console.log(R.join("\n")); const f = R.filter(x => x.startsWith("FAIL")).length; console.log((R.length - f) + "/" + R.length); process.exit(f ? 1 : 0);
