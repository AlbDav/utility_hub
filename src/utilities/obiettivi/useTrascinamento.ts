import { useEffect, useRef, type RefObject } from 'react';
import { arrotonda } from './progresso';

/** Spostamento oltre il quale un tocco diventa un gesto (scroll o trascinamento). */
const SOGLIA_PX = 4;

/** Ciò che si tocca da sé: un tocco lì non deve trascinare la card. */
const ESCLUSI = 'button, input, a';

interface Partenza {
  x: number;
  y: number;
  left: number;
  width: number;
}

/**
 * Trascinamento sullo sfondo di un elemento per segnarne una percentuale:
 * il dito a metà larghezza vuol dire 50%.
 *
 * Col dito la pagina scorre in verticale, quindi alla prima mossa si decide
 * che gesto è: più orizzontale che verticale = trascinamento (e da lì lo
 * scroll si blocca), altrimenti si lascia scorrere la pagina. Lo si fa con
 * gli eventi `touch` e non con `touch-action`: con quello è il browser a
 * decidere, e a un gesto un po' storto toglie il controllo a metà.
 *
 * I listener sono nativi perché React registra `touchmove` come passivo, e
 * un listener passivo non può fermare lo scroll. Col mouse basta il puntatore.
 *
 * Restituisce il `ref` da mettere sull'elemento trascinabile.
 */
export function useTrascinamento<T extends HTMLElement>(attivo: boolean, onPercentuale: (percentuale: number) => void): RefObject<T | null> {
  const ref = useRef<T>(null);
  // Sempre l'ultima funzione, senza dover riattaccare i listener a ogni render.
  const ultima = useRef(onPercentuale);
  useEffect(() => {
    ultima.current = onPercentuale;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !attivo) return;

    let partenza: Partenza | null = null;
    let gesto: 'incerto' | 'trascinamento' | 'scroll' = 'incerto';

    const inizia = (x: number, y: number) => {
      const area = el.getBoundingClientRect();
      partenza = { x, y, left: area.left, width: area.width };
      gesto = 'incerto';
    };
    const segna = (x: number) => {
      if (!partenza || partenza.width === 0) return;
      ultima.current(arrotonda((x - partenza.left) / partenza.width));
    };
    const finisce = () => {
      partenza = null;
    };

    const toccoInizia = (e: TouchEvent) => {
      if (e.touches.length !== 1 || (e.target as Element).closest(ESCLUSI)) return;
      inizia(e.touches[0].clientX, e.touches[0].clientY);
    };
    const toccoMuove = (e: TouchEvent) => {
      if (!partenza || e.touches.length !== 1) return;
      const { clientX: x, clientY: y } = e.touches[0];
      if (gesto === 'incerto') {
        const dx = Math.abs(x - partenza.x);
        const dy = Math.abs(y - partenza.y);
        if (Math.max(dx, dy) < SOGLIA_PX) return;
        gesto = dx > dy ? 'trascinamento' : 'scroll';
      }
      if (gesto !== 'trascinamento') return;
      // Ferma lo scroll della pagina per tutto il resto del gesto.
      if (e.cancelable) e.preventDefault();
      segna(x);
    };

    const mouseInizia = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.button !== 0 || (e.target as Element).closest(ESCLUSI)) return;
      inizia(e.clientX, e.clientY);
      // Il puntatore resta all'elemento anche uscendone: il trascinamento non si spezza.
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // Qualche browser non lo permette: si continua senza.
      }
    };
    const mouseMuove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !partenza) return;
      if (gesto === 'incerto') {
        if (Math.abs(e.clientX - partenza.x) < SOGLIA_PX) return;
        gesto = 'trascinamento';
      }
      segna(e.clientX);
    };

    // touchmove non passivo: solo così preventDefault ferma davvero lo scroll.
    el.addEventListener('touchstart', toccoInizia, { passive: true });
    el.addEventListener('touchmove', toccoMuove, { passive: false });
    el.addEventListener('touchend', finisce);
    el.addEventListener('touchcancel', finisce);
    el.addEventListener('pointerdown', mouseInizia);
    el.addEventListener('pointermove', mouseMuove);
    el.addEventListener('pointerup', finisce);
    el.addEventListener('pointercancel', finisce);
    return () => {
      el.removeEventListener('touchstart', toccoInizia);
      el.removeEventListener('touchmove', toccoMuove);
      el.removeEventListener('touchend', finisce);
      el.removeEventListener('touchcancel', finisce);
      el.removeEventListener('pointerdown', mouseInizia);
      el.removeEventListener('pointermove', mouseMuove);
      el.removeEventListener('pointerup', finisce);
      el.removeEventListener('pointercancel', finisce);
    };
  }, [attivo]);

  return ref;
}
