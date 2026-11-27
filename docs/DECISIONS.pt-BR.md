# Decisões do projeto

[English](DECISIONS.md) · **Português (Brasil)**

Registre aqui as decisões importantes da equipe. Cada entrada deve ser curta e indicar o que foi decidido, as alternativas consideradas e o motivo da escolha.

## Status da implementação — 27/11/2026 (`feat/entrepausas-postgres-auth`)

- **Contas:** Cadastro aberto por e-mail, confirmação do endereço, login com senha, logout e recuperação de senha estão implementados. Sessões usam cookies seguros, proteção CSRF e limites de tentativas. É necessário SMTP para enviar links; o app aceita qualquer provedor SMTP autenticado.
- **Envio de e-mail no Render:** O Render Free bloqueia as portas SMTP de saída 25, 465 e 587. O SMTP do Gmail precisa ser usado localmente ou em um serviço Render pago. Um provedor que aceite a porta 2525 pode funcionar com o mailer atual; uma API HTTPS também é opção, mas exige integração.
- **Persistência:** O PostgreSQL guarda check-ins, pausas, água, diário, hábitos, sono, estudos, foco, configurações e mensagens de chat, sempre associados à conta autenticada. As migrações do banco rodam quando o servidor inicia. As rotas de dados verificam a conta dona dos registros.
- **Importação local:** A primeira sessão da conta pode importar dados compatíveis do navegador, após consentimento. A cópia local só é removida depois da importação bem-sucedida. Registros anônimos do antigo SQLite não são associados automaticamente a uma conta.
- **Conta demo:** Uma conta compartilhada opcional é controlada por `DEMO_ACCOUNT_ENABLED`, `DEMO_EMAIL` e `DEMO_PASSWORD`. Use apenas dados fictícios e desative-a quando não precisar oferecer uma demonstração compartilhada.
- **Chat e Gemini:** O servidor salva as conversas por conta e restaura até as 100 mensagens mais recentes na interface. O Gemini recebe o contexto recente da conversa e um resumo compacto de dados numéricos da rotina dos últimos sete dias; o texto do Diário não é enviado. A pessoa pode apagar o histórico. A chave Gemini fica somente no servidor.
- **Versões do Node e Vite:** Mantenha Node `20.12.2`, definido em `.nvmrc`. As versões declaradas do front são Vite `^5.4.10` (lockfile `5.4.21`) e Vitest `^2.1.9` (lockfile `2.1.9`); não atualize esses pacotes separadamente do requisito de compatibilidade com Node.
- **Interface:** A barra lateral do desktop expande ao passar o mouse; no celular, a navegação usa um botão de menu compacto. A preferência do tema claro/escuro fica salva no navegador. Em desenvolvimento, `localhost:3000` redireciona ao Vite em `localhost:5173`; em produção, o Express serve `frontend/dist`.
- **Apoio e lembretes:** CVV 188 e SAMU 192 são links `tel:` iniciados pela pessoa; a chamada depende de um aplicativo compatível no dispositivo. O app não faz ligações nem aciona serviços de emergência automaticamente. O lembrete é manual; o temporizador automático de 45 a 60 minutos não está implementado. A assistente não é profissional de saúde nem serviço de emergência.
- **CI e verificação local:** `.github/workflows/ci.yml` instala dependências, executa lint, testes e build nos dois pacotes em pull requests e pushes para `main`. Em 27/11/2026, os testes do back-end (11/11), lint e build passaram; os testes do front-end (12/12), lint e build também passaram.

As entradas históricas abaixo registram decisões e pressupostos da época; quando houver divergência, o status da implementação acima descreve o estado atual.
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
   - As rotas autenticadas limitam os registros ao ID da conta conectada no PostgreSQL. Não há área pública. O desenho antigo com SQLite e ID por dispositivo, descrito abaixo, é histórico e não representa mais a arquitetura ativa.
4. **Como o tom da IA é revisado pelo time antes da demo?**
   - A revisão em equipe do tom e de respostas reais da IA ainda está pendente; registrar a revisão e eventuais ajustes de prompt no `AI_LOG.md` antes da apresentação.
5. **Como o produto deixa explícito, o tempo todo, o limite do que ele é e do que ele não é?**
   - Os limites aparecem nas telas de Apoio e Conversa; atualmente não há um aviso fixo em todas as telas. O texto informa que o app não é terapia, orientação médica nem serviço de emergência.
