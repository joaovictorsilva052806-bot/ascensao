# Ascension nas lojas: plano para Play Store e App Store

Status: proposta para o JV aprovar. Nenhuma conta foi criada e nada foi pago ou enviado às lojas.

## Resumo

| | Play Store (Android) | App Store (iPhone) |
|---|---|---|
| Como empacotar | TWA (Trusted Web Activity) com o Bubblewrap | Capacitor com os arquivos do app dentro do pacote |
| Custo | US$ 25, uma vez só (≈ R$ 140) | US$ 99 por ano (≈ R$ 550) |
| Precisa de Mac? | Não | Não, se o build for na nuvem (GitHub Actions macOS ou Codemagic) |
| Tempo até o público | ~3 semanas (teste fechado obrigatório de 14 dias) | ~1 semana (cadastro 1-2 dias + revisão 1-3 dias) |
| Risco de recusa | Baixo | Médio: a Apple recusa "site embrulhado" (regra 4.2) |

**Recomendação:** Play Store primeiro, depois do 1º contrato pago (regra do JV: não gastar antes disso). iOS depois, quando houver os recursos nativos da seção 3.

## 1. O que só o JV pode fazer

1. **Decidir quando pagar.** Google Play US$ 25 (uma vez). Apple Developer US$ 99/ano. Os dois exigem cartão no nome dele e ter 18 anos ou mais.
2. **Criar as contas** com documento e selfie (verificação de identidade do Google e da Apple). Conta de **pessoa física** basta: aparece "João Victor Silva" como desenvolvedor. Conta de empresa exige CNPJ e D-U-N-S, então pode ficar para depois do MEI Bellardi.
3. **Guardar as chaves de assinatura.** O Bubblewrap gera uma chave de upload (`.keystore`) e uma senha. Ela fica **fora do repositório**, com backup em 2 lugares (pendrive e Google Drive pessoal). Perdeu a chave de upload: dá para trocar pelo suporte do Play, mas demora dias. No iOS, os certificados ficam na conta Apple.
4. **Aprovar os textos legais** (`/privacidade/` e `/termos/`) e informar o **e-mail de contato** público. As duas lojas exigem o link da política de privacidade.
5. **Conseguir 12 testadores** para o teste fechado do Play (obrigatório para contas pessoais novas: 12 pessoas com o app instalado por 14 dias seguidos). Os testadores atuais do app servem.
6. **Responder os questionários** de classificação etária e segurança dos dados (rascunhos prontos em `TEXTOS-LOJA.md`).

## 2. Android: TWA com Bubblewrap

O TWA abre o mesmo app do site em tela cheia, sem barra de endereço, usando o Chrome do celular. Vantagem enorme: **é o mesmo código**, cada deploy no GitHub Pages já atualiza o app da loja, e quem já usa no Chrome **continua com o mesmo progresso** (mesma origem, mesmo armazenamento).

### Pegadinha do domínio (resolver antes)
O TWA prova que o app é dono do site com o arquivo `https://<domínio>/.well-known/assetlinks.json` na **raiz do domínio**. Hoje o app está em `joaovictorsilva052806-bot.github.io/ascensao/`, e a raiz desse domínio é outro repositório. Duas saídas:

- **A (grátis):** criar o repositório `joaovictorsilva052806-bot.github.io` só com `.well-known/assetlinks.json` e um `.nojekyll`. O JV cria o repositório no GitHub e a Eva preenche.
- **B (≈ R$ 40/ano):** um domínio próprio (ex.: `ascension.app.br`) apontado para o GitHub Pages. Mais profissional e facilita ASO, mas **muda a origem**: os dados de quem usa pelo endereço antigo não passam sozinhos (precisa do backup ou de um link de migração). Fica para depois.

Recomendação: **A agora**.

