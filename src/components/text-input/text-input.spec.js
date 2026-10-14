// Text Input specification copied from the Figma component set "input" (Inputs page, node 60:1649).

// The only variant property in Figma is `state`.
export const INPUT_STATES = ['default', 'focus', 'filing', 'filled', 'disabled', 'valid', 'error'];

export const INPUT_VALIDATIONS = ['valid', 'error'];

// Default values of the Figma component properties.
export const INPUT_DEFAULTS = {
  label: 'Your email',
  placeholder: 'Search for employee profile',
  footnote: 'We’ll never share your details. See our Privacy Policy',
};

// Metrics of the single size defined in Figma.
export const INPUT_SPEC = {
  componentWidth: '323px (children fill the width)',
  stackGap: '8px (spacers 2x), between label, field and footnote',
  field: {
    height: '40px',
    padding: '12px vertical, 16px horizontal (spacers 3x / 4x)',
    gap: '8px (spacers 2x), between icons and text',
    radius: '8px (radius 3x)',
    border: '1px inside',
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
