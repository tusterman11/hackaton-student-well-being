# Theme briefing: Student well-being

**English** · [Português (Brasil)](BRIEFING.pt-BR.md)

**Hack with AI: Coding with Intelligence**  
Senac na Prática · Technical Program in Systems Development  
Area: campus life and community  
Immersion from 23 to 29 November · presentations on 30 November and 1 December

This briefing is the starting point for **your** theme. Read it carefully, cut an MVP that fits in one week, and record your decisions. You will turn this problem into a real product, with a front end and a back end, an organized repository, and documented use of AI. This is a collaborative immersion: the panel evaluates what the team built, decided, and learned.

## Theme and context

**Student well-being** — An app for student habits, breaks, and mental health, with AI-generated tips.

The routine of someone who studies — and, this week, of someone who is also building a product on a deadline — squeezes sleep, reduces breaks, and leaves little room to notice tiredness. Generic habit apps can feel heavy, like a demand, or promise what they cannot deliver. What belongs here is light, respectful, and honest support: a reminder to pause, a simple check-in, and a useful tip, without pretending to be clinical care.

You will design this experience for students on campus, with extra care for language, data, and the limits of what AI may suggest.

## Audience and personas

- **A student in an intense week:** needs short breaks and gentle reminders, not another impossible goal.
- **A student who wants to build a small habit:** drinking water, stretching, ending the day at a reasonable time.
- **Anyone on the team who will use the demo:** should find a welcoming tone and a clear path to professional help, if they need it.

## Goal

Ship an MVP in which the student does a simple check-in, logs breaks or habits, receives AI-generated tips that fit that moment, and finds guidance for seeking real help — making it explicit that the app does not replace professional care.

## Minimum requirements (MVP)

The scope below is realistic for one week. Lock it on the first day and record in `DECISIONS.md` what is in, what is out, and why. A complete, demonstrable flow is better than a long list left half-done.

1. A quick daily check-in (for example, mood or energy on a simple scale), in careful language.
2. Log completed breaks or habits (water, stretching, a short pause).
3. Receive AI-generated tips from the check-in, always as a suggestion, never as a diagnosis.
4. See a simple weekly history (check-ins and breaks).
5. A gentle in-app reminder to take a break.
6. A visible support-resources section (generic guidance for seeking professional help) that does not try to “treat” the person.

## Where AI comes in

The use of AI is allowed and encouraged — in the product and in the process — and it must appear in `AI_LOG.md`. Some concrete starting points for this theme:

- Generate short, varied, respectful tips aligned with the day's check-in.
- Avoid a demanding tone or miracle promises; the text should feel like an invitation, not an order.
- Suggest a concrete, short pause that fits a break on campus.
- Point to support resources when the check-in suggests a harder moment — without trying to provide care.

Do not publish, without your review, an AI-generated text or automatic decision as if it were already the final version.

## Optional extras

Only after the MVP is standing. These are ideas, not obligations:

- A simple breathing or one-minute guided-pause timer.
- A short end-of-week reflection written by the person themselves.
- A small list of habits the person chooses to follow.
- A quiet mode, for days when reminders are not welcome.

## Out of scope

To protect the deadline and the focus of the product:

- Diagnosis, therapy, prescriptions, or any claim of clinical care.
- Replacing an emergency service or an official crisis channel.
- Collecting sensitive health data beyond what the MVP truly needs, or exposing someone's mood in a public area.
- A well-being score that pressures the student or compares people with one another.

## Questions to guide the team

Use these questions on the first day, when you define the MVP, and again before the demo:

- How do you keep a tip from being generic, or potentially inappropriate?
- What does the interface do if the person indicates more intense distress? (Show help resources; do not try to provide care.)
- Who can see the check-in history, and how is that data protected?
- How does the team review the tone of the AI before the demo?
- How does the product make its limits explicit at all times — what it is, and what it is not?

## Deliverables and how the panel evaluates

This is a one-week **collaborative immersion**, with teams of 3 or 4 TDS students. The panel evaluates **your** work, on your own project — formative feedback, not a comparison with other teams.

**What must be in the repository** (at the root), in **English** (the main version) and in **Portuguese** (`.pt-BR`), with a language link at the top of each file:

- `README.md` and `README.pt-BR.md`
- `DECISIONS.md` and `DECISIONS.pt-BR.md`
- `AI_LOG.md` and `AI_LOG.pt-BR.md`

The application must have a **front end and a back end**. The back end may be **Java**, **Python**, or **Node.js** (alone or combined, as long as they are integrated). A front end is required (web, desktop, or mobile). Justify the stack in `DECISIONS.md`. Also required: a Conventional Commits history, work through reviewed Pull Requests, a protected `main` branch, and a green **GitHub Actions** pipeline (build, lint, and tests) on PRs and on `main`. Do not commit secrets. On the first day, add the instructor as a collaborator: **adrianoanschau@gmail.com**.

**Code freeze** is on Sunday, **29 November, at 23:59**. Presentations are **15 minutes + 5 minutes of questions**, on 30 November and 1 December, at Senac Canoas, Room 103. Rehearse the demo and the required outline (problem and solution, live demo, workflow, decisions, AI in practice, and CI/CD).

Evaluation is split equally between **two panels**:

- **Technical panel (50%):** code quality and architecture; Git, Conventional Commits, and PRs; CI/CD; command of the code in the Q&A.
- **Innovation and Impact panel (50%):** originality; impact (the real problem and for whom); user experience; clarity of the pitch; creative use of AI.

Anyone on the team may be asked about any part of the project. Use AI thoughtfully, record what it generated and what you corrected, and own the code you present.

Good work — and may the week be intense, collaborative, and well documented.

