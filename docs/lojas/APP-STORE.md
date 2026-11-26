# Ascension na App Store: kit pronto (sem gastar)

Status em 26/11/2026: **tudo o que dá para fazer sem a conta Apple Developer está pronto neste repositório.** Nenhuma conta foi criada, nada foi pago, nada foi enviado à Apple. O plano geral (Play Store + App Store) continua em `PLANO-LOJAS.md`; este arquivo é o pacote específico do iPhone.

## 1. Resumo em 5 linhas

1. **Empacotamento:** Capacitor 8 (grátis, MIT) com o `/comecar/` **dentro** do pacote, em `nativo/`. PWABuilder descartado para iOS (abre o site por URL: alto risco de recusa pela diretriz 4.2).
2. **Prova de que compila:** o workflow `.github/workflows/ios-teste.yml` compila para o simulador num Mac do GitHub, **sem assinatura e sem conta Apple** (grátis em repositório público).
3. **Exigências da Apple já cobertas:** recursos nativos (háptico, avisos locais, compartilhar, cópia do progresso), manifesto de privacidade, "Bloquear" no Mural (1.2), textos de câmera/fotos, só iPhone e só retrato.
4. **Ficha da loja, prints 6,9" e 6,5", classificação 13+ e rótulos de privacidade:** abaixo.
5. **O que falta é só do JV:** conta Apple Developer (US$ 99/ano, depois do 1º contrato pago), aprovar textos, e-mail de contato e o nome do pacote.

## 2. Por que Capacitor e não PWABuilder

| | Capacitor (escolhido) | PWABuilder (iOS) |
|---|---|---|
| Custo | Grátis (MIT) | Grátis |
| Como roda | Arquivos do app dentro do pacote | WKWebView carregando a URL do site |
| Diretriz 4.2 (funcionalidade mínima) | Passa melhor: offline de verdade + recursos nativos | Risco alto: "site embrulhado" |
| Atualizar o app | Nova versão na loja (revisão 1-3 dias) | Automático pelo site |
| Recursos nativos | Plugins oficiais (háptico, avisos, compartilhar, armazenamento) | Limitados |
| Mexe no app web? | Não: `nativo/preparar.js` copia o `/comecar/` e só troca os links que dependem do endereço | Não |

Fontes: [Diretrizes da App Store, 4.2](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality) · [Capacitor](https://capacitorjs.com/docs).

## 3. O que está em `nativo/`

| Arquivo | Para quê |
|---|---|
| `package.json` / `package-lock.json` | Capacitor 8.6 + plugins oficiais com versão travada |
| `capacitor.config.json` | Pacote `io.github.joaovictorsilva052806.ascension` (👤 JV confirma antes do 1º envio: não muda depois), fundo `#070c17`, CapacitorHttp ligado (planilha sem CORS) |
| `preparar.js` | Monta `nativo/www` com a mesma estrutura do site (`www/comecar/`), troca os links de convite/agenda pelo site público e injeta a ponte |
| `ponte.js` | Só roda dentro do app nativo: háptico no lugar do `vibrate`, `Notification` vira aviso local, `navigator.share` vira menu nativo, cópia do progresso no armazenamento do app |
| `ios/` | Projeto Xcode gerado (SPM, sem CocoaPods): só iPhone, só retrato, pt-BR, `ITSAppUsesNonExemptEncryption=false`, ícone 1024 e abertura no visual do app, `PrivacyInfo.xcprivacy` |

**Dados (regra do app):** a cópia do progresso só restaura num aparelho **vazio** e guarda o estado anterior em `asc-copia-nativa-antes` antes de restaurar. Nada é apagado nem renomeado. Quem usa hoje pelo Safari tem outra origem: para levar o progresso para o app da loja, usa o backup que o app já tem (copiar/colar).

**Comandos (num Mac ou no GitHub):**
```
cd nativo
npm ci
npm run sync        # prepara www e copia para o iOS
npx cap open ios    # só num Mac, para rodar no simulador
```
Teste local da ponte (sem Mac): `python3 -m http.server 8000 & node qa/nativo.test.js`.

## 4. Ficha da App Store (rascunho para o JV aprovar)

**Nome** (30): `Ascension: rotina em RPG`
**Subtítulo** (30): `Missões, XP e Rank de E a S`
**Texto promocional** (170): `Sua vida real em modo RPG. Cumpra missões, derrote o chefão com a turma e suba de rank. Grátis, sem conta e sem anúncios.`
**Palavras-chave** (100, sem repetir palavras do nome/subtítulo, que a Apple já indexa):
`hábitos,foco,produtividade,tarefas,estudo,metas,gamificação,disciplina,pomodoro,treino,tdah,checkin`
(99 caracteres. "tdah" só se o JV aprovar: o app é feito pensando em TDAH, mas não é tratamento e a descrição não promete isso.)
**Categoria:** Produtividade · secundária: Estilo de vida
**Preço:** grátis, sem compras no app.
**URL de suporte:** `https://joaovictorsilva052806-bot.github.io/ascensao/lancamento/`
**Política de privacidade:** `https://joaovictorsilva052806-bot.github.io/ascensao/privacidade/`
**Direitos autorais:** `2026 João Victor Silva` (👤 confirmar a forma do nome)

**Descrição** (4.000):
```
O Sistema escolheu você.

O Ascension transforma a sua rotina em um RPG da vida real. Cada tarefa vira uma missão, cada missão dá XP, e você sobe do Rank E ao S com o Sistema te acompanhando em painéis de HUD.

⚔️ SEU JOGO PRONTO EM 1 MINUTO
Responda um perfil rápido e o Sistema monta as suas missões. Escolha uma classe: ela evolui com você.

✅ MISSÕES QUE CABEM NO DIA
• XP na hora e versão mínima: fez o mínimo, também conta.
• Toque em ▶ e o timer da missão começa.
• Foco de 25 minutos com o celular virado.
• Desafios relâmpago de 30 segundos.
• Quebrar correntes: largue um hábito um dia de cada vez.
• Forja: treino em casa, sem equipamento, que evolui sozinho.

🔥 SEQUÊNCIA QUE NÃO TE PUNE
Check-in diário, escudo de sequência e marcos comemorados. Perdeu um dia? Dá para voltar no seguinte, sem culpa.

🐉 CHEFÃO, BAÚS E CONQUISTAS SECRETAS
Cada tarefa tira vida do chefão. Abra baús, monte seu avatar e descubra conquistas escondidas.

👥 COM A TURMA (OPCIONAL)
Liga da semana, chefão em grupo, foco em dupla e parabéns entre amigos. Só aparece o seu apelido. Você pode denunciar e bloquear quem quiser.

🔒 SEUS DADOS FICAM COM VOCÊ
Sem conta, sem senha, sem anúncios. O progresso fica no seu iPhone. Nada sai do aparelho sem você ligar.

Grátis. Feito no Brasil.
```

**Notas da versão 1.0:** `Primeira versão na App Store: missões com XP, Rank de E a S, Foco de 25 min, chefão da semana, Forja, conquistas secretas e a turma com liga semanal.`

## 5. Prints

Gerados com dados de exemplo (perfil "Lucas", relógio fixo 9h41), sem nome de outra obra:

| Pasta | Tamanho | Slot da App Store |
|---|---|---|
| `screenshots/iphone/` | 1290×2796 | iPhone 6,9" (aceita 1290×2796; obrigatório) |
| `screenshots/iphone-65/` | 1284×2778 | iPhone 6,5" (só obrigatório se faltar o 6,9"; fica pronto) |

