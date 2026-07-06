export const STATUS_WORKER_ORIGIN =
  "https://mypackext-status-worker.nicktornberg12.workers.dev";

export type StatusLevel = "ok" | "info" | "warning" | "error" | "maintenance";

export type StatusWorkerStatus = {
  ok: boolean;
  level: StatusLevel;
  message: string;
  details?: string;
  updatedAt: string;
};

const STATUS_ENDPOINT = `${STATUS_WORKER_ORIGIN}/status/simple`;
const STATUS_REQUEST_TIMEOUT_MS = 5000;
const STATUS_FETCH_MESSAGE_TYPE = "status_worker_fetch";

type StatusWorkerFetchResponse = {
  success: boolean;
  status?: unknown;
  error?: string;
};

function isStatusLevel(value: unknown): value is StatusLevel {
  return (
    value === "ok" ||
    value === "info" ||
    value === "warning" ||
    value === "error" ||
    value === "maintenance"
  );
}

function parseStatusWorkerStatus(value: unknown): StatusWorkerStatus | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.ok !== "boolean" ||
    !isStatusLevel(candidate.level) ||
    typeof candidate.message !== "string" ||
    typeof candidate.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    ok: candidate.ok,
    level: candidate.level,
    message: candidate.message,
    details:
      typeof candidate.details === "string" ? candidate.details : undefined,
    updatedAt: candidate.updatedAt,
  };
}

export async function fetchStatusWorkerStatusDirect(): Promise<StatusWorkerStatus | null> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    STATUS_REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(STATUS_ENDPOINT, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    return parseStatusWorkerStatus(await response.json());
  } catch {
    return null;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

function canMessageBackground(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.runtime?.sendMessage);
}

export async function fetchStatusWorkerStatus(): Promise<StatusWorkerStatus | null> {
  if (!canMessageBackground()) {
    return fetchStatusWorkerStatusDirect();
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: STATUS_FETCH_MESSAGE_TYPE },
      (response: StatusWorkerFetchResponse | undefined) => {
        if (chrome.runtime.lastError || !response?.success) {
          resolve(null);
          return;
        }

        resolve(parseStatusWorkerStatus(response.status));
      },
    );
  });
}

export function isStatusWorkerFetchMessage(message: unknown): message is {
  type: typeof STATUS_FETCH_MESSAGE_TYPE;
} {
  return (
    Boolean(message) &&
    typeof message === "object" &&
    (message as { type?: unknown }).type === STATUS_FETCH_MESSAGE_TYPE
  );
}
