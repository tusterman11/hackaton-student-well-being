const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

let csrfToken = null;

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (!['GET', 'HEAD'].includes(method) && csrfToken) headers['X-CSRF-Token'] = csrfToken;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  if (response.status === 204) return null;

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && result.error !== 'LOGIN_FAILED' && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('entrepausas:session-expired'));
    }
    const error = new Error(result.message || 'Não foi possível concluir esta solicitação.');
    error.code = result.error;
    error.status = response.status;
    throw error;
  }
  return result;
}

function setCsrfToken(value) {
  csrfToken = value || null;
}

export async function getCurrentSession() {
  const result = await request('/auth/me');
  setCsrfToken(result.csrfToken);
  return result;
}

export async function registerAccount(email) {
  return request('/auth/register', { method: 'POST', body: { email } });
}

export async function verifyEmail(token, password) {
  return request('/auth/verify-email', { method: 'POST', body: { token, password } });
}

export async function resendVerificationEmail(email) {
  return request('/auth/resend-verification', { method: 'POST', body: { email } });
}

export async function loginAccount(email, password) {
  const result = await request('/auth/login', { method: 'POST', body: { email, password } });
  setCsrfToken(result.csrfToken);
  return result;
}

export async function logoutAccount() {
  const result = await request('/auth/logout', { method: 'POST', body: {} });
  setCsrfToken(null);
  return result;
}

export async function requestPasswordReset(email) {
  return request('/auth/password-reset/request', { method: 'POST', body: { email } });
}

export async function confirmPasswordReset(token, password) {
  return request('/auth/password-reset/confirm', {
    method: 'POST',
    body: { token, password }
  });
}

export async function submitCheckin(payload) {
  return request('/checkins', { method: 'POST', body: payload });
}

export async function logBreak(type) {
  return request('/breaks', { method: 'POST', body: { type } });
}

export async function fetchWeeklyHistory() {
  return request('/history');
}

export async function fetchWellnessData() {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return request(`/wellness?date=${date}`);
}

export async function createWellnessRecord(collection, payload) {
  return request(`/wellness/${collection}`, { method: 'POST', body: payload });
}

export async function updateHydrationGoal(hydrationGoalMl) {
  return request('/wellness/settings', {
    method: 'PATCH',
    body: { hydrationGoalMl }
  });
}

export async function updateJournalEntry(id, payload) {
  return request(`/wellness/journal/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: payload
  });
}

export async function setHabitCompletion(id, done) {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return request(`/wellness/habits/${encodeURIComponent(id)}/completion`, {
    method: 'PUT',
    body: { done, date }
  });
}

export async function deleteWellnessRecord(collection, id) {
  return request(`/wellness/${collection}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function importLocalData(data, skip = false) {
  return request('/wellness/import-local', {
    method: 'POST',
    body: { data, skip }
  });
}

export async function sendChatMessage(payload) {
  return request('/chat', { method: 'POST', body: payload });
}

export async function fetchChatHistory() {
  return request('/chat/history');
}

export async function clearChatHistory() {
  return request('/chat/history', { method: 'DELETE', body: {} });
}
