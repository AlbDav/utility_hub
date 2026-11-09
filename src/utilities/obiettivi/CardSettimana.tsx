import { PulsanteSpunta, Riempimento, SliderNascosto } from './pezzi';
import { useTrascinamento } from './useTrascinamento';

interface Props {
  /** Stringa vuota se nel foglio la cella è vuota. */
  obiettivo: string;
  percentuale: number;
  attivo: boolean;
  /** «Giorno 3 di 7», oppure null se la settimana nel foglio non è questa. */
  giorno: string | null;
  /** Media dei giorni fin qui, null se non c'è ancora niente da mediare. */
  media: number | null;
  onPercentuale: (percentuale: number) => void;
}

/**
 * L'obiettivo della settimana: testata rossa e testo grande, perché sta sopra
 * a tutto il resto e non deve passare inosservato fra i giornalieri.
 */
export function CardSettimana({ obiettivo, percentuale, attivo, giorno, media, onPercentuale }: Props) {
  const trascinamento = useTrascinamento(attivo && obiettivo !== '', onPercentuale);
  const fatto = percentuale === 100;

  return (
    <section
      aria-labelledby="obiettivo-settimana"
      className="overflow-hidden rounded-box border-2 border-base-content bg-base-100 shadow-[3px_3px_0_var(--color-base-content)]"
    >
      <div className="flex items-center justify-between gap-3 bg-primary px-4 py-2 font-mono text-xs font-semibold tracking-[0.08em] text-primary-content uppercase">
        <span id="obiettivo-settimana">Obiettivo della settimana</span>
        {obiettivo !== '' && <span>{fatto ? 'Fatto · 100%' : `${percentuale}%`}</span>}
      </div>

      {obiettivo === '' ? (
        <p className="px-4 py-6 text-center text-[15px] text-neutral">
          Nel foglio l’obiettivo di questa settimana non c’è ancora.
        </p>
      ) : (
        <div className={`relative touch-pan-y select-none ${attivo ? 'cursor-ew-resize' : ''}`} {...trascinamento}>
          <Riempimento percentuale={percentuale} />
          <div className="relative flex items-center gap-4 py-[22px] pr-4 pl-5">
            <p
              className={`flex-1 font-display text-[26px] leading-[1.08] font-extrabold font-stretch-[108%] ${
                fatto ? 'text-base-100' : 'text-base-content'
              }`}
            >
              {obiettivo}
            </p>
            <PulsanteSpunta
              fatto={fatto}
              attivo={attivo}
              etichetta="Segna completato l’obiettivo della settimana"
              onClick={() => onPercentuale(fatto ? 0 : 100)}
            />
          </div>
          <SliderNascosto
            percentuale={percentuale}
            attivo={attivo}
            etichetta="Avanzamento dell’obiettivo della settimana"
            onPercentuale={onPercentuale}
          />
        </div>
      )}

      {(giorno || media !== null) && (
        <div className="etichetta flex justify-between gap-3 border-t-2 border-base-content bg-base-200 px-4 py-2">
          <span>{giorno ?? ''}</span>
          {media !== null && <span>Media giorni {media}%</span>}
        </div>
      )}
    </section>
  );
}
