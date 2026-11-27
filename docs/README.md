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
- **Micro-Break Log:** One-click logging for small actions such as stretching or taking a short break.
- **AI Companion Chat:** A conversation on the “Conversa” tab, handled by the back-end through the Google Gemini API with a fixed, supportive system prompt. It offers optional small breaks, does not diagnose, and points users to human support when appropriate.
- **Private 7-Day History:** Per-account view of recent check-ins and breaks without comparative scores.
- **Manual Gentle On-Screen Reminder:** A non-intrusive prompt can be opened from the home screen; it does not appear automatically.
- **Professional Support Section:** A dedicated screen with real support resources (CVV 188, SAMU 192, and campus student support). The phone links are user-initiated `tel:` links; they open the device's call handler when available and do not place calls automatically.

## Current implementation status

- **Accounts:** Open email registration, email verification, password login, logout, and password reset are implemented. Registration and password reset require working SMTP settings. Each account is scoped by its authenticated user ID.
- **PostgreSQL persistence:** Check-ins, breaks, habit goals, water, sleep, and settings are stored in PostgreSQL, scoped to each account. The server applies schema migrations at startup. Previously saved journal and study records remain archived in the database, but are no longer displayed, changed, or imported. The `DATABASE_URL` must point to the persistent Render PostgreSQL service in production.
- **Local data import:** On first sign-in, the app offers to import supported habit goals, hydration, and sleep records from browser `localStorage`. Those local copies are removed only after a successful import. Old journal and study data are neither imported nor deleted; they remain archived in the browser.
- **Chat:** `POST /api/chat` uses Gemini when `GEMINI_API_KEY` is configured. Per-account conversation history is stored in PostgreSQL and the latest messages are restored after signing in. Users can delete their conversation. Gemini receives the current message, recent chat context, and a short seven-day numeric summary of check-ins, breaks, hydration, and sleep.
- **Privacy:** The Gemini key stays on the server. The chat screen explains what is stored and what summary is sent to Gemini. Users should avoid including identifying details in chat.
- **Demo account:** `DEMO_ACCOUNT_ENABLED=true` enables one shared demonstration account. It is for fictional presentation data only; normal sign-up is open and does not require an allowlist. Disable the demo account for public use if it is no longer needed.
- **Local development:** The back end redirects `http://localhost:3000` to the Vite front end at `http://localhost:5173`; Vite proxies `/api` to the back end. In production, Express serves `frontend/dist`.
- **Support and reminders:** The CVV 188 and SAMU 192 links are implemented as user-initiated `tel:` links. Actual calling depends on a device call handler; the app does not automatically call or dispatch emergency services. The reminder can be opened manually; an automatic 45–60 minute timer is not implemented. The assistant is not a health professional or emergency service.
- **External service verification:** Real SMTP delivery, a live Gemini request with a valid key, and the production Render/PostgreSQL deployment still require environment-specific verification.
- **Presentation scope:** Journal and study planning remain outside the interface and active API routes. The Goals tab supports account-scoped personal goals, daily completion, and progress without rankings or pressure.

## Stack

- **Front-end:** React + Vite (JavaScript, HTML, and CSS)
- **Back-end:** Node.js + Express (JavaScript)
- **Database:** PostgreSQL via `pg` (plain SQL and startup migrations)
- **Authentication and email:** Account sessions are protected by `HttpOnly` cookies and CSRF checks. Nodemailer sends verification and password-reset messages using any SMTP provider.
- **AI Integration:** The back end calls Google's Gemini API. The API key is read from the server environment.
- **Runtime:** Node.js `20.12.2` (root `.nvmrc`; backend engine requires `>=20.12.0`)
- **Front-end tooling:** Vite `^5.4.10` (lockfile resolves `5.4.21`), Vitest `^2.1.9` (lockfile resolves `2.1.9`), React `18.3.1`, and jsdom `26.1.0`.
- **Tests and CI:** The backend uses `node --test`; the frontend uses Vitest and Testing Library. `.github/workflows/ci.yml` runs lint, tests, and builds for both packages on pull requests and pushes to `main`.
- **Latest local verification (27/11/2026):** Backend 11/11 tests, lint, and build passed; frontend 13/13 tests, lint, and build passed after installing from its lockfile with `npm ci`.

## Folder structure

