# Registro de uso de IA (AI Log)

[English](AI_LOG.md) · **Português (Brasil)**

Este registro documenta como a equipe usou IA no processo: o que pedimos, o que a IA gerou, o que revisamos e o que mantivemos ou alteramos. Adicione uma nova entrada sempre que a IA for usada.

**Legenda de status:** Adotado (usado como sugerido) · Adaptado (usado com mudanças) · Rejeitado (não usado) · Pendente (ainda em revisão pela equipe)

Todas as entradas abaixo são da mesma ferramenta e data, salvo indicação contrária: Claude (Claude Sonnet 5.5, chat do claude.ai), 24/11/2026, pedidas pelo Tech Lead.

## Entradas

### 001: Escolha da stack tecnológica
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai)
- **Contexto:** O briefing do projeto e o modelo de README (tema Bem-estar estudantil) foram compartilhados com a IA.
- **Prompt / objetivo:** Pedimos orientação sobre as melhores tecnologias para o projeto e como começar.
- **O que a IA gerou:** Uma stack recomendada (back-end Node.js + TypeScript com Fastify ou Express, front-end React + Vite + TypeScript com Tailwind, SQLite com Prisma, API do Claude chamada apenas pelo back-end com fallback de dicas escritas à mão e uma camada de segurança para check-ins muito baixos, Vitest, ESLint/Prettier, GitHub Actions), uma sugestão de divisão de trabalho para 4 pessoas e um plano dia a dia até o code freeze.
- **O que a equipe revisou / alterou:** A stack sugerida não coube nas nossas máquinas (veja as entradas 006 a 009). Abandonamos TypeScript, Fastify, Prisma e Tailwind e mantivemos React, Vite (fixado na versão 5), Node.js com Express e SQLite.
- **Status:** Adaptado. A justificativa vai no `DECISIONS.md`.

### 002: Plano de início para o Tech Lead
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai)
- **Prompt / objetivo:** Informamos à IA que a stack estava escolhida e que o usuário é o Tech Lead; perguntamos como começar.
- **O que a IA gerou:** Um checklist ordenado de início: adicionar colaboradores (incluindo o instrutor), proteger a `main`, criar o esqueleto do monorepo e comandos de instalação, um workflow de CI (lint, testes e build em PRs e na `main`), `DECISIONS.md` e `AI_LOG.md` iniciais, convenções de contribuição (branches, Conventional Commits, ninguém aprova o próprio PR), um contrato de API a combinar antes de codar e hábitos de equipe para a semana.
- **O que a equipe revisou / alterou:** Os comandos de instalação dependiam da stack original e foram substituídos pela entrada 010. As partes de processo (colaboradores, proteção da `main`, CI em PRs e na `main`, Conventional Commits, PRs revisados) foram mantidas. A versão do Node no CI mudou de 22 para 20, para combinar com as nossas máquinas. _A equipe deve confirmar._
- **Status:** Adaptado

### 003: Geração deste AI Log
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai)
- **Prompt / objetivo:** Perguntamos se o uso de IA deve ser documentado no AI Log e pedimos que a IA gerasse as entradas a partir da conversa.
- **O que a IA gerou:** A primeira versão deste arquivo e da versão em inglês, com as entradas da conversa até aquele momento. Depois atualizado para incluir as entradas 004 a 013.
- **O que a equipe revisou / alterou:** _A ser preenchido pela equipe. Confirme se as entradas estão corretas e complete o que a IA não podia saber._
- **Status:** Pendente

### 004: Perguntas de conceito (Fastify vs React, GitHub Actions)
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai)
- **Prompt / objetivo:** Perguntamos se o Fastify é parecido com o React e se o GitHub Actions é obrigatório.
- **O que a IA gerou:** Uma explicação de que o React constrói a interface no navegador, enquanto o Fastify (como o Express) é um framework de servidor que expõe uma API. A confirmação de que o briefing exige um pipeline do GitHub Actions verde (build, lint e testes) nos PRs e na `main`, com o conselho de criá-lo no primeiro dia.
- **O que a equipe revisou / alterou:** A exigência de CI confere com o briefing. _A equipe deve confirmar._
- **Status:** Adotado

