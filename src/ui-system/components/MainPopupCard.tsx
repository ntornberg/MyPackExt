import {
  GraduationCapIcon,
  MoonStarIcon,
  SunMediumIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { logEvent } from "../../analytics/ga4";
import CourseSearch from "../../course-management/components/SearchTabs/CourseSearch";
import GEPSearch from "../../course-management/components/SearchTabs/GEPSearch";
import PlanSearch from "../../course-management/components/SearchTabs/PlanSearch";
import {
  CourseSearchDataInitialState,
  GEPDataInitialState,
  PlanSearchDataInitialState,
  type CourseSearchData,
  type GEPData,
  type PlanSearchData,
  type TabUpdater,
} from "../../course-management/components/TabDataStore/TabData";
import { customDataTableStyles } from "../styles/dataTableStyles";

import {
  loadPersistedPlannerSession,
  loadPlannerSelectedTab,
  persistPlannerSelectedTab,
  persistPlannerSession,
} from "./plannerSessionPersistence";
import { PlannerPreviewRail } from "./workbench/PlannerPreviewRail";
import { useOverlayPortalContainer } from "./workbench/useOverlayPortalContainer";
import {
  type PlannerSectionPreview,
  type PlannerWorkbenchTab,
} from "./workbench/workbenchTypes";

const MemoizedCourseSearchTab = React.memo(
  ({
    setCourseSearchTabData,
    courseSearchData,
    onPreviewSectionChange,
    previewContent,
    selectedPreviewId,
  }: {
    setCourseSearchTabData: TabUpdater<CourseSearchData>;
    courseSearchData: CourseSearchData;
    onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
    previewContent: React.ReactNode;
    selectedPreviewId: string | null;
  }) => (
    <CourseSearch
      setCourseSearchTabData={setCourseSearchTabData}
      courseSearchData={courseSearchData}
      onPreviewSectionChange={onPreviewSectionChange}
      previewContent={previewContent}
      selectedPreviewId={selectedPreviewId}
    />
  ),
);

const MemoizedGEPSearchTab = React.memo(
  ({
    setGepSearchTabData,
    gepSearchData,
    onPreviewSectionChange,
    previewContent,
    selectedPreviewId,
  }: {
    setGepSearchTabData: TabUpdater<GEPData>;
    gepSearchData: GEPData;
    onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
    previewContent: React.ReactNode;
    selectedPreviewId: string | null;
  }) => (
    <GEPSearch
      setGepSearchTabData={setGepSearchTabData}
      gepSearchData={gepSearchData}
      onPreviewSectionChange={onPreviewSectionChange}
      previewContent={previewContent}
      selectedPreviewId={selectedPreviewId}
    />
  ),
);

const MemoizedPlanSearchTab = React.memo(
  ({
    setPlanSearchTabData,
    planSearchData,
    onPreviewSectionChange,
    previewContent,
    selectedPreviewId,
  }: {
    setPlanSearchTabData: TabUpdater<PlanSearchData>;
    planSearchData: PlanSearchData;
    onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
    previewContent: React.ReactNode;
    selectedPreviewId: string | null;
  }) => (
    <PlanSearch
      setPlanSearchTabData={setPlanSearchTabData}
      planSearchData={planSearchData}
      onPreviewSectionChange={onPreviewSectionChange}
      previewContent={previewContent}
      selectedPreviewId={selectedPreviewId}
    />
  ),
);

function mergeCourseSearchData(
  stored: Partial<CourseSearchData> | undefined,
): CourseSearchData {
  return {
    ...CourseSearchDataInitialState,
    ...stored,
    selectedCourseInfo: {
      ...CourseSearchDataInitialState.selectedCourseInfo,
      ...(stored?.selectedCourseInfo ?? {}),
    },
  };
}

function mergePlanSearchData(
  stored: Partial<PlanSearchData> | undefined,
): PlanSearchData {
  return {
    ...PlanSearchDataInitialState,
    ...stored,
    openCourses: stored?.openCourses ?? PlanSearchDataInitialState.openCourses,
  };
}

function mergeGepData(stored: Partial<GEPData> | undefined): GEPData {
  return {
    ...GEPDataInitialState,
    ...stored,
    courseData: stored?.courseData ?? GEPDataInitialState.courseData,
    courses: stored?.courses ?? GEPDataInitialState.courses,
  };
}

export default function SlideOutDrawer() {
  const persisted = useMemo(
    () =>
      typeof window !== "undefined" ? loadPersistedPlannerSession() : null,
    [],
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<PlannerWorkbenchTab>(() => {
    const fromTabKey = loadPlannerSelectedTab();
    if (fromTabKey) {
      return fromTabKey;
    }
    return persisted?.selectedTab ?? "course_search";
  });
  const [selectedPreview, setSelectedPreview] =
    useState<PlannerSectionPreview | null>(null);
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light";
  });
  const [courseSearchData, setCourseSearchData] = useState(() =>
    mergeCourseSearchData(persisted?.courseSearchData),
  );
  const [planSearchData, setPlanSearchData] = useState(() =>
    mergePlanSearchData(persisted?.planSearchData),
  );
  const [gepSearchData, setGepSearchData] = useState(() =>
    mergeGepData(persisted?.gepSearchData),
  );
  const portalContainer = useOverlayPortalContainer();

  const setCourseSearchTabData: TabUpdater<CourseSearchData> = useCallback(
    (keyOrPatch, value) => {
      setCourseSearchData((prev) =>
        typeof keyOrPatch === "object"
          ? { ...prev, ...keyOrPatch }
          : { ...prev, [keyOrPatch]: value },
      );
    },
    [],
  );

  const setPlanSearchTabData: TabUpdater<PlanSearchData> = useCallback(
    (keyOrPatch, value) => {
      if (typeof keyOrPatch === "object") {
        setPlanSearchData((prev) => ({ ...prev, ...keyOrPatch }));
        return;
      }

      setPlanSearchData((prev) => ({ ...prev, [keyOrPatch]: value }));
    },
    [],
  );

  const setGepSearchTabData: TabUpdater<GEPData> = useCallback(
    (keyOrPatch, value) => {
      setGepSearchData((prev) =>
        typeof keyOrPatch === "object"
          ? { ...prev, ...keyOrPatch }
          : { ...prev, [keyOrPatch]: value },
      );
    },
    [],
  );

  const handleDrawerOpen = useCallback(() => {
    setDrawerOpen(true);
    void logEvent("drawer_opened", {
      source: "toolbar",
    });
  }, []);

  const handleDrawerClose = useCallback(() => {
    persistPlannerSession({
      version: 1,
      selectedTab,
      courseSearchData,
      planSearchData,
      gepSearchData,
    });
    setDrawerOpen(false);
    setSelectedPreview(null);
  }, [courseSearchData, gepSearchData, planSearchData, selectedTab]);

  useEffect(() => {
    document.documentElement.setAttribute("data-pp-mode", themeMode);

    const overlayRoot = document.getElementById("extension-overlay-root");
    if (!overlayRoot) {
      return;
    }

    overlayRoot.setAttribute("data-mpp-theme", themeMode);
    overlayRoot.classList.toggle("dark", themeMode === "dark");
  }, [themeMode]);

  useEffect(() => {
    persistPlannerSession({
      version: 1,
      selectedTab,
      courseSearchData,
      planSearchData,
      gepSearchData,
    });
  }, [courseSearchData, gepSearchData, planSearchData, selectedTab]);

  const previewRail = useMemo(
    () => (
      <PlannerPreviewRail
        selectedPreview={selectedPreview}
        isOpen={drawerOpen}
      />
    ),
    [drawerOpen, selectedPreview],
  );

  const tabContent = useMemo(
    () => ({
      courseSearch: (
        <MemoizedCourseSearchTab
          setCourseSearchTabData={setCourseSearchTabData}
          courseSearchData={courseSearchData}
          onPreviewSectionChange={setSelectedPreview}
          previewContent={previewRail}
          selectedPreviewId={selectedPreview?.id ?? null}
        />
      ),
      gepSearch: (
        <MemoizedGEPSearchTab
          setGepSearchTabData={setGepSearchTabData}
          gepSearchData={gepSearchData}
          onPreviewSectionChange={setSelectedPreview}
          previewContent={previewRail}
          selectedPreviewId={selectedPreview?.id ?? null}
        />
      ),
      planSearch: (
        <MemoizedPlanSearchTab
          setPlanSearchTabData={setPlanSearchTabData}
          planSearchData={planSearchData}
          onPreviewSectionChange={setSelectedPreview}
          previewContent={previewRail}
          selectedPreviewId={selectedPreview?.id ?? null}
        />
      ),
    }),
    [
      courseSearchData,
      gepSearchData,
      planSearchData,
      previewRail,
      selectedPreview?.id,
      setCourseSearchTabData,
      setGepSearchTabData,
      setPlanSearchTabData,
    ],
  );

  return (
    <div className="mypack-shell">
      <style>{customDataTableStyles}</style>

      <Button
        type="button"
        onClick={handleDrawerOpen}
        size="sm"
        aria-label="Open Pack Planner"
        className="h-9 gap-1.5 rounded-full px-3.5 text-[13px] font-semibold tracking-[0.01em] text-primary-foreground shadow-[0_6px_14px_rgba(61,124,255,0.28)] hover:brightness-[1.05]"
        style={{
          backgroundImage: "linear-gradient(180deg, #5d95ff 0%, #3f79ff 100%)",
        }}
      >
        <GraduationCapIcon className="size-4" strokeWidth={2.25} />
        Pack Planner
      </Button>

      <Dialog
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDrawerClose();
          }
        }}
      >
        <DialogContent
          container={portalContainer}
          showCloseButton={false}
          overlayClassName="!bg-slate-950/45 supports-backdrop-filter:backdrop-blur-[2px] dark:!bg-black/60"
          onOverlayPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              handleDrawerClose();
            }
          }}
          onWheelCapture={(e) => e.stopPropagation()}
          onTouchMoveCapture={(e) => e.stopPropagation()}
          className="mypack-shell flex h-[min(92vh,1040px)] min-h-0 w-[min(96vw,1580px)] max-w-[min(96vw,1580px)] sm:max-w-[min(96vw,1580px)] flex-col gap-0 overflow-hidden rounded-2xl border-2 border-slate-300/90 bg-[linear-gradient(180deg,rgb(251,252,254)_0%,rgb(236,241,249)_100%)] p-0 !text-base text-card-foreground shadow-xl ring-1 ring-slate-900/10 sm:rounded-[28px] dark:border-slate-500/55 dark:bg-[linear-gradient(165deg,rgb(14,22,38)_0%,rgb(8,14,26)_52%,rgb(5,9,17)_100%)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(148,174,224,0.14)] dark:ring-white/15 [&_[data-slot=card]]:border-2 [&_[data-slot=card]]:border-slate-300/85 [&_[data-slot=card]]:bg-card/85 [&_[data-slot=card]]:shadow-sm [&_[data-slot=card]]:ring-1 [&_[data-slot=card]]:ring-slate-900/10 dark:[&_[data-slot=card]]:border-slate-500/50 dark:[&_[data-slot=card]]:ring-white/10"
        >
          <DialogTitle className="sr-only">Pack Planner</DialogTitle>
          <DialogDescription className="sr-only">
            Use Search to filter sections, pick a row to pin the preview, and
            compare options with schedule context.
          </DialogDescription>

          <Tabs
            value={selectedTab}
            activationMode="manual"
            onValueChange={(value) => {
              const next = value as PlannerWorkbenchTab;
              setSelectedTab(next);
              persistPlannerSelectedTab(next);
              setSelectedPreview(null);
            }}
            className="flex min-h-0 max-h-full flex-1 flex-col gap-0 overflow-hidden"
          >
            <div className="shrink-0 border-b border-border/60 bg-muted/25 px-4 py-4 sm:px-6 sm:py-5 dark:bg-background/40">
              <div className="mb-3 flex min-h-7 flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Pack Planner
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    Use Search to filter, then pick a row to pin the preview and
                    compare sections side by side.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href="mailto:nicktornberg12@gmail.com?subject=Pack%20Planner%20Feedback">
                      Report bug / Feedback
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() =>
                      setThemeMode((current) =>
                        current === "dark" ? "light" : "dark",
                      )
                    }
                    aria-label={`Switch to ${
                      themeMode === "dark" ? "light" : "dark"
                    } mode`}
                  >
                    {themeMode === "dark" ? (
                      <SunMediumIcon />
                    ) : (
                      <MoonStarIcon />
                    )}
                  </Button>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Close planner"
                    >
                      <span className="text-base leading-none">x</span>
                    </Button>
                  </DialogClose>
                </div>
              </div>

              <TabsList
                variant="segmented"
                className="w-full min-w-0 sm:min-h-12 sm:max-w-2xl"
                aria-label="Planner search tabs"
              >
                <TabsTrigger value="course_search" className="min-w-0 truncate">
                  Course Search
                </TabsTrigger>
                <TabsTrigger value="gep_search" className="min-w-0 truncate">
                  GEP Search
                </TabsTrigger>
                <TabsTrigger value="plan_search" className="min-w-0 truncate">
                  Major Search
                </TabsTrigger>
              </TabsList>
            </div>

            <div
              id="dialog-scroll-container"
              className="min-h-0 max-h-full flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-muted/15 touch-pan-y dark:bg-background/30"
              onWheelCapture={(e) => e.stopPropagation()}
              onTouchMoveCapture={(e) => e.stopPropagation()}
            >
              <TabsContent
                value="course_search"
                forceMount
                className={
                  selectedTab === "course_search"
                    ? "block min-h-0"
                    : "hidden min-h-0"
                }
              >
                {tabContent.courseSearch}
              </TabsContent>
              <TabsContent
                value="gep_search"
                forceMount
                className={
                  selectedTab === "gep_search"
                    ? "block min-h-0"
                    : "hidden min-h-0"
                }
              >
                {tabContent.gepSearch}
              </TabsContent>
              <TabsContent
                value="plan_search"
                forceMount
                className={
                  selectedTab === "plan_search"
                    ? "block min-h-0"
                    : "hidden min-h-0"
                }
              >
                {tabContent.planSearch}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
