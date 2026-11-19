const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function supportCards(html) {
  const match = html.match(/<script id="mor-card-data" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'MoR support card data is missing');
  return JSON.parse(match[1]);
}

test('boot displays the outage story and launcher waits for continuation', () => {
  const html = read('index.html');
  const missionSource = read('js/terminal-missions.js');
  const bootBody = html.match(/function boot\(\)[\s\S]*?\nfunction openArcade/)[0];
  assert.match(bootBody, /addBootDiagnostic\(\)/);
  assert.match(html, /SYSTEM DOWN/);
  assert.match(html, /INTRUSION SIGNATURE \.\.\.\. MoR/);
  assert.match(html, /claimed responsibility/);
  assert.match(missionSource, /MoR claimed responsibility/);
  assert.match(html, /id="continue-mission"/);
  assert.match(html, /id="reset-confirm"/);
  assert.match(html, /id="leader-access"/);
  assert.doesNotMatch(html + missionSource, /fictional training|dinosaur prop|simulation/i);
  assert.match(html, /mission\.intro/);
  assert.doesNotMatch(missionSource, /(?:biblical|Bible|Genesis).*men of renown.{0,80}(?:computer|cyber|hack)/i);
  assert.doesNotMatch(missionSource, /God.{0,30}(?:debug|hack|compromis|corrupt|repair|restore)/i);
});

test('retro normal mode remains intact and MoR mode is selected only by query', () => {
  const html = read('games/retro_screensaver.html');
  for (const fn of ['drawMatrixTheme', 'drawLinuxTheme', 'drawHackerTheme', 'drawC64Theme', 'drawDosTheme', 'drawSynthwaveTheme']) assert.match(html, new RegExp(`function ${fn}\\(`));
  assert.match(html, /new URLSearchParams\(location\.search\)\.get\('mode'\)/);
  assert.match(html, /===\s*'mor'/);
  assert.match(html, /id="retroMode"/);
  assert.match(html, /id="morMode"/);
  assert.match(html, /if\s*\(!isMorMode\)/);
});

test('MoR support cards teach general terminal literacy without puzzle solutions', () => {
  const cards = supportCards(read('games/retro_screensaver.html'));
  assert.ok(cards.length >= 10);
  const text = cards.map(card => `${card.kicker} ${card.title} ${card.body}`).join('\n');
  for (const required of [
    'START: HELP → RUN FLOOD.EXE', 'HELP', 'HINT', 'STATUS', 'LOG',
    'COMMAND TARGET --OPTION=VALUE', 'spaces matter', 'COMMAND NOT FOUND',
    'SYNTAX', 'ANSWER INCORRECT', 'Arrow-Up', 'Backspace', 'Enter',
    'Reader', 'Operator', 'Checker', 'Researcher', 'three levels',
    'BIBLE RECORD', 'no countdown', 'Do not refresh the player screen'
  ]) assert.ok(text.toLowerCase().includes(required.toLowerCase()), `missing card guidance: ${required}`);
  for (const spoiler of [
    '50 CUBITS', 'ANSWER ALL', '7,2,9,4', 'ANSWER DOVE',
    'REPAIR LAMP', 'ANSWER B', '/final.key', 'RELOAD'
  ]) assert.doesNotMatch(text, new RegExp(spoiler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `spoiler leaked: ${spoiler}`);
});

test('MoR support mode has projector controls, timing, pause clocks, and reduced-motion freeze', () => {
  const html = read('games/retro_screensaver.html');
  for (const id of ['mor-prev', 'mor-next', 'mor-pause', 'mor-fullscreen', 'mor-dots']) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(html, /const MOR_CARD_MS\s*=\s*(?:1[0-5]\d{3}|10000)/);
  assert.match(html, /requestAnimationFrame\(drawMorFrame\)/);
  assert.match(html, /cancelAnimationFrame/);
  assert.match(html, /performance\.now\(\)\s*-\s*morCardStarted/);
  assert.match(html, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /requestFullscreen/);
  assert.match(html, /@media\s*\(max-width:\s*600px\)/);
});

test('hub exposes support display outside cabinet count and offline cache stays canonical', () => {
  const arcade = read('arcade.html');
  const cabinet = arcade.match(/<div class="arcade-grid" id="arcade-games">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/)?.[1] || '';
  assert.doesNotMatch(cabinet, /mode=mor/);
  assert.match(arcade, /id="visual-support"/);
  assert.match(arcade, /games\/retro_screensaver\.html\?mode=mor&v=3/);
  assert.match(arcade, /MoR Support Display/i);
  const sw = read('sw.js');
  assert.match(sw, /awanacade-v27/);
  assert.equal((sw.match(/'\.\/games\/retro_screensaver\.html'/g) || []).length, 1);
  assert.match(sw, /ignoreSearch:\s*true/);
  const workflow = read('.github/workflows/game-tests.yml');
  assert.match(workflow, /mor-support-browser\.cjs/);
});

test('MoR card JSON contains no executable markup or external dependencies', () => {
  const html = read('games/retro_screensaver.html');
  const cards = supportCards(html);
  assert.ok(cards.every(card => Object.keys(card).sort().join(',') === 'body,kicker,title'));
  assert.doesNotMatch(JSON.stringify(cards), /<script|onerror=|javascript:/i);
  assert.doesNotMatch(html, /https?:\/\//i);
  const sandbox = { JSON };
  vm.createContext(sandbox);
  assert.doesNotThrow(() => vm.runInContext(`JSON.parse(${JSON.stringify(JSON.stringify(cards))})`, sandbox));
});
