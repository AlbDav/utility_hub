import { PulsanteSpunta, Riempimento, SliderNascosto } from './pezzi';
import { useTrascinamento } from './useTrascinamento';

/**
 * Gli obiettivi del giorno sono in ordine di importanza e si vedono: il primo
 * è una card alta col titolo grande, gli altri scalano. Dal quarto in giù
 * (se mai ce ne fossero) vale la misura del terzo.
 */
const RILIEVO = [
  { card: 'min-h-30', riga: 'py-[22px]', numero: 'text-[44px]', testo: 'font-display text-[22px] leading-[1.15] font-bold' },
  { card: 'min-h-24', riga: 'py-4', numero: 'text-[32px]', testo: 'text-[18px] leading-[1.3] font-semibold' },
  { card: 'min-h-19', riga: 'py-2.5', numero: 'text-[22px]', testo: 'text-[15px] leading-[1.35] font-medium' },
];

interface Props {
  testo: string;
  /** 0 è il più importante. */
  posizione: number;
  percentuale: number;
  /** false nei giorni che non si possono modificare: si guarda e basta. */
  attivo: boolean;
  /** Giorno non ancora arrivato: niente percentuale, solo «In programma». */
  futuro: boolean;
  onPercentuale: (percentuale: number) => void;
}

export function CardObiettivo({ testo, posizione, percentuale, attivo, futuro, onPercentuale }: Props) {
  const trascinamento = useTrascinamento(attivo, onPercentuale);
  const rilievo = RILIEVO[Math.min(posizione, RILIEVO.length - 1)];
  const fatto = percentuale === 100;
  const inchiostro = fatto ? 'text-base-100' : 'text-base-content';

  return (
    <li
      className={`relative flex touch-pan-y flex-col justify-center overflow-hidden rounded-box border-2 bg-base-100 select-none ${
        rilievo.card
      } ${
        attivo
          ? 'cursor-ew-resize border-base-content shadow-[3px_3px_0_var(--color-base-content)]'
          : 'border-neutral'
      }`}
      {...trascinamento}
    >
      <Riempimento percentuale={percentuale} />
      <div className={`relative flex items-center gap-3.5 pr-3.5 pl-4 ${rilievo.riga}`}>
        <span aria-hidden="true" className={`display w-[34px] flex-none text-center leading-[0.9] ${rilievo.numero} ${inchiostro}`}>
          {posizione + 1}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className={`${rilievo.testo} ${inchiostro}`}>{testo}</p>
          <span className={`font-mono text-xs font-semibold tracking-[0.08em] uppercase ${inchiostro}`}>
            {futuro ? 'In programma' : fatto ? 'Fatto' : `${percentuale}%`}
          </span>
        </div>
        <PulsanteSpunta
          fatto={fatto}
          attivo={attivo}
          etichetta={`Segna completato: ${testo}`}
          onClick={() => onPercentuale(fatto ? 0 : 100)}
        />
      </div>
      <SliderNascosto
        percentuale={percentuale}
        attivo={attivo}
        etichetta={`Avanzamento obiettivo ${posizione + 1}: ${testo}`}
        onPercentuale={onPercentuale}
      />
    </li>
  );
}
