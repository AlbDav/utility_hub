import { describe, expect, it } from 'vitest';
import type { MusicalData, Scene } from './data';
import {
  confrontaScene,
  genteInScena,
  hashScena,
  parseHashScena,
  percentualePresenti,
  sceneDaProvare,
  sezioniPresenze,
  statScena,
} from './logic';

const scena = (numero: number, extra: Partial<Scene> = {}): Scene => ({
  numero,
  titolo: `Scena ${numero}`,
  canzone: false,
  coreografia: false,
  coro: false,
  pagina: '',
  note: '',
  ...extra,
});

const d = (giorno: number, mese: number) => new Date(2026, mese - 1, giorno);

function dati(overrides: Partial<MusicalData> = {}): MusicalData {
  return {
    scene: [scena(1), scena(2), scena(3)],
    personaggi: ['Anna', 'Bruno', 'Carla', 'Dario'],
    gruppi: [
      { nome: 'Coro', membri: ['Anna', 'Bruno'] },
      { nome: 'Vuoto', membri: [] },
    ],
    cast: {
      1: { personaggi: ['Anna'], gruppi: ['Coro'] },
      2: { personaggi: ['Carla'], gruppi: ['Vuoto'] },
      3: { personaggi: [], gruppi: [] },
    },
    prove: [],
    avvisi: [],
    ...overrides,
  };
}

const nessuno = new Set<string>();

describe('genteInScena', () => {
  it('conta una volta un personaggio in scena sia da solo sia con il suo gruppo', () => {
    expect(genteInScena(dati(), 1)).toEqual(['Anna', 'Bruno']);
  });

  it('un gruppo senza personaggi non aggiunge nessuno', () => {
    expect(genteInScena(dati(), 2)).toEqual(['Carla']);
  });

  it('una scena senza nessuno in Cast, o assente da Cast, ha la scena vuota', () => {
    expect(genteInScena(dati(), 3)).toEqual([]);
    expect(genteInScena(dati(), 99)).toEqual([]);
  });
});

describe('statScena', () => {
  it('calcola mancanti, sostituti e presenti dalle presenze', () => {
    const s = statScena(dati(), scena(1), new Set(['Bruno', 'Dario']));
    expect(s.mancanti).toEqual(['Anna']);
    expect(s.sostituti).toBe(1);
    expect(s.presenti).toBe(1);
    expect(percentualePresenti(s)).toBe(50);
  });

  it('una scena vuota non ha percentuale di presenti', () => {
    expect(percentualePresenti(statScena(dati(), scena(3), nessuno))).toBeNull();
  });

  it('con Prove vuoto la scena non è mai stata provata', () => {
    const s = statScena(dati(), scena(1), nessuno);
    expect(s.volteProvata).toBe(0);
    expect(s.ultimaProva).toBeNull();
  });

  it('conta le prove e prende la data più recente, saltando quelle non leggibili', () => {
    const data = dati({
      prove: [
        { data: d(5, 9), scene: [1] },
        { data: null, scene: [1] },
        { data: d(19, 9), scene: [1, 2] },
        { data: d(12, 9), scene: [1] },
      ],
    });
    const s = statScena(data, scena(1), nessuno);
    expect(s.volteProvata).toBe(4);
    expect(s.ultimaProva).toEqual(d(19, 9));
  });

  it('una scena provata solo con date non leggibili conta le prove ma non ha ultima prova', () => {
    const s = statScena(dati({ prove: [{ data: null, scene: [2] }] }), scena(2), nessuno);
    expect(s.volteProvata).toBe(1);
    expect(s.ultimaProva).toBeNull();
  });
});

