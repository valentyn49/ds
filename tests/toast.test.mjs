import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { build } from 'esbuild';

const result = await build({ stdin: { contents: `export * from './src/react/Toast/toast-manager'; export * from './src/react/Toast/Toast'; export * from './src/react/Toast/ToastProvider'; export { createElement } from 'react'; export { renderToStaticMarkup } from 'react-dom/server';`, resolveDir: process.cwd(), loader: 'tsx' },
  bundle: true, platform: 'node', format: 'cjs', write: false, loader: { '.css': 'empty' },
  plugins: [{ name: 'original-svg', setup(bundler) {
    bundler.onResolve({ filter: /\.svg\?raw$/ }, args => ({ path: resolve(dirname(args.importer), args.path.replace(/\?raw$/, '')), namespace: 'original-svg' }));
    bundler.onLoad({ filter: /.*/, namespace: 'original-svg' }, args => ({ contents: readFileSync(args.path, 'utf8'), loader: 'text' }));
  } }],
});
const mod = { exports: {} };
new Function('require', 'module', 'exports', result.outputFiles[0].text)(createRequire(import.meta.url), mod, mod.exports);
const api = mod.exports;
const mockClock = t => t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 1000 });
const visible = (manager, id, motion = { enter: 180, exit: 150 }) => { manager.present(id, motion); manager.entered(id); };

