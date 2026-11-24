# Decisões do projeto

[English](DECISIONS.md) · **Português (Brasil)**

Registre aqui as decisões importantes da equipe. Cada entrada deve ser curta e indicar o que foi decidido, as alternativas consideradas e o motivo da escolha.

## Template

```markdown
## [data] — [título da decisão]
- **Decisão:**
- **Alternativas consideradas:**
- **Justificativa:**
```

## 23/11/2026 — Definição do Escopo do MVP
- **Decisão:** Limitar o MVP a 6 funcionalidades principais: check-in diário de ânimo/energia, registro de pausas e hábitos em um clique (água, alongamento, pausa de 5 min), dicas gentis geradas por IA, histórico simples de 7 dias, lembrete discreto de pausa na tela e uma seção fixa de Recursos de Apoio Profissional.
- **Alternativas consideradas:** Adicionar autenticação com OAuth, pontos gamificados por ofensiva (streaks), notificações push e timer de respiração guiada já na entrega inicial.
- **Justificativa:** Com o prazo rígido de 1 semana (23/11 a 29/11), entregar um fluxo principal completo, sem bugs e bem testado é prioridade sobre uma lista longa de extras pela metade.

## 23/11/2026 — Exclusão de Pontuações Gamificadas e Recursos Clínicos
- **Decisão:** Excluir explicitamente notas comparativas de bem-estar, punições por quebra de sequência, exposição pública de humor e qualquer forma de diagnóstico psicológico ou terapia via chatbot.
- **Alternativas consideradas:** Usar uma nota de 0 a 100 para o bem-estar e um chat aberto com IA para desabafos.
- **Justificativa:** Notas e metas rígidas geram pressão por desempenho, indo contra o objetivo do produto. Um chat aberto com IA traz riscos éticos e de segurança; por isso, a IA fica restrita a sugestões curtas de micro-pausas, e estados de mal-estar intenso acionam links fixos para ajuda profissional real (ex: CVV 188, atendimento do campus).

## 23/11/2026 — Escolha da Stack Tecnológica (Front-end e Back-end)
- **Decisão:** Utilizar React (Vite + TypeScript) no front-end e Node.js (Express + TypeScript) no back-end.
- **Alternativas consideradas:** Java com Spring Boot; Python com FastAPI; HTML/JS puro.
- **Justificativa:** Padronizar o uso de TypeScript no front e no back reduz a troca de contexto, acelera a integração e permite que todos os 4 integrantes revisem PRs e contribuam nas duas camadas dentro do prazo de 7 dias.

## 23/11/2026 — Escolha do Banco de Dados
- **Decisão:** Utilizar SQLite para persistência de dados no MVP do hackathon.
- **Alternativas consideradas:** PostgreSQL via Docker; MongoDB Atlas; apenas LocalStorage no navegador.
- **Justificativa:** Usar apenas LocalStorage não demonstraria persistência real no back-end, enquanto bancos em nuvem ou containers adicionam complexidade de configuração. O SQLite oferece um banco relacional real em arquivo local, rápido de configurar, fácil de rodar na pipeline de CI e confiável para a apresentação ao vivo.

## 23/11/2026 — Travas de Segurança da IA e Estratégia de Prompt
- **Decisão:** Aplicar um prompt de sistema rígido no back-end limitando as respostas da IA a no máximo 2 frases em tom de convite opcional, combinado com uma regra determinística no código que destaca contatos de apoio profissional sempre que o menor nível de ânimo for selecionado.
- **Alternativas consideradas:** Deixar o modelo gerar conselhos mais longos livremente ou decidir sozinho quando exibir recursos de ajuda.
- **Justificativa:** Depender apenas do comportamento do LLM para encaminhamento em momentos difíceis não é seguro. Combinar restrições no prompt com gatilhos fixos na interface garante respostas previsíveis, respeitosas e seguras.
