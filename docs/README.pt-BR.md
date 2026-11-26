# EntrePausas

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

**EntrePausas** é uma aplicação web leve, respeitosa e mobile-first criada para estudantes. Ela oferece um espaço livre de pressão para pausar e fazer check-in, deixando explícito o tempo todo que não substitui atendimento profissional. A assistente virtual do chat se chama **Interlude**.

**O que o MVP cobre:**
- **Check-in Diário Rápido:** Avaliação simples de humor e energia com linguagem acolhedora e sem julgamentos.
- **Registro de Micro-Pausas e Hábitos:** Registro em um clique para pequenas ações (beber água, alongar, fazer uma pausa de 5 minutos).
- **Conversa com IA:** Chat na aba “Conversa”, atendido pelo back-end via API do Google Gemini com um prompt fixo e acolhedor. A IA sugere pausas opcionais, não faz diagnósticos e indica apoio humano quando necessário.
- **Histórico Privado de 7 Dias:** Visualização isolada por conta dos check-ins e pausas recentes, sem pontuações comparativas.
- **Lembrete Gentil na Tela:** Aviso discreto incentivando uma pausa curta durante sessões de estudo.
- **Seção de Apoio Profissional:** Tela dedicada com canais reais de apoio (como CVV - 188, SAMU 192 e acolhimento estudantil do campus), acessível pela navegação principal.

## Status atual da implementação

- O cadastro exige confirmação de e-mail; a senha é definida ao abrir o link de confirmação. Login, recuperação de senha e sessões usam cookies `HttpOnly`, proteção CSRF e limite de tentativas.
- Check-ins, pausas, água, diário, metas, sono e rotina de estudos são associados à conta e armazenados no PostgreSQL. As consultas e alterações são limitadas ao usuário autenticado.
- Após entrar, a pessoa pode consentir em importar registros antigos de `localStorage`. A cópia local só é removida depois da importação bem-sucedida; registros sem data confiável recebem a data atual. Check-ins e pausas anônimos do antigo SQLite não são atribuídos automaticamente.
- O chat usa `POST /api/chat` e chama o Gemini quando `GEMINI_API_KEY` está configurada. As mensagens são enviadas ao Gemini para gerar respostas, mas o histórico da conversa não é persistido pelo app. Evite compartilhar dados que identifiquem alguém.
- A configuração SMTP é necessária para cadastro e recuperação de senha. O PostgreSQL e o SMTP ainda precisam ser configurados no ambiente de execução; **nenhum deploy no Render foi feito**.
- A aplicação serve o build do front pelo mesmo domínio da API em produção, necessário para o cookie de sessão atual.
- A tela de apoio e os links de contato estão implementados. A IA não é terapeuta nem serviço de emergência.

## Stack

- **Front-end:** React + Vite (JavaScript, HTML e CSS)
- **Back-end:** Node.js + Express (JavaScript)
- **Banco de Dados:** PostgreSQL via `pg` (SQL parametrizado e migração na inicialização)
- **Integração com IA:** O back-end usa a API Gemini do Google por meio do `fetch` nativo do Node nas rotas de chat e dicas. A chave é lida pelo servidor a partir do ambiente.
- **E-mail:** SMTP via Nodemailer para confirmação de conta e recuperação de senha.
- **Testes:** `node --test` no back-end e Vitest/Testing Library no front-end.
- **CI:** Não há workflow do GitHub Actions na branch de front atual.

## Estrutura de pastas

```text
/
├── .gitignore
├── .nvmrc
├── backend/
│   ├── .env.example
│   ├── auth.js
│   ├── database.js
│   ├── email.js
│   ├── wellness.js
│   ├── package.json
│   └── server.js
├── docs/
│   ├── AI_LOG.md
│   ├── AI_LOG.pt-BR.md
│   ├── BRIEFING.md
│   ├── BRIEFING.pt-BR.md
│   ├── DECISIONS.md
│   ├── DECISIONS.pt-BR.md
│   ├── README.md
│   └── README.pt-BR.md
├── frontend/
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── BottomNav.jsx
│   │   │   ├── BreaksView.jsx
│   │   │   ├── ChatView.jsx
│   │   │   ├── GardenView.jsx
│   │   │   ├── GentleReminder.jsx
│   │   │   ├── HomeView.jsx
│   │   │   ├── AuthView.jsx
│   │   │   ├── PersonalViews.jsx
│   │   │   └── SupportView.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── theme.css
│   │   ├── utils/
│   │   │   ├── appStorage.js
│   │   │   └── deviceId.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
```

## Como executar

### Pré-requisitos

- Node.js 20.12.2 (versão indicada em `.nvmrc`)
- npm (v10 ou superior)
- PostgreSQL local ou um `DATABASE_URL` acessível
- SMTP para testar cadastro e recuperação de senha
- Chave Gemini opcional para habilitar respostas de IA

### Back-end

No PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
# Edite .env: DATABASE_URL e credenciais SMTP são necessárias para criar contas.
npm ci
npm run dev
```

O servidor aplica a migração do esquema PostgreSQL ao iniciar. `GEMINI_API_KEY` pode ficar vazia se a IA não for necessária.

### Front-end

Em outro terminal:

```powershell
cd frontend
npm ci
npm run dev
```

O Vite encaminha `/api` ao servidor em `localhost:3000`.

## CI/CD

Na branch atual não há workflow do GitHub Actions. Verificações locais: `npm test`, `npm run lint` e `npm run build` dentro de `backend/` e `frontend/`.

## Deploy

O deploy ainda não foi realizado. Para publicar em um Web Service do Render:

1. Crie um PostgreSQL no Render e use a URL interna como `DATABASE_URL` do serviço web.
2. Configure `NODE_ENV=production`, `APP_BASE_URL` e `FRONTEND_ORIGIN` com a mesma origem HTTPS pública do serviço.
3. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM`. Configure `GEMINI_API_KEY` somente se quiser habilitar o chat com IA.
4. Use o comando de build `npm --prefix backend ci --omit=dev && npm --prefix frontend ci --include=dev && npm --prefix frontend run build` e o comando de início `npm --prefix backend start`. O Render fornece `PORT`; a migração PostgreSQL é executada na inicialização.
5. Teste confirmação e recuperação de senha com um endereço real antes de compartilhar o serviço. Não publique credenciais no repositório.

O front-end e a API devem permanecer no mesmo domínio para a sessão por cookie funcionar. A implantação e o teste com PostgreSQL/SMTP reais ainda estão pendentes.

## Links

- **Repositório:** [GitHub](https://github.com/tusterman11/hackaton-student-well-being)
- **Deploy:** Demonstração local
- **Quadro / projeto:** [GitHub Projects](https://github.com/users/tusterman11/projects/2)
