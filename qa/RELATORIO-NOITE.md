# Relatório da noite · 26/11/2026 (ATENA)

Bom dia, JV. Resumo: testei o app inteiro como **usuário novo** (do convite `/x/` até fechar o 1º dia) e como **usuário que volta no dia 3 depois de faltar um dia** (com relógio simulado), no celular 390x844 e no desktop. Achei 18 atritos (1 deles a thread do #83 já resolveu durante a noite):

- **11 corrigidos** num PR testado, o #89.
- **1 regra de XP pronta**, esperando você: a carência da dívida, no #99.
- **6 registrados** para os donos de cada área.

Nenhum dado salvo foi apagado ou renomeado.

## 1. O que foi entregue ao trem de publicação

| PR | O que muda | Testes | Situação |
|---|---|---|---|
| #89 Revisão noturna | 11 atritos (lista abaixo) e 2 testes instáveis | `qa/noite.test.js` 45/45; suíte inteira 33 de 33 arquivos verdes (987 verificações); na tarde, com a main do 1.0: 42 de 42 (1.221) | entregue ao trem na #22, já atualizado com a main (Trens 4 a 8) |
| #82 Textos da 1ª sessão (outra thread) | textos mais curtos | 35/35 | na fila do trem |
| #83 Volta do dia 1 ao 3 (outra thread) | presente do dia 2 e do dia 3, teaser e resgate | 44/44 | na fila do trem |
| #67 Feedback dos testadores (outra thread) | Missão ativa v2, onboarding de toque, modo simples | 60/60 | na fila do trem |

Montei o trem inteiro localmente (main + #89 + #82 + #83 + #67) e tudo funciona junto. O único conflito é de texto, no `tools/gen.py`, e se resolve mantendo as duas linhas.

**As 11 correções do #89, cada uma com a fonte em que se baseia:**

1. **Madrugada sem toque morto.**
   - Antes: entre 0h e 5h as missões principais ficam trancadas, e o passo 1 do guia ("Toque em ▶") tocava no ▶ trancado. Nada acontecia.
   - Agora: o toque abre a 1ª missão liberada. Se nenhuma estiver liberada, o app diz a hora em que elas liberam e abre um desafio relâmpago (+10 XP).
   - *Base:* Modelo de Comportamento de Fogg (gatilho sem ação possível não vira comportamento), behaviormodel.org; Nielsen #1 (visibilidade do estado do sistema).
2. **"⭐ Colar figurinha" cobria o "✓ Concluir missão".** Agora o atalho some enquanto uma missão está aberta.
   - *Base:* WCAG 2.2, critério 2.4.11; Nielsen #5 (prevenir erro).
3. **Check-in e sequência se contradiziam.**
   - Dia 2: o Sistema dizia "Dia 2 seguido" enquanto o 🔥 mostrava "1 dia". Agora diz "2 dias de check-in".
   - Dia 3: o escudo dizia "1 dias. Ontem passou em branco". Agora diz "1 dia. Ontem ficou sem tarefa".
   - *Base:* Nielsen #4 (consistência); o Duolingo usa um único número de sequência.
4. **"Faltam 1." virou "Falta 1."**
   - *Base:* Stanford Web Credibility Guidelines (erros simples derrubam a confiança).
5. **Placar do dia contava check-in e conquista como tarefa.** Depois de 1 tarefa aparecia "Hoje: 3 concluída(s)". Agora conta só as tarefas.
   - *Base:* Nielsen #2 (falar a língua do usuário).
6. **Criar card com área de toque de 44px.** Antes os campos tinham 24px e o botão 32px.
   - *Base:* Apple HIG (alvo mínimo de 44 pt); WCAG 2.5.5.
7. **Barra de abas cortada abaixo de 390px.** "PROGRESSO" encostava em "AMIGOS" no Android de 360px. Agora cabe a partir de 320px.
   - *Base:* 360px é a largura de Android mais comum (StatCounter); Material Design.
8. **O Voltar do Android fechava o app.** Com uma missão aberta, agora o 1º Voltar fecha só a missão.
   - *Base:* Android, "Navegação para trás" (developer.android.com/guide/navigation/custom-back).
9. **"Desfazer" por 5 s depois de concluir.** O aviso mostra "✓ nome da tarefa · Desfazer".
   - *Base:* Nielsen #3 (controle e liberdade); snackbar do Material; "Desfazer envio" do Gmail.
10. **NOVO · Dia 1: o check-in entra sozinho.** Entre "Criar meu jogo" e a 1ª missão aparecia a janela "Você apareceu, +10 XP". Era 1 toque a mais justamente no momento mais frágil.
    - Agora o check-in é registrado do mesmo jeito (mesmo registro, mesmos +10 XP), sem janela.
    - Vale só para quem criou o jogo hoje. Do dia 2 em diante a janela volta.
    - Do `/x/` até a 1ª tarefa marcada: **de 13 para 12 toques**.
    - *Base:* Fogg (cada passo a mais derruba a Habilidade); Nielsen #8 (minimalismo).
11. **NOVO · Volta depois de faltar um dia: 1 toque para voltar, sem culpa.**
    - Antes: quem faltou ontem abria o app e passava por 3 janelas seguidas (check-in, habilidade e escudo). Depois via o ranking, o avatar e o chefe. A 1ª tarefa estava a ~1450px, quase 2 telas abaixo, e logo acima dela aparecia "Dívida: −10 XP".
    - Agora: no topo da aba Hoje aparece "👋 Que bom te ver de volta. Sem cobrança: ontem passou. Recomeçar leva 1 minuto: Abrir o caderno.", com o botão **▶ Começar agora**, que abre a 1ª missão liberada.
    - O cartão some depois da 1ª tarefa do dia. Ele não aparece para quem fez tarefa ontem, nem em dia de descanso, nem no 1º dia. Quando o presente de volta do #83 está na tela, o cartão também não aparece, para não repetir a mensagem.
    - *Base:* Fogg, *Tiny Habits* (recomeçar pelo mínimo, sem punição); recuperação de sequência sem culpa do Duolingo; enquadramento (Tversky e Kahneman, 1981): "recomeçar" em vez de "você perdeu".

Nada de dado novo: nenhum campo salvo foi criado, renomeado ou apagado. O teste de dados antigos confirma que nenhum campo some.

## 2. Pronto, esperando você

1. **#99 · Carência da dívida nos 3 primeiros dias (regra de XP).** Está separada do #89 para não travar o resto.
   - **O que muda:** de `startDate` até o 3º dia, nenhuma quest principal gera "Dívida". Do 4º dia em diante, a regra é a mesma de hoje.
   - **Por quê:** hoje, quem entra às 21h e faz 1 das 2 principais acorda no dia 2 com "Dívida: −10 XP", logo acima do "🎁 Presente do dia 2 · sem culpa" do #83. As duas mensagens se contradizem, e a punição vem no pior momento.
   - **Prós:** acaba a mensagem dupla do dia 2, e o 1º dia incompleto não vira perda. A reversão é trivial: `DEBT_GRACE=0`. Nenhum dado é gravado, porque a dívida é calculada na hora.
   - **Contras:**
     - Nos 3 primeiros dias, a dívida deixa de empurrar a pessoa a fazer todas as principais.
     - Quem está hoje no dia 2 ou 3 vê a dívida sumir e o XP subir um pouco.
     - Quem já passou do dia 3 não nota diferença.
   - **Testes:** `qa/carencia.test.js` 9/9. No código antigo, 3 falham.
   - *Base:* aversão à perda (Kahneman e Tversky, 1979); Fogg, *Tiny Habits* (2019).
   - **Para ligar:** diga "pode publicar a carência".
2. **Coleta de dados (decisão sua, nada publicado):**
   - #81 retenção D1/D3/D7: verde junto com a main atual (28/28).
   - #69 métrica dos desafios: verde junto com a main atual (7/7).
   - #64 resumo do beta: 34/34 no próprio ramo, mas **conflita com a main atual** (`tools/genroot.py`, `README.md`, `qa/RELATORIO.md`). A thread dona precisa atualizar o PR antes de publicar.
   - #65 (funil só com opt-in): já estava publicado desde ontem. Ele reduz a coleta, e `qa/funil.test.js` segue verde.

## 3. Os 3 maiores ganhos (com prints)

1. **Quem volta depois de faltar um dia recomeça com 1 toque, sem culpa.** Antes, a 1ª tela não tinha nenhuma tarefa. Print à esquerda (antes) e à direita (depois): `qa/noite/6-volta-1-toque.png`
2. **O botão principal não fica mais escondido** pela figurinha: `qa/noite/1-figurinha-cobria-concluir.png`
3. **De madrugada, o 1º toque leva a uma vitória** (antes não acontecia nada): `qa/noite/2-madrugada-toque-morto.png`

Menções honrosas:
- O Sistema parou de se contradizer no dia 2 e no dia 3: `3a-checkin-vs-sequencia.png` e `3b-escudo-texto.png`.
- A barra de abas em 360px: `4-abas-360px.png`.
- O "Desfazer": `5-desfazer.png`.
- O Voltar do Android, sem print porque é comportamento.

## 4. Atritos registrados para os donos (não mexi)

| Atrito | Dono | Sugestão (base) |
|---|---|---|
| Quem volta no dia 3 ainda passa por 3 janelas antes de ver o app (check-in, habilidade desbloqueada e escudo). Hoje elas abrem uma por vez (Trem 7), mas continuam sendo 3 toques | atributos (#75) e sequência | juntar as 3 num único "resumo da volta" (Sweller 1988, carga cognitiva; Nielsen #8) |
| ~~O "🎁 Presente do dia 2/3" do #83 ficava abaixo das tarefas (~1450px)~~ **resolvido no #83 às 5h13**: agora fica no topo (conferi junto com o #89: o cartão do presente aparece a 149px e o "Que bom te ver de volta" não repete) | #83 | — |
| A janela da galeria de classes abre logo depois de "Criar meu jogo": 1 toque antes da 1ª missão | classes/avatar (#75) | oferecer a escolha depois da 1ª missão (Fogg) |
| O olho do `/x/` leva ~5 s de animação até mostrar "Aceite a missão" | convite / holográfico | com 1 toque, pular direto para o fim |
| Depois de "Fechar o dia" às 21h, o Modo Sistema ainda sugere uma tarefa de dia | Modo Sistema | sugerir descanso |
| Na faculdade, a 1ª missão pede para criar flashcards, e "5 cards" é jargão | #67 | começar pelo mínimo, já pronto |
| "Bem-vindo de volta" (#83) no masculino para todo mundo | #83 / textos | "Que bom te ver de volta" (neutro) |

## 5. O que só você pode fazer

1. Dizer "pode publicar a carência" (#99), ou não.
2. Decidir as coletas (#81, #64 e #69) e o momento do pedido "Liberar seu painel".
3. Testar no seu iPhone real: abrir o `/x/`, instalar o app e fazer a 1ª missão. A nuvem não consegue simular a instalação nem a vibração.

## 6. Placar

- `qa/noite.test.js` 45/45. Cobre celular e desktop (com reduce-motion), madrugada, noite, dia 1, dia 2, dia 3, a volta depois de faltar, as abas de 320 a 390px, o Voltar, o Desfazer, os dados antigos e a raiz, com console limpo.
- `qa/carencia.test.js` 9/9, no #99.
- Suíte inteira do #89 com a main (Trens 4 a 8): 33 de 33 arquivos verdes (987 verificações); na tarde, com a main do 1.0: 42 de 42 (1.221).
- Corrigi 2 testes instáveis da main: `alvo` falhava entre 0h e 5h, e `sequencia` falhava 2 de 3 vezes.
- O cache do service worker não sobe no PR; ele sobe no trem.

## 7. Atualização da tarde (26/11)

- **A carência já está no ar.** Ela entrou no trem 1.0 (#104), e por isso fechei o #99. O mesmo trem publicou #81, #64 e #69. O JV confirmou que a EVA tinha permissão para levar os três.
- **O #89 está atualizado com a main do 1.0** e ganhou mais uma correção:
  12. **Galeria de classes depois da 1ª vitória.** Antes, "Quem é você neste jogo?" abria logo depois de "Criar meu jogo", e era mais uma janela entre a pessoa e a 1ª missão. Agora, no dia em que o jogo foi criado, a galeria espera a 1ª tarefa feita e os avisos da vitória fecharem, uma janela por vez. A pílula "Escolher classe" continua abrindo na hora.
      - Do `/x/` até a 1ª tarefa marcada: **de 13 para 11 toques** desde ontem à noite.
      - *Base:* Fogg (cada passo antes da 1ª ação derruba a Habilidade); engajamento gradual (Luke Wroblewski, "Gradual Engagement": pedir o perfil depois de a pessoa ver valor, como o Duolingo faz depois da 1ª lição).
- **Teste:** `qa/dialogo.test.js` (#102) agora usa um perfil que começou antes de hoje. Ele testa a janela do check-in, que no 1º dia passou a não abrir. O que o teste verifica não mudou: 56/56.
- **Mais 2 correções na tarde (#89):**
  13. **Dívida falando de recuperação, sem culpa.** Antes: "Dívida: −30 XP por quests principais não feitas. Faça todas… e a dívida de ontem é perdoada". Agora: "**Recupere 10 XP hoje**: faça todas as principais (o mínimo vale). Dívida em aberto: −30 XP." Quando não há o que recuperar hoje: "Ela sai sozinha em até 3 dias", que é exatamente o que a regra já fazia. Só o texto mudou; a regra de XP é a mesma. *Base:* efeito de enquadramento (Tversky e Kahneman, 1981): a mesma informação, dita como ganho, motiva mais do que dita como perda.
  14. **Teste instável da main corrigido de verdade.** O `qa/relampago.test.js` falhava 2 vezes em 6 também na main: o painel de desafios é refeito a cada render, e o foco que voltava para o cartão (Esc fecha o desafio) caía no fundo da página. Agora o foco é devolvido ao cartão novo. Ganha quem usa teclado ou leitor de tela, e o teste caiu para 1 falha em 16. *Base:* WCAG 2.4.3 (ordem do foco).
- **A volta depois de faltar, na área de atributos (#75):** registrei para o dono na #22, sem mexer.
- **Suíte com a main atual (#110):** 45 de 45 arquivos verdes (1.316 verificações).
