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
- **Registro de Micro-Pausas:** Registro em um clique para pequenas ações, como alongar ou fazer uma pausa curta.
- **Conversa com IA:** Chat na aba “Conversa”, atendido pelo back-end via API do Google Gemini com um prompt fixo e acolhedor. A IA sugere pausas opcionais, não faz diagnósticos e indica apoio humano quando necessário.
- **Histórico Privado de 7 Dias:** Visualização por conta dos check-ins e pausas recentes, sem pontuações comparativas.
- **Lembrete Gentil Manual na Tela:** Um aviso discreto pode ser aberto pela tela inicial; ele não aparece automaticamente.
- **Seção de Recursos de Apoio:** Tela dedicada com recursos reais (CVV 188, SAMU 192 e acolhimento estudantil do campus). Os links telefônicos `tel:` dependem de uma ação da pessoa e do aplicativo de chamadas disponível no dispositivo; não fazem ligações automaticamente.

## Status atual da implementação

- **Contas:** Cadastro aberto por e-mail, confirmação do endereço, login com senha, logout e recuperação de senha estão implementados. Cadastro e recuperação precisam de SMTP configurado. Cada conta é separada pelo identificador autenticado no servidor.
- **Persistência no PostgreSQL:** Check-ins, pausas, metas/hábitos, água, sono e configurações ficam no PostgreSQL, sempre associados à conta. O servidor aplica as migrações ao iniciar. Registros antigos de Diário e Estudos permanecem arquivados no banco, mas não são exibidos, alterados ou incluídos na importação. Em produção, `DATABASE_URL` deve apontar para o PostgreSQL persistente do Render.
- **Importação local:** No primeiro acesso à conta, o app oferece importar metas/hábitos, registros de água e sono compatíveis do `localStorage`. A cópia desses registros só é removida após a importação concluir. Dados antigos de Diário e Estudos não são importados nem apagados e ficam arquivados no navegador.
- **Conversa:** `POST /api/chat` usa Gemini quando `GEMINI_API_KEY` está configurada. O histórico individual da conta é salvo no PostgreSQL e volta a aparecer após o login. A pessoa pode apagar a conversa. O Gemini recebe a mensagem atual, mensagens recentes e um resumo numérico dos últimos sete dias sobre check-ins, pausas, água e sono.
- **Privacidade:** A chave do Gemini fica no servidor. A tela da conversa informa o que é salvo e qual resumo é enviado ao Gemini. Evite incluir dados que identifiquem alguém no chat.
- **Conta demo:** `DEMO_ACCOUNT_ENABLED=true` habilita uma conta demonstrativa compartilhada. Use somente dados fictícios; o cadastro normal é aberto e não exige lista de autorização. Desative a conta demo para uso público se ela não for mais necessária.
- **Desenvolvimento local:** A raiz do back-end redireciona `http://localhost:3000` para o Vite em `http://localhost:5173`; o Vite encaminha `/api` ao back-end. Em produção, o Express serve `frontend/dist`.
- **Apoio e lembretes:** Os links para CVV 188 e SAMU 192 usam `tel:` e só iniciam o fluxo de chamada após uma ação da pessoa. A chamada depende de um aplicativo compatível no dispositivo; o app não liga nem aciona serviços de emergência automaticamente. O lembrete pode ser aberto manualmente; o temporizador automático de 45 a 60 minutos ainda não foi implementado. A assistente não é profissional de saúde nem serviço de emergência.
- **Verificação de serviços externos:** O envio real por SMTP, uma chamada ao Gemini com chave válida e a implantação de produção no Render/PostgreSQL ainda precisam ser verificados com credenciais e ambiente reais.
- **Escopo simplificado para apresentação:** Diário e Estudos continuam fora da interface e das rotas ativas. A aba Metas permite criar objetivos pessoais, registrar a conclusão diária e acompanhar o progresso sem rankings ou cobranças.

## Stack

- **Front-end:** React + Vite (JavaScript, HTML e CSS)
- **Back-end:** Node.js + Express (JavaScript)
- **Banco de Dados:** PostgreSQL via `pg` (SQL puro e migrações na inicialização)
- **Autenticação e e-mail:** Sessões por conta usam cookies `HttpOnly` e proteção CSRF. O Nodemailer envia confirmações e redefinições por qualquer servidor SMTP.
- **Integração com IA:** O back-end chama a API Gemini do Google; a chave é lida do ambiente do servidor.
- **Runtime:** Node.js `20.12.2` (definido em `.nvmrc`; o back-end exige `>=20.12.0`)
- **Ferramentas do front-end:** Vite `^5.4.10` (lockfile resolve `5.4.21`), Vitest `^2.1.9` (lockfile resolve `2.1.9`), React `18.3.1` e jsdom `26.1.0`.
- **Testes e CI:** O back-end usa `node --test`; o front-end usa Vitest e Testing Library. `.github/workflows/ci.yml` executa lint, testes e builds dos dois pacotes em pull requests e pushes para `main`.
- **Última verificação local (27/11/2026):** Back-end: 11/11 testes, lint e build passaram. Front-end: 13/13 testes, lint e build passaram após instalar pelo lockfile com `npm ci`.
- **CI:** `.github/workflows/ci.yml` executa lint, testes e builds dos dois pacotes em pull requests e pushes na `main`.

