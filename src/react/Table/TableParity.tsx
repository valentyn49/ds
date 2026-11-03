import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { tableHTML, tableCellHTML, tableHeaderCellHTML } from '../../components/table/table.js';
import { TABLE_CELL_VARIANTS } from '../../components/table/table.spec.js';
import {
  LIGHT_COLUMNS,
  LIGHT_ROWS,
  WATCHLIST_COLUMNS,
  WATCHLIST_ROWS,
  WATCHLIST_FOOTNOTE,
  ALERTS_COLUMNS,
  ALERTS_ROWS,
  STOCHASTICS,
  ENERGY,
  MOBILE_COLUMNS,
  MOBILE_ROWS,
} from '../../docs/table-examples.js';
import { SAMPLES, sampleFor } from './sampleCells';
import { Table, TableCell, TableDividerRow, TableHeaderCell } from './Table';
import type { TableCellData, TableColumn, TableDividerData, TableProps } from './Table';

/*
  Documentation-only check. It renders the React Table and the HTML builders (tableHTML, tableCellHTML,
  tableHeaderCellHTML) for a matrix of inputs and compares the resulting DOM (tag, attributes, class names, children).
  Both use the same CSS, so an identical DOM means an identical look.
*/

const normalize = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const attrs = [...el.attributes]
      // An empty class attribute (written by the HTML icon builder) has no effect.
      .filter((a) => !(a.name === 'class' && a.value.trim() === ''))
      .map((a) => (a.name === 'class' ? `class="${a.value.split(/\s+/).sort().join(' ')}"` : `${a.name}="${a.value}"`))
      .sort()
      .join(' ');
    return `<${tag} ${attrs}>${[...el.childNodes].map(walk).join('')}</${tag}>`;
  };
  return [...template.content.childNodes].map(walk).join('');
};

// The JS builders' parameter types are inferred from their defaults, which are narrower than what they accept.
const cellHtml = tableCellHTML as (cell: unknown, options?: { rowHeader?: boolean }) => string;
const headerHtml = tableHeaderCellHTML as (column: unknown, options?: { first?: boolean }) => string;
const tableHtml = tableHTML as (config: unknown) => string;

interface Case {
  name: string;
  html: string;
  react: string;
}

const inRow = (inner: string) => `<table><tbody><tr>${inner}</tr></tbody></table>`;
const inHead = (inner: string) => `<table><thead><tr>${inner}</tr></thead></table>`;

// Options and edge cases beyond the 33 Figma variants.
const EXTRA_CELLS: Array<[string, TableCellData]> = [
  ['market name, no star', { type: 'market name', name: 'Australia BMK 10 Yr YLD (AUD)', star: false, flag: '🇦🇺', country: 'Australia' }],
  ['market name, name only', { type: 'market name', name: 'Hong Kong 10 Year Government Bond Yield (HKD)' }],
  ['market name, country without flag', { type: 'market name', name: 'Australia BMK 10 Yr YLD (AUD)', country: 'Australia' }],
  ['text, star icon', { type: 'text', text: 'SCHZ', icon: 'star' }],
  ['text, secondary', { type: 'text', text: 'NA', tone: 'secondary' }],
  ['text, muted', { type: 'text', text: 'No alert \ntriggered yet', tone: 'muted' }],
  ['text, strong', { type: 'text', text: '0 new matches', strong: true }],
  ['text, 1 element, custom badge', { type: 'text', text: '9.99', textType: '1 element', badge: '7', suffix: '(2%)' }],
  ['text_new, strong', { type: 'text_new', label: 'New', text: '200 MA, breaks \nabove, 7/23/2024', strong: true }],
  ['text_label, strong', { type: 'text_label', textType: '1 element', count: '1', label: 'New', text: 'Match', strong: true }],
  ['link, custom icon', { type: 'link', text: 'Remove', icon: 'delete18' }],
  ['icon, notifications_off muted', { type: 'icon', icon: 'notifications_off', muted: true }],
  ['icon+text, notifications_off', { type: 'icon+text', icon: 'notifications_off', text: 'Off' }],
  ['bar, no label', { type: 'bar' }],
  ['special characters', { type: 'text', text: 'A & <B> "C"' }],
  ...(['alert-600', 'alert-500', 'green-600', 'green-500', 'primary-600', 'yellow-300', 'comments-900'] as const).flatMap((tone): Array<[string, TableCellData]> => [
    [`metric, ${tone}`, { type: 'metric', text: '4.04\n3/15/2024', tone }],
    [`metric+comment, ${tone}`, { type: 'metric+comment', text: '103.49', counts: 2, count: '2', comment: 'Bearish', tone }],
  ]),
  ...(['primary', 'secondary', 'purchase', 'white', 'text', 'Stroke', 'cancel', 'purchase_secondary', 'neutral_summary', 'neutral_detailed', 'neutral_premium'] as const).map(
    (variant): [string, TableCellData] => [`button, ${variant}`, { type: 'button', variant, text: 'Detailed Analysis' }],
  ),
];

