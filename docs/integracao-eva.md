# Integração Ascension ↔ EVA (proposta)

**Conclusão:** dá para integrar sem servidor e sem custo usando só o que já existe: a planilha privada do JV. O app escreve, a EVA lê pelo conector do Google Sheets; a EVA escreve sugestões, o app lê. Nenhum dado novo de testador sai do celular.

Status: proposta de 25/11/2026. Nada aqui foi publicado; as fases 1 e 2 esperam o "pode publicar" do JV.

## Como os dados andam hoje

| Caminho | Quem | O que vai | Onde |
|---|---|---|---|
| App pessoal (`/ascensao/`) → `Code.gs` | só o JV | progresso dele (quests, XP, nível) | planilha pessoal, abas `dados` e `placar` |
| `Code.gs` → app pessoal | EVA edita | config das quests (`dados!A1`) | planilha pessoal |
| `/comecar/` → formulário | testadores que aceitaram | linhas `U` (apelido e uso) e `B` (beta anônimo) | planilha privada do painel |
| `/comecar/` → formulário | testadores ≥ 14 com opt-in (desde o #65) | linhas `A` (funil anônimo por etapa) | planilha privada do painel |
| Modo Criador ← script do painel | só o aparelho do JV (chave `#k=`) | abas `usuarios`, `funil`, `feedback` | lida na hora, nada fica salvo |

## Fase 0 · já funciona, zero código

- A EVA lê a aba **`placar`** da planilha pessoal: uma linha por dia com quests feitas, XP do dia, XP total e nível. Serve para o resumo diário dela hoje mesmo.
- A EVA já pode trocar as quests do JV editando `dados!A1` (JSON da config). O app puxa na próxima abertura.

## Fase 1 · Resumo diário para a EVA (esforço P)

Uma aba **`resumo`** na planilha pessoal, gravada pelo `Code.gs` junto com o `placar`, uma linha por dia:

`data | principais feitas/total | XP do dia | sequência | nível | missão pendente mais importante`

- Só dados do JV, só na planilha pessoal dele. Nada de testador.
- A EVA lê às 7h e às 21h e usa no plano do dia.
- Alternativa sem planilha: botão "Copiar resumo para a EVA" em Mais, que gera o mesmo texto para colar.
- Mudança: `Code.gs` (o JV cola a versão nova no Apps Script) + 1 campo novo no envio do app. Só adiciona.

## Fase 2 · Missões sugeridas pela EVA (esforço M)

A EVA escreve na aba **`sugestoes`** da planilha pessoal:

`id | título (até 80 caracteres) | XP (até 20) | válida até (AAAA-MM-DD)`

No app pessoal aparece um card "📡 Transmissão da EVA" com **Aceitar** ou **Agora não**. Aceitar vira quest extra do dia.

- No máximo 3 por dia, para não virar lista de culpa (TDAH: uma ação clara por vez).
- O app grava só um campo novo, `prog.sug = {id: "ok" | "no" | "feito"}`, e devolve isso no `placar`. A EVA vê o que pegou e ajusta.
- Texto mostrado com `textContent` (sem HTML), XP limitado no app, sugestão vencida some sozinha.
- Só no app do JV. Testadores não recebem nada da EVA.

## Fase 3 · Beta dos testadores (feito neste PR, esperando ok)

- **Resumo do beta** no Modo Criador: testadores, ativos hoje e em 7 dias, quem voltou no dia 2 e no dia 8, missões feitas e % das principais, feedbacks, funil do convite e ativos por dia.
- Só lê o que o painel já recebe. Nenhum nome no resumo. O aparelho do JV guarda só a contagem de ativos de cada dia (`ascensao-painel-hist`, 30 dias).
- **Opcional, melhora a linha "ativos por dia":** o script do painel pode devolver uma chave `diario` com `[["id","data"], [id, "AAAAMMDD"], …]` dos últimos 30 dias, tirada das linhas `U` e `B` que já chegam. Sem ela, o painel anota um ponto por dia a cada abertura.
- A EVA pode ler o mesmo resumo pela planilha privada para o 📊 de domingo. Nada disso vai para este repositório (é público).

## Regras que valem para todas as fases

1. Só adicionar campos. Nada é renomeado ou apagado; migração com backup.
2. Até 13 anos: nada sai do celular, nem anônimo. 14 a 17: só com autorização do responsável e apelido.
3. Nada de saúde, endereço, documento, foto ou contato.
4. Nenhum endereço `/exec`, chave ou id de planilha privada no repositório.

## Decisões do JV

1. **Painel do beta (este PR):** "pode publicar"?
2. ~~Funil anônimo sem opt-in~~: resolvido no #65 (só envia depois do aceite; o convite não envia nada).
3. **Fases 1 e 2:** seguir com a fase 1 primeiro (resumo), e a fase 2 (sugestões) depois de uma semana de resumo funcionando.
