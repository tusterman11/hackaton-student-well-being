# Project decisions

**English** · [Português (Brasil)](DECISIONS.pt-BR.md)

Record the team's important decisions here. Each entry should be short and state what was decided, the alternatives considered and the reason for the choice.

## Implementation status — 26/11/2026 (`feat/frontend-setup`)

The decisions below describe the intended product; they are not a statement that every feature is complete. Current implementation:

- **Daily check-in:** The form is implemented in React and calls `POST /api/checkins`; the server validates and persists check-ins in SQLite. Once-per-day enforcement is not implemented.
- **Break logging:** The buttons and list are implemented in the front end and call `POST /api/breaks`; the server persists pauses in SQLite.
- **AI chat:** `POST /api/chat` calls Google Gemini through Node's built-in `fetch` when `GEMINI_API_KEY` is configured in `backend/.env`. The server prompt defines a supportive, non-clinical role; urgent risk phrases receive a fixed response with support contacts. The key is not committed, and a real live reply requires a valid key.
- **Brand and assistant identity:** The product is named **EntrePausas** and its chat assistant introduces herself as **Interlude**. The name is used in the interface, page title, and Gemini system prompt.
- **Interface:** The front end uses an expandable desktop sidebar and a compact floating menu on mobile. Light/dark themes are switchable and the preference is stored in the browser. Additional personal screens store their data in the browser only.
- **Local development:** The back end redirects `localhost:3000` to Vite at `localhost:5173` during development; in production it serves `frontend/dist` with `NODE_ENV=production`.
- **Gemini verification:** The last recorded live check, on 25/11/2026, returned `API key not valid`. The key was changed afterward; the current configuration still needs a live call to confirm it works.
- **Weekly history:** `GardenView` currently renders mock data; it is not connected to saved check-ins or breaks.
- **Gentle reminder:** The reminder can be opened with the “Test reminder” button. The planned 45–60 minute timer is not implemented.
- **Support resources:** The support screen and contact links are implemented. The chat can show CVV 188 and SAMU 192 links for urgent risk; the assistant is not a professional or an emergency service.
- **Storage and privacy:** The server creates SQLite `checkins` and `pauses` tables. The anonymous device ID is generated in the browser but is not yet connected to server records. Chat history remains in front-end memory and is sent to Gemini to generate replies; it is not stored in SQLite.
- **Tests and CI:** The back end has a `node --test` script and test file. The front end now runs five Vitest integration tests covering navigation, check-in submission, low-mood support routing, break registration and chat error handling. No GitHub Actions workflow is present in this branch.

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
   - Only the user on their own device. Records are isolated by an anonymous per-device UUID in SQLite, with no public feeds, usernames, or sensitive medical data stored.
4. **How is the AI's tone reviewed by the team before the demo?**
   - All 4 members test sample prompts and review generated outputs before Saturday's freeze, logging prompt adjustments and rejected outputs in `AI_LOG.md`.
5. **How does the product make its limits explicit at all times?**
   - A permanent disclaimer banner in the UI and inside the Support Resources section states: *"This app supports daily breaks and habits. It is not therapy, medical advice, or an emergency service."*
