# Project decisions

**English** · [Português (Brasil)](DECISIONS.pt-BR.md)

Record the team's important decisions here. Each entry should be short and state what was decided, the alternatives considered and the reason for the choice.

## 24/11/2026 — MVP Scope Lock (6 Core Features)
- **Decision:** Cut the MVP to the smallest end-to-end version of the 6 briefing requirements:
  1. **Daily Check-in:** Single mood/energy check-in per day (1–5 scale with careful wording) + optional short note, no scores or comparisons.
  2. **Break & Habit Logging:** One-click buttons ("Drank water", "Stretched", "Took a short break") saving type and timestamp.
  3. **AI-Generated Tips:** Back-end calls the Claude API to return a short, optional suggestion based on the check-in, with hand-written fallback tips if the API fails.
  4. **Weekly History:** Simple 7-day list/chart of check-ins and breaks visible only to the user.
  5. **Gentle In-App Reminder:** Non-intrusive on-screen prompt after 45–60 minutes of usage with a dismiss button (no push notifications).
  6. **Support Resources Section:** Always-visible directory with Brazilian support contacts (CVV 188, SAMU 192, and campus student support) and clear non-clinical disclaimers.
- **Alternatives considered:** Allowing multiple check-ins per day, adding push notifications, and building complex analytics charts.
- **Rationale:** Limiting to one check-in per day and minimal actions keeps the data model simple and ensures a complete, bug-free product before Sunday's 23:59 code freeze.

## 24/11/2026 — Explicit Exclusions (Out of Scope)
- **Decision:** Explicitly exclude clinical diagnosis/therapy, comparative wellness scores/streaks, sensitive health data collection, public mood exposure, native mobile apps, social login, and all optional extras (breathing timer, weekly reflection, custom habits, silent mode) until the core MVP is tested.
- **Alternatives considered:** Including a 1-minute breathing timer and silent mode in the initial sprint.
- **Rationale:** Avoiding scores and clinical claims respects ethical boundaries and prevents user anxiety. Cutting optional extras and external integrations protects the 5-day timeline (if extra time remains on Saturday, silent mode is the lowest-cost addition).

## 24/11/2026 — Unified TypeScript Stack & Interface Language
- **Decision:** Build a mobile-first web app in **Portuguese** using **React + Vite + TypeScript + Tailwind CSS** on the front-end and **Node.js + Express + TypeScript** on the back-end, while keeping repository documentation bilingual (English and pt-BR).
- **Alternatives considered:** Python (FastAPI) or Java (Spring Boot) on the back-end; native Android/iOS apps.
- **Rationale:** Using TypeScript across both layers allows all 4 members to contribute and review PRs across the whole codebase. A Portuguese UI matches the target campus audience, while bilingual docs fulfill the hackathon rules.

## 24/11/2026 — Database, Privacy, and Anonymous Device ID
- **Decision:** Use **SQLite via Prisma ORM** and identify users via an **anonymous per-device ID** stored in the browser, rather than full user accounts.
- **Alternatives considered:** Email/password authentication with JWT; OAuth social login; PostgreSQL on cloud servers.
- **Rationale:** An anonymous per-device ID protects student privacy (zero personal or sensitive health data stored), removes login friction during the live demo, and ensures each user only sees their own 7-day history. SQLite requires zero server setup and runs reliably in CI.

## 24/11/2026 — AI Safety Rules and Fallback Strategy
- **Decision:** Call the **Claude API (Anthropic SDK)** strictly from the back-end with a warm, non-directive system prompt. If the check-in indicates intense distress (lowest mood levels), bypass free-form AI generation and highlight the Support Resources section. Include static hand-written fallback tips in case of API failure.
- **Alternatives considered:** Letting the LLM generate open-ended emotional advice for low mood states.
- **Rationale:** Deterministic routing to human help (CVV 188 / SAMU 192) guarantees safety during distress, while static fallbacks prevent demo failures due to network or quota issues.

---

## Briefing Guiding Questions (Team Alignment)

1. **How do we ensure a tip is neither generic nor potentially inappropriate?**
   - The system prompt passes the user's specific mood/energy level and optional context, instructing the AI to suggest a concrete, 2-to-5-minute campus-friendly micro-break framed as an optional invitation.
2. **What does the interface do if the person indicates more intense distress?**
   - Free-form AI text generation is skipped; the UI immediately highlights the Support Resources card (CVV 188, SAMU 192, and Senac campus support) without attempting to counsel the user.
3. **Who can view the check-in history, and how is this data protected?**
   - Only the user on their own device. Records are isolated by an anonymous per-device UUID in SQLite, with no public feeds, usernames, or sensitive medical data stored.
4. **How is the AI's tone reviewed by the team before the demo?**
   - All 4 members test sample prompts and review generated outputs before Saturday's freeze, logging prompt adjustments and rejected outputs in `AI_LOG.md`.
5. **How does the product make its limits explicit at all times?**
   - A permanent disclaimer banner in the UI and inside the Support Resources section states: *"This app supports daily breaks and habits. It is not therapy, medical advice, or an emergency service."*
