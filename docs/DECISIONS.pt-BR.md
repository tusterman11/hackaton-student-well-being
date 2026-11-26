# Decisões do projeto

[English](DECISIONS.md) · **Português (Brasil)**

Registre aqui as decisões importantes da equipe. Cada entrada deve ser curta e indicar o que foi decidido, as alternativas consideradas e o motivo da escolha.

## Status da implementação

- **Contas:** Cadastro por e-mail com confirmação; a senha é definida após abrir o link, evitando ativar uma senha escolhida por outra pessoa antes da confirmação. Há login, logout, recuperação de senha, cookie `HttpOnly`, proteção CSRF e limite de tentativas.
- **Persistência:** Check-ins, pausas e dados de água, diário, metas, sono e estudos são associados à conta em PostgreSQL. Rotas de leitura e gravação validam a sessão e o proprietário dos registros.
- **Importação local:** O app solicita consentimento antes de importar dados de `localStorage` e só remove a cópia local após sucesso. Datas antigas incompletas são tratadas de forma explícita; registros anônimos do SQLite legado não são associados automaticamente.
- **Privacidade:** O histórico do chat não é persistido pelo app, mas as mensagens são enviadas ao Gemini quando configurado. Evite compartilhar dados identificáveis.
- **Deploy:** Ainda não foi feito. PostgreSQL e SMTP reais precisam ser configurados; o front e a API devem compartilhar a mesma origem HTTPS para a sessão por cookie.
- **Testes:** Há suítes `node --test` no back-end e Vitest/Testing Library no front-end. Não há workflow ativo do GitHub Actions.

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
- **Justificativa:** Vitest se integra ao Vite e não exige Jest como executor. A suíte cobre navegação, check-ins, fluxo de contas, importação de dados locais, pausas e erros no chat. O projeto usa atualmente Vite 5.4.21 e Vitest 2.1.9 para manter compatibilidade com o Node 20.12.2.

## 26/11/2026 — Contas, PostgreSQL e sincronização entre dispositivos
- **Decisão:** Substituir a persistência de dispositivo por contas com e-mail verificado e PostgreSQL, para que registros pessoais possam acompanhar a pessoa entre dispositivos. O acesso exige sessão autenticada e os dados permanecem privados por usuário.
- **Alternativas consideradas:** Manter `localStorage`/SQLite por dispositivo ou usar armazenamento local sem login.
- **Justificativa:** SQLite local não sincroniza entre computadores. PostgreSQL hospedado permite sincronização; a importação dos dados do navegador exige consentimento e os registros anônimos do SQLite antigo não são atribuídos automaticamente.
- **Operação:** O deploy no Render depende de configurar PostgreSQL, SMTP e segredos de ambiente. Ainda não foi publicado nem testado com serviços reais.

## 24/11/2026 — Banco de Dados (`better-sqlite3`), Privacidade e Identificador Anônimo por Dispositivo (decisão substituída)
- **Decisão histórica:** Utilizar **SQLite via `better-sqlite3` com SQL puro** e identificar cada pessoa por um **ID anônimo gerado por dispositivo** salvo no navegador, em vez de criar cadastro com senha.
- **Alternativas consideradas:** Prisma ORM; cadastro com e-mail e senha (JWT); login social OAuth; PostgreSQL em nuvem.
- **Status:** Decisão substituída em 26/11/2026 por PostgreSQL e contas verificadas; registros anônimos do SQLite antigo não são atribuídos automaticamente a uma conta.
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
