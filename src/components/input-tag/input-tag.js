import './input-tag.css';
import { inputIconSVG, INPUT_ICON_NAMES } from '../text-input/icons.js';
import { INPUT_TAG_STATES, INPUT_TAG_DEFAULTS } from './input-tag.spec.js';

export { INPUT_TAG_STATES, INPUT_TAG_DEFAULTS, INPUT_ICON_NAMES };

const escapeHTML = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let uid = 0;

/**
 * Props mirror the Figma component properties:
 *   showLabel -> `show label`            label -> `label text`        info -> `info`
 *   placeholder -> `placeholder text`
 *   showLeftIcon -> `show left icon`     leftIcon -> `left icon`
 *   showRightIcon -> `show right icon`   rightIcon -> `right icon`
 *   showDropdown -> `dropdown`
 *   showFootnote -> `show footnote`      footnote -> `footnote_text`
 * `tags` are the badge chips shown inside the field (Figma states `selected` and `finished`).
 * `finished` hides the text entry, as the Figma `finished` state does; the native input stays in the DOM, visually hidden.
 * The chips are display only: Figma draws a close icon on them but defines no removal behavior.
 */
export function inputTagHTML({
  id,
  name,
  value = '',
  label = INPUT_TAG_DEFAULTS.label,
  showLabel = true,
  info = false,
  placeholder = INPUT_TAG_DEFAULTS.placeholder,
  showLeftIcon = true,
  leftIcon = 'info',
  showRightIcon = false,
  rightIcon = 'info',
  showDropdown = false,
  showFootnote = true,
  footnote = INPUT_TAG_DEFAULTS.footnote,
  tags = [],
  finished = false,
} = {}) {
  const inputId = id ?? `ds-input-tag-${++uid}`;
  const footnoteId = `${inputId}-footnote`;

  const rootClass = ['ds-input-tag', tags.length ? 'ds-input-tag--has-tags' : '', finished ? 'ds-input-tag--finished' : ''].filter(Boolean).join(' ');

  const inputAttrs = [
    'class="ds-input-tag__control"',
    `id="${escapeHTML(inputId)}"`,
    'type="text"',
    name ? `name="${escapeHTML(name)}"` : '',
    `placeholder="${escapeHTML(placeholder)}"`,
    value !== '' ? `value="${escapeHTML(value)}"` : '',
    !showLabel ? `aria-label="${escapeHTML(label)}"` : '',
    showFootnote ? `aria-describedby="${escapeHTML(footnoteId)}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const labelRow = showLabel
    ? `<div class="ds-input-tag__label"><label class="ds-input-tag__label-text" for="${escapeHTML(inputId)}">${escapeHTML(label)}</label>${
        info ? `<span class="ds-input-tag__info">${inputIconSVG('info')}</span>` : ''
      }</div>`
    : '';

  const tagHTML = tags
    .map(
      (text) =>
        `<span class="ds-input-tag__tag"><span class="ds-input-tag__tag-text">${escapeHTML(text)}</span><span class="ds-input-tag__tag-close">${inputIconSVG('close')}</span></span>`,
    )
    .join('');

  const left = showLeftIcon ? `<span class="ds-input-tag__icon ds-input-tag__icon--left">${inputIconSVG(leftIcon)}</span>` : '';
  const right = showRightIcon ? `<span class="ds-input-tag__icon ds-input-tag__icon--right">${inputIconSVG(rightIcon)}</span>` : '';
  const dropdown = showDropdown ? `<span class="ds-input-tag__icon ds-input-tag__icon--dropdown">${inputIconSVG('chevron')}</span>` : '';
  const foot = showFootnote ? `<div class="ds-input-tag__footnote" id="${escapeHTML(footnoteId)}">${escapeHTML(footnote)}</div>` : '';

  return `<div class="${rootClass}">${labelRow}<div class="ds-input-tag__field">${left}<span class="ds-input-tag__items">${tagHTML}<span class="ds-input-tag__value"><input ${inputAttrs}></span></span>${right}${dropdown}</div>${foot}</div>`;
}

export function createInputTag(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = inputTagHTML(props);
  const root = template.content.firstElementChild;
  const field = root.querySelector('.ds-input-tag__field');
  const control = root.querySelector('.ds-input-tag__control');
  field.addEventListener('mousedown', (event) => {
    if (event.target !== control) {
      event.preventDefault();
      control.focus();
    }
  });
  return root;
}
