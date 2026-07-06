import {
  CheckCircle2Icon,
  InfoIcon,
  TriangleAlertIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import {
  fetchStatusWorkerStatus,
  type StatusLevel,
  type StatusWorkerStatus,
} from "./statusWorker";

const STATUS_REFRESH_INTERVAL_MS = 60000;

const levelStyles: Record<StatusLevel, string> = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-emerald-950/5 dark:border-emerald-500/35 dark:bg-emerald-950/45 dark:text-emerald-50",
  info: "border-sky-200 bg-sky-50 text-sky-950 shadow-sky-950/5 dark:border-sky-500/35 dark:bg-sky-950/45 dark:text-sky-50",
  warning:
    "border-amber-200 bg-amber-50 text-amber-950 shadow-amber-950/5 dark:border-amber-500/35 dark:bg-amber-950/45 dark:text-amber-50",
  maintenance:
    "border-amber-200 bg-amber-50 text-amber-950 shadow-amber-950/5 dark:border-amber-500/35 dark:bg-amber-950/45 dark:text-amber-50",
  error:
    "border-red-200 bg-red-50 text-red-950 shadow-red-950/5 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-50",
};

const iconStyles: Record<StatusLevel, string> = {
  ok: "text-emerald-600 dark:text-emerald-300",
  info: "text-sky-600 dark:text-sky-300",
  warning: "text-amber-600 dark:text-amber-300",
  maintenance: "text-amber-600 dark:text-amber-300",
  error: "text-red-600 dark:text-red-300",
};

function StatusIcon({ level }: { level: StatusLevel }) {
  const className = cn("size-4 shrink-0", iconStyles[level]);

  if (level === "ok") {
    return <CheckCircle2Icon aria-hidden="true" className={className} />;
  }

  if (level === "error") {
    return <XCircleIcon aria-hidden="true" className={className} />;
  }

  if (level === "warning" || level === "maintenance") {
    return <TriangleAlertIcon aria-hidden="true" className={className} />;
  }

  return <InfoIcon aria-hidden="true" className={className} />;
}

export function StatusBanner({ className }: { className?: string }) {
  const [status, setStatus] = useState<StatusWorkerStatus | null>(null);

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      const nextStatus = await fetchStatusWorkerStatus();
      if (!isMounted) {
        return;
      }
      setStatus(nextStatus);
    };

    void refresh();
    const intervalId = window.setInterval(
      () => void refresh(),
      STATUS_REFRESH_INTERVAL_MS,
    );

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  if (!status) {
    return null;
  }

  const role = status.level === "error" ? "alert" : "status";
  const showMessage = status.level !== "ok" && status.message.trim().length > 0;
  const label =
    status.level === "ok"
      ? "Pack Planner status: all systems normal"
      : `Pack Planner status: ${status.message}`;

  return (
    <aside
      role={role}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex max-w-[min(56vw,360px)] items-center gap-2 rounded-full border px-2.5 py-1.5 text-left text-xs font-medium shadow-sm",
        levelStyles[status.level],
        className,
      )}
    >
      <StatusIcon level={status.level} />
      {showMessage ? (
        <span className="min-w-0 truncate leading-4">{status.message}</span>
      ) : null}
    </aside>
  );
}
