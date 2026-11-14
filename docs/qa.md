# Stage 1 QA — 2026-11-14

## Verified locally
- `npm test`: 11 tests passed. Covers answer gating, two-error assistance, progressive choice count, two-word constraint, reward regardless of accuracy, sticker deduplication, duplicate answer suppression and malformed progress recovery.
- `npm run check:content`: 12 vocabulary records; 3 playable words. Static assets referenced by the playable slice exist; WAV headers checked.
- `npm run build`: TypeScript and Vite build succeeded after deployment-base changes. Scoped service worker generated with 25 precached files plus the app base route.
- Generated images inspected: Spoon, Fork, Bowl and Little Bunny.
- `npm run check:build`: GitHub Pages asset paths, relative manifest scope/icons, 26 precache entries and simulated offline navigation/image/audio passed. This is a generated-worker contract check, not a real-browser offline result.

## Not yet verified
- Hosted/browser full lesson flow, mobile layout, keyboard/screen-reader flow.
- Actual audible pronunciation, prompt-target match and target-device media playback.
- Real offline reload, installability and service-worker upgrade across releases.
- Storage-disabled and quota-full browser behavior (defensive handling exists, but not browser-tested).

## Previous browser blocker
Work's browser timed out connecting to Windows localhost. Windows Computer Use then stopped because it could not confidently identify the browser URL. Neither result proves the application is broken. Browser testing stopped; no browser pass was claimed.

## Known limitations
- Only the first 3-word Kitchen group is playable. Size 5, other Kitchen assets and Animals are pending.
- A partially completed session is not restored after reload. Stickers and completed groups are persisted.
- Generated static voice is development audio, pending human listening/rights review.
- Current PNG/WAV assets total several MB; first cache setup requires a good connection and available browser storage.
- Parent arithmetic gate is convenience only, not authentication.
- GitHub Pages deployment status and online QA will be recorded after they are observed.
