import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { arrotonda } from './progresso';

/** Spostamento oltre il quale il tocco diventa un trascinamento. */
const SOGLIA_PX = 8;

/**
 * Trascinamento sullo sfondo di un elemento per segnarne una percentuale:
 * il dito a metà larghezza vuol dire 50%.
 *
 * Finché non ci si muove di almeno 8 px non cambia niente, così sfiorare la
 * card mentre si scorre la pagina non la riempie per sbaglio. Il movimento
 * verticale resta alla pagina (`touch-action: pan-y` sull'elemento).
 */
export function useTrascinamento(attivo: boolean, onPercentuale: (percentuale: number) => void) {
  const trascinamento = useRef<{ x0: number; left: number; width: number; mosso: boolean } | null>(null);

  const onPointerDown = (evento: ReactPointerEvent<HTMLElement>) => {
    if (!attivo) return;
    const area = evento.currentTarget.getBoundingClientRect();
    trascinamento.current = { x0: evento.clientX, left: area.left, width: area.width, mosso: false };
    // Il puntatore resta all'elemento anche uscendone: il trascinamento non si spezza.
    try {
      evento.currentTarget.setPointerCapture(evento.pointerId);
    } catch {
      // Qualche browser non lo permette: si continua senza.
    }
  };

  const onPointerMove = (evento: ReactPointerEvent<HTMLElement>) => {
    const corrente = trascinamento.current;
    if (!corrente || corrente.width === 0) return;
    if (!corrente.mosso && Math.abs(evento.clientX - corrente.x0) < SOGLIA_PX) return;
    corrente.mosso = true;
    onPercentuale(arrotonda((evento.clientX - corrente.left) / corrente.width));
  };

  const fine = () => {
    trascinamento.current = null;
  };

  return { onPointerDown, onPointerMove, onPointerUp: fine, onPointerCancel: fine };
}

/** Da mettere su ciò che sta sopra l'area trascinabile e si tocca da sé. */
export function fermaTrascinamento(evento: ReactPointerEvent<HTMLElement>) {
  evento.stopPropagation();
}
