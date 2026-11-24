# Pausa Leve

[English](README.md) · **Português (Brasil)**

> Aplicação web de bem-estar estudantil focada em micro-pausas, registro leve de hábitos e sugestões de autocuidado geradas por IA, sem cobranças.

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

Estudantes em rotinas intensas de estudo, prazos e semanas de projeto frequentemente negligenciam o sono, a hidratação e pequenas pausas. Aplicativos tradicionais de hábitos costumam usar cobranças rígidas, gamificação excessiva ou promessas clínicas, o que pode aumentar a ansiedade em vez de acolher.

## Solução

O **Pausa Leve** é uma aplicação web leve e respeitosa pensada para estudantes no campus. Ele oferece um espaço livre de pressão para fazer pausas e check-ins diários, sem qualquer pretensão de atendimento clínico.

**O que o MVP cobre:**
- **Check-in Diário Rápido:** Registro simples de ânimo e energia com linguagem acolhedora e sem julgamentos.
- **Registro de Micro-pausas e Hábitos:** Marcação em um clique de pequenas ações (beber água, alongar, fazer uma pausa de 5 minutos).
- **Dicas Contextuais por IA:** Sugestões curtas e práticas adaptadas ao momento do estudante (sempre como convite gentil, nunca diagnóstico).
- **Resumo Semanal:** Visualização leve dos check-ins e pausas dos últimos 7 dias, sem notas ou rankings comparativos.
- **Lembrete Gentil na Tela:** Aviso discreto incentivando uma pausa curta durante os estudos.
- **Recursos de Apoio Profissional:** Seção sempre visível com canais reais de ajuda (ex: CVV - 188, atendimento psicopedagógico do campus), destacada automaticamente caso o estudante relate mal-estar intenso.

## Stack

- **Front-end:** React (Vite), TypeScript, Tailwind CSS
- **Back-end:** Node.js, Express, TypeScript
- **Banco de Dados:** SQLite (via Prisma ou driver nativo)
- **Integração com IA:** Google Gemini API (`gemini-2.5-flash`) com prompts de sistema restritos para segurança
- **Testes e Qualidade:** Vitest / Jest, ESLint, Prettier

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
- Uma chave de API de IA válida (configurada em `backend/.env` com base no `.env.example`)

### Back-end

```bash
cd backend
cp .env.example .env
# Adicione sua AI_API_KEY dentro do .env
npm install
npm run dev
```

### Front-end

```bash
cd frontend
npm install
npm run dev
```

## CI/CD

O repositório utiliza **GitHub Actions** (`.github/workflows/ci.yml`) disparado automaticamente a cada Pull Request e push na `main`. A pipeline valida:
1. **Lint:** Padrão de código e análise estática (`npm run lint`).
2. **Build:** Compilação TypeScript e geração do pacote (`npm run build`).
3. **Testes:** Testes automatizados unitários e de integração (`npm test`).

Pushes diretos na `main` são bloqueados; toda alteração exige Pull Request aprovado e pipeline verde.

## Deploy

Configuração de desenvolvimento local para demonstração ao vivo. O deploy automático em nuvem ainda não foi configurado.

## Links

- **Repositório:** [Adicionar URL do Repositório GitHub]
- **Deploy (se houver):** Demonstração local
- **Board / GitHub project (se houver):** [Adicionar URL do GitHub Projects]
