// Documentation data. Every example below is a configuration of the real Table component; none is a drawing.
// The structure and texts are read from the Figma Sandbox elements named "Table example":
//   LIGHT      6228:19649  (Test Design System Markets_All)           the main light example
//   WATCHLIST  6228:26928  (Test Design System Markets_All)           a second light table: sparklines and subscription tints
//   ALERTS     6228:26517  (Test Design System Markets_All)           a third light table: vertical column dividers
//   STOCHASTICS 6228:21083 and ENERGY 6228:21100  (Dashboards_Last Daily Close_Hover)   the dark examples
//   MOBILE     6228:25452  (mobile)                         the pinned first column
// Values are sample data from those frames. They are not Figma specifications.

const mn = (name, o = {}) => ({ type: 'market name', name, ...o });
const tx = (text, o = {}) => ({ type: 'text', text, ...o });
const mt = (text, tone = 'alert-600') => ({ type: 'metric', text, tone });
const btn = (variant, text) => ({ type: 'button', variant, text });

const DAY = '4.04\n3/15/2024';

/* ---------- Light: Test Design System Markets_All, "Table example" 6228:19649 ---------- */
export const LIGHT_COLUMNS = [
  { title: 'Market', width: 140, sorting: true, sorted: true },
  { title: 'Ticker', sorting: true },
  { title: 'Market Type' },
  { title: 'Prior Close' },
  { title: 'Open' },
  { title: 'High' },
  { title: 'Low' },
  { title: 'Close' },
  { title: 'Change \n(Vs prior close)', sorting: true },
  { title: 'GMW Monthly Pattern' },
  { title: 'Current Subscription', width: 156 },
];

const hk = (subscription, variant, label) => ({
  subscription,
  cells: [
    mn('Hong Kong 10 Year Government Bond Yield (HKD)'),
    tx('SCHZ'),
    tx('Cash/Spot'),
    tx(DAY),
    mt(DAY),
    mt(DAY, 'green-600'),
    mt(DAY),
    mt(DAY, 'alert-500'),
    mt('-1.37%\n(+0.09)', 'alert-500'),
    mt('New Pattern Forming'),
    btn(variant, label),
  ],
});

const cn = (ticker, price, date, pattern = 'alert-600', extra = {}) => ({
  ...extra,
  cells: [
    mn('China 10 Year Government Bond Yield (CNY)'),
    tx(ticker),
    tx('Cash/Spot'),
    tx(`${price}\n${date}`),
    mt(`${price}\n${date}`),
    mt(`${price}\n${date}`, 'green-600'),
    mt(`${price}\n${date}`),
    mt(`${price}\n${date}`, 'alert-500'),
    mt('-1.37%\n(+0.09)', 'alert-500'),
    mt('New Pattern Forming', pattern),
    btn('purchase_secondary', 'Purchase Analysis'),
  ],
});

const PIN = { label: 'pin to top', icon: 'keep', tone: 'primary' };

export const LIGHT_ROWS = [
  { divider: true, title: 'Asia (31)', level: 1, icon: 'minus', iconAlign: 'text' },
  { divider: true, title: '🇭🇰 Hong Kong (3)', icon: 'minus', iconAlign: 'text', action: PIN },
  hk('detailed', 'neutral_detailed', 'Detailed Analysis'),
  hk('premium', 'neutral_premium', 'Premium Analysis'),
  hk('summary', 'neutral_summary', 'Summary Analysis'),
  {
    subscription: 'premium',
    cells: [
      mn('Hong Kong'),
      tx('N/A'),
      tx('Economic Data'),
      tx('140.70\nMay-2025'),
      tx('N/A'),
      tx('N/A'),
      tx('N/A'),
      tx('N/A'),
      mt(DAY, 'alert-500'),
      mt('New Pattern Forming'),
      btn('neutral_premium', 'Premium Analysis'),
    ],
  },
  { divider: true, title: '🇨🇳 China (8)', icon: 'minus', iconAlign: 'text', action: PIN },
  cn('SCHZ', '4.04', '3/15/2024', 'green-500'),
  cn('SCHZ', '4.04', '3/15/2024', 'alert-600', { preview: 'hover' }),
  cn('SCHZ', '4.04', '3/15/2024'),
  cn('SCHZ', '4.04', '3/15/2024', 'yellow-300'),
  cn('BNDX', '5.12', '4/1/2024', 'comments-900'),
  cn('AGTH', '6.75', '5/10/2024'),
  cn('AGTH', '6.75', '5/10/2024'),
];

