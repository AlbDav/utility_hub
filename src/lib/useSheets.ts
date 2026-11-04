import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchTables, readSnapshot, writeSnapshot, type SheetStatus, type Snapshot, type Tables } from './sheets';

const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

/**
 * Carica le schede di una utility: mostra subito la copia salvata, intanto
 * scarica il foglio e, se ci riesce, aggiorna dati e copia.
 */
export function useSheets<K extends string>(storageKey: string, urls: Record<K, string>) {
  const [tables, setTables] = useState<Tables<K> | null>(null);
  const [status, setStatus] = useState<SheetStatus>({ kind: 'loading' });
  const snapshotRef = useRef<Snapshot<K> | null>(null);
  const urlsRef = useRef(urls);

  const refresh = useCallback(async () => {
    const saved = snapshotRef.current;
    setStatus(saved ? { kind: 'refreshing', fetchedAt: new Date(saved.fetchedAt) } : { kind: 'loading' });
    try {
      const fresh = await fetchTables(urlsRef.current);
      const snapshot: Snapshot<K> = { tables: fresh, fetchedAt: new Date().toISOString() };
      snapshotRef.current = snapshot;
      writeSnapshot(storageKey, snapshot);
      setTables(fresh);
      setStatus({ kind: 'fresh', fetchedAt: new Date(snapshot.fetchedAt) });
    } catch (error) {
      console.warn('Download del foglio non riuscito', error);
      const current = snapshotRef.current;
      setStatus(
        current
          ? { kind: 'stale', fetchedAt: new Date(current.fetchedAt), offline: isOffline() }
          : { kind: 'unavailable', offline: isOffline() },
      );
    }
  }, [storageKey]);

  useEffect(() => {
    const saved = readSnapshot<K>(storageKey);
    if (saved) {
      snapshotRef.current = saved;
      setTables(saved.tables);
    }
    void refresh();
  }, [storageKey, refresh]);

  return { tables, status, refresh };
}
