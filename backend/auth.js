const { Router } = require('express');
const { Buffer } = require('node:buffer');
const {
  createHash,
  randomBytes,
  randomUUID,
  scrypt: scryptCallback,
  timingSafeEqual
} = require('node:crypto');
const { URL, URLSearchParams } = require('node:url');
const { promisify } = require('node:util');

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = 'entrepausas_session';
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_MIN_LENGTH = 12;

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$32768$8$1$${salt.toString('base64')}$${derivedKey.toString('base64')}`;
}

async function verifyPassword(password, encodedHash) {
  const parts = encodedHash.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt' || parts[1] !== '32768' || parts[2] !== '8' || parts[3] !== '1') {
    return false;
  }

  const salt = Buffer.from(parts[4], 'base64');
  const expected = Buffer.from(parts[5], 'base64');
  if (salt.length !== 16 || expected.length !== 64) return false;
  const actual = await scrypt(password, salt, expected.length, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return timingSafeEqual(actual, expected);
}

function normalizeEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function validPassword(value) {
  return typeof value === 'string'
    && value.length >= PASSWORD_MIN_LENGTH
    && value.length <= 128
    && !/[\u0000-\u001f\u007f]/.test(value);
}

async function seedDemoData(client, userId) {
  await client.query(
    `INSERT INTO checkins (user_id, mood, energy, note, created_at)
     VALUES ($1, 4, 3, 'Registro demonstrativo', NOW() - INTERVAL '1 day'),
            ($1, 3, 4, 'Dados fictícios para a apresentação', NOW() - INTERVAL '2 days')`,
    [userId]
  );
  await client.query(
    `INSERT INTO pauses (user_id, type, created_at)
     VALUES ($1, 'water', NOW()), ($1, 'stretch', NOW() - INTERVAL '1 day')`,
    [userId]
  );
  await client.query(
    'INSERT INTO hydration_records (user_id, amount_ml) VALUES ($1, 300), ($1, 450)',
    [userId]
  );
  await client.query(
    `INSERT INTO journal_entries (user_id, title, body)
     VALUES ($1, 'Registro demonstrativo', 'Este texto e fictício e foi criado para a apresentação do EntrePausas.')`,
    [userId]
  );
  const habit = await client.query(
    "INSERT INTO habits (user_id, label) VALUES ($1, 'Fazer uma pausa curta') RETURNING id",
    [userId]
  );
  await client.query(
    'INSERT INTO habit_completions (user_id, habit_id, completed_on) VALUES ($1, $2, CURRENT_DATE)',
    [userId, habit.rows[0].id]
  );
  await client.query(
    `INSERT INTO sleep_records (user_id, bed_time, wake_time, quality, sleep_date)
     VALUES ($1, '23:00', '07:00', 4, CURRENT_DATE - 1)`,
    [userId]
  );
  await client.query(
    `INSERT INTO study_sessions (user_id, subject, day, study_time)
     VALUES ($1, 'Estudo demonstrativo', 'Quarta-feira', '14:00')`,
    [userId]
  );
  await client.query(
    `INSERT INTO focus_sessions (user_id, duration_minutes, completed_at)
     VALUES ($1, 25, NOW() - INTERVAL '1 day')`,
    [userId]
  );
}

async function ensureDemoAccount(pool, env = process.env) {
  if (env.DEMO_ACCOUNT_ENABLED !== 'true') return null;
  const email = normalizeEmail(env.DEMO_EMAIL);
  const password = env.DEMO_PASSWORD;
  if (!email || !validPassword(password)) {
    const error = new Error('A demo account requires a valid DEMO_EMAIL and a password of at least 12 characters.');
    error.code = 'DEMO_ACCOUNT_CONFIG_INVALID';
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let existing = await client.query(
      'SELECT id, is_demo FROM users WHERE email = $1 FOR UPDATE',
      [email]
    );
    let userId;
    let created = false;

    if (existing.rowCount > 0) {
      if (!existing.rows[0].is_demo) {
        const error = new Error('The configured demo email is already used by a regular account.');
        error.code = 'DEMO_EMAIL_IN_USE';
        throw error;
      }
      userId = existing.rows[0].id;
      await client.query(
        'UPDATE users SET password_hash = $1, email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = $2',
        [passwordHash, userId]
      );
      await client.query('DELETE FROM auth_sessions WHERE user_id = $1', [userId]);
      await client.query(
        'INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
        [userId]
      );
    } else {
      const inserted = await client.query(
        `INSERT INTO users (id, email, password_hash, email_verified_at, is_demo)
         VALUES ($1, $2, $3, NOW(), TRUE)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [randomUUID(), email, passwordHash]
      );
      if (inserted.rowCount === 0) {
        existing = await client.query(
          'SELECT id, is_demo FROM users WHERE email = $1 FOR UPDATE',
          [email]
        );
        if (!existing.rows[0]?.is_demo) {
          const error = new Error('The configured demo email is already used by a regular account.');
          error.code = 'DEMO_EMAIL_IN_USE';
          throw error;
        }
        userId = existing.rows[0].id;
        await client.query(
          'UPDATE users SET password_hash = $1, email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = $2',
          [passwordHash, userId]
        );
        await client.query('DELETE FROM auth_sessions WHERE user_id = $1', [userId]);
      } else {
        userId = inserted.rows[0].id;
        created = true;
        await client.query('INSERT INTO user_settings (user_id) VALUES ($1)', [userId]);
        await seedDemoData(client, userId);
      }
    }

    await client.query('COMMIT');
    return { id: userId, email, created };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function readCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

