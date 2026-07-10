# MyPack Plus UI Inventory And Design Criteria

## Purpose

This document describes the current user-facing UI and the constraints that should be preserved during future UI cleanup or redesign work.

The product is an in-page browser extension experience. It does not currently use a browser-action popup or options page as the primary workflow.

## Architecture Constraints

- The UI is injected into MyPack Portal pages by the content script.
- The main planner renders in a shadow-root overlay to avoid host-page CSS conflicts.
- Some support UI is injected into MyPack planner/cart rows inside host iframes.
- The extension must tolerate host page CSS, nested iframes, dynamic DOM updates, and limited space inside the existing registration flow.

## Core Surfaces

### Launcher

- Source: `src/ui-system/components/MainPopupCard.tsx`
- A compact fixed button labeled `Pack Planner`.
- Opens the main planner dialog.
- Must remain discoverable without blocking MyPack controls.

### Main Planner Dialog

- Source: `src/ui-system/components/MainPopupCard.tsx`
- Large overlay workspace titled `Pack Planner`.
- Contains feedback, theme toggle, close control, and three tabs:
  - `Course Search`
  - `GEP Search`
  - `Major Search`
- Tab state and loaded results persist while switching tabs.
- Styling lives in `src/ui-system/styles/planner.css` plus Tailwind utilities.

### Search Workbench

- Sources:
  - `src/course-management/components/SearchTabs/CourseSearch.tsx`
  - `src/course-management/components/SearchTabs/GEPSearch.tsx`
  - `src/course-management/components/SearchTabs/PlanSearch.tsx`
  - `src/ui-system/components/workbench/*`
  - `src/ui-system/components/planner/*`
- Shared layout uses a three-column workbench:
  - controls panel
  - section/results panel
  - schedule preview rail
- Shared controls include planner panels, schedule-fit checkbox, hide-empty checkbox, density toggle, and search button.

### Section Comparison Cards

- Source: `src/ui-system/components/workbench/SectionCompareCard.tsx`
- Replaces the older dense table-oriented results model.
- Shows availability, seat pressure, instructor, rating, grade summary, meeting details, linked labs/recitations, and an add-to-cart slot.
- Supports compact and comfortable density.

### Preview Rail

- Source: `src/ui-system/components/workbench/PlannerPreviewRail.tsx`
- Shows current MyPack schedule context or the selected section preview.
- Displays calendar blocks, conflicts, notes, and prerequisites.

### Onboarding And Release Dialogs

- Sources:
  - `src/user-experience/components/UserGuide/WhatsNewDialog.tsx`
  - `src/user-experience/components/UserGuide/FirstStartDialog.tsx`
- `What's New` appears once per extension version.
- Quick-start onboarding appears until dismissed.

### Injected Planner Row Cards

- Sources:
  - `src/degree-planning/components/DegreeAuditCards/GradeCard.tsx`
  - `src/degree-planning/components/DegreeAuditCards/ProfRatingCard.tsx`
  - `src/degree-planning/components/DegreeAuditCards/degreeAuditCards.css`
- Small in-context grade/professor cards rendered inside MyPack rows.
- These use their own stylesheet because they render outside the main planner overlay and may live inside a separate shadow root.

## Workflow Summaries

### Course Search

- Search by term, subject, and course.
- Optional instructor and schedule-fit filters.
- Results render as paginated section comparison cards.
- Empty, loading, and error states are local to the tab.

### GEP Search

- Search by term and GEP category.
- Groups matching courses by subject area.
- Supports instructor, schedule-fit, compact density, and hide-empty filters.
- Course groups expand into section comparison lists.

### Major Search

- Search by term plus either:
  - minor, or
  - major and subplan.
- Requirement groups use native disclosure sections.
- Each requirement can show one or more courses with section comparison lists.

## Visual System

- Tailwind CSS v4 and shadcn-style primitives are the main UI system.
- Planner shell styles live in `src/ui-system/styles/planner.css`.
- Reusable planner wrappers live in `src/ui-system/components/planner`.
- MUI is retained only for chart rendering through MUI X Charts.
- Light and dark modes are driven by `data-mpp-theme` / `.dark` and CSS variables in `src/index.css`.

## Design Criteria

Preserve these behaviors in future redesigns:

- Keep the UI in-page and compatible with MyPack's host DOM.
- Preserve Course, GEP, and Major search workflows.
- Preserve live section availability, professor ratings, grade history, notes, prerequisites, and add-to-cart actions.
- Preserve schedule-conflict awareness as a first-class part of comparison.
- Keep large result sets scannable with pagination, density controls, and progressive disclosure.
- Keep local feedback for row-level actions.
- Support light and dark mode.
- Avoid broad inline styling for static presentation; prefer semantic classes, shared components, or CSS files.

## Known Cleanup Opportunities

- Split `SectionCompareCard.tsx` into smaller presentation components.
- Move more data-driven color/geometry inline styles to CSS variables where practical.
- Add visual smoke tests for staging planner light/dark mode.
- Consider code-splitting large planner/charts paths to reduce production chunk size.
