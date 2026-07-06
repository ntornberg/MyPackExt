# MyPack Plus

MyPack Plus is a browser extension for NC State students using MyPack Portal. It adds course search, section comparison, grade history, professor ratings, schedule previews, and cart helpers directly inside the registration workflow.

The extension is independent and is not affiliated with, endorsed by, or sponsored by NC State University.

## Features

- Course Search by term, subject, and course.
- GEP Search by requirement category.
- Major and minor requirement search, including subplans where available.
- Section comparison cards with availability, seats, instructor, meeting time, linked labs or recitations, grades, and professor ratings.
- Schedule preview with enrolled/cart blocks, selected-section blocks, and conflict markers.
- Add-to-cart helpers for compatible lecture/lab combinations.
- Light and dark mode support.
- Local caching and batched lookups for faster repeat searches.

## Tech Stack

- React 19, TypeScript, Vite, Manifest V3.
- Tailwind CSS v4 and shadcn-style UI primitives.
- MUI X Charts for chart rendering.
- Supabase-backed grade/professor data.
- Cloudflare/registrar lookup infrastructure.

## Project Layout

- `src/extension` contains the content script and background service worker.
- `src/ui-system/components` contains shared planner UI, workbench components, and reusable controls.
- `src/course-management` contains section search, registrar data, cart actions, and result rendering.
- `src/degree-planning` contains plan/GEP data and injected grade/professor cards.
- `src/staging` contains the planner staging app used for visual and interaction checks outside MyPack.

## Development

Install dependencies:

```bash
npm install
```

Run the Vite dev server:

```bash
npm run dev
```

Run the staging planner:

```bash
npm run dev:planner-staging
```

Build the extension:

```bash
npm run build
```

Run tests:

```bash
npm exec vitest
```

## Notes

- The main planner UI renders inside a shadow-root overlay so host MyPack styles do not leak into the extension.
- Injected grade/professor cards use their own small stylesheet because they render inside MyPack rows and, in one case, a separate shadow root.
- Some inline styles remain intentionally for dynamic geometry and data-driven color values, such as calendar event placement and fractional star fills.
