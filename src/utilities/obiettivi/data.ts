/**
 * Dalla griglia del foglio al modello dati degli Obiettivi. Funzioni pure,
 * senza React.
 *
 * Il foglio è una griglia sola, quella della settimana in corso: una riga di
 * intestazioni con i sette giorni (lunedì…domenica) e, più in là, due celle
 * con l'obiettivo della settimana e la data del lunedì con cui comincia.
 * Sotto ogni giorno una riga per obiettivo, dal più al meno importante.
 *
 * Le colonne si cercano dalla loro intestazione (i sette giorni, «settimana»
 * e «data»), ignorando maiuscole e accenti; le righe si contano da quella
 * delle intestazioni in giù. Così la griglia si può spostare nel foglio senza
 * che l'app smetta di leggerla.
 */
import { giorniTra, nomiGiorni } from '../../lib/dates';
import { parseDate, type Table, type Tables } from '../../lib/sheets';
import type { ObiettiviSheet } from './config';

export interface Settimana {
  /** Il lunedì scritto nel foglio. null se la cella è vuota o non è una data. */
  lunedi: Date | null;
  /** Obiettivo della settimana. Stringa vuota se la cella è vuota. */
  obiettivo: string;
  /** Sette liste di obiettivi, da lunedì a domenica, in ordine di importanza. */
  giorni: string[][];
  /** Problemi trovati nel foglio: non bloccano l'app. */
  avvisi: string[];
}

/** Oltre questo numero di righe sotto i giorni si smette di leggere. */
const MAX_RIGHE = 12;

export const SETTIMANA_VUOTA: Settimana = {
  lunedi: null,
  obiettivo: '',
  giorni: [[], [], [], [], [], [], []],
  avvisi: [],
};

/** Minuscolo, senza accenti e senza spazi ai lati: «Lunedì » e «lunedi» sono la stessa cosa. */
function normalizza(valore: string): string {
  return valore
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

function cella(cells: string[][], riga: number, colonna: number): string {
  if (colonna < 0) return '';
  return cells[riga]?.[colonna] ?? '';
}

/** La prima riga che contiene «lunedì»: è lì che comincia la griglia. */
function trovaRigaIntestazioni(cells: string[][]): number {
  return cells.findIndex((riga) => riga.some((c) => normalizza(c) === 'lunedi'));
}

/** La colonna con l'intestazione `etichetta`, -1 se non c'è. */
function trovaColonna(intestazioni: string[], etichetta: string): number {
  return intestazioni.findIndex((c) => normalizza(c) === etichetta);
}

/**
 * La data del foglio. Oltre a gg/mm/aaaa accetta gg/mm senza anno, come si
 * scrive a mano: l'anno è quello che porta la data più vicina a `oggi`, così
 * un «30/12» scritto a gennaio resta dell'anno scorso.
 */
export function leggiData(testo: string, oggi: Date): Date | null {
  const intera = parseDate(testo);
  if (intera) return intera;
  const senzaAnno = /^(\d{1,2})\/(\d{1,2})$/.exec(testo.trim());
  if (!senzaAnno) return null;
  const [giorno, mese] = [Number(senzaAnno[1]), Number(senzaAnno[2])];
  let migliore: Date | null = null;
  for (const anno of [oggi.getFullYear() - 1, oggi.getFullYear(), oggi.getFullYear() + 1]) {
    const candidata = parseDate(`${giorno}/${mese}/${anno}`);
    if (candidata && (!migliore || Math.abs(giorniTra(oggi, candidata)) < Math.abs(giorniTra(oggi, migliore)))) {
      migliore = candidata;
    }
  }
  return migliore;
}

export function buildSettimana(tables: Tables<ObiettiviSheet>, oggi: Date = new Date()): Settimana {
  const avvisi: string[] = [];
  const cells = (tables.settimana as Table).cells;

  const rigaIntestazioni = trovaRigaIntestazioni(cells);
  if (rigaIntestazioni === -1) {
    return {
      ...SETTIMANA_VUOTA,
      avvisi: ['Nel foglio non trovo la riga con i giorni della settimana (da «lunedì» a «domenica»).'],
    };
  }
  const intestazioni = cells[rigaIntestazioni];
  const primaRiga = rigaIntestazioni + 1;

  // Colonne dei giorni: una per nome, nell'ordine da lunedì a domenica.
  const colonneGiorni = nomiGiorni.map((nome) => trovaColonna(intestazioni, normalizza(nome)));
  const mancanti = nomiGiorni.filter((_, i) => colonneGiorni[i] === -1);
  if (mancanti.length > 0) avvisi.push(`Nel foglio manca la colonna di: ${mancanti.join(', ')}.`);

  // Quante righe di obiettivi: si scende finché almeno un giorno ha qualcosa.
  let righe = 0;
  while (righe < MAX_RIGHE) {
    const riga = primaRiga + righe;
    if (riga >= cells.length) break;
    if (colonneGiorni.every((c) => cella(cells, riga, c) === '')) break;
    righe += 1;
  }

  const giorni = colonneGiorni.map((colonna) => {
    const lista: string[] = [];
    for (let i = 0; i < righe; i += 1) {
      const testo = cella(cells, primaRiga + i, colonna);
      if (testo !== '') lista.push(testo);
    }
    return lista;
  });

  // La settimana: sotto «settimana» l'obiettivo, sotto «data» il lunedì.
  const colonnaObiettivo = trovaColonna(intestazioni, 'settimana');
  const colonnaData = trovaColonna(intestazioni, 'data');
  if (colonnaObiettivo === -1) avvisi.push('Nel foglio manca la colonna «settimana» con l’obiettivo della settimana.');
  if (colonnaData === -1) avvisi.push('Nel foglio manca la colonna «data» con il lunedì di inizio.');

  const testoData = cella(cells, primaRiga, colonnaData);
  const lunedi = leggiData(testoData, oggi);
  if (colonnaData !== -1 && testoData !== '' && lunedi === null) {
    avvisi.push(`La data di inizio «${testoData}» non si riesce a leggere (scrivila come gg/mm o gg/mm/aaaa).`);
  }

  return { lunedi, obiettivo: cella(cells, primaRiga, colonnaObiettivo), giorni, avvisi };
}
