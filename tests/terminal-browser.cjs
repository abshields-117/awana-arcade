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
    const boot=(await page.locator('#screen').innerText()).trim();
    for(const required of ['SYSTEM DOWN','AWANACADE STATUS .... DOWN','FLOOD ARCHIVE .... CORRUPTED','MoR','claimed responsibility','Restore the archive','Hint: type HELP'])assert.ok(boot.includes(required),required);
    assert.doesNotMatch(boot,/fictional training|simulation/i);
    assert.ok(boot.split(/\s+/).length<=65,`boot is too wordy: ${boot}`);
    assert.equal(await page.locator('.cursor').count(),0);
    assert.equal((await page.locator('#link-state').innerText()).trim(),'LINK: DISCONNECTED');
    assert.equal(await field.evaluate(el=>document.activeElement===el),true);
    assert.equal(await page.locator('.boot-row').first().evaluate(el=>getComputedStyle(el).animationName),'none');
    await page.getByRole('button',{name:'START OVER'}).click();await page.getByRole('button',{name:'CONFIRM RESET'}).click();assert.match(await page.locator('#screen').innerText(),/SYSTEM DOWN[\s\S]*Hint: type HELP/);
    await page.screenshot({path:path.join(shots,'terminal-boot-1366.png')});
    await field.fill('HEL');
    const caret=await field.evaluate(el=>({start:el.selectionStart,end:el.selectionEnd,color:getComputedStyle(el).caretColor,input:el.getBoundingClientRect(),prompt:document.querySelector('.ps1').getBoundingClientRect()}));
    assert.deepEqual([caret.start,caret.end],[3,3]);assert.notEqual(caret.color,'rgba(0, 0, 0, 0)');assert.ok(caret.prompt.right<=caret.input.left+2,'prompt and real input caret are detached');
    await field.fill('HELP');await field.press('Enter');
    const help=await page.locator('#screen').innerText(),helpLines=help.slice(help.indexOf('COVENANT TERMINAL')).trim().split('\n');assert.match(help,/START HERE: RUN FLOOD\.EXE/);assert.ok(helpLines.length<=5,help);
    await page.screenshot({path:path.join(shots,'terminal-start-1366.png')});
    await command('  run   flood.exe  ',{waitForInput:false});
    const launched=await page.locator('#screen').innerText();
    assert.match(launched,/SYSTEM DOWN/);assert.match(launched,/MoR/);assert.ok(await page.locator('#continue-mission').isVisible());assert.equal(await field.isDisabled(),true);
    await page.waitForTimeout(3500);assert.match(await page.locator('#screen').innerText(),/Recover the Flood Archive/);assert.equal(await page.locator('#screen').innerText().then(s=>s.includes('[MISSION 1/9]')),false);
    await page.screenshot({path:path.join(shots,'terminal-loading-1366.png')});
    await page.locator('#continue-mission').click();await expectMission(1);assert.equal(await field.isDisabled(),false);

    await command('NOPE');assert.match(await page.locator('#screen').innerText(),/COMMAND NOT FOUND/);
    await page.locator('#command-input').press('ArrowUp');assert.equal(await field.inputValue(),'NOPE');await field.fill('');
    await command('FILES');assert.match(await page.locator('#screen').innerText(),/manifest\.txt/);assert.match(await page.locator('#screen').innerText(),/MISSION 1\/9/);
    await command('READ');assert.match(await page.locator('#screen').innerText(),/SYNTAX/);
    await command('READ /archive/manifest.txt');await expectMission(2);assert.match(await page.locator('#screen').innerText(),/BIBLE RECORD/);
    await command('ANSWER 40');assert.match(await page.locator('#screen').innerText(),/ANSWER INCORRECT/);assert.match(await page.locator('#screen').innerText(),/Format: ANSWER your answer/);
    await command('answer width is 50 cubits');await expectMission(3);
    await command('  answer everything  ');await expectMission(4);
    await command('ANSWER 1234');assert.match(await page.locator('#screen').innerText(),/SYNTAX/);
    await command('ANSWER 7, 2, 9, 4');await expectMission(5);
    await command('ANSWER A DOVE');await expectMission(6);
    await command('REPAIR LAMP A ON B OFF');assert.match(await page.locator('#screen').innerText(),/SYNTAX/);
    await command('REPAIR LAMP --A=ON --B=OFF');await expectMission(7);
    await command('HELP');const contextual=await page.locator('#screen').innerText();assert.match(contextual,/ANSWER A, B, or C/);assert.doesNotMatch(contextual,/Choose the option for LEFT then RIGHT/);
    await command('ANSWER A');assert.match(await page.locator('#screen').innerText(),/ANSWER INCORRECT/);
    await page.getByRole('button',{name:'ANSWER B'}).dblclick();await expectMission(8);
    assert.match(await page.locator('#screen').innerText(),/MISSION 8\/9/);
    await command('READ /final.key');await expectMission(9);
    await command('RELOAD EXTRA');assert.match(await page.locator('#screen').innerText(),/SYNTAX/);
    await command('reload',{waitForInput:false});await page.locator('#completion').waitFor();
    assert.match(await page.locator('#completion').innerText(),/ARCHIVE RESTORED[\s\S]*Report to your leader/);
    await page.screenshot({path:path.join(shots,'terminal-complete-1366.png'),fullPage:true});
    await page.getByRole('button',{name:'UNLOCK NORMAL ARCADE'}).click();await page.waitForURL(/arcade\.html/);assert.equal(await page.locator('#arcade-games .game-card').count(),21);
    await page.goto(base+'/index.html');await page.waitForURL(/arcade\.html/);

    await page.goto(base+'/index.html?terminal=1');await page.getByRole('button',{name:'START OVER'}).click();await page.getByRole('button',{name:'CANCEL'}).click();assert.ok(await page.locator('#completion').isVisible());await page.getByRole('button',{name:'START OVER'}).click();await page.getByRole('button',{name:'CONFIRM RESET'}).click();assert.match(await page.locator('#screen').innerText(),/Hint: type HELP/);
    assert.equal(await page.evaluate(()=>sessionStorage.getItem('covenant-terminal-unlocked')),'1');
    await command('HINT');await command('ACCESS WRONG');assert.equal(await page.locator('#leader-dialog').isVisible(),false);await command('ACCESS AWANA');assert.equal(await page.locator('#leader-dialog').isVisible(),true);await page.getByRole('button',{name:'Close leader panel'}).click();
    await page.getByRole('button',{name:'START OVER'}).click();await page.getByRole('button',{name:'CONFIRM RESET'}).click();await field.press('ArrowUp');assert.equal(await field.inputValue(),'');
    const hotspot=page.getByRole('button',{name:'Leader access'});for(let i=0;i<5;i++)await hotspot.click();
    await page.locator('#leader-code').fill('WRONG');await page.getByRole('button',{name:'AUTHORIZE'}).click();assert.equal(await page.locator('#leader-message').innerText(),'Access denied.');assert.equal(await page.getByRole('button',{name:'OPEN ARCADE'}).isVisible(),false);
    await page.locator('#leader-code').fill('  awana  ');await page.getByRole('button',{name:'AUTHORIZE'}).click();assert.equal(await page.locator('#leader-message').innerText(),'Channel authorized.');assert.ok(await page.getByRole('button',{name:'CURRENT ANSWER'}).isVisible());
    await page.getByRole('button',{name:'RELOCK'}).click();await page.waitForURL(/index\.html\?relocked=1/);assert.match((await page.locator('#screen').innerText()).trim(),/AWANACADE STATUS \.\.\.\. DOWN[\s\S]*Hint: type HELP/);

    await page.getByRole('button',{name:'FULLSCREEN'}).click();await page.waitForFunction(()=>!!document.fullscreenElement);await page.evaluate(()=>document.exitFullscreen());
    await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await context.setOffline(true);await page.goto(base+'/index.html?v=never-visited-guided');assert.ok(await page.locator('#command-input').isVisible());assert.match((await page.locator('#screen').innerText()).trim(),/SYSTEM DOWN[\s\S]*Hint: type HELP/);await context.setOffline(false);

    const mobileContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const mobile=await mobileContext.newPage();mobile.on('pageerror',e=>errors.push(e.message));
    await mobile.goto(base+'/index.html?terminal=1&mobile=1');assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.match(await mobile.locator('#screen').innerText(),/AWANACADE STATUS \.\.\.\. DOWN/);await mobile.waitForTimeout(950);await mobile.screenshot({path:path.join(shots,'terminal-boot-mobile-390.png'),fullPage:true});
    const mobileInput=mobile.locator('#command-input');await mobileInput.tap();assert.equal(await mobileInput.evaluate(el=>document.activeElement===el),true);await mobileInput.fill('HELP');assert.equal(await mobileInput.evaluate(el=>el.selectionStart),4);await mobileInput.press('Enter');assert.match(await mobile.locator('#screen').innerText(),/RUN FLOOD\.EXE/);
    await mobileInput.fill('RUN FLOOD.EXE');await mobileInput.press('Enter');await mobile.getByRole('button',{name:'CONTINUE'}).tap();await mobile.waitForFunction(()=>document.querySelector('#screen').innerText.includes('[MISSION 1/9]'));
    const mobileBoxes=await mobile.evaluate(()=>{const f=document.querySelector('#terminal-form').getBoundingClientRect(),i=document.querySelector('#command-input').getBoundingClientRect();return{fw:f.width,fr:f.right,ir:i.right,bottom:f.bottom,vw:innerWidth,vh:innerHeight}});assert.ok(mobileBoxes.fr<=mobileBoxes.vw&&mobileBoxes.ir<=mobileBoxes.vw&&mobileBoxes.bottom<=mobileBoxes.vh+1,JSON.stringify(mobileBoxes));
    for(const [n,answer] of [[2,'READ /archive/manifest.txt'],[3,'ANSWER 50 CUBITS'],[4,'ANSWER ALL'],[5,'ANSWER 7,2,9,4'],[6,'ANSWER DOVE'],[7,'REPAIR LAMP --A=ON --B=OFF']]){await mobileInput.fill(answer);await mobileInput.press('Enter');await mobile.waitForFunction(step=>document.querySelector('#screen').innerText.includes(`[MISSION ${step}/9]`),n)}
    await mobile.screenshot({path:path.join(shots,'terminal-camera-mobile-390.png'),fullPage:true});
    await mobile.getByRole('button',{name:'ANSWER C'}).tap();assert.match(await mobile.locator('#screen').innerText(),/ANSWER INCORRECT/);
    await mobileInput.fill('ANSWER B');await mobileInput.press('Enter');await mobile.waitForFunction(()=>document.querySelector('#screen').innerText.includes('[MISSION 8/9]'));
    for(const [n,answer] of [[9,'READ /final.key'],[0,'RELOAD']]){await mobileInput.fill(answer);await mobileInput.press('Enter');if(n)await mobile.waitForFunction(step=>document.querySelector('#screen').innerText.includes(`[MISSION ${step}/9]`),n)}
    await mobile.locator('#completion').waitFor();await mobile.screenshot({path:path.join(shots,'terminal-complete-mobile-390.png'),fullPage:true});
    await mobile.screenshot({path:path.join(shots,'terminal-mobile-390.png'),fullPage:true});await mobileContext.close();

    const denied=await browser.newContext({viewport:{width:390,height:844}});await denied.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new DOMException('denied','SecurityError')}}));const deniedPage=await denied.newPage();deniedPage.on('pageerror',e=>errors.push(e.message));await deniedPage.goto(base+'/index.html?storage-denied=1');await deniedPage.locator('#command-input').fill('HELP');await deniedPage.locator('#command-input').press('Enter');assert.match(await deniedPage.locator('#screen').innerText(),/RUN FLOOD\.EXE/);await denied.close();
    const motion=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'no-preference'}),motionPage=await motion.newPage();motionPage.on('pageerror',e=>errors.push(e.message));await motionPage.goto(base+'/index.html?terminal=1&motion=1');const motionInput=motionPage.locator('#command-input');assert.equal(await motionPage.locator('.boot-row').last().evaluate(el=>getComputedStyle(el).animationName),'boot-reveal');assert.equal(await motionInput.evaluate(el=>document.activeElement===el),true);await motionInput.fill('HELP');await motionInput.press('Enter');assert.match(await motionPage.locator('#screen').innerText(),/START HERE: RUN FLOOD\.EXE/);await motion.close();
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({result:'PASS',checks:['compact fictional outage boot','required status context','reduced-motion static','immediate HELP with native focused caret','short launcher help','skippable loading phases','full guided 9-step typed route','command/syntax/answer recovery','optional FILES and contextual HELP','history arrows','leader bypass/relock','session redirect','fullscreen','390px touch and no overlap','storage denial fallback','offline fresh query','zero page errors'],screenshots:shots},null,2));
  }finally{await context.close();await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
