# Relatório de QA (ATENA)

## 25/11/2026 23h · Retenção D1/D3/D7 e funil no Modo Criador (PR rascunho, espera o "pode publicar")

- Novo: painel "📈 Retenção (anônima)" na aba Criador (só no app do JV). Calcula D1/D3/D7 e o funil perfil → 1ª missão → fechou o dia a partir das linhas `A` que o painel já recebe. Não guarda nada.
- Coleta: 2 etapas novas no mesmo formato anônimo e no mesmo opt-in (`7-quest`, `8-fechou-dia`), 1 vez por dia. Até 13 anos e sem aceite: nada sai.
- Corrigido junto: o app do criador pedia "Liberar seu painel para o criador?" para o próprio JV (o intervalo do aceite não era desligado na raiz). Agora não pede e não envia nada.
- Testes: qa/retencao.test.js 28/28 (390x844 e 1280x800); o teste do aceite falhava no código antigo. Suíte: alvo 24, apps 47, convite 69, foco 32, funil 16, ranking-dia 47, relampago 27, rotulos 17, segredos 38, toque 19 e os demais sem FAIL. qa/mural-servidor.test.js quebra no Node também na main (não é deste PR). Caches ascensao-v55 / ascensao-u-v67.

## Revisões horárias

- 25/11 15h36 · Achado: cabeçalho dos painéis recolhíveis ("Como você está", "Treino do Sistema", "Ligar à planilha") tinha só 28px de altura para o dedo. Mudou: alvo de toque de 44px sem mudar o visual (margem negativa); caches ascensao-v29 / ascensao-u-v38. Placar: 198/198 (novo qa/toque.test.js 19/19, falhava 12/19 no código antigo).

## 25/11/2026 · 1ª rodada da ATENA: placar inicial e 3 correções (#27, #28, #30)

Playwright, 390x844 e 1366x820, servidor local, main do #25 ao #29. Placar inicial (só leitura): 129/132.

