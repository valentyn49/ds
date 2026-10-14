import { buttonHTML } from '../components/button/button.js';
import {
  BUTTON_STATES,
  BUTTON_TYPES,
  SIZE_SPECS,
  TYPE_EXCEPTIONS,
  sizesFor,
} from '../components/button/button.spec.js';
import { forceStateHTML, isDarkSurface } from './preview-state.js';

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const defaultSize = (type) => sizesFor(type)[0];

const tile = (type, inner, className = '') =>
  `<div class="ds-bd-tile${isDarkSurface(type) ? ' ds-bd-tile--dark' : ''} ${className}">${inner}</div>`;

const VARIANT_NOTES = {
  primary: 'Solid primary/600 fill with a white label.',
  secondary: 'Light primary/100 fill with a primary/600 label.',
  purchase: 'Solid green/600 fill with a white label. Uses the green focus ring.',
  white: 'White fill with a primary/600 label and no border. Called "neutral" on the Figma spec sheet.',
  text: 'Label only, primary/600, underlined on hover and focus. Called "link" on the Figma spec sheet.',
  Stroke: 'White fill with a 1px gray/200 stroke and a regular-weight label. Only exists at size 36 and is 40px high.',
  menu: 'Label only, gray/50, for the dark header surface (color/header/background). Only exists at size 36.',
  cancel: 'Label only, gray/600, underlined on hover and focus.',
  purchase_secondary: 'Outlined purchase button: green/600 stroke and label. Called "purchase_sec" on the Figma spec sheet.',
  neutral_summary: 'White fill with a 1px summary/500 stroke and label.',
  neutral_detailed: 'White fill with a 1px detailed/500 stroke and label.',
  neutral_premium: 'White fill with a 1px premium/500 stroke and label.',
};

export function renderOverview() {
  const items = BUTTON_TYPES.map(
    ({ type }) =>
      `<div class="ds-bd-overview__item">${tile(type, buttonHTML({ variant: type, size: defaultSize(type) }))}<code>${esc(type)}</code></div>`,
  ).join('');
  return `<div class="ds-bd-overview">${items}</div>`;
}

