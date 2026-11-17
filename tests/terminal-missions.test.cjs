const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCommand, createMission, evaluateAction, nextHint, STORAGE_KEY } = require('../js/terminal-missions.js');

test('parser forgives command case and outer whitespace but preserves argument syntax', () => {
  assert.deepEqual(parseCommand('  read   /archive/manifest.txt  '), { command: 'READ', rawArgs: '/archive/manifest.txt', args: ['/archive/manifest.txt'] });
  assert.equal(parseCommand('RUN RESTORE --VERIFY').command, 'RUN');
  assert.equal(parseCommand('RUN RESTORE --VERIFY').rawArgs, 'RESTORE --VERIFY');
  assert.equal(parseCommand('   ').error, 'EMPTY');
});

test('mission has nine reachable, varied puzzles and three hints each', () => {
  const mission = createMission();
  assert.equal(mission.puzzles.length, 9);
  assert.equal(new Set(mission.puzzles.map(p => p.id)).size, 9);
  for (const puzzle of mission.puzzles) {
    assert.equal(puzzle.hints.length, 3, puzzle.id);
    assert.ok(puzzle.accepts.length >= 1, puzzle.id);
    assert.match(puzzle.prompt, /OPERATOR /);
  }
  assert.ok(mission.puzzles.some(p => p.accepts.some(a => /7-2-9-4/.test(a.value || ''))));
  assert.ok(!mission.puzzles.some(p => p.accepts.some(a => /^(1[- ]?2[- ]?3[- ]?4)$/.test(a.value || ''))));
  assert.equal(STORAGE_KEY, 'covenant-terminal-progress-v1');
});

test('every puzzle accepts its intended action and rejects a wrong answer without progress', () => {
  const mission = createMission();
  const intended = [
    'READ /archive/manifest.txt',
    'ANSWER 50 CUBITS',
    'ANSWER ALL',
    'ANSWER 7-2-9-4',
    'ANSWER DOVE',
    'REPAIR LAMP --A=ON --B=OFF',
    'TRACK --EAST --BAY=3',
    'READ /archive/final.key',
    'RUN RESTORE --VERIFY'
  ];
  mission.puzzles.forEach((puzzle, index) => {
    const wrong = evaluateAction(puzzle, parseCommand('ANSWER 1234'));
    assert.equal(wrong.ok, false, puzzle.id);
    const right = evaluateAction(puzzle, parseCommand(intended[index]));
    assert.equal(right.ok, true, puzzle.id);
  });
});

test('syntax errors differ from incorrect solutions', () => {
  const mission = createMission();
  const dimensions = mission.puzzles[1];
  assert.equal(evaluateAction(dimensions, parseCommand('ANSWER')).kind, 'SYNTAX');
  assert.equal(evaluateAction(dimensions, parseCommand('ANSWER 40')).kind, 'INCORRECT');
  const circuit = mission.puzzles[5];
  assert.equal(evaluateAction(circuit, parseCommand('REPAIR LAMP A ON B OFF')).kind, 'SYNTAX');
});

test('text answers accept reasonable variants without weakening exact command puzzles', () => {
  const mission = createMission();
  assert.equal(evaluateAction(mission.puzzles[1], parseCommand('answer width is 50 cubits')).ok, true);
  assert.equal(evaluateAction(mission.puzzles[4], parseCommand('answer a dove')).ok, true);
  assert.equal(evaluateAction(mission.puzzles[8], parseCommand('run restore verify')).ok, false);
  assert.equal(evaluateAction(mission.puzzles[8], parseCommand('RUN RESTORE --VERIFY')).ok, true);
});

test('hint progression is bounded at three and resettable per puzzle', () => {
  const state = { hints: {} };
  assert.equal(nextHint(state, 'p1'), 0);
  assert.equal(nextHint(state, 'p1'), 1);
  assert.equal(nextHint(state, 'p1'), 2);
  assert.equal(nextHint(state, 'p1'), 2);
  assert.equal(nextHint(state, 'p2'), 0);
});

test('fictional technology and dinosaur claims are explicitly labeled while Scripture remains accurate', () => {
  const mission = createMission();
  const text = JSON.stringify(mission);
  assert.match(text, /Genesis 6:15/);
  assert.match(text, /300 cubits long, 50 cubits wide, and 30 cubits high/);
  assert.match(text, /Genesis 6:22/);
  assert.match(text, /God’s commands remain correct|God's commands remain correct/);
  const fictional = mission.puzzles.filter(p => /lamp|dinosaur|support system/i.test(JSON.stringify(p)));
  assert.ok(fictional.length >= 2);
  fictional.forEach(p => assert.match(JSON.stringify(p), /\[FICTIONAL TRAINING SIMULATION\]/));
  assert.doesNotMatch(text, /God.{0,20}(bug|mistake|debug|corrupt)/i);
});
