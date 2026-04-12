# MyPack Plus UI Inventory And Design Criteria

## Purpose
This document describes the current user-facing UI in the extension, how each surface works, and which behaviors should be preserved if you ask another model to propose alternative UI designs.

The codebase does **not** implement a browser-action popup or an options page. The primary UX is an **in-page injected interface** that appears inside the MyPack site.

## Product-Level UI Model

### Delivery model
- Browser extension using Manifest V3.
- UI is injected by the content script into matched MyPack pages.
- The main UI waits for the MyPack schedule table before mounting.
- The extension also injects supporting UI into planner/cart rows inside a host iframe.

### Main UX pattern
- A fixed overlay button labeled `Course Search` is rendered over the page.
- Clicking that button opens a large modal dialog titled `Pack Planner`.
- The dialog contains three tabbed workflows:
  - `Course Search`
  - `GEP Search`
  - `Major Search`
- Two additional dialogs can appear before or around the main workflow:
  - `What's New`
  - `Extension Quick-Start Guide`

### Important architectural constraint
- This extension must coexist with an existing university web app.
- The UI must tolerate:
  - host page CSS conflicts
  - nested iframes
  - dynamic DOM updates
  - limited screen real estate inside an already busy planning workflow

## Core UI Surfaces

### 1. Fixed launch button
Source:
- `src/ui-system/components/MainPopupCard.tsx`
- `src/utils/dom.ts`

What it is:
- A persistent overlay button labeled `Course Search`.
- Rendered inside an extension overlay root attached to `document.body`.
- The overlay itself ignores pointer events except for the injected control area.

How it works:
- Acts as the primary entry point into the extension.
- Opens the main dialog when clicked.
- Sends an analytics event when opened.

UX characteristics:
- High-contrast contained button.
- Compact enough to stay on-screen without dominating the host page.
- Positioned as an always-available entry point rather than a floating multi-action toolbar.

Design constraints to preserve:
- Must remain easy to discover.
- Must not block core host-site controls.
- Must be usable even if the host page reflows or changes content below it.

### 2. Main `Pack Planner` dialog
Source:
- `src/ui-system/components/MainPopupCard.tsx`

What it is:
- A large modal dialog that contains the extension's main workflows.

Structure:
- Header row:
  - title: `Pack Planner`
  - `Report bug / Feedback` button
  - light/dark theme toggle icon button
- Secondary header text:
  - contact email caption
- Tab bar:
  - `Course Search`
  - `GEP Search`
  - `Major Search`
- Scrollable content body:
  - tab panels are `keepMounted`, so state survives tab switching

How it works:
- Opens from the `Course Search` launcher button.
- Closes through dialog dismissal.
- Maintains independent state objects for each tab so partially completed searches are not lost.

UX characteristics:
- High-density workspace.
- Optimized for repeated comparison/search actions.
- Uses tabs instead of routes or stacked steps.
- Strong emphasis on preserving work while switching contexts.

Design constraints to preserve:
- Large result sets must remain usable.
- Users need quick switching between the three search modes.
- In-progress form state and loaded results should persist during tab changes.
- The dialog should still feel like an overlay over MyPack, not a separate app.

### 3. `What's New` dialog
Source:
- `src/user-experience/components/UserGuide/WhatsNewDialog.tsx`
- `src/user-experience/content/whatsNewByVersion.ts`

What it is:
- A version-based release notes dialog shown once per extension version.

Structure:
- Overline label: `What's New`
- release title
- release subtitle
- version chip
- list of sections, each with bullet items
- footer with contact email and `Close` button

How it works:
- Reads the extension version from the manifest.
- Looks up content in `whatsNewByVersion`.
- Uses `localStorage` to avoid re-showing the same version.
- Resolves before the first-start dialog is allowed to auto-open.

UX characteristics:
- Marketing-style announcement modal.
- More polished and editorial than the utilitarian search UI.
- Serves as a release communication surface rather than a settings/history page.

