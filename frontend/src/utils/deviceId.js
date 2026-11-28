import { readAppStorage } from './appStorage';

const STORAGE_KEY = 'entrepausas_anonymous_device_id';

export function getDeviceId() {
  let id = readAppStorage(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID
      ? crypto.randomUUID()
      : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
