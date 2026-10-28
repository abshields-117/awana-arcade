# The Enchanted Library — physical escape-room presenter

Open `enchanted-library.html`. This is a silent story/rules/ambient screen for existing printed puzzles, **not a digital puzzle game**. No answer entry, embedded answer key, invented final code, station order, timer, score, or puzzle solution is included.

## Run the room

1. Open Story (the default). Read the complete approved story in one broad panel. Scroll naturally; there are no story-page clicks. Desktop type is at least 26px, mobile 24px.
2. Select How to Play. Children solve the puzzle at the top of each physical page, use their answers to read the matching bottom clue, and record the revealed digit **only on the answer sheet**. They bring their final four-digit code to the leader.
3. Select Hide Story for the animated library. Show Story returns to the remembered story scroll position. How to Play and Story also leave ambient mode directly.
4. Pause Scenery freezes the illustration. OS reduced-motion preference freezes it automatically and disables the resume control until that preference changes.
5. Fullscreen Library hides the reading panel and enters fullscreen in one gesture. Exit Fullscreen leaves the library visible; Show Story restores reading. If fullscreen is denied, the library view still works and a visible status explains the fallback. The persistent Awanacade link returns to sibling `index.html`.

Keys: H = hide/show, P = pause/resume, F = fullscreen. All controls are semantic buttons/links with visible keyboard focus and touch-size targets. On small screens the reading panel scrolls vertically; the menu/control bar remains available. No audio, strobe, jump scare, literal locked-door instruction, or game deadline. The backwards clock is scenery, not a countdown. Leader safety cue explicitly says this is pretend and everyone is safe.

## Sources and artwork

Story reproduced from user-supplied text, with the three-dot ellipsis tidied to a typographic ellipsis. The supplied image confirms the puzzle-top/clue-bottom and answer-sheet-only directions; its attribution appears to read **Your Mystical Resources**. The image, sample puzzle illustration, and its example answers are not published or reproduced. All scenery is original procedural canvas art: individually bound books, tall moonlit windows, dust, hovering volumes, a golden turning-page book, candles, backward clock, writing quill, scroll and desk.

## Offline / integration boundary

The HTML contains all CSS, JavaScript and artwork and works from a local file with networking disabled. It does not use storage, external fonts, images, libraries or network calls. A managed Chromebook may require the hub's installed PWA instead of file launch.

Integrated into **Physical Games**, outside the playable arcade count, with one `enchanted-library.html?v=16` launch card. The canonical HTML is precached in **awanacade-v16**. A copied HTML file alone cannot supply the separate Awanacade menu destination. The browser suite also verifies a never-before-visited version-query launch offline after installing from the hosted hub.

## Verification

- `node --test tests/enchanted-library.test.cjs`
- With Playwright installed: `node tests/enchanted-library-browser.cjs` (or provide its installation via `NODE_PATH`).
- Optional `EVIDENCE_DIR` selects screenshot output; default is the active profile scratch evidence folder, not the repository.

Chromium checks: exact full supplied story simultaneously in the DOM, no pager, broad desktop panel, readable mobile typography, story scroll restoration after hide/show and fullscreen, rejected fullscreen fallback, rules separate, menu retained, offline file launch without requests/errors, installed-hub never-visited-query offline launch, touch controls and 1366×768 / 390×844 / 320×568 layouts. Independent canvas regions verify clock, suspended candles, quill, bound books and golden-book motion; pause and OS reduced motion require exact pixel equality.

Motion: four suspended candles bob with warm flame/glow movement; clock hands turn counterclockwise at independent visible speeds; quill follows four accumulating ink lines and the ink fades/reset each cycle; three bound books bob/rotate/flutter and the golden book turns pages. Everything remains silent. Visual review caught the golden book obscuring the quill; its placement was moved below the desk. Reviewed desktop reading/ambient and mobile screenshots. Tested in Chromium, not physical Chromebook hardware.

Design audit: Learn surface, left-aligned editorial reading panel, warm parchment/gold on dark blue-green scenery. No feature-tile grid, tech gradients, icon toppers, fake stats or center-stacked marketing layout. Georgia story typography and Arial controls are local system fonts.
