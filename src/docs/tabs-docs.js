import { tabsHTML, createTabs, sampleItems } from '../components/tabs/tabs.js';
import { TABS_TYPES, FIGMA_LABEL, ITEM_STATE_PROPERTY, ITEM_STATES, ITEM_COUNT, TABS_SPEC, STATE_TOKENS, PRO_LABEL } from '../components/tabs/tabs.spec.js';
import { esc, legendItem } from './doc-helpers.js';

// ---- Helpers used by the stories (kept here so the stories file only exports stories) ------------------

export const panelHTML = (label) => `<div class="ds-bd-tabs-panel">Sample panel content for "${esc(label)}". Figma does not define panel content.</div>`;

// Builds an interactive bar. `previewState` forces hover/pressed/disabled on the tab after the selected one (documentation only).
export function demoTabs({ type, mode, count, selected = 1, icon = false, pro = false, divider = false, previewState = 'none', withPanels = true }) {
  const items = sampleItems(type, count, { icon, pro, divider });
  const current = Math.min(Math.max(selected - 1, 0), items.length - 1);
  if (previewState !== 'none') {
    const target = items[(current + 1) % items.length];
    if (previewState === 'disabled') target.disabled = true;
    else target.previewState = previewState;
  }
  if (withPanels && type !== 'General tab') items.forEach((item) => (item.panel = panelHTML(item.label)));
  return createTabs({ type, mode, items, selected: current, ariaLabel: `${type} sample` });
}

// Shows which item is current for the navigation bar, which has no panels. Documentation only.
export function withReadout(bar, wrapper) {
  const readout = document.createElement('div');
  readout.className = 'ds-bd-tabs-readout';
  const update = (label) => (readout.textContent = `Current item: ${label}`);
  update(bar.querySelector('[aria-current="page"]')?.textContent.trim() ?? 'none');
  bar.addEventListener('ds-tabs-change', (event) => update(event.detail.label));
  wrapper.append(readout);
}

// ---- Static markup for the documentation sections -------------------------------------------------------

const box = (inner, width) => `<div class="ds-bd-tabs-box"${width ? ` style="max-width:${width}px"` : ''}>${inner}</div>`;
const row = (caption, inner, width) => `<div class="ds-bd-tabs-item"><code>${esc(caption)}</code>${box(inner, width)}</div>`;

const figmaItems = (type, count, extra = () => ({})) =>
  Array.from({ length: count }, (_, i) => ({ label: FIGMA_LABEL[type], ...extra(i) }));

const bar = (type, items, { selected = 0, mode = 'light' } = {}) => tabsHTML({ type, mode, items, selected, ariaLabel: `${type} example` });

// Adds an anatomy marker (see .ds-bd-anchor in input-docs.css) to the nth element with the given class attribute.
const mark = (html, cls, dir, n, { nth = 0, ax = '' } = {}) => {
  let seen = -1;
  return html.replace(new RegExp(`class="${cls}"`, 'g'), (match) =>
    ++seen === nth ? `class="${cls} ds-bd-anchor ds-bd-anchor--${dir}" data-n="${n}"${ax ? ` style="--ax:${ax}"` : ''}` : match,
  );
};

const card = (title, parts, text, inner) => `<div class="ds-bd-tabs-card">
  <div class="ds-bd-tabs-card__head"><strong>${esc(title)}</strong><span>${parts}</span></div>
  <div class="ds-bd-tabs-card__stage">${inner}</div>
  <div class="ds-bd-tabs-card__text">${text}</div>
</div>`;

export function renderOverview() {
  return `<div class="ds-bd-tabs-overview">
    ${card(
      'tab',
      `Figma component <code>tab</code>, made of <code>tab-item</code>`,
      'Underline tabs. The selected tab has a primary/600 label and a primary/600 line under it; the other tabs have a gray/200 line. Each tab can show a right icon.',
      bar('tab', figmaItems('tab', 5, (i) => ({ icon: i === 4 }))),
    )}
    ${card(
      'General tab',
      `Figma component <code>General tab</code>, made of <code>menu item</code>`,
      'Boxed tabs on a white bar with an 8px radius. The selected tab has a background/900 fill and a 1px gray/900 outline. A tab can show an icon and an "Upgrade" badge, and the bar can show dividers.',
      bar('General tab', figmaItems('General tab', 3, (i) => ({ icon: i === 2, pro: i === 2 }))),
    )}
    ${card(
      'Small tab',
      `Figma component <code>Small tab</code>, made of <code>small menu item</code>`,
      'Compact tabs on a bar in <code>light</code> or <code>dark</code> mode. The selected tab is filled with primary/600. A tab can show an icon.',
      `${bar('Small tab', figmaItems('Small tab', 4), { mode: 'light' })}<div class="ds-bd-tabs-gap"></div>${bar('Small tab', figmaItems('Small tab', 4), { mode: 'dark' })}`,
    )}
  </div>
  <div class="ds-bd-note">The three bars are separate components in Figma, each with its own tab component and states. They share the same label font (Proxima Nova Semibold), hug their content, sit at the left and have no size property. Figma shows no content panels for any of them.</div>`;
}

