const { Router } = require('express');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const WEEKDAYS = new Set([
  'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira',
  'Sexta-feira', 'Sábado', 'Domingo'
]);
const MAX_IMPORT_ITEMS = 250;

function isDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function validText(value, maxLength, allowEmpty = false) {
  return typeof value === 'string'
    && value.length <= maxLength
    && (allowEmpty || value.trim().length > 0);
}

function legacyDate(value, fallback) {
  if (isDate(value)) return value;
  if (typeof value === 'string') {
    const isoDate = value.slice(0, 10);
    if (isDate(isoDate)) return isoDate;
  }
  const match = typeof value === 'string' ? value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/) : null;
  if (!match) return fallback;
  const date = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  return isDate(date) ? date : fallback;
}

function dateOffset(date, offset) {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + offset);
  return result.toISOString().slice(0, 10);
}

function validateImport(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  if (data.today !== undefined && !isDate(data.today)) return false;
  for (const key of ['hydration', 'journal', 'habits', 'sleep', 'study', 'focusSessions']) {
    if (data[key] !== undefined && (!Array.isArray(data[key]) || data[key].length > MAX_IMPORT_ITEMS)) {
      return false;
    }
  }
  const hydrationGoalMl = data.hydrationGoalMl === undefined ? 2000 : Number(data.hydrationGoalMl);
  if (!Number.isInteger(hydrationGoalMl) || hydrationGoalMl < 250 || hydrationGoalMl > 10000) return false;
  const hydration = data.hydration || [];
  const journal = data.journal || [];
  const habits = data.habits || [];
  const sleep = data.sleep || [];
  const study = data.study || [];
  const focusSessions = data.focusSessions || [];
  if (hydration.some((item) => !item || !Number.isInteger(Number(item.amount)) || Number(item.amount) < 1 || Number(item.amount) > 5000)) return false;
  if (journal.some((item) => !item || !validText(item.body, 5000) || !validText(item.title || '', 100, true))) return false;
  if (habits.some((item) => !item
    || !validText(item.label, 100)
    || (item.done !== undefined && typeof item.done !== 'boolean')
    || (item.completedDates !== undefined
      && (!Array.isArray(item.completedDates) || item.completedDates.length > MAX_IMPORT_ITEMS || item.completedDates.some((date) => !isDate(date)))))) return false;
  if (sleep.some((item) => !item || !TIME_PATTERN.test(item.bed || '') || !TIME_PATTERN.test(item.wake || '') || !Number.isInteger(Number(item.quality)) || Number(item.quality) < 1 || Number(item.quality) > 5)) return false;
  if (study.some((item) => !item || !validText(item.subject, 200) || !WEEKDAYS.has(item.day) || (item.time !== '' && !TIME_PATTERN.test(item.time || '')))) return false;
  if (focusSessions.some((item) => !item
    || !Number.isInteger(Number(item.minutes))
    || Number(item.minutes) < 5
    || Number(item.minutes) > 180
    || (item.createdAt !== undefined && (typeof item.createdAt !== 'string' || Number.isNaN(Date.parse(item.createdAt)))))) return false;
  return true;
}

