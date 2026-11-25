# Relatório de QA (ATENA)

## 25/11/2026 · Segredos (conquistas ocultas, códigos e títulos raros)

**Placar: 38/38 passando** (`qa/segredos.test.js`, Playwright, 390x844 e 1280x800, relógio simulado).

Passou:
- `/`, `/comecar/` e `/convite/` abrem sem erro de console (tirando o aviso do Chrome sobre `navigator.vibrate` sem toque, que já existia).
- 17 segredos: códigos (com maiúscula e acento), toques (rank 10x, segurar rank, relógio 7x), relógio (4:20/16:20, 11:11, meia-noite), datas (20/04, sexta 13), quests (madrugada, antes das 6h30, volta após 3+ dias, 3 quests diferentes em 1 min, marcar/desmarcar 6x).
- Código repetido não dá XP de novo; spam da mesma quest não vira speedrun.
- Migração: progresso antigo (log, money, ach, rpg.cls, campo desconhecido) continua intacto; só entram `prog.sec` e `prog.secTitle`.
- Nada dispara durante o onboarding nem com a escolha de classe aberta.
- reduce-motion: revelação e Modo Zen sem movimento.
- Offline: abre do cache com o painel novo (cache `ascensao-v19` / `ascensao-u-v26`).

Falhou e foi corrigido no caminho: título duplicava "+10 XP" na mensagem; speedrun contava a mesma quest marcada 3x.
