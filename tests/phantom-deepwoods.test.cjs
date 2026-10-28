const test=require('node:test'),assert=require('node:assert/strict');
const {load,use,read,solve,walkTo,reachAttic}=require('./manor-route-helpers.cjs');
function newTrail(g){
 g.start();use(g,'to-courtyard');read(g,'grounds-map');use(g,'to-graveyard');
 use(g,'epitaph');g.choose('Willow');assert.ok(!g.getState().inventory.includes('moonMedallion'));g.closeDialog();
 read(g,'epitaph-note');solve(g,'epitaph',['Oak']);assert.ok(!g.getState().solved.includes('epitaph'));solve(g,'epitaph',['Willow']);
 use(g,'to-woods');read(g,'woods-note');solve(g,'waystones',['Owl']);assert.ok(!g.getState().solved.includes('waystones'));solve(g,'waystones',['Moth','Fox','Owl']);
 use(g,'to-hollow');read(g,'hollow-note');use(g,'to-woods');use(g,'to-greenhouse');read(g,'water-note');
 use(g,'water');g.choose('+3');g.choose('Check level');assert.ok(!g.getState().solved.includes('water'));g.choose('Empty');g.choose('+3');g.choose('+3');g.choose('-1');g.choose('Check level');g.closeDialog();
 use(g,'to-woods');use(g,'to-graveyard');use(g,'to-courtyard');use(g,'to-foyer');use(g,'to-basement');read(g,'pipes-note');
 use(g,'pipes');g.choose('Drain');g.choose('Check valves');assert.ok(!g.getState().solved.includes('pipes'));g.choose('Drain');g.choose('Spring');g.choose('Garden');g.choose('Check valves');g.closeDialog();
 use(g,'to-cistern');read(g,'heart');assert.equal(g.getState().deepComplete,true);use(g,'to-basement');use(g,'to-foyer');
}
test('four new clue puzzles are recoverable and culminate in the Cistern heart',()=>{const g=load();newTrail(g);assert.equal(g.getState().journals.length,0);assert.equal(g.getState().solved.length,4);assert.equal(g.getState().storyComplete,false);assert.equal(g.getState().trailComplete,false);assert.equal(g.getState().notes.length,5);});
test('new map positions, full collision-free graph, gating, reset and frozen clocks',()=>{
 const g=load();g.start();use(g,'to-basement');use(g,'to-cistern');assert.equal(g.getState().room,'basement');use(g,'to-foyer');newTrail(g);
 const m=g.getMap();assert.equal(m.nodes.length,15);for(const n of m.nodes)assert.equal(n.position?.length,2,'map position '+n.id);
 for(const id of ['woods','hollow','greenhouse','basement','cistern'])assert.ok(m.nodes.find(n=>n.id===id).visited);
 assert.ok(m.edges.some(e=>e.includes('woods')&&e.includes('greenhouse')));
 // Unlock core and legacy doors without changing state or teleporting.
 reachAttic(g);use(g,'keeper');g.choose('together');g.continueExploring();use(g,'to-clocktower');use(g,'to-garden');use(g,'to-foyer');
 use(g,'to-courtyard');use(g,'to-graveyard');read(g,'grave-note');solve(g,'wreaths',['Rose','Daisy','Lily']);use(g,'to-courtyard');use(g,'to-cottage');read(g,'cottage-note');solve(g,'lamps',['Owl','Fox','Check lights']);use(g,'to-courtyard');use(g,'to-observatory');read(g,'star-note');solve(g,'telescope',['6']);use(g,'to-courtyard');read(g,'beacon');
 assert.ok(g.getState().storyComplete&&g.getState().trailComplete&&g.getState().deepComplete);
 const seen=new Set();function explore(){const room=g.getState().room;seen.add(room);for(const o of g.getRooms()[room].objects)walkTo(g,o.id);for(const d of g.getRooms()[room].objects.filter(o=>o.type==='door'&&!o.hidden)){use(g,d.id);assert.equal(g.getState().room,d.to);if(!seen.has(d.to))explore();const back=g.getRooms()[d.to].objects.find(o=>o.type==='door'&&o.to===room);assert.ok(back);use(g,back.id);assert.equal(g.getState().room,room);}}explore();assert.equal(seen.size,15);
 g.tick(.1);g.togglePause();const before=g.getState();g.tick(.1);g.move(1,1,.1);assert.deepEqual(g.getState(),before);g.togglePause();g.openJournal();const book=g.getState();g.tick(.1);assert.deepEqual(g.getState(),book);g.closeDialog();g.reset();assert.equal(g.getState().deepComplete,false);assert.equal(g.getMap().discovered,false);assert.equal(g.getState().visited.length,1);assert.equal(g.getState().notes.length,0);
});
test('new scenery layers use the paused simulation clock and no external assets',()=>{
 const html=require('node:fs').readFileSync(require('node:path').join(__dirname,'../games/phantom_manor.html'),'utf8');
 assert.match(html,/function drawRootScenery\(s,t\)/);assert.match(html,/drawRootScenery\(s,reduced\?0:t\)/);
 assert.doesNotMatch(html,/<(?:script|img|link)[^>]+(?:src|href)=["']https?:/);
 for(const name of ['epitaph','waystones','water','pipes'])assert.match(html,new RegExp("o.id==='"+name+"'"),'visible puzzle artwork '+name);
});
test('valves label their check action correctly, every clue is required, and the tank cannot spill or go negative',()=>{
 const g=load();g.start();use(g,'to-basement');use(g,'pipes');g.choose('Spring');g.choose('Garden');g.choose('Check valves');assert.ok(!g.getState().solved.includes('pipes'));g.closeDialog();read(g,'pipes-note');use(g,'pipes');assert.ok(g.getState().dialog.choices.includes('Check valves'));g.closeDialog();use(g,'to-foyer');use(g,'to-courtyard');use(g,'to-graveyard');use(g,'to-woods');use(g,'to-hollow');assert.equal(g.getState().room,'woods');use(g,'waystones');for(const v of ['Moth','Fox','Owl'])g.choose(v);assert.ok(!g.getState().solved.includes('waystones'));g.closeDialog();use(g,'to-greenhouse');use(g,'to-garden');assert.equal(g.getState().room,'greenhouse','no brass key bypass');use(g,'water');for(const v of ['+3','+3','-1','Check level'])g.choose(v);assert.ok(!g.getState().solved.includes('water'));g.closeDialog();read(g,'water-note');use(g,'water');g.choose('-1');assert.equal(g.getState().level,0);g.choose('+3');g.choose('+3');g.choose('+3');assert.equal(g.getState().level,6);g.choose('-1');g.choose('Check level');g.closeDialog();use(g,'to-woods');use(g,'to-graveyard');use(g,'to-courtyard');use(g,'to-foyer');use(g,'to-basement');use(g,'to-cistern');read(g,'heart');assert.equal(g.getState().deepComplete,false,'glass drop alone cannot complete the finale');assert.match(g.getState().dialog?.text||'',/^$/);use(g,'to-basement');use(g,'to-foyer');
});
test('core and Moonlit Grounds first still allow the entire new trail without resets',()=>{
 const g=load();reachAttic(g);use(g,'keeper');g.choose('together');g.continueExploring();use(g,'to-clocktower');use(g,'to-garden');use(g,'to-foyer');use(g,'to-courtyard');use(g,'to-graveyard');read(g,'grave-note');solve(g,'wreaths',['Rose','Daisy','Lily']);use(g,'to-courtyard');use(g,'to-cottage');read(g,'cottage-note');solve(g,'lamps',['Owl','Fox','Check lights']);use(g,'to-courtyard');use(g,'to-observatory');read(g,'star-note');solve(g,'telescope',['6']);use(g,'to-courtyard');read(g,'beacon');use(g,'to-foyer');newTrail(g);assert.ok(g.getState().storyComplete&&g.getState().trailComplete&&g.getState().deepComplete);assert.equal(g.getState().solved.length,10);
});
test('map links never run through an unrelated area marker',()=>{
 const g=load(),m=g.getMap(),pos=Object.fromEntries(m.nodes.map(n=>[n.id,n.position]));
 for(const [id,r] of Object.entries(g.getRooms()))for(const d of r.objects.filter(o=>o.type==='door')){const a=pos[id],b=pos[d.to],dx=b[0]-a[0],dy=b[1]-a[1];for(const [n,p] of Object.entries(pos)){if(n===id||n===d.to)continue;const t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy);if(t>0&&t<1)assert.ok(Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)>14,`${id} → ${d.to} must not imply a stop at ${n}`);}}
});
test('release keeps one updated Manor card, all 18 cabinets and a new offline cache',()=>{
 const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..'),hub=fs.readFileSync(path.join(root,'index.html'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.equal((hub.match(/href="games\/phantom_manor.html\?v=14"/g)||[]).length,2);assert.match(hub,/Whispering Roots/);assert.ok(Number(sw.match(/awanacade-v(\d+)/)[1])>=11);assert.equal(new Set([...hub.matchAll(/href="games\/([^"?]+)/g)].map(m=>m[1])).size,18);assert.match(hub,/path_of_hallows.html\?v=9/);
});
module.exports={newTrail};
