import { createTable, TABLE_MODES } from '../../../components/table/table.js';
import { TABLE_PREVIEW_FRAMES } from '../../../components/table/table.spec.js';
import { createButton } from '../../../components/button/button.js';
import {
  WATCHLIST_COLUMNS,
  WATCHLIST_ROWS,
  WATCHLIST_FOOTNOTE,
  LIGHT_COLUMNS,
  LIGHT_ROWS,
  STOCHASTICS,
  ENERGY,
  MOBILE_COLUMNS,
  MOBILE_ROWS,
} from '../../../docs/table-examples.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';
import '../../../docs/table-docs.css';

const figma = (property) => `Figma property: \`${property}\``;
const PREVIEWS = { desktop: undefined, tablet: 744, mobile: TABLE_PREVIEW_FRAMES.mobile };

const surface = (child, dark = false) => {
  const el = document.createElement('div');
  el.className = `ds-bd-demo-surface ds-bd-tb-demo-surface${dark ? ' ds-bd-tb-demo-surface--dark' : ''}`;
  el.append(child);
  return el;
};

const note = (text) => {
  const p = document.createElement('p');
  p.className = 'ds-bd-tb-note';
  p.textContent = text;
  return p;
};

// Sample data for the Live Demo: the watchlist table of the Sandbox, with the first market and the first value editable.
function demoRows(args) {
  const rows = WATCHLIST_ROWS.slice(0, args.rows).map((row, index) => {
    const cells = row.cells.map((cell) => ({ ...cell }));
    if (index === 0) {
      cells[0] = { ...cells[0], name: args.marketName };
      cells[2] = { ...cells[2], text: `${args.openValue}\n3/18/2024` };
    }
    return { ...row, cells, subscription: args.highlightSubscribed ? row.subscription : undefined };
  });
  if (args.showDivider && rows.length > 1) rows.splice(1, 0, { divider: true, title: '🇺🇸 United States', icon: 'minus', iconAlign: 'text', action: { label: 'pin to top', icon: 'keep', tone: 'primary' } });
  return rows;
}

export default {
  title: 'Components/Table/table-cell',
  parameters: { layout: 'padded' },
  args: {
    theme: 'light',
    preview: 'desktop',
    rows: 4,
    marketName: 'US - Apple',
    openValue: '3.99',
    highlightSubscribed: true,
    showDivider: false,
    showSorting: true,
    columnDividers: false,
    stickyFirstColumn: false,
    showFootnote: true,
  },
  argTypes: {
    theme: { name: 'mode', description: `${figma('mode')}. Light or dark table. Only the table changes, not the documentation.`, control: 'inline-radio', options: TABLE_MODES },
    preview: {
      description: 'Documentation only. Sets the width of the preview: the full width of this page, 744px (tablet) or 343px (mobile). In a product this is not a prop: the table fills its container and scrolls sideways when the columns do not fit.',
      control: 'inline-radio',
      options: Object.keys(PREVIEWS),
    },
    rows: { description: 'Documentation only. Number of sample rows.', control: { type: 'range', min: 1, max: 4, step: 1 } },
    marketName: { description: 'Sample data: the market name of the first row.', control: 'text' },
    openValue: { description: 'Sample data: the Open value of the first row.', control: 'text' },
    highlightSubscribed: { name: 'subscribed rows', description: 'Row property `subscription`: tints the rows of subscribed markets. The tint is drawn in the light mode only.', control: 'boolean' },
    showDivider: { name: 'Divider', description: `${figma('Divider')}. Adds a section bar between the rows.`, control: 'boolean' },
    showSorting: { name: 'sorting', description: `${figma('sorting')} of the header cell. Only the icon exists: nothing sorts.`, control: 'boolean' },
    columnDividers: { description: 'Vertical 1px dividers between columns (seen in the Sandbox alerts table).', control: 'boolean' },
    stickyFirstColumn: { description: 'Pins the first column. Figma shows it on the mobile table; scroll the preview sideways to see the shadow. Use the mobile preview to try it.', control: 'boolean' },
    showFootnote: { name: 'footnote', description: 'Documentation sample: the footnote text under the Sandbox table.', control: 'boolean' },
  },
  render: (args) => {
    const columns = WATCHLIST_COLUMNS.map((c) => ({ ...c, sorting: args.showSorting && c.sorting }));
    const table = createTable({
      theme: args.theme,
      label: 'Watchlist, sample data',
      columns,
      rows: demoRows(args),
      stickyFirstColumn: args.stickyFirstColumn,
      columnDividers: args.columnDividers,
      footnote: args.showFootnote ? WATCHLIST_FOOTNOTE : '',
      width: PREVIEWS[args.preview],
    });
    const wrap = document.createElement('div');
    wrap.className = 'ds-bd-tb-demo';
    wrap.append(table);
    if (args.theme === 'dark' && args.highlightSubscribed) wrap.append(note('Figma draws no subscription tint for the dark theme, so none is shown.'));
    return surface(wrap, args.theme === 'dark');
  },
};

