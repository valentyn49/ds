// Values read from the Figma "Nav Tabs" page ([AEGL AUG] Design Library, node 329:322).
// Three tab bars exist: `tab` (made of `tab-item`), `General tab` (made of `menu item`) and `Small tab`
// (made of `small menu item`, with a light and a dark mode). None of them has a size property.

export const TABS_TYPES = ['tab', 'General tab', 'Small tab'];
export const SMALL_TAB_MODES = ['light', 'dark'];

export const TYPE_SLUG = { tab: 'tab', 'General tab': 'general-tab', 'Small tab': 'small-tab' };

// Figma component that makes up one tab, and the name of its state property values.
export const ITEM_COMPONENT = { tab: 'tab-item', 'General tab': 'menu item', 'Small tab': 'small menu item' };
export const ITEM_STATE_PROPERTY = { tab: 'type', 'General tab': 'state', 'Small tab': 'state' };
export const ITEM_STATES = {
  tab: ['selected', 'default', 'hover', 'pressed'],
  'General tab': ['selected', 'default', 'disabled', 'hover', 'pressed'],
  'Small tab': ['active', 'default', 'disabled', 'hover', 'Pressed'],
};

// How many tabs the Figma component can show (each extra tab is a boolean property on the bar).
export const ITEM_COUNT = {
  tab: { min: 2, max: 14, default: 10 },
  'General tab': { min: 2, max: 11, default: 10 },
  'Small tab': { min: 2, max: 6, default: 6 },
};

// Sample text used in Figma for each type.
export const FIGMA_LABEL = { tab: 'Bonds', 'General tab': 'General overview', 'Small tab': 'Table view' };

export const PRO_LABEL = 'Upgrade';

export const TABS_DEFAULTS = {
  type: 'tab',
  mode: 'light',
  ariaLabel: 'Tabs',
};

export const TABS_SPEC = {
  tab: {
    container: 'Hugs its tabs, gap 0, no padding, no fill. 560 x 28 in Figma with 10 tabs.',
    item: 'Hugs its label: 8px left and right, 0 top, 8px bottom. 28px high.',
    divider: 'Each tab draws its own 1px bottom line, inside the tab (gray/200; primary/600 when selected). There is no separate divider line.',
    label: 'text-sm/font-medium: Proxima Nova Semibold, 14/20',
    icon: 'Optional right icon (plus) 20px, 4px after the label, same color as the label',
    radius: 'none',
  },
  'General tab': {
    container: 'Hugs its tabs, gap 8, padding 4, fill gray/50, radius 8. 1500 x 58 with 10 tabs.',
    item: 'Hugs its content: 12px top and bottom, 16px left and right, radius 8. 50px high.',
    divider: 'Optional vertical divider 1 x 32, gray/400 (two dividers can be switched on).',
    label: 'text-sm/font-medium: Proxima Nova Semibold, 14/20; the label sits in a wrapper with 3px top and bottom padding',
    icon: 'Optional icon (info) 16px, before the label, 4px gap, same color as the label',
    badge: 'Optional "pro" badge with the text "Upgrade": 72 x 24, padding 4/8, radius 4, fill green/100, text-uppercase/font-medium 12/16 in green/600, 4px after the label',
    radius: '8',
  },
  'Small tab': {
    container: 'Hugs its tabs, gap 4, padding 4, radius 8, fill background/900 (light) or secondary/800 (dark). 466 x 40 with 6 tabs.',
    item: 'Hugs its content: 7px top and bottom, 8px left and right, radius 8. 32px high.',
    divider: 'none',
    label: 'text-xs/font-medium: Proxima Nova Semibold, 12/18',
    icon: 'Optional icon (condensed) 16px, before the label, 4px gap',
    radius: '8',
  },
};

// Colors per tab state, in the Figma token names. `text` also colors the optional icon.
export const STATE_TOKENS = {
  tab: {
    selected: { text: 'primary/600', line: 'primary/600' },
    default: { text: 'gray/600', line: 'gray/200' },
    hover: { text: 'gray/900', line: 'gray/200' },
    pressed: { text: 'gray/900', line: 'gray/200' },
  },
  'General tab': {
    selected: { text: 'gray/900', fill: 'background/900', line: 'gray/900 (1px)' },
    default: { text: 'gray/500' },
    disabled: { text: 'gray/200' },
    hover: { text: 'gray/600' },
    pressed: { text: 'gray/600' },
  },
  'Small tab': {
    light: {
      active: { text: 'gray/50', fill: 'primary/600' },
      default: { text: 'gray/500' },
      disabled: { text: 'gray/200' },
      hover: { text: 'gray/400' },
      Pressed: { text: 'gray/600' },
    },
    dark: {
      active: { text: 'gray/50', fill: 'primary/600' },
      default: { text: 'gray/50' },
      disabled: { text: 'gray/400' },
      hover: { text: 'gray/200' },
      Pressed: { text: 'gray/200' },
    },
  },
};
