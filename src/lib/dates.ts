const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const MESI_ESTESI = [
  'gennaio',
  'febbraio',
  'marzo',
  'aprile',
  'maggio',
  'giugno',
  'luglio',
  'agosto',
  'settembre',
  'ottobre',
  'novembre',
  'dicembre',
];

const MS_GIORNO = 24 * 60 * 60 * 1000;

/** Giorni di calendario da `da` ad `a` (0 lo stesso giorno, negativo se `a` è passato). Ignora l'ora legale. */
export function giorniTra(da: Date, a: Date): number {
  const inizio = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  const fine = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  return Math.round((fine - inizio) / MS_GIORNO);
}

/** Data locale in aaaa-mm-gg. */
export function aIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Data in aaaa-mm-gg come data locale. */
export function daIso(iso: string): Date {
  const [anno, mese, giorno] = iso.split('-').map(Number);
  return new Date(anno, mese - 1, giorno);
}

/** «28 ott» */
export function giornoMese(date: Date): string {
  return `${date.getDate()} ${MESI[date.getMonth()]}`;
}

/** «8 mag 2027» */
export function giornoMeseAnno(date: Date): string {
  return `${giornoMese(date)} ${date.getFullYear()}`;
}

/** «l’8 maggio», «l’11 maggio», «il 1º maggio», «il 15 maggio» */
export function conArticolo(date: Date): string {
  const giorno = date.getDate();
  const mese = MESI_ESTESI[date.getMonth()];
  if (giorno === 1) return `il 1º ${mese}`;
  return `${giorno === 8 || giorno === 11 ? 'l’' : 'il '}${giorno} ${mese}`;
}
