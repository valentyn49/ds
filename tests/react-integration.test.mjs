import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { normalizeHtml } from './normalize-html.mjs';

const result = await build({
  stdin: { contents: `
    export * from './src/react/Dropdown/Dropdown';
    export { dropdownHTML } from './src/components/dropdown/dropdown.js';
    export * from './src/react/Popup/Popup';
    export * from './src/react/Table/Table';
    export * from './src/react/Header/Header';
    export * from './src/react/utils/modalEnvironment';
    export { popupHTML } from './src/components/popup/popup.js';
    export { headerHTML } from './src/components/header/header.js';
    export { tableHTML, tableCellHTML } from './src/components/table/table.js';
    export { TABLE_CELL_VARIANTS } from './src/components/table/table.spec.js';
    export { sampleFor } from './src/react/Table/sampleCells';
    export { createElement } from 'react';
    export { renderToStaticMarkup } from 'react-dom/server';`, resolveDir: process.cwd(), loader: 'tsx' },
  bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['highcharts/*', '@highcharts/react/*'],
  loader: { '.css': 'empty', '.svg': 'dataurl', '.png': 'dataurl' },
  plugins: [{ name: 'raw-svg', setup(bundler) {
    bundler.onResolve({ filter: /\.svg\?raw$/ }, args => ({ path: resolve(dirname(args.importer), args.path.slice(0, -4)), namespace: 'raw-svg' }));
    bundler.onLoad({ filter: /.*/, namespace: 'raw-svg' }, args => ({ contents: readFileSync(args.path, 'utf8'), loader: 'text' }));
    bundler.onLoad({ filter: /\.svg$/, namespace: 'file' }, args => ({ contents: `export default ${JSON.stringify('data:image/svg+xml;base64,' + readFileSync(args.path).toString('base64'))}`, loader: 'js' }));
  } }],
});
const mod = { exports: {} };
new Function('require', 'module', 'exports', result.outputFiles[0].text)(createRequire(import.meta.url), mod, mod.exports);
const api = mod.exports;
const render = (name, props, ...children) => api.renderToStaticMarkup(api.createElement(api[name], props, ...children));
function assertParity(cases) {
  cases.forEach(c => assert.deepEqual(normalizeHtml(c.react), normalizeHtml(c.html), c.name));
}

test('all component families and helpers are available from the built public package', async () => {
  const built = await import('../dist/index.js');
  for (const name of ['Button', 'Icon', 'TextInput', 'TextArea', 'InputTag', 'Checkbox', 'RadioButton', 'Stepper', 'Tabs', 'Notification', 'Accordion', 'Footer', 'Logo', 'Highcharts', 'Toast', 'ToastProvider', 'Tooltip', 'Dropdown', 'DropdownItems', 'Popup', 'PopupView', 'Table', 'TableCell', 'TableHeaderCell', 'TableDividerRow', 'Header']) assert.ok(built[name], name);
  const css = readFileSync('dist/styles.css', 'utf8');
  for (const selector of ['.ds-dropdown', '.ds-popup', '.ds-tbl', '.ds-header']) assert.ok(css.includes(selector), selector);
});

test('all 33 Table cell variants preserve legacy markup and row-header semantics', () => {
  assert.equal(api.TABLE_CELL_VARIANTS.length, 33);
  assertParity(api.TABLE_CELL_VARIANTS.flatMap(variant => [false, true].map(rowHeader => {
    const cell = api.sampleFor(variant);
    return { name: `${variant.mode}/${variant.type}/${variant.metricType}/${variant.textType}/rowHeader=${rowHeader}`,
      react: render('TableCell', { cell, rowHeader }), html: api.tableCellHTML(cell, { rowHeader }) };
  })));
});

test('Table themes, divider actions, subscription descriptions and sticky layout preserve HTML parity', () => {
  const columns = [{ title: 'Market', width: 140, sorting: true, sorted: true }, { title: 'Value' }];
  assertParity(['light', 'dark'].flatMap(theme => [false, true].map(stickyFirstColumn => {
    const props = { columns, theme, stickyFirstColumn, label: 'Markets', footnote: 'Updated', columnDividers: true, rows: [
      { divider: true, title: 'Section', icon: 'star', action: { label: 'Edit' } },
      { subscription: 'premium', cells: [{ type: 'text', text: '<Market>' }, { type: 'metric', text: '12.4' }] },
    ] };
    return { name: `${theme}/${stickyFirstColumn}`, react: render('Table', props), html: api.tableHTML({ ...props, mode: theme }) };
  })));
});