// ---- Anatomy --------------------------------------------------------------------------------------------

const legendBlock = (items) => `<ol class="ds-bd-anatomy__legend">${items.map(([n, title, text]) => legendItem(n, title, text)).join('')}</ol>`;

function anatomyFigure(title, covers, html, zoom, legend) {
  return `<div class="ds-bd-anatomy ds-bd-tabs-anatomy-block">
    <h3>${esc(title)}</h3>
    <div class="ds-bd-note">${covers}</div>
    <div class="ds-bd-anatomy__stage ds-bd-tabs-anatomy" style="--z:${zoom}"><div class="ds-bd-tabs-anatomy__figure">${html}</div></div>
    ${legendBlock(legend)}
  </div>`;
}

export function renderAnatomy() {
  let tab = bar('tab', [
    { label: FIGMA_LABEL.tab, icon: true },
    { label: FIGMA_LABEL.tab },
    { label: FIGMA_LABEL.tab },
  ]);
  tab = mark(tab, 'ds-tabs__list', 'left', 1);
  tab = mark(tab, 'ds-tabs__item', 'top', 2, { nth: 1 });
  tab = mark(tab, 'ds-tabs__label', 'top', 3, { nth: 0 });
  tab = mark(tab, 'ds-tabs__icon', 'bottom', 4);
  tab = mark(tab, 'ds-tabs__item', 'bottom', 5, { nth: 0, ax: '10px' });

  let general = bar('General tab', [
    { label: FIGMA_LABEL['General tab'], icon: true, pro: true },
    { label: FIGMA_LABEL['General tab'] },
    { label: FIGMA_LABEL['General tab'], dividerBefore: true },
  ]);
  general = mark(general, 'ds-tabs__list', 'left', 1);
  general = mark(general, 'ds-tabs__item', 'top', 2, { nth: 1 });
  general = mark(general, 'ds-tabs__label', 'top', 3, { nth: 0 });
  general = mark(general, 'ds-tabs__icon', 'bottom', 4);
  general = mark(general, 'ds-tabs__pro', 'bottom', 5);
  general = mark(general, 'ds-tabs__divider', 'top', 6);

  let small = bar('Small tab', [
    { label: FIGMA_LABEL['Small tab'], icon: true },
    { label: FIGMA_LABEL['Small tab'] },
    { label: FIGMA_LABEL['Small tab'] },
  ]);
  small = mark(small, 'ds-tabs__list', 'left', 1);
  small = mark(small, 'ds-tabs__item', 'top', 2, { nth: 1 });
  small = mark(small, 'ds-tabs__label', 'top', 3, { nth: 0 });
  small = mark(small, 'ds-tabs__icon', 'bottom', 4);

  return `${anatomyFigure('tab', 'Built from <code>tab-item</code>.', tab, 2.5, [
    [1, 'Tabs container', 'Hugs the tabs. It has no fill, no padding and no gap, and no divider line of its own.'],
    [2, 'Tab', 'One <code>tab-item</code>: 8px left and right, 8px below the label.'],
    [3, 'Label', 'Proxima Nova Semibold 14/20. Gray/600, primary/600 when selected, gray/900 on hover and pressed.'],
    [4, 'Right icon', 'Optional (<code>right icon</code>). A 20px plus icon, 4px after the label, in the label color.'],
    [5, 'Line', 'A 1px line along the bottom of each tab: gray/200, or primary/600 on the selected tab. This is the active indicator.'],
  ])}
  ${anatomyFigure('General tab', 'Built from <code>menu item</code>.', general, 1.3, [
    [1, 'Tabs container', 'White bar (gray/50) with 4px padding, an 8px radius and 8px between tabs.'],
    [2, 'Tab', 'One <code>menu item</code>: 12px top and bottom, 16px left and right, 8px radius. The selected tab adds a background/900 fill and a 1px gray/900 outline.'],
    [3, 'Label', 'Proxima Nova Semibold 14/20. Gray/500, gray/900 when selected, gray/600 on hover and pressed, gray/200 when disabled.'],
    [4, 'Icon', 'Optional (<code>icon</code>). A 16px info icon before the label, 4px gap, in the label color.'],
    [5, 'Badge', 'Optional (<code>pro</code>). The text "Upgrade" in a 72 x 24 badge: green/100 fill, green/600 text, 4px radius.'],
    [6, 'Divider', 'Optional (<code>divider</code>, <code>divider 2</code>). A 1 x 32 line in gray/400 between tabs.'],
  ])}
  ${anatomyFigure('Small tab', 'Built from <code>small menu item</code>. The <code>light</code> and <code>dark</code> modes share this anatomy and differ only in colors.', small, 2, [
    [1, 'Tabs container', 'Bar with 4px padding, an 8px radius and 4px between tabs. Fill background/900 in light mode, secondary/800 in dark mode.'],
    [2, 'Tab', 'One <code>small menu item</code>: 7px top and bottom, 8px left and right, 8px radius. The selected tab is filled primary/600.'],
    [3, 'Label', 'Proxima Nova Semibold 12/18. The color depends on the state and the mode.'],
    [4, 'Icon', 'Optional (<code>icon</code>). A 16px condensed icon before the label, 4px gap.'],
  ])}`;
}

