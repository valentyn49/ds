// Paths copied from the SVG export of the Figma components "icon / check_box" and "icon / check_box_cheked" (24 × 24 artboard).
// The checkbox draws them at 20 × 20, as the Figma instances do.
const UNCHECKED =
  'M3.50003 20.5V3.5H20.5V20.5H3.50003ZM5.00001 19H19V4.99998H5.00001V19Z';
const CHECKED =
  'M10.5285 15.8538L17.2516 9.13075L16.1977 8.07693L10.5285 13.7462L7.6785 10.8962L6.62468 11.95L10.5285 15.8538ZM3.42853 20.5V3.5H20.4285V20.5H3.42853Z';

const svg = (name, path) =>
  `<svg class="ds-checkbox__icon ds-checkbox__icon--${name}" viewBox="0 0 24 24" fill="currentColor" focusable="false"><path d="${path}"/></svg>`;

export const checkboxIcons = () => svg('unchecked', UNCHECKED) + svg('checked', CHECKED);
