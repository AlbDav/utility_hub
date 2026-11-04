/**
 * Logica della Panoramica: scala di colore delle volte provata e conto alla
 * rovescia per la prima. Funzioni pure, senza React.
 */
import { giorniTra } from '../../lib/dates';

export const LIVELLI = 4;

/** Giorni di calendario da oggi alla prima (0 il giorno stesso, negativo dopo). */
export function giorniAllaPrima(oggi: Date, prima: Date): number {
  return giorniTra(oggi, prima);
}

/** Etichetta sotto il numero dei giorni che mancano alla prima. */
export function etichettaConto(giorni: number): string {
  if (giorni > 1) return 'Giorni alla prima';
  if (giorni === 1) return 'Giorno alla prima';
  if (giorni === 0) return 'Oggi è la prima';
  return 'La prima è passata';
}

/** Livello di colore (0…3) delle volte provata, sulla scala dal minimo al massimo attuale. */
export function livello(volte: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.round(((volte - min) / (max - min)) * (LIVELLI - 1));
}

/**
 * Estremi della scala. Le scene mai provate hanno un aspetto loro, quindi la
 * scala parte dalla meno provata tra quelle provate almeno una volta e le
 * quattro tonalità restano tutte per loro. null se nessuna scena è stata provata.
 */
export function estremiScala(volte: number[]): { min: number; max: number } | null {
  const provate = volte.filter((v) => v > 0);
  return provate.length ? { min: Math.min(...provate), max: Math.max(...provate) } : null;
}

/** Per la legenda: le volte provata che cadono in ogni livello, come «1–2», «3» o null se nessuna. */
export function legenda(min: number, max: number): (string | null)[] {
  const gruppi: number[][] = Array.from({ length: LIVELLI }, () => []);
  for (let v = min; v <= max; v++) gruppi[livello(v, min, max)].push(v);
  return gruppi.map((g) => {
    if (g.length === 0) return null;
    const [primo, ultimo] = [g[0], g[g.length - 1]];
    return primo === ultimo ? `${primo}` : `${primo}–${ultimo}`;
  });
}
