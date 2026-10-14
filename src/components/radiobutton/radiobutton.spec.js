// Radio Button specification copied from the Figma component set "radiobutton" (Radiobutton page, node 60:941).

// The only variant property in Figma is `state`.
export const RADIO_STATES = ['default', 'hover', 'selected', 'disabled'];

// Default values of the Figma component properties (Figma's default text has a trailing space).
export const RADIO_DEFAULTS = {
  title: 'Unchecked and label',
  subtitle: 'Unchecked and label',
  badgeText: 'Premium',
};

// How each Figma state maps to the component. Figma draws `disabled` as an unselected radio.
export const RADIO_STATE_PROPS = {
  default: { checked: false },
  hover: { checked: false },
  selected: { checked: true },
  disabled: { checked: false, disabled: true },
};

export const RADIO_SPEC = {
  componentWidth: 'Hugs its content (159px with the default text)',
  alignment: 'Top (control and text start at the top edge)',
  icon: '20px × 20px (the drawn circle is 15.83px, inset 2.08px)',
  gapToContent: '8px (spacers 2x)',
  gapInContent: '2px, between title row and caption',
  gapTitleBadge: '4px, between title and badge',
  title: 'text-sm/font-normal, Proxima Nova Regular 14/20',
  caption: 'text-xs/font-normal, Proxima Nova Regular 12/18',
  badge: 'Green/100 fill, 4px radius, 8px / 4px padding, text-uppercase/font-medium 12/16 in green/600',
};
