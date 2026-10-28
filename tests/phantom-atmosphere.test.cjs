'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {factory,fake}=require('./manor-audio-helpers.cjs');
const {load,use,read,solve}=require('./manor-route-helpers.cjs');
test('three optional guides offer changing hints, freeze threats while talking and never gate paths',()=>{
 const g=load();g.start();const guides=Object.values(g.getRooms()).flatMap(r=>r.objects.filter(o=>o.type==='npc'));assert.equal(guides.length,3);
 use(g,'pip');assert.match(g.getState().dialog.text,/journal/i);const before=g.getState();g.tick(.1);g.move(1,0,.1);assert.deepEqual(g.getState(),before);g.togglePause();g.closeDialog();assert.ok(g.getState().dialog);g.togglePause();g.closeDialog();
 read(g,'foyer-page');use(g,'pip');assert.match(g.getState().dialog.text,/Library/);g.closeDialog();
 use(g,'to-courtyard');use(g,'moss');assert.match(g.getState().dialog.text,/map/i);g.closeDialog();read(g,'grounds-map');use(g,'moss');assert.match(g.getState().dialog.text,/wreaths/i);g.closeDialog();
 use(g,'to-graveyard');use(g,'to-woods');use(g,'luma');assert.match(g.getState().dialog.text,/guide/i);g.closeDialog();read(g,'woods-note');solve(g,'waystones',['Moth','Fox','Owl']);use(g,'luma');assert.match(g.getState().dialog.text,/hollow/i);g.closeDialog();
 assert.equal(g.getState().journals.length,1);assert.equal(g.getState().storyComplete,false);
 for(const r of Object.values(g.getRooms()))for(const o of r.objects.filter(o=>o.type==='door'))assert.ok(!guides.some(n=>n.id===o.key));
});
test('sheet ghosts telegraph, stay bounded, never hurt or block, retreat and repel; dialogue freezes chase',()=>{
 const g=load();g.start();use(g,'to-library');read(g,'library-page');solve(g,'books',['Seed','Tree','Stars']);use(g,'to-foyer');use(g,'to-conservatory');
 // Approach the original roaming sheet through normal engine movement.
 for(let i=0;i<8;i++)g.move(-1,0,.1);for(let i=0;i<2;i++)g.move(0,1,.1);
 let e=g.getState().enemies.garden[0];assert.equal(e.phase,'drift');for(let i=0;i<16;i++)g.tick(.1);
 // Position within detection of the ghost, away from the puzzle safe bubble.
 for(let i=0;i<23;i++)g.move(1,0,.1);
 g.tick(.1);e=g.getState().enemies.garden[0];assert.equal(e.phase,'warn');const xy=[e.x,e.y];
 for(let i=0;i<7;i++)g.tick(.1);e=g.getState().enemies.garden[0];assert.deepEqual([e.x,e.y],xy,'full warning before movement');
 g.openJournal();const frozen=g.getState();g.tick(.1);assert.deepEqual(g.getState(),frozen);g.closeDialog();
 let phases=new Set();for(let i=0;i<120;i++){const before=g.getState().enemies.garden[0];g.tick(.1);e=g.getState().enemies.garden[0];phases.add(e.phase);assert.ok(Math.hypot(e.x-e.home[0],e.y-e.home[1])<=64.01);assert.ok(Math.hypot(e.x-before.x,e.y-before.y)<=2.401,'slower than player');}
 assert.ok(phases.has('return'));assert.equal(g.getState().hearts,5,'sheet tag never damages');
 g.lantern();e=g.getState().enemies.garden[0];assert.ok(e.stun>0);assert.equal(e.phase,'return');
});
test('atmosphere uses white flowing sheets, fading pixel fireflies, candle flicker, cosmetic spiders and backed readable labels',()=>{
 const html=require('node:fs').readFileSync(require('node:path').join(__dirname,'../games/phantom_manor.html'),'utf8');
 for(const name of ['drawFireflies','drawSpiders','labelBacking'])assert.ok(html.includes(name),name);
 assert.match(html,/#fff9eb/);assert.match(html,/Math.max\(9,size\)/);assert.match(html,/atlas-card/);assert.doesNotMatch(html,/data-action="calm"/);
});
test('music defaults on but creates no context before gesture; tracks switch without stacking and mute persists',async()=>{
 const {ac,nodes}=fake();let made=0;const a=factory()(()=>{made++;return ac;});
 assert.equal(a.status().on,true);a.tick('foyer');assert.equal(made,0);
 await a.enable(a.status().on);a.tick('foyer');assert.equal(a.status().track,'manor');const indoor=nodes.map(n=>n.frequency.value);
 ac.currentTime+=.2;a.tick('woods');assert.equal(a.status().track,'moonlit');assert.ok(a.status().voices<=5);assert.notDeepEqual(nodes.slice(-5).map(n=>n.frequency.value),indoor);
 const count=nodes.length;a.tick('courtyard');assert.equal(nodes.length,count,'same group continues same clock');
 a.setPaused(true);assert.equal(a.status().voices,0);a.tick('foyer');assert.equal(nodes.length,count);
 a.setPaused(false);await a.enable(true);a.tick('foyer');assert.equal(a.status().track,'manor');
 await a.enable(false);for(const room of ['foyer','woods','garden','basement'])a.tick(room);assert.equal(a.status().on,false);assert.equal(a.status().voices,0);
});
