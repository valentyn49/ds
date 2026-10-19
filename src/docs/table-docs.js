import { tableHTML, tableCellHTML, TABLE_SUBSCRIPTIONS } from '../components/table/table.js';
import { TABLE_CELL_TYPES, TABLE_CELL_VARIANTS, TABLE_LIGHT_ONLY, TABLE_SPEC, TABLE_FLEX_MIN, TABLE_PREVIEW_FRAMES } from '../components/table/table.spec.js';
import { esc, anchor, legendItem } from './doc-helpers.js';
import {
  WATCHLIST_COLUMNS,
  WATCHLIST_ROWS,
  WATCHLIST_FOOTNOTE,
  ALERTS_COLUMNS,
  ALERTS_ROWS,
  MOBILE_COLUMNS,
  MOBILE_ROWS,
  LIGHT_COLUMNS,
} from './table-examples.js';

const tableBlock = (rows, head = ['', 'Figma value']) =>
  `<table class="ds-table ds-bd-tb-table"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
// Row values are author-written strings and may contain <code>.
const row = (label, value) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`;
const rowN = (cols) => `<tr><th scope="row">${cols[0]}</th>${cols.slice(1).map((c) => `<td>${c}</td>`).join('')}</tr>`;
const stage = (inner, cls = '') => `<div class="ds-bd-tb-stage ${cls}">${inner}</div>`;
const label = (text) => `<code class="ds-bd-tb-label">${esc(text)}</code>`;

// ---------- sample cells, one per Figma variant (texts are the ones in the Figma component) ----------
const NAME = 'Australia BMK 10 Yr YLD (AUD)';
const SAMPLES = {
  'market name': { type: 'market name', name: NAME, flag: '🇦🇺', country: 'Australia' },
  text: { type: 'text', text: 'SCHZ' },
  'text|1 element': { type: 'text', text: '4.05', textType: '1 element', badge: '1', suffix: '(1%)' },
  'text|2 element': { type: 'text', text: '4.05', textType: '2 element', badge: '1', suffix: '(1%)' },
  text_new: { type: 'text_new', label: 'New', text: 'Text' },
  text_label: { type: 'text_label', textType: '1 element', count: '1', label: 'New', text: 'Alert' },
  link: { type: 'link', text: 'Link' },
  toggle: { type: 'toggle', text: 'Status' },
  blank: { type: 'blank' },
  icon: { type: 'icon', icon: 'drag24' },
  'icon+text': { type: 'icon+text', icon: 'drag20', text: 'SCHZ' },
  metric: { type: 'metric', text: '3.99\n3/18/2024' },
  'metric+comment|1 element': { type: 'metric+comment', text: '103.49', counts: 1, count: '1', comment: 'Bearish' },
  'metric+comment|2 elements': { type: 'metric+comment', text: '103.49', counts: 2, count: '1', comment: 'Bearish' },
  button: { type: 'button', variant: 'purchase', text: 'Purchase Analysis' },
  'graph-green': { type: 'graph-green' },
  'graph-red': { type: 'graph-red' },
  bar: { type: 'bar', label: '15 May' },
};
const sampleFor = (v) => {
  const extra = v.type === 'text' ? v.textType : v.type === 'metric+comment' ? v.metricType : null;
  return SAMPLES[extra && extra !== 'default' ? `${v.type}|${extra}` : v.type];
};
const widthFor = (type) => TABLE_CELL_TYPES.find((t) => t.type === type).width;

/** A single cell in a one-cell table, at the width Figma draws it. */
export function cellPreview(cell, mode, width) {
  const w = width ?? widthFor(cell.type);
  return `<div class="ds-tbl-wrap ds-tbl-wrap--${mode}" style="width:${w}px"><table class="ds-tbl" style="--tbl-min:0px"><colgroup><col style="width:${w}px"></colgroup><tbody><tr class="ds-tbl__row">${tableCellHTML(cell)}</tr></tbody></table></div>`;
}

const variantName = (v) => `mode=${v.mode}, type=${v.type}, metric type=${v.metricType}, text type=${v.textType}`;

