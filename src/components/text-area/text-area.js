import './text-area.css';
import { inputIconSVG, INPUT_ICON_NAMES } from '../text-input/icons.js';
import { TEXT_AREA_STATES, TEXT_AREA_VALIDATIONS, TEXT_AREA_DEFAULTS } from './text-area.spec.js';

export { TEXT_AREA_STATES, TEXT_AREA_VALIDATIONS, TEXT_AREA_DEFAULTS, INPUT_ICON_NAMES };

const escapeHTML = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let uid = 0;

/**
 * Props mirror the Figma component properties:
 *   showLabel -> `show label`            label -> `label text`        info -> `info`
 *   placeholder -> `placeholder text`
 *   showLeftIcon -> `show left icon`     leftIcon -> `left icon`
 *   showRightIcon -> `show right icon`   rightIcon -> `right icon`
 *   showFootnote -> `show footnote`      footnote -> `footnote_text`
 * Figma states map to native behavior: `focus` and `filing` are :focus-within, `filled` is a non-empty value,
 * `disabled` is the native attribute. `validation` ('valid' | 'error') is the Figma `valid` and `error` states.
 */
export function textAreaHTML({
  id,
  name,
  value = '',
  label = TEXT_AREA_DEFAULTS.label,
  showLabel = true,
  info = false,
  placeholder = TEXT_AREA_DEFAULTS.placeholder,
  showLeftIcon = false,
  leftIcon = 'info',
  showRightIcon = false,
  rightIcon = 'info',
  showFootnote = true,
  footnote = TEXT_AREA_DEFAULTS.footnote,
  disabled = false,
  validation,
} = {}) {
  const fieldId = id ?? `ds-text-area-${++uid}`;
  const footnoteId = `${fieldId}-footnote`;
  const state = TEXT_AREA_VALIDATIONS.includes(validation) ? validation : '';

  const rootClass = ['ds-text-area', disabled ? 'ds-text-area--disabled' : '', state ? `ds-text-area--${state}` : ''].filter(Boolean).join(' ');

  const attrs = [
    'class="ds-text-area__control"',
    `id="${escapeHTML(fieldId)}"`,
    'rows="1"',
    name ? `name="${escapeHTML(name)}"` : '',
    `placeholder="${escapeHTML(placeholder)}"`,
    disabled ? 'disabled' : '',
    state === 'error' ? 'aria-invalid="true"' : '',
    !showLabel ? `aria-label="${escapeHTML(label)}"` : '',
    showFootnote ? `aria-describedby="${escapeHTML(footnoteId)}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const labelRow = showLabel
    ? `<div class="ds-text-area__label"><label class="ds-text-area__label-text" for="${escapeHTML(fieldId)}">${escapeHTML(label)}</label>${
        info ? `<span class="ds-text-area__info">${inputIconSVG('info')}</span>` : ''
      }</div>`
    : '';

  const left = showLeftIcon ? `<span class="ds-text-area__icon ds-text-area__icon--left">${inputIconSVG(leftIcon)}</span>` : '';
  const right = showRightIcon ? `<span class="ds-text-area__icon ds-text-area__icon--right">${inputIconSVG(rightIcon)}</span>` : '';
  const foot = showFootnote ? `<div class="ds-text-area__footnote" id="${escapeHTML(footnoteId)}">${escapeHTML(footnote)}</div>` : '';

  return `<div class="${rootClass}">${labelRow}<div class="ds-text-area__field">${left}<span class="ds-text-area__value"><textarea ${attrs}>${escapeHTML(value)}</textarea></span>${right}</div>${foot}</div>`;
}

export function createTextArea(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = textAreaHTML(props);
  const root = template.content.firstElementChild;
  const field = root.querySelector('.ds-text-area__field');
  const control = root.querySelector('.ds-text-area__control');
  field.addEventListener('mousedown', (event) => {
    if (event.target !== control && !control.disabled) {
      event.preventDefault();
      control.focus();
    }
  });
  return root;
}
