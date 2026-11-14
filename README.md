# little-english-world

Standalone React + TypeScript + Vite vocabulary PWA. Stage 1 implements one guided Kitchen adventure (Spoon, Fork, Bowl). The previous Sites prototype is not this production codebase.

## Local development

Use Node.js 22.12+ (Node 22 LTS recommended).

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/little-english-world/`. For production preview, run `npm run build` then `npm run preview` and open `http://127.0.0.1:4173/little-english-world/`.

```sh
npm test
npm run check:content
npm run build
```

## Deployment

Target: https://ntphuong1411.github.io/little-english-world/

The `Deploy approved demo to GitHub Pages` workflow is **manual only**. Select GitHub Actions as the repository's Pages source, approve the revision, then dispatch the workflow from Actions. A normal push does not publish. No credentials belong in this repository. The workflow validates, builds and uploads `dist`, then deploys it through GitHub Pages.

The default deployment base is `/little-english-world/`. To host at a different path, set `BASE_PATH` to a leading/trailing-slash path for both Vite and the build scripts. Curriculum asset paths remain host-independent.

## Stage 1 behavior

- Home → Welcome → explore one word at a time → Listen & Choose → Celebrate → Sticker.
- Two choices initially; three after an unassisted round when three words are available.
- After two incorrect attempts, the target is highlighted and other choices are disabled. The child still taps the target and taps Continue.
- A completed adventure earns Little Chef regardless of accuracy; replays do not duplicate the sticker.
- Parent Corner: simple arithmetic gate, size 2/3 (default 3), replay override and local summary. Size 5 is visibly unavailable until enough reviewed content exists.
- English first; Vietnamese is revealed on demand. No timer, ads, leaderboard, recording, account or analytics.

Progress is saved under `little-english-world:v1` in browser LocalStorage. Stored fields are lesson size, completed group IDs, sticker IDs and per-word independent/assisted encounter counts. No names, dates of birth or voice recordings. Reload keeps completed progress, but an unfinished session restarts. Browser data clearing/private mode can remove progress; different origins/devices do not share it. The Parent Corner gate prevents accidental access, not a security boundary.

PWA caching is enabled only in production, on HTTPS or localhost. The complete current lesson is precached. First use needs connectivity and successful cache installation. Updates wait until previous app tabs close. Offline behavior and installation need real-browser/device QA before release acceptance. GitHub Pages uses a shared origin: local progress must not be treated as confidential storage, and hosting-level request logging is outside this application's control.

## Content and assets

- `src/data/curriculum.json`: 12 vocabulary records; only Spoon/Fork/Bowl are playable. Remaining Kitchen words and Animals are explicitly planned, not completed.
- `src/lesson.ts`: grouping, quiz rules, transitions and progress normalization.
- `src/assets.ts`, `src/audio.ts`: deployment paths and a single static-audio player.
- `public/images`: generated learning images and Bunny; provenance in `docs/assets.md`.
- `public/audio`: 14 pre-generated en-US development WAV clips. No runtime speech service. Human listening and redistribution-rights review remain open.

See `docs/project.md` for the brief/decisions/backlog and `docs/qa.md` for evidence and release limitations.
