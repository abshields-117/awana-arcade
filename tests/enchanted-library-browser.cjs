// Run with Playwright available in NODE_PATH. Evidence stays outside the repo.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{
 const out=process.env.EVIDENCE_DIR || '/home/hermes/.hermes/profiles/awanacade/cache/scratch/enchanted-library-evidence';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1366,height:768},offline:true});
 const page=await context.newPage();const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('file:')) requests.push(r.url())});
 await page.goto('file://'+path.resolve(__dirname,'../enchanted-library.html'));
 await page.screenshot({path:path.join(out,'desktop-story.png')});
 const seen=[];
 for(let i=0;i<6;i++){seen.push(await page.locator('#passage').innerText());assert.equal(await page.locator('#count').innerText(),`${i+1} / 6`);assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),'desktop story fits');if(i<5)await page.locator('#next').click()}
 const expected='You step into the old library, expecting to find nothing more than dusty books and creaky shelves. But as soon as you cross the threshold, the door slams shut behind you! The lights flicker, and a soft whisper fills the air. “Welcome, seeker of knowledge,” a voice echoes. “The library has chosen you for a great challenge.” You glance around—books hover slightly above the shelves, a quill scribbles on its own, and the librarian’s desk is covered in ancient scrolls and mysterious symbols. Then, a golden book floats toward you, its pages flipping rapidly before stopping on a single message: “Only those who prove their wisdom may escape. Solve the library’s riddles, unlock the hidden passages, and uncover the final four-digit code before the last page turns… or remain trapped in the Enchanted Library forever!” The clock on the wall starts ticking backward. There’s no turning back now. You and your team must work together to decipher literary puzzles, crack book ciphers, and reveal the secrets hidden in the stacks. The final key is out there—but will you find it before time runs out? Your adventure begins now!';
 assert.equal(seen.join(' '),expected);assert.ok(await page.locator('#next').isDisabled());await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#count').innerText(),'5 / 6');
 await page.locator('#rules').click();assert.ok(await page.locator('#rules-panel').isVisible());assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),'desktop rules fit');await page.screenshot({path:path.join(out,'desktop-rules.png')});
 await page.keyboard.press('h');assert.ok(!(await page.locator('main').isVisible()));assert.ok(await page.getByRole('link',{name:'Back to Awanacade menu'}).isVisible());
 const pixels=()=>page.locator('canvas').evaluate(c=>c.toDataURL());const moving=await pixels();await page.waitForTimeout(300);assert.notEqual(await pixels(),moving);
 await page.keyboard.press('p');const frozen=await pixels();await page.waitForTimeout(300);assert.equal(await pixels(),frozen);await page.screenshot({path:path.join(out,'desktop-ambient.png')});
 await page.keyboard.press('f');await page.waitForFunction(()=>!!document.fullscreenElement);await page.keyboard.press('f');await page.waitForFunction(()=>!document.fullscreenElement);
 await page.locator('#hide').click();assert.ok(await page.locator('#story-panel').isVisible());assert.equal(await page.locator('#count').innerText(),'5 / 6');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(50);const calm=await pixels();await page.waitForTimeout(300);assert.equal(await pixels(),calm);assert.ok(await page.locator('#pause').isDisabled());
 await page.setViewportSize({width:390,height:844});await page.locator('#story').click();await page.screenshot({path:path.join(out,'mobile-story.png'),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('#rules').tap({force:true}).catch(()=>page.locator('#rules').click());await page.screenshot({path:path.join(out,'mobile-rules.png'),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.setViewportSize({width:320,height:568});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,offline:true});const tp=await touch.newPage();await tp.goto('file://'+path.resolve(__dirname,'../enchanted-library.html'));await tp.locator('#hide').tap();assert.ok(!(await tp.locator('main').isVisible()));await tp.locator('#hide').tap();assert.ok(await tp.locator('#story-panel').isVisible());
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);console.log(JSON.stringify({result:'PASS',storyBeats:seen.length,exactStory:true,offlineFile:true,externalRequests:requests,errors,animationChanges:true,pausePixelEquality:true,reducedMotionPixelEquality:true,fullscreen:true,touch:true,viewports:['1366x768','390x844','320x568'],evidence:out},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
