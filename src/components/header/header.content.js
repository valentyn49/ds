// Labels and menu contents copied from the Figma header variants and the dropdown frames on the Headers page.
// Figma gives no destinations, and the account name, credits and cart lines are sample content from the frames.

export const NAV_ITEMS = {
  standart: [
    { label: 'Members Blog' },
    { label: 'Socrates Markets', menu: 'markets' },
    { label: 'My Markets', menu: 'myMarkets' },
    { label: 'Watchlist', menu: 'watchlist' },
    { label: 'Help', menu: 'help' },
    { label: 'Purchase' },
  ],
  enterprise: [
    { label: 'Members Blog' },
    { label: 'Market Finder' },
    { label: 'Socrates Markets', menu: 'markets' },
    { label: 'My Markets', menu: 'myMarkets' },
    { label: 'Watchlist', menu: 'watchlist' },
    { label: 'Help', menu: 'help' },
  ],
};

// `arrow` marks items drawn with a right chevron. `flyout` is a submenu that opens beside the panel.
export const MENUS = {
  markets: [
    { label: 'All Covered Markets', arrow: true },
    { label: 'Bonds', arrow: true, drawerChildren: ['Government Bonds', 'Bond ETFs'] },
    { label: 'Commodities', arrow: true },
    { label: 'Crypto', arrow: true },
    { label: 'Currencies', arrow: true },
    { label: 'Stocks', arrow: true },
    { label: 'Indices', arrow: true },
    { label: 'ETFs', arrow: true },
    { label: 'Economics', arrow: true },
    { label: 'Find Markets by Tags', drawerLabel: 'Markets by Tag' },
    { label: 'Performance Trackers', arrow: true, flyout: ['Index Performance Tracker', 'Economics Tracker'] },
  ],
  myMarkets: [
    { label: 'My Market Subscriptions' },
    { label: 'My Snapshot Reports' },
    { label: 'My Market Alerts' },
    { label: 'Pro Grid View', badge: 'Upgrade' },
  ],
  watchlist: [{ label: 'Energy' }, { label: 'Tech-list' }, { label: 'Bonds' }, { label: 'Commodities' }],
  help: [
    { label: 'Members Help', arrow: true, flyout: ['General FAQ’s', 'Covered Market List', 'Compare Membership Package'] },
    { label: 'General Help', arrow: true },
  ],
};

export const PROFILE = {
  name: 'Valentyn',
  credits: 'Current Credits: 12',
  membership: 'Membership: Plus',
  items: ['My Account', 'My Market Subscriptions', 'Billing Information', 'My Transactions', 'My Preferences', 'Invite a Friend', 'Log Out'],
};

export const CART = {
  title: 'Your Cart',
  edit: 'Edit',
  lines: [
    { name: 'AU - Queensland Base-Load Electricity', level: 'Premium', price: '$25.00' },
    { name: 'Australia BMK 10 Yr YLD (AUD)', level: 'Detailed', price: '$15.00' },
  ],
  checkout: 'Checkout ($40.00)',
  count: 2,
};

export const LOGGED_OUT = {
  standart: [{ label: 'Login', icon: 'logoff' }, { label: 'Sign Up', icon: 'plus_circle' }],
  enterprise: [{ label: 'Login', icon: 'logoff' }, { label: 'Request Information', icon: 'support' }],
};

export const SEARCH_PLACEHOLDER = 'Market Search';
export const ENTERPRISE_TAG = 'Enterprise';
