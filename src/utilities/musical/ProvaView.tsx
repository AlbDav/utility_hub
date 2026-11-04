import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { BadgeSostituti } from './BadgeSostituti';
import type { MusicalData } from './data';
import { percentualePresenti, sceneDaProvare, sezioniPresenze, type Filtri, type Filtro, type StatScena } from './logic';
import { STATO_INIZIALE, type StatoProva } from './presenze';

interface Props {
  data: MusicalData;
  stato: StatoProva;
  onStato: (stato: StatoProva) => void;
  onApriScena: (numero: number) => void;
}

const ETICHETTE_FILTRO: Record<keyof Filtri, string> = {
  canzone: 'Canzone',
  coro: 'Coro',
  coreografia: 'Coreografia',
};

/** Ogni tocco passa allo stato successivo: indifferente → solo con → senza → indifferente. */
const PROSSIMO: Record<Filtro, Filtro> = { tutte: 'con', con: 'senza', senza: 'tutte' };

const DESCRIZIONE_FILTRO: Record<Filtro, string> = {
  tutte: 'indifferente',
  con: 'solo le scene con',
  senza: 'solo le scene senza',
};

export function ProvaView({ data, stato, onStato, onApriScena }: Props) {
  // Si ignorano le spunte di personaggi che non sono più nel foglio.
  const presenti = useMemo(
    () => new Set(stato.presenti.filter((p) => data.personaggi.includes(p))),
    [stato.presenti, data.personaggi],
  );
  const sezioni = useMemo(() => sezioniPresenze(data), [data]);
  const scene = useMemo(
    () => sceneDaProvare(data, presenti, stato.filtri, stato.contaGruppi),
    [data, presenti, stato.filtri, stato.contaGruppi],
  );
  // Anche «senza gruppi» conta come filtro attivo: cambia i numeri delle scene.
  const filtriAttivi =
    Object.values(stato.filtri).filter((f) => f !== 'tutte').length + (stato.contaGruppi ? 0 : 1);
  // Aperta all'inizio solo se non c'è ancora nessuna spunta.
  const [aperta, setAperta] = useState(presenti.size === 0);

  const togglePresente = (nome: string) => {
    const nuovi = new Set(presenti);
    if (nuovi.has(nome)) nuovi.delete(nome);
    else nuovi.add(nome);
    onStato({ ...stato, presenti: data.personaggi.filter((p) => nuovi.has(p)) });
  };

  return (
    <div className="flex flex-col gap-7">
      <details className="riquadro group" open={aperta} onToggle={(e) => setAperta(e.currentTarget.open)}>
        <summary className="flex cursor-pointer list-none items-center gap-3 p-[18px] [&::-webkit-details-marker]:hidden">
          <span className="flex flex-1 flex-col gap-0.5">
            <h2 className="font-display text-[22px] leading-tight font-bold">Chi c’è</h2>
            <span className="font-mono text-xs font-medium tracking-[0.06em] text-neutral uppercase">
              {presenti.size} presenti su {data.personaggi.length}
              {filtriAttivi > 0 && ` · ${filtriAttivi === 1 ? '1 filtro' : `${filtriAttivi} filtri`}`}
            </span>
          </span>
          <button
            type="button"
            className="ombra min-h-11 rounded-field border-2 border-base-content bg-base-100 px-3.5 text-[15px] font-semibold disabled:opacity-40 disabled:shadow-none"
            disabled={presenti.size === 0 && filtriAttivi === 0}
            onClick={(e) => {
              e.preventDefault();
              onStato(STATO_INIZIALE);
            }}
          >
            Azzera
          </button>
          <Icon name="avanti" strokeWidth={2.5} className="flex-none rotate-90 transition group-open:-rotate-90" />
        </summary>

        <div className="flex flex-col gap-4 px-[18px] pb-[18px]">
          {sezioni.map((sezione) => (
            <fieldset key={sezione.nome} className="flex flex-col gap-2">
              <legend className="etichetta mb-2">{sezione.nome}</legend>
              <div className="flex flex-wrap gap-2">
                {sezione.persone.map((nome) => {
                  const on = presenti.has(nome);
                  return (
                    <button
                      key={nome}
                      type="button"
                      aria-pressed={on}
                      onClick={() => togglePresente(nome)}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 text-[15px] ${
                        on
                          ? 'border-base-content bg-base-content pr-4 pl-3 font-semibold text-base-200'
                          : 'border-base-300 bg-base-100 px-4 font-medium'
                      }`}
                    >
                      {on && <Icon name="spunta" size={16} strokeWidth={3} className="text-accent" />}
                      {nome}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="flex flex-col gap-2 border-t-2 border-base-300 pt-4">
            <span className="etichetta">Filtri</span>
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {(Object.keys(ETICHETTE_FILTRO) as (keyof Filtri)[]).map((chiave) => (
                <CasellaFiltro
                  key={chiave}
                  etichetta={ETICHETTE_FILTRO[chiave]}
                  valore={stato.filtri[chiave]}
                  onCambia={() => onStato({ ...stato, filtri: { ...stato.filtri, [chiave]: PROSSIMO[stato.filtri[chiave]] } })}
                />
              ))}
            </div>
            <p className="text-sm text-neutral">✓ Solo le scene con · ✕ Solo le scene senza · Vuota: indifferente</p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 border-t-2 border-base-300 pt-4">
            <input
              type="checkbox"
              className="toggle toggle-sm mt-0.5 flex-none"
              checked={stato.contaGruppi}
              onChange={(e) => onStato({ ...stato, contaGruppi: e.currentTarget.checked })}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-medium">Conta i gruppi</span>
              <span className="text-sm text-neutral">
                {stato.contaGruppi
                  ? 'In scena ci sono anche i membri dei gruppi segnati in Cast.'
                  : 'In scena contano solo i personaggi segnati da soli in Cast.'}
              </span>
            </span>
          </label>
        </div>
      </details>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-[22px] leading-tight font-bold">Scene da provare</h2>
          <span className="font-mono text-xs text-neutral">In quest’ordine</span>
        </div>
        {scene.length === 0 ? (
          <p className="text-center text-sm text-neutral">Nessuna scena con questi filtri.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {scene.map((s, i) => (
              <li key={s.scena.numero}>
                <RigaScena stat={s} posizione={i + 1} onApri={() => onApriScena(s.scena.numero)} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

/** Casella a tre stati: vuota (indifferente), spunta (solo con), croce (senza). */
function CasellaFiltro({ etichetta, valore, onCambia }: { etichetta: string; valore: Filtro; onCambia: () => void }) {
  return (
    <button
      type="button"
      onClick={onCambia}
      aria-label={`${etichetta}: ${DESCRIZIONE_FILTRO[valore]}`}
      className="inline-flex min-h-11 items-center gap-2.5 text-[15px] font-medium"
    >
      <span
        aria-hidden="true"
        className={`flex size-6 flex-none items-center justify-center rounded-md border-2 ${
          valore === 'con'
            ? 'border-base-content bg-base-content text-accent'
            : valore === 'senza'
              ? 'border-primary bg-primary text-primary-content'
              : 'border-base-content bg-base-100'
        }`}
      >
        {valore === 'con' && <Icon name="spunta" size={16} strokeWidth={3} />}
        {valore === 'senza' && <Icon name="croce" size={14} strokeWidth={3} />}
      </span>
      <span className={valore === 'senza' ? 'line-through decoration-2' : ''}>{etichetta}</span>
    </button>
  );
}

function RigaScena({ stat, posizione, onApri }: { stat: StatScena; posizione: number; onApri: () => void }) {
  return (
    <button type="button" onClick={onApri} className="riquadro grid w-full grid-cols-[36px_1fr] gap-3 p-3.5 text-left">
      <span className="display text-[22px] leading-none">{posizione}</span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="flex items-start justify-between gap-2.5">
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="etichetta">Scena {stat.scena.numero}</span>
            <strong className="text-[17px] leading-snug">{stat.scena.titolo || '—'}</strong>
          </span>
          <BadgeSostituti stat={stat} />
        </span>
        {stat.gente.length > 0 && (
          <span className="text-sm leading-snug text-neutral">
            {stat.mancanti.length === 0 ? 'Ci sono tutti' : `Mancano: ${stat.mancanti.join(', ')}`}
          </span>
        )}
        <span className="font-mono text-xs text-neutral">
          {stat.gente.length > 0 && `${stat.presenti}/${stat.gente.length} presenti (${percentualePresenti(stat)}%) · `}
          {stat.volteProvata === 0
            ? 'Mai provata'
            : `Provata ${stat.volteProvata} ${stat.volteProvata === 1 ? 'volta' : 'volte'}`}
        </span>
      </span>
    </button>
  );
}
