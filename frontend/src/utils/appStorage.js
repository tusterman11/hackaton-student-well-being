export function readAppStorage(key) {
  const currentValue = localStorage.getItem(key);
  if (currentValue !== null) return currentValue;

  const legacyKey = key
    .replace(/^entrepausas-/, 'pausa-')
    .replace(/^entrepausas_/, 'pausa_');
  if (legacyKey === key) return null;

  const legacyValue = localStorage.getItem(legacyKey);
  if (legacyValue !== null) {
    localStorage.setItem(key, legacyValue);
    localStorage.removeItem(legacyKey);
  }
  return legacyValue;
}
