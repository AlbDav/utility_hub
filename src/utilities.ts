/**
 * Registro delle utility dell'hub. La home genera una card per ogni voce.
 * Per aggiungere una utility: una voce qui e la sua pagina in src/pages/<slug>/.
 */
export interface Utility {
  slug: string;
  nome: string;
  descrizione: string;
  /** Emoji mostrata nella card. */
  icona: string;
}

export const utilities: Utility[] = [
  {
    slug: 'musical',
    nome: 'Musical',
    descrizione: 'Planner prove: quali scene provare in base a chi c’è.',
    icona: '🎭',
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
