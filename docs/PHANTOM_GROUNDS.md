# Phantom Manor: Moonlit Grounds + Whispering Roots

A self-contained expansion of **The Lantern Keeper**, not a replacement: **15 connected areas, 10 clue puzzles, three independent finales**. Moonlit Grounds' courtyard, cemetery, keeper cottage, observatory, puzzles and Trail Keeper badge remain intact. Whispering Roots extends that same cemetery and the Conservatory rather than duplicating them; it adds Whispering Woods, Owl Hollow, Old Greenhouse, Root Cellar and Moonwell Cistern. All new areas are safe: no enemies, time limits, gore or jump scares. No lesson materials or memory verses changed.

## Access and navigation

- **Map:** Foyer south → Moonlit Courtyard; read the folded map at its center. The inset tracks your position, obstacles and doors. The estate schematic names visited zones, shows discovered connections and highlights your current area. **Enlarge explorer map** opens a readable atlas with a text list of this area's north/south/east/west exits and any required keys. The original hidden Gallery connection stays hidden until lantern-revealed.
- **Cemetery and woods:** Courtyard west → Remembrance Garden. Its original wreath puzzle remains; the new gold inscription and silver watering can are along the southern edge. The west gate leads to Whispering Woods, north to the optional Owl Hollow, and south to the Old Greenhouse.
- **Garden extension:** The existing Conservatory has a south door to the Old Greenhouse. You can also enter from the woods; returning through the Conservatory still requires the original brass key, so the original key gate is not bypassed.
- **Basement:** Foyer north → Root Cellar. The east cistern door requires the greenhouse's glass raindrop. Every route has a usable return door.
- All three adventures can be completed in either order without resetting. After Rowan's original ending, choose **Explore the grounds**. Neither outdoor finale stops exploration.

## Leader spoilers: Whispering Roots

Read each nearby gold clue before attempting its puzzle. Journal entries and **Reread the clue** retain the full clues.

1. **Cemetery / moon gardener:** Oak works mornings; Ash never works after sunset. Eliminate them and choose **Willow**. Reward: **Moon medallion**. This does not open a grave.
2. **Woods / listening waystones:** Read the before/after signs and choose **Moth → Fox → Owl**. Reward: **Wind chime**, which opens Owl Hollow to the north. Read Ada's picnic sketch and rest at the owl lookout for the optional discovery.
3. **Old Greenhouse / five-cup tank:** Reach exactly five using a three-cup scoop and one-cup drain: **+3, +3, -1, Check level**. The tank holds eight cups. Negative/overflow moves are refused without losing water. **Empty** and leaving/reopening the puzzle both reset the tank. Reward: **Glass raindrop**.
4. **Root Cellar / water-routing valves:** Turn **Spring + Garden ON**, leave **Drain + Steam OFF**, then **Check valves**. Tap any switch again to change it. Reward: **Pump seal**.
5. **Cistern / root heart:** Bring all four rewards and interact with **Heart of the roots**. Missing items are named rather than locking the player in. Earn **Roots Guardian**, refill five hearts, illuminate the moonwell and bloom pale flowers across the gardens. Every path remains open.

## Leader spoilers: original Moonlit Grounds (preserved)

1. Courtyard west → Remembrance Garden: kindness inscription → **Rose → Daisy → Lily** wreaths. **Oak cottage token** opens the cottage east of the Courtyard.
2. Keeper Cottage: workshop note → **Owl + Fox ON**, **Sun + Moon OFF**, then **Check lights**. **Star lens** opens the observatory south of the Courtyard.
3. Observatory: star sketch → **6** (2, 4, 6). Receive the **Trail star**.
4. Courtyard **Welcome beacon** → **Trail Keeper** badge and five hearts restored.

The original story still requires all six manor pages, portrait, music box and ribbon. Its book/sky/bell solutions remain Seed–Tree–Stars, Rain–Sun–Moon, 6–12–9. Tell Rowan the family is **together at the river cottage**. The eight optional field notes are separate from the six core pages and cannot replace them.

## Presentation and controls

Procedural, asset-free art adds layered tree canopies, lichen and ironwork, glasshouse roofs/vines, cellar plumbing/vaults, a star-reflecting moonwell, leaves, fireflies, candle breathing, soft shadows and faint slowly fading paper-ghost decorations. Foreground prompts and gold clue pages stay legible. All decorative motion uses the existing simulation clock: pause, blur and reading dialogs freeze it. Full motion is the default. OS reduced-motion freezes/hides decorative effects, not player controls; there is no visible scenery selector and no saved scenery preference is read. Music defaults on after **Enter the manor** (a browser gesture); **M / Sound** mutes both channels for the rest of this session until explicitly unmuted. Indoor rooms use the original minor music-box phrase; outdoor/glass gardens use a distinct slower pentatonic Moonlit Trail score. One bounded scheduler switches groups without stacking music voices. Pause, hidden tabs, reading and endings suspend audio; closing/resuming through controls restores it unless muted. Existing independent Music/Effects levels remain available. No new timers, animation chains, remote assets or tracking.

Progress is **session-only**. Reload/restart clears map discovery, visits, puzzles, notes and badges. Wrong puzzle answers never take hearts or rewards; all selections can be corrected. Clues, puzzle controls and atlas exit descriptions are DOM text, but canvas exploration is not a screen-reader-only game.

