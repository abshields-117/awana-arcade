# Physical Games — leader's screen guide

Open **[Physical Games](../physical-games.html?v=12)** from its separate hub section. These are **our club variants, not universal rules**. Adult judgment and your organization's safeguarding policy always come first.

## Run the screen without raising your voice
1. Inspect the space, remove hazards, mark boundaries, keep exits clear, and station adults so all play is visible. Headcount before and after.
2. Connect a computer to the gym TV/projector; choose **Fullscreen**. Choose the game in the single menu. Each step has a looping top-down demo and short text. Blue/gold actors also have letters so color isn't the only cue.
3. Read one rule together. **Pause demo** freezes motion; **Previous / Next** changes the step manually. Nothing advances unexpectedly. Reduced-motion devices start paused; Play is optional.
4. Practice the silent stop signal: **adult hand raised → everyone freezes and looks at the adult**. The screen does not replace supervision. No audio, speech service, accounts or network dependency is needed.
5. After reviewing all steps, press **Start round**. The screen holds the goal and stop reminder; this is not a countdown or automatic permission to move. The adult gives the start signal. **End round / Back to rules** returns to the current step. Use your own watch for short rounds.
6. Offer walking/rolling, buddy, seated station-helper, scorekeeper or signal-helper roles. Participation and rest are voluntary; no elimination or embarrassment. Modify distance, reach, pace and equipment for the actual children. Never require hands-on-heads if inaccessible: agree an equally visible protected-walk signal before play.

## Ring of Power — Capture the Flag
**Gear:** cones, two hoops, two soft flags (rubber ball, noodle or pinny), two marked jails. Equal teams; match the pace to the group, preferably walking/rolling.

- Halve the field with cones. Each half has a **back-side hoop holding its flag** and a jail off the traffic path. Explain the exact center and outer boundaries.
- Defenders tag invaders **only on the defenders' own side**. A light shoulder tag sends the invader walking to the opposing jail. No grabbing, pushing, tackling, blocking with bodies or other contact.
- An attacker **inside the flag hoop is safe**. When they step out carrying the flag, they are vulnerable again. Carry it; **never throw the flag**.
- **One rescuer tags one jailed teammate. Both WALK home with hands on heads; both are invulnerable until they reach their own half, reset and rejoin.** No flag-carrying or tagging during this protected return. The rescuer must reach jail without being tagged first.
- Our fairness variant: defenders stay **two big steps away from hoops and jails**, with open approach/exit lanes. No camping or blocking. Attackers may stay in the hoop up to **10 seconds**, counted calmly by an adult, then leave safely. Pause play rather than force an unsafe exit.
- **Win:** carry the opponent's flag across the center line into your team's half. Your own flag need not be home in this variant. Celebrate, return flags and reset everyone.
- Tagged while carrying? Hand the flag to the adult, who resets it in the hoop; walk to jail. Do not throw it or tussle for it. Out of bounds? Stop, have an adult reset the flag if needed, and walk back to your own side before rejoining. Agree disputed calls with an adult, not an argument.

## Man Hunt — buddy search, not pursuit
Use a **small, lit, bounded, adult-supervised zone**. Buddy pairs stay together; no isolated hiding. Adults must see every approved hiding location. No climbing, roads, bathrooms, locked spaces or startling anyone. Give pairs 30 seconds to walk to approved spots. Seeking pairs walk, point and say “Found you!” from a friendly distance: **no touching or chasing**. Found pairs walk together to base. After two minutes the adult raises a hand; **everyone returns for headcount**. Swap seeker/hider roles; **no eliminations**. If a pair cannot be accounted for, stop all play and follow safeguarding procedures.

## Flashlight Tag — floor-light version
The room is **dim, never dark**: faces, the floor and obstacles must stay clearly visible. Adults supervise a bounded, cleared area. Everyone walks/rolls with a buddy. Seekers use a steady, low-power flashlight on the **floor near shoes**, never faces. **No strobes, lasers or running blind.** If visibility is poor, increase lighting or stop.

When spotted, both buddies acknowledge it and walk to the marked safe zone. No physical tags. Count five together at base, then rejoin. No camping near base; keep clear exit lanes. Rotate seeker pairs every two minutes. Nobody is out. The animation is a top-down diagram of the floor beam, not an instruction to aim at a person.

## Mirror Moves — seated or standing
No gear. Leave two arm lengths between pairs. One partner leads slow, comfortable movements; the other mirrors. Seated, standing or tiny hand movements all count. No jumping, touching, balance tests or painful stretches. After 30 seconds, adult signals a leader swap. Match three moves and celebrate together; no winners or losers.

## Team Treasure Walk — cooperative collecting
Soft beanbags/pinnies at accessible-height stations; one shared home hoop; wide obstacle-free routes. One traveler per route at a time. Walk or roll, carry one item, place it gently in the hoop. Wait for a clear route. **No racing, throwing or grabbing.** Carrying, pointing, counting and seated station-help are equal contributions. Collect everything as one team, celebrate, reset.

## Offline and maintenance
- The presenter is one self-contained HTML file, with inline styles, data and Canvas animations. Download `physical-games.html` and open it locally if permitted; it needs no external library or storage. Links to the hub and guide require those files alongside it.
- For managed Chromebooks use the hosted PWA. Open the hub online and wait for the service worker to finish precaching before disconnecting. The presenter and this guide are in `awanacade-v12`; fresh version-query navigation works offline. A first visit without either internet or a saved file cannot work.
- Hub totals count unique arcade links, subtract the two visual displays, and do not count Physical Games presenter cards. The existing sixteen cabinet destinations are preserved: fourteen playable games and two visual displays.
- Run `node --test tests/*.test.cjs`. With Playwright installed as a test-only dependency, serve this folder on port 8765 and run `node tests/physical-browser-smoke.cjs` (set `NODE_PATH` to the test install if needed). `ARCADE_URL` can target production; `ARTIFACT_DIR` chooses screenshots.
