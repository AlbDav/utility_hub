/**
 * Le spunte, salvate solo sul telefono: nel foglio non tornano.
 *
 * Un obiettivo giornaliero è individuato da data + posizione («2026-11-12#0»,
 * dove 0 è il più importante), quello della settimana dalla data del lunedì.
 * Se dopo averli spuntati scambi l'ordine di due obiettivi nel foglio, la
 * percentuale resta alla posizione, non al testo.
 */
import { aIso } from '../../lib/dates';

export interface Progresso {
  /** Percentuale 0–100 per «aaaa-mm-gg#posizione». */
  giorni: Record<string, number>;
  /** Percentuale 0–100 dell'obiettivo della settimana, per data del lunedì. */
  settimane: Record<string, number>;
}

export const PROGRESSO_KEY = 'hub:obiettivi:progresso:v1';

export const PROGRESSO_INIZIALE: Progresso = { giorni: {}, settimane: {} };

/** Passo della percentuale, in punti: si va di 5 in 5. */
export const PASSO = 5;

export function chiaveGiorno(data: Date, posizione: number): string {
  return `${aIso(data)}#${posizione}`;
}

/** Porta una frazione 0–1 alla percentuale più vicina, a passi di 5 e dentro 0–100. */
export function arrotonda(frazione: number): number {
  if (!Number.isFinite(frazione)) return 0;
  const punti = Math.round((frazione * 100) / PASSO) * PASSO;
  return Math.min(100, Math.max(0, punti));
}

/** 0 se non c'è niente di salvato o se il valore salvato non va bene. */
function valido(valore: unknown): number {
  return typeof valore === 'number' && Number.isFinite(valore) ? Math.min(100, Math.max(0, valore)) : 0;
}

export function percentualeGiorno(progresso: Progresso, data: Date, posizione: number): number {
  return valido(progresso.giorni[chiaveGiorno(data, posizione)]);
}

export function percentualeSettimana(progresso: Progresso, lunedi: Date): number {
  return valido(progresso.settimane[aIso(lunedi)]);
}

export function conPercentualeGiorno(
  progresso: Progresso,
  data: Date,
  posizione: number,
  percentuale: number,
): Progresso {
  return { ...progresso, giorni: { ...progresso.giorni, [chiaveGiorno(data, posizione)]: valido(percentuale) } };
}

export function conPercentualeSettimana(progresso: Progresso, lunedi: Date, percentuale: number): Progresso {
  return { ...progresso, settimane: { ...progresso.settimane, [aIso(lunedi)]: valido(percentuale) } };
}

/** Media delle percentuali di un giorno. null se quel giorno non ha obiettivi. */
export function mediaGiorno(progresso: Progresso, data: Date, quanti: number): number | null {
  if (quanti <= 0) return null;
  let somma = 0;
  for (let i = 0; i < quanti; i += 1) somma += percentualeGiorno(progresso, data, i);
  return Math.round(somma / quanti);
}

/** Quanti obiettivi di un giorno sono al 100%. */
export function quantiFatti(progresso: Progresso, data: Date, quanti: number): number {
  let fatti = 0;
  for (let i = 0; i < quanti; i += 1) if (percentualeGiorno(progresso, data, i) === 100) fatti += 1;
  return fatti;
}

function mappaValida(valore: unknown): Record<string, number> {
  if (typeof valore !== 'object' || valore === null) return {};
  const pulita: Record<string, number> = {};
  for (const [chiave, v] of Object.entries(valore as Record<string, unknown>)) {
    if (typeof v === 'number' && Number.isFinite(v)) pulita[chiave] = Math.min(100, Math.max(0, v));
  }
  return pulita;
}

/** Controlla quello che arriva dallo storage: null se non è un progresso. */
export function parseProgresso(valore: unknown): Progresso | null {
  if (typeof valore !== 'object' || valore === null) return null;
  const grezzo = valore as Partial<Progresso>;
  return { giorni: mappaValida(grezzo.giorni), settimane: mappaValida(grezzo.settimane) };
}