Ordem: 1 Sua rotina vira um RPG · 2 Missões curtas, XP na hora · 3 Foco de 25 minutos · 4 Evolua o seu personagem · 5 Derrotem o chefão juntos.
Refazer: `python3 -m http.server 8000 & node docs/lojas/screenshots.js && python3 docs/lojas/moldura.py`.
Como o app sai só para iPhone (`TARGETED_DEVICE_FAMILY = 1`), **não** precisa de prints de iPad.
Fonte: [Especificações de screenshots](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications).

## 6. Classificação etária: **13+**

A Apple trocou as faixas em 2025 para 4+, 9+, 13+, 16+ e 18+, com perguntas novas sobre conteúdo gerado por usuários, mensagens e controles parentais ([Apple](https://developer.apple.com/news/?id=ks775ehf), [ajuda do App Store Connect](https://developer.apple.com/help/app-store-connect/reference/age-ratings)).

Respostas sugeridas:
- Violência de desenho/fantasia: **rara/leve** (chefões em desenho, sem sangue).
- Conteúdo gerado por usuários: **sim** (Mural de fotos só entre amigos confirmados, some em 7 dias, com denúncia e bloqueio).
- Mensagens/chat: **não** (sem texto livre; só reações fixas 🔥 💪 👏 e legendas de uma lista).
- Compras no app, apostas, anúncios, conteúdo sexual, drogas, localização: **não**.
- Conteúdo de saúde: **sim, informativo** (Forja: treino geral com aviso de segurança; "Disque Saúde 136" no Quebrar correntes). Não é app médico.
- Controles parentais / verificação de idade: o app pede a **faixa de idade**; 14-17 só posta foto com "meu responsável autorizou"; até 13 não tem foto nem envio de dados.

**Por que 13+ e não 4+/9+:** com fotos entre usuários, a Apple tende a exigir pelo menos 13+, e declarar público infantil puxa as regras da categoria Kids (sem links externos, sem envio de dados). 13+ cobre os testadores de 14 a 17 anos. As proteções de menor continuam no app.

⚠️ **Brasil, ECA Digital (Lei 15.211/2025, em vigor desde 17/03/2026):** exige configurações protetivas por padrão para menores e conversa com as lojas sobre sinal de idade, e proíbe caixas de recompensa ("loot boxes") em jogos para menores ([Olhar Digital](https://olhardigital.com.br/2026/03/17/internet-e-redes-sociais/eca-digital-entra-em-vigor-nesta-terca-saiba-o-que-muda-na-internet-brasileira/), [Agência Gov](https://agenciagov.ebc.com.br/noticias/202608/eca-digital-conheca-as-regras-de-protecao-de-criancas-e-adolescentes-no-ambiente-online), [Migalhas](https://www.migalhas.com.br/depeso/459195/efeitos-praticos-do-eca-digital)). Os baús do Ascension são grátis, sem dinheiro e sem item comprável, e o padrão já é "nada sai do aparelho". Mesmo assim, **👤 vale uma leitura jurídica antes do envio** (a ATENA não é advogada). Próximo passo técnico possível no app nativo: usar a API de faixa de idade declarada da Apple para preencher a faixa sozinha.

## 7. Privacidade do app (rótulos da App Store)

Coerente com `/privacidade/` e com a coleta anônima só com opt-in:

| Tipo de dado | Coletado? | Vinculado à pessoa? | Rastreamento | Finalidade | Quando |
|---|---|---|---|---|---|
| Interações com o produto | Sim | **Não** (id aleatório, sem nome) | Não | Análise | Só com o teste anônimo ligado (18+, ou 14-17 com responsável) |
| ID de usuário (apelido do ranking) | Sim | Sim | Não | Funcionalidade do app | Só ao entrar no ranking/turma |
| Fotos | Sim | Sim | Não | Funcionalidade do app | Só no Mural, apagadas em 7 dias |
| Outro conteúdo do usuário (sugestões) | Sim | Sim | Não | Funcionalidade do app | Só se a pessoa enviar |
| Localização, contatos, saúde, financeiro, e-mail, telefone, identificadores de publicidade | **Não** | | | | |

**Rastreamento (ATT): não.** Sem SDK de terceiros, sem anúncios. O `PrivacyInfo.xcprivacy` em `nativo/ios/App/App/` declara o mesmo e o uso de `UserDefaults` (motivo CA92.1, cópia do progresso no próprio app).

Ajustes sugeridos na política (`/privacidade/`) antes do envio, para o JV aprovar: citar o app do iPhone, a cópia do progresso no armazenamento do app (fica no aparelho) e o caminho para pedir exclusão dos dados do ranking/Mural sem conta (o botão "Sair" que já existe + o e-mail).

## 8. Notas para o revisor da Apple (campo "Review Notes")

```
O Ascension não tem login: abra o app, responda o perfil de 1 minuto e as missões aparecem.
Recursos nativos: háptico ao concluir missões, avisos locais (ranking → "Me avise quando alguém me passar"), compartilhar convite pelo menu do iOS, e o progresso é guardado no aparelho.
Conteúdo de usuários: o Mural (aba Amigos) só aparece para quem entra no ranking com apelido e tem amigos confirmados. Cada foto tem Denunciar e Bloquear. Fotos somem em 7 dias. Menores de 14 não têm Mural.
Contato: ascension.app.contato@gmail.com
```

## 9. Checklist até o envio

Pronto (este PR):
- [x] Splash do iPhone ligado no app web (os PNGs existiam, mas não estavam no `<head>`)
- [x] `id` no manifest da raiz (o `/comecar/` já tinha)
- [x] Bloquear usuário no Mural (diretriz 1.2), com teste
- [x] Projeto Capacitor + ponte nativa + teste `qa/nativo.test.js`
- [x] Compilação grátis no GitHub (simulador, sem assinatura)
- [x] Manifesto de privacidade, textos de câmera/fotos, só iPhone/retrato
- [x] Prints 6,9" e 6,5" com o visual atual
- [x] Ficha, palavras-chave, classificação, rótulos de privacidade e notas ao revisor (rascunho)

Só o JV (depois do 1º contrato pago):
1. 👤 Conta Apple Developer, pessoa física (US$ 99/ano; 18+, documento e cartão).
2. 👤 Confirmar o nome do pacote e o nome do desenvolvedor que aparece na loja.
3. 👤 Aprovar ficha, política e e-mail de contato.
4. Criar a chave de API do App Store Connect e guardar como segredo do GitHub (nunca no código). Com ela, um workflow assina e manda para o TestFlight sem Mac.
5. TestFlight com os testadores atuais (até 10.000 externos, grátis) antes da revisão final.

## 10. Rumo ao top 100 (o que pesa na App Store)

1. **Avaliações cedo e boas:** pedir nota com o `SKStoreReviewController` só depois de um marco (7 dias de sequência, chefão derrotado), nunca no 1º uso. A Apple limita a 3 pedidos por ano. ([Apple: avaliações](https://developer.apple.com/app-store/ratings-and-reviews/))
2. **Palavras-chave e prints:** os 3 primeiros prints decidem o download; testar variações com o "Product Page Optimization" (grátis) depois do lançamento.
3. **Lançar numa data com público pronto:** TestFlight com a turma atual → lançamento com os convites que já existem → pico de downloads nos primeiros dias pesa no ranking da categoria Produtividade.
4. **Eventos no app (In-App Events):** a "temporada" e o chefão da semana podem virar eventos que aparecem na busca da loja, grátis.
5. **Atualizar com frequência:** o `CHANGELOG.md` já alimenta as notas de versão.