```text
/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── .nvmrc
├── backend/
│   ├── .env.example
│   ├── auth.js
│   ├── database.js
│   ├── email.js
│   ├── eslint.config.js
│   ├── gemini.js
│   ├── gemini.test.js
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── server.test.js
│   ├── tips.js
│   ├── tips.test.js
│   └── wellness.js
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
│   │   │   ├── AuthView.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   ├── BreaksView.jsx
│   │   │   ├── ChatView.jsx
│   │   │   ├── GardenView.jsx
│   │   │   ├── GentleReminder.jsx
│   │   │   ├── HomeView.jsx
│   │   │   ├── PersonalViews.jsx
│   │   │   └── SupportView.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── theme.css
│   │   ├── test/
│   │   │   └── setup.js
│   │   ├── utils/
│   │   │   ├── appStorage.js
│   │   │   └── deviceId.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── App.test.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
```

## How to run

### Prerequisites

- Node.js `20.12.2` (use the version in `.nvmrc`)
- npm compatible with Node.js 20.12.2
- PostgreSQL and a `DATABASE_URL`
- SMTP credentials to enable email registration and password reset
- Gemini API key for AI replies (optional for the rest of the app)

### Back-end

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL, APP_BASE_URL, FRONTEND_ORIGIN and SMTP values in .env.
# Add GEMINI_API_KEY only if you want to enable AI replies.
npm ci
npm run dev
```

The server applies PostgreSQL migrations at startup. For local development, use a local PostgreSQL database and set `APP_BASE_URL` and `FRONTEND_ORIGIN` to `http://localhost:5173`.

### Front-end

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. The Vite development server forwards `/api` requests to `localhost:3000`.

## CI/CD

The repository has a working GitHub Actions workflow at [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). It runs on pull requests and pushes to `main`, with separate back-end and front-end jobs that install with `npm ci`, lint, test, and build.

The workflow uses Node 20 and runs each package's lint, test, and build scripts. The project's local Node version is pinned separately in `.nvmrc` to `20.12.2`.

## Deploy on Render

Use one Node web service to run the back end and serve the built front end, plus a Render PostgreSQL database. Set the web service build command to `npm --prefix backend ci --omit=dev && npm --prefix frontend ci --include=dev && npm --prefix frontend run build` and the start command to `npm --prefix backend start`. Configure `NODE_ENV=production`, `DATABASE_URL`, `APP_BASE_URL` and `FRONTEND_ORIGIN` using the public HTTPS URL of the service, plus the Gemini and SMTP variables if those features are enabled. Set `SMTP_FROM` to a sender address accepted by the chosen provider. Keep `DEMO_ACCOUNT_ENABLED=false` for normal public use unless a shared demo login is intentionally offered. Add secrets in Render's Environment settings; do not commit them.

The app accepts any authenticated SMTP service; Brevo is not required. Gmail SMTP uses `smtp.gmail.com`, port `587`, `SMTP_SECURE=false`, the full Gmail address as `SMTP_USER`, and a Google App Password as `SMTP_PASS`. Google requires 2-Step Verification for app passwords, and some managed or protected accounts cannot create them. Use a dedicated sender mailbox and never put its normal sign-in password in Render. **Render Free web services block outbound SMTP ports 25, 465, and 587**, so Gmail SMTP works locally or on a paid Render web service, but not on Render Free. Some providers also support SMTP on port `2525`; for example, Mailgun documents that port. Render's current block list does not include `2525`, so a provider that supports it may work with the existing SMTP mailer, subject to provider account/domain verification and a connectivity check. An email provider's HTTPS API on port `443` is another option, but the current mailer would need an API integration for it.

## Email setup on Render Free

### Mailjet SMTP example

Mailjet documents SMTP host `in-v3.mailjet.com` and supports port `2525`. Create an account, validate the sender address or domain, then find the SMTP API key and secret under Account settings → SMTP and SEND API settings. In the Render web service's Environment settings, add:

```env
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailjet-api-key
SMTP_PASS=your-mailjet-secret-key
SMTP_FROM="EntrePausas <verified-sender@example.com>"
```

Save and deploy the service, then test registration using an email address you can access. Do not commit the credentials. Mailjet currently lists a free plan with 6,000 messages per month and a 200-per-day limit; check its current pricing and account requirements before relying on those limits.

- **Mailjet SMTP setup:** [SMTP relay configuration](https://dev.mailjet.com/docs/smtp-relay/configuration)
- **Render environment settings:** [Environment variables and secrets](https://render.com/docs/configure-environment-variables)
- **Mailjet plan details:** [Pricing](https://www.mailjet.com/pricing/)

## Links

- **Repository:** [GitHub repository](https://github.com/tusterman11/hackaton-student-well-being)
- **Deploy (if any):** Localhost demo
- **Board / GitHub project:** [GitHub Projects board](https://github.com/users/tusterman11/projects/2)