// ---- Types and variants ---------------------------------------------------------------------------------

function comparisonTable() {
  const rows = [
    ['Figma component', 'tab', 'General tab', 'Small tab'],
    ['Tab component', 'tab-item', 'menu item', 'small menu item'],
    ['Tab state property', '<code>type</code>', '<code>state</code>', '<code>state</code>'],
    ['Bar property', 'tabs on or off (2 to 14)', 'tabs on or off (2 to 11), <code>divider</code>, <code>divider 2</code>', '<code>mode</code>, tabs on or off (2 to 6)'],
    ['Optional tab parts', '<code>right icon</code>', '<code>icon</code>, <code>pro</code>', '<code>icon</code>'],
    ['Selected look', 'primary/600 label and line', 'background/900 fill, 1px gray/900 outline', 'primary/600 fill, gray/50 label'],
    ['Bar', 'no fill', 'gray/50 fill, 8px radius', 'background/900 or secondary/800 fill, 8px radius'],
    ['Tab shape', 'underline, no radius', 'boxed, 8px radius', 'filled, 8px radius'],
  ];
  return `<table class="ds-table ds-bd-tabs-table"><thead><tr><th></th><th>${TABS_TYPES.join('</th><th>')}</th></tr></thead><tbody>${rows
    .map(([label, ...cells]) => `<tr><th scope="row">${label}</th>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
}

export function renderTypes() {
  const tab = `<h3>tab</h3>
    <div class="ds-bd-tabs-stack">
      ${row('tab · first tab selected (10 tabs, as in Figma)', bar('tab', figmaItems('tab', 10)))}
      ${row('tab-item · right icon = true', bar('tab', figmaItems('tab', 4, () => ({ icon: true }))))}
    </div>`;
  const general = `<h3>General tab</h3>
    <div class="ds-bd-tabs-stack">
      ${row('General tab · first tab selected (5 of 10 tabs shown)', bar('General tab', figmaItems('General tab', 5)))}
      ${row('menu item · icon = true', bar('General tab', figmaItems('General tab', 4, () => ({ icon: true }))))}
      ${row('menu item · pro = true', bar('General tab', figmaItems('General tab', 4, (i) => ({ pro: i > 0 }))))}
      ${row('menu item · icon = true, pro = true', bar('General tab', figmaItems('General tab', 3, () => ({ icon: true, pro: true }))))}
      ${row('General tab · divider = true, divider 2 = true', bar('General tab', figmaItems('General tab', 5, (i) => ({ dividerBefore: i === 2 || i === 4 }))))}
    </div>`;
  const small = `<h3>Small tab</h3>
    <div class="ds-bd-tabs-stack">
      ${row('Small tab · mode = light', bar('Small tab', figmaItems('Small tab', 6), { mode: 'light' }))}
      ${row('Small tab · mode = dark', bar('Small tab', figmaItems('Small tab', 6), { mode: 'dark' }))}
      ${row('small menu item · icon = true, mode = light', bar('Small tab', figmaItems('Small tab', 4, () => ({ icon: true })), { mode: 'light' }))}
      ${row('small menu item dark · icon = true, mode = dark', bar('Small tab', figmaItems('Small tab', 4, () => ({ icon: true })), { mode: 'dark' }))}
    </div>`;
  return `${tab}${general}${small}
  <div class="ds-bd-note">The labels are the repeated sample text from Figma ("${FIGMA_LABEL.tab}", "${FIGMA_LABEL['General tab']}", "${FIGMA_LABEL['Small tab']}"). The dividers, the badge and the icons are optional properties; Figma places the "${PRO_LABEL}" badge only inside the tab.</div>
  ${comparisonTable()}`;
}