function buildCases(): Case[] {
  const cases: Case[] = [];

  // 1. The 33 Figma variants, as a data cell and as a row header.
  for (const variant of TABLE_CELL_VARIANTS as Array<{ mode: string; type: string; metricType: string; textType: string }>) {
    const cell = sampleFor(variant);
    const name = `cell: mode=${variant.mode}, type=${variant.type}, metric type=${variant.metricType}, text type=${variant.textType}`;
    cases.push({ name, html: inRow(cellHtml(cell)), react: inRow(renderToStaticMarkup(<TableCell cell={cell} />)) });
  }
  for (const [name, cell] of [...Object.entries(SAMPLES), ...EXTRA_CELLS]) {
    cases.push({ name: `cell: ${name}`, html: inRow(cellHtml(cell)), react: inRow(renderToStaticMarkup(<TableCell cell={cell} />)) });
    cases.push({ name: `row header: ${name}`, html: inRow(cellHtml(cell, { rowHeader: true })), react: inRow(renderToStaticMarkup(<TableCell cell={cell} rowHeader />)) });
  }

  // 2. Header cells.
  const columns: TableColumn[] = [];
  for (const title of ['Market', 'Change \n(Vs prior close)', 'A & B']) {
    for (const sorting of [false, true]) {
      for (const sorted of [false, true]) {
        for (const align of [undefined, 'start', 'center'] as const) columns.push({ title, sorting, sorted, align });
      }
    }
  }
  for (const column of columns) {
    for (const first of [false, true]) {
      cases.push({
        name: `header: ${JSON.stringify(column)}, first=${first}`,
        html: inHead(headerHtml(column, { first })),
        react: inHead(renderToStaticMarkup(<TableHeaderCell column={column} first={first} />)),
      });
    }
  }

  // 3. Dividers.
  const dividers: TableDividerData[] = [];
  for (const level of [undefined, 1] as const) {
    for (const icon of [undefined, 'plus', 'minus'] as const) {
      for (const iconAlign of [undefined, 'end', 'text'] as const) {
        dividers.push({ divider: true, title: 'Daily Market History', level, icon, iconAlign });
        dividers.push({ divider: true, title: '🇭🇰 Hong Kong (3)', level, icon, iconAlign, action: { label: 'pin to top', icon: 'keep', tone: 'primary' } });
      }
    }
  }
  dividers.push({ divider: true, title: 'Link', icon: 'plus', action: { label: 'Link', icon: 'delete18' } });
  dividers.push({ divider: true, title: 'No icon action', action: { label: 'Only text' } });
  for (const row of dividers) {
    cases.push({
      name: `divider: ${JSON.stringify(row)}`,
      html: `<table><tbody>${tableDividerHtml(row)}</tbody></table>`,
      react: `<table><tbody>${renderToStaticMarkup(<TableDividerRow row={row} columnCount={4} />)}</tbody></table>`,
    });
  }

  // 4. Whole tables: the Sandbox examples in both themes, with the options that change the markup.
  type Config = Omit<TableProps, 'rows' | 'columns'> & { columns: unknown; rows: unknown };
  const examples: Array<[string, Config]> = [
    ['Light example (1148, divider rows, tints, hover)', { label: 'Test Design System Markets', columns: LIGHT_COLUMNS, rows: LIGHT_ROWS, minWidth: 1148 }],
    ['Light example, width set', { label: 'Test Design System Markets', columns: LIGHT_COLUMNS, rows: LIGHT_ROWS, width: 900 }],
    ['Watchlist with footnote', { label: 'Watchlist', columns: WATCHLIST_COLUMNS, rows: WATCHLIST_ROWS, footnote: WATCHLIST_FOOTNOTE }],
    ['Alerts with column dividers', { label: 'Alerts', columns: ALERTS_COLUMNS, rows: ALERTS_ROWS, columnDividers: true }],
    ['Dark: Stochastics', { theme: 'dark', ...STOCHASTICS, width: 300 }],
    ['Dark: Energy Model', { theme: 'dark', ...ENERGY, width: 246 }],
    ['Mobile, sticky first column', { label: 'Market data', columns: MOBILE_COLUMNS, rows: MOBILE_ROWS, stickyFirstColumn: true, width: 343 }],
    ['Mobile, sticky and scrolled', { label: 'Market data', columns: MOBILE_COLUMNS, rows: MOBILE_ROWS, stickyFirstColumn: true, scrolled: true, width: 343 }],
    ['Mobile, not sticky', { label: 'Market data', columns: MOBILE_COLUMNS, rows: MOBILE_ROWS, stickyFirstColumn: false, width: 343 }],
    ['Mobile, row headers off', { label: 'Market data', columns: MOBILE_COLUMNS, rows: MOBILE_ROWS, rowHeaders: false, width: 343 }],
  ];
  for (const [name, config] of examples) {
    for (const theme of config.theme ? [config.theme] : (['light', 'dark'] as const)) {
      const full = { ...config, theme } as Config;
      cases.push({
        name: `table: ${name}, ${theme}`,
        html: tableHtml(full),
        react: renderToStaticMarkup(<Table {...(full as unknown as TableProps)} />),
      });
    }
  }
  cases.push({ name: 'table: empty', html: tableHtml({ columns: [], rows: [] }), react: renderToStaticMarkup(<Table columns={[]} rows={[]} />) });
  cases.push({
    name: 'table: all subscription tiers, dark',
    html: tableHtml({ theme: 'dark', columns: WATCHLIST_COLUMNS, rows: WATCHLIST_ROWS }),
    react: renderToStaticMarkup(<Table theme="dark" columns={WATCHLIST_COLUMNS as TableColumn[]} rows={WATCHLIST_ROWS as unknown as TableProps['rows']} />),
  });
  return cases;
}

