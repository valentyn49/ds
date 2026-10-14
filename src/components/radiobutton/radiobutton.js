import './radiobutton.css';
import { radioIcons } from './icons.js';
import { RADIO_STATES, RADIO_DEFAULTS, RADIO_STATE_PROPS } from './radiobutton.spec.js';

export { RADIO_STATES, RADIO_DEFAULTS, RADIO_STATE_PROPS };

const escapeHTML = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let uid = 0;

/**
 * Props mirror the Figma component properties:
 *   title -> `title`    showCaption -> `Show Caption`    subtitle -> `subtitle`    badge -> `badge`
 * Figma's `state` maps to native behavior: `selected` is `checked`, `disabled` is the native attribute,
 * and `hover` is the browser's :hover.
 * The input is a native radio. Radios that share the same `name` form one group, so mutually exclusive selection,
 * arrow-key navigation, Tab behavior, label clicks and Space all come from the browser.
 */
export function radiobuttonHTML({
  id,
  name,
  value,
  title = RADIO_DEFAULTS.title,
  showCaption = true,
  subtitle = RADIO_DEFAULTS.subtitle,
  badge = false,
  badgeText = RADIO_DEFAULTS.badgeText,
  checked = false,
  disabled = false,
} = {}) {
  const inputId = id ?? `ds-radiobutton-${++uid}`;
  const titleId = `${inputId}-title`;
  const captionId = `${inputId}-caption`;

  const inputAttrs = [
    'class="ds-radiobutton__input"',
    `id="${escapeHTML(inputId)}"`,
    'type="radio"',
    name ? `name="${escapeHTML(name)}"` : '',
    value !== undefined ? `value="${escapeHTML(value)}"` : '',
    checked ? 'checked' : '',
    disabled ? 'disabled' : '',
    `aria-labelledby="${escapeHTML(titleId)}"`,
    showCaption ? `aria-describedby="${escapeHTML(captionId)}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const badgeHTML = badge ? `<span class="ds-radiobutton__badge">${escapeHTML(badgeText)}</span>` : '';
  const caption = showCaption ? `<span class="ds-radiobutton__caption" id="${escapeHTML(captionId)}">${escapeHTML(subtitle)}</span>` : '';

  return `<label class="ds-radiobutton"><input ${inputAttrs}><span class="ds-radiobutton__control" aria-hidden="true">${radioIcons()}</span><span class="ds-radiobutton__content"><span class="ds-radiobutton__row"><span class="ds-radiobutton__title" id="${escapeHTML(titleId)}">${escapeHTML(title)}</span>${badgeHTML}</span>${caption}</span></label>`;
}

export function createRadiobutton(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = radiobuttonHTML(props);
  return template.content.firstElementChild;
}