/* ---------- Light: watchlist, "Table example" 6228:26928 ---------- */
export const WATCHLIST_COLUMNS = [
  { title: 'Market', sorting: true, sorted: true },
  { title: 'Price Movement' },
  { title: 'Open' },
  { title: 'High' },
  { title: 'Low' },
  { title: 'Close' },
  { title: 'Change \n(Vs prior close)', sorting: true },
  { title: 'GMW Monthly\nPattern', width: 132 },
  { title: 'Current Subscription', width: 156 },
];

const wl = (subscription, name, flag, country, graph, variant, label) => ({
  subscription,
  cells: [
    mn(name, { flag, country }),
    { type: graph },
    mt('3.99\n3/18/2024'),
    mt('3.99\n3/18/2024', 'green-500'),
    mt('3.99\n3/18/2024', 'alert-500'),
    mt('3.99\n3/18/2024', 'alert-500'),
    mt('-1.37%\n(+11.09)', 'alert-500'),
    mt('Pressing \nLower'),
    btn(variant, label),
  ],
});

export const WATCHLIST_ROWS = [
  wl('detailed', 'US - Apple', '🇺🇸', 'United States', 'graph-red', 'neutral_detailed', 'Detailed Analysis'),
  wl('premium', 'US - Meta Platforms ', '🇺🇸', 'United States', 'graph-green', 'neutral_premium', 'Premium Analysis'),
  wl('summary', 'NVIDIA', '🇦🇺', 'United States', 'graph-red', 'neutral_summary', 'Summary Analysis'),
  wl(undefined, 'US - Microsoft', '🇺🇸', 'United States', 'graph-red', 'purchase_secondary', 'Purchase Analysis'),
];
export const WATCHLIST_FOOTNOTE =
  '* We show the most recent daily close during the given Week / Month / Quarter / Year, along with an updated GMW comment to show the user how the market is trending';

/* ---------- Light: alerts, "Table example" 6228:26517 (vertical column dividers) ---------- */
export const ALERTS_COLUMNS = [
  { title: 'Market Names' },
  { title: 'Moving Average' },
  { title: '52 wk high/low' },
  { title: 'Stochastics' },
  { title: 'Indication Ranges' },
  { title: 'GMW' },
  { title: 'Reversals' },
  { title: 'Arrays' },
  { title: 'Most Recent Alert Results as of today' },
].map((c, i) => ({ ...c, align: i === 0 ? 'start' : 'center' }));

const bell = { type: 'icon', icon: 'notifications_off', muted: true };
const none = { type: 'text', text: 'No alert \ntriggered yet', tone: 'muted' };
const na = { type: 'text', text: 'NA', tone: 'secondary' };
const zero = { type: 'text', text: '0 new matches' };

export const ALERTS_ROWS = [
  {
    cells: [
      mn('Australia BMK 10 Yr YLD (AUD)', { star: false, flag: '🇦🇺', country: 'Australia' }),
      { type: 'text_new', label: 'New', text: '200 MA, breaks \nabove, 7/23/2024', strong: true },
      bell,
      bell,
      none,
      bell,
      na,
      na,
      { type: 'text_label', textType: '1 element', count: '1', label: 'New', text: 'Match', strong: true },
    ],
  },
  { cells: [mn('Canada BMK 2 Yr YLD (CAD)', { star: false, flag: '🇨🇦', country: 'Canada' }), bell, none, bell, bell, bell, na, na, zero] },
  { cells: [mn('Canada BMK 2 Yr YLD (CAD)', { star: false, flag: '🇨🇦', country: 'Canada' }), none, bell, bell, { type: 'text', text: 'All bearish,\n3/18/2024' }, bell, na, na, zero] },
  { cells: [mn('German Long Bund', { star: false, flag: '🇩🇪', country: 'Germany' }), none, none, bell, bell, bell, na, na, zero] },
];

