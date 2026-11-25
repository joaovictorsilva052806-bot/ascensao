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

## Segredos

`tools/secret.js` e `tools/secret.css` (entram nos dois geradores): 17 conquistas ocultas com títulos raros, Terminal do Sistema (em Mais) para códigos e Modo Zen. Grava só `prog.sec` e `prog.secTitle`; o XP entra como `ach:<id>`. Teste: `node qa/segredos.test.js` com o servidor local ligado.

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
