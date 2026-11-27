# EntrePausas Front-end

React + Vite application for the EntrePausas student well-being experience.

## Available screens

- Home check-in and AI tip
- Break logging
- Garden-style weekly summary
- Interlude chat
- Support resources
- Water, journal, habits, sleep and study views

The check-in and break services call the Express API. Water, journal, habits, sleep and study entries are stored in browser `localStorage`; they are not sent to the server.

## Development

```bash
npm install
npm run dev
```

Vite runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:3000`.

## Verification

```bash
npm test
npm run lint
npm run build
```

The front-end suite currently contains five Vitest/Testing Library integration tests.
