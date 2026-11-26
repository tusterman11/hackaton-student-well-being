# AI Log

**English** · [Português (Brasil)](AI_LOG.pt-BR.md)

This log records how the team used AI in the process: what we asked, what the AI generated, what we reviewed, and what we kept or changed. Add a new entry every time AI is used.

**Status legend:** Adopted (used as suggested) · Adapted (used with changes) · Rejected (not used) · Pending (still under team review)

All entries below are from the same tool and date unless stated otherwise: Claude (Claude Sonnet 5.5, claude.ai chat), 2026-11-24, asked by the Tech Lead.

## Entries

### 001: Choosing the technology stack
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat)
- **Context:** Project briefing and README template (Student well-being theme) were shared with the AI.
- **Prompt / purpose:** Asked for guidance on the best technologies for the project and how to start it.
- **What the AI generated:** A recommended stack (Node.js + TypeScript back-end with Fastify or Express, React + Vite + TypeScript front-end with Tailwind, SQLite with Prisma, an AI API called only from the back-end with a fallback of hand-written tips and a safety layer for low check-ins, Vitest, ESLint/Prettier, GitHub Actions), a suggested split of work among 4 people, and a day-by-day plan up to code freeze.
- **What the team reviewed / changed:** The suggested stack did not fit our machines (see entries 006 to 009). We dropped TypeScript, Fastify, Prisma and Tailwind and kept React, Vite (pinned to version 5), Node.js with Express, and SQLite.
- **Status:** Adapted. Justification goes in `DECISIONS.md`.

### 002: Kickoff plan for the Tech Lead
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat)
- **Prompt / purpose:** Told the AI the stack was chosen and that the user is the Tech Lead; asked how to start.
- **What the AI generated:** An ordered kickoff checklist: add collaborators (including the instructor), protect `main`, create the monorepo skeleton and install commands, a CI workflow (lint, test, build on PRs and `main`), initial `DECISIONS.md` and `AI_LOG.md`, a contribution convention (branches, Conventional Commits, no self-merge), an API contract to agree on before coding, and team habits for the week.
- **What the team reviewed / changed:** The install commands depended on the original stack and were replaced by entry 010. The process parts (collaborators, branch protection, CI on PRs and `main`, Conventional Commits, reviewed PRs) are kept. The CI Node version changed from 22 to 20 to match our machines. _Team to confirm._
- **Status:** Adapted

### 003: Generating this AI log
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat)
- **Prompt / purpose:** Asked whether the AI use must be documented in the AI log and asked the AI to generate the log entries from the conversation.
- **What the AI generated:** The first version of this file and its Portuguese version, with entries for the conversation so far. Later updated to include entries 004 to 013.
- **What the team reviewed / changed:** _To be completed by the team. Confirm the entries are accurate and fill in anything the AI could not know._
- **Status:** Pending

### 004: Concept questions (Fastify vs React, GitHub Actions)
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat)
- **Prompt / purpose:** Asked whether Fastify is like React, and whether GitHub Actions is required.
- **What the AI generated:** An explanation that React builds the browser interface while Fastify (like Express) is a server framework that exposes an API. Confirmation that the briefing requires a green GitHub Actions pipeline (build, lint, tests) on PRs and on `main`, with advice to create it on day one.
- **What the team reviewed / changed:** The CI requirement matches the briefing. _Team to confirm._
- **Status:** Adopted

### 005: MVP scope suggestion
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat)
- **Prompt / purpose:** Asked what to put in the MVP scope.
- **What the AI generated:** The six minimum MVP items from the briefing cut to their smallest working size, safety rules (low check-in skips free-form AI text and shows support resources, a visible notice about the app's limits, a human tone review of the AI before the demo), an explicit out-of-scope list, and open decisions to settle (login or anonymous device ID, one check-in per day, interface language).
- **What the team reviewed / changed:** _To be completed by the team. Support contact numbers suggested by the AI must be checked before publishing. Final scope goes in `DECISIONS.md`._
- **Status:** Pending

### 006: Prisma errors and Node version requirement
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat)
- **Prompt / purpose:** Reported the error from `prisma init --datasource-provider sqlite`, then the error from installing Prisma 7.
- **What the AI generated:** The first command (from entry 001) was written for Prisma 7, but the CLI had become version 8, so it failed. After a web search of the Prisma docs, the AI recommended pinning Prisma 7. That install then failed because Prisma requires Node.js 20.19+, 22.12+ or 24+, and our machines have Node 20.12.2.
- **What the team reviewed / changed:** We found both problems from the real CLI and npm error messages, which showed the AI's first command was outdated. We dropped Prisma and use plain SQL with SQLite instead.
- **Status:** Rejected

### 007: Workarounds for the Node restriction
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat)
- **Prompt / purpose:** Reported that we cannot install Node on the lab PCs (admin blocked), and asked about using Node through VS Code and for an alternative to Prisma.
- **What the AI generated:** Options: portable Node zip, VS Code terminal PATH setting, GitHub Codespaces, Drizzle ORM with SQLite, and Python with Flask as a simpler alternative.
- **What the team reviewed / changed:** The portable Node attempt did not work on our PC. We decided to stay on the Node 20.12.2 already installed and pick compatible package versions instead of changing tools.
- **Status:** Rejected