Design constraints to preserve:
- Must support versioned release messaging.
- Must only interrupt the user when there is unseen release content.
- Should remain skimmable and short.

### 4. `Extension Quick-Start Guide` dialog
Source:
- `src/user-experience/components/UserGuide/FirstStartDialog.tsx`

What it is:
- A first-run onboarding dialog.

Structure:
- Title: `Extension Quick-Start Guide`
- Section headings:
  - `Course Search tab`
  - `Plan Search tab`
  - `GEP Search tab`
  - `General notes`
- Bullet-list instructions under each section
- `Don't show again` checkbox
- `Close` button

How it works:
- Automatically opens unless dismissed previously.
- Uses `localStorage` key `firstStartDismissed`.
- Can be temporarily suppressed until the `What's New` dialog resolves.

UX characteristics:
- Simple instructional modal.
- Text-forward and functional.
- No rich visuals, steps, or illustration system.

Design constraints to preserve:
- New users need lightweight onboarding.
- The onboarding must be dismissible permanently.
- The guidance should explain where to use the extension inside MyPack.

## Primary Workflow Tabs

### 5. `Course Search` tab
Source:
- `src/course-management/components/SearchTabs/CourseSearch.tsx`

Purpose:
- Search for a single course by term, subject, and course code/title, then inspect available sections.

Top controls:
- `Term` autocomplete
- `Subject` autocomplete
- `Course` autocomplete
- `Search` button

Control behavior:
- `Course` options depend on the selected subject.
- Clearing the subject clears the selected course and derived course metadata.
- The search button is disabled until:
  - term is selected
  - subject is selected
  - course is selected
  - no search is currently loading

Inline guidance:
- Helper text under the course field changes based on state:
  - choose subject first
  - select a course to enable search
  - ready to search

Loading and feedback:
- Circular progress with numeric progress and status label.
- Error text shown inline if fetch fails.
- Empty state shown with a large search icon and contextual text.

Results surface:
- PrimeReact `DataTable` with pagination.
- Expandable rows for sections that have related labs.
- Expanded area shows a nested table of lab rows.

Columns:
- row expander
- `Action`
- `Status`
- `Course Info`
- `Time`
- `Instructor`
- `Rating`
- `Grades`
- `Info`

How it works behind the scenes:
- Fetches open sections from registrar-backed search endpoints.
- Merges section data with grade-distribution and professor-rating data.
- Uses layered caching for open-course data and grade/professor data.

UX characteristics:
- Search-first, then compare-in-table.
- Dense but structured.
- Encourages quick section comparison without leaving the dialog.

Design constraints to preserve:
- Course search must stay fast and low-friction.
- Results need to support side-by-side comparison across several dimensions.
- Related lecture/lab structures must still be understandable.
- The UI must clearly communicate when no results exist versus when data failed to load.

### 6. `GEP Search` tab
Source:
- `src/course-management/components/SearchTabs/GEPSearch.tsx`

Purpose:
- Find courses that satisfy General Education Program categories.

Top controls:
- `Term` autocomplete
- `GEP Subject` autocomplete
- `Search` button
- `Hide courses with no open sections` checkbox

Loading and feedback:
- Same circular progress treatment as other tabs.
- Empty-state text explains when no matching courses are available and suggests turning off the hide filter.

Results surface:
- Grouped expandable list by course abbreviation/subject area.
- Each group header displays a readable subject name and course count.
- Expanding a group reveals individual course entries.
- Each course entry contains its own section table.

Table behavior within each course:
- Paginated results.
- Expandable lab rows when applicable.
- Same columns and cell renderers as `Course Search`.

How it works:
- Builds a list of eligible courses from static GEP mappings.
- Batch-fetches section data for those courses.
- Optionally filters out courses with zero open sections.

UX characteristics:
- Browse-and-drill-down rather than direct lookup.
- Potentially large information volume.
- Uses progressive disclosure to avoid dumping every course section at once.

