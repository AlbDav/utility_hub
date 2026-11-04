import { describeStatus, type SheetStatus } from '../lib/sheets';

interface Props {
  status: SheetStatus;
  onRefresh: () => void;
  /** Avvisi dei controlli sui dati: non bloccano l'app. */
  warnings?: string[];
  /** Mostra che i dati vengono dalle fixture e non dal foglio vero. */
  fixtures?: boolean;
}

export function DataStatus({ status, onRefresh, warnings = [], fixtures = false }: Props) {
  const busy = status.kind === 'loading' || status.kind === 'refreshing';
  const problem = status.kind === 'stale' || status.kind === 'unavailable';
  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 rounded-box px-3 py-2 text-sm ${problem ? 'bg-warning/20' : 'bg-base-100'}`}>
        {busy && <span className="loading loading-spinner loading-xs" aria-hidden="true" />}
        <span className="flex-1" role="status">
          {describeStatus(status)}
          {fixtures && <span className="badge badge-ghost badge-sm ml-2">dati di prova</span>}
        </span>
        <button type="button" className="btn btn-ghost btn-xs" onClick={onRefresh} disabled={busy}>
          Riscarica
        </button>
      </div>
      {warnings.length > 0 && (
        <details className="rounded-box bg-base-100 px-3 py-2 text-sm">
          <summary className="cursor-pointer opacity-80">
            ⚠️ {warnings.length === 1 ? '1 avviso' : `${warnings.length} avvisi`} sui dati del foglio
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 opacity-80">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
