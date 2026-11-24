# Pausa Leve

**English** · [Português (Brasil)](README.pt-BR.md)

> Student well-being web app focused on micro-breaks, gentle habit tracking, and AI-powered self-care suggestions without pressure.

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

Students facing intense study routines, deadlines, and project weeks often neglect sleep, hydration, and short breaks. Existing habit-tracking apps frequently rely on strict streaks, gamification pressure, or clinical promises, which can increase anxiety instead of offering genuine support.

## Solution

**Pausa Leve** is a lightweight, respectful web application designed for campus students. It provides a pressure-free space to pause and check in without clinical claims.

**What the MVP covers:**
- **Quick Daily Check-in:** Simple mood and energy rating using welcoming, non-judgmental language.
- **Micro-Breaks & Habit Log:** One-click tracking for small daily actions (drinking water, stretching, taking a 5-minute break).
- **AI Contextual Tips:** Short, actionable break suggestions tailored to the student's current check-in state (strictly framed as gentle invitations, never medical advice).
- **Weekly Overview:** A calm visual summary of check-ins and completed breaks over the last 7 days without comparative scores.
- **Gentle On-Screen Reminder:** Non-intrusive prompt encouraging a short pause during study sessions.
- **Professional Support Directory:** Always-visible section with real support contacts (e.g., CVV - 188, campus counseling services), automatically highlighted if a student reports high distress.

## Stack

- **Front-end:** React (Vite), TypeScript, Tailwind CSS
- **Back-end:** Python, Node.js
- **Database:** SQLite (via Prisma or native driver)
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`) with strict safety system prompts
- **Testing & Quality:** Vitest / Jest, ESLint, Prettier

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
- A valid AI API Key (configured in `backend/.env` based on `.env.example`)

### Back-end

```bash
cd backend
cp .env.example .env
# Add your AI_API_KEY inside .env
npm install
npm run dev
```

### Front-end

```bash
cd frontend
npm install
npm run dev
```

## CI/CD

The repository uses **GitHub Actions** (`.github/workflows/ci.yml`) triggered automatically on every Pull Request and push to `main`. The pipeline validates:
1. **Linting:** Code style and static analysis (`npm run lint`).
2. **Build:** TypeScript compilation and bundle generation (`npm run build`).
3. **Tests:** Automated unit and integration tests (`npm test`).

Direct pushes to `main` are blocked; all changes require an approved Pull Request and a passing CI check.

## Deploy

Local development setup for live demonstration. Automatic cloud deploy has not been configured yet.

## Links

- **Repository:** [Add GitHub Repo URL]
- **Deploy (if any):** Localhost demo
- **Board / GitHub project (if any):** [Add GitHub Projects URL]