Design constraints to preserve:
- Must scale to a large list of qualifying courses.
- Grouping is important for scanability.
- Filtering out empty results is useful but should stay easy to toggle.
- Users must be able to compare within a category without losing overall context.

### 7. `Major Search` tab
Source:
- `src/course-management/components/SearchTabs/PlanSearch.tsx`

Purpose:
- Search open classes by degree-plan requirements instead of directly by course number.

Top controls:
- `Term` autocomplete
- `Major` autocomplete
- `Minor` autocomplete
- `Subplan` autocomplete
- `Search` button
- `Hide courses with no open sections` checkbox

Selection rules:
- Search requires:
  - a term
  - either a minor
  - or a major plus subplan

Results surface:
- MUI `SimpleTreeView`
- Top-level nodes are requirement names.
- Each requirement expands to show matching courses.
- Each course block shows:
  - course title and code
  - a section table, or
  - `No sections available`

Table behavior within each course:
- Same section table structure as the other tabs.
- Same row-expansion behavior for labs.

How it works:
- Reads major/minor/subplan requirement data from local typed datasets.
- Expands requirements into a list of courses.
- Batch-fetches open sections and enrichments.
- Hides empty courses when the checkbox is enabled.

UX characteristics:
- Hierarchical rather than flat.
- Requirement-first mental model.
- Better for exploratory planning than direct enrollment lookup.

Design constraints to preserve:
- Must visually distinguish requirements from actual course options.
- Hierarchy is essential.
- Large requirement trees must remain collapsible and scannable.
- Users need to understand both the academic requirement structure and the concrete sections available right now.

## Shared Results Table Pattern

### 8. Shared section comparison table
Source:
- `src/course-management/components/SearchTabs/CourseSearch.tsx`
- `src/course-management/components/SearchTabs/GEPSearch.tsx`
- `src/course-management/components/SearchTabs/PlanSearch.tsx`
- `src/ui-system/styles/dataTableStyles.ts`

What it is:
- A reusable high-density results table used across all search modes.

Visual behavior:
- Alternating row backgrounds.
- Hover highlight.
- Styled header row with uppercase labels.
- Pagination controls.
- Dark and light variants via CSS variables and `data-pp-mode`.

Interaction behavior:
- Row expansion for lecture/lab relationships.
- Column-specific interaction inside cells.
- Paginated rather than infinite-scroll.

Design constraints to preserve:
- Must support dense data without becoming unreadable.
- Must handle nested/related section structures.
- Must work in both light and dark themes.
- Needs strong affordances for comparison, not just browsing.

## Shared Cell-Level UI Elements

### 9. `Action` cell: `Add to Cart`
Source:
- `src/course-management/components/DataGridCells/ToCartButtonCell.tsx`
- `src/course-management/services/ToCartService.ts`

What it is:
- Small outlined button with cart icon labeled `Add to Cart`.

How it works:
- Builds a MyPack script-content URL from the current page path.
- Sends the add-to-cart request with course identifiers.
- Supports parent/child section relationships for lab attachment.
- Shows a temporary `Popper` with MUI `Alert` after the action.

Feedback states:
- success alert
- error alert
- disabled button if required identifiers are missing

UX characteristics:
- Transactional micro-action embedded directly in the table.
- Immediate lightweight feedback instead of redirecting or opening another dialog.

Design constraints to preserve:
- This action must remain fast and local to the result row.
- Success/failure feedback needs to be visible without disrupting the whole search flow.
- Lab/lecture relationships must be handled correctly.

### 10. `Status` cell
Source:
- `src/course-management/components/DataGridCells/StatusAndSlotsCell.tsx`

What it is:
- A horizontal chip cluster summarizing section availability.

Displayed data:
- availability chip
- enrollment chip
- section identifier chip

Behavior:
- Availability uses semantic chip colors:
  - open = success
  - closed = error
  - waitlist = warning
  - reserved = info
- Enrollment chip color changes based on fill ratio:
  - greener when seats are more available
  - warmer/redder as the section fills up

