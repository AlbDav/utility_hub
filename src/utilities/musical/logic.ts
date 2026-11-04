/**
 * Logica del Planner prove: chi è in scena, sostituti, prove fatte e ordine
 * delle scene. Funzioni pure, senza React.
 */
import type { MusicalData, Scene } from './data';

export interface StatScena {
  scena: Scene;
  /**
   * Personaggi in scena, senza doppioni, nell'ordine di Personaggi: quelli segnati
   * da soli in Cast e, se si contano i gruppi, i membri dei gruppi segnati.
   */
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

/**
 * Chi è in scena. Con `conGruppi` falso contano solo i personaggi segnati da
 * soli in Cast, non i membri dei gruppi segnati.
 */
export function genteInScena(data: MusicalData, numero: number, conGruppi = true): string[] {
  const cast = data.cast[numero];
  if (!cast) return [];
  const inScena = new Set(cast.personaggi);
  for (const nomeGruppo of conGruppi ? cast.gruppi : []) {
    const gruppo = data.gruppi.find((g) => g.nome === nomeGruppo);
    gruppo?.membri.forEach((m) => inScena.add(m));
  }
  return data.personaggi.filter((p) => inScena.has(p));
}

export function statScena(
  data: MusicalData,
  scena: Scene,
  presenti: ReadonlySet<string>,
  conGruppi = true,
): StatScena {
  const gente = genteInScena(data, scena.numero, conGruppi);
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

/** Percentuale di presenti tra la gente in scena (0–100), null se la scena è vuota. */
export function percentualePresenti(stat: StatScena): number | null {
  return stat.gente.length ? Math.round((stat.presenti / stat.gente.length) * 100) : null;
}

/**
 * Esponente della quota di presenti nel punteggio. Con 2 un'assenza pesa più
 * di una prova in meno; portarlo a 3 fa pesare ancora di più le assenze.
 */
export const ESPONENTE_PRESENTI = 2;

/**
 * Punteggio di una scena: p^ESPONENTE_PRESENTI / (1 + v), con p = presenti / gente
 * in scena e v = volte provata. null se in scena non c'è nessuno.
 * Serve per mostrarlo o per i test: l'ordine usa il confronto esatto qui sotto.
 */
export function punteggio(stat: StatScena): number | null {
  if (stat.gente.length === 0) return null;
  return (stat.presenti / stat.gente.length) ** ESPONENTE_PRESENTI / (1 + stat.volteProvata);
}

/**
 * Confronta i punteggi, più alto prima, senza decimali: il punteggio è
 * presenti^E / (gente^E · (1 + v)), quindi si confrontano i prodotti incrociati
 * tra interi e due scene con lo stesso punteggio risultano alla pari.
 */
function confrontaPunteggio(a: StatScena, b: StatScena): number {
  const E = ESPONENTE_PRESENTI;
  const numA = a.presenti ** E * (b.gente.length ** E * (1 + b.volteProvata));
  const numB = b.presenti ** E * (a.gente.length ** E * (1 + a.volteProvata));
  return numB - numA;
}

/**
 * Ordine delle scene da provare. Le scene senza nessuno in scena vanno in fondo,
 * in ordine di numero. Le altre:
 * 1. punteggio p² / (1 + v) più alto (vedi `punteggio`);
 * 2. più gente in scena;
 * 3. provata meno di recente (mai provata, o senza date leggibili, prima);
 * 4. numero di scena.
 */
export function confrontaScene(a: StatScena, b: StatScena): number {
  const vuotaA = a.gente.length === 0;
  const vuotaB = b.gente.length === 0;
  if (vuotaA || vuotaB) return Number(vuotaA) - Number(vuotaB) || a.scena.numero - b.scena.numero;
  return (
    confrontaPunteggio(a, b) ||
    b.gente.length - a.gente.length ||
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

/**
 * Le scene filtrate, con le loro statistiche, nell'ordine in cui conviene provarle.
 * `conGruppi` decide se i membri dei gruppi segnati contano nella gente in scena.
 */
export function sceneDaProvare(
  data: MusicalData,
  presenti: ReadonlySet<string>,
  filtri: Filtri = FILTRI_INIZIALI,
  conGruppi = true,
): StatScena[] {
  return data.scene
    .filter((s) => passaFiltri(s, filtri))
    .map((s) => statScena(data, s, presenti, conGruppi))
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

export interface SezionePresenze {
  nome: string;
  persone: string[];
}

/**
 * Personaggi divisi per le caselle delle presenze: prima quelli senza gruppo,
 * poi un blocco per gruppo. Chi sta in più gruppi compare solo nel primo.
 */
export function sezioniPresenze(data: MusicalData): SezionePresenze[] {
  const mostrati = new Set<string>();
  const inGruppo = new Set(data.gruppi.flatMap((g) => g.membri));
  const sezioni: SezionePresenze[] = [{ nome: 'Personaggi', persone: data.personaggi.filter((p) => !inGruppo.has(p)) }];
  sezioni[0].persone.forEach((p) => mostrati.add(p));
  for (const g of data.gruppi) {
    const persone = data.personaggi.filter((p) => g.membri.includes(p) && !mostrati.has(p));
    persone.forEach((p) => mostrati.add(p));
    sezioni.push({ nome: g.nome, persone });
  }
  return sezioni.filter((s) => s.persone.length > 0);
}
