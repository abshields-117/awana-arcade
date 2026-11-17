// Real Chromium mission route. NODE_PATH=<playwright node_modules> node tests/terminal-browser.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const base=process.env.ARCADE_URL||'http://127.0.0.1:8765';const shots=process.env.ARTIFACT_DIR||path.join(os.tmpdir(),'terminal-evidence');fs.mkdirSync(shots,{recursive:true});const errors=[];
const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
async function command(value){const field=page.locator('#command-input');await field.fill(value);await field.press('Enter');}
try{
  await page.goto(base+'/index.html?terminal=1&browser-test=1');
  assert.match(await page.locator('#screen').innerText(),/Hint: type HELP/);
  const initial=await page.locator('#screen').innerText();
  assert.doesNotMatch(initial,/OPERATOR|MISSION 1\/9/);
  for(const spoiler of ['7-2-9-4','--A=ON --B=OFF','RUN RESTORE --VERIFY'])assert.ok(!initial.includes(spoiler),`spoiler shown: ${spoiler}`);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.cursor')).animationName),'none');
  await command('HELP');await command('NOPE');assert.match(await page.locator('#screen').innerText(),/Unknown command: NOPE/);
  await page.locator('#command-input').press('ArrowUp');assert.equal(await page.locator('#command-input').inputValue(),'NOPE');await page.locator('#command-input').fill('');
  await command('  read   /archive/manifest.txt  ');
  await command('ANSWER');assert.match(await page.locator('#screen').innerText(),/ANSWER needs a solution/);
  await command('ANSWER 40');assert.match(await page.locator('#screen').innerText(),/solution not accepted/);
  await command('answer width is 50 cubits');
  await command('READ /records/genesis-6-22.auth');await command('ANSWER ALL');
  await command('SCAN');await command('ANSWER 7-2-9-4');
  await command('ANSWER A DOVE');
  await command('REPAIR LAMP A ON B OFF');assert.match(await page.locator('#screen').innerText(),/Exact repair syntax required/);
  await command('REPAIR LAMP --A=ON --B=OFF');
  await command('TRACK --EAST --BAY=3');
  await command('READ /archive/final.key');
  await command('run restore verify');assert.match(await page.locator('#screen').innerText(),/Exact syntax required/);
  await command('RUN RESTORE --VERIFY');
  assert.match(await page.locator('#completion').innerText(),/ARCHIVE RESTORED[\s\S]*Report to your leader/);
  await page.screenshot({path:path.join(shots,'terminal-complete-1366.png'),fullPage:true});
  await page.getByRole('button',{name:'UNLOCK NORMAL ARCADE'}).click();await page.waitForURL(/arcade\.html/);assert.equal(await page.locator('#arcade-games .game-card').count(),21);
  await page.goto(base+'/index.html');await page.waitForURL(/arcade\.html/);

  await page.goto(base+'/index.html?terminal=1');const hotspot=page.getByRole('button',{name:'Leader access'});for(let i=0;i<5;i++)await hotspot.click();
  await page.locator('#leader-code').fill('WRONG');await page.getByRole('button',{name:'AUTHORIZE'}).click();assert.equal(await page.locator('#leader-message').innerText(),'Access denied.');
  await page.locator('#leader-code').fill('  awana  ');await page.getByRole('button',{name:'AUTHORIZE'}).click();assert.equal(await page.locator('#leader-message').innerText(),'Channel authorized.');assert.ok(await page.getByRole('button',{name:'CURRENT ANSWER'}).isVisible());
  await page.getByRole('button',{name:'RELOCK'}).click();await page.waitForURL(/index\.html\?relocked=1/);assert.ok(await page.locator('#command-input').isVisible());

  await page.getByRole('button',{name:'FULLSCREEN'}).click();await page.waitForFunction(()=>!!document.fullscreenElement);await page.evaluate(()=>document.exitFullscreen());
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await context.setOffline(true);await page.goto(base+'/index.html?v=never-visited-terminal');assert.ok(await page.locator('#command-input').isVisible());await context.setOffline(false);

  const mobileContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const mobile=await mobileContext.newPage();mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(base+'/index.html?terminal=1&mobile=1');assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.locator('#command-input').tap();await mobile.locator('#command-input').fill('HELP');await mobile.locator('#command-input').press('Enter');assert.match(await mobile.locator('#screen').innerText(),/COMMANDS/);await mobile.screenshot({path:path.join(shots,'terminal-mobile-390.png'),fullPage:true});await mobileContext.close();

  const denied=await browser.newContext({viewport:{width:390,height:844}});await denied.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new DOMException('denied','SecurityError')}}));const deniedPage=await denied.newPage();deniedPage.on('pageerror',e=>errors.push(e.message));await deniedPage.goto(base+'/index.html?storage-denied=1');await deniedPage.locator('#command-input').fill('HELP');await deniedPage.locator('#command-input').press('Enter');assert.match(await deniedPage.locator('#screen').innerText(),/COMMANDS/);await denied.close();
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({result:'PASS',checks:['full 9-step typed route','unknown/wrong/syntax recovery','history arrows','no initial spoilers','leader wrong/correct/relock','session redirect','fullscreen','reduced motion','390px touch input','storage denial fallback','offline fresh query','zero page errors'],screenshots:shots},null,2));
}finally{await context.close();await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
