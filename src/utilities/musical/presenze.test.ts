import { describe, expect, it } from 'vitest';
import { parseStatoProva, STATO_INIZIALE } from './presenze';

describe('parseStatoProva', () => {
  it('rilegge uno stato salvato', () => {
    const stato = {
      presenti: ['Anna'],
      filtri: { canzone: 'con', coro: 'senza', coreografia: 'tutte' },
      contaGruppi: false,
    };
    expect(parseStatoProva(stato)).toEqual(stato);
  });

  it('scarta contenuti non validi', () => {
    expect(parseStatoProva(null)).toBeNull();
    expect(parseStatoProva('x')).toBeNull();
    expect(parseStatoProva({ presenti: [1] })).toBeNull();
  });

  it('conta i gruppi negli stati salvati prima del toggle', () => {
    expect(parseStatoProva({ presenti: ['Anna'], filtri: {} })?.contaGruppi).toBe(true);
  });

  it('rimette indifferente i filtri mancanti o sconosciuti', () => {
    expect(parseStatoProva({ presenti: [], filtri: { canzone: 'boh' } })).toEqual(STATO_INIZIALE);
  });
});
