import { useEffect, useState } from 'react';
import { loadJson, saveJson } from './storage';

/**
 * Stato React salvato sul telefono. `parse` controlla quello che arriva dallo
 * storage e restituisce null se non è valido, così si riparte dal valore iniziale.
 * Da usare in isole `client:only`, dove lo storage è disponibile al primo render.
 */
export function usePersistentState<T>(key: string, initial: T, parse: (value: unknown) => T | null) {
  const [value, setValue] = useState<T>(() => parse(loadJson(key)) ?? initial);
  useEffect(() => saveJson(key, value), [key, value]);
  return [value, setValue] as const;
}
