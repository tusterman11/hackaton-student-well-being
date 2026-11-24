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

## 24/11/2026 — MVP Scope Lock and Exclusion of Optional Extras
- **Decision:** Lock the MVP strictly to the 6 core items from the briefing (daily check-in, break/habit logging, AI-generated tips, 7-day history, in-app break reminder, and visible support resources) and treat all optional extras as out of scope.
- **Alternatives considered:** Including guided breathing timers, weekly self-reflection text fields, and custom habit lists in the initial release.
- **Rationale:** With code freeze on Sunday at 23:59 (about 5 days left), cutting scope early ensures a complete, bug-free, and well-tested end-to-end flow.

## 24/11/2026 — Exclusion of Scores, Streaks, and Clinical Claims
- **Decision:** Explicitly exclude comparative wellness scores, streak penalties, public mood feeds, and any clinical diagnosis or open-ended therapy chat.
- **Alternatives considered:** Implementing a 0–100 wellness index and a multi-turn therapy chatbot.
- **Rationale:** Scores and streaks create performance pressure, while open-ended therapy poses ethical risks. The product stays strictly focused on gentle break invitations and static links to real human help.

## 24/11/2026 — Unified TypeScript Stack (React + Node.js)
- **Decision:** Use React + Vite + TypeScript + Tailwind CSS on the front-end and Node.js + Express + TypeScript on the back-end, built as a mobile-first responsive web app.
- **Alternatives considered:** Python with FastAPI; Java with Spring Boot; native mobile apps (React Native/Flutter).
- **Rationale:** Keeping a single language (TypeScript) across front-end and back-end allows all 4 team members to contribute to either layer and review each other's PRs effectively. A responsive web app is also the fastest to demo and deploy without mobile build overhead.

## 24/11/2026 — Database Choice (SQLite via Prisma)
- **Decision:** Use SQLite managed via Prisma ORM for data persistence.
- **Alternatives considered:** PostgreSQL on Neon/Supabase; Dockerized Postgres; browser LocalStorage only.
- **Rationale:** SQLite requires zero server setup (just a local file), works reliably in GitHub Actions CI, and provides real relational persistence with type-safe queries via Prisma.

## 24/11/2026 — Privacy and Minimal Identification
- **Decision:** Use an anonymous per-device ID stored locally (or minimal hashed credentials) so each user only accesses their own check-in and break history without collecting sensitive personal data.
- **Alternatives considered:** Full OAuth social login; storing unauthenticated global history visible to everyone.
- **Rationale:** The briefing emphasizes privacy and avoiding sensitive health data collection. Per-device isolation protects user history while keeping onboarding frictionless.

## 24/11/2026 — AI Integration (Claude API) with Fallback and Safety Layer
- **Decision:** Call the Anthropic Claude API exclusively from the back-end using a strict system prompt (warm tone, suggestions instead of orders, no diagnosis). Include a deterministic safety rule that skips free-form generation and highlights support resources on very low mood check-ins, plus hand-written fallback tips if the API fails.
- **Alternatives considered:** Calling the AI directly from the client; relying solely on LLM prompts for crisis handling.
- **Rationale:** Server-side calls protect the API key, hard-coded safety triggers guarantee predictable routing to help resources (e.g., CVV 188) during distress, and fallback tips ensure the live demo never breaks due to network or quota issues.

## 24/11/2026 — Testing, Linting, and CI/CD Pipeline
- **Decision:** Standardize on Vitest for unit tests, ESLint + Prettier for code quality, and GitHub Actions running install, lint, test, and build on every PR and push to `main`.
- **Alternatives considered:** Manual testing only; setting up CI at the end of the week.
- **Rationale:** Automated checks are part of the technical grading criteria and prevent broken code from being merged into `main`.
