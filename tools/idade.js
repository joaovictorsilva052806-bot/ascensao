// ---------- Trava de idade 18+ (tools/idade.js): Primeira Renda (versão 18+), Missões do Mestre e Arsenal do Herói ----------
// Regras (viabilidade 7206553830, liberadas em 7216423824): (1) sem idade = menor onde AGE_UNK_MINOR (no /comecar/);
// (2) quem já foi menor (14-17, até 13 ou sem idade) só vira 18+ depois de 7 dias; (3) some com autorização de responsável (parent) gravada;
// (4) sem Ouro de Missão do Mestre nos 3 primeiros dias de conta (adGoldOk).
// A idade é autodeclarada: isto barra o impulso, não quem mente. A trava real é o cadastro 18+ do parceiro (dito nos Termos).
// Só ADICIONA prog.idade = {a: faixa vista por último, t0: 1º dia visto, up: dia em que passou de menor para 18+, mn: 1 se já foi menor}.
const AD_ADULT=["young","adult","senior"],AD_WAIT=7,AD_GOLD=3;
function adSt(){let x=prog.idade;if(!x||typeof x!=="object"||Array.isArray(x))x=prog.idade={};return x;}
function adDiff(a,b){const p=k=>{const [y,m,d]=String(k).split("-").map(Number);return Date.UTC(y,m-1,d);};const n=Math.round((p(b)-p(a))/864e5);return isFinite(n)?n:0;}
function adUnkMinor(){return typeof AGE_UNK_MINOR!=="undefined"&&!!AGE_UNK_MINOR;}
// menor do jeito que o app já conta: até 13, 14-17 ou (no /comecar/) sem idade
function adMinorAge(a){return a==="kid"||a==="teen"||(!a&&adUnkMinor());}
function adParent(){for(const k of ["asc-u-tele","asc-u-beta"]){try{const o=JSON.parse(localStorage.getItem(k)||"{}");if(o&&o.parent)return true;}catch(e){}}return false;}
// registra a faixa vista; passar de menor para 18+ liga a espera de 7 dias
function adSeen(){if(!cfg||cfg.blank)return;const a=ageNow(),x=adSt(),tk=todayKey();let ch=false;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(x.t0||"")){x.t0=tk;ch=true;}
  if(x.a!==a){const was=typeof x.a==="string"?x.a:null;
    if(!adMinorAge(a)&&(x.mn||(was!==null&&adMinorAge(was))))x.up=tk;
    x.a=a;ch=true;}
  if(adMinorAge(a)&&!x.mn){x.mn=1;ch=true;}
  if(ch)save();}
// dias que faltam para liberar o 18+ (0 = liberado)
function adWait(){const x=adSt();if(!x.up)return 0;return Math.max(0,AD_WAIT-adDiff(x.up,todayKey()));}
function ad18(){try{if(!cfg||cfg.blank)return false;const a=ageNow();
  if(a?!AD_ADULT.includes(a):adUnkMinor())return false;
  if(adParent())return false;adSeen();return adWait()===0;}catch(e){return false;}}
function adGoldOk(){try{const x=adSt();let s=cfg&&/^\d{4}-\d{2}-\d{2}$/.test(cfg.startDate||"")?cfg.startDate:x.t0||todayKey();return adDiff(s,todayKey())>=AD_GOLD;}catch(e){return false;}}
{const _r=render;render=function(){_r.apply(this,arguments);try{adSeen();}catch(e){}};}