// The HTML divider row is only reachable through tableHTML, so build a one-row table and take its divider row out.
function tableDividerHtml(row: TableDividerData): string {
  const html = tableHtml({ columns: [{ title: 'a' }, { title: 'b' }, { title: 'c' }, { title: 'd' }], rows: [row] });
  const match = /<tbody>([\s\S]*)<\/tbody>/.exec(html);
  return match ? match[1] : '';
}

export function TableParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => ({ c, react: normalize(c.react), html: normalize(c.html) }))
      .filter((r) => r.react !== r.html);
    return { total: cases.length, failures };
  }, []);

  const ok = result.failures.length === 0;
  return (
    <div className="ds-bd-tile ds-bd-tile--stack" role="status">
      <strong>{ok ? 'Identical' : 'Differences found'}</strong>
      <span>
        {result.total - result.failures.length} of {result.total} combinations render the same DOM in React and in the HTML builder.
      </span>
      <span>Covers the 33 Figma cell variants, extra cell options, header cells, dividers and the Sandbox example tables in both themes.</span>
      {result.failures.slice(0, 5).map(({ c, react, html }) => (
        <pre key={c.name} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {c.name}
          {'\n'}React: {react.slice(0, 600)}
          {'\n'}HTML:  {html.slice(0, 600)}
        </pre>
      ))}
    </div>
  );
}
