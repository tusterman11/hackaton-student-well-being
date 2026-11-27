# EntrePausas

**English** · [Português (Brasil)](README.pt-BR.md)

EntrePausas is a mobile-first Portuguese student well-being web app for check-ins, micro-breaks, optional Gemini-powered conversations and links to real support resources.

For the complete project guide, team information and current implementation status, see [docs/README.md](docs/README.md).

## Quick start

```bash
cd backend
cp .env.example .env
npm install
npm run dev

# In a second terminal
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The back-end runs on `http://localhost:3000`.

## Verification

```bash
cd backend
npm test
npm run lint
npm run build

cd ../frontend
npm test
npm run lint
npm run build
```

The working GitHub Actions workflow is [`.github/workflows/ci.yml`](.github/workflows/ci.yml). It runs on pull requests and pushes to `main`.
