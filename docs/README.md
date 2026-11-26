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
- **Private 7-Day History:** Per-device isolated view of recent check-ins and breaks without comparative scores.
- **Gentle On-Screen Reminder:** Non-intrusive prompt encouraging a short pause during study sessions.
- **Professional Support Section:** A dedicated screen with real support channels (e.g., CVV - 188, SAMU 192, and campus student support), accessible from the main navigation.

## Current implementation status

- The check-in and break screens call `POST /api/checkins` and `POST /api/breaks`; values are persisted in SQLite.
- Check-in and pause `GET` routes return records from the latest seven days at `/api/checkins` and `/api/pauses` (`/api/breaks` is an alias for pauses).
- The water, journal, goals, sleep, and study screens store their entries only in browser `localStorage`.
- The chat uses `POST /api/chat`. It calls Gemini only when `GEMINI_API_KEY` is configured in the back end. The key belongs in `backend/.env`, which is ignored by Git; never put it in front-end code or commit it.
- Chat messages are sent to Gemini when AI is configured. The interface asks users not to share identifying details.
- If Gemini is absent or unavailable, chat and check-in tips use fixed fallback responses.
- `GardenView` displays the current session's check-in and break count plus mock weekly values; it is not yet a server-backed weekly chart.
- The gentle reminder is opened by the test button. The planned timed 45–60 minute trigger is not implemented.
- The support screen and its contact links are implemented. The assistant is not a therapist or emergency service.
- The anonymous browser device ID is present in API headers, but it is not currently used to scope SQLite records.

## Stack

- **Front-end:** React + Vite (JavaScript, HTML, and CSS)
- **Back-end:** Node.js + Express (JavaScript)
- **Database:** SQLite via `better-sqlite3` (plain SQL)
- **AI Integration:** The back end uses Google's Gemini API through Node's built-in `fetch` for chat and tips. The API key is read from the server environment.
- **Tests:** The back end has a `node --test` script and eight tests. The front end has Vitest, Testing Library and five integration tests.
- **CI:** `.github/workflows/ci.yml` runs lint, tests and builds for both the back end and front end on pull requests and pushes to `main`.

## Folder structure

```text
/
├── .gitignore
├── .nvmrc
├── backend/
│   ├── .env.example
│   ├── eslint.config.js
│   ├── package.json
│   ├── package-lock.json
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
│   │   │   └── SupportView.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── theme.css
│   │   ├── utils/
│   │   │   └── deviceId.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
```

## How to run

### Prerequisites

- Node.js (v20 or higher)
- npm (v10 or higher)
- Gemini API key configured in `backend/.env` (see `backend/.env.example`)

### Back-end

```bash
cd backend
cp .env.example .env
# Add your GEMINI_API_KEY inside .env
npm install
npm run dev
```

*(Note: The SQLite database file and tables are initialized automatically via `better-sqlite3` on server startup.)*

### Front-end

```bash
cd frontend
npm install
npm run dev
```

## CI/CD

The repository has a working GitHub Actions workflow at [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). It runs on pull requests and pushes to `main`, with separate back-end and front-end jobs that install with `npm ci`, lint, test, and build.

Verified locally on Node 20.12.2:
- Back end: 8 tests passing; lint and syntax build passing.
- Front end: 5 tests passing; lint and Vite build passing.

Vite 7.3.8 prints a Node-version warning in this local environment because it prefers Node 20.19+ or 22.12+, although the local build still completed. The CI job currently uses the major Node 20 line.

## Deploy

Configured for local execution during the live demonstration (optional deploy targets: Vercel for front-end and Render/Railway for back-end).

## Links

- **Repository:** [GitHub repository](https://github.com/tusterman11/hackaton-student-well-being)
- **Deploy (if any):** Localhost demo
- **Board / GitHub project:** [GitHub Projects board](https://github.com/users/tusterman11/projects/2)
