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

const GIORNI = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
const GIORNI_CORTI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

/** Giorni della settimana in italiano, da lunedì a domenica. */
export const nomiGiorni = GIORNI;

/** Posizione nella settimana: 0 lunedì … 6 domenica. */
export function indiceGiorno(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Lunedì della settimana di `date`, a mezzanotte. */
export function lunediDi(date: Date): Date {
  const lunedi = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  lunedi.setDate(lunedi.getDate() - indiceGiorno(lunedi));
  return lunedi;
}

/** Il giorno in posizione `indice` (0 lunedì) della settimana che comincia il `lunedi`. */
export function giornoDellaSettimana(lunedi: Date, indice: number): Date {
  const giorno = new Date(lunedi.getFullYear(), lunedi.getMonth(), lunedi.getDate());
  giorno.setDate(giorno.getDate() + indice);
  return giorno;
}

/** «lunedì» */
export function nomeGiorno(date: Date): string {
  return GIORNI[indiceGiorno(date)];
}

/** «Lun» */
export function nomeGiornoCorto(date: Date): string {
  return GIORNI_CORTI[indiceGiorno(date)];
}

/** Numero di settimana ISO 8601: quella del giovedì decide l'anno. */
export function numeroSettimana(date: Date): number {
  const giovedi = giornoDellaSettimana(lunediDi(date), 3);
  const primoGennaio = new Date(giovedi.getFullYear(), 0, 1);
  return Math.floor(giorniTra(primoGennaio, giovedi) / 7) + 1;
}

/** «9–15 nov», «30 nov – 6 dic» */
export function intervalloSettimana(lunedi: Date): string {
  const domenica = giornoDellaSettimana(lunedi, 6);
  if (lunedi.getMonth() === domenica.getMonth()) return `${lunedi.getDate()}–${giornoMese(domenica)}`;
  return `${giornoMese(lunedi)} – ${giornoMese(domenica)}`;
}
