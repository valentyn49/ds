import { inputTagHTML } from '../components/input-tag/input-tag.js';
import { INPUT_TAG_STATES, INPUT_TAG_DEFAULTS, INPUT_TAG_SPEC } from '../components/input-tag/input-tag.spec.js';
import { esc, tile, anchor, specRows, legendItem } from './doc-helpers.js';

// Documentation-only: maps a Figma `state` value to props of the real component.
// `preview` forces the caret that Figma draws: `focus` puts it before the placeholder, `typing` after the entered text.
export function inputTagStateConfig(state, tagText = INPUT_TAG_DEFAULTS.tagText, placeholder = INPUT_TAG_DEFAULTS.placeholder) {
  switch (state) {
    case 'focus': return { props: {}, preview: 'focus' };
    case 'filing': return { props: { value: placeholder }, preview: 'typing' };
    case 'selected': return { props: { tags: [tagText], value: placeholder }, preview: 'typing' };
    case 'finished': return { props: { tags: [tagText, `${tagText} 2`], finished: true } };
    default: return { props: {} };
  }
}

const forcePreviewHTML = (html, preview) => html.replace('<div class="ds-input-tag', `<div data-preview-state="${preview}" class="ds-input-tag`);

export function inputTagForState(state, extra = {}) {
  const { props, preview } = inputTagStateConfig(state, extra.tagText, extra.placeholder);
  const { tagText, ...rest } = extra;
  const html = inputTagHTML({ ...rest, ...props });
  return preview ? forcePreviewHTML(html, preview) : html;
}

const CONFIGURATIONS = [
  { name: 'default', props: {} },
  { name: 'tags', props: { tags: [INPUT_TAG_DEFAULTS.tagText], value: INPUT_TAG_DEFAULTS.placeholder } },
  { name: 'tags, finished', props: { tags: [INPUT_TAG_DEFAULTS.tagText, `${INPUT_TAG_DEFAULTS.tagText} 2`], finished: true } },
  { name: 'dropdown', props: { showDropdown: true } },
  { name: 'show right icon', props: { showRightIcon: true } },
  { name: 'show left icon off', props: { showLeftIcon: false } },
  { name: 'info', props: { info: true } },
  { name: 'show label off', props: { showLabel: false } },
  { name: 'show footnote off', props: { showFootnote: false } },
];

export function renderOverview() {
  return `<div class="ds-bd-overview ds-bd-overview--input">${CONFIGURATIONS.map(
    ({ name, props }) => `<div class="ds-bd-overview__item">${tile(inputTagHTML(props))}<code>${esc(name)}</code></div>`,
  ).join('')}</div>`;
}

