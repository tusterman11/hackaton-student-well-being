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

**EntrePausas** é uma aplicação web leve, respeitosa e mobile-first criada para estudantes. Ela oferece um espaço livre de pressão para pausar e fazer check-in, deixando explícito o tempo todo que não substitui atendimento profissional.

**O que o MVP cobre:**
<<<<<<< HEAD
- **Check-in Diário Rápido:** Avaliação simples de humor e energia com linguagem acolhedora e sem julgamentos.
- **Registro de Micro-Pausas e Hábitos:** Registro em um clique para pequenas ações (beber água, alongar, fazer uma pausa de 5 minutos).
<<<<<<< HEAD
- **Conversa com IA:** Chat na aba “Conversa”, atendido pelo back-end via API do Google Gemini com um prompt fixo e acolhedor. A IA sugere pausas opcionais, não faz diagnósticos e indica apoio humano quando necessário.
=======
- **Conversa com a IA da EntrePausas:** Chat na aba “Conversa”, atendido pelo back-end com um prompt fixo e acolhedor. A IA sugere pausas opcionais, não faz diagnósticos e indica apoio humano quando necessário.
>>>>>>> 29eff0be (feat: rebrand app as EntrePausas)
- **Histórico Privado de 7 Dias:** Visualização isolada por dispositivo dos check-ins e pausas recentes, sem pontuações comparativas.
- **Lembrete Gentil na Tela:** Aviso discreto incentivando uma pausa curta durante sessões de estudo.
- **Seção de Apoio Profissional:** Tela dedicada com canais reais de apoio (como CVV - 188, SAMU 192 e acolhimento estudantil do campus), acessível pela navegação principal.

## Status atual da implementação

- As telas de check-in e pausas funcionam no front e usam `/api/checkins` e `/api/breaks`; os registros são persistidos pelo back-end no SQLite.
- O chat usa `POST /api/chat` e chama o Gemini quando `GEMINI_API_KEY` está configurada no back-end. A chave deve ficar em `backend/.env`, arquivo ignorado pelo Git; nunca coloque a chave no código do front nem a envie ao repositório. As mensagens são enviadas ao Gemini para gerar respostas, então evite compartilhar dados que identifiquem alguém.
- **Status da chave Gemini:** A verificação ao vivo mostrou que a chave configurada não é válida. Substitua-a por uma chave privada e válida em `backend/.env`; até lá, o app usa respostas de fallback seguras e não gera respostas ao vivo.
- O servidor cria tabelas SQLite `checkins` e `pauses` e oferece rotas semanais de check-ins e pausas.
- `GardenView` ainda exibe dados de exemplo. O lembrete é aberto manualmente pelo botão de teste.
- A tela de apoio e os links de contato estão implementados. A IA não é terapeuta nem serviço de emergência.
=======
- **Dashboard e check-in diário:** Registro de humor e energia de 1 a 5, anotação opcional, resumo do dia e consulta a check-ins anteriores.
- **Semana e relatórios:** Gráficos de humor e energia e resumos calculados apenas a partir de registros reais, sem pontuações ou comparações.
- **Hidratação, diário, hábitos e sono:** Registros locais com histórico neste navegador.
- **Pausas guiadas:** Temporizadores para respiração, alongamento, descanso visual e pausa livre; pausas concluídas são enviadas ao servidor.
- **Rotina de estudos:** Temporizador de foco e histórico local dos períodos concluídos.
- **Conversa com a IA da EntrePausas:** Chat pela rota do back-end. A interface mostra erros quando o serviço não está configurado ou disponível e não simula respostas.
- **Lembretes gentis e apoio:** Lembretes de pausa e contatos reais de apoio (CVV 188, SAMU 192 e rede de atendimento).

## Status atual da implementação

- Check-ins e pausas são gravados e consultados pelas rotas existentes do backend e persistidos no SQLite. O histórico disponível pela API cobre os últimos sete dias.
- Diário, hidratação, hábitos, sono e períodos de estudo são guardados no `localStorage` deste navegador; esses dados não são criptografados nem enviados ao servidor.
- O chat envia mensagens ao backend, que usa a integração Gemini configurada no servidor. A chave deve permanecer somente no ambiente do backend (por exemplo, `backend/.env`); nunca a coloque no frontend nem a envie ao repositório. Evite compartilhar dados que identifiquem alguém.
- Não há autenticação por conta. O identificador do navegador não garante isolamento seguro entre usuários e não equivale a autenticação ou autorização. Evite armazenar informações pessoais em dispositivo compartilhado. Para uso seguro com contas, o backend precisa implementar autenticação e autorização.
- A conversa não salva histórico após recarregar a página. O chat e o aplicativo não substituem atendimento profissional nem serviços de emergência.
>>>>>>> bcacf6f (feat(frontend): expand wellness features)

## Stack

- **Front-end:** React + Vite (JavaScript, HTML e CSS)
- **Back-end:** Node.js + Express (JavaScript)
- **Banco de Dados:** SQLite via `better-sqlite3` (SQL puro)
<<<<<<< HEAD
- **Integração com IA:** O back-end usa a API Gemini do Google por meio do `fetch` nativo do Node nas rotas de chat e dicas. A chave é lida pelo servidor a partir do ambiente.
- **Testes:** O back-end tem script `node --test` e oito testes. O front-end tem Vitest, Testing Library e cinco testes de integração.
=======
- **Integração com IA:** A rota de conversa do backend usa Gemini. A chave é lida pelo servidor a partir do ambiente.
- **Testes:** O backend usa `node --test`; o frontend usa Vitest e Testing Library.
>>>>>>> bcacf6f (feat(frontend): expand wellness features)
- **CI:** Não há workflow do GitHub Actions na branch de front atual.

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

- Node.js (v20 ou superior)
- npm (v10 ou superior)
- Chave da API Gemini configurada em `backend/.env` (veja `backend/.env.example`)

### Back-end

```bash
cd backend
cp .env.example .env
# Adicione sua GEMINI_API_KEY dentro do arquivo .env
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

Na branch atual não há workflow do GitHub Actions. Os comandos de verificação disponíveis são `npm test` no back-end e `npm run lint` / `npm run build` no front. Configure um workflow e testes do front antes de descrevê-los como verificações de CI ativas.

## Deploy

Configurado para execução local durante a demonstração ao vivo (opções de deploy: Vercel para o front-end e Render/Railway para o back-end).

## Links

- **Repositório:** [GitHub](https://github.com/tusterman11/hackaton-student-well-being)
- **Deploy:** Demonstração local
- **Quadro / projeto:** [GitHub Projects](https://github.com/users/tusterman11/projects/2)
