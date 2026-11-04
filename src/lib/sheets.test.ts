import { describe, expect, it, vi } from 'vitest';
import {
  describeStatus,
  fetchTables,
  isYes,
  parseCsv,
  parseDate,
  publishedCsvUrl,
  readSnapshot,
  writeSnapshot,
} from './sheets';

describe('publishedCsvUrl', () => {
  it('costruisce la URL di «Pubblica sul web» per gid', () => {
    expect(publishedCsvUrl('2PACX-abc', '123')).toBe(
      'https://docs.google.com/spreadsheets/d/e/2PACX-abc/pub?gid=123&single=true&output=csv',
    );
  });
});

describe('parseCsv', () => {
  it('pulisce intestazioni e celle e salta le righe vuote', () => {
    const table = parseCsv(' scena , titolo \n 1 ,  Ouverture \n,\n2,Finale\n');
    expect(table.headers).toEqual(['scena', 'titolo']);
    expect(table.rows).toEqual([
      { scena: '1', titolo: 'Ouverture' },
      { scena: '2', titolo: 'Finale' },
    ]);
  });

  it('riempie con stringa vuota le celle mancanti', () => {
    expect(parseCsv('a,b\n1\n').rows).toEqual([{ a: '1', b: '' }]);
  });
});

describe('isYes', () => {
  it('è sì per qualunque cella non vuota dopo il trim', () => {
    expect(isYes('x')).toBe(true);
    expect(isYes('X')).toBe(true);
    expect(isYes('no')).toBe(true);
    expect(isYes('  ')).toBe(false);
    expect(isYes('')).toBe(false);
    expect(isYes(undefined)).toBe(false);
  });
});

describe('parseDate', () => {
  it('legge gg/mm/aaaa e aaaa-mm-gg', () => {
    expect(parseDate('04/11/2026')).toEqual(new Date(2026, 10, 4));
    expect(parseDate('4/11/2026')).toEqual(new Date(2026, 10, 4));
    expect(parseDate('2026-11-04')).toEqual(new Date(2026, 10, 4));
  });

  it('rifiuta date non valide o in altri formati', () => {
    expect(parseDate('31/02/2026')).toBeNull();
    expect(parseDate('11/04/26')).toBeNull();
    expect(parseDate('ieri')).toBeNull();
    expect(parseDate('')).toBeNull();
  });
});

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, v),
  };
}

describe('copia salvata', () => {
  const snapshot = { tables: { a: { headers: ['x'], rows: [{ x: '1' }] } }, fetchedAt: '2026-11-04T20:30:00.000Z' };

  it('salva e rilegge la copia', () => {
    const storage = memoryStorage();
    writeSnapshot('k', snapshot, storage);
    expect(readSnapshot('k', storage)).toEqual(snapshot);
  });

  it('non si rompe se lo storage lancia errori', () => {
    const broken = {
      getItem: () => {
        throw new Error('bloccato');
      },
      setItem: () => {
        throw new Error('pieno');
      },
    } as unknown as Storage;
    expect(() => writeSnapshot('k', snapshot, broken)).not.toThrow();
    expect(readSnapshot('k', broken)).toBeNull();
  });

  it('ignora una copia rovinata', () => {
    const storage = memoryStorage();
    storage.setItem('k', '{non json');
    expect(readSnapshot('k', storage)).toBeNull();
  });
});

describe('fetchTables', () => {
  const ok = (body: string) => new Response(body, { status: 200 });

  it('scarica e legge tutte le schede', async () => {
    const fetchFn = vi.fn(async (url: string | URL | Request) => ok(String(url) === 'a' ? 'h\n1' : 'h\n2'));
    const tables = await fetchTables({ uno: 'a', due: 'b' }, { fetchFn: fetchFn as typeof fetch });
    expect(tables.uno.rows).toEqual([{ h: '1' }]);
    expect(tables.due.rows).toEqual([{ h: '2' }]);
  });

  it('fallisce con una risposta HTML (foglio non pubblicato)', async () => {
    const fetchFn = (async () => ok('<!doctype html><html>')) as typeof fetch;
    await expect(fetchTables({ uno: 'a' }, { fetchFn })).rejects.toThrow(/non è un CSV/);
  });

  it('fallisce con un errore HTTP', async () => {
    const fetchFn = (async () => new Response('', { status: 404 })) as typeof fetch;
    await expect(fetchTables({ uno: 'a' }, { fetchFn })).rejects.toThrow(/404/);
  });

  it('fallisce dopo il timeout', async () => {
    const fetchFn = ((_url: string, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      })) as typeof fetch;
    await expect(fetchTables({ uno: 'a' }, { fetchFn, timeoutMs: 10 })).rejects.toThrow('aborted');
  });
});

describe('describeStatus', () => {
  const at = new Date(2026, 10, 4, 21, 30);

  it('descrive dati aggiornati e copia offline', () => {
    expect(describeStatus({ kind: 'fresh', fetchedAt: at })).toBe('Aggiornato alle 21:30');
    expect(describeStatus({ kind: 'stale', fetchedAt: at, offline: true })).toBe('Offline: dati del 4/11 alle 21:30');
    expect(describeStatus({ kind: 'stale', fetchedAt: at, offline: false })).toBe(
      'Download non riuscito: dati del 4/11 alle 21:30',
    );
  });

  it('dice chiaramente quando non ci sono dati', () => {
    expect(describeStatus({ kind: 'unavailable', offline: true })).toMatch(/Offline e nessuna copia salvata/);
  });
});
