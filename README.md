# MyPack Plus

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)

MyPack Plus is a browser extension that brings faster course search, section comparison, schedule preview, grade context, professor ratings, and live availability checks into NC State's MyPack Portal.

Visit [mypackplus.me](https://mypackplus.me) for the project site.

## What It Does

MyPack Plus helps students compare registration options without jumping between MyPack, planner notes, grade data, and professor-rating pages.

- Search by subject, course number, GEP requirement, major, minor, plan, and concentration.
- Compare sections with meeting times, locations, instructors, notes, prerequisites, seats, and status.
- Preview sections against enrolled and carted classes before adding them.
- Review historical grade distributions and professor-rating context in the planning flow.
- Handle linked labs and recitations alongside their lectures.
- Use caching and batched lookups to keep repeat searches fast.

## Core Features

### Course Search

Find classes by course, GEP requirement, major, minor, or degree plan. Results are organized for registration decisions, with the details students need close to the section they are reviewing.

### Section Comparison

Section cards surface availability, instructor, schedule, location, linked components, grade context, professor information, notes, prerequisites, and cart actions where available.

### Schedule Preview

Preview selected sections alongside enrolled and carted classes. MyPack Plus highlights schedule fit and helps catch conflicts before students commit time to manual cart work.

### Live Availability

Availability checks pull current section status so students can see open, closed, waitlist, reserved, and capacity information before digging through MyPack manually.

### Linked Components

Lectures, labs, and recitations are grouped together when a course requires linked sections, making it easier to choose a complete class combination.

## How It Works

MyPack Plus runs as a Manifest V3 browser extension.

- A content script adds the planning interface to supported MyPack Portal pages.
- A background service worker handles extension-level requests.
- Local browser storage and IndexedDB cache course and section data for faster repeat sessions.
- Supabase Edge Functions provide consolidated grade and professor data.
- Registrar availability lookups are batched and proxied to reduce repeated manual requests.

## Tech Stack

- React 19
- TypeScript
- Vite
- Material UI
- Chrome Extension Manifest V3
- Supabase Edge Functions
- Cloudflare Workers

## Local Development

```bash
npm install
npm run dev
```

For a production extension build:

```bash
npm run build:prod
```

The production build outputs extension assets to `dist/` and packages them as `dist.zip`.

Useful project checks:

```bash
npm run type-check
npm run lint
npm run build
```

## Privacy And Data

MyPack Plus is designed to support course planning inside the browser. It reads supported MyPack Portal pages, requests course and availability data needed for planning features, and stores cached course data locally to improve performance.

Students should verify official course availability, enrollment requirements, and registration decisions through NC State's official systems before enrolling.

## Disclaimer

MyPack Plus is an independent project and is not affiliated with, endorsed by, or sponsored by NC State University.

## Contributing

Issues and pull requests are welcome. Please keep changes focused, include a short explanation of the user-facing impact, and run the relevant checks before opening a PR.

## License

MyPack Plus is released under the [MIT License](LICENSE).
