# Relatório de QA (ATENA)

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
