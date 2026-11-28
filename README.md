# Ascensão

App de rotina em formato de jogo: quests diárias com XP, níveis (ranks E → S), sequência de dias, chefe da semana e conquistas. É um PWA estático (HTML, CSS e JS puros, sem build e sem dependências), hospedado no GitHub Pages.

- **App para qualquer pessoa:** https://joaovictorsilva052806-bot.github.io/ascensao/comecar/ (a tela "Monte seu jogo" gera as quests a partir da rotina)
- **Convite (só ensina a instalar):** https://joaovictorsilva052806-bot.github.io/ascensao/convite/ detecta iPhone/Android, mostra os passos e usa o botão nativo de instalar quando o navegador oferece. Aberto pelo ícone, vai direto para `/comecar/`.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | App original (config fixa em `DEFAULT_CFG`, sincroniza com Google Sheets) |
| `comecar/index.html` | Versão multiusuário. **Gerada**, não edite à mão |
| `tools/gen.py` | Gera `comecar/` a partir do `index.html` + `tools/onb.*` (perfil/onboarding) e `tools/fb.*` (sugestões) |
| `sw.js`, `comecar/sw.js` | Service worker (network-first, funciona offline). Troque o nome do cache a cada release |
| `Code.gs` | Apps Script opcional: ponte com uma planilha (GET devolve config e progresso, POST grava) |

Dados: tudo fica no `localStorage` do aparelho (`asc-u-*` na versão multiusuário). Não há servidor nem login.

Pontos de entrada no JS: `render()` desenha tudo; `toggle(quest, "full"|"min")` marca uma quest; `penalties()` calcula a dívida de quests principais; `buildCfg(perfil)` (em `tools/onb.js`) transforma o perfil em quests com gatilhos "se-então".

## Segurança

- A planilha pública (`ranking`, gid 1002) só tem apelido, XP, nível e linhas de amizade/esquadrão. Idade, uid e dados do painel ficam em abas privadas.
- Qualquer um pode postar no formulário, então o app **não confia** nas linhas: aceite de amizade (`G`) só vale se você pediu; entrada no esquadrão (`J`) só de amigo ou de quem você convidou; cutucar/parabéns (`K`) só de amigos e no máximo 5 por dia; no máximo 3 janelas de pedido por dia.
- Convite pessoal: o código fica só no link; na planilha vai `cv`+SHA-256(código|apelido), que não dá para copiar para outro apelido.
- Links `#s=` e `#c=` pedem confirmação quando já há planilha/tarefas no aparelho. A chave do painel do criador fica só no aparelho (`#k=`), nunca no repositório.
- Funil anônimo (linhas `A`, `tools/tele.js`) só com opt-in: aceite do painel ou "sim" do beta anônimo. O convite (`/convite/`, `/x/`) não envia nada. Teste: `node qa/funil.test.js`.
- Retenção (só no Modo Criador, `tools/retencao.*`): D1/D3/D7 e funil perfil → 1ª missão (`7-quest`) → fechou o dia (`8-fechou-dia`), calculados no aparelho do JV a partir das linhas `A` (id aleatório + etapa + data). Não guarda nada. O app do criador não pede o aceite para ele mesmo nem envia linhas `A`. Teste: `node qa/retencao.test.js`.
- CSP por `<meta>` (o GitHub Pages não deixa mudar cabeçalhos). Teste: `node qa/seguranca.test.js`.

## Missões de Parceiros (lendárias, 18+)

`tools/lendaria.js` e `tools/lendaria.css` (nos dois geradores): área com moldura de raridade lendária no topo da aba **Lendárias** (sem a aba, na **Foco**) e uma chamada de 1 toque em **Hoje**. A lista vem de `missoes-lendarias.json` (raiz): troque parceiro, passos ou link sem trem novo; missão incompleta ou com link que não é https não aparece; lista vazia = a área some. `"teste": true` = só o Modo Criador vê (para o JV testar antes de abrir a todos). Selo "Publicidade · parceiro" sempre visível, link com `rel="sponsored"`, só 18+ (`ad18`), +80 de Ouro uma vez por missão (`adGoldOk`), brilho desligado com reduce-motion. Grava só `prog.lend`. Teste: `node qa/lendaria.test.js`.

