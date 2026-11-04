import { useCallback, useEffect, useRef, useState } from 'react';
import { hashScena, parseHashScena } from './logic';

/**
 * La scheda aperta è nell'URL (#scena-12): aprirla aggiunge un passo alla
 * cronologia, così il tasto Indietro la chiude e si torna dov'eri.
 */
export function useSchedaAperta() {
  const [numero, setNumero] = useState<number | null>(() => parseHashScena(window.location.hash));
  // true se la scheda l'ha aperta l'app: allora chiuderla vuol dire tornare indietro.
  const apertaDaQui = useRef(false);

  useEffect(() => {
    const onHashChange = () => {
      const n = parseHashScena(window.location.hash);
      if (n === null) apertaDaQui.current = false;
      setNumero(n);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const apri = useCallback((n: number) => {
    apertaDaQui.current = true;
    window.location.hash = hashScena(n);
  }, []);

  const chiudi = useCallback(() => {
    if (apertaDaQui.current) {
      apertaDaQui.current = false;
      window.history.back();
    } else {
      // Arrivati direttamente su #scena-N: si toglie l'hash senza uscire dalla pagina.
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setNumero(null);
    }
  }, []);

  return { numero, apri, chiudi };
}
