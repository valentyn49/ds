// Checkbox specification copied from the Figma component set "checkbox" (Checkbox page, node 60:918).

// The only variant property in Figma is `state`.
export const CHECKBOX_STATES = ['default', 'hover', 'selected', 'disabled'];

// Default values of the Figma component properties (Figma's default text has a trailing space).
export const CHECKBOX_DEFAULTS = {
  title: 'Unchecked and label',
  subtitle: 'Unchecked and label',
};

// How each Figma state maps to the component: `selected` is a checked box, and Figma draws `disabled` as a checked box.
export const STATE_PROPS = {
  default: { checked: false },
  hover: { checked: false },
  selected: { checked: true },
  disabled: { checked: true, disabled: true },
};

export const CHECKBOX_SPEC = {
  componentWidth: '180px, text column 152px (wraps)',
  icon: '20px × 20px (the drawn box is 14.17px, inset 2.9px)',
  gapToContent: '8px (spacers 2x)',
  gapInContent: '2px, between title and caption',
  alignment: 'Top (icon and text start at the top edge)',
  title: 'text-sm/font-normal, Proxima Nova Regular 14/20, gray/900',
  caption: 'text-xs/font-normal, Proxima Nova Regular 12/18, gray/500',
};
