# AI usage log (AI_LOG)

**English** · [Português (Brasil)](AI_LOG.pt-BR.md)

Record how the team used artificial intelligence in the project. The use of AI is allowed and encouraged, as long as it is documented: this file is a required deliverable and a script for the “AI in practice” segment of the presentation.

## Tools

- **Google Gemini:** used for project ideation, initial documentation structuring (`README.md`, `DECISIONS.md`), and drafting back-end security guardrails.
- **Claude (Anthropic):** used for timeline planning, refining the unified TypeScript stack, and powering the in-app micro-break tip generation via API.

## Entry template

```markdown
### [date] — [task or section]
- **Main prompt:**
- **What the AI generated:**
- **What the team kept:**
- **What the team corrected or rejected, and why:**
```

## Log

### 24/11/2026 — MVP scoping, stack refinement, and initial documentation (Gemini & Claude)
- **Main prompt:** "Help us structure a 5-day MVP for a student well-being web app following the hackathon briefing, defining the tech stack, folder structure, and bilingual documentation (`README.md` and `DECISIONS.md`)."
- **What the AI generated:** Concept proposals ("Pausa Leve"), a day-by-day execution plan, a unified TypeScript stack recommendation (React + Vite + Node.js + SQLite/Prisma), and initial drafts for `README.md` and `DECISIONS.md`.
- **What the team kept:** The "Pausa Leve" concept focused on non-judgmental micro-breaks, the unified TypeScript stack to allow all 4 members to review PRs across layers, and the bilingual documentation structure.
- **What the team corrected or rejected, and why:** We rejected optional extras (such as guided breathing timers and weekly reflection text fields) and an initial Python/FastAPI prototype suggestion to avoid mixing languages and protect our Sunday 23:59 code freeze deadline.

### 24/11/2026 — In-app AI system prompt and safety guardrails design (Gemini & Claude)
- **Main prompt:** "Draft a strict system prompt and safety architecture for generating short, welcoming student break tips without clinical advice, plus crisis routing."
- **What the AI generated:** A system prompt limiting outputs to 2 sentences framed as optional invitations, combined with a deterministic back-end check for critical mood inputs and hand-written fallback tips.
- **What the team kept:** The 2-sentence limit, the non-judgmental invitation tone, the curated fallback tips for offline/quota safety during the live demo, and the server-side API isolation.
- **What the team corrected or rejected, and why:** We rejected an early multi-turn conversational chatbot approach because open-ended emotional questioning could resemble clinical counseling, which is explicitly out of scope in the briefing. Instead, we enforced a single-turn tip flow with immediate static links to real human support (CVV 188 and campus services) on low mood check-ins.
