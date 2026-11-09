import { intervalloSettimana, lunediDi, numeroSettimana } from '../../lib/dates';
import { useOggi } from './useOggi';

/**
 * «Settimana 46 · 9–15 nov»: la settimana di oggi, non quella del foglio.
 * Sta nell'intestazione della pagina, che è statica e resta in cache: per
 * questo il calcolo va fatto nel browser.
 */
export default function IntestazioneSettimana() {
  const oggi = useOggi();
  return (
    <p className="etichetta">
      Settimana {numeroSettimana(oggi)} · {intervalloSettimana(lunediDi(oggi))}
    </p>
  );
}
