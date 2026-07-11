import type {
  CourseSearchData,
  GepSearchData,
  MajorPlanSearchData,
} from "../../course-management/components/tab-state/tabState";

import type { PlannerWorkbenchTab } from "./workbench/workbenchTypes";

const STORAGE_KEY = "mypack-pack-planner-session-v1";
/** Tiny payload so the active tab survives even when the full session JSON hits quota. */
const SELECTED_TAB_KEY = "mypack-pack-planner-selected-tab-v1";

export type PersistedPlannerSession = {
  version: 1;
  selectedTab: PlannerWorkbenchTab;
  courseSearchData: CourseSearchData;
  majorPlanSearchData: MajorPlanSearchData;
  GepSearchData: GepSearchData;
};

type LegacyPlannerWorkbenchTab = PlannerWorkbenchTab | "plan_search";

type LegacyPersistedPlannerSession = Omit<
  PersistedPlannerSession,
  "majorPlanSearchData" | "selectedTab"
> & {
  selectedTab: LegacyPlannerWorkbenchTab;
  majorPlanSearchData?: MajorPlanSearchData;
  planSearchData?: MajorPlanSearchData;
};

function normalizePlannerWorkbenchTab(
  value: string,
): PlannerWorkbenchTab | null {
  if (value === "plan_search") {
    return "major_plan_search";
  }
  if (
    value === "course_search" ||
    value === "gep_search" ||
    value === "major_plan_search"
  ) {
    return value;
  }
  return null;
}

export function loadPlannerSelectedTab(): PlannerWorkbenchTab | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(SELECTED_TAB_KEY);
    if (!raw) {
      return null;
    }
    return normalizePlannerWorkbenchTab(raw);
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
    const parsed = JSON.parse(raw) as LegacyPersistedPlannerSession;
    if (parsed?.version !== 1 || typeof parsed.selectedTab !== "string") {
      return null;
    }
    const selectedTab = normalizePlannerWorkbenchTab(parsed.selectedTab);
    if (!selectedTab) {
      return null;
    }
    const normalized: PersistedPlannerSession = {
      ...parsed,
      selectedTab,
      majorPlanSearchData:
        parsed.majorPlanSearchData ??
        parsed.planSearchData ??
        ({} as MajorPlanSearchData),
    };
    if (source === "session") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore migration failure */
      }
    }
    return normalized;
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
