import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TABLE_CELL_TYPES, TABLE_CELL_VARIANTS, TABLE_PREVIEW_FRAMES } from '../../components/table/table.spec.js';
import {
  WATCHLIST_COLUMNS,
  WATCHLIST_ROWS,
  WATCHLIST_FOOTNOTE,
  ALERTS_COLUMNS,
  ALERTS_ROWS,
  LIGHT_COLUMNS,
  LIGHT_ROWS,
  STOCHASTICS,
  ENERGY,
  MOBILE_COLUMNS,
  MOBILE_ROWS,
} from '../../docs/table-examples.js';
import '../../docs/button-docs.css';
import '../../docs/input-docs.css';
import '../../docs/table-docs.css';
import { Button } from '../Button/Button';
import { Table, TableCell, TableDividerRow, TABLE_THEMES } from './Table';
import type { TableCellData, TableColumn, TableDataRow, TableDividerData, TableRow, TableTheme } from './Table';
import { SAMPLES, sampleFor } from './sampleCells';
import { TableParity } from './TableParity';

const figma = (property: string) => `Figma property: \`${property}\``;

// The example data comes from plain JS files and is typed loosely there.
const watchlistColumns = WATCHLIST_COLUMNS as unknown as TableColumn[];
const watchlistRows = WATCHLIST_ROWS as unknown as TableDataRow[];
const alertsColumns = ALERTS_COLUMNS as unknown as TableColumn[];
const alertsRows = ALERTS_ROWS as unknown as TableRow[];
const lightColumns = LIGHT_COLUMNS as unknown as TableColumn[];
const lightRows = LIGHT_ROWS as unknown as TableRow[];
const mobileColumns = MOBILE_COLUMNS as unknown as TableColumn[];
const mobileRows = MOBILE_ROWS as unknown as TableRow[];
const stochastics = STOCHASTICS as unknown as { label: string; rowHeaders: boolean; columns: TableColumn[]; rows: TableRow[] };
const energy = ENERGY as unknown as { label: string; rowHeaders: boolean; columns: TableColumn[]; rows: TableRow[] };
const cellTypes = TABLE_CELL_TYPES as Array<{ type: string; dark: boolean; width: number; note: string }>;
const cellVariants = TABLE_CELL_VARIANTS as Array<{ mode: TableTheme; type: string; metricType: string; textType: string }>;

const PREVIEWS = { desktop: undefined, tablet: 744, mobile: TABLE_PREVIEW_FRAMES.mobile } as const;
type Preview = keyof typeof PREVIEWS;

const Surface = ({ dark = false, tight = false, children }: { dark?: boolean; tight?: boolean; children: React.ReactNode }) => (
  <div className={`ds-bd-tb-surface${dark ? ' ds-bd-tb-surface--dark' : ''}${tight ? ' ds-bd-tb-surface--tight' : ''}`}>{children}</div>
);

const Label = ({ children }: { children: React.ReactNode }) => <code className="ds-bd-tb-label">{children}</code>;