## Estrutura de pastas

```text
/
├── .gitignore
├── .nvmrc
├── backend/
│   ├── .env.example
│   ├── eslint.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── server.test.js
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
│   │   │   └── SupportView.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── theme.css
│   │   ├── utils/
│   │   │   └── deviceId.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
```

## Como executar

### Pré-requisitos

- Node.js `20.12.2` (use a versão indicada em `.nvmrc`)
- npm compatível com Node.js 20.12.2
- PostgreSQL e uma `DATABASE_URL`
- Credenciais SMTP para habilitar cadastro por e-mail e recuperação de senha
- Chave Gemini para respostas de IA (opcional para o restante do app)

### Back-end

```bash
cd backend
cp .env.example .env
# Configure DATABASE_URL, APP_BASE_URL, FRONTEND_ORIGIN e SMTP no .env.
# GEMINI_API_KEY é necessária apenas para habilitar respostas com IA.
npm ci
npm run dev
```

O servidor aplica as migrações do PostgreSQL ao iniciar. No desenvolvimento local, use um banco PostgreSQL local e defina `APP_BASE_URL` e `FRONTEND_ORIGIN` como `http://localhost:5173`.

### Front-end

```bash
cd frontend
npm ci
npm run dev
```

Abra `http://localhost:5173`. O servidor de desenvolvimento do Vite encaminha as requisições `/api` para `localhost:3000`.

## CI/CD

O repositório tem um workflow funcional do GitHub Actions em [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). Ele roda em pull requests e pushes na `main`, com jobs separados para back-end e front-end: `npm ci`, lint, testes e build.

O workflow usa Node 20 e executa os scripts de lint, teste e build dos dois pacotes. A versão local do Node está fixada separadamente em `.nvmrc` como `20.12.2`.

## Deploy

### Deploy no Render

Use um Node Web Service para executar o back-end e servir o front compilado, junto de um PostgreSQL do Render. Comando de build: `npm --prefix backend ci --omit=dev && npm --prefix frontend ci --include=dev && npm --prefix frontend run build`. Comando de início: `npm --prefix backend start`. Configure `NODE_ENV=production`, `DATABASE_URL`, `APP_BASE_URL` e `FRONTEND_ORIGIN` com a URL HTTPS pública do serviço, além das variáveis Gemini e SMTP se esses recursos estiverem habilitados. `SMTP_FROM` deve ser um remetente aceito pelo provedor. Para uso público normal, mantenha `DEMO_ACCOUNT_ENABLED=false`, a menos que queira oferecer um login demo compartilhado. Cadastre segredos em Environment no Render; não os coloque no Git.

O app aceita qualquer serviço SMTP autenticado; não precisa usar Brevo. O SMTP do Gmail usa `smtp.gmail.com`, porta `587`, `SMTP_SECURE=false`, endereço Gmail completo em `SMTP_USER` e uma Senha de app do Google em `SMTP_PASS`. O Google exige a verificação em duas etapas para criar senhas de app, e algumas contas gerenciadas ou protegidas não permitem essa opção. Use uma caixa postal dedicada e nunca coloque a senha normal de login no Render. **Os serviços gratuitos do Render bloqueiam conexões SMTP de saída nas portas 25, 465 e 587**; por isso, o Gmail SMTP funciona localmente ou em um Web Service pago, mas não no Render Free. Alguns provedores também oferecem SMTP pela porta `2525`; por exemplo, a documentação do Mailgun lista essa porta. A lista atual de bloqueios do Render não inclui `2525`, então um provedor que aceite essa porta pode funcionar com o mailer existente, dependendo da verificação da conta/domínio e de um teste de conexão. Outra opção é usar a API HTTPS de um provedor pela porta `443`, mas o mailer atual precisaria de uma integração para essa API.

## Configurar e-mail no Render Free

### Exemplo com SMTP do Mailjet

O Mailjet documenta o host SMTP `in-v3.mailjet.com` e aceita a porta `2525`. Crie uma conta, valide o endereço ou domínio remetente e procure a chave SMTP e o segredo em Account settings → SMTP and SEND API settings. Nas configurações Environment do Web Service no Render, adicione:

```env
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=sua-chave-api-mailjet
SMTP_PASS=seu-segredo-mailjet
SMTP_FROM="EntrePausas <remetente-verificado@example.com>"
```

Salve e faça o deploy do serviço; depois teste o cadastro usando um endereço de e-mail que você consiga acessar. Não versione essas credenciais. Atualmente o Mailjet informa um plano gratuito com 6.000 mensagens por mês e limite de 200 por dia; confira os limites e requisitos atuais da conta antes de depender deles.

- **Configuração SMTP do Mailjet:** [SMTP relay configuration](https://dev.mailjet.com/docs/smtp-relay/configuration)
- **Variáveis no Render:** [Environment variables and secrets](https://render.com/docs/configure-environment-variables)
- **Plano do Mailjet:** [Preços](https://www.mailjet.com/pricing/)

## Links

- **Repositório:** [GitHub](https://github.com/tusterman11/hackaton-student-well-being)
- **Deploy:** Demonstração local
- **Quadro / projeto:** [GitHub Projects](https://github.com/users/tusterman11/projects/2)