/** A table drawn at a fixed preview scale, inside a surface that shows the page color behind it. */
function framed(config, { zoom = 1, surface = config.theme === 'dark' ? 'dark' : 'light', note = '' } = {}) {
  return `<div class="ds-bd-tb-item">${note ? label(note) : ''}<div class="sb-unstyled ds-bd-tb-surface ds-bd-tb-surface--${surface}" style="zoom:${zoom}">${tableHTML(config)}</div></div>`;
}

// ---------- 2. Overview ----------
export function renderOverview() {
  return `${framed({ theme: 'light', label: 'Watchlist', columns: WATCHLIST_COLUMNS, rows: WATCHLIST_ROWS.slice(0, 2) }, { note: 'Default configuration: light theme, header and rows, subscription tint on a row' })}
  <p class="ds-bd-note">The Table is built from three Figma building blocks. The <strong>table-cell</strong> (33 variants) is the 64px data cell. The <strong>table-cell header</strong> (second component set with the same name) is the 32px column title. The <strong>Divider</strong> is a 26px section bar between groups of rows. Rows, columns and the table itself are not Figma components: they are auto-layout frames named <code>table-row</code>, <code>table-row-action</code> and <code>table header</code> in the Sandbox examples, and they are reproduced here as the semantic <code>table</code>, <code>tr</code> and <code>th</code> elements.</p>`;
}

// ---------- 3. Anatomy ----------
// Marker drawn at a point of the figure: a 1px line of `len` px in direction `dir`, ending in a numbered bubble.
const mk = (n, x, y, dir, len = 60) => `<span class="ds-bd-tb-mk ds-bd-tb-mk--${dir}" style="left:${x}px;top:${y}px;--len:${len}px"><b>${n}</b></span>`;
const anatomyFigure = (inner, cls, z = 1) => `<div class="ds-bd-anatomy"><div class="ds-bd-anatomy__stage ds-bd-tb-anatomy ${cls}" style="--z:${z}"><div class="sb-unstyled ds-bd-tb-anatomy__figure">${inner}</div></div>`;

export function renderAnatomy() {
  const columns = WATCHLIST_COLUMNS.slice(0, 5).map((c) => ({ ...c, width: 130, sorting: c.title === 'Market' }));
  const rows = [
    { divider: true, title: '🇺🇸 United States (2)', icon: 'minus', iconAlign: 'text', action: { label: 'pin to top', icon: 'keep', tone: 'primary' } },
    { ...WATCHLIST_ROWS[0], cells: WATCHLIST_ROWS[0].cells.slice(0, 5) },
    { ...WATCHLIST_ROWS[3], cells: WATCHLIST_ROWS[3].cells.slice(0, 5) },
  ];
  // Geometry: width 650 (5 x 130); header 0-32, Divider 32-58, tinted row 58-122, plain row 122-186.
  const W = 650;
  const markers = [mk(1, 0, 150, 'left', 70), mk(2, W, 16, 'right', 70), mk(3, 36, 0, 'top', 44), mk(4, 0, 45, 'left', 70), mk(5, W, 90, 'right', 70), mk(6, W, 154, 'right', 70), mk(7, 325, 186, 'bottom', 44)].join('');
  const html = `<div class="ds-bd-tb-fig" style="width:${W}px">${tableHTML({ theme: 'light', label: 'Anatomy', columns, rows })}${markers}</div>`;

  return `${anatomyFigure(html, 'ds-bd-tb-anatomy--general', 1)}
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Table container', 'The scroll region. It is as wide as its container and scrolls sideways when the columns do not fit. It is focusable so a keyboard user can scroll it.')}
      ${legendItem(2, 'Table header', 'One 32px row of header cells (<code>table header</code>). It has no border of its own.')}
      ${legendItem(3, 'Header cell', 'The second <code>table-cell</code> component set: a 10px uppercase title and the optional sorting icon. The sorted column is drawn in primary/600.')}
      ${legendItem(4, 'Divider', 'A 26px bar that names a group of rows, with an optional icon and an optional action on the right.')}
      ${legendItem(5, 'Highlighted row', 'A subscribed market. The tint (here <code>detailed/50</code>) fills every cell of the row.')}
      ${legendItem(6, 'Table row', 'A <code>table-row</code>: 64px high, one cell per column, each with a 1px bottom border.')}
      ${legendItem(7, 'Table cell', 'The 33-variant <code>table-cell</code>. Here a <code>metric</code> cell: a colored tile that fills the cell.')}
    </ol></div>`;
}