UX role:
- Gives a quick at-a-glance answer to "Can I realistically take this section?"

Design constraints to preserve:
- Availability must remain highly scannable.
- Enrollment pressure should stay visually encoded.
- Users should not need to open details to know whether a section looks viable.

### 11. `Course Info` cell
Source:
- `src/course-management/components/DataGridCells/CourseInfoCell.tsx`

What it is:
- A compact cell with an info icon and metadata chips.

Visible elements:
- info icon button
- optional component/type chip such as lecture/lab
- optional `Online` chip

Tooltip content:
- section number
- component/type
- time
- location
- embedded mini weekly calendar

Behavior:
- Calendar content is only rendered while the tooltip is open.
- Tooltip is intentionally rich, wide, and visually elevated.

UX role:
- Keeps the table compact while still exposing high-detail section metadata on demand.

Design constraints to preserve:
- Users need quick access to detail without leaving the results grid.
- Compact default state matters because the table is already dense.
- Online/instruction-mode hints are important secondary badges.

### 12. `Time` cell
Source:
- `src/course-management/components/DataGridCells/CourseTimeCell.tsx`

What it is:
- Compact text display of the meeting time.

Behavior:
- Uses truncated caption text.
- Shows full value on hover via the native `title` attribute.
- Falls back to `TBD` when time is missing.

Design constraints to preserve:
- The default presentation should stay compact.
- Missing time data should be clearly labeled rather than blank.

### 13. `Instructor` column
Source:
- search-tab table renderers

What it is:
- Plain text instructor listing.

Behavior:
- Multiple instructors are joined with commas.
- Does not currently open profile details or links.

Design implication:
- Instructor identity matters, but the current design treats it as supporting text rather than a primary interaction surface.

### 14. `Rating` cell
Source:
- `src/course-management/components/DataGridCells/RateMyProfessorCell.tsx`

What it is:
- Read-only star rating display.

Behavior:
- Uses fractional precision.
- Gold filled stars, gray empty stars.
- Falls back to `No rating available`.

UX role:
- Fast quality heuristic.
- Designed for scanability rather than deep inspection.

Design constraints to preserve:
- Instructor-quality signal should remain easy to compare across rows.
- Missing data should be explicit.

### 15. `Grades` cell
Source:
- `src/course-management/components/DataGridCells/GradeDistributionCell.tsx`

What it is:
- Button-triggered grade visualization.

Visible element:
- `View Grades` button, or `No grade info` text when unavailable

Dialog contents:
- title with course name
- instructor subtitle
- grade-distribution pie chart
- textual breakdown of A/B/C/D/F percentages

UX role:
- Offers detail-on-demand for a dataset that is too rich for inline row display.

Design constraints to preserve:
- Grade history should stay accessible but not dominate the table.
- Detailed distribution should be visual, not just numeric.
- Missing grade data should remain obvious.

### 16. `Info` cell
Source:
- `src/course-management/components/DataGridCells/InfoCell.tsx`
- `src/course-management/components/DataGridCells/ClassNotesCell.tsx`
- `src/course-management/components/DataGridCells/PrereqCell.tsx`

What it is:
- A compact cluster of warning/info affordances.

Possible icons:
- notes tooltip icon
- prerequisite/warning tooltip icon

Behavior:
- Hidden entirely if there are no notes and no requisites.
- Tooltips display raw explanatory text.

UX role:
- Keeps exceptional or cautionary content out of the main table until needed.

Design constraints to preserve:
- Requirement warnings and class notes must remain discoverable.
- Rare metadata should not consume permanent row space when absent.

### 17. Mini schedule preview
Source:
- `src/course-management/components/DataGridCells/CalendarView.tsx`

What it is:
- Embedded weekly calendar view shown inside the `Course Info` tooltip.

Behavior:
- Loads cached current schedule data.
- Parses the candidate section time string into a temporary event.
- Existing scheduled events are colored red.
- Candidate event is injected into the calendar.
- Overlapping meeting days/times are marked.

