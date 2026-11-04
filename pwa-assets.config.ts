import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// L'icona ha già il suo fondo rosso: niente margine bianco su maskable e Apple.
const fondo = { background: '#C8361E', fit: 'contain' } as const;

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: { ...minimal2023Preset.maskable, padding: 0.1, resizeOptions: fondo },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: fondo },
  },
  images: ['public/logo.svg'],
});
