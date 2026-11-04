import { FILTRI_INIZIALI, type Filtri, type Filtro } from './logic';

/** Spunte della vista Prova, salvate sul telefono finché non si azzera. */
export interface StatoProva {
  presenti: string[];
  filtri: Filtri;
}

export const STATO_INIZIALE: StatoProva = { presenti: [], filtri: FILTRI_INIZIALI };

export const STATO_KEY = 'hub:musical:prova:v1';

const isFiltro = (v: unknown): v is Filtro => v === 'tutte' || v === 'con' || v === 'senza';

export function parseStatoProva(value: unknown): StatoProva | null {
  if (!value || typeof value !== 'object') return null;
  const { presenti, filtri } = value as Partial<StatoProva>;
  if (!Array.isArray(presenti) || !presenti.every((p) => typeof p === 'string')) return null;
  const f = (filtri ?? {}) as Partial<Filtri>;
  return {
    presenti,
    filtri: {
      canzone: isFiltro(f.canzone) ? f.canzone : 'tutte',
      coro: isFiltro(f.coro) ? f.coro : 'tutte',
      coreografia: isFiltro(f.coreografia) ? f.coreografia : 'tutte',
    },
  };
}
