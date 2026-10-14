// Text Area specification copied from the Figma component set "text-area" (Inputs page, node 227:108).

// The only variant property in Figma is `state`.
export const TEXT_AREA_STATES = ['default', 'focus', 'filing', 'filled', 'disabled', 'valid', 'error'];

export const TEXT_AREA_VALIDATIONS = ['valid', 'error'];

// Default values of the Figma component properties.
export const TEXT_AREA_DEFAULTS = {
  label: 'Your email',
  placeholder: 'Search for employee profile',
  footnote: 'We’ll never share your details. See our Privacy Policy',
};

export const TEXT_AREA_SPEC = {
  componentWidth: '323px (children fill the width)',
  stackGap: '8px (spacers 2x), between label, field and footnote',
  field: {
    height: 'Fills the component height. Figma instances are 40px and 41px high',
    padding: '12px vertical, 16px horizontal (spacers 3x / 4x)',
    gap: '8px (spacers 2x), between icons and text',
    radius: '8px (radius 3x)',
    border: '1px inside',
    alignment: 'Top (icons and text start at the top edge)',
    typography: 'text-sm/font-normal-input, Proxima Nova Regular 14/16',
    icon: '16px',
  },
  label: {
    height: '20px',
    typography: 'text-sm/font-medium, Proxima Nova Semibold 14/20',
    gap: '8px (spacers 2x), between label and info icon',
    icon: '20px (info)',
  },
  footnote: { typography: 'text-sm/font-normal, Proxima Nova Regular 14/20' },
};
