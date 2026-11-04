import { useEffect, useRef } from 'react';
import { formatDate } from '../../lib/sheets';
import type { MusicalData, Scene } from './data';
import { statScena } from './logic';

interface Props {
  data: MusicalData;
  scena: Scene;
  presenti: ReadonlySet<string>;
  onChiudi: () => void;
}

const siNo = (v: boolean) => (v ? 'sì' : 'no');

/** Scheda di una scena, aperta sopra la vista da cui si arriva. */
export function SchedaScena({ data, scena, presenti, onChiudi }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stat = statScena(data, scena, presenti);
  const cast = data.cast[scena.numero] ?? { personaggi: [], gruppi: [] };
  const gruppi = cast.gruppi.map((nome) => data.gruppi.find((g) => g.nome === nome) ?? { nome, membri: [] });

  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby="scheda-titolo"
      // Esc chiude il dialog: lo si fa passare dalla cronologia come il pulsante.
      onCancel={(e) => {
        e.preventDefault();
        onChiudi();
      }}
    >
      <div className="modal-box max-h-[85dvh] space-y-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-start gap-2">
          <h2 id="scheda-titolo" className="flex-1 text-lg font-semibold">
            Scena {scena.numero}
            {scena.titolo && <span className="block font-normal">{scena.titolo}</span>}
          </h2>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onChiudi} aria-label="Chiudi">
            ✕
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="opacity-70">Canzone</dt>
          <dd>{siNo(scena.canzone)}</dd>
          <dt className="opacity-70">Coro</dt>
          <dd>{siNo(scena.coro)}</dd>
          <dt className="opacity-70">Coreografia</dt>
          <dd>{siNo(scena.coreografia)}</dd>
          <dt className="opacity-70">Pagina del copione</dt>
          <dd>{scena.pagina || '—'}</dd>
          <dt className="opacity-70">Volte provata</dt>
          <dd>{stat.volteProvata}</dd>
          <dt className="opacity-70">Ultima prova</dt>
          <dd>{stat.ultimaProva ? formatDate(stat.ultimaProva) : stat.volteProvata > 0 ? 'data non leggibile' : 'mai'}</dd>
        </dl>

        {scena.note && <p className="rounded-box bg-base-200 p-3 text-sm whitespace-pre-line">{scena.note}</p>}

        <section className="space-y-2 text-sm">
          <h3 className="font-medium">In scena ({stat.gente.length})</h3>
          {stat.gente.length === 0 ? (
            <p className="opacity-70">Nessuno segnato in Cast.</p>
          ) : (
            <>
              {cast.personaggi.length > 0 && (
                <p>
                  <span className="opacity-70">Personaggi: </span>
                  {cast.personaggi.join(', ')}
                </p>
              )}
              {gruppi.map((g) => (
                <p key={g.nome}>
                  <span className="opacity-70">{g.nome}: </span>
                  {g.membri.length > 0 ? g.membri.join(', ') : 'nessun personaggio nel gruppo'}
                </p>
              ))}
            </>
          )}
        </section>

        <section className="space-y-1 text-sm">
          <h3 className="font-medium">Con le presenze attuali</h3>
          {stat.gente.length === 0 ? null : stat.mancanti.length === 0 ? (
            <p className="text-success">Ci sono tutti: provabile al completo.</p>
          ) : (
            <p>
              Mancano {stat.mancanti.length}: {stat.mancanti.join(', ')}
            </p>
          )}
        </section>
      </div>
      <button type="button" className="modal-backdrop" onClick={onChiudi} aria-label="Chiudi" />
    </dialog>
  );
}
