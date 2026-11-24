# Pausa Leve

[English](README.md) · **Português (Brasil)**

> Aplicação web responsiva (mobile-first) de bem-estar estudantil para micro-pausas, registro leve de hábitos e sugestões de autocuidado geradas por IA, sem cobranças.

## Equipe

- **Turma:** TDS — grupos mistos 6570, 6756 e 6863
- **Tech Lead:** Guilherme Ferreira
- **Líder de Apresentação:** Matheus Epifanio de Souza
- **Integrantes:**
  - Guilherme Ferreira (6570) — [GitHub](https://github.com)
  - Guilherme (6756) — [GitHub](https://github.com)
  - Matheus Epifanio de Souza — [GitHub](https://github.com)
  - João Queiróz — [GitHub](https://github.com)

## Tema / Área

Bem-estar estudantil — vida no campus e comunidade.

## Problema

Estudantes em rotinas intensas de estudo, prazos e semanas de projeto frequentemente negligenciam o sono, a hidratação e pequenas pausas. Aplicativos genéricos de hábitos costumam usar cobranças por sequência (streaks), notas de desempenho ou promessas clínicas, aumentando a ansiedade em vez de acolher.

## Solução

O **Pausa Leve** é uma aplicação web leve, respeitosa e responsiva (mobile-first) pensada para estudantes no campus. Ele oferece um espaço livre de pressão para pausar e fazer check-ins, deixando explícito que não substitui cuidado profissional.

**O que o MVP cobre:**
- **Check-in Diário Rápido:** Registro simples de ânimo e energia com linguagem acolhedora e sem julgamentos.
- **Registro de Micro-pausas e Hábitos:** Marcação em um clique para pequenas ações (beber água, alongar, fazer uma pausa de 5 minutos).
- **Dicas Contextuais por IA:** Convites curtos e opcionais de pausa gerados via Claude API a partir do check-in, com dicas de fallback e regras rígidas de segurança.
- **Histórico Privado de 7 Dias:** Visualização isolada por dispositivo dos check-ins e pausas recentes, sem notas comparativas.
- **Lembrete Gentil na Tela:** Aviso discreto incentivando uma pausa curta durante os estudos.
- **Seção de Apoio Profissional:** Diretório sempre visível com canais reais de ajuda (ex: CVV - 188, acolhimento estudantil do campus), destacado automaticamente quando um mal-estar intenso é relatado.

## Stack

- **Front-end:** React, Vite, TypeScript, Tailwind CSS
- **Back-end:** Node.js, Express, TypeScript
- **Banco de Dados:** SQLite via Prisma ORM
- **Integração com IA:** Anthropic Claude API (`@anthropic-ai/sdk`) chamada exclusivamente pelo back-end, com travas de segurança e dicas estáticas de fallback
- **Qualidade e CI:** Vitest, ESLint, Prettier, GitHub Actions

## Estrutura de pastas

```text
/
├── README.md
├── README.pt-BR.md
├── DECISIONS.md
├── DECISIONS.pt-BR.md
├── AI_LOG.md
├── AI_LOG.pt-BR.md
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── prisma/
│   ├── src/
│   └── tests/
├── frontend/
│   ├── src/
│   └── tests/
└── docs/
```

## Como executar

### Pré-requisitos

- Node.js (v20 ou superior)
- npm (v10 ou superior)
- Chave de API da Anthropic configurada em `backend/.env` (baseada em `backend/.env.example`)

### Back-end

```bash
cd backend
cp .env.example .env
# Adicione sua ANTHROPIC_API_KEY dentro do .env
npm install
npx prisma migrate dev
npm run dev
```

### Front-end

```bash
cd frontend
npm install
npm run dev
```

## CI/CD

O repositório executa uma pipeline no **GitHub Actions** (`.github/workflows/ci.yml`) em cada Pull Request e push na `main`, validando:
1. **Install:** Instalação das dependências (`npm ci`).
2. **Lint:** Formatação e análise estática de código (`npm run lint`).
3. **Test:** Testes unitários automatizados com Vitest (`npm test`).
4. **Build:** Compilação TypeScript e verificação do pacote de produção (`npm run build`).

A proteção de branch está ativa na `main`: pushes diretos são bloqueados, exigindo Pull Request com pelo menos 1 aprovação de revisor e pipeline verde.

## Deploy

Configurado para execução local durante a apresentação ao vivo (opções futuras de deploy: Vercel para o front-end e Render/Railway para o back-end).

## Links

- **Repositório:** [Adicionar URL do Repositório GitHub]
- **Deploy (se houver):** Demonstração local
- **Board / GitHub project (if any):** [Adicionar URL do GitHub Projects]
