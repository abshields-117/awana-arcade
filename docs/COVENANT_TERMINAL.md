# COVENANT//TERMINAL leader and author guide

## Leader access

The landing page is an **activity gate, not a security boundary**. The access code is `AWANA` (case-insensitive after trimming). Click the small corner glyph five times, enter the code, and use the panel to show the current answer or hint, skip a step, reset mission progress, open the arcade, or relock.

The code and answers are necessarily source-visible in a static offline app. They are not a password or secret, and no credentials are stored. Unlock and mission progress use `sessionStorage` only. If browser storage is denied, the terminal safely stays locked and keeps progress only in page memory.

## Two-screen setup

1. On the player Chromebook or laptop, open `index.html` and leave the terminal at the fresh prompt. Do not refresh this player screen during a team run.
2. On the projector device, open `games/retro_screensaver.html?mode=mor&v=2`, or use **MoR Support Display** under **Visual Displays & Room Support** in `arcade.html`.
3. Put the projector display in fullscreen. It rotates general, spoiler-free help every 12 seconds; Previous, Next, and Pause remain available. Pause and operating-system reduced motion freeze its animation and clocks.
4. The leader panel also has **MoR Support Display**, which opens the support view in a separate window. The default `games/retro_screensaver.html?mode=retro&v=2` remains the original rotating retro screensaver.

The support display is intentionally independent: it never reads or invents player progress, never gives puzzle solutions, and runs without network dependencies or audio. Keep the leader spoilers below on the leader device only.

## Guided player flow

A fresh session shows only `Hint: type HELP` and the `>` input prompt. `HELP` gives one immediate action: `RUN FLOOD.EXE`. Only after that command, the launcher shows the short `[FICTIONAL CYBER TRAINING MISSION]` MoR system alert, then runs a roughly three-second, skippable mount/load/operator sequence. Guided Mission Mode automatically prints each clue and one `TYPE:` or `NEXT COMMAND:` instruction. The later `MoR // MEN OF RENOWN` line is explicitly a fictional group designation with a Genesis 6:4 reference; it does not portray the biblical men of renown as computer hackers. A correct solution briefly celebrates and advances to the next operator. `HELP` becomes contextual; `STATUS`, `HINT`, `LOG`/`HISTORY`, and the advanced discovery commands remain available but are never required to find the next step. There is no countdown.

## Mission architecture

Reusable mission content lives in `js/terminal-missions.js`; terminal rendering and controls live in `index.html`. The module exports:

- `parseCommand(input)` — forgiving command case and outer whitespace, while retaining exact internal arguments.
- `createMission()` — returns mission metadata and an ordered `puzzles` array.
- `evaluateAction(puzzle, parsed)` — separates unknown commands, wrong syntax, incorrect solutions, and success.
- `nextHint(state, puzzleId)` — advances a puzzle through exactly three hint levels.

Each puzzle defines:

- `id`, `operator`, and projector-readable `prompt`
- `files`, `read`, and `scan` evidence
- `accepts`: accepted answers as exact or anchored regular-expression rules tied to a command
- `syntax` and short teaching `success` feedback
- exactly three `hints`, moving from direction to explicit help

To add a mission pack, add another data factory following this contract and select it before initializing the engine. Avoid `eval`, unanchored answer patterns, and solutions that reduce to predictable `1-2-3-4`. Add Node reachability tests and a real typed-command browser route for every pack.

## Content boundaries

Scripture records include a reference and are marked authenticated. Invented Ark devices, security systems, props, and other imagined details must contain the exact label `[FICTIONAL TRAINING SIMULATION]` in every relevant puzzle. God is never framed as mistaken, corrupted, or in need of debugging; corruption belongs to the unreliable human logging system or fictional simulation.

## Current mission (leader spoilers)

<details>
<summary>Answers and commands</summary>

1. `READ /archive/manifest.txt`
2. `ANSWER 50 CUBITS` — Genesis 6:15 width
3. `ANSWER ALL` — missing word in Genesis 6:22
4. `ANSWER 7-2-9-4` — logical preparation order
5. `ANSWER DOVE` — Genesis 8:11 ASCII bird
6. `REPAIR LAMP --A=ON --B=OFF` — fictional Boolean circuit
7. `TRACK --EAST --BAY=3` — fictional dinosaur-prop frames
8. `READ /archive/final.key` — Caesar-shifted path
9. `RUN RESTORE --VERIFY` — exact final directive

</details>
