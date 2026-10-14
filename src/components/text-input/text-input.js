import './text-input.css';
import { inputIconSVG, INPUT_ICON_NAMES } from './icons.js';
import { INPUT_STATES, INPUT_VALIDATIONS, INPUT_DEFAULTS } from './text-input.spec.js';

export { INPUT_STATES, INPUT_VALIDATIONS, INPUT_ICON_NAMES, INPUT_DEFAULTS };

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
export function textInputHTML({
  id,
  name,
  value = '',
  label = INPUT_DEFAULTS.label,
  showLabel = true,
  info = false,
  placeholder = INPUT_DEFAULTS.placeholder,
  showLeftIcon = false,
  leftIcon = 'info',
  showRightIcon = false,
  rightIcon = 'info',
  showFootnote = true,
  footnote = INPUT_DEFAULTS.footnote,
  disabled = false,
  validation,
} = {}) {
  const inputId = id ?? `ds-input-${++uid}`;
  const footnoteId = `${inputId}-footnote`;
  const state = INPUT_VALIDATIONS.includes(validation) ? validation : '';

  const rootClass = ['ds-input', disabled ? 'ds-input--disabled' : '', state ? `ds-input--${state}` : ''].filter(Boolean).join(' ');

  const inputAttrs = [
    `class="ds-input__control"`,
    `id="${escapeHTML(inputId)}"`,
    'type="text"',
    name ? `name="${escapeHTML(name)}"` : '',
    `placeholder="${escapeHTML(placeholder)}"`,
    value !== '' ? `value="${escapeHTML(value)}"` : '',
    disabled ? 'disabled' : '',
    state === 'error' ? 'aria-invalid="true"' : '',
    !showLabel ? `aria-label="${escapeHTML(label)}"` : '',
    showFootnote ? `aria-describedby="${escapeHTML(footnoteId)}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const labelRow = showLabel
    ? `<div class="ds-input__label"><label class="ds-input__label-text" for="${escapeHTML(inputId)}">${escapeHTML(label)}</label>${
        info ? `<span class="ds-input__info">${inputIconSVG('info')}</span>` : ''
      }</div>`
    : '';

  const left = showLeftIcon ? `<span class="ds-input__icon ds-input__icon--left">${inputIconSVG(leftIcon)}</span>` : '';
  const right = showRightIcon ? `<span class="ds-input__icon ds-input__icon--right">${inputIconSVG(rightIcon)}</span>` : '';
  const foot = showFootnote ? `<div class="ds-input__footnote" id="${escapeHTML(footnoteId)}">${escapeHTML(footnote)}</div>` : '';

  return `<div class="${rootClass}">${labelRow}<div class="ds-input__field">${left}<span class="ds-input__value"><input ${inputAttrs}></span>${right}</div>${foot}</div>`;
}

export function createTextInput(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = textInputHTML(props);
  const root = template.content.firstElementChild;
  const field = root.querySelector('.ds-input__field');
  const control = root.querySelector('.ds-input__control');
  field.addEventListener('mousedown', (event) => {
    if (event.target !== control && !control.disabled) {
      event.preventDefault();
      control.focus();
    }
  });
  return root;
}