export function renderCellAnatomy() {
  let mc = cellPreview(SAMPLES['metric+comment|2 elements'], 'light', 140);
  mc = mc.replace('class="ds-tbl__cell ds-tbl__cell--metric-comment"', 'class="ds-tbl__cell ds-tbl__cell--metric-comment ds-bd-anchor ds-bd-anchor--left" data-n="1"');
  mc = anchor(mc, 'ds-tbl__tile ds-tbl__tile--alert-600', 'right', 2);
  mc = anchor(mc, 'ds-tbl__tile-row', 'top', 3, '25%');
  mc = anchor(mc, 'ds-tbl__count', 'top', 4, '50%');
  let mn = cellPreview(SAMPLES['market name'], 'light', 140);
  mn = mn.replace('class="ds-tbl__cell ds-tbl__cell--market-name"', 'class="ds-tbl__cell ds-tbl__cell--market-name ds-bd-anchor ds-bd-anchor--left" data-n="5"');
  mn = anchor(mn, 'ds-tbl__star', 'top', 6);
  mn = anchor(mn, 'ds-tbl__mn-name', 'top', 7, '60%');
  mn = anchor(mn, 'ds-tbl__flag', 'bottom', 8);
  return `${anatomyFigure(`<div class="ds-bd-tb-cellpair"><div>${mn}</div><div>${mc}</div></div>`, 'ds-bd-tb-anatomy--cell', 1.4)}
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Cell', 'A 64px high table cell with a 1px bottom border (gray/200, or gray/400 in dark). Padding 8px 4px for this type.')}
      ${legendItem(2, 'Tile', 'The <code>metric</code> tile: fills the cell, 2px radius, 4px padding. Its color is chosen per cell (alert/600 here).')}
      ${legendItem(3, 'Value line', 'The value, Semibold 12/18 in white (gray/900 on the yellow and cyan tiles).')}
      ${legendItem(4, 'Count', '<code>metric type</code> 1 element or 2 elements: a white 2px-radius count in Bold 12/18, in the tile color.')}
      ${legendItem(5, 'Market name cell', 'Left aligned, 8px 4px padding, 4px between the star and the text.')}
      ${legendItem(6, 'Star', 'An 18px star in gray/500 (white in dark).')}
      ${legendItem(7, 'Market name', 'Regular 12/18, gray/900 (white in dark). It wraps onto more lines.')}
      ${legendItem(8, 'Flag and country', 'A 16px flag and the country in gray/500, Regular 12/18.')}
    </ol></div>`;
}

export function renderStickyAnatomy() {
  const columns = MOBILE_COLUMNS.slice(0, 4);
  const rows = MOBILE_ROWS.slice(0, 2).map((r) => ({ cells: r.cells.slice(0, 4) }));
  // Geometry: region 343 wide, pinned column 0-80, header 0-32, rows 32-96 and 96-160.
  const markers = [mk(1, 343, 20, 'right', 70), mk(2, 40, 0, 'top', 44), mk(3, 0, 100, 'left', 70), mk(4, 84, 160, 'bottom', 44), mk(5, 220, 0, 'top', 44)].join('');
  const html = `<div class="ds-bd-tb-fig" style="width:343px">${tableHTML({ theme: 'light', label: 'Pinned column', columns, rows, stickyFirstColumn: true, scrolled: true, width: 343 })}${markers}</div>`;
  return `${anatomyFigure(html, 'ds-bd-tb-anatomy--sticky', 1)}
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Scroll region', 'A 343px wide region on mobile. Its content is 620px wide, so it scrolls sideways.')}
      ${legendItem(2, 'Pinned header cell', 'The header cell of the first column. It stays in place and keeps its gray/100 fill.')}
      ${legendItem(3, 'Pinned column', 'The first column, 80px wide. Its cells stay visible while the other columns scroll, and keep their own fill, so a subscription tint is kept.')}
      ${legendItem(4, 'Pinned column shadow', 'A drop shadow on the pinned column: 4px right, 4px down, 6px blur, black at 16%. Shown once content has scrolled under the column.')}
      ${legendItem(5, 'Scrolling cells', 'Every other column. They scroll under the pinned column.')}
    </ol></div>`;
}