UX role:
- Critical conflict-detection aid.
- Lets users evaluate a section without leaving the search dialog.

Design constraints to preserve:
- Schedule conflict awareness is a core differentiator.
- Overlap visibility must remain immediate and intuitive.
- The preview should not require users to mentally compute conflicts from text alone.

## Planner/Page-Injected Inline UI

### 18. Planner row augmentation
Source:
- `src/course-management/services/scraper.ts`
- `src/utils/dom.ts`

What it is:
- Additional extension content injected directly into MyPack planner/cart rows.

How it appears:
- The scraper waits for planner/cart rows.
- For each relevant row, it creates an extra extension cell.
- It also appends descriptive copy to the row header.

Why it exists:
- This is separate from the main modal dialog.
- It enriches the native planner interface with extra decision-support information exactly where the user is already reviewing sections.

Design constraints to preserve:
- In-context enhancement is important.
- Users benefit from seeing enrichment without reopening the main search dialog.
- The injected UI must survive host DOM churn.

### 19. Inline grade card
Source:
- `src/course-management/services/api/PackPlannerAPI/grade/gradeService.ts`
- `src/degree-planning/components/DegreeAuditCards/GradeCard.tsx`

What it is:
- Standalone card rendered inside a shadow DOM host.

Visible elements:
- title `Historical grade data:`
- pie chart
- class average range text

Behavior:
- Only shown if usable grade data exists.
- Shadow DOM is used to protect styles from host-page conflicts.

UX role:
- In-context detail panel for already-selected/planned courses.

Design constraints to preserve:
- The planner view still needs enriched quality signals.
- Style isolation is important in hostile/legacy page environments.

### 20. Inline professor rating card
Source:
- `src/course-management/services/api/PackPlannerAPI/professor/ratingService.ts`
- `src/degree-planning/components/DegreeAuditCards/ProfRatingCard.tsx`

What it is:
- Standalone card showing a semicircle gauge for professor rating.

Visible elements:
- title `RateMyProfessor Score`
- professor name
- gauge
- numeric score out of 5

Behavior:
- Only shown when professor data exists.
- Rendered into a plain `div` rather than shadow DOM.

UX role:
- Gives a stronger visual emphasis than the small star rating used in the search tables.

Design constraints to preserve:
- The planner page still needs a clear professor-quality signal.
- The inline card should remain compact enough to fit in injected row layouts.

### 21. Host-dialog restyling
Source:
- `src/course-management/services/scraper.ts`

What it is:
- CSS and layout overrides applied to the host MyPack dialog/iframe.

What it changes:
- makes the host dialog wider and taller
- improves scrolling behavior
- gives the extension cell enough room for its cards
- prevents the host dialog button pane from overlapping the injected content

Design implication:
- Any redesign still has to account for the host page's existing modal/container behavior.

## Theme And Visual System

### 22. Theming system
Source:
- `src/ui-system/themes/AppTheme.tsx`
- `src/ui-system/themes/themePrimitives.ts`
- `src/ui-system/themes/customizations/*`

What it is:
- MUI CSS-vars-based theme provider with custom component overrides.

Current theme traits:
- dark mode is the default
- supports light/dark switching
- custom styling exists for:
  - inputs
  - navigation
  - surfaces
  - feedback
  - data display
  - data grid

Visible theme patterns:
- rounded surfaces
- strong border usage
- dark navy/blue emphasis
- elevated cards/dialogs
- dense enterprise-style controls rather than airy consumer app spacing

Design constraints to preserve:
- Must support light and dark modes.
- Contrast and readability matter more than decorative flourish.
- The theme should still feel compatible with a utility/power-user academic workflow.

## State, Persistence, And Interaction Rules

### 23. State persistence expectations
- Search state persists while switching tabs.
- Default term is preselected if available.
- `What's New` and first-start state are persisted with `localStorage`.
- Search results use caching to improve speed and reduce repeated network work.

