# Relatório de QA (ATENA)

## 25/11/2026 · recursos do celular no Modo foco (sala de foco, Não Perturbe do iPhone, ruído marrom, atalhos do ícone)

Playwright, 390x844 (Android e iPhone simulados) e 1280x800, servidor local. Placar: 31/31.

| Teste | Resultado |
|---|---|
| Sala de foco abre ao começar; tela acesa (Wake Lock) e solta ao sair | passou |
| Celular virado para baixo apaga a tela; ao levantar mostra quanto falta | passou |
| Háptica no início e no fim (vibrate no Android, switch no iOS 18) | passou |
| Ruído marrom liga e desliga (gerado no aparelho, sem arquivo) | passou |
| Fim do bloco: fecha a sala, toca aviso, XP entra | passou |
| iPhone: passos do Atalho, "Pronto, criei", começar chama shortcuts://run-shortcut com os minutos | passou |
| Android: dica de Não perturbe; botão do iPhone escondido | passou |
| Atalho do ícone ?foco=25 inicia o foco e limpa a URL; sem perfil é ignorado | passou |
| Convidar amigo abre a folha de compartilhar com o link do /convite/ | passou |
| /, /comecar/, /convite/ e desktop sem erro de JS | passou |
| reduce-motion: sala sem animação | passou |
| Dados antigos intactos; preferências do aparelho em chave separada (asc-dev) | passou |
| Offline pelo service worker (cache ascensao-v20 / ascensao-u-v29) | passou |

Corrigido no caminho: nome IOS duplicado no /comecar/ (renomeado para F_IOS).
Não testado aqui: Atalho real no iPhone e Wake Lock real (precisa do aparelho do JV).

## 25/11/2026 · convite de instalação + permissão na 1ª abertura (PR #15, revisado e publicado com o ok do JV)

Playwright, 390x844 e 1280x800, servidor local.

| Teste | Resultado |
|---|---|
| /convite/ iPhone Safari mostra os 3 passos (Compartilhar › Tela de Início) | passou |
| /convite/ iPhone dentro do Instagram pede para abrir no Safari | passou |
| /convite/ Android mostra ⋮ › Instalar app; com prompt nativo vira botão "Instalar" | passou |
| /convite/ Android dentro do WhatsApp pede para abrir no Chrome | passou |
| /convite/ no computador pede para abrir no celular | passou |
| /convite/ aberto pelo ícone (standalone) vai direto para /comecar/ | passou |
| /comecar/ 1ª abertura: permissão (1ª tela, antes de tudo) › apresentação › nome › onboarding completo (6 quests) | passou |
| iPhone: passo 1 avisa que no iOS 26 o Compartilhar fica no menu ⋯ | passou |
| Recarregar depois do onboarding não mostra permissão de novo | passou |
| Usuário antigo (localStorage com cfg) não vê a tela de permissão e não perde quests | passou |
| reduce-motion no convite | passou |
| Console | só falhas de rede das fontes do Google (sandbox sem internet), nenhum erro de JS |

Não testado aqui: instalação real num aparelho (precisa do celular do JV) e GitHub Pages no ar (rede do sandbox bloqueada).

## 25/11/2026 · onboarding v2 "Despertar" (publicado com a permissão do JV)

| Teste | Resultado |
|---|---|
| Convite revela em 2 tempos ("Você foi encontrado(a)." → "Instale para continuar.") e mostra os passos certos em iPhone, Android, in-app e PC | passou |
| App: 1ª tela "Despertar" (1 toque = permissão + começar), sem slides de apresentação | passou |
| Perguntas: nome → idade → rotina → foco (já pré-marcado); títulos com o nome do jogador; barra "SINCRONIA" | passou |
| Onboarding completo gera 6 quests; recarregar não repete o Despertar | passou |
| Usuário antigo não vê o Despertar e não perde quests | passou |
| reduce-motion: texto aparece sem digitação e sem pulso | passou |
| Console | só falhas de rede das fontes (sandbox) |

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
