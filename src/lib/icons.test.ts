import { describe, expect, it } from 'vitest';
import { iconMarkup, icons } from './icons';

describe('icone', () => {
  it('ogni icona ha il suo contenuto SVG', () => {
    for (const name of Object.keys(icons) as (keyof typeof icons)[]) {
      expect(iconMarkup(name)).toMatch(/^<(path|circle|rect|line|polyline|polygon|ellipse) /);
    }
  });

  it('scrive gli attributi tra virgolette', () => {
    expect(iconMarkup('spunta')).toBe('<path d="M20 6 9 17l-5-5"/>');
  });
});
