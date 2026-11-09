import { nomeGiorno, nomeGiornoCorto } from '../../lib/dates';

export interface GiornoSelettore {
  data: Date;
  /** Media delle percentuali del giorno. null se il giorno non è ancora arrivato. */
  media: number | null;
  oggi: boolean;
}

interface Props {
  giorni: GiornoSelettore[];
  selezionato: number;
  onSeleziona: (indice: number) => void;
}

/** I sette giorni della settimana, con quanto è fatto di ciascuno. */
export function SelettoreGiorni({ giorni, selezionato, onSeleziona }: Props) {
  return (
    <nav aria-label="Giorni della settimana" className="grid grid-cols-7 gap-1.5">
      {giorni.map((giorno, indice) => {
        const scelto = indice === selezionato;
        const media = giorno.media;
        return (
          <button
            key={giorno.data.getTime()}
            type="button"
            aria-pressed={scelto}
            aria-label={`${nomeGiorno(giorno.data)} ${giorno.data.getDate()}${giorno.oggi ? ', oggi' : ''}, ${
              media === null ? 'in programma' : `fatto al ${media}%`
            }`}
            onClick={() => onSeleziona(indice)}
            className={`flex min-h-22 min-w-0 flex-col items-center justify-center gap-[5px] rounded-field border-2 px-0 pt-2 pb-1.5 ${
              scelto
                ? 'border-base-content bg-base-content text-base-200'
                : `ombra bg-base-100 text-base-content ${giorno.oggi ? 'border-primary' : 'border-base-content'}`
            }`}
          >
            <span
              className={`font-mono text-[11px] font-semibold tracking-[0.06em] uppercase ${
                scelto ? 'text-accent' : giorno.oggi ? 'text-error' : 'text-neutral'
              }`}
            >
              {giorno.oggi ? 'Oggi' : nomeGiornoCorto(giorno.data)}
            </span>
            <span className="font-display text-xl leading-none font-extrabold font-stretch-[112%]">
              {giorno.data.getDate()}
            </span>
            <span
              aria-hidden="true"
              className={`block h-1.5 w-[70%] overflow-hidden rounded-full ${scelto ? 'bg-neutral' : 'bg-base-300'}`}
            >
              <span
                className={`block h-full ${
                  media === 100 ? (scelto ? 'bg-bosco-chiaro' : 'bg-success') : 'bg-accent'
                }`}
                style={{ width: `${media ?? 0}%` }}
              />
            </span>
            <span className={`font-mono text-[11px] font-medium ${scelto ? 'text-base-200' : 'text-neutral'}`}>
              {media === null ? '—' : `${media}%`}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
