// Real Chromium mission route. NODE_PATH=<playwright node_modules> node tests/terminal-browser.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
  const base=process.env.ARCADE_URL||'http://127.0.0.1:8765';
  const shots=process.env.ARTIFACT_DIR||path.join(os.tmpdir(),'terminal-evidence');
  fs.mkdirSync(shots,{recursive:true});
  const errors=[];
  const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const field=page.locator('#command-input');
  async function command(value,{waitForInput=true}={}){await field.fill(value);await field.press('Enter');if(waitForInput)await field.waitFor({state:'visible'});if(waitForInput)await page.waitForFunction(()=>!document.querySelector('#command-input').disabled);}
  async function expectMission(number){await page.waitForFunction(n=>document.querySelector('#screen').innerText.includes(`[MISSION ${n}/9]`),number);}
  try{
    await page.goto(base+'/index.html?terminal=1&browser-test=guided');
    assert.equal((await page.locator('#screen').innerText()).trim(),'Hint: type HELP');
    assert.equal(await page.locator('.cursor').count(),0);
    assert.equal(await field.evaluate(el=>document.activeElement===el),true);
    await field.fill('HEL');
    const caret=await field.evaluate(el=>({start:el.selectionStart,end:el.selectionEnd,color:getComputedStyle(el).caretColor,input:el.getBoundingClientRect(),prompt:document.querySelector('.ps1').getBoundingClientRect()}));
    assert.deepEqual([caret.start,caret.end],[3,3]);assert.notEqual(caret.color,'rgba(0, 0, 0, 0)');assert.ok(caret.prompt.right<=caret.input.left+2,'prompt and real input caret are detached');
    await field.fill('HELP');await field.press('Enter');
    const help=await page.locator('#screen').innerText();assert.match(help,/START HERE: RUN FLOOD\.EXE/);assert.ok(help.split('\n').length<=7,help);
    await page.screenshot({path:path.join(shots,'terminal-start-1366.png')});
    await command('  run   flood.exe  ',{waitForInput:false});
    assert.match(await page.locator('#screen').innerText(),/LOADING FLOOD\.EXE/);assert.ok(await page.locator('#skip-loading').isVisible());assert.equal(await field.isDisabled(),true);
    await page.waitForTimeout(750);assert.match(await page.locator('#screen').innerText(),/MOUNTING ARCHIVE/);
    await page.screenshot({path:path.join(shots,'terminal-loading-1366.png')});
    await page.locator('#skip-loading').click();await expectMission(1);assert.equal(await field.isDisabled(),false);

    await command('NOPE');assert.match(await page.locator('#screen').innerText(),/COMMAND NOT FOUND/);
    await page.locator('#command-input').press('ArrowUp');assert.equal(await field.inputValue(),'NOPE');await field.fill('');
    await command('FILES');assert.match(await page.locator('#screen').innerText(),/manifest\.txt/);assert.match(await page.locator('#screen').innerText(),/MISSION 1\/9/);
    await command('READ');assert.match(await page.locator('#screen').innerText(),/SYNTAX/);
    await command('READ /archive/manifest.txt');await expectMission(2);
    await command('ANSWER 40');assert.match(await page.locator('#screen').innerText(),/ANSWER INCORRECT/);assert.match(await page.locator('#screen').innerText(),/Format: ANSWER your answer/);
    await command('answer width is 50 cubits');await expectMission(3);
    await command('ANSWER ALL');await expectMission(4);
    await command('ANSWER 7-2-9-4');await expectMission(5);
    await command('ANSWER A DOVE');await expectMission(6);
    await command('REPAIR LAMP A ON B OFF');assert.match(await page.locator('#screen').innerText(),/SYNTAX/);
    await command('REPAIR LAMP --A=ON --B=OFF');await expectMission(7);
    await command('HELP');const contextual=await page.locator('#screen').innerText();assert.match(contextual,/TRACK --DIRECTION --BAY=N/);assert.doesNotMatch(contextual,/TRACK --EAST --BAY=3/);
    await command('TRACK --EAST --BAY=3');await expectMission(8);
    await command('READ /archive/final.key');await expectMission(9);
    await command('run restore verify');assert.match(await page.locator('#screen').innerText(),/SYNTAX/);
    await command('RUN RESTORE --VERIFY',{waitForInput:false});await page.locator('#completion').waitFor();
    assert.match(await page.locator('#completion').innerText(),/ARCHIVE RESTORED[\s\S]*Report to your leader/);
    await page.screenshot({path:path.join(shots,'terminal-complete-1366.png'),fullPage:true});
    await page.getByRole('button',{name:'UNLOCK NORMAL ARCADE'}).click();await page.waitForURL(/arcade\.html/);assert.equal(await page.locator('#arcade-games .game-card').count(),21);
    await page.goto(base+'/index.html');await page.waitForURL(/arcade\.html/);

    await page.goto(base+'/index.html?terminal=1');const hotspot=page.getByRole('button',{name:'Leader access'});for(let i=0;i<5;i++)await hotspot.click();
    await page.locator('#leader-code').fill('WRONG');await page.getByRole('button',{name:'AUTHORIZE'}).click();assert.equal(await page.locator('#leader-message').innerText(),'Access denied.');
    await page.locator('#leader-code').fill('  awana  ');await page.getByRole('button',{name:'AUTHORIZE'}).click();assert.equal(await page.locator('#leader-message').innerText(),'Channel authorized.');assert.ok(await page.getByRole('button',{name:'CURRENT ANSWER'}).isVisible());
    await page.getByRole('button',{name:'RELOCK'}).click();await page.waitForURL(/index\.html\?relocked=1/);assert.equal((await page.locator('#screen').innerText()).trim(),'Hint: type HELP');

    await page.getByRole('button',{name:'FULLSCREEN'}).click();await page.waitForFunction(()=>!!document.fullscreenElement);await page.evaluate(()=>document.exitFullscreen());
    await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await context.setOffline(true);await page.goto(base+'/index.html?v=never-visited-guided');assert.ok(await page.locator('#command-input').isVisible());assert.equal((await page.locator('#screen').innerText()).trim(),'Hint: type HELP');await context.setOffline(false);

    const mobileContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const mobile=await mobileContext.newPage();mobile.on('pageerror',e=>errors.push(e.message));
    await mobile.goto(base+'/index.html?terminal=1&mobile=1');assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const mobileInput=mobile.locator('#command-input');await mobileInput.tap();assert.equal(await mobileInput.evaluate(el=>document.activeElement===el),true);await mobileInput.fill('HELP');assert.equal(await mobileInput.evaluate(el=>el.selectionStart),4);await mobileInput.press('Enter');assert.match(await mobile.locator('#screen').innerText(),/RUN FLOOD\.EXE/);
    await mobileInput.fill('RUN FLOOD.EXE');await mobileInput.press('Enter');await mobile.getByRole('button',{name:'SKIP LOADING'}).tap();await mobile.waitForFunction(()=>document.querySelector('#screen').innerText.includes('[MISSION 1/9]'));
    const mobileBoxes=await mobile.evaluate(()=>{const f=document.querySelector('#terminal-form').getBoundingClientRect(),i=document.querySelector('#command-input').getBoundingClientRect();return{fw:f.width,fr:f.right,ir:i.right,bottom:f.bottom,vw:innerWidth,vh:innerHeight}});assert.ok(mobileBoxes.fr<=mobileBoxes.vw&&mobileBoxes.ir<=mobileBoxes.vw&&mobileBoxes.bottom<=mobileBoxes.vh+1,JSON.stringify(mobileBoxes));
    await mobile.screenshot({path:path.join(shots,'terminal-mobile-390.png'),fullPage:true});await mobileContext.close();

    const denied=await browser.newContext({viewport:{width:390,height:844}});await denied.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new DOMException('denied','SecurityError')}}));const deniedPage=await denied.newPage();deniedPage.on('pageerror',e=>errors.push(e.message));await deniedPage.goto(base+'/index.html?storage-denied=1');await deniedPage.locator('#command-input').fill('HELP');await deniedPage.locator('#command-input').press('Enter');assert.match(await deniedPage.locator('#screen').innerText(),/RUN FLOOD\.EXE/);await denied.close();
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({result:'PASS',checks:['uncluttered exact boot','real inline focused caret','short launcher help','skippable loading phases','full guided 9-step typed route','command/syntax/answer recovery','optional FILES and contextual HELP','history arrows','leader bypass/relock','session redirect','fullscreen','390px touch and no overlap','storage denial fallback','offline fresh query','zero page errors'],screenshots:shots},null,2));
  }finally{await context.close();await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