// ---- Sizes ----------------------------------------------------------------------------------------------

export function renderSizes() {
  const rows = [
    ['tab', '28px', '28px (no padding)', 'text-sm/font-medium, 14/20', '20px (right icon)'],
    ['General tab', '50px', '58px (4px padding)', 'text-sm/font-medium, 14/20', '16px'],
    ['Small tab', '32px', '40px (4px padding)', 'text-xs/font-medium, 12/18', '16px'],
  ];
  return `<table class="ds-table ds-bd-tabs-table"><thead><tr><th>Type</th><th>Tab height</th><th>Bar height</th><th>Label</th><th>Icon</th></tr></thead><tbody>${rows
    .map(([a, ...cells]) => `<tr><th scope="row">${a}</th>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
}

// ---- States ---------------------------------------------------------------------------------------------

const stateTile = (type, caption, item, mode) =>
  `<div class="ds-bd-tabs-state"><code>${esc(caption)}</code>${bar(type, [{ label: FIGMA_LABEL[type], ...item }], { selected: item.selectedState ? 0 : null, mode })}</div>`;

function stateGrid(type, mode) {
  const prop = ITEM_STATE_PROPERTY[type];
  const tiles = ITEM_STATES[type].map((state) => {
    const key = state.toLowerCase();
    const caption = `${prop}=${state}`;
    if (key === 'selected' || key === 'active') return stateTile(type, caption, { selectedState: true }, mode);
    if (key === 'disabled') return stateTile(type, caption, { disabled: true }, mode);
    if (key === 'hover' || key === 'pressed') return stateTile(type, caption, { previewState: key }, mode);
    return stateTile(type, caption, {}, mode);
  });
  tiles.push(stateTile(type, 'focus (keyboard, not in Figma)', { previewState: 'focus' }, mode));
  return `<div class="ds-bd-tabs-states">${tiles.join('')}</div>`;
}

