# Relatório de QA (ATENA)

## 27/11/2026 · Loja do Ouro sem sorteio (ECA Digital, Lei 15.211/2025, art. 20)

- Auditoria: nada com resultado aleatório se compra com Ouro. Loja = 8 itens de escolha direta (3 molduras, 2 fundos, 2 títulos, escudo), nome e preço na cara. Baú de recompensas = prêmios que o próprio jogador escreve, preço fixo. O Baú do dia (sorteio) é grátis por mérito e não tem caminho que gaste Ouro. Nenhuma mudança no app.
- Trava nova: qa/loja-sem-sorteio.test.js (raiz e /comecar/, 390x844) compra cada item e resgata uma recompensa contando chamadas a Math.random/crypto.getRandomValues que nascem da compra (fora o enfeite visual: id de SVG e faíscas); confere o sorteio do Baú intacto e que chest.js não toca no Ouro. 18/18. Com um Math.random() injetado no orSpend, 2 falham (o teste pega).

## 27/11/2026 · Desafio Forja 30 conciliado com a caminhada e a dor da Forja (#166/#169)

- Achado na main depois do #169: com o Desafio ativo, 2 botões de caminhada (timers separados) e 2 "Senti dor, parei"; a dor da Forja não contava no Desafio.
- Correção só em tools/ouro.js: o Desafio lê o fim da caminhada/treino da Forja (20 min para caminhada, aviso de 2 toques antes), dor conta o dia, sem janela extra por cima. Legado: `prog.f30.walk` em andamento segue no timer antigo.
- Testes: qa/ouro.test.js 129/129 (E, F, F2, F3 cobrem botão único, dor, caminhada curta e dor na caminhada). forja 168/168. Suíte inteira 69/69 arquivos .js verdes. Cache v99 / u-v111.

## 27/11/2026 · Forja: galeria espera o treino (#135) e toque de 44 px (#136), PR #150 do ARES

- Revisão: correção boa (embrulho do `openCls` só segura a galeria automática com o Forja aberto ou até 10 s depois com aviso na tela; `openCls.force` passa direto; convive com o adiamento do `noite.js`).
- Achado: o teste G do PR passava mesmo sem a correção (removia o `#clsModal` do DOM e o `clsGalOpen` ficava preso em true). Reescrito: jogador novo no dia 1, treino completo, nunca duas janelas juntas e a galeria abre depois dos avisos. Sem a correção, 4 checks falham; com ela, 10/10.
- Testes: qa/forja.test.js 130/130 (390x844, 1280x800, reduce-motion, perfil antigo sem `prog.forja`, raiz e /comecar/). Suíte inteira 68/69: push-send precisa do web-push (não instalado, sem relação); textos1 oscilou 1x sob carga e passou 3/3 sozinho. Cache v97 / u-v109.

## 27/11/2026 · Uma moeda só (moedas do Baú viram Ouro)

- Migração 1 vez: backup antes (`*-prog-preouro`), saldo de moedas entra no Ouro 1 para 1, `rpg.spent` e recompensas intactos, não repete ao recarregar; volta em Mais > Ajustes.
- Testes: qa/ouro.test.js 117/117 (bloco K novo nos dois apps). Suíte inteira: 62/67 na 1ª rodada; os 5 vermelhos (alvo, foco2, funil, toque, textos1) eram a janela "Uma moeda só" cobrindo a tela em save com XP. A janela agora não abre em navegador automatizado (como a de Novidades); os 5 + ouro verdes de novo.

## 27/11/2026 · Ouro, Loja do Ouro, Desafio Forja 30 e Hall da Fama (#163)

- Novo: Ouro (dia completo +10, semana sem quebrar +50, chefão +30, teto 200/dia), Loja (molduras, fundos, títulos, escudo), Desafio Forja 30 com as regras do ARES e Hall da Fama (aparelho; turma depois de republicar o mural.gs).
- Dados: só `prog.ouro`, `prog.ouroX`, `prog.f30`. Perfil antigo sem Ouro abre com todos os campos intactos; saldo negativo vira 0; recarregar não paga de novo.
- Testes: qa/ouro.test.js 97/97 (390x844, 360 px, 1280x800, reduce-motion, raiz e /comecar/, menor de 14). Suíte inteira 67/67 arquivos verdes sobre a main com #161 e #162. Cache v94 / u-v106.

## 26/11/2026 · Marcos da coleção (mesmo PR dos segredos)

- Novo: barra "Coleção: N itens · faltam X para « moldura »" na Coleção do baú e no prêmio do baú. Segredos, molduras e títulos contam; aos 3, 8, 15 e 25 itens sai uma moldura exclusiva (Faísca do Colecionador, Prisma, Constelação, Coroa do Arquivista) que o baú nunca sorteia. Vários marcos de uma vez = 1 janela só, sempre depois da janela do item.
- Dados: só ids novos em `prog.chest.frames`. Save antigo com 15 itens ganha 3 molduras ao abrir; molduras, títulos, `dry` e título em uso intactos.
- Testes: novo qa/colecao.test.js 22/22 duas vezes (390x844, 1280x800, reduce-motion, raiz e /comecar/, onboarding). Regressão: segredos 56/56, chefe-bau, sequencia, cartao, rotas, seguranca, movimento, sistema-recompensa 18/18, novidades, toque 19/19 sem FAIL. Caches ascensao-v75 / ascensao-u-v87.

