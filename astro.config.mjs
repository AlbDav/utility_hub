// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { AstroPWAIntegration } from '@vite-pwa/astro';

const THEME_COLOR = '#F4EFE6';

export default defineConfig({
  output: 'static',
  // Con la barra finale le URL coincidono con quelle che Netlify serve
  // (/musical/) e con le voci in precache del service worker.
  trailingSlash: 'always',
  integrations: [
    react(),
    AstroPWAIntegration({
      registerType: 'autoUpdate',
      injectRegister: false,
      pwaAssets: { config: true, overrideManifestIcons: true },
      manifest: {
        name: 'Cassetta degli attrezzi',
        short_name: 'Cassetta',
        description: 'Le utility personali di Davide',
        lang: 'it',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        theme_color: THEME_COLOR,
        background_color: THEME_COLOR,
      },
      generateSW: {
        // Solo pagine e asset dell'hub. I CSV dei Fogli Google non vanno in
        // cache qui: la copia salvata la gestisce l'app, che ne conosce l'ora.
        // Dei font solo i sottoinsiemi latini: bastano per l'italiano.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}', '**/*-latin-*.woff2'],
        navigateFallback: '/',
        cleanupOutdatedCaches: true,
      },
      experimental: { directoryAndTrailingSlashHandler: true },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
