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

## 24/11/2026 — Fechamento do Escopo do MVP e Exclusão de Extras
- **Decisão:** Limitar o MVP estritamente aos 6 itens obrigatórios do briefing (check-in diário, registro de pausas/hábitos, dicas geradas por IA, histórico de 7 dias, lembrete gentil na tela e seção visível de recursos de apoio), deixando todos os extras opcionais fora do escopo inicial.
- **Alternativas consideradas:** Incluir timer de respiração guiada, campo de reflexão semanal e lista personalizável de hábitos já na primeira entrega.
- **Justificativa:** Com o congelamento de código no domingo às 23h59 (cerca de 5 dias restantes), cortar escopo cedo garante um fluxo ponta a ponta completo, sem bugs e bem testado.

## 24/11/2026 — Exclusão de Notas, Sequências (Streaks) e Alegações Clínicas
- **Decisão:** Excluir explicitamente pontuações comparativas de bem-estar, punições por quebra de sequência, exposição pública de humor e qualquer diagnóstico clínico ou chat aberto de terapia.
- **Alternativas consideradas:** Criar um índice de bem-estar de 0 a 100 e um chatbot livre de apoio emocional.
- **Justificativa:** Notas e metas rígidas geram pressão por desempenho, enquanto terapia aberta via IA traz riscos éticos. O produto foca apenas em convites leves de pausa e links fixos para ajuda humana real.

## 24/11/2026 — Stack Unificada em TypeScript (React + Node.js)
- **Decisão:** Utilizar React + Vite + TypeScript + Tailwind CSS no front-end e Node.js + Express + TypeScript no back-end, estruturado como uma aplicação web responsiva (mobile-first).
- **Alternativas consideradas:** Python com FastAPI; Java com Spring Boot; aplicativos mobile nativos (React Native/Flutter).
- **Justificativa:** Manter uma única linguagem (TypeScript) no front e no back permite que os 4 integrantes contribuam nas duas camadas e revisem os PRs uns dos outros com facilidade. Uma aplicação web responsiva também é mais rápida de demonstrar e publicar sem custos de build mobile.

## 24/11/2026 — Escolha do Banco de Dados (SQLite via Prisma)
- **Decisão:** Utilizar SQLite gerenciado via Prisma ORM para persistência de dados.
- **Alternatives consideradas:** PostgreSQL no Neon/Supabase; Postgres via Docker; apenas LocalStorage no navegador.
- **Justificativa:** O SQLite não exige configuração de servidor (apenas um arquivo local), roda de forma confiável na pipeline do GitHub Actions e oferece persistência relacional real com tipagem segura via Prisma.

## 24/11/2026 — Privacidade e Identificação Mínima
- **Decisão:** Utilizar um ID anônimo gerado por dispositivo (ou cadastro simples com senha criptografada) para que cada pessoa veja apenas o próprio histórico de check-ins e pausas, sem coletar dados pessoais sensíveis.
- **Alternativas consideradas:** Login social via OAuth completo; histórico global único visível para qualquer visitante.
- **Justificativa:** O briefing destaca a privacidade e proíbe a coleta desnecessária de dados sensíveis de saúde. O isolamento por dispositivo protege o histórico mantendo o uso simples.

## 24/11/2026 — Integração de IA (Claude API) com Fallback e Camada de Segurança
- **Decisão:** Chamar a API do Claude (Anthropic) exclusivamente pelo back-end usando um prompt de sistema restrito (tom acolhedor, sugestões em vez de ordens, sem diagnósticos). Incluir uma regra determinística de segurança que pula a geração livre e destaca recursos de apoio em check-ins críticos, além de dicas escritas à mão como fallback caso a API falhe.
- **Alternativas consideradas:** Chamar a IA direto do front-end; depender apenas do prompt do modelo para lidar com momentos de crise.
- **Justificativa:** Chamadas pelo back-end protegem a chave da API, travas fixas no código garantem encaminhamento previsível para ajuda real (ex: CVV 188) e o fallback evita falhas na demo ao vivo por queda de rede ou cota.

## 24/11/2026 — Testes, Linting e Pipeline de CI/CD
- **Decisão:** Padronizar Vitest para testes unitários, ESLint + Prettier para qualidade de código e GitHub Actions executando instalação, lint, testes e build em cada PR e push na `main`.
- **Alternativas consideradas:** Apenas testes manuais; configurar o CI apenas no final da semana.
- **Justificativa:** Verificações automatizadas fazem parte dos critérios técnicos da banca e impedem que código quebrado entre na `main`.
