import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseCsv } from '../../lib/sheets';
import { buildMusicalData } from './data';

const fixture = (name: string) => parseCsv(readFileSync(`public/fixtures/musical/${name}.csv`, 'utf8'));

describe('fixture del musical', () => {
  it('hanno la struttura del foglio e nessun avviso', () => {
    const data = buildMusicalData({
      scene: fixture('scene'),
      personaggi: fixture('personaggi'),
      cast: fixture('cast'),
      prove: fixture('prove'),
    });
    expect(data.avvisi).toEqual([]);
    expect(data.scene.length).toBeGreaterThan(0);
  });
});
