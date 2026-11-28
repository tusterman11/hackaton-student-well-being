const test = require('node:test');
const assert = require('node:assert/strict');
const { URL, URLSearchParams } = require('node:url');
const { newDb, DataType } = require('pg-mem');
const { createApp } = require('./server');
const { migrateDatabase } = require('./database');
const { ensureDemoAccount } = require('./auth');

async function createFixture({ demoAccountEnabled = false } = {}) {
  const memory = newDb();
  memory.public.registerFunction({
    name: 'length',
    args: [DataType.text],
    returns: DataType.integer,
    implementation: (value) => value?.length ?? null
  });
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
    isProduction: false,
    demoAccountEnabled
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  return {
    baseUrl,
    pool,
    mailer,
    sentEmails,
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
      await pool.end();
    }
  };
}

test('configured demo account signs in without email and contains only synthetic wellness records', async () => {
  const fixture = await createFixture({ demoAccountEnabled: true });
  try {
    const email = 'demo@entrepausas.test';
    const password = 'demo-presentation-password-2026';
    const demo = await ensureDemoAccount(fixture.pool, {
      DEMO_ACCOUNT_ENABLED: 'true',
      DEMO_EMAIL: email,
      DEMO_PASSWORD: password
    });

    assert.equal(demo.created, true);
    assert.equal(fixture.sentEmails.length, 0);
    const session = await login(fixture, email, password);
    const wellness = await (await fetch(`${fixture.baseUrl}/api/wellness`, {
      headers: { cookie: session.cookie }
    })).json();
    assert.equal(wellness.hydration.length, 2);
    assert.equal(wellness.sleep.length, 1);
    for (const collection of ['journal', 'study', 'focusSessions']) {
      assert.equal(Object.hasOwn(wellness, collection), false);
    }
    for (const table of ['journal_entries', 'habits', 'study_sessions', 'focus_sessions']) {
      const archivedRows = await fixture.pool.query(`SELECT COUNT(*)::INTEGER AS count FROM ${table} WHERE user_id = $1`, [demo.id]);
      assert.equal(archivedRows.rows[0].count, 0);
    }

    const disabledApp = createApp({
      pool: fixture.pool,
      mailer: fixture.mailer,
      appBaseUrl: 'http://localhost:5173',
      isProduction: false,
      demoAccountEnabled: false
    });
    const disabledServer = disabledApp.listen(0, '127.0.0.1');
    await new Promise((resolve) => disabledServer.once('listening', resolve));
    try {
      const disabledBaseUrl = `http://127.0.0.1:${disabledServer.address().port}`;
      const me = await fetch(`${disabledBaseUrl}/api/auth/me`, {
        headers: { cookie: session.cookie }
      });
      assert.deepEqual(await me.json(), { user: null, csrfToken: null });
      assert.equal((await fetch(`${disabledBaseUrl}/api/wellness`, {
        headers: { cookie: session.cookie }
      })).status, 401);
    } finally {
      await new Promise((resolve) => disabledServer.close(resolve));
    }

    const repeated = await ensureDemoAccount(fixture.pool, {
      DEMO_ACCOUNT_ENABLED: 'true',
      DEMO_EMAIL: email,
      DEMO_PASSWORD: password
    });
    assert.equal(repeated.created, false);
    assert.equal((await fetch(`${fixture.baseUrl}/api/wellness`, {
      headers: { cookie: session.cookie }
    })).status, 401);
  } finally {
    await fixture.close();
  }
});

