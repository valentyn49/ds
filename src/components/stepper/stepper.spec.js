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
  alignment: 'The circle starts at the top edge. The text block is as tall as the step and centered vertically: with the description it fills the 38px height, without it the 20px title lines up with the middle of the 32px circle. The connector sits at the circle’s middle',
  text: 'Title and description are on one line each (no wrapping) and are cut with an ellipsis when they do not fit',
};