### 008: Simplifying the stack to what the team knows
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat)
- **Prompt / purpose:** Asked for the simplest possible version, in any language, using what we already know (JavaScript and a little SQLite), and asked whether TypeScript was possible.
- **What the AI generated:** A simple setup with plain JavaScript, Express, `better-sqlite3`, Node's built-in test runner and an ESLint config, plus the point that TypeScript only needs a working Node.
- **What the team reviewed / changed:** We chose JavaScript (no TypeScript), Express and SQLite with plain SQL.
- **Status:** Adopted

### 009: React and Vite version requirements
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat), with a web search of the Vite documentation
- **Prompt / purpose:** Asked which version React requires.
- **What the AI generated:** An explanation that React has no Node requirement, but Vite does: Vite 7 needs Node 20.19+ or 22.12+, while Vite 5 works on Node 18 and 20+. It recommended scaffolding with Vite 5.
- **What the team reviewed / changed:** We decided on React with Vite, JavaScript, HTML, CSS and SQLite. The actual project later used Vite 7.3.8 and Vitest 3.2.4, which require Node compatibility checks with the lab environment.
- **Status:** Adopted

### 010: Step-by-step setup walkthrough
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat)
- **Prompt / purpose:** Asked for a guided, fresh-start setup for the final stack.
- **What the AI generated:** Clean-slate steps, root files, the Express back-end skeleton with a health endpoint and a test, the React/Vite front-end with an `/api` proxy, a GitHub Actions workflow for both folders, the first PR and branch-protection steps, and team onboarding steps.
- **What the team reviewed / changed:** The back-end was set up as described. The back-end test failed on the first run (entry 011). _Team to complete after the front-end and CI are verified._
- **Status:** Pending

### 011: Debugging the failing back-end test
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat)
- **Prompt / purpose:** Reported that the back-end test failed after following entry 010.
- **What the AI generated:** A list of likely causes (the `better-sqlite3` native module not loading, `localhost` resolving differently on Windows, the test not exiting, wrong file name) and a more robust version of the test that uses `127.0.0.1` and always closes the server. The exact error was not available to the AI.
- **What the team reviewed / changed:** The team found the real cause: the installed `better-sqlite3` version was not supported by Node 20.12.2, so the test failed when loading the database (the first cause the AI listed). The team downgraded `better-sqlite3` to 12.4.1 and the test now passes. The version should be pinned without `^` and recorded in `DECISIONS.md`.
- **Status:** Adapted (the AI listed the cause among several possibilities; the team confirmed it and chose the fix)

### 012: Pinning the SQLite package version
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat)
- **Prompt / purpose:** Reported that the failing test was caused by a `better-sqlite3` version unsupported by Node 20.12.2, fixed by downgrading to 12.4.1.
- **What the AI generated:** Advice to pin the exact version without `^`, commit `package-lock.json`, have teammates use `npm ci`, check that CI installs it, and record the reason in `DECISIONS.md`. It also updated entry 011 of this log with the real cause and fix.
- **What the team reviewed / changed:** _To be completed by the team. Confirm that `package.json` pins `better-sqlite3` at 12.4.1 and that CI installs it correctly._
- **Status:** Pending

### 013: Commit messages for the setup phases
- **Date:** 2026-11-24
- **Who:** Tech Lead
- **Tool:** Claude (Claude Sonnet 5.5, claude.ai chat)
- **Prompt / purpose:** Asked what commit message to use after finishing the root files and back-end setup.
- **What the AI generated:** Two Conventional Commits messages (`chore: add gitignore and nvmrc` and `feat(backend): scaffold express server with health endpoint and sqlite`), a `git status` check to avoid committing `node_modules` and the database file, and a short guide to the message format.
- **What the team reviewed / changed:** _To be completed by the team._
- **Status:** Pending

### 014: Front-end debugging and responsive layout
- **Date:** 2026-11-25
- **Who:** Matheus Epifanio de Souza (Presentation Lead)
- **Tool:** OpenAI Codex (coding assistant)
- **Prompt / purpose:** Asked for help diagnosing the blank localhost page, then requested a responsive desktop/mobile layout and a larger daily reflection field prepared for a future AI integration, without adding the AI integration yet.
- **What the AI generated:** A front-end review found that `App.jsx` imported `BreaksView`, while `BreaksView.jsx` exported a duplicate `GardenView`; a dedicated breaks screen was added. The front end was made responsive, with a full-window desktop layout and no page scrollbar at desktop widths. The single-line note input became a 1,000-character textarea with a counter, and its draft is kept when switching tabs. The page title and language metadata were also updated. No AI connection was added.
- **What the team reviewed / changed:** Matheus confirmed the mobile layout looked good and asked for the desktop layout to use the full screen without scrolling. The desktop layout was adjusted to match that feedback. The production build completed successfully after the changes; the team should still review the desktop appearance at its target screen sizes.
- **Status:** Adapted

