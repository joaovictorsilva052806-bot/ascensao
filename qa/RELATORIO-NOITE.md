# Relatório da noite · 26/11/2026 (ATENA)

Bom dia, JV. Conclusão primeiro: rodei o app inteiro como **usuário novo** (do convite `/x/` até fechar o 1º dia) e como **usuário no dia 3** (relógio simulado), no celular 390x844 e no desktop. Achei 15 atritos. Corrigi os 9 que eram da minha área num PR testado (#89), deixei 1 mudança de regra de XP pronta esperando você, e registrei o resto para os donos de cada área.

## 1. O que foi publicado (entregue ao trem de publicação)

| PR | O que muda | Testes | Situação |
|---|---|---|---|
| #89 Revisão noturna | 9 atritos do usuário (abaixo) + 2 testes instáveis | `qa/noite.test.js` 36/36 (no código antigo: 12 falhas e o teste do Voltar trava) + suíte inteira verde | entregue ao trem na #22 |
| #82 Textos da 1ª sessão (outra thread) | textos mais curtos | 35/35 | entregue ao trem |
| #83 Volta do dia 1 ao 3 (outra thread) | presente do dia 2 e 3, teaser e resgate | 44/44 | entregue ao trem |
| #67 Feedback dos testadores (outra thread) | Missão ativa v2, onboarding de toque, modo simples | 60/60, inclusive junto com o #82 | pronto, no trem |

Montei o trem inteiro localmente (main + #89 + #82 + #83 + #67): o app funciona junto. Dois testes de PRs diferentes brigam entre si (o do #67 espera o título antigo do #82, e o do #82 não conhece as perguntas novas do #67). Mandei o ajuste para cada thread e para a EVA na #22, e as duas threads já corrigiram: `textos1` 35/35 e `feedback` 60/60 com os dois juntos.

**As 9 correções do #89, cada uma com a base:**

1. **Madrugada sem toque morto.** Entre 0h e 5h as missões principais têm cadeado. O passo 1 do guia ("Toque em ▶") tocava no ▶ trancado e nada acontecia. Agora abre a 1ª missão liberada; se nada estiver liberado, diz a hora e abre um desafio relâmpago (+10 XP na hora). O Sistema também aponta o desafio.
   *Base:* Modelo de Comportamento de Fogg (B = Motivação × Habilidade × Gatilho: gatilho sem ação possível não vira comportamento), behaviormodel.org; heurística 1 de Nielsen (visibilidade do estado do sistema), nngroup.com/articles/ten-usability-heuristics.
2. **"⭐ Colar figurinha" cobria o "✓ Concluir missão".** O atalho de 8 s ficava por cima do botão principal da próxima missão. Agora some enquanto uma missão está aberta.
   *Base:* WCAG 2.2, critério 2.4.11 (o foco/ação não pode ficar escondido por conteúdo do próprio site); heurística 5 de Nielsen (prevenir erro).
3. **Check-in brigava com a sequência.** No dia 2 o Sistema dizia "Dia 2 seguido" enquanto o 🔥 mostrava "1 dia". Agora é "2 dias de check-in". No dia 3, o escudo dizia "Sequência salva: 1 dias. Ontem passou em branco" para quem abriu o app ontem; agora "1 dia. Ontem ficou sem tarefa".
   *Base:* heurística 4 de Nielsen (consistência); o Duolingo mostra um único número de sequência, ligado a uma ação clara (fazer a lição).
4. **"Faltam 1." virou "Falta 1."** (mensagem do Sistema depois das 20h).
   *Base:* credibilidade do texto (Stanford Web Credibility Guidelines, credibility.stanford.edu/guidelines: erros simples derrubam a confiança).
5. **Placar do dia contava check-in e conquista como tarefa.** Depois de 1 tarefa aparecia "Hoje: 3 concluída(s)" ao lado de "Concluídas (1)". Agora conta só o que você fez.
   *Base:* heurística 2 de Nielsen (falar a língua do usuário: "concluída" = tarefa feita).
6. **Criar card com área de toque de 44px.** Os campos "Pergunta/Resposta" tinham 24px e "+ Criar cards" 32px.
   *Base:* Apple Human Interface Guidelines (alvo mínimo 44x44 pt); WCAG 2.5.5.
7. **Barra de abas cortada em telas menores.** Abaixo de 390px (Android de 360px, iPhone SE/mini de 375px), "PROGRESSO" passava da aba e encostava em "AMIGOS". Agora cabe de 320px para cima.
   *Base:* 360px é a largura mais comum de Android (StatCounter, resoluções de tela móvel); Material Design: rótulo da barra de navegação não pode truncar nem encostar no vizinho.
8. **Botão Voltar do Android fechava o app.** Com uma missão ou um desafio aberto, o Voltar (ou o gesto) saía do app inteiro. Agora o 1º Voltar fecha só a folha, como num app nativo.
   *Base:* Android, guia "Navegação para trás" (developer.android.com/guide/navigation/custom-back): Voltar fecha o que está por cima antes de sair; Material Design, folhas inferiores fecham no Voltar.
9. **Marcou sem querer? "Desfazer" por 5 s.** Antes, para desmarcar, era preciso abrir "Concluídas" e achar o botão. Agora o aviso mostra "✓ nome da tarefa · Desfazer" (é o mesmo que desmarcar pela lista). De quebra, o aviso ficava no mesmo lugar do "⭐ Colar figurinha" e sumia atrás dele; agora sobe quando o atalho aparece.
   *Base:* Nielsen #3 (controle e liberdade: "saída de emergência" para o erro); Material Design, snackbar com ação "Desfazer"; o "Desfazer envio" do Gmail.

Nada de dado novo: nenhum campo salvo foi criado, renomeado ou apagado. Teste de dados antigos: nenhum campo some. O Voltar só empilha um estado no histórico do navegador, nada no progresso.

## 2. Pronto, esperando você

1. **Carência da dívida nos 3 primeiros dias (regra de XP).** Hoje quem entra às 21h e faz 1 das 2 principais acorda no dia 2 com "Dívida: −10 XP", logo acima do cartão "🎁 Presente do dia 2 · sem culpa" do #83. Mensagem dupla e punição no pior momento. O patch está pronto e testado (dia 2 sem dívida, dia 5 com): `revisao-noturna/carencia-divida-3-dias.patch` nos arquivos do projeto (3 linhas em `tools/base.html`). Ninguém perde XP; só deixa de cobrar nos 3 primeiros dias.
   *Base:* aversão à perda (Kahneman e Tversky, 1979: perda pesa cerca de 2x o ganho); Fogg, *Tiny Habits* (2019): comece pequeno e celebre, sem punição no começo. Para ligar, diga "pode publicar a carência".
2. **Coleta de dados (decisão sua, nada publicado):** #81 retenção D1/D3/D7, #64 resumo do beta, #69 métrica dos desafios. Ficam prontos; nenhum foi para o trem.

## 3. Os 3 maiores ganhos

1. **O botão principal não fica mais escondido** (antes à esquerda, depois à direita): `qa/noite/1-figurinha-cobria-concluir.png`
2. **De madrugada, o 1º toque leva a uma vitória** (antes: nada acontecia; depois: abre o desafio relâmpago): `qa/noite/2-madrugada-toque-morto.png`
3. **O Sistema parou de se contradizer no dia 2 e no dia 3**: `qa/noite/3a-checkin-vs-sequencia.png` e `qa/noite/3b-escudo-texto.png`

Menções honrosas: o Voltar do Android que fechava o app (sem print, é comportamento), a barra de abas em 360px (`qa/noite/4-abas-360px.png`) e o "Desfazer" (`qa/noite/5-desfazer.png`).

## 4. Atritos registrados para os donos (não mexi)

| Atrito | Onde | Dono | Sugestão (com base) |
|---|---|---|---|
| Depois da 1ª missão chegam 3 avisos seguidos (habilidade, check-in, marco) + 1 toast: 4 toques para voltar ao jogo | Hoje | atributos (#75) e sequência | juntar num único "resumo da vitória" (teoria da carga cognitiva, Sweller 1988; Nielsen #8, design minimalista) |
| "Liberar seu painel para o criador?" aparece no meio de uma ação (ao tocar ▶ de outra missão) | /comecar/ | painel do criador (você decide) | pedir num momento calmo, depois de fechar o dia (Apple HIG: pedir permissão no contexto, quando faz sentido) |
| No dia 1, nenhuma tarefa aparece na 1ª tela: guia, desafios e chefão vêm antes | Hoje | #67 (modo simples resolve) | uma ação clara por vez (Fogg) |
| A 1ª missão de quem faz faculdade pede para criar flashcards antes de começar, e às 21h mostra o gatilho "depois do café da manhã" | Missão ativa | #67 (pergunta "usa flashcards?") | começar pelo mínimo ("5 cards") já pronto |
| "Sugestão: 5 cards" é jargão para quem não usa Anki | Sistema | #67 / textos | dizer a ação ("revisar 5 perguntas") |
| Modo Sistema/Foco, holográfico e segurança | — | fora do meu escopo | sem achados novos nesta rodada |

## 5. O que só você pode fazer

1. Dizer "pode publicar a carência" (ou não) para a regra da dívida.
2. Decidir as coletas de dados (#81, #64, #69) e o momento do pedido "Liberar seu painel".
3. Testar no seu iPhone real: abrir o `/x/`, instalar e fazer a 1ª missão (o que a nuvem não consegue simular: instalação e vibração).

## 6. Placar

- `qa/noite.test.js`: 36/36 (celular 390x844, desktop 1280x800 com reduce-motion, madrugada, noite, dia 2, dia 3, abas de 320 a 390px, Voltar, Desfazer, dados antigos, raiz, console limpo).
- Suíte inteira (main com Trem 3 + #89): 29 de 30 arquivos verdes; o `qa/mural-servidor.test.js` falha igual na main (erro do Node, sem relação).
- Trem 3 (#91: atributos, Modo Sistema, Foco) entrou na main durante a noite. O #89 já está atualizado com ele, e a suíte continua verde.
- `qa/sequencia.test.js` falhava 2 de 3 vezes na própria main depois do Trem 3: a galeria de classes atrasa os avisos e o teste parava de ler antes do escudo. Corrigido no #89 (30/30 em 3 rodadas).
- Achado extra: `qa/alvo.test.js` falhava na main entre 0h e 5h (usava o relógio real; de madrugada a única tarefa liberada é uma extra de 2 linhas). Agora usa relógio fixo ao meio-dia: 24/24.
- Telas de 320px: sem rolagem horizontal no convite, no onboarding, em Hoje e na missão. Contraste: nenhum texto abaixo de 4,5:1 nas 5 abas, fora os dias passados da masmorra (apagados de propósito).
- Cache do service worker: não subiu no PR (sobe no trem, como #82 e #83).
