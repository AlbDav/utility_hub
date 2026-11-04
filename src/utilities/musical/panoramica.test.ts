import { describe, expect, it } from 'vitest';
import { estremiScala, giorniAllaPrima, legenda, livello, testoConto } from './panoramica';

describe('giorniAllaPrima', () => {
  it('conta i giorni di calendario fino all’8 maggio 2027', () => {
    expect(giorniAllaPrima(new Date(2026, 10, 4, 23, 59))).toBe(185);
    expect(giorniAllaPrima(new Date(2027, 4, 7, 0, 1))).toBe(1);
    expect(giorniAllaPrima(new Date(2027, 4, 8, 20, 0))).toBe(0);
    expect(giorniAllaPrima(new Date(2027, 4, 9))).toBe(-1);
  });

  it('non sbaglia con il cambio dell’ora legale (28 marzo 2027)', () => {
    expect(giorniAllaPrima(new Date(2027, 2, 27))).toBe(42);
    expect(giorniAllaPrima(new Date(2027, 2, 29))).toBe(40);
  });

  it('ha un testo per prima, durante e dopo', () => {
    expect(testoConto(185)).toBe('Mancano 185 giorni alla prima');
    expect(testoConto(1)).toBe('Domani è la prima');
    expect(testoConto(0)).toBe('Oggi è la prima!');
    expect(testoConto(-3)).toBe('La prima è passata');
  });
});

describe('scala delle volte provata', () => {
  it('va dal minimo (livello 0) al massimo (livello 3)', () => {
    expect(livello(0, 0, 8)).toBe(0);
    expect(livello(2, 0, 8)).toBe(1);
    expect(livello(4, 0, 8)).toBe(2);
    expect(livello(8, 0, 8)).toBe(3);
    expect(livello(3, 3, 5)).toBe(0);
    expect(livello(5, 3, 5)).toBe(3);
  });

  it('con tutte le scene provate lo stesso numero di volte usa il livello 0', () => {
    expect(livello(0, 0, 0)).toBe(0);
    expect(livello(4, 4, 4)).toBe(0);
  });

  it('la legenda dice quali volte cadono in ogni livello', () => {
    expect(legenda(0, 5)).toEqual(['0', '1–2', '3–4', '5']);
    expect(legenda(0, 2)).toEqual(['0', null, '1', '2']);
    expect(legenda(0, 0)).toEqual(['0', null, null, null]);
  });

  it('la scala parte dalla meno provata tra le scene provate almeno una volta', () => {
    expect(estremiScala([0, 1, 4, 0, 2])).toEqual({ min: 1, max: 4 });
    expect(estremiScala([0, 0])).toBeNull();
    expect(estremiScala([])).toBeNull();
  });
});
