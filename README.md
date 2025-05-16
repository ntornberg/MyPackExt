# MyPack Course Picker Extension

**MyPack Course Picker** is a browser extension that enhances the course selection experience for NCSU students. It integrates historical grade data and RateMyProfessor ratings directly into the MyPack Portal, making it easier to choose courses and instructors.

---

## Features

- **Integrated Course Data:** View historical grade distributions and professor ratings alongside course listings.
- **Modern UI:** Uses React, TypeScript, and Vite for a fast, maintainable, and extensible codebase.
- **Smart Caching:** Caches API results for fast, efficient lookups.
- **Customizable Drawer:** Slide-out panel for filtering and searching courses.

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd MyPackExt
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Run in development mode:**
   ```sh
   npm run dev
   ```
   This starts Vite's dev server. For extension development, you may need to build and load the extension in your browser.
4. **Build for production:**
   ```sh
   npm run build
   ```
   The output will be in the `dist/` directory.

---

## Loading the Extension

1. Build the project (`npm run build`).
2. Open your browser's extensions page (e.g., `chrome://extensions`).
3. Enable "Developer mode".
4. Click "Load unpacked" and select the `dist/` directory.

---

## Project Structure

- `src/` – Main source code (React components, hooks, services, types, utils)
- `public/` – Static assets and manifest
- `dist/` – Build output (after running `npm run build`)
- `package.json` – Project metadata and scripts

---

## Development Notes

- Uses Vite for fast builds and HMR.
- ESLint and TypeScript for code quality.
- Main entry: `src/popup.tsx` (popup UI), `src/content.tsx` (content script).
- API and caching logic in `src/services/` and `src/cache/`.

---

## License

MIT (or specify your license)
