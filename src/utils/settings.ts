// Global settings for the application

export const DEBUG =
  import.meta.env.VITE_ENABLE_DEBUG_LOGS === "true" ||
  import.meta.env.VITE_APP_ENV !== "production";
