# COVENANT//TERMINAL leader and author guide

## Leader access

The landing page is an **activity gate, not a security boundary**. The access code is `AWANA` (case-insensitive after trimming). Click **ENTER AWANACADE** on the boot screen, or type `ACCESS AWANA` / `UNLOCK AWANA`, then enter the code in the leader panel. The five-click corner glyph still works. A wrong code never unlocks the arcade. Once authorized, the panel shows hints/answers, skips, resets, opens the arcade, and relocks. Completing all nine missions offers **UNLOCK NORMAL ARCADE** directly. The visible **START OVER** button requires confirmation, clears mission progress, hints and command history, and does not erase an existing arcade unlock.

The code and answers are necessarily source-visible in a static offline app. They are not a password or secret, and no credentials are stored. Unlock and mission progress use `sessionStorage` only. If browser storage is denied, the terminal safely stays locked and keeps progress only in page memory.

## Two-screen setup

1. On the player Chromebook or laptop, open `index.html` and leave the terminal at the fresh prompt. Do not refresh this player screen during a team run.
2. On the projector device, open `games/retro_screensaver.html?mode=mor&v=3`, or use **MoR Support Display** under **Visual Displays & Room Support** in `arcade.html`.
3. Put the projector display in fullscreen. Its first three cards establish the outage story before general, spoiler-free tips. Each card holds for 12 seconds; Previous, Next, and Pause remain available. Pause and operating-system reduced motion freeze its animation and clocks.
4. The leader panel also has **MoR Support Display**, which opens the support view in a separate window. The default `games/retro_screensaver.html?mode=retro&v=2` remains the original rotating retro screensaver.

The support display is intentionally independent: it never reads or invents player progress, never gives puzzle solutions, and runs without network dependencies or audio. Keep the leader spoilers below on the leader device only.

## Guided player flow

A fresh session shows a short **SYSTEM DOWN** story and a working `>` prompt with `Hint: type HELP`. `HELP` gives one immediate action: `RUN FLOOD.EXE`. The launcher then holds its short briefing until the team explicitly presses **CONTINUE** or Enter; nothing auto-dismisses. Guided Mission Mode prints one clue and one `TYPE:` or `NEXT COMMAND:` instruction. A correct solution advances to the next operator. `HELP` becomes contextual; `STATUS`, `HINT`, `LOG`/`HISTORY`, and discovery commands are optional. There is no countdown.

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

**For parents and leaders:** The MoR hacker group, its gadgets and lamps, and the dinosaur security cameras are imagination for this adventure—not claims from the Bible. The **BIBLE RECORD** sections cite Genesis; **ARK STORY CHALLENGE** sections are story play. Genesis says Noah did *all* that God commanded (Genesis 6:22); `EVERYTHING` is accepted as a child's paraphrase answer, but the verse itself stays unchanged. God is never mistaken, hacked, corrupted, or in need of repair; the game's human archive is what players restore. Explain this distinction orally to children before play.

## Current mission (leader spoilers)

<details>
<summary>Answers and commands</summary>

1. `READ /archive/manifest.txt`
2. `ANSWER 50 CUBITS` — Genesis 6:15 width
3. `ANSWER ALL` or `ANSWER EVERYTHING` — missing word in Genesis 6:22 (verse reads “all”)
4. `ANSWER 7,2,9,4` — logical preparation order; spaces after commas are accepted, HINT optional
5. `ANSWER DOVE` — Genesis 8:11 ASCII bird
6. `REPAIR LAMP --A=ON --B=OFF` — fictional Boolean circuit
7. `ANSWER B` — left side of the first green camera frame, then right side of the last; choice buttons or typing
8. `READ /final.key` — shorter Caesar-shifted path
9. `RELOAD` — one exact command to restore service

</details>
