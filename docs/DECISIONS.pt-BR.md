# Decisões do projeto

[English](DECISIONS.md) · **Português (Brasil)**

Registre aqui as decisões importantes da equipe. Cada entrada deve ser curta e indicar o que foi decidido, as alternativas consideradas e o motivo da escolha.

## Status da implementação — 25/11/2026 (`feat/frontend-setup`)

As decisões abaixo descrevem o produto pretendido; não significam que todos os recursos estejam concluídos. Situação do código atual:

- **Check-in diário:** O formulário está implementado em React e chama `POST /api/checkins`; o servidor valida e persiste os check-ins no SQLite. O limite de um check-in por dia ainda não foi implementado.
- **Registro de pausas:** Os botões e a lista existem no front e chamam `POST /api/breaks`; o servidor persiste as pausas no SQLite.
- **Chat com IA:** `POST /api/chat` chama o Google Gemini pelo `fetch` nativo do Node quando `GEMINI_API_KEY` está configurada em `backend/.env`. O prompt no servidor define um papel acolhedor e não clínico; frases de risco urgente recebem uma resposta fixa com contatos de apoio. A chave não é versionada, e uma resposta ao vivo exige uma chave válida.
- **Verificação do Gemini:** A verificação ao vivo em 25/11/2026 retornou `API key not valid`. A chave configurada precisa ser substituída antes da demonstração de respostas de IA ao vivo.
- **Histórico semanal:** `GardenView` ainda exibe dados de exemplo; não consulta check-ins ou pausas salvos.
- **Lembrete gentil:** É possível abrir o lembrete pelo botão “Testar lembrete”. O temporizador planejado de 45 a 60 minutos ainda não foi implementado.
- **Recursos de apoio:** A tela de apoio e os links de contato estão implementados. O chat pode mostrar links do CVV 188 e SAMU 192 para risco urgente; a IA não é profissional nem serviço de emergência.
- **Armazenamento e privacidade:** O servidor cria tabelas SQLite `checkins` e `pauses`. O ID anônimo é gerado no navegador, mas ainda não está associado aos registros do servidor. O histórico do chat fica na memória do front e é enviado ao Gemini para gerar respostas; não é salvo no SQLite.
- **Testes e CI:** O back-end tem script `node --test` e arquivo de teste. O front agora executa cinco testes de integração Vitest que cobrem navegação, envio do check-in, encaminhamento para apoio em humor baixo, registro de pausas e erros no chat. Não há workflow do GitHub Actions nesta branch.

## 24/11/2026 — Fechamento do Escopo do MVP (6 Itens Essenciais)
- **Decisão:** Recortar o MVP no menor tamanho funcional ponta a ponta dos 6 requisitos do briefing:
  1. **Check-in diário:** Uma pergunta simples de humor e energia por dia (escala de 1 a 5 com linguagem cuidadosa) + nota opcional, sem notas ou comparações.
  2. **Registro de pausas e hábitos:** Botões rápidos ("Bebi água", "Alonguei", "Fiz uma pausa curta") salvando tipo e horário.
  3. **Dicas geradas por IA:** O back-end chama a API do Google Gemini e retorna uma sugestão curta e opcional baseada no humor e na energia, com fallback de dicas escritas à mão caso a API falhe ou não esteja configurada.
  4. **Histórico semanal:** Tela simples com check-ins e pausas dos últimos 7 dias (lista ou gráfico básico), visível apenas para a própria pessoa.
  5. **Lembrete gentil dentro do app:** Aviso discreto na tela após 45 a 60 minutos de uso com botão para dispensar (sem notificações push).
  6. **Seção de recursos de apoio:** Sempre visível, com contatos reais do Brasil (CVV 188, SAMU 192 e acolhimento do campus) e aviso explícito de que o app não substitui atendimento profissional.
- **Alternativas consideradas:** Permitir vários check-ins no mesmo dia, criar notificações push e gráficos complexos.
- **Justificativa:** Limitar a um check-in por dia simplifica o histórico e garante um fluxo completo e sem bugs antes do congelamento no domingo às 23h59.

## 24/11/2026 — Exclusões Explícitas (Fora de Escopo)
- **Decisão:** Deixar explicitamente de fora: diagnóstico ou terapia, pontuação de bem-estar ou comparação entre pessoas, coleta de dados sensíveis de saúde, exposição pública de humor, app nativo, login social e todos os extras opcionais (timer de respiração, reflexão semanal, lista personalizada de hábitos e modo silencioso) até que o MVP esteja pronto e testado.
- **Alternativas consideradas:** Incluir timer de respiração de 1 minuto e modo silencioso já na primeira sprint.
- **Justificativa:** Evitar notas e promessas clínicas respeita os limites éticos do briefing e evita pressionar o estudante. Cortar extras protege o prazo de 5 dias (caso sobre tempo no sábado, o modo silencioso será a primeira adição por ter menor custo).

