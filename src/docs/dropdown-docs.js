import { dropdownHTML, dropdownItemsHTML } from '../components/dropdown/dropdown.js';
import { DROPDOWN_STATES, DROPDOWN_SPEC, SAMPLE_OPTIONS } from '../components/dropdown/dropdown.spec.js';
import { esc, anchor, specRows, legendItem } from './doc-helpers.js';

const tile = (inner, className = '') =>
  `<div class="ds-bd-tile ds-bd-tile--start ${className}"><div class="ds-bd-dd-box">${inner}</div></div>`;

// Documentation-only: maps a Figma `state` value to props of the real component plus an optional forced hover look.
export function dropdownStateConfig(state) {
  switch (state) {
    case 'hover': return { props: {}, preview: 'hover' };
    case 'selected': return { props: { value: SAMPLE_OPTIONS[0] } };
    case 'disabled': return { props: { disabled: true } };
    case 'error': return { props: { validation: 'error' } };
    default: return { props: {} };
  }
}

const forceHoverHTML = (html) => html.replace('<div class="ds-dropdown', '<div data-preview-state="hover" class="ds-dropdown');

export function dropdownForState(state, extra = {}) {
  const { props, preview } = dropdownStateConfig(state);
  const html = dropdownHTML({ ...extra, ...props });
  return preview ? forceHoverHTML(html, preview) : html;
}

// A menu without its trigger, laid out in the page flow (used to show items on their own).
const menuOnly = (options, ctx = {}) =>
  `<div class="ds-dropdown ds-bd-menu-flow"><div class="ds-dropdown__control"><div class="ds-dropdown__menu"><div class="ds-dropdown__list" role="presentation">${dropdownItemsHTML(options, ctx)}</div></div></div></div>`;

const CONFIGURATIONS = [
  { name: 'default', props: {} },
  { name: 'selected', props: { value: SAMPLE_OPTIONS[0] } },
  { name: 'info', props: { info: true } },
  { name: 'title off', props: { showLabel: false } },
  { name: 'footnote off', props: { showFootnote: false } },
];

export function renderOverview() {
  return `<div class="ds-bd-overview ds-bd-overview--dropdown">${CONFIGURATIONS.map(
    ({ name, props }) => `<div class="ds-bd-overview__item">${tile(dropdownHTML(props))}<code>${esc(name)}</code></div>`,
  ).join('')}</div>`;
}