describe('ordine delle scene', () => {
  const numeri = (data: MusicalData, presenti: Set<string>) => sceneDaProvare(data, presenti).map((s) => s.scena.numero);

  it('1. percentuale di presenti più alta prima', () => {
    const data = dati({
      scene: [scena(1), scena(2), scena(3)],
      cast: {
        1: { personaggi: ['Anna', 'Bruno', 'Carla', 'Dario'], gruppi: [] }, // 2/4 = 50%
        2: { personaggi: ['Anna', 'Bruno', 'Carla'], gruppi: [] }, // 2/3 = 67%
        3: { personaggi: ['Anna'], gruppi: [] }, // 1/1 = 100%
      },
    });
    expect(numeri(data, new Set(['Anna', 'Bruno']))).toEqual([3, 2, 1]);
  });

  it('le scene senza nessuno in scena vanno in fondo', () => {
    // Nessun presente: 0% per le scene 1 e 2, la 3 è vuota.
    expect(numeri(dati(), nessuno).at(-1)).toBe(3);
    expect(numeri(dati(), new Set(['Anna', 'Bruno', 'Carla', 'Dario'])).at(-1)).toBe(3);
  });

  it('2. a parità di percentuale, meno sostituti prima', () => {
    const data = dati({
      scene: [scena(1), scena(2)],
      cast: {
        1: { personaggi: ['Anna', 'Bruno', 'Carla', 'Dario'], gruppi: [] }, // 2/4 = 50%, 2 sostituti
        2: { personaggi: ['Anna', 'Carla'], gruppi: [] }, // 1/2 = 50%, 1 sostituto
      },
    });
    expect(numeri(data, new Set(['Anna', 'Bruno']))).toEqual([2, 1]);
  });

  it('3. a parità, meno volte provata prima', () => {
    const data = dati({
      scene: [scena(1), scena(2)],
      cast: { 1: { personaggi: ['Anna'], gruppi: [] }, 2: { personaggi: ['Bruno'], gruppi: [] } },
      prove: [
        { data: d(5, 9), scene: [1] },
        { data: d(12, 9), scene: [1, 2] },
      ],
    });
    expect(numeri(data, new Set(['Anna', 'Bruno']))).toEqual([2, 1]);
  });

  it('4. a parità su tutti e tre i criteri, provata meno di recente prima', () => {
    const data = dati({
      scene: [scena(1), scena(2)],
      cast: { 1: { personaggi: ['Anna'], gruppi: [] }, 2: { personaggi: ['Bruno'], gruppi: [] } },
      prove: [
        { data: d(19, 9), scene: [1] },
        { data: d(5, 9), scene: [2] },
      ],
    });
    expect(numeri(data, new Set(['Anna', 'Bruno']))).toEqual([2, 1]);
  });

  it('5. a parità di tutto, numero di scena crescente', () => {
    const data = dati({
      scene: [scena(2), scena(1)],
      cast: { 1: { personaggi: ['Anna'], gruppi: [] }, 2: { personaggi: ['Bruno'], gruppi: [] } },
      prove: [{ data: d(5, 9), scene: [1, 2] }],
    });
    expect(numeri(data, nessuno)).toEqual([1, 2]);
  });

  it('a parità di volte provata, una scena senza data di ultima prova viene prima', () => {
    const a = statScena(dati(), scena(1), nessuno);
    const b = { ...a, scena: scena(2), volteProvata: 0, ultimaProva: null };
    expect(confrontaScene(b, { ...a, ultimaProva: d(1, 9) })).toBeLessThan(0);
  });
});

describe('filtri', () => {
  const data = dati({
    scene: [scena(1, { canzone: true, coro: true }), scena(2, { canzone: true }), scena(3, { coreografia: true })],
  });
  const numeri = (filtri: Parameters<typeof sceneDaProvare>[2]) =>
    sceneDaProvare(data, nessuno, filtri)
      .map((s) => s.scena.numero)
      .sort();

  it('indifferente lascia tutte le scene', () => {
    expect(numeri({ canzone: 'tutte', coro: 'tutte', coreografia: 'tutte' })).toEqual([1, 2, 3]);
  });

  it('«con» tiene solo le scene che lo hanno, «senza» solo quelle che non lo hanno', () => {
    expect(numeri({ canzone: 'con', coro: 'tutte', coreografia: 'tutte' })).toEqual([1, 2]);
    expect(numeri({ canzone: 'senza', coro: 'tutte', coreografia: 'tutte' })).toEqual([3]);
  });

  it('i filtri si combinano', () => {
    expect(numeri({ canzone: 'con', coro: 'senza', coreografia: 'tutte' })).toEqual([2]);
  });
});

describe('hash della scheda scena', () => {
  it('va e torna dal numero di scena', () => {
    expect(hashScena(12)).toBe('#scena-12');
    expect(parseHashScena('#scena-12')).toBe(12);
  });

  it('ignora gli altri hash', () => {
    expect(parseHashScena('')).toBeNull();
    expect(parseHashScena('#scena-')).toBeNull();
    expect(parseHashScena('#altro')).toBeNull();
  });
});

describe('sezioniPresenze', () => {
  it('mette prima chi non ha gruppo, poi ogni gruppo senza ripetere nessuno', () => {
    const data = dati({
      gruppi: [
        { nome: 'Coro', membri: ['Anna', 'Bruno'] },
        { nome: 'Ballo', membri: ['Bruno', 'Carla'] },
        { nome: 'Vuoto', membri: [] },
      ],
    });
    expect(sezioniPresenze(data)).toEqual([
      { nome: 'Personaggi', persone: ['Dario'] },
      { nome: 'Coro', persone: ['Anna', 'Bruno'] },
      { nome: 'Ballo', persone: ['Carla'] },
    ]);
  });
});
