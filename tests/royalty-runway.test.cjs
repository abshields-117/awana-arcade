const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const gamePath = path.join(root, 'games', 'royalty_runway.html');

test('Royalty Runway standalone file exists and has zero external dependencies', () => {
  assert.ok(fs.existsSync(gamePath), 'games/royalty_runway.html must exist');
  const html = fs.readFileSync(gamePath, 'utf8');

  // Must have no external scripts, styles, or images (100% offline & self-contained)
  assert.doesNotMatch(html, /<(?:script|link|img)[^>]+(?:src|href)=["']https?:/i, 'No external resources allowed');
  assert.match(html, /<!DOCTYPE html>/i);
  assert.match(html, /<title>Royalty Runway/i);
});

test('Royalty Runway implements all core storyboard elements from Brett Shields', () => {
  const html = fs.readFileSync(gamePath, 'utf8');

  // 1. Dressing stage & mirror
  assert.match(html, /id="stage-canvas"/);
  assert.match(html, /class="mirror-frame"/);

  // 2. 3-Tier Wardrobe Rack
  assert.match(html, /id="tier1-rack"/, 'Tier 1 Black/Charcoal Evening wear');
  assert.match(html, /id="tier2-rack"/, 'Tier 2 Ocean Blue Stripes');
  assert.match(html, /id="tier3-rack"/, 'Tier 3 Coral & Pink Ruffles');

  // 3. Color Fabric Dyes (Teal, Coral, Purple swatches)
  assert.match(html, /id="primary-dye-swatches"/);
  assert.match(html, /id="accent-dye-swatches"/);
  assert.match(html, /Storyboard Sky Teal/);
  assert.match(html, /Storyboard Sunset Coral/);
  assert.match(html, /Storyboard Royal Purple/);

  // 4. Gem & Jewelry Tray
  assert.match(html, /id="gem-swatches"/);
  assert.match(html, /Ruby of Joy/);
  assert.match(html, /Sapphire Peace/);

  // 5. Runway Walk & Camera Flashes
  assert.match(html, /id="walk-runway-btn"/);
  assert.match(html, /id="runway-canvas"/);
  assert.match(html, /data-pose="wave"/);
  assert.match(html, /data-pose="twirl"/);
  assert.match(html, /data-pose="sparkle"/);

  // 6. Judges & Stars
  assert.match(html, /judge-1-stars/);
  assert.match(html, /judge-2-stars/);
  assert.match(html, /judge-3-stars/);

  // 7. Podium Celebration & Dad Joke
  assert.match(html, /id="podium-modal"/);
  assert.match(html, /1ST PLACE ROYAL CHAMPION/);
  assert.match(html, /id="podium-dad-joke"/);
  assert.match(html, /id="save-photo-btn"/);
});

test('Royalty Runway is integrated into hub and offline service worker', () => {
  const hub = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

  assert.match(hub, /href="games\/royalty_runway\.html"/);
  assert.match(hub, /ROYALTY RUNWAY/);
  assert.match(sw, /'\.\/games\/royalty_runway\.html'/);
});
