const path = require('node:path');
const express = require('express');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'app.db'));
db.exec(`CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mood INTEGER NOT NULL,
  energy INTEGER NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

if (require.main === module) {
  app.listen(3000, () => console.log('http://localhost:3000'));
}

module.exports = app;