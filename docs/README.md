# EntrePausas

**English** · [Português (Brasil)](README.pt-BR.md)

> Mobile-first student well-being web app for micro-breaks, gentle habit logging, and AI-powered self-care suggestions without pressure.

## Team

- **Class:** TDS — mixed groups 6570, 6756, and 6863
- **Tech Lead:** Guilherme Ferreira
- **Presentation Lead:** Matheus Epifanio de Souza
- **Members:**
  - Guilherme Ferreira (6570) — [GitHub](https://github.com/tusterman11)
  - Guilherme (6756) — [GitHub](https://github.com)
  - Matheus Epifanio de Souza — [GitHub](https://github.com/MatheusEpifanio017)
  - João Queiróz — [GitHub](https://github.com/joao-queiros)

## Theme / Area

Student well-being (Bem-estar estudantil) — campus life and community.

## Problem

Students facing intense study routines, deadlines, and project weeks often neglect sleep, hydration, and short breaks. Generic habit apps frequently rely on rigid streaks, performance scores, or clinical promises, increasing anxiety instead of offering genuine support.

## Solution

**EntrePausas** is a lightweight, respectful, mobile-first web application built for campus students. It provides a pressure-free space to pause and check in while explicitly stating that it does not replace professional care. Its chat assistant is named **Interlude**.

**What the MVP covers:**
- **Quick Daily Check-in:** Simple mood and energy rating with welcoming, non-judgmental wording.
- **Micro-Breaks & Habit Log:** One-click logging for small actions (drinking water, stretching, taking a 5-minute break).
- **AI Companion Chat:** A conversation on the “Conversa” tab, handled by the back-end through the Google Gemini API with a fixed, supportive system prompt. It offers optional small breaks, does not diagnose, and points users to human support when appropriate.
- **Private 7-Day History:** Account-scoped view of recent check-ins and breaks without comparative scores.
- **Gentle On-Screen Reminder:** Non-intrusive prompt encouraging a short pause during study sessions.
- **Professional Support Section:** A dedicated screen with real support channels (e.g., CVV - 188, SAMU 192, and campus student support), accessible from the main navigation.

## Current implementation status

- Account registration requires email verification; users set their password after opening the verification link. Login and password reset use `HttpOnly` session cookies, CSRF protection, and rate limits.
- Check-ins, breaks, hydration, journal entries, goals, sleep, and study schedules are associated with the signed-in account and stored in PostgreSQL. Reads and changes are scoped to the authenticated user.
- After sign-in, users can consent to importing legacy `localStorage` entries. Local copies are removed only after a successful import; entries without a reliable date are assigned today's date. Anonymous check-ins and breaks from the old SQLite database are not automatically attributed to an account.
- The chat calls Gemini through `POST /api/chat` when `GEMINI_API_KEY` is configured. Messages are sent to Gemini for replies, but the app does not persist conversation history. Avoid sharing identifying details.
- SMTP is required for registration and password recovery. PostgreSQL and SMTP still need to be configured in the runtime environment; **the app has not been deployed to Render**.
- In production, the app serves the built front end and API on the same origin, which is required by the current session-cookie setup.
- The support screen and its contact links are implemented. The assistant is not a therapist or emergency service.

## Stack

- **Front-end:** React + Vite (JavaScript, HTML, and CSS)
- **Back-end:** Node.js + Express (JavaScript)
- **Database:** PostgreSQL via `pg` (parameterized SQL and startup migration)
- **AI Integration:** The back end uses Google's Gemini API through Node's built-in `fetch` for chat and tips. The API key is read from the server environment.
- **Email:** SMTP via Nodemailer for account verification and password recovery.
- **Tests:** `node --test` for the back end and Vitest/Testing Library for the front end.
- **CI:** No GitHub Actions workflow is present in the current feature branch.

## Folder structure

```text
/
├── .gitignore
├── .nvmrc
├── backend/
│   ├── .env.example
│   ├── auth.js
│   ├── database.js
│   ├── email.js
│   ├── package.json
│   ├── wellness.js
│   ├── server.js
│   └── server.test.js
├── docs/
│   ├── AI_LOG.md
│   ├── AI_LOG.pt-BR.md
│   ├── BRIEFING.md
│   ├── BRIEFING.pt-BR.md
│   ├── DECISIONS.md
│   ├── DECISIONS.pt-BR.md
│   ├── README.md
│   └── README.pt-BR.md
├── frontend/
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── BottomNav.jsx
│   │   │   ├── BreaksView.jsx
│   │   │   ├── ChatView.jsx
│   │   │   ├── GardenView.jsx
│   │   │   ├── GentleReminder.jsx
│   │   │   ├── HomeView.jsx
│   │   │   ├── AuthView.jsx
│   │   │   ├── PersonalViews.jsx
│   │   │   └── SupportView.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── theme.css
│   │   ├── utils/
│   │   │   ├── appStorage.js
│   │   │   └── deviceId.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
```

## How to run

### Prerequisites

- Node.js 20.12.2 (see `.nvmrc`)
- npm (v10 or higher)
- Local PostgreSQL or an accessible `DATABASE_URL`
- SMTP credentials to test registration and password recovery
- Gemini API key is optional and only needed to enable AI replies

### Back-end

In PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
# Edit .env: DATABASE_URL and SMTP credentials are required for accounts.
npm ci
npm run dev
```

The server applies the PostgreSQL schema migration on startup. `GEMINI_API_KEY` can remain empty if the AI feature is not needed.

### Front-end

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Vite proxies `/api` requests to the server at `localhost:3000`.

## CI/CD

The current branch has no GitHub Actions workflow. Run `npm test`, `npm run lint`, and `npm run build` in both `backend/` and `frontend/` for local checks.

## Deploy

Deployment has not been performed. To publish using a Render Web Service:

1. Create a Render PostgreSQL database and set the service's `DATABASE_URL` to its internal connection URL.
2. Set `NODE_ENV=production`, `APP_BASE_URL`, and `FRONTEND_ORIGIN` to the same public HTTPS origin as the service.
3. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`. Set `GEMINI_API_KEY` only if AI chat should be enabled.
4. Use build command `npm --prefix backend ci --omit=dev && npm --prefix frontend ci --include=dev && npm --prefix frontend run build` and start command `npm --prefix backend start`. Render provides `PORT`; the PostgreSQL migration runs on startup.
5. For a temporary demo account without email, set `DEMO_ACCOUNT_ENABLED=true`, `DEMO_EMAIL=demo@entrepausas.test`, and `DEMO_PASSWORD` to a 12-128 character password. The server creates this account with synthetic records and blocks demo access when the variable is set back to `false`.
6. Never commit credentials or use real personal data in the demo account.

The front end and API must remain on the same domain for cookie sessions to work. A live PostgreSQL/SMTP test and deployment are still pending.

## Links

- **Repository:** [GitHub repository](https://github.com/tusterman11/hackaton-student-well-being)
- **Deploy (if any):** Localhost demo
- **Board / GitHub project:** [GitHub Projects board](https://github.com/users/tusterman11/projects/2)
