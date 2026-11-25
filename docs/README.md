# Pausa Leve

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

**Pausa Leve** is a lightweight, respectful, mobile-first web application built for campus students. It provides a pressure-free space to pause and check in while explicitly stating that it does not replace professional care.

**What the MVP covers:**
- **Quick Daily Check-in:** Simple mood and energy rating with welcoming, non-judgmental wording.
- **Micro-Breaks & Habit Log:** One-click logging for small actions (drinking water, stretching, taking a 5-minute break).
- **AI Companion Chat:** A conversation on the “Conversa” tab, handled by the back-end through the Claude API with a fixed, supportive system prompt. It offers optional small breaks, does not diagnose, and points users to human support when appropriate.
- **Private 7-Day History:** Per-device isolated view of recent check-ins and breaks without comparative scores.
- **Gentle On-Screen Reminder:** Non-intrusive prompt encouraging a short pause during study sessions.
- **Professional Support Section:** A dedicated screen with real support channels (e.g., CVV - 188, SAMU 192, and campus student support), accessible from the main navigation.

## Current implementation status

- The check-in and break screens work in the front end, but the server does not yet provide `/api/checkins`, `/api/breaks`, or `/api/history`; those actions use front-end fallback state and are not persisted by the server.
- The chat uses `POST /api/chat`. It calls Claude only when `ANTHROPIC_API_KEY` is configured in the back end. The key belongs in `backend/.env`, which is ignored by Git; never put it in front-end code or commit it. Chat messages are sent to Anthropic to generate replies, so users should avoid sharing identifying details.
- The server creates a SQLite `checkins` table, but the current API does not connect that table to check-ins or chat history.
- `GardenView` still displays sample weekly data. The reminder is currently opened manually with the test button.
- The support screen and its contact links are implemented. The assistant is not a therapist or emergency service.

## Stack

- **Front-end:** React + Vite 5 (JavaScript, HTML, and CSS)
- **Back-end:** Node.js + Express (JavaScript)
- **Database:** SQLite via `better-sqlite3` (plain SQL)
- **AI Integration:** The back-end uses Anthropic Claude (`@anthropic-ai/sdk`) for the chat route. The API key is read from the server environment.
- **Tests:** The back end has a `node --test` script and test file. Vitest is installed in the front end, but no front-end test script or test suite is configured yet.
- **CI:** No GitHub Actions workflow is present in the current feature branch.

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
- Anthropic API Key configured in `backend/.env` (see `backend/.env.example`)

### Back-end

```bash
cd backend
cp .env.example .env
# Add your ANTHROPIC_API_KEY inside .env
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

The current feature branch has no GitHub Actions workflow. Available checks are the back-end `npm test` and the front-end `npm run lint` / `npm run build`. Configure a workflow and front-end tests before describing them as active CI checks.

## Deploy

Configured for local execution during the live demonstration (optional deploy targets: Vercel for front-end and Render/Railway for back-end).

## Links

- **Repository:** [GitHub repository](https://github.com/tusterman11/hackaton-student-well-being)
- **Deploy (if any):** Localhost demo
- **Board / GitHub project:** [GitHub Projects board](https://github.com/users/tusterman11/projects/2)
