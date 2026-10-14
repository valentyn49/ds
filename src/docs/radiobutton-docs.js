import { radiobuttonHTML } from '../components/radiobutton/radiobutton.js';
import { RADIO_STATES, RADIO_SPEC, RADIO_STATE_PROPS } from '../components/radiobutton/radiobutton.spec.js';
import { esc, anchor, specRows, legendItem } from './doc-helpers.js';

// Documentation-only: forces the browser :hover look so it can be shown without a pointer.
const forceHover = (html) => html.replace('<label class="ds-radiobutton"', '<label data-preview-state="hover" class="ds-radiobutton"');

export function radiobuttonForState(state, extra = {}) {
  const html = radiobuttonHTML({ ...extra, ...RADIO_STATE_PROPS[state] });
  return state === 'hover' ? forceHover(html) : html;
}

const tile = (inner, className = '') => `<div class="ds-bd-tile ds-bd-tile--start ${className}">${inner}</div>`;

const CONFIGURATIONS = [
  { name: 'Show Caption on (default)', props: {} },
  { name: 'Show Caption off', props: { showCaption: false } },
  { name: 'badge on', props: { badge: true } },
];

export function renderOverview() {
  return `<div class="ds-bd-overview ds-bd-overview--radio">${CONFIGURATIONS.map(
    ({ name, props }) => `<div class="ds-bd-overview__item">${tile(radiobuttonHTML(props))}<code>${esc(name)}</code></div>`,
  ).join('')}</div>`;
}

export function renderAnatomy() {
  let html = radiobuttonHTML({ id: 'anatomy-radio', checked: true, badge: true });
  html = anchor(html, 'ds-radiobutton__control', 'left', 1);
  // The selection indicator is part of the same icon, so its marker is anchored to a zero-size point at the center of the control.
  html = html.replace(
    '</svg></span><span class="ds-radiobutton__content">',
    '</svg><i class="ds-bd-rb-indicator ds-bd-anchor ds-bd-anchor--bottom" data-n="2"></i></span><span class="ds-radiobutton__content">',
  );
  html = anchor(html, 'ds-radiobutton__title', 'top', 3, '40px');
  html = anchor(html, 'ds-radiobutton__badge', 'top', 4, '50%');
  html = anchor(html, 'ds-radiobutton__caption', 'bottom', 5, '40px');

  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage ds-bd-rb-anatomy">
      <div class="ds-bd-rb-anatomy__figure">${html}</div>
    </div>
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Radio control', 'A 20px icon holding the drawn circle. It is gray/600 when unselected, primary/600 when selected and gray/200 when disabled.')}
      ${legendItem(2, 'Selection indicator', 'The dot inside the circle. It only appears in the <code>selected</code> state.')}
      ${legendItem(3, 'Title', 'The label (<code>title</code>). Regular, 14/20, gray/900. Always present.')}
      ${legendItem(4, 'Badge', 'Optional (<code>badge</code>). A <code>pro</code> badge after the title with a 4px gap: green/100 fill, 4px radius, uppercase 12/16 text.')}
      ${legendItem(5, 'Caption', 'Optional supporting text (<code>Show Caption</code>, <code>subtitle</code>). Regular, 12/18, gray/500, under the title.')}
    </ol>
  </div>`;
}

const STATE_NOTES = {
  default: 'Unselected circle in gray/600.',
  hover: 'Unselected circle darkens to gray/900.',
  selected: 'Circle with a dot, both in primary/600.',
  disabled: 'Unselected circle in gray/200 and the title in gray/500.',
};

export function renderStates() {
  const cells = RADIO_STATES.map(
    (state) => `<div class="ds-bd-input-state"><code>state=${state}</code>${tile(radiobuttonForState(state))}<span class="ds-bd-note">${esc(STATE_NOTES[state])}</span></div>`,
  ).join('');
  return `<div class="ds-bd-input-states ds-bd-rb-states">${cells}</div>
    <p class="ds-bd-note">Figma defines four states. <code>selected</code> is a checked radio, <code>disabled</code> is drawn as an unselected radio, and <code>hover</code> is the browser's <code>:hover</code>. This preview forces the hover look with a documentation-only attribute.</p>
    <p class="ds-bd-note">Figma does not define a focus state, an error state, a hover look for a selected radio, or a disabled selected radio, so none of them have a documented appearance.</p>`;
}

export function renderFormatting() {
  const row = (label, value) => `<tr><th scope="row">${label}</th><td>${esc(value)}</td></tr>`;
  return `<div class="ds-bd-sizes">
    ${tile(radiobuttonHTML({ badge: true }))}
    <table class="ds-table">
      <thead><tr><th></th><th>Figma value</th></tr></thead>
      <tbody>
        ${row('Component width', RADIO_SPEC.componentWidth)}
        ${row('Alignment', RADIO_SPEC.alignment)}
        ${row('Control', RADIO_SPEC.icon)}
        ${row('Control to text', RADIO_SPEC.gapToContent)}
        ${row('Title to caption', RADIO_SPEC.gapInContent)}
        ${row('Title to badge', RADIO_SPEC.gapTitleBadge)}
        ${row('Title', RADIO_SPEC.title + ', gray/900')}
        ${row('Caption', RADIO_SPEC.caption + ', gray/500')}
        ${row('Badge', RADIO_SPEC.badge)}
      </tbody>
    </table>
    <p class="ds-bd-note">Figma defines one size. The text is not set to wrap, so the component grows with its text. Figma does not define a radio group, spacing between radios, or a horizontal arrangement.</p>
  </div>`;
}
