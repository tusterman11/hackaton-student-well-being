# Registro de uso de IA (AI_LOG)

[English](AI_LOG.md) · **Português (Brasil)**

Registrem aqui como o time usou inteligência artificial no projeto. O uso de IA é liberado e incentivado, desde que documentado: este arquivo é entregável obrigatório e serve de roteiro para o bloco “IA na prática” da apresentação.

## Ferramentas

- **Google Gemini:** utilizado para ideação do projeto, estruturação inicial da documentação (`README.md`, `DECISIONS.md`) e rascunho das travas de segurança do back-end.
- **Claude (Anthropic):** utilizado para planejamento do cronograma de 5 dias, refinamento da stack unificada em TypeScript e geração das dicas de micro-pausas dentro do aplicativo via API.

## Modelo de registro

```markdown
### [data] — [tarefa ou trecho]
- **Prompt principal:**
- **O que a IA gerou:**
- **O que o time aproveitou:**
- **O que o time corrigiu ou rejeitou, and por quê:**
```

## Registro

### 24/11/2026 — Recorte do MVP, refinamento da stack e documentação inicial (Gemini & Claude)
- **Prompt principal:** "Ajude a estruturar um MVP de 5 dias para um aplicativo web de bem-estar estudantil seguindo o briefing do hackathon, definindo a stack técnica, estrutura de pastas e documentação bilíngue (`README.md` e `DECISIONS.md`)."
- **O que a IA gerou:** Propostas de conceito ("Pausa Leve"), plano de execução dia a dia, recomendação de stack unificada em TypeScript (React + Vite + Node.js + SQLite/Prisma) e rascunhos iniciais para `README.md` e `DECISIONS.md`.
- **O que o time aproveitou:** O conceito do "Pausa Leve" focado em micro-pausas sem cobrança, a stack unificada em TypeScript para que os 4 integrantes possam revisar PRs nas duas camadas e a estrutura bilíngue dos documentos.
- **O que o time corrigiu ou rejeitou, e por quê:** Rejeitamos os extras opcionais (como timer de respiração guiada e campo de reflexão semanal) e um rascunho inicial em Python/FastAPI para evitar mistura de linguagens e garantir a entrega antes do congelamento de código no domingo às 23h59.

### 24/11/2026 — Prompt de sistema da IA do produto e travas de segurança (Gemini & Claude)
- **Prompt principal:** "Crie um prompt de sistema rígido e uma arquitetura de segurança para gerar dicas curtas e acolhedoras de pausa para estudantes sem aconselhamento clínico, incluindo encaminhamento em momentos difíceis."
- **O que a IA gerou:** Um prompt de sistema limitando as respostas a 2 frases em tom de convite opcional, combinado com uma verificação determinística no back-end para check-ins críticos e dicas de fallback escritas à mão.
- **O que o time aproveitou:** O limite de 2 frases, o tom acolhedor sem cobrança, as dicas estáticas de fallback (garantindo que a demo ao vivo não falhe por rede ou cota) e o isolamento da chave de API no servidor.
- **O que o time corrigiu ou rejeitou, e por quê:** Rejeitamos uma ideia inicial de chat conversacional de múltiplas perguntas porque investigar sentimentos abertamente poderia se aproximar de atendimento clínico, o que é proibido pelo briefing. Em vez disso, adotamos um fluxo direto de dica única com exibição imediata de canais reais de apoio humano (CVV 188 e acolhimento do campus) em check-ins de mal-estar intenso.