### 015: Gemini chat integration for the student support companion
- **Date:** 2026-11-25
- **Who:** Matheus Epifanio de Souza (Presentation Lead)
- **Tool:** OpenAI Codex (coding assistant)
- **Prompt / purpose:** Asked how to configure a Gemini API key safely and connect a supportive Portuguese chat in the front end to a server-side prompt. The desired companion should suggest small, optional campus-friendly actions and point students to the professional contacts in the Support section when they feel distressed.
- **What the AI generated:** Added a “Conversa” screen and `POST /api/chat` using Node's built-in `fetch` and Google's Gemini API. The server owns the fixed system prompt, limits message/history sizes, keeps the API key out of the browser, and returns support guidance for distress or urgent-risk messages. Added `backend/.env.example`, Node's `.env` loading for local development, and a Vite `/api` proxy. The interface explains that messages should not contain identifying details.
- **What the team reviewed / changed:** Matheus described the companion's tone and examples (such as asking whether a water fountain is nearby), and asked for professional contacts to be recommended during distress. The prompt was constrained to avoid diagnoses, avoid assuming local campus knowledge, and distinguish emotional support from emergencies. No real API key was shared or committed. Front-end and back-end builds passed. A later live verification showed that the configured key is not valid and that the provider fallback remains active until it is replaced.
- **Status:** Adapted (code implemented; live Gemini call pending a valid local key)

### 016: Vitest setup and essential front-end tests
- **Date:** 2026-11-25
- **Who:** Team
- **Tool:** GitHub Copilot in VS Code
- **Prompt / purpose:** Asked for a test analysis and then requested only the most necessary Vitest tests for the front end.
- **What the AI generated:** A focused test plan, Vitest configuration for the Vite project, Testing Library setup, five integration tests in `src/App.test.jsx`, and package-script and dependency adjustments. The tests cover main-view navigation, check-in submission and feedback, automatic support navigation for low mood, break registration, and chat API error handling.
- **What the team reviewed / changed:** The team kept Vitest instead of Jest because the project uses Vite and kept the suite limited to high-value MVP behaviors. Vitest 5 and jsdom 29 were replaced with Node 20-compatible versions (Vitest 3.2.4 and jsdom 26.1.0). The test setup includes DOM cleanup and a browser `scrollIntoView` shim. Assertions and navigation selectors were adjusted to avoid duplicate text matches and ambiguous queries. The final suite has five passing tests.
- **Status:** Adapted

### 017: EntrePausas rebrand and visual experience updates
- **Date:** 2026-11-26
- **Who:** Matheus Epifanio de Souza (Presentation Lead)
- **Tool:** OpenAI Codex (coding assistant)
- **Prompt / purpose:** Over the conversation, requested a switch from Claude to Gemini without changing Node or Vite versions; a front end inspired by the supplied designs and responsive on phones; a local back-end root that opens the current Vite front end; hover-responsive desktop navigation; a compact mobile menu; dark mode; improved dark-mode readability; and a product rename to EntrePausas with the Gemini assistant named Interlude.
- **What the AI generated:** Updated the chat privacy text and removed the unused Anthropic SDK. Reworked the visual layer, added browser-local water, journal, goals, sleep and study screens, expandable desktop navigation and a floating mobile menu, plus a browser-persisted theme switch. The local server root redirects to Vite during development and continues serving `frontend/dist` in production. Updated the brand in the front end, READMEs and decisions; the Gemini prompt identifies its assistant as Interlude. Browser-storage keys were migrated while preserving existing values. No Node or Vite version was changed.
- **What the team reviewed / changed:** The user gave several rounds of feedback on responsiveness, sidebar expansion/collapse, hover highlighting, square home-header corners, dark mode, the mobile menu's green color, and dark-text contrast. The implementation was refined to match. The front-end build was not confirmed in this conversation because the process produced no output and had to be stopped.
- **Status:** Adapted

### 018: Documentation aligned with the working project
- **Date:** 2026-11-26
- **Who:** GitHub Copilot in VS Code
- **Tool:** Copilot SDK
- **Prompt / purpose:** Update project documentation to match the implemented application and explicitly document the working CI workflow.
- **What the AI generated:** Updated the English and Portuguese project READMEs, added root READMEs, updated the front-end README, and corrected the implementation status, test counts, API routes, and CI/CD sections in the documentation.
- **What the team reviewed / changed:** The code was verified locally before the documentation update: 8 back-end tests and 5 front-end tests pass, both linters pass, and both builds pass. The team should keep the Gemini key and live-provider status as environment-specific information rather than a committed secret.
- **Status:** Adapted

## Review notes

_Use this section for team-level observations. Draft observations from the conversation so far, to be confirmed or edited by the team:_

- The AI's first stack suggestion assumed newer tool versions than our lab machines support. Real error messages (Prisma CLI, Node version check) were what showed this.
- A command the AI gave for Prisma was for an outdated version, so commands from AI must be checked against current documentation and our actual Node version.
- The team has not yet reviewed the tone and safety of AI-generated tips; that review still needs its own entry before the demo.