| Teste | Resultado |
|---|---|
| /, /comecar/, /convite/: abrem, sem rolagem horizontal | passou |
| Onboarding Despertar completo, check-in, marcar e desmarcar quest | passou |
| Masmorra 7 andares e virada de dia (relógio simulado) | passou |
| Reset ("Apagar tudo") e restaurar backup: histórico igual | passou |
| Offline (SW registrado à mão no localhost) | passou |
| Migração: localStorage gerado na versão de 24/11 (#5), raiz e /comecar/: nada some (temporada guarda em prog-t1) | passou |
| reduce-motion: barra de XP e anel do rank ainda animavam | corrigido no #27 (qa/movimento.test.js 10/10) |
| Erro de console: aviso do Sistema vibrava antes do 1º toque | corrigido no #28 (qa/vibrar.test.js 5/5) |
| Avisos do Sistema em dobro na tela + habilidade anunciada de novo a cada abertura (r.seen não era gravado) | corrigido no #30 (qa/avisos.test.js 4/4) |

Suíte depois do #30: avisos 4, classe 22, foco 32, liga 12, movimento 10, religar 14, rotas 12, segredos 38, sequencia 30, vibrar 5. Tudo verde.
Site no ar: github.io é bloqueado na nuvem; conferido pelo "pages build and deployment" (sucesso). Caches ascensao-v28 e ascensao-u-v37.

## 25/11/2026 · Atalho "Ascension Foco" em 1 toque no iPhone

- Link do JV conferido pelo conteúdo do atalho: Adjust Date (+Shortcut Input em minutos) e Não Perturbe até a Data Ajustada. O 1º link ficava ligado sem fim e foi recusado.
- App: botão "1. Adicionar o atalho" abre o link do iCloud; passos manuais só aparecem se não houver link.
- Testes: qa/foco.test.js 32/32; classe, liga, movimento, religar, rotas, segredos e sequência sem falha. Caches ascensao-v27 / ascensao-u-v36.
- Não testado aqui: rodar o atalho num iPhone real.

## 25/11/2026 · liga da semana e classe em 1 toque

Base: Duolingo (ligas semanais com promoção, rival próximo) e onboarding de 1 toque. Playwright 390x844 e 1280x800, relógio simulado, ranking simulado. Placar: 128/128.

| Teste | Resultado |
|---|---|
| qa/liga.test.js: pílula 🏆 3º em Hoje abre o ranking; linha da liga com rival ("faltam N XP para passar Bia"); fechamento da semana em 2º sobe para Bronze (uma vez só); 4º mantém a liga; aviso "Bia te passou"; fora do ranking nada aparece | 12/12 |
| qa/classe.test.js (/ e /comecar/): sugestão pela rotina (Universitário) ou Mago; lista escondida; 1 toque grava; "Ver outras" e troca pelo topo mostram a lista | 22/22 |
| qa/sequencia, religar, rotas, segredos | 30 + 14 + 12 + 38 |

Achado e corrigido antes de publicar: o fechamento da semana se perdia quando outro aviso (check-in) estava na fila, porque a foto da semana nova sobrescrevia a antiga. Agora fecha antes de atualizar.
Dados: só adiciona `prog.league`. Caches: ascensao-v24 e ascensao-u-v33.

## 25/11/2026 · reinstalação segura: ligar a planilha não sobrescreve mais o progresso

Bug achado: numa instalação nova, se a pessoa tocava em algo (classe, check-in) antes de ligar a planilha, o progresso local "novo" vencia pela data e subia por cima do progresso da planilha. Correção: na 1ª ligação de um aparelho, nada sobe antes de baixar; a planilha vence e o local vira backup em `ascensao-prog-prelink`.

| Teste | Resultado |
|---|---|
| qa/religar.test.js (colar endereço e link #s=): progresso da planilha volta, nenhum POST antes do GET, local vira backup, aba Criador aparece | 14/14 passou (no código antigo: 6 falhas, o bug era real) |
| qa/segredos.test.js | 38/38 (teste ajustado para abrir o acordeão do PR #20; estava quebrado desde ele) |
| qa/rotas.test.js: /, /comecar/, /convite/ em 390 e 1280, com e sem reduce-motion, console sem erros | 12/12 passou |

Caches: ascensao-v22 e ascensao-u-v31.

## 25/11/2026 · telas enxutas e centralizadas (feedback da Mô: "muita informação")

Playwright, 390x844 e 1280x800, servidor local, em cima da main com onboarding v2, segredos e foco do celular.

| Teste | Resultado |
|---|---|
| /comecar/ onboarding completo (Despertar › nome › idade › rotina › jogo) | passou |
| Check-in diário | passou |
| Marcar e desmarcar quest | passou |
| Hoje: só perfil e tarefas abertos; Treino e Como você está viram linha | passou |
| Treino do Sistema mostra o texto (antes vinha vazio no /comecar/: id duplicado "tipText") | corrigido |
| Progresso: masmorra aberta, resto recolhido; abrir um fecha o outro (acordeão) | passou |
| Painéis injetados depois (Segredos, Terminal) também recolhem | passou |
| Mais vira menu; Chamar um amigo fica aberto; backup acessível | passou |
| Teclado: Enter abre o painel (role=button, aria-expanded) | passou |
| Foco centralizado, texto de ajuda em 1 linha, timer inicia | passou |
| Desktop: conteúdo e barra de abas centralizados em 560 px | passou |
| App pessoal (raiz) com progresso antigo: dados preservados (temporada guarda em prog-t1) | passou |
| reduce-motion: chevron sem transição | passou |
| /convite/ 200, console sem erros de JS | passou |

Não testado aqui: offline real (o SW só registra em https) e GitHub Pages no ar (rede do sandbox bloqueada). Caches: ascensao-v21 e ascensao-u-v30.

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

- 25/11/2026 16h30 · Revisão horária · Achado: 13 campos de texto só com placeholder, sem nome para leitor de tela (5 na raiz, 13 em /comecar/: quest rápida, nome, meta, backup, recompensa…). Mudou: `aria-label` em todos, cache `ascensao-v31` / `ascensao-u-v40`, teste novo `qa/rotulos.test.js` (9/17 no código antigo, 17/17 no novo). Placar: 12/12 arquivos verdes.

- 25/11/2026 18h · Revisão horária · Achado: na tela do Desafio relâmpago (#45) Esc não fechava, a tela não tinha nome para leitor de tela, o foco ficava atrás dela, cada toque no contador perdia o foco e a contagem não era anunciada; o contador encolhia ao tocar mesmo com reduce-motion. Mudou: nome na tela, foco entra e volta ao cartão, Esc fecha, região aria-live com "3 de 10" e "Pronto", reduce-motion no contador, cache `ascensao-v34` / `ascensao-u-v44`, teste novo `qa/relampago.test.js` (12/27 no código antigo, 27/27 no novo). Placar: 13/13 arquivos verdes.

- 25/11/2026 18h35 · Revisão horária · Achado: main vermelha em `qa/classe.test.js` (2 falhas): o teste ainda esperava "Mago" para quem não tem rotina, mas o #47 passou a sugerir a classe pelo perfil (foco e meta). Mudou: teste atualizado para o comportamento novo e reforçado (sem perfil sugere classe de fantasia e mostra o porquê; foco "Saúde e corpo" sugere classe de Corpo, o que falha no código antigo). App não mudou, cache segue `ascensao-v37` / `ascensao-u-v47`. Placar: 13/13 arquivos verdes (classe 36/36).
- 25/11/2026 19h30 · Revisão horária · Achado: na tela Hoje o título da tarefa (que abre os detalhes) aceitava toque só em 21px de altura e os selos do topo (🔥 sequência, 🛡️ escudo, classe) em 30px, abaixo dos 44px recomendados para o dedão. Mudou: área de toque invisível de ≥ 44px nos dois, sem mudar o visual e sem roubar o toque dos botões; cache `ascensao-v47` / `ascensao-u-v58`; teste novo `qa/alvo.test.js` (12/24 no código antigo, 24/24 no novo). Também: a main estava vermelha em `qa/liga.test.js` desde o #56 (o teste esperava o painel antigo do ranking; a pílula 🏆 agora leva à aba Amigos); o #61 corrigiu o teste ao mesmo tempo e ficou valendo a versão dele. Placar: 15/15 arquivos verdes (alvo 24/24).

## 25/11/2026 · Funil anônimo só com opt-in (correção de privacidade)

Achado: o funil anônimo (`A`) enviava etapas para quem tinha 14+ sem opt-in, e o convite enviava "1-convite" para qualquer visitante (sem idade nem consentimento). Fere a regra "beta anônimo só com opt-in".
Mudou: `/convite/` e `/x/` não enviam nada nem criam id; no `/comecar/` as etapas só saem depois do aceite do painel ou do "sim" do beta anônimo; até 13 anos nada. Cache `/comecar/` `ascensao-u-v59`.
**Placar:** `qa/funil.test.js` 16/16 (5 falham no código antigo). Suíte completa: 16/16 arquivos verdes.
Efeito no painel: o funil passa a contar só quem aceitou; a etapa "convite" para de crescer.
- 25/11/2026 21h · Etapa 2 do ranking (pedido da EVA, #22) · Mudou: ranking de Hoje com rival do dia e animação de subida, contagem pelo sensor de movimento no relâmpago, avisos locais opcionais, desafio em dupla. Teste novo `qa/ranking-dia.test.js` 47/47 (celular 390x844 e desktop, raiz e /comecar/, reduce-motion, iPhone com permissão no toque, permissão negada, sensor sem sinal, segunda-feira, dado antigo intacto). Achado no caminho: o Chromium dispara um `devicemotion` vazio (tudo nulo) que contaria repetição fantasma; agora é ignorado. Cache `ascensao-v48` / `ascensao-u-v60`. Placar: 17/17 arquivos verdes.
- 25/11/2026 20h23 · Revisão horária · Checklist da EVA, item 1 (convite): não havia teste próprio. Teste novo `qa/convite.test.js` cobre /x/ = /convite/ (código, manifest e texto na tela), o olho (botão com nome, toque e Enter revelam "Aceite a missão"), passos certos e numerados por aparelho (iPhone, iPhone no Instagram, Android, Android no WhatsApp, PC) só depois do olho, "entrar sem instalar" → /comecar/, aberto pelo ícone (display-mode e navigator.standalone) vai a /comecar/ uma vez e fica (sem loop), console limpo com e sem reduce-motion. Nenhum bug achado; app sem mudança (cache do SW igual). Placar: convite 69/69; suíte 19/19 arquivos verdes (já com #66, #68 e #71). Próximo item do checklist: amigos e avatar (salvar e reabrir sem perder dados).
- 26/11/2026 21h23 · Revisão horária · Main vermelha depois do #76 (raiz unificada com /comecar/): `apps`, `foco` e `segredos` falhavam. Achados: (1) aviso (toast) agora fica sobre o rank do herói em Hoje e engolia o toque/segurar por 2,6 s; virou só texto para o toque (`pointer-events:none`, o botão Desfazer continua clicável); (2) com planilha ligada, o atalho "Tarefas com app" criava tarefa que a próxima sincronização apagava; agora some quando há planilha; (3) testes atualizados para a raiz nova: aparelho sem tarefas abre o cadastro (semeia `ascensao-cfg`), o SW só registra em https (registro manual no localhost para o teste offline) e o pedido do painel do criador abre depois do foco ("Agora não"). Cache `ascensao-v53` / `ascensao-u-v65`. Placar: 21/21 arquivos verdes (apps 47/47, foco 32/32, segredos 38/38). Observação para o JV/EVA: a raiz agora pergunta ao próprio JV "Liberar seu painel para o criador?" (coleta de dados: não mexi).
