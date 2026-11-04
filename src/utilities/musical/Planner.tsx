import { useMemo, useState } from 'react';
import { DataStatus } from '../../components/DataStatus';
import { usePersistentState } from '../../lib/usePersistentState';
import { useSheets } from '../../lib/useSheets';
import { sheetUrls, storageKey, useFixtures } from './config';
import { buildMusicalData } from './data';
import { parseStatoProva, STATO_INIZIALE, STATO_KEY } from './presenze';
import { PanoramicaView } from './PanoramicaView';
import { ProvaView } from './ProvaView';
import { SchedaScena } from './SchedaScena';
import { useSchedaAperta } from './useSchedaAperta';

type Vista = 'prova' | 'panoramica';

export default function Planner() {
  const { tables, status, refresh } = useSheets(storageKey, sheetUrls);
  const data = useMemo(() => (tables ? buildMusicalData(tables) : null), [tables]);
  const [stato, setStato] = usePersistentState(STATO_KEY, STATO_INIZIALE, parseStatoProva);
  const [vista, setVista] = useState<Vista>('prova');

  const scheda = useSchedaAperta();
  const presenti = useMemo(() => new Set(stato.presenti), [stato.presenti]);
  const scenaAperta = data?.scene.find((s) => s.numero === scheda.numero);

  return (
    <div className="space-y-4">
      <DataStatus status={status} onRefresh={refresh} warnings={data?.avvisi} fixtures={useFixtures} />

      <div role="tablist" className="tabs tabs-box">
        {(['prova', 'panoramica'] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={vista === v}
            className={`tab flex-1 ${vista === v ? 'tab-active' : ''}`}
            onClick={() => setVista(v)}
          >
            {v === 'prova' ? 'Prova' : 'Panoramica'}
          </button>
        ))}
      </div>

      {data && vista === 'prova' && <ProvaView data={data} stato={stato} onStato={setStato} onApriScena={scheda.apri} />}
      {data && vista === 'panoramica' && <PanoramicaView data={data} onApriScena={scheda.apri} />}

      {data && scenaAperta && (
        <SchedaScena
          key={scenaAperta.numero}
          data={data}
          scena={scenaAperta}
          presenti={presenti}
          onChiudi={scheda.chiudi}
        />
      )}
    </div>
  );
}
