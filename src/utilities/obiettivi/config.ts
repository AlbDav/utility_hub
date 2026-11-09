import { publishedCsvUrl } from '../../lib/sheets';

/** Il foglio ha una scheda sola: la griglia della settimana in corso. */
export type ObiettiviSheet = 'settimana';

const env = import.meta.env;

const publicationId = env.PUBLIC_OBIETTIVI_SHEET_ID;
const gid = env.PUBLIC_OBIETTIVI_GID_SETTIMANA;

// Senza l'ID la build si ferma, invece di pubblicare una pagina che non legge niente.
if (!publicationId) {
  throw new Error('PUBLIC_OBIETTIVI_SHEET_ID non è impostata: serve l’ID del foglio pubblicato (vedi .env.example).');
}

// Il gid è facoltativo: senza, si legge la prima scheda del foglio pubblicato.
export const sheetUrls: Record<ObiettiviSheet, string> = {
  settimana: publishedCsvUrl(publicationId, gid || undefined),
};

export const storageKey = 'hub:obiettivi:sheets:v1';