## Segredos

`tools/secret.js` e `tools/secret.css` (entram nos dois geradores): 25 conquistas ocultas (8 delas são piscadelas de cultura pop: só a referência, com nomes e textos nossos, sem personagens, falas ou marcas) com títulos raros, Terminal do Sistema (em Mais) para códigos e Modo Zen. Grava só `prog.sec` e `prog.secTitle`; o XP entra como `ach:<id>`. Teste: `node qa/segredos.test.js` com o servidor local ligado.

## Ideia que vale bônus

`tools/sug.js`/`sug.css` (nos dois apps, no painel Sugerir melhoria): cada ideia ganha um código `S-XXXXXXXX` que vai na mensagem do WhatsApp. Moderação no aparelho (sem link, e-mail, telefone ou número longo) e 1 ideia por dia. Para aceitar, o criador cola o código em Criador > Aceitar ideia e põe a linha (SHA-256 do código, sem nome) em `sugestoes-aceitas.json`; o app do jogador paga Ouro 1 vez (`sug:<código>`) e destrava o segredo "Arquiteto do Sistema". Crédito com apelido só 18+ e com o aceite marcado. Grava só `c`/`n` nos itens novos de `prog.feedback` e `prog.sug`. Teste: `node qa/sug.test.js`.

## Marcos da coleção

`tools/colecao.js` e `tools/colecao.css` (entram nos dois geradores, depois do baú): cada segredo, moldura e título conta para a Coleção. Aos 3, 8, 15 e 25 itens sai uma moldura exclusiva que não cai no baú (barra com "faltam N" na Coleção do baú e no prêmio do baú). Grava só ids novos em `prog.chest.frames` (lista que já existe). Teste: `node qa/colecao.test.js`.

## Sequência (estilo Duolingo)

`tools/streak.js` e `tools/streak.css` (entram nos dois geradores): escudo de sequência automático (começa com 1, +1 nos marcos de 7, 14, 30…, máx. 2), marcos comemorados (1, 3, 7…), "Dia perfeito" quando todas as principais saem, e aviso de risco depois das 18h. Grava só `prog.shield`; dia com escudo conta como descanso em `isRest()`. Teste: `node qa/sequencia.test.js`.

## Liga da semana e classe em 1 toque

`tools/league.js`/`league.css` (só no /comecar/, em cima do ranking opt-in que já existe): divisão de Ferro a Mítica que só sobe (os 3 primeiros da semana sobem, ninguém cai), pílula 🏆 com a posição em Hoje, rival mais próximo ("faltam N XP para passar Fulano"), aviso quando alguém te passa e fechamento da semana na segunda. Grava só `prog.league`. Teste: `node qa/liga.test.js`.

Escolha de classe (`openCls` em `tools/rpg.js`): na 1ª vez o Sistema sugere uma classe pela rotina (1 toque); a lista completa fica em "Ver outras" e ao trocar pelo topo. Teste: `node qa/classe.test.js`.

## Ranking do dia, sensor, avisos e dupla (etapa 2 do ranking)

- `tools/daily.js` (nos dois apps): aba **Hoje** na Turma, com o XP de hoje de cada um, **rival do dia** (quem está logo acima, também no card dos Desafios relâmpago) e a sua linha subindo quando você ganha posição (só o selo ▲ com reduce-motion). Não sai dado novo do celular: o XP de hoje dos outros é a diferença entre o XP da semana da lista pública e o que o aparelho viu ontem (sem foto de ontem, conta a partir da 1ª abertura do dia e avisa). Guarda só em `asc-u-dia` / `ascensao-dia`, fora do progresso.
- Avisos locais (só se a pessoa ligar, permissão pedida no toque): alguém te passou hoje e, às 20h, se faltar desafio. Funcionam com o app aberto ou em segundo plano; sem servidor de push, o celular pode segurar com o app fechado.
- Sensor de movimento no contador do relâmpago (`tools/zap.js`): "📳 Contar pelo movimento"; no iPhone a permissão é pedida só no toque. Sem sensor, sem sinal em 2,5 s ou sem permissão: volta para o toque.
- Desafio em dupla (`tools/duo.js`, só no /comecar/): chama um amigo ou aliado do Esquadrão para o mesmo desafio do dia pela linha `K` (`d-`, `da-`, `dk-`). Os dois fizeram: +10 XP para cada (`zap:duo:<dia>`). Grava só `prog.duo`.