### Passos (a Eva faz, menos os marcados com 👤)
1. 👤 Criar a conta Google Play Console e pagar US$ 25.
2. Rodar `npx @bubblewrap/cli init --manifest https://joaovictorsilva052806-bot.github.io/ascensao/comecar/manifest.webmanifest` na nuvem. Pacote sugerido: `io.github.joaovictorsilva052806_bot.ascension` (não dá para trocar depois).
3. 👤 Definir a senha da chave de upload e guardar o `.keystore` (passo 1.3).
4. `bubblewrap build` gera o `.aab`. Publicar o `assetlinks.json` com o SHA-256 da chave de upload **e** o da chave de assinatura do Play (aparece no Console depois do 1º upload).
5. Ficha da loja com os textos e screenshots de `docs/lojas/` e o ícone de 512 px.
6. Teste fechado com 12 testadores por 14 dias. Depois, pedir acesso à produção.

## 3. iPhone: Capacitor

> Kit pronto em `docs/lojas/APP-STORE.md` e `nativo/` (26/11/2026): projeto Capacitor, ponte nativa, compilação grátis no GitHub, ficha, prints, idade e privacidade.

A Apple **recusa** app que só abre um site (diretriz 4.2, funcionalidade mínima). Para passar:

1. **Arquivos dentro do pacote:** o Capacitor empacota o `/comecar/` em vez de carregar a URL. Atualização de conteúdo passa a exigir nova versão na loja (ou Capacitor Live Updates, depois).
2. **Recursos nativos de verdade** (os que fazem sentido para o app):
   - avisos locais confiáveis (`@capacitor/local-notifications`), que hoje o iPhone segura com o app fechado;
   - vibração/háptico no check-in e no relâmpago (`@capacitor/haptics`);
   - compartilhar convite e card pelo menu nativo (`@capacitor/share`).
3. **Dados:** no iOS, o `localStorage` do WebView pode ser apagado pelo sistema quando falta espaço. Antes de publicar, espelhar o progresso no `@capacitor/preferences` (com backup antes, regra do app).
4. **Conteúdo gerado por usuários (Mural):** a regra 1.2 da Apple exige filtro, denúncia, **bloquear usuário** e contato publicado. Denúncia e moderação já existem. **Falta "bloquear usuário"**: criar antes de mandar para a Apple.
5. **Build sem Mac:** GitHub Actions com `macos-latest` (grátis em repositório público) ou Codemagic (plano grátis). 👤 O JV conecta a conta Apple ao serviço de build com uma chave de API do App Store Connect.
6. 👤 Conta Apple Developer (US$ 99/ano), questionário de idade e rótulos de privacidade ("Dados não coletados" na maior parte, ver `TEXTOS-LOJA.md`).

## 4. Idade nas lojas (decisão do JV)

O app aceita menores de 14 (só no aparelho). Nas lojas, declarar público "crianças" ativa regras extras (Programa Famílias do Google e categoria Kids da Apple). **Recomendação:** público-alvo **13+** nas duas lojas, sem marketing para crianças, mantendo as proteções que já existem no app. Classificação esperada: **12 anos** no Google (classificação indicativa do Brasil) e **13+** na Apple, porque há interação entre usuários e fotos.

## 5. Checklist antes de enviar a qualquer loja

- [ ] Política de privacidade e Termos aprovados e publicados, com e-mail de contato
- [ ] Ícones e manifest 1.0 no ar (PR de ícones)
- [ ] Tela "Novidades da 1.0" no ar
- [ ] Sem erros de console nas rotas (`node qa/rotas.test.js`)
- [x] Bloquear usuário no Mural (obrigatório só para iOS)
- [ ] Questionários de idade e segurança dos dados respondidos
- [x] Screenshots: `docs/lojas/screenshots/android` (1080×1920), `iphone` (1290×2796, slot 6,9") e `iphone-65` (1284×2778, 6,5")

## 6. Rumo ao top 100

1. **Nota alta cedo:** pedir avaliação só depois de um marco bom (7 dias de sequência, chefão derrotado), nunca no 1º uso. No Play, API de In-App Review.
2. **Palavras certas** no título e na descrição curta: "rotina", "hábitos", "RPG", "foco", "produtividade".
3. **Atualizações frequentes** com notas de versão (o `CHANGELOG.md` alimenta a tela Novidades e a loja).
4. **Convite como motor:** o link de convite e o card do jogador já existem. Medir quantos convites viram instalação (funil anônimo, opt-in).
5. **Categoria:** Produtividade (menos concorrida que Saúde e fitness para esse tipo de app).
