// Real Chromium verification for normal and MoR support modes.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const base = process.env.ARCADE_URL || 'http://127.0.0.1:8765';
  const out = process.env.ARTIFACT_DIR || path.join(os.tmpdir(), 'mor-support-evidence');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const errors = [];
  const watch = page => page.on('pageerror', error => errors.push(error.message));
  try {
    const normalContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const normal = await normalContext.newPage(); watch(normal);
    await normal.goto(`${base}/games/retro_screensaver.html?mode=retro&v=2`);
    assert.ok(await normal.locator('#retroMode').isVisible());
    assert.equal(await normal.locator('#morMode').isVisible(), false);
    const normalFrame = await normal.locator('#screenCanvas').evaluate(canvas => canvas.toDataURL());
    await normal.waitForTimeout(300);
    assert.notEqual(await normal.locator('#screenCanvas').evaluate(canvas => canvas.toDataURL()), normalFrame, 'normal screensaver animation did not change pixels');
    await normal.screenshot({ path: path.join(out, 'retro-normal-1366x768.png') });
    await normalContext.close();

    const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'no-preference' });
    const page = await context.newPage(); watch(page);
    await page.goto(`${base}/games/retro_screensaver.html?mode=mor&v=2`);
    assert.ok(await page.locator('#morMode').isVisible());
    assert.equal(await page.locator('#retroMode').isVisible(), false);
    assert.equal(await page.locator('.mor-card').count(), 1);
    assert.ok((await page.locator('.mor-card').boundingBox()).width >= 700);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight));
    const firstTitle = await page.locator('#mor-title').innerText();
    const firstFrame = await page.locator('#mor-canvas').evaluate(canvas => canvas.toDataURL());
    await page.waitForTimeout(300);
    assert.notEqual(await page.locator('#mor-canvas').evaluate(canvas => canvas.toDataURL()), firstFrame, 'MoR ambient animation did not change pixels');
    await page.waitForTimeout(12100);
    const cycledTitle = await page.locator('#mor-title').innerText();
    assert.notEqual(cycledTitle, firstTitle, 'support cards did not auto-advance after the 12-second interval');

    await page.getByRole('button', { name: 'Pause support display' }).click();
    const pausedCard = await page.locator('#mor-title').innerText();
    const pausedFrame = await page.locator('#mor-canvas').evaluate(canvas => canvas.toDataURL());
    const pausedState = await page.evaluate(() => JSON.stringify(window.MorSupport.getState()));
    await page.waitForTimeout(450);
    assert.equal(await page.locator('#mor-canvas').evaluate(canvas => canvas.toDataURL()), pausedFrame, 'pause did not freeze canvas pixels');
    assert.equal(await page.evaluate(() => JSON.stringify(window.MorSupport.getState())), pausedState, 'pause did not freeze support clocks');
    assert.equal(await page.locator('#mor-title').innerText(), pausedCard);
    await page.getByRole('button', { name: 'Resume support display' }).click();

    await page.getByRole('button', { name: 'Next support card' }).click();
    assert.notEqual(await page.locator('#mor-title').innerText(), cycledTitle);
    await page.getByRole('button', { name: 'Previous support card' }).click();
    assert.equal(await page.locator('#mor-title').innerText(), cycledTitle);
    assert.equal(await page.locator('#mor-dots button').count(), await page.evaluate(() => window.MorSupport.cardCount));
    await page.locator('#mor-dots button').nth(3).click();
    assert.equal((await page.locator('#mor-dots button[aria-current="true"]').count()), 1);

    await page.getByRole('button', { name: 'Enter fullscreen' }).click();
    await page.waitForFunction(() => !!document.fullscreenElement);
    await page.evaluate(() => document.exitFullscreen());
    await page.screenshot({ path: path.join(out, 'mor-support-1366x768.png') });
    await context.close();

    const reduced = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
    const reducedPage = await reduced.newPage(); watch(reducedPage);
    await reducedPage.goto(`${base}/games/retro_screensaver.html?mode=mor&v=reduced`);
    const reducedPixels = await reducedPage.locator('#mor-canvas').evaluate(canvas => canvas.toDataURL());
    const reducedState = await reducedPage.evaluate(() => JSON.stringify(window.MorSupport.getState()));
    await reducedPage.waitForTimeout(450);
    assert.equal(await reducedPage.locator('#mor-canvas').evaluate(canvas => canvas.toDataURL()), reducedPixels, 'reduced motion did not freeze canvas');
    assert.equal(await reducedPage.evaluate(() => JSON.stringify(window.MorSupport.getState())), reducedState, 'reduced motion did not freeze clocks');
    await reducedPage.getByRole('button', { name: 'Next support card' }).click();
    assert.notEqual(await reducedPage.evaluate(() => JSON.stringify(window.MorSupport.getState())), reducedState, 'manual navigation must remain available in reduced motion');
    await reduced.close();

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const mobilePage = await mobile.newPage(); watch(mobilePage);
    await mobilePage.goto(`${base}/games/retro_screensaver.html?mode=mor&v=mobile`);
    assert.ok(await mobilePage.getByRole('button', { name: 'Next support card' }).isVisible());
    assert.ok(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await mobilePage.screenshot({ path: path.join(out, 'mor-support-390x844.png'), fullPage: true });
    await mobile.close();

    const offline = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const offlinePage = await offline.newPage(); watch(offlinePage);
    await offlinePage.goto(`${base}/arcade.html`);
    await offlinePage.evaluate(() => navigator.serviceWorker.ready);
    await offlinePage.reload();
    await offlinePage.waitForFunction(() => !!navigator.serviceWorker.controller);
    await offline.setOffline(true);
    await offlinePage.goto(`${base}/games/retro_screensaver.html?mode=mor&v=never-visited-mor`);
    assert.ok(await offlinePage.locator('#morMode').isVisible());
    await offline.close();

    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ result: 'PASS', screenshots: out, checks: ['normal mode preserved', 'desktop projector layout', 'ambient pixel change', '12-second auto card cycle', 'pause freezes pixels and clocks', 'manual previous/next/dots', 'fullscreen', 'reduced motion freeze with manual controls', 'mobile overflow', 'fresh-query offline', 'zero page errors'] }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
