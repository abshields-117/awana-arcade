const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCommand, createMission, evaluateAction, nextHint, STORAGE_KEY } = require('../js/terminal-missions.js');

test('parser forgives command case and outer whitespace but preserves argument syntax', () => {
  assert.deepEqual(parseCommand('  read   /archive/manifest.txt  '), { command: 'READ', rawArgs: '/archive/manifest.txt', args: ['/archive/manifest.txt'] });
  assert.equal(parseCommand('RUN RESTORE --VERIFY').command, 'RUN');
  assert.equal(parseCommand('RUN RESTORE --VERIFY').rawArgs, 'RESTORE --VERIFY');
  assert.equal(parseCommand('   ').error, 'EMPTY');
  assert.deepEqual(parseCommand('  run   flood.exe  '), { command: 'RUN', rawArgs: 'flood.exe', args: ['flood.exe'] });
});

test('mission has nine reachable, varied puzzles and three hints each', () => {
  const mission = createMission();
  assert.equal(mission.puzzles.length, 9);
  assert.equal(new Set(mission.puzzles.map(p => p.id)).size, 9);
  for (const puzzle of mission.puzzles) {
    assert.equal(puzzle.hints.length, 3, puzzle.id);
    assert.ok(puzzle.accepts.length >= 1, puzzle.id);
    assert.match(puzzle.prompt, /OPERATOR /);
    assert.match(puzzle.guide, /^(TYPE|NEXT COMMAND):/);
    assert.ok(!/\b(?:FILES|MISSION|MAP|SCAN)\b/.test(puzzle.guide), `${puzzle.id} requires discovery`);
  }
  assert.ok(mission.puzzles.some(p => p.accepts.some(a => /7,2,9,4/.test(a.value || ''))));
  assert.ok(!mission.puzzles.some(p => p.accepts.some(a => /^(1[- ]?2[- ]?3[- ]?4)$/.test(a.value || ''))));
  assert.equal(STORAGE_KEY, 'covenant-terminal-progress-v1');
});

test('all nine puzzles expose a complete guided route without discovery commands', () => {
  const mission = createMission();
  const route = mission.puzzles.map(p => p.route);
  assert.deepEqual(route, [
    'READ /archive/manifest.txt', 'ANSWER 50 CUBITS', 'ANSWER ALL',
    'ANSWER 7,2,9,4', 'ANSWER DOVE', 'REPAIR LAMP --A=ON --B=OFF',
    'ANSWER B', 'READ /final.key', 'RELOAD'
  ]);
  mission.puzzles.forEach((puzzle) => assert.equal(evaluateAction(puzzle, parseCommand(puzzle.route)).ok, true, puzzle.id));
});

test('context help stays short and teaches one relevant syntax without revealing answers', () => {
  const mission = createMission();
  for (const puzzle of mission.puzzles) {
    assert.ok(puzzle.help.length <= 2, puzzle.id);
    assert.match(puzzle.help.join('\n'), /Example:/);
    assert.ok(!puzzle.help.join('\n').includes(puzzle.route), `${puzzle.id} help revealed route`);
  }
});

test('every puzzle accepts its intended action and rejects a wrong answer without progress', () => {
  const mission = createMission();
  const intended = [
    'READ /archive/manifest.txt',
    'ANSWER 50 CUBITS',
    'ANSWER ALL',
    'ANSWER 7,2,9,4',
    'ANSWER DOVE',
    'REPAIR LAMP --A=ON --B=OFF',
    'ANSWER B',
    'READ /final.key',
    'RELOAD'
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
  assert.match(evaluateAction(dimensions, parseCommand('ANSWER')).message, /^SYNTAX —/);
  assert.match(evaluateAction(dimensions, parseCommand('ANSWER 40')).message, /^ANSWER INCORRECT —/);
  assert.match(evaluateAction(dimensions, parseCommand('NOPE')).message, /^COMMAND NOT FOUND —/);
});

test('text answers accept reasonable variants without weakening exact command puzzles', () => {
  const mission = createMission();
  assert.equal(evaluateAction(mission.puzzles[1], parseCommand('answer width is 50 cubits')).ok, true);
  assert.equal(evaluateAction(mission.puzzles[4], parseCommand('answer a dove')).ok, true);
  assert.equal(evaluateAction(mission.puzzles[2], parseCommand('  answer everything  ')).ok, true);
  assert.equal(evaluateAction(mission.puzzles[3], parseCommand('answer 7, 2, 9, 4')).ok, true);
  assert.equal(evaluateAction(mission.puzzles[3], parseCommand('ANSWER 1234')).ok, false);
  assert.equal(evaluateAction(mission.puzzles[6], parseCommand('answer a')).ok, false);
  assert.equal(evaluateAction(mission.puzzles[8], parseCommand('run restore verify')).ok, false);
  assert.equal(evaluateAction(mission.puzzles[8], parseCommand(' reload ')).ok, true);
});

test('hint progression is bounded at three and resettable per puzzle', () => {
  const state = { hints: {} };
  assert.equal(nextHint(state, 'p1'), 0);
  assert.equal(nextHint(state, 'p1'), 1);
  assert.equal(nextHint(state, 'p1'), 2);
  assert.equal(nextHint(state, 'p1'), 2);
  assert.equal(nextHint(state, 'p2'), 0);
});

test('Bible record is distinct from Ark story challenge without intrusive labels', () => {
  const mission = createMission();
  const text = JSON.stringify(mission);
  assert.match(text, /Genesis 6:15/);
  assert.match(text, /300 cubits long, 50 cubits wide, and 30 cubits high/);
  assert.match(text, /Genesis 6:22/);
  assert.match(text, /BIBLE RECORD/);
  assert.match(text, /ARK STORY CHALLENGE/);
  const fictional = mission.puzzles.filter(p => /lamp|dinosaur|support system/i.test(JSON.stringify(p)));
  assert.ok(fictional.length >= 2);
  fictional.forEach(p => assert.match(JSON.stringify(p), /ARK STORY CHALLENGE/));
  assert.doesNotMatch(text, /fictional training|dinosaur prop|simulation/i);
  assert.doesNotMatch(text, /God.{0,20}(bug|mistake|debug|corrupt)/i);
});
