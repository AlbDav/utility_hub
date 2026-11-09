/** Pezzi condivisi fra la card della settimana e quelle del giorno. */
import { Icon } from '../../components/Icon';
import { PASSO } from './progresso';

/** Sfondo pieno fino alla percentuale: ottone mentre si avanza, bosco a finito. */
export function Riempimento({ percentuale }: { percentuale: number }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-y-0 left-0 transition-[width] duration-100 ease-out ${
        percentuale === 100 ? 'bg-success' : 'bg-accent'
      }`}
      style={{ width: `${percentuale}%` }}
    />
  );
}

interface SpuntaProps {
  fatto: boolean;
  /** false sui giorni che non si possono modificare: il quadrato resta spento. */
  attivo: boolean;
  etichetta: string;
  onClick: () => void;
}

/** Il quadrato che porta l'obiettivo da 0 a 100 e viceversa. */
export function PulsanteSpunta({ fatto, attivo, etichetta, onClick }: SpuntaProps) {
  return (
    <button
      type="button"
      className={`flex size-11 flex-none items-center justify-center rounded-field border-2 ${
        fatto ? 'border-base-content bg-base-content text-accent' : 'bg-base-100 text-neutral'
      } ${fatto ? '' : attivo ? 'border-base-content' : 'border-neutral'} ${attivo ? 'cursor-pointer' : 'cursor-default'}`}
      disabled={!attivo}
      aria-pressed={fatto}
      aria-label={etichetta}
      onClick={onClick}
    >
      <Icon name="spunta" size={24} strokeWidth={2.5} />
    </button>
  );
}

interface SliderProps {
  percentuale: number;
  attivo: boolean;
  etichetta: string;
  onPercentuale: (percentuale: number) => void;
}

/**
 * Lo stesso avanzamento del trascinamento, da tastiera e per chi usa uno
 * screen reader: invisibile, ma raggiungibile con il tasto Tab.
 */
export function SliderNascosto({ percentuale, attivo, etichetta, onPercentuale }: SliderProps) {
  return (
    <input
      type="range"
      className="sr-only"
      min={0}
      max={100}
      step={PASSO}
      value={percentuale}
      disabled={!attivo}
      aria-label={etichetta}
      onChange={(evento) => onPercentuale(Number(evento.target.value))}
    />
  );
}
