/**
 * Logica del Planner prove: chi è in scena, sostituti, prove fatte e ordine
 * delle scene. Funzioni pure, senza React.
 */
import type { MusicalData, Scene } from './data';

export interface StatScena {
  scena: Scene;
  /** Personaggi in scena, da soli o con un gruppo, senza doppioni, nell'ordine di Personaggi. */
  gente: string[];
  /** Gente in scena non spuntata come presente. */
  mancanti: string[];
  sostituti: number;
  /** Gente in scena spuntata come presente. */
  presenti: number;
  volteProvata: number;
  /** null se mai provata o se nessuna data delle sue prove è leggibile. */
  ultimaProva: Date | null;
}

export function genteInScena(data: MusicalData, numero: number): string[] {
  const cast = data.cast[numero];
  if (!cast) return [];
  const inScena = new Set(cast.personaggi);
  for (const nomeGruppo of cast.gruppi) {
    const gruppo = data.gruppi.find((g) => g.nome === nomeGruppo);
    gruppo?.membri.forEach((m) => inScena.add(m));
  }
  return data.personaggi.filter((p) => inScena.has(p));
}

export function statScena(data: MusicalData, scena: Scene, presenti: ReadonlySet<string>): StatScena {
  const gente = genteInScena(data, scena.numero);
  const mancanti = gente.filter((p) => !presenti.has(p));
  const prove = data.prove.filter((p) => p.scene.includes(scena.numero));
  let ultimaProva: Date | null = null;
  for (const p of prove) {
    if (p.data && (!ultimaProva || p.data > ultimaProva)) ultimaProva = p.data;
  }
  return {
    scena,
    gente,
    mancanti,
    sostituti: mancanti.length,
    presenti: gente.length - mancanti.length,
    volteProvata: prove.length,
    ultimaProva,
  };
}

/**
 * Confronta la percentuale di presenti tra la gente in scena, più alta prima.
 * Le scene senza nessuno in scena non hanno una percentuale e vanno in fondo.
 */
function confrontaPercentuale(a: StatScena, b: StatScena): number {
  const [na, nb] = [a.gente.length, b.gente.length];
  if (na === 0 || nb === 0) return (na === 0 ? 1 : 0) - (nb === 0 ? 1 : 0);
  // b.presenti / nb - a.presenti / na, senza divisioni.
  return b.presenti * na - a.presenti * nb;
}

/** Percentuale di presenti tra la gente in scena (0–100), null se la scena è vuota. */
export function percentualePresenti(stat: StatScena): number | null {
  return stat.gente.length ? Math.round((stat.presenti / stat.gente.length) * 100) : null;
}

/**
 * Ordine delle scene da provare:
 * 1. percentuale di presenti più alta; 2. meno sostituti; 3. meno volte provata;
 * 4. provata meno di recente (mai provata prima); 5. numero di scena.
 */
export function confrontaScene(a: StatScena, b: StatScena): number {
  return (
    confrontaPercentuale(a, b) ||
    a.sostituti - b.sostituti ||
    a.volteProvata - b.volteProvata ||
    (a.ultimaProva?.getTime() ?? -Infinity) - (b.ultimaProva?.getTime() ?? -Infinity) ||
    a.scena.numero - b.scena.numero
  );
}

/** Filtro a tre stati: solo le scene con, solo quelle senza, o indifferente. */
export type Filtro = 'tutte' | 'con' | 'senza';

export interface Filtri {
  canzone: Filtro;
  coro: Filtro;
  coreografia: Filtro;
}

export const FILTRI_INIZIALI: Filtri = { canzone: 'tutte', coro: 'tutte', coreografia: 'tutte' };

function passa(filtro: Filtro, valore: boolean): boolean {
  return filtro === 'tutte' || (filtro === 'con') === valore;
}

export function passaFiltri(scena: Scene, filtri: Filtri): boolean {
  return (
    passa(filtri.canzone, scena.canzone) && passa(filtri.coro, scena.coro) && passa(filtri.coreografia, scena.coreografia)
  );
}

/** Le scene filtrate, con le loro statistiche, nell'ordine in cui conviene provarle. */
export function sceneDaProvare(data: MusicalData, presenti: ReadonlySet<string>, filtri: Filtri = FILTRI_INIZIALI): StatScena[] {
  return data.scene
    .filter((s) => passaFiltri(s, filtri))
    .map((s) => statScena(data, s, presenti))
    .sort(confrontaScene);
}

/** Hash dell'URL che apre la scheda di una scena: «#scena-12». */
export function hashScena(numero: number): string {
  return `#scena-${numero}`;
}

export function parseHashScena(hash: string): number | null {
  const match = /^#scena-(\d+)$/.exec(hash);
  return match ? Number(match[1]) : null;
}
