// Dropdown specification copied from the Figma Dropdowns section (Dropdowns page, node 329:425):
// component sets "dropdown-input" (trigger) and "dropdown item", and the "dropdown" menu component.

// The only variant property on the trigger is `state`. Figma shows the open look as `hover` (border gray/500, chevron flipped up).
export const DROPDOWN_STATES = ['default', 'hover', 'selected', 'disabled', 'error'];

// Figma defaults. The option names are neutral sample data (Figma's item text is the placeholder "London").
export const DROPDOWN_DEFAULTS = {
  label: 'Your email',
  placeholder: 'Select leave type',
  footnote: 'We’ll never share your details. See our Privacy Policy',
  proText: 'Premium',
  searchPlaceholder: 'Search',
};

export const SAMPLE_OPTIONS = ['London', 'Paris', 'Berlin', 'Madrid'];

export const DROPDOWN_SPEC = {
  componentWidth: '347px; the trigger and the menu fill the width',
  stackGap: '8px (spacers 2x), between label, trigger and caption',
  trigger: {
    height: '40px',
    padding: '12px vertical, 16px horizontal (spacers 3x / 4x)',
    gap: '8px (spacers 2x), between text and chevron',
    radius: '8px (radius 3x)',
    border: '1px inside, gray/200',
    typography: 'text-sm/font-normal-input, Proxima Nova Regular 14/16',
    chevron: '18px, gray/500',
  },
  label: {
    height: '20px',
    typography: 'text-sm/font-medium, Proxima Nova Semibold 14/20',
    gap: '8px (spacers 2x), between label and info icon',
    icon: '20px (info)',
  },
  caption: { typography: 'text-xs/font-normal, Proxima Nova Regular 12/18, gray/500' },
  menu: {
    width: 'Same as the trigger (347px)',
    radius: '8px (radius 3x)',
    fill: 'gray/50',
    shadow: 'shadow-lg',
    divider: '1px gray/200 between items',
    search: 'Optional text input at the top, 16px padding, 1px gray/200 divider below',
    items: '2 to 8 items in Figma',
  },
  item: {
    height: '58px',
    padding: '16px (spacers 4x) on every side',
    gap: '8px (spacers 2x)',
    typography: 'text-base/font-normal, Proxima Nova Regular 16/24, #141414',
    hover: 'Fill gray/100',
    icons: '18px (checkbox icon, check icon)',
    swatch: '16px square, 4px radius, alert/500',
    pro: 'Badge: green/100 fill, 4px radius, 8px / 4px padding, text-uppercase/font-medium 12/16 in green/600',
  },
};