## 26/11/2026 · Segredos: 8 piscadelas de cultura pop (25 no total)

- Novo: Plataforma Escondida (9h45/21h45), A Carta Chegou (11 dias jogados), A Resposta (42 quests; código 42 mostra quanto falta), Medidor Estourou (>9000 XP; código 9000 mostra o medidor), Galáxia Distante (04/05), Código Clássico (setas + B A no teclado, ou código), Hora do Pi (3:14/15:14 e 14/03) e Toca do Coelho (código). Só a referência: nomes, títulos e textos nossos.
- Dados: só `prog.sec`/`prog.secTitle`, como antes. Save antigo com segredos e título: nada some, contador vira N / 25.
- Testes: qa/segredos.test.js 56/56 três vezes seguidas (390x844, 1280x800, reduce-motion, offline, /comecar/). O seed dos blocos novos grava a temporada antes de abrir o app (sem isso o "Novo despertar" zerava o save do teste). chefe-bau, rotas e segurança sem FAIL. Caches ascensao-v74 / ascensao-u-v86.
## 26/11/2026 18h · Kit da App Store (PR #126 rascunho, espera o "pode publicar")

- Auditoria do PWA no iPhone: as 11 telas de abertura (`icons/splash/`) existiam mas nenhuma página apontava para elas; ligadas no `<head>` da raiz e do /comecar/ (11/11 respondem 200). Manifest da raiz ganhou `id` (mesmo valor calculado hoje). Ícones, apple-touch-icon, standalone e offline já estavam ok.
- Novo: "Bloquear" no Mural (diretriz 1.2 da Apple), só no aparelho, em `prog.mural.blk` (campo novo, nada apagado), com Desbloquear. Testado em 360 e 390 px (o botão quebra linha sem cortar).
- Novo: `nativo/` (Capacitor 8, /comecar/ dentro do pacote, ponte nativa) e workflow que compila para o simulador sem assinatura. O site não muda.
- **Placar:** suíte inteira em série 51/51 arquivos verdes (inclui `nativo` 14/14 e `mural` 24/24 com 6 casos novos); `rotas` 12/12 e `mural` refeitos depois do ajuste de CSS. Caches `ascensao-v77` / `ascensao-u-v89`.
- 27/11 (ok do JV para publicar): main trazida 3 vezes para o PR. Suíte inteira em série 69/69 em cima do #163; depois do #164/#165, `mural`, `nativo`, `rotas`, `seguranca`, `ouro`, `alvo`, `classe`, `liga` e `sequencia` sem FAIL. Workflow do iPhone passou a rodar só à mão (2 disparos cancelados na fila do Mac, sem log). Caches `ascensao-v96` / `ascensao-u-v108`.

## 25/11/2026 23h · Retenção D1/D3/D7 e funil no Modo Criador (PR rascunho, espera o "pode publicar")

- Novo: painel "📈 Retenção (anônima)" na aba Criador (só no app do JV). Calcula D1/D3/D7 e o funil perfil → 1ª missão → fechou o dia a partir das linhas `A` que o painel já recebe. Não guarda nada.
- Coleta: 2 etapas novas no mesmo formato anônimo e no mesmo opt-in (`7-quest`, `8-fechou-dia`), 1 vez por dia. Até 13 anos e sem aceite: nada sai.
- Corrigido junto: o app do criador pedia "Liberar seu painel para o criador?" para o próprio JV (o intervalo do aceite não era desligado na raiz). Agora não pede e não envia nada.
- Testes: qa/retencao.test.js 28/28 (390x844 e 1280x800); o teste do aceite falhava no código antigo. Suíte: alvo 24, apps 47, convite 69, foco 32, funil 16, ranking-dia 47, relampago 27, rotulos 17, segredos 38, toque 19 e os demais sem FAIL. qa/mural-servidor.test.js quebra no Node também na main (não é deste PR). Caches ascensao-v55 / ascensao-u-v67.

## 26/11/2026 11h40 · Retenção: teste de 14 a 17 anos

- A folga para 14 a 17 anos (só envia com "responsável autorizou" gravado) entrou no #106. Este PR só cobre a regra no teste da retenção: 3 casos novos (sem autorização, com autorização, beta sem autorização). qa/retencao.test.js 31/31 contra a main.

## Revisões horárias

