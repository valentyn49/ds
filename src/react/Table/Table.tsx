import { createElement, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import '../../components/table/table.css';
import { TABLE_ICONS } from '../../components/table/icons.js';
import { TABLE_LIGHT_ONLY, TABLE_SUBSCRIPTIONS, TABLE_FLEX_MIN, TABLE_MODES } from '../../components/table/table.spec.js';
import sparkGreen from '../../components/table/assets/sparkline-green.svg';
import sparkRed from '../../components/table/assets/sparkline-red.svg';
import { Button } from '../Button/Button';
import type { ButtonVariant } from '../Button/Button';
import { cx } from '../utils/cx';

/*
  React version of the Socrates Table. Same markup, class names and CSS as the HTML builders in
  src/components/table/table.js (tableHTML, tableCellHTML, tableHeaderCellHTML), so it looks identical.
  Source: Figma Design Library, Table page (cells 131:1295, header 449:139, Divider 3253:3507) and the Sandbox
  "Table example" elements.
*/

export type TableTheme = 'light' | 'dark';
export const TABLE_THEMES = TABLE_MODES as TableTheme[];

export type TableSubscription = 'detailed' | 'premium' | 'summary';
export type TableMetricTone = 'alert-600' | 'alert-500' | 'green-600' | 'green-500' | 'primary-600' | 'yellow-300' | 'comments-900';
export type TableIconName = keyof typeof TABLE_ICONS;
export type TableTextTone = 'secondary' | 'muted';

interface WithText {
  /** Gray/500 (`secondary`) or gray/400 (`muted`) instead of gray/900. */
  tone?: TableTextTone;
  /** Bold instead of regular (seen in the Sandbox alerts table). */
  strong?: boolean;
}

/** One cell. `type` is the Figma `type` property of the table-cell component set. */
export type TableCellData =
  | { type: 'market name'; name: string; country?: string; flag?: string; star?: boolean }
  | ({ type: 'text'; text: string; textType?: 'default' | '1 element' | '2 element'; badge?: string; suffix?: string; icon?: 'star' } & WithText)
  | ({ type: 'text_new'; label?: string; text: string } & WithText)
  | ({ type: 'text_label'; count?: string; label?: string; text?: string; textType?: '1 element' } & WithText)
  | { type: 'link'; text?: string; icon?: TableIconName; onClick?: () => void }
  | { type: 'toggle'; text?: string }
  | { type: 'blank' }
  | { type: 'icon'; icon?: TableIconName; muted?: boolean }
  | { type: 'icon+text'; icon?: TableIconName; text: string }
  | { type: 'metric'; text: string; tone?: TableMetricTone }
  | { type: 'metric+comment'; text: string; comment?: string; counts?: 1 | 2; count?: string; tone?: TableMetricTone }
  | { type: 'button'; variant?: ButtonVariant; text?: string; onClick?: () => void }
  | { type: 'graph-green'; alt?: string }
  | { type: 'graph-red'; alt?: string }
  | { type: 'bar'; label?: string };

export type TableCellType = TableCellData['type'];

export interface TableColumn {
  title: string;
  /** Width in px. Omit it for a flexible column. */
  width?: number;
  /** Shows the sorting icon. Figma defines the icon only: nothing sorts. */
  sorting?: boolean;
  /** Draws the title in primary/600. */
  sorted?: boolean;
  align?: 'start' | 'center';
}

export interface TableDataRow {
  cells: TableCellData[];
  /** A subscribed market: tints every cell of the row (light theme) and is exposed to assistive technology. */
  subscription?: TableSubscription;
  /** Documentation only: draws the hover look without a pointer. */
  preview?: 'hover';
}

export interface TableDividerData {
  divider: true;
  title: string;
  level?: 1;
  icon?: TableIconName;
  iconAlign?: 'end' | 'text';
  action?: { label: string; icon?: TableIconName; tone?: 'primary'; onClick?: () => void };
}

export type TableRow = TableDataRow | TableDividerData;

// ---------- parts ----------

function TableIcon({ name, className }: { name: TableIconName; className?: string }) {
  const icon = TABLE_ICONS[name];
  return (
    <svg className={className} width={icon.size} height={icon.size} viewBox={`0 0 ${icon.size} ${icon.size}`} fill="currentColor" aria-hidden="true" focusable="false">
      {icon.paths.map((d: string, i: number) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

const slug = (type: string) => type.replace(/\+/g, '-').replace(/_/g, '-').replace(/\s+/g, '-');

// Types with 16px vertical padding in Figma; every other type uses 8px (see table.css).
const ROOMY = new Set(['text', 'text_label', 'link', 'toggle', 'icon', 'icon+text', 'text_new']);

const textClass = (cell: WithText) => cx('ds-tbl__text', cell.tone && `ds-tbl__text--${cell.tone}`, cell.strong && 'ds-tbl__text--strong');

function CellContent({ cell }: { cell: TableCellData }): ReactNode {
  switch (cell.type) {
    case 'market name':
      return (
        <span className="ds-tbl__mn-box">
          {cell.star === false ? null : (
            <span className="ds-tbl__star">
              <TableIcon name="star" />
            </span>
          )}
          <span className={cx('ds-tbl__mn', cell.country && 'ds-tbl__mn--country')}>
            <span className="ds-tbl__mn-name">{cell.name}</span>
            {cell.country ? (
              <span className="ds-tbl__mn-country">
                {cell.flag ? (
                  <span className="ds-tbl__flag" aria-hidden="true">
                    {cell.flag}
                  </span>
                ) : null}
                <span>{cell.country}</span>
              </span>
            ) : null}
          </span>
        </span>
      );
    case 'text': {
      const textType = cell.textType ?? 'default';
      if (textType === 'default') {
        return (
          <>
            {cell.icon === 'star' ? <TableIcon name="star" className="ds-tbl__icon" /> : null}
            <span className={textClass(cell)}>{cell.text}</span>
          </>
        );
      }
      const badges = textType === '2 element' ? 2 : 1;
      return (
        <span className="ds-tbl__row-inline">
          <span className="ds-tbl__text">{cell.text}</span>
          {Array.from({ length: badges }, (_, i) => (
            <span key={i} className="ds-tbl__badge">
              {cell.badge ?? '1'}
            </span>
          ))}
          <span className="ds-tbl__text">{cell.suffix ?? ''}</span>
        </span>
      );
    }
    case 'text_new':
      return (
        <>
          <span className="ds-tbl__pill">{cell.label ?? 'New'}</span>
          <span className={textClass(cell)}>{cell.text}</span>
        </>
      );
    case 'text_label':
      return (
        <span className="ds-tbl__row-inline">
          <span className={textClass(cell)}>{cell.count ?? '1'}</span>
          <span className="ds-tbl__pill">{cell.label ?? 'New'}</span>
          <span className={textClass(cell)}>{cell.text ?? ''}</span>
        </span>
      );
    case 'link':
      return (
        <button type="button" className="ds-tbl__link" onClick={cell.onClick}>
          <TableIcon name={cell.icon ?? 'delete20'} />
          <span>{cell.text ?? 'Link'}</span>
        </button>
      );
    case 'toggle':
      return (
        <span className="ds-tbl__toggle">
          <TableIcon name="toggle_off" />
          <span>{cell.text ?? 'Status'}</span>
        </span>
      );
    case 'icon':
      return <TableIcon name={cell.icon ?? 'drag24'} className={cx('ds-tbl__icon', cell.muted && 'ds-tbl__icon--muted')} />;
    case 'icon+text':
      return (
        <>
          <TableIcon name={cell.icon ?? 'drag20'} className="ds-tbl__icon" />
          <span className="ds-tbl__text">{cell.text}</span>
        </>
      );
    case 'metric':
      return <span className={`ds-tbl__tile ds-tbl__tile--${cell.tone ?? 'alert-600'}`}>{cell.text}</span>;
    case 'metric+comment':
      return (
        <span className={`ds-tbl__tile ds-tbl__tile--${cell.tone ?? 'alert-600'}`}>
          <span className="ds-tbl__tile-row">
            <span>{cell.text}</span>
            {Array.from({ length: cell.counts === 2 ? 2 : 1 }, (_, i) => (
              <span key={i} className="ds-tbl__count">
                {cell.count ?? '1'}
              </span>
            ))}
          </span>
          <span>{cell.comment ?? ''}</span>
        </span>
      );
    case 'button':
      return (
        <Button variant={cell.variant ?? 'purchase'} size={36} onClick={cell.onClick}>
          {cell.text ?? 'Purchase Analysis'}
        </Button>
      );
    case 'graph-green':
    case 'graph-red':
      return <img className="ds-tbl__spark" src={cell.type === 'graph-red' ? sparkRed : sparkGreen} alt={cell.alt ?? ''} />;
    case 'bar':
      return <span className="ds-tbl__bar">{cell.label ? <span className="ds-tbl__bar-label">{cell.label}</span> : null}</span>;
    default:
      return null;
  }
}

export interface TableCellProps {
  cell: TableCellData;
  /** Renders a `th scope="row"` instead of a `td`. */
  rowHeader?: boolean;
  /** Visually hidden text read before the cell (the table uses it for the subscription). */
  srText?: string;
}

/** One data cell (`td`), or a row header (`th scope="row"`). Use it inside a `tr` of a `table.ds-tbl`. */
export function TableCell({ cell, rowHeader = false, srText }: TableCellProps) {
  const className = cx(
    'ds-tbl__cell',
    `ds-tbl__cell--${slug(cell.type)}`,
    ROOMY.has(cell.type) && 'ds-tbl__cell--roomy',
    (TABLE_LIGHT_ONLY as string[]).includes(cell.type) && 'ds-tbl__cell--light-only',
    cell.type.startsWith('graph') && 'ds-tbl__cell--graph',
  );
  return createElement(
    rowHeader ? 'th' : 'td',
    { className, scope: rowHeader ? 'row' : undefined },
    <div className="ds-tbl__content">
      {srText ? <span className="ds-tbl__sr">{srText}</span> : null}
      <CellContent cell={cell} />
    </div>,
  );
}

export interface TableHeaderCellProps {
  column: TableColumn;
  /** The first column is left aligned unless `column.align` says otherwise. */
  first?: boolean;
}

/** The header cell: a title and an optional sorting icon. */
export function TableHeaderCell({ column, first = false }: TableHeaderCellProps) {
  const align = column.align ?? (first ? 'start' : 'center');
  return (
    <th className={cx('ds-tbl__th', align === 'start' && 'ds-tbl__th--start', column.sorted && 'ds-tbl__th--sorted')} scope="col">
      <div className="ds-tbl__th-inner">
        <span className="ds-tbl__th-title">{column.title}</span>
        {column.sorting ? <TableIcon name="sorting" className="ds-tbl__th-sort" /> : null}
      </div>
    </th>
  );
}

export interface TableDividerRowProps {
  row: TableDividerData;
  columnCount: number;
}

/** A section bar that spans every column: the Figma Divider. */
export function TableDividerRow({ row, columnCount }: TableDividerRowProps) {
  const { action } = row;
  return (
    <tr className="ds-tbl__divider-row">
      <th
        className={cx('ds-tbl__divider', row.level === 1 && 'ds-tbl__divider--level-1', row.iconAlign !== 'text' && 'ds-tbl__divider--icon-end')}
        colSpan={columnCount}
        scope="colgroup"
      >
        <div className="ds-tbl__divider-inner">
          <div className="ds-tbl__divider-main">
            <span className="ds-tbl__divider-title">{row.title}</span>
            {row.icon ? <TableIcon name={row.icon} className="ds-tbl__divider-icon" /> : null}
          </div>
          {action ? (
            <button type="button" className={cx('ds-tbl__divider-action', action.tone === 'primary' && 'ds-tbl__divider-action--primary')} onClick={action.onClick}>
              {action.icon ? <TableIcon name={action.icon} /> : null}
              <span>{action.label}</span>
            </button>
          ) : null}
        </div>
      </th>
    </tr>
  );
}

// ---------- table ----------

export interface TableProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style'> {
  theme?: TableTheme;
  /** The accessible name of the table (also its caption). */
  label?: string;
  columns: TableColumn[];
  rows: TableRow[];
  /** Pins the first column while the others scroll sideways. */
  stickyFirstColumn?: boolean;
  /** 1px vertical dividers between columns (seen in the Sandbox alerts table). */
  columnDividers?: boolean;
  /** The first cell of each row is the row header. Turn it off for tables without a row title. */
  rowHeaders?: boolean;
  /** Minimum width of the table in px before it scrolls sideways. Default: fixed widths plus 80px per flexible column. */
  minWidth?: number;
  /** A note under the table. */
  footnote?: string;
  /** Documentation only: draws the pinned-column shadow without scrolling. */
  scrolled?: boolean;
  /** Width of the scroll region in px. By default it fills its container. */
  width?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Socrates table, configured with `columns` and `rows`. It scrolls sideways inside its own region (focusable,
 * named) and never widens the page. With `stickyFirstColumn`, the pinned column gets its shadow once the table has
 * scrolled; Figma draws the shadow in a scrolled state and gives no rule for when it appears, so that timing is an
 * implementation decision. `ref` points to the scroll region.
 */
export const Table = forwardRef<HTMLDivElement, TableProps>(function Table(
  {
    theme = 'light',
    label = 'Table',
    columns,
    rows,
    stickyFirstColumn = false,
    columnDividers = false,
    rowHeaders = true,
    minWidth,
    footnote = '',
    scrolled = false,
    width,
    className,
    style,
    ...rest
  },
  ref,
) {
  const regionRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => regionRef.current as HTMLDivElement);

  const [scrolledSideways, setScrolledSideways] = useState(false);
  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    const sync = () => setScrolledSideways(region.scrollLeft > 0);
    region.addEventListener('scroll', sync, { passive: true });
    sync();
    return () => region.removeEventListener('scroll', sync);
  }, []);

  const mode = theme === 'dark' ? 'dark' : 'light';
  const fixed = columns.reduce((sum, c) => sum + (c.width ?? 0), 0);
  const flexible = columns.filter((c) => c.width == null).length;
  const min = minWidth ?? fixed + flexible * TABLE_FLEX_MIN;

  const region = (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      {...rest}
      ref={regionRef}
      className={cx('ds-tbl-wrap', `ds-tbl-wrap--${mode}`, className)}
      data-scrolled={scrolled || scrolledSideways ? '' : undefined}
      style={width ? { ...style, width } : style}
    >
      <table className={cx('ds-tbl', stickyFirstColumn && 'ds-tbl--sticky', columnDividers && 'ds-tbl--col-dividers')} style={{ '--tbl-min': `${min}px` } as CSSProperties}>
        <caption className="ds-tbl__caption">{label}</caption>
        <colgroup>
          {columns.map((c, i) => (
            <col key={i} style={c.width != null ? { width: c.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <TableHeaderCell key={i} column={c} first={i === 0} />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => {
            if ('divider' in row) return <TableDividerRow key={r} row={row} columnCount={columns.length} />;
            const tier = TABLE_SUBSCRIPTIONS[row.subscription as TableSubscription] as { label: string } | undefined;
            return (
              <tr key={r} className="ds-tbl__row" data-subscription={tier ? row.subscription : undefined} data-preview-state={row.preview}>
                {row.cells.map((cell, i) => (
                  <TableCell key={i} cell={cell} rowHeader={rowHeaders && i === 0} srText={i === 0 && tier ? `Subscribed market, ${tier.label} subscription. ` : undefined} />
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return footnote ? (
    <div className="ds-tbl-root">
      {region}
      <p className="ds-tbl__note">{footnote}</p>
    </div>
  ) : (
    region
  );
});
