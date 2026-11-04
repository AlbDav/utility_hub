import { useSyncExternalStore } from 'react';

/**
 * Vista attiva del planner, condivisa tra il selettore nell'intestazione e il
 * planner: sono due isole React diverse, ma usano questo stesso modulo.
 */
export type Vista = 'prova' | 'scene';

let vista: Vista = 'prova';
const ascoltatori = new Set<() => void>();

export function setVista(nuova: Vista): void {
  if (nuova === vista) return;
  vista = nuova;
  ascoltatori.forEach((a) => a());
}

function subscribe(ascoltatore: () => void) {
  ascoltatori.add(ascoltatore);
  return () => ascoltatori.delete(ascoltatore);
}

export function useVista(): Vista {
  return useSyncExternalStore(subscribe, () => vista);
}
