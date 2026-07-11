# Generated Catalog Data

This folder contains generated/static catalog data used by planner search:

- `course-search/departmentCourses.typed.ts`
- `gep-search/gepCourses.typed.ts`
- `major-plan-search/majorPlans.ts`
- `major-plan-search/minorPlans.ts`
- `subjectSearchValues.ts`
- `termIds.ts`

These files are intentionally separated from feature code because they are large
reference datasets, not hand-authored UI or domain logic.

Regeneration source and commands should be documented here when the catalog
refresh process is automated. Until then, keep edits focused and review changes
as generated-data updates rather than feature refactors.

