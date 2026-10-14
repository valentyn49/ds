// Header specification copied from the Figma component set "Header" (Headers page, node 39:1242).
// Variants: size (desktop | tablet | mobile), platform (standart | enterprise),
// type (log out | yes | registration | first purchase). Property `warning` (boolean) shows a warning mark on the profile icon.
// `size` is handled with container queries in the CSS, so it is not a prop of the component.

export const HEADER_PLATFORMS = ['standart', 'enterprise'];
// The Figma names, kept exactly. In the Figma set `registration` is the logo-only header and `log out` is the logged-out one.
export const HEADER_TYPES = ['yes', 'first purchase', 'registration', 'log out'];
export const HEADER_RESOLUTIONS = ['desktop', 'tablet', 'mobile'];

// Mandatory horizontal content margins (project requirement; they replace the paddings drawn in the Figma variants).
export const HEADER_MARGINS = { desktop: 80, tablet: 40, mobile: 40 };

// Ranges from the Figma Headers page (0-576, 577-768, 769-992, 993-1200, 1201-1400, 1400+): the mobile header is used up to
// 576px, the tablet header from 577px to 1200px and the desktop header from 1201px.
export const HEADER_BREAKPOINTS = { tabletMin: 577, desktopMin: 1201 };

// With the mandatory 80px margins the desktop content needs more room than Figma's 24px padding. Below these widths the
// desktop header would not fit, so the tablet layout is kept until it does (values measured from the Figma content
// widths: logo, menu items, search and profile, with 16px minimum gaps, plus 2 × 80px).
export const HEADER_DESKTOP_FIT = { standart: 1250, enterprise: 1442 };

// Frame widths of the Figma variants, used for the documentation previews.
export const HEADER_FRAME_WIDTHS = { desktop: 1440, tablet: 744, mobile: 375 };

export const HEADER_FIGMA_PADDING = { desktop: '24px', tablet: '24px', mobile: '16px' };

export const HEADER_SPEC = {
  surface: 'Fill color/header/background (secondary/900), full width of the page',
  padding: 'Top and bottom 16px (desktop, tablet, mobile)',
  heights: 'Follows the content: 72px (desktop and tablet "yes", because of the 40px search field), 64px (other types), 56px (mobile)',
  logo: 'Socrates logo 162px × 32px (124px × 24px on mobile); Enterprise adds a tag (241px × 32px in total)',
  gaps: 'Logo to menu 72px, menu items 16px apart, search to cart to profile 32px apart',
  menuItem: 'text-sm/font-medium, Proxima Nova Semibold 14/20, color/header/text (gray/50), 28px high; 20px chevron 4px after the text',
  actions: 'Search field 180px × 40px, cart icon 28px (24px on mobile), profile icon 29px, menu icon 24px',
  counter: '18px circle in color/header/pin_background (primary/700), count in color/header/pin_text, text-xs/font-bold',
  warning: '18px white circle with the 22px warning_circle icon in orange/500',
  panel: 'White fill, radius 4px (8px for profile and cart), shadow-lg, 240px wide (cart 301px), 12px notch at the top',
  panelItem: '14px regular text in gray/900, 16px horizontal and 12px vertical padding, 1px gray/200 dividers; 24px chevron where the item has a submenu',
  drawer: '300px wide white panel with "Menu" (Semibold 16/24) and a close icon; rows 44-48px high with 16px / 12px padding and 1px gray/200 dividers',
  overlay: 'Desktop panels: backdrop blur 20 over the page below the header. Drawer: gray/900 at 60%',
};