/** A single cell in a one-cell table, at the width Figma draws it. */
function CellPreview({ cell, mode, width }: { cell: TableCellData; mode: TableTheme; width: number }) {
  return (
    <div className={`ds-tbl-wrap ds-tbl-wrap--${mode}`} style={{ width }}>
      <table className="ds-tbl" style={{ '--tbl-min': '0px' } as CSSProperties}>
        <colgroup>
          <col style={{ width }} />
        </colgroup>
        <tbody>
          <tr className="ds-tbl__row">
            <TableCell cell={cell} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ---------- Live Demo ----------

interface DemoArgs {
  theme: TableTheme;
  preview: Preview;
  rows: number;
  marketName: string;
  openValue: string;
  highlightSubscribed: boolean;
  showDivider: boolean;
  showSorting: boolean;
  columnDividers: boolean;
  stickyFirstColumn: boolean;
  showFootnote: boolean;
}

/** The Sandbox watchlist table with the first market and the first value editable. */
function demoRows(args: DemoArgs): TableRow[] {
  const rows: TableRow[] = watchlistRows.slice(0, args.rows).map((row, index) => {
    const cells = row.cells.map((cell) => ({ ...cell })) as TableCellData[];
    if (index === 0) {
      const first = cells[0];
      if (first.type === 'market name') cells[0] = { ...first, name: args.marketName };
      const open = cells[2];
      if (open.type === 'metric') cells[2] = { ...open, text: `${args.openValue}\n3/18/2024` };
    }
    return { ...row, cells, subscription: args.highlightSubscribed ? row.subscription : undefined };
  });
  if (args.showDivider && rows.length > 1) {
    rows.splice(1, 0, { divider: true, title: '🇺🇸 United States', icon: 'minus', iconAlign: 'text', action: { label: 'pin to top', icon: 'keep', tone: 'primary' } });
  }
  return rows;
}

const meta: Meta<DemoArgs> = {
  title: 'Components/Table',
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
    theme: { name: 'mode', description: `${figma('mode')}. Light or dark table. Only the table changes, not the page around it.`, control: 'inline-radio', options: TABLE_THEMES },
    preview: {
      description:
        'Documentation only. Sets the width of the preview: the full width of this page, 744px (tablet) or 343px (mobile). In a product this is not a prop: the table fills its container and scrolls sideways when the columns do not fit.',
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
};

export default meta;
type Story = StoryObj<DemoArgs>;

export const Playground: Story = {
  render: (args) => {
    const columns = watchlistColumns.map((c) => ({ ...c, sorting: args.showSorting && c.sorting }));
    return (
      <div className={`ds-bd-demo-surface ds-bd-tb-demo-surface${args.theme === 'dark' ? ' ds-bd-tb-demo-surface--dark' : ''}`}>
        <div className="ds-bd-tb-demo">
          <Table
            theme={args.theme}
            label="Watchlist, sample data"
            columns={columns}
            rows={demoRows(args)}
            stickyFirstColumn={args.stickyFirstColumn}
            columnDividers={args.columnDividers}
            footnote={args.showFootnote ? WATCHLIST_FOOTNOTE : ''}
            width={PREVIEWS[args.preview]}
          />
          {args.theme === 'dark' && args.highlightSubscribed ? <p className="ds-bd-tb-note">Figma draws no subscription tint for the dark theme, so none is shown.</p> : null}
        </div>
      </div>
    );
  },
};

// ---------- Cells ----------

/** All 33 variants of the table-cell component set, light and dark side by side, at the width Figma draws them. */
export const CellTypes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      {cellTypes.map((t) => {
        const groups = new Map<string, { light?: (typeof cellVariants)[number]; dark?: (typeof cellVariants)[number] }>();
        for (const v of cellVariants.filter((x) => x.type === t.type)) {
          const key = `${v.metricType}|${v.textType}`;
          groups.set(key, { ...groups.get(key), [v.mode]: v });
        }
        return (
          <section key={t.type} className="ds-bd-tb-type">
            <h3>type={t.type}</h3>
            <p className="ds-bd-note">{t.note}</p>
            {[...groups.values()].map((g, i) => {
              const any = (g.light ?? g.dark)!;
              const cell = sampleFor(any);
              const name = (v: typeof any) => `mode=${v.mode}, type=${v.type}, metric type=${v.metricType}, text type=${v.textType}`;
              return (
                <div key={i} className="ds-bd-tb-pair">
                  {g.light ? (
                    <div className="ds-bd-tb-pair__cell">
                      <Surface tight>
                        <CellPreview cell={cell} mode="light" width={t.width} />
                      </Surface>
                      <Label>{name(g.light)}</Label>
                    </div>
                  ) : null}
                  {g.dark ? (
                    <div className="ds-bd-tb-pair__cell">
                      <Surface dark tight>
                        <CellPreview cell={cell} mode="dark" width={t.width} />
                      </Surface>
                      <Label>{name(g.dark)}</Label>
                    </div>
                  ) : (
                    <div className="ds-bd-tb-pair__cell ds-bd-tb-pair__cell--none">
                      <span>No dark variant in Figma</span>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  ),
};

/** Cell options beyond the sample texts: tones, strong text, tile colors and Button types seen in the Sandbox examples. */
export const CellOptions: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const tones = ['alert-600', 'alert-500', 'green-600', 'green-500', 'primary-600', 'yellow-300', 'comments-900'] as const;
    return (
      <div className="ds-bd-tb-grid">
        {tones.map((tone) => (
          <div key={tone} className="ds-bd-tb-item">
            <Surface tight>
              <CellPreview cell={{ type: 'metric', text: '4.04\n3/15/2024', tone }} mode="light" width={140} />
            </Surface>
            <Label>metric, tone={tone}</Label>
          </div>
        ))}
        {(['secondary', 'muted'] as const).map((tone) => (
          <div key={tone} className="ds-bd-tb-item">
            <Surface tight>
              <CellPreview cell={{ type: 'text', text: tone === 'muted' ? 'No alert \ntriggered yet' : 'NA', tone }} mode="light" width={140} />
            </Surface>
            <Label>text, tone={tone}</Label>
          </div>
        ))}
        <div className="ds-bd-tb-item">
          <Surface tight>
            <CellPreview cell={{ type: 'market name', name: 'Hong Kong 10 Year Government Bond Yield (HKD)' }} mode="light" width={140} />
          </Surface>
          <Label>market name, name only</Label>
        </div>
        <div className="ds-bd-tb-item">
          <Surface tight>
            <CellPreview cell={SAMPLES.button} mode="light" width={163} />
          </Surface>
          <Label>button, variant=purchase</Label>
        </div>
        {(['purchase_secondary', 'neutral_detailed', 'neutral_premium', 'neutral_summary'] as const).map((variant) => (
          <div key={variant} className="ds-bd-tb-item">
            <Surface tight>
              <CellPreview cell={{ type: 'button', variant, text: 'Analysis' }} mode="light" width={163} />
            </Surface>
            <Label>button, variant={variant}</Label>
          </div>
        ))}
      </div>
    );
  },
};

// ---------- Header ----------

const headerColumn = (title: string, o: Partial<TableColumn> = {}): TableColumn => ({ title, width: 140, align: 'start', ...o });

/** The header cell: light and dark, with and without the sorting icon, and the sorted title. */
export const Header: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const items: Array<[TableTheme, Partial<TableColumn>, string]> = [
      ['light', { sorting: true }, 'mode=light, sorting=true, title=Market'],
      ['dark', { sorting: true }, 'mode=dark, sorting=true, title=Market'],
      ['light', {}, 'mode=light, sorting=false'],
      ['dark', {}, 'mode=dark, sorting=false'],
      ['light', { sorting: true, sorted: true }, 'Sandbox: sorted column (title in primary/600)'],
    ];
    return (
      <div className="ds-bd-tb-grid">
        {items.map(([mode, o, name]) => (
          <div key={name} className="ds-bd-tb-item">
            <Surface dark={mode === 'dark'} tight>
              <Table theme={mode} label="Header" columns={[headerColumn('Market', o)]} rows={[]} />
            </Surface>
            <Label>{name}</Label>
          </div>
        ))}
        <div className="ds-bd-tb-item" style={{ gridColumn: '1 / -1' }}>
          <Label>The header of the Light example: 11 columns, three with the sorting icon</Label>
          <Surface>
            <Table label="Header" columns={lightColumns} rows={[]} />
          </Surface>
        </div>
      </div>
    );
  },
};

// ---------- Dividers ----------

/** The Divider is a 26px section bar, not a thin line. */
export const Dividers: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const cols = [{ title: 'Market', width: 92 }, { title: 'Open', width: 92 }, { title: 'Close', width: 92 }];
    const item = (mode: TableTheme, row: TableDividerData, name: string) => (
      <div key={name} className="ds-bd-tb-item">
        <Label>{name}</Label>
        <Surface dark={mode === 'dark'} tight>
          <div className={`ds-tbl-wrap ds-tbl-wrap--${mode}`}>
            <table className="ds-tbl" style={{ '--tbl-min': '0px' } as CSSProperties}>
              <tbody>
                <TableDividerRow row={row} columnCount={cols.length} />
              </tbody>
            </table>
          </div>
        </Surface>
      </div>
    );
    return (
      <div>
        <div className="ds-bd-tb-grid">
          {item('light', { divider: true, title: 'Daily Market History', icon: 'plus' }, 'mode=light, button=false, Show icon=true')}
          {item('dark', { divider: true, title: 'Daily Market History', icon: 'plus' }, 'mode=dark, button=false, Show icon=true')}
          {item('light', { divider: true, title: 'Daily Market History', icon: 'plus', action: { label: 'Link', icon: 'delete18' } }, 'mode=light, button=true, Show icon=true')}
          {item('dark', { divider: true, title: 'Daily Market History', icon: 'plus', action: { label: 'Link', icon: 'delete18' } }, 'mode=dark, button=true, Show icon=true')}
        </div>
        <h3>Dividers between columns</h3>
        <div className="ds-bd-tb-item">
          <Label>Sandbox "Table example" 6228:26517: vertical dividers</Label>
          <Surface>
            <Table label="Alerts" columns={alertsColumns} rows={alertsRows.slice(0, 2)} columnDividers />
          </Surface>
        </div>
      </div>
    );
  },
};

// ---------- States and subscription highlighting ----------

const stateColumns: TableColumn[] = [{ title: 'Market', width: 190 }, { title: 'Ticker' }, { title: 'Market Type' }];
const stateRow = (extra: Partial<TableDataRow>): TableDataRow => ({
  cells: [{ type: 'market name', name: 'China 10 Year Government Bond Yield (CNY)' }, { type: 'text', text: 'SCHZ' }, { type: 'text', text: 'Cash/Spot' }],
  ...extra,
});

/** Default, hover (Sandbox row) and a subscribed market. Hover is also real: move the pointer over a row. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-tb-grid">
      {(
        [
          ['Default', {}],
          ['Hover (Sandbox row): gray/100 fill, underlined market name', { preview: 'hover' }],
          ['Subscribed market (not a selected row)', { subscription: 'premium' }],
        ] as Array<[string, Partial<TableDataRow>]>
      ).map(([name, extra]) => (
        <div key={name} className="ds-bd-tb-item">
          <Label>{name}</Label>
          <Surface>
            <Table label={name} columns={stateColumns} rows={[stateRow(extra)]} />
          </Surface>
        </div>
      ))}
    </div>
  ),
};

/** Three subscription tiers and a market without a subscription. */
export const SubscriptionHighlighting: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Table label="Watchlist" columns={watchlistColumns} rows={watchlistRows} footnote={WATCHLIST_FOOTNOTE} />
    </Surface>
  ),
};

// ---------- Sandbox examples ----------

/** Example 1: the Light "Table example" (Sandbox node 6228:19649). */
export const LightExample: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-demo-surface ds-bd-tb-demo-surface">
      <div className="ds-bd-tb-demo">
        <Table label="Socrates Markets, light theme example" columns={lightColumns} rows={lightRows} minWidth={1148} />
      </div>
    </div>
  ),
};

/** Example 2: the Dark "Table example" elements (Sandbox nodes 6228:21083 and 6228:21100). */
export const DarkExample: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-demo-surface ds-bd-tb-demo-surface">
      <div className="ds-bd-tb-demo">
        <div className="ds-bd-tb-dark-card">
          <Table theme="dark" label={stochastics.label} rowHeaders={stochastics.rowHeaders} columns={stochastics.columns} rows={stochastics.rows} width={300} />
          <Table theme="dark" label={energy.label} rowHeaders={energy.rowHeaders} columns={energy.columns} rows={energy.rows} width={246} />
        </div>
      </div>
    </div>
  ),
};