test('PopupView preserves all legacy types, widths, modes and optional actions', () => {
  const cases = [];
  for (const type of api.POPUP_TYPE_LIST) for (const width of api.POPUP_WIDTH_LIST) for (const mode of ['fixed', 'contained', 'static']) for (const showCancel of [false, true]) {
    const props = { type, width, mode, showCancel, title: 'A & <Title>', subtitle: 'Details', primaryLabel: 'Continue' };
    cases.push({ name: `${type}/${width}/${mode}/${showCancel}`, react: render('PopupView', props, 'Body'), html: api.popupHTML({ ...props, body: 'Body' }) });
  }
  assertParity(cases);
  assert.equal(render('Popup', { open: true, title: 'Server' }), '');
});

test('Header preserves platform/account variants, desktop menus and expanded drawer content', () => {
  const cases = [];
  for (const platform of api.HEADER_PLATFORMS) for (const type of api.HEADER_TYPES) for (const warning of [false, true]) for (const open of [{}, { panel: 'help', flyout: true }, { drawer: true, expanded: ['Socrates Markets', 'account'] }]) {
    const props = { platform, type, warning };
    cases.push({ name: `${platform}/${type}/${warning}/${JSON.stringify(open)}`, react: render('Header', { ...props, defaultOpen: open }), html: api.headerHTML({ ...props, open }) });
  }
  assertParity(cases);
  // React exposes stable section labels; the legacy builder uses a generated DOM ID for nested keys.
  const nested = render('Header', { defaultOpen: { drawer: true, expanded: ['Socrates Markets', 'Socrates Markets:Bonds'] } });
  assert.match(nested, /class="ds-header__row-button ds-header__row-button--sub" aria-expanded="true"[^>]*><span>Bonds/);
});

test('Dropdown exposes valid combobox/listbox relationships, selected and disabled states, and escaped labels', () => {
  for (const open of [false, true]) for (const showSearch of [false, true]) for (const disabled of [false, true]) {
    const html = render('Dropdown', { id: 'cities', options: ['A & <B>', 'Paris'], value: 'Paris', open, disabled, showSearch, validation: 'error' });
    assert.match(html, /role="listbox" id="cities-listbox"/);
    assert.match(html, /aria-controls="cities-listbox"/);
    assert.ok(html.includes(`aria-expanded="${open && !disabled}"`));
    assert.match(html, /aria-selected="true"/);
    assert.match(html, /aria-invalid="true"/);
    assert.match(html, /A &amp; &lt;B&gt;/);
    if (showSearch) assert.match(html, /aria-autocomplete="list"/);
  }
  const empty = render('Dropdown', { options: [], open: true });
  assert.doesNotMatch(empty, /aria-activedescendant/);
  const items = api.renderToStaticMarkup(api.createElement('div', null, ...[1, 2].map(key => api.createElement(api.DropdownItems, { key, options: ['One'] }))));
  const ids = [...items.matchAll(/id="([^"]+-option-0)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, 2);
});

// Deliberately small DOM doubles: test modal lifecycle/keyboard decisions, not browser layout or React events.
function environment() {
  const doc = { activeElement: null, documentElement: { clientWidth: 1000 }, defaultView: { innerWidth: 1020, getComputedStyle: () => ({ paddingRight: '4px' }) } };
  function node(parent) {
    const element = { ownerDocument: doc, parentElement: parent, children: [], inert: false, style: { overflow: '', paddingRight: '' }, tabIndex: 0,
      getClientRects: () => [{}], contains(target) { return target === this || this.children.some(child => child.contains(target)); },
      closest() { for (let el = this; el; el = el.parentElement) if (el.inert) return el; return null; },
      focus() { doc.activeElement = this; }, querySelectorAll() { return this.children; } };
    parent?.children.push(element);
    return element;
  }
  const body = node(); doc.body = body;
  return { doc, body, node };
}

test('overlapping modals retain isolation and scroll lock when the lower modal closes first', () => {
  const { body, node } = environment();
  const app = node(body), preInert = node(body), lowerRoot = node(body), upperRoot = node(body);
  preInert.inert = true; body.style.overflow = 'auto'; body.style.paddingRight = '3px';
  const lower = api.enterModal(lowerRoot, body, true);
  const upper = api.enterModal(upperRoot, body, true);
  assert.equal(lower.isTop(), false); assert.equal(upper.isTop(), true);
  assert.equal(lower.dispose(), false);
  assert.equal(app.inert, true); assert.equal(lowerRoot.inert, true); assert.equal(upperRoot.inert, false);
  assert.equal(body.style.overflow, 'hidden'); assert.equal(body.style.paddingRight, '24px');
  assert.equal(upper.dispose(), true); assert.equal(upper.dispose(), false);
  assert.equal(app.inert, false); assert.equal(preInert.inert, true);
  assert.equal(body.style.overflow, 'auto'); assert.equal(body.style.paddingRight, '3px');
});

