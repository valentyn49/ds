import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const result = await build({ stdin: { contents: `export * from './src/react/Tooltip/position'; export * from './src/react/Tooltip/tooltip-controller'; export * from './src/react/Tooltip/Tooltip'; export { createElement } from 'react'; export { renderToStaticMarkup } from 'react-dom/server';`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false, loader: { '.css': 'empty', '.svg': 'dataurl' } });
const mod = { exports: {} };
new Function('require', 'module', 'exports', result.outputFiles[0].text)(createRequire(import.meta.url), mod, mod.exports);
const api = mod.exports;
const viewport = { left: 0, top: 0, width: 1024, height: 768 };
const rect = { left: 500, top: 300, right: 540, bottom: 336, width: 40, height: 36 };
const clock = t => t.mock.timers.enable({ apis: ['setTimeout'] });

test('all verified Figma pointer edges place the tooltip on the corresponding opposite trigger side', () => {
  assert.deepEqual(api.TOOLTIP_TYPES, ['bottom', 'right', 'top', 'left']);
  const expected = { bottom: [410, 213], top: [410, 351], right: [264, 282], left: [555, 282] };
  for (const type of api.TOOLTIP_TYPES) {
    const point = api.positionTooltip(rect, { width: api.TOOLTIP_WIDTHS[type], height: type === 'bottom' ? 79 : 72 }, viewport, type);
    assert.equal(point.type, type);
    assert.deepEqual([point.x, point.y], expected[type]);
  }
});
test('collision handling flips to verified edges, shifts within bounds, and aims at the trigger', () => {
  const nearTop = { left: 20, top: 10, right: 60, bottom: 46, width: 40, height: 36 };
  const point = api.positionTooltip(nearTop, { width: 220, height: 79 }, { left: 0, top: 0, width: 375, height: 600 }, 'bottom');
  assert.equal(point.type, 'top');
  assert.equal(point.x, 8);
  assert.equal(point.y - 7 - nearTop.bottom, 8);
  assert.equal(point.x + point.arrow, 40);
  const nearLeft = { ...nearTop, top: 200, bottom: 236, left: 2, right: 42 };
  assert.equal(api.positionTooltip(nearLeft, { width: 228, height: 72 }, viewport, 'right').type, 'left');
});
test('all viewport edges contain the complete source frame and arrows across small and large canvases', () => {
  for (const width of [240, 320, 375, 744, 1440]) for (const height of [240, 600, 900]) {
    for (const [x, y] of [[8, 8], [width - 48, 8], [8, height - 44], [width - 48, height - 44]]) for (const type of api.TOOLTIP_TYPES) {
      const anchor = { left: x, top: y, right: x + 40, bottom: y + 36, width: 40, height: 36 };
      const size = { width: Math.min(api.TOOLTIP_WIDTHS[type], width - 30), height: 79 };
      const point = api.positionTooltip(anchor, size, { left: 0, top: 0, width, height }, type);
      assert.ok(point.x - (point.type === 'left' ? 7 : 0) >= 8);
      assert.ok(point.y - (point.type === 'top' ? 7 : 0) >= 8);
      assert.ok(point.x + size.width <= width - 8);
      assert.ok(point.y + size.height <= height - 8);
      assert.ok(api.TOOLTIP_TYPES.includes(point.type));
    }
  }
});
test('scroll/visual viewport offsets reposition rather than retaining old page coordinates', () => {
  const initial = api.positionTooltip(rect, { width: 220, height: 79 }, viewport, 'bottom');
  const scrolled = api.positionTooltip({ ...rect, top: 200, bottom: 236 }, { width: 220, height: 79 }, viewport, 'bottom');
  assert.equal(initial.y - scrolled.y, 100);
  const shifted = api.positionTooltip(rect, { width: 220, height: 79 }, { left: 450, top: 250, width: 400, height: 400 }, 'bottom');
  assert.ok(shifted.x >= 458 && shifted.y >= 258);
});
test('title-only horizontal arrows remain vertically centered; long content is bounded without covering the trigger', () => {
  const point = api.positionTooltip(rect, { width: 228, height: 36 }, viewport, 'right');
  assert.equal(point.arrow, 18);
  const narrow = { left: 0, top: 0, width: 375, height: 300 };
  const anchor = { left: 160, right: 200, top: 132, bottom: 168, width: 40, height: 36 };
  assert.equal(api.tooltipMaxHeight(anchor, narrow), 109);
  assert.ok(api.tooltipMaxHeight({ ...anchor, top: 0, bottom: 290 }, narrow) < 36);
});
test('hover uses a short delay; focus requests immediate display and no expiry timer', t => {
  clock(t);
  const hover = api.createTooltipController();
  hover.enter('trigger'); t.mock.timers.tick(99); assert.equal(hover.getSnapshot().phase, 'hidden');
  t.mock.timers.tick(1); assert.equal(hover.getSnapshot().open, true);
  t.mock.timers.tick(150); assert.equal(hover.getSnapshot().phase, 'visible');
  t.mock.timers.tick(100000); assert.equal(hover.getSnapshot().open, true); hover.reset();
  const focus = api.createTooltipController(); focus.enter('focus'); assert.equal(focus.getSnapshot().open, true); focus.reset();
});
test('leaving hover does not dismiss while focus remains and the pointer can cross onto the tooltip', t => {
  clock(t); const controller = api.createTooltipController();
  controller.enter('focus'); controller.enter('trigger'); controller.leave('trigger');
  t.mock.timers.tick(1000); assert.equal(controller.getSnapshot().open, true);
  controller.leave('focus'); t.mock.timers.tick(50); controller.enter('tooltip');
  t.mock.timers.tick(1000); assert.equal(controller.getSnapshot().open, true);
  controller.leave('tooltip'); t.mock.timers.tick(100); assert.equal(controller.getSnapshot().phase, 'exiting');
  t.mock.timers.tick(120); assert.equal(controller.getSnapshot().phase, 'hidden'); controller.reset();
});
test('Escape dismissal stays dismissed until hover/focus leave and cannot be undone by a stale appearance timer', t => {
  clock(t); const controller = api.createTooltipController();
  controller.enter('trigger'); controller.dismiss(); t.mock.timers.tick(1000);
  assert.equal(controller.getSnapshot().open, false);
  controller.enter('focus'); t.mock.timers.tick(1000); assert.equal(controller.getSnapshot().open, false);
  controller.leave('trigger'); controller.leave('focus');
  controller.enter('focus'); assert.equal(controller.getSnapshot().open, true); controller.reset();
});
test('re-entry during exit cancels the old completion instead of hiding the reopened tooltip', t => {
  clock(t); const controller = api.createTooltipController();
  controller.enter('focus'); t.mock.timers.tick(150); controller.leave('focus'); t.mock.timers.tick(100);
  assert.equal(controller.getSnapshot().phase, 'exiting');
  t.mock.timers.tick(50); controller.enter('trigger');
  t.mock.timers.tick(120); assert.equal(controller.getSnapshot().open, true); controller.reset();
});
test('reduced motion completes fades immediately, including preference changes during exit', t => {
  clock(t); const controller = api.createTooltipController(); controller.setReducedMotion(true);
  controller.enter('focus'); assert.equal(controller.getSnapshot().phase, 'visible'); controller.dismiss(); assert.equal(controller.getSnapshot().phase, 'hidden');
  controller.reset(); controller.setReducedMotion(false); controller.enter('focus'); controller.dismiss();
  assert.equal(controller.getSnapshot().phase, 'exiting'); controller.setReducedMotion(true); assert.equal(controller.getSnapshot().phase, 'hidden'); controller.reset();
});
test('independent instances, subscribers, and cleanup do not leave stale timers', t => {
  clock(t); const first = api.createTooltipController(), second = api.createTooltipController(); let calls = 0;
  const unsubscribe = first.subscribe(() => calls++);
  first.enter('focus'); second.enter('focus'); first.dismiss(); assert.equal(second.getSnapshot().open, true);
  first.reset(); const count = calls; unsubscribe(); t.mock.timers.tick(10000);
  assert.equal(calls, count); assert.equal(first.getSnapshot().phase, 'hidden'); second.reset();
});
test('SSR preserves trigger descriptions, escaped text, and unique tooltip IDs without touching DOM', () => {
  const render = () => api.renderToStaticMarkup(api.createElement('div', null, ...[1, 2].map(key => api.createElement(api.Tooltip, { key, title: '<Title>', subtitle: '<Extra>' }, api.createElement('button', { 'aria-describedby': 'existing', onClick() {} }, 'Trigger')))));
  const html = render();
  assert.match(html, /aria-describedby="existing ds-tooltip-/);
  assert.match(html, /&lt;Title&gt;/); assert.match(html, /&lt;Extra&gt;/);
  const ids = [...html.matchAll(/id="(ds-tooltip-[^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 2); assert.equal(new Set(ids).size, 2);
  assert.equal((html.match(/<button/g) ?? []).length, 2);
  assert.doesNotMatch(html, /aria-haspopup|aria-expanded|role="dialog"/);
});
test('show subtitle omits secondary text without introducing another size or visual type', () => {
  const html = api.renderToStaticMarkup(api.createElement(api.Tooltip, { title: 'Title', subtitle: 'Hidden subtitle', showSubtitle: false }, api.createElement('button', null, 'Trigger')));
  assert.doesNotMatch(html, /Hidden subtitle/); assert.match(html, /Title/);
});
test('every verified arrow asset exists and retains its exported source bytes and viewport', () => {
  const manifest = JSON.parse(readFileSync('src/components/tooltip/figma-spec.json', 'utf8'));
  assert.equal(manifest.types.length, 4);
  assert.deepEqual(manifest.types.map(entry => entry.type), api.TOOLTIP_TYPES);
  for (const entry of manifest.types) {
    const svg = readFileSync(`src/components/tooltip/assets/${entry.asset}`, 'utf8');
    assert.equal(createHash('sha256').update(svg).digest('hex'), entry.sha256);
    assert.ok(svg.includes(`viewBox="0 0 ${entry.svgBounds.join(' ')}"`));
    assert.match(svg, /<path/);
  }
});
test('both Storybooks place Tooltip and all its examples in the existing Tooltips sidebar group', () => {
  for (const folder of ['storybook-static', 'storybook-static-react']) {
    const index = JSON.parse(readFileSync(`${folder}/index.json`, 'utf8'));
    const entries = Object.values(index.entries).filter(entry => entry.title.startsWith('Components/Tooltips/'));
    assert.ok(entries.some(entry => entry.type === 'docs'));
    for (const name of ['Playground', 'Anatomy', 'Variants', 'Examples']) assert.ok(entries.some(entry => entry.name === name), `${folder}: ${name}`);
  }
});
