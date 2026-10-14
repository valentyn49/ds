import './button.css';
import { iconSVG } from '../icons/icon-paths.js';
import { BUTTON_VARIANTS, BUTTON_SIZES, sizesFor } from './button.spec.js';

export { BUTTON_VARIANTS, BUTTON_SIZES, sizesFor };

const escapeHTML = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Props mirror the Figma component properties:
 *   variant       -> `type`
 *   size          -> `size`
 *   text          -> `Text`
 *   showText      -> `show text`
 *   showLeftIcon  -> `Show left icon`      leftIcon  -> `left icon`
 *   showRightIcon -> `Show right icon`     rightIcon -> `right icon`
 * `disabled` is the Figma `state=disabled`. Hover and focus are real browser states.
 */
export function buttonHTML({
  variant = 'primary',
  size = '48',
  text = 'Button',
  showText = true,
  showLeftIcon = false,
  leftIcon = 'search',
  showRightIcon = false,
  rightIcon = 'search',
  disabled = false,
} = {}) {
  const type = BUTTON_VARIANTS.includes(variant) ? variant : 'primary';
  const allowedSizes = sizesFor(type);
  const resolvedSize = allowedSizes.includes(String(size)) ? String(size) : allowedSizes[0];

  const attrs = [
    'type="button"',
    `class="ds-button ds-button--${type} ds-button--${resolvedSize}"`,
    disabled ? 'disabled' : '',
    !showText ? `aria-label="${escapeHTML(text)}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const left = showLeftIcon ? iconSVG(leftIcon, 'ds-button__icon ds-button__icon--left') : '';
  const label = showText ? `<span class="ds-button__label">${escapeHTML(text)}</span>` : '';
  const right = showRightIcon ? iconSVG(rightIcon, 'ds-button__icon ds-button__icon--right') : '';

  return `<button ${attrs}>${left}${label}${right}</button>`;
}

export function createButton(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = buttonHTML(props);
  return template.content.firstElementChild;
}