test('nested drawer isolates the application and header bar while retaining its clickable scrim', () => {
  const { body, node } = environment();
  const app = node(body), header = node(app), main = node(app), bar = node(header), scrim = node(header), drawer = node(header);
  const modal = api.enterModal(drawer, body, true, [scrim]);
  assert.equal(main.inert, true); assert.equal(bar.inert, true); assert.equal(scrim.inert, false); assert.equal(app.inert, false);
  modal.dispose(); assert.equal(main.inert, false); assert.equal(bar.inert, false);
});

test('closing the upper modal reactivates the lower one; contained modals leave page scrolling alone', () => {
  const { body, node } = environment();
  const lowerRoot = node(body), lower = api.enterModal(lowerRoot, body, true), upperRoot = node(body), upper = api.enterModal(upperRoot, body, true);
  upper.dispose(); assert.equal(lower.isTop(), true); assert.equal(lowerRoot.inert, false); assert.equal(upperRoot.inert, true);
  lower.dispose();
  const container = node(body), behind = node(container), overlay = node(container);
  const contained = api.enterModal(overlay, container, false);
  assert.equal(behind.inert, true); assert.equal(body.style.overflow, ''); contained.dispose();
});

test('modal keyboard trap wraps both ends, recovers escaped focus and provides an empty-dialog fallback', () => {
  const { body, doc, node } = environment();
  const dialog = node(body), first = node(dialog), last = node(dialog), outside = node(body);
  const key = (shiftKey = false, key = 'Tab') => ({ key, shiftKey, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } });
  last.focus(); const forward = key(); api.trapModalTab(forward, dialog); assert.equal(doc.activeElement, first); assert.equal(forward.defaultPrevented, true);
  first.focus(); api.trapModalTab(key(true), dialog); assert.equal(doc.activeElement, last);
  outside.focus(); api.trapModalTab(key(), dialog); assert.equal(doc.activeElement, first);
  outside.focus(); api.trapModalTab(key(false, 'Enter'), dialog); assert.equal(doc.activeElement, outside);
  dialog.children = []; api.trapModalTab(key(), dialog); assert.equal(doc.activeElement, dialog);
});


test('modals in independent documents do not share a stack or scroll locks', () => {
  const first = environment(), second = environment();
  const a = api.enterModal(first.node(first.body), first.body, true);
  const b = api.enterModal(second.node(second.body), second.body, true);
  assert.equal(a.isTop(), true); assert.equal(b.isTop(), true);
  a.dispose(); assert.equal(first.body.style.overflow, ''); assert.equal(second.body.style.overflow, 'hidden');
  b.dispose();
});


test('Dropdown preserves HTML presentation across 64 state/search/label/footnote/info combinations', () => {
  const cases = [];
  for (const open of [false, true]) for (const disabled of [false, true]) for (const showSearch of [false, true]) for (const showLabel of [false, true]) for (const showFootnote of [false, true]) for (const info of [false, true]) {
    const props = { id: 'cities', options: ['London', 'Paris'], value: 'Paris', open, disabled, showSearch, showLabel, showFootnote, info, showCheckbox: true, showRightIcon: true, showColor: true };
    const isOpen = open && !disabled;
    let html = api.dropdownHTML({ ...props, activeIndex: isOpen ? 1 : -1 })
      .replace('aria-controls="cities-menu"', 'aria-controls="cities-listbox"')
      .replace('class="ds-dropdown__list"', 'class="ds-dropdown__list" id="cities-listbox"');
    // Intentional React accessibility additions are asserted independently above.
    if (showSearch) {
      html = html.replace(/ aria-activedescendant="cities-option-1"/, '');
      html = html.replace(/<input\b[^>]*>/, input => {
        const placeholder = /placeholder="([^"]*)"/.exec(input)[1];
        return input.replace(/aria-label="[^"]*"/, `aria-label="${placeholder}"`).replace('<input', `<input role="combobox" aria-expanded="${isOpen}" aria-controls="cities-listbox" aria-autocomplete="list"${isOpen ? ' aria-activedescendant="cities-option-1"' : ''}`);
      });
    }
    cases.push({ name: JSON.stringify(props), react: render('Dropdown', props), html });
  }
  assertParity(cases);
});


test('a contained dialog inside a viewport modal retains both levels of background isolation', () => {
  const { body, node } = environment();
  const app = node(body), outerRoot = node(body), outerContent = node(outerRoot), innerRoot = node(outerRoot);
  const outer = api.enterModal(outerRoot, body, true);
  const inner = api.enterModal(innerRoot, outerRoot, false);
  assert.equal(app.inert, true); assert.equal(outerContent.inert, true); assert.equal(outerRoot.inert, false); assert.equal(innerRoot.inert, false);
  inner.dispose(); assert.equal(app.inert, true); assert.equal(outerContent.inert, false);
  outer.dispose(); assert.equal(app.inert, false);
});