test('demo account setup never takes over a regular account', async () => {
  const fixture = await createFixture();
  try {
    const email = 'student@example.test';
    const password = await createVerifiedUser(fixture, email);
    await assert.rejects(
      ensureDemoAccount(fixture.pool, {
        DEMO_ACCOUNT_ENABLED: 'true',
        DEMO_EMAIL: email,
        DEMO_PASSWORD: 'demo-presentation-password-2026'
      }),
      { code: 'DEMO_EMAIL_IN_USE' }
    );
    assert.equal((await post(fixture.baseUrl, '/api/auth/login', { email, password })).status, 200);
  } finally {
    await fixture.close();
  }
});

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
    const userA = await fixture.pool.query('SELECT id FROM users WHERE email = $1', ['student-a@example.test']);
    const databaseToday = new Date().toISOString().slice(0, 10);
    await fixture.pool.query(
      'INSERT INTO journal_entries (user_id, title, body) VALUES ($1, $2, $3)',
      [userA.rows[0].id, 'Arquivo antigo', 'Este texto deve permanecer arquivado.']
    );
    const archivedHabit = await fixture.pool.query(
      'INSERT INTO habits (user_id, label) VALUES ($1, $2) RETURNING id',
      [userA.rows[0].id, 'Hábito antigo']
    );
    await fixture.pool.query(
      'INSERT INTO habit_completions (user_id, habit_id, completed_on) VALUES ($1, $2, $3)',
      [userA.rows[0].id, archivedHabit.rows[0].id, databaseToday]
    );
    await fixture.pool.query(
      'INSERT INTO study_sessions (user_id, subject, day) VALUES ($1, $2, $3)',
      [userA.rows[0].id, 'Estudo antigo', 'Segunda-feira']
    );
    await fixture.pool.query(
      'INSERT INTO focus_sessions (user_id, duration_minutes) VALUES ($1, $2)',
      [userA.rows[0].id, 25]
    );

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
        journal: [{ title: 'Hoje', body: 'Não deve ser importado', date: '25/11/2026' }],
        habits: [{ label: 'Meta local', done: true, completedDates: ['2026-11-24', '2026-11-25'] }],
        sleep: [{ bed: '23:00', wake: '07:00', quality: 4, date: '25/11/2026' }],
        study: [{ subject: 'Não deve ser importado', day: 'Quarta-feira', time: '14:00' }],
        focusSessions: [{ minutes: 25, createdAt: '2026-11-25T18:00:00.000Z' }]
      }
    }, sessionA);
    assert.equal(imported.status, 201);
    assert.deepEqual((await imported.json()).imported, {
      hydration: 1,
      habits: 1,
      sleep: 1
    });
    assert.equal((await post(fixture.baseUrl, '/api/wellness/import-local', { data: {} }, sessionA)).status, 409);

    const wellnessA = await (await fetch(`${fixture.baseUrl}/api/wellness`, {
      headers: { cookie: sessionA.cookie }
    })).json();
    assert.equal(wellnessA.hydrationGoalMl, 2250);
    assert.equal(wellnessA.hydration[0].amount, 300);
    assert.equal(String(wellnessA.hydration[0].date).slice(0, 10), '2026-11-25');
    assert.equal(wellnessA.sleep[0].quality, 4);
    assert.ok(wellnessA.habits.some((habit) => habit.label === 'Hábito antigo'));
    assert.ok(wellnessA.habits.some((habit) => habit.label === 'Meta local'));
    for (const collection of ['journal', 'study', 'focusSessions']) {
      assert.equal(Object.hasOwn(wellnessA, collection), false);
    }
    const archivedJournal = await fixture.pool.query(
      'SELECT body FROM journal_entries WHERE user_id = $1',
      [userA.rows[0].id]
    );
    const archivedHabits = await fixture.pool.query(
      'SELECT label FROM habits WHERE user_id = $1',
      [userA.rows[0].id]
    );
    const archivedStudies = await fixture.pool.query(
      'SELECT subject FROM study_sessions WHERE user_id = $1',
      [userA.rows[0].id]
    );
    const archivedFocus = await fixture.pool.query(
      'SELECT duration_minutes FROM focus_sessions WHERE user_id = $1',
      [userA.rows[0].id]
    );
    assert.deepEqual(archivedJournal.rows.map((row) => row.body), ['Este texto deve permanecer arquivado.']);
    assert.deepEqual(archivedHabits.rows.map((row) => row.label).sort(), ['Hábito antigo', 'Meta local'].sort());
    assert.deepEqual(archivedStudies.rows.map((row) => row.subject), ['Estudo antigo']);
    assert.deepEqual(archivedFocus.rows.map((row) => row.duration_minutes), [25]);

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
    assert.equal(wellnessB.habits.length, 0);

    for (const collection of ['journal', 'study']) {
      assert.equal((await post(`${fixture.baseUrl}`, `/api/wellness/${collection}`, {}, sessionB)).status, 404);
    }

    const newHabitResponse = await post(fixture.baseUrl, '/api/wellness/habits', { label: 'Alongar' }, sessionB);
    assert.equal(newHabitResponse.status, 201);
    const newHabit = await newHabitResponse.json();
    assert.equal(newHabit.label, 'Alongar');
    const completion = await fetch(`${fixture.baseUrl}/api/wellness/habits/${newHabit.id}/completion`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        cookie: sessionB.cookie,
        'x-csrf-token': sessionB.csrfToken
      },
      body: JSON.stringify({ done: true, date: databaseToday })
    });
    assert.equal(completion.status, 200);
    assert.deepEqual(await completion.json(), { id: String(newHabit.id), done: true });

    const savedCompletion = await fixture.pool.query(
      'SELECT completed_on FROM habit_completions WHERE user_id = $1 AND habit_id = $2 AND completed_on = $3',
      [sessionB.user.id, newHabit.id, databaseToday]
    );
    assert.equal(savedCompletion.rowCount, 1);

    const invalidHabit = await post(fixture.baseUrl, '/api/wellness/habits', { label: '   ' }, sessionB);
    assert.equal(invalidHabit.status, 400);
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
