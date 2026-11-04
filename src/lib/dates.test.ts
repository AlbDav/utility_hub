import { describe, expect, it } from 'vitest';
import { aIso, conArticolo, daIso, giornoMese, giornoMeseAnno, giorniTra } from './dates';

describe('date', () => {
  it('conta i giorni di calendario anche col cambio dell’ora legale', () => {
    expect(giorniTra(new Date(2027, 2, 27, 23, 0), new Date(2027, 2, 29, 1, 0))).toBe(2);
    expect(giorniTra(new Date(2027, 4, 9), new Date(2027, 4, 8))).toBe(-1);
  });

  it('formatta in breve in italiano', () => {
    expect(giornoMese(new Date(2026, 9, 28))).toBe('28 ott');
    expect(giornoMeseAnno(daIso('2027-05-08'))).toBe('8 mag 2027');
    expect(aIso(new Date(2027, 4, 8))).toBe('2027-05-08');
  });

  it('mette l’articolo giusto davanti alla data', () => {
    expect(conArticolo(new Date(2027, 4, 8))).toBe('l’8 maggio');
    expect(conArticolo(new Date(2027, 4, 11))).toBe('l’11 maggio');
    expect(conArticolo(new Date(2027, 4, 1))).toBe('il 1º maggio');
    expect(conArticolo(new Date(2027, 4, 15))).toBe('il 15 maggio');
  });
});
