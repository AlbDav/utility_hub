import { conArticolo } from './lib/dates';
import type { IconName } from './lib/icons';
import { dataPrima } from './utilities/musical/config';

/**
 * Registro delle utility dell'hub. La home genera un cassetto per ogni voce.
 * Per aggiungere una utility: una voce qui e la sua pagina in src/pages/<slug>/.
 */
export interface Utility {
  slug: string;
  nome: string;
  /** Riga sotto il nome, nel cassetto della home. */
  descrizione: string;
  /** Riga sotto il titolo, nella pagina della utility. */
  sottotitolo: string;
  icona: IconName;
  /** Conto alla rovescia mostrato nel cassetto, calcolato nel browser. */
  scadenza?: { data: Date; etichetta: string };
}

export const utilities: Utility[] = [
  {
    slug: 'musical',
    nome: 'Musical',
    descrizione: 'Planner prove · Aggiungi un posto a tavola',
    sottotitolo: `Aggiungi un posto a tavola${dataPrima ? ` · prima ${conArticolo(dataPrima)}` : ''}`,
    icona: 'riflettore',
    scadenza: dataPrima ? { data: dataPrima, etichetta: 'alla prima' } : undefined,
  },
  {
    slug: 'obiettivi',
    nome: 'Obiettivi',
    descrizione: 'Quello della settimana e i tre di oggi',
    sottotitolo: 'Dal foglio della settimana, spunte su questo telefono',
    icona: 'obiettivo',
  },
];

export function percorso(utility: Utility): string {
  return `/${utility.slug}/`;
}

export function trovaUtility(slug: string): Utility {
  const utility = utilities.find((u) => u.slug === slug);
  if (!utility) throw new Error(`Utility non registrata: ${slug}`);
  return utility;
}
