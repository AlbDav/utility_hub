import { useMemo } from 'react';
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
import { setVista, useVista } from './vista';

export default function Planner() {
  const { tables, status, refresh } = useSheets(storageKey, sheetUrls);
  const data = useMemo(() => (tables ? buildMusicalData(tables) : null), [tables]);
  const [stato, setStato] = usePersistentState(STATO_KEY, STATO_INIZIALE, parseStatoProva);
  const vista = useVista();

  const scheda = useSchedaAperta();
  const presenti = useMemo(() => new Set(stato.presenti), [stato.presenti]);
  const scenaAperta = data?.scene.find((s) => s.numero === scheda.numero);

  return (
    <div className="flex flex-col gap-7">
      {data && vista === 'prova' && <ProvaView data={data} stato={stato} onStato={setStato} onApriScena={scheda.apri} />}
      {data && vista === 'scene' && <PanoramicaView data={data} onApriScena={scheda.apri} />}

      <div className="flex flex-col gap-2">
        <DataStatus status={status} onRefresh={refresh} warnings={data?.avvisi} fixtures={useFixtures} />
        {vista === 'prova' && <p className="px-1 text-sm text-neutral">Le prove si segnano nel foglio.</p>}
      </div>

      {data && scenaAperta && (
        <SchedaScena
          key={scenaAperta.numero}
          data={data}
          scena={scenaAperta}
          presenti={presenti}
          onChiudi={scheda.chiudi}
          onTutteLeScene={() => {
            scheda.chiudi();
            setVista('scene');
          }}
        />
      )}
    </div>
  );
}