### 24. Performance expectations
- Large plan/GEP datasets must remain manageable.
- Search progress should be visible.
- The UI depends on caching and batching and should not force unnecessary re-fetches.

### 25. Data and availability expectations
- Open-section availability is core to the UI.
- Professor rating and grade history are enrichments, but important ones.
- Missing data is common enough that the UI must handle it gracefully.

### 26. Error and empty states
- Distinguish:
  - no results
  - missing enrichment data
  - loading
  - fetch failure
- Feedback should usually remain local to the affected surface.

## Inventory Of User-Facing Controls

### Global controls
- `Course Search` launcher button
- dialog close affordance
- theme toggle button
- feedback mailto button

### Onboarding/release controls
- `Close` button in `What's New`
- `Close` button in quick-start dialog
- `Don't show again` checkbox

### Search-form controls
- term autocomplete
- subject/GEP subject autocomplete
- course autocomplete
- major autocomplete
- minor autocomplete
- subplan autocomplete
- `Search` button
- `Hide courses with no open sections` checkbox

### Results controls
- row expand/collapse toggles
- `Add to Cart` action button
- `View Grades` action button
- info tooltip trigger
- notes tooltip trigger
- prerequisite tooltip trigger
- table paginator controls

## Prompt-Ready Design Criteria
Use the list below as requirements for an alternative UI concept.

### Hard constraints
- The UI lives inside an existing MyPack page, not a standalone app.
- The extension currently has no popup/options page; proposals should assume an in-page injected experience unless explicitly changing product architecture.
- The design must support iframe/host-page compatibility.
- The design must preserve the three core workflows:
  - direct course lookup
  - GEP browsing
  - major/minor requirement browsing
- The design must support open-section comparison and add-to-cart actions.
- The design must preserve schedule-conflict awareness.
- The design must support light and dark mode.

### Functional requirements
- Provide a clear entry point from the host page.
- Support quick searching by term, subject, and course.
- Support exploratory browsing of GEP-qualified courses.
- Support hierarchical browsing of degree requirements.
- Show section availability clearly.
- Show professor-quality and grade-history signals.
- Show notes/requisites when relevant.
- Allow lecture/lab relationships to be understood.
- Keep feedback local and immediate for row-level actions like `Add to Cart`.

### UX requirements
- Optimize for high information density without overwhelming the user.
- Reduce cognitive load when comparing sections.
- Preserve user progress when moving between workflows.
- Make empty, loading, and error states distinct.
- Keep advanced details available on demand rather than always expanded.
- Make schedule conflicts easy to recognize visually.

### Visual requirements
- The design should feel like a capable planning utility, not a generic dashboard.
- It should remain legible in constrained host-page contexts.
- Dense tabular or semi-tabular comparison is still needed somewhere in the experience.
- Status and availability should remain color-coded or otherwise quickly scannable.

### Good redesign opportunities
- Simplify the visual heaviness of the current dense tables.
- Improve hierarchy between filters, results, and detail views.
- Make the GEP and Major search flows feel more intentionally designed, not just data dumps behind disclosure patterns.
- Reconsider whether tabs are still the best top-level navigation model.
- Improve discoverability of the schedule preview and info affordances.
- Consider more modern feedback patterns than a tiny popper alert for add-to-cart outcomes.
- Make onboarding and release-note surfaces feel more cohesive with the main planning experience.

## Suggested Prompt Seed
Use this if you want to ask another model for redesign ideas:

`Design alternative UI concepts for the MyPack Plus browser extension. The extension is an in-page injected planning tool on top of a university enrollment site, not a standalone app. It currently has a fixed launcher button, a large modal with Course Search, GEP Search, and Major Search tabs, row-level add-to-cart actions, grade and professor enrichment, schedule-conflict preview, onboarding/release dialogs, and injected planner-row cards. Propose alternatives that preserve dense comparison, workflow speed, schedule awareness, light/dark mode, and host-page compatibility, while improving information hierarchy, scanability, and overall polish.`
