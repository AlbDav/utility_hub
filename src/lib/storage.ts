/**
 * localStorage sempre dentro try/catch: in navigazione privata o con lo
 * storage bloccato l'app funziona lo stesso, solo senza ricordare niente.
 */
function defaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function loadJson(key: string, storage = defaultStorage()): unknown {
  try {
    const raw = storage?.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

export function saveJson(key: string, value: unknown, storage = defaultStorage()): void {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    // Storage pieno o bloccato: non si salva.
  }
}

export function removeKey(key: string, storage = defaultStorage()): void {
  try {
    storage?.removeItem(key);
  } catch {
    // Niente da fare.
  }
}
