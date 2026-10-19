// Popup specification copied from the Figma Popup page (node 108:191, section 329:506) and the Behaviour section (node 1230:17658).
// Header component set "modal": size (desktop | mobile) x type (default | successfully | negative).
// The backdrop is the component "blur". The popup layout frames "480" and "600" set the desktop widths.
// `size` is handled with container queries in the CSS, so it is not a prop of the component.

export const POPUP_TYPES = ['default', 'successfully', 'negative'];
export const POPUP_WIDTHS = ['600', '480'];

// Same container widths as the Header and Footer: mobile up to 576, tablet 577-992, desktop from 993.
// Keep them in sync with the @container rules in popup.css.
export const POPUP_BREAKPOINTS = { tabletMin: 577, desktopMin: 993 };

// Frame sizes of the Behaviour examples, used for the documentation previews.
export const POPUP_FRAMES = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 744, height: 900 },
  mobile: { width: 375, height: 812 },
};
export const POPUP_RESOLUTIONS = ['desktop', 'tablet', 'mobile'];

export const POPUP_DEFAULTS = {
  title: 'Premium subscription required',
  subtitle: 'Prioritize using drag-and-drop the sequence in which you want to see widgets on the main page.',
  body: 'Upgrade to Premium subscription to unlock Arrays and Reversals. Would you like to upgrade to Premium now?',
  primaryLabel: 'Yes',
  cancelLabel: 'Cancel',
};

// Backdrop opacity as drawn in Figma (component "blur": gray/900 at 60%).
export const POPUP_BACKDROP = 'gray/900 at 60% opacity, no blur effect';

export const POPUP_SPEC = {
  desktop: {
    width: '600px (Behaviour examples and the 600 frame) or 480px (the 480 frame), centered horizontally',
    placement: 'Top of the viewport: 80px from the top. When the content is too tall the popup moves to 40px from the top and stops 40px above the bottom (820px high in a 900px frame).',
    surface: 'gray/50 fill, 12px radius, no border and no shadow',
    header: 'Padding 24px 20px 0; title and close control on one row, 24px apart, centered vertically',
    title: 'text-xl/font-bold, Proxima Nova Bold 20/30, gray/900',
    subtitle: 'text-sm/font-normal, Proxima Nova Regular 14/20, gray/600, directly under the title',
    body: 'Padding 0 20px; text-sm/font-normal, Proxima Nova Regular 14/20, gray/900',
    footer: 'Padding 24px 20px, actions aligned to the right, 32px between Cancel and the primary action',
    gaps: '24px between header and body, 24px between body and footer',
  },
  sheet: {
    width: 'Tablet: 604px (70px each side of a 744px frame). Mobile: 343px (16px each side of a 375px frame)',
    placement: 'Bottom of the viewport, flush with the bottom edge. When the content is too tall the sheet stops 16px below the top.',
    surface: 'gray/50 fill, 12px radius on the top corners only, 0 on the bottom corners',
    header: 'Padding 16px 16px 0; title and close control on one row, centered vertically',
    title: 'text-base/font-bold, Proxima Nova Bold 16/24, gray/900',
    subtitle: 'text-xs/font-normal, Proxima Nova Regular 12/18, gray/600, 8px under the title',
    body: 'Padding 0 16px; text-sm/font-normal, Proxima Nova Regular 14/20, gray/900',
    footer: 'Padding 16px; one primary action that fills the width. Shadow-2xl.',
    gaps: '16px between header and body, 24px between body and footer',
  },
  close: 'button-icon-only: 40px circle (20px icon + 10px padding), gray/100 fill, 1px gray/200 border, 160px radius, icon in gray/500',
  scrolling: {
    header: 'Bottom padding 8px and shadow-lg, so the content scrolls under it; no gap below',
    footer: 'Top padding 16px (desktop) and shadow-2xl; no gap above',
  },
  statusHeader: {
    desktop: 'Column, centered, 32px gap; top padding 72px; 154px x 120px illustration; title and subtitle centered, 12px apart, 400px wide; close control at 20px from the top and right',
    sheet: 'Column, centered, 16px gap; top padding 32px; same illustration; title and subtitle centered, 4px apart; close control at 16px from the top and right',
  },
};
