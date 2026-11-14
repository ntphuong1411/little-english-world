# Little English World 2.0 — Stage 1

## Brief
Mobile-first, parent-guided English vocabulary adventure for the family's two-year-old. Code-owned React/TypeScript/Vite PWA; static curriculum and media; LocalStorage only. No backend, database or authentication. No Sites deployment. Initial vertical slice: Spoon, Fork, Bowl.

## Decisions
- 2026-11-14: user approved Stage 1 after repository inspection; repository originally contained only README.
- Keep content separate from gameplay. Stable vocabulary IDs support later content expansion without new game branches.
- Use explicit welcome/explore/choose/celebrate/sticker state transitions. Advancement is tap-driven.
- Assisted means two wrong attempts followed by a guided target tap; store it separately from unassisted completion.
- Size 2/3 supported now; size 5 is not silently clamped in the UI and remains disabled pending content.
- One available group: guided sequence starts there; parent can replay/override size. Multi-group sequencing is not yet implemented.
- Store encounter counts, not a claim of mastery. No cross-session adaptive review yet.
- Static local en-US development voice (Microsoft Zira Desktop); generated image assets need human content review.
- 2026-11-14: user explicitly requested GitHub Pages deployment at `/little-english-world/`. Manual workflow preserves human approval for future publishing.

## Implemented
- Working React shell and responsive styles, Little Bunny and realistic learning images.
- Full first adventure, Vietnamese support, progressive choices and assisted completion.
- Local completion/stickers/preferences; malformed-storage recovery and storage-failure warning.
- Manifest/icons and build-generated scoped precache worker; deployment-path support.

## Prioritized backlog
P0: finish hosted browser QA and mobile QA; verify static audio by listening; verify offline reload and install on target devices.
P0: finish deployment and record actual URL/commit/status, not just a successful push.
P1: review image/audio quality and redistribution rights before broader release; optimize media payload.
P1: add Plate/Pan/Pot with reviewed assets, enable 5-word sessions, implement next-group sequencing and parent lesson selection.
P1: implement curated review of previously encountered words without equating completion with mastery.
P2: Animals content and existing name/sound distinction; accessibility audit and wider device coverage.

## Release gate
- Owner approval of exact revision and publish destination.
- Build, content checks and interaction tests pass.
- Browser/mobile/audio/offline checks documented with real evidence.
- Privacy, child-safety and hosting suitability reviewed for the intended audience before public promotion; a demo deployment is not evidence of that review.
- No hidden analytics, recording, ads or external AI calls. New cost/privacy/scope changes require approval.
