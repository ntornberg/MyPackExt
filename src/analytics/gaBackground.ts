import { AppLogger } from "../utils/logger";

import { isGaConfigured } from "./gaEnv";

type EventParamValue = string | number | boolean;
type EventParams = Record<string, EventParamValue>;

type GAPayload = {
  client_id: string;
  events: Array<{
    name: string;
    params: EventParams;
  }>;
};

type AnalyticsEventMessage = {
  type: "analytics_event";
  name: string;
  params?: EventParams;
};

type AnalyticsInitMessage = {
  type: "analytics_initialize";
};

type AnalyticsOptOutMessage = {
  type: "analytics_set_opt_out";
  optOut: boolean;
};

export type AnalyticsMessage =
  | AnalyticsEventMessage
  | AnalyticsInitMessage
  | AnalyticsOptOutMessage;

const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const GA_DEBUG_ENDPOINT = "https://www.google-analytics.com/debug/mp/collect";
const CLIENT_ID_KEY = "mypackAnalyticsClientId";
const OPT_OUT_KEY = "mypackAnalyticsOptOut";
const measurementId = (import.meta.env.VITE_GA_MEASUREMENT_ID || "").trim();
const apiSecret = (import.meta.env.VITE_GA_MP_API_SECRET || "").trim();
const isEnabled = isGaConfigured();
const isDevelopmentMode = import.meta.env.VITE_APP_ENV === "development";
const isDebugMode =
  import.meta.env.VITE_ENABLE_DEBUG_LOGS === "true" ||
  import.meta.env.VITE_APP_ENV !== "production";

let clientIdCache: string | null = null;

export const isAnalyticsMessage = (
  message: unknown,
): message is AnalyticsMessage => {
  if (!message || typeof message !== "object") {
    return false;
  }

  const candidate = message as {
    type?: string;
    name?: unknown;
    params?: unknown;
    optOut?: unknown;
  };

  if (candidate.type === "analytics_initialize") {
    return true;
  }

  if (candidate.type === "analytics_set_opt_out") {
    return typeof candidate.optOut === "boolean";
  }

  if (candidate.type === "analytics_event") {
    if (typeof candidate.name !== "string") {
      return false;
    }
    if (
      candidate.params !== undefined &&
      (candidate.params === null || typeof candidate.params !== "object")
    ) {
      return false;
    }
    return true;
  }

  return false;
};

function getManifestVersion(): string {
  return chrome.runtime.getManifest?.().version ?? "unknown";
}

function getSenderHost(sender?: chrome.runtime.MessageSender): string {
  if (!sender?.url) {
    return "unknown";
  }

  try {
    return new URL(sender.url).hostname;
  } catch {
    return "unknown";
  }
}

async function readFromStorage<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (items) => {
      const result = items?.[key] as T | undefined;
      resolve(result ?? null);
    });
  });
}

async function writeToStorage(key: string, value: unknown): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
}

async function isAnalyticsDisabled(): Promise<boolean> {
  if (!isEnabled) {
    return true;
  }

  const optOut = await readFromStorage<boolean>(OPT_OUT_KEY);
  return optOut === true;
}

function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

async function getClientId(): Promise<string | null> {
  if (clientIdCache) {
    return clientIdCache;
  }

  const storedId = await readFromStorage<string>(CLIENT_ID_KEY);
  if (storedId) {
    clientIdCache = storedId;
    return storedId;
  }

  const createdId = createId();
  clientIdCache = createdId;
  await writeToStorage(CLIENT_ID_KEY, createdId);
  return createdId;
}

function sanitizeEventName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .slice(0, 40);
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

async function sendAnalyticsEvent(
  name: string,
  params: EventParams,
  sender?: chrome.runtime.MessageSender,
): Promise<void> {
  if (await isAnalyticsDisabled()) {
    return;
  }

  const clientId = await getClientId();
  if (!clientId) {
    return;
  }

  const sanitizedName = sanitizeEventName(name);
  if (!sanitizedName) {
    return;
  }

  const eventPayload: GAPayload = {
    client_id: clientId,
    events: [
      {
        name: sanitizedName,
        params: {
          ...params,
          extension_version: getManifestVersion(),
          extension_host: getSenderHost(sender),
          ...(isDebugMode ? { debug_mode: true } : {}),
        },
      },
    ],
  };

  await send(eventPayload);
}

async function setAnalyticsOptOut(optOut: boolean): Promise<void> {
  await writeToStorage(OPT_OUT_KEY, optOut);
}

export function handleAnalyticsInitialize(): {
  success: boolean;
} {
  AppLogger.info("[Background] Analytics initialization message received");
  return { success: true };
}

export async function handleAnalyticsEvent(
  message: Extract<AnalyticsMessage, { type: "analytics_event" }>,
  sender?: chrome.runtime.MessageSender,
): Promise<{ success: boolean; error?: string }> {
  try {
    await sendAnalyticsEvent(message.name, message.params ?? {}, sender);
    return { success: true };
  } catch (error) {
    if (isDebugMode) {
      AppLogger.error("[Analytics] Failed to send GA event:", error);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function handleAnalyticsSetOptOut(
  message: Extract<AnalyticsMessage, { type: "analytics_set_opt_out" }>,
): Promise<{ success: boolean }> {
  await setAnalyticsOptOut(message.optOut);
  return { success: true };
}
