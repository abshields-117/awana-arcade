// Real Chromium keyboard/touch/offline verification for Ark Deluge.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const base = process.env.ARCADE_URL || 'http://127.0.0.1:8765';
  const out = process.env.ARTIFACT_DIR || path.join(os.tmpdir(), 'ark-deluge-evidence');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const errors = [];
  try {
    const desktop = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await desktop.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.goto(`${base}/games/ark_deluge_physics.html?v=3`);
    const box = await page.locator('#game-container').boundingBox();
    assert.ok(box.width >= 1200 && box.height >= 680, `desktop game was only ${box.width}x${box.height}`);
    await page.getByRole('button', { name: 'LAUNCH ARK VOYAGE' }).click();
    const startX = await page.evaluate(() => ArkDeluge.getState().ark.x);
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(900);
    await page.keyboard.up('ArrowRight');
    const steered = await page.evaluate(() => ArkDeluge.getState());
    assert.ok(steered.ark.x > startX + 18 && steered.ark.x < startX + 75);
    assert.ok(Math.abs(steered.ark.angle) <= .281);
    await page.keyboard.press('Space');
    assert.ok((await page.evaluate(() => ArkDeluge.getState().shield)) > 7000);
    await page.getByRole('button', { name: 'Pause game' }).click();
    const paused = await page.evaluate(() => JSON.stringify(ArkDeluge.getState()));
    const pausedPixels = await page.locator('canvas').evaluate(c => c.toDataURL());
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => JSON.stringify(ArkDeluge.getState())), paused);
    assert.equal(await page.locator('canvas').evaluate(c => c.toDataURL()), pausedPixels, 'pause must freeze ambient canvas animation');
    await page.getByRole('button', { name: 'RESUME' }).click();
    // A representative real-time voyage: only keyboard events and wall-clock frames.
    for (let leg = 0; leg < 90; leg++) {
      const key = leg % 2 ? 'ArrowLeft' : 'ArrowRight';
      await page.keyboard.down(key);
      await page.waitForTimeout(700);
      await page.keyboard.up(key);
      if (leg % 8 === 0) await page.keyboard.press('Space');
      if ((await page.evaluate(() => ArkDeluge.getState().gameState)) === 'CHECKPOINT') break;
    }
    const routeState = await page.evaluate(() => ArkDeluge.getState());
    assert.equal(routeState.gameState, 'CHECKPOINT', `representative voyage ended in ${routeState.gameState} at ${routeState.distance}m`);
    assert.ok(routeState.distance >= 520);
    await page.screenshot({ path: path.join(out, 'ark-desktop-1366x768.png') });
    assert.equal(await page.locator('#checkpointModal:not(.hidden)').count(), 1);
    await desktop.close();

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const m = await mobile.newPage();
    m.on('pageerror', e => errors.push(e.message));
    await m.goto(`${base}/games/ark_deluge_physics.html?v=3-mobile`);
    await m.getByRole('button', { name: 'LAUNCH ARK VOYAGE' }).click();
    const mbox = await m.locator('#game-container').boundingBox();
    assert.ok(mbox.width >= 375 && mbox.height > 210);
    assert.ok(await m.getByRole('button', { name: 'Steer right' }).isVisible());
    const mx = await m.evaluate(() => ArkDeluge.getState().ark.x);
    const right = m.getByRole('button', { name: 'Steer right' });
    await right.dispatchEvent('pointerdown', { pointerType: 'touch', isPrimary: true });
    await m.waitForTimeout(850);
    await right.dispatchEvent('pointerup', { pointerType: 'touch', isPrimary: true });
    assert.ok((await m.evaluate(() => ArkDeluge.getState().ark.x)) > mx + 18);
    await right.dispatchEvent('pointerdown', { pointerType: 'touch', isPrimary: true });
    await right.dispatchEvent('pointercancel', { pointerType: 'touch', isPrimary: true });
    const cancelX = await m.evaluate(() => ArkDeluge.getState().ark.x);
    await m.waitForTimeout(350);
    assert.ok((await m.evaluate(() => ArkDeluge.getState().ark.x)) - cancelX < 20);
    await m.screenshot({ path: path.join(out, 'ark-mobile-390x844.png') });
    assert.ok(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await mobile.close();

    const offline = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const o = await offline.newPage();
    await o.goto(base);
    await o.evaluate(() => navigator.serviceWorker.ready);
    await o.reload();
    await o.waitForFunction(() => !!navigator.serviceWorker.controller);
    await offline.setOffline(true);
    await o.goto(`${base}/games/ark_deluge_physics.html?v=never-visited-ark`);
    assert.equal(await o.locator('#gameCanvas').count(), 1);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ result: 'PASS', screenshots: out, desktop: '1366x768', mobile: '390x844', checks: ['large 16:9 viewport', 'keyboard steering bounds', '8-second shield', 'pause freezes state and pixels', 'input-driven voyage reaches checkpoint', 'touch steering and cancel', 'mobile overflow', 'never-visited query offline', 'zero page errors'] }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
