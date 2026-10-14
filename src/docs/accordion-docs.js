import { accordionHTML } from '../components/accordion/accordion.js';
import { ACCORDION_SPEC, ACCORDION_STATES } from '../components/accordion/accordion.spec.js';
import { esc, anchor, legendItem } from './doc-helpers.js';

const tile = (inner, className = '') =>
  `<div class="ds-bd-tile ds-bd-tile--start ${className}"><div class="ds-bd-acc-box">${inner}</div></div>`;

const SAMPLE_TITLE = 'Do changes to my membership (upgrade/downgrade) affect my billing cycle?';

const CONFIGURATIONS = [
  { name: 'state=closed', props: { title: SAMPLE_TITLE } },
  { name: 'state=open', props: { title: SAMPLE_TITLE, open: true } },
  { name: 'Subtitle', props: { title: SAMPLE_TITLE, showSubtitle: true } },
  { name: 'Left icon', props: { title: SAMPLE_TITLE, showLeftIcon: true } },
  { name: 'Link', props: { title: SAMPLE_TITLE, showLink: true } },
  { name: 'Button', props: { title: SAMPLE_TITLE, showButton: true } },
];

export function renderOverview() {
  return `<div class="ds-bd-overview ds-bd-overview--accordion">${CONFIGURATIONS.map(
    ({ name, props }) => `<div class="ds-bd-overview__item">${tile(accordionHTML(props))}<code>${esc(name)}</code></div>`,
  ).join('')}</div>`;
}

export function renderAnatomy() {
  let closed = accordionHTML({
    id: 'anatomy-acc',
    title: 'Accordion title',
    showLeftIcon: true,
    showSubtitle: true,
    showLink: true,
    showButton: true,
  });
  closed = anchor(closed, 'ds-accordion', 'left', 1);
  closed = anchor(closed, 'ds-accordion__icon', 'top', 2);
  closed = anchor(closed, 'ds-accordion__title', 'top', 3, '40px');
  closed = anchor(closed, 'ds-accordion__link', 'top', 4);
  closed = anchor(closed, 'ds-accordion__subtitle', 'bottom', 5, '30px');
  closed = anchor(closed, 'ds-accordion__button', 'top', 6);
  closed = anchor(closed, 'ds-accordion__chevron', 'top', 7);

  let open = accordionHTML({ id: 'anatomy-acc-open', title: 'Accordion title', open: true });
  open = anchor(open, 'ds-accordion__toggle', 'top', 8, '24px');
  open = anchor(open, 'ds-accordion__content', 'bottom', 9, '40px');

  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage ds-bd-acc-anatomy">
      <div class="ds-bd-acc-anatomy__figure">${closed}</div>
    </div>
    <p class="ds-bd-note">Closed, with every optional part shown</p>
    <div class="ds-bd-anatomy__stage ds-bd-acc-anatomy">
      <div class="ds-bd-acc-anatomy__figure">${open}</div>
    </div>
    <p class="ds-bd-note">Open</p>
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Container', 'White fill, 8px radius and the <code>shadow</code> effect style, with no border. Padding is 16px on every side.')}
      ${legendItem(2, 'Left icon', 'Optional (<code>Left icon</code>). A 24px icon, gray/900, before the text.')}
      ${legendItem(3, 'Title', 'The header text (<code>title</code>). Semibold, 14/20, gray/900.')}
      ${legendItem(4, 'Link', 'Optional (<code>Link</code>). Semibold, 12/18, primary/600 and underlined, 8px after the title.')}
      ${legendItem(5, 'Subtitle', 'Optional (<code>Subtitle</code>). Regular, 14/20, gray/500, under the title.')}
      ${legendItem(6, 'Button', 'Optional (<code>Button</code>). The primary Button at size 36, before the chevron.')}
      ${legendItem(7, 'Chevron', 'A 24px icon, gray/900. It points down when closed and up when open.')}
      ${legendItem(8, 'Header', 'The whole header row, padding included, is the toggle. It is a native button with <code>aria-expanded</code>.')}
      ${legendItem(9, 'Content', 'The panel text (<code>content</code>). Regular, 14/20, gray/700, shown only when open, 16px below the header text.')}
    </ol>
  </div>`;
}

const STATE_NOTES = {
  closed: 'Only the header is shown, with the chevron pointing down.',
  open: 'The content is shown under the header, and the chevron points up.',
};

export function renderStates() {
  const cells = ACCORDION_STATES.map(
    (state) =>
      `<div class="ds-bd-input-state"><code>state=${state}</code>${tile(accordionHTML({ title: SAMPLE_TITLE, open: state === 'open' }))}<span class="ds-bd-note">${esc(STATE_NOTES[state])}</span></div>`,
  ).join('');
  return `<div class="ds-bd-acc-states">${cells}</div>
    <p class="ds-bd-note">Figma defines two states, <code>closed</code> and <code>open</code>, and one <code>type</code> value, <code>default</code>. The state is changed by interaction: use the Live Demo or the Behaviors demo below. Figma defines no hover, focus, disabled or error look. The content text is sample text for demonstration only.</p>`;
}

export function renderFormatting() {
  const row = (label, value) => `<tr><th scope="row">${label}</th><td>${esc(value)}</td></tr>`;
  return `<div class="ds-bd-sizes">
    ${tile(accordionHTML({ title: SAMPLE_TITLE, open: true }))}
    <table class="ds-table">
      <thead><tr><th></th><th>Figma value</th></tr></thead>
      <tbody>
        ${row('Width', ACCORDION_SPEC.componentWidth)}
        ${row('Card', ACCORDION_SPEC.card)}
        ${row('Padding', ACCORDION_SPEC.padding)}
        ${row('Header height', ACCORDION_SPEC.headerHeight)}
        ${row('Header gap', ACCORDION_SPEC.headerGap)}
        ${row('Header alignment', ACCORDION_SPEC.headerAlignment)}
        ${row('Title', ACCORDION_SPEC.title)}
        ${row('Subtitle', ACCORDION_SPEC.subtitle)}
        ${row('Link', ACCORDION_SPEC.link)}
        ${row('Icons', ACCORDION_SPEC.icons)}
        ${row('Button', ACCORDION_SPEC.button)}
        ${row('Content', ACCORDION_SPEC.content)}
        ${row('After the content', ACCORDION_SPEC.openGap)}
      </tbody>
    </table>
    <p class="ds-bd-note">Figma defines one size and a single independent item. It does not define a group of items, spacing between items or an animation. The open variant in Figma also contains a gray <code>notification</code> box inside the content, which is a separate component and is not part of this item's properties.</p>
  </div>`;
}