export function renderAnatomy() {
  let closed = dropdownHTML({ id: 'anatomy-dd', info: true, value: SAMPLE_OPTIONS[0] });
  closed = anchor(closed, 'ds-dropdown__label-text', 'top', 1, '40px');
  closed = anchor(closed, 'ds-dropdown__info', 'top', 2, '20px');
  closed = anchor(closed, 'ds-dropdown__trigger', 'left', 3);
  closed = anchor(closed, 'ds-dropdown__value', 'top', 4, '50px');
  closed = anchor(closed, 'ds-dropdown__chevron', 'right', 5);
  closed = anchor(closed, 'ds-dropdown__caption', 'bottom', 6, '40px');

  let open = dropdownHTML({ id: 'anatomy-dd-open', open: true, value: SAMPLE_OPTIONS[1], options: SAMPLE_OPTIONS.slice(0, 3), showSearch: true, activeIndex: 1, showFootnote: false });
  open = anchor(open, 'ds-dropdown__menu', 'left', 7);
  open = anchor(open, 'ds-dropdown__item is-active', 'right', 8);
  open = anchor(open, 'ds-dropdown__item', 'right-end', 9);
  open = anchor(open, 'ds-dropdown__search', 'left', 10);

  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage ds-bd-input-anatomy ds-bd-dd-anatomy">
      <div class="ds-bd-input-anatomy__figure ds-bd-dd-anatomy__figure">${closed}</div>
    </div>
    <p class="ds-bd-note">Closed</p>
    <div class="ds-bd-anatomy__stage ds-bd-input-anatomy ds-bd-dd-anatomy ds-bd-dd-anatomy--open">
      <div class="ds-bd-input-anatomy__figure ds-bd-dd-anatomy__figure ds-bd-dd-anatomy__figure--open">${open}</div>
    </div>
    <p class="ds-bd-note">Open, with the optional search field</p>
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Title', 'Optional (<code>title</code>, <code>title text</code>). Semibold, 14/20, gray/900. Above the trigger.')}
      ${legendItem(2, 'Info icon', 'Optional (<code>info</code>). 20px, after the title with an 8px gap.')}
      ${legendItem(3, 'Trigger', '40px high, 1px inside border, 8px radius, white fill. Padding is 12px vertical and 16px horizontal. The border changes with the state.')}
      ${legendItem(4, 'Placeholder / selected value', 'Regular, 14/16. The placeholder (<code>placeholder text</code>) is gray/500; a selected value is gray/900.')}
      ${legendItem(5, 'Chevron', '18px, gray/500. Points down when closed and up in the hover look.')}
      ${legendItem(6, 'Caption', 'Optional (<code>footnote</code>, <code>footnote text</code>). Regular, 12/18, gray/500; alert/600 in the error state.')}
      ${legendItem(7, 'Menu', 'The <code>dropdown</code> component: white fill, 8px radius, <code>shadow-lg</code>, as wide as the trigger.')}
      ${legendItem(8, 'Menu item', 'The <code>dropdown item</code> component, 58px high with 16px padding. Fill gray/100 in its <code>hover</code> type.')}
      ${legendItem(9, 'Divider', '1px gray/200 line between items.')}
      ${legendItem(10, 'Search field', 'Optional (<code>Search</code>). A Text Input with a search icon at the top of the menu, 16px padding, with a 1px gray/200 divider below it.')}
    </ol>
  </div>`;
}

const STATE_NOTES = {
  default: 'Gray/200 border, placeholder in gray/500, chevron down.',
  hover: 'Gray/500 border and the chevron flipped up. Figma shows the open menu this way.',
  selected: 'The chosen value in gray/900.',
  disabled: 'Gray/100 fill, text and chevron in gray/500.',
  error: 'Alert/600 border and caption.',
};

export function renderStates() {
  const cells = DROPDOWN_STATES.map(
    (state) => `<div class="ds-bd-input-state"><code>state=${state}</code>${tile(dropdownForState(state))}<span class="ds-bd-note">${esc(STATE_NOTES[state])}</span></div>`,
  ).join('');
  const items = `<div class="ds-bd-input-state"><code>dropdown item · type=Default</code>${tile(menuOnly(['London']))}</div>
    <div class="ds-bd-input-state"><code>dropdown item · type=hover</code>${tile(menuOnly(['London'], { activeIndex: 0 }))}</div>`;
  return `<h3>Trigger</h3>
    <div class="ds-bd-input-states ds-bd-dd-states">${cells}</div>
    <h3>Menu item</h3>
    <div class="ds-bd-input-states ds-bd-dd-states">${items}</div>
    <p class="ds-bd-note">Disabled uses the native attribute and <code>error</code> is set through the <code>validation</code> prop. The hover look is forced here with a documentation-only attribute. Figma defines no separate open, focus or selected-item state. In this implementation the hover look is also used while the menu is open and for keyboard focus, and the chosen item is exposed with <code>aria-selected</code>.</p>`;
}

export function renderFormatting() {
  const { trigger, label, caption, menu, item } = DROPDOWN_SPEC;
  const configs = [
    { label: 'London' },
    { label: 'Paris', checkbox: true },
    { label: 'Berlin', color: 'var(--ds-color-alert-500)' },
    { label: 'Madrid', rightIcon: true },
    { label: 'Rome', pro: true },
  ];
  return `<div class="ds-bd-sizes">
    <p class="ds-bd-note">Optional parts of a <code>dropdown item</code>, one per row: <code>checkbox</code>, <code>Color</code>, <code>Right icons</code> (a check mark, shown here on the selected item) and <code>Pro</code>.</p>
    ${tile(menuOnly(configs, { selectedIndex: 3 }))}
    <table class="ds-table">
      <thead><tr><th></th><th>Figma value</th></tr></thead>
      <tbody>
        <tr><th scope="row">Component width</th><td>${esc(DROPDOWN_SPEC.componentWidth)}</td></tr>
        <tr><th scope="row">Gap between parts</th><td>${esc(DROPDOWN_SPEC.stackGap)}</td></tr>
        ${specRows('Trigger', [['Height', trigger.height], ['Padding', trigger.padding], ['Gap', trigger.gap], ['Radius', trigger.radius], ['Border', trigger.border], ['Typography', trigger.typography], ['Chevron', trigger.chevron]])}
        ${specRows('Title', [['Height', label.height], ['Typography', label.typography], ['Gap', label.gap], ['Info icon', label.icon]])}
        ${specRows('Caption', [['Typography', caption.typography]])}
        ${specRows('Menu', [['Width', menu.width], ['Radius', menu.radius], ['Fill', menu.fill], ['Shadow', menu.shadow], ['Divider', menu.divider], ['Search', menu.search], ['Items', menu.items]])}
        ${specRows('Item', [['Height', item.height], ['Padding', item.padding], ['Gap', item.gap], ['Typography', item.typography], ['Hover', item.hover], ['Icons', item.icons], ['Color swatch', item.swatch], ['Pro badge', item.pro]])}
      </tbody>
    </table>
    <p class="ds-bd-note">Figma defines one size. It does not specify the menu offset from the trigger, a maximum menu height or scrolling, so the menu opens directly below the trigger and grows with its items. Item text uses the literal color #141414 in Figma, which is not one of the color tokens.</p>
  </div>`;
}
