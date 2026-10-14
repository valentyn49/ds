// Text and link labels copied from the Figma footer variants, including its spelling ("Perfomance", "aggrement").
// Figma gives no link destinations, so none are defined here.

export const FOOTER_TEXT = {
  disclaimer:
    'This website is designed for educational and informational purposes only, and provided "as-is". The information and analysis available is based on end-of-day data collected from various third-party sources, compiled, and processed through a set of proprietary models for computer-generated information and analysis on Daily, Weekly, Monthly, Quarterly and Yearly time levels across entire list of Covered Markets. Like any company reliant on third-party systems, technology, and large amounts of data, there may be unintended delays or errors that occur. While we make efforts to avoid such occurrences, we cannot guarantee this will never happen and we appreciate our customers understanding.',
  noteTitle: 'Important Note',
  note: 'This website is not providing individualized trading or investment advice, nor is it a banking service, brokerage service, trading service, investment service or money management service.',
  noteEnterpriseExtra: ' You have access to the platform on terms of License aggrement.',
  copyright: 'This website is the exclusive property of AE Global Solutions, Inc. and protected under all applicable laws.',
  enterpriseTag: 'Enterprise',
};

const markets = {
  heading: 'Socrates Markets',
  links: ['Bonds', 'Commodities', 'Crypto', 'Currencies', 'Stocks', 'Indices', 'ETFs', 'Category & Market Movers', 'Index Perfomance Tracker', 'Market Tags', 'Economics Tracker'],
};

// Each column lists items in order: a `group` has a heading and links, a `link` is a standalone item.
export const FOOTER_COLUMNS = {
  standart: [
    [{ group: markets }],
    ['Members Blog', 'Watchlist', 'Purchase', 'Pro Grid View', 'Snapshot Reports', 'Market Alerts'].map((label) => ({ link: label })),
    [
      { link: 'Help Center' },
      { group: { heading: 'My Account', links: ['My Market Subscriptions', 'Billing Information', 'My Transactions', 'My Preferences', 'Invite a Friend'] } },
    ],
  ],
  enterprise: [
    [{ group: markets }],
    ['Members Blog', 'Watchlist', 'Market Finder', 'Pro Grid View', 'Snapshot Reports', 'Market Alerts'].map((label) => ({ link: label })),
    [
      { link: 'Help Center' },
      { group: { heading: 'My Profile', links: ['My Preferences', 'Account Information'] } },
    ],
  ],
};

export const FOOTER_LEGAL_LINKS = {
  standart: ['Disclaimer', 'Contact', 'Privacy Policy', 'Terms of Use'],
  enterprise: ['Contact'],
};
