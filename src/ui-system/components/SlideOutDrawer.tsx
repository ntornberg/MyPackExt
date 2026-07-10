import { GraduationCapIcon, MoonStarIcon, SunMediumIcon } from "lucide-react";
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
import { TooltipProvider } from "@/components/ui/tooltip";

import CourseSearch from "../../course-management/components/search-tabs/CourseSearch";
import GepSearch from "../../course-management/components/search-tabs/GepSearch";
import MajorPlanSearch from "../../course-management/components/search-tabs/MajorPlanSearch";
import {
  CourseSearchDataInitialState,
  GepSearchDataInitialState,
  MajorPlanSearchDataInitialState,
  type CourseSearchData,
  type GepSearchData,
  type MajorPlanSearchData,
  type TabUpdater,
} from "../../course-management/components/tab-state/tabState";
import { StatusBanner } from "../../user-experience/status/StatusBanner";

import {
  plannerActionButtonClassName,
  plannerDrawerContentClassName,
  plannerFloatingButtonClassName,
} from "./planner/plannerShellStyles";
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

const MemoizedGepSearchTab = React.memo(
  ({
    setGepSearchTabData,
    GepSearchData,
    onPreviewSectionChange,
    previewContent,
    selectedPreviewId,
  }: {
    setGepSearchTabData: TabUpdater<GepSearchData>;
    GepSearchData: GepSearchData;
    onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
    previewContent: React.ReactNode;
    selectedPreviewId: string | null;
  }) => (
    <GepSearch
      setGepSearchTabData={setGepSearchTabData}
      GepSearchData={GepSearchData}
      onPreviewSectionChange={onPreviewSectionChange}
      previewContent={previewContent}
      selectedPreviewId={selectedPreviewId}
    />
  ),
);

const MemoizedMajorPlanSearchTab = React.memo(
  ({
    setMajorPlanSearchTabData,
    majorPlanSearchData,
    onPreviewSectionChange,
    previewContent,
    selectedPreviewId,
  }: {
    setMajorPlanSearchTabData: TabUpdater<MajorPlanSearchData>;
    majorPlanSearchData: MajorPlanSearchData;
    onPreviewSectionChange: (preview: PlannerSectionPreview | null) => void;
    previewContent: React.ReactNode;
    selectedPreviewId: string | null;
  }) => (
    <MajorPlanSearch
      setMajorPlanSearchTabData={setMajorPlanSearchTabData}
      majorPlanSearchData={majorPlanSearchData}
      onPreviewSectionChange={onPreviewSectionChange}
      previewContent={previewContent}
      selectedPreviewId={selectedPreviewId}
    />
  ),
);

const MemoizedPlannerPreviewRail = React.memo(
  PlannerPreviewRail,
  (prev, next) =>
    prev.isOpen === next.isOpen &&
    prev.selectedPreview?.id === next.selectedPreview?.id,
);

function mergeCourseSearchData(
  stored: Partial<CourseSearchData> | undefined,
): CourseSearchData {
  const storedCourseInfo = stored?.selectedCourseInfo;

  return {
    ...CourseSearchDataInitialState,
    ...stored,
    selectedCourseInfo:
      storedCourseInfo === null
        ? null
        : {
            code: storedCourseInfo?.code ?? null,
            catalogNum: storedCourseInfo?.catalogNum ?? null,
            title: storedCourseInfo?.title ?? null,
            id: storedCourseInfo?.id ?? "",
          },
  };
}

function mergeMajorPlanSearchData(
  stored: Partial<MajorPlanSearchData> | undefined,
): MajorPlanSearchData {
  const restored = {
    ...MajorPlanSearchDataInitialState,
    ...stored,
    openCourses:
      stored?.openCourses ?? MajorPlanSearchDataInitialState.openCourses,
  };

  if (restored.isLoaded === false) {
    return {
      ...restored,
      isLoaded: true,
      progress: 0,
      progressLabel: "",
    };
  }

  return restored;
}