Teste: `node qa/ranking-dia.test.js`.

## Estudo (aba Foco)

`tools/estudo.js` e `tools/estudo.css` (entram nos dois geradores): painel **📚 Estudo** logo abaixo do Modo foco, pensado para TDAH.

- **Hoje:** no máximo 3 tarefas. Administrativo (📌) sempre primeiro; depois prazo, peso e a tarefa mais curta. Uma em destaque com "▶ Começar 25 min", que usa o timer que já existe. No fim do bloco: "Terminei", "Avancei" (abre pausa de 5 min; 15 a cada 4 blocos) ou "Travei" (quebra em um passo de 10 min que vai para o topo). "Não consigo agora" adia 1 dia; no 2º adiamento pede o passo menor.
- **Prazos:** alerta na aba Hoje quando falta 7 dias ou menos (amarelo até 3, vermelho atrasado).
- **Flashcards:** revisão espaçada 1-3-7-14-30 dias, errou volta para 1; sessão de até 10 cards; importa `frente;verso` colado.
- **Horas complementares:** meta em horas; só "Validado" conta como cumprido.
- **Treino e sono:** nada de estudo no treino ±30 min (lê a tarefa de treino da rotina ou o ajuste), meta cai 1 bloco em dia de treino e aviso 1 h antes de dormir.

Grava só `prog.st`. XP novo: `st:t:<id>` (+10, entregue no prazo) e `st:c:<dia>` (+1 por card, até 10 por dia). Teste: `node qa/estudo.test.js`.

## Forja: treino em casa que evolui sozinho

`tools/forja.js` e `tools/forja.css` (entram nos dois geradores pelo `gen.py`): treino sem equipamento, Treino A/B alternado 3x por semana (seg/qua/sex por padrão, editável em 1 toque no card "🔥 Forja" de Hoje). Cada movimento (empurrar, puxar, ombro, perna, ponte, core) tem uma escada de 5 níveis e dupla progressão: alvo = última vez +1 repetição (8 a 12; core 20 a 45 s); bateu o topo em todas as séries, o app sugere o próximo nível (+30 XP uma vez por nível). "Dia ruim" = 1 série de cada, ~10 min, +20 XP e conta para a sequência. 3 treinos na semana = "Semana forjada" (+25); 4 semanas seguidas = segredo "Aço". Aviso de segurança genérico antes do 1º treino e sempre no rodapé ("Quando parar"). Quests opcionais dos 4 pilares (nunca principais, não geram dívida). O ▶ da quest `s_treino` abre o Forja.

Grava só `prog.forja` (`lv`, `last`, `ses`, `ok`, `dias`, `pil`, `pt`, `cur`); XP em `forja:<dia>` (1 por dia), `forja:lv:<mov>:<n>` e `forja:sem:<segunda>`. Nenhum dado de corpo, peso ou saúde é coletado. Teste: `node qa/forja.test.js`.
## Estudo (aba Foco)

`tools/estudo.js` e `tools/estudo.css` (entram nos dois geradores): painel **📚 Estudo** logo abaixo do Modo foco, pensado para TDAH.

