# Pausa Leve

[English](README.md) · **Português (Brasil)**

> Aplicação web mobile-first de bem-estar estudantil para micro-pausas, registro gentil de hábitos e sugestões de autocuidado com IA, sem pressão.

## Equipe

- **Turma:** TDS — grupos integrados 6570, 6756 e 6863
- **Tech Lead:** Guilherme Ferreira
- **Líder de Apresentação:** Matheus Epifanio de Souza
- **Integrantes:**
  - Guilherme Ferreira (6570) — [GitHub](https://github.com/tusterman11)
  - Guilherme (6756) — [GitHub](https://github.com)
  - Matheus Epifanio de Souza — [GitHub](https://github.com/MatheusEpifanio017)
  - João Queiróz — [GitHub](https://github.com/joao-queiros)

## Tema / Área

Bem-estar estudantil — vida acadêmica e comunidade no campus.

## Problema

Estudantes que enfrentam rotinas intensas de estudo, prazos e semanas de projeto frequentemente negligenciam o sono, a hidratação e pausas curtas. Aplicativos genéricos de hábitos costumam depender de sequências rígidas (streaks), pontuações de desempenho ou promessas clínicas, aumentando a ansiedade em vez de oferecer apoio genuíno.

## Solução

**Pausa Leve** é uma aplicação web leve, respeitosa e mobile-first criada para estudantes. Ela oferece um espaço livre de pressão para pausar e fazer check-in, deixando explícito o tempo todo que não substitui atendimento profissional.

**O que o MVP cobre:**
- **Check-in Diário Rápido:** Avaliação simples de humor e energia com linguagem acolhedora e sem julgamentos.
- **Registro de Micro-Pausas e Hábitos:** Registro em um clique para pequenas ações (beber água, alongar, fazer uma pausa de 5 minutos).
- **Dicas Contextuais com IA:** Convites curtos e opcionais para pausas gerados via API do Claude com base no check-in, apoiados por dicas estáticas de fallback e regras rígidas de segurança.
- **Histórico Privado de 7 Dias:** Visualização isolada por dispositivo dos check-ins e pausas recentes, sem pontuações comparativas.
- **Lembrete Gentil na Tela:** Aviso discreto incentivando uma pausa curta durante sessões de estudo.
- **Seção de Apoio Profissional:** Diretório sempre visível com canais reais de apoio (como CVV - 188, SAMU 192 e acolhimento estudantil do campus), destacado automaticamente quando há relato de sofrimento intenso.

## Stack

- **Front-end:** React + Vite 5 (JavaScript, HTML e CSS)
- **Back-end:** Node.js + Express (JavaScript)
- **Banco de Dados:** SQLite via `better-sqlite3` (SQL puro)
- **Integração com IA:** API do Claude da Anthropic (`@anthropic-ai/sdk`) chamada exclusivamente no servidor, com travas de segurança e dicas estáticas de fallback
- **Testes:** Vitest 2 (front-end) e `node --test` nativo do Node (back-end)
- **CI:** GitHub Actions com `node-version: 20`

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
│   ├── db/
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
- Chave da API da Anthropic configurada em `backend/.env` (veja `backend/.env.example`)

### Back-end

```bash
cd backend
cp .env.example .env
# Adicione sua ANTHROPIC_API_KEY dentro do arquivo .env
npm install
npm run dev
```

*(Nota: O arquivo do banco SQLite e as tabelas são inicializados automaticamente via `better-sqlite3` ao iniciar o servidor.)*

### Front-end

```bash
cd frontend
npm install
npm run dev
```

## CI/CD

O repositório executa um pipeline no **GitHub Actions** (`.github/workflows/ci.yml`) a cada Pull Request e push na `main` utilizando `node-version: 20`, rodando:
1. **Instalação:** Instalação das dependências (`npm ci`).
2. **Testes (Back-end):** Testes automatizados com o executor nativo do Node (`node --test`).
3. **Testes (Front-end):** Testes unitários automatizados com Vitest 2 (`npm test`).
4. **Build:** Verificação do pacote de produção do front-end (`npm run build`).

A proteção de branch está ativada na `main`: pushes diretos são bloqueados, exigindo um Pull Request com pelo menos 1 aprovação de revisor e status verde no CI.

## Deploy

Configurado para execução local durante a demonstração ao vivo (opções de deploy: Vercel para o front-end e Render/Railway para o back-end).

## Links

- **Repositório:** [Adicionar URL do Repositório GitHub]
- **Deploy (se houver):** Demonstração em localhost
- **Quadro / GitHub Project (se houver):** [Adicionar URL do GitHub Projects]