## Verification and reproduction

- Clean starting main: `47bde947722ad3fe3b8c3ff57997205424a6962e`; fetched remote branches and confirmed the Phantom Manor feature branch was already ancestral. Backup outside the repository: `cache/scratch/awana-before-deepwoods.tar` under the active Hermes profile. Baseline: **38 passing Node tests**.
- `node --test tests/*.test.cjs`: **47 tests**. New feature tests were observed failing before implementation. Coverage includes clue gates, wrong-answer recovery, water bounds, reward requirements, original/legacy/new finales in both completion orders, every area's objects and every non-hidden forward/reverse door via collision-aware movement, discovered-map positions/reset, map lines avoiding unrelated markers, expanded atlas pause, OS reduced-motion initialization without a selector and release preservation of all 16 hub games. Original hidden-passage tests remain.
- `tests/deepwoods-browser-smoke.cjs`: real headless Chromium; **the complete new route uses actual keyboard movement and E**, not engine movement/state teleportation. A read-only collision planner produces safe waypoints; genuine key holds walk between them. Puzzle answers use actual buttons. Checks include wrong answers, four rewards/finale, optional hollow, reverse doors, journal and expanded atlas, actual CDP touch movement at 390px, no horizontal overflow, audio pause, full-motion/resume frames, absent scenery selector, pixel-identical pause/OS-reduced-motion frames, and a fresh never-visited query offline launch with a playable basement puzzle.
- `tests/grounds-browser-smoke.cjs`: preserved Moonlit Grounds route, actual puzzle buttons and original ending/continuation, map, audio, mobile and offline checks. Its navigation uses normal collision-aware engine movement (not state injection), unlike the fully input-driven new route.
- `tests/browser-smoke.cjs` and `tests/hallows-browser-smoke.cjs`: existing original-Manor/other-game and Path of Hallows browser regressions. Hallows game bytes and its `?v=9` launch link are untouched; its test now accepts a global service-worker version at least 9 rather than requiring the obsolete exact global cache version.
- Service worker **awanacade-v11**, existing single Manor card **games/phantom_manor.html?v=11**. Canonical precache and network-first/ignoreSearch offline fallback preserved. GitHub Actions runs Node tests, the existing Hallows browser smoke and the new keyboard-driven Manor smoke, uploading screenshots for each.

Run with an HTTP server (`python -m http.server 8765 --bind 127.0.0.1`) and Playwright installed outside game files:

```sh
NODE_PATH=/path/to/playwright/node_modules ARTIFACT_DIR=/path/to/evidence node tests/deepwoods-browser-smoke.cjs
```

Set `ARCADE_URL=https://awana-arcade.vercel.app` to repeat against the deployed site. Evidence defaults to the environment scratch directory; `result.json` records checks and keyboard-leg count, and screenshots include cemetery, woods, hollow, greenhouse/tank, basement/valves, cistern, finale, enlarged atlas and mobile.

## Atmosphere refresh

- **Pip** (Foyer lantern moth), **Moss** (Courtyard groundskeeper), and **Luma** (Woods sheet ghost) offer short, changing hints through **E / Interact**. Optional only: no reward gates or added collision boxes. Reading freezes movement, threats and scenery.
- Original roaming ghosts are now white flowing sheets with shaded folds, expressive faces, scalloped animated hems and gradual fades. They signal `?` for **1.2 seconds**, pursue for at most **3 seconds** at **24 px/s** (explorer: 82; quiet: 43), remain within **64 pixels** of home, and drift home when you leave, reach a clue/door safe bubble, or cast the lantern. Sheet contact never takes hearts; original bats retain their gentle, mercy-protected startles. No new outdoor enemies.
- Outdoor/glass garden fireflies glow, drift and fade; indoor candles have small flickering flames; wall spiders crawl cosmetically without damage. OS reduced motion and all pause/dialogue clocks are retained.
- Canvas labels have dark backplates and a 9px logical minimum; DOM objectives/prompts are larger. The inset has a clearer heading; the sidebar adds readable directional exits and the wider atlas uses larger names. All required clues remain DOM text.
- Refresh verification: **53 Node tests** passed, including test-first audio/NPC/chase coverage and a pending-resume/manual-mute race regression. All five existing browser scripts passed. Expanded keyboard smoke covers all three NPCs, changing hints, default/transition/mute/dialogue audio state, candle/spider/outdoor pixel changes, pause/reduced-motion pixel equality, mobile atlas bounds and fresh-query offline play. No human audio listening or physical Chromebook testing is claimed.
- Before editing, main was fast-forwarded to `90282e4` to preserve SUPER TETRA 16. Backup: active profile `cache/scratch/manor-pre-atmosphere-current.tar`. Both Manor hub links use `?v=14`; this refresh initially bumps the shared cache to v14 (later unrelated additions may advance it).

## Limitations

Headless Chromium desktop/mobile emulation is not physical Chromebook performance testing or a child usability study. Audio scheduling/state was tested, not human listening. Small pixel-art labels are secondary to the larger nearby-object prompt, journal and enlarged atlas. The atlas is schematic, not a scaled estate plan; crossing lines do not mean additional doors. Offline use requires one successful online hub install/precache. The four new puzzles intentionally have no time pressure or penalties. Saves do not persist between reloads.
