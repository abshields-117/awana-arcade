# Path of Hallows

A standalone, fictional single-player side-scroller based on a young creator's graveyard adventure design. The original photo is **not** included. No chapter two or note signature has been invented.

## Play

`games/path_of_hallows.html?v=9` (also runs as a local HTML file).

- A/D or left/right arrows: run.
- W, up arrow or Space: jump (release before the next jump).
- J/X or Sword touch button: swing; hold to repeat.
- P/Escape: pause; M: toggle opt-in synthesized sound.
- Visible touch movement/jump/sword buttons, reduced motion, arcade menu.
- Steven: 5% critical chance (others 3%). Dave: one-hit regular skeleton defeats, including sturdy skeletons. Rachel: 5% faster. Bob: surviving skeletons stunned for two seconds.
- Light skeletons take one normal hit; purple-crowned sturdy ones take two. Critical hits defeat either. Face an enemy to hit it; don't simply run past it.
- Candy corn is score, not currency. Five hearts, 1.8 seconds of mercy after damage, one-heart recovery when each wave clears.
- Five connected sections introduce larger waves (3/4/5/6/7), sturdy skeletons, willow scenery and crypts. Gates require every scheduled spawn and defeat. The sword is collected before any enemy appears.
- Each section has an in-session checkpoint. Defeat restores that section's starting score and all five hearts. No duplicate-score farming from retries.
- The fifth gate opens the unsigned warning. Reading freezes gameplay and audio; Continue explicitly starts the chase.
- Four-second descending-ghost head start, permanent gold spike markers, generous jump arc, old-gate fade and `TO BE CONTINUED…`. Ghost contact retries the chase, not the graveyard. Sword does not damage the ghost.
- Checkpoints are in memory, not saved across reloads. Only best score and reduced-motion preference persist; blocked storage falls back to session memory. Sound defaults off.

## Verification

```sh
node --test tests/*.test.cjs
# Install test-only Playwright outside the source tree and install Chromium.
# Serve the repo on localhost:8765, then:
NODE_PATH=/path/to/test-tools/node_modules node tests/hallows-browser-smoke.cjs
# For the deployed build:
ARCADE_URL=https://awana-arcade.vercel.app NODE_PATH=/path/to/test-tools/node_modules node tests/hallows-browser-smoke.cjs
```

`ARTIFACT_DIR` selects screenshot output. CI installs pinned Playwright, runs the Node suite and real Chromium route, and uploads screenshot artifacts.

Local acceptance before publication: **38/38 Node tests** (29 existing + 9 Hallows tests). Chromium completed a real-time Steven route using only keyboard events: **57.485 seconds**, **49 candy corn**, **five hearts**, **zero retries**, all five sections plus chase and ending. That timing starts after the entrance input/audio checks, not at initial navigation. Combat policy faces nearby enemies and attacks; chase policy jumps at visible spike locations. It does not teleport or change game state.

Additional Chromium routes for all four heroes use only the same physics input method (accelerated simulation, not real-time keyboard playthroughs). All finished with five hearts and zero retries. Unit tests intentionally arrange states to isolate abilities, critical thresholds and checkpoint edge cases; these are not described as playthroughs.

Chromium additionally verifies Space immediately after character selection, pause/reading freeze, audio-context running state and voice cleanup, mute, denied storage and unsupported audio, replay/reset, 390px touch press/release, no horizontal overflow, reduced motion, and a never-before-visited query offline launch after hub precaching. No page errors. Screenshots inspected for character selection, actual play, unsigned note and mobile controls.

## Review and scope

Pre-edit tracked archive: `cache/scratch/awana-before-hallows.tar` in the active Hermes profile. Repository was clean; remote Phantom Manor branch was already an ancestor of main. No unrelated merge.

Review fixed: Space focus after selection, harmless skeleton spawn warning contact, and storage fallback writes before a denied storage operation. Static security review found no external game requests, secrets, eval, network writes, third-party assets or photo inclusion. Existing games and lesson content are untouched. Hub has one Hallows card and 16 unique titles; service-worker cache is v9 with canonical Hallows precache and network-first query-insensitive offline fallback.

Limitations: no physical Chromebook/touch device or human listening session was available. Chromium verifies audio state/oscillators, not speaker output or subjective sound quality. Portrait-phone play is deliberately scaled down; wider landscape/tablet/Chromebook views offer larger art. No screen-reader-only alternative to spatial platform gameplay. Independent parent-agent publication readback is separate from the implementation review.
