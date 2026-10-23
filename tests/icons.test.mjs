import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(resolve(root, 'src/components/icons/figma-manifest.json'), 'utf8'));
const result = await build({
  stdin: { contents: `export { Icon, ICON_NAMES } from './src/react/Icon/Icon'; export * from './src/components/icons/icon-library'; export { copyIconText, IconGallery, IconPlayground, IconReference } from './src/react/Icon/IconExplorer'; export { createElement } from 'react'; export { renderToStaticMarkup } from 'react-dom/server'; export { ICON_PATHS } from './src/components/icons/icon-paths.js';`, resolveDir: root, loader: 'tsx' },
  bundle: true, platform: 'node', format: 'cjs', write: false, loader: { '.css': 'empty' },
  plugins: [{ name: 'original-svg', setup(bundler) {
    bundler.onResolve({ filter: /\.svg\?raw$/ }, args => ({ path: resolve(dirname(args.importer), args.path.replace(/\?raw$/, '')), namespace: 'original-svg' }));
    bundler.onLoad({ filter: /.*/, namespace: 'original-svg' }, args => ({ contents: readFileSync(args.path, 'utf8'), loader: 'text' }));
  } }],
});
const mod = { exports: {} };
new Function('require', 'module', 'exports', result.outputFiles[0].text)(createRequire(import.meta.url), mod, mod.exports);
const api = mod.exports;
const render = (name, props = {}) => api.renderToStaticMarkup(api.createElement(api.Icon, { name, ...props }));

test('every source entry has a unique typed identifier, local original SVG, and matching viewport/hash', () => {
  assert.equal(api.ICON_ENTRIES.length, manifest.entries.length);
  assert.equal(api.ICON_ENTRIES.length, 81);
  assert.equal(new Set(api.FIGMA_ICON_NAMES).size, 81);
  assert.deepEqual(api.ICON_COUNTS, { entries: 81, uniqueSvgExports: 80, components: 78, instances: 3, originalNames: 74, variants: 0 });
  for (const source of manifest.entries) {
    const svg = readFileSync(resolve(root, 'src/components/icons/assets', source.asset), 'utf8');
    assert.equal(createHash('sha256').update(svg).digest('hex'), source.sourceSha256, source.name);
    assert.equal(api.ICON_REGISTRY[source.name].svg, svg);
    assert.match(svg, /viewBox="0 0 24 24"/);
    assert.match(svg, /width="24" height="24"/);
    assert.ok(!/<(?:script|foreignObject|image)\b|https?:\/\/(?!www.w3.org)/i.test(svg), source.name);
  }
});

test('every canonical Icon renders the original child geometry and source color by default', () => {
  for (const entry of api.ICON_ENTRIES) {
    const html = render(entry.name);
    assert.match(html, /width="24" height="24" viewBox="0 0 24 24"/);
    assert.match(html, /aria-hidden="true"/);
    assert.ok(html.includes('<path') || html.includes('<g'), entry.name);
    const normalizeIds = content => {
      const ids = [...content.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
      return ids.reduce((result, id, index) => result.replaceAll(id, `verified-id-${index}`), content);
    };
    const expected = entry.svg.replace(/^<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    assert.equal(normalizeIds(html.slice(html.indexOf('>') + 1, html.lastIndexOf('</svg>'))), normalizeIds(expected), entry.name);
  }
});

test('custom paint preserves geometry, mask white, transparency, and masks have unique references', () => {
  const name = 'icon/chart_tooltip_off';
  const html = render(name, { color: '#179af5' });
  assert.match(html, /color="#179af5"/);
  assert.match(html, /fill="currentColor"/);
  assert.match(html, /fill="white"/);
  assert.match(html, /fill="none"/);
  const originalPaths = [...api.ICON_REGISTRY[name].svg.matchAll(/\bd="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual([...html.matchAll(/\bd="([^"]+)"/g)].map(m => m[1]), originalPaths);
  const pair = api.renderToStaticMarkup(api.createElement('div', null, api.createElement(api.Icon, { name }), api.createElement(api.Icon, { name })));
  const ids = [...pair.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const id of ids) assert.ok(pair.includes(`url(#${id})`));
});

test('meaningful icons are named and exposed; decorative icons remain hidden', () => {
  assert.match(render('icon/search'), /aria-hidden="true"/);
  const labeled = render('icon/search', { label: 'Search markets' });
  assert.match(labeled, /role="img"/);
  assert.match(labeled, /aria-label="Search markets"/);
  assert.ok(!labeled.includes('aria-hidden="true"'));
  assert.match(render('icon/search', { 'aria-label': 'Find' }), /aria-label="Find"/);
  assert.match(render('icon/search', { 'aria-labelledby': 'nearby-title' }), /aria-labelledby="nearby-title"/);
});

test('legacy names keep the exact path, inherited color, and existing selection list', () => {
  assert.deepEqual(api.ICON_NAMES, Object.keys(api.ICON_PATHS));
  for (const name of api.ICON_NAMES) {
    const html = render(name);
    assert.match(html, /fill="currentColor"/);
    assert.ok(html.includes(`d="${api.ICON_PATHS[name]}"`));
  }
  assert.throws(() => render('not-a-figma-icon'), /Unknown icon/);
});

test('search is immediate, case insensitive, includes duplicate names and clears to full inventory', () => {
  assert.equal(api.filterIcons('').length, 81);
  assert.equal(api.filterIcons(' SETTINGS ').length, 2);
  assert.equal(api.filterIcons('35:183')[0].name, 'icon/search');
  assert.equal(api.filterIcons('icon / сondensed').length, 2);
  assert.equal(api.filterIcons('not an icon').length, 0);
  assert.equal(api.filterIcons('', 'icon').length, 81);
  assert.equal(api.filterIcons('', 'invented-category').length, 0);
  assert.deepEqual(api.ICON_SIZES, [24]);
  assert.deepEqual(api.ICON_CATEGORIES, ['icon']);
});

test('gallery, playground, and generated inventory render all expected controls and entries', () => {
  const gallery = api.renderToStaticMarkup(api.createElement(api.IconGallery));
  assert.equal((gallery.match(/class="ds-icons-tile(?: is-selected)?"/g) || []).length, 81);
  assert.equal((gallery.match(/aria-label="Copy name icon\//g) || []).length, 81);
  assert.equal((gallery.match(/aria-label="Copy code icon\//g) || []).length, 81);
  assert.match(gallery, /type="search"/);
  const playground = api.renderToStaticMarkup(api.createElement(api.IconPlayground));
  for (const name of api.FIGMA_ICON_NAMES) assert.ok(playground.includes(`>${name}</option>`));
  const inventory = api.renderToStaticMarkup(api.createElement(api.IconReference));
  for (const entry of api.ICON_ENTRIES) assert.ok(inventory.includes(entry.nodeId), entry.name);
});

test('copy-name and copy-code use the exact canonical identifier and valid JSX', async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const copied = [];
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { writeText: async value => copied.push(value) } } });
  try {
    await api.copyIconText('icon/search');
    await api.copyIconText(api.iconCode('icon/search'));
    assert.deepEqual(copied, ['icon/search', '<Icon name="icon/search" />']);
  } finally { if (original) Object.defineProperty(globalThis, 'navigator', original); else delete globalThis.navigator; }
});

test('HTML renderer follows the same geometry, labeling, and explicit paint policy', () => {
  const html = api.libraryIconHTML('icon/search', { label: 'Search', color: '#179af5' });
  assert.match(html, /aria-label="Search"/);
  assert.match(html, /fill="currentColor"/);
  assert.match(api.libraryIconHTML('icon/search'), /fill="#030712"/);
});
