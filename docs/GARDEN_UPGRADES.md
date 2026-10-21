# Garden & manor upgrade notes

## Delivered
- Cherubim's Blade: WASD/arrows and on-screen directional movement; blade collision follows the visible guardian; animated wings and quiet garden scenery; five named/color-themed watches with the existing enemy progression; healing, ten-second gate shields and long-blade pickups; pause, opt-in sound and calm effects. Deflected enemies now actually leave the arena (the old friction logic stranded them and prevented wave completion). Pickups drift toward the guardian instead of remaining unreachable. Restarts clear transient abilities and every overlay.
- Phantom Manor: preserves the complete six-page story, keys, puzzles, audio and existing dashboard entry. Adds corner cobwebs, stone owl statues on existing furniture, portraits/candles, glasshouse roof, ivy, pumpkins, stepping stones, fireflies and gently fading ghosts. Decorative details do not change collision routes; ghosts stay at least 48% visible. Decorative motion/fading is on by default; OS reduced-motion disables it without a visible scenery selector.
- Eden: new self-contained, silent canvas screensaver with randomized scenes and animal arrangements, slow movement, birds, butterflies, a river and modestly clothed Adam/Eve. Four ambient palettes, gentle transitions, Pause, New scene, Still/sensory mode and fullscreen with graceful denial. Clearly identified as an imagined visualization, not a reconstruction or quotation.
- Hub: one Phantom Manor card, new Eden card, 15 distinct linked titles; updated descriptions and versioned links. Service worker v7 precaches Eden and resolves first-use versioned URLs offline. Failed precaches no longer activate an incomplete replacement cache.

## Reproduce verification

```sh
node --test tests/*.test.cjs
python3 -m http.server 8765 --bind 127.0.0.1
# In another terminal, with Playwright installed outside this static project:
NODE_PATH=/path/to/playwright/node_modules node tests/browser-smoke.cjs
```

`ARCADE_URL` overrides the local URL. `ARTIFACT_DIR` overrides screenshot output (otherwise the OS temporary directory). Chromium must be installed with Playwright. No runtime package dependencies were added to the games.

Verified locally: 25 Node tests passed. Real headless Chromium exercised keyboard and on-screen movement, whirlwind, five wave transitions/restart, complete Phantom Manor puzzle/story traversal using the existing collision-aware physical route helpers, sensory controls, changing Eden scenes, frozen animation clock, narrow layouts and first-use offline query-string launches. No page errors. Desktop and narrow screenshots inspected. Blade wave transitions use controlled engine state, not a claim that a child completed every wave unaided. Managed Chromebook hardware and classroom balancing still deserve a short on-device check.

Offline use: visit the hub online and let the service worker finish installing before disconnecting. Individual games remain self-contained; they do not use persistent storage or remote artwork/audio. Phantom progress is session-only. The hub's pre-existing optional web font falls back to monospace offline.

## Halloween LAN multiplayer proposal — not implemented

Use one leader laptop on a dedicated local Wi-Fi network to serve both the static game and a small authoritative Node/WebSocket room server. Players join a short room code/QR using nicknames or team colors, without accounts, chat or personal information. The leader controls start/pause/reset and the TV can be a spectator.

Start with 2–6 cooperative lantern keepers sharing clues and puzzle progress. Clients send bounded movement/action inputs; the host validates collisions, inventory, puzzle answers and cooldowns, runs a fixed simulation, and broadcasts compact snapshots at about 10–20 Hz. Interpolate remote positions; include sequence numbers, reconnect tokens, heartbeats and full-state resync. Keep the solo engine and offline PWA independent of the multiplayer adapter.

Serve the page and WebSocket from the same LAN origin to avoid an HTTPS Vercel page attempting insecure `ws://` connections. Plain LAN HTTP can run the game but cannot install a service worker on most devices; use trusted local HTTPS if PWA installation is required. Preflight managed Chromebook policy and access-point client isolation, firewall ports and a full-room load test. Do not expose the server on the public internet. Fall back to solo/local team turns if the host disconnects. This architecture requires a persistent host; a static Vercel deployment alone is not the LAN game server.
