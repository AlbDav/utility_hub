/**
 * Lettore dei Fogli Google dell'hub, in sola lettura.
 *
 * Ogni utility passa l'ID di pubblicazione e i gid delle sue schede (o le URL
 * delle fixture). Il lettore scarica i CSV di «Pubblica sul web», li legge con
 * papaparse e tiene una copia in localStorage con l'ora del download, così
 * senza rete l'app mostra l'ultima copia e sa a quando risale.
 */
import Papa from 'papaparse';
import { loadJson, saveJson } from './storage';

export interface Table {
  /** Intestazioni della prima riga, già ripulite dagli spazi. */
  headers: string[];
  rows: Record<string, string>[];
}

export type Tables<K extends string> = Record<K, Table>;

export interface Snapshot<K extends string> {
  tables: Tables<K>;
  /** Ora del download, in ISO 8601. */
  fetchedAt: string;
}

export const FETCH_TIMEOUT_MS = 8000;

export function publishedCsvUrl(publicationId: string, gid: string): string {
  const id = encodeURIComponent(publicationId);
  return `https://docs.google.com/spreadsheets/d/e/${id}/pub?gid=${encodeURIComponent(gid)}&single=true&output=csv`;
}

export function parseCsv(text: string): Table {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });
  const headers = (result.meta.fields ?? []).filter((h) => h !== '');
  const rows = result.data.map((row) => {
    const clean: Record<string, string> = {};
    for (const h of headers) clean[h] = row[h] ?? '';
    return clean;
  });
  return { headers, rows };
}

/** Una cella vale «sì» se non è vuota dopo il trim, qualunque cosa contenga. */
export function isYes(cell: string | undefined): boolean {
  return (cell ?? '').trim() !== '';
}

/** Legge gg/mm/aaaa (impostazioni Italia) o aaaa-mm-gg. Restituisce null se non è una data valida. */
export function parseDate(cell: string | undefined): Date | null {
  const value = (cell ?? '').trim();
  let match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  let day: number, month: number, year: number;
  if (match) {
    [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else {
    match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
    if (!match) return null;
    [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

async function fetchText(url: string, signal: AbortSignal, fetchFn: typeof fetch): Promise<string> {
  const response = await fetchFn(url, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status} per ${url}`);
  const text = await response.text();
  // Un foglio non pubblicato restituisce una pagina HTML invece del CSV.
  if (text.trimStart().startsWith('<')) throw new Error(`La risposta di ${url} non è un CSV`);
  return text;
}

/** Scarica e legge tutte le schede. Fallisce se anche una sola non arriva entro il timeout. */
export async function fetchTables<K extends string>(
  urls: Record<K, string>,
  { timeoutMs = FETCH_TIMEOUT_MS, fetchFn = fetch }: { timeoutMs?: number; fetchFn?: typeof fetch } = {},
): Promise<Tables<K>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const keys = Object.keys(urls) as K[];
    const texts = await Promise.all(keys.map((k) => fetchText(urls[k], controller.signal, fetchFn)));
    const tables = {} as Tables<K>;
    keys.forEach((k, i) => (tables[k] = parseCsv(texts[i])));
    return tables;
  } finally {
    clearTimeout(timer);
  }
}

/** Legge la copia salvata. Se lo storage non c'è o il contenuto è rovinato, restituisce null. */
export function readSnapshot<K extends string>(key: string, storage?: Storage): Snapshot<K> | null {
  const snapshot = loadJson(key, storage) as Snapshot<K> | null;
  if (!snapshot || typeof snapshot.fetchedAt !== 'string' || typeof snapshot.tables !== 'object') return null;
  return snapshot;
}

/** Salva la copia. Se lo storage non è disponibile l'app va avanti senza. */
export function writeSnapshot<K extends string>(key: string, snapshot: Snapshot<K>, storage?: Storage): void {
  saveJson(key, snapshot, storage);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** «21:30» */
export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** «4/11» */
export function formatDayMonth(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

/** «4/11/2026» */
export function formatDate(date: Date): string {
  return `${formatDayMonth(date)}/${date.getFullYear()}`;
}

export type SheetStatus =
  | { kind: 'loading' }
  | { kind: 'fresh'; fetchedAt: Date }
  | { kind: 'refreshing'; fetchedAt: Date }
  | { kind: 'stale'; fetchedAt: Date; offline: boolean }
  | { kind: 'unavailable'; offline: boolean };

/** Testo dell'indicatore dei dati. */
export function describeStatus(status: SheetStatus): string {
  switch (status.kind) {
    case 'loading':
      return 'Caricamento dei dati…';
    case 'fresh':
      return `Aggiornato alle ${formatTime(status.fetchedAt)}`;
    case 'refreshing':
      return `Dati del ${formatDayMonth(status.fetchedAt)} alle ${formatTime(status.fetchedAt)} · aggiornamento…`;
    case 'stale': {
      const when = `dati del ${formatDayMonth(status.fetchedAt)} alle ${formatTime(status.fetchedAt)}`;
      return status.offline ? `Offline: ${when}` : `Download non riuscito: ${when}`;
    }
    case 'unavailable':
      return status.offline
        ? 'Offline e nessuna copia salvata: apri la pagina con la rete almeno una volta.'
        : 'Non riesco a scaricare i dati e non c’è una copia salvata.';
  }
}
