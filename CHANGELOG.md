# Changelog do Ascension

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versões: [SemVer](https://semver.org/lang/pt-BR/) (`MAIOR.MENOR.CORREÇÃO`).
Regra de ouro de toda versão: o progresso salvo no aparelho nunca é apagado nem renomeado.

## Forja: uma janela por vez e toque de 44 px (27/11/2026, dentro da 1.0)

### Corrigido
- No 1º treino de um jogador novo, a Galeria de classes não abre mais por cima do treino nem junto com o "Sequência iniciada": espera o Forja fechar e os avisos passarem (#135). Trocar de classe pela pílula continua na hora.
- "⚠ Quando parar" com área de toque de 44 px (#136).
- Nada novo é salvo. Caches `ascensao-v97` / `ascensao-u-v109`.

## Uma moeda só (27/11/2026, dentro da 1.0)

### Mudou
- As moedas do Baú de recompensas (10 XP = 1 moeda) viraram **Ouro**, 1 para 1, uma vez por aparelho. O Baú e a Loja usam o mesmo saldo.
- Backup do progresso antes (`*-prog-preouro`). Só adiciona `prog.ouroX.mig`; `prog.rpg.spent` e as recompensas ficam iguais. Caminho de volta: Mais > Ajustes > "Voltar o Baú para moedas". Caches `ascensao-v95` / `ascensao-u-v107`.

## Ouro, Loja e Desafio Forja 30 (27/11/2026, dentro da 1.0)

### Novo
- **Ouro** (pontuação de jogo, sem valor em dinheiro): dia com as principais feitas +10, semana sem quebrar a sequência +50, chefão +30. Teto de 200 por dia, nunca negativo, cada ganho uma vez só.
- **Loja do Ouro** (pílula 🪙 em Hoje e painel em Progresso): 3 molduras, 2 fundos de cartão, 2 títulos raros e escudo de sequência (150, até o máximo de 2). Compra em 2 toques. Texto fixo: "Ouro não vale dinheiro e não pode ser sacado."
- **Desafio Forja 30** (regras do ARES): 20 de 30 dias; vale treino do Forja/Dia ruim com 10 min de timer ou caminhada de 20 min; força até 4x por semana; 2 folgas por semana; "Senti dor, parei" conta o dia. Cumpriu: +100 e « Forjado em 30 ». Subiu 1 nível no mês: +50 e « Acima de Ontem ». Até 13 anos não vê.
- **Hall da Fama**: o do aparelho sempre; o da turma (só amigos, regras do Mural) depois de republicar o `server/mural.gs`.
- Grava só `prog.ouro`, `prog.ouroX` e `prog.f30`. Caches `ascensao-v94` / `ascensao-u-v106`.

## Estudo (26/11/2026, dentro da 1.0)

### Novo
- Estudo na aba Foco: Hoje com 3 tarefas, bloco de 25 min com pausa, prazos com alerta, flashcards com revisão espaçada, horas complementares e respeito ao horário do treino e do sono.
- Grava `prog.st` e os flashcards numa chave própria do aparelho. Caches `ascensao-v83` / `ascensao-u-v95`.

## Forja (26/11/2026, dentro da 1.0)

### Novo
- **Forja**: treino em casa, sem equipamento, que evolui sozinho. Card "🔥 Forja" em Hoje (seg/qua/sex, editável em 1 toque), Treino A/B, escada de 5 níveis por movimento e dupla progressão (8 a 12 repetições; core 20 a 45 s).
- **Dia ruim** (10 min): 1 série de cada, +20 XP e conta para a sequência.
- XP: treino +40 (1 por dia), subir de nível +30 (uma vez por nível), 3 treinos na semana +25. Segredo novo: "Aço".
- Aviso "Quando parar" antes do 1º treino e sempre no rodapé. Quests opcionais dos 4 pilares.
- Grava só `prog.forja`. Nenhum dado de corpo ou saúde é coletado. Caches `ascensao-v74` / `ascensao-u-v86`.
## [Não lançado]

### Novo
- Estudo na aba Foco: Hoje com 3 tarefas, bloco de 25 min com pausa, prazos com alerta, flashcards com revisão espaçada, horas complementares e respeito ao horário do treino e do sono.

## [1.0.0] - 2026-11-26 (lançamento, aguardando o ok do JV)

A primeira versão pública. Tudo o que os testadores ajudaram a construir no beta, com nome oficial **Ascension**.

### Para jogar
- Onboarding em modo jogo: perfil rápido e missões montadas na hora.
- Classes da vida real ou de fantasia, com sugestão do Sistema em 1 toque.
- Missões com XP e versão mínima, ranks de E a S e níveis.
- Missão ativa: ▶ abre o timer e a ferramenta certa.
- Check-in diário, sequência com escudo, marcos e "Dia perfeito".
- Chefão da semana, masmorra e baú de recompensas.
- Desafios relâmpago com contagem pelo sensor de movimento.
- Quebrar correntes.
- Temporadas ("Nova temporada" sem perder o histórico).
- Lição de 1 toque do Sistema.
- Segredos: conquistas ocultas, Terminal do Sistema e Modo Zen.

### Com os amigos (opcional)
- Convite pessoal, amigos, parabéns e cutucadas.
- Liga da semana (Ferro a Mítica) e ranking do dia.
- Esquadrão cooperativo com a anomalia da semana.
- Desafio em dupla.
- Mural da turma (14+), só para amigos confirmados, com fotos que somem em 7 dias.

### Segurança e privacidade
- Sem conta e sem senha: os dados ficam no aparelho.
- Recursos que enviam dados só com opt-in. Até 13 anos, nada sai do aparelho. De 14 a 17 anos, o Mural só com autorização do responsável.
- Mural conferido no servidor (token, amizade, limites e denúncias).
- Política de Privacidade e Termos de Uso (`/privacidade/` e `/termos/`).
- CSP em todas as páginas.

### Novo nesta versão
- Página de lançamento (`/lancamento/`).
- Tela "Novidades" da 1.0.
- Ícones em todos os tamanhos e manifest pronto para instalar e para as lojas.

### Em breve
- Atributos (8) com nível próprio e radar no card.
- Modo Sistema com Foco em dupla.
- Telas holográficas.

## [0.x] - beta (19 a 25/11/2026)
- App pessoal virou RPG da vida real, com o Sistema assistente e o beta anônimo (`/comecar/`).
- Sincronizar em um toque, editar tarefas no app, kit de IA pessoal.
- Perfis amplos (idade, escola/ENEM) e ranking seguro para menores.
- Aviso diário do Sistema, modo Criador (só no aparelho do JV).
- Correções do QA noturno e proteções contra ataques.
