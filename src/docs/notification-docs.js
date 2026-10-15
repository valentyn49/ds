import { notificationHTML } from '../components/notification/notification.js';
import { NOTIFICATION_STATES, NOTIFICATION_SPEC, VARIANT_TOKENS } from '../components/notification/notification.spec.js';
import { esc, anchor, legendItem } from './doc-helpers.js';

const box = (inner, width) => `<div class="ds-bd-nt-box"${width ? ` style="max-width:${width}px"` : ''}>${inner}</div>`;

const LONG = 'Payment failed. Please check details and try again. If issue persists, contact support. Thanks.';

export function renderOverview() {
  return `<div class="ds-bd-nt-stack">
    ${box(notificationHTML({ type: 'home', state: 'warning' }))}
    ${box(notificationHTML({ type: 'default', state: 'warning' }))}
  </div>
  <p class="ds-bd-note">Banners come in two types, <code>home</code> and <code>default</code>, and six states: <code>warning</code>, <code>success</code>, <code>info</code>, <code>alert</code>, <code>gray</code> and <code>white</code>. The icon, the Button and the close control are optional.</p>`;
}

export function renderAnatomy() {
  let html = notificationHTML({ type: 'default', state: 'warning', showButton: true, text: 'Payment failed. Please check details and try again.' });
  html = anchor(html, 'ds-notification ds-notification--default ds-notification--warning', 'left', 1);
  html = anchor(html, 'ds-notification__icon', 'top', 2);
  html = anchor(html, 'ds-notification__text', 'top', 3, '120px');
  html = anchor(html, 'ds-notification__action', 'top', 4);
  html = anchor(html, 'ds-notification__close', 'top', 5);
  return `<div class="ds-bd-anatomy">
    <div class="ds-bd-anatomy__stage ds-bd-nt-anatomy">
      <div class="ds-bd-nt-anatomy__figure">${html}</div>
    </div>
    <ol class="ds-bd-anatomy__legend">
      ${legendItem(1, 'Container', 'Filled with the state color and 12px padding. The <code>default</code> type has a 12px radius and a 1px border in the state color; <code>home</code> has neither.')}
      ${legendItem(2, 'Icon', 'Optional (<code>show icon</code>). A 20px icon in the state color: warning, check, info or report. Gray and white use the info icon.')}
      ${legendItem(3, 'Text', 'The message (<code>Text</code>). Regular, 14/20, gray/900. It wraps onto more lines when it does not fit.')}
      ${legendItem(4, 'Button', 'Optional (<code>show button</code>). The text Button at size 36, before the close control.')}
      ${legendItem(5, 'Close', 'Optional (<code>close</code>). A 20px close icon in gray/700 that dismisses the banner.')}
    </ol>
  </div>`;
}

export function renderVariants() {
  const group = (type) =>
    `<h3>type=${type}</h3><div class="ds-bd-nt-stack">${NOTIFICATION_STATES.map(
      (state) => `<div class="ds-bd-nt-item"><code>type=${type}, state=${state}</code>${box(notificationHTML({ type, state }))}</div>`,
    ).join('')}</div>`;
  return `${group('home')}${group('default')}
  <p class="ds-bd-note">Figma names the status variants <code>state</code>, and the six values are the only states it defines. Their colors and icons are listed in the table below. Figma defines no hover, focus, disabled or dismissed look.</p>
  ${variantTable()}`;
}

function variantTable() {
  const rows = [];
  for (const type of ['home', 'default'])
    for (const state of NOTIFICATION_STATES) {
      const t = VARIANT_TOKENS[type][state];
      rows.push(`<tr><th scope="row">${type}, ${state}</th><td>${t.fill}</td><td>${t.stroke}</td><td>${t.icon}</td></tr>`);
    }
  return `<table class="ds-table ds-bd-nt-table"><thead><tr><th>Variant</th><th>Fill</th><th>Border</th><th>Icon</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

export function renderResponsive() {
  return `<div class="ds-bd-nt-stack">
    <div class="ds-bd-nt-item"><code>820px, as in Figma</code>${box(notificationHTML({ type: 'default', state: 'alert' }), 820)}</div>
    <div class="ds-bd-nt-item"><code>520px</code>${box(notificationHTML({ type: 'default', state: 'alert', showButton: true }), 520)}</div>
    <div class="ds-bd-nt-item"><code>268px, the width used inside the Header drawer</code>${box(notificationHTML({ type: 'default', state: 'warning', text: 'REMINDER: Plus Members get one free credit each month.' }), 268)}</div>
  </div>
  <p class="ds-bd-note">Figma defines a single width of 820px and no desktop, tablet or mobile variants. The banner fills its container and the text wraps, so the height grows. The only other width Figma shows is 268px, in the Header drawer. The 80px and 40px page margins used by the Header and Footer are page-level rules and are not part of the banner.</p>`;
}

export function renderFormatting() {
  const row = (label, value) => `<tr><th scope="row">${label}</th><td>${esc(value)}</td></tr>`;
  return `<div class="ds-bd-nt-stack">
      ${box(notificationHTML({ type: 'default', state: 'info', showButton: true }))}
    </div>
    <table class="ds-table">
      <thead><tr><th></th><th>Figma value</th></tr></thead>
      <tbody>
        ${row('Width', NOTIFICATION_SPEC.width)}
        ${row('Padding', NOTIFICATION_SPEC.padding)}
        ${row('Height', NOTIFICATION_SPEC.height)}
        ${row('Row gap', NOTIFICATION_SPEC.rowGap)}
        ${row('Alignment', NOTIFICATION_SPEC.alignment)}
        ${row('Radius', NOTIFICATION_SPEC.radius)}
        ${row('Border', NOTIFICATION_SPEC.border)}
        ${row('Icon', NOTIFICATION_SPEC.icon)}
        ${row('Text', NOTIFICATION_SPEC.text)}
        ${row('Button', NOTIFICATION_SPEC.button)}
        ${row('Close', NOTIFICATION_SPEC.close)}
      </tbody>
    </table>
    <p class="ds-bd-note">The text is not limited in length: Figma sets it to grow in height. Figma defines no title, no description line and no separate action area; the Button sits in the same row as the text.</p>`;
}

export { LONG };
