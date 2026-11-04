import { describeStatus, type SheetStatus } from '../lib/sheets';
import { Icon } from './Icon';

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
      <div
        className={`flex items-center gap-2.5 rounded-field bg-base-200 py-1 pr-1 pl-3 text-sm ${
          problem ? 'border-2 border-dashed border-neutral' : 'border-2 border-base-300 text-neutral'
        }`}
      >
        {busy ? (
          <span className="loading loading-spinner loading-xs flex-none" aria-hidden="true" />
        ) : problem ? (
          <Icon name="offline" size={18} className="flex-none" />
        ) : (
          <span className="size-2 flex-none rounded-full bg-success" aria-hidden="true" />
        )}
        <span className="flex-1" role="status">
          {describeStatus(status)}
          {fixtures && <span className="ml-1.5 font-mono text-xs">· dati di prova</span>}
        </span>
        <button
          type="button"
          className="flex size-11 flex-none items-center justify-center rounded-field disabled:opacity-40"
          onClick={onRefresh}
          disabled={busy}
          aria-label="Riscarica i dati dal foglio"
        >
          <Icon name="aggiorna" size={18} />
        </button>
      </div>
      {warnings.length > 0 && (
        <details className="rounded-field border-2 border-accent bg-base-100 px-3 py-2 text-sm">
          <summary className="flex min-h-8 cursor-pointer items-center gap-2 font-medium">
            <Icon name="avviso" size={18} className="flex-none" />
            {warnings.length === 1 ? '1 avviso' : `${warnings.length} avvisi`} sui dati del foglio
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