export function renderAnatomy() {
  let html = inputTagHTML({
    id: 'anatomy-input-tag',
    info: true,
    showDropdown: true,
    tags: [INPUT_TAG_DEFAULTS.tagText],
    value: INPUT_TAG_DEFAULTS.placeholder,
  });
  html = anchor(html, 'ds-input-tag__label-text', 'top', 1, '40px');
  html = anchor(html, 'ds-input-tag__info', 'top', 2, '20px');
  html = anchor(html, 'ds-input-tag__field', 'top', 3, 'calc(100% - 60px)');
  html = anchor(html, 'ds-input-tag__icon ds-input-tag__icon--left', 'left', 4);
  html = anchor(html, 'ds-input-tag__tag', 'top', 5, '80%');
  html = anchor(html, 'ds-input-tag__value', 'top', 6, '50%');
  html = anchor(html, 'ds-input-tag__icon ds-input-tag__icon--dropdown', 'right', 7);
  html = anchor(html, 'ds-input-tag__footnote', 'bottom', 8, '40px');

  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage ds-bd-input-anatomy">
      <div class="ds-bd-input-anatomy__figure">${html}</div>
    </div>
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Label', 'Optional (<code>show label</code>, <code>label text</code>). Semibold, 14/20, gray/900. Above the field.')}
      ${legendItem(2, 'Info icon', 'Optional (<code>info</code>). 20px, after the label with an 8px gap.')}
      ${legendItem(3, 'Field container', '40px high, 1px inside gray/200 border, 8px radius, white fill. The border does not change between states.')}
      ${legendItem(4, 'Left icon', 'On by default (<code>show left icon</code>, <code>left icon</code>). 16px, before the tags and text.')}
      ${legendItem(5, 'Tag', 'A Figma <code>badge</code>: gray/200 fill, 4px radius, 24px high, with its text and a 16px close icon. Appears in the <code>selected</code> and <code>finished</code> states.')}
      ${legendItem(6, 'Placeholder / text', 'Regular, 14/16. The placeholder (<code>placeholder text</code>) is gray/500, entered text is gray/900. Hidden in the <code>finished</code> state.')}
      ${legendItem(7, 'Dropdown icon', 'Optional (<code>dropdown</code>). A 16px chevron at the end of the field.')}
      ${legendItem(8, 'Footnote', 'Optional (<code>show footnote</code>, <code>footnote_text</code>). Regular, 14/20, below the field.')}
    </ol>
    <p class="ds-bd-note">A right icon (<code>show right icon</code>, <code>right icon</code>, 16px) is also optional and sits before the dropdown icon.</p>
  </div>`;
}

const STATE_NOTES = {
  Default: 'Empty field with the placeholder in gray/500.',
  focus: 'Same border as Default. Figma adds a text caret before the placeholder.',
  filing: 'Entered text in gray/900 with a caret after it. Border unchanged.',
  selected: 'One tag, then the entered text and a caret. The field padding becomes 8px / 12px.',
  finished: 'Tags only, no text entry.',
};

export function renderStates() {
  const cells = INPUT_TAG_STATES.map(
    (state) => `<div class="ds-bd-input-state"><code>state=${state}</code>${tile(inputTagForState(state))}<span class="ds-bd-note">${esc(STATE_NOTES[state])}</span></div>`,
  ).join('');
  return `<div class="ds-bd-input-states">${cells}</div>
    <p class="ds-bd-note">Figma keeps the border gray/200 in every state, so the states differ by their tags, text color and caret. The caret in <code>focus</code>, <code>filing</code> and <code>selected</code> is drawn here with a documentation-only attribute; in the browser the native caret appears while the field is focused, so click into the field in the Live Demo to see it.</p>`;
}

export function renderFormatting() {
  const { field, tag, label, footnote } = INPUT_TAG_SPEC;
  const tags = ['Australia BMK', 'Australia BMK 2', 'Australia BMK 3', 'Australia BMK 4'];
  return `<div class="ds-bd-sizes">
    ${tile(inputTagHTML({ tags, finished: true, showLeftIcon: false }))}
    <table class="ds-table">
      <thead><tr><th></th><th>Figma value</th></tr></thead>
      <tbody>
        <tr><th scope="row">Component width</th><td>${esc(INPUT_TAG_SPEC.componentWidth)}</td></tr>
        <tr><th scope="row">Gap between parts</th><td>${esc(INPUT_TAG_SPEC.stackGap)}</td></tr>
        ${specRows('Field', [['Height', field.height], ['Padding', field.padding], ['Gap', field.gap], ['Radius', field.radius], ['Border', field.border], ['Typography', field.typography], ['Icon size', field.icon]])}
        ${specRows('Tag', [['Height', tag.height], ['Padding', tag.padding], ['Gap', tag.gap], ['Radius', tag.radius], ['Fill', tag.fill], ['Typography', tag.typography], ['Close icon', tag.icon]])}
        ${specRows('Label', [['Height', label.height], ['Typography', label.typography], ['Gap', label.gap], ['Info icon', label.icon]])}
        ${specRows('Footnote', [['Typography', footnote.typography]])}
      </tbody>
    </table>
    <p class="ds-bd-note">${esc(INPUT_TAG_SPEC.wrapping)} Figma defines one size.</p>
  </div>`;
}
