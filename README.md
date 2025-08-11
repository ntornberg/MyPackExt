# MyPack Plus (Course Picker Extension)

MyPack Plus is a browser extension that makes course selection on the MyPack Portal less painful. It overlays historical grade distributions and RateMyProfessors info right where you’re making choices, and also pulls in live section availability.

## Features
- Grade and professor overlays directly in the MyPack Portal UI
- A dialog that lets you search by course, GEP plans, and major/minor plans (with concentrations)
- Live availability checks to the registrar
- Fast, $0-to-host backend: Supabase Edge Functions for consolidated grade/professor data
- Performance-focused: batch retrievals, layered caching (Chrome storage + IndexedDB), and parallel subject lookups

## Try it
- Site: `mypackplus.me`
- Not affiliated with NC State

## How it works (short version)
- Content script injects the UI and overlays into the existing MyPack pages
- Background service worker proxies requests from the page when needed
- Supabase Edge Functions serve consolidated grade and professor data
- Registrar lookups are proxied and batched; caching keeps things quick and cheap

## Tech stack
- React, TypeScript, MUI, Vite
- Supabase Edge Functions
- Cloudflare Workers (registrar lookups)

## Notes to developers
This grew fast with one developer on a short timeline, so there are rough edges. I’ve cleaned up a lot but there’s still work to do.

### Dead code
There are some unused `.ts`/`.tsx` files hanging around from earlier iterations.

### Scattered CSS injections
Early on I had to override some MyPack table styles, so there’s CSS being injected in a few places. Needs consolidation.

### Too many data types
Data formats evolved as I pulled from different sources. It needs a proper abstracton.

### Heavy UI lists (GEP + Plans)
Those views display a lot of data. I ended up with a tree-based UI to keep things usable, but there’s likely leftover code from prior attempts.

### File names and organization
It’s not as organized as it should be. Some files are misnamed (e.g., an `index.ts` that only holds types). Reorganization is on the list.

## What’s next
- Refactors for readability and better modularty
- Smarter caching and invalidation rules
- Automated testing: API contract checks + UI smoke tests so things keep working if MyPack changes its UI

Contributions and PRs are welcome.
