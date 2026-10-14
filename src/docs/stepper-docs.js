import { stepperHTML } from '../components/stepper/stepper.js';
import { STEPPER_STATES, STEPPER_SPEC } from '../components/stepper/stepper.spec.js';
import { esc, anchor, legendItem } from './doc-helpers.js';

const tile = (inner, className = '') =>
  `<div class="ds-bd-tile ds-bd-tile--start ${className}"><div class="ds-bd-step-box">${inner}</div></div>`;

const STATE_NOTES = {
  filled: 'A completed step: white circle, 1.5px primary/600 border and a primary/600 check mark.',
  active: 'The current step: primary/600 circle with a white number, and the title in primary/600.',
  'next step': 'An upcoming step: gray/200 circle with the number in gray/900.',
  disabled: 'An unavailable step: gray/200 circle with the number in gray/500.',
};

export function renderOverview() {
  const items = [
    ...STEPPER_STATES.map((state) => ({ name: `state=${state}`, html: stepperHTML({ state }) })),
    { name: 'short description off', html: stepperHTML({ state: 'active', showDescription: false }) },
  ];
  return `<div class="ds-bd-overview ds-bd-overview--stepper">${items
    .map(({ name, html }) => `<div class="ds-bd-overview__item">${tile(html)}<code>${esc(name)}</code></div>`)
    .join('')}</div>`;
}

export function renderAnatomy() {
  let html = stepperHTML({ state: 'active' });
  html = anchor(html, 'ds-stepper__circle', 'left', 1);
  // The number sits inside the circle, so its marker is anchored to a zero-size point at the center of the circle.
  html = html.replace(
    '</span></span></span><span class="ds-stepper__content">',
    '</span><i class="ds-bd-step-indicator ds-bd-anchor ds-bd-anchor--bottom" data-n="2"></i></span></span><span class="ds-stepper__content">',
  );
  html = anchor(html, 'ds-stepper__title', 'top', 3, '40px');
  html = anchor(html, 'ds-stepper__description', 'bottom', 4, '40px');
  html = anchor(html, 'ds-stepper__connector', 'right', 5);

  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage ds-bd-step-anatomy">
      <div class="ds-bd-step-anatomy__figure">${html}</div>
    </div>
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Status circle', 'A 32px circle. Its fill, border and content show the state of the step.')}
      ${legendItem(2, 'Number / check mark', 'The step number (<code>number</code>), Semibold 14/20, or a 20px check mark in the <code>filled</code> state.')}
      ${legendItem(3, 'Title', 'The step name (<code>title</code>). Semibold, 14/20, gray/900; primary/600 in the <code>active</code> state.')}
      ${legendItem(4, 'Short description', 'Optional (<code>short description</code>, <code>subtitle</code>). Regular, 12/18, under the title.')}
      ${legendItem(5, 'Connector', 'A 1px gray/200 line that fills the remaining width, level with the middle of the circle.')}
    </ol>
  </div>`;
}

export function renderStates() {
  const cells = STEPPER_STATES.map(
    (state) => `<div class="ds-bd-input-state"><code>state=${state}</code>${tile(stepperHTML({ state }))}<span class="ds-bd-note">${esc(STATE_NOTES[state])}</span></div>`,
  ).join('');
  return `<div class="ds-bd-input-states ds-bd-step-states">${cells}</div>
    <p class="ds-bd-note">The four states describe where a step is in the sequence, so they are set with the <code>state</code> prop rather than by hover or focus. Figma defines no hover, focus, pressed or error look for a step.</p>`;
}

export function renderFormatting() {
  const row = (label, value) => `<tr><th scope="row">${label}</th><td>${esc(value)}</td></tr>`;
  return `<div class="ds-bd-sizes">
    ${tile(stepperHTML({ state: 'active' }))}
    <table class="ds-table">
      <thead><tr><th></th><th>Figma value</th></tr></thead>
      <tbody>
        ${row('Component width', STEPPER_SPEC.componentWidth)}
        ${row('Layout', STEPPER_SPEC.layout)}
        ${row('Alignment', STEPPER_SPEC.alignment)}
        ${row('Circle', STEPPER_SPEC.circle)}
        ${row('Number', STEPPER_SPEC.number)}
        ${row('Check mark', STEPPER_SPEC.check)}
        ${row('Title', STEPPER_SPEC.title)}
        ${row('Description', STEPPER_SPEC.description)}
        ${row('Connector', STEPPER_SPEC.connector)}
      </tbody>
    </table>
    <p class="ds-bd-note">Figma defines one size and one step. Each step has its own connector, and Figma has no property to hide it, so how steps are joined into a sequence, and what the last step shows, is not specified. The description color is a library variable (<code>color/text/secondary</code>) that is not in this project's tokens, so its value #8e8e8e is used directly.</p>
  </div>`;
}