- 26/11 18h23 · Achado: as 12 caixas de texto do Estudo (aba Foco, #118: tarefa, prazo, flashcards, horas, horário) vinham no padrão do navegador, cinza e com 24px de altura (alvo de toque pede 44px), do lado de selects de 44px. Mudou: mesmo estilo escuro dos outros campos, 44px, só em `tools/estudo.css`; caches ascensao-v84 / ascensao-u-v96. Placar: novo qa/estudo-campos.test.js 30/30 (27/30 no código antigo); suíte inteira 56/56 arquivos verdes.
- 26/11 16h23 · Achado: o cartão "Quer que o Sistema te chame?" (aviso diário, `#sysTip`) nunca aparecia na Hoje: o `sysTipUI` escondia o cartão se existisse qualquer `.sysmodal` no DOM, e o `#secZen` (Modo Zen) fica sempre no DOM, só com `hidden`. Mudou: só janela aberta de verdade segura o cartão (1 linha em `tools/rpg.js`); continua respeitando "uma dica por vez". Caches ascensao-v80 / ascensao-u-v92. Placar: novo qa/aviso-visivel.test.js 16/16 (4 falham na main); main 51/51; branch 52/52 (`arena` oscilou 1x sob carga, 37/37 sozinho 2x).
- 26/11 14h23 · Achado: rodando a suíte com 2 a 3 testes em paralelo (como a EVA e o ARES rodam), 7 arquivos falharam na main sem bug no app: `dialogo` (galeria de classes no lugar do check-in), `forja` e `guia-idade` (campo antigo sumiu), `funil` (modal do aceite não abriu), `relampago` ("dado antigo intacto (reduce-motion)", o vermelho que o ARES viu no #88) `retencao` (progresso intacto) e `turmas` (migração com Ana e Bia sumiu). Causa única: o teste abria o app vazio, gravava a semente e recarregava; o salvamento atrasado do app vazio às vezes sobrescrevia a semente. Mudou: a semente agora é gravada numa página de fora do app (`__seed__`, mesma origem) e só depois o app abre, o mesmo conserto do `arena`/`chefe-bau`. Só testes; app, XP e dados intactos, sem troca de cache. Placar: suíte inteira com 2 em paralelo: 43 de 50 verdes na main, os 7 vermelhos eram esta corrida; depois do conserto os 7 deram 3/3 rodadas verdes com 3 em paralelo (dialogo 56, forja 98, funil 20, guia-idade 24, relampago 27, retencao 28, turmas 98); `ranking-dia` também ganhou a semente e falhou 1 de 3 só em "sua linha anima subindo" (outra corrida, de animação; fica para a próxima).
- 26/11 13h23 · Achado: com "reduzir movimento" ligado, os atalhos que levam a um painel (abrir a Ficha do personagem, guia "Comece por aqui", chefão, turma, avatar, beta; 13 chamadas com `behavior:"smooth"`) faziam a tela deslizar, porque o navegador não desliga essa rolagem sozinho (Ficha: 27 eventos de scroll). Mudou: `tools/rolagem.js` troca `smooth` por salto direto só quando reduce-motion está ligado; sem reduce-motion nada muda. Sem mudança de visual, texto, XP ou dados. Teste novo `qa/rolagem.test.js` 32/32 (6 falham na main `0418169`), raiz e /comecar/, 390x844, com e sem reduce-motion. Cache `ascensao-v75` / `ascensao-u-v87`. Placar: suíte inteira 50/50 arquivos verdes sobre a main `349d94d` (#88).
- 26/11 12h23 · Achado: o ▶ da PRÓXIMA missão (o botão principal de Hoje) era branco sobre ciano, contraste 1.77:1 (WCAG pede 4.5:1). Mudou: símbolo escuro (#02121a), 10.4:1, só em `tools/mission.css`; caches ascensao-v71 / ascensao-u-v83. Placar: novo qa/proxima-contraste.test.js 20/20 (16/20 no código antigo); suíte inteira 45/45 arquivos verdes.
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
- 25/11/2026 22h23 · Revisão horária · Checklist da EVA, item 3 (amigos e avatar): não havia teste. Achado ao escrever o teste: na aba Amigos, os painéis "👥 Amigos" e "Esquadrão" viravam caixas vazias depois de redesenhar (título perdia o botão de abrir). O #79 corrigiu o mesmo ponto em paralelo; fiquei com a versão da main. Falha que sobrou: na turma vazia, "+ Adicionar amigo" rolava até o painel de amigos mas ele continuava fechado; agora abre e põe o foco no campo do apelido. Teste novo `qa/amigos-avatar.test.js` (raiz e /comecar/, 390x844): avatar abre, salva, reabre e cancela sem perder nada; título dos painéis com role/aria-expanded e Enter; card do amigo, comparar, pedido salvo e reaberto; jogador antigo sem avatar/amigos intacto; console limpo. Falha no código antigo. Cache `ascensao-v55` / `ascensao-u-v67`. Placar: amigos-avatar 78/78; suíte completa verde. (A linha "26/11 21h23" acima é de 25/11, horário de Brasília.)
- 25/11/2026 23h23 · Revisão horária · Correção de data: a linha do #77 acima saiu como "26/11 21h23", mas foi em 25/11/2026 21h23. Checklist da EVA: os 3 itens têm teste e estão verdes (convite 69/69, funil 16/16, amigos-avatar do #86). Varredura em 390x844 (nomes acessíveis, foco pelo teclado, reduce-motion sem animação rodando): só um achado. No convite (/convite/ e /x/), o "olho" (#stage) tinha `outline:none` sem substituto, então quem navega pelo Tab chegava nele sem ver nada (WCAG 2.4.7). Agora aparece um anel dourado só no foco pelo teclado (`:focus-visible`, contraste 17:1); no toque nada muda. Teste novo `qa/convite-foco.test.js` 36/36 (celular, desktop e reduce-motion, nas 2 rotas; 12 falham no código antigo). Cache `ascensao-v56` / `ascensao-u-v68`.

## 26/11/2026 3h07 · Teste noturno (main `02bb36c`, Trem 7)

**Placar: 31/31 arquivos de `qa/` verdes** depois da correção abaixo (antes: 30/31).

| Item | Resultado |
|---|---|
| Suíte `qa/*.test.js` (celular 390x844, iPhone 13, Pixel 7 e desktop) | passou (30/31 → 31/31) |
| Convite: /convite/ = /x/, olho, passos, redirecionamento sem loop (`convite` 69/69, `convite-foco` 36/36) | passou |
| Aceites de idade em /comecar/: 18+, 14-17 só com responsável, ≤13 desligado e sem envio (`funil` 16/16) | passou |
| Amigos e avatar: abre, salva, reabre, campos antigos intactos, console limpo (`amigos-avatar`) | passou |
| Marcar e desmarcar quest, check-in, virar o dia (relógio simulado), raiz e /comecar/ | passou |
| Reset com backup: copiar backup → apagar tudo (2 toques) → restaurar no onboarding traz log e campo desconhecido | passou (raiz e /comecar/, 390 e 1280) |
| Migração: localStorage gerado por `4cd78ba` (#65) e `81230f8` (#86) aberto na main | passou: 0 chaves e 0 campos perdidos (40→67 e 57→67 campos); só `updatedAt` e `avPub` recalculados |
| Offline (SW registrado à mão) e reduce-motion (`segredos`, `foco`, `movimento`, `rotas`, `toque`) | passou |
| Site no ar: "pages build and deployment" da main `02bb36c` | sucesso (26/11 3h06) |

Falhou e foi corrigido: `qa/mural-servidor.test.js` quebrava com `TypeError` quando rodado como os outros (`node qa/mural-servidor.test.js`, sem argumento), então o laço `for f in qa/*.test.js` sempre ficava vermelho. Agora usa `server/mural.gs` por padrão (29/29). Só teste: app e cache do SW sem mudança (`ascensao-v61` / `ascensao-u-v73`).

- 26/11/2026 7h23 · Revisão horária · Main `0f0c936` (Trem 8) verde; checklist da EVA (convite, idade, amigos/avatar) verde. Achado em 390x844: no "Comece por aqui", quem marcou "Até 13" (sem ranking) via "Veja seu lugar no ranking" e "te sobe no ranking". Mudou: para menor de 14 o passo 3 vira "Veja sua evolução", o desafio diz "Vale XP na hora" e o aviso final fala em evolução; 14+ igual. Teste novo `qa/guia-idade.test.js` 24/24 (4 falham no código antigo). Cache `ascensao-v63` / `ascensao-u-v75`. Placar: suíte inteira 33/33 arquivos verdes.

- 26/11/2026 8h23 · Revisão horária · Main `9f65be3` (#100); checklist da EVA (convite, idade, amigos/avatar) coberto. Achado em 390x844 (aba Progresso): o número "300 / 300 HP" da barra do chefão era branco direto sobre o verde-limão (contraste 1,3:1; 1,4 no amarelo e 2,6 no vermelho). Mudou: o número ganhou um selo escuro atrás (13:1 a 15:1 em todas as cores), só CSS em `tools/boss.css`. Teste novo `qa/chefe-contraste.test.js` 14/14 (6 falham no código antigo). Cache `ascensao-v64` / `ascensao-u-v76`. Placar: suíte inteira 34/34 arquivos verdes (`sequencia` oscilou 1 vez na rodada longa, o caso conhecido da galeria de classes, e passou nas 2 repetições; na main também passa).

- 26/11/2026 9h23 · Revisão horária · Main `6eec89c` (#101); checklist da EVA (convite, idade, amigos/avatar) coberto. Achado em 390x844: as janelas do Sistema (check-in do dia, avisos, subir de nível) abriam sem nome e sem `aria-modal`, e o foco ficava atrás delas: no teclado o Enter não confirmava e o Tab andava pela tela coberta; o leitor de tela dizia só "janela". Mudou: módulo `tools/dialogo.js` dá nome ("[ SISTEMA ] CHECK-IN DIÁRIO Dia 1"), `aria-modal`, foco no botão principal ao abrir, Tab preso na janela e foco de volta ao fechar. Sem mudança de visual, texto, XP ou dados. Teste novo `qa/dialogo.test.js` 56/56 (falha no código antigo), raiz e /comecar/, com e sem reduce-motion. Cache `ascensao-v65` / `ascensao-u-v77`. Placar: suíte inteira 35/35 arquivos verdes (`liga` oscilou 1 vez na rodada longa, caso conhecido, e passou nas 3 repetições).

- 26/11/2026 10h23 · Revisão horária · Main `4c31172` (#102); checklist da EVA (convite, idade, amigos/avatar) coberto. Achado em 390x844 com varredura de teclado (todo elemento com `role=button` que não é `<button>`, nas 5 abas): a pílula da classe no topo de Hoje ("⚔️ Mago ⇄") recebia foco, mas Enter e Espaço não faziam nada; só o toque abria a galeria. Sequência, escudo e títulos dos painéis já respondiam. Mudou: 1 linha em `tools/rpg.js` (Enter/Espaço chamam o mesmo `chgCls` do toque). Sem mudança de visual, texto, XP ou dados. Teste novo `qa/pilulas-teclado.test.js` 32/32 (8 falham no código antigo), raiz e /comecar/, com e sem reduce-motion. Cache `ascensao-v66` / `ascensao-u-v78`. Placar: suíte inteira 36/36 arquivos verdes.

- 26/11/2026 11h23 · Revisão horária · Main `7ceea81` (#104, Ascension 1.0) com suíte inteira 41/41 verde; checklist da EVA (convite, idade, amigos/avatar) coberto. Achado nas páginas públicas novas da 1.0 em 390x844: o botão principal "Instalar no celular" de /lancamento/ era branco sobre #3d8bff (contraste 3,3:1) e os links do topo e do rodapé de /lancamento/, /privacidade/ e /termos/ ("Abrir o app →", "Privacidade", "Termos de uso", "Sobre o app") tinham ~17 px de altura. Mudou: botão em #2563eb (5,2:1, mesmo brilho) e links com 44 px de área de toque; só CSS, sem mudança de texto ou dados. Teste novo `qa/paginas-1-0.test.js` 33/33 (8 falham no código antigo; também confere rolagem lateral, console e links internos 200), celular e desktop com reduce-motion. Cache `ascensao-v70` / `ascensao-u-v82`. Placar: suíte inteira 43/43 na branch sobre o #107; depois do rebase no #108, 6 arquivos relevantes verdes (paginas-1-0, esquadrao-convite, rotas, seguranca, amigos-avatar, convite).

- 26/11/2026 15h23 · Revisão horária · Main `d4d1de8` (#125); checklist da EVA (convite, idade, amigos/avatar) coberto. Achado (item #3 do diagnóstico da EVA, recado 7200114707): no Android, o "Ativar aviso diário" do cartão do Sistema baixava o `.ics`, que o Android não abre na agenda; o toque não fazia nada útil e o aviso ainda mandava "Toque em Adicionar tudo". Mudou: no Android o toque abre o Google Agenda já preenchido com 1 evento diário "[SISTEMA] Missão diária disponível" (link do app sem `#`) e o aviso diz "Toque em Salvar"; iPhone e PC seguem com o `.ics`. Só `tools/rpg.js`; sem mudança de visual, XP ou dados (mesma chave `systip`). Fica para a fase 1 do lembrete: o cartão quase nunca aparece (a tela enxuta recolhe `.tip` e o `#secZen` conta como janela aberta). Teste novo `qa/aviso-agenda.test.js` 34/34 (14 falham no código antigo), raiz e /comecar/, Android e iPhone, reduce-motion. Cache `ascensao-v78` / `ascensao-u-v90`. Placar: suíte inteira 51/51 arquivos verdes (`esquadrao-convite` caiu 1 vez com 2 testes em paralelo, erro do próprio teste ao ler o servidor simulado, e passou sozinho).

- 26/11/2026 17h23 · Revisão horária · Main `05385e2` (#131); checklist da EVA (convite, idade, amigos/avatar) coberto; `alvo` oscilou sob carga e passou sozinho (24/24). Achado (fase 1 do lembrete diário, recado da EVA 7200114707): "Ativar aviso diário" baixava 5+ eventos semanais no iPhone e não deixava escolher a hora. Mudou: abre "⏰ Quer que o Sistema te chame todo dia?" com chips 7h/12h/19h/21h/outro (pré-seleção: acordar + 30 min, senão 19h), 1 evento `FREQ=DAILY` com UID fixo `asc-diario@ascensao` (.ics no iPhone/PC, Google Agenda no Android), Esc/Agora não fecham, chips de 44px, foco no chip; também em Mais > Lembretes. Grava só horário e resposta em `asc-u-lemb`/`ascensao-lemb`, fora do progresso; nada sai do aparelho. Cache `ascensao-v82` / `ascensao-u-v94`. Placar: `qa/lembrete.test.js` 64/64 (todos falham na main antiga), `aviso-agenda` 38/38 (atualizado para o fluxo novo), suíte inteira 54/54 verde.

## 25/11/2026 · Resumo do beta no Modo Criador (PR rascunho, espera o ok do JV)

**Placar: 34/34** em `qa/painel.test.js` (Playwright, 390x844 e 1280x800 com reduce-motion, relógio simulado, planilha simulada).

Passou: contagens agregadas (repetido não conta duas vezes, datas em 4 formatos), retenção dia 2 e dia 8, % das principais, funil sem prefixo de etapa, aba `diario` opcional, nenhum apelido no resumo, nada enviado, progresso antigo intacto, sem rolagem lateral, console limpo, mensagem clara sem chave.
Suíte completa (26/11, já com a main unificada até o #98): 33/33 arquivos verdes. O teste do painel passou a gravar a semente antes da 1ª abertura (em carga, o salvamento atrasado do aparelho vazio sobrescrevia a semente; 6/6 rodadas paralelas verdes).
Cache: `ascensao-v63` (raiz). /comecar/ não mudou.

## 26/11/2026 · Coleta do beta publicada com folga na LGPD (ok do JV)

O resumo do beta (#64) e a métrica dos desafios (#69) já estavam na main pelo lançamento 1.0 (#104). Auditoria da coleta achou 3 brechas, fechadas aqui:
- Idade desconhecida (perfil sem faixa) com aceite gravado enviava funil, desafios e linha `U`. Agora nada sai sem idade conhecida, e o aceite nem aparece.
- 14-17 que aceitou antes de mudar a idade (sem autorização gravada), ou com beta ligado sem autorização, enviava. Agora só com `parent` gravado no próprio aceite.
- Nota do "Teste do app" saía de qualquer pessoa ≥ 14 sem opt-in. Agora pede o envio ligado (14-17 com autorização). O pedido de exclusão ("sair") continua saindo sempre.
**Placar:** `qa/funil.test.js` 20/20 (3 casos novos falham na main). Suíte completa: 41 arquivos verdes; 5 (amigos-avatar, relâmpago, runa, ranking-dia, sequência) falharam só com 4 testes em paralelo e passaram sozinhos, mesmo padrão da semente sobrescrita já corrigido em `painel.test.js`. Cache `ascensao-v68` / `ascensao-u-v80`.
- 26/11/2026 · Textos da 1ª sessão (pedido do JV; liberado pela ordem da noite para o trem de publicação) · Mudou só texto, por um módulo novo `tools/textos1.js` (Despertar, nome, idade, rotina, foco, aviso de jogo pronto, check-in, guia "Comece por aqui", dica da tarefa, placar do dia). Dados, XP e fluxo iguais; classes, atributos, consentimento e Modo Sistema não foram tocados. Teste novo `qa/textos1.test.js` 35/35 (390x844 e desktop, reduce-motion, dado antigo nas 2 rotas, perfil e check-in gravam igual). Achado no QA: quem já jogava e quebrou a sequência via "Seu primeiro XP"; agora vê "Bem-vindo de volta". Suíte: 22/22 arquivos verdes. Cache do SW fica para o trem de publicação.

- 26/11/2026 19h23 · Revisão horária · Main `c58acfd` (#133) com suíte inteira 56/56 verde; checklist da EVA (convite, idade, amigos/avatar) coberto. Achado (issue #140 do ATLAS, perda de dado): em Progresso > 📖 Meta de leitura, "Trocar livro", ao lado de "Terminei o livro 🎉", apagava o livro atual e as páginas dele num toque só. Mudou: pede 2 toques ("Trocar? Toque de novo", volta sozinho em 3 s, como o ✕ do Estudo); o livro largado fica guardado em `prog.read.paused` (campo novo, só adiciona; não conta como lido nem dá XP) e aparece "↩ Voltar a <livro> (pág/total)" para retomar. Só `tools/leitura.js`. Teste novo `qa/trocar-livro.test.js` 56/56 (raiz e /comecar/, 390x844, com e sem reduce-motion; 8 de 12 falham no código antigo); `arena` 37/37 nas 2 rotas. Cache `ascensao-v86` / `ascensao-u-v98`. Placar: suíte inteira 60/60 arquivos verdes sobre o #147 (Trem 14).

- 26/11/2026 20h23 · Revisão horária · Main `0668799` (#149); checklist da EVA (convite, idade, amigos/avatar) coberto. Achado (issue #137 do ATLAS): no Estudo, tarefa criada sem prazo não aparecia em 📅 Prazos, o único lugar com ✕; virava a 1ª do Hoje e não dava para apagar. Mudou: Prazos lista todas as tarefas abertas, as sem data no fim com "sem data" e o mesmo ✕ de 2 toques; sem data não pinta como prazo perto. Só `tools/estudo.js` (leitura; nada no formato do save). Teste novo `qa/estudo-sem-data.test.js` 33/33 (iPhone, Pixel, 390x844 com reduce-motion; 24 de 33 falham no código antigo). Cache `ascensao-v88` / `ascensao-u-v100`. Placar: suíte inteira 61/61 arquivos verdes (`textos1` oscilou sob carga e passou 2x sozinho).

- 26/11/2026 21h23 · Revisão horária · Main `2b3a107` (#152); checklist da EVA (convite, idade, amigos/avatar) coberto. Achado (issue #138 do ATLAS): no horário do treino só o "▶ Começar 25 min" da 1ª tarefa travava; o "Começar esta" das outras ligava o bloco de 25 min, e o botão travado tinha a mesma cara do ligado (tocava e nada). Mudou: `stStart` recusa bloco no treino e avisa "Hora do treino. Estudo volta às HH:MM."; os dois botões ficam com `aria-disabled` e opacidade .45 (continuam tocáveis para o aviso aparecer). "✓ Entreguei" e "Não consigo agora" seguem livres. Só `tools/estudo.*`; nada no formato do save. Teste novo `qa/estudo-treino.test.js` 39/39 (iPhone, Pixel, 390x844 com reduce-motion; 15 de 39 falham no código antigo); `estudo.test.js` aceita `aria-disabled` como desligado. Cache `ascensao-v89` / `ascensao-u-v101`. Placar: suíte inteira 62/62 arquivos verdes (main antes: 61/61).

- 27/11/2026 · Revisão horária · Main `efb1f9c` (#157); checklist da EVA (convite, idade, amigos/avatar) coberto. Suíte na main `461ee0f`: 64/65; caiu `qa/toque.test.js` 17/19 ("toque na borda do cabeçalho abre"), também sozinho. Causa: o aceite do painel do criador (`#tlModal`) abria por cima do cabeçalho na hora do toque; o app está certo, o teste não semeava o aceite. Mudou só o teste: grava `asc-u-tele` {asked:1} no `addInitScript` (o aceite tem teste próprio). Também reproduzi a corrida do cenário G do `push` (recado 7207141900; 83/87 com 6 núcleos ocupados), mas o #157 já tinha a mesma correção, então ficou o dele. Nada no app, sem cache novo. Placar: `toque` 19/19 sozinho e sob carga.

- 27/11/2026 · Revisão horária · Main `4d2adeb` (#158); checklist da EVA (convite, idade, amigos/avatar) coberto. Achado (issue #139 do ATLAS): no Estudo, flashcard e curso de horas complementares não tinham apagar nem editar (card com erro voltava para sempre; 300 h no lugar de 30 h somava para sempre), o Baralho limpava a cada "+ Card" e "Importar lista" destoava. Mudou: na revisão, "✎ Editar" (baralho, frente, verso; caixa e data de revisão ficam) e "✕ Apagar" com 2 toques; cada curso ganhou ✎ (nome, instituição e horas; status fica) e ✕ com 2 toques; o nome do curso ganhou linha própria (antes ficava espremido em 390 px); o Baralho guarda o último em `prog.st.cfg.deck` (campo novo, só adiciona); `#stCsv` com o estilo dos campos do Estudo. Só `tools/estudo.*`. Teste novo `qa/estudo-cards-horas.test.js` 75/75 (iPhone, Pixel, 390x844 com reduce-motion; 51 de 72 falhavam no código antigo). Cache `ascensao-v92` / `ascensao-u-v104`. Placar: suíte inteira 66/66 arquivos verdes.

- 27/11/2026 3h07 · Teste noturno · Main `62390d9` (#159), sem mudança desde a última revisão; sem recado novo da EVA na #22. Suíte inteira 66/66 arquivos verdes (2 em paralelo). Checklist da EVA: a) convite e /x/ (convite 69/69, convite-e2e 112/112, convite-foco 36/36, convite-colar 46/46, rotas) passou; b) idade em /comecar/ (funil 20/20, guia-idade 24/24, seguranca) passou; c) amigos e avatar (amigos-avatar, turmas) passou. Migração: save gravado pelo app de 25/11 (`f1f6072`) aberto na main, raiz e /comecar/: 2 chaves e 19 campos do progresso intactos (só `rpg.rew` nulo ganhou o padrão), console limpo: passou. Pages: "pages build and deployment" com sucesso na main atual. Varredura de toque em 390x844 e desktop nas 7 rotas: único achado foi o índice de /privacidade/ ("1. Quem cuida dos seus dados"... 12 links) com 26 px de altura por link. Mudou: 44 px por link, só CSS da página (fora do SW, sem cache novo). `qa/paginas-1-0.test.js` passa a cobrir o índice: 33/33 (2 falham no código antigo).

- 27/11/2026 7h23 · Revisão horária · Main `9b19d2c` (#160); checklist da EVA (convite, idade, amigos/avatar) coberto. Pedido novo da EVA na #22 (7215492777): testador abriu às 7h e a 1ª tarefa era estudo. Mudou: `tools/slot.js` dá a cada tarefa um período (manhã/tarde/noite/qualquer hora), pelo campo novo opcional `slot` ou deduzido do "Quando fazer"/título, sem regravar a config; o período atual sai da rotina (`profile.wake`/`sleep`, padrão 07:00/23:00). Hoje e `smCands()` ordenam: período atual, qualquer hora, próximos; o que já passou vai para o fim, sem "atrasada". Na 1ª hora depois de acordar o Sistema não abre com estudo/trabalho pesado. "Minhas tarefas" ganhou "Melhor período" (Automático/Manhã/Tarde/Noite/Qualquer hora). `onb.js` grava `slot` nas tarefas novas (só adiciona). Teste novo `qa/slot.test.js` 141/141 (iPhone, Pixel, 390x844 reduce-motion; raiz e /comecar/ às 7h, 13h e 21h; quebra no código antigo); `noite.test` abre a revisão pelo id (às 20h30 a "PRÓXIMA" agora é a da noite). Cache `ascensao-v93` / `ascensao-u-v105`. Placar: 67/67 arquivos .js verdes (arena oscilou 1x sob carga, 37/37 sozinho; `push-send.test.mjs` precisa do pacote `web-push`, ausente aqui). PR rascunho: espera o "pode publicar" do JV.

- 27/11/2026 8h24 · Revisão horária · Main `9b19d2c` (#160); checklist da EVA (convite, idade, amigos/avatar) coberto. Achado 1: com 3 testes em paralelo, `qa/amigos-avatar.test.js` caiu em "campos antigos intactos": o save semeado tinha virado só o check-in do dia (padrão velho goto(app)→setItem→reload, o app regravava por cima). Mudou: a semente vai para `/__seed__` (mesma origem, fora do app) e só depois o app abre, nos 3 cenários do arquivo. Achado 2: no #158 o `p.on('pageerror')` do `qa/toque.test.js` ficou colado no fim de um comentário e não rodava (erro de página passava calado nos 2 contextos); voltou para a linha própria. Só teste, nada no app, sem cache novo. Placar: `amigos-avatar` 78/78 duas vezes sob carga; `toque` 19/19.

- 27/11/2026 9h23 · Revisão horária · Main `de53957` (#163); checklist da EVA (convite, idade, amigos/avatar) coberto. Achado: suíte na main 43/45 (push-send fora): `qa/alvo.test.js` vermelho 1 em 3 rodadas (17/24, selos e título "sem toque"). Causa: o aceite do painel do criador (`#tlModal`, tools/tele.js tenta a cada 5 s) abria por cima da tela Hoje no meio da medição; não é bug do app. Mudou: o perfil de teste já nasce com `asc-u-tele` {asked:1} (mesmo padrão do #158) em `alvo`, `textos1` (flake relatado pelo ARES), `sequencia`, `liga` e `classe`, todos de /comecar/ sem assunto de beta; o aceite tem teste próprio (funil, guia-idade). Só teste, sem cache. Placar: alvo 24/24 em 4 rodadas sob carga; textos1, sequencia, liga, classe verdes; `chefe-contraste` caiu 1x na suíte ("campo antigo intacto", semente padrão velho) e passou 14/14 sozinho 2x, fica para a próxima.

- 27/11/2026 10h23 · Revisão horária · Main `1407c27` (#167); checklist da EVA (convite, idade, amigos/avatar) coberto. Tarefa: revisar e publicar o #166 do ARES (base do Desafio Forja 30: caminhada de 20 min que conta a partir de 10, "✋ Senti dor, parei" e leitura `ascForja.dia`/`nivelSubiu`). Revisão: só campos novos em `prog.forja` (`walk`, `ses[].ruim`, `ses[].dor`, `tipo:"C"`), caminhada fora da Semana forjada e da alternância A/B, dor não mexe no alvo nem oferece subir; exploração em 390x844 com reduce-motion: toques de 44 px (caminhada, cancelar, dor, minimizar), console limpo. Faltava subir o cache: `ascensao-v98` / `ascensao-u-v110`. Achado para depois (já existe na main): quando uma conquista sai junto com o XP, os dois "+XP" flutuam no mesmo ponto e ficam ilegíveis. Placar: 68/69 arquivos verdes (3 em paralelo), forja 168/168; `avisos` caiu pelo #tlModal cobrindo o clique (falta a semente `asc-u-tele`) e passou sozinho.

- 27/11/2026 11h23 · Revisão horária · Main `0a590d4` (#134); checklist da EVA (convite, idade, amigos/avatar) coberto. Suíte na main: 70/70 arquivos verdes (3 em paralelo). Tarefa: revisar e publicar o #168 do ARES (tela acesa com Wake Lock durante o treino e a caminhada da Forja; onde o navegador não tiver, nada muda). Revisão: só segura a tela com a ficha aberta no treino ou na caminhada; solta ao minimizar, na tela final e ao fechar; pedido pendente que termina com a ficha fechada é solto na hora; a volta ao app pede de novo; nenhum dado salvo muda. Com a correção desligada, 6 checks do cenário I falham. Acrescentei ao cenário I a caminhada (segura e solta) e "fechar deixa a tela livre". Faltava subir o cache: `ascensao-v100` / `ascensao-u-v112`. Placar: suíte inteira no branch 70/70 arquivos verdes; depois do merge com #171/#172: forja 190/190, push 107/107, loja-sem-sorteio 18/18.

- 27/11/2026 12h23 · Revisão horária · Main `3032858` (#173); checklist da EVA (convite, idade, amigos/avatar) coberto. Suíte na main: verde. Tarefa: revisar e publicar dois consertos do ARES na Forja. #175: dava para ganhar « Acima de Ontem » (+50 de Ouro) sem treinar, só marcando "Sim" no ajuste rápido do Desafio Forja 30; agora o bônus exige subida de verdade (`fjNivelSubiu`, entrada `forja:lv:*` desde o início do desafio). #168: treino parado por dor trocava A/B; agora o próximo repete o treino que ficou pela metade. Nenhum dado salvo muda. Com as correções desligadas, G0 (ouro) e H2 "não troca A/B" (forja) ficam vermelhos nas 2 rotas. Cache `ascensao-v101` / `ascensao-u-v113`. Achado para depois (ARES): a pílula 🪙 da Loja tem 30 px de altura (alvo de toque < 44 px). Placar: suíte inteira na main 71/71 arquivos verdes; no branch 71/71 (3 em paralelo), ouro 131/131, forja 192/192.

- 27/11/2026 13h23 · Revisão horária · Main `1662046` (#176); checklist da EVA (convite, idade, amigos/avatar) coberto. Tarefa: o achado do ARES (#22, 27/11): a pílula 🪙 da Loja no topo do Hoje aceitava toque só numa faixa de 31 px (alvo 44). Agora usa a mesma faixa invisível dos selos 🔥/🛡️/classe (`tools/ouro.css`): toque em 46 px, visual igual (30 px), sem roubar o toque dos vizinhos. `qa/alvo.test.js` ganhou o 🪙 nas 2 telas: vermelho no código antigo (`hit` 31), verde no novo (30/30). Cache `ascensao-v102` / `ascensao-u-v114`. Nenhum dado salvo muda.
