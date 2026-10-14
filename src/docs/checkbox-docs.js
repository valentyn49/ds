import { checkboxHTML } from '../components/checkbox/checkbox.js';
import { CHECKBOX_STATES, CHECKBOX_SPEC, STATE_PROPS } from '../components/checkbox/checkbox.spec.js';

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Documentation-only: forces the browser :hover look so it can be shown without a pointer.
const forceHover = (html) => html.replace('<label class="ds-checkbox"', '<label data-preview-state="hover" class="ds-checkbox"');

export function checkboxForState(state, extra = {}) {
  const html = checkboxHTML({ ...extra, ...STATE_PROPS[state] });
  return state === 'hover' ? forceHover(html) : html;
}

const tile = (inner, className = '') =>
  `<div class="ds-bd-tile ds-bd-tile--start ${className}"><div class="ds-bd-cb-box">${inner}</div></div>`;

export function renderOverview() {
  const items = [
    { name: 'Show Caption on (default)', html: checkboxHTML() },
    { name: 'Show Caption off', html: checkboxHTML({ showCaption: false }) },
  ];
  return `<div class="ds-bd-overview ds-bd-overview--checkbox">${items
    .map(({ name, html }) => `<div class="ds-bd-overview__item">${tile(html)}<code>${esc(name)}</code></div>`)
    .join('')}</div>`;
}

export function renderAnatomy() {
  const anchor = (html, cls, dir, n, ax = '') =>
    html.replace(`class="${cls}"`, `class="${cls} ds-bd-anchor ds-bd-anchor--${dir}" data-n="${n}"${ax ? ` style="--ax:${ax}"` : ''}`);

  let html = checkboxHTML({ id: 'anatomy-checkbox', checked: true });
  html = anchor(html, 'ds-checkbox__box', 'left', 1);
  // The selection indicator is part of the same icon, so its marker is anchored to a zero-size point at the center of the box.
  html = html.replace(
    '</svg></span><span class="ds-checkbox__content">',
    '</svg><i class="ds-bd-cb-indicator ds-bd-anchor ds-bd-anchor--bottom" data-n="2"></i></span><span class="ds-checkbox__content">',
  );
  html = anchor(html, 'ds-checkbox__title', 'top', 3, '40px');
  html = anchor(html, 'ds-checkbox__caption', 'bottom', 4, '40px');

  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage ds-bd-cb-anatomy">
      <div class="ds-bd-cb-anatomy__figure">${html}</div>
    </div>
    <ol class="ds-bd-anatomy__legend">
      <li><b>1</b><div><strong>Checkbox control</strong><span>A 20px icon holding the drawn box. It is gray/600 when unchecked, primary/600 when checked and gray/400 when disabled.</span></div></li>
      <li><b>2</b><div><strong>Selection indicator</strong><span>The check mark. It only appears in the <code>selected</code> and <code>disabled</code> states, where the box is filled.</span></div></li>
      <li><b>3</b><div><strong>Title</strong><span>The label (<code>title</code>). Regular, 14/20, gray/900. Always present.</span></div></li>
      <li><b>4</b><div><strong>Caption</strong><span>Optional supporting text (<code>Show Caption</code>, <code>subtitle</code>). Regular, 12/18, gray/500, under the title.</span></div></li>
    </ol>
  </div>`;
}

const STATE_NOTES = {
  default: 'Unchecked box in gray/600.',
  hover: 'Unchecked box darkens to gray/900.',
  selected: 'Checked box in primary/600.',
  disabled: 'Checked box and both texts in gray/400.',
};

export function renderStates() {
  const cells = CHECKBOX_STATES.map(
    (state) => `<div class="ds-bd-input-state"><code>state=${state}</code>${tile(checkboxForState(state))}<span class="ds-bd-note">${esc(STATE_NOTES[state])}</span></div>`,
  ).join('');
  return `<div class="ds-bd-input-states ds-bd-cb-states">${cells}</div>
    <p class="ds-bd-note">Figma defines four states. <code>selected</code> is a checked box, <code>disabled</code> is drawn as a checked box, and <code>hover</code> is the browser's <code>:hover</code>. This preview forces the hover look with a documentation-only attribute.</p>
    <p class="ds-bd-note">Figma does not define an indeterminate state, a focus state, an error state, a hover look for a checked box, or a disabled unchecked box, so none of them have a documented appearance.</p>`;
}

export function renderFormatting() {
  const long = 'A longer label that does not fit on one line wraps inside the text column';
  const row = (label, value) => `<tr><th scope="row">${label}</th><td>${esc(value)}</td></tr>`;
  return `<div class="ds-bd-sizes">
    ${tile(checkboxHTML({ title: long, subtitle: 'Supporting text can wrap too, and the box stays aligned to the first line.' }))}
    <table class="ds-table">
      <thead><tr><th></th><th>Figma value</th></tr></thead>
      <tbody>
        ${row('Component width', CHECKBOX_SPEC.componentWidth)}
        ${row('Alignment', CHECKBOX_SPEC.alignment)}
        ${row('Control', CHECKBOX_SPEC.icon)}
        ${row('Control to text', CHECKBOX_SPEC.gapToContent)}
        ${row('Title to caption', CHECKBOX_SPEC.gapInContent)}
        ${row('Title', CHECKBOX_SPEC.title)}
        ${row('Caption', CHECKBOX_SPEC.caption)}
      </tbody>
    </table>
    <p class="ds-bd-note">Figma defines one size. The text column is a fixed width and its height grows as the text wraps.</p>
  </div>`;
}
