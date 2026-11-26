const test = require('node:test');
const assert = require('node:assert');
const Database = require('better-sqlite3');
const { createApp } = require('./server');

test('check-in and pause endpoints validate and persist weekly data', async () => {
  const database = new Database(':memory:');
  const app = createApp(database);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    assert.deepStrictEqual(await healthResponse.json(), { ok: true });

    const invalidCheckin = await fetch(`${baseUrl}/api/checkins`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mood: 6, energy: 3 }),
    });
    assert.strictEqual(invalidCheckin.status, 400);

    const checkinResponse = await fetch(`${baseUrl}/api/checkins`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mood: 2, energy: 3, note: 'Dia cheio' }),
    });
    assert.strictEqual(checkinResponse.status, 201);
    const created = await checkinResponse.json();
    assert.strictEqual(created.showSupportAlert, true);
    assert.ok(created.tip.length > 0);

    const checkinsResponse = await fetch(`${baseUrl}/api/checkins`);
    const checkins = await checkinsResponse.json();
    assert.strictEqual(checkins.length, 1);
    assert.strictEqual(checkins[0].mood, 2);
    assert.strictEqual(checkins[0].note, 'Dia cheio');

    const pauseResponse = await fetch(`${baseUrl}/api/pauses`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'water' }),
    });
    assert.strictEqual(pauseResponse.status, 201);

    const pausesResponse = await fetch(`${baseUrl}/api/pauses`);
    const pauses = await pausesResponse.json();
    assert.strictEqual(pauses.length, 1);
    assert.strictEqual(pauses[0].type, 'water');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    database.close();
  }
});

test('chat validates input and answers urgent messages without calling the AI', async () => {
  delete process.env.GEMINI_API_KEY;
  const database = new Database(':memory:');
  const server = createApp(database).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const post = (body) => fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  try {
    assert.strictEqual((await post({ message: '   ' })).status, 400);

    const urgent = await post({ message: 'não quero mais viver' });
    assert.strictEqual(urgent.status, 200);
    assert.strictEqual((await urgent.json()).supportLevel, 'urgent');

    const suggested = await post({ message: 'oi', mood: 1 });
    assert.strictEqual((await suggested.json()).supportLevel, 'suggested');

    assert.strictEqual((await post({ message: 'oi' })).status, 503);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    database.close();
  }
});