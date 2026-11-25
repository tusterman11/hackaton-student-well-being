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
- **AI Contextual Tips:** Short, optional break invitations generated via Claude API based on the check-in, backed by curated fallback tips and strict safety rules.
- **Private 7-Day History:** Per-device isolated view of recent check-ins and breaks without comparative scores.
- **Gentle On-Screen Reminder:** Non-intrusive prompt encouraging a short pause during study sessions.
- **Professional Support Section:** Always-visible directory with real support channels (e.g., CVV - 188, SAMU 192, campus student support), automatically highlighted when high distress is reported.

## Stack

- **Front-end:** React + Vite 5 (JavaScript, HTML, and CSS)
- **Back-end:** Node.js + Express (JavaScript)
- **Database:** SQLite via `better-sqlite3` (plain SQL)
- **AI Integration:** Anthropic Claude API (`@anthropic-ai/sdk`) called exclusively server-side, with safety guardrails and static fallback tips
- **Tests:** Vitest 2 (front-end) and Node's built-in `node --test` (back-end)
- **CI:** GitHub Actions with `node-version: 20`

## Folder structure

```text
/
├── README.md
├── README.pt-BR.md
├── DECISIONS.md
├── DECISIONS.pt-BR.md
├── AI_LOG.md
├── AI_LOG.pt-BR.md
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── db/
│   ├── src/
│   └── tests/
├── frontend/
│   ├── src/
│   └── tests/
└── docs/
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

The repository runs a **GitHub Actions** pipeline (`.github/workflows/ci.yml`) on every Pull Request and push to `main` using `node-version: 20`, executing:
1. **Install:** Dependency installation (`npm ci`).
2. **Test (Back-end):** Automated tests via Node's native runner (`node --test`).
3. **Test (Front-end):** Automated unit tests via Vitest 2 (`npm test`).
4. **Build:** Front-end production bundle verification (`npm run build`).

Branch protection is enabled on `main`: direct pushes are blocked, requiring a Pull Request with at least 1 reviewer approval and a green CI status.

## Deploy

Configured for local execution during the live demonstration (optional deploy targets: Vercel for front-end and Render/Railway for back-end).

## Links

- **Repository:** [[Add GitHub Repo URL](https://github.com/tusterman11/hackaton-student-well-being)]
- **Deploy (if any):** Localhost demo
- **Board / GitHub project (if any):** [[Add GitHub Projects URL](https://github.com/users/tusterman11/projects/2)] 
