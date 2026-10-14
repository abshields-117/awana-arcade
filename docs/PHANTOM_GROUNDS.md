# Phantom Manor: Moonlit Grounds

A self-contained expansion to the existing adventure, not a replacement. Ten connected areas, six puzzles total. The four new areas are the Moonlit Courtyard, Remembrance Garden (peaceful graveyard), Keeper Cottage, and Starlight Observatory. All outdoor areas are safe: no enemies, timers or jump scares. No lessons or PDFs changed.

## Start / map

From the Foyer, take the south door marked **Moonlit grounds**. Read the folded map in the Courtyard center (walk close, E / Interact). This discovers both a live local inset (gold player dot, furniture and exits) and a foldable connected-area map. Unvisited areas remain `?`; visited areas and their connections appear as you explore. Gold marks your current area. Blue local exits are open; muted red exits need a reward. The Gallery secret connection stays hidden until revealed with the original lantern.

Progress remains session-only, matching the original game. Restart/reload resets map discovery, visits, notes, puzzles and rewards. The manor's six pages are separate from the three outdoor field notes, so optional notes cannot bypass the original ending. All clues can be reread in the Journal; puzzle dialogs also have **Reread the clue**. Wrong answers never take hearts or items. The cottage's reversible switches retain their selection after a wrong check, but reset when leaving the puzzle.

## Spoiler guide

1. **West: Remembrance Garden.** Read the kindness inscription, then use the wreaths. The before/after clue gives **Rose → Daisy → Lily**. Earn an **Oak cottage token**, opening the east cottage.
2. **East: Keeper Cottage.** Read workshop instructions, then use the night-watch lamps. Turn **Owl + Fox ON**, leave **Sun + Moon OFF**, then **Check lights**. Tap again to turn any lamp off. Earn the **Star lens**, opening the south observatory.
3. **South: Starlight Observatory.** Read Ada's star sketch. The sequence is **2, 4, 6**: choose **6** on the constellation dial. Earn the **Trail star**.
4. Return north to the Courtyard and interact with the **Welcome beacon**. The trail lights glow, the beacon lights, five hearts refill, and the map awards the **Trail Keeper badge**. All rooms remain accessible.

The original Library / sky wheel / Clocktower puzzles and Rowan's peaceful ending are unchanged. The ending now offers **Explore the grounds**, retaining all discoveries rather than forcing a restart. Either adventure can be completed first.

## Verification

- Baseline: 25 existing Node tests passed before editing; git bundle backup created outside the repository before changes.
- `node --test tests/*.test.cjs`: regression suite plus four expansion tests (29 total). Initial feature tests were observed failing before implementation; a further regression case checks the opposite completion order. Tests physically walk collision-aware routes rather than teleporting or mutating game state: gates, clues, wrong answers, switch toggling, rewards, full optional/core ending chain, every new object's reachability, reverse doors, map discovery/visited links/reset.
- `tests/grounds-browser-smoke.cjs`: real headless Chromium, actual keyboard and puzzle buttons, mobile touch via CDP touch events, four new areas, map discovery, three puzzle interactions, reward, original ending/continuation, calm and audio pause, 390px no horizontal overflow, and playable fresh-query offline launch after hub service-worker install. Navigation helpers call normal collision-aware engine movement; they do not change state directly. Screenshots are written to `ARTIFACT_DIR` (defaults to the environment scratch directory).
- Existing `tests/browser-smoke.cjs` also exercises the other recently updated games and the original full Manor ending.
- Run a local server with `python -m http.server 8765 --bind 127.0.0.1`, then `NODE_PATH=/path/to/playwright/node_modules node tests/grounds-browser-smoke.cjs`. Set `ARCADE_URL=https://awana-arcade.vercel.app` to run against production.
- Service worker is `awanacade-v8`, with canonical Manor precache and network-first/ignoreSearch fallback preserved. The existing single hub card links to `games/phantom_manor.html?v=8`.

## Honest limitations

Chromium desktop/mobile emulation is not physical Chromebook hardware or a child usability study. Audio scheduling/state was tested, not human listening. The canvas adventure is not a screen-reader-only game; clues, dialogs, buttons and current-area/map descriptions are DOM text. The area map is a schematic (not a scaled estate plan), while the inset follows actual local coordinates. Tiny scene labels are secondary to the larger nearby-object prompt and journal clues. First-time offline use still requires installing/caching from the hub online once. Session-only progress is intentional.
