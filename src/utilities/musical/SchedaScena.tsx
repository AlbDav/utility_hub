import { useEffect, useRef } from 'react';
import { Icon } from '../../components/Icon';
import type { IconName } from '../../lib/icons';
import { giornoMese } from '../../lib/dates';
import { BadgeSostituti } from './BadgeSostituti';
import type { MusicalData, Scene } from './data';
import { statScena } from './logic';

interface Props {
  data: MusicalData;
  scena: Scene;
  presenti: ReadonlySet<string>;
  onChiudi: () => void;
  onTutteLeScene: () => void;
}

const CARATTERISTICHE: { chiave: 'canzone' | 'coreografia' | 'coro'; nome: string; icona: IconName }[] = [
  { chiave: 'canzone', nome: 'Canzone', icona: 'canzone' },
  { chiave: 'coreografia', nome: 'Coreografia', icona: 'coreografia' },
  { chiave: 'coro', nome: 'Coro', icona: 'coro' },
];

/** Scheda di una scena, aperta sopra la vista da cui si arriva: a tutto schermo sul telefono. */
export function SchedaScena({ data, scena, presenti, onChiudi, onTutteLeScene }: Props) {
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
      className="modal"
      aria-labelledby="scheda-titolo"
      // Esc chiude il dialog: lo si fa passare dalla cronologia come il pulsante.
      onCancel={(e) => {
        e.preventDefault();
        onChiudi();
      }}
    >
      <div className="modal-box flex h-dvh max-h-none w-full max-w-none flex-col overflow-y-auto rounded-none bg-base-200 p-0 sm:h-auto sm:max-h-[90dvh] sm:max-w-lg sm:rounded-box sm:border-2 sm:border-base-content">
        <header className="flex flex-col gap-[18px] bg-base-content px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-6 text-base-200">
          <button
            type="button"
            onClick={onChiudi}
            className="inline-flex min-h-11 items-center gap-1.5 self-start font-mono text-[13px] font-medium tracking-[0.06em] uppercase"
          >
            <Icon name="indietro" strokeWidth={2.5} />
            Indietro
          </button>
          <div className="flex items-end gap-4">
            <span className="display text-[88px] leading-[0.8] font-black text-accent">{scena.numero}</span>
            <div className="flex flex-col gap-1.5 pb-1">
              <span className="font-mono text-xs font-medium tracking-[0.08em] text-base-300 uppercase">Scena</span>
              <h2 id="scheda-titolo" className="font-display text-[26px] leading-tight font-bold">
                {scena.titolo || `Scena ${scena.numero}`}
              </h2>
            </div>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="Caratteristiche">
            {CARATTERISTICHE.map(({ chiave, nome, icona }) =>
              scena[chiave] ? (
                <li key={chiave} className={`${CHIP} bg-base-200 text-base-content`}>
                  <Icon name={icona} size={16} />
                  {nome}
                </li>
              ) : (
                // Assente: stessa etichetta, barrata; il «no» lo legge chi usa la lettura dello schermo.
                <li key={chiave} className={`${CHIP} border-2 border-neutral text-base-300`}>
                  <Icon name={icona} size={16} />
                  <span className="line-through decoration-2">{nome}</span>
                  <span className="sr-only">: no</span>
                </li>
              ),
            )}
            {scena.pagina && (
              <li className={`${CHIP} border-2 border-neutral`}>
                <Icon name="pagina" size={16} />
                Pag. {scena.pagina}
              </li>
            )}
          </ul>
        </header>

        <div className="flex flex-col gap-5 p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <section className="riquadro grid grid-cols-2 overflow-hidden">
            <div className="flex flex-col gap-1.5 p-4">
              <span className="display text-4xl leading-[0.9]">{stat.volteProvata}</span>
              <span className="etichetta">{stat.volteProvata === 1 ? 'Volta provata' : 'Volte provata'}</span>
            </div>
            <div className="flex flex-col gap-1.5 border-l-2 border-base-content p-4">
              <span className="font-display text-[26px] leading-tight font-extrabold">
                {stat.ultimaProva ? giornoMese(stat.ultimaProva) : stat.volteProvata > 0 ? '—' : 'Mai'}
              </span>
              <span className="etichetta">
                {stat.ultimaProva || stat.volteProvata === 0 ? 'Ultima prova' : 'Data non leggibile'}
              </span>
            </div>
          </section>

          <section className="riquadro flex flex-col gap-3 p-[18px]">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-xl font-bold">In scena</h3>
              <span className="font-mono text-xs text-neutral">
                {stat.gente.length === 1 ? '1 persona' : `${stat.gente.length} persone`}
              </span>
            </div>
            {stat.gente.length === 0 && <p className="text-neutral">Nessuno segnato in Cast.</p>}
            {cast.personaggi.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="etichetta">Personaggi</span>
                <ul className="flex flex-wrap gap-1.5">
                  {cast.personaggi.map((p) => (
                    <li key={p} className="rounded-full border-2 border-base-300 px-3 py-1.5 text-[15px]">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {gruppi.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="etichetta">Gruppi</span>
                <ul className="flex flex-col gap-2">
                  {gruppi.map((g) => (
                    <li key={g.nome} className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-base-content px-3 py-1.5 text-[15px] font-semibold text-base-200">
                        <Icon name="gruppo" size={16} className="text-accent" />
                        {g.nome} · {g.membri.length}
                      </span>
                      <span className="pl-1 text-sm text-neutral">
                        {g.membri.length > 0 ? g.membri.join(', ') : 'Nessun personaggio nel gruppo'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {stat.gente.length > 0 && (
            <section className="riquadro flex flex-col gap-2 p-[18px]">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-xl font-bold">Con chi c’è</h3>
                <BadgeSostituti stat={stat} />
              </div>
              <p className="text-base leading-normal">
                {stat.mancanti.length === 0
                  ? 'Ci sono tutti: si può provare al completo.'
                  : `Mancano: ${stat.mancanti.join(', ')}`}
              </p>
            </section>
          )}

          {scena.note && (
            <section className="riquadro flex flex-col gap-2 p-[18px]">
              <h3 className="font-display text-xl font-bold">Note</h3>
              <p className="text-base leading-normal whitespace-pre-line">{scena.note}</p>
            </section>
          )}

          <button
            type="button"
            onClick={onTutteLeScene}
            className="ombra min-h-12 rounded-field border-2 border-base-content bg-base-100 font-semibold"
          >
            Tutte le scene
          </button>
        </div>
      </div>
      <button type="button" className="modal-backdrop" onClick={onChiudi} aria-label="Chiudi" />
    </dialog>
  );
}

const CHIP = 'inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold';
