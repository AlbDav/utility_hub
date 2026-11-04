import { useMemo } from 'react';
import { dataPrima } from './config';
import type { MusicalData } from './data';
import { statScena } from './logic';
import { estremiScala, etichettaConto, giorniAllaPrima, legenda, livello } from './panoramica';

interface Props {
  data: MusicalData;
  onApriScena: (numero: number) => void;
}

/** Scala «provata»: quattro tonalità, dalla meno alla più provata. */
const COLORI = [
  'bg-provata-1 border-transparent',
  'bg-provata-2 border-transparent',
  'bg-provata-3 border-transparent',
  'bg-provata-4 border-provata-4 text-base-100',
];

const MAI_PROVATA = 'bg-base-100 text-error border-dashed border-primary';

const nessuno = new Set<string>();

export function PanoramicaView({ data, onApriScena }: Props) {
  const scene = useMemo(() => data.scene.map((s) => statScena(data, s, nessuno)), [data]);
  const scala = estremiScala(scene.map((s) => s.volteProvata));
  const maiProvate = scene.filter((s) => s.volteProvata === 0).length;
  const voci = scala ? legenda(scala.min, scala.max) : [];
  const giorni = dataPrima ? giorniAllaPrima(new Date(), dataPrima) : null;

  return (
    <div className="flex flex-col gap-6">
      <section className="riquadro grid grid-cols-2 overflow-hidden">
        <div className="flex flex-col gap-1.5 bg-primary p-4 text-primary-content">
          <span className="display text-[44px] leading-[0.9]">{giorni === null ? '—' : Math.max(0, giorni)}</span>
          <span className="font-mono text-xs font-medium tracking-[0.08em] uppercase">
            {giorni === null ? 'data della prima da impostare' : etichettaConto(giorni)}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 border-l-2 border-base-content p-4">
          <span className="display text-[44px] leading-[0.9]">{maiProvate}</span>
          <span className="etichetta">{maiProvate === 1 ? 'scena mai provata' : 'scene mai provate'}</span>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[22px] leading-tight font-bold">Le {scene.length} scene</h2>
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8">
          {scene.map((s) => {
            return (
              <li key={s.scena.numero}>
                <button
                  type="button"
                  onClick={() => onApriScena(s.scena.numero)}
                  className={`flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-field border-2 ${
                    s.volteProvata === 0 || !scala ? MAI_PROVATA : COLORI[livello(s.volteProvata, scala.min, scala.max)]
                  }`}
                  aria-label={`Scena ${s.scena.numero}${s.scena.titolo ? `, ${s.scena.titolo}` : ''}: ${
                    s.volteProvata === 0 ? 'mai provata' : `provata ${s.volteProvata} volte`
                  }`}
                >
                  <span className="font-display text-xl leading-none font-extrabold [font-stretch:110%]">
                    {s.scena.numero}
                  </span>
                  <span className="font-mono text-[11px] font-semibold">
                    {s.volteProvata === 0 ? 'mai' : `×${s.volteProvata}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-2.5">
        <span className="etichetta">Volte provata</span>
        <ul className="flex flex-wrap items-center gap-2">
          {maiProvate > 0 && <VoceLegenda classe={MAI_PROVATA} testo="0" />}
          {voci.map((voce, i) => (voce === null ? null : <VoceLegenda key={i} classe={COLORI[i]} testo={voce} />))}
        </ul>
      </section>
    </div>
  );
}

function VoceLegenda({ classe, testo }: { classe: string; testo: string }) {
  return (
    <li
      className={`flex h-8 min-w-10 items-center justify-center rounded-md border-2 px-2 font-mono text-xs font-semibold ${classe}`}
    >
      {testo}
    </li>
  );
}
