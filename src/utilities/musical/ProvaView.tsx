import { useMemo, useState } from 'react';
import type { MusicalData } from './data';
import { percentualePresenti, sceneDaProvare, type Filtri, type Filtro, type StatScena } from './logic';
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

const OPZIONI_FILTRO: { valore: Filtro; etichetta: string }[] = [
  { valore: 'tutte', etichetta: 'Indifferente' },
  { valore: 'con', etichetta: 'Solo con' },
  { valore: 'senza', etichetta: 'Senza' },
];

export function ProvaView({ data, stato, onStato, onApriScena }: Props) {
  // Si ignorano le spunte di personaggi che non sono più nel foglio.
  const presenti = useMemo(
    () => new Set(stato.presenti.filter((p) => data.personaggi.includes(p))),
    [stato.presenti, data.personaggi],
  );
  const scene = useMemo(() => sceneDaProvare(data, presenti, stato.filtri), [data, presenti, stato.filtri]);
  const filtriAttivi = Object.values(stato.filtri).filter((f) => f !== 'tutte').length;
  // Aperta all'inizio solo se non c'è ancora nessuna spunta.
  const [aperta, setAperta] = useState(presenti.size === 0);

  const togglePresente = (nome: string) => {
    const nuovi = new Set(presenti);
    if (nuovi.has(nome)) nuovi.delete(nome);
    else nuovi.add(nome);
    onStato({ ...stato, presenti: data.personaggi.filter((p) => nuovi.has(p)) });
  };

  return (
    <div className="space-y-4">
      <details
        className="collapse collapse-arrow bg-base-100 shadow-sm"
        open={aperta}
        onToggle={(e) => setAperta(e.currentTarget.open)}
      >
        <summary className="collapse-title flex items-center gap-2 pr-12 font-medium">
          <span className="flex-1">
            Presenti: {presenti.size}/{data.personaggi.length}
            {filtriAttivi > 0 && (
              <span className="badge badge-primary badge-sm ml-2">
                {filtriAttivi === 1 ? '1 filtro' : `${filtriAttivi} filtri`}
              </span>
            )}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            disabled={presenti.size === 0 && filtriAttivi === 0}
            onClick={(e) => {
              e.preventDefault();
              onStato(STATO_INIZIALE);
            }}
          >
            Azzera
          </button>
        </summary>
        <div className="collapse-content space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm opacity-70">Spunta chi c’è alla prossima prova</legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
              {data.personaggi.map((nome) => (
                <label key={nome} className="label cursor-pointer justify-start gap-2 py-1 text-base-content">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={presenti.has(nome)}
                    onChange={() => togglePresente(nome)}
                  />
                  <span>{nome}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            {(Object.keys(ETICHETTE_FILTRO) as (keyof Filtri)[]).map((chiave) => (
              <div key={chiave} className="flex flex-wrap items-center gap-2">
                <span className="w-24 text-sm">{ETICHETTE_FILTRO[chiave]}</span>
                <div className="join" role="radiogroup" aria-label={ETICHETTE_FILTRO[chiave]}>
                  {OPZIONI_FILTRO.map((o) => (
                    <button
                      key={o.valore}
                      type="button"
                      role="radio"
                      aria-checked={stato.filtri[chiave] === o.valore}
                      className={`btn join-item btn-xs ${stato.filtri[chiave] === o.valore ? 'btn-primary' : ''}`}
                      onClick={() => onStato({ ...stato, filtri: { ...stato.filtri, [chiave]: o.valore } })}
                    >
                      {o.etichetta}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </details>

      {scene.length === 0 ? (
        <p className="text-center text-sm opacity-70">Nessuna scena con questi filtri.</p>
      ) : (
        <ul className="space-y-2">
          {scene.map((s) => (
            <li key={s.scena.numero}>
              <RigaScena stat={s} onApri={() => onApriScena(s.scena.numero)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RigaScena({ stat, onApri }: { stat: StatScena; onApri: () => void }) {
  const completa = stat.sostituti === 0 && stat.gente.length > 0;
  return (
    <button
      type="button"
      onClick={onApri}
      className={`card card-sm w-full text-left shadow-sm ${completa ? 'bg-success/15 ring-1 ring-success' : 'bg-base-100'}`}
    >
      <div className="card-body gap-1">
        <div className="flex items-start gap-2">
          <span className="font-semibold tabular-nums">{stat.scena.numero}</span>
          <span className="flex-1 font-medium">{stat.scena.titolo || '—'}</span>
          <span className={`badge badge-sm ${completa ? 'badge-success' : stat.sostituti > 0 ? 'badge-warning' : 'badge-ghost'}`}>
            {completa ? 'al completo' : stat.sostituti === 1 ? '1 sostituto' : `${stat.sostituti} sostituti`}
          </span>
        </div>
        <div className="text-xs opacity-70">
          {stat.gente.length === 0
            ? 'nessuno in scena'
            : `${stat.presenti}/${stat.gente.length} presenti (${percentualePresenti(stat)}%)`}{' '}
          · provata {stat.volteProvata === 1 ? '1 volta' : `${stat.volteProvata} volte`}
        </div>
        {stat.mancanti.length > 0 && <div className="text-xs">Mancano: {stat.mancanti.join(', ')}</div>}
      </div>
    </button>
  );
}