function mergeGepData(
  stored: Partial<GepSearchData> | undefined,
): GepSearchData {
  const restored = {
    ...GepSearchDataInitialState,
    ...stored,
    courseData: stored?.courseData ?? GepSearchDataInitialState.courseData,
    courses: stored?.courses ?? GepSearchDataInitialState.courses,
  };

  if (restored.isLoaded === false) {
    return {
      ...restored,
      isLoaded: true,
      progress: 0,
      progressLabel: "",
    };
  }

  return restored;
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
    if (typeof window === "undefined") return "light";
    try {
      const saved = localStorage.getItem("mypack-theme-mode");
      if (saved === "dark" || saved === "light") return saved;
    } catch {
      /* ignore */
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  const [courseSearchData, setCourseSearchData] = useState(() =>
    mergeCourseSearchData(persisted?.courseSearchData),
  );
  const [majorPlanSearchData, setMajorPlanSearchData] = useState(() =>
    mergeMajorPlanSearchData(persisted?.majorPlanSearchData),
  );
  const [GepSearchData, setGepSearchData] = useState(() =>
    mergeGepData(persisted?.GepSearchData),
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

  const setMajorPlanSearchTabData: TabUpdater<MajorPlanSearchData> =
    useCallback((keyOrPatch, value) => {
      if (typeof keyOrPatch === "object") {
        setMajorPlanSearchData((prev) => ({ ...prev, ...keyOrPatch }));
        return;
      }

      setMajorPlanSearchData((prev) => ({ ...prev, [keyOrPatch]: value }));
    }, []);

  const setGepSearchTabData: TabUpdater<GepSearchData> = useCallback(
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
    if (drawerOpen) {
      return;
    }
    setDrawerOpen(true);
  }, [drawerOpen]);

  const handleDrawerClose = useCallback(() => {
    persistPlannerSession({
      version: 1,
      selectedTab,
      courseSearchData,
      majorPlanSearchData,
      GepSearchData,
    });
    setDrawerOpen(false);
    setSelectedPreview(null);
  }, [courseSearchData, GepSearchData, majorPlanSearchData, selectedTab]);

  useEffect(() => {
    try {
      localStorage.setItem("mypack-theme-mode", themeMode);
    } catch {
      /* ignore */
    }

    document.documentElement.setAttribute("data-mpp-theme", themeMode);

    const overlayRoot = document.getElementById("extension-overlay-root");
    if (!overlayRoot) {
      return;
    }

    const isDark = themeMode === "dark";
    // Set the attribute so CSS-var blocks (:host([data-mpp-theme="dark"])) apply.
    overlayRoot.setAttribute("data-mpp-theme", themeMode);

    const shadow = overlayRoot.shadowRoot;
    if (shadow) {
      // Tailwind's `.dark *` selector cannot pierce the shadow boundary — the
      // host's class is invisible to shadow-root stylesheets.  Toggle `dark`
      // directly on the .mypack-shell containers inside the shadow root so
      // every portaled descendant is covered.
      shadow.querySelectorAll<HTMLElement>(".mypack-shell").forEach((el) => {
        el.classList.toggle("dark", isDark);
      });
    } else {
      // Staging (no shadow root): toggle on the host element itself.
      overlayRoot.classList.toggle("dark", isDark);
    }
  }, [themeMode]);

  useEffect(() => {
    persistPlannerSession({
      version: 1,
      selectedTab,
      courseSearchData,
      majorPlanSearchData,
      GepSearchData,
    });
  }, [courseSearchData, GepSearchData, majorPlanSearchData, selectedTab]);

  const selectedPreviewId = selectedPreview?.id ?? null;
  const previewRail = useMemo(
    () => (
      <MemoizedPlannerPreviewRail
        selectedPreview={selectedPreview}
        isOpen={drawerOpen}
      />
    ),
    [drawerOpen, selectedPreview],
  );
  const inactivePreviewRail = useMemo(
    () => (
      <MemoizedPlannerPreviewRail selectedPreview={null} isOpen={drawerOpen} />
    ),
    [drawerOpen],
  );

  return (
    <div className="mypack-shell flex flex-col items-end gap-2">
      {!drawerOpen ? (
        <Button
          type="button"
          onClick={handleDrawerOpen}
          size="sm"
          aria-label="Open Pack Planner"
          className={plannerFloatingButtonClassName}
        >
          <GraduationCapIcon className="size-4" strokeWidth={2.25} />
          Pack Planner
        </Button>
      ) : null}

      <Dialog
        open={drawerOpen}
        modal={false}
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
          className={plannerDrawerContentClassName}
        >
          <TooltipProvider delayDuration={150}>
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
                  <div className="min-w-0 flex-1">
                    <div className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      Pack Planner
                    </div>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                      Use Search to filter, then pick a row to pin the preview
                      and compare sections side by side.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBanner className="shrink-0" />
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className={plannerActionButtonClassName}
                    >
                      <a href="mailto:nicktornberg12@gmail.com?subject=Pack%20Planner%20Feedback">
                        Report bug / Feedback
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className={plannerActionButtonClassName}
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
                        variant="outline"
                        size="icon-sm"
                        className={plannerActionButtonClassName}
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
                  <TabsTrigger
                    value="course_search"
                    className="min-w-0 truncate"
                  >
                    Course Search
                  </TabsTrigger>
                  <TabsTrigger value="gep_search" className="min-w-0 truncate">
                    GEP Search
                  </TabsTrigger>
                  <TabsTrigger
                    value="major_plan_search"
                    className="min-w-0 truncate"
                  >
                    Major Plan Search
                  </TabsTrigger>
                </TabsList>
              </div>

              <div
                id="dialog-scroll-container"
                className="min-h-0 max-h-full flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain [scrollbar-gutter:stable] bg-muted/15 touch-pan-y dark:bg-background/30"
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
                  <MemoizedCourseSearchTab
                    setCourseSearchTabData={setCourseSearchTabData}
                    courseSearchData={courseSearchData}
                    onPreviewSectionChange={setSelectedPreview}
                    previewContent={
                      selectedTab === "course_search"
                        ? previewRail
                        : inactivePreviewRail
                    }
                    selectedPreviewId={
                      selectedTab === "course_search" ? selectedPreviewId : null
                    }
                  />
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
                  <MemoizedGepSearchTab
                    setGepSearchTabData={setGepSearchTabData}
                    GepSearchData={GepSearchData}
                    onPreviewSectionChange={setSelectedPreview}
                    previewContent={
                      selectedTab === "gep_search"
                        ? previewRail
                        : inactivePreviewRail
                    }
                    selectedPreviewId={
                      selectedTab === "gep_search" ? selectedPreviewId : null
                    }
                  />
                </TabsContent>
                <TabsContent
                  value="major_plan_search"
                  forceMount
                  className={
                    selectedTab === "major_plan_search"
                      ? "block min-h-0"
                      : "hidden min-h-0"
                  }
                >
                  <MemoizedMajorPlanSearchTab
                    setMajorPlanSearchTabData={setMajorPlanSearchTabData}
                    majorPlanSearchData={majorPlanSearchData}
                    onPreviewSectionChange={setSelectedPreview}
                    previewContent={
                      selectedTab === "major_plan_search"
                        ? previewRail
                        : inactivePreviewRail
                    }
                    selectedPreviewId={
                      selectedTab === "major_plan_search"
                        ? selectedPreviewId
                        : null
                    }
                  />
                </TabsContent>
              </div>
            </Tabs>
          </TooltipProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
