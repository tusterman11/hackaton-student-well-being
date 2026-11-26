const test = require('node:test');
const assert = require('node:assert/strict');
const { URL, URLSearchParams } = require('node:url');
const { newDb } = require('pg-mem');
const { createApp } = require('./server');
const { migrateDatabase } = require('./database');

async function createFixture() {
  const memory = newDb();
  const { Pool } = memory.adapters.createPg();
  const pool = new Pool();
  await migrateDatabase(pool);
  const sentEmails = [];
  const mailer = {
    sendVerificationEmail: async (to, url) => sentEmails.push({ type: 'verify', to, url }),
    sendPasswordResetEmail: async (to, url) => sentEmails.push({ type: 'reset', to, url })
  };
  const app = createApp({
    pool,
    mailer,
    appBaseUrl: 'http://localhost:5173',
    isProduction: false
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  return {
    baseUrl,
    pool,
    sentEmails,
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
      await pool.end();
    }
  };
}

function post(baseUrl, route, body, session) {
  const headers = { 'content-type': 'application/json' };
  if (session?.cookie) headers.cookie = session.cookie;
  if (session?.csrfToken) headers['x-csrf-token'] = session.csrfToken;
  return fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
}

async function createVerifiedUser(fixture, email) {
  const password = 'a-long-test-password-2026';
  const registration = await post(fixture.baseUrl, '/api/auth/register', { email });
  assert.equal(registration.status, 202);
  const verifyEmail = fixture.sentEmails.find((item) => item.type === 'verify' && item.to === email);
  assert.ok(verifyEmail);
  const token = new URLSearchParams(new URL(verifyEmail.url).hash.slice(1)).get('verify');
  const verification = await post(fixture.baseUrl, '/api/auth/verify-email', { token, password });
  assert.equal(verification.status, 200);
  return password;
}

async function login(fixture, email, password) {
  const response = await post(fixture.baseUrl, '/api/auth/login', { email, password });
  assert.equal(response.status, 200);
  const body = await response.json();
  const cookie = response.headers.get('set-cookie').split(';')[0];
  return { cookie, csrfToken: body.csrfToken, user: body.user };
}

test('email accounts, private records, and local data import are scoped per user', async () => {
  const fixture = await createFixture();
  try {
    assert.deepEqual(await (await fetch(`${fixture.baseUrl}/api/health`)).json(), { ok: true });

    const invalidRegistration = await post(fixture.baseUrl, '/api/auth/register', { email: 'not-an-email' });
    assert.equal(invalidRegistration.status, 400);

    const passwordA = await createVerifiedUser(fixture, 'student-a@example.test');
    const sessionA = await login(fixture, 'student-a@example.test', passwordA);

    assert.equal((await fetch(`${fixture.baseUrl}/api/checkins`)).status, 401);
    assert.equal((await post(fixture.baseUrl, '/api/checkins', { mood: 2, energy: 3 }, { cookie: sessionA.cookie })).status, 403);

    const checkinResponse = await post(
      fixture.baseUrl,
      '/api/checkins',
      { mood: 2, energy: 3, note: 'Dia cheio' },
      sessionA
    );
    assert.equal(checkinResponse.status, 201);
    assert.equal((await checkinResponse.json()).checkin.note, 'Dia cheio');

    const pauseResponse = await post(fixture.baseUrl, '/api/pauses', { type: 'stretch' }, sessionA);
    assert.equal(pauseResponse.status, 201);
    const history = await (await fetch(`${fixture.baseUrl}/api/history`, {
      headers: { cookie: sessionA.cookie }
    })).json();
    assert.equal(history.checkins.length, 1);
    assert.equal(history.pauses.length, 1);

    const imported = await post(fixture.baseUrl, '/api/wellness/import-local', {
      data: {
        hydrationGoalMl: 2250,
        hydration: [{ amount: 300, time: '10:30', date: '2026-11-25T10:00:00.000Z' }],
        journal: [{ title: 'Hoje', body: 'Um registro local', date: '25/11/2026' }],
        habits: [{ label: 'Beber água', done: true, completedDates: ['2026-11-24', '2026-11-25'] }],
        sleep: [{ bed: '23:00', wake: '07:00', quality: 4, date: '25/11/2026' }],
        study: [{ subject: 'Matemática', day: 'Quarta-feira', time: '14:00' }],
        focusSessions: [{ minutes: 25, createdAt: '2026-11-25T18:00:00.000Z' }]
      }
    }, sessionA);
    assert.equal(imported.status, 201);
    assert.deepEqual((await imported.json()).imported, {
      hydration: 1,
      journal: 1,
      habits: 1,
      sleep: 1,
      study: 1,
      focusSessions: 1
    });
    assert.equal((await post(fixture.baseUrl, '/api/wellness/import-local', { data: {} }, sessionA)).status, 409);

    const wellnessA = await (await fetch(`${fixture.baseUrl}/api/wellness`, {
      headers: { cookie: sessionA.cookie }
    })).json();
    assert.equal(wellnessA.hydrationGoalMl, 2250);
    assert.equal(wellnessA.hydration[0].amount, 300);
    assert.equal(String(wellnessA.hydration[0].date).slice(0, 10), '2026-11-25');
    assert.equal(wellnessA.journal[0].body, 'Um registro local');
    assert.equal(wellnessA.habits[0].done, true);
    assert.equal(wellnessA.sleep[0].quality, 4);
    assert.equal(wellnessA.study[0].subject, 'Matemática');
    assert.equal(wellnessA.focusSessions[0].minutes, 25);

    const passwordB = await createVerifiedUser(fixture, 'student-b@example.test');
    const sessionB = await login(fixture, 'student-b@example.test', passwordB);
    const historyB = await (await fetch(`${fixture.baseUrl}/api/history`, {
      headers: { cookie: sessionB.cookie }
    })).json();
    const wellnessB = await (await fetch(`${fixture.baseUrl}/api/wellness`, {
      headers: { cookie: sessionB.cookie }
    })).json();
    assert.equal(historyB.checkins.length, 0);
    assert.equal(historyB.pauses.length, 0);
    assert.equal(wellnessB.hydration.length, 0);

    const deleteOtherUsersRecord = await fetch(
      `${fixture.baseUrl}/api/wellness/journal/${wellnessA.journal[0].id}`,
      {
        method: 'DELETE',
        headers: { cookie: sessionB.cookie, 'x-csrf-token': sessionB.csrfToken }
      }
    );
    assert.equal(deleteOtherUsersRecord.status, 404);
  } finally {
    await fixture.close();
  }
});

test('email verification, password reset, and account sessions are enforced', async () => {
  const fixture = await createFixture();
  try {
    const email = 'student@example.test';
    const guessedPassword = 'attacker-known-password-2026';
    const registration = await post(fixture.baseUrl, '/api/auth/register', {
      email,
      password: guessedPassword
    });
    assert.equal(registration.status, 202);
    assert.notEqual((await post(fixture.baseUrl, '/api/auth/login', {
      email,
      password: guessedPassword
    })).status, 200);

    const verifyToken = new URLSearchParams(new URL(fixture.sentEmails[0].url).hash.slice(1)).get('verify');
    const password = 'victim-chosen-password-2026';
    assert.equal((await post(fixture.baseUrl, '/api/auth/verify-email', { token: verifyToken, password })).status, 200);
    assert.equal((await post(fixture.baseUrl, '/api/auth/verify-email', { token: verifyToken, password })).status, 400);
    assert.equal((await post(fixture.baseUrl, '/api/auth/login', {
      email,
      password: guessedPassword
    })).status, 401);
    const session = await login(fixture, email, password);

    assert.equal((await post(fixture.baseUrl, '/api/auth/password-reset/request', {
      email
    })).status, 200);
    const resetEmail = fixture.sentEmails.find((item) => item.type === 'reset');
    const resetToken = new URLSearchParams(new URL(resetEmail.url).hash.slice(1)).get('reset');
    assert.equal((await post(fixture.baseUrl, '/api/auth/password-reset/confirm', {
      token: resetToken,
      password: 'a-different-long-password-2026'
    })).status, 200);
    assert.equal((await fetch(`${fixture.baseUrl}/api/wellness`, {
      headers: { cookie: session.cookie }
    })).status, 401);
    assert.equal((await post(fixture.baseUrl, '/api/auth/login', {
      email,
      password: 'a-long-test-password-2026'
    })).status, 401);
    assert.equal((await post(fixture.baseUrl, '/api/auth/login', {
      email,
      password: 'a-different-long-password-2026'
    })).status, 200);
  } finally {
    await fixture.close();
  }
});

test('chat requires a signed-in account and valid request data', async () => {
  const fixture = await createFixture();
  try {
    delete process.env.GEMINI_API_KEY;
    assert.equal((await post(fixture.baseUrl, '/api/chat', { message: 'oi' })).status, 401);
    const password = await createVerifiedUser(fixture, 'chat@example.test');
    const session = await login(fixture, 'chat@example.test', password);

    assert.equal((await post(fixture.baseUrl, '/api/chat', { message: '   ' }, session)).status, 400);
    const urgent = await post(fixture.baseUrl, '/api/chat', { message: 'não quero mais viver' }, session);
    assert.equal(urgent.status, 200);
    assert.equal((await urgent.json()).supportLevel, 'urgent');
    assert.equal((await post(fixture.baseUrl, '/api/chat', { message: 'oi' }, session)).status, 503);
  } finally {
    await fixture.close();
  }
});
