/// <reference types="@unplugin-pwa/core/vanillajs" />
/// <reference types="@unplugin-pwa/core/info" />
/// <reference types="@unplugin-pwa/core/pwa-assets" />

interface ImportMetaEnv {
  readonly PUBLIC_MUSICAL_SHEET_ID?: string;
  readonly PUBLIC_MUSICAL_GID_SCENE?: string;
  readonly PUBLIC_MUSICAL_GID_PERSONAGGI?: string;
  readonly PUBLIC_MUSICAL_GID_CAST?: string;
  readonly PUBLIC_MUSICAL_GID_PROVE?: string;
  readonly PUBLIC_MUSICAL_USE_FIXTURES?: string;
  readonly PUBLIC_MUSICAL_DATA_PRIMA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
