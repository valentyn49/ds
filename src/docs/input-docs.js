import { textInputHTML } from '../components/text-input/text-input.js';
import { INPUT_STATES, INPUT_DEFAULTS, INPUT_SPEC } from '../components/text-input/text-input.spec.js';

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Documentation-only: maps a Figma `state` value to props of the real component plus an optional forced focus.
// Figma shows the same string as placeholder (default, focus, disabled) and as entered text (filing, filled, valid, error).
export function stateConfig(state, text = INPUT_DEFAULTS.placeholder) {
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

const forceFocusHTML = (html) => html.replace('<div class="ds-input', '<div data-preview-state="focus" class="ds-input');

export function inputForState(state, extra = {}) {
  const { props, forceFocus } = stateConfig(state, extra.placeholder);
  const html = textInputHTML({ ...extra, ...props });
  return forceFocus ? forceFocusHTML(html) : html;
}

const tile = (inner, className = '') => `<div class="ds-bd-tile ds-bd-tile--start ${className}"><div class="ds-bd-input-box">${inner}</div></div>`;

const CONFIGURATIONS = [
  { name: 'default', note: 'All defaults: label, placeholder and footnote.', props: {} },
  { name: 'info', note: 'Figma property: info. Shows the 20px info icon after the label.', props: { info: true } },
  { name: 'show left icon', note: 'Figma properties: show left icon, left icon.', props: { showLeftIcon: true } },
  { name: 'show right icon', note: 'Figma properties: show right icon, right icon.', props: { showRightIcon: true } },
  { name: 'both icons', note: 'Left and right icons together.', props: { showLeftIcon: true, showRightIcon: true } },
  { name: 'show label off', note: 'Figma property: show label.', props: { showLabel: false } },
  { name: 'show footnote off', note: 'Figma property: show footnote.', props: { showFootnote: false } },
];

export function renderOverview() {
  const items = CONFIGURATIONS.map(
    ({ name, props }) => `<div class="ds-bd-overview__item">${tile(textInputHTML(props))}<code>${esc(name)}</code></div>`,
  ).join('');
  return `<div class="ds-bd-overview ds-bd-overview--input">${items}</div>`;
}

export function renderAnatomy() {
  const anchor = (html, cls, dir, n, ax = '') =>
    html.replace(`class="${cls}"`, `class="${cls} ds-bd-anchor ds-bd-anchor--${dir}" data-n="${n}"${ax ? ` style="--ax:${ax}"` : ''}`);

  let html = textInputHTML({ id: 'anatomy-input', info: true, showLeftIcon: true, showRightIcon: true });
  html = anchor(html, 'ds-input__label-text', 'top', 1, '40px');
  html = anchor(html, 'ds-input__info', 'top', 2, '20px');
  html = anchor(html, 'ds-input__field', 'top', 3, 'calc(100% - 60px)');
  html = anchor(html, 'ds-input__icon ds-input__icon--left', 'left', 4);
  html = anchor(html, 'ds-input__value', 'top', 5, '60%');
  html = anchor(html, 'ds-input__icon ds-input__icon--right', 'right', 6);
  html = anchor(html, 'ds-input__footnote', 'bottom', 7, '40px');

  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage ds-bd-input-anatomy">
      <div class="ds-bd-input-anatomy__figure">${html}</div>
    </div>
    <ol class="ds-bd-anatomy__legend">
      <li><b>1</b><div><strong>Label</strong><span>Optional (<code>show label</code>, <code>label text</code>). Semibold, 14/20, gray/900. Above the field.</span></div></li>
      <li><b>2</b><div><strong>Info icon</strong><span>Optional (<code>info</code>). 20px, after the label with an 8px gap.</span></div></li>
      <li><b>3</b><div><strong>Field container</strong><span>40px high, 1px inside border, 8px radius, white fill. Padding is 12px vertical and 16px horizontal. The border color changes with the state.</span></div></li>
      <li><b>4</b><div><strong>Left icon</strong><span>Optional (<code>show left icon</code>, <code>left icon</code>). 16px, before the text.</span></div></li>
      <li><b>5</b><div><strong>Placeholder / value</strong><span>Regular, 14/16. The placeholder (<code>placeholder text</code>) is gray/500, entered text is gray/900.</span></div></li>
      <li><b>6</b><div><strong>Right icon</strong><span>Optional (<code>show right icon</code>, <code>right icon</code>). 16px, after the text.</span></div></li>
      <li><b>7</b><div><strong>Footnote</strong><span>Optional (<code>show footnote</code>, <code>footnote_text</code>). Regular, 14/20, below the field. Its color follows the valid and error states.</span></div></li>
    </ol>
  </div>`;
}

export function renderVariants() {
  return `<div class="ds-bd-variants">${CONFIGURATIONS.map(
    ({ name, note, props }) => `<section class="ds-bd-variant">
      <header><code class="ds-bd-variant__name">${esc(name)}</code></header>
      <p>${esc(note)}</p>
      ${tile(textInputHTML(props))}
    </section>`,
  ).join('')}</div>`;
}

export function renderSizes() {
  const rows = (group, items) =>
    items.map(([label, value]) => `<tr><th scope="row">${group} · ${label}</th><td>${esc(value)}</td></tr>`).join('');
  const { field, label, footnote } = INPUT_SPEC;
  return `<div class="ds-bd-sizes">
    ${tile(textInputHTML({ info: true, showLeftIcon: true, showRightIcon: true }))}
    <table class="ds-table">
      <thead><tr><th></th><th>Figma value</th></tr></thead>
      <tbody>
        <tr><th scope="row">Component width</th><td>${esc(INPUT_SPEC.componentWidth)}</td></tr>
        <tr><th scope="row">Gap between parts</th><td>${esc(INPUT_SPEC.stackGap)}</td></tr>
        ${rows('Field', [['Height', field.height], ['Padding', field.padding], ['Gap', field.gap], ['Radius', field.radius], ['Border', field.border], ['Typography', field.typography], ['Icon size', field.icon]])}
        ${rows('Label', [['Height', label.height], ['Typography', label.typography], ['Gap', label.gap], ['Info icon', label.icon]])}
        ${rows('Footnote', [['Typography', footnote.typography]])}
      </tbody>
    </table>
  </div>`;
}

export function renderStates() {
  const cells = INPUT_STATES.map(
    (state) => `<div class="ds-bd-input-state"><code>state=${state}</code>${tile(inputForState(state))}</div>`,
  ).join('');
  return `<div class="ds-bd-input-states">${cells}</div>
    <p class="ds-bd-note">The first five states are interaction states of a native text field: <code>focus</code> and <code>filing</code> are <code>:focus-within</code> (without and with entered text), <code>filled</code> is a field with a value, and <code>disabled</code> uses the native attribute. <code>valid</code> and <code>error</code> are set through the <code>validation</code> prop. These previews force focus with a documentation-only attribute. Figma also draws a text caret in <code>focus</code> and <code>filing</code>; in the browser it appears while the field is focused.</p>`;
}
