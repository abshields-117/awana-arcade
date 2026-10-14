const test=require('node:test'),assert=require('node:assert/strict');
const {load,use,read,solve,walkTo,reachAttic}=require('./manor-route-helpers.cjs');
function grounds(g){
 g.start();use(g,'to-courtyard');read(g,'grounds-map');use(g,'to-cottage');assert.equal(g.getState().room,'courtyard');use(g,'to-observatory');assert.equal(g.getState().room,'courtyard');use(g,'to-graveyard');
 use(g,'wreaths');g.choose('Rose');assert.equal(g.getState().solved.length,0);g.closeDialog();read(g,'grave-note');
 solve(g,'wreaths',['Lily']);assert.equal(g.getState().solved.length,0);solve(g,'wreaths',['Rose','Daisy','Lily']);
 assert.ok(g.getState().inventory.includes('oakToken'));use(g,'to-courtyard');use(g,'to-cottage');
 read(g,'cottage-note');use(g,'lamps');g.choose('Check lights');assert.equal(g.getState().solved.length,1);
 g.choose('Owl');g.choose('Owl');g.choose('Moon');g.choose('Check lights');assert.equal(g.getState().solved.length,1,'wrong set has no reward');
 g.choose('Moon');g.choose('Owl');g.choose('Fox');g.choose('Check lights');g.closeDialog();assert.ok(g.getState().inventory.includes('starLens'));
 use(g,'to-courtyard');use(g,'to-observatory');read(g,'star-note');solve(g,'telescope',['4']);assert.equal(g.getState().solved.length,2);solve(g,'telescope',['6']);assert.ok(g.getState().inventory.includes('trailStar'));
 use(g,'to-courtyard');read(g,'beacon');assert.equal(g.getState().trailComplete,true);
}
test('three different clue puzzles gate cottage, observatory and rewarding trail finale',()=>{const g=load();grounds(g);assert.equal(g.getState().journals.length,0,'optional clues never replace core pages');assert.equal(g.getState().notes.length,3);assert.equal(g.getState().solved.length,3);read(g,'beacon');assert.equal(g.getState().inventory.filter(i=>i==='trailStar').length,1);use(g,'to-foyer');reachAttic(g);use(g,'keeper');g.choose('together');assert.equal(g.getState().mode,'won');g.continueExploring();assert.equal(g.getState().storyComplete,true);assert.equal(g.getState().mode,'playing');g.reset();assert.equal(g.getState().trailComplete,false);assert.equal(g.getState().notes.length,0);});
test('every grounds object and reverse door has a collision-free approach',()=>{const g=load();grounds(g);for(const id of ['to-graveyard','to-cottage','to-observatory']){use(g,id);for(const o of g.getRooms()[g.getState().room].objects)walkTo(g,o.id);use(g,'to-courtyard');}for(const o of g.getRooms().courtyard.objects)walkTo(g,o.id);});
test('original ending can be completed first, then the entire optional trail without a reset',()=>{
 const g=load();reachAttic(g);use(g,'keeper');g.choose('together');g.continueExploring();use(g,'to-clocktower');use(g,'to-garden');use(g,'to-foyer');use(g,'to-courtyard');read(g,'grounds-map');use(g,'to-graveyard');read(g,'grave-note');solve(g,'wreaths',['Rose','Daisy','Lily']);use(g,'to-courtyard');use(g,'to-cottage');read(g,'cottage-note');solve(g,'lamps',['Fox','Owl','Check lights']);use(g,'to-courtyard');use(g,'to-observatory');read(g,'star-note');solve(g,'telescope',['6']);use(g,'to-courtyard');read(g,'beacon');assert.equal(g.getState().trailComplete,true);assert.equal(g.getState().storyComplete,true);assert.equal(g.getState().solved.length,6);assert.equal(g.getState().journals.length,6);assert.deepEqual(Array.from(g.getMap().player),[g.getState().x,g.getState().y]);g.openJournal();const before=g.getState();g.move(1,0,.1);g.tick(.1);assert.deepEqual(g.getState(),before,'reading field notes pauses exploration');
});
test('grounds map is discovered in courtyard, tracks connected visited rooms and resets',()=>{
 const g=load();g.start();assert.equal(typeof g.getMap,'function');assert.equal(g.getMap().discovered,false);
 use(g,'to-courtyard');assert.equal(g.getState().room,'courtyard');read(g,'grounds-map');
 assert.equal(g.getMap().discovered,true);assert.ok(g.getMap().edges.some(e=>e.includes('foyer')&&e.includes('courtyard')));
 use(g,'to-graveyard');assert.equal(g.getMap().current,'graveyard');assert.equal(g.getMap().nodes.find(n=>n.id==='graveyard').visited,true);
 use(g,'to-courtyard');use(g,'to-foyer');assert.equal(g.getState().room,'foyer');
 g.reset();assert.equal(g.getMap().discovered,false);assert.deepEqual(Array.from(g.getState().visited),['foyer']);
});
