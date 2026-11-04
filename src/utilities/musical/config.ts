import { parseDate, publishedCsvUrl } from '../../lib/sheets';

export type MusicalSheet = 'scene' | 'personaggi' | 'cast' | 'prove';

const env = import.meta.env;

const publicationId = env.PUBLIC_MUSICAL_SHEET_ID;
const gids: Record<MusicalSheet, string | undefined> = {
  scene: env.PUBLIC_MUSICAL_GID_SCENE,
  personaggi: env.PUBLIC_MUSICAL_GID_PERSONAGGI,
  cast: env.PUBLIC_MUSICAL_GID_CAST,
  prove: env.PUBLIC_MUSICAL_GID_PROVE,
};

const configured = Boolean(publicationId) && Object.values(gids).every(Boolean);

/** Fixture se richieste con PUBLIC_MUSICAL_USE_FIXTURES=true o se manca qualche ID del foglio. */
export const useFixtures = env.PUBLIC_MUSICAL_USE_FIXTURES === 'true' || !configured;

const fixtureUrl = (sheet: MusicalSheet) => `/fixtures/musical/${sheet}.csv`;

export const sheetUrls: Record<MusicalSheet, string> = {
  scene: useFixtures ? fixtureUrl('scene') : publishedCsvUrl(publicationId!, gids.scene!),
  personaggi: useFixtures ? fixtureUrl('personaggi') : publishedCsvUrl(publicationId!, gids.personaggi!),
  cast: useFixtures ? fixtureUrl('cast') : publishedCsvUrl(publicationId!, gids.cast!),
  prove: useFixtures ? fixtureUrl('prove') : publishedCsvUrl(publicationId!, gids.prove!),
};

/** Data della prima, da PUBLIC_MUSICAL_DATA_PRIMA (aaaa-mm-gg o gg/mm/aaaa). null se non è impostata. */
export const dataPrima = env.PUBLIC_MUSICAL_DATA_PRIMA ? parseDate(env.PUBLIC_MUSICAL_DATA_PRIMA) : null;
// Una data scritta male blocca la build, invece di sparire in silenzio dall'app.
if (env.PUBLIC_MUSICAL_DATA_PRIMA && !dataPrima) {
  throw new Error(`PUBLIC_MUSICAL_DATA_PRIMA non è una data valida: «${env.PUBLIC_MUSICAL_DATA_PRIMA}»`);
}

/** Chiave della copia salvata: cambia tra fixture e foglio vero, così non si mescolano. */
export const storageKey = `hub:musical:sheets:v1:${useFixtures ? 'fixtures' : 'live'}`;
