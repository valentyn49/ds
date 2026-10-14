// Documentation-only helpers. They let docs render the hover and focus states without
// user interaction, without adding anything to a component's public API.

export function forceStateEl(element, state) {
  if (state === 'hover' || state === 'focus') element.setAttribute('data-preview-state', state);
  return element;
}

export function forceStateHTML(html, state) {
  return state === 'hover' || state === 'focus' ? html.replace('<button ', `<button data-preview-state="${state}" `) : html;
}

// Figma gives the `menu` type a light label meant for the dark header, so previews of it sit on that surface.
export const isDarkSurface = (variant) => variant === 'menu';
