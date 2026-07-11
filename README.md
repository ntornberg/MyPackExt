# MyPack Plus

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)

MyPack Plus is a browser extension for NC State students using MyPack Portal. It brings course search, section comparison, grade history, professor ratings, schedule previews, live availability checks, and cart helpers directly into the registration workflow.

Visit [mypackplus.me](https://mypackplus.me) for the project site.

The extension is independent and is not affiliated with, endorsed by, or sponsored by NC State University.

## Features

- Search by term, subject, course number, GEP requirement, major, minor, plan, and concentration.
- Compare sections with meeting times, locations, instructors, notes, prerequisites, seats, availability, grades, and professor ratings.
- Preview selected sections alongside enrolled and carted classes, including schedule-conflict context.
- Handle linked lectures, labs, and recitations as complete registration combinations.
- Add compatible combinations to the MyPack cart where available.
- Use light and dark mode, local caching, and batched lookups for faster repeat searches.

## How It Works

MyPack Plus runs as a Manifest V3 browser extension.

- A content script adds the planning interface to supported MyPack Portal pages.
- A background service worker handles extension-level requests.
- Local browser storage and IndexedDB cache course and section data for faster repeat sessions.
- Supabase Edge Functions provide consolidated grade and professor data.
- Registrar availability lookups are batched and proxied to reduce repeated manual requests.

## Tech Stack

- React 19, TypeScript, Vite, and Chrome Extension Manifest V3.
- Tailwind CSS v4 and shadcn-style UI primitives.
- MUI X Charts for grade-distribution charts.
- Supabase Edge Functions and Cloudflare/registrar lookup infrastructure.

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

Run the planner staging app:

```bash
npm run dev:planner-staging
```

Run project checks:

```bash
npm run type-check
npm run lint
npm test -- --run
npm run test:smoke
```

Build the extension:

```bash
npm run build:prod
```

The production build outputs extension assets to `dist/` and packages them as `dist.zip`.

## Privacy And Data

MyPack Plus reads supported MyPack Portal pages, requests course and availability data needed for planning features, and stores cached course data locally to improve performance. Students should verify official course availability, enrollment requirements, and registration decisions through NC State's official systems before enrolling.

## Notes

- The main planner UI renders inside a shadow-root overlay so host MyPack styles do not leak into the extension.
- Injected grade/professor cards use their own small stylesheet because they render inside MyPack rows and, in one case, a separate shadow root.
- Some inline styles remain intentionally for dynamic geometry and data-driven color values, such as calendar event placement and fractional star fills.

## Contributing

Issues and pull requests are welcome. Keep changes focused, include a short explanation of their user-facing impact, and run the relevant checks before opening a PR.

## License

MyPack Plus is released under the [MIT License](LICENSE).
