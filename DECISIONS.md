# Project decisions

**English** · [Português (Brasil)](DECISIONS.pt-BR.md)

Record the team's important decisions here. Each entry should be short and state what was decided, the alternatives considered and the reason for the choice.

## Template

```markdown
## [date] — [decision title]
- **Decision:**
- **Alternatives considered:**
- **Rationale:**
```

## 23/11/2026 — MVP Scope Definition
- **Decision:** Limit the MVP to 6 core features: daily mood/energy check-in, one-click break/habit logging (water, stretch, 5-min rest), AI-generated gentle tips, simple 7-day history view, non-intrusive on-screen break reminder, and a permanent Professional Support section.
- **Alternatives considered:** Adding user authentication with OAuth, gamified streak points, push notifications, and guided breathing timers in the initial release.
- **Rationale:** With a strict 1-week deadline (23/11 to 29/11), delivering a complete, bug-free, and well-tested core flow is prioritized over an incomplete list of extra features.

## 23/11/2026 — Exclusion of Gamification Scores and Clinical Features
- **Decision:** Explicitly exclude comparative wellness scores, streak penalties, public mood sharing, and any form of psychological diagnosis or chatbot therapy.
- **Alternatives considered:** Using a 0–100 wellness score and an open-ended AI chat for emotional support.
- **Rationale:** Scores and streaks create performance pressure, contradicting the project goal. Open-ended AI therapy poses ethical and safety risks; therefore, the AI is restricted to single-turn micro-break suggestions, and severe distress states trigger static links to real professional help (e.g., CVV 188, campus counseling).

## 23/11/2026 — Tech Stack Selection (Front-end & Back-end)
- **Decision:** Use React (Vite + TypeScript) for the front-end and Node.js (Express + TypeScript) for the back-end.
- **Alternatives considered:** Java with Spring Boot; Python with FastAPI; Vanilla HTML/JS.
- **Rationale:** Standardizing on TypeScript across both front-end and back-end reduces context switching, accelerates integration, and allows all 4 team members to review PRs and contribute to both layers within the 7-day timeframe.

## 23/11/2026 — Database Choice
- **Decision:** Use SQLite for data persistence during the hackathon MVP.
- **Alternatives considered:** PostgreSQL in Docker; MongoDB Atlas; browser LocalStorage only.
- **Rationale:** LocalStorage would not demonstrate real back-end persistence, while cloud/container databases add setup overhead. SQLite provides a real relational database stored locally as a file, making it fast to configure, test in CI, and run reliably during the live presentation.

## 23/11/2026 — AI Safety Guardrails and Prompt Strategy
- **Decision:** Enforce a strict system prompt on the back-end limiting AI responses to a maximum of 2 sentences, framed as optional invitations, combined with a deterministic rule that highlights professional support contacts whenever the lowest mood level is selected.
- **Alternatives considered:** Letting the LLM freely generate longer advice or decide on its own when to show help resources.
- **Rationale:** Relying solely on LLM behavior for crisis routing is unsafe. Combining prompt constraints with hard-coded UI triggers ensures predictable, respectful, and safe responses during live usage.
