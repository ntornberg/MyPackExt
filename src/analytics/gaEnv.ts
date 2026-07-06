const GA_PLACEHOLDER_MEASUREMENT_ID = "G-REPLACE_ME";
const GA_PLACEHOLDER_API_SECRET = "GA_SECRET_REPLACE_ME";

export const isGaConfigured = (): boolean => {
  const measurementId = (import.meta.env.VITE_GA_MEASUREMENT_ID || "").trim();
  const apiSecret = (import.meta.env.VITE_GA_MP_API_SECRET || "").trim();

  return (
    import.meta.env.VITE_ENABLE_ANALYTICS === "true" &&
    Boolean(measurementId) &&
    Boolean(apiSecret) &&
    measurementId !== GA_PLACEHOLDER_MEASUREMENT_ID &&
    apiSecret !== GA_PLACEHOLDER_API_SECRET
  );
};
