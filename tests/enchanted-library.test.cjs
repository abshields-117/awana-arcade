const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, '..', 'enchanted-library.html');
test('standalone story presenter exists with safe physical-sheet directions', () => {
 assert.ok(fs.existsSync(file), 'presenter file exists');
 const html = fs.readFileSync(file, 'utf8');
 for (const text of ['You step into the old library', 'Your adventure begins now!', 'ONLY on your answer sheet', 'four-digit code to your leader', 'Everyone is safe']) assert.ok(html.includes(text), text);
 assert.ok(!/<(?:input|textarea|iframe|audio)\b/i.test(html));
 assert.ok(!/<script[^>]+src=|https?:\/\//i.test(html));
 assert.ok(!/answerKey|correctCode|secretCode|solution\s*[:=]/i.test(html));
});
