import './table.css';
import { buttonHTML } from '../button/button.js';
import { tblIcon } from './icons.js';
import { TABLE_MODES, TABLE_CELL_TYPES, TABLE_LIGHT_ONLY, TABLE_METRIC_TONES, TABLE_SUBSCRIPTIONS, TABLE_FLEX_MIN } from './table.spec.js';
import sparkGreen from './assets/sparkline-green.svg';
import sparkRed from './assets/sparkline-red.svg';

export { TABLE_MODES, TABLE_CELL_TYPES, TABLE_SUBSCRIPTIONS, TABLE_METRIC_TONES };

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (type) => type.replace(/\+/g, '-').replace(/_/g, '-').replace(/\s+/g, '-');

// Types with 16px vertical padding in Figma; every other type uses 8px.
const ROOMY = new Set(['text', 'text_label', 'link', 'toggle', 'icon', 'icon+text', 'text_new']);

const textClass = (cell) => ['ds-tbl__text', cell.tone ? `ds-tbl__text--${cell.tone}` : '', cell.strong ? 'ds-tbl__text--strong' : ''].filter(Boolean).join(' ');

/**
 * One cell. `cell.type` is the Figma `type`. Other fields by type:
 *   market name      name, country, flag, star (default true)
 *   text             text, textType ('default' | '1 element' | '2 element'), badge, suffix, icon ('star'), tone ('secondary' | 'muted'), strong
 *   text_new         label, text, strong        text_label  count, label, text, strong
 *   link             text, icon ('delete20')    toggle      text
 *   icon             icon ('drag24' | 'notifications_off'), muted        icon+text   icon ('drag20'), text
 *   metric           text, tone                 metric+comment  text (value), comment, counts (1 or 2), tone
 *   button           variant (a Button `type`), text
 *   graph-green, graph-red, blank
 *   bar              label (the Figma `data` option)
 */
function cellContent(cell) {
  switch (cell.type) {
    case 'market name': {
      const star = cell.star === false ? '' : `<span class="ds-tbl__star">${tblIcon('star')}</span>`;
      const country = cell.country
        ? `<span class="ds-tbl__mn-country">${cell.flag ? `<span class="ds-tbl__flag" aria-hidden="true">${esc(cell.flag)}</span>` : ''}<span>${esc(cell.country)}</span></span>`
        : '';
      return `<span class="ds-tbl__mn-box">${star}<span class="ds-tbl__mn${cell.country ? ' ds-tbl__mn--country' : ''}"><span class="ds-tbl__mn-name">${esc(cell.name)}</span>${country}</span></span>`;
    }
    case 'text': {
      const type = cell.textType ?? 'default';
      const star = cell.icon === 'star' ? tblIcon('star', 'ds-tbl__icon') : '';
      if (type === 'default') return `${star}<span class="${textClass(cell)}">${esc(cell.text)}</span>`;
      const badges = type === '2 element' ? 2 : 1;
      return `<span class="ds-tbl__row-inline"><span class="ds-tbl__text">${esc(cell.text)}</span>${Array.from({ length: badges }, () => `<span class="ds-tbl__badge">${esc(cell.badge ?? '1')}</span>`).join('')}<span class="ds-tbl__text">${esc(cell.suffix ?? '')}</span></span>`;
    }
    case 'text_new':
      return `<span class="ds-tbl__pill">${esc(cell.label ?? 'New')}</span><span class="${textClass(cell)}">${esc(cell.text)}</span>`;
    case 'text_label':
      return `<span class="ds-tbl__row-inline"><span class="${textClass(cell)}">${esc(cell.count ?? '1')}</span><span class="ds-tbl__pill">${esc(cell.label ?? 'New')}</span><span class="${textClass(cell)}">${esc(cell.text ?? '')}</span></span>`;
    case 'link':
      return `<button type="button" class="ds-tbl__link">${tblIcon(cell.icon ?? 'delete20')}<span>${esc(cell.text ?? 'Link')}</span></button>`;
    case 'toggle':
      return `<span class="ds-tbl__toggle">${tblIcon('toggle_off')}<span>${esc(cell.text ?? 'Status')}</span></span>`;
    case 'icon':
      return tblIcon(cell.icon ?? 'drag24', `ds-tbl__icon${cell.muted ? ' ds-tbl__icon--muted' : ''}`);
    case 'icon+text':
      return `${tblIcon(cell.icon ?? 'drag20', 'ds-tbl__icon')}<span class="ds-tbl__text">${esc(cell.text)}</span>`;
    case 'metric':
      return `<span class="ds-tbl__tile ds-tbl__tile--${cell.tone ?? 'alert-600'}">${esc(cell.text)}</span>`;
    case 'metric+comment': {
      const counts = cell.counts === 2 ? 2 : 1;
      const pills = Array.from({ length: counts }, () => `<span class="ds-tbl__count">${esc(cell.count ?? '1')}</span>`).join('');
      return `<span class="ds-tbl__tile ds-tbl__tile--${cell.tone ?? 'alert-600'}"><span class="ds-tbl__tile-row"><span>${esc(cell.text)}</span>${pills}</span><span>${esc(cell.comment ?? '')}</span></span>`;
    }
    case 'button':
      return buttonHTML({ variant: cell.variant ?? 'purchase', size: '36', text: cell.text ?? 'Purchase Analysis' });
    case 'graph-green':
    case 'graph-red':
      return `<img class="ds-tbl__spark" src="${cell.type === 'graph-red' ? sparkRed : sparkGreen}" alt="${esc(cell.alt ?? '')}">`;
    case 'bar':
      return `<span class="ds-tbl__bar">${cell.label ? `<span class="ds-tbl__bar-label">${esc(cell.label)}</span>` : ''}</span>`;
    default:
      return '';
  }
}

