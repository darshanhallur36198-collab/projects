/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FCM_VAPID_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
