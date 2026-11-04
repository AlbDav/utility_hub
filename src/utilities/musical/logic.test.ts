import { describe, expect, it } from 'vitest';
import type { MusicalData, Scene } from './data';
import {
  confrontaScene,
  ESPONENTE_PRESENTI,
  genteInScena,
  hashScena,
  parseHashScena,
  percentualePresenti,
  punteggio,
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

interface ScenaDiProva {
  numero: number;
  /** Personaggi in scena. */
  gente: number;
  /** Quanti di loro sono presenti. */
  presenti: number;
  /** Volte provata; le prove hanno la data `ultima`, se c'è. */
  volte?: number;
  ultima?: Date | null;
}

/** Dati con scene costruite su misura: ogni scena ha i suoi personaggi. */
function datiScene(defs: ScenaDiProva[]) {
  const personaggi: string[] = [];
  const cast: MusicalData['cast'] = {};
  const presenti = new Set<string>();
  const prove: MusicalData['prove'] = [];
  for (const def of defs) {
    const nomi = Array.from({ length: def.gente }, (_, i) => `S${def.numero}P${i + 1}`);
    personaggi.push(...nomi);
    cast[def.numero] = { personaggi: nomi, gruppi: [] };
    nomi.slice(0, def.presenti).forEach((n) => presenti.add(n));
    for (let i = 0; i < (def.volte ?? 0); i++) prove.push({ data: def.ultima ?? null, scene: [def.numero] });
  }
  const data = dati({ scene: defs.map((d) => scena(d.numero)), personaggi, gruppi: [], cast, prove });
  return { data, presenti };
}

describe('ordine delle scene', () => {
  const numeri = (data: MusicalData, presenti: Set<string>) => sceneDaProvare(data, presenti).map((s) => s.scena.numero);
  const ordine = (defs: ScenaDiProva[]) => {
    const { data, presenti } = datiScene(defs);
    return numeri(data, presenti);
  };

  it('il punteggio è p² / (1 + v)', () => {
    const { data, presenti } = datiScene([{ numero: 1, gente: 4, presenti: 2, volte: 1 }]);
    expect(ESPONENTE_PRESENTI).toBe(2);
    expect(punteggio(statScena(data, data.scene[0], presenti))).toBeCloseTo(0.25 / 2);
  });

  it('1. punteggio più alto prima', () => {
    expect(
      ordine([
        { numero: 1, gente: 4, presenti: 2 }, // 0,25
        { numero: 2, gente: 3, presenti: 3, volte: 2 }, // 1/3
        { numero: 3, gente: 2, presenti: 2 }, // 1
      ]),
    ).toEqual([3, 2, 1]);
  });

  it('13 personaggi con 12 presenti mai provata viene prima di 2 tutti presenti provata 6 volte', () => {
    expect(
      ordine([
        { numero: 1, gente: 2, presenti: 2, volte: 6 }, // 1/7 ≈ 0,14
        { numero: 2, gente: 13, presenti: 12 }, // (12/13)² ≈ 0,85
      ]),
    ).toEqual([2, 1]);
  });

  it('6 personaggi con 5 presenti mai provata viene prima di 4 tutti presenti provata 1 volta', () => {
    expect(
      ordine([
        { numero: 1, gente: 4, presenti: 4, volte: 1 }, // 0,5
        { numero: 2, gente: 6, presenti: 5 }, // (5/6)² ≈ 0,69
      ]),
    ).toEqual([2, 1]);
  });

  it('2. a parità di punteggio, più gente in scena prima', () => {
    // Duetto con un assente, mai provato: (1/2)² = 0,25. Quattro tutti presenti, provata 3 volte: 1/4 = 0,25.
    const { data, presenti } = datiScene([
      { numero: 1, gente: 2, presenti: 1 },
      { numero: 2, gente: 4, presenti: 4, volte: 3, ultima: d(5, 9) },
    ]);
    const [duetto, quattro] = data.scene.map((s) => statScena(data, s, presenti));
    expect(punteggio(duetto)).toBe(0.25);
    expect(punteggio(quattro)).toBe(0.25);
    expect(confrontaScene(quattro, duetto)).toBeLessThan(0);
    expect(numeri(data, presenti)).toEqual([2, 1]);
  });

  it('3. a parità di punteggio e di gente, provata meno di recente prima', () => {
    expect(
      ordine([
        { numero: 1, gente: 2, presenti: 2, volte: 1, ultima: d(19, 9) },
        { numero: 2, gente: 2, presenti: 2, volte: 1, ultima: d(5, 9) },
      ]),
    ).toEqual([2, 1]);
  });

  it('3. una scena senza date leggibili conta come provata meno di recente', () => {
    expect(
      ordine([
        { numero: 1, gente: 2, presenti: 2, volte: 1, ultima: d(5, 9) },
        { numero: 2, gente: 2, presenti: 2, volte: 1, ultima: null },
      ]),
    ).toEqual([2, 1]);
  });

  it('4. a parità di tutto, numero di scena crescente', () => {
    expect(
      ordine([
        { numero: 2, gente: 2, presenti: 1 },
        { numero: 1, gente: 2, presenti: 1 },
      ]),
    ).toEqual([1, 2]);
  });

  it('un monologo senza il suo attore va sotto le scene con un presente e sopra quelle vuote', () => {
    expect(
      ordine([
        { numero: 1, gente: 0, presenti: 0 }, // nessuno in Cast
        { numero: 2, gente: 1, presenti: 0 }, // monologo senza attore: punteggio 0
        { numero: 3, gente: 10, presenti: 1, volte: 9 }, // (1/10)² / 10 = 0,001
        { numero: 4, gente: 0, presenti: 0 },
      ]),
    ).toEqual([3, 2, 1, 4]);
  });

  it('le scene senza nessuno in Cast vanno in fondo, in ordine di numero', () => {
    expect(numeri(dati(), nessuno).at(-1)).toBe(3);
    expect(numeri(dati(), new Set(['Anna', 'Bruno', 'Carla', 'Dario'])).at(-1)).toBe(3);
  });

  it('le volte provata pesano dentro il punteggio, non come criterio a parte', () => {
    // Stessa quota di presenti: la scena provata meno ha il punteggio più alto.
    expect(
      ordine([
        { numero: 1, gente: 2, presenti: 2, volte: 2 },
        { numero: 2, gente: 2, presenti: 2, volte: 1 },
      ]),
    ).toEqual([2, 1]);
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
