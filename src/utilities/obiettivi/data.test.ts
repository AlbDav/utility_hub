import { describe, expect, it } from 'vitest';
import { parseCsv } from '../../lib/sheets';
import { buildSettimana, leggiData } from './data';

const foglio = (csv: string) => buildSettimana({ settimana: parseCsv(csv) });

const GRIGLIA = `lunedì,martedì,mercoledì,giovedì,venerdì,sabato,domenica,,settimana,data
Ricette dei dolci,Scrivere due ricette,Altre due ricette,Tiramisù,Rileggere,Impaginare,Mandare la bozza,,Chiudere il capitolo dolci,09/11/2026
Mail della parrocchia,Scene della prova,Preventivo,Foto dei dolci,Sviluppare le foto,Prova del musical,Obiettivi della settimana,,,
Tedesco,Bagno,Lavatrice,Tedesco,Spesa,Scrivania,Passeggiata,,,
`;

describe('griglia degli obiettivi', () => {
  it('legge i sette giorni, in ordine di importanza', () => {
    const settimana = foglio(GRIGLIA);
    expect(settimana.giorni).toHaveLength(7);
    expect(settimana.giorni[0]).toEqual(['Ricette dei dolci', 'Mail della parrocchia', 'Tedesco']);
    expect(settimana.giorni[6]).toEqual(['Mandare la bozza', 'Obiettivi della settimana', 'Passeggiata']);
    expect(settimana.avvisi).toEqual([]);
  });

  it('legge l’obiettivo della settimana e il lunedì di inizio', () => {
    const settimana = foglio(GRIGLIA);
    expect(settimana.obiettivo).toBe('Chiudere il capitolo dolci');
    expect(settimana.lunedi).toEqual(new Date(2026, 10, 9));
  });

  it('trova la griglia anche se è stata spostata nel foglio', () => {
    const spostata = `,,,,,,,,,,
,LUNEDI,martedì,mercoledì,giovedì,venerdì,sabato,Domenica,settimana,data
,Uno,Due,Tre,Quattro,Cinque,Sei,Sette,Obiettivo grosso,09/11/2026
`;
    const settimana = foglio(spostata);
    expect(settimana.giorni[0]).toEqual(['Uno']);
    expect(settimana.giorni[6]).toEqual(['Sette']);
    expect(settimana.obiettivo).toBe('Obiettivo grosso');
    expect(settimana.avvisi).toEqual([]);
  });

  it('tiene il posto delle righe vuote in mezzo', () => {
    const conBuco = `lunedì,martedì,mercoledì,giovedì,venerdì,sabato,domenica,,settimana,data
Uno,,,,,,,,Obiettivo,09/11/2026
,Solo martedì,,,,,,,,
Tre,,,,,,,,,
`;
    const settimana = foglio(conBuco);
    // Lunedì non ha niente in seconda posizione: «Tre» resta il terzo del foglio.
    expect(settimana.giorni[0]).toEqual(['Uno', 'Tre']);
    expect(settimana.giorni[1]).toEqual(['Solo martedì']);
  });

  it('segnala una data che non si riesce a leggere', () => {
    const settimana = foglio(GRIGLIA.replace('09/11/2026', 'lunedì prossimo'));
    expect(settimana.lunedi).toBeNull();
    expect(settimana.avvisi).toEqual([
      'La data di inizio «lunedì prossimo» non si riesce a leggere (scrivila come gg/mm o gg/mm/aaaa).',
    ]);
  });

  it('con la data vuota non si lamenta: vale la settimana in corso', () => {
    const settimana = foglio(GRIGLIA.replace('09/11/2026', ''));
    expect(settimana.lunedi).toBeNull();
    expect(settimana.avvisi).toEqual([]);
  });

  it('segnala le colonne che mancano', () => {
    const senzaSabato = `lunedì,martedì,mercoledì,giovedì,venerdì,domenica,,settimana,data
Uno,Due,Tre,Quattro,Cinque,Sette,,Obiettivo,09/11/2026
`;
    const settimana = foglio(senzaSabato);
    expect(settimana.giorni[5]).toEqual([]);
    expect(settimana.giorni[6]).toEqual(['Sette']);
    expect(settimana.avvisi).toContain('Nel foglio manca la colonna di: sabato.');
  });

  it('senza la riga dei giorni non prova a indovinare', () => {
    const settimana = foglio('qualcosa,altro\n1,2\n');
    expect(settimana.giorni).toEqual([[], [], [], [], [], [], []]);
    expect(settimana.obiettivo).toBe('');
    expect(settimana.avvisi).toHaveLength(1);
  });
});

describe('data di inizio', () => {
  const oggi = new Date(2026, 10, 9);

  it('legge gg/mm/aaaa e gg/mm', () => {
    expect(leggiData('09/11/2026', oggi)).toEqual(new Date(2026, 10, 9));
    expect(leggiData('9/11', oggi)).toEqual(new Date(2026, 10, 9));
  });

  it('senza anno sceglie quello più vicino a oggi', () => {
    expect(leggiData('29/12', new Date(2027, 0, 2))).toEqual(new Date(2026, 11, 29));
    expect(leggiData('4/1', new Date(2026, 11, 28))).toEqual(new Date(2027, 0, 4));
  });

  it('rifiuta quello che non è una data', () => {
    expect(leggiData('31/02', oggi)).toBeNull();
    expect(leggiData('lunedì', oggi)).toBeNull();
    expect(leggiData('', oggi)).toBeNull();
  });

  it('il foglio con «9/11» è letto senza avvisi', () => {
    const csv = GRIGLIA.replace('09/11/2026', '9/11');
    const settimana = buildSettimana({ settimana: parseCsv(csv) }, oggi);
    expect(settimana.lunedi).toEqual(new Date(2026, 10, 9));
    expect(settimana.avvisi).toEqual([]);
  });
});
