// Table specification copied from the Figma Design Library (Table page, node 131:46) and the Sandbox "Table example" elements.
//   table-cell   (131:1295)  component set: mode x type x metric type x text type, 33 variants
//   table-cell   (449:139)   component set: mode, the header cell (properties: title, sorting)
//   Divider      (3253:3507) component set: mode (properties: button, Show icon)
// Property names and values are the Figma ones.

export const TABLE_MODES = ['light', 'dark'];

// The 15 values of the Figma `type` property, in the order Figma lists them. `dark: false` means Figma has no dark variant.
export const TABLE_CELL_TYPES = [
  { type: 'market name', dark: true, width: 140, note: 'Star, market name and country with flag. Left aligned. Figma colors the country gray/500 in the dark variant too, which is low contrast on secondary/900.' },
  { type: 'text', dark: true, width: 140, note: 'One centered text. `text type` 1 element and 2 element add one or two badges and a percentage.' },
  { type: 'text_new', dark: true, width: 140, note: 'A New label above a short text.' },
  { type: 'text_label', dark: false, width: 140, note: 'A number, a New label and a text on one row.' },
  { type: 'link', dark: false, width: 140, note: 'An icon and a primary-colored link text.' },
  { type: 'toggle', dark: false, width: 140, note: 'The off toggle icon with a title.' },
  { type: 'blank', dark: true, width: 140, note: 'An empty cell that keeps the border.' },
  { type: 'icon', dark: true, width: 140, note: 'One 24px icon.' },
  { type: 'icon+text', dark: true, width: 140, note: 'A 20px icon and a short text.' },
  { type: 'metric', dark: true, width: 140, note: 'A value and a date on a colored tile.' },
  { type: 'metric+comment', dark: true, width: 140, note: 'A value with 1 or 2 count badges, and a comment, on a colored tile (`metric type` 1 element, 2 elements).' },
  { type: 'button', dark: true, width: 163, note: 'A Button that fills the cell.' },
  { type: 'graph-green', dark: true, width: 164, note: 'The small green sparkline.' },
  { type: 'graph-red', dark: true, width: 164, note: 'The small red sparkline.' },
  { type: 'bar', dark: true, width: 164, note: 'A horizontal bar; an optional date label sits inside it (`data`).' },
];

export const TABLE_CELL_VARIANTS = [
  ...TABLE_CELL_TYPES.flatMap((t) => {
    const out = [];
    const add = (mode, extra = {}) => out.push({ mode, type: t.type, metricType: 'default', textType: 'default', ...extra });
    if (t.type === 'text') {
      for (const mode of TABLE_MODES) {
        add(mode);
        add(mode, { textType: '1 element' });
        add(mode, { textType: '2 element' });
      }
    } else if (t.type === 'text_label') add('light', { textType: '1 element' });
    else if (t.type === 'metric+comment') {
      for (const mode of TABLE_MODES) {
        add(mode, { metricType: '1 element' });
        add(mode, { metricType: '2 elements' });
      }
    } else {
      add('light');
      if (t.dark) add('dark');
    }
    return out;
  }),
];

// Types that Figma only draws in the light mode. In a dark table they keep their light look.
export const TABLE_LIGHT_ONLY = TABLE_CELL_TYPES.filter((t) => !t.dark).map((t) => t.type);

// Metric tile colors seen in the Figma examples (tokens). `alert-600` is the color of the component's own metric tile.
export const TABLE_METRIC_TONES = {
  'alert-600': { token: 'alert/600', text: 'light' },
  'alert-500': { token: 'alert/500', text: 'light' },
  'green-600': { token: 'green/600', text: 'light' },
  'green-500': { token: 'green/500', text: 'light' },
  'primary-600': { token: 'primary/600', text: 'light' },
  'yellow-300': { token: 'yellow/300', text: 'dark' },
  'comments-900': { token: 'comments/900', text: 'dark' },
};

// Row highlight: the subscription tier of the market (Sandbox example). The tint fills every cell of the row.
export const TABLE_SUBSCRIPTIONS = {
  detailed: { token: 'detailed/50', label: 'Detailed', button: 'neutral_detailed', action: 'Detailed Analysis' },
  premium: { token: 'premium/50', label: 'Premium', button: 'neutral_premium', action: 'Premium Analysis' },
  summary: { token: 'summary/50', label: 'Summary', button: 'neutral_summary', action: 'Summary Analysis' },
};

// Width of a flexible column that cannot shrink further before the table scrolls sideways. The narrowest columns
// drawn in the Figma examples are 40px (dark examples) and 60px (mobile); the Light example's flexible columns are 94px.
export const TABLE_FLEX_MIN = 80;

export const TABLE_PREVIEW_FRAMES = { desktop: 1180, mobile: 343 };

export const TABLE_SPEC = {
  row: 'Rows are 64px high (including the 1px bottom border). The header row is 32px.',
  cell: 'Padding 8px 4px for the market name, metric, button, graph and bar cells; 16px 4px for text, icon, link, toggle, text_new and text_label cells. 1px border at the bottom. The row is a fixed 64px in Figma, so a two-line value overflows the 16px padding; the component pads those cells 8px, which gives the same centered result and lets longer text grow the row.',
  cellLight: 'Fill gray/50, bottom border gray/200',
  cellDark: 'No fill (the table sits on secondary/900), bottom border gray/400',
  header: 'Height 32px, padding 4px, Proxima Nova Semibold 10px, uppercase, no line height. Light: fill gray/100, text gray/500. Dark: fill secondary/800, text secondary/50.',
  divider: 'Height 26px (4px padding, 18px content), 1px border above and below. Light: fill gray/100, border gray/200. Dark: fill secondary/800, border gray/400. Text Regular 12/18.',
  sticky: 'The pinned first column is 80px wide in the mobile example. Its shadow is a drop shadow of 4px 4px 6px at 16% black.',
};
