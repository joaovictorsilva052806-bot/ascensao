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
- CSP por `<meta>` (o GitHub Pages não deixa mudar cabeçalhos). Teste: `node qa/seguranca.test.js`.

## Segredos

`tools/secret.js` e `tools/secret.css` (entram nos dois geradores): 17 conquistas ocultas com títulos raros, Terminal do Sistema (em Mais) para códigos e Modo Zen. Grava só `prog.sec` e `prog.secTitle`; o XP entra como `ach:<id>`. Teste: `node qa/segredos.test.js` com o servidor local ligado.

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

## Resumo do beta (Modo Criador)

`tools/painel.js` e `tools/painel.css` (só na aba Criador do app do JV, via `gen.py --root`): números agregados em cima das abas privadas que o painel já lê (testadores, ativos hoje e em 7 dias, volta no dia 2 e no dia 8, missões feitas, feedbacks, funil e ativos por dia). Colunas achadas pelo nome do cabeçalho. Não envia nada; guarda no aparelho do criador só a contagem diária em `ascensao-painel-hist`. Teste: `node qa/painel.test.js`. Integração com a EVA: `docs/integracao-eva.md`.

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
