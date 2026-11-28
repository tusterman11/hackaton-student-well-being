# Project decisions

**English** · [Português (Brasil)](DECISIONS.pt-BR.md)

Record the team's important decisions here. Each entry should be short and state what was decided, the alternatives considered and the reason for the choice.

## Implementation status — 27/11/2026 (`feat/entrepausas-postgres-auth`)

- **Accounts:** Open email registration, email verification, password login, logout, and password reset are implemented. Sessions use secure cookies, CSRF checks, and rate limits. SMTP is required to deliver verification and reset links; the app supports any authenticated SMTP provider.
- **Render email delivery:** Render Free blocks outbound SMTP ports 25, 465, and 587. Gmail SMTP therefore needs a local or paid Render service. A provider that supports port 2525 may work with the current SMTP mailer; an HTTPS email API is another option but needs an integration.
- **Presentation scope:** Journal and study planning remain removed from navigation, screens, and active routes. Habit goals are available again in the Goals tab, with daily completion and personal progress without rankings or pressure. The hydration goal remains on the Water tab.
- **Persistence:** PostgreSQL stores account-scoped check-ins, pauses, habit goals, hydration, sleep, settings, and chat messages. Previously saved journal and study records remain archived in their existing tables and are neither deleted nor accessible through the app.
- **Local import:** The first account session can import supported habit goals, hydration, and sleep records from browser storage after consent. Old journal and study copies are neither imported nor deleted; they remain archived in the browser.
- **Demo account:** An optional shared demo account is controlled by `DEMO_ACCOUNT_ENABLED`, `DEMO_EMAIL`, and `DEMO_PASSWORD`. It must contain synthetic data and should be disabled when a shared demo is unnecessary.
- **Chat and Gemini:** The server stores conversation turns per account and restores up to the latest 100 in the interface. Gemini receives the latest conversation context and a compact seven-day summary of check-ins, breaks, hydration, and sleep. Users can delete chat history. The Gemini key stays server-side.
- **Node and Vite versions:** Keep Node at `20.12.2` from `.nvmrc`. Front-end declarations are Vite `^5.4.10` (lockfile `5.4.21`) and Vitest `^2.1.9` (lockfile `2.1.9`); do not upgrade these independently of the Node compatibility requirement.
- **Interface:** The desktop sidebar expands on hover and the mobile layout uses a compact menu button. The light/dark theme preference is stored in the browser. During development, `localhost:3000` redirects to Vite at `localhost:5173`; production serves `frontend/dist` from Express.
- **Support and reminders:** CVV 188 and SAMU 192 are user-initiated `tel:` links; calling depends on a compatible device handler. The app does not place calls or dispatch emergency services automatically. The reminder is manual; the automatic 45–60 minute timer is not implemented. The assistant is not a professional or emergency service.
- **CI and local verification:** `.github/workflows/ci.yml` runs install, lint, tests, and builds for both packages on pull requests and pushes to `main`. On 27/11/2026, backend tests (11/11), lint, and build passed; frontend tests (13/13), lint, and build passed.

Historical entries below record decisions and assumptions at the time; the implementation status above is the current source of truth where they differ.

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
- **Decision:** Explicitly exclude clinical diagnosis/therapy, comparative wellness scores/streaks, sensitive health data collection, public mood exposure, native mobile apps, social login, and optional extras (breathing timer, weekly reflection, silent mode) until the core MVP is tested.
- **Alternatives considered:** Including a 1-minute breathing timer and silent mode in the initial sprint.
- **Rationale:** Avoiding scores and clinical claims respects ethical boundaries and prevents user anxiety. Cutting optional extras and external integrations protects the 5-day timeline (if extra time remains on Saturday, silent mode is the lowest-cost addition).

## 24/11/2026 — Unified JavaScript Stack, Testing & CI
- **Decision:** Build a mobile-first web app in **Portuguese** using **React + Vite (JavaScript, HTML, and CSS)** on the front-end and **Node.js + Express (JavaScript)** on the back-end. Use **Vitest** for front-end tests, Node's built-in **`node --test`** runner for back-end tests, and **GitHub Actions (`node-version: 20`)** for CI, while keeping repository documentation bilingual (English and pt-BR).
- **Alternatives considered:** TypeScript across both layers; Tailwind CSS; Python (FastAPI) or Java (Spring Boot) on the back-end; Jest for testing; native Android/iOS apps.
- **Rationale:** Using plain JavaScript with standard HTML/CSS across the entire stack eliminates build/type-checking overhead and allows all 4 members to contribute and review PRs quickly during the hackathon. Native `node --test` and Vitest keep dependencies minimal and run fast in GitHub Actions on Node 20, while a Portuguese UI matches the target campus audience.

## 25/11/2026 — Front-End Vitest Suite and Node 20 Compatibility
- **Decision:** Use Vitest with Testing Library and jsdom for focused front-end integration tests, and keep only the MVP-critical behaviors in the initial suite.
- **Alternatives considered:** Continuing to use Jest, adding broad component snapshots, and adding an end-to-end browser suite at the same time.
- **Rationale:** Vitest integrates with Vite and Jest is not needed as the runner. The first suite covers navigation, successful and distressed check-ins, break registration and chat failures. Vitest 3.2.4 and jsdom 26.1.0 are used because they are compatible with the lab environment's Node 20.12.2; package versions will be reviewed before upgrading Node or Vite.

## 24/11/2026 — Database (`better-sqlite3`), Privacy, and Anonymous Device ID
- **Decision:** Use **SQLite via `better-sqlite3` with plain SQL** and identify users via an **anonymous per-device ID** stored in the browser, rather than full user accounts.
- **Alternatives considered:** Prisma ORM; email/password authentication with JWT; OAuth social login; PostgreSQL on cloud servers.
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
   - Authenticated account routes scope records to the signed-in user's ID in PostgreSQL. There are no public feeds. The older SQLite/device-ID design below is historical and is no longer the active architecture.
4. **How is the AI's tone reviewed by the team before the demo?**
   - A team review of live AI outputs and tone is still pending; record the review and any prompt changes in `AI_LOG.md` before presenting.
5. **How does the product make its limits explicit at all times?**
   - Limits are stated in the Support and chat screens; the app does not currently show a permanent banner on every screen. The text explains that the app is not therapy, medical advice, or an emergency service.
