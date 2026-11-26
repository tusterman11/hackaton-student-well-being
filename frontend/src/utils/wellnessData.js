export const WELLNESS_STORAGE_KEY = 'entrepausas_wellness_data_v1';
export const THEME_STORAGE_KEY = 'entrepausas_theme';

export const EMPTY_WELLNESS_DATA = {
  hydrationGoalMl: 2000,
  hydration: [],
  diary: [],
  habits: [],
  sleep: [],
  studySessions: []
};

const ARRAY_FIELDS = ['hydration', 'diary', 'habits', 'sleep', 'studySessions'];

export function loadWellnessData() {
  const stored = localStorage.getItem(WELLNESS_STORAGE_KEY);
  if (stored === null) return { ...EMPTY_WELLNESS_DATA };

  const parsed = JSON.parse(stored);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Os dados locais estão em um formato inválido. O armazenamento existente foi preservado.');
  }

  const data = { ...EMPTY_WELLNESS_DATA, ...parsed };
  for (const field of ARRAY_FIELDS) {
    if (!Array.isArray(data[field])) {
      throw new Error('Os dados locais estão em um formato inválido. O armazenamento existente foi preservado.');
    }
  }
  if (!Number.isFinite(data.hydrationGoalMl) || data.hydrationGoalMl <= 0) {
    data.hydrationGoalMl = EMPTY_WELLNESS_DATA.hydrationGoalMl;
  }
  return data;
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseRecordDate(value) {
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return null;
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized);
  const date = new Date(hasTimezone ? normalized : `${normalized}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getRecordDateKey(value) {
  const date = parseRecordDate(value);
  return date ? getLocalDateKey(date) : null;
}

export function formatDateTime(value) {
  const date = parseRecordDate(value);
  return date
    ? date.toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Data indisponível';
}

export function getLastSevenDateKeys(now = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + index);
    return getLocalDateKey(date);
  });
}

export function createId() {
  return globalThis.crypto?.randomUUID?.()
    || `record-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