function getClientUrl(appBaseUrl, tokenParam, token) {
  if (!appBaseUrl) {
    const error = new Error('APP_BASE_URL is required for account email links.');
    error.code = 'APP_BASE_URL_NOT_CONFIGURED';
    throw error;
  }
  const url = new URL('/', appBaseUrl);
  url.hash = new URLSearchParams({ [tokenParam]: token }).toString();
  return url.toString();
}

function createAuth({ pool, mailer, appBaseUrl, isProduction = false, demoAccountEnabled = false }) {
  const router = Router();
  const demoVisibilityFilter = demoAccountEnabled ? '' : ' AND u.is_demo = FALSE';

  const requireAuth = async (req, res, next) => {
    const token = readCookie(req, SESSION_COOKIE);
    if (!token || token.length > 256) {
      return res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Entre na sua conta para continuar.' });
    }

    try {
      const tokenHash = hashToken(token);
      const result = await pool.query(
        `SELECT s.token_hash, s.csrf_token, u.id, u.email
         FROM auth_sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.email_verified_at IS NOT NULL${demoVisibilityFilter}`,
        [tokenHash]
      );
      if (result.rowCount === 0) {
        res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' });
        return res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Entre na sua conta para continuar.' });
      }
      req.auth = {
        user: { id: result.rows[0].id, email: result.rows[0].email },
        tokenHash,
        csrfToken: result.rows[0].csrf_token
      };
      return next();
    } catch (error) {
      return next(error);
    }
  };

  const requireCsrf = (req, res, next) => {
    const supplied = req.get('x-csrf-token');
    if (!supplied || supplied !== req.auth?.csrfToken) {
      return res.status(403).json({ error: 'CSRF_INVALID', message: 'Atualize a página e tente novamente.' });
    }
    return next();
  };

  function setSessionCookie(res, token) {
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_MS
    });
  }

  async function createSession(userId, res) {
    const token = randomBytes(32).toString('base64url');
    const csrfToken = randomBytes(32).toString('base64url');
    await pool.query('DELETE FROM auth_sessions WHERE expires_at <= NOW()');
    await pool.query('DELETE FROM auth_tokens WHERE expires_at <= NOW()');
    await pool.query(
      'INSERT INTO auth_sessions (token_hash, user_id, csrf_token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL \'30 days\')',
      [hashToken(token), userId, csrfToken]
    );
    setSessionCookie(res, token);
    return csrfToken;
  }

  const requireConfiguredMail = () => {
    if (!appBaseUrl) {
      const error = new Error('O servidor precisa configurar APP_BASE_URL para autenticação por e-mail.');
      error.code = 'APP_BASE_URL_NOT_CONFIGURED';
      throw error;
    }
    if (isProduction && new URL(appBaseUrl).protocol !== 'https:') {
      const error = new Error('Production account emails must use an HTTPS application URL.');
      error.code = 'APP_BASE_URL_NOT_SECURE';
      throw error;
    }
    return mailer;
  };

  router.get('/me', async (req, res) => {
    const token = readCookie(req, SESSION_COOKIE);
    if (!token || token.length > 256) return res.json({ user: null, csrfToken: null });
    const result = await pool.query(
      `SELECT s.token_hash, s.csrf_token, u.id, u.email
       FROM auth_sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.email_verified_at IS NOT NULL${demoVisibilityFilter}`,
      [hashToken(token)]
    );
    if (result.rowCount === 0) {
      res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' });
      return res.json({ user: null, csrfToken: null });
    }
    return res.json({
      user: { id: result.rows[0].id, email: result.rows[0].email },
      csrfToken: result.rows[0].csrf_token
    });
  });

  router.post('/register', async (req, res, next) => {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      return res.status(400).json({
        error: 'INVALID_EMAIL',
        message: 'Informe um e-mail válido.'
      });
    }

    try {
      const configuredMailer = requireConfiguredMail();
      const existing = await pool.query('SELECT id, email_verified_at FROM users WHERE email = $1', [email]);
      if (existing.rowCount > 0 && existing.rows[0].email_verified_at) {
        return res.status(202).json({ message: 'Se este endereço puder receber cadastro, enviaremos as instruções por e-mail.' });
      }

      let userId;
      if (existing.rowCount > 0) {
        userId = existing.rows[0].id;
      } else {
        userId = randomUUID();
        const passwordHash = await hashPassword(randomBytes(32).toString('base64url'));
        await pool.query(
          'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
          [userId, email, passwordHash]
        );
        await pool.query('INSERT INTO user_settings (user_id) VALUES ($1)', [userId]);
      }

      const token = randomBytes(32).toString('base64url');
      await pool.query("DELETE FROM auth_tokens WHERE user_id = $1 AND purpose = 'verify_email'", [userId]);
      await pool.query(
        "INSERT INTO auth_tokens (token_hash, user_id, purpose, expires_at) VALUES ($1, $2, 'verify_email', NOW() + INTERVAL '24 hours')",
        [hashToken(token), userId]
      );
      const verificationUrl = getClientUrl(appBaseUrl, 'verify', token);
      await configuredMailer.sendVerificationEmail(email, verificationUrl);
      return res.status(202).json({ message: 'Se este endereço puder receber cadastro, enviaremos as instruções por e-mail.' });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(202).json({ message: 'Se este endereço puder receber cadastro, enviaremos as instruções por e-mail.' });
      }
      return next(error);
    }
  });

  router.post('/verify-email', async (req, res) => {
    const token = typeof req.body?.token === 'string' ? req.body.token : '';
    const password = req.body?.password;
    if (token.length < 20 || token.length > 256 || !validPassword(password)) {
      return res.status(400).json({
        error: 'TOKEN_INVALID',
        message: `O link é inválido ou expirou. Defina uma senha de ${PASSWORD_MIN_LENGTH} a 128 caracteres.`
      });
    }
    const passwordHash = await hashPassword(password);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        "SELECT user_id FROM auth_tokens WHERE token_hash = $1 AND purpose = 'verify_email' AND expires_at > NOW() FOR UPDATE",
        [hashToken(token)]
      );
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'TOKEN_INVALID', message: 'O link de confirmação é inválido ou expirou.' });
      }
      await client.query(
        'UPDATE users SET password_hash = $1, email_verified_at = NOW() WHERE id = $2',
        [passwordHash, result.rows[0].user_id]
      );
      await client.query('DELETE FROM auth_tokens WHERE token_hash = $1', [hashToken(token)]);
      await client.query('COMMIT');
      return res.json({ message: 'E-mail confirmado. Agora você pode entrar na sua conta.' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });

  router.post('/resend-verification', async (req, res, next) => {
    const email = normalizeEmail(req.body?.email);
    if (!email) return res.status(400).json({ error: 'INVALID_EMAIL', message: 'Informe um e-mail válido.' });

    try {
      const configuredMailer = requireConfiguredMail();
      const result = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND email_verified_at IS NULL',
        [email]
      );
      if (result.rowCount > 0) {
        const token = randomBytes(32).toString('base64url');
        await pool.query("DELETE FROM auth_tokens WHERE user_id = $1 AND purpose = 'verify_email'", [result.rows[0].id]);
        await pool.query(
          "INSERT INTO auth_tokens (token_hash, user_id, purpose, expires_at) VALUES ($1, $2, 'verify_email', NOW() + INTERVAL '24 hours')",
          [hashToken(token), result.rows[0].id]
        );
        await configuredMailer.sendVerificationEmail(
          email,
          getClientUrl(appBaseUrl, 'verify', token)
        );
      }
      return res.json({ message: 'Se houver um cadastro pendente para este e-mail, enviaremos um novo link.' });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/login', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || password.length > 128) {
      return res.status(400).json({ error: 'INVALID_CREDENTIALS', message: 'E-mail ou senha inválidos.' });
    }
    const result = await pool.query(
      'SELECT id, email, password_hash, email_verified_at, is_demo FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user || (user.is_demo && !demoAccountEnabled)) {
      await scrypt(password, Buffer.alloc(16), 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
      return res.status(401).json({ error: 'LOGIN_FAILED', message: 'E-mail ou senha inválidos.' });
    }
    if (!(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'LOGIN_FAILED', message: 'E-mail ou senha inválidos.' });
    }
    if (!user.email_verified_at) {
      return res.status(403).json({ error: 'EMAIL_NOT_VERIFIED', message: 'Confirme seu e-mail pelo link enviado antes de entrar.' });
    }

    const csrfToken = await createSession(user.id, res);
    return res.json({ user: { id: user.id, email: user.email }, csrfToken });
  });

  router.post('/logout', requireAuth, requireCsrf, async (req, res) => {
    await pool.query('DELETE FROM auth_sessions WHERE token_hash = $1', [req.auth.tokenHash]);
    res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' });
    return res.status(204).end();
  });

  router.post('/password-reset/request', async (req, res, next) => {
    const email = normalizeEmail(req.body?.email);
    if (!email) return res.status(400).json({ error: 'INVALID_EMAIL', message: 'Informe um e-mail válido.' });

    try {
      const configuredMailer = requireConfiguredMail();
      const result = await pool.query('SELECT id FROM users WHERE email = $1 AND email_verified_at IS NOT NULL', [email]);
      if (result.rowCount > 0) {
        const token = randomBytes(32).toString('base64url');
        await pool.query("DELETE FROM auth_tokens WHERE user_id = $1 AND purpose = 'password_reset'", [result.rows[0].id]);
        await pool.query(
          "INSERT INTO auth_tokens (token_hash, user_id, purpose, expires_at) VALUES ($1, $2, 'password_reset', NOW() + INTERVAL '1 hour')",
          [hashToken(token), result.rows[0].id]
        );
        const resetUrl = getClientUrl(appBaseUrl, 'reset', token);
        await configuredMailer.sendPasswordResetEmail(email, resetUrl);
      }
      return res.json({ message: 'Se existir uma conta para este e-mail, enviaremos instruções para redefinir a senha.' });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/password-reset/confirm', async (req, res) => {
    const token = typeof req.body?.token === 'string' ? req.body.token : '';
    const password = req.body?.password;
    if (token.length < 20 || token.length > 256 || !validPassword(password)) {
      return res.status(400).json({
        error: 'INVALID_RESET',
        message: `O link é inválido ou expirou. Use uma senha de ${PASSWORD_MIN_LENGTH} a 128 caracteres.`
      });
    }
    const passwordHash = await hashPassword(password);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        "SELECT user_id FROM auth_tokens WHERE token_hash = $1 AND purpose = 'password_reset' AND expires_at > NOW() FOR UPDATE",
        [hashToken(token)]
      );
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'TOKEN_INVALID', message: 'O link é inválido ou expirou.' });
      }
      const userId = result.rows[0].user_id;
      await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
      await client.query('DELETE FROM auth_sessions WHERE user_id = $1', [userId]);
      await client.query("DELETE FROM auth_tokens WHERE user_id = $1 AND purpose = 'password_reset'", [userId]);
      await client.query('COMMIT');
      res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' });
      return res.json({ message: 'Senha atualizada. Entre com sua nova senha.' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });

  return { router, requireAuth, requireCsrf };
}

module.exports = {
  createAuth,
  ensureDemoAccount,
  hashPassword,
  normalizeEmail,
  validPassword,
  verifyPassword
};
