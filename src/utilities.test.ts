import { describe, expect, it } from 'vitest';
import { percorso, trovaUtility, utilities } from './utilities';

describe('registro delle utility', () => {
  it('ha slug unici', () => {
    const slugs = utilities.map((u) => u.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('genera il percorso dallo slug', () => {
    expect(percorso(trovaUtility('musical'))).toBe('/musical/');
  });

  it('segnala una utility non registrata', () => {
    expect(() => trovaUtility('inesistente')).toThrow();
  });
});
