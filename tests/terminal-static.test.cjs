const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('original arcade dashboard survives at arcade.html with all cabinets and links',()=>{
  const html=read('arcade.html');
  assert.match(html,/<title>AWANACADE — 80s\/90s Retro Bible Arcade<\/title>/);
  assert.ok((html.match(/class="game-card/g)||[]).length>=27);
  assert.ok((html.match(/href="games\//g)||[]).length>=23);
  for(const game of ['faith_dash','ark_deluge_physics','royalty_runway','super_tetra_16','phantom_manor','path_of_hallows','noah_ark_screensaver','flaming_sword_defense','noah_raindrop_rush']) assert.match(html,new RegExp(`games/${game}\\.html`));
  assert.match(html,/COVENANT TERMINAL/);
  assert.match(html,/sessionStorage\.removeItem/);
});

test('terminal landing includes safe session redirect and accessible hidden leader gate',()=>{
  const html=read('index.html');
  assert.match(html,/COVENANT\/\/TERMINAL/);
  assert.match(html,/try\s*\{[\s\S]*sessionStorage/);
  assert.match(html,/covenant-terminal-unlocked/);
  assert.match(html,/arcade\.html/);
  assert.match(html,/role="dialog"/);
  assert.match(html,/aria-label="Leader access"/);
  assert.match(html,/id="leader-code"/);
  assert.match(html,/id="command-input"/);
  assert.match(html,/Hint: type HELP/);
  assert.doesNotMatch(html,/Human logging system/);
  assert.doesNotMatch(html,/Authenticated Scripture/);
  assert.doesNotMatch(html,/God’s Command|God’s commands remain correct/);
  assert.doesNotMatch(html,/class="cursor"/);
  assert.match(html,/caret-color:\s*var\(--green\)/);
  assert.match(html,/id="continue-mission"/);
  assert.match(html,/id="reset-button"/);
  assert.match(html,/RUN FLOOD\.EXE/);
  assert.match(html,/LINK: DISCONNECTED/);
  for(const required of [
    'SYSTEM DOWN',
    'AWANACADE STATUS .... DOWN',
    'ARCADE CORE .... LOCKED',
    'FLOOD ARCHIVE .... CORRUPTED',
    'INTRUSION SIGNATURE .... MoR',
    'MoR claimed responsibility. Recover the Flood Archive.',
    'Restore the archive to bring AWANACADE online.'
  ]) assert.ok(html.includes(required),`missing boot context: ${required}`);
  assert.match(html,/className='boot-diagnostic'/);
  assert.match(html,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(html,/\.boot-row\{animation:none!important/);
  assert.doesNotMatch(html,/animation[^;}]*:\s*[^;}]*(?:flash|strobe)/i);
  assert.doesNotMatch(html,/eval\s*\(/);
});

test('manifest starts at terminal and service worker precaches all takeover files with a new cache',()=>{
  const manifest=JSON.parse(read('manifest.json'));
  assert.equal(manifest.start_url,'./index.html');
  const sw=read('sw.js');
  assert.match(sw,/awanacade-v27/);
  for(const asset of ['./index.html','./arcade.html','./js/terminal-missions.js']) assert.ok(sw.includes(`'${asset}'`),asset);
  assert.match(sw,/ignoreSearch:\s*true/);
});

test('leader documentation states activity-gate limitation and mission authoring contract',()=>{
  const docs=read('docs/COVENANT_TERMINAL.md');
  assert.match(docs,/activity gate/i);
  assert.match(docs,/source-visible/i);
  assert.match(docs,/AWANA/);
  assert.match(docs,/three.*hint/i);
  assert.match(docs,/accepted answers/i);
  assert.match(docs,/BIBLE RECORD/);
  assert.match(docs,/ARK STORY CHALLENGE/);
});