export function renderAnatomy() {
  const zoom = 2;
  const button = buttonHTML({ variant: 'primary', size: '48', showLeftIcon: true, leftIcon: 'search', showRightIcon: true, rightIcon: 'search' });
  // Markers are anchored to Figma geometry that does not depend on the label width:
  // the left icon starts 20px from the left edge and is 24px wide, the right icon mirrors it, the label sits between them.
  const icon = (20 + 12) * zoom; // center of a 24px icon, 20px from the edge
  const marker = (n, anchor, side) =>
    `<span class="ds-bd-marker ds-bd-marker--${side}" style="${anchor}"><b>${n}</b></span>`;

  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage">
      <div class="ds-bd-anatomy__figure">
        <div class="ds-bd-anatomy__button" style="zoom:${zoom}">${button}</div>
        ${marker(1, 'left:10px;transform:translateX(-50%)', 'top')}
        ${marker(2, `left:${icon}px;transform:translateX(-50%)`, 'top')}
        ${marker(4, `right:${icon}px;transform:translateX(50%)`, 'top')}
        ${marker(3, 'left:50%;transform:translateX(-50%)', 'bottom')}
      </div>
    </div>
    <ol class="ds-bd-anatomy__legend">
      <li><b>1</b><div><strong>Container</strong><span>Fill, optional 1px inside stroke, 8px radius. Padding is 20px horizontal and 12px vertical at size 48 (16px and 8px at size 36). The focus ring is drawn around it in the focus state.</span></div></li>
      <li><b>2</b><div><strong>Left icon</strong><span>Optional (<code>Show left icon</code>, <code>left icon</code>). 24px at size 48, 20px at size 36.</span></div></li>
      <li><b>3</b><div><strong>Label</strong><span>Optional (<code>show text</code>, <code>Text</code>). Bold, 16/24 at size 48 and 14/20 at size 36. 8px gap to the icons.</span></div></li>
      <li><b>4</b><div><strong>Right icon</strong><span>Optional (<code>Show right icon</code>, <code>right icon</code>). Same sizes as the left icon.</span></div></li>
    </ol>
    <p class="ds-bd-note">The <code>text</code>, <code>cancel</code> and <code>menu</code> types have no container fill or padding, so only the label and icons remain. <code>Stroke</code> has 12px padding and is 40px high.</p>
  </div>`;
}

export function renderVariants() {
  return `<div class="ds-bd-variants">${BUTTON_TYPES.map(({ type, sizes, sheetLabel }) => {
    const previews = sizes
      .map((size) => `<div class="ds-bd-variant__sample"><span>size ${size}</span>${buttonHTML({ variant: type, size })}</div>`)
      .join('');
    return `<section class="ds-bd-variant">
      <header>
        <code class="ds-bd-variant__name">type=${esc(type)}</code>
        ${sheetLabel ? `<span class="ds-chip">spec sheet: ${esc(sheetLabel)}</span>` : ''}
      </header>
      <p>${esc(VARIANT_NOTES[type])}</p>
      ${tile(type, previews, 'ds-bd-tile--row')}
    </section>`;
  }).join('')}</div>`;
}

export function renderSizes() {
  const row = (label, key) =>
    `<tr><th scope="row">${label}</th><td>${esc(SIZE_SPECS['48'][key])}</td><td>${esc(SIZE_SPECS['36'][key])}</td></tr>`;

  const samples = ['48', '36']
    .map(
      (size) =>
        `<div class="ds-bd-size-sample"><code>size=${size}</code>${buttonHTML({ variant: 'primary', size, showLeftIcon: true, showRightIcon: true })}${buttonHTML({ variant: 'secondary', size })}</div>`,
    )
    .join('');

  const exceptions = Object.entries(TYPE_EXCEPTIONS)
    .map(([type, spec]) => {
      const bits = [
        spec.height && `height: ${spec.height}`,
        spec.padding && `padding: ${spec.padding}`,
        spec.typography && spec.typography,
        spec.icon && `icon: ${spec.icon}`,
      ].filter(Boolean);
      return `<li><code>${esc(type)}</code> ${esc(bits.join('. '))}. ${esc(spec.note)}</li>`;
    })
    .join('');

  return `<div class="ds-bd-sizes">
    ${tile('primary', samples, 'ds-bd-tile--stack')}
    <table class="ds-table">
      <thead><tr><th></th><th>size=48</th><th>size=36</th></tr></thead>
      <tbody>
        ${row('Height', 'height')}
        ${row('Padding (vertical / horizontal)', 'padding')}
        ${row('Padding tokens', 'paddingTokens')}
        ${row('Gap (icon to label)', 'gap')}
        ${row('Corner radius', 'radius')}
        ${row('Typography', 'typography')}
        ${row('Icon size', 'icon')}
      </tbody>
    </table>
    <p class="ds-bd-note">Types that differ from the table above:</p>
    <ul class="ds-bd-list">${exceptions}</ul>
  </div>`;
}

function stateGrid(size) {
  const types = BUTTON_TYPES.filter(({ sizes }) => sizes.includes(size));
  const head = BUTTON_STATES.map((s) => `<th scope="col">${s}</th>`).join('');
  const rows = types
    .map(({ type }) => {
      const cells = BUTTON_STATES.map((state) => {
        const html = forceStateHTML(buttonHTML({ variant: type, size, disabled: state === 'disabled' }), state);
        return `<td>${tile(type, html)}</td>`;
      }).join('');
      return `<tr><th scope="row"><code>${esc(type)}</code></th>${cells}</tr>`;
    })
    .join('');
  return `<table class="ds-bd-states"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

export function renderStates() {
  return `<div class="ds-bd-statesblock">
    <h3>size=48</h3>
    ${stateGrid('48')}
    <h3>size=36</h3>
    ${stateGrid('36')}
    <p class="ds-bd-note">In the product, hover and focus come from the browser (<code>:hover</code> and <code>:focus-visible</code>). These previews force them with a documentation-only attribute. Disabled uses the native <code>disabled</code> attribute.</p>
  </div>`;
}