### 005: Sugestão de escopo do MVP
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai)
- **Prompt / objetivo:** Perguntamos o que colocar no escopo do MVP.
- **O que a IA gerou:** Os seis itens mínimos do MVP do briefing reduzidos ao menor tamanho funcional, regras de segurança (check-in muito baixo não gera texto livre de IA e mostra recursos de apoio, aviso visível sobre os limites do app, revisão humana do tom da IA antes da demo), uma lista explícita do que fica de fora e decisões em aberto (login ou identificador anônimo por dispositivo, um check-in por dia, idioma da interface).
- **O que a equipe revisou / alterou:** _A ser preenchido pela equipe. Os contatos de apoio sugeridos pela IA precisam ser conferidos antes de publicar. O escopo final vai no `DECISIONS.md`._
- **Status:** Pendente

### 006: Erros do Prisma e requisito de versão do Node
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai)
- **Prompt / objetivo:** Informamos o erro do comando `prisma init --datasource-provider sqlite` e depois o erro na instalação do Prisma 7.
- **O que a IA gerou:** O primeiro comando (da entrada 001) era para o Prisma 7, mas a CLI já estava na versão 8, então falhou. Depois de uma busca na documentação do Prisma, a IA recomendou fixar o Prisma 7. Essa instalação falhou porque o Prisma exige Node.js 20.19+, 22.12+ ou 24+, e nossas máquinas têm o Node 20.12.2.
- **O que a equipe revisou / alterou:** Descobrimos os dois problemas pelas mensagens de erro reais da CLI e do npm, que mostraram que o primeiro comando da IA estava desatualizado. Abandonamos o Prisma e usamos SQL puro com SQLite.
- **Status:** Rejeitado

### 007: Alternativas para a restrição do Node
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai)
- **Prompt / objetivo:** Informamos que não conseguimos instalar o Node nos PCs do laboratório (administrador bloqueia) e perguntamos sobre usar o Node pelo VS Code e sobre alternativas ao Prisma.
- **O que a IA gerou:** Opções: Node portátil em zip, configuração do PATH no terminal do VS Code, GitHub Codespaces, Drizzle ORM com SQLite e Python com Flask como alternativa mais simples.
- **O que a equipe revisou / alterou:** A tentativa com o Node portátil não funcionou no nosso PC. Decidimos continuar com o Node 20.12.2 já instalado e escolher versões de pacotes compatíveis, em vez de trocar de ferramentas.
- **Status:** Rejeitado

### 008: Simplificação da stack para o que a equipe conhece
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai)
- **Prompt / objetivo:** Pedimos a versão mais simples possível, em qualquer linguagem, usando o que já conhecemos (JavaScript e um pouco de SQLite), e perguntamos se TypeScript era possível.
- **O que a IA gerou:** Uma configuração simples com JavaScript puro, Express, `better-sqlite3`, o executor de testes embutido do Node e uma configuração do ESLint, além da observação de que o TypeScript só precisa de um Node funcionando.
- **O que a equipe revisou / alterou:** Escolhemos JavaScript (sem TypeScript), Express e SQLite com SQL puro.
- **Status:** Adotado

### 009: Requisitos de versão do React e do Vite
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai), com busca na documentação do Vite
- **Prompt / objetivo:** Perguntamos qual versão o React exige.
- **O que a IA gerou:** Uma explicação de que o React não tem requisito de Node, mas o Vite tem: o Vite 7 exige Node 20.19+ ou 22.12+, enquanto o Vite 5 funciona no Node 18 e 20+. Recomendou criar o projeto com o Vite 5.
- **O que a equipe revisou / alterou:** Decidimos usar React com Vite 5, JavaScript, HTML, CSS e SQLite. _A equipe deve verificar a versão do Vite instalada no `package.json`._
- **Status:** Adotado

