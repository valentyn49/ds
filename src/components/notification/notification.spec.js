// Messages (Banners) specification copied from the Figma component set "notification" (Messages page, node 81:152).
// Variant properties: type (home | default) and state (alert | white | gray | info | success | warning).
// Boolean/text properties: show icon, close, Text, show button.

export const NOTIFICATION_TYPES = ['home', 'default'];
// The Figma order; the Figma spec sheet lists them as warning, success, info, alert, gray, white.
export const NOTIFICATION_STATES = ['warning', 'success', 'info', 'alert', 'gray', 'white'];

export const NOTIFICATION_DEFAULTS = {
  text: 'Payment failed. Please check details and try again. If issue persists, contact support. Thanks.',
  buttonText: 'Button',
};

// Icon used by each state in Figma ("icon / <name>").
export const STATE_ICONS = { warning: 'warning', success: 'check_filled', info: 'info', alert: 'report', gray: 'info', white: 'info' };

// Fill, border and icon color per variant, as tokens (read from Figma).
export const VARIANT_TOKENS = {
  home: {
    warning: { fill: 'orange/100', stroke: '-', icon: 'orange/500' },
    success: { fill: 'green/100', stroke: '-', icon: 'green/600' },
    info: { fill: 'primary/100', stroke: '-', icon: 'primary/700' },
    alert: { fill: 'alert/200', stroke: '-', icon: 'alert/600' },
    gray: { fill: 'gray/100', stroke: '-', icon: 'gray/600' },
    white: { fill: 'gray/50', stroke: '-', icon: 'gray/600' },
  },
  default: {
    warning: { fill: 'orange/100', stroke: 'orange/500', icon: 'orange/500' },
    success: { fill: 'green/100', stroke: 'green/600', icon: 'green/600' },
    info: { fill: 'primary/100', stroke: 'primary/700', icon: 'primary/600' },
    alert: { fill: 'alert/100', stroke: 'alert/600', icon: 'alert/600' },
    gray: { fill: 'gray/100', stroke: '-', icon: 'gray/600' },
    white: { fill: 'gray/50', stroke: '-', icon: 'gray/600' },
  },
};

export const NOTIFICATION_SPEC = {
  width: '820px in Figma; the banner fills the width of its container and the text wraps',
  padding: '12px (spacers 3x) on every side',
  rowGap: '8px (spacers 2x), between icon, text, button and close',
  height: '44px for a single line (12px + 20px + 12px); it grows when the text wraps',
  alignment: 'Top: icon, text, button and close start at the top edge',
  radius: 'type=default: 12px (radius 4x). type=home: 0',
  border: 'type=default: 1px inside, in the state color (none for gray and white). type=home: none',
  icon: '20px, in the state icon color',
  text: 'text-sm/font-normal, Proxima Nova Regular 14/20, gray/900',
  button: 'The text Button at size 36 (Button/type=text), 43px × 20px, placed before the close control',
  close: '20px close icon in gray/700',
};
