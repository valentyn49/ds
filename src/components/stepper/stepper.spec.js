// Stepper specification copied from the Figma component set "stepper" (Stepper page, node 90:319).
// The Figma component is one step of a multi-step progress indicator.

// The only variant property in Figma is `state`. The names are the Figma ones.
export const STEPPER_STATES = ['filled', 'active', 'next step', 'disabled'];

// Default values of the Figma component properties.
export const STEPPER_DEFAULTS = {
  number: '1',
  title: 'Choose membership plan',
  subtitle: 'Short description',
};

export const STEPPER_SPEC = {
  componentWidth: '265px; the connector fills the space after the text',
  layout: 'Circle, text block and connector in a row, 8px apart (spacers 2x)',
  circle: '32px × 32px, 6px padding, fully rounded, 1.5px inside stroke where the state has one',
  number: 'text-sm/font-medium, Proxima Nova Semibold 14/20, centered in the circle',
  check: '20px check icon in primary/600 (filled state)',
  title: 'text-sm/font-medium, Proxima Nova Semibold 14/20',
  description: 'text-xs/font-normal, Proxima Nova Regular 12/18, #8e8e8e (a library variable, color/text/secondary)',
  connector: '1px line in gray/200, 16px below the top edge (the vertical middle of the circle)',
  alignment: 'The circle and the text start at the top edge; the connector sits at the circle’s middle',
};
