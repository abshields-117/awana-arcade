# The Enchanted Library — physical escape-room presenter

Open `enchanted-library.html`. This is a silent story/rules/ambient screen for existing printed puzzles, **not a digital puzzle game**. No answer entry, embedded answer key, invented final code, station order, timer, score, or puzzle solution is included.

## Run the room

1. Open Story (the default). Read the six manually advanced passages; Previous/Next or arrow keys move through the entire supplied story.
2. Select How to Play. Children solve the puzzle at the top of each physical page, use their answers to read the matching bottom clue, and record the revealed digit **only on the answer sheet**. They bring their final four-digit code to the leader.
3. Select Hide Text for the animated library. Show Story returns to the remembered story page. How to Play and Story also leave ambient mode directly.
4. Pause Scenery freezes the illustration. OS reduced-motion preference freezes it automatically and disables the resume control until that preference changes.
5. Fullscreen toggles browser fullscreen when supported. The persistent Awanacade link returns to sibling `index.html`.

Keys: Left/Right = story pages, H = hide/show, P = pause/resume, F = fullscreen. All controls are semantic buttons/links with visible keyboard focus and touch-size targets. On small screens the reading panel scrolls vertically; the menu/control bar remains available. No audio, strobe, jump scare, literal locked-door instruction, or game deadline. The backwards clock is scenery, not a countdown. Leader safety cue explicitly says this is pretend and everyone is safe.

## Sources and artwork

Story reproduced from user-supplied text, with the three-dot ellipsis tidied to a typographic ellipsis. The supplied image confirms the puzzle-top/clue-bottom and answer-sheet-only directions; its attribution appears to read **Your Mystical Resources**. The image, sample puzzle illustration, and its example answers are not published or reproduced. All scenery is original procedural canvas art: individually bound books, tall moonlit windows, dust, hovering volumes, a golden turning-page book, candles, backward clock, writing quill, scroll and desk.

## Offline / integration boundary

The HTML contains all CSS, JavaScript and artwork and works from a local file with networking disabled. It does not use storage, external fonts, images, libraries or network calls. A managed Chromebook may require the hub's installed PWA instead of file launch.

This feature branch intentionally does **not** edit `index.html` or `sw.js`. Parent integration must add a link in **Physical Games**, outside the playable arcade count; add the canonical HTML path to the offline precache and bump the SW version. Verify a never-before-visited version-query launch offline after integration. Until then, hosted/PWA offline caching is not claimed. A copied HTML file alone cannot supply the separate Awanacade menu destination.

## Verification

- `node --test tests/enchanted-library.test.cjs`
- With Playwright installed: `node tests/enchanted-library-browser.cjs` (or provide its installation via `NODE_PATH`).
- Optional `EVIDENCE_DIR` selects screenshot output; default is the active profile scratch evidence folder, not the repository.

Chromium checks: exact full supplied story across all six pages; previous/next and last-page bounds; desktop story and rules fitting at 1366×768; story/rules/ambient toggles; menu retained in ambient mode; pixel changes while animated; exact pixel equality while paused and under reduced motion; real fullscreen entry/exit; offline file launch with no external requests or page errors; mobile no-horizontal-overflow at 390×844 and 320×568; actual touch-emulated hide/show.

Screenshots captured and visually inspected for desktop story, rules, ambient and mobile rules. The original desktop rules panel extended past the viewport; spacing and rule type scale were adjusted and the explicit fit assertion now passes. Mobile uses intentional vertical scrolling, not squeezed text. Tested in automated Chromium, not physical Chromebook hardware.

Design audit: Learn surface, left-aligned editorial reading panel, warm parchment/gold on dark blue-green scenery. No feature-tile grid, tech gradients, icon toppers, fake stats or center-stacked marketing layout. Georgia story typography and Arial controls are local system fonts.
