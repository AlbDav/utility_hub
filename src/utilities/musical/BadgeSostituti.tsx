import type { StatScena } from './logic';

/** Badge dei sostituti: 0 verde, 1–2 ottone, 3 o più rosso. Il numero c'è sempre. */
export function BadgeSostituti({ stat }: { stat: StatScena }) {
  if (stat.gente.length === 0) {
    return <span className={`${BASE} border-2 border-base-300 text-neutral`}>Nessuno in scena</span>;
  }
  const colore =
    stat.sostituti === 0
      ? 'bg-success text-success-content'
      : stat.sostituti <= 2
        ? 'bg-accent text-accent-content'
        : 'bg-primary text-primary-content';
  return (
    <span className={`${BASE} ${colore}`}>{stat.sostituti === 1 ? '1 sostituto' : `${stat.sostituti} sostituti`}</span>
  );
}

const BASE = 'inline-flex min-h-7 flex-none items-center rounded-md px-2.5 font-mono text-[13px] font-semibold whitespace-nowrap';