- **Hoje:** no máximo 3 tarefas. Administrativo (📌) sempre primeiro; depois prazo, peso e a tarefa mais curta. Uma em destaque com "▶ Começar 25 min", que usa o timer que já existe. No fim do bloco: "Terminei", "Avancei" (abre pausa de 5 min; 15 a cada 4 blocos) ou "Travei" (quebra em um passo de 10 min que vai para o topo). "Não consigo agora" adia 1 dia; no 2º adiamento pede o passo menor.
- **Prazos:** alerta na aba Hoje quando falta 7 dias ou menos (amarelo até 3, vermelho atrasado).
- **Flashcards:** revisão espaçada 1-3-7-14-30 dias, errou volta para 1; sessão de até 10 cards; importa `frente;verso` colado.
- **Horas complementares:** meta em horas; só "Validado" conta como cumprido.
- **Treino e sono:** nada de estudo no treino ±30 min (lê a tarefa de treino da rotina ou o ajuste), meta cai 1 bloco em dia de treino e aviso 1 h antes de dormir.

Grava só `prog.st`. XP novo: `st:t:<id>` (+10, entregue no prazo) e `st:c:<dia>` (+1 por card, até 10 por dia). Teste: `node qa/estudo.test.js`.

## Ouro, Loja e Desafio Forja 30

`tools/ouro.js` e `tools/ouro.css` (entram nos dois geradores, no fim da cadeia). Ouro é pontuação FECHADA: não se compra, não se transfere, não vira dinheiro, não entra em sorteio.

- **Ganhos** (chave única cada, teto de 200 por dia; sem espaço, tenta de novo amanhã): dia com as principais feitas +10 (`dia:<dia>`), semana sem quebrar a sequência +50 (`sem:<segunda>`), chefão +30 (lê `ach:tb:<semana>`). Só conta o que acontece depois do 1º uso (`ouroX.t0`).
- **Loja**: molduras, fundos do cartão e títulos entram em `BX_FR`/`BX_TT`/`HR_BG` só depois de comprados (o baú nunca sorteia item da loja). Escudo de sequência respeita `ST_MAX`.
- **Desafio Forja 30**: 20 de 30 dias, 1 por data; treino do Forja com 10 min de timer (força até 4x por semana), caminhada de 20 min ou "Senti dor, parei"; 2 folgas por semana na sequência. Cumprir: +100, título e Hall da Fama. Subir 1 nível na escada no mês: +50. Até 13 anos não vê; 14-17 vê a regra de só peso do corpo.
- **Hall da turma**: ações `hall`/`hlist` no `server/mural.gs` (token, faixa, 14-17 com `par`, só amigos). Sem a republicação, mostra só o do aparelho.

- **Uma moeda só:** as moedas do Baú de recompensas viram Ouro 1 vez (saldo XP/10 menos o gasto), com backup em `*-prog-preouro` antes. Depois disso o Baú resgata com Ouro. Volta: "Voltar o Baú para moedas" em Mais > Ajustes (`orUnmerge`).

Grava só `prog.ouro` (inteiro), `prog.ouroX` (com `mig`) e `prog.f30`. Teste: `node qa/ouro.test.js`.

## Resumo do beta (Modo Criador)

`tools/painel.js` e `tools/painel.css` (só na aba Criador do app do JV, via `gen.py --root`): números agregados em cima das abas privadas que o painel já lê (testadores, ativos hoje e em 7 dias, volta no dia 2 e no dia 8, missões feitas, feedbacks, funil e ativos por dia). Colunas achadas pelo nome do cabeçalho. Não envia nada; guarda no aparelho do criador só a contagem diária em `ascensao-painel-hist`. Teste: `node qa/painel.test.js`. Integração com a EVA: `docs/integracao-eva.md`.

## Missão Criador (Modo Criador, fase 1)

`tools/cm.js` e `tools/cm.css` (só na aba Criador do app do JV, via `gen.py --root`): uma missão por semana (segunda a domingo) sobre um problema real da cidade, em 5 etapas de no máximo 1 por dia: Observar (foto ou 1-2 frases), Medir (número, unidade e fonte), Gargalo (categoria + por quê), Propor (até 400 letras, tipo e custo) e Testar (o que uma pessoa afetada disse, sem nome e com o aceite dela). Tema fixo pela semana do ano, 10 temas, troca 1x por semana. "Voltar a um problema anterior" mede de novo um problema que já fechou.