function MobileDemo({ stickyFirstColumn }: { stickyFirstColumn: boolean }) {
  const regionRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    const update = () => {
      const max = Math.round(region.scrollWidth - region.clientWidth);
      setText(
        `Scrolled ${Math.round(region.scrollLeft)}px of ${max}px. ${
          stickyFirstColumn ? (region.scrollLeft > 0 ? 'The pinned column shows its shadow.' : 'At the start: no shadow.') : 'The first column scrolls with the rest.'
        }`,
      );
    };
    region.addEventListener('scroll', update, { passive: true });
    update();
    return () => region.removeEventListener('scroll', update);
  }, [stickyFirstColumn]);

  return (
    <div className="ds-bd-demo-surface ds-bd-tb-demo-surface">
      <div className="ds-bd-tb-demo">
        <div className="ds-bd-tb-phone">
          <Table ref={regionRef} label="Market data, mobile example" columns={mobileColumns} rows={mobileRows} stickyFirstColumn={stickyFirstColumn} width={TABLE_PREVIEW_FRAMES.mobile} />
        </div>
        <p className="ds-bd-tb-note">{text}</p>
        <div className="ds-bd-tb-actions">
          <Button variant="secondary" size={36} onClick={() => regionRef.current?.scrollTo({ left: 80 })}>
            Scroll to the Figma position
          </Button>
          <Button variant="secondary" size={36} onClick={() => regionRef.current?.scrollTo({ left: 0 })}>
            Back to the start
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Example 3: the Mobile "Table example" (Sandbox node 6228:25452), 343px wide, first column pinned. */
export const MobileExample: StoryObj<{ stickyFirstColumn: boolean }> = {
  args: { stickyFirstColumn: true },
  parameters: { controls: { include: ['stickyFirstColumn'] } },
  argTypes: {
    stickyFirstColumn: { name: 'sticky first column', description: 'Documentation preview of the optional `stickyFirstColumn` property.', control: 'boolean' },
  },
  render: ({ stickyFirstColumn }) => <MobileDemo stickyFirstColumn={stickyFirstColumn} />,
};

/** Checks that the React Table and the HTML builders produce the same DOM for a large matrix. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <TableParity />,
};
