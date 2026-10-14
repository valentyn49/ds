// Accordion specification copied from the Figma component set "collapse" (Accordion page, node 222:946).
// Figma defines one standalone item with the variant `type=default` and two states. It does not define a group.

export const ACCORDION_STATES = ['closed', 'open'];

// Default values of the Figma component properties.
export const ACCORDION_DEFAULTS = {
  title: 'Do changes to my membership (upgrade/downgrade) affect my billing cycle?',
  content: 'Sample content for demonstration only. It is not part of the component specification.',
  subtitle: 'Subtitle',
  linkText: 'Link',
  buttonText: 'Button',
};

export const ACCORDION_SPEC = {
  componentWidth: '879px in Figma; the item fills the width of its container',
  card: 'White fill, 8px radius (radius 3x), effect style shadow, no border',
  padding: '16px (spacers 4x) on every side',
  headerHeight: '56px when closed (16px + 24px icon + 16px)',
  headerGap: '16px (spacers 4x), between left icon, text, button and chevron',
  headerAlignment: 'Vertically centered',
  title: 'text-sm/font-medium, Proxima Nova Semibold 14/20, gray/900',
  subtitle: 'text-sm/font-normal, Proxima Nova Regular 14/20, gray/500 (truncates)',
  link: 'text-xs/font-medium, Proxima Nova Semibold 12/18, primary/600, underlined, 8px after the title',
  icons: '24px, gray/900 (left icon is the radio icon; the chevron points down when closed and up when open)',
  button: 'The primary Button at size 36',
  content: 'text-sm/font-normal, Proxima Nova Regular 14/20, gray/700. Starts 16px below the header text',
  openGap: '24px between the content and anything after it in the open item',
};
