import { describe, expect, it } from 'vitest';
import { parseCsv } from '../../lib/sheets';
import { buildMusicalData } from './data';

function build(csv: { scene: string; personaggi: string; cast: string; prove: string }) {
  return buildMusicalData({
    scene: parseCsv(csv.scene),
    personaggi: parseCsv(csv.personaggi),
    cast: parseCsv(csv.cast),
    prove: parseCsv(csv.prove),
  });
}

const base = {
  scene: 'scena,titolo,canzone,coreografia,coro,pagina,note\n2,Due,,,,5,\n1,Uno,x,,x,1,Nota\n',
  personaggi: 'nome,Coro,Bambini\nAnna,x,\nBruno,,\n',
  cast: 'scena,Anna,Bruno,Coro,Bambini\n1,x,,x,\n2,,x,,\n',
  prove: 'data,1,2\n05/09/2026,x,\n2026-09-12,x,x\n',
};

describe('buildMusicalData', () => {
  it('legge scene, personaggi, gruppi, cast e prove', () => {
    const data = build(base);
    expect(data.avvisi).toEqual([]);
    expect(data.scene.map((s) => s.numero)).toEqual([1, 2]);
    expect(data.scene[0]).toMatchObject({ titolo: 'Uno', canzone: true, coreografia: false, coro: true, pagina: '1' });
    expect(data.personaggi).toEqual(['Anna', 'Bruno']);
    expect(data.gruppi).toEqual([
      { nome: 'Coro', membri: ['Anna'] },
      { nome: 'Bambini', membri: [] },
    ]);
    expect(data.cast[1]).toEqual({ personaggi: ['Anna'], gruppi: ['Coro'] });
    expect(data.prove).toEqual([
      { data: new Date(2026, 8, 5), scene: [1] },
      { data: new Date(2026, 8, 12), scene: [1, 2] },
    ]);
  });

  it('segnala un’intestazione di Cast che non è né personaggio né gruppo', () => {
    const data = build({ ...base, cast: 'scena,Anna,Bruno,Coro,Bambini,Zorro\n1,x,,,,\n2,,,,,\n' });
    expect(data.avvisi).toContain('Cast: la colonna «Zorro» non corrisponde a nessun personaggio o gruppo.');
  });

  it('segnala personaggi e gruppi senza colonna in Cast', () => {
    const data = build({ ...base, cast: 'scena,Anna,Coro\n1,x,\n2,,\n' });
    expect(data.avvisi).toContain('Cast: manca la colonna del personaggio «Bruno».');
    expect(data.avvisi).toContain('Cast: manca la colonna del gruppo «Bambini».');
  });

  it('segnala una scena che manca in Cast o in Prove', () => {
    const data = build({ ...base, cast: 'scena,Anna,Bruno,Coro,Bambini\n1,,,,\n', prove: 'data,1\n05/09/2026,x\n' });
    expect(data.avvisi).toContain('Cast: manca la riga della scena 2.');
    expect(data.avvisi).toContain('Prove: manca la colonna della scena 2.');
  });

  it('segnala una data di Prove non leggibile ma tiene la riga', () => {
    const data = build({ ...base, prove: 'data,1,2\nsabato,x,\n' });
    expect(data.avvisi).toEqual(['Prove: la data «sabato» non si riesce a leggere (usa gg/mm/aaaa).']);
    expect(data.prove).toEqual([{ data: null, scene: [1] }]);
  });

  it('accetta Prove vuoto', () => {
    const data = build({ ...base, prove: 'data,1,2\n' });
    expect(data.prove).toEqual([]);
    expect(data.avvisi).toEqual([]);
  });

  it('segnala un numero di scena non valido', () => {
    const data = build({ ...base, scene: 'scena,titolo\nuno,Uno\n1,Uno\n2,Due\n' });
    expect(data.scene.map((s) => s.numero)).toEqual([1, 2]);
    expect(data.avvisi[0]).toMatch(/«uno»/);
  });
});
