(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CovenantTerminalMissions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'covenant-terminal-progress-v1';
  const UNLOCK_KEY = 'covenant-terminal-unlocked';
  const COMMANDS = ['HELP', 'STATUS', 'MISSION', 'FILES', 'READ', 'SCAN', 'ANSWER', 'HINT', 'CLEAR', 'MAP', 'REPAIR', 'TRACK', 'RUN'];

  function parseCommand(input) {
    const source = String(input == null ? '' : input).trim();
    if (!source) return { error: 'EMPTY', command: '', rawArgs: '', args: [] };
    const match = source.match(/^(\S+)(?:\s+([\s\S]*?))?$/);
    const command = match[1].toUpperCase();
    const rawArgs = (match[2] || '').trim();
    return { command, rawArgs, args: rawArgs ? rawArgs.split(/\s+/) : [] };
  }

  function exact(command, value) { return { command, type: 'exact', value }; }
  function regex(command, value) { return { command, type: 'regex', value }; }

  function createMission() {
    return {
      id: 'corrupted-flood-archive',
      title: 'COVENANT//TERMINAL: The Corrupted Flood Archive',
      premise: 'An unreliable human logging system corrupted records and fictional Ark support simulations. God’s commands remain correct; Scripture is the authenticated source.',
      puzzles: [
        {
          id: 'manifest', operator: 'MIRIAM', prompt: 'OPERATOR MIRIAM // Learn the archive path. List files, then open the mission manifest.',
          files: ['/archive/manifest.txt', '/records/genesis-6-15.txt'],
          read: { '/archive/manifest.txt': 'MANIFEST: FLOOD ARCHIVE // AUTHORITY: SCRIPTURE // NEXT RECORD: Genesis 6:15' },
          scan: 'Path integrity: /archive/manifest.txt is readable.',
          accepts: [exact('READ', '/archive/manifest.txt')],
          syntax: 'Use READ followed by one exact path. Example: READ /folder/file.txt',
          success: 'Path opened. Commands tell the terminal what to do; arguments tell it where.',
          hints: ['FILES shows available paths.', 'Use READ with the manifest path.', 'Type: READ /archive/manifest.txt']
        },
        {
          id: 'dimensions', operator: 'EZRA', prompt: 'OPERATOR EZRA // Genesis 6:15 record damaged. “The ark is to be 300 cubits long, [MISSING] cubits wide, and 30 cubits high.” Recover the width.',
          files: ['/records/genesis-6-15.txt'],
          read: { '/records/genesis-6-15.txt': 'AUTHENTICATED REFERENCE — Genesis 6:15 // 300 cubits long, 50 cubits wide, and 30 cubits high.' },
          scan: 'Checksum points to the width field.',
          accepts: [regex('ANSWER', '^(?:THE )?(?:WIDTH (?:IS )?)?50(?: CUBITS?)?$')],
          syntax: 'ANSWER needs a solution after it. Example: ANSWER your solution',
          success: 'Width restored: 50 cubits. Careful reading recovers exact information.',
          hints: ['READ the Genesis 6:15 record.', 'Look at the middle dimension: length, width, height.', 'Type: ANSWER 50 CUBITS']
        },
        {
          id: 'altered-word', operator: 'NOA', prompt: 'OPERATOR NOA // Compare the corrupted line with Genesis 6:22. CORRUPTED: “Noah did; according to what God commanded him, so he did.” Which important word is missing?',
          files: ['/records/genesis-6-22.auth', '/records/genesis-6-22.corrupt'],
          read: {
            '/records/genesis-6-22.auth': 'AUTHENTICATED REFERENCE — Genesis 6:22 // “Thus Noah did; according to all that God commanded him, so he did.”',
            '/records/genesis-6-22.corrupt': 'UNRELIABLE HUMAN LOG // “Noah did; according to what God commanded him, so he did.”'
          },
          scan: 'One word was deleted after “according to”.',
          accepts: [regex('ANSWER', '^(?:THE )?WORD ALL$'), regex('ANSWER', '^ALL$')],
          syntax: 'Use ANSWER followed by the missing word.',
          success: 'Alteration found: ALL. Precise reading catches meaningful changes.',
          hints: ['READ both 6:22 files and compare word by word.', 'Check the phrase “according to ___ that God commanded”.', 'Type: ANSWER ALL']
        },
        {
          id: 'sequence', operator: 'CALEB', prompt: 'OPERATOR CALEB // Put the shuffled preparation log IDs in logical order: 9=enter ark, 2=bring food, 4=waters rise, 7=build as commanded. Enter IDs with hyphens.',
          files: ['/logs/shuffled-preparation.log'],
          read: { '/logs/shuffled-preparation.log': 'ID 9 enter ark // ID 2 bring food // ID 4 waters rise // ID 7 build as commanded' },
          scan: 'Dependency: build → provisions → entry → waters.',
          accepts: [exact('ANSWER', '7-2-9-4'), regex('ANSWER', '^7 2 9 4$')],
          syntax: 'Use ANSWER followed by four IDs separated with hyphens.',
          success: 'Sequence accepted: 7-2-9-4. Logic orders events even when storage is shuffled.',
          hints: ['SCAN reveals the dependency chain.', 'Build first; rising waters last.', 'Type: ANSWER 7-2-9-4']
        },
        {
          id: 'ascii-animal', operator: 'TIRZAH', prompt: 'OPERATOR TIRZAH // Identify this returning bird from the pattern and Genesis 8:11:\n       __\n  ____/ o>\n <___  /  *olive leaf*\n     \\/',
          files: ['/records/genesis-8-11.txt'],
          read: { '/records/genesis-8-11.txt': 'AUTHENTICATED REFERENCE — Genesis 8:11 // The dove returned with a freshly plucked olive leaf.' },
          scan: 'ASCII silhouette: small bird carrying a leaf.',
          accepts: [regex('ANSWER', '^(?:A |THE )?DOVE$')],
          syntax: 'Use ANSWER followed by the animal name.',
          success: 'Dove identified. Text patterns can encode pictures and evidence.',
          hints: ['READ the Genesis 8:11 file.', 'The leaf is the key detail.', 'Type: ANSWER DOVE']
        },
        {
          id: 'lamp-logic', operator: 'JONAH', prompt: 'OPERATOR JONAH // [FICTIONAL TRAINING SIMULATION] Repair a training lamp. Rule: lamp ON only when switch A is ON and switch B is OFF. Current A=OFF, B=ON.',
          files: ['/sim/lamp-circuit.logic'],
          read: { '/sim/lamp-circuit.logic': '[FICTIONAL TRAINING SIMULATION] LAMP = A AND NOT B // Repair syntax: REPAIR LAMP --A=ON --B=OFF' },
          scan: 'Truth test: A must be true; B must be false.',
          accepts: [exact('REPAIR', 'LAMP --A=ON --B=OFF')],
          syntax: 'Exact repair syntax required: REPAIR LAMP --A=ON --B=OFF',
          success: '[FICTIONAL TRAINING SIMULATION] Lamp circuit restored. Boolean logic combines true/false conditions.',
          hints: ['READ the circuit logic file.', 'AND requires A true; NOT B requires B false.', 'Type: REPAIR LAMP --A=ON --B=OFF']
        },
        {
          id: 'dinosaur-track', operator: 'DEBORAH', prompt: 'OPERATOR DEBORAH // [FICTIONAL TRAINING SIMULATION] Track a loose dinosaur prop in grainy security frames. F1 BAY1: tail at west door. F2 BAY2: tracks point right. F3 BAY3: crate shadow moves in from west. Report direction and bay.',
          files: ['/sim/security/frame-1.asc', '/sim/security/frame-2.asc', '/sim/security/frame-3.asc'],
          read: {
            '/sim/security/frame-1.asc': '[FICTIONAL TRAINING SIMULATION]\nW |~~~~TAIL          | E',
            '/sim/security/frame-2.asc': '[FICTIONAL TRAINING SIMULATION]\nW |  .. .. ..  >>>   | E',
            '/sim/security/frame-3.asc': '[FICTIONAL TRAINING SIMULATION]\nW |       /__/o      | E'
          },
          scan: '[FICTIONAL TRAINING SIMULATION] Motion vector: west → east. Latest frame: BAY 3.',
          accepts: [exact('TRACK', '--EAST --BAY=3')],
          syntax: 'Use TRACK with direction flag then bay flag: TRACK --DIRECTION --BAY=N',
          success: '[FICTIONAL TRAINING SIMULATION] Prop located in east Bay 3. Multiple frames support a direction deduction; this does not claim dinosaurs were aboard the Ark.',
          hints: ['SCAN summarizes movement without naming a command.', 'The tracks point east; the latest frame is Bay 3.', 'Type: TRACK --EAST --BAY=3']
        },
        {
          id: 'caesar-path', operator: 'SAMUEL', prompt: 'OPERATOR SAMUEL // Decode this Caesar-shifted file instruction. Each letter was shifted +3: UHDG /DUFKLYH/ILQDO.NHB',
          files: ['/tools/caesar-note.txt', '/archive/final.key'],
          read: {
            '/tools/caesar-note.txt': 'Shift each letter backward by 3. Keep slashes and the period.',
            '/archive/final.key': 'FINAL DIRECTIVE READY // Required command: RUN RESTORE --VERIFY'
          },
          scan: 'U→R, H→E, D→A, G→D.',
          accepts: [exact('READ', '/archive/final.key')],
          syntax: 'Decode the instruction, then use READ with the exact path.',
          success: 'Decoded path opened. Caesar shifts transform characters while file-path syntax stays exact.',
          hints: ['READ /tools/caesar-note.txt or SCAN for the shift.', 'UHDG becomes READ; DUFKLYH becomes ARCHIVE.', 'Type: READ /archive/final.key']
        },
        {
          id: 'restore', operator: 'RUTH', prompt: 'OPERATOR RUTH // Final directive loaded. Run the restore program and include its verification flag exactly.',
          files: ['/archive/final.key', '/bin/restore'],
          read: { '/archive/final.key': 'FINAL DIRECTIVE READY // Required command: RUN RESTORE --VERIFY' },
          scan: 'Program RESTORE requires flag --VERIFY. Flags modify how a command runs.',
          accepts: [exact('RUN', 'RESTORE --VERIFY')],
          syntax: 'Exact syntax required: RUN program --FLAG',
          success: 'ARCHIVE RESTORED // Team succeeded. Report to your leader for the earned treat.',
          hints: ['READ /archive/final.key.', 'Use RUN, program RESTORE, and the verification flag.', 'Type: RUN RESTORE --VERIFY']
        }
      ]
    };
  }

  function evaluateAction(puzzle, parsed) {
    if (!parsed || parsed.error) return { ok: false, kind: 'EMPTY', message: 'No command entered.' };
    const relevant = puzzle.accepts.filter(a => a.command === parsed.command);
    if (!relevant.length) {
      if (!COMMANDS.includes(parsed.command)) return { ok: false, kind: 'UNKNOWN', message: `Unknown command: ${parsed.command}. Type HELP.` };
      return { ok: false, kind: 'INCORRECT', message: 'That command works, but it does not solve this mission step.' };
    }
    if (!parsed.rawArgs) return { ok: false, kind: 'SYNTAX', message: puzzle.syntax };
    const candidate = parsed.rawArgs.trim();
    const ok = relevant.some(rule => rule.type === 'exact'
      ? candidate.toUpperCase() === rule.value.toUpperCase()
      : new RegExp(rule.value, 'i').test(candidate));
    if (ok) return { ok: true, kind: 'SUCCESS', message: puzzle.success };
    const looksMalformed = puzzle.id === 'lamp-logic' && !/^LAMP\s+--A=(?:ON|OFF)\s+--B=(?:ON|OFF)$/i.test(candidate)
      || puzzle.id === 'dinosaur-track' && !/^--(?:EAST|WEST)\s+--BAY=\d+$/i.test(candidate)
      || puzzle.id === 'restore' && !/^RESTORE\s+--[A-Z]+$/i.test(candidate);
    return looksMalformed
      ? { ok: false, kind: 'SYNTAX', message: puzzle.syntax }
      : { ok: false, kind: 'INCORRECT', message: 'Command understood; solution not accepted. Recheck the evidence or type HINT.' };
  }

  function nextHint(state, puzzleId) {
    state.hints = state.hints || {};
    const current = Number.isInteger(state.hints[puzzleId]) ? state.hints[puzzleId] : -1;
    const next = Math.min(2, current + 1);
    state.hints[puzzleId] = next;
    return next;
  }

  return { STORAGE_KEY, UNLOCK_KEY, COMMANDS, parseCommand, createMission, evaluateAction, nextHint };
});
