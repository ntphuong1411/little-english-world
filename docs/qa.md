# Stage 1 QA — 2026-11-14

## Verified locally
- `npm test`: 12 tests passed after browser-QA fixes. Covers answer gating, two-error assistance, progressive choice count, stable feedback layout, two-word constraint, reward regardless of accuracy, sticker deduplication, duplicate answer suppression and malformed progress recovery.
- `npm run check:content`: 12 vocabulary records; 3 playable words. Static assets referenced by the playable slice exist; WAV headers checked.
- `npm run build`: TypeScript and Vite build succeeded after deployment-base changes. Scoped service worker generated with 25 precached files plus the app base route.
- Generated images inspected: Spoon, Fork, Bowl and Little Bunny.
- `npm run check:build`: GitHub Pages asset paths, relative manifest scope/icons, 26 precache entries and simulated offline navigation/image/audio passed. This is a generated-worker contract check, not a real-browser offline result.

## Hosted browser QA — first deployment a57e512
- GitHub Actions run 43551586946: build and deployment succeeded.
- Opened the HTTPS GitHub Pages URL in Work's browser; Home, pictures and lesson loaded.
- At 390 × 844: completed Welcome → Spoon/Fork/Bowl → quiz → Celebrate → Little Chef sticker.
- Vietnamese support revealed Cái thìa on demand and reset on the next word.
- Quiz: correct Spoon; two wrong Bowl selections on the Fork question triggered guided highlighting and disabled distractors; tapped Fork to continue; completed Bowl.
- Reload preserved 1 sticker and changed Home to Explore again. Parent Corner showed 1 completed group, Spoon 1 unassisted, Fork 1 guided, Bowl 1 unassisted.
- Home DOM measurement at 390px: document width 375px, no broken loaded images. Screenshot inspections covered Home, Welcome, Spoon, three-choice quiz and Sticker.
- Footer reported Ready for offline adventures (worker activation). This does not establish actual offline reload.
- Found and corrected before final deployment: icon-only mobile navigation lacked accessible names; correct feedback immediately expanded choices before Continue. Added explicit labels and a regression test to keep choices stable until the next round.

## Not yet verified
- Full keyboard/screen-reader flow and real-device layout/install behavior.
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

## Final deployment
- Commit `25ede2e5ef3ea6853877224eb8c4fb68303ac01b`; GitHub Actions run `43552051984`: completed successfully (2026-11-14).
- URL: https://ntphuong1411.github.io/little-english-world/
- Direct HTTPS response: HTTP 200. Published HTML references `index-DBywRzXK.js`; published service worker available under the application base.
- Both correction tests and all build/content/path checks passed before publishing; GitHub's build job also passed.
- Existing Work browser session continued showing the previous cached module (`index-Cnqi4qrk.js`) during update checks. Do not claim the two final corrections were browser-verified on the fresh revision. PWA update UX needs follow-up; server publication is independently verified.
- No actual offline-network cut or audible listening test was performed. Those remain open.
