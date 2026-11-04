/**
 * Icone dell'hub, da Lucide (https://lucide.dev): griglia 24, tratto 2 px,
 * estremità arrotondate. Qui i nomi italiani usati nel codice; Icon.tsx e
 * Icon.astro le disegnano.
 */
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Music,
  PersonStanding,
  RefreshCw,
  Theater,
  TriangleAlert,
  Users,
  WifiOff,
  X,
  type IconNode,
} from 'lucide';

export const icons = {
  indietro: ChevronLeft,
  avanti: ChevronRight,
  canzone: Music,
  coreografia: PersonStanding,
  pagina: FileText,
  prova: CalendarCheck,
  gruppo: Users,
  sipario: Theater,
  aggiorna: RefreshCw,
  offline: WifiOff,
  spunta: Check,
  avviso: TriangleAlert,
  croce: X,
} satisfies Record<string, IconNode>;

export type IconName = keyof typeof icons;

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Il contenuto dell'<svg viewBox="0 0 24 24"> di un'icona. */
export function iconMarkup(name: IconName): string {
  return icons[name]
    .map(([tag, attrs]) => {
      const attributi = Object.entries(attrs)
        .map(([k, v]) => `${k}="${escape(String(v))}"`)
        .join(' ');
      return `<${tag} ${attributi}/>`;
    })
    .join('');
}
