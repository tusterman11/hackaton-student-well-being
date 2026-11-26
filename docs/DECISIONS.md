# Project decisions

**English** · [Português (Brasil)](DECISIONS.pt-BR.md)

Record the team's important decisions here. Each entry should be short and state what was decided, the alternatives considered and the reason for the choice.

## Current implementation status

- **Accounts:** Email registration with verification; the user sets a password after opening the link, preventing someone else's pre-verification password from being activated. Login, logout, password recovery, `HttpOnly` cookies, CSRF protection, and rate limits are implemented.
- **Persistence:** Check-ins, breaks, hydration, journal entries, goals, sleep, and study schedules are associated with an account in PostgreSQL. Read and write routes validate the session and record ownership.
- **Local import:** The app asks for consent before importing `localStorage` data and removes local copies only after success. Incomplete legacy dates are handled explicitly; anonymous records from the old SQLite database are not automatically assigned to an account.
- **Privacy:** Chat history is not persisted by the app, but messages are sent to Gemini when configured. Avoid sharing identifying information.
- **Deployment:** Not performed yet. Real PostgreSQL and SMTP services still need configuration; the front end and API must use the same HTTPS origin for cookie sessions.
- **Tests:** `node --test` and Vitest/Testing Library suites are available. No GitHub Actions workflow is active.

## 24/11/2026 — MVP Scope Lock (6 Core Features)
- **Decision:** Cut the MVP to the smallest end-to-end version of the 6 briefing requirements:
  1. **Daily Check-in:** Single mood/energy check-in per day (1–5 scale with careful wording) + optional short note, no scores or comparisons.
  2. **Break & Habit Logging:** One-click buttons ("Drank water", "Stretched", "Took a short break") saving type and timestamp.
  3. **AI-Generated Tips:** The back end calls the Google Gemini API to return a short, optional suggestion based on mood and energy, with hand-written fallback tips if the API fails or is not configured.
  4. **Weekly History:** Simple 7-day list/chart of check-ins and breaks visible only to the user.
  5. **Gentle In-App Reminder:** Non-intrusive on-screen prompt after 45–60 minutes of usage with a dismiss button (no push notifications).
  6. **Support Resources Section:** Always-visible directory with Brazilian support contacts (CVV 188, SAMU 192, and campus student support) and clear non-clinical disclaimers.
- **Alternatives considered:** Allowing multiple check-ins per day, adding push notifications, and building complex analytics charts.
- **Rationale:** Limiting to one check-in per day and minimal actions keeps the data model simple and ensures a complete, bug-free product before Sunday's 23:59 code freeze.

## 24/11/2026 — Explicit Exclusions (Out of Scope)
- **Decision:** Explicitly exclude clinical diagnosis/therapy, comparative wellness scores/streaks, sensitive health data collection, public mood exposure, native mobile apps, social login, and all optional extras (breathing timer, weekly reflection, custom habits, silent mode) until the core MVP is tested.
- **Alternatives considered:** Including a 1-minute breathing timer and silent mode in the initial sprint.
- **Rationale:** Avoiding scores and clinical claims respects ethical boundaries and prevents user anxiety. Cutting optional extras and external integrations protects the 5-day timeline (if extra time remains on Saturday, silent mode is the lowest-cost addition).

## 24/11/2026 — Unified JavaScript Stack, Testing & CI
- **Decision:** Build a mobile-first web app in **Portuguese** using **React + Vite (JavaScript, HTML, and CSS)** on the front-end and **Node.js + Express (JavaScript)** on the back-end. Use **Vitest** for front-end tests, Node's built-in **`node --test`** runner for back-end tests, and **GitHub Actions (`node-version: 20`)** for CI, while keeping repository documentation bilingual (English and pt-BR).
- **Alternatives considered:** TypeScript across both layers; Tailwind CSS; Python (FastAPI) or Java (Spring Boot) on the back-end; Jest for testing; native Android/iOS apps.
- **Rationale:** Using plain JavaScript with standard HTML/CSS across the entire stack eliminates build/type-checking overhead and allows all 4 members to contribute and review PRs quickly during the hackathon. Native `node --test` and Vitest keep dependencies minimal and run fast in GitHub Actions on Node 20, while a Portuguese UI matches the target campus audience.

## 25/11/2026 — Front-End Vitest Suite and Node 20 Compatibility
- **Decision:** Use Vitest with Testing Library and jsdom for focused front-end integration tests, and keep only the MVP-critical behaviors in the initial suite.
- **Alternatives considered:** Continuing to use Jest, adding broad component snapshots, and adding an end-to-end browser suite at the same time.
- **Rationale:** Vitest integrates with Vite and Jest is not needed as the runner. The suite covers navigation, check-ins, account flows, local-data import, breaks, and chat errors. The project currently uses Vite 5.4.21 and Vitest 2.1.9 to remain compatible with Node 20.12.2.

## 26/11/2026 — Accounts, PostgreSQL, and cross-device sync
- **Decision:** Replace device-only persistence with verified email accounts and PostgreSQL so personal records can follow the user between devices. Access requires an authenticated session and records remain private per user.
- **Alternatives considered:** Keep per-device `localStorage`/SQLite or use local storage without sign-in.
- **Rationale:** Local SQLite does not sync across computers. Hosted PostgreSQL enables synchronization; importing browser data requires consent, and anonymous rows from the legacy SQLite database are not automatically assigned to an account.
- **Operations:** Render deployment depends on configuring PostgreSQL, SMTP, and environment secrets. It has not been published or tested against real services yet.

## 24/11/2026 — Database (`better-sqlite3`), Privacy, and Anonymous Device ID (superseded)
- **Decision:** Use **SQLite via `better-sqlite3` with plain SQL** and identify users via an **anonymous per-device ID** stored in the browser, rather than full user accounts.
- **Alternatives considered:** Prisma ORM; email/password authentication with JWT; OAuth social login; PostgreSQL on cloud servers.
- **Status:** Superseded on 26/11/2026 by PostgreSQL and verified accounts; anonymous rows from the legacy SQLite database are not automatically assigned to an account.
- **Rationale:** `better-sqlite3` with plain SQL avoids ORM migration issues, requires zero server setup, and executes synchronously with high reliability in CI. An anonymous per-device ID avoids login friction and is intended to scope each user's history. The ID is not yet connected to server-side records; see the implementation status above.

## 24/11/2026 — AI Safety Rules and Fallback Strategy
- **Decision:** Call the **Google Gemini API** strictly from the back end with a warm, non-directive system prompt. If the check-in indicates intense distress (mood 1 or 2), bypass free-form AI generation and highlight the Support Resources section. Include static hand-written fallback tips in case of API failure.
- **Alternatives considered:** Letting the LLM generate open-ended emotional advice for low mood states.
- **Rationale:** Deterministic routing to human help (CVV 188 / SAMU 192) guarantees safety during distress, while static fallbacks prevent demo failures due to network or quota issues.

---

## Briefing Guiding Questions (Team Alignment)

The answers below are intended behavior and acceptance criteria; use the implementation status above to see what is currently delivered.

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
