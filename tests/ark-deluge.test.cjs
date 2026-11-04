const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const gamePath = path.join(root, 'games', 'ark_deluge_physics.html');
const html = fs.readFileSync(gamePath, 'utf8');

function mechanics() {
  const match = html.match(/\/\* ARK_MECHANICS_START \*\/([\s\S]*?)\/\* ARK_MECHANICS_END \*\//);
  assert.ok(match, 'game must expose a pure, testable mechanics core');
  const context = { module: { exports: {} }, exports: {} };
  vm.runInNewContext(`${match[1]}\nmodule.exports = ArkMechanics;`, context);
  return context.module.exports;
}

function runFrames(api, state, input, seconds, hz = 60) {
  for (let i = 0; i < seconds * hz; i++) api.stepBoat(state, input, 1000 / hz);
}

test('Ark Deluge is self-contained and integrated with versioned offline launch', () => {
  assert.doesNotMatch(html, /<(?:script|link|img)[^>]+(?:src|href)=["']https?:/i);
  const hub = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  assert.match(hub, /games\/ark_deluge_physics\.html\?v=2/g);
  assert.match(sw, /awanacade-v19/);
  assert.match(sw, /'\.\/games\/ark_deluge_physics\.html'/);
});

test('frame delta is normalized and capped for refresh-rate and tab-resume safety', () => {
  const api = mechanics();
  assert.equal(api.normalizeDelta(-1), 0);
  assert.equal(api.normalizeDelta(16.666), 16.666);
  assert.equal(api.normalizeDelta(1000), api.TUNING.maxDeltaMs);
  assert.ok(api.TUNING.maxDeltaMs <= 34);

  const at60 = api.createBoat();
  const at120 = api.createBoat();
  runFrames(api, at60, { right: true, surge: false }, 1, 60);
  runFrames(api, at120, { right: true, surge: false }, 1, 120);
  assert.ok(Math.abs(at60.x - at120.x) < 3, `refresh variance was ${Math.abs(at60.x - at120.x)}`);
  assert.ok(Math.abs(at60.angle - at120.angle) < 0.02);
});

test('boat steering is gentle, capped, damped and self-righting', () => {
  const api = mechanics();
  const boat = api.createBoat();
  runFrames(api, boat, { right: true, surge: false }, 1);
  assert.ok(boat.x > api.TUNING.worldWidth / 2 + 35, 'steering should feel responsive');
  assert.ok(boat.x < api.TUNING.worldWidth / 2 + 150, 'steering must not sling the boat');
  assert.ok(Math.abs(boat.vx) <= api.TUNING.maxLateralSpeed + 0.001);
  assert.ok(Math.abs(boat.angularVelocity) <= api.TUNING.maxAngularVelocity + 0.001);
  assert.ok(Math.abs(boat.angle) <= api.TUNING.maxTilt + 0.001);

  runFrames(api, boat, { right: false, surge: false }, 2);
  assert.ok(Math.abs(boat.angle) < 0.06, `boat did not self-right: ${boat.angle}`);
  assert.ok(Math.abs(boat.vx) < 8, `boat kept sliding: ${boat.vx}`);
});

test('collision response is forgiving and cannot create pinball or capsize traps', () => {
  const api = mechanics();
  const boat = api.createBoat();
  boat.vx = api.TUNING.maxLateralSpeed;
  boat.angle = api.TUNING.maxTilt;
  api.applyCollision(boat, -1);
  assert.ok(Math.abs(boat.vx) <= api.TUNING.collisionSpeedCap);
  assert.ok(Math.abs(boat.angle) <= api.TUNING.maxTilt);
  assert.ok(Math.abs(boat.angularVelocity) <= api.TUNING.maxAngularVelocity);
  assert.ok(api.TUNING.invulnerabilityMs >= 2000);
  assert.ok(api.TUNING.shieldMs >= 8000);
  assert.ok(api.TUNING.hitRadius <= 34);
});

test('pace and escalation stay within kid-friendly reaction limits', () => {
  const api = mechanics();
  assert.ok(api.TUNING.baseScrollSpeed <= 105);
  assert.ok(api.TUNING.hazardMinSpeed <= api.TUNING.hazardMaxSpeed);
  assert.ok(api.TUNING.hazardMaxSpeed <= 165);
  assert.ok(api.obstacleInterval(1) >= 1200);
  assert.ok(api.obstacleInterval(12) >= 800);
  assert.ok(api.hazardSpeed(20, 1) <= api.TUNING.hazardMaxSpeed);
  assert.ok(api.TUNING.warningMs >= 900);
});

test('responsive 16:9 viewport, readable HUD, fullscreen, pause and touch affordances exist', () => {
  assert.match(html, /width="1280" height="720"/);
  assert.match(html, /aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(html, /100dvh/);
  assert.match(html, /id="btnPause"/);
  assert.match(html, /id="btnFullscreen"/);
  assert.match(html, /touchcancel/);
  assert.match(html, /aria-label="Steer left"/);
  assert.match(html, /aria-label="Steer right"/);
  assert.match(html, /prefers-reduced-motion/);
});
