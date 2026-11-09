import { useMemo, useState } from 'react';
import { DataStatus } from '../../components/DataStatus';
import { Icon } from '../../components/Icon';
import { aIso, giornoDellaSettimana, giornoMese, giorniTra, lunediDi, nomeGiorno } from '../../lib/dates';
import { usePersistentState } from '../../lib/usePersistentState';
import { useSheets } from '../../lib/useSheets';
import { CardObiettivo } from './CardObiettivo';
import { CardSettimana } from './CardSettimana';
import { sheetUrls, storageKey, useFixtures } from './config';
import { buildSettimana } from './data';
import {
  conPercentualeGiorno,
  conPercentualeSettimana,
  mediaGiorno,
  percentualeGiorno,
  percentualeSettimana,
  parseProgresso,
  PROGRESSO_INIZIALE,
  PROGRESSO_KEY,
  quantiFatti,
} from './progresso';
import { SelettoreGiorni } from './SelettoreGiorni';
import { useOggi } from './useOggi';

const maiuscola = (testo: string) => testo.charAt(0).toUpperCase() + testo.slice(1);

/** Riquadro tratteggiato: spiega perché qui non si spunta niente. */
function Avvertenza({ testo, azione }: { testo: string; azione?: { etichetta: string; onClick: () => void } }) {
  return (
    <div className="flex items-center gap-3 rounded-box border-2 border-dashed border-neutral bg-base-100 py-2.5 pr-2.5 pl-3.5 text-neutral">
      <Icon name="bloccato" className="flex-none" />
      <p className="flex-1 text-sm font-medium">{testo}</p>
      {azione && (
        <button
          type="button"
          className="ombra min-h-11 flex-none rounded-field border-2 border-base-content bg-base-100 px-3.5 text-sm font-semibold text-base-content"
          onClick={azione.onClick}
        >
          {azione.etichetta}
        </button>
      )}
    </div>
  );
}

export default function Obiettivi() {
  const { tables, status, refresh } = useSheets(storageKey, sheetUrls);
  const settimana = useMemo(() => (tables ? buildSettimana(tables) : null), [tables]);
  const [progresso, setProgresso] = usePersistentState(PROGRESSO_KEY, PROGRESSO_INIZIALE, parseProgresso);
  const oggi = useOggi();
  // La scelta porta con sé la settimana a cui appartiene: se il foglio cambia
  // settimana, si torna da soli al giorno giusto invece di restare su un indice.
  const [scelta, setScelta] = useState<{ lunedi: string; indice: number } | null>(null);

  // La settimana mostrata è quella scritta nel foglio; senza data, si assume questa.
  const lunedi = settimana?.lunedi ?? lunediDi(oggi);
  const isoLunedi = aIso(lunedi);
  // Dove cade oggi dentro la settimana del foglio: -1 se non ci cade affatto
  // (foglio della settimana scorsa, o già pronto per quella dopo).
  const scarto = giorniTra(lunedi, oggi);
  const indiceOggi = scarto >= 0 && scarto <= 6 ? scarto : -1;
  const corrente = indiceOggi !== -1;

  const giorni = useMemo(
    () =>
      (settimana?.giorni ?? []).map((obiettivi, indice) => {
        const data = giornoDellaSettimana(lunedi, indice);
        const futuro = giorniTra(oggi, data) > 0;
        return {
          data,
          obiettivi,
          futuro,
          oggi: indice === indiceOggi,
          media: futuro ? null : mediaGiorno(progresso, data, obiettivi.length),
        };
      }),
    [settimana, lunedi, oggi, indiceOggi, progresso],
  );

  const selezionato = scelta?.lunedi === isoLunedi ? scelta.indice : Math.max(indiceOggi, 0);
  const giorno = giorni[selezionato];
  const modificabile = giorno ? aIso(giorno.data) === aIso(oggi) : false;

  const medie = giorni.map((g) => g.media).filter((m): m is number => m !== null);
  const media = medie.length > 0 ? Math.round(medie.reduce((a, b) => a + b, 0) / medie.length) : null;

  return (
    <div className="flex flex-col gap-5">
      {settimana && (
        <>
          <CardSettimana
            obiettivo={settimana.obiettivo}
            percentuale={percentualeSettimana(progresso, lunedi)}
            attivo={corrente}
            giorno={corrente ? `Giorno ${indiceOggi + 1} di 7` : null}
            media={media}
            onPercentuale={(percentuale) => setProgresso(conPercentualeSettimana(progresso, lunedi, percentuale))}
          />

          {!corrente && (
            <Avvertenza
              testo={`Il foglio è della settimana del ${giornoMese(lunedi)}: qui si guarda e basta. Riscrivi la griglia per questa settimana.`}
            />
          )}

          <SelettoreGiorni
            giorni={giorni}
            selezionato={selezionato}
            onSeleziona={(indice) => setScelta({ lunedi: isoLunedi, indice })}
          />

          {giorno && (
            <section aria-labelledby="titolo-giorno" className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 id="titolo-giorno" className="font-display text-[22px] leading-tight font-bold">
                  {giorno.oggi
                    ? `Oggi, ${nomeGiorno(giorno.data)} ${giorno.data.getDate()}`
                    : `${maiuscola(nomeGiorno(giorno.data))} ${giorno.data.getDate()}`}
                </h2>
                <span className="etichetta whitespace-nowrap">
                  {giorno.obiettivi.length === 0
                    ? 'Niente'
                    : giorno.futuro
                      ? 'In programma'
                      : `${quantiFatti(progresso, giorno.data, giorno.obiettivi.length)} su ${giorno.obiettivi.length} fatti`}
                </span>
              </div>

              {corrente && !modificabile && (
                <Avvertenza
                  testo={
                    giorno.futuro
                      ? 'Si potrà spuntare solo quel giorno.'
                      : 'Giorno passato: si guarda, non si modifica.'
                  }
                  azione={{ etichetta: 'Vai a oggi', onClick: () => setScelta({ lunedi: isoLunedi, indice: indiceOggi }) }}
                />
              )}

              {giorno.obiettivi.length === 0 ? (
                <p className="rounded-box border-2 border-dashed border-base-300 px-4 py-6 text-center text-[15px] text-neutral">
                  Per questo giorno nel foglio non c’è scritto niente.
                </p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {giorno.obiettivi.map((testo, posizione) => (
                    <CardObiettivo
                      key={`${aIso(giorno.data)}#${posizione}`}
                      testo={testo}
                      posizione={posizione}
                      percentuale={percentualeGiorno(progresso, giorno.data, posizione)}
                      attivo={modificabile}
                      futuro={giorno.futuro}
                      onPercentuale={(percentuale) =>
                        setProgresso(conPercentualeGiorno(progresso, giorno.data, posizione, percentuale))
                      }
                    />
                  ))}
                </ol>
              )}

              {modificabile && giorno.obiettivi.length > 0 && (
                <p className="flex items-center gap-2 text-sm font-medium text-neutral">
                  <Icon name="trascina" className="flex-none" />
                  Trascina sulla card per segnare una parte; il quadrato la completa.
                </p>
              )}
            </section>
          )}
        </>
      )}

      <div className="flex flex-col gap-2 border-t-2 border-base-300 pt-4">
        <DataStatus status={status} onRefresh={refresh} warnings={settimana?.avvisi} fixtures={useFixtures} />
        <p className="flex items-center gap-2 px-1 text-sm text-neutral">
          <Icon name="telefono" size={16} className="flex-none" />
          Le spunte restano su questo telefono: nel foglio non tornano.
        </p>
      </div>
    </div>
  );
}
