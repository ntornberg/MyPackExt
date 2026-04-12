/// <reference types="chrome" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_GA_MEASUREMENT_ID: string;
  readonly VITE_GA_MP_API_SECRET: string;
}

export {}; // Makes this a module so it doesn't pollute global scope

declare global {
  interface Window {
    receiver_ready?: boolean;
    __myPackHookLoaded?: boolean;
  }
}
