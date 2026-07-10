import { AppLogger } from "../utils/logger";

import { isGaConfigured } from "./gaEnv";

type GAPayload = {
  client_id: string;
  events: Array<{
    name: string;
    params: Record<string, string | boolean>;
  }>;
};

const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const GA_DEBUG_ENDPOINT = "https://www.google-analytics.com/debug/mp/collect";
const measurementId = (import.meta.env.VITE_GA_MEASUREMENT_ID || "").trim();
const apiSecret = (import.meta.env.VITE_GA_MP_API_SECRET || "").trim();
const isEnabled = isGaConfigured();
const isDevelopmentMode = import.meta.env.VITE_APP_ENV === "development";
const isDebugMode =
  import.meta.env.VITE_ENABLE_DEBUG_LOGS === "true" ||
  import.meta.env.VITE_APP_ENV !== "production";

function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

async function send(payload: GAPayload): Promise<void> {
  const query = new URLSearchParams({
    measurement_id: measurementId,
    api_secret: apiSecret,
  }).toString();

  const endpoint = isDevelopmentMode ? GA_DEBUG_ENDPOINT : GA_ENDPOINT;

  const response = await fetch(`${endpoint}?${query}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    if (isDebugMode) {
      AppLogger.error("[Analytics] GA request failed", {
        status: response.status,
        body: text.slice(0, 400),
      });
    }
    throw new Error(`GA request failed with status ${response.status}`);
  }
}

export async function trackExtensionInstalled(): Promise<void> {
  if (!isEnabled) {
    return;
  }

  try {
    await send({
      // This ID is generated only for the install request and is never stored.
      client_id: createId(),
      events: [
        {
          name: "extension_installed",
          params: {},
        },
      ],
    });
  } catch (error) {
    if (isDebugMode) {
      AppLogger.error("[Analytics] Failed to track extension install:", error);
    }
  }
}
