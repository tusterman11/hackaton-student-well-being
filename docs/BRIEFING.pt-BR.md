# Briefing do tema: Bem-estar estudantil

[English](BRIEFING.md) · **Português (Brasil)**

**Hack com IA: Codando com Inteligência**  
Senac na Prática · Técnico em Desenvolvimento de Sistemas  
Área: vida no campus e comunidade  
Imersão de 23/11 a 29/11 · apresentações em 30/11 e 01/12

Este briefing é o ponto de partida do **seu** tema. Leiam com calma, recortem um MVP que caiba em uma semana e registrem as decisões. Vocês vão transformar este problema em um produto real, com front-end e back-end, repositório organizado e uso documentado de IA. Esta é uma imersão colaborativa: a banca avalia o que o time construiu, decidiu e aprendeu.

## Tema e contexto

**Bem-estar estudantil** — App de hábitos, pausas e saúde mental para estudantes, com dicas geradas por IA.

A rotina de quem estuda — e, nesta semana, de quem também constrói um produto no prazo — aperta o sono, reduz as pausas e deixa pouco espaço para notar o próprio cansaço. Aplicativos genéricos de hábito às vezes pesam a mão, soam como cobrança ou prometem o que não podem cumprir. O que cabe aqui é um apoio leve, respeitoso e honesto: lembrar de pausar, registrar um check-in simples e receber uma dica útil, sem se passar por atendimento clínico.

Vocês vão desenhar essa experiência para estudantes do campus, com cuidado redobrado com linguagem, dados e limites do que a IA pode sugerir.

## Público e personas

- **Estudante em uma semana intensa:** precisa de pausas curtas e lembretes gentis, não de mais uma meta impossível.
- **Estudante que quer construir um hábito pequeno:** beber água, alongar, encerrar o dia em um horário razoável.
- **Qualquer pessoa do time que for usar a demo:** deve encontrar um tom acolhedor e um caminho claro para ajuda profissional, se precisar.

## Objetivo

Entregar um MVP em que o estudante faz um check-in simples, registra pausas ou hábitos, recebe dicas geradas por IA adequadas àquele momento, e encontra orientação para buscar ajuda real — deixando explícito que o app não substitui cuidado profissional.

## Requisitos mínimos (MVP)

O recorte abaixo é realista para uma semana. Fechem-no no primeiro dia e registrem no `DECISIONS.md` o que entra, o que fica de fora e por quê. É melhor um fluxo completo e demonstrável do que uma lista longa pela metade.

1. Um check-in rápido do dia (por exemplo, ânimo ou energia em uma escala simples), com linguagem cuidadosa.
2. Registrar pausas ou hábitos cumpridos (água, alongamento, pausa de alguns minutos).
3. Receber dicas geradas por IA a partir do check-in, sempre como sugestão, nunca como diagnóstico.
4. Ver um histórico simples da semana (check-ins e pausas).
5. Um lembrete gentil, na própria aplicação, para fazer uma pausa.
6. Uma seção visível de recursos de apoio (orientação genérica para buscar ajuda profissional), que não tenta “tratar” a pessoa.

## Onde a IA entra

O uso de IA é liberado e incentivado — no produto e no processo — e precisa aparecer no `AI_LOG.md`. Algumas frentes concretas neste tema:

- Gerar dicas curtas, variadas e respeitosas, alinhadas ao check-in do dia.
- Evitar tom de cobrança ou de promessa milagrosa; o texto deve parecer um convite, não uma ordem.
- Sugerir uma pausa concreta e de curta duração, adequada a um intervalo no campus.
- Encaminhar para os recursos de apoio quando o check-in indicar um momento mais difícil — sem tentar conduzir um atendimento.

Não publiquem, sem revisão de vocês, um texto ou uma decisão automática da IA como se já fosse a versão final.

## Extras opcionais

Só depois que o MVP estiver em pé. São ideias, não obrigações:

- Um timer simples de respiração ou de pausa guiada de um minuto.
- Uma reflexão curta no fim da semana, escrita pela própria pessoa.
- Escolher quais hábitos acompanhar, em uma lista pequena.
- Modo silencioso, para quem não quer lembretes naquele dia.

## Fora de escopo

Para proteger o prazo e o foco do produto:

- Diagnóstico, terapia, prescrição ou qualquer pretensão de cuidado clínico.
- Substituir um serviço de emergência ou um canal oficial de crise.
- Coletar dados sensíveis de saúde além do que o MVP realmente precisa, ou expor o humor da pessoa em uma área pública.
- Uma pontuação de bem-estar que pressione o estudante ou compare pessoas entre si.

## Perguntas para guiar o time

Usem estas perguntas no primeiro dia, ao definir o MVP, e de novo antes da demo:

- Como vocês garantem que uma dica não seja genérica, nem potencialmente inadequada?
- O que a interface faz se a pessoa indicar um mal-estar mais intenso? (Mostrem recursos de ajuda; não tentem atender.)
- Quem pode ver o histórico de check-ins, e como esses dados ficam protegidos?
- Como o tom da IA é revisado pelo time antes de ir para a demo?
- Como o produto deixa explícito, o tempo todo, o limite do que ele é e do que ele não é?

## Entregáveis e como a banca avalia

Esta é uma **imersão colaborativa** de uma semana, com times de 3 ou 4 estudantes do TDS. A banca avalia o trabalho de **vocês**, no próprio projeto — um retorno formativo, não uma comparação com outros times.

**O que precisa estar pronto no repositório** (raiz), em **inglês** (versão principal) e em **português** (`.pt-BR`), com o link entre os idiomas no topo de cada arquivo:

- `README.md` e `README.pt-BR.md`
- `DECISIONS.md` e `DECISIONS.pt-BR.md`
- `AI_LOG.md` e `AI_LOG.pt-BR.md`

A aplicação precisa ter **front-end e back-end**. O back-end pode ser **Java**, **Python** ou **Node.js** (isolados ou combinados, desde que integrados). O front-end é obrigatório (web, desktop ou mobile). Justifiquem a stack no `DECISIONS.md`. Também são obrigatórios o histórico com Conventional Commits, o trabalho via Pull Request com revisão, a proteção da `main` e uma pipeline de **GitHub Actions** verde (build, lint e testes) em PRs e na `main`. Não commitem segredos. No primeiro dia, adicionem o professor como colaborador: **adrianoanschau@gmail.com**.

O **congelamento do código** é no domingo, **29/11, às 23h59**. As apresentações são em **15 minutos + 5 minutos de perguntas**, nos dias 30/11 e 01/12, no Senac de Canoas, Sala 103. Ensaiem a demo e o roteiro (problema e solução, demo ao vivo, fluxo de trabalho, decisões, IA na prática e CI/CD).

A avaliação tem **duas bancas, com o mesmo peso**:

- **Banca Técnica (50%):** qualidade de código e arquitetura; Git, Conventional Commits e PRs; CI/CD; domínio do código nas perguntas.
- **Banca de Inovação e Impacto (50%):** originalidade; impacto (o problema real e para quem); experiência do usuário; clareza do pitch; uso criativo da IA.

Qualquer pessoa do time pode ser perguntada sobre qualquer parte do projeto. Usem a IA com inteligência, registrem o que ela gerou e o que vocês corrigiram, e assumam o código que forem apresentar.

Bom trabalho — e que a semana seja intensa, colaborativa e bem documentada.

