import { iconMarkup, type IconName } from '../lib/icons';

interface Props {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/** Icona decorativa: il significato va sempre anche nel testo accanto. */
export function Icon({ name, size = 20, strokeWidth = 2, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: iconMarkup(name) }}
    />
  );
}
