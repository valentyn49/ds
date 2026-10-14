// Input Tag specification copied from the Figma component set "input tag" (Inputs page, node 93:323).
// The chips inside the field are instances of the Figma "badge" component (Badges page).

// The only variant property in Figma is `state` (the first value is capitalised in Figma).
export const INPUT_TAG_STATES = ['Default', 'focus', 'filing', 'selected', 'finished'];

// Default values of the Figma component properties. `show left icon` is on by default.
export const INPUT_TAG_DEFAULTS = {
  label: 'Your email',
  placeholder: 'Au',
  footnote: 'We’ll never share your details. See our Privacy Policy',
  tagText: 'Australia BMK',
};

export const INPUT_TAG_SPEC = {
  componentWidth: '323px (children fill the width)',
  stackGap: '8px (spacers 2x), between label, field and footnote',
  field: {
    height: '40px',
    padding: '12px vertical, 16px horizontal without tags; 8px vertical, 12px horizontal with tags',
    gap: '8px (spacers 2x), between icons, tags and text',
    radius: '8px (radius 3x)',
    border: '1px inside, gray/200 in every state',
    typography: 'text-sm/font-normal-input, Proxima Nova Regular 14/16',
    icon: '16px',
  },
  tag: {
    height: '24px',
    padding: '2px vertical, 8px horizontal',
    gap: '4px (between text and close icon)',
    radius: '4px (radius 2x)',
    fill: 'gray/200',
    typography: 'text-sm/font-medium, Proxima Nova Semibold 14/20, gray/900',
    icon: '16px close icon, gray/900',
  },
  wrapping: 'Tags wrap onto new rows with an 8px gap (Figma component "input tag/state6", outside the variant set).',
  label: {
    height: '20px',
    typography: 'text-sm/font-medium, Proxima Nova Semibold 14/20',
    gap: '8px (spacers 2x), between label and info icon',
    icon: '20px (info)',
  },
  footnote: { typography: 'text-sm/font-normal, Proxima Nova Regular 14/20' },
};
