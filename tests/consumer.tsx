// Compile against the built package declarations, as a consuming application does.
import {
  Dropdown, DropdownItems, Popup, PopupView, Table, TableCell, TableHeaderCell, TableDividerRow, Header,
  DROPDOWN_STATE_LIST, POPUP_TYPE_LIST, POPUP_WIDTH_LIST, TABLE_THEMES, HEADER_PLATFORMS,
} from 'test-design-system';
import type {
  DropdownProps, DropdownItemsProps, DropdownOption, DropdownState,
  PopupProps, PopupViewProps, PopupType, PopupWidth, PopupMode, PopupCloseReason,
  TableProps, TableCellProps, TableHeaderCellProps, TableDividerRowProps, TableTheme,
  TableSubscription, TableMetricTone, TableIconName, TableTextTone, TableCellData, TableCellType,
  TableColumn, TableDataRow, TableDividerData, TableRow,
  HeaderProps, HeaderPlatform, HeaderType, HeaderResolution, HeaderPanel, HeaderOpenState,
} from 'test-design-system';
import 'test-design-system/styles.css';

const options: DropdownOption[] = ['London', { value: 'paris', label: 'Paris', pro: true }];
const dropdown: DropdownProps = { options, onValueChange(value, option) { console.log(value, option.label); } };
const items: DropdownItemsProps = { options };
const popup: PopupProps = { title: 'Confirm', open: false, onClose(reason: PopupCloseReason) { console.log(reason); } };
const preview: PopupViewProps = { title: 'Preview', mode: 'static' satisfies PopupMode };
const column: TableColumn = { title: 'Market', width: 140 };
const cell: TableCellData = { type: 'text', text: 'Market' };
const row: TableDataRow = { cells: [cell], subscription: 'premium' satisfies TableSubscription };
const divider: TableDividerData = { divider: true, title: 'Section' };
const table: TableProps = { label: 'Markets', columns: [column], rows: [divider, row] satisfies TableRow[] };
const cellProps: TableCellProps = { cell };
const headerCell: TableHeaderCellProps = { column };
const dividerProps: TableDividerRowProps = { row: divider, columnCount: 1 };
const header: HeaderProps = { platform: 'standart', onOpenChange(next: HeaderOpenState) { console.log(next.drawer); } };

export function ConsumerFixture() {
  return <>
    <Header {...header} />
    <Dropdown {...dropdown} />
    <div role="listbox" aria-label="Cities"><DropdownItems {...items} /></div>
    <Popup {...popup} />
    <PopupView {...preview} />
    <Table {...table} />
    <table><thead><tr><TableHeaderCell {...headerCell} /></tr></thead><tbody>
      <TableDividerRow {...dividerProps} /><tr><TableCell {...cellProps} /></tr>
    </tbody></table>
  </>;
}

export const publicTypes: [DropdownState, PopupType, PopupWidth, TableTheme, HeaderPlatform, HeaderType, HeaderResolution, HeaderPanel, TableMetricTone, TableIconName, TableTextTone, TableCellType] =
  [DROPDOWN_STATE_LIST[0], POPUP_TYPE_LIST[0], POPUP_WIDTH_LIST[0], TABLE_THEMES[0], HEADER_PLATFORMS[0] as HeaderPlatform, 'yes', 'desktop', 'help', 'primary-600', 'star', 'muted', 'text'];
