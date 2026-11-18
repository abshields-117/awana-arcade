(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CovenantTerminalMissions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'covenant-terminal-progress-v1';
  const UNLOCK_KEY = 'covenant-terminal-unlocked';
  const COMMANDS = ['HELP', 'STATUS', 'LOG', 'HISTORY', 'MISSION', 'FILES', 'READ', 'SCAN', 'ANSWER', 'HINT', 'CLEAR', 'MAP', 'REPAIR', 'TRACK', 'RUN', 'RELOAD', 'ACCESS', 'UNLOCK'];

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
      intro: 'SYSTEM DOWN // MoR claimed responsibility.\nRecover the Flood Archive to bring Awanacade back online.\nBIBLE RECORD = what Genesis says. ARK STORY CHALLENGE = our adventure.',
      reveal: 'MoR // MEN OF RENOWN // archive signature',
      premise: 'BIBLE RECORD: Genesis is the source. ARK STORY CHALLENGE: restore the human archive.',
      puzzles: [
        {
          id: 'manifest', operator: 'MIRIAM',
          prompt: 'OPERATOR MIRIAM // Open the mission manifest at /archive/manifest.txt.',
          guide: 'TYPE: READ /archive/manifest.txt', route: 'READ /archive/manifest.txt',
          help: ['READ opens a file. Example: READ /folder/file.txt'],
          files: ['/archive/manifest.txt', '/records/genesis-6-15.txt'],
          read: { '/archive/manifest.txt': 'MANIFEST: FLOOD ARCHIVE // AUTHORITY: SCRIPTURE // NEXT RECORD: Genesis 6:15' },
          scan: 'Path integrity: /archive/manifest.txt is readable.',
          accepts: [exact('READ', '/archive/manifest.txt')],
          syntax: 'READ /path/file.txt',
          success: '✓ PATH OPENED // Commands tell the computer what to do.' ,
          hints: ['The command is READ.', 'Put READ before the path shown above.', 'Type: READ /archive/manifest.txt']
        },
        {
          id: 'dimensions', operator: 'EZRA',
          prompt: 'OPERATOR EZRA // BIBLE RECORD — Genesis 6:15 says the ark was 300 cubits long, 50 cubits wide, and 30 cubits high. What was its width?',
          guide: 'TYPE: ANSWER your answer', route: 'ANSWER 50 CUBITS',
          help: ['ANSWER sends your solution. Example: ANSWER 12 CUBITS'],
          files: ['/records/genesis-6-15.txt'],
          read: { '/records/genesis-6-15.txt': 'AUTHENTICATED REFERENCE — Genesis 6:15 // 300 cubits long, 50 cubits wide, and 30 cubits high.' },
          scan: 'Checksum points to the width field.',
          accepts: [regex('ANSWER', '^(?:THE )?(?:WIDTH (?:IS )?)?50(?: CUBITS?)?$')],
          syntax: 'ANSWER your answer', success: '✓ WIDTH RESTORED // 50 cubits.',
          hints: ['Look at the middle measurement.', 'The width comes after 300 cubits long.', 'Type: ANSWER 50 CUBITS']
        },
        {
          id: 'altered-word', operator: 'NOA',
          prompt: 'OPERATOR NOA // BIBLE RECORD — Genesis 6:22 says, “Thus Noah did; according to all that God commanded him, so he did.” The damaged copy lost one word after “according to.” Which word?',
          guide: 'TYPE: ANSWER the missing word', route: 'ANSWER ALL',
          help: ['ANSWER sends one word. Example: ANSWER READY'],
          files: ['/records/genesis-6-22.auth', '/records/genesis-6-22.corrupt'],
          read: { '/records/genesis-6-22.auth': 'AUTHENTICATED REFERENCE — Genesis 6:22 // “Thus Noah did; according to all that God commanded him, so he did.”', '/records/genesis-6-22.corrupt': 'UNRELIABLE HUMAN LOG // “Noah did; according to what God commanded him, so he did.”' },
          scan: 'One word was deleted after “according to”.',
          accepts: [regex('ANSWER', '^(?:THE )?WORD ALL$'), regex('ANSWER', '^(?:ALL|EVERYTHING)$')],
          syntax: 'ANSWER the missing word', success: '✓ WORD RESTORED // Careful reading catches changes.',
          hints: ['Read the quote one phrase at a time.', 'Look after “according to.”', 'Type: ANSWER ALL']
        },
        {
          id: 'sequence', operator: 'CALEB',
          prompt: 'OPERATOR CALEB // Order the log IDs: 9=enter ark, 2=bring food, 4=waters rise, 7=build as commanded. Build → food → enter → waters.',
          guide: 'TYPE: ANSWER four IDs separated by commas', route: 'ANSWER 7,2,9,4',
          help: ['Join four IDs with commas. Example: ANSWER 8,5,3,1'],
          files: ['/logs/shuffled-preparation.log'], read: { '/logs/shuffled-preparation.log': 'ID 9 enter ark // ID 2 bring food // ID 4 waters rise // ID 7 build as commanded' },
          scan: 'Dependency: build → provisions → entry → waters.',
          accepts: [exact('ANSWER', '7,2,9,4'), regex('ANSWER', '^7,\\s*2,\\s*9,\\s*4$')],
          syntax: 'ANSWER N,N,N,N', success: '✓ LOG ORDERED // Computers follow sequence.',
          hints: ['Build comes first; waters come last.', 'Food comes before entering; separate the IDs with commas.', 'Type: ANSWER 7,2,9,4']
        },
        {
          id: 'ascii-animal', operator: 'TIRZAH',
          prompt: 'OPERATOR TIRZAH // BIBLE RECORD — Genesis 8:11 describes a bird returning with an olive leaf. Identify it:\n       __\n  ____/ o>\n <___  /  *olive leaf*\n     \\/',
          guide: 'TYPE: ANSWER the bird', route: 'ANSWER DOVE',
          help: ['Name the bird after ANSWER. Example: ANSWER ROBIN'],
          files: ['/records/genesis-8-11.txt'], read: { '/records/genesis-8-11.txt': 'AUTHENTICATED REFERENCE — Genesis 8:11 // The dove returned with a freshly plucked olive leaf.' },
          scan: 'ASCII silhouette: small bird carrying a leaf.', accepts: [regex('ANSWER', '^(?:A |THE )?DOVE$')],
          syntax: 'ANSWER the bird name', success: '✓ BIRD IDENTIFIED // Text can draw pictures.',
          hints: ['The olive leaf is the key.', 'It begins with D.', 'Type: ANSWER DOVE']
        },
        {
          id: 'lamp-logic', operator: 'JONAH',
          prompt: 'OPERATOR JONAH // ARK STORY CHALLENGE — Lamp is ON only when switch A is ON and switch B is OFF. Set both flags.',
          guide: 'NEXT COMMAND: REPAIR LAMP --A=state --B=state', route: 'REPAIR LAMP --A=ON --B=OFF',
          help: ['Flags begin with --. Example: REPAIR FAN --A=OFF --B=ON'],
          files: ['/sim/lamp-circuit.logic'], read: { '/sim/lamp-circuit.logic': 'ARK STORY CHALLENGE // LAMP = A AND NOT B' }, scan: 'ARK STORY CHALLENGE // A must be true; B must be false.',
          accepts: [exact('REPAIR', 'LAMP --A=ON --B=OFF')], syntax: 'REPAIR LAMP --A=ON|OFF --B=ON|OFF',
          success: 'ARK STORY CHALLENGE // ✓ LAMP FIXED // Flags change a command.',
          hints: ['A needs the ON state.', 'B needs the OFF state.', 'Type: REPAIR LAMP --A=ON --B=OFF']
        },
        {
          id: 'dinosaur-track', operator: 'DEBORAH',
          prompt: 'OPERATOR DEBORAH // ARK STORY CHALLENGE — A dinosaur crosses the green camera view. Compare its position in the frames. Which route matches?\nFRAME 1  | [D] . . . . . |\nFRAME 2  | . . [D] . . . |\nFRAME 3  | . . . . . [D] |\nA) RIGHT then LEFT   B) LEFT then RIGHT   C) LEFT then LEFT',
          guide: 'TYPE: ANSWER A, B, or C', route: 'ANSWER B',
          help: ['Compare the first and last positions. Example: ANSWER C'],
          files: ['/sim/security/frame-1.asc', '/sim/security/frame-2.asc', '/sim/security/frame-3.asc'],
          read: { '/sim/security/frame-1.asc': 'ARK STORY CHALLENGE // FRAME 1 | [D] . . . . . |', '/sim/security/frame-2.asc': 'ARK STORY CHALLENGE // FRAME 2 | . . [D] . . . |', '/sim/security/frame-3.asc': 'ARK STORY CHALLENGE // FRAME 3 | . . . . . [D] |' },
          scan: 'ARK STORY CHALLENGE // Follow the moving [D] across three frames.', accepts: [exact('ANSWER', 'B'), exact('ANSWER', 'LEFT THEN RIGHT')],
          syntax: 'ANSWER A, B, or C', success: 'ARK STORY CHALLENGE // ✓ ROUTE FOUND // You compared the frames.',
          hints: ['Find [D] in each frame.', 'It starts on the left and ends on the right.', 'Choose the option for LEFT then RIGHT.']
        },
        {
          id: 'caesar-path', operator: 'SAMUEL',
          prompt: 'OPERATOR SAMUEL // Shift each letter back 3: UHDG /ILQDO.NHB\nU→R, H→E, D→A.',
          guide: 'TYPE: decoded command and path', route: 'READ /final.key',
          help: ['Keep slashes and the period. Example: SFBE becomes READ after shifting back 1.'],
          files: ['/tools/caesar-note.txt', '/final.key'], read: { '/tools/caesar-note.txt': 'Shift each letter backward by 3.', '/final.key': 'FINAL DIRECTIVE READY // Type RELOAD to restore service.' },
          scan: 'U→R, H→E, D→A.', accepts: [exact('READ', '/final.key')],
          syntax: 'READ /decoded/path', success: '✓ CODE DECODED // Letter shifts transform text.',
          hints: ['Shift each letter back three.', 'ILQDO becomes FINAL.', 'Type: READ /final.key']
        },
        {
          id: 'restore', operator: 'RUTH',
          prompt: 'OPERATOR RUTH // The archive is ready. Type the precise word that brings the service back: RELOAD.',
          guide: 'NEXT COMMAND: RELOAD', route: 'RELOAD',
          help: ['Type the single command shown above. Example: STATUS'],
          files: ['/final.key'], read: { '/final.key': 'FINAL DIRECTIVE READY // Type RELOAD to restore service.' }, scan: 'Service ready for RELOAD.',
          accepts: [exact('RELOAD', '')], syntax: 'RELOAD',
          success: '✓ ARCHIVE RESTORED // Team succeeded.',
          hints: ['It is one word.', 'It starts with RE.', 'Type: RELOAD']
        }
      ]
    };
  }

  function evaluateAction(puzzle, parsed) {
    if (!parsed || parsed.error) return { ok: false, kind: 'EMPTY', message: 'SYNTAX — Type a command.' };
    if (!COMMANDS.includes(parsed.command)) return { ok: false, kind: 'UNKNOWN', message: `COMMAND NOT FOUND — ${parsed.command}. Type HELP.` };
    const relevant = puzzle.accepts.filter(a => a.command === parsed.command);
    if (!relevant.length) return { ok: false, kind: 'INCORRECT', message: `ANSWER INCORRECT — Try this step’s instruction. Format: ${puzzle.syntax}` };
    if (puzzle.id === 'restore' && parsed.command === 'RELOAD') return parsed.rawArgs
      ? { ok: false, kind: 'SYNTAX', message: 'SYNTAX — Type only RELOAD.' }
      : { ok: true, kind: 'SUCCESS', message: puzzle.success };
    if (!parsed.rawArgs) return { ok: false, kind: 'SYNTAX', message: `SYNTAX — Add the missing part. Format: ${puzzle.syntax}` };
    const candidate = parsed.rawArgs.trim();
    const ok = relevant.some(rule => rule.type === 'exact'
      ? candidate.toUpperCase() === rule.value.toUpperCase()
      : new RegExp(rule.value, 'i').test(candidate));
    if (ok) return { ok: true, kind: 'SUCCESS', message: puzzle.success };
    const malformed = puzzle.id === 'lamp-logic' && !/^LAMP\s+--A=(?:ON|OFF)\s+--B=(?:ON|OFF)$/i.test(candidate)
      || puzzle.id === 'sequence' && !/^\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+$/i.test(candidate)
      || puzzle.id === 'dinosaur-track' && !/^(?:A|B|C|LEFT THEN RIGHT)$/i.test(candidate);
    return malformed
      ? { ok: false, kind: 'SYNTAX', message: `SYNTAX — The computer needs this shape: ${puzzle.syntax}` }
      : { ok: false, kind: 'INCORRECT', message: `ANSWER INCORRECT — Good try. Recheck the clue or type HINT. Format: ${puzzle.syntax}` };
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