## 24/11/2026 — Stack Unificada em JavaScript, Testes e CI
- **Decisão:** Construir uma aplicação web mobile-first com interface em **português** usando **React + Vite (JavaScript, HTML e CSS)** no front-end e **Node.js + Express (JavaScript)** no back-end. Utilizar **Vitest** para testes no front-end, o executor nativo **`node --test`** para testes no back-end e **GitHub Actions (`node-version: 20`)** para CI, mantendo a documentação do repositório bilíngue (Inglês e pt-BR).
- **Alternativas consideradas:** TypeScript nas duas pontas; Tailwind CSS; Python (FastAPI) ou Java (Spring Boot) no back-end; Jest para testes; aplicativos mobile nativos.
- **Justificativa:** Usar JavaScript puro com HTML e CSS padrão em toda a stack elimina a sobrecarga de compilação e tipagem, permitindo que os 4 integrantes contribuam e revisem PRs rapidamente durante o hackathon. O `node --test` nativo e o Vitest mantêm as dependências mínimas e rodam rápido no GitHub Actions com Node 20, enquanto a interface em português atende diretamente os estudantes do campus.

## 25/11/2026 — Suíte Vitest do Front-end e Compatibilidade com Node 20
- **Decisão:** Usar Vitest com Testing Library e jsdom para testes de integração focados no front-end e manter apenas os comportamentos essenciais do MVP na suíte inicial.
- **Alternativas consideradas:** Continuar usando Jest, criar snapshots amplos de componentes e adicionar uma suíte browser end-to-end ao mesmo tempo.
- **Justificativa:** Vitest se integra ao Vite e não exige Jest como executor. A primeira suíte cobre navegação, check-ins normais e de sofrimento, registro de pausas e falhas no chat. Vitest 3.2.4 e jsdom 26.1.0 foram usados por serem compatíveis com o Node 20.12.2 dos computadores do laboratório; as versões serão revistas antes de atualizar Node ou Vite.

## 24/11/2026 — Banco de Dados (`better-sqlite3`), Privacidade e Identificador Anônimo por Dispositivo
- **Decisão:** Utilizar **SQLite via `better-sqlite3` com SQL puro** e identificar cada pessoa por um **ID anônimo gerado por dispositivo** salvo no navegador, em vez de criar cadastro com senha.
- **Alternativas consideradas:** Prisma ORM; cadastro com e-mail e senha (JWT); login social OAuth; PostgreSQL em nuvem.
- **Justificativa:** O `better-sqlite3` com SQL puro evita problemas de migração de ORM, dispensa configuração de servidor e executa de forma síncrona com alta estabilidade no CI. O identificador anônimo por dispositivo evita o atrito do login e foi escolhido para separar o histórico de cada pessoa. Ele ainda não está associado aos registros no servidor; consulte o status da implementação acima.

## 24/11/2026 — Regras de Segurança da IA e Estratégia de Fallback
- **Decisão:** Chamar a **API do Google Gemini** exclusivamente pelo back-end com prompt de sistema acolhedor e não diretivo. Se o check-in indicar um momento mais difícil (humor 1 ou 2), o app **não** gera texto livre e destaca imediatamente a seção de Recursos de Apoio. Inclui dicas estáticas escritas à mão como fallback caso a API falhe.
- **Alternativas consideradas:** Deixar a IA gerar conselhos livres em momentos de mal-estar intenso.
- **Justificativa:** O encaminhamento fixo para ajuda humana (CVV 188 / SAMU 192) garante segurança emocional, enquanto o fallback evita falhas na apresentação por rede ou cota da API.

---

## Perguntas do Briefing Respondidas pelo Time

As respostas abaixo descrevem o comportamento desejado e os critérios de aceitação; consulte o status da implementação acima para saber o que já está entregue.

1. **Como garantimos que uma dica não seja genérica nem potencialmente inadequada?**
   - O prompt de sistema envia o nível de humor/energia e a nota opcional do aluno, instruindo a IA a sugerir uma micro-pausa concreta de 2 a 5 minutos adaptada à rotina do campus, sempre em tom de convite opcional.
2. **O que a interface faz se a pessoa indicar um mal-estar mais intenso?**
   - A geração de texto livre por IA é bloqueada e a interface destaca imediatamente o card de Recursos de Apoio (CVV 188, SAMU 192 e acolhimento do Senac), sem tentar conduzir um atendimento.
3. **Quem pode ver o histórico de check-ins e como esses dados ficam protegidos?**
   - Apenas a própria pessoa no seu dispositivo. Os registros ficam isolados por um UUID anônimo por dispositivo no SQLite, sem área pública, nomes ou dados clínicos sensíveis.
4. **Como o tom da IA é revisado pelo time antes da demo?**
   - Todos os 4 integrantes testam diferentes cenários de check-in e revisam as respostas geradas antes do congelamento de sábado, registrando ajustes de prompt e textos rejeitados no `AI_LOG.md`.
5. **Como o produto deixa explícito, o tempo todo, o limite do que ele é e do que ele não é?**
   - Um aviso fixo na interface e dentro da seção de Recursos de Apoio informa continuamente: *"Este app apoia suas pausas e hábitos diários. Isto não é terapia, orientação médica nem atendimento de emergência."*