function stateTokens(type, mode) {
  const map = type === 'Small tab' ? STATE_TOKENS[type][mode] : STATE_TOKENS[type];
  const rows = Object.entries(map).map(([state, t]) => `<tr><th scope="row">${state}</th><td>${t.text}</td><td>${t.fill || '-'}</td><td>${t.line || '-'}</td></tr>`);
  return `<table class="ds-table ds-bd-tabs-table"><thead><tr><th>${ITEM_STATE_PROPERTY[type]}</th><th>Label and icon</th><th>Fill</th><th>Line or outline</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

export function renderStates() {
  return `<h3>tab</h3>
    <div class="ds-bd-note">The <code>tab-item</code> has the states selected, default, hover and pressed. It has no disabled state.</div>
    ${stateGrid('tab')}${stateTokens('tab')}
  <h3>General tab</h3>
    <div class="ds-bd-note">The <code>menu item</code> has the states selected, default, disabled, hover and pressed.</div>
    ${stateGrid('General tab')}${stateTokens('General tab')}
  <h3>Small tab</h3>
    <div class="ds-bd-note">The <code>small menu item</code> (light) and <code>small menu item dark</code> have the states active, default, disabled, hover and Pressed.</div>
    <div class="ds-bd-tabs-subtitle">mode = light</div>${stateGrid('Small tab', 'light')}${stateTokens('Small tab', 'light')}
    <div class="ds-bd-tabs-subtitle">mode = dark</div>${stateGrid('Small tab', 'dark')}${stateTokens('Small tab', 'dark')}
  <div class="ds-bd-note">In Figma, hover and pressed look the same for <code>tab</code>, for <code>General tab</code> and for the dark <code>Small tab</code>. The selected (active) tab has no hover, pressed or disabled look. Figma defines no focus state; the focus row uses the existing focus-primary ring and is not a Figma specification.</div>`;
}

// ---- Formatting and alignment ---------------------------------------------------------------------------

export function renderFormatting() {
  const tableFor = (type, extra = []) => {
    const s = TABS_SPEC[type];
    const items = [
      ['Bar', s.container],
      ['Tab', s.item],
      ['Label', s.label],
      ['Icon', s.icon],
      ...(s.badge ? [['Badge', s.badge]] : []),
      ['Divider', s.divider],
      ['Corner radius', s.radius],
      ['Tab width', 'Hugs the label (and icon or badge). No minimum width, no equal-width layout.'],
      ['Alignment', 'Tabs start at the left of the bar, in order. The label is centered inside its tab.'],
      ['Content panel', 'Figma shows only the bar. It defines no panel and no spacing between the bar and a panel.'],
      ...extra,
    ];
    return `<table class="ds-table ds-bd-tabs-table"><tbody>${items.map(([a, b]) => `<tr><th scope="row">${a}</th><td>${esc(b)}</td></tr>`).join('')}</tbody></table>`;
  };
  return `<h3>tab</h3>
    ${row('Figma values', bar('tab', figmaItems('tab', 4)))}${tableFor('tab')}
  <h3>General tab</h3>
    ${row('Figma values', bar('General tab', figmaItems('General tab', 4, (i) => ({ dividerBefore: i === 3 }))))}${tableFor('General tab')}
  <h3>Small tab</h3>
    ${row('Figma values', bar('Small tab', figmaItems('Small tab', 4)))}${tableFor('Small tab', [['Modes', 'light and dark use the same sizes and spacing']])}`;
}

// ---- Responsive -----------------------------------------------------------------------------------------

export function renderResponsive() {
  const n = (type) => ITEM_COUNT[type].default;
  return `<div class="ds-bd-tabs-stack">
    ${row('tab · 10 tabs in a 320px container', bar('tab', figmaItems('tab', n('tab'))), 320)}
    ${row('General tab · 10 tabs in a 320px container', bar('General tab', figmaItems('General tab', n('General tab'))), 320)}
    ${row('Small tab · 6 tabs in a 320px container', bar('Small tab', figmaItems('Small tab', n('Small tab'))), 320)}
  </div>
  <div class="ds-bd-note">Figma defines one layout for each bar and no tablet or mobile variants. Tabs keep their size and the bar is as wide as its tabs (560px, 1500px and 466px in the Figma examples). Figma does not say what happens when the bar is wider than the space it is in, and it shows no wrapping, overflow control or orientation change. The component does not shrink or wrap its tabs; when the bar is wider than its container it scrolls sideways inside that container so the page does not widen. This is an implementation choice, not a Figma specification. The 80px and 40px page margins used by the Header and Footer are page-level rules and are not part of the tabs.</div>`;
}

// ---- Behaviors (semantics and keyboard) -----------------------------------------------------------------

export function renderSemantics() {
  return `<table class="ds-table ds-bd-tabs-table"><thead><tr><th>Type</th><th>Pattern</th><th>Markup</th></tr></thead><tbody>
    <tr><th scope="row">tab</th><td>Tabs that switch a content panel</td><td><code>role="tablist"</code> with <code>button role="tab"</code> and <code>role="tabpanel"</code>; <code>aria-selected</code>, <code>aria-controls</code>, <code>aria-labelledby</code></td></tr>
    <tr><th scope="row">Small tab</th><td>Tabs that switch a content panel</td><td>Same as <code>tab</code></td></tr>
    <tr><th scope="row">General tab</th><td>Navigation</td><td><code>nav</code> with links; the current link has <code>aria-current="page"</code>; a disabled link has <code>aria-disabled="true"</code></td></tr>
  </tbody></table>`;
}

export function renderKeyboard() {
  return `<table class="ds-table ds-bd-tabs-table"><thead><tr><th>Key</th><th>tab and Small tab</th><th>General tab</th></tr></thead><tbody>
    <tr><th scope="row">Tab</th><td>Moves focus into the bar (to the selected tab), then to the panel</td><td>Moves focus through the links, skipping a disabled link</td></tr>
    <tr><th scope="row">Arrow Left / Arrow Right</th><td>Moves focus to the previous or next enabled tab, wrapping at the ends, and selects it</td><td>No special behavior</td></tr>
    <tr><th scope="row">Home / End</th><td>Moves focus to the first or last enabled tab and selects it</td><td>No special behavior</td></tr>
    <tr><th scope="row">Enter / Space</th><td>Activates the focused tab (already selected when focused with the arrows)</td><td>Enter follows the focused link</td></tr>
  </tbody></table>`;
}