// ---------- 4. Table Cells ----------
export function renderCells() {
  const blocks = TABLE_CELL_TYPES.map((t) => {
    const variants = TABLE_CELL_VARIANTS.filter((v) => v.type === t.type);
    const groups = new Map();
    for (const v of variants) {
      const key = `${v.metricType}|${v.textType}`;
      if (!groups.has(key)) groups.set(key, {});
      groups.get(key)[v.mode] = v;
    }
    const rows = [...groups.values()]
      .map((g) => {
        const any = g.light ?? g.dark;
        const cell = sampleFor(any);
        const light = g.light ? `<div class="ds-bd-tb-pair__cell"><div class="sb-unstyled ds-bd-tb-surface ds-bd-tb-surface--tight">${cellPreview(cell, 'light')}</div>${label(variantName(g.light))}</div>` : '';
        const dark = g.dark
          ? `<div class="ds-bd-tb-pair__cell"><div class="sb-unstyled ds-bd-tb-surface ds-bd-tb-surface--dark ds-bd-tb-surface--tight">${cellPreview(cell, 'dark')}</div>${label(variantName(g.dark))}</div>`
          : `<div class="ds-bd-tb-pair__cell ds-bd-tb-pair__cell--none"><span>No dark variant in Figma</span></div>`;
        return `<div class="ds-bd-tb-pair">${light}${dark}</div>`;
      })
      .join('');
    return `<section class="ds-bd-tb-type"><h3>type=${esc(t.type)}</h3><p class="ds-bd-note">${esc(t.note).replace(/`([^`]+)`/g, '<code>$1</code>')}</p>${rows}</section>`;
  }).join('');

  const spec = tableBlock(
    [
      row('Row height', TABLE_SPEC.row),
      row('Padding', TABLE_SPEC.cell),
      row('Light', TABLE_SPEC.cellLight),
      row('Dark', TABLE_SPEC.cellDark),
      row('Text', 'Regular 12/18 (text-xs/font-normal). Metric tiles Semibold 12/18. Button label Bold 14/20. The multi-line values are one text with a line break.'),
      row('Alignment', 'The market name cell is left aligned. Every other type is centered, horizontally and vertically.'),
      row('Widths', 'Figma draws 140px for most types, 163px for button and 164px for graph and bar. In a table the column sets the width.'),
    ].join(''),
  );
  return `${spec}${blocks}
  <p class="ds-bd-note">Figma names the sets <code>mode</code> × <code>type</code> × <code>metric type</code> × <code>text type</code>. The 33 variants are: 18 light and 15 dark. <code>link</code>, <code>toggle</code> and <code>text_label</code> exist only in light; in a dark table they keep their light look, because Figma defines nothing else. The tile colors, the button type, the icon, the tones of text and the star are content, chosen per cell: Figma's examples use alert/600, alert/500, green/600, green/500, primary/600, yellow/300 and comments/900 tiles, and Buttons of the types <code>purchase</code>, <code>purchase_secondary</code>, <code>neutral_detailed</code>, <code>neutral_premium</code> and <code>neutral_summary</code>.</p>`;
}

// ---------- 5. Dividers ----------
export function renderDividers() {
  const cols = [{ title: 'Market' }, { title: 'Open' }, { title: 'Close' }];
  const sample = (mode, extra) => ({ theme: mode, label: 'Divider', columns: cols.map((c) => ({ ...c, width: 92 })), rows: [{ divider: true, title: 'Daily Market History', icon: 'plus', ...extra }] });
  const strip = (mode, extra, name) => {
    let h = tableHTML(sample(mode, extra));
    h = h.replace(/<thead>[\s\S]*<\/thead>/, '');
    return `<div class="ds-bd-tb-item">${label(name)}<div class="sb-unstyled ds-bd-tb-surface ds-bd-tb-surface--${mode === 'dark' ? 'dark' : 'light'} ds-bd-tb-surface--tight">${h}</div></div>`;
  };
  const sepRows = [WATCHLIST_ROWS[0], WATCHLIST_ROWS[1]].map((r) => ({ ...r, cells: r.cells.slice(0, 3) }));
  return `<h3>Divider (section bar)</h3>
  <div class="ds-bd-tb-grid">
    ${strip('light', {}, 'mode=light, button=false, Show icon=true')}
    ${strip('dark', {}, 'mode=dark, button=false, Show icon=true')}
    ${strip('light', { action: { label: 'Link', icon: 'delete18' } }, 'mode=light, button=true, Show icon=true')}
    ${strip('dark', { action: { label: 'Link', icon: 'delete18' } }, 'mode=dark, button=true, Show icon=true')}
  </div>
  ${tableBlock(
    [
      row('What it is', 'The Figma component "Divider" is a section bar, not a thin line. It is a row that names a group of table rows ("Daily Market History", "Asia (31)", "Hong Kong (3)").'),
      row('Size', TABLE_SPEC.divider),
      row('Properties', 'mode (light, dark), button (an action on the right: an 18px icon and a 12px uppercase Semibold label), Show icon (an 18px plus icon).'),
      row('Position', 'It spans every column of the table, between two groups of rows. It has a 1px border above and below, so a row above it shows two lines.'),
    ].join(''),
  )}
  <h3>Dividers between rows</h3>
  <p>There is no separate row divider component. Every cell has a 1px bottom border, which draws the lines between rows. It is gray/200 in light and gray/400 in dark.</p>
  ${framed({ theme: 'light', label: 'Row separators', columns: [{ title: 'Market', width: 160 }, { title: 'Ticker' }, { title: 'Market Type' }], rows: [{ cells: [{ type: 'market name', name: 'Row one' }, { type: 'text', text: 'SCHZ' }, { type: 'text', text: 'Cash/Spot' }] }, { cells: [{ type: 'market name', name: 'Row two' }, { type: 'text', text: 'SCHZ' }, { type: 'text', text: 'Cash/Spot' }] }] }, { note: 'Bottom border on every cell' })}
  <h3>Dividers between columns</h3>
  <p>The Library cell has no vertical border. The Sandbox alerts table adds a 1px right border in gray/200 to every cell, header cells included. The component offers it as <code>columnDividers</code>.</p>
  ${framed({ theme: 'light', label: 'Alerts', columns: ALERTS_COLUMNS, rows: ALERTS_ROWS.slice(0, 2), columnDividers: true }, { note: 'Sandbox "Table example" 6228:26517: vertical dividers' })}
  <h3>Between header and body</h3>
  <p>The header has no border. The header fill (gray/100, or secondary/800 in dark) is the only separation, and the first body row starts directly below it. A Divider can follow the header directly, as in the light example.</p>
  <p class="ds-bd-note">The brief mentions horizontal and vertical divider patterns. In the Design Library only the Divider bar and the cell's bottom border exist. Vertical dividers appear only as an override in the alerts table, so they are an option and not a default.</p>`;
}

// ---------- 6. Table Header ----------
export function renderHeader() {
  const head = (mode, title, o = {}) => {
    const cols = [{ title, width: 140, align: 'start', ...o }];
    let h = tableHTML({ theme: mode, label: 'Header', columns: cols, rows: [] });
    return `<div class="sb-unstyled ds-bd-tb-surface ds-bd-tb-surface--${mode === 'dark' ? 'dark' : 'light'} ds-bd-tb-surface--tight">${h}</div>`;
  };
  const item = (mode, title, o, name) => `<div class="ds-bd-tb-item">${head(mode, title, o)}${label(name)}</div>`;
  return `<div class="ds-bd-tb-grid">
    ${item('light', 'Market', { sorting: true }, 'mode=light, sorting=true, title=Market')}
    ${item('dark', 'Market', { sorting: true }, 'mode=dark, sorting=true, title=Market')}
    ${item('light', 'Market', {}, 'mode=light, sorting=false')}
    ${item('dark', 'Market', {}, 'mode=dark, sorting=false')}
    ${item('light', 'Market', { sorting: true, sorted: true }, 'Sandbox: sorted column (title in primary/600)')}
  </div>
  ${framed({ theme: 'light', label: 'Header', columns: LIGHT_COLUMNS, rows: [] }, { note: 'The header of the Light example: 11 columns, three with the sorting icon' })}
  ${tableBlock(
    [
      row('Structure', 'A row of header cells (<code>table header</code>, 32px high). Each cell is the second <code>table-cell</code> component set: a title and an optional 20px sorting icon, 4px padding.'),
      row('Typography', 'text-uppercase/table: Proxima Nova Semibold 10px, uppercase, line height normal.'),
      row('Light', 'Fill gray/100, title gray/500, sorting icon gray/500'),
      row('Dark', 'Fill secondary/800, title secondary/50, sorting icon white'),
      row('Alignment', 'The first column is left aligned; the other titles are centered, and a long title wraps onto two lines (the line break is part of the title).'),
      row('Dividers', 'None. The header cell has no border; with column dividers on, header cells get the same 1px right border as body cells.'),
      row('Properties', 'mode, title, sorting (shows the icon).'),
    ].join(''),
  )}
  <p class="ds-bd-note"><strong>Sorting.</strong> Figma defines the sorting icon but no sorting behavior, no up or down state and no active look for the icon. The Sandbox only shows the sorted column title in primary/600, with the icon in the same color as read from the screenshot. The icon is therefore decoration: nothing sorts and nothing is clickable.</p>`;
}

// ---------- 7. States ----------
export function renderStates() {
  const cols = [{ title: 'Market', width: 190 }, { title: 'Ticker' }, { title: 'Market Type' }];
  const mk = (preview, subscription) => ({ preview, subscription, cells: [{ type: 'market name', name: 'China 10 Year Government Bond Yield (CNY)' }, { type: 'text', text: 'SCHZ' }, { type: 'text', text: 'Cash/Spot' }] });
  return `<div class="ds-bd-tb-grid">
    ${framed({ theme: 'light', label: 'Default', columns: cols, rows: [mk()] }, { note: 'Default' })}
    ${framed({ theme: 'light', label: 'Hover', columns: cols, rows: [mk('hover')] }, { note: 'Hover (Sandbox row): gray/100 fill, underlined market name' })}
    ${framed({ theme: 'light', label: 'Highlighted', columns: cols, rows: [mk(undefined, 'premium')] }, { note: 'Subscribed market (not a selected row)' })}
  </div>
  ${tableBlock(
    [
      rowN(['Default', 'Defined', 'Cell fill gray/50 (light) or none (dark), bottom border.']),
      rowN(['Hover', 'Observed', 'One row of the light Sandbox example: every cell gray/100, the market name underlined. The layer is not named; it is read as hover. Figma gives no hover for tinted rows or for the dark theme, so they do not change.']),
      rowN(['Highlighted', 'Defined', 'The subscription tint; see the section below. It is not a state of the cell component.']),
      rowN(['Sorted column', 'Observed', 'Header title in primary/600.']),
      rowN(['Selected', 'Not defined', 'Figma has no selected row or cell.']),
      rowN(['Focus', 'Not defined', 'No focus look for rows or cells. Keyboard-focusable parts (the scroll region, the Button, the link) show the existing focus-primary ring.']),
      rowN(['Disabled, loading, empty, error', 'Not defined', 'Nothing in Figma.']),
    ].join(''),
    ['State', 'Source', 'What Figma shows'],
  )}`;
}

// ---------- 8. Subscription highlighting ----------
export function renderSubscription() {
  const tiers = Object.entries(TABLE_SUBSCRIPTIONS)
    .map(([key, t]) => `<tr><th scope="row"><code>${key}</code></th><td>${t.token}</td><td><span class="ds-bd-tb-swatch ds-bd-tb-swatch--${key}"></span></td><td>${esc(t.action)}, Button type <code>${t.button}</code></td></tr>`)
    .join('');
  return `${framed({ theme: 'light', label: 'Watchlist', columns: WATCHLIST_COLUMNS, rows: WATCHLIST_ROWS, footnote: WATCHLIST_FOOTNOTE }, { note: 'Sandbox "Table example" 6228:26928' })}
  <p>Some rows have a tinted background. It tells the user that they have a subscription to that market. The Sandbox examples show it on three tiers, and the tint matches the subscription named in the last column.</p>
  <table class="ds-table ds-bd-tb-table"><thead><tr><th>Row property</th><th>Token</th><th>Tint</th><th>Current Subscription cell</th></tr></thead><tbody>${tiers}</tbody></table>
  ${tableBlock(
    [
      row('Applies to', 'Every cell of the row. In Figma each cell instance carries the fill, so the tint covers the whole row including the first and the last cell.'),
      row('Not a selected row', 'Figma defines no selected state. The tint is a data property (<code>subscription</code>) of the row. It does not change on hover and it is not a focus or selection look.'),
      row('Other cells', 'The metric tiles, the count badges, the sparkline and the Button keep their own look. The Button changes with the tier: a neutral Button with the tier color as label and border (Detailed, Premium, Summary), or the green outlined <code>purchase_secondary</code> Button when there is no subscription.'),
      row('Pinned column', 'The pinned first column keeps the row tint, because the tint is the cell fill. See the mobile example.'),
      row('Dark theme', 'Not defined. The Sandbox dark examples have no highlighted rows, and the tints are light colors. In a dark table the tint is not drawn; the data stays on the row.'),
      row('Accessibility', 'The row carries <code>data-subscription</code> and its row header has hidden text such as "Subscribed market, Premium subscription." Nothing visible is added: no badge, no icon.'),
    ].join(''),
  )}`;
}

// ---------- 9. Formatting and alignment ----------
export function renderFormatting() {
  return `${tableBlock(
    [
      row('Row height', TABLE_SPEC.row),
      row('Cell padding', TABLE_SPEC.cell),
      row('Column spacing', 'There is no gap between columns: cells touch. Columns share the free width equally; the first column is 140px and the last (Current Subscription) 156px in the Light example.'),
      row('Horizontal alignment', 'The first column is left aligned. Everything else is centered, in the header and in the body.'),
      row('Vertical alignment', 'Centered in the cell, header and body.'),
      row('Header alignment', 'Matches the column: left for the first, centered for the rest.'),
      row('Text wrapping', 'Text wraps onto more lines inside the column width. Values with a date are two lines (a line break in the text). Header titles may wrap to two lines.'),
      row('Data formatting', 'Values show two decimals and a date (4.04 / 3/15/2024); change shows a percentage and the point change in brackets; missing data reads N/A or NA.'),
      row('Backgrounds', 'Light cells gray/50, header gray/100; dark cells none on secondary/900, header secondary/800. Metric tiles are colored.'),
      row('Dividers', TABLE_SPEC.divider),
    ].join(''),
  )}
  <p>Column widths in the Figma examples:</p>
  ${tableBlock(
    [
      rowN(['Light (1148px)', '140 · 9 × 94.67 (equal share) · 156']),
      rowN(['Watchlist (1147px)', '7 × 122.7 · 132 · 156']),
      rowN(['Alerts (1147px)', '9 × 127.4']),
      rowN(['Dark, Stochastics (300px)', '40 · 40 · 40 · 90 · 90']),
      rowN(['Dark, Energy Model (246px)', '4 × 61.5']),
      rowN(['Mobile (620px)', '80 (pinned) · 60 · 6 × 80']),
    ].join(''),
    ['Example', 'Column widths (px)'],
  )}
  <p class="ds-bd-note">A column is either a fixed width (<code>width</code>) or flexible. Flexible columns share what is left and do not get narrower than ${TABLE_FLEX_MIN}px; below that the table scrolls sideways instead. ${TABLE_FLEX_MIN}px is the width of the mobile example's data columns.</p>`;
}

export function renderBehaviorTable() {
  const rows = [
    ['Horizontal scrolling', 'Figma', 'The mobile example is 620px wide in a 343px frame. The table scrolls inside its own region and never widens the page.'],
    ['Pinned first column', 'Figma', 'The first column stays at the left edge while the others scroll under it. It keeps its fill and has a shadow.'],
    ['Shadow timing', 'Decision', 'Figma draws the shadow with content already scrolled under the column. The shadow appears as soon as the table has scrolled sideways, and is hidden at the start.'],
    ['Row hover', 'Figma', 'Light, rows without a tint: gray/100 fill and underlined market name. Nothing for tinted rows or dark.'],
    ['Cell interaction', 'Figma', 'The Button in a cell, the link cell and the Divider action are the only controls. Figma defines no click on a row or a cell, and no destination for the link or the Divider action.'],
    ['Theme switching', 'Figma', 'The theme is a property of the table (<code>theme</code>); there is no automatic switch. Only the table changes.'],
    ['Overflow', 'Figma', 'Long text wraps; long tables grow in height. Nothing is truncated except the Divider title, which ends with an ellipsis.'],
    ['Keyboard', 'Decision', 'The scroll region is focusable (Tab) and scrolls with the arrow keys. Links and Buttons inside are native controls. There is no grid navigation.'],
    ['Not built', 'Not in Figma', 'Sorting, filtering, pagination, column resizing or reordering, row selection, inline editing, export and virtualization.'],
  ];
  return tableBlock(
    rows.map(([a, b, c]) => `<tr><th scope="row">${a}</th><td><span class="ds-chip">${b}</span></td><td>${c}</td></tr>`).join(''),
    ['Behavior', 'Source', 'What happens'],
  );
}

// ---------- 11. Responsive ----------
export function renderResponsive() {
  const m = TABLE_PREVIEW_FRAMES.mobile;
  return `<div class="ds-bd-tb-pair2">
    ${framed({ theme: 'light', label: 'Mobile table, not scrolled', columns: MOBILE_COLUMNS, rows: MOBILE_ROWS, stickyFirstColumn: true, width: m }, { note: `Scroll position 0, ${m}px wide: no shadow` })}
    ${framed({ theme: 'light', label: 'Mobile table, scrolled', columns: MOBILE_COLUMNS, rows: MOBILE_ROWS, stickyFirstColumn: true, scrolled: true, width: m }, { note: 'Scrolled: the pinned column has its shadow' })}
  </div>
  ${tableBlock(
    [
      row('Table width', 'The mobile table is 620px wide (80 + 60 + 6 × 80) in a 343px wide region. Column widths are kept; columns are never squeezed to fit.'),
      row('Scrolling', 'The region scrolls on the x axis only, including by touch. It does not scroll the page. The vertical page scroll is unaffected.'),
      row('Cell sizing', 'Rows stay 64px (32px header). Cells keep their padding; in the 80px market name cell the name is cut after two lines with an ellipsis (three lines when there is no country), as in Figma.'),
      row('Pinned first column', 'Optional (<code>stickyFirstColumn</code>). Figma shows it on the mobile table only, so it is a supported option and not the default.'),
      row('Shadow', 'Drop shadow 4px 4px 6px at 16% black, on the pinned column. Shown once content has scrolled under the column (decision).'),
      row('Layering', 'Pinned cells are above scrolling cells (z-index) and opaque (their own fill, or the surface color in dark), so no text or border shows through.'),
      row('Alignment', 'Header and body cells share one table, so the pinned column and the scrolling cells stay aligned row by row.'),
      row('Same component', 'One <code>table</code> element. Nothing is duplicated and there is no separate mobile table.'),
      row('Breakpoints', 'The table has none. It fills the width of its container, and the container (a desktop page, a 343px mobile page) decides when it scrolls.'),
    ].join(''),
  )}`;
}
