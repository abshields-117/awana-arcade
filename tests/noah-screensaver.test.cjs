const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const gamePath = path.join(root, 'games', 'noah_ark_screensaver.html');
const html = fs.readFileSync(gamePath, 'utf8');

function loadCore() {
  const match = html.match(/\/\* NOAH_SCREENSAVER_CORE_START \*\/([\s\S]*?)\/\* NOAH_SCREENSAVER_CORE_END \*\//);
  assert.ok(match, 'screensaver must expose testable core');

  const noop = () => {};
  const mockCtx = new Proxy({}, {
    get: (_, k) => {
      if (k === 'createLinearGradient' || k === 'createRadialGradient') {
        return () => ({ addColorStop: noop });
      }
      return noop;
    }
  });

  const elements = new Map();
  function getElement(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        textContent: '',
        style: {},
        classList: {
          toggle: noop,
          add: noop,
          remove: noop,
          contains: () => false
        },
        setAttribute: noop,
        appendChild: noop,
        addEventListener: noop,
        getContext: () => mockCtx,
        width: 1280,
        height: 720
      });
    }
    return elements.get(id);
  }

  const context = {
    console,
    Math,
    Image: class {
      constructor() {
        this.naturalWidth = 800;
        this.naturalHeight = 600;
        this.complete = true;
      }
    },
    window: {
      matchMedia: () => ({ matches: false }),
      addEventListener: noop
    },
    document: {
      getElementById: getElement,
      createElement: (tag) => ({
        className: '',
        onclick: null,
        appendChild: noop
      }),
      addEventListener: noop,
      documentElement: {}
    },
    requestAnimationFrame: noop
  };

  vm.createContext(context);
  vm.runInContext(match[1], context);
  return {
    get: (expr) => vm.runInContext(expr, context),
    run: (code) => vm.runInContext(code, context)
  };
}

test('Noah screensaver is self-contained with zero external assets and proper Awanacade shell', () => {
  assert.doesNotMatch(html, /<(?:script|link|img)[^>]+(?:src|href)=["']https?:/i);
  assert.match(html, /href="\.\.\/index\.html"/);
  assert.match(html, /← ARCADE MENU/);
  assert.match(html, /id="btn-pause"/);
  assert.match(html, /id="btn-sensory"/);
  assert.match(html, /id="btn-fullscreen"/);
  assert.match(html, /id="lightboxModal"/);
  assert.match(html, /width="1280" height="720"/);
  assert.match(html, /noah_bbq_smoker\.jpg/);
  assert.match(html, /noah_unicorns_far_side\.jpg/);
  assert.match(html, /noah_elephant_extinct\.jpg/);
});

test('Noah screensaver advances slides, rotates cartoons and dad jokes', () => {
  const env = loadCore();
  assert.equal(env.get('currentSlide'), 0);
  assert.equal(env.get('SLIDES.length'), 5);

  // Initial slide is BBQ smoker
  assert.equal(env.get('SLIDES[0].title'), 'The BBQ Smoker Incident');

  // Next slide advances to Far Side
  env.run('nextSlide()');
  assert.equal(env.get('currentSlide'), 1);
  assert.equal(env.get('SLIDES[1].title'), 'Confined to C-Deck');

  // Next slide advances to Reverend Fun
  env.run('nextSlide()');
  assert.equal(env.get('currentSlide'), 2);
  assert.equal(env.get('SLIDES[2].title'), 'An Accident on Deck');

  // Next slide advances to Dad Jokes
  env.run('nextSlide()');
  assert.equal(env.get('currentSlide'), 3);

  // Next slide advances to Rainbow
  env.run('nextSlide()');
  assert.equal(env.get('currentSlide'), 4);

  // Wraps around
  env.run('nextSlide()');
  assert.equal(env.get('currentSlide'), 0);

  // Joke toggle works
  assert.equal(env.get('jokeRevealed'), false);
  env.run('revealJoke()');
  assert.equal(env.get('jokeRevealed'), true);
  env.run('revealJoke()');
  assert.equal(env.get('jokeRevealed'), false);
});

test('Noah screensaver pause and sensory mode freeze animation clocks', () => {
  const env = loadCore();
  env.run('update(1.0)');
  const c1 = env.get('clock');
  assert.ok(c1 > 0);

  // Pause stops clock
  env.run('togglePause()');
  assert.equal(env.get('isPaused'), true);
  env.run('update(2.0)');
  assert.equal(env.get('clock'), c1);

  // Unpause resumes clock
  env.run('togglePause()');
  assert.equal(env.get('isPaused'), false);
  env.run('update(1.0)');
  assert.ok(env.get('clock') > c1);
  const c2 = env.get('clock');

  // Sensory / Calm mode freezes wave clock
  env.run('toggleSensory()');
  assert.equal(env.get('isCalm'), true);
  env.run('update(2.0)');
  assert.equal(env.get('clock'), c2);

  // Render executes cleanly
  env.run('render()');
});
