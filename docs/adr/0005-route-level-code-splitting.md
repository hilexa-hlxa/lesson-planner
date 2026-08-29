# ADR-0005: Route-level code splitting, with the landing page as the one exception

**Status:** Accepted
**Date:** 2026-08-19

## Decision

Every route in `src/App.jsx` is `lazy(() => import(...))` — its own chunk, fetched only when someone navigates there — **except** `LandingPage`, which stays a plain top-level `import`.

## Why split at all

Before this, all ~30 routes — every teacher tool, every mini-game, every admin page — shipped in one bundle: 877 KB (249 KB gzip). A guest looking at the marketing page on `/` downloaded the code for Math Battle, the DOCX exporter, the class roster manager, and everything else they'd never touch on that visit.

## Why `LandingPage` is the exception

`/` is the first screen for almost everyone who isn't already a logged-in teacher going straight to a bookmarked route. Splitting it into its own chunk would trade one problem for a smaller one: instead of downloading unrelated code, that same first-time visitor would pay an extra network round-trip (HTML → main bundle → discover the dynamic `import()` → fetch the `LandingPage` chunk → render) before seeing anything. For the single most common page load in the app, that round-trip costs more than the KB it would save.

Every other route doesn't have this problem — by definition, someone is only ever on `/dashboard` or `/wordle` because they navigated there, so the extra round-trip that route's own `lazy()` import costs is unavoidable *and* well-timed (it overlaps with the click, not with first paint).

## Trade-off

A logged-in teacher who bookmarks `/dashboard` and never sees `/` still downloads `LandingPage`'s code as part of the shared main chunk — mockup previews, pricing copy, FAQ, all of it, unused. That's the cost of avoiding the round-trip for the guest case.

## When to revisit

If the main chunk grows enough that this trade starts costing logged-in users more than it saves guests (or if analytics ever show most sessions start on an authenticated route rather than `/`), split `LandingPage` too and eat the round-trip — or add a `<link rel="modulepreload">` for it in `index.html` so the chunk fetch starts before React even discovers the lazy import, keeping the split without the full round-trip cost.