export const Playground = {};

// Example 1: the Light "Table example" (Sandbox node 6228:19649).
export const LightExample = {
  parameters: { controls: { disable: true } },
  render: () => {
    const table = createTable({ theme: 'light', label: 'Test Design System Markets, light theme example', columns: LIGHT_COLUMNS, rows: LIGHT_ROWS, minWidth: 1148 });
    const wrap = document.createElement('div');
    wrap.className = 'ds-bd-tb-demo';
    wrap.append(table);
    return surface(wrap);
  },
};

// Example 2: the Dark "Table example" elements (Sandbox nodes 6228:21083 and 6228:21100).
export const DarkExample = {
  parameters: { controls: { disable: true } },
  render: () => {
    const card = document.createElement('div');
    card.className = 'ds-bd-tb-dark-card';
    card.append(
      createTable({ theme: 'dark', ...STOCHASTICS, width: 300 }),
      createTable({ theme: 'dark', ...ENERGY, width: 246 }),
    );
    const wrap = document.createElement('div');
    wrap.className = 'ds-bd-tb-demo';
    wrap.append(card);
    return surface(wrap);
  },
};

// Example 3: the Mobile "Table example" (Sandbox node 6228:25452), 343px wide, first column pinned.
export const MobileExample = {
  args: { stickyFirstColumn: true },
  argTypes: {
    stickyFirstColumn: { name: 'sticky first column', description: 'Documentation preview of the optional `stickyFirstColumn` property.', control: 'boolean' },
    theme: { table: { disable: true } },
    preview: { table: { disable: true } },
    rows: { table: { disable: true } },
    marketName: { table: { disable: true } },
    openValue: { table: { disable: true } },
    highlightSubscribed: { table: { disable: true } },
    showDivider: { table: { disable: true } },
    showSorting: { table: { disable: true } },
    columnDividers: { table: { disable: true } },
    showFootnote: { table: { disable: true } },
  },
  render: (args) => {
    const table = createTable({
      theme: 'light',
      label: 'Market data, mobile example',
      columns: MOBILE_COLUMNS,
      rows: MOBILE_ROWS,
      stickyFirstColumn: args.stickyFirstColumn,
      width: TABLE_PREVIEW_FRAMES.mobile,
    });
    const scroller = table.scrollContainer;

    const readout = note('');
    const update = () => {
      readout.textContent = `Scrolled ${Math.round(scroller.scrollLeft)}px of ${Math.round(scroller.scrollWidth - scroller.clientWidth)}px. ${args.stickyFirstColumn ? (scroller.scrollLeft > 0 ? 'The pinned column shows its shadow.' : 'At the start: no shadow.') : 'The first column scrolls with the rest.'}`;
    };
    scroller.addEventListener('scroll', update, { passive: true });
    update();

    const jump = createButton({ variant: 'secondary', size: '36', text: 'Scroll to the Figma position' });
    jump.addEventListener('click', () => {
      scroller.scrollTo({ left: 80 });
    });
    const start = createButton({ variant: 'secondary', size: '36', text: 'Back to the start' });
    start.addEventListener('click', () => {
      scroller.scrollTo({ left: 0 });
    });
    const actions = document.createElement('div');
    actions.className = 'ds-bd-tb-actions';
    actions.append(jump, start);

    const phone = document.createElement('div');
    phone.className = 'ds-bd-tb-phone';
    phone.append(table);
    const wrap = document.createElement('div');
    wrap.className = 'ds-bd-tb-demo';
    wrap.append(phone, readout, actions);
    return surface(wrap);
  },
};