### 010: Passo a passo de configuração
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai)
- **Prompt / objetivo:** Pedimos um guia de configuração do zero para a stack final.
- **O que a IA gerou:** Passos para começar do zero, arquivos da raiz, o esqueleto do back-end em Express com um endpoint de saúde e um teste, o front-end React com Vite 5 e um proxy para `/api`, um workflow do GitHub Actions para as duas pastas, o primeiro PR com proteção da `main` e passos para a equipe começar.
- **O que a equipe revisou / alterou:** O back-end foi configurado como descrito. O teste do back-end falhou na primeira execução (entrada 011). _A equipe deve completar depois de verificar o front-end e o CI._
- **Status:** Pendente

### 011: Depuração do teste do back-end que falhou
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai)
- **Prompt / objetivo:** Informamos que o teste do back-end falhou depois de seguir a entrada 010.
- **O que a IA gerou:** Uma lista de causas prováveis (o módulo nativo `better-sqlite3` não carregar, o `localhost` se comportar diferente no Windows, o teste não terminar, nome de arquivo errado) e uma versão mais robusta do teste, que usa `127.0.0.1` e sempre fecha o servidor. A IA não teve acesso ao erro exato.
- **O que a equipe revisou / alterou:** A equipe encontrou a causa real: a versão instalada do `better-sqlite3` não era suportada pelo Node 20.12.2, então o teste falhava ao carregar o banco de dados (a primeira causa que a IA listou). A equipe fez o downgrade do `better-sqlite3` para a 12.4.1 e o teste agora passa. A versão deve ser fixada sem `^` e registrada no `DECISIONS.md`.
- **Status:** Adaptado (a IA listou a causa entre várias possibilidades; a equipe confirmou e escolheu a correção)

### 012: Fixação da versão do pacote SQLite
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai)
- **Prompt / objetivo:** Informamos que o teste falhava por causa de uma versão do `better-sqlite3` não suportada pelo Node 20.12.2, e que o downgrade para a 12.4.1 resolveu.
- **O que a IA gerou:** O conselho de fixar a versão exata sem `^`, versionar o `package-lock.json`, usar `npm ci` entre os colegas, conferir se o CI instala o pacote e registrar o motivo no `DECISIONS.md`. Também atualizou a entrada 011 deste registro com a causa real e a correção.
- **O que a equipe revisou / alterou:** _A ser preenchido pela equipe. Confirme que o `package.json` fixa o `better-sqlite3` na 12.4.1 e que o CI o instala corretamente._
- **Status:** Pendente

### 013: Mensagens de commit das fases de configuração
- **Data:** 24/11/2026
- **Quem:** Tech Lead
- **Ferramenta:** Claude (Claude Sonnet 5.5, chat do claude.ai)
- **Prompt / objetivo:** Perguntamos qual mensagem de commit usar depois de concluir os arquivos da raiz e a configuração do back-end.
- **O que a IA gerou:** Duas mensagens no padrão Conventional Commits (`chore: add gitignore and nvmrc` e `feat(backend): scaffold express server with health endpoint and sqlite`), uma verificação com `git status` para não versionar `node_modules` nem o arquivo do banco, e um pequeno guia do formato das mensagens.
- **O que a equipe revisou / alterou:** _A ser preenchido pela equipe._
- **Status:** Pendente

### 014: Depuração e layout responsivo do front-end
- **Data:** 25/11/2026
- **Quem:** Matheus Epifanio de Souza (Presentation Lead)
- **Ferramenta:** OpenAI Codex (assistente de programação)
- **Prompt / objetivo:** Pedimos ajuda para descobrir por que o localhost abria em branco e, depois, para adaptar o layout a desktop e celular e trocar o campo curto por uma área de anotação preparada para uma integração futura com IA, ainda sem conectar a IA.
- **O que a IA gerou:** A análise do front encontrou uma divergência: `App.jsx` importava `BreaksView`, mas `BreaksView.jsx` exportava uma cópia de `GardenView`; foi criada uma tela própria de pausas. O front foi adaptado a diferentes telas, com layout desktop ocupando a janela e sem barra de rolagem da página em larguras de desktop. O campo de anotação virou uma área de texto de até 1.000 caracteres com contador, e o rascunho é mantido ao trocar de aba. O título e o idioma da página também foram atualizados. Nenhuma integração com IA foi adicionada.
- **O que a equipe revisou / alterou:** Matheus confirmou que a versão para celular ficou boa e pediu que o desktop ocupasse a tela toda sem rolagem. O layout desktop foi ajustado para atender a esse pedido. O build de produção concluiu com sucesso após as mudanças; a equipe ainda deve conferir a aparência do desktop nos tamanhos de tela que pretende usar.
- **Status:** Adaptado

