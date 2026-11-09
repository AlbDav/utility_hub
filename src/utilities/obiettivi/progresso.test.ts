import { describe, expect, it } from 'vitest';
import {
  arrotonda,
  chiaveGiorno,
  conPercentualeGiorno,
  conPercentualeSettimana,
  mediaGiorno,
  parseProgresso,
  percentualeGiorno,
  percentualeSettimana,
  PROGRESSO_INIZIALE,
  quantiFatti,
} from './progresso';

const GIOVEDI = new Date(2026, 10, 12);
const LUNEDI = new Date(2026, 10, 9);

describe('percentuali', () => {
  it('arrotonda a passi di 5 e non esce da 0–100', () => {
    expect(arrotonda(0.47)).toBe(45);
    expect(arrotonda(0.48)).toBe(50);
    expect(arrotonda(-0.3)).toBe(0);
    expect(arrotonda(1.4)).toBe(100);
    expect(arrotonda(Number.NaN)).toBe(0);
  });

  it('tiene gli obiettivi di un giorno separati per posizione', () => {
    expect(chiaveGiorno(GIOVEDI, 0)).toBe('2026-11-12#0');
    let progresso = conPercentualeGiorno(PROGRESSO_INIZIALE, GIOVEDI, 0, 60);
    progresso = conPercentualeGiorno(progresso, GIOVEDI, 2, 100);
    expect(percentualeGiorno(progresso, GIOVEDI, 0)).toBe(60);
    expect(percentualeGiorno(progresso, GIOVEDI, 1)).toBe(0);
    expect(percentualeGiorno(progresso, GIOVEDI, 2)).toBe(100);
    expect(mediaGiorno(progresso, GIOVEDI, 3)).toBe(53);
    expect(quantiFatti(progresso, GIOVEDI, 3)).toBe(1);
  });

  it('la settimana sta per conto suo, sotto la data del lunedì', () => {
    const progresso = conPercentualeSettimana(PROGRESSO_INIZIALE, LUNEDI, 35);
    expect(percentualeSettimana(progresso, LUNEDI)).toBe(35);
    expect(percentualeSettimana(progresso, GIOVEDI)).toBe(0);
    expect(progresso.giorni).toEqual({});
  });

  it('un giorno senza obiettivi non ha una media', () => {
    expect(mediaGiorno(PROGRESSO_INIZIALE, GIOVEDI, 0)).toBeNull();
  });

  it('scarta quello che arriva rotto dallo storage', () => {
    expect(parseProgresso(null)).toBeNull();
    expect(parseProgresso('ciao')).toBeNull();
    expect(parseProgresso({ giorni: { 'a#0': 'tanto', 'b#0': 50, 'c#0': 400 } })).toEqual({
      giorni: { 'b#0': 50, 'c#0': 100 },
      settimane: {},
    });
  });
});