/** One data cell (`td`), or a row header (`th scope="row"`) when `rowHeader` is true. */
export function tableCellHTML(cell, { rowHeader = false } = {}) {
  const tag = rowHeader ? 'th' : 'td';
  const cls = [
    'ds-tbl__cell',
    `ds-tbl__cell--${slug(cell.type)}`,
    ROOMY.has(cell.type) ? 'ds-tbl__cell--roomy' : '',
    TABLE_LIGHT_ONLY.includes(cell.type) ? 'ds-tbl__cell--light-only' : '',
    cell.type.startsWith('graph') ? 'ds-tbl__cell--graph' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return `<${tag} class="${cls}"${rowHeader ? ' scope="row"' : ''}><div class="ds-tbl__content">${cellContent(cell)}</div></${tag}>`;
}

/** The header cell. `column`: title, sorting (shows the icon), sorted (primary color), align ('start' | 'center'). */
export function tableHeaderCellHTML(column, { first = false } = {}) {
  const align = column.align ?? (first ? 'start' : 'center');
  const cls = ['ds-tbl__th', align === 'start' ? 'ds-tbl__th--start' : '', column.sorted ? 'ds-tbl__th--sorted' : ''].filter(Boolean).join(' ');
  const icon = column.sorting ? tblIcon('sorting', 'ds-tbl__th-sort') : '';
  return `<th class="${cls}" scope="col"><div class="ds-tbl__th-inner"><span class="ds-tbl__th-title">${esc(column.title)}</span>${icon}</div></th>`;
}

function dividerRowHTML(row, columnCount) {
  const level = row.level === 1 ? ' ds-tbl__divider--level-1' : '';
  const iconPos = row.iconAlign === 'text' ? '' : ' ds-tbl__divider--icon-end';
  const icon = row.icon ? tblIcon(row.icon, 'ds-tbl__divider-icon') : '';
  const action = row.action
    ? `<button type="button" class="ds-tbl__divider-action${row.action.tone === 'primary' ? ' ds-tbl__divider-action--primary' : ''}">${row.action.icon ? tblIcon(row.action.icon) : ''}<span>${esc(row.action.label)}</span></button>`
    : '';
  return `<tr class="ds-tbl__divider-row"><th class="ds-tbl__divider${level}${iconPos}" colspan="${columnCount}" scope="colgroup"><div class="ds-tbl__divider-inner"><div class="ds-tbl__divider-main"><span class="ds-tbl__divider-title">${esc(row.title)}</span>${icon}</div>${action}</div></th></tr>`;
}

/**
 * The table. Config:
 *   theme       'light' | 'dark'
 *   label       accessible name of the table (also its caption)
 *   columns     [{ title, width (px; omit for a flexible column), sorting, sorted, align }]
 *   rows        [{ cells: [cell], subscription: 'detailed' | 'premium' | 'summary' }, { divider: true, title, level, icon, iconAlign, action }]
 *   stickyFirstColumn, columnDividers, minWidth (px; default: the fixed widths plus 80px per flexible column), footnote
 * The first cell of every row is the row header unless `rowHeaders` is false. A subscription tint fills every cell of the row; the subscription
 * is also exposed as `data-subscription` and as hidden text in the row header.
 * Documentation-only: `scrolled` draws the pinned-column shadow, a row's `preview: 'hover'` draws the hover look.
 */
export function tableHTML({
  theme = 'light',
  label = 'Table',
  columns = [],
  rows = [],
  stickyFirstColumn = false,
  columnDividers = false,
  rowHeaders = true,
  minWidth,
  footnote = '',
  scrolled = false,
  width,
} = {}) {
  const mode = theme === 'dark' ? 'dark' : 'light';
  const fixed = columns.reduce((sum, c) => sum + (c.width ?? 0), 0);
  const flex = columns.filter((c) => c.width == null).length;
  const min = minWidth ?? fixed + flex * TABLE_FLEX_MIN;

  const colgroup = `<colgroup>${columns.map((c) => `<col${c.width != null ? ` style="width:${c.width}px"` : ''}>`).join('')}</colgroup>`;
  const head = `<thead><tr>${columns.map((c, i) => tableHeaderCellHTML(c, { first: i === 0 })).join('')}</tr></thead>`;
  const body = rows
    .map((row) => {
      if (row.divider) return dividerRowHTML(row, columns.length);
      const tier = TABLE_SUBSCRIPTIONS[row.subscription];
      const attrs = [
        'class="ds-tbl__row"',
        tier ? `data-subscription="${row.subscription}"` : '',
        row.preview ? `data-preview-state="${row.preview}"` : '',
      ]
        .filter(Boolean)
        .join(' ');
      const cells = row.cells
        .map((cell, i) => {
          let html = tableCellHTML(cell, { rowHeader: rowHeaders && i === 0 });
          if (i === 0 && tier) html = html.replace('<div class="ds-tbl__content">', `<div class="ds-tbl__content"><span class="ds-tbl__sr">Subscribed market, ${tier.label} subscription. </span>`);
          return html;
        })
        .join('');
      return `<tr ${attrs}>${cells}</tr>`;
    })
    .join('');

  const tableCls = ['ds-tbl', stickyFirstColumn ? 'ds-tbl--sticky' : '', columnDividers ? 'ds-tbl--col-dividers' : ''].filter(Boolean).join(' ');
  const wrapAttrs = [
    `class="ds-tbl-wrap ds-tbl-wrap--${mode}"`,
    'role="region"',
    `aria-label="${esc(label)}"`,
    'tabindex="0"',
    scrolled ? 'data-scrolled' : '',
    width ? `style="width:${width}px"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const table = `<div ${wrapAttrs}><table class="${tableCls}" style="--tbl-min:${min}px"><caption class="ds-tbl__caption">${esc(label)}</caption>${colgroup}${head}<tbody>${body}</tbody></table></div>`;
  return footnote ? `<div class="ds-tbl-root">${table}<p class="ds-tbl__note">${esc(footnote)}</p></div>` : table;
}

/**
 * Live table. Once the table is scrolled sideways, the pinned first column gets its shadow (`data-scrolled`).
 * Figma draws the shadow in a scrolled state and gives no rule for when it appears; this is an implementation decision.
 */
export function createTable(config = {}) {
  const template = document.createElement('template');
  template.innerHTML = tableHTML(config);
  const root = template.content.firstElementChild;
  const wrap = root.classList.contains('ds-tbl-wrap') ? root : root.querySelector('.ds-tbl-wrap');

  const sync = () => wrap.toggleAttribute('data-scrolled', wrap.scrollLeft > 0);
  wrap.addEventListener('scroll', sync, { passive: true });
  sync();

  root.scrollContainer = wrap;
  return root;
}