async function transaction(pool, callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function createWellnessRouter({ pool, requireAuth, requireCsrf }) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res) => {
    const userId = req.auth.user.id;
    const today = isDate(req.query.date) ? req.query.date : new Date().toISOString().slice(0, 10);
    const firstDay = dateOffset(today, -6);
    const [settings, hydration, journal, habits, sleep, study, focusSessions, habitCompletions] = await Promise.all([
      pool.query('SELECT hydration_goal_ml, local_imported_at FROM user_settings WHERE user_id = $1', [userId]),
      pool.query(
        `SELECT id, amount_ml AS amount, recorded_on AS date, created_at
         FROM hydration_records WHERE user_id = $1 ORDER BY recorded_on DESC, created_at DESC LIMIT 1000`,
        [userId]
      ),
      pool.query(
        `SELECT id, title, body, entry_date AS date
         FROM journal_entries WHERE user_id = $1 ORDER BY entry_date DESC, created_at DESC LIMIT 1000`,
        [userId]
      ),
      pool.query(
        `SELECT h.id, h.label, (c.habit_id IS NOT NULL) AS done
         FROM habits h LEFT JOIN habit_completions c
           ON c.user_id = h.user_id AND c.habit_id = h.id AND c.completed_on = $2
         WHERE h.user_id = $1 ORDER BY h.created_at DESC LIMIT 500`,
        [userId, today]
      ),
      pool.query(
        `SELECT id, bed_time AS bed, wake_time AS wake, quality, sleep_date AS date
         FROM sleep_records WHERE user_id = $1 ORDER BY sleep_date DESC, created_at DESC LIMIT 1000`,
        [userId]
      ),
      pool.query(
        `SELECT id, subject, day, study_time AS time
         FROM study_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 500`,
        [userId]
      ),
      pool.query(
        `SELECT id, duration_minutes AS minutes, completed_at AS "createdAt"
         FROM focus_sessions WHERE user_id = $1 ORDER BY completed_at DESC LIMIT 500`,
        [userId]
      ),
      pool.query(
        `SELECT completed_on AS date, COUNT(*)::INTEGER AS count
         FROM habit_completions WHERE user_id = $1 AND completed_on BETWEEN $2 AND $3
         GROUP BY completed_on ORDER BY completed_on`,
        [userId, firstDay, today]
      )
    ]);

    return res.json({
      hydrationGoalMl: settings.rows[0]?.hydration_goal_ml ?? 2000,
      localImportAvailable: settings.rows[0]?.local_imported_at == null,
      hydration: hydration.rows,
      journal: journal.rows,
      habits: habits.rows,
      sleep: sleep.rows,
      study: study.rows,
      focusSessions: focusSessions.rows,
      habitCompletions: habitCompletions.rows
    });
  });

  router.patch('/settings', requireCsrf, async (req, res) => {
    const goal = req.body?.hydrationGoalMl;
    if (!Number.isInteger(goal) || goal < 250 || goal > 10000) {
      return res.status(400).json({ error: 'INVALID_GOAL', message: 'A meta deve ficar entre 250 e 10.000 ml.' });
    }
    await pool.query(
      'INSERT INTO user_settings (user_id, hydration_goal_ml) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET hydration_goal_ml = EXCLUDED.hydration_goal_ml',
      [req.auth.user.id, goal]
    );
    return res.json({ hydrationGoalMl: goal });
  });

  router.post('/import-local', requireCsrf, async (req, res) => {
    const data = req.body?.data;
    const skip = req.body?.skip === true;
    if (!skip && !validateImport(data)) {
      return res.status(400).json({ error: 'INVALID_IMPORT', message: 'Não foi possível validar os dados locais para importação.' });
    }

    const userId = req.auth.user.id;
    const today = isDate(data?.today) ? data.today : new Date().toISOString().slice(0, 10);
    const counts = { hydration: 0, journal: 0, habits: 0, sleep: 0, study: 0, focusSessions: 0 };
    const result = await transaction(pool, async (client) => {
      const settings = await client.query(
        'SELECT local_imported_at FROM user_settings WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      if (settings.rows[0]?.local_imported_at) return { alreadyImported: true };

      const payload = skip ? {} : data;
      const hydrationGoalMl = payload.hydrationGoalMl === undefined ? 2000 : Number(payload.hydrationGoalMl);
      await client.query(
        'INSERT INTO user_settings (user_id, hydration_goal_ml, local_imported_at) VALUES ($1, $2, NOW()) ON CONFLICT (user_id) DO UPDATE SET hydration_goal_ml = $2, local_imported_at = NOW()',
        [userId, hydrationGoalMl]
      );

      for (const item of payload.hydration || []) {
        await client.query(
          'INSERT INTO hydration_records (user_id, amount_ml, recorded_on) VALUES ($1, $2, $3)',
          [userId, Number(item.amount), legacyDate(item.date, today)]
        );
        counts.hydration += 1;
      }
      for (const item of payload.journal || []) {
        await client.query(
          'INSERT INTO journal_entries (user_id, title, body, entry_date) VALUES ($1, $2, $3, $4)',
          [userId, item.title || '', item.body, legacyDate(item.date, today)]
        );
        counts.journal += 1;
      }
      for (const item of payload.habits || []) {
        const inserted = await client.query(
          'INSERT INTO habits (user_id, label) VALUES ($1, $2) RETURNING id',
          [userId, item.label.trim()]
        );
        const completedDates = new Set([
          ...(item.completedDates || []),
          ...(item.done ? [today] : [])
        ]);
        for (const completedOn of completedDates) {
          await client.query(
            'INSERT INTO habit_completions (user_id, habit_id, completed_on) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [userId, inserted.rows[0].id, completedOn]
          );
        }
        counts.habits += 1;
      }
      for (const item of payload.sleep || []) {
        await client.query(
          'INSERT INTO sleep_records (user_id, bed_time, wake_time, quality, sleep_date) VALUES ($1, $2, $3, $4, $5)',
          [userId, item.bed, item.wake, Number(item.quality), legacyDate(item.date, today)]
        );
        counts.sleep += 1;
      }
      for (const item of payload.study || []) {
        await client.query(
          'INSERT INTO study_sessions (user_id, subject, day, study_time) VALUES ($1, $2, $3, $4)',
          [userId, item.subject.trim(), item.day, item.time || '']
        );
        counts.study += 1;
      }
      for (const item of payload.focusSessions || []) {
        await client.query(
          'INSERT INTO focus_sessions (user_id, duration_minutes, completed_at) VALUES ($1, $2, COALESCE($3::timestamptz, NOW()))',
          [userId, Number(item.minutes), item.createdAt || null]
        );
        counts.focusSessions += 1;
      }
      return { alreadyImported: false };
    });

    if (result.alreadyImported) {
      return res.status(409).json({ error: 'IMPORT_ALREADY_COMPLETED', message: 'Os dados locais desta conta já foram processados.' });
    }
    return res.status(201).json({ imported: counts });
  });

  router.post('/:collection', requireCsrf, async (req, res) => {
    const { collection } = req.params;
    const userId = req.auth.user.id;
    const body = req.body || {};
    if (collection === 'hydration') {
      const { amount, date } = body;
      if (!Number.isInteger(amount) || amount < 1 || amount > 5000 || (date !== undefined && !isDate(date))) {
        return res.status(400).json({ error: 'INVALID_HYDRATION', message: 'Informe uma quantidade entre 1 e 5.000 ml.' });
      }
      const result = await pool.query(
        `INSERT INTO hydration_records (user_id, amount_ml, recorded_on) VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE))
         RETURNING id, amount_ml AS amount, recorded_on AS date, created_at`,
        [userId, amount, date || null]
      );
      return res.status(201).json(result.rows[0]);
    }
    if (collection === 'journal') {
      const { title = '', body: entryBody, date } = body;
      if (!validText(title, 100, true) || !validText(entryBody, 5000) || (date !== undefined && !isDate(date))) {
        return res.status(400).json({ error: 'INVALID_JOURNAL', message: 'Informe um texto de até 5.000 caracteres.' });
      }
      const result = await pool.query(
        `INSERT INTO journal_entries (user_id, title, body, entry_date) VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE))
         RETURNING id, title, body, entry_date AS date`,
        [userId, title.trim(), entryBody.trim(), date || null]
      );
      return res.status(201).json(result.rows[0]);
    }
    if (collection === 'habits') {
      if (!validText(body.label, 100)) {
        return res.status(400).json({ error: 'INVALID_HABIT', message: 'Informe um nome de hábito de até 100 caracteres.' });
      }
      const result = await pool.query(
        'INSERT INTO habits (user_id, label) VALUES ($1, $2) RETURNING id, label, FALSE AS done',
        [userId, body.label.trim()]
      );
      return res.status(201).json(result.rows[0]);
    }
    if (collection === 'sleep') {
      const { bed, wake, quality, date } = body;
      if (!TIME_PATTERN.test(bed || '') || !TIME_PATTERN.test(wake || '') || !Number.isInteger(quality) || quality < 1 || quality > 5 || (date !== undefined && !isDate(date))) {
        return res.status(400).json({ error: 'INVALID_SLEEP', message: 'Informe horários válidos e qualidade de 1 a 5.' });
      }
      const result = await pool.query(
        `INSERT INTO sleep_records (user_id, bed_time, wake_time, quality, sleep_date) VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE))
         RETURNING id, bed_time AS bed, wake_time AS wake, quality, sleep_date AS date`,
        [userId, bed, wake, quality, date || null]
      );
      return res.status(201).json(result.rows[0]);
    }
    if (collection === 'study') {
      const { subject, day, time = '' } = body;
      if (!validText(subject, 200) || !WEEKDAYS.has(day) || (time !== '' && !TIME_PATTERN.test(time))) {
        return res.status(400).json({ error: 'INVALID_STUDY', message: 'Informe uma atividade, dia e horário válidos.' });
      }
      const result = await pool.query(
        'INSERT INTO study_sessions (user_id, subject, day, study_time) VALUES ($1, $2, $3, $4) RETURNING id, subject, day, study_time AS time',
        [userId, subject.trim(), day, time]
      );
      return res.status(201).json(result.rows[0]);
    }
    return res.status(404).json({ error: 'RESOURCE_NOT_FOUND', message: 'Recurso não encontrado.' });
  });

  router.patch('/journal/:id', requireCsrf, async (req, res) => {
    const { title = '', body, date } = req.body || {};
    if (!/^\d+$/.test(req.params.id) || !validText(title, 100, true) || !validText(body, 5000) || !isDate(date)) {
      return res.status(400).json({ error: 'INVALID_JOURNAL', message: 'Confira o título, texto e data do registro.' });
    }
    const result = await pool.query(
      `UPDATE journal_entries SET title = $1, body = $2, entry_date = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5 RETURNING id, title, body, entry_date AS date`,
      [title.trim(), body.trim(), date, req.params.id, req.auth.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'ENTRY_NOT_FOUND', message: 'Registro não encontrado.' });
    return res.json(result.rows[0]);
  });

  router.put('/habits/:id/completion', requireCsrf, async (req, res) => {
    const completedOn = req.body?.date || new Date().toISOString().slice(0, 10);
    if (!/^\d+$/.test(req.params.id) || typeof req.body?.done !== 'boolean' || !isDate(completedOn)) {
      return res.status(400).json({ error: 'INVALID_COMPLETION', message: 'A conclusão precisa ser verdadeira ou falsa.' });
    }
    const existing = await pool.query(
      'SELECT id FROM habits WHERE id = $1 AND user_id = $2',
      [req.params.id, req.auth.user.id]
    );
    if (existing.rowCount === 0) return res.status(404).json({ error: 'HABIT_NOT_FOUND', message: 'Hábito não encontrado.' });
    if (req.body.done) {
      await pool.query(
        'INSERT INTO habit_completions (user_id, habit_id, completed_on) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [req.auth.user.id, req.params.id, completedOn]
      );
    } else {
      await pool.query(
        'DELETE FROM habit_completions WHERE user_id = $1 AND habit_id = $2 AND completed_on = $3',
        [req.auth.user.id, req.params.id, completedOn]
      );
    }
    return res.json({ id: req.params.id, done: req.body.done });
  });

  router.delete('/:collection/:id', requireCsrf, async (req, res) => {
    const tables = {
      hydration: 'hydration_records',
      journal: 'journal_entries',
      habits: 'habits',
      sleep: 'sleep_records',
      study: 'study_sessions'
    };
    const table = tables[req.params.collection];
    if (!table || !/^\d+$/.test(req.params.id)) {
      return res.status(404).json({ error: 'RESOURCE_NOT_FOUND', message: 'Registro não encontrado.' });
    }
    const result = await pool.query(
      `DELETE FROM ${table} WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.auth.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'RECORD_NOT_FOUND', message: 'Registro não encontrado.' });
    return res.status(204).end();
  });

  return router;
}

module.exports = { createWellnessRouter, validateImport };
