import { publishedCsvUrl } from '../../lib/sheets';

/** Il foglio ha una scheda sola: la griglia della settimana in corso. */
export type ObiettiviSheet = 'settimana';

const env = import.meta.env;

const publicationId = env.PUBLIC_OBIETTIVI_SHEET_ID;
const gid = env.PUBLIC_OBIETTIVI_GID_SETTIMANA;

// Il gid è facoltativo: senza, si legge la prima scheda del foglio pubblicato.
const configured = Boolean(publicationId);

/** Fixture se richieste con PUBLIC_OBIETTIVI_USE_FIXTURES=true o se manca l'ID del foglio. */
export const useFixtures = env.PUBLIC_OBIETTIVI_USE_FIXTURES === 'true' || !configured;

export const sheetUrls: Record<ObiettiviSheet, string> = {
  settimana: useFixtures ? '/fixtures/obiettivi/settimana.csv' : publishedCsvUrl(publicationId!, gid || undefined),
};

/** Chiave della copia salvata: cambia tra fixture e foglio vero, così non si mescolano. */
export const storageKey = `hub:obiettivi:sheets:v1:${useFixtures ? 'fixtures' : 'live'}`;
