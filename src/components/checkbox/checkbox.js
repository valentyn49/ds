import './checkbox.css';
import { checkboxIcons } from './icons.js';
import { CHECKBOX_STATES, CHECKBOX_DEFAULTS, STATE_PROPS } from './checkbox.spec.js';

export { CHECKBOX_STATES, CHECKBOX_DEFAULTS, STATE_PROPS };

const escapeHTML = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let uid = 0;

/**
 * Props mirror the Figma component properties:
 *   title -> `title`        showCaption -> `Show Caption`        subtitle -> `subtitle`
 * Figma's `state` maps to native behavior: `selected` is `checked`, `disabled` is the native attribute,
 * and `hover` is the browser's :hover. Figma draws its `disabled` state as a checked box.
 * The input is a native checkbox, so click, label click, Tab and Space work without extra code.
 */
export function checkboxHTML({
  id,
  name,
  value,
  title = CHECKBOX_DEFAULTS.title,
  showCaption = true,
  subtitle = CHECKBOX_DEFAULTS.subtitle,
  checked = false,
  disabled = false,
} = {}) {
  const inputId = id ?? `ds-checkbox-${++uid}`;
  const titleId = `${inputId}-title`;
  const captionId = `${inputId}-caption`;

  const inputAttrs = [
    'class="ds-checkbox__input"',
    `id="${escapeHTML(inputId)}"`,
    'type="checkbox"',
    name ? `name="${escapeHTML(name)}"` : '',
    value !== undefined ? `value="${escapeHTML(value)}"` : '',
    checked ? 'checked' : '',
    disabled ? 'disabled' : '',
    `aria-labelledby="${escapeHTML(titleId)}"`,
    showCaption ? `aria-describedby="${escapeHTML(captionId)}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const caption = showCaption ? `<span class="ds-checkbox__caption" id="${escapeHTML(captionId)}">${escapeHTML(subtitle)}</span>` : '';

  return `<label class="ds-checkbox"><input ${inputAttrs}><span class="ds-checkbox__box" aria-hidden="true">${checkboxIcons()}</span><span class="ds-checkbox__content"><span class="ds-checkbox__title" id="${escapeHTML(titleId)}">${escapeHTML(title)}</span>${caption}</span></label>`;
}

export function createCheckbox(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = checkboxHTML(props);
  return template.content.firstElementChild;
}
