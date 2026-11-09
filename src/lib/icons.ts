/**
 * Icone dell'hub, da Lucide (https://lucide.dev): griglia 24, tratto 2 px,
 * estremità arrotondate. Qui i nomi italiani usati nel codice; Icon.tsx e
 * Icon.astro le disegnano.
 */
import {
  BookOpenText,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  MicVocal,
  MoveHorizontal,
  PersonStanding,
  RefreshCw,
  SixteenthNotes,
  Smartphone,
  Spotlight,
  Target,
  TriangleExclamationPoint,
  Users,
  WifiOff,
  X,
  type IconNode,
} from 'lucide';

export const icons = {
  indietro: ChevronLeft,
  avanti: ChevronRight,
  canzone: SixteenthNotes,
  coreografia: PersonStanding,
  pagina: BookOpenText,
  prova: CalendarCheck,
  gruppo: Users,
  coro: MicVocal,
  riflettore: Spotlight,
  obiettivo: Target,
  telefono: Smartphone,
  bloccato: Lock,
  trascina: MoveHorizontal,
  aggiorna: RefreshCw,
  offline: WifiOff,
  spunta: Check,
  avviso: TriangleExclamationPoint,
  croce: X,
} satisfies Record<string, IconNode>;

export type IconName = keyof typeof icons;

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Il contenuto dell'<svg viewBox="0 0 24 24"> di un'icona Lucide. */
export function nodeMarkup(node: IconNode): string {
  return node
    .map(([tag, attrs]) => {
      const attributi = Object.entries(attrs)
        .map(([k, v]) => `${k}="${escape(String(v))}"`)
        .join(' ');
      return `<${tag} ${attributi}/>`;
    })
    .join('');
}

/** Il contenuto dell'<svg viewBox="0 0 24 24"> di un'icona dell'hub. */
export function iconMarkup(name: IconName): string {
  return nodeMarkup(icons[name]);
}
