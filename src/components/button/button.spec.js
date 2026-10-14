// Button specification copied from the Figma component set "Button" (Buttons page, node 35:155).
// Property names and values are the Figma ones.

export const BUTTON_STATES = ['default', 'hover', 'focus', 'disabled'];
export const BUTTON_SIZES = ['48', '36'];

// `type` variant values, in the order Figma lists them. `sheetLabel` is the row label used on the Figma spec sheet when it differs.
export const BUTTON_TYPES = [
  { type: 'primary', sizes: ['48', '36'] },
  { type: 'secondary', sizes: ['48', '36'] },
  { type: 'purchase', sizes: ['48', '36'] },
  { type: 'white', sizes: ['48', '36'], sheetLabel: 'neutral' },
  { type: 'text', sizes: ['48', '36'], sheetLabel: 'link' },
  { type: 'Stroke', sizes: ['36'], sheetLabel: 'stroke' },
  { type: 'menu', sizes: ['36'] },
  { type: 'cancel', sizes: ['48', '36'] },
  { type: 'purchase_secondary', sizes: ['48', '36'], sheetLabel: 'purchase_sec' },
  { type: 'neutral_summary', sizes: ['48', '36'] },
  { type: 'neutral_detailed', sizes: ['48', '36'] },
  { type: 'neutral_premium', sizes: ['48', '36'] },
];

export const BUTTON_VARIANTS = BUTTON_TYPES.map((t) => t.type);

export const sizesFor = (type) => BUTTON_TYPES.find((t) => t.type === type)?.sizes ?? BUTTON_SIZES;

// Box metrics per size. Values are Figma auto-layout settings; tokens are the matching Figma variables.
export const SIZE_SPECS = {
  48: {
    height: '48px',
    padding: '12px 20px',
    paddingTokens: 'spacers 3x / 5x',
    gap: '8px (spacers 2x)',
    radius: '8px (radius 3x)',
    typography: 'text-base/font-bold, Proxima Nova Bold 16/24',
    icon: '24px',
  },
  36: {
    height: '36px',
    padding: '8px 16px',
    paddingTokens: 'spacers 2x / 4x',
    gap: '8px (spacers 2x)',
    radius: '8px (radius 3x)',
    typography: 'text-sm/font-bold, Proxima Nova Bold 14/20',
    icon: '20px',
  },
};

// Types that deviate from the size specs above.
export const TYPE_EXCEPTIONS = {
  Stroke: {
    height: '40px',
    padding: '12px',
    typography: 'text-sm/font-normal-input, Proxima Nova Regular 14/16',
    icon: '16px',
    note: 'Named size 36 in Figma, but 40px high.',
  },
  text: { height: 'hugs content (24px at 48, 20px at 36)', padding: '0', note: 'No container fill or padding.' },
  cancel: { height: 'hugs content (24px at 48, 20px at 36)', padding: '0', note: 'No container fill or padding.' },
  menu: {
    height: 'hugs content (20px without icons)',
    padding: '0',
    typography: 'text-sm/font-medium, Proxima Nova Semibold 14/20',
    icon: '24px left, 20px right',
    note: 'No container fill or padding. Only exists at size 36.',
  },
};
