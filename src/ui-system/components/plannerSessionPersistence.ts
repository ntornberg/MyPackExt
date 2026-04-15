import type {
  CourseSearchData,
  GEPData,
  PlanSearchData,
} from "../../course-management/components/TabDataStore/TabData";
import type { PlannerWorkbenchTab } from "./workbench/workbenchTypes";

const STORAGE_KEY = "mypack-pack-planner-session-v1";
/** Tiny payload so the active tab survives even when the full session JSON hits quota. */
const SELECTED_TAB_KEY = "mypack-pack-planner-selected-tab-v1";

export type PersistedPlannerSession = {
  version: 1;
  selectedTab: PlannerWorkbenchTab;
  courseSearchData: CourseSearchData;
  planSearchData: PlanSearchData;
  gepSearchData: GEPData;
};

function isPlannerWorkbenchTab(value: string): value is PlannerWorkbenchTab {
  return (
    value === "course_search" ||
    value === "gep_search" ||
    value === "plan_search"
  );
}

export function loadPlannerSelectedTab(): PlannerWorkbenchTab | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(SELECTED_TAB_KEY);
    if (!raw || !isPlannerWorkbenchTab(raw)) {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

export function persistPlannerSelectedTab(tab: PlannerWorkbenchTab): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(SELECTED_TAB_KEY, tab);
  } catch {
    /* quota or private mode */
  }
}

/**
 * Loads the last planner session from `localStorage`, or migrates from
 * `sessionStorage` (older builds) once per browser profile.
 */
export function loadPersistedPlannerSession(): PersistedPlannerSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  let raw: string | null = null;
  let source: "local" | "session" | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      source = "local";
    } else {
      raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        source = "session";
      }
    }
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PersistedPlannerSession;
    if (parsed?.version !== 1 || typeof parsed.selectedTab !== "string") {
      return null;
    }
    if (!isPlannerWorkbenchTab(parsed.selectedTab)) {
      return null;
    }
    if (source === "session") {
      try {
        localStorage.setItem(STORAGE_KEY, raw);
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore migration failure */
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

export function persistPlannerSession(payload: PersistedPlannerSession): void {
  if (typeof window === "undefined") {
    return;
  }
  persistPlannerSelectedTab(payload.selectedTab);
  try {
    const json = JSON.stringify(payload);
    localStorage.setItem(STORAGE_KEY, json);
  } catch {
    /* quota or private mode — selected tab was still persisted above */
  }
}
