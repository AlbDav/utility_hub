/**
 * Dalle quattro schede del foglio al modello dati del Planner prove,
 * con i controlli sui dati. Funzioni pure, senza React.
 */
import { isYes, parseDate, type Table, type Tables } from '../../lib/sheets';
import type { MusicalSheet } from './config';

export interface Scene {
  numero: number;
  titolo: string;
  canzone: boolean;
  coreografia: boolean;
  coro: boolean;
  pagina: string;
  note: string;
}

export interface Gruppo {
  nome: string;
  /** Personaggi che ne fanno parte, secondo Personaggi. */
  membri: string[];
}

export interface CastScena {
  personaggi: string[];
  gruppi: string[];
}

export interface Prova {
  /** null se la data nel foglio non si riesce a leggere. */
  data: Date | null;
  scene: number[];
}

export interface MusicalData {
  /** In ordine di numero. */
  scene: Scene[];
  personaggi: string[];
  gruppi: Gruppo[];
  cast: Record<number, CastScena>;
  prove: Prova[];
  avvisi: string[];
}

/** Trova l'intestazione di una colonna fissa ignorando maiuscole e minuscole. */
function findHeader(table: Table, name: string): string | undefined {
  return table.headers.find((h) => h.toLowerCase() === name);
}

function parseSceneNumber(value: string | undefined): number | null {
  const n = Number((value ?? '').trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function buildMusicalData(tables: Tables<MusicalSheet>): MusicalData {
  const avvisi: string[] = [];

  // Scene
  const sceneTable = tables.scene;
  const h = (name: string) => findHeader(sceneTable, name) ?? name;
  const scene: Scene[] = [];
  for (const row of sceneTable.rows) {
    const numero = parseSceneNumber(row[h('scena')]);
    if (numero === null) {
      avvisi.push(`Scene: una riga ha il numero di scena «${row[h('scena')] ?? ''}» che non è un numero.`);
      continue;
    }
    scene.push({
      numero,
      titolo: row[h('titolo')] ?? '',
      canzone: isYes(row[h('canzone')]),
      coreografia: isYes(row[h('coreografia')]),
      coro: isYes(row[h('coro')]),
      pagina: row[h('pagina')] ?? '',
      note: row[h('note')] ?? '',
    });
  }
  scene.sort((a, b) => a.numero - b.numero);

  // Personaggi e gruppi: i gruppi sono tutte le colonne tranne «nome».
  const personaggiTable = tables.personaggi;
  const nomeHeader = findHeader(personaggiTable, 'nome') ?? 'nome';
  const nomiGruppi = personaggiTable.headers.filter((x) => x !== nomeHeader);
  const personaggi = personaggiTable.rows.map((r) => r[nomeHeader] ?? '').filter((n) => n !== '');
  const gruppi: Gruppo[] = nomiGruppi.map((nome) => ({
    nome,
    membri: personaggiTable.rows.filter((r) => isYes(r[nome]) && isYes(r[nomeHeader])).map((r) => r[nomeHeader]),
  }));

  // Cast
  const castTable = tables.cast;
  const castScenaHeader = findHeader(castTable, 'scena') ?? 'scena';
  const castColumns = castTable.headers.filter((x) => x !== castScenaHeader);
  const personaggiSet = new Set(personaggi);
  const gruppiSet = new Set(nomiGruppi);
  for (const col of castColumns) {
    if (!personaggiSet.has(col) && !gruppiSet.has(col)) {
      avvisi.push(`Cast: la colonna «${col}» non corrisponde a nessun personaggio o gruppo.`);
    }
  }
  const castColumnSet = new Set(castColumns);
  for (const p of personaggi) {
    if (!castColumnSet.has(p)) avvisi.push(`Cast: manca la colonna del personaggio «${p}».`);
  }
  for (const g of nomiGruppi) {
    if (!castColumnSet.has(g)) avvisi.push(`Cast: manca la colonna del gruppo «${g}».`);
  }
  const cast: Record<number, CastScena> = {};
  for (const row of castTable.rows) {
    const numero = parseSceneNumber(row[castScenaHeader]);
    if (numero === null) continue;
    cast[numero] = {
      personaggi: castColumns.filter((c) => personaggiSet.has(c) && isYes(row[c])),
      gruppi: castColumns.filter((c) => gruppiSet.has(c) && isYes(row[c])),
    };
  }

  // Prove: «data», poi una colonna per scena con il numero come intestazione.
  const proveTable = tables.prove;
  const dataHeader = findHeader(proveTable, 'data') ?? 'data';
  const sceneColumns = proveTable.headers
    .filter((x) => x !== dataHeader)
    .map((header) => ({ header, numero: parseSceneNumber(header) }))
    .filter((c): c is { header: string; numero: number } => c.numero !== null);
  const prove: Prova[] = proveTable.rows.map((row) => {
    const data = parseDate(row[dataHeader]);
    if (data === null) avvisi.push(`Prove: la data «${row[dataHeader] ?? ''}» non si riesce a leggere (usa gg/mm/aaaa).`);
    return { data, scene: sceneColumns.filter((c) => isYes(row[c.header])).map((c) => c.numero) };
  });

  // Scene che mancano in Cast o in Prove.
  const proveSceneSet = new Set(sceneColumns.map((c) => c.numero));
  for (const s of scene) {
    if (!(s.numero in cast)) avvisi.push(`Cast: manca la riga della scena ${s.numero}.`);
    if (!proveSceneSet.has(s.numero)) avvisi.push(`Prove: manca la colonna della scena ${s.numero}.`);
  }

  return { scene, personaggi, gruppi, cast, prove, avvisi };
}
