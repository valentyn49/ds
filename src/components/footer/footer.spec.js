// Footer specification copied from the Figma component set "footer" (Footer page, node 951:11353).
// Variants: size (big | small), resolution (desktop | tablet | mobile), type (standart | enterprise).
// `resolution` is handled with container queries in the CSS, so it is not a prop of the component.

export const FOOTER_SIZES = ['big', 'small'];
export const FOOTER_TYPES = ['standart', 'enterprise'];
export const FOOTER_RESOLUTIONS = ['desktop', 'tablet', 'mobile'];

// Mandatory horizontal content margins (project requirement; they replace the paddings drawn in the Figma variants).
export const FOOTER_MARGINS = { desktop: 80, tablet: 40, mobile: 40 };

// Container widths where each layout starts. The Footer variants do not state thresholds. These come from the
// size ranges on the Figma Headers page (0-576, 577-768, 769-992, 993-1200, 1201-1400, 1400+): mobile up to 576,
// tablet 577-992, desktop from 993. Keep them in sync with the @container rules in footer.css.
export const FOOTER_BREAKPOINTS = { tabletMin: 577, desktopMin: 993 };

// Frame widths of the Figma variants, used for the documentation previews.
export const FOOTER_FRAME_WIDTHS = {
  big: { desktop: 1440, tablet: 744, mobile: 392 },
  small: { desktop: 1440, tablet: 744, mobile: 375 },
};

export const FOOTER_FIGMA_PADDING = {
  big: { desktop: '130px', tablet: '24px', mobile: '16px' },
  small: { desktop: '8px', tablet: '8px', mobile: '16px' },
};

export const FOOTER_SPEC = {
  surface: 'Fill color/header/background (secondary/900), full width of the page',
  verticalPadding: 'Top 40px (desktop, tablet) or 24px (mobile); bottom 16px',
  sectionGap: '64px between the main block and the legal bar',
  desktopLayout: 'Row: about block, then three link columns of 156px with a 32px gap; 64px between them',
  tabletLayout: 'Column, 64px gap: about block, then three equal link columns with a 32px gap; legal bar stacked with a 16px gap',
  mobileLayout: 'Column, 40px gap: about block, then three equal link columns with a 24px gap; legal bar stacked with a 16px gap',
  brand: 'Socrates logo, 162px × 32px; Enterprise adds a 72px × 26px white tag with 8px radius',
  aboutGap: '24px between the logo and the text, 16px between the two text blocks',
  text: 'text-xs/font-normal, Proxima Nova Regular 12/18, gray/50; "Important Note" is Semibold',
  heading: 'text-sm/font-medium, Proxima Nova Semibold 14/20, gray/50',
  link: 'text-sm/font-normal, Proxima Nova Regular 14/20, gray/300',
  linkGaps: '12px between a group heading and its links, 8px between links, 24px between standalone items',
  legalCopyright: 'text-xs/font-normal 12/18, gray/200',
  legalLinks: 'text-xs/font-normal 12/18, gray/300, 24px between links',
  divider: '1px line in secondary/800, 17px above the legal bar',
  small: 'One line of text-sm/font-normal 14/20 in gray/500, centered, 16px vertical padding, no fill',
};
