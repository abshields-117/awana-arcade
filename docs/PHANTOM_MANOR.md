# Phantom Manor — first-chapter scope

## Product goal
A self-contained HTML5 top-down mystery adventure for the Awana Arcade. Players explore a misty old mansion, read a family's scattered records, solve environmental puzzles and help a lost caretaker spirit find peace. This is clearly labeled fictional entertainment, not a Bible narrative or a claim about spirits.

## Audience and tone
Ages roughly8–11 with optional adult reading help. Cozy-spooky90s pixel-art atmosphere: ghosts, bats, shadow figures, warm lanterns, colored rooms and gentle fog. No gore, aggressive jump scares, graphic deaths, flashing strobe effects or frightening audio spikes. Courage, observation, patience and kindness drive the ending.

## First playable chapter — acceptance scope
- Six connected rooms: Foyer, Library, Conservatory, Gallery, Clocktower and Attic.
- Real movement, solid furniture/walls, reversible door navigation and explicit lock feedback.
- Three clue-based puzzles, collectible keys/keepsakes, an artifact-enhanced lantern and a hidden passage.
- Readable journal discoveries explain the inhabitants' disappearance and the caretaker's unfinished task.
- Ghost/bat/shadow encounters: careful movement and lantern stun, not graphic combat.
- Five-heart health, generous post-hit mercy and recovery that does not erase puzzle progress or strand the player.
- A complete final encounter and hopeful ending, plus restart.
- Keyboard and touch controls, pause, clear objective and inventory feedback.
- Optional synthesized ambient sound, off until deliberately enabled. No asset downloads or tracking.
- Session-only progress unless durable saving is explicitly implemented and tested; do not promise cross-session saves.

The desired play-session length is10–15minutes, a design target pending child playtesting—not a measured guarantee.

## Controls target
WASD/Arrow keys: move; E: interact; Space: lantern; Shift: quiet walk; P: pause; M: sound. Touch movement and action controls must offer an equivalent playable route. An Arcade Menu link always permits exit.

## Technical architecture
`games/phantom_manor.html`: inline CSS/JavaScript, Canvas2D pixel art, procedural audio, no framework/build step. Runs on Vercel static hosting and ordinary Chromium/Chromebook browsers. The arcade hub links the game; its existing network-first service worker precaches it for offline reuse after an initial online load. A standalone copied HTML file also runs without a network connection.

Game state must separate inventory, puzzle flags, room navigation, encounter damage and modal state. Essential objects are deterministic rather than randomly spawned. Inputs cannot act through paused/dialog/ending screens. Essential items are granted once. Death/recovery and room changes must not create duplicate timers or listeners.

## Verification / release gates
- Node tests exercise actual inline game logic: locks, puzzle prerequisites, idempotent collection, reachable ending, recovery/reset, pause and inputs.
- Integration tests validate arcade link/count and service-worker precache registration.
- Browser checks cover title/start, movement, interaction, full solution, pause/restart, narrow-pane/mobile layout and console errors.
- First release lives in a separate `feature/phantom-manor` branch and pull request. Do not include unrelated Eden Sentinel experiments.
- Local preview and GitHub source publication do not establish a successful public Vercel deployment; report these separately.

## Implemented chapter and verification

Implemented in `games/phantom_manor.html`: six rooms, three puzzles, six journal pages, seven inventory items, hidden passage, lantern stun/quiet movement, progress-preserving checkpoints and a peaceful ending. Progress is session-only; reloading starts over. Sound is optional and initially off.

Run `node --test tests/*.test.cjs` from the repository root. Initial chapter verification:10 tests passed. Chromium verification exercised keyboard movement, the complete collision-respecting solution via the game API, the real final-choice button, and narrow-pane rendering without JavaScript errors. Offline play was verified after the hub service worker cached the game. A physical Chromebook/multitouch playtest and child-paced duration measurement remain manual follow-ups. The ending may require vertical scrolling at some desktop sizes; narrow-pane gameplay was visually inspected.

### Facilitator solution — spoilers
1. Foyer: read the keeper's journal; use the west door to Library.
2. Library: read the note, then select **Seed → Tree → Stars** at the books. Receive brass key and lantern amulet.
3. Return to Foyer and take east door to Conservatory. Read the journal; solve the wheel **Rain → Sun → Moon** for the silver key and music box.
4. Enter Gallery to the east. Read its note and collect the portrait. Lantern light near the blue east tapestry reveals an optional Clocktower shortcut.
5. Clocktower is also reachable from Conservatory's north door. Read the schedule and ring **6 → 12 → 9** for the attic key and ribbon.
6. Enter Attic, read the final letter and approach Rowan with all six journal pages and three keepsakes. Choose **They are together at the river cottage.**

## Later expansion — outside this chapter
Additional floors and alternate endings; timed challenge mode; more varied creature patterns; controller support; robust save slots; optional facilitator discussion cards; deeper accessibility and audio settings. Add only after children test the core adventure and pacing.
