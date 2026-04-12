import { AppLogger } from "../utils/logger";

type EventParamValue = string | number | boolean;
type EventParams = Record<string, EventParamValue>;

type AnalyticsEventMessage = {
  type: "analytics_event";
  name: string;
  params?: EventParams;
};

type AnalyticsInitMessage = {
  type: "analytics_initialize";
};

type AnalyticsSetOptOutMessage = {
  type: "analytics_set_opt_out";
  optOut: boolean;
};

type AnalyticsMessage =
  | AnalyticsEventMessage
  | AnalyticsInitMessage
  | AnalyticsSetOptOutMessage;

async function sendMessage(message: AnalyticsMessage): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return;
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, () => {
      if (chrome.runtime.lastError) {
        AppLogger.error(
          "[Analytics] sendMessage failed:",
          chrome.runtime.lastError.message,
        );
      }
      resolve();
    });
  });
}

export async function initializeAnalytics(): Promise<void> {
  await sendMessage({ type: "analytics_initialize" });
}

export async function logEvent(
  name: string,
  params: EventParams = {},
): Promise<void> {
  await sendMessage({ type: "analytics_event", name, params });
}

export async function setAnalyticsOptOut(optOut: boolean): Promise<void> {
  await sendMessage({ type: "analytics_set_opt_out", optOut });
}
