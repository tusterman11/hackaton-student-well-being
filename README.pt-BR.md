# EntrePausas

[English](README.md) · **Português (Brasil)**

EntrePausas é uma aplicação web mobile-first, em português, para bem-estar estudantil: check-ins, micro-pausas, conversa opcional com Gemini e links para recursos reais de apoio.

Para o guia completo do projeto, equipe e status atual da implementação, consulte [docs/README.pt-BR.md](docs/README.pt-BR.md).

## Início rápido

```bash
cd backend
cp .env.example .env
npm install
npm run dev

# Em outro terminal
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. O back-end roda em `http://localhost:3000`.

## Verificação

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

O workflow ativo do GitHub Actions está em [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Ele roda em pull requests e pushes na `main`.
