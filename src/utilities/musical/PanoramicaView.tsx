import { useMemo } from 'react';
import type { MusicalData } from './data';
import { statScena } from './logic';
import { estremiScala, giorniAllaPrima, legenda, livello, testoConto } from './panoramica';

interface Props {
  data: MusicalData;
  onApriScena: (numero: number) => void;
}

/** Quattro tonalità, dalla meno provata alla più provata. */
const COLORI = [
  'bg-primary/10 text-base-content',
  'bg-primary/30 text-base-content',
  'bg-primary/60 text-primary-content',
  'bg-primary text-primary-content',
];

const MAI_PROVATA = 'bg-error/10 text-error border-2 border-dashed border-error';

const nessuno = new Set<string>();

export function PanoramicaView({ data, onApriScena }: Props) {
  const scene = useMemo(() => data.scene.map((s) => statScena(data, s, nessuno)), [data]);
  const scala = estremiScala(scene.map((s) => s.volteProvata));
  const maiProvate = scene.filter((s) => s.volteProvata === 0).length;
  const voci = scala ? legenda(scala.min, scala.max) : [];

  return (
    <div className="space-y-4">
      <p className="rounded-box bg-base-100 px-3 py-2 text-center font-medium shadow-sm">
        {testoConto(giorniAllaPrima(new Date()))}
        <span className="block text-xs font-normal opacity-70">8 maggio 2027</span>
      </p>

      <ul className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
        {scene.map((s) => {
          const mai = s.volteProvata === 0;
          return (
            <li key={s.scena.numero}>
              <button
                type="button"
                onClick={() => onApriScena(s.scena.numero)}
                className={`flex aspect-square w-full flex-col items-center justify-center rounded-field leading-tight ${
                  mai || !scala ? MAI_PROVATA : COLORI[livello(s.volteProvata, scala.min, scala.max)]
                }`}
                aria-label={`Scena ${s.scena.numero}${s.scena.titolo ? `, ${s.scena.titolo}` : ''}: ${
                  mai ? 'mai provata' : `provata ${s.volteProvata} volte`
                }`}
              >
                <span className="text-base font-semibold tabular-nums">{s.scena.numero}</span>
                <span className="text-[0.65rem] opacity-80">{mai ? 'mai' : `×${s.volteProvata}`}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="space-y-2 rounded-box bg-base-100 p-3 text-xs shadow-sm">
        <p className="font-medium">Volte provata</p>
        <ul className="flex flex-wrap gap-x-3 gap-y-2">
          {maiProvate > 0 && (
            <li className="flex items-center gap-1.5">
              <span className={`inline-block size-4 rounded-sm ${MAI_PROVATA}`} aria-hidden="true" />
              mai ({maiProvate})
            </li>
          )}
          {voci.map((voce, i) =>
            voce === null ? null : (
              <li key={i} className="flex items-center gap-1.5">
                <span className={`inline-block size-4 rounded-sm ${COLORI[i]}`} aria-hidden="true" />
                {voce}
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}
