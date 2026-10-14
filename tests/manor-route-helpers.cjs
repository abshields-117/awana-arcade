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

module.exports={load,walkTo,use,read,solve,reachAttic};