- XP `cm:<semana>:<etapa>` (20/20/30/40/60). Ouro pelo `orGive` (teto do dia): `cm:<semana>` +60 com 5/5; `cm2:<semana>` +20 se a volta teve número novo. Sem espaço no teto, tenta de novo na próxima abertura. 4 semanas completas: título `cm_t_arq`; 10: moldura `cm_f_planta` (nunca no baú).
- Grava só `prog.cm` (`wk`, `tema`, `troca`, `s`, `hist` com até 52 semanas, sem texto livre). A foto passa pelo `muShrink` (sem EXIF) e fica em `ascensao-cm-foto`, fora do progresso: nunca vai para a planilha. Ao fechar a semana vira miniatura; some depois de 8 semanas.
- Texto com telefone, e-mail, `@usuario`, CEP ou endereço é recusado. Funil anônimo `cm1`/`cm5`/`cmv2` (o aparelho do criador não envia).

Teste: `node qa/cm.test.js`.

## Reinstalação do app pessoal

Na 1ª ligação da planilha num aparelho (link `#s=` ou colar o endereço), a planilha vence e o progresso local vira backup em `ascensao-prog-prelink`. Teste: `node qa/religar.test.js`.

## Rodar local

```bash
python3 -m http.server 8000
# abra http://localhost:8000/comecar/
```

Depois de mudar `index.html` ou `tools/*`:

```bash
python3 tools/gen.py   # regenera comecar/index.html
```

## Contribuir

1. Faça um fork e uma branch.
2. Teste no tamanho de celular (DevTools, iPhone) e confira o console sem erros.
3. Não quebre dados salvos: só adicione campos novos ao progresso (`prog`), nunca renomeie ou apague os que existem.
4. Abra um Pull Request explicando o que muda e por quê.

Ideias boas para começar: notificações push, exportar o progresso em CSV, testes automatizados do `buildCfg` e da sequência de dias, e acessibilidade (leitor de tela).

## Lojas (futuro)

Hoje o app é PWA (instala pelo navegador, grátis). Para entrar nas lojas depois, sem reescrever:

- **Play Store:** empacotar como TWA (Trusted Web Activity) com o Bubblewrap ou o PWABuilder. Conta Google Play: taxa única de US$ 25.
- **App Store:** Capacitor (ou PWABuilder) gera o app iOS. Exige Mac/Xcode e conta Apple Developer: US$ 99/ano, e a Apple costuma recusar app que é só um site embrulhado.

## Cobrar com Pix (só no Criador)

`tools/pix.js` e `tools/pix.css` (só no app da raiz, aba Criador): gera o Pix copia e cola (BR Code do Banco Central, com CRC16) e o QR Code no próprio aparelho, com valor e descrição, mais a mensagem pronta para o WhatsApp. Sem servidor, sem taxa de plataforma e sem dependência (o QR é escrito à mão: byte, correção M, versões 1 a 10). Chave Pix, nome e cobranças ficam só em `ascensao-pix`, fora do progresso, e nada vai para a rede. "Recebi" e "Apagar" pedem 2 toques; o recibo sai com a data real de emissão. Teste: `node qa/pix.test.js`.

## Pedido de avaliação

`tools/aval.js` e `tools/aval.css` (nos dois apps): depois de uma conquista (missão concluída com 3+ dias de uso ou Task que paga concluída), um cartão curto pede nota de 1 a 5 e um comentário opcional. Só aparece com o Teste do app (beta anônimo) ligado, 14 a 17 com responsável e nunca até 13; nunca no 1º dia de uso, no máximo 1 vez a cada 30 dias (90 depois de avaliar) e some de vez depois de 2 "Agora não". Não dá XP, Ouro nem item (avaliação não é trocada por recompensa). A nota sai pelo canal do beta (linha `B|id|aval|data|nota|motivo|comentário`), com e-mail, link, @perfil e telefone tirados do comentário. Estado só em `asc-u-aval` / `ascensao-aval`, fora do progresso. Teste: `PORT=8002 node qa/aval.test.js`.