test('all five exact Figma types render the original status icons, optional controls and escaped dynamic text', () => {
  assert.deepEqual(api.TOAST_TYPES, ['purchase', 'warning', 'alert', 'neutral', 'info']);
  for (const type of api.TOAST_TYPES) {
    const html = api.renderToStaticMarkup(api.createElement(api.Toast, { type, message: '<saved>', action: { onClick() {} } }));
    assert.match(html, new RegExp(`data-type="${type}"`));
    assert.match(html, /&lt;saved&gt;/);
    assert.match(html, /class="ds-toast__icon"/);
    assert.match(html, /aria-hidden="true"/);
    assert.match(html, /aria-label="Dismiss notification"/);
    assert.match(html, /UNDO/);
    assert.doesNotMatch(html, /role="alert"/);
  }
  const minimal = api.renderToStaticMarkup(api.createElement(api.Toast, { message: 'Saved', showIcon: false, close: false }));
  assert.doesNotMatch(minimal, /<svg|<button|ds-toast__controls/);
});
test('display duration does not start while queued, before mounting, or during entrance', t => {
  mockClock(t);
  const manager = api.createToastManager();
  const first = manager.toast({ message: 'First' });
  manager.toast({ message: 'Second' });
  t.mock.timers.tick(100000);
  assert.equal(manager.getSnapshot().active.id, first);
  manager.present(first, { enter: 225, exit: 195 });
  t.mock.timers.tick(224);
  assert.equal(manager.getSnapshot().phase, 'entering');
  manager.entered(first);
  t.mock.timers.tick(3999);
  assert.equal(manager.getSnapshot().phase, 'visible');
  t.mock.timers.tick(1);
  assert.equal(manager.getSnapshot().phase, 'exiting');
  t.mock.timers.tick(194);
  assert.equal(manager.getSnapshot().active.id, first);
  manager.exited(first);
  assert.equal(manager.getSnapshot().active.message, 'Second');
  assert.equal(manager.getSnapshot().phase, 'entering');
  manager.reset();
});
test('missing animation events use bounded fallbacks and never overlap notifications', t => {
  mockClock(t);
  const manager = api.createToastManager();
  const first = manager.toast({ message: 'First', duration: 100 });
  manager.toast({ message: 'Next' });
  manager.present(first, { enter: 180, exit: 150 });
  t.mock.timers.tick(230);
  assert.equal(manager.getSnapshot().phase, 'visible');
  t.mock.timers.tick(100);
  assert.equal(manager.getSnapshot().phase, 'exiting');
  t.mock.timers.tick(199);
  assert.equal(manager.getSnapshot().active.id, first);
  t.mock.timers.tick(1);
  assert.equal(manager.getSnapshot().active.message, 'Next');
  manager.reset();
});
test('overlapping pointer/focus pauses retain remaining time and require every reason to clear', t => {
  mockClock(t);
  const manager = api.createToastManager();
  const id = manager.toast({ message: 'Read this' }); visible(manager, id);
  t.mock.timers.tick(1000); manager.pause(id, 'pointer'); manager.pause(id, 'focus');
  t.mock.timers.tick(30000); manager.resume(id, 'pointer');
  t.mock.timers.tick(30000); assert.equal(manager.getSnapshot().phase, 'visible');
  manager.resume(id, 'focus'); t.mock.timers.tick(2999);
  assert.equal(manager.getSnapshot().phase, 'visible');
  t.mock.timers.tick(1); assert.equal(manager.getSnapshot().phase, 'exiting');
  manager.reset();
});
test('pausing during entrance prevents automatic dismissal until resumed', t => {
  mockClock(t);
  const manager = api.createToastManager();
  const id = manager.toast({ message: 'Focus' });
  manager.present(id, { enter: 180, exit: 150 }); manager.pause(id, 'focus'); manager.entered(id);
  t.mock.timers.tick(10000); assert.equal(manager.getSnapshot().phase, 'visible');
  manager.resume(id, 'focus'); t.mock.timers.tick(4000);
  assert.equal(manager.getSnapshot().phase, 'exiting'); manager.reset();
});
test('actions persist by default, execute once, and advance only after exit', t => {
  mockClock(t);
  let calls = 0;
  const manager = api.createToastManager();
  const id = manager.toast({ type: 'info', message: 'Undo', action: { onClick: () => calls++ } });
  visible(manager, id); t.mock.timers.tick(100000);
  assert.equal(manager.getSnapshot().phase, 'visible');
  assert.equal(manager.getSnapshot().active.duration, null);
  manager.performAction(id); manager.performAction(id);
  assert.equal(calls, 1); assert.equal(manager.getSnapshot().phase, 'exiting');
  manager.exited(id); assert.equal(manager.getSnapshot().active, null);
});
test('a throwing action remains available and does not discard queued messages', () => {
  const manager = api.createToastManager();
  const id = manager.toast({ message: 'Retry', action: { onClick() { throw new Error('Application failed'); } } });
  visible(manager, id); manager.toast({ message: 'Queued' });
  assert.throws(() => manager.performAction(id), /Application failed/);
  assert.equal(manager.getSnapshot().phase, 'visible');
  assert.equal(manager.getSnapshot().queued.length, 1); manager.reset();
});
test('extended, custom and persistent durations apply consistently across types', t => {
  mockClock(t);
  for (const type of api.TOAST_TYPES) {
    const manager = api.createToastManager();
    const id = manager.toast({ type, message: 'Longer', duration: 10000 }); visible(manager, id);
    t.mock.timers.tick(9999); assert.equal(manager.getSnapshot().phase, 'visible');
    t.mock.timers.tick(1); assert.equal(manager.getSnapshot().phase, 'exiting'); manager.reset();
  }
  const preferred = api.createToastManager({ defaultDuration: null });
  const id = preferred.toast({ message: 'Read at your pace' }); visible(preferred, id);
  t.mock.timers.tick(1000000); assert.equal(preferred.getSnapshot().phase, 'visible'); preferred.reset();
  for (const duration of [0, -1, Infinity, NaN, 2147483648]) assert.throws(() => api.createToastManager({ defaultDuration: duration }));
});
test('rapid FIFO input keeps all records, removes a targeted queued record, and ignores stale completions', () => {
  const manager = api.createToastManager();
  const ids = Array.from({ length: 100 }, (_, i) => manager.toast({ message: `Message ${i}`, duration: null }));
  manager.dismiss(ids[50]);
  for (const id of ids.filter((_, i) => i !== 50)) {
    assert.equal(manager.getSnapshot().active.id, id);
    visible(manager, id, { enter: 0, exit: 0 }); manager.dismiss(id);
    manager.entered(id); manager.exited(id); manager.dismiss(id);
  }
  assert.equal(manager.getSnapshot().active, null);
  assert.equal(manager.getSnapshot().queued.length, 0);
});
test('clear and reset cancel timers; old timers cannot dismiss subsequent records', t => {
  mockClock(t);
  const manager = api.createToastManager();
  const old = manager.toast({ message: 'Old' }); visible(manager, old);
  manager.toast({ message: 'Queued' }); manager.clear(); manager.exited(old);
  assert.equal(manager.getSnapshot().active, null);
  const next = manager.toast({ message: 'Persistent next', duration: null }); visible(manager, next);
  t.mock.timers.tick(100000); assert.equal(manager.getSnapshot().active.id, next);
  manager.reset(); t.mock.timers.tick(100000); assert.equal(manager.getSnapshot().active, null);
});
test('reduced motion completes presentation and dismissal without animation delays', () => {
  const manager = api.createToastManager();
  const id = manager.toast({ message: 'Reduced', duration: null });
  manager.present(id, { enter: 0, exit: 0 }); assert.equal(manager.getSnapshot().phase, 'visible');
  manager.dismiss(id); assert.equal(manager.getSnapshot().active, null);
});
test('independent managers do not share records, IDs, or timers', t => {
  mockClock(t);
  const first = api.createToastManager(), second = api.createToastManager();
  const a = first.toast({ message: 'A', duration: 100 });
  const b = second.toast({ message: 'B', duration: null });
  assert.notEqual(a, b); visible(first, a); visible(second, b);
  t.mock.timers.tick(100); assert.equal(first.getSnapshot().phase, 'exiting'); assert.equal(second.getSnapshot().phase, 'visible');
  first.reset(); second.reset();
});
test('invalid inputs fail before enqueueing and subscriber cleanup stops notifications', () => {
  const manager = api.createToastManager(); let calls = 0;
  const unsubscribe = manager.subscribe(() => calls++);
  assert.throws(() => manager.toast({ type: 'success', message: 'Invented' }));
  assert.throws(() => manager.toast({ message: ' ' }));
  assert.throws(() => manager.toast({ message: 'Invalid', duration: -2 }));
  assert.equal(manager.getSnapshot().active, null);
  manager.toast({ message: 'Valid', duration: null }); assert.equal(calls, 1);
  unsubscribe(); manager.reset(); assert.equal(calls, 1);
});
test('provider is safe to server-render without touching the DOM', () => {
  const html = api.renderToStaticMarkup(api.createElement(api.ToastProvider, null, api.createElement('p', null, 'Application')));
  assert.equal(html, '<p>Application</p>');
});
test('both Storybooks expose the dedicated page and all interactive examples in the existing Toast group', () => {
  for (const folder of ['storybook-static', 'storybook-static-react']) {
    const index = JSON.parse(readFileSync(`${folder}/index.json`, 'utf8'));
    const entries = Object.values(index.entries).filter(entry => entry.title.startsWith('Components/Toast/'));
    assert.ok(entries.some(entry => entry.type === 'docs'));
    for (const name of ['Playground', 'Types', 'Anatomy', 'Responsive', 'Animations', 'Queue']) assert.ok(entries.some(entry => entry.name === name), `${folder}: ${name}`);
  }
});