/* ---------- Dark: "Table example" 6228:21083 (Stochastics) and 6228:21100 (Energy Model) ---------- */
export const STOCHASTICS = {
  label: 'Stochastics',
  rowHeaders: false,
  columns: [{ title: 'Blue', width: 40 }, { title: 'Yellow', width: 40 }, { title: 'Red', width: 40 }, { title: 'Near \nTerm Cross', width: 90 }, { title: 'Intermediate Cross', width: 90 }],
  rows: [
    {
      cells: [
        mt('12', 'primary-600'),
        mt('43', 'yellow-300'),
        mt('31', 'alert-600'),
        tx('Blue Crossed \nBelow Yellow '),
        tx('Yellow crossed \nABOVE Red'),
      ],
    },
  ],
};
export const ENERGY = {
  label: 'Energy Model',
  rowHeaders: false,
  columns: [{ title: 'Energy  Number', width: 61.5 }, { title: ' MA', width: 61.5 }, { title: 'Top Band', width: 61.5 }, { title: 'Bottom Band', width: 61.5 }],
  rows: [{ cells: [tx('4.05'), tx('4.10'), tx('4.15'), tx('4.20')] }],
};

/* ---------- Mobile: "Table example" 6228:25452 ---------- */
export const MOBILE_COLUMNS = [
  { title: 'Market', width: 80 },
  { title: 'Price \nMovement', width: 60 },
  { title: 'Open', width: 80 },
  { title: 'High', width: 80 },
  { title: 'Low', width: 80 },
  { title: 'Close', width: 80 },
  { title: 'Change (VS \nprior close)', width: 80 },
  { title: 'GMW Monthly\n Pattern', width: 80 },
];

const mob = (name, flag, country, o, h, l, c, change) => ({
  cells: [
    mn(name, { star: false, flag, country }),
    { type: 'graph-green' },
    mt(o),
    mt(h),
    mt(l),
    mt(c),
    mt(change, 'green-500'),
    mt('New Pattern \nForming', 'green-500'),
  ],
});

export const MOBILE_ROWS = [
  mob('US Treasury 10 Yr YLD (USD)', '🇺🇸', 'United States', '4.25\n6/12/2024', '4.31\n6/14/2024', '4.18\n6/10/2024', '4.28\n6/14/2024', '+0.71% (+3.02)'),
  mob('US Treasury 10 Yr YLD (USD)', '🇺🇸', 'United States', '4.07\n5/20/2024', '4.15\n5/22/2024', '3.98\n5/21/2024', '4.12\n5/24/2024', '+1.23% (+5.01)'),
  mob('Japan Gov 10 Yr YLD (JPY)', '🇯🇵', 'Japan', '0.87\n4/08/2024', '0.93\n4/11/2024', '0.84\n4/09/2024', '0.91\n4/12/2024', '+4.60% (+0.04)'),
  mob('Germany Bund 10 Yr YLD (EUR)', '🇩🇪', 'Germany', '2.34\n7/01/2024', '2.42\n7/03/2024', '2.29\n7/02/2024', '2.38\n7/05/2024', '+1.71% (+4.01)'),
  mob('Canada Gov 10 Yr YLD (CAD)', '🇨🇦', 'Canada', '3.52\n8/15/2024', '3.61\n8/19/2024', '3.47\n8/16/2024', '3.58\n8/20/2024', '-0.83% (-3.00)'),
];
