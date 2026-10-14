import { textAreaHTML } from '../components/text-area/text-area.js';
import { TEXT_AREA_STATES, TEXT_AREA_DEFAULTS, TEXT_AREA_SPEC } from '../components/text-area/text-area.spec.js';
import { esc, tile, anchor, specRows, legendItem } from './doc-helpers.js';

// Documentation-only: maps a Figma `state` value to props of the real component plus an optional forced focus.
// Figma shows the same string as placeholder (default, focus, disabled) and as entered text (filing, filled, valid, error).
export function textAreaStateConfig(state, text = TEXT_AREA_DEFAULTS.placeholder) {
  switch (state) {
    case 'focus': return { props: {}, forceFocus: true };
    case 'filing': return { props: { value: text }, forceFocus: true };
    case 'filled': return { props: { value: text } };
    case 'disabled': return { props: { disabled: true } };
    case 'valid': return { props: { value: text, validation: 'valid' } };
    case 'error': return { props: { value: text, validation: 'error' } };
    default: return { props: {} };
  }
}

const forceFocusHTML = (html) => html.replace('<div class="ds-text-area', '<div data-preview-state="focus" class="ds-text-area');

export function textAreaForState(state, extra = {}) {
  const { props, forceFocus } = textAreaStateConfig(state, extra.placeholder);
  const html = textAreaHTML({ ...extra, ...props });
  return forceFocus ? forceFocusHTML(html) : html;
}

const CONFIGURATIONS = [
  { name: 'default', props: {} },
  { name: 'info', props: { info: true } },
  { name: 'show left icon', props: { showLeftIcon: true } },
  { name: 'show right icon', props: { showRightIcon: true } },
  { name: 'both icons', props: { showLeftIcon: true, showRightIcon: true } },
  { name: 'show label off', props: { showLabel: false } },
  { name: 'show footnote off', props: { showFootnote: false } },
];

export function renderOverview() {
  return `<div class="ds-bd-overview ds-bd-overview--input">${CONFIGURATIONS.map(
    ({ name, props }) => `<div class="ds-bd-overview__item">${tile(textAreaHTML(props))}<code>${esc(name)}</code></div>`,
  ).join('')}</div>`;
}

export function renderAnatomy() {
  let html = textAreaHTML({ id: 'anatomy-text-area', info: true, showLeftIcon: true, showRightIcon: true });
  html = anchor(html, 'ds-text-area__label-text', 'top', 1, '40px');
  html = anchor(html, 'ds-text-area__info', 'top', 2, '20px');
  html = anchor(html, 'ds-text-area__field', 'top', 3, 'calc(100% - 60px)');
  html = anchor(html, 'ds-text-area__icon ds-text-area__icon--left', 'left', 4);
  html = anchor(html, 'ds-text-area__value', 'top', 5, '60%');
  html = anchor(html, 'ds-text-area__icon ds-text-area__icon--right', 'right', 6);
  html = anchor(html, 'ds-text-area__footnote', 'bottom', 7, '40px');

  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage ds-bd-input-anatomy">
      <div class="ds-bd-input-anatomy__figure">${html}</div>
    </div>
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Label', 'Optional (<code>show label</code>, <code>label text</code>). Semibold, 14/20, gray/900. Above the field.')}
      ${legendItem(2, 'Info icon', 'Optional (<code>info</code>). 20px, after the label with an 8px gap.')}
      ${legendItem(3, 'Field container', 'Grows with its content from a 40px minimum. 1px inside border, 8px radius, white fill. Padding is 12px vertical and 16px horizontal. The border color changes with the state.')}
      ${legendItem(4, 'Left icon', 'Optional (<code>show left icon</code>, <code>left icon</code>). 16px, aligned to the top of the field content.')}
      ${legendItem(5, 'Placeholder / text', 'Regular, 14/16, aligned to the top. The placeholder (<code>placeholder text</code>) is gray/500, entered text is gray/900.')}
      ${legendItem(6, 'Right icon', 'Optional (<code>show right icon</code>, <code>right icon</code>). 16px, aligned to the top.')}
      ${legendItem(7, 'Footnote', 'Optional (<code>show footnote</code>, <code>footnote_text</code>). Regular, 14/20, below the field. Its color follows the valid and error states.')}
    </ol>
  </div>`;
}

export function renderStates() {
  const cells = TEXT_AREA_STATES.map(
    (state) => `<div class="ds-bd-input-state"><code>state=${state}</code>${tile(textAreaForState(state))}</div>`,
  ).join('');
  return `<div class="ds-bd-input-states">${cells}</div>
    <p class="ds-bd-note">The first five states are interaction states of a native text area: <code>focus</code> and <code>filing</code> are <code>:focus-within</code> (without and with entered text), <code>filled</code> is a text area with a value, and <code>disabled</code> uses the native attribute. <code>valid</code> and <code>error</code> are set through the <code>validation</code> prop. These previews force focus with a documentation-only attribute. Figma also draws a text caret in <code>focus</code> and <code>filing</code>; in the browser it appears while the field is focused.</p>`;
}

export function renderFormatting() {
  const { field, label, footnote } = TEXT_AREA_SPEC;
  const multiline = 'First line of text\nSecond line of text\nThird line of text';
  return `<div class="ds-bd-sizes">
    ${tile(textAreaHTML({ value: multiline, placeholder: '' }))}
    <table class="ds-table">
      <thead><tr><th></th><th>Figma value</th></tr></thead>
      <tbody>
        <tr><th scope="row">Component width</th><td>${esc(TEXT_AREA_SPEC.componentWidth)}</td></tr>
        <tr><th scope="row">Gap between parts</th><td>${esc(TEXT_AREA_SPEC.stackGap)}</td></tr>
        ${specRows('Field', [['Height', field.height], ['Padding', field.padding], ['Alignment', field.alignment], ['Gap', field.gap], ['Radius', field.radius], ['Border', field.border], ['Typography', field.typography], ['Icon size', field.icon]])}
        ${specRows('Label', [['Height', label.height], ['Typography', label.typography], ['Gap', label.gap], ['Info icon', label.icon]])}
        ${specRows('Footnote', [['Typography', footnote.typography]])}
      </tbody>
    </table>
    <p class="ds-bd-note">Figma defines one size and does not specify a row count, a maximum height, a resize handle or a character counter. The field fills the height of the component, and the text starts at the top. In this implementation the field is one line tall by default and grows as lines are added, in browsers that support <code>field-sizing</code>.</p>
  </div>`;
}