### 015: Integração do chat com Claude para apoio estudantil
- **Data:** 25/11/2026
- **Quem:** Matheus Epifanio de Souza (Presentation Lead)
- **Ferramenta:** OpenAI Codex (assistente de programação)
- **Prompt / objetivo:** Perguntamos como configurar com segurança uma chave da API do Claude e conectar um chat acolhedor em português, no front, a um prompt no servidor. A companhia deve sugerir ações pequenas e opcionais para a rotina no campus e indicar os contatos profissionais da seção Apoio quando a pessoa estiver passando por um momento difícil.
- **O que a IA gerou:** Criou a tela “Conversa” e a rota `POST /api/chat` usando a dependência existente do SDK da Anthropic. O prompt fixo fica no servidor; o tamanho das mensagens e do histórico é limitado; a chave não vai para o navegador; e o back retorna orientações de apoio em mensagens de sofrimento ou risco urgente. Também adicionou `backend/.env.example`, carregamento local do `.env` pelo Node e proxy `/api` do Vite. A interface avisa que as mensagens são enviadas à Anthropic e pede que a pessoa não compartilhe dados que a identifiquem.
- **O que a equipe revisou / alterou:** Matheus explicou o tom e deu exemplos para a companhia (como perguntar se há um bebedouro por perto), além de pedir a indicação de contatos profissionais em momentos de sofrimento. O prompt foi limitado para evitar diagnósticos, não presumir que a IA conhece o campus e distinguir apoio emocional de emergências. Nenhuma chave real foi compartilhada ou versionada. Os builds do front e do back passaram; uma chamada real ao Claude ainda depende de uma chave local da equipe.
- **Status:** Adaptado (código implementado; chamada real pendente de chave local e revisão da equipe)

### 016: Configuração do Vitest e testes essenciais do front-end
- **Data:** 25/11/2026
- **Quem:** Equipe
- **Ferramenta:** GitHub Copilot no VS Code
- **Prompt / objetivo:** Pedimos uma análise dos testes e, depois, solicitamos apenas os testes Vitest mais necessários para o front-end.
- **O que a IA gerou:** Um plano de testes focado, a configuração do Vitest para o projeto Vite, a configuração do Testing Library, cinco testes de integração em `src/App.test.jsx` e ajustes no script e nas dependências do projeto. Os testes cobrem navegação entre telas, envio e feedback do check-in, navegação automática para apoio em humor baixo, registro de pausas e tratamento de erro da API de conversa.
- **O que a equipe revisou / alterou:** A equipe manteve o Vitest em vez do Jest porque o projeto usa Vite e limitou a suíte aos comportamentos de maior valor do MVP. Vitest 5 e jsdom 29 foram substituídos por versões compatíveis com Node 20 (Vitest 3.2.4 e jsdom 26.1.0). A configuração dos testes inclui limpeza do DOM e uma adaptação de `scrollIntoView` para o ambiente de navegador simulado. Asserções e seletores de navegação foram ajustados para evitar correspondências duplicadas de texto e consultas ambíguas. A suíte final passou com cinco testes.
- **Status:** Adaptado

## Notas de revisão

_Use esta seção para observações da equipe. Rascunho de observações da conversa até aqui, para a equipe confirmar ou editar:_

- A primeira sugestão de stack da IA assumia versões de ferramentas mais novas do que as máquinas do laboratório suportam. As mensagens de erro reais (CLI do Prisma, verificação de versão do Node) mostraram isso.
- Um comando que a IA deu para o Prisma era de uma versão desatualizada, então comandos vindos da IA devem ser conferidos com a documentação atual e com a nossa versão real do Node.
- A equipe ainda não revisou o tom e a segurança das dicas geradas por IA; essa revisão precisa de uma entrada própria antes da demo.
