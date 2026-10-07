'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const file = path.join(__dirname, '../games/phantom_manor.html');
function load() {
  assert.ok(fs.existsSync(file), 'standalone Phantom Manor game exists');
  const html = fs.readFileSync(file, 'utf8');
  const script = html.match(/<script id="manor-engine">([\s\S]*?)<\/script>/);
  assert.ok(script, 'actual inline deterministic engine is present');
  const context = {window: {}, console};
  vm.runInNewContext(script[1], context, {filename: 'phantom-manor-engine.js'});
  return context.window.PhantomManor;
}
test('a new chapter has five hearts and starts in a safe foyer; reset clears progress', () => {
  const g = load();
  assert.equal(g.getState().mode, 'title');
  g.start();
  assert.equal(g.getState().room, 'foyer');
  assert.equal(g.getState().hearts, 5);
  assert.deepEqual(Array.from(g.getState().inventory), []);
  g.move(1, 0, .1);
  assert.ok(g.getState().x > 240);
  g.reset();
  assert.equal(g.getState().mode, 'title');
  assert.equal(g.getState().x, 240);
});
function walkTo(g, id) {
  const s = g.getState();
  const target = g.getRooms()[s.room].objects.find(o => o.id === id);
  assert.ok(target, `object ${id} exists in ${s.room}`);
  const start = [s.x, s.y];
  const queue = [[0, 0]], seen = new Set(['0,0']), prev = new Map();
  let end;
  for (let i=0; i<queue.length; i++) {
    const [a,b]=queue[i], x=start[0]+a*8, y=start[1]+b*8;
    if (Math.hypot(x-target.x,y-target.y)<29) { end=[a,b];break; }
    for (const [da,db] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const next=[a+da,b+db], key=next.join(',');
      if (!seen.has(key) && g.canWalk(start[0]+next[0]*8,start[1]+next[1]*8)) {
        seen.add(key);prev.set(key,[a,b]);queue.push(next);
      }
    }
  }
  assert.ok(end, `physical walk reaches ${id} from ${s.room}`);
  const path=[];
  while(end[0] || end[1]) {path.push(end);end=prev.get(end.join(','));}
  for (const p of path.reverse()) {
    const now=g.getState(), dx=start[0]+p[0]*8-now.x, dy=start[1]+p[1]*8-now.y;
    g.move(dx,dy,Math.hypot(dx,dy)/82);
  }
  assert.ok(Math.hypot(g.getState().x-target.x,g.getState().y-target.y)<30, `arrived at ${id}`);
}
function use(g,id) { walkTo(g,id);g.interact(id); }
function read(g,id) {use(g,id);g.closeDialog();}
function solve(g,id,answers) {use(g,id);for(const a of answers)g.choose(a);g.closeDialog();}
function reachAttic(g) {
  g.start(); read(g,'foyer-page');use(g,'to-library');
  read(g,'library-page'); solve(g,'books',['Seed','Tree','Stars']);
  use(g,'to-foyer'); use(g,'to-conservatory');
  read(g,'garden-page');solve(g,'wheel',['Rain','Sun','Moon']);
  use(g,'to-gallery');read(g,'gallery-page');read(g,'portrait');
  use(g,'to-garden');use(g,'to-clocktower');
  read(g,'clock-page');solve(g,'clock',['6','12','9']);use(g,'to-attic');read(g,'attic-page');
}
test('physical doors and three clue puzzles gate a reachable peaceful ending', () => {
  const g=load();g.start();
  g.interact('foyer-page');assert.equal(g.getState().journals.length,0,'no remote interaction');
  use(g,'to-conservatory');assert.equal(g.getState().room,'foyer','brass lock');
  read(g,'foyer-page');use(g,'to-library');
  use(g,'books');g.choose('Seed');assert.equal(g.getState().solved.length,0,'clue must be read first');g.closeDialog();
  read(g,'library-page');solve(g,'books',['Tree']);assert.equal(g.getState().solved.length,0,'wrong answer never grants key');
  solve(g,'books',['Seed','Tree','Stars']);assert.ok(g.getState().inventory.includes('brassKey'));
  read(g,'books');assert.equal(g.getState().inventory.filter(x=>x==='brassKey').length,1,'reward is idempotent');
  g.reset();reachAttic(g);
  assert.equal(g.getState().journals.length,6);assert.equal(g.getState().solved.length,3);
  use(g,'keeper');g.choose('alone');assert.notEqual(g.getState().mode,'won','story answer matters');
  g.choose('together');assert.equal(g.getState().mode,'won');
  g.reset();assert.equal(g.getState().inventory.length,0);assert.equal(g.getState().journals.length,0);
});
test('pause freezes inputs and mercy; five gentle hits reset checkpoint without losing progress', () => {
  const g=load();g.start();read(g,'foyer-page');use(g,'to-library');read(g,'library-page');solve(g,'books',['Seed','Tree','Stars']);
  for(let i=0;i<20;i++)g.tick(.1);
  const before=g.getState();g.togglePause();const paused=g.getState();
  g.move(1,1,1);g.interact();g.lantern();g.choose('Seed');g.hurt();g.tick(.1);g.setQuiet(true);
  assert.deepEqual(g.getState(),paused,'paused input cannot mutate the world');
  g.togglePause();g.hurt();assert.equal(g.getState().hearts,4);
  assert.equal(g.getState().mercy,1.5);g.hurt();assert.equal(g.getState().hearts,4,'mercy blocks repeat hits');
  for(let hit=0;hit<4;hit++){for(let i=0;i<16;i++)g.tick(.1);g.hurt();}
  assert.equal(g.getState().hearts,5);assert.equal(g.getState().x,before.checkpoint.x);
  assert.deepEqual(g.getState().inventory,before.inventory);assert.deepEqual(g.getState().journals,before.journals);
  assert.equal(g.getState().solved.length,1);assert.ok(g.getState().message.includes('kept'));
});
test('lantern reveals a reversible shortcut and quiet walking changes detection', () => {
  const g=load();g.start();g.lantern();assert.equal(g.getState().lantern,0,'amulet prerequisite');
  reachAttic(g);use(g,'to-clocktower');use(g,'to-garden');use(g,'to-gallery');walkTo(g,'passage');
  g.interact('passage');assert.equal(g.getState().room,'gallery');
  g.lantern();assert.equal(g.getState().passage,true);assert.ok(g.getState().cooldown>0);
  g.interact('passage');assert.equal(g.getState().room,'clocktower');use(g,'passage-back');assert.equal(g.getState().room,'gallery');
  assert.equal(g.detectionRadius(),76);g.setQuiet(true);assert.equal(g.detectionRadius(),22);
  g.togglePause();assert.equal(g.getState().quiet,false);g.togglePause();
  g.reset();assert.equal(g.getState().passage,false);assert.equal(g.getState().cooldown,0);
});
test('standalone UI installs one animation chain and no restart listeners or timers', () => {
  const html=fs.readFileSync(file,'utf8');
  const ui=html.match(/<script id="manor-ui">([\s\S]*?)<\/script>/);
  assert.ok(ui,'playable canvas, dialogs, touch controls and audio UI exist');
  const elements=new Map(), listeners=[];let frames=0;
  const noop=()=>{};
  const drawing=new Proxy({}, {get:(_,key)=>key==='createRadialGradient'?()=>({addColorStop:noop}):noop,set:()=>true});
  const element=id=>{if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',hidden:false,style:{},dataset:{},setAttribute:noop,focus:noop,querySelector:()=>null,getContext:()=>drawing,addEventListener:(name)=>listeners.push(id+name)});return elements.get(id);};
  const document={getElementById:element,addEventListener:name=>listeners.push('doc'+name),activeElement:null,hidden:false};
  const window={addEventListener:name=>listeners.push('win'+name),matchMedia:()=>({matches:false})};
  const context={window,document,console,performance:{now:()=>0},requestAnimationFrame:()=>{frames++;},setTimeout:()=>assert.fail('no background timeout required'),setInterval:()=>assert.fail('no interval loops'),Math};
  vm.runInNewContext(html.match(/<script id="manor-engine">([\s\S]*?)<\/script>/)[1],context);
  vm.runInNewContext(html.match(/<script id="manor-audio">([\s\S]*?)<\/script>/)[1],context);
  vm.runInNewContext(ui[1],context);
  const initial=listeners.length;assert.ok(initial>0);assert.equal(frames,1);
  for(let i=0;i<20;i++){window.PhantomManor.reset();window.PhantomManor.start();}
  assert.equal(listeners.length,initial);assert.equal(frames,1);
  assert.match(html,/data-hold="up"/);assert.match(html,/data-action="lantern"/);
  assert.match(html,/session.only/i);assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+href=["']https?:/i);
});
test('walls, furniture, invalid input and reading all stop movement safely', () => {
  const g=load();g.start();const before=g.getState();g.move(NaN,0,1);g.move(0,1,-1);assert.equal(g.getState().x,before.x);
  for(let i=0;i<100;i++)g.move(0,-1,.1);
  assert.ok(g.getState().y>=183,'center table collision stops northward walk');
  for(let i=0;i<100;i++)g.move(-1,0,.1);
  assert.ok(g.getState().x>=32,'west wall cannot be crossed');
  use(g,'foyer-page');const reading=g.getState();g.move(1,0,.1);g.tick(.1);g.lantern();assert.deepEqual(g.getState(),reading,'reading freezes danger and inputs');
  g.togglePause();g.choose('Seed');g.closeDialog();assert.ok(g.getState().dialog,'pause cannot dismiss a page');g.togglePause();g.closeDialog();
});
test('silver and attic keys are checked, keepsakes cannot duplicate, and the ending rejects missing journals', () => {
  const g=load();g.start();read(g,'foyer-page');use(g,'to-library');read(g,'library-page');solve(g,'books',['Seed','Tree','Stars']);
  use(g,'to-foyer');use(g,'to-conservatory');use(g,'to-clocktower');assert.equal(g.getState().room,'garden');
  read(g,'garden-page');solve(g,'wheel',['Rain','Sun','Moon']);use(g,'to-clocktower');use(g,'to-attic');assert.equal(g.getState().room,'clocktower');
  read(g,'clock-page');solve(g,'clock',['6','12','9']);use(g,'to-attic');use(g,'keeper');assert.equal(g.getState().dialog.kind,'page');g.choose('together');assert.equal(g.getState().mode,'playing');g.closeDialog();
  use(g,'to-clocktower');use(g,'to-garden');use(g,'to-gallery');read(g,'portrait');read(g,'portrait');assert.equal(g.getState().inventory.filter(i=>i==='portrait').length,1);
});
test('a nearby bat is stunned by lantern light and contact causes a gentle hit', () => {
  const g=load();g.start();use(g,'to-library');read(g,'library-page');solve(g,'books',['Seed','Tree','Stars']);
  for(let i=0;i<16;i++)g.tick(.1);
  // Advance to the patrol without ticking: deterministic collision fixture using real movement.
  let target=g.getState().enemies.library[0];
  for(let i=0;i<100;i++){const s=g.getState(),dx=target.x-s.x,dy=target.y-s.y;if(Math.hypot(dx,dy)<1)break;g.move(dx,dy,Math.min(.1,Math.hypot(dx,dy)/82));}
  assert.ok(Math.hypot(g.getState().x-target.x,g.getState().y-target.y)<1,'reachable patrol position');
  g.lantern();assert.equal(g.getState().enemies.library[0].stun,3.5);const before=g.getState().hearts;g.tick(.1);assert.equal(g.getState().hearts,before);
  for(let i=0;i<40;i++)g.tick(.1);
  assert.equal(g.getState().hearts,before-1,'contact after stun ends costs exactly one heart');
});
test('semantic sound events drain once, reward sounds are idempotent and rejected actions stay quiet',()=>{
  const g=load();assert.deepEqual(Array.from(g.drainEvents()),[]);g.start();g.interact('foyer-page');g.lantern();assert.equal(g.drainEvents().length,0);
  use(g,'to-conservatory');assert.deepEqual(Array.from(g.drainEvents()),['locked']);
  read(g,'foyer-page');assert.deepEqual(Array.from(g.drainEvents()),['page']);assert.equal(g.drainEvents().length,0);
  use(g,'to-library');assert.deepEqual(Array.from(g.drainEvents()),['door']);read(g,'library-page');g.drainEvents();
  use(g,'books');g.choose('Tree');assert.deepEqual(Array.from(g.drainEvents()),['wrong']);for(const v of ['Seed','Tree','Stars'])g.choose(v);assert.deepEqual(Array.from(g.drainEvents()),['pickup','pickup','correct']);g.closeDialog();read(g,'books');assert.equal(g.drainEvents().length,0);
  g.lantern();assert.deepEqual(Array.from(g.drainEvents()),['lantern']);g.lantern();assert.equal(g.drainEvents().length,0);
  g.reset();reachAttic(g);g.drainEvents();use(g,'keeper');g.choose('together');assert.deepEqual(Array.from(g.drainEvents()),['ending']);g.choose('together');assert.equal(g.drainEvents().length,0);
});
module.exports = {load,walkTo,use,read,solve,reachAttic};
